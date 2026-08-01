"""Phase 1 — Historical data pull from OANDA.

For each pair/timeframe combo:
  - pulls candles over [START_DATE, END_DATE]
  - writes a clean CSV to /data/<KEY>_<TF>.csv
  - does NOT blindly forward-fill: candles are stored exactly as returned,
    and gaps (weekends, holidays, missing bars) are REPORTED in the summary
    so completeness is visible.

Usage:  python3 pull_data.py
        python3 pull_data.py --pairs EURUSD,BTCUSD
"""
import argparse
import csv
import sys
from datetime import datetime, timezone

import config
from oanda_client import fetch_candles


def fetch_all(sym, tf, start, end):
    rows = []
    for chunk in fetch_candles(sym, tf, start, end):
        rows.extend(chunk)
    return rows


def row_from_candle(c):
    m = c["mid"]
    return {
        "time": c["time"],
        "volume": c.get("volume", 0),
        "open": float(m["o"]),
        "high": float(m["h"]),
        "low": float(m["l"]),
        "close": float(m["c"]),
    }


def write_csv(path, rows):
    with open(path, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=config.COLUMNS)
        w.writeheader()
        w.writerows(rows)


def gap_stats(rows, tf):
    """Report market gaps between consecutive candles. No forward-fill."""
    if len(rows) < 2:
        return {"n": len(rows), "gaps_gt1x": 0, "gaps_gt2x": 0,
                "largest_hrs": 0.0, "largest_at": "", "weekend_gaps": 0}
    step_min = 60 if tf == "H1" else 240
    stats = {"n": len(rows), "gaps_gt1x": 0, "gaps_gt2x": 0,
             "largest_hrs": 0.0, "largest_at": "", "weekend_gaps": 0}
    for a, b in zip(rows[:-1], rows[1:]):
        ta = datetime.fromisoformat(a["time"].rstrip("Z").split(".")[0])
        tb = datetime.fromisoformat(b["time"].rstrip("Z").split(".")[0])
        hours = (tb - ta).total_seconds() / 3600.0
        if hours > step_min * 1.5 / 60.0:
            stats["gaps_gt1x"] += 1
        if hours > step_min * 2.0 / 60.0:
            stats["gaps_gt2x"] += 1
        if hours > stats["largest_hrs"]:
            stats["largest_hrs"] = hours
            stats["largest_at"] = a["time"][:10]
        if ta.weekday() >= 5:
            stats["weekend_gaps"] += 1
    return stats


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--pairs", help="comma-separated keys to limit pull")
    ap.add_argument("--tf", help="comma-separated timeframes, e.g. H1,H4")
    args = ap.parse_args()

    pairs = config.PAIRS
    if args.pairs:
        keys = [k.strip().upper() for k in args.pairs.split(",")]
        pairs = [p for p in pairs if p["key"] in keys]
    tfs = config.TIMEFRAMES
    if args.tf:
        tfs = [t.strip().upper() for t in args.tf.split(",")]

    start = datetime.fromisoformat(config.START_DATE).replace(tzinfo=timezone.utc)
    end = datetime.fromisoformat(config.END_DATE).replace(tzinfo=timezone.utc)

    print(f"Window: {config.START_DATE} -> {config.END_DATE}  "
          f"({len(pairs)} pairs x {len(tfs)} TFs)\n")

    results = []
    for p in pairs:
        for tf in tfs:
            fname = f"{p['key']}_{tf}.csv"
            path = f"{config.DATA_DIR}/{fname}"
            try:
                rows = fetch_all(p["sym"], tf, start, end)
            except Exception as e:
                print(f"  !! {p['key']} {tf}: FAILED {type(e).__name__}: {e}")
                continue
            clean = [row_from_candle(c) for c in rows]
            write_csv(path, clean)
            gs = gap_stats(clean, tf)
            first = rows[0]["time"][:10] if rows else "-"
            last = rows[-1]["time"][:10] if rows else "-"
            results.append((p["key"], tf, gs["n"], first, last, gs))
            print(f"  pulled {p['key']} {tf}: {gs['n']} candles "
                  f"({first} -> {last})")

    print("\n" + "=" * 92)
    print(f"{'PAIR':<9}{'TF':<5}{'ROWS':>9}  {'FIRST':<12}{'LAST':<12}"
          f"{'GAPS>1x':>8}{'GAPS>2x':>8}{'LARGEST GAP':>16}")
    print("-" * 92)
    for key, tf, n, first, last, gs in results:
        lg = f"{gs['largest_hrs']:.0f}h" if gs["largest_hrs"] else "-"
        print(f"{key:<9}{tf:<5}{n:>9}  {first:<12}{last:<12}"
              f"{gs['gaps_gt1x']:>8}{gs['gaps_gt2x']:>8}{lg:>16}")
    print("=" * 92)
    print(f"Files written to {config.DATA_DIR}/")
    print("Note: gaps are expected (weekends/holidays). >2x step gaps "
          "warrant a look — they indicate missing intraday data.")


if __name__ == "__main__":
    main()
