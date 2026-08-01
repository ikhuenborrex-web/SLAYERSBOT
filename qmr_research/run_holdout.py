"""Out-of-sample validation — holdout on the final 30% of the dataset.

Tuning window = first 70% (everything Phase 2-5 used). Holdout = last 30%
(never tuned on). Three configs evaluated on holdout-only trades:
  1. baseline: live per-pair SL rule (retestSL / head)
  2. SL2.0  : entry +- 2.0 x ATR on all pairs
  3. SL2.0X : SL2.0 on all pairs EXCEPT CHFJPY (keeps live rule)

Engine runs continuously over the full series (walk-forward, as-of context, so
cooldown/dedupe/HTF memory legitimately carries across the split); only trades
that OPEN in the holdout are scored.
"""
import os
import sys
from datetime import timedelta

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config import OUTPUT_DIR  # noqa: E402
from run_backtest import load_csv, summarize, QMR_PAIRS  # noqa: E402
from engine.backtest import QMRBacktest  # noqa: E402

CONFIGS = [
    ("baseline", "base"),
    ("SL2.0", 2.0),
    ("SL2.0 excl CHFJPY", "2.0X"),
]


def sl_mult_for(pair, spec):
    if spec == "base":
        return None
    if spec == "2.0X" and pair == "CHFJPY":
        return None
    return 2.0


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
    add("=" * 70)
    add("OUT-OF-SAMPLE HOLDOUT VALIDATION")
    add("=" * 70)
    add(f"span {mn.date()} -> {mx.date()} | split(70%) {split.date()} {split:%H:%M}UTC | "
        f"holdout ~{(mx - split).days} days")
    add("")

    results = {}
    for name, spec in CONFIGS:
        train, hold = [], []
        for pair in QMR_PAIRS:
            t, o, h, l, c = data[pair]
            cfg = {"require_4_4": True, "compute_4h_alignment": False}
            cfg["sl_atr_mult"] = sl_mult_for(pair, spec)
            bt = QMRBacktest(pair, t, o, h, l, c, cfg)
            bt.run()
            for tr in bt.trades_log:
                (train if tr["openTime"] < split else hold).append(tr)
        results[name] = (train, hold)
        st = summarize(train, "ALL")
        sh = summarize(hold, "ALL")
        add(f"  {name:20s} TRAIN(70%): {fmt(st)}")
        add(f"  {'':20s} HOLD (30%): {fmt(sh)}")
        add("")

    add("=" * 70)
    add("HOLDOUT COMPARISON (final 30%, never tuned on)")
    add("=" * 70)
    add(f"  {'config':20s} {'tr':>4s} {'WR':>5s} {'avgR':>6s} {'netR':>7s} {'maxDD':>6s}")
    for name, _ in CONFIGS:
        sh = summarize(results[name][1], "ALL")
        add(f"  {name:20s} {sh['trades']:4d} {sh['win_rate']:>4.0%} {sh['avg_r']:>+6.2f} "
            f"{sh['net_r']:>+7.1f} {sh['max_dd']:>6.1f}")
    add("")
    add("HOLDOUT PER-PAIR (trade count / netR)")
    for name, _ in CONFIGS:
        by = {}
        for tr in results[name][1]:
            by.setdefault(tr["pair"], [0, 0.0])
            by[tr["pair"]][0] += 1
            by[tr["pair"]][1] += tr["rMultiple"]
        add(f"  {name:20s}: " + " | ".join(
            f"{p}{by[p][0]}tr/{by[p][1]:+.1f}R" for p in QMR_PAIRS if p in by))
    add("")

    report = "\n".join(lines)
    print(report)
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    with open(os.path.join(OUTPUT_DIR, "holdout_validation.txt"), "w") as f:
        f.write(report + "\n")
    print(f"Written: {os.path.join(OUTPUT_DIR, 'holdout_validation.txt')}")


def fmt(s):
    return (f"{s['trades']}tr WR{s['win_rate']:.0%} avgR{s['avg_r']:+.2f} "
            f"net{s['net_r']:+.1f}R maxDD{s['max_dd']:.1f}R")


if __name__ == "__main__":
    main()
