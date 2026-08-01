"""Phase 2 baseline — walk-forward QMR backtest CLI.

Loads pulled H1 CSVs for the 7 live QMR pairs, runs the faithful port of the
live 1H QMR rules, writes a full per-trade log CSV + summary stats.

Usage:
    python3 run_backtest.py                 # all 7 QMR pairs
    python3 run_backtest.py --pairs EURUSD  # single pair
    python3 run_backtest.py --no-strict     # disable 4/4 strict/counter gates (debug)
"""
import argparse
import csv
import glob
import os
import sys
from datetime import datetime

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config import DATA_DIR, OUTPUT_DIR  # noqa: E402
from engine.backtest import QMRBacktest  # noqa: E402

QMR_PAIRS = ["EURUSD", "XAUUSD", "BTCUSD", "GBPUSD", "EURCAD", "EURAUD", "GBPCAD"]


def _parse_ts(s):
    s = s.replace("Z", "+00:00")
    if "." in s:
        base, frac = s.split(".")
        frac = frac.split("+")[0].split("-")[0][:6]
        tz = "+00:00"
        tail = s.split(".", 1)[1]
        for tzmark in ("+", "-"):
            if tzmark in tail:
                tz = tail[tail.index(tzmark):]
                break
        s = f"{base}.{frac}{tz}"
    return datetime.fromisoformat(s).replace(tzinfo=None)


def load_csv(path):
    times, o, h, l, c = [], [], [], [], []
    with open(path) as f:
        reader = csv.DictReader(f)
        for row in reader:
            times.append(_parse_ts(row["time"]))
            o.append(float(row["open"]))
            h.append(float(row["high"]))
            l.append(float(row["low"]))
            c.append(float(row["close"]))
    return times, np.array(o), np.array(h), np.array(l), np.array(c)


def summarize(trades, pair=None):
    closed = [t for t in trades if t["outcome"] != "OPEN"]
    opened = len(trades)
    n = len(closed)
    if n == 0:
        return {"pair": pair or "ALL", "trades": opened, "closed": 0, "win_rate": 0.0,
                "avg_r": 0.0, "expectancy": 0.0, "max_dd": 0.0, "wins": 0,
                "losses": 0, "be": 0, "net_r": 0.0}
    wins = sum(1 for t in closed if t["outcome"] == "WIN")
    losses = sum(1 for t in closed if t["outcome"] == "SL")
    be = sum(1 for t in closed if t["outcome"] == "BE")
    r = [t["rMultiple"] for t in closed]
    # equity curve in R units -> max drawdown
    equity, peak, max_dd = 0.0, 0.0, 0.0
    for x in sorted(closed, key=lambda t: t["openTime"]):
        equity += x["rMultiple"]
        if equity > peak:
            peak = equity
        dd = peak - equity
        if dd > max_dd:
            max_dd = dd
    avg_r = sum(r) / len(r)
    return {
        "pair": pair or "ALL",
        "trades": opened,
        "closed": n,
        "open": opened - n,
        "wins": wins,
        "losses": losses,
        "be": be,
        "win_rate": wins / n,
        "avg_r": avg_r,
        "expectancy": avg_r,
        "net_r": sum(r),
        "max_dd": max_dd,
    }


def write_trade_log(trades, path):
    cols = ["pair", "open_time", "close_time", "session", "type", "entry", "sl",
            "tp1", "tp2", "score", "rr_gate", "htfBias", "counterTrend", "fibZones",
            "outcome", "closeReason", "rMultiple", "duration_min", "factors", "tf"]
    with open(path, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=cols)
        w.writeheader()
        for t in sorted(trades, key=lambda x: x["openTime"]):
            w.writerow({
                "pair": t["pair"],
                "open_time": t["openTime"].isoformat(),
                "close_time": t["closeTime"].isoformat() if t.get("closeTime") else "",
                "session": t.get("session", ""),
                "type": t["type"],
                "entry": t["entry"],
                "sl": t["sl"],
                "tp1": t["tp1"],
                "tp2": t["tp2"],
                "score": t["score"],
                "rr_gate": t["rr"],
                "htfBias": t.get("htfBias", ""),
                "counterTrend": t.get("counterTrend", False),
                "fibZones": t.get("fibZones", ""),
                "outcome": t["outcome"],
                "closeReason": t.get("closeReason", ""),
                "rMultiple": t["rMultiple"],
                "duration_min": round(t.get("durationMin", 0)) if t.get("durationMin") else "",
                "factors": " | ".join(t["factors"]),
                "tf": t.get("tf", "1H"),
            })


def write_suppressed(suppressed, path):
    cols = ["pair", "time", "type", "qmLevel", "score", "reason"]
    with open(path, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=cols)
        w.writeheader()
        for s in sorted(suppressed, key=lambda x: x["time"]):
            w.writerow(s)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--pairs", nargs="*", default=QMR_PAIRS)
    ap.add_argument("--no-strict", action="store_true",
                    help="skip strict-pair and 1H-no-4H 4/4 gates (debug comparison)")
    ap.add_argument("--sl-mult", type=float, default=None,
                    help="override SL with entry +- k*ATR (full re-admission experiment)")
    ap.add_argument("--news", action="store_true",
                    help="enable the currency news filter (BEFORE-ONLY by default)")
    ap.add_argument("--news-symmetric", action="store_true",
                    help="with --news, use legacy symmetric +-30 min block (before AND after release)")
    ap.add_argument("--out", default="baseline")
    args = ap.parse_args()

    cfg = {"require_4_4": not args.no_strict,
           "use_4h": bool(args.__dict__.get("4h")),
           "use_news_filter": bool(args.news),
           "news_before_only": not args.news_symmetric}
    if args.news:
        cfg["news_csv"] = os.path.join(DATA_DIR, "news_events.csv")
    if args.sl_mult:
        cfg["sl_atr_mult"] = args.sl_mult
    # NOTE: default is 1H-only, no news (the historical baseline). Enabling
    # --4h runs the 4H scan and populates qmr4hCache so 1H <4/4 signals can
    # fire with 4H alignment; --news blocks signals around currency news
    # (before-only, matching the updated live isNewsBlocked).

    all_trades = []
    all_suppressed = []
    pair_summaries = []
    for pair in args.pairs:
        f = os.path.join(DATA_DIR, f"{pair}_H1.csv")
        if not os.path.exists(f):
            print(f"[skip] {pair}: no data file")
            continue
        times, o, h, l, c = load_csv(f)
        bt = QMRBacktest(pair, times, o, h, l, c, cfg)
        bt.run()
        all_trades += bt.trades_log
        all_suppressed += bt.suppressed_log
        s = summarize(bt.trades_log, pair)
        pair_summaries.append(s)
        print(f"{pair}: {s['closed']} closed / {s['trades']} signals | "
              f"WR {s['win_rate']:.1%} avgR {s['avg_r']:+.2f} "
              f"net {s['net_r']:+.1f}R maxDD {s['max_dd']:.1f}R")

    total = summarize(all_trades, "ALL")
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    trade_path = os.path.join(OUTPUT_DIR, f"{args.out}_trades.csv")
    supp_path = os.path.join(OUTPUT_DIR, f"{args.out}_suppressed.csv")
    write_trade_log(all_trades, trade_path)
    write_suppressed(all_suppressed, supp_path)

    lines = [
        "=" * 60,
        "QMR PHASE 2 BASELINE — walk-forward 1H (faithful port of live rules)",
        "=" * 60,
        "",
        f"Window: {QMRBacktest.__module__} | pairs: {', '.join(pair_summaries and args.pairs)}",
        f"SL sizing: {'entry +- %.1f x ATR' % args.sl_mult if args.sl_mult else 'live retestSL/head rule'}",
        f"4H scan + alignment: {'ON' if args.__dict__.get('4h') else 'OFF'} | news filter: {'ON' if args.news else 'OFF'}",
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
        f"  expectancy        : {total['expectancy']:+.2f} R",
        f"  net R             : {total['net_r']:+.1f}",
        f"  max drawdown      : {total['max_dd']:.1f} R",
        "",
        "BY PAIR",
        "  " + ", ".join(f"{p['pair']}: {p['closed']}tr WR{p['win_rate']:.0%} avgR{p['avg_r']:+.2f}" for p in pair_summaries),
        "",
        f"Full trade log : {trade_path}",
        f"Suppressed log : {supp_path}",
        "",
        "NOTES",
        "  - Pure QMR 1H, no CRT, no EMA confluence layer.",
        "  - Strict pairs (GBPUSD/EURAUD/GBPCAD) + counter-trend need 4/4; 1H without",
        "    4H alignment also needs 4/4 when --4h is off (empty cache) or after a",
        "    4H signal sets qmr4hCache when --4h is on.",
        "  - Trade mgmt: TP1 min 2h age, SL->entry+0.3R buffer on TP1, trailing 1xSL after TP1,",
        "    TP2 = structural level capped 2.5R, 5-day TP1 expiry.",
        "  - Entry assumed filled at QM level at signal time.",
    ]
    print("\n".join(lines))
    with open(os.path.join(OUTPUT_DIR, f"{args.out}_summary.txt"), "w") as f:
        f.write("\n".join(lines) + "\n")


if __name__ == "__main__":
    main()
