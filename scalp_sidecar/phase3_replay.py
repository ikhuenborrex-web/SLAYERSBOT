"""Phase 3 gate — replay the trade module over the historical dataset.

Feeds each historical day's M5 candles through phase3_trade.signal_for_day,
simulates the trade with phase3_trade.simulate, and reports:
  - how often a signal fires (breakout frequency)
  - win/loss/time-out rates
  - average R (in daily-ATR terms) per trade, expectancy
  - consistency vs the Phase 2 study's follow win rate
  - stop survival: fraction of winners that never hit the stop first

EURUSD is excluded from the core module (separate track), but reported
separately for reference.
"""
import collections
import sys

import db
import phase2_study as p2
import phase3_trade as trade

from config import INSTRUMENTS


def daily_atr_map(inst_id):
    """{day: daily ATR14 known at that day's open}, using study's method."""
    rows = [dict(r) for r in db.connect().execute(
        "SELECT * FROM candles WHERE instrument=? AND granularity='M5' ORDER BY ts ASC",
        (inst_id,))]
    if not rows:
        return {}
    days = collections.defaultdict(list)
    for r in rows:
        days[r["est"][:10]].append(r)
    bars = []
    for d in sorted(days):
        dc = days[d]
        bars.append({"day": d,
                     "high": max(c["high"] for c in dc),
                     "low": min(c["low"] for c in dc),
                     "close": dc[-1]["close"]})
    if len(bars) < 15:
        return {}
    from atr import atr as _atr
    series = _atr([b["high"] for b in bars], [b["low"] for b in bars],
                  [b["close"] for b in bars], 14)
    out = {}
    for i, b in enumerate(bars):
        k = i - 14
        if 0 <= k < len(series):
            out[b["day"]] = series[k]
    return out


def replay(inst_id):
    conn = db.connect()
    atr_map = daily_atr_map(inst_id)
    rows = [dict(r) for r in conn.execute(
        "SELECT * FROM candles WHERE instrument=? AND granularity='M5' ORDER BY ts ASC",
        (inst_id,))]
    days = collections.defaultdict(list)
    for r in rows:
        days[r["est"][:10]].append(r)

    outcomes = collections.Counter()
    rs = []
    signals = 0
    no_atr = 0

    for day in sorted(days):
        atr14 = atr_map.get(day)
        if not atr14:
            no_atr += 1
            continue
        sig = trade.signal_for_day(conn, inst_id, days[day], day, atr14)
        if not sig:
            continue
        signals += 1
        outcome, exit_px, _ = trade.simulate(sig, days[day])
        outcomes[outcome] += 1
        if outcome == "WIN":
            rs.append(trade.TARGET_MULT)
        elif outcome == "LOSS":
            rs.append(-trade.STOP_MULT)
        else:
            move = (exit_px - sig["entry"]) if sig["direction"] == "UP" \
                else (sig["entry"] - exit_px)
            rs.append(move / atr14)

    n = signals
    print(f"\n{inst_id} ({INSTRUMENTS[inst_id]}):")
    print(f"  days with ATR: {len([d for d in days if d in atr_map])}, signals: {signals}"
          f" ({100*signals/max(len(days),1):.0f}% of days)")
    if not n:
        print("  no signals")
        return
    w = outcomes["WIN"]
    print(f"  WIN {w} | LOSS {outcomes['LOSS']} | TIME {outcomes['TIME']}"
          f"   → win rate {100*w/n:.0f}% (n={n})")
    exp = sum(rs) / n
    print(f"  avg R/trade (daily-ATR): {exp:+.4f}   (win=+{trade.TARGET_MULT}, loss={-trade.STOP_MULT})")


def main():
    pairs = [a.upper() for a in sys.argv[1:]] if len(sys.argv) > 1 else trade.PAIRS
    for p in pairs:
        replay(p)


if __name__ == "__main__":
    main()
