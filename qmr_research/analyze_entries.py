"""Phase 3 — exploratory entry/SL/filter analysis on the QMR baseline.

No engine changes. Re-runs the identical baseline in-memory and works from the
full trade dicts (which carry origSL / qmLevel / signalIdx) that the CSV omits.

Deliverables (numbers only):
  1. Entry-in-zone distance: actual fill (qmLevel) vs refined 1H OB/FVG entry.
  2. Tighter-entry replay: fill at the refined level (wait-for-retrace limit),
     same SL + same absolute TP1/TP2 -> R improvement / trade-count tradeoff.
  3. SL sizing: per-pair SL distance vs ATR at entry; hypothetical SL = k*ATR
     replays for k in {1.0, 1.5, 2.0, 2.5}.
  4. Extra confluence layer A/B (exploratory only): 21 EMA filter and a CRT-style
     reaction-zone filter applied to the same 150 baseline signals.

Trade-management replay is a per-trade port of engine/backtest._manage_trades and
is validated 1:1 against the engine output for every baseline trade.
"""
import os
import sys
from datetime import timedelta

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config import OUTPUT_DIR  # noqa: E402
from run_backtest import load_csv, summarize, QMR_PAIRS  # noqa: E402
from engine.backtest import (  # noqa: E402
    BE_GRACE_1H, TP1_EXPIRY_DAYS, TP1_MIN_AGE_MIN, QMRBacktest, WINDOW,
)
from engine.indicators import calc_atr  # noqa: E402
from engine.qmr import refine_1h_entry  # noqa: E402

CFG = {"require_4_4": True, "compute_4h_alignment": False}
MAX_WAIT_CANDLES = 5 * 24
K_FACTORS = [1.0, 1.5, 2.0, 2.5]


def replay(times, o, h, l, c, start_idx, is_bull, ref, sl_abs, tp1_abs, tp2_abs, pair, signalIdx):
    """Per-trade port of _manage_trades. Baseline convention: fill at close of the
    signal candle (start_idx), management begins at start_idx + 1."""
    n = len(times)
    open_time = times[start_idx]
    risk = abs(ref - sl_abs)
    out = {"pair": pair, "signalIdx": signalIdx, "type": "BULLISH" if is_bull else "BEARISH",
           "openTime": open_time, "entry": ref, "origSL": sl_abs, "tp1": tp1_abs, "tp2": tp2_abs,
           "outcome": "OPEN", "closeReason": "OPEN", "rMultiple": 0.0}
    if risk <= 0:
        return out
    d = 1 if is_bull else -1
    state = {"tp1Fired": False, "slFired": False, "beFired": False, "trailActive": False,
             "bestPrice": None, "trailDist": None, "tp1Time": None, "beTime": None, "sl": sl_abs}

    def r_at(price):
        return round((price - ref) * d / risk, 2)

    for j in range(start_idx + 1, n):
        hi, lo, price = h[j], l[j], c[j]
        t = times[j]
        duration = (t - open_time).total_seconds() / 60
        if state["tp1Fired"] and not state["slFired"] and (hi >= tp2_abs if is_bull else lo <= tp2_abs):
            return {**out, "outcome": "WIN", "closeReason": "TP2", "rMultiple": r_at(tp2_abs),
                    "closeTime": t, "durationMin": duration}
        if not state["tp1Fired"] and duration >= TP1_MIN_AGE_MIN and (hi >= tp1_abs if is_bull else lo <= tp1_abs):
            state["tp1Fired"] = True
            state["tp1Time"] = t
            buffer = risk * 0.3
            state["sl"] = ref - buffer if is_bull else ref + buffer
            state["beFired"] = True
            state["beTime"] = t
            if (lo <= state["sl"] if is_bull else hi >= state["sl"]):
                return {**out, "outcome": "WIN", "closeReason": "TP1_buffer", "rMultiple": r_at(tp1_abs),
                        "closeTime": t, "durationMin": duration}
        if state["tp1Fired"] and not state["slFired"]:
            if not state["trailActive"]:
                trigger = tp1_abs + risk if is_bull else tp1_abs - risk
                if price >= trigger if is_bull else price <= trigger:
                    state["trailActive"] = True
                    state["trailDist"] = risk
                    state["bestPrice"] = price
            else:
                if is_bull and price > state["bestPrice"]:
                    state["bestPrice"] = price
                    ns = price - state["trailDist"]
                    if ns > state["sl"]:
                        state["sl"] = ns
                elif not is_bull and price < state["bestPrice"]:
                    state["bestPrice"] = price
                    ns = price + state["trailDist"]
                    if ns < state["sl"]:
                        state["sl"] = ns
        if state["tp1Fired"] and not state["slFired"]:
            tp1_age = state["tp1Time"] or open_time
            if t - tp1_age > timedelta(days=TP1_EXPIRY_DAYS):
                return {**out, "outcome": "WIN", "closeReason": "TP1_expiry", "rMultiple": r_at(tp1_abs),
                        "closeTime": t, "durationMin": duration}
        if not state["slFired"]:
            sl_hit = (price <= state["sl"] if is_bull else price >= state["sl"]) if state["beFired"] else (
                lo <= state["sl"] if is_bull else hi >= state["sl"])
            if sl_hit:
                if not state["tp1Fired"] and state["beFired"] and state["beTime"] and \
                        (t - state["beTime"]).total_seconds() < BE_GRACE_1H * 3600:
                    continue
                state["slFired"] = True
                if state["tp1Fired"]:
                    return {**out, "outcome": "WIN", "closeReason": "be_close", "rMultiple": r_at(tp1_abs),
                            "closeTime": t, "durationMin": duration}
                if state["beFired"]:
                    return {**out, "outcome": "BE", "closeReason": "be_sl", "rMultiple": 0.0,
                            "closeTime": t, "durationMin": duration}
                return {**out, "outcome": "SL", "closeReason": "sl", "rMultiple": -1.0,
                        "closeTime": t, "durationMin": duration}
    return {**out, "outcome": "OPEN", "closeReason": "OPEN", "rMultiple": r_at(c[-1]),
            "closeTime": times[-1], "durationMin": (times[-1] - open_time).total_seconds() / 60}


def ema_series(c, period=21):
    e = np.empty(len(c))
    e[0] = c[0]
    k = 2 / (period + 1)
    for i in range(1, len(c)):
        e[i] = e[i - 1] + k * (c[i] - e[i - 1])
    return e


def level_tapped(h, l, i, qm, type_, look=20, tol=0.0015):
    lo = max(0, i - look)
    if type_ == "BULLISH":
        return any(l[j] <= qm * (1 + tol) for j in range(lo, i))
    return any(h[j] >= qm * (1 - tol) for j in range(lo, i))


def wait_fill(h, l, i, refined, is_bull, max_look=MAX_WAIT_CANDLES):
    if refined is None:
        return None
    for j in range(i + 1, i + 1 + max_look):
        if j >= len(h):
            return None
        if (l[j] <= refined) if is_bull else (h[j] >= refined):
            return j
    return None


def fmt(s):
    return f"{s['trades']}tr WR{s['win_rate']:.0%} avgR{s['avg_r']:+.2f} net{s['net_r']:+.1f}R maxDD{s['max_dd']:.1f}R"


def main():
    all_trades = []
    pair_data = {}
    for pair in QMR_PAIRS:
        path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", f"{pair}_H1.csv")
        if not os.path.exists(path):
            continue
        times, o, h, l, c = load_csv(path)
        bt = QMRBacktest(pair, times, o, h, l, c, CFG)
        bt.run()
        all_trades += bt.trades_log
        pair_data[pair] = (times, o, h, l, c)
    trades = sorted(all_trades, key=lambda t: t["openTime"])
    base = summarize(trades, "ALL")

    lines = []
    add = lines.append

    add("=" * 66)
    add("QMR PHASE 3 — ENTRY / SL / FILTER EXPLORATION (analysis only, no engine change)")
    add("=" * 66)
    add("")
    add(f"Baseline re-run: {len(trades)} signals | {fmt(base)}")
    add("")

    # ---- validation: replay must reproduce the engine's own outcomes exactly
    add("VALIDATION (replay vs engine trades_log)")
    mism = 0
    for tr in trades:
        r = replay(pair_data[tr["pair"]][0], *(pair_data[tr["pair"]][1:5]),
                   tr["signalIdx"], tr["type"] == "BULLISH",
                   tr["qmLevel"], tr["origSL"], tr["tp1"], tr["tp2"], tr["pair"], tr["signalIdx"])
        if (r["outcome"], r["closeReason"], r["rMultiple"]) != (tr["outcome"], tr.get("closeReason"), tr["rMultiple"]):
            mism += 1
    add(f"  mismatches: {mism} / {len(trades)} (0 = replay is a faithful port)")
    add("")

    # =====================================================================
    # 1. ENTRY-IN-ZONE DISTANCE
    # =====================================================================
    add("1. ENTRY-IN-ZONE DISTANCE (actual fill vs refined 1H OB/FVG mid)")
    refined_rows = []
    for tr in trades:
        times, o, h, l, c = pair_data[tr["pair"]]
        start = tr["signalIdx"] - (WINDOW - 1)
        rf = refine_1h_entry(o, h, l, c, start, tr["signalIdx"] + 1,
                             tr["type"], tr["qmLevel"], tr["origSL"])
        risk = abs(tr["qmLevel"] - tr["origSL"])
        if rf is None:
            refined_rows.append((tr, None, None, None, None))
            continue
        delta = (tr["qmLevel"] - rf["price"]) if tr["type"] == "BULLISH" else (rf["price"] - tr["qmLevel"])
        refined_rows.append((tr, rf["price"], rf["source"], delta, delta / risk))
    n_rf = sum(1 for r in refined_rows if r[1] is not None)
    savings = [r[4] for r in refined_rows if r[1] is not None]
    add(f"  trades with usable refined OB/FVG in zone: {n_rf} / {len(trades)}")
    if savings:
        savings = np.array(savings)
        add(f"  risk saved by filling at refined level (vs qmLevel): "
            f"median {np.median(savings):.0%} | mean {savings.mean():.0%} | "
            f"max {savings.max():.0%} | min {savings.min():.0%}")
        src = {}
        for r in refined_rows:
            if r[1] is not None:
                src[r[2]] = src.get(r[2], 0) + 1
        add(f"  source mix: {', '.join(f'{k} {v}' for k, v in sorted(src.items()))}")
    add("")

    # =====================================================================
    # 2. TIGHTER-ENTRY REPLAY
    # =====================================================================
    add("2. TIGHTER ENTRY — fill at refined level, same SL + same absolute TP1/TP2")
    add(f"   (limit at refined level, filled only if price retraces within {MAX_WAIT_CANDLES}h; unfilled signals are dropped)")
    wait_out = []
    immediate_out = []
    not_filled = 0
    for (tr, rf_price, rf_src, delta, frac) in refined_rows:
        times, o, h, l, c = pair_data[tr["pair"]]
        is_b = tr["type"] == "BULLISH"
        ref = rf_price if rf_price is not None else tr["qmLevel"]
        if rf_price is None or abs(rf_price - tr["qmLevel"]) / max(abs(tr["qmLevel"]), 1e-12) < 1e-9:
            fidx = tr["signalIdx"]
        else:
            fidx = wait_fill(h, l, tr["signalIdx"], rf_price, is_b)
        if fidx is None:
            not_filled += 1
            continue
        wait_out.append(replay(times, o, h, l, c, fidx, is_b, ref, tr["origSL"],
                               tr["tp1"], tr["tp2"], tr["pair"], tr["signalIdx"]))
        immediate_out.append(replay(times, o, h, l, c, tr["signalIdx"], is_b, ref, tr["origSL"],
                                    tr["tp1"], tr["tp2"], tr["pair"], tr["signalIdx"]))
    sw = summarize(wait_out, "ALL")
    add(f"  wait-for-fill : {fmt(sw)}  (unfilled/dropped: {not_filled})")
    # flip analysis vs baseline (same signalIdx)
    base_by_idx = {tr["signalIdx"]: tr for tr in trades}
    flips = sum(1 for r in wait_out if base_by_idx[r["signalIdx"]]["outcome"] != r["outcome"])
    r_deltas = [r["rMultiple"] - base_by_idx[r["signalIdx"]]["rMultiple"] for r in wait_out]
    r_deltas = np.array(r_deltas)
    add(f"  outcome flips vs baseline: {flips} / {len(wait_out)}")
    add(f"  R change per filled trade: median {np.median(r_deltas):+.2f} | mean {r_deltas.mean():+.2f} "
        f"| net {r_deltas.sum():+.1f}R")
    add("")
    add(f"   (reference: optimistic 'immediate refined fill' upper bound: {fmt(summarize(immediate_out, 'ALL'))})")
    add("")

    # =====================================================================
    # 3. SL SIZING
    # =====================================================================
    add("3. SL SIZING — current SL distance vs ATR at entry, per pair")
    add("   pair       trades   SL/ATR median   SL/ATR mean    range")
    per_pair = {}
    atrs = {}
    for tr in trades:
        times, o, h, l, c = pair_data[tr["pair"]]
        start = tr["signalIdx"] - (WINDOW - 1)
        atr = calc_atr(o, h, l, c, start, tr["signalIdx"] + 1, 14)
        atrs[tr["signalIdx"]] = atr
        ratio = abs(tr["qmLevel"] - tr["origSL"]) / atr if atr > 0 else 0.0
        per_pair.setdefault(tr["pair"], []).append(ratio)
    for pair in QMR_PAIRS:
        if pair not in per_pair:
            continue
        r = np.array(per_pair[pair])
        add(f"   {pair:9s} {len(r):6d}   {np.median(r):8.2f}x   {r.mean():8.2f}x   "
            f"[{r.min():.2f}, {r.max():.2f}]")
    add("")
    add("   hypothetical SL = qmLevel +- k*ATR (same entry @ qmLevel, same absolute TP1/TP2)")
    add(f"   {'k':>5s}  {'trades':>6s}  {'WR':>5s}  {'avgR':>6s}  {'netR':>7s}  {'maxDD':>6s}")
    for k in K_FACTORS:
        outs = []
        for tr in trades:
            times, o, h, l, c = pair_data[tr["pair"]]
            atr = atrs[tr["signalIdx"]]
            is_b = tr["type"] == "BULLISH"
            sl = tr["qmLevel"] - k * atr if is_b else tr["qmLevel"] + k * atr
            outs.append(replay(times, o, h, l, c, tr["signalIdx"], is_b, tr["qmLevel"], sl,
                               tr["tp1"], tr["tp2"], tr["pair"], tr["signalIdx"]))
        s = summarize(outs, "ALL")
        add(f"   {k:5.1f}  {s['trades']:6d}  {s['win_rate']:>4.0%}  {s['avg_r']:>+6.2f}  "
            f"{s['net_r']:>+7.1f}  {s['max_dd']:>6.1f}")
    add("")

    # =====================================================================
    # 4. EXTRA CONFLUENCE LAYERS (exploratory A/B on the same 150 signals)
    # =====================================================================
    add("4. EXTRA CONFLUENCE LAYER — 21 EMA and CRT-style reaction-zone filters")
    add("   (applied on top of the baseline 150 signals; no look-ahead, signal-time only)")
    ema = {}
    for pair, data in pair_data.items():
        times, o, h, l, c = data
        ema[pair] = ema_series(c, 21)
    f_trend, f_slope, f_react, f_comb = [], [], [], []
    for tr in trades:
        times, o, h, l, c = pair_data[tr["pair"]]
        i = tr["signalIdx"]
        e = ema[tr["pair"]][i]
        is_b = tr["type"] == "BULLISH"
        trend_ok = (c[i] > e) if is_b else (c[i] < e)
        e_prev = ema[tr["pair"]][max(0, i - 10)]
        slope_ok = (e > e_prev) if is_b else (e < e_prev)
        react_ok = level_tapped(h, l, i, tr["qmLevel"], tr["type"])
        if trend_ok:
            f_trend.append(tr)
        if slope_ok:
            f_slope.append(tr)
        if react_ok:
            f_react.append(tr)
        if trend_ok and react_ok:
            f_comb.append(tr)
    for name, subset in (("EMA21 trend (close above/below EMA)", f_trend),
                         ("EMA21 slope (EMA rising/falling 10 bars)", f_slope),
                         ("CRT-style: QM level tapped in prior 20 bars", f_react),
                         ("EMA21 trend AND level tapped", f_comb)):
        s = summarize(subset, "ALL")
        add(f"  {name:38s}: {fmt(s)}")
    add("")

    report = "\n".join(lines)
    print(report)
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    with open(os.path.join(OUTPUT_DIR, "phase3_report.txt"), "w") as f:
        f.write(report + "\n")
    print(f"\nReport written to {os.path.join(OUTPUT_DIR, 'phase3_report.txt')}")


if __name__ == "__main__":
    main()
