"""ATR(14) — average true range on the working timeframe.

Pure numeric implementation. No narrative logic.
"""
from math import isfinite


def true_ranges(highs, lows, closes):
    """Wilder ATR's true range sequence given aligned series."""
    trs = []
    for i in range(len(closes)):
        if i == 0:
            trs.append(highs[i] - lows[i])
        else:
            tr = max(
                highs[i] - lows[i],
                abs(highs[i] - closes[i - 1]),
                abs(lows[i] - closes[i - 1]),
            )
            trs.append(tr)
    return trs


def atr(highs, lows, closes, period=14):
    """Wilder-smoothed ATR over the given series. Returns [] if too short."""
    if len(closes) < period + 1:
        return []
    trs = true_ranges(highs, lows, closes)
    out = []
    prev = sum(trs[:period]) / period
    out.append(prev)
    for tr in trs[period:]:
        prev = (prev * (period - 1) + tr) / period
        out.append(prev)
    return out


def day_atr(rows):
    """ATR(14) as of the last candle of a day's rows (M1/M5 both fine)."""
    if len(rows) < 15:
        return None
    closes = [r["close"] for r in rows]
    series = atr([r["high"] for r in rows], [r["low"] for r in rows], closes, 14)
    if not series:
        return None
    val = series[-1]
    return val if isfinite(val) else None
