"""Walk-forward QMR backtest engine — faithful port of server.js scan + checkQMRTrades.

Design:
- Evaluates the full QMR scan at every closed 1H candle (live full scans run every
  60 min on 1H candles; scanning each closed candle matches that cadence).
- Detection window = last 100 candles ending at the scan candle (no look-ahead).
- Trade management (checkQMRTrades) runs per closed candle after entry, TP-before-SL,
  wick-based SL pre-BE / close-based post-BE, 2h TP1 age gate, BE buffer, trailing,
  5-day TP1 expiry.
- HTF context (weekly bias, daily lvls/trend/POI, fib confluence) is computed from the
  same H1 series aggregated on-the-fly as of each scan time — no future data.
"""
import bisect
import csv
import os
from datetime import datetime, timedelta

import numpy as np

from .indicators import (
    PAIR_CURRENCIES, build_daily, build_weekly, calc_adr, group_4h_td,
    in_pair_session, is_weekend, session_label,
)
from .qmr import (
    calc_fib_confluence, compute_r, detect_qmr,
    find_draw_on_liquidity, find_structural_tp2, get_wbias,
    get_wlvls, refine_1h_entry,
)


# Live constants (server.js)
MIN_RR = 1.5
STRICT_PAIRS = ("GBPUSD", "EURAUD", "GBPCAD")
WINDOW = 100            # outputsize used by live scan
TP1_MIN_AGE_MIN = 120   # 2h minimum trade age before TP1
BE_GRACE_1H = 1         # grace hours after BE before stale-wick SL is honored
TP1_EXPIRY_DAYS = 5     # auto-close 5 days after TP1 if TP2 never reached
NEWS_WINDOW_MIN = 30    # live isNewsBlocked win (server.js line 456)


class QMRBacktest:
    def __init__(self, pair, times, o, h, l, c, config=None):
        self.pair = pair
        self.times = times
        self.o, self.h, self.l, self.c = o, h, l, c
        self.n = len(times)
        cfg = config or {}
        self.require_4_4 = bool(cfg.get("require_4_4", True))  # all 1H signals need 4/4
        self.use_4h = bool(cfg.get("use_4h", False))
        self.use_news_filter = bool(cfg.get("use_news_filter", False))
        # Before-only is the live operating default (matches updated isNewsBlocked);
        # symmetric (+-30 min before AND after) is the legacy mode via news_before_only=False.
        self.news_before_only = bool(cfg.get("news_before_only", True))
        # Experiment knob: override SL sizing with entry +- k*ATR. None = live rule.
        self.sl_atr_mult = cfg.get("sl_atr_mult")
        # Experiment knobs (all default to live behavior):
        self.tp2_r_mult = float(cfg.get("tp2_r_mult", 2.5))          # structural TP2 cap in R
        self.no_bear_vs_bull_week = bool(cfg.get("no_bear_vs_bull_week", False))
        self.with_bias_only = bool(cfg.get("with_bias_only", False))
        self.exclude_sessions = set(cfg.get("exclude_sessions", ()))

        # News filter: load historical calendar once (pair-level set of event
        # datetimes touching any of this pair's currencies). Mirrors live
        # isNewsBlocked: any event within +-30 min of scan time blocks.
        self.news_events = None
        news_csv = cfg.get("news_csv")
        if self.use_news_filter and news_csv and os.path.exists(news_csv):
            currencies = set(PAIR_CURRENCIES.get(pair, ()))
            self.news_events = []
            with open(news_csv) as f:
                for row in csv.DictReader(f):
                    if (row.get("country") or "").upper() in currencies:
                        try:
                            dt = datetime.fromisoformat(
                                row["date"].replace("Z", "+00:00")).replace(tzinfo=None)
                        except (ValueError, KeyError):
                            continue
                        self.news_events.append(dt)
            self.news_events.sort()

        # Precompute 4H bar boundaries on the live (TwelveData) grid so the 4H
        # scan can build its candle series as-of any scan index without O(n) cost.
        self._h4_bars = None
        self._h4_ends = []
        self._h4_hist = None
        if self.use_4h:
            self._h4_bars = group_4h_td(times)
            self._h4_ends = [b[1] for b in self._h4_bars]
            # Completed 4H bars (excluding the still-forming last bar) as
            # numpy arrays — rebuilt only once instead of per scan index.
            hist_o, hist_h, hist_l, hist_c, hist_t = [], [], [], [], []
            for s, e in self._h4_bars[:-1]:
                hist_t.append(times[e - 1])
                hist_o.append(self.o[s])
                hist_h.append(float(np.max(self.h[s:e])))
                hist_l.append(float(np.min(self.l[s:e])))
                hist_c.append(self.c[e - 1])
            self._h4_hist = (np.array(hist_t), np.array(hist_o), np.array(hist_h),
                             np.array(hist_l), np.array(hist_c))

        # Precompute day/week aggregates as-of-any-index helpers.
        self._day_ohlc = build_daily(o, h, l, c, times, 0, self.n)
        self._week_ohlc = build_weekly(o, h, l, c, times, 0, self.n)
        self._day_end = [d["dt"] for d in self._day_ohlc]
        self._week_end = [w["dt"] for w in self._week_ohlc]

        # Live in-memory state (fresh per run)
        self.active_trades = []
        self.seen_levels = []          # (time, type, level) 48h dedupe
        self.recent_fires = {}         # pair-type -> last fire time (4h cooldown)
        self.qmr4h_cache = {}          # pair -> {type, time} (alignment only)
        self.trades_log = []           # final per-trade rows
        self.suppressed_log = []       # filtered-out signals (debug)

    # ------------------------------------------------------------------
    # HTF context as of scan index
    # ------------------------------------------------------------------
    def _daily_asof(self, i):
        """Returns daily OHLC list (dicts) with current partial day as last bar."""
        t = self.times[i]
        k = bisect.bisect_right(self._day_end, t)
        out = list(self._day_ohlc[:k])
        # partial current day
        start = 0
        for m in range(self.n):
            if self.times[m].date() == self.times[i].date():
                start = m
                break
        hi, lo = -np.inf, np.inf
        oo = self.o[start]
        for j in range(start, i + 1):
            if self.h[j] > hi:
                hi = self.h[j]
            if self.l[j] < lo:
                lo = self.l[j]
        if i >= start:
            out.append({"open": oo, "high": hi, "low": lo, "close": self.c[i], "dt": self.times[i]})
        return out

    def _week_asof(self, i):
        t = self.times[i]
        k = bisect.bisect_right(self._week_end, t)
        out = list(self._week_ohlc[:k])
        start = 0
        iso = self.times[i].isocalendar()[:2]
        for m in range(self.n):
            if self.times[m].isocalendar()[:2] == iso:
                start = m
                break
        hi, lo = -np.inf, np.inf
        oo = self.o[start]
        for j in range(start, i + 1):
            if self.h[j] > hi:
                hi = self.h[j]
            if self.l[j] < lo:
                lo = self.l[j]
        if i >= start:
            out.append({"open": oo, "high": hi, "low": lo, "close": self.c[i], "dt": self.times[i]})
        return out

    # ------------------------------------------------------------------
    # Live filters
    # ------------------------------------------------------------------
    def _level_already_seen(self, type_, qm_level, now):
        for tm, typ, lvl in self.seen_levels:
            if typ != type_:
                continue
            if now - tm > timedelta(hours=48):
                continue
            if abs(lvl - qm_level) / qm_level < 0.005:
                return True
        return False

    def _cooldown_ok(self, type_, now):
        key = f"{self.pair}-{type_}"
        last = self.recent_fires.get(key)
        if last and now - last < timedelta(hours=4):
            return False
        return True

    def _news_blocked(self, t):
        """News filter port of server.js isNewsBlocked — any calendar event
        touching a currency of this pair blocks the signal.

        Default (news_before_only False) is the exact live behavior: events
        within +-30 min block (before AND after the release). With
        news_before_only True, only *upcoming* events (in [now, now+30min])
        block, so an entry right after a release is allowed — protects against
        entering before major events (stop-gap risk) without forfeiting
        post-release entries."""
        if not self.news_events:
            return False
        if self.news_before_only:
            lo = bisect.bisect_left(self.news_events, t)
            hi = bisect.bisect_right(self.news_events, t + timedelta(minutes=NEWS_WINDOW_MIN))
        else:
            lo = bisect.bisect_left(self.news_events, t - timedelta(minutes=NEWS_WINDOW_MIN))
            hi = bisect.bisect_right(self.news_events, t + timedelta(minutes=NEWS_WINDOW_MIN))
        return hi > lo

    def _h4_asof(self, i):
        """Build the 4H OHLC arrays as-of 1H index i on the live (TwelveData)
        grid. Returns (times,o,h,l,c,start,end) over the last WINDOW 4H bars,
        or None if fewer than 35 bars are available (detectQMR needs >=35)."""
        bars = self._h4_bars
        if not bars:
            return None
        # bars are (start_idx, end_idx) in the H1 array; find the bar containing i
        # (end exclusive, so the count of bars with end <= i is the containing bar)
        b = bisect.bisect_right(self._h4_ends, i)
        if b >= len(bars):
            return None
        ht, ho, hh, hl, hc = self._h4_hist
        lo = max(0, b - WINDOW)
        o = np.concatenate([ho[lo:b], [self.o[bars[b][0]]]])
        h = np.concatenate([hh[lo:b], [float(np.max(self.h[bars[b][0]:i + 1]))]])
        l = np.concatenate([hl[lo:b], [float(np.min(self.l[bars[b][0]:i + 1]))]])
        c = np.concatenate([hc[lo:b], [self.c[i]]])
        t = np.concatenate([ht[lo:b], [self.times[i]]])
        n = len(o)
        if n < 35:
            return None
        return (t, o, h, l, c, 0, n)

    # ------------------------------------------------------------------
    # Signal evaluation (port of the live scan body for one candidate)
    # ------------------------------------------------------------------
    def _evaluate_signal(self, i, qmr, adr, debug_reason=None, tf="1H",
                         o=None, h=None, l=None, c=None, wstart=None, wend=None):
        """Runs the full live filter chain for a detected QMR candidate.
        Returns a trade dict if it fires, else None. Mutates cooldown/seen.

        tf: "1H" or "4H". For 4H, the zone math (drawOnLiquidity/TP2/refine)
        uses the passed 4H arrays/window; HTF context, news, sessions and the
        4/4 gates still run identically. A+D + 1H-no-4H-alignment gates apply
        only to 1H signals (mirrors live `if(tf==='1h')`)."""
        t = self.times[i]
        if o is None:
            o, h, l, c = self.o, self.h, self.l, self.c
            wstart = i - (WINDOW - 1)
            wend = i + 1
        start = wstart
        end = wend

        qmr["drawOnLiquidity"] = find_draw_on_liquidity(
            h, l, start, end, qmr["type"], qmr["qmLevel"], qmr["atr"])

        sl_q = qmr["retestSL"] if qmr["retestSL"] is not None else (
            qmr["head"] - qmr["atr"] * 0.1 if qmr["type"] == "BULLISH" else qmr["head"] + qmr["atr"] * 0.1)
        if self.sl_atr_mult:
            sl_q = (qmr["qmLevel"] - qmr["atr"] * self.sl_atr_mult if qmr["type"] == "BULLISH"
                    else qmr["qmLevel"] + qmr["atr"] * self.sl_atr_mult)
        slD_q = abs(qmr["qmLevel"] - sl_q)

        raw_tp1 = qmr["drawOnLiquidity"]["price"] if qmr["drawOnLiquidity"] else (
            qmr["qmLevel"] + slD_q * 3 if qmr["type"] == "BULLISH" else qmr["qmLevel"] - slD_q * 3)
        tp1_q = raw_tp1
        if adr > 0:
            if qmr["type"] == "BULLISH":
                tp1_q = min(raw_tp1, qmr["qmLevel"] + adr * 0.5)
            else:
                tp1_q = max(raw_tp1, qmr["qmLevel"] - adr * 0.5)

        # RR gate: 1H refines the entry first (live), 4H uses the zone level.
        refined = None
        if tf == "1H":
            refined = refine_1h_entry(o, h, l, c, start, end,
                                      qmr["type"], qmr["qmLevel"], sl_q)
        entry_for_rr = refined["price"] if refined else qmr["qmLevel"]
        sl_dist_rr = abs(entry_for_rr - sl_q)
        rr1_q = abs(tp1_q - entry_for_rr) / sl_dist_rr if sl_dist_rr > 0 else 0
        if rr1_q < MIN_RR:
            if debug_reason is not None:
                debug_reason.append(f"RR {rr1_q:.2f}<{MIN_RR}")
            return None

        qmr["structuralTP2"] = find_structural_tp2(
            h, l, start, end, qmr["type"], qmr["qmLevel"], slD_q, tp1_q,
            self.tp2_r_mult) if slD_q > 0 else None
        if qmr["structuralTP2"]:
            max_tp2 = qmr["qmLevel"] + slD_q * self.tp2_r_mult if qmr["type"] == "BULLISH" \
                else qmr["qmLevel"] - slD_q * self.tp2_r_mult
            over = qmr["structuralTP2"]["price"] > max_tp2 if qmr["type"] == "BULLISH" \
                else qmr["structuralTP2"]["price"] < max_tp2
            if over:
                qmr["structuralTP2"]["price"] = max_tp2
                qmr["structuralTP2"]["rr"] = f"{self.tp2_r_mult:g}"

        if is_weekend(t) and self.pair != "BTCUSD":
            if debug_reason is not None:
                debug_reason.append("weekend")
            return None
        # D rule (drop London/NY overlap) is 1H-only in live (`if(tf==='1h')`)
        if tf == "1H" and self.exclude_sessions and session_label(t) in self.exclude_sessions:
            if debug_reason is not None:
                debug_reason.append("excluded session")
            return None
        # 1h outside killzone: live only logs a warning, never blocks (non-gating)
        # 4h outside session: the whole scan is already gated by in_pair_session

        if self._level_already_seen(qmr["type"], qmr["qmLevel"], t):
            if debug_reason is not None:
                debug_reason.append("level seen 48h")
            return None
        # News filter: mirrors live isNewsBlocked — any event touching the pair's
        # currencies within +-30 min of the scan candle blocks (both TFs).
        if self.use_news_filter and self._news_blocked(t):
            if debug_reason is not None:
                debug_reason.append("news")
            return None

        weekly = self._week_asof(i)
        daily = self._daily_asof(i)
        htf_bias = get_wbias(weekly) if len(weekly) >= 2 else "NEUTRAL"
        # A rule (no sell into bullish week) is 1H-only in live (`if(tf==='1h')`)
        if tf == "1H" and self.no_bear_vs_bull_week and qmr["type"] == "BEARISH" and htf_bias == "BULLISH":
            if debug_reason is not None:
                debug_reason.append("bear vs bullish week")
            return None
        if self.with_bias_only and htf_bias != "NEUTRAL" and qmr["type"] != htf_bias:
            if debug_reason is not None:
                debug_reason.append("not with weekly bias")
            return None
        w_lvls = get_wlvls(weekly) if len(weekly) >= 2 else None
        d_lvls = get_wlvls(daily) if len(daily) >= 2 else None

        fib = calc_fib_confluence(qmr["qmLevel"], qmr["type"], w_lvls, d_lvls)
        if fib["score"] > 0:
            for lbl in fib["labels"]:
                qmr["criteria"]["factors"].append(f"{lbl} {'Discount' if qmr['type']=='BULLISH' else 'Premium'}")
            if fib["score"] >= 2:
                qmr["criteria"]["score"] += min(int(fib["score"]), 3)
            if fib["score"] >= 4:
                qmr["criteria"]["factors"].append("STRONG FIB CONFLUENCE")

        counter_trend = htf_bias != "NEUTRAL" and qmr["type"] != htf_bias
        if counter_trend:
            if self.require_4_4 and qmr["criteria"]["score"] < 4:
                if debug_reason is not None:
                    debug_reason.append("counter-trend <4/4")
                return None
            qmr["counterTrend"] = True

        # strict pairs require 4/4 (both TFs)
        if self.require_4_4 and self.pair in STRICT_PAIRS and qmr["criteria"]["score"] < 4:
            if debug_reason is not None:
                debug_reason.append("strict <4/4")
            return None

        # 1H without 4H alignment requires 4/4. Cache is populated by firing
        # 4H signals when use_4h is enabled (mirrors live qmr4HCache).
        if tf == "1H":
            has_4h = False
            if self.use_4h:
                c4 = self.qmr4h_cache.get(self.pair)
                has_4h = bool(c4 and c4["type"] == qmr["type"] and t - c4["time"] < timedelta(hours=24))
            if self.require_4_4 and not has_4h and qmr["criteria"]["score"] < 4:
                if debug_reason is not None:
                    debug_reason.append("1H no-4H-align <4/4")
                return None

        # resolveConflicts: skipped (research does not model active higher-TF trades)

        if not self._cooldown_ok(qmr["type"], t):
            if debug_reason is not None:
                debug_reason.append("4h cooldown")
            return None
        self.recent_fires[f"{self.pair}-{qmr['type']}"] = t
        self.seen_levels.append((t, qmr["type"], qmr["qmLevel"]))

        # Live sets the 4H alignment cache right after cooldown/seen and BEFORE
        # the ADR gap filter (line 1579 vs 1586) — even an ADR-gap-rejected 4H
        # signal still aligns 1H signals for the next 24h.
        if tf == "4H":
            self.qmr4h_cache[self.pair] = {"type": qmr["type"], "time": t}

        # ADR gap filter (after cooldown/seen in live — consumes the signal)
        tp1_dist = abs(tp1_q - qmr["qmLevel"])
        if adr > 0 and tp1_dist > adr * 1.2:
            if debug_reason is not None:
                debug_reason.append("ADR gap")
            return None

        tp2_price = qmr["structuralTP2"]["price"] if qmr["structuralTP2"] else (
            qmr["qmLevel"] + slD_q * self.tp2_r_mult if qmr["type"] == "BULLISH" else qmr["qmLevel"] - slD_q * self.tp2_r_mult)

        return {
            "pair": self.pair,
            "type": qmr["type"],
            "tf": tf,
            "qmLevel": qmr["qmLevel"],
            "entry": qmr["qmLevel"],
            "sl": sl_q,
            "origSL": sl_q,
            "tp1": tp1_q,
            "tp2": tp2_price,
            "beLevel": qmr["qmLevel"] + slD_q * 1.3 if qmr["type"] == "BULLISH" else qmr["qmLevel"] - slD_q * 1.3,
            "isElite": qmr["criteria"]["score"] >= 4,
            "score": qmr["criteria"]["score"],
            "factors": list(qmr["criteria"]["factors"]),
            "rr": round(rr1_q, 2),
            "htfBias": htf_bias,
            "counterTrend": counter_trend,
            "fibZones": fib["zones"],
            "signalIdx": i,
            "session": session_label(t),
            "openTime": t,
            "beFired": False, "tp1Fired": False, "slFired": False,
            "trailActive": False, "bestPrice": None, "trailDist": None,
            "tp1Time": None, "beTime": None,
        }

    # ------------------------------------------------------------------
    # Trade management — port of checkQMRTrades
    # ------------------------------------------------------------------
    def _manage_trades(self, i):
        hi, lo, price = self.h[i], self.l[i], self.c[i]
        t = self.times[i]
        for tr in self.active_trades[:]:
            is_b = tr["type"] == "BULLISH"
            duration = (t - tr["openTime"]).total_seconds() / 60

            # 1. TP2 / full win (TP before SL on the same candle)
            if tr["tp1Fired"] and not tr["slFired"] and (hi >= tr["tp2"] if is_b else lo <= tr["tp2"]):
                tr["slFired"] = True
                tr["closeTime"] = t
                tr["outcome"] = "WIN"
                tr["rMultiple"] = compute_r(tr, tr["tp2"])
                tr["durationMin"] = (t - tr["openTime"]).total_seconds() / 60
                tr["closeReason"] = "TP2"
                self.active_trades.remove(tr)
                self.trades_log.append(tr)
                continue

            # 2. TP1 — minimum 2h trade age, then SL to entry +- 0.3R buffer
            if not tr["tp1Fired"] and duration >= TP1_MIN_AGE_MIN and (hi >= tr["tp1"] if is_b else lo <= tr["tp1"]):
                tr["tp1Fired"] = True
                tr["tp1Time"] = t
                sl_dist = abs(tr["qmLevel"] - tr["origSL"])
                buffer = sl_dist * 0.3
                tr["sl"] = tr["qmLevel"] - buffer if is_b else tr["qmLevel"] + buffer
                tr["beFired"] = True
                tr["beTime"] = t
                # same-candle buffer hit → close remainder immediately
                if lo <= tr["sl"] if is_b else hi >= tr["sl"]:
                    tr["slFired"] = True
                    tr["closeTime"] = t
                    tr["outcome"] = "WIN"
                    tr["rMultiple"] = compute_r(tr, tr["tp1"])
                    tr["durationMin"] = duration
                    tr["closeReason"] = "TP1_buffer"
                    self.active_trades.remove(tr)
                    self.trades_log.append(tr)
                    continue

            # 3. Trailing stop after TP1
            if tr["tp1Fired"] and not tr["slFired"]:
                sl_dist = abs(tr["qmLevel"] - tr["origSL"])
                if not tr["trailActive"]:
                    trigger = tr["tp1"] + sl_dist if is_b else tr["tp1"] - sl_dist
                    if price >= trigger if is_b else price <= trigger:
                        tr["trailActive"] = True
                        tr["trailDist"] = sl_dist
                        tr["bestPrice"] = price
                else:
                    if is_b:
                        if price > tr["bestPrice"]:
                            tr["bestPrice"] = price
                            new_sl = price - tr["trailDist"]
                            if new_sl > tr["sl"]:
                                tr["sl"] = new_sl
                    else:
                        if price < tr["bestPrice"]:
                            tr["bestPrice"] = price
                            new_sl = price + tr["trailDist"]
                            if new_sl < tr["sl"]:
                                tr["sl"] = new_sl

            # 4. TP1 expiry — auto-close 5 days after TP1 if TP2 never reached
            if tr["tp1Fired"] and not tr["slFired"]:
                tp1_age = tr["tp1Time"] or tr["openTime"]
                if t - tp1_age > timedelta(days=TP1_EXPIRY_DAYS):
                    tr["slFired"] = True
                    tr["closeTime"] = t
                    tr["outcome"] = "WIN"
                    tr["rMultiple"] = compute_r(tr, tr["tp1"])
                    tr["durationMin"] = (t - tr["openTime"]).total_seconds() / 60
                    tr["closeReason"] = "TP1_expiry"
                    self.active_trades.remove(tr)
                    self.trades_log.append(tr)
                    continue

            # 5. SL / BE close — checked last so TP1 registers first
            sl_hit = (price <= tr["sl"] if is_b else price >= tr["sl"]) if tr["beFired"] else (
                lo <= tr["sl"] if is_b else hi >= tr["sl"])
            if not tr["slFired"] and sl_hit:
                # BE grace: ignore stale wick within 1h of BE if TP1 not yet fired
                if not tr["tp1Fired"] and tr["beFired"] and tr["beTime"] and (t - tr["beTime"]).total_seconds() < BE_GRACE_1H * 3600:
                    continue
                tr["slFired"] = True
                tr["closeTime"] = t
                if tr["tp1Fired"]:
                    tr["outcome"] = "WIN"
                    tr["rMultiple"] = compute_r(tr, tr["tp1"])
                    tr["closeReason"] = "be_close"
                elif tr["beFired"]:
                    tr["outcome"] = "BE"
                    tr["rMultiple"] = 0.0
                    tr["closeReason"] = "be_sl"
                else:
                    tr["outcome"] = "SL"
                    tr["rMultiple"] = -1.0
                    tr["closeReason"] = "sl"
                tr["durationMin"] = (t - tr["openTime"]).total_seconds() / 60
                self.active_trades.remove(tr)
                self.trades_log.append(tr)

    # ------------------------------------------------------------------
    # Main loop
    # ------------------------------------------------------------------
    def run(self):
        for i in range(WINDOW - 1, self.n):
            t = self.times[i]
            # manage existing trades first (live: checkQMRTrades before scan)
            self._manage_trades(i)

            if not in_pair_session(self.pair, t):
                continue
            if self.n < 35:
                continue
            start = i - (WINDOW - 1)

            # ---- 1H scan (live scans 1h first, then 4h) ----
            qmrs = detect_qmr(self.o, self.h, self.l, self.c, start, i + 1)
            if qmrs:
                adr = calc_adr(self.times, self.h, self.l, start, i + 1, 14)
                for qmr in qmrs:
                    reasons = []
                    trade = self._evaluate_signal(i, qmr, adr, reasons, "1H")
                    if trade is None:
                        self.suppressed_log.append({
                            "pair": self.pair, "time": t.isoformat(), "type": qmr["type"],
                            "qmLevel": qmr["qmLevel"], "score": qmr["criteria"]["score"],
                            "reason": ";".join(reasons) if reasons else "filtered",
                        })
                        continue
                    self.active_trades.append(trade)

            # ---- 4H scan (mirrors live loop `for(const tf of QMR_TFS)`) ----
            if self.use_4h:
                h4 = self._h4_asof(i)
                if h4:
                    ht, o4, h4a, l4, c4, wstart, wend = h4
                    qmrs4 = detect_qmr(o4, h4a, l4, c4, wstart, wend)
                    if qmrs4:
                        adr4 = calc_adr(ht, h4a, l4, wstart, wend, 14)
                        for qmr in qmrs4:
                            reasons = []
                            trade = self._evaluate_signal(
                                i, qmr, adr4, reasons, "4H",
                                o4, h4a, l4, c4, wstart, wend)
                            if trade is None:
                                self.suppressed_log.append({
                                    "pair": self.pair, "time": t.isoformat(), "type": qmr["type"],
                                    "qmLevel": qmr["qmLevel"], "score": qmr["criteria"]["score"],
                                    "reason": ";".join(reasons) if reasons else "filtered",
                                })
                                continue
                            self.active_trades.append(trade)

        # close any still-open trades at end-of-data (marked OPEN, excluded from stats)
        for tr in self.active_trades[:]:
            last = self.n - 1
            tr["closeTime"] = self.times[last]
            tr["closeReason"] = "OPEN"
            tr["outcome"] = "OPEN"
            tr["rMultiple"] = compute_r(tr, self.c[last])
            tr["durationMin"] = (self.times[last] - tr["openTime"]).total_seconds() / 60
            self.trades_log.append(tr)
        self.active_trades.clear()
