"""Intensive backtest report — deep metrics on the current QMR baseline (7 pairs, 1H).

Reads the fresh output/baseline_trades.csv and produces:
  global, equity/maxDD detail, monthly + yearly, rolling, per-session,
  per-direction, per-score, per-pair, close-reason mix, duration, streaks,
  R distribution, and a chronological equity snapshot.
"""
import collections
import csv
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config import OUTPUT_DIR  # noqa: E402

BASE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "output", "baseline_trades.csv")


def load():
    out = []
    with open(BASE) as f:
        for r in csv.DictReader(f):
            r["rMultiple"] = float(r["rMultiple"])
            r["score"] = int(r["score"])
            r["rr_gate"] = float(r["rr_gate"])
            r["duration_min"] = float(r["duration_min"]) if r["duration_min"] else np.nan
            out.append(r)
    return sorted(out, key=lambda r: r["open_time"])


def stats(trades):
    n = len(trades)
    if n == 0:
        return {"n": 0, "wr": 0.0, "avg": 0.0, "net": 0.0, "dd": 0.0}
    wins = sum(1 for t in trades if t["outcome"] == "WIN")
    r = [t["rMultiple"] for t in trades]
    eq, peak, dd = 0.0, 0.0, 0.0
    for x in sorted(trades, key=lambda t: t["open_time"]):
        eq += x["rMultiple"]
        peak = max(peak, eq)
        dd = max(dd, peak - eq)
    return {"n": n, "wr": wins / n, "avg": sum(r) / n, "net": sum(r), "dd": dd}


def fmt(s, label=""):
    return f"{label} {s['n']:3d}tr WR{s['wr']:.0%} avgR{s['avg']:+.2f} net{s['net']:+.1f}R maxDD{s['dd']:.1f}R"


def main():
    trades = load()
    lines = []
    add = lines.append
    add("=" * 76)
    add("INTENSIVE BACKTEST — QMR baseline, 7 pairs, 1H, live SL rule")
    add(f"trades: {len(trades)} | {trades[0]['open_time'][:10]} -> {trades[-1]['open_time'][:10]}")
    add("=" * 76)
    add("")

    g = stats(trades)
    add(f"GLOBAL  {fmt(g)}")
    add("")

    # equity curve / max DD detail
    eq, peak, dd, dd_start, peak_t, maxdd_info = 0.0, 0.0, 0.0, None, None, None
    cur_dd_start = None
    curve = []
    for t in trades:
        eq += t["rMultiple"]
        curve.append(eq)
        if eq > peak:
            peak = eq
            peak_t = t["open_time"]
        d = peak - eq
        if d > dd:
            dd = d
            dd_start = peak_t
            maxdd_info = (t["open_time"], d)
        if d == 0:
            cur_dd_start = t["open_time"]
    add("EQUITY / DRAWDOWN")
    add(f"  final net R: {eq:+.1f} | max DD: {dd:.1f}R ({maxdd_info[0][:10]}, peak at {dd_start[:10]})")
    # worst losing month & streak from trade seq
    add("")

    # R distribution
    buckets = [(-1.0, -0.5, "SL~-1.0"), (-0.5, 0, "-0.5..0"), (0, 0.5, "0..+0.5"),
               (0.5, 1.0, "+0.5..1"), (1.0, 1.5, "+1..1.5"), (1.5, 2.0, "+1.5..2"),
               (2.0, 2.5, "+2..2.5")]
    agg = collections.defaultdict(int)
    for t in trades:
        r = t["rMultiple"]
        for lo, hi, name in buckets:
            if lo <= r <= hi or (lo < r <= hi):
                if lo <= r <= hi:
                    agg[name] += 1
                    break
    add("R DISTRIBUTION")
    for _, _, name in buckets:
        add(f"  {name:12s}: {agg[name]}")
    add("")

    # close reasons
    cr = collections.Counter(t["closeReason"] for t in trades)
    add("CLOSE-REASON MIX")
    for k, v in cr.most_common():
        sub = [t for t in trades if t["closeReason"] == k]
        s = stats(sub)
        add(f"  {k:14s}: {v:3d}  avgR{s['avg']:+.2f} net{s['net']:+.1f}R")
    add("")

    # monthly
    by_m = collections.defaultdict(list)
    for t in trades:
        by_m[t["open_time"][:7]].append(t)
    add("MONTHLY (net R, running)")
    run = 0.0
    add(f"  {'month':8s} {'tr':>3s} {'WR':>4s} {'avgR':>6s} {'netR':>7s} {'run':>7s}")
    for m in sorted(by_m):
        s = stats(by_m[m])
        run += s["net"]
        add(f"  {m:8s} {s['n']:3d} {s['wr']:>3.0%} {s['avg']:>+6.2f} {s['net']:>+7.1f} {run:>+7.1f}")
    add("")

    # yearly
    by_y = collections.defaultdict(list)
    for t in trades:
        by_y[t["open_time"][:4]].append(t)
    add("YEARLY")
    for y in sorted(by_y):
        add(f"  {fmt(stats(by_y[y]), y)}")
    add("")

    # rolling 3-month
    months = sorted(by_m)
    if len(months) >= 3:
        add("ROLLING 3-MONTH NET R")
        for i in range(len(months) - 2):
            m3 = months[i:i + 3]
            net = sum(stats(by_m[m])["net"] for m in m3)
            add(f"  {m3[0]}..{m3[-1]}: {net:+.1f}R")
        add("")

    # session
    by_s = collections.defaultdict(list)
    for t in trades:
        by_s[t["session"]].append(t)
    add("PER-SESSION")
    for s in sorted(by_s, key=lambda k: -stats(by_s[k])["net"]):
        add(f"  {fmt(stats(by_s[s]), s[:22]):44s}")
    add("")

    # direction
    by_d = collections.defaultdict(list)
    for t in trades:
        by_d[t["type"]].append(t)
    add("PER-DIRECTION")
    for d in ("BULLISH", "BEARISH"):
        add(f"  {fmt(stats(by_d[d]), d):36s}")
    add("")

    # score
    by_sc = collections.defaultdict(list)
    for t in trades:
        by_sc[t["score"]].append(t)
    add("PER-SCORE (criteria count)")
    for sc in sorted(by_sc):
        add(f"  {fmt(stats(by_sc[sc]), f'score {sc}'):30s}")
    add("")

    # pair
    by_p = collections.defaultdict(list)
    for t in trades:
        by_p[t["pair"]].append(t)
    add("PER-PAIR")
    for p in sorted(by_p):
        add(f"  {fmt(stats(by_p[p]), p):28s}")
    add("")

    # duration
    add("HOLDING TIME (hours)")
    win = [t["duration_min"] / 60 for t in trades if t["outcome"] == "WIN"]
    los = [t["duration_min"] / 60 for t in trades if t["outcome"] == "SL"]
    for nm, arr in (("wins", win), ("losses", los), ("all", [t["duration_min"] / 60 for t in trades])):
        a = np.array([x for x in arr if x == x])
        add(f"  {nm:7s}: median {np.median(a):7.1f}  mean {a.mean():7.1f}  p90 {np.percentile(a, 90):7.1f}  "
            f"max {a.max():7.1f}")
    add("")

    # streaks
    best_w = best_l = cur_w = cur_l = 0
    for t in trades:
        if t["outcome"] == "WIN":
            cur_w += 1
            cur_l = 0
        else:
            cur_l += 1
            cur_w = 0
        best_w = max(best_w, cur_w)
        best_l = max(best_l, cur_l)
    add("STREAKS")
    add(f"  max consecutive wins: {best_w} | losses: {best_l}")
    add("")

    report = "\n".join(lines)
    print(report)
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    with open(os.path.join(OUTPUT_DIR, "baseline_intensive.txt"), "w") as f:
        f.write(report + "\n")
    print(f"Written: {os.path.join(OUTPUT_DIR, 'baseline_intensive.txt')}")


if __name__ == "__main__":
    main()
