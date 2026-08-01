"""Batch test of the three evidence-based improvement candidates.

Each config runs the FULL series per pair (walk-forward, as-of), then trades are
split: first 70% = training (where the idea must show a real improvement),
last 30% = untouched holdout (validation). Protocol: pre-registered candidates,
validated once each.

Candidates:
  A. no_bear_vs_bull_week   — reject BEARISH when weekly bias is BULLISH
  B. with_bias_only          — only take trades aligned with the weekly bias
  C. tp2_r_mult=3.0 / 3.5    — raise the (100% binding) 2.5R TP2 cap
  D. exclude London/NY Overlap
"""
import os
import sys
from datetime import timedelta

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config import OUTPUT_DIR  # noqa: E402
from run_backtest import load_csv, summarize, QMR_PAIRS  # noqa: E402
from engine.backtest import QMRBacktest  # noqa: E402

CONFIGS = [
    ("baseline", {}),
    ("A no-sell-into-bull-week", {"no_bear_vs_bull_week": True}),
    ("B with-bias-only", {"with_bias_only": True}),
    ("C TP2 cap 3.0R", {"tp2_r_mult": 3.0}),
    ("C TP2 cap 3.5R", {"tp2_r_mult": 3.5}),
    ("D drop London/NY overlap", {"exclude_sessions": {"London/NY Overlap"}}),
]


def main():
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

    lines = []
    add = lines.append
    add("=" * 78)
    add("BATCH — improvement candidates (train 70% / holdout 30%)")
    add(f"split {split.date()} | holdout ~{(mx - split).days} days")
    add("=" * 78)
    add("")

    add(f"  {'config':26s} {'train tr':>8s} {'train WR':>8s} {'train avgR':>10s} {'train net':>9s} | "
        f"{'hold tr':>7s} {'hold WR':>8s} {'hold avgR':>10s} {'hold net':>9s}")
    results = {}
    for name, kw in CONFIGS:
        train, hold = [], []
        for pair in QMR_PAIRS:
            t, o, h, l, c = data[pair]
            cfg = {"require_4_4": True, "compute_4h_alignment": False, **kw}
            bt = QMRBacktest(pair, t, o, h, l, c, cfg)
            bt.run()
            for tr in bt.trades_log:
                (train if tr["openTime"] < split else hold).append(tr)
        results[name] = (train, hold)
        st = summarize(train, "ALL")
        sh = summarize(hold, "ALL")
        add(f"  {name:26s} {st['trades']:8d} {st['win_rate']:8.0%} {st['avg_r']:+10.2f} "
            f"{st['net_r']:+9.1f} | {sh['trades']:7d} {sh['win_rate']:8.0%} "
            f"{sh['avg_r']:+10.2f} {sh['net_r']:+9.1f}")
    add("")

    base_t = summarize(results["baseline"][0], "ALL")
    base_h = summarize(results["baseline"][1], "ALL")
    add("HOLDOUT vs BASELINE (the decision number)")
    add(f"  {'config':26s} {'dnetR':>7s} {'davgR':>7s} {'dWR':>6s}")
    for name, _ in CONFIGS[1:]:
        st = summarize(results[name][0], "ALL")
        sh = summarize(results[name][1], "ALL")
        add(f"  {name:26s} {sh['net_r'] - base_h['net_r']:>+7.1f} "
            f"{sh['avg_r'] - base_h['avg_r']:>+7.2f} {sh['win_rate'] - base_h['win_rate']:>+6.0%}")
    add(f"  (baseline holdout: n={base_h['trades']} WR{base_h['win_rate']:.0%} "
        f"avgR{base_h['avg_r']:+.2f} net{base_h['net_r']:+.1f}R maxDD{base_h['max_dd']:.1f}R)")
    add("")

    report = "\n".join(lines)
    print(report)
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    with open(os.path.join(OUTPUT_DIR, "improvement_batch.txt"), "w") as f:
        f.write(report + "\n")
    print(f"Written: {os.path.join(OUTPUT_DIR, 'improvement_batch.txt')}")


if __name__ == "__main__":
    main()
