"""Phase 5 — cp_gap_atr 'no-chase' filter sweep (training window only first).

cp_gap_atr = (close - qmLevel) * dir / ATR at signal time. Positive = price
already ran past the QM level (chasing); absolute value = distance from level.

Sweeps a max-distance threshold X: keep trades with |cp_gap_atr| <= X (and a
one-sided variant keeping cp_gap_atr in [-inf, X]). Reported on the TRAINING
window (first 70%) only. Holdout is untouched.
"""
import os
import sys
from datetime import timedelta

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config import OUTPUT_DIR  # noqa: E402
from run_backtest import load_csv, summarize, QMR_PAIRS  # noqa: E402
from engine.backtest import QMRBacktest, WINDOW  # noqa: E402
from engine.indicators import calc_atr  # noqa: E402


def build_train():
    data = {}
    mn, mx = None, None
    for pair in QMR_PAIRS:
        t, o, h, l, c = load_csv(os.path.join(os.path.dirname(os.path.abspath(__file__)),
                                              "data", f"{pair}_H1.csv"))
        data[pair] = (t, o, h, l, c)
        if mn is None or t[0] < mn:
            mn = t[0]
        if mx is None or t[-1] > mx:
            mx = t[-1]
    split = mn + timedelta(days=(mx - mn).total_seconds() / 86400 * 0.7)
    trades = []
    for pair in QMR_PAIRS:
        t, o, h, l, c = data[pair]
        bt = QMRBacktest(pair, t, o, h, l, c, {"require_4_4": True, "compute_4h_alignment": False})
        bt.run()
        for tr in bt.trades_log:
            if tr["openTime"] >= split:
                continue
            i = tr["signalIdx"]
            start = i - (WINDOW - 1)
            atr = calc_atr(o, h, l, c, start, i + 1, 14)
            d = 1 if tr["type"] == "BULLISH" else -1
            tr["cp_gap_atr"] = (c[i] - tr["qmLevel"]) * d / atr
            trades.append(tr)
    return trades, split


def main():
    trades, split = build_train()
    lines = []
    add = lines.append
    add("=" * 70)
    add("PHASE 5 — cp_gap_atr no-chase filter sweep (TRAINING window only)")
    add(f"training trades: {len(trades)} | split {split.date()} | holdout NOT touched")
    add("=" * 70)
    add("")

    def frow(name, subset):
        s = summarize(subset, "ALL")
        add(f"  {name:24s} {s['trades']:4d}tr WR{s['win_rate']:.0%} "
            f"avgR{s['avg_r']:+.2f} net{s['net_r']:+.1f}R maxDD{s['max_dd']:.1f}R")

    add("No filter (training baseline):")
    frow("all", trades)
    add("")

    thresholds = [0.05, 0.10, 0.15, 0.20, 0.25, 0.30, 0.40, 0.50]
    add("A. KEEP |cp_gap_atr| <= X (exclude trades far from the level either side)")
    add(f"  {'X':>5s} {'keep':>5s} {'WR':>5s} {'avgR':>6s} {'netR':>7s} {'maxDD':>6s}")
    for X in thresholds:
        sub = [t for t in trades if abs(t["cp_gap_atr"]) <= X]
        s = summarize(sub, "ALL")
        add(f"  {X:5.2f} {s['trades']:5d} {s['win_rate']:>4.0%} {s['avg_r']:>+6.2f} "
            f"{s['net_r']:>+7.1f} {s['max_dd']:>6.1f}")
    add("")
    add("B. KEEP cp_gap_atr <= X (one-sided: only exclude the chase side)")
    add(f"  {'X':>5s} {'keep':>5s} {'WR':>5s} {'avgR':>6s} {'netR':>7s} {'maxDD':>6s}")
    for X in thresholds:
        sub = [t for t in trades if t["cp_gap_atr"] <= X]
        s = summarize(sub, "ALL")
        add(f"  {X:5.2f} {s['trades']:5d} {s['win_rate']:>4.0%} {s['avg_r']:>+6.2f} "
            f"{s['net_r']:>+7.1f} {s['max_dd']:>6.1f}")
    add("")
    add("C. KEEP cp_gap_atr >= 0 (drop the 'closed through the level' side only)")
    sub = [t for t in trades if t["cp_gap_atr"] >= 0]
    frow("gap>=0", sub)
    add("")

    # where do winners/losers sit?
    win = [t for t in trades if t["outcome"] == "WIN"]
    los = [t for t in trades if t["outcome"] == "SL"]
    add("Winner/loser gap distributions (training):")
    for nm, g in (("wins", win), ("losses", los)):
        g = np.array([t["cp_gap_atr"] for t in g])
        add(f"  {nm:6s}: n={len(g)} med {np.median(g):+.3f} mean {g.mean():+.3f} "
            f"p25 {np.percentile(g, 25):+.3f} p75 {np.percentile(g, 75):+.3f}")
    add("")

    report = "\n".join(lines)
    print(report)
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    with open(os.path.join(OUTPUT_DIR, "phase5_cpgap_train.txt"), "w") as f:
        f.write(report + "\n")


if __name__ == "__main__":
    main()
