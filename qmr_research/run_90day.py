"""Trailing 90-day backtest on the LIVE QMR config (baseline + A+D rule).

Runs the faithful port over the full series (so weekly/daily context is correct
with no look-ahead), then reports only trades OPENED in the trailing N days.

Usage:
    python3 run_90day.py [--days 90] [--out live_90d]
"""
import argparse
import csv
import os
import sys
from datetime import timedelta

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config import DATA_DIR, OUTPUT_DIR  # noqa: E402
from engine.backtest import QMRBacktest  # noqa: E402
from run_backtest import load_csv, summarize, write_trade_log  # noqa: E402

QMR_PAIRS = ["EURUSD", "XAUUSD", "BTCUSD", "GBPUSD", "EURCAD", "EURAUD", "GBPCAD"]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--days", type=int, default=90)
    ap.add_argument("--pairs", nargs="*", default=QMR_PAIRS)
    ap.add_argument("--no-4h", action="store_true",
                    help="disable the 4H scan + qmr4h alignment cache (mirrors live default ON)")
    ap.add_argument("--no-news", action="store_true",
                    help="disable the currency news filter")
    ap.add_argument("--news-symmetric", action="store_true",
                    help="use legacy symmetric +-30 min news block (before AND after release)")
    ap.add_argument("--out", default="live_90d")
    args = ap.parse_args()

    # LIVE config as currently deployed: baseline gates + A+D filters on.
    # News filter is BEFORE-ONLY (matches updated isNewsBlocked) unless
    # --news-symmetric opts into the legacy symmetric behavior.
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

    all_trades = []
    all_suppressed = []
    pair_summaries = []
    per_pair_rows = []
    for pair in args.pairs:
        f = os.path.join(DATA_DIR, f"{pair}_H1.csv")
        if not os.path.exists(f):
            print(f"[skip] {pair}: no data file")
            continue
        times, o, h, l, c = load_csv(f)
        end = times[-1]
        start = end - timedelta(days=args.days)

        bt = QMRBacktest(pair, times, o, h, l, c, cfg)
        bt.run()

        # only trades opened within the trailing window
        in_window = [t for t in bt.trades_log if t["openTime"] >= start]
        all_trades += in_window
        # suppressed count within window (all reasons, incl A+D)
        win_supp = [s for s in bt.suppressed_log
                    if _parse_ts2(s["time"]) >= start]
        all_suppressed += win_supp

        s = summarize(in_window, pair)
        pair_summaries.append(s)
        ad_supp = sum(1 for s_ in win_supp if "bear vs bullish week" in s_["reason"]
                      or "excluded session" in s_["reason"])
        per_pair_rows.append((pair, s, ad_supp))
        print(f"{pair}: {s['closed']} closed / {s['trades']} signals | "
              f"WR {s['win_rate']:.0%} avgR {s['avg_r']:+.2f} "
              f"net {s['net_r']:+.1f}R maxDD {s['max_dd']:.1f}R "
              f"(A+D suppressed: {ad_supp})")

    total = summarize(all_trades, "ALL")
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    trade_path = os.path.join(OUTPUT_DIR, f"{args.out}_trades.csv")
    supp_path = os.path.join(OUTPUT_DIR, f"{args.out}_suppressed.csv")
    write_trade_log(all_trades, trade_path)
    with open(supp_path, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["pair", "time", "type", "qmLevel", "score", "reason"])
        w.writeheader()
        for s in sorted(all_suppressed, key=lambda x: x["time"]):
            w.writerow(s)

    lines = [
        "=" * 60,
        f"QMR TRAILING {args.days}-DAY BACKTEST — LIVE CONFIG (A+D applied)",
        "=" * 60,
        "",
        f"Window: last {args.days} days ending {end.date()} (signals opened in window)",
        f"Pairs : {', '.join(args.pairs)}",
        "Config: baseline live rules + no-sell-into-bullish-week + drop London/NY overlap",
        f"       4H scan+alignment {'ON' if cfg['use_4h'] else 'OFF'} | news filter {'ON' if cfg['use_news_filter'] else 'OFF'}",
        "",
        "GLOBAL SUMMARY",
        f"  signals fired     : {total['trades']}",
        f"  closed            : {total['closed']}",
        f"  still open        : {total['open']}",
        f"  wins              : {total['wins']}",
        f"  losses            : {total['losses']}",
        f"  breakeven         : {total['be']}",
        f"  win rate (WIN/all): {total['win_rate']:.1%}",
        f"  avg R / trade     : {total['avg_r']:+.2f}",
        f"  net R             : {total['net_r']:+.1f}",
        f"  max drawdown      : {total['max_dd']:.1f} R",
        "",
        "BY PAIR (ranked by net R)",
    ]
    for pair, s, ad_supp in sorted(per_pair_rows, key=lambda x: x[1]["net_r"], reverse=True):
        lines.append(f"  {pair:7s} {s['closed']:3d}tr WR{s['win_rate']:3.0%} "
                     f"avgR{s['avg_r']:+.2f} net{s['net_r']:+6.1f}R maxDD{s['max_dd']:5.1f}R "
                     f"(A+D cut {ad_supp})")
    lines += [
        "",
        f"Full trade log : {trade_path}",
        f"Suppressed log : {supp_path}",
        "",
        "NOTES",
        "  - A+D = BEARISH into BULLISH week rejected; London/NY overlap (UTC 13-16) rejected.",
        "  - 4H scan + qmr4hCache modeled; 1H signals w/o same-type 4H alignment in last 24h",
        "    still need 4/4; 4H signals fire their own trades (4H entry = zone level).",
        "  - News filter: blocks entry if a TradingView calendar event touching a pair currency",
        "    is UPCOMING within +-30 min (before-only). Post-release entries are allowed.",
        "    --news-symmetric restores the legacy before-AND-after block.",
        "  - Trades opened before the window but closed inside it are excluded (window = entry date).",
    ]
    print("\n".join(lines))
    with open(os.path.join(OUTPUT_DIR, f"{args.out}_summary.txt"), "w") as f:
        f.write("\n".join(lines) + "\n")


def _parse_ts2(s):
    from run_backtest import _parse_ts
    return _parse_ts(s)


if __name__ == "__main__":
    main()
