"""Phase 3 — NY-open breakout trade module (standalone).

Produces a single trade signal per session from live/historical M5 candles.
Pure numbers and thresholds only — no narrative/ICT concepts.

LOCKED Phase 3 configuration (final, Phase 4 spec):
  - Pairs:      US30, NAS100 only. SPX500 dropped (redundant beta, highest
                loss clustering); FX excluded (costs/fade days do not
                diversify day-level risk).
  - Range:      OR15 (09:30–09:45 local). Breakout = M5 close beyond the OR.
  - Target:     0.10 × daily ATR14   (daily ATR read at the day open, no lookahead)
  - Stop:       0.20 × daily ATR (R:R sweep: clips only ~5-6% of 0.30-stop
                winners while raising per-risk return ~32-64%)
  - Hold:       max 60 min, hard time-stop at 11:30 local (NY_CLOSE)
  - Risk:       0.5% of account per trade (position sized so stop = 0.5%)
  - Frequency:  at most one trade per session, indices only.

The module is deliberately stateless: feed it the day's candles and prior-day
daily ATR, it returns a Signal dict or None. Consuming it live later just
requires a candle stream; replay testing reuses the same function.
"""
import zoneinfo
from datetime import datetime

from config import NY_OPEN, NY_CLOSE, TZ, DECIMALS

# ---------------------------------------------------------------------------
# Phase 3 LOCKED parameters
# ---------------------------------------------------------------------------
PAIRS = ["US30", "NAS100"]                # indices only (final Phase 3 lock)
TARGET_MULT = 0.10                        # target = × daily ATR14
STOP_MULT = 0.20                          # stop   = × daily ATR14 (R:R sweep)
MAX_HOLD_MIN = 60                         # soft time-out after entry
RISK_PER_TRADE = 0.005                    # 0.5% of account per trade
SIGNAL_TIMEOUT_MIN = 60                   # wait this long for a breakout after OR15
OR15_END_MIN = 9 * 60 + 45                # 09:45 local


def _mins(est):
    return int(est[11:13]) * 60 + int(est[14:16])


def daily_atr_from_stats(conn, instrument, day):
    """Daily ATR14 as of a day's open, with no lookahead.

    Aggregates M5 candles to daily bars and runs Wilder ATR(14) over the
    daily bars, returning the value known at the START of `day` (i.e. the
    previous day's ATR). Falls back to the daily_stats table only if raw
    candles are unavailable.
    """
    rows = conn.execute(
        """SELECT * FROM candles
           WHERE instrument=? AND granularity='M5' AND est < ?
           ORDER BY ts ASC""",
        (instrument, day + "T23:59:59"),
    ).fetchall()
    if rows:
        return _daily_atr_prior(rows, day)

    row = conn.execute(
        """SELECT atr14 FROM daily_stats
           WHERE instrument=? AND day<? ORDER BY day DESC LIMIT 1""",
        (instrument, day),
    ).fetchone()
    return row["atr14"] if row and row["atr14"] else None


def _daily_atr_prior(rows, day):
    """Wilder ATR(14) on daily bars built from M5 rows, valued at `day` open."""
    import collections

    days = collections.defaultdict(list)
    for r in rows:
        days[r["est"][:10]].append(r)
    bars = []
    for d in sorted(days):
        dc = days[d]
        bars.append({
            "day": d,
            "high": max(c["high"] for c in dc),
            "low": min(c["low"] for c in dc),
            "close": dc[-1]["close"],
        })
    if len(bars) < 15:
        return None
    highs = [b["high"] for b in bars]
    lows = [b["low"] for b in bars]
    closes = [b["close"] for b in bars]

    from atr import atr as _atr
    series = _atr(highs, lows, closes, 14)  # series[k] = ATR at bar 13+k
    for i, b in enumerate(bars):
        if b["day"] == day:
            k = i - 14  # value as of previous day
            return series[k] if 0 <= k < len(series) else None
    return series[-1]


def opening_range(candles, start_min, end_min):
    """High/low of candles whose est-timestamp minute is in [start,end)."""
    hs, ls = [], []
    for c in candles:
        m = _mins(c["est"])
        if start_min <= m < end_min:
            hs.append(c["high"])
            ls.append(c["low"])
    if not hs:
        return None
    return {"high": max(hs), "low": min(ls), "n": len(hs)}


def signal_for_day(conn, instrument, day_candles, day, atr14):
    """Return a Signal dict if a trade is warranted on `day`, else None.

    Args:
      conn:        db connection (for daily_stats lookups)
      instrument:  'US30' | 'SPX500' | 'NAS100'
      day_candles: all M5 candles for `day`, est-sorted ascending
      day:         'YYYY-MM-DD' (America/New_York)
      atr14:       daily ATR14 known at the day open (no lookahead)

    Returns dict with: pair, direction, entry, target, stop, max_hold_min,
    expiry_est, signal_est, or_high, or_low, atr14. Or None.
    """
    if instrument not in PAIRS:
        return None
    if not atr14 or atr14 <= 0:
        return None

    or15 = opening_range(day_candles, 9 * 60 + 30, OR15_END_MIN)
    if not or15 or or15["n"] < 2:
        return None

    target = TARGET_MULT * atr14
    stop_dist = STOP_MULT * atr14

    # Entry price: OR boundary is the fill you'd get with a stop order at the
    # boundary. ENTRY_AT_BOUNDARY=False fills at the breakout candle's close
    # (conservative, worse fill).
    ENTRY_AT_BOUNDARY = True

    # Scan M5 closes after the OR15 close for a breakout (close beyond OR).
    entry = None
    for c in day_candles:
        m = _mins(c["est"])
        if m < OR15_END_MIN:
            continue
        if m > OR15_END_MIN + SIGNAL_TIMEOUT_MIN:
            break  # no breakout within the entry window — stand aside
        if c["close"] > or15["high"]:
            entry = {"direction": "UP", "price": c["close"],
                     "at": c["est"], "boundary": or15["high"]}
            break
        if c["close"] < or15["low"]:
            entry = {"direction": "DOWN", "price": c["close"],
                     "at": c["est"], "boundary": or15["low"]}
            break

    if entry is None:
        return None

    direction = entry["direction"]
    fill = entry["boundary"] if ENTRY_AT_BOUNDARY else entry["price"]
    if direction == "UP":
        target_price = fill + target
        stop_price = fill - stop_dist
    else:
        target_price = fill - target
        stop_price = fill + stop_dist

    # Hard time-stop: never hold past NY_CLOSE (11:30 local) of `day`.
    expiry = datetime.fromisoformat(day + "T00:00:00").replace(
        tzinfo=zoneinfo.ZoneInfo(TZ),
        hour=NY_CLOSE[0], minute=NY_CLOSE[1], second=0, microsecond=0,
    )
    expiry_est = expiry.strftime("%Y-%m-%dT%H:%M:%S")

    return {
        "pair": instrument,
        "direction": direction,
        "entry": fill,
        "target": target_price,
        "stop": stop_price,
        "target_mult": TARGET_MULT,
        "stop_mult": STOP_MULT,
        "max_hold_min": MAX_HOLD_MIN,
        "expiry_est": expiry_est,
        "signal_est": entry["at"],
        "or_high": or15["high"],
        "or_low": or15["low"],
        "atr14": atr14,
    }


def simulate(signal, future_candles):
    """Walk candles after the signal; return the trade outcome.

    Candle granularity is M5. Outcomes:
      "WIN"   — target reached first
      "LOSS"  — stop reached first
      "TIME"  — neither; held to hard time-stop (signal time + max_hold, or
                expiry_est, whichever is earlier)
    Returns (outcome, exit_price, exit_est).
    """
    from datetime import timedelta

    sig_t = datetime.fromisoformat(signal["signal_est"])
    exp_t = datetime.fromisoformat(signal["expiry_est"])
    hold_t = sig_t + timedelta(minutes=signal["max_hold_min"])

    direction = signal["direction"]
    last = None
    for c in future_candles:
        last = c
        t = datetime.fromisoformat(c["est"])
        if t < sig_t:
            continue
        if direction == "UP":
            if c["high"] >= signal["target"]:
                return "WIN", signal["target"], c["est"]
            if c["low"] <= signal["stop"]:
                return "LOSS", signal["stop"], c["est"]
        else:
            if c["low"] <= signal["target"]:
                return "WIN", signal["target"], c["est"]
            if c["high"] >= signal["stop"]:
                return "LOSS", signal["stop"], c["est"]
        if t > hold_t or t > exp_t:
            return "TIME", c["close"], c["est"]
    return "TIME", (last["close"] if last else signal["entry"]), None
