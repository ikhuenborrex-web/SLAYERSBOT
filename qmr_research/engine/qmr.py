"""QMR detection — 1:1 port of server.js detectQMR/validateQMRCriteria and friends.

Functions operate on OHLC numpy arrays over an index window [start, end).
The "current" candle is c[end-1] (the scan candle). No look-ahead: windows
always end at the scan index.
"""
import numpy as np

from .indicators import (
    BREAKOUT_ATR, IMPULSE, MIN_FVG, QMR_MIN,
    calc_atr, check_premium_discount, detect_fvg, detect_ob,
    detect_structure, find_swings, head_swept_liquidity,
)


# --------------------------------------------------------------------------
# Criteria scoring
# --------------------------------------------------------------------------
def validate_qmr_criteria(o, h, l, c, start, end, type_, head, qm_swing, atr, sH, sL):
    """Returns dict {valid, score, factors}. head = (price, idx) of the swing
    that swept liquidity; qm_swing = (price, idx) of the opposing swing = QM."""
    factors = []
    score = 0
    if head_swept_liquidity(h, l, start, end, head[0], head[1], type_):
        score += 1
        factors.append("Liq Sweep")
    first3 = range(max(start, head[1] + 1), min(end, head[1] + 4))
    bear_d = type_ == "BEARISH"
    disp = False
    for k in first3:
        body = abs(c[k] - o[k])
        rng = h[k] - l[k]
        if (c[k] < o[k] if bear_d else c[k] > o[k]) and (body > atr * 0.85 or (rng > 0 and body / rng > 0.65)):
            disp = True
            break
    if disp:
        score += 1
        factors.append("Displacement")
    cp = c[end - 1]
    if (cp <= qm_swing[0] * 1.004) if type_ == "BEARISH" else (cp >= qm_swing[0] * 0.996):
        score += 1
        factors.append("MSS")
    eng_list = sL if type_ == "BEARISH" else sH
    if sum(1 for s in eng_list if abs(s[0] - qm_swing[0]) < atr * 3 and s[1] < head[1]) >= 2:
        score += 1
        factors.append("Eng. Liq")
    return {"valid": score >= QMR_MIN, "score": score, "factors": factors}


def _qm_core(o, h, l, c, start, end, type_, head, qm_swing, atr, sH, sL):
    """Shared post-swing checks for detectQMR. Returns the qmr result dict or None."""
    cp = c[end - 1]
    if type_ == "BEARISH":
        dist_ok = (abs(cp - qm_swing[0]) < atr * 0.5 and
                   cp <= qm_swing[0] * (1 + 0.0008) and cp >= qm_swing[0] * (1 - 0.0005))
    else:
        dist_ok = (abs(cp - qm_swing[0]) < atr * 0.5 and
                   cp >= qm_swing[0] * (1 - 0.0008) and cp <= qm_swing[0] * (1 + 0.0005))
    if not dist_ok:
        return None
    if not check_premium_discount(h, l, c, start, end, type_, qm_swing[0]):
        return None
    crit = validate_qmr_criteria(o, h, l, c, start, end, type_, head, qm_swing, atr, sH, sL)
    if not crit["valid"]:
        return None
    bull, bear = detect_ob(o, h, l, c, start, end)
    fb, fg = detect_fvg(o, h, l, c, start, end)
    ob_list = bull if type_ == "BULLISH" else bear
    fvg_list = bull if type_ == "BULLISH" else bear
    ob_n = next((z for z in ob_list if abs((z[0] + z[1]) / 2 - qm_swing[0]) < atr * 2.0), None)
    fv_n = next((z for z in fvg_list if abs((z[0] + z[1]) / 2 - qm_swing[0]) < atr * 2.0), None)
    if not ob_n and not fv_n:
        return None
    crit["factors"].append("Reclaimed OB" if ob_n else "FVG at QM")
    if type_ == "BEARISH":
        true_high = head[0]
        for k in range(head[1], end):
            if h[k] > true_high:
                true_high = h[k]
        return {"type": "BEARISH", "qmLevel": qm_swing[0], "head": head[0],
                "cp": cp, "atr": atr, "criteria": crit, "retestSL": true_high + atr * 0.25}
    true_low = head[0]
    for k in range(head[1], end):
        if l[k] < true_low:
            true_low = l[k]
    return {"type": "BULLISH", "qmLevel": qm_swing[0], "head": head[0],
            "cp": cp, "atr": atr, "criteria": crit, "retestSL": true_low - atr * 0.25}


def detect_qmr(o, h, l, c, start, end):
    """Port of detectQMR: at most one result per direction (newest first)."""
    if end - start < 35:
        return []
    sH, sL = find_swings(h, l, start, end)
    if len(sH) < 3 or len(sL) < 3:
        return []
    cp = c[end - 1]
    atr = calc_atr(o, h, l, c, start, end, 14)
    results = []
    # BEARISH: head = higher swing high that swept, QM = lower swing between
    for hi in range(len(sH) - 1, 0, -1):
        head = sH[hi]
        hh1 = sH[hi - 1]
        if head[0] <= hh1[0] or head[1] < end - 30:
            continue
        hl_c = [s for s in sL if s[1] > hh1[1] and s[1] < head[1]]
        if not hl_c:
            continue
        hl = hl_c[-1]
        bc = [k for k in range(head[1] + 1, min(end, head[1] + 13)) if c[k] < hl[0]]
        if not bc or hl[0] - c[bc[0]] < atr * BREAKOUT_ATR:
            continue
        res = _qm_core(o, h, l, c, start, end, "BEARISH", head, hl, atr, sH, sL)
        if res:
            results.append(res)
            break
    # BULLISH: head = lower swing low that swept, QM = higher swing between
    for li in range(len(sL) - 1, 0, -1):
        head = sL[li]
        ll1 = sL[li - 1]
        if head[0] >= ll1[0] or head[1] < end - 30:
            continue
        lh_c = [s for s in sH if s[1] > ll1[1] and s[1] < head[1]]
        if not lh_c:
            continue
        lh = lh_c[-1]
        bc = [k for k in range(head[1] + 1, min(end, head[1] + 13)) if c[k] > lh[0]]
        if not bc or c[bc[0]] - lh[0] < atr * BREAKOUT_ATR:
            continue
        res = _qm_core(o, h, l, c, start, end, "BULLISH", head, lh, atr, sH, sL)
        if res:
            results.append(res)
            break
    return results


# --------------------------------------------------------------------------
# TP / entry helpers
# --------------------------------------------------------------------------
def find_draw_on_liquidity(h, l, start, end, type_, entry_price, atr):
    tol = 0.001
    min_dist = atr * 3
    eq_h, eq_l = [], []
    for i in range(start, end - 3):
        for j in range(i + 3, end):
            if abs(h[j] - h[i]) / h[i] < tol:
                eq_h.append(h[i])
                break
        for j in range(i + 3, end):
            if abs(l[j] - l[i]) / l[i] < tol:
                eq_l.append(l[i])
                break
    if type_ == "BULLISH":
        t = sorted(x for x in eq_h if x > entry_price + min_dist)
        return {"price": t[0], "label": "Buy Side Liquidity"} if t else None
    t = sorted((x for x in eq_l if x < entry_price - min_dist), reverse=True)
    return {"price": t[0], "label": "Sell Side Liquidity"} if t else None


def find_structural_tp2(h, l, start, end, type_, entry_price, sl_dist, tp1_price, cap_r=2.5):
    if sl_dist <= 0:
        return None
    min_t = entry_price + sl_dist * cap_r if type_ == "BULLISH" else entry_price - sl_dist * cap_r
    max_t = entry_price + sl_dist * (cap_r + 0.5) if type_ == "BULLISH" else entry_price - sl_dist * (cap_r + 0.5)
    tol = 0.001
    eq_h, eq_l, sw_h, sw_l = [], [], [], []
    for i in range(start, end - 3):
        for j in range(i + 3, end):
            if abs(h[j] - h[i]) / h[i] < tol:
                eq_h.append(h[i])
                break
        for j in range(i + 3, end):
            if abs(l[j] - l[i]) / l[i] < tol:
                eq_l.append(l[i])
                break
    for i in range(start + 3, end - 3):
        if (h[i] > h[i - 1] and h[i] > h[i - 2] and
                h[i] > h[i + 1] and h[i] > h[i + 2]):
            sw_h.append(h[i])
        if (l[i] < l[i - 1] and l[i] < l[i - 2] and
                l[i] < l[i + 1] and l[i] < l[i + 2]):
            sw_l.append(l[i])
    if type_ == "BULLISH":
        cands = sorted(x for x in list(eq_h) + list(sw_h) if x > tp1_price and min_t <= x <= max_t)
        if cands:
            return {"price": cands[0], "rr": f"{(cands[0] - entry_price) / sl_dist:.1f}"}
        return {"price": entry_price + sl_dist * cap_r, "rr": f"{cap_r:g}"}
    cands = sorted((x for x in list(eq_l) + list(sw_l) if x < tp1_price and max_t <= x <= min_t), reverse=True)
    if cands:
        return {"price": cands[0], "rr": f"{(entry_price - cands[0]) / sl_dist:.1f}"}
    return {"price": entry_price - sl_dist * cap_r, "rr": f"{cap_r:g}"}


def refine_1h_entry(o, h, l, c, start, end, type_, zone_level, zone_sl):
    if end - start < 25:
        return None
    is_bull = type_ == "BULLISH"
    hi = max(zone_level, zone_sl)
    lo = min(zone_level, zone_sl)
    bull, bear = detect_ob(o, h, l, c, start, end)
    ob_list = bull if is_bull else bear
    for ob in ob_list:
        mid = (ob[0] + ob[1]) / 2
        if lo <= mid <= hi:
            return {"price": mid, "source": "1H Order Block"}
    fb, fg = detect_fvg(o, h, l, c, start, end)
    fvg_list = bull if is_bull else bear
    for f in fvg_list:
        mid = (f[0] + f[1]) / 2
        if lo <= mid <= hi:
            return {"price": mid, "source": "1H FVG"}
    return None


# --------------------------------------------------------------------------
# HTF context (weekly bias, daily trend/POI, fib confluence)
# --------------------------------------------------------------------------
def get_wbias(bars):
    if not bars or len(bars) < 2:
        return "NEUTRAL"
    lw = bars[-2]
    return "BULLISH" if lw["close"] > lw["open"] else ("BEARISH" if lw["close"] < lw["open"] else "NEUTRAL")


def get_wlvls(bars):
    if not bars or len(bars) < 2:
        return None
    lw = bars[-2]
    return {"high": lw["high"], "low": lw["low"]}


def check_daily_poi(o, h, l, c, start, end, type_, level):
    if end - start < 10:
        return None
    bull, bear = detect_ob(o, h, l, c, start, end)
    fb, fg = detect_fvg(o, h, l, c, start, end)
    prox = 0.007

    def in_z(z):
        return level >= z[1] * (1 - prox * 0.5) and level <= z[0] * (1 + prox * 0.5)

    if type_ == "BULLISH":
        if any(in_z(z) for z in bull):
            return "Daily OB"
        if any(in_z(z) for z in fg):
            return "Daily FVG"
    else:
        if any(in_z(z) for z in bear):
            return "Daily OB"
        if any(in_z(z) for z in fg):
            return "Daily FVG"
    return None


def get_daily_trend(h, l, start, end):
    if end - start < 12:
        return "RANGING"
    return detect_structure(h, l, start, end)


def calc_fib_levels(high, low):
    if not high or not low or high <= low:
        return None
    r = high - low
    return {"p236": high - r * 0.236, "p382": high - r * 0.382, "p50": high - r * 0.5,
            "p618": high - r * 0.618, "p786": high - r * 0.786, "p886": high - r * 0.886}


def get_fib_depth(price, high, low, type_):
    if not high or not low or high <= low:
        return {"zone": "UNKNOWN", "level": None, "score": 0}
    r = high - low
    pct = (high - price) / r if type_ == "BULLISH" else (price - low) / r
    if pct >= 0.886:
        return {"zone": "EXTREME", "level": "88.6%", "score": 4}
    if pct >= 0.786:
        return {"zone": "DEEP", "level": "78.6%", "score": 3}
    if pct >= 0.702:
        return {"zone": "DEEP_PLUS", "level": "70.2%", "score": 2.5}
    if pct >= 0.618:
        return {"zone": "STRONG", "level": "61.8%", "score": 2}
    if pct >= 0.5:
        return {"zone": "MODERATE", "level": "50.0%", "score": 1}
    return {"zone": "WEAK", "level": None, "score": 0}


def calc_fib_confluence(price, type_, weekly_lvls, daily_lvls):
    total_score = 0
    zones = []
    labels = []
    for lvls, label in ((weekly_lvls, "Weekly"), (daily_lvls, "Daily")):
        if not lvls or not lvls.get("high") or not lvls.get("low") or lvls["high"] <= lvls["low"]:
            continue
        fd = get_fib_depth(price, lvls["high"], lvls["low"], type_)
        if fd["score"] > 0:
            total_score += fd["score"]
            zones.append(fd["zone"])
            labels.append(f"{label} {fd['level']}")
        levels = calc_fib_levels(lvls["high"], lvls["low"])
        if not levels:
            continue
        tolerance = (lvls["high"] - lvls["low"]) * 0.01
        exacts = []
        for key, p in levels.items():
            if type_ == "BULLISH":
                pct = (lvls["high"] - price) / (lvls["high"] - lvls["low"])
            else:
                pct = (price - lvls["low"]) / (lvls["high"] - lvls["low"])
            lvl_pct = {"p236": 23.6, "p382": 38.2, "p50": 50, "p618": 61.8, "p786": 78.6, "p886": 88.6}[key]
            if abs(price - p) <= tolerance:
                exacts.append(lvl_pct)
        if len(exacts) > 1:
            total_score += len(exacts)
            labels.append(f"{label} confluence: {'/'.join(f'{x:g}' for x in exacts)}%")
    return {"score": total_score, "zones": ",".join(zones) if zones else "NONE", "labels": labels}


def compute_r(trade, exit_price):
    risk = abs(trade["qmLevel"] - trade["origSL"])
    if not risk or risk != risk:
        return 0.0
    direction = 1 if trade["type"] == "BULLISH" else -1
    return round((exit_price - trade["qmLevel"]) * direction / risk, 2)
