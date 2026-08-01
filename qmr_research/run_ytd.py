"""2026 YTD backtest on the LIVE QMR config, with news/4h toggles.

Usage:
    python3 run_ytd.py [--no-4h] [--no-news] [--out ytd_base]
"""
import argparse
import os
import sys
from datetime import datetime, timedelta

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config import DATA_DIR, OUTPUT_DIR  # noqa: E402
from engine.backtest import QMRBacktest  # noqa: E402
from run_backtest import load_csv, summarize, write_trade_log  # noqa: E402

QMR_PAIRS = ["EURUSD", "XAUUSD", "BTCUSD", "GBPUSD", "EURCAD", "EURAUD", "GBPCAD"]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--no-4h", action="store_true")
    ap.add_argument("--no-news", action="store_true")
    ap.add_argument("--news-symmetric", action="store_true")
    ap.add_argument("--pairs", nargs="*", default=QMR_PAIRS)
    ap.add_argument("--out", default="ytd")
    args = ap.parse_args()

    cfg = {
        "require_4_4": True,
        "use_4h": not args.no_4h,
        "use_news_filter": not args.no_news,
        "news_before_only": not args.news_symmetric,
        "no_bear_vs_bull_week": True,
        "exclude_sessions": {"London/NY Overlap"},
    }
    if cfg["use_news_filter"]:
        cfg["news_csv"] = os.path.join(DATA_DIR, "news_events.csv")

    start = datetime(2026, 1, 1)
    all_trades = []
    pair_summaries = []
    for pair in args.pairs:
        f = os.path.join(DATA_DIR, f"{pair}_H1.csv")
        if not os.path.exists(f):
            continue
        times, o, h, l, c = load_csv(f)
        bt = QMRBacktest(pair, times, o, h, l, c, cfg)
        bt.run()
        in_window = [t for t in bt.trades_log if t["openTime"] >= start]
        all_trades += in_window
        s = summarize(in_window, pair)
        pair_summaries.append(s)
        print(f"{pair}: {s['closed']}tr WR{s['win_rate']:.0%} avgR{s['avg_r']:+.2f} net{s['net_r']:+.1f}R")

    total = summarize(all_trades, "ALL")
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    write_trade_log(all_trades, os.path.join(OUTPUT_DIR, f"{args.out}_trades.csv"))
    print("=" * 40)
    print(f"2026 YTD: {total['trades']} signals | {total['closed']} closed | "
          f"WR {total['win_rate']:.1%} | net {total['net_r']:+.1f}R | "
          f"maxDD {total['max_dd']:.1f}R")
    with open(os.path.join(OUTPUT_DIR, f"{args.out}_summary.txt"), "w") as f:
        f.write(f"2026 YTD: {total['trades']} signals | {total['closed']} closed | "
                f"WR {total['win_rate']:.1%} | net {total['net_r']:+.1f}R | "
                f"maxDD {total['max_dd']:.1f}R\n")


if __name__ == "__main__":
    main()
