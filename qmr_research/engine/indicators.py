"""Low-level indicator helpers — 1:1 ports of the live server.js functions.

All functions operate on numpy arrays of OHLC over an index window
[start, end). Candles are UTC 1H bars. Windows never look ahead of the
"scan" candle, so nothing here is a look-ahead bias.
"""
import numpy as np

BREAKOUT_ATR = 0.3
IMPULSE = 0.0015
MIN_FVG = 0.0003
QMR_MIN = 3
MIN_RR = 1.5
STRICT_PAIRS = ("GBPUSD", "EURAUD", "GBPCAD")

# PAIR_SESSIONS (UTC) — pairs scanned only inside these hours
PAIR_SESSIONS = {
    "EURUSD": (7, 22), "XAUUSD": (7, 22), "BTCUSD": (0, 24),
    "GBPUSD": (7, 22), "EURCAD": (7, 22), "EURAUD": (0, 22),
    "GBPCAD": (7, 22),
}
# PAIR_CURRENCIES — economic-calendar currencies that news-block each pair
# (1:1 port of server.js PAIR_CURRENCIES; used by the news filter)
PAIR_CURRENCIES = {
    "EURUSD": ("EUR", "USD"), "XAUUSD": ("XAU", "USD"), "BTCUSD": ("BTC",),
    "GBPUSD": ("GBP", "USD"), "EURCAD": ("EUR", "CAD"), "EURAUD": ("EUR", "AUD"),
    "GBPCAD": ("GBP", "CAD"),
}
PAIR_KILLZONES = {
    "EURUSD": ((7, 10), (13, 16)), "GBPUSD": ((7, 10), (13, 16)),
    "EURCAD": ((7, 10), (13, 16)), "XAUUSD": ((7, 10), (13, 16)),
    "EURAUD": ((0, 4), (7, 10), (13, 16)), "GBPCAD": ((7, 10), (13, 16)),
    "BTCUSD": None,
}


def calc_atr(o, h, l, c, start, end, p=14):
    if end - start < 2:
        return 0.0
    trs = []
    for i in range(start + 1, end):
        trs.append(max(h[i] - l[i], abs(h[i] - c[i - 1]), abs(l[i] - c[i - 1])))
    if not trs:
        return 0.0
    sl = trs[-p:]
    return float(np.mean(sl))


def calc_adr(times, h, l, start, end, days=14):
    """Groups candles by UTC date, averages last `days` day-ranges."""
    ranges = []
    dh = -np.inf
    dl = np.inf
    cd = None
    for i in range(start, end):
        day = times[i].date()
        if day != cd:
            if cd is not None and dh > dl:
                ranges.append(dh - dl)
            dh = h[i]
            dl = l[i]
            cd = day
        else:
            if h[i] > dh:
                dh = h[i]
            if l[i] < dl:
                dl = l[i]
    if cd is not None and dh > dl:
        ranges.append(dh - dl)
    sl = ranges[-days:]
    return float(np.mean(sl)) if sl else 0.0


def get_today_range(times, h, l, end):
    today = times[end - 1].date()
    hi, lo = -np.inf, np.inf
    i = end - 1
    while i >= 0 and times[i].date() == today:
        if h[i] > hi:
            hi = h[i]
        if l[i] < lo:
            lo = l[i]
        i -= 1
    return (hi - lo) if hi > lo else 0.0


def find_swings(h, l, start, end):
    sH, sL = [], []
    for i in range(start + 3, end - 3):
        if (h[i] > h[i - 1] and h[i] > h[i - 2] and h[i] > h[i - 3] and
                h[i] > h[i + 1] and h[i] > h[i + 2] and h[i] > h[i + 3]):
            sH.append((h[i], i))
        if (l[i] < l[i - 1] and l[i] < l[i - 2] and l[i] < l[i - 3] and
                l[i] < l[i + 1] and l[i] < l[i + 2] and l[i] < l[i + 3]):
            sL.append((l[i], i))
    return sH, sL


def detect_ob(o, h, l, c, start, end):
    bull, bear = [], []
    for i in range(start, end - 1):
        b_o, b_c = o[i], c[i]
        n_o, n_c = o[i + 1], c[i + 1]
        if abs(n_c - n_o) / n_o < IMPULSE:
            continue
        if n_c > n_o and b_c < b_o:
            bull.append((max(b_o, b_c), min(b_o, b_c)))
        elif n_c < n_o and b_c > b_o:
            bear.append((max(b_o, b_c), min(b_o, b_c)))
    return bull[-4:][::-1], bear[-4:][::-1]


def detect_fvg(o, h, l, c, start, end):
    bull, bear = [], []
    for i in range(start, end - 2):
        a_h, a_l = h[i], l[i]
        z_h, z_l = h[i + 2], l[i + 2]
        if z_l > a_h and (z_l - a_h) / a_h > MIN_FVG:
            bull.append((z_l, a_h))
        if z_h < a_l and (a_l - z_h) / a_l > MIN_FVG:
            bear.append((a_l, z_h))
    return bull[-5:][::-1], bear[-5:][::-1]


def detect_structure(h, l, start, end):
    if end - start < 12:
        return "RANGING"
    sH, sL = [], []
    for i in range(start + 2, end - 2):
        if (h[i] > h[i - 1] and h[i] > h[i - 2] and
                h[i] > h[i + 1] and h[i] > h[i + 2]):
            sH.append(h[i])
        if (l[i] < l[i - 1] and l[i] < l[i - 2] and
                l[i] < l[i + 1] and l[i] < l[i + 2]):
            sL.append(l[i])
    if len(sH) < 2 or len(sL) < 2:
        return "RANGING"
    rH, rL = sH[-2:], sL[-2:]
    if rH[1] > rH[0] and rL[1] > rL[0]:
        return "BULLISH"
    if rH[1] < rH[0] and rL[1] < rL[0]:
        return "BEARISH"
    return "RANGING"


def check_premium_discount(h, l, c, start, end, type_, qm_level):
    rc_h = h[max(start, end - 100):end]
    rc_l = l[max(start, end - 100):end]
    hi = float(np.max(rc_h)) if rc_h.size else -np.inf
    lo = float(np.min(rc_l)) if rc_l.size else np.inf
    return qm_level < (hi + lo) / 2 if type_ == "BULLISH" else qm_level > (hi + lo) / 2


def head_swept_liquidity(h, l, start, end, head_p, head_i, type_):
    """Port of server.js headSweptLiquidity. head = (price, idx) of the swing
    that swept liquidity; checks prior highs/lows (within 50 bars) for an equal
    level that the head swept through."""
    tol = 0.001
    ref_start = max(start, head_i - 50)
    eq = False
    if type_ == "BEARISH":
        for i in range(ref_start, head_i - 1):
            for j in range(i + 2, head_i):
                if abs(h[j] - h[i]) / h[i] < tol and head_p >= h[i]:
                    eq = True
                    break
            if eq:
                break
        return eq or any(head_p > h[i] * 1.0003 for i in range(ref_start, head_i))
    else:
        for i in range(ref_start, head_i - 1):
            for j in range(i + 2, head_i):
                if abs(l[j] - l[i]) / l[i] < tol and head_p <= l[i]:
                    eq = True
                    break
            if eq:
                break
        return eq or any(head_p < l[i] * 0.9997 for i in range(ref_start, head_i))


def build_4h(o, h, l, c, times, start, end):
    out = []
    i = start
    while i < end:
        hi, lo = -np.inf, np.inf
        n = min(i + 4, end)
        if n - i < 2:
            break
        o4 = o[i]
        for k in range(i, n):
            if h[k] > hi:
                hi = h[k]
            if l[k] < lo:
                lo = l[k]
        out.append({"open": o4, "high": hi, "low": lo, "close": c[n - 1], "dt": times[n - 1]})
        i = n
    return out


def group_4h_td(times):
    """Map H1 candle indices to 4H bars on the live TwelveData grid.

    TwelveData 4h bars are start-labeled at hour==3 mod 4 (03/07/11/15/19/23
    UTC): the bar labelled T aggregates the H1 candles [T, T+3h). Returns a
    list of (start_idx, end_idx) H1-index ranges (end exclusive). The final
    range is the still-forming bar and its end is len(times)."""
    out = []
    start = None
    for i, t in enumerate(times):
        if t.hour % 4 == 3:
            if start is not None:
                out.append((start, i))
            start = i
    if start is not None:
        out.append((start, len(times)))
    return out


def build_daily(o, h, l, c, times, start, end):
    """Group 1H candles into daily (UTC) OHLC bars. Returns list of dicts
    with .dt set to the LAST candle's timestamp in the day (matches the live
    TwelveData daily series where the current partial day is the last bar)."""
    out = []
    i = start
    while i < end:
        day = times[i].date()
        hi, lo = -np.inf, np.inf
        oo = o[i]
        j = i
        while j < end and times[j].date() == day:
            if h[j] > hi:
                hi = h[j]
            if l[j] < lo:
                lo = l[j]
            j += 1
        if j - i < 1:
            break
        out.append({"open": oo, "high": hi, "low": lo, "close": c[j - 1], "dt": times[j - 1]})
        i = j
    return out


def build_weekly(o, h, l, c, times, start, end):
    """Group 1H candles into ISO-weekly (UTC) OHLC bars. Last bar is the
    current partial week (matches live weekly fetch where getWBias uses
    wc[wc.length-2] = last completed week)."""
    out = []
    i = start
    while i < end:
        iso = times[i].isocalendar()[:2]
        hi, lo = -np.inf, np.inf
        oo = o[i]
        j = i
        while j < end and times[j].isocalendar()[:2] == iso:
            if h[j] > hi:
                hi = h[j]
            if l[j] < lo:
                lo = l[j]
            j += 1
        if j - i < 1:
            break
        out.append({"open": oo, "high": hi, "low": lo, "close": c[j - 1], "dt": times[j - 1]})
        i = j
    return out


def is_weekend(t):
    return t.weekday() == 5 or (t.weekday() == 6 and t.hour < 22)


def in_pair_session(inst_id, t):
    s = PAIR_SESSIONS.get(inst_id)
    if not s:
        return True
    s_h, e_h = s
    if e_h == 24:
        return True
    return s_h <= t.hour < e_h


def in_killzone(inst_id, t):
    kz = PAIR_KILLZONES.get(inst_id)
    if not kz:
        return True
    return any(w0 <= t.hour < w1 for w0, w1 in kz)


def session_label(t):
    h = t.hour
    lon = 7 <= h < 16
    ny = 13 <= h < 22
    if lon and ny:
        return "London/NY Overlap"
    if lon:
        return "London"
    if ny:
        return "New York"
    if h < 7:
        return "Asian"
    return "CLOSED"
