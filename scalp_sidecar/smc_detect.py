"""SMC detection primitives, built for no-lookahead backtesting.

We wrap smartmoneyconcepts where it is safe and lag/handle anything that
would leak future information:

  * swing_highs_lows uses a centered window (swing_length//2 bars either
    side), so a swing at bar j is only knowable at bar j + confirm. We shift
    both the HighLow marker and its Level by `confirm` bars.
  * Liquidity pools are maintained incrementally from CONFIRMED swings over a
    trailing window as of the current bar.
  * Order blocks / FVGs are tracked as a per-bar list of zones formed
    strictly in the past.
"""
import numpy as np
import pandas as pd

import smartmoneyconcepts.smc as smc


def to_ohlc(rows):
    return pd.DataFrame(
        {
            "open": [r["open"] for r in rows],
            "high": [r["high"] for r in rows],
            "low": [r["low"] for r in rows],
            "close": [r["close"] for r in rows],
            "volume": [r["volume"] for r in rows],
        }
    )


def confirmed_swings(ohlc, swing_length=5):
    """Return (hl, lvl) numpy arrays; a swing at position j is only visible
    from position j+confirm (no future info at decision time).

    hl:   nan where no swing, else +1 swing high / -1 swing low
    lvl:  swing price (nan where no swing)
    """
    swl = smc.swing_highs_lows(ohlc, swing_length=swing_length)
    confirm = max(swing_length // 2, 1)
    hl = swl["HighLow"].shift(confirm).to_numpy(dtype=float)
    lvl = swl["Level"].shift(confirm).to_numpy(dtype=float)
    return hl, lvl


def swing_events(hl, lvl):
    """Sorted list of (bar, sign, level) for every CONFIRMED swing,
    sign taken from HighLow (+1 sale/ -1 sell)."""
    out = []
    for i in range(len(hl)):
        v = hl[i]
        if v != v or v == 0:
            continue
        out.append((i, 1 if v > 0 else -1, float(lvl[i])))
    return out


def structure_breaks(ohlc, hl, lvl, close_break=True):
    """Return dict of event lists from smartmoneyconcepts' bos_choch.

    Event fields (all in DataFrame index space / H4 bars):
        bar     - detection bar
        known   - bar from which the break is actually observable
        kind    - 'BOS' | 'CHOCH'
        dir     - +1 bullish, -1 bearish
        level   - broken/structure level
    """
    swl = pd.DataFrame({"HighLow": hl, "Level": lvl})
    res = smc.bos_choch(ohlc, swl, close_break=close_break)
    events = []
    n = len(ohlc)
    for i in range(n):
        kind = None
        b = res["BOS"].iloc[i]
        c = res["CHOCH"].iloc[i]
        d = 0
        if not np.isnan(b):
            kind, d = "BOS", int(b)
        elif not np.isnan(c):
            kind, d = "CHOCH", int(c)
        else:
            continue
        lv = res["Level"].iloc[i]
        br = res["BrokenIndex"].iloc[i]
        known = int(br) if not np.isnan(br) else i + 2
        events.append(
            {
                "bar": i,
                "known": known,
                "kind": kind,
                "dir": d,
                "level": float(lv) if not np.isnan(lv) else 0.0,
            }
        )
    return events


# ---------------------------------------------------------------------------
# Liquidity pools (incremental, trailing window, no lookahead)
# ---------------------------------------------------------------------------
def incremental_liquidity(swings, window=200, n=None, ohlc=None):
    """Return (res[], sup[]) arrays of size len(ohlc) (or n) where, as of
    bar i:

      res[i] = level of the most recent confirmed swing high within the
               trailing `window` bars (resistance / sell-side liquidity)
      sup[i] = level of the most recent confirmed swing low within the
               trailing `window` bars (support / buy-side liquidity)
    """
    highs = sorted([(b, lv) for b, s, lv in swings if s > 0])
    lows = sorted([(b, lv) for b, s, lv in swings if s < 0])
    if n is None and ohlc is not None:
        n = len(ohlc)
    if n is None:
        n = (swings[-1][0] + 1) if swings else 0

    res = np.full(n, np.nan)
    sup = np.full(n, np.nan)

    hi_ptr = 0
    for i in range(n):
        cur = None
        while hi_ptr < len(highs) and highs[hi_ptr][0] <= i:
            cur = highs[hi_ptr][1]
            hi_ptr += 1
        if cur is not None:
            # walk backward to enforce window
            j = hi_ptr - 1
            while j >= 0 and i - highs[j][0] <= window:
                cur = highs[j][1]
                j -= 1
            res[i] = cur
    lo_ptr = 0
    for i in range(n):
        cur = None
        while lo_ptr < len(lows) and lows[lo_ptr][0] <= i:
            cur = lows[lo_ptr][1]
            lo_ptr += 1
        if cur is not None:
            j = lo_ptr - 1
            while j >= 0 and i - lows[j][0] <= window:
                cur = lows[j][1]
                j -= 1
            sup[i] = cur
    return res, sup


# ---------------------------------------------------------------------------
# Order blocks + Fair Value Gaps (trailing zone lists)
# ---------------------------------------------------------------------------
def trailing_zones(ohlc, hl, lvl, window=400):
    """Return a list-of-lists: for each bar i, the zones formed strictly
    before i that are still within `window` bars. Zone = (top, bottom, dir,
    formed_bar); dir +1 bullish (buy zone) / -1 bearish (sell zone)."""
    swl = pd.DataFrame({"HighLow": hl, "Level": lvl})
    obr = smc.ob(ohlc, swl)
    obv = obr["OB"].to_numpy()
    obtop = obr["Top"].to_numpy()
    obbot = obr["Bottom"].to_numpy()
    fvr = smc.fvg(ohlc, join_consecutive=True)
    fv = fvr["FVG"].to_numpy()
    ftop = fvr["Top"].to_numpy()
    fbot = fvr["Bottom"].to_numpy()
    n = len(ohlc)
    out = [[] for _ in range(n)]
    recent = []
    for i in range(n):
        v = obv[i]
        if v == v and v != 0:
            top, bot = obtop[i], obbot[i]
            if top == top and bot == bot:
                recent.append((top, bot, 1 if v > 0 else -1, i))
        g = fv[i]
        if g == g and g != 0:
            top, bot = ftop[i], fbot[i]
            if top == top and bot == bot:
                recent.append((top, bot, 1 if g > 0 else -1, i))
        recent = [z for z in recent if i - z[3] <= window]
        out[i] = list(recent)
    return out