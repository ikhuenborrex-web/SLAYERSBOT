"""SMC signal sequence: liquidity sweep -> CHoCH -> return to zone ->
confirmation candle, then a trade plan. No lookahead: at every bar only
confirmed data from the past is used, entries fill on the confirmation
candle's close.

Signal side is the CHoCH direction (the reversal). A LONG signal sweeps
buy-side liquidity (below support), gets a bullish CHoCH, pulls back into a
bullish zone and confirms. SHORT is the mirror image.
"""
import numpy as np

import smc_detect


class Signal:
    __slots__ = (
        "side", "sweep_bar", "sweep_extreme", "pool_level",
        "choch_bar", "choch_level", "zone_bar", "zone_top", "zone_bott",
        "conf_bar", "entry", "sl", "tp", "tp1", "risk", "atr14",
    )

    def __init__(self):
        for k in self.__slots__:
            setattr(self, k, None)


def _h4_to_m15_idx(h4_time, m15_times):
    return int(np.searchsorted(m15_times, h4_time, side="right") - 1)


def detect(params, h4_rows, m15_rows):
    """Expensive part of pipeline: compute all market-structure inputs.
    Depends only on (params dict, candles) and is cacheable across runs
    that keep swing_length / zone_window / lq_window fixed."""
    h4_ohlc = smc_detect.to_ohlc(h4_rows)
    m15_ohlc = smc_detect.to_ohlc(m15_rows)
    n = len(m15_rows)
    swing_length = params["swing_length"]
    lq_window = params["lq_window"]
    zone_window = params["zone_window"]

    h_hl, h_lvl = smc_detect.confirmed_swings(h4_ohlc, swing_length=swing_length)
    h_events = smc_detect.structure_breaks(h4_ohlc, h_hl, h_lvl)

    m15_times = np.array([r["time"] for r in m15_rows])
    h4_times = np.array([r["time"] for r in h4_rows])

    choch = []
    for ev in h_events:
        if ev["kind"] != "CHOCH":
            continue
        k = _h4_to_m15_idx(h4_times[ev["known"]], m15_times)
        if k < 0 or k >= n:
            continue
        choch.append({"m15": k, "dir": ev["dir"], "level": ev["level"], "kind": "CHOCH"})
    choch.sort(key=lambda c: c["m15"])
    choch_by_bar = [[] for _ in range(n)]
    for c in choch:
        choch_by_bar[c["m15"]].append(c)

    m_hl, m_lvl = smc_detect.confirmed_swings(m15_ohlc, swing_length=swing_length)
    swings = smc_detect.swing_events(m_hl, m_lvl)
    res_lvl, sup_lvl = smc_detect.incremental_liquidity(swings, window=lq_window, ohlc=m15_ohlc)
    zones = smc_detect.trailing_zones(m15_ohlc, m_hl, m_lvl, window=zone_window)
    atr = _atr14(m15_ohlc)

    return {
        "n": n,
        "low": m15_ohlc["low"].to_numpy(),
        "high": m15_ohlc["high"].to_numpy(),
        "opn": m15_ohlc["open"].to_numpy(),
        "close": m15_ohlc["close"].to_numpy(),
        "res": res_lvl,
        "sup": sup_lvl,
        "zones": zones,
        "atr": atr,
        "choch_by_bar": choch_by_bar,
        "warmup": max(600, lq_window + swing_length),
    }


def sequence(det, params):
    """Fast signal-scan over the precomputed structure. Returns the list of
    completed Signal objects (with plan only; simulation is separate)."""
    out = {"params": params, "signals": []}
    n = det["n"]
    choch_max_gap = params["choch_max_gap"]
    zone_max_gap = params["zone_max_gap"]
    sl_buffer_atr = params["sl_buffer_atr"]
    min_rr = params["min_rr"]
    zone_pre_gap = params.get("zone_pre_gap", 0)
    confirm_mode = params.get("confirm_mode", "strict")

    low = det["low"]
    high = det["high"]
    opn = det["opn"]
    cclose = det["close"]
    res_lvl = det["res"]
    sup_lvl = det["sup"]
    zones = det["zones"]
    atr = det["atr"]
    choch_by_bar = det["choch_by_bar"]

    sig = None  # active candidate
    for i in range(det["warmup"], n):
        # ---- Scan for a fresh liquidity sweep ----
        if sig is None:
            s = _sweep_at(i, low, high, cclose, res_lvl, sup_lvl)
            if s:
                sig = Signal()
                sig.side = s["side"]
                sig.sweep_bar = i
                sig.sweep_extreme = s["extreme"]
                sig.pool_level = s["level"]
            continue

        # remove if the CHoCH never comes within the gap window
        if i - sig.sweep_bar > choch_max_gap:
            sig = None
            continue

        # ---- Step 2: CHoCH in trade direction confirmed ----
        if sig.choch_bar is None:
            for c in choch_by_bar[i]:
                if c["dir"] == sig.side and c["m15"] > sig.sweep_bar:
                    sig.choch_bar = c["m15"]
                    sig.choch_level = c["level"]
                    break
            if sig.choch_bar is None:
                continue

        # CHoCH must be reasonably fresh when we look for the pullback/entry
        if i - sig.choch_bar > zone_max_gap:
            sig = None
            continue

        # ---- Step 3+4: same bar returns into a zone formed during the CHoCH
        # move AND shows a confirmation candle (rejection wick / engulfing) ----
        z = _zones_for(side=sig.side, choch_bar=sig.choch_bar, i=i, zones=zones,
                       low=low, high=high, pre_gap=zone_pre_gap)
        if not z:
            continue
        if not _is_confirmation(i, sig.side, opn, cclose, low, high,
                                z["top"], z["bottom"], atr, mode=confirm_mode):
            continue

        a14 = atr[i]
        if a14 != a14 or a14 <= 0:
            sig = None
            continue
        entry = cclose[i]
        buf = sl_buffer_atr * a14
        sl = sig.sweep_extreme - buf if sig.side > 0 else sig.sweep_extreme + buf
        risk = abs(entry - sl)
        if risk <= 0:
            sig = None
            continue
        nxt = res_lvl[i] if sig.side > 0 else sup_lvl[i]
        tp_dist = min_rr * risk
        if nxt == nxt:
            d_pool = abs(nxt - entry)
            if (sig.side > 0 and nxt > entry and d_pool > tp_dist) or (
                sig.side < 0 and nxt < entry and d_pool > tp_dist
            ):
                tp_dist = d_pool
        sig.conf_bar = i
        sig.zone_bar = z["formed_bar"]
        sig.zone_top = z["top"]
        sig.zone_bott = z["bottom"]
        sig.entry = entry
        sig.sl = sl
        sig.tp = entry + tp_dist if sig.side > 0 else entry - tp_dist
        sig.tp1 = entry + 1.0 * risk if sig.side > 0 else entry - 1.0 * risk
        sig.risk = risk
        sig.atr14 = a14
        out["signals"].append(sig)
        sig = None
    return out


def build(params, h4_rows, m15_rows):
    """detect + sequence in one call (kept for compatibility)."""
    if len(m15_rows) < 2000 or len(h4_rows) < 400:
        return {"params": params, "signals": []}
    return sequence(detect(params, h4_rows, m15_rows), params)


def _sweep_at(i, low, high, close, res, sup):
    """A pool wick-through with rejection. Returns side/dir info or None."""
    r = res[i]
    if r == r and high[i] > r and close[i] < r:
        return {"side": -1, "extreme": high[i], "level": r}  # bearish (swept resistance)
    s = sup[i]
    if s == s and low[i] < s and close[i] > s:
        return {"side": 1, "extreme": low[i], "level": s}  # bullish (swept support)
    return None


def _zones_for(side, choch_bar, i, zones, low, high, pre_gap=0):
    """Most recent zone with dir == side formed near the CHoCH move
    ([choch_bar - pre_gap, i]) that the current bar has traded into."""
    cands = [z for z in zones[i] if z[2] == side and z[3] >= choch_bar - pre_gap]
    for top, bot, _, fb in reversed(cands):
        if low[i] <= top and high[i] >= bot:
            return {"top": top, "bottom": bot, "formed_bar": fb}
    return None


def _is_confirmation(i, side, opn, close, low, high, zone_top, zone_bot, atr, mode="strict"):
    """Candle that confirms rejection of the zone.
    strict: wick through the zone + close back inside/above (or engulfing).
    lenient: additionally accepts a simple close inside the zone."""
    o = opn[i]
    c = close[i]
    if mode == "lenient":
        if side > 0:
            return bool(
                (low[i] <= zone_bot and c > zone_bot)
                or (c > o and c > close[i - 1] and o <= close[i - 1] and low[i] <= zone_bot)
            )
        else:
            return bool(
                (high[i] >= zone_top and c < zone_top)
                or (c < o and c < close[i - 1] and o >= close[i - 1] and high[i] >= zone_top)
            )
    if side > 0:
        wick = low[i] < min(zone_bot, low[i - 1]) and c > zone_bot  # wick through zone, close back above
        eng = c > o and c > close[i - 1] and o <= close[i - 1] and low[i] <= zone_bot
        return bool(wick or eng)
    else:
        wick = high[i] > max(zone_top, high[i - 1]) and c < zone_top
        eng = c < o and c < close[i - 1] and o >= close[i - 1] and high[i] >= zone_top
        return bool(wick or eng)


def _atr14(ohlc, p=14):
    h = ohlc["high"].to_numpy()
    l = ohlc["low"].to_numpy()
    c = ohlc["close"].to_numpy()
    n = len(c)
    tr = np.zeros(n)
    tr[0] = h[0] - l[0]
    for i in range(1, n):
        tr[i] = max(h[i] - l[i], abs(h[i] - c[i - 1]), abs(l[i] - c[i - 1]))
    atr = np.full(n, np.nan)
    if n > p:
        atr[p - 1] = tr[:p].mean()
        for i in range(p, n):
            atr[i] = (atr[i - 1] * (p - 1) + tr[i]) / p
    return atr