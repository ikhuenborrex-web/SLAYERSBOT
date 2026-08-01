"""Phase 3 follow-up — decompose the SL=2.0xATR re-admission population.

Maps every newly-admitted SL2.0 trade back to its baseline rejection reason
(from baseline_suppressed.csv), every dropped trade to its SL2.0 suppression
reason, and dumps full trade lists for CHFJPY / EURGBP under SL=2.0xATR.
"""
import collections
import csv
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config import OUTPUT_DIR  # noqa: E402
from run_backtest import load_csv, QMR_PAIRS  # noqa: E402
from engine.backtest import QMRBacktest  # noqa: E402


def load_trades(path):
    out = {}
    with open(path) as f:
        for r in csv.DictReader(f):
            key = (r["pair"], r["open_time"], r["type"])
            r["rMultiple"] = float(r["rMultiple"])
            r["score"] = int(r["score"])
            r["rr_gate"] = float(r["rr_gate"])
            out[key] = r
    return out


def load_suppressed(path):
    out = {}
    with open(path) as f:
        for r in csv.DictReader(f):
            key = (r["pair"], r["time"], r["type"])
            out[key] = r["reason"]
    return out


def bucket(r):
    for hi in (-0.5, 0.0, 0.5, 1.0, 1.5, 2.0, 2.5):
        if r <= hi:
            if hi == -0.5:
                return "[-1.0,-0.5]"
            return f"({hi - 0.5:g},{hi:g}]"
    return ">2.5"


def r_dist(trades, label):
    rows = sorted(trades, key=lambda t: t["rMultiple"], reverse=True)
    agg = collections.defaultdict(lambda: [0, 0.0])
    for t in rows:
        agg[bucket(t["rMultiple"])][0] += 1
        agg[bucket(t["rMultiple"])][1] += t["rMultiple"]
    lines = [f"  {label} R distribution (count / netR):"]
    for b in ("[-1.0,-0.5]", "(-0.5,0]", "(0,0.5]", "(0.5,1]", "(1,1.5]", "(1.5,2]", "(2,2.5]"):
        if b in agg:
            lines.append(f"    {b:10s}: {agg[b][0]:3d}  {agg[b][1]:+7.1f}R")
    top = rows[:5]
    if top:
        lines.append("  top winners:")
        for t in top:
            lines.append(f"    {t['pair']:7s} {t['type']:8s} score{t['score']} "
                         f"R{t['rMultiple']:+5.2f} {t['closeReason']} "
                         f"session={t['session']} {t['open_time'][:16]}")
        topnet = sum(t["rMultiple"] for t in top)
        tot = sum(t["rMultiple"] for t in rows)
        lines.append(f"    -> top-5 carry {topnet:+.1f}R of {tot:+.1f}R group net "
                     f"({topnet / tot:.0%} if tot != 0)")
    return lines


def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    base = load_trades(os.path.join(base_dir, "output", "baseline_trades.csv"))
    base_sup = load_suppressed(os.path.join(base_dir, "output", "baseline_suppressed.csv"))
    sl20 = load_trades(os.path.join(base_dir, "output", "baseline_sl20_trades.csv"))
    sl20_sup = load_suppressed(os.path.join(base_dir, "output", "baseline_sl20_suppressed.csv"))

    new_keys = [k for k in sl20 if k not in base]
    drop_keys = [k for k in base if k not in sl20]
    kept = [k for k in base if k in sl20]

    lines = []
    add = lines.append

    # =====================================================================
    # PART A — 76 newly admitted
    # =====================================================================
    add("=" * 72)
    add(f"PART A — {len(new_keys)} NEWLY ADMITTED trades (in SL2.0, not in baseline)")
    add("=" * 72)
    add("")
    add("Why they were rejected in baseline (matched by pair/time/type to baseline_suppressed):")
    cat = collections.Counter()
    rr_fails = []
    unmatched = []
    for k in new_keys:
        reason = base_sup.get(k)
        if reason is None:
            unmatched.append(k)
            continue
        if reason.startswith("RR"):
            cat["RR gate fail"] += 1
            rr_fails.append((k, reason))
        else:
            cat[reason] += 1
    for r, c in cat.most_common():
        add(f"    {r:38s}: {c}")
    add(f"    no baseline suppression record       : {len(unmatched)}")
    add("")
    add("RR-gate survivors — old RR (rejected) vs new RR (admitted), first 12:")
    cnt = 0
    for k, reason in rr_fails:
        old = reason.replace("RR ", "").replace("<1.5", "")
        new = sl20[k]["rr_gate"]
        add(f"    {k[0]:7s} {k[2]:8s} score{sl20[k]['score']}  RR {old} -> {new:.2f}  "
            f"R{sl20[k]['rMultiple']:+5.2f} {sl20[k]['closeReason']}")
        cnt += 1
        if cnt >= 12:
            break
    add("")
    add("Segment by pair:")
    by_pair = collections.Counter(k[0] for k in new_keys)
    for p in QMR_PAIRS:
        add(f"    {p:8s}: {by_pair.get(p, 0)}")
    add("")
    add("Segment by session:")
    for s, c in collections.Counter(sl20[k]["session"] for k in new_keys).most_common():
        add(f"    {s:22s}: {c}")
    add("")
    add("Segment by criteria score (4/5/6/7):")
    for sc in sorted(set(sl20[k]["score"] for k in new_keys)):
        add(f"    score {sc}: {sum(1 for k in new_keys if sl20[k]['score'] == sc)}")
    add("")
    add("Score comparison: new vs original 150")
    add(f"    new trades       : n={len(new_keys)} mean score "
        f"{np.mean([sl20[k]['score'] for k in new_keys]):.2f}")
    add(f"    original 150     : n={len(kept) + len(drop_keys)} mean score "
        f"{np.mean([base[k]['score'] for k in kept] + [base[k]['score'] for k in drop_keys]):.2f}")
    add(f"    kept (137)       : mean score {np.mean([sl20[k]['score'] for k in kept]):.2f}")
    add("")
    lines.extend(r_dist([sl20[k] for k in new_keys], "newly admitted (76)"))
    add("")

    # =====================================================================
    # PART B — 13 dropped
    # =====================================================================
    add("=" * 72)
    add(f"PART B — {len(drop_keys)} DROPPED trades (in baseline, not in SL2.0)")
    add("=" * 72)
    add("")
    add("SL2.0 suppression reason for each dropped trade (matched to baseline_sl20_suppressed):")
    gen_fail = 0
    gate_fail = []
    for k in sorted(drop_keys, key=lambda k: k[1]):
        reason = sl20_sup.get(k, "NO RECORD (did not even generate?)")
        tr = base[k]
        if reason.startswith("RR"):
            gen_fail += 1
        else:
            gate_fail.append((k, reason))
        add(f"    {k[0]:7s} {k[1][:16]} {k[2]:8s} score{tr['score']} "
            f"baseR{tr['rMultiple']:+5.2f} {tr['closeReason']:10s} -> {reason}")
    add("")
    add(f"  genuine RR-gate failures: {gen_fail}")
    add(f"  gate-suppressed (cooldown/dedupe/ADR/score): {len(gate_fail)}")
    add("  -> verify each gate-suppressed case below is a legitimate sequencing "
        "consequence, not a bug")
    for k, reason in gate_fail:
        tr = base[k]
        add(f"      {k[0]:7s} {k[1][:16]} {k[2]:8s} baseR{tr['rMultiple']:+5.2f} {reason}")
    add("")

    # =====================================================================
    # PART C — CHFJPY & EURGBP full trade lists under SL2.0
    # =====================================================================
    for pair in ("CHFJPY", "EURGBP"):
        add("=" * 72)
        add(f"PART C — {pair} full trade list under SL=2.0xATR (re-run in-memory)")
        add("=" * 72)
        times, o, h, l, c = load_csv(os.path.join(base_dir, "data", f"{pair}_H1.csv"))
        bt = QMRBacktest(pair, times, o, h, l, c, {"require_4_4": True,
                                                   "compute_4h_alignment": False,
                                                   "sl_atr_mult": 2.0})
        bt.run()
        add(f"  {len(bt.trades_log)} closed trades "
            f"| WR {sum(1 for t in bt.trades_log if t['outcome'] == 'WIN') / len(bt.trades_log):.0%} "
            f"| net {sum(t['rMultiple'] for t in bt.trades_log):+.1f}R")
        add(f"  {'open_time':16s} {'type':8s} {'entry':>11s} {'origSL':>11s} {'tp1':>11s} "
            f"{'tp2':>11s} {'sc':>2s} {'rr':>5s} {'R':>6s} {'reason':>11s} {'dur_h':>5s}")
        for t in sorted(bt.trades_log, key=lambda t: t["openTime"]):
            add(f"  {t['openTime'].strftime('%Y-%m-%d %H:%M'):16s} {t['type']:8s} "
                f"{t['qmLevel']:11.5f} {t['origSL']:11.5f} {t['tp1']:11.5f} {t['tp2']:11.5f} "
                f"{t['score']:2d} {t['rr']:5.2f} {t['rMultiple']:+6.2f} "
                f"{t.get('closeReason',''):>11s} {t.get('durationMin',0)/60:5.0f}")
        add("")
        bt2 = QMRBacktest(pair, times, o, h, l, c, {"require_4_4": True,
                                                    "compute_4h_alignment": False})
        bt2.run()
        add(f"  (baseline ref: {len(bt2.trades_log)} trades "
            f"| WR {sum(1 for t in bt2.trades_log if t['outcome'] == 'WIN') / len(bt2.trades_log):.0%} "
            f"| net {sum(t['rMultiple'] for t in bt2.trades_log):+.1f}R)")
        add("")

    report = "\n".join(lines)
    print(report)
    with open(os.path.join(OUTPUT_DIR, "sl20_decomposition.txt"), "w") as f:
        f.write(report + "\n")
    print(f"Written: {os.path.join(OUTPUT_DIR, 'sl20_decomposition.txt')}")


if __name__ == "__main__":
    main()
