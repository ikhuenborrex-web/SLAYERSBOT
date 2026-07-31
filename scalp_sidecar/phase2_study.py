"""Phase 2 — Statistical study of the NY open window (NO strategy logic).

For every local trading day, per pair:
  - Opening ranges: 09:30–09:45 (OR15) and 09:30–10:00 (OR30) high/low
  - Did price CLOSE beyond the OR within the next 60 minutes, in which
    direction, and how far in daily-ATR multiples?
  - Buckets by OR30 width vs recent DAILY ATR: narrow / normal / wide
  - Follow-breakout vs fade win rates per bucket

Reference volatility = ATR(14) on DAILY candles (aggregated from M5), read
at the day open (no lookahead). Output is a report only.
"""
import sys
from collections import defaultdict

import db
from config import INSTRUMENTS
from atr import atr

NY_OPEN_MIN = 9 * 60 + 30
OR15_END = NY_OPEN_MIN + 15
OR30_END = NY_OPEN_MIN + 30
WINDOW_MIN = 60          # lookahead after OR closes
TARGET = 0.25            # daily-ATR multiples for a "win" (follow or fade)

# Bucket boundaries for OR30 width / daily ATR — tercile-ish, data-driven
BUCKET_PCT = (1 / 3, 2 / 3)


def _mins(est_iso):
    """'YYYY-MM-DDTHH:MM:SS' -> minutes since midnight (local)."""
    return int(est_iso[11:13]) * 60 + int(est_iso[14:16])


def _day_rows(rows):
    days = defaultdict(list)
    for r in rows:
        days[r["est"][:10]].append(r)
    return days


def daily_atr14_by_day(rows):
    """Aggregate M5 rows to daily bars; ATR(14) per day, shifted +1 day.

    Returns {day: atr_value_as_of_that_day_open}. Uses only prior-day
    candles for each day's value (no lookahead).
    """
    days = _day_rows(rows)
    bars = []
    order = sorted(days)
    for day in order:
        dc = days[day]
        bars.append({
            "day": day,
            "open": dc[0]["open"], "high": max(c["high"] for c in dc),
            "low": min(c["low"] for c in dc), "close": dc[-1]["close"],
        })
    if len(bars) < 15:
        return {}
    highs = [b["high"] for b in bars]
    lows = [b["low"] for b in bars]
    closes = [b["close"] for b in bars]
    series = atr(highs, lows, closes, 14)  # series[i] = ATR up to bar i
    out = {}
    for i, b in enumerate(bars):
        k = i - 14  # series[k] = ATR as of bar index i-1 (previous day)
        if k >= 0 and k < len(series):
            out[b["day"]] = series[k]
    return out


def opening_range(candles, start_min, end_min):
    highs, lows = [], []
    for c in candles:
        m = _mins(c["est"])
        if start_min <= m < end_min:
            highs.append(c["high"])
            lows.append(c["low"])
    if not highs:
        return None
    return {"high": max(highs), "low": min(lows)}


def breakout_and_reach(or_hi, or_lo, window, atr_val):
    """First close beyond the OR in the window + max reach in ATR multiples."""
    if not window or not atr_val:
        return None
    direction = None
    max_up = 0.0
    max_dn = 0.0
    for c in window:
        if direction is None:
            if c["close"] > or_hi:
                direction = "UP"
            elif c["close"] < or_lo:
                direction = "DOWN"
        max_up = max(max_up, (c["high"] - or_hi) / atr_val)
        max_dn = max(max_dn, (or_lo - c["low"]) / atr_val)
    return {"direction": direction, "max_up_atr": max_up, "max_dn_atr": max_dn}


def follow_win(ev, target=TARGET):
    if not ev or not ev["direction"]:
        return None
    if ev["direction"] == "UP":
        return ev["max_up_atr"] >= target
    return ev["max_dn_atr"] >= target


def fade_win(ev, target=TARGET):
    if not ev or not ev["direction"]:
        return None
    if ev["direction"] == "UP":
        return ev["max_dn_atr"] >= target
    return ev["max_up_atr"] >= target


def load_study(inst_id, window_min=WINDOW_MIN):
    """Per-day events for a pair, given a lookahead window length."""
    study = study_pair(inst_id, window_min=window_min)
    return study


def study_pair(inst_id, window_min=WINDOW_MIN):
    conn = db.connect()
    rows = [dict(r) for r in conn.execute(
        "SELECT * FROM candles WHERE instrument=? AND granularity='M5' ORDER BY ts ASC",
        (inst_id,))]
    if not rows:
        return None

    atr_by_day = daily_atr14_by_day(rows)
    days = _day_rows(rows)

    study = []
    for day in sorted(days):
        day_c = days[day]
        or15 = opening_range(day_c, NY_OPEN_MIN, OR15_END)
        or30 = opening_range(day_c, NY_OPEN_MIN, OR30_END)
        if not or15 or not or30:
            continue
        atr_val = atr_by_day.get(day)
        if not atr_val:
            continue

        window = [c for c in day_c
                  if OR30_END <= _mins(c["est"]) < OR30_END + window_min]
        ev = breakout_and_reach(or30["high"], or30["low"], window, atr_val)

        window15 = [c for c in day_c
                    if OR15_END <= _mins(c["est"]) < OR15_END + window_min]
        ev15 = breakout_and_reach(or15["high"], or15["low"], window15, atr_val)

        study.append({
            "day": day,
            "or15": or15, "or30": or30,
            "atr": atr_val,
            "or30_width_ratio": (or30["high"] - or30["low"]) / atr_val,
            "ev": ev, "ev15": ev15,
            "follow": follow_win(ev), "fade": fade_win(ev),
            "follow15": follow_win(ev15), "fade15": fade_win(ev15),
        })

    # Data-driven buckets: terciles of OR30/dailyATR ratio.
    ratios = sorted(d["or30_width_ratio"] for d in study)
    if not ratios:
        return study
    lo_cut = ratios[int(len(ratios) * BUCKET_PCT[0])]
    hi_cut = ratios[int(len(ratios) * BUCKET_PCT[1]) - 1]

    for d in study:
        r = d["or30_width_ratio"]
        d["bucket"] = "narrow" if r < lo_cut else ("wide" if r > hi_cut else "normal")
    return study


def print_report(inst_id):
    study = study_pair(inst_id)
    if study is None:
        print(f"{inst_id}: no data")
        return

    print(f"\n{'='*72}\n{inst_id}  ({INSTRUMENTS.get(inst_id, '?')}) — NY open statistical study\n{'='*72}")
    print(f"Days studied: {len(study)}   (reference vol = DAILY ATR14, win target = {TARGET}× daily ATR)")

    _print_bucket(inst_id, study, "ALL DAYS")
    for name in ("narrow", "normal", "wide"):
        subset = [d for d in study if d["bucket"] == name]
        if subset:
            _print_bucket(inst_id, subset, f"BUCKET: {name} OR")

    _print_bucket(inst_id, study, "OR15 variant (09:30–09:45, lookahead to 10:45)", or15=True)


def _print_bucket(inst_id, study, title, or15=False):
    n = len(study)
    if not n:
        return
    evs = [d["ev15"] if or15 else d["ev"] for d in study]
    fws = [d["follow15"] if or15 else d["follow"] for d in study]
    fds = [d["fade15"] if or15 else d["fade"] for d in study]

    up = sum(1 for e in evs if e and e["direction"] == "UP")
    dn = sum(1 for e in evs if e and e["direction"] == "DOWN")
    nb = n - up - dn

    up_reach = [e["max_up_atr"] for e in evs if e and e["direction"] == "UP"]
    dn_reach = [e["max_dn_atr"] for e in evs if e and e["direction"] == "DOWN"]
    avg_up = sum(up_reach) / len(up_reach) if up_reach else 0
    avg_dn = sum(dn_reach) / len(dn_reach) if dn_reach else 0

    def pct(x, t):
        return f"{100*x/t:.0f}%" if t else "n/a"

    print(f"\n  {title}  (N={n})")
    print(f"    Breakouts: UP {pct(up, n)} | DOWN {pct(dn, n)} | none {pct(nb, n)}")
    print(f"    Avg max reach beyond OR: UP {avg_up:.2f} ATR | DOWN {avg_dn:.2f} ATR")
    print(f"    FOLLOW breakout win rate: {pct(sum(1 for x in fws if x), len(fws))}   (n={len(fws)})")
    print(f"    FADE it win rate:         {pct(sum(1 for x in fds if x), len(fds))}   (n={len(fds)})")


def all_pairs():
    for inst_id in INSTRUMENTS:
        print_report(inst_id)


def sweep_pair(inst_id):
    """Follow/fade win rate as a function of target (daily-ATR multiples)
    and lookahead window length. OR15 variant only."""
    study = load_study(inst_id, window_min=WINDOW_MIN)
    if not study:
        print(f"{inst_id}: no data")
        return

    targets = [0.05, 0.10, 0.15, 0.20, 0.25, 0.30]
    windows = [30, 60, 90]

    print(f"\n{'='*72}\n{inst_id} — follow/fade win-rate sweep (OR15, vs daily ATR)\n{'='*72}")
    print("  Follow = close beyond OR then reach TARGET in that direction.")
    print("  Fade   = close beyond OR then retrace TARGET back through it.")

    for win in windows:
        study = load_study(inst_id, window_min=win)
        print(f"\n  Lookahead window: {win} min  (N={len(study)})")
        print(f"    target×ATR |  follow win  |  fade win")
        for t in targets:
            fw = [follow_win(d["ev15"], t) for d in study]
            fd = [fade_win(d["ev15"], t) for d in study]
            fw_n = sum(1 for x in fw if x is not None) or 1
            fd_n = sum(1 for x in fd if x is not None) or 1
            print(f"      {t:>6.2f}   | {100*sum(1 for x in fw if x)/fw_n:>7.0f}%  | {100*sum(1 for x in fd if x)/fd_n:>7.0f}%")


def all_sweep():
    for inst_id in INSTRUMENTS:
        sweep_pair(inst_id)


def mae_report(inst_id, target=0.10, window_min=WINDOW_MIN, or15=True):
    """For OR15 breakouts: distance (in daily-ATR multiples) price travels
    AGAINST the breakout before target is hit or the window ends. This sizes
    the stop so most winners survive."""
    study = load_study(inst_id, window_min=window_min)
    if not study:
        print(f"{inst_id}: no data")
        return

    rows_per_day = None
    conn = db.connect()
    rows = [dict(r) for r in conn.execute(
        "SELECT * FROM candles WHERE instrument=? AND granularity='M5' ORDER BY ts ASC",
        (inst_id,))]
    days = _day_rows(rows)

    print(f"\n{'='*72}\n{inst_id} — MAE vs target=({target}× daily ATR, {window_min}min, {'OR15' if or15 else 'OR30'})\n{'='*72}")

    for d in study:
        day = d["day"]
        ev = d["ev15"] if or15 else d["ev"]
        if not ev or not ev["direction"]:
            continue
        day_c = days[day]
        or_hi = d["or15"]["high"] if or15 else d["or30"]["high"]
        or_lo = d["or15"]["low"] if or15 else d["or30"]["low"]
        atr_val = d["atr"]
        tgt = target * atr_val
        window = [c for c in day_c
                  if (OR15_END if or15 else OR30_END) <= _mins(c["est"])
                  < (OR15_END if or15 else OR30_END) + window_min]
        entry = or_hi if ev["direction"] == "UP" else or_lo
        sign = 1 if ev["direction"] == "UP" else -1
        hit = False
        mae = 0.0
        for c in window:
            ctr = c["low"] if ev["direction"] == "UP" else c["high"]
            mae = max(mae, (entry - ctr) / atr_val)  # adverse distance in ATR
            if sign * (c["high"] if ev["direction"] == "UP" else c["low"]) - sign * entry >= tgt:
                hit = True
                break
        d["mae"] = mae
        d["hit"] = hit

    hit_days = [d for d in study if "hit" in d and d["hit"]]
    miss_days = [d for d in study if "hit" in d and not d["hit"]]
    all_break = [d for d in study if "hit" in d]

    print(f"Breakouts: {len(all_break)}   | target hit within window: {len(hit_days)} ({100*len(hit_days)//max(len(all_break),1)}%)")
    print(f"MAE of winners  (n={len(hit_days)}): avg {sum(d['mae'] for d in hit_days)/max(len(hit_days),1):.3f} ATR | max {max((d['mae'] for d in hit_days), default=0):.3f} ATR")
    print(f"MAE of losers   (n={len(miss_days)}): avg {sum(d['mae'] for d in miss_days)/max(len(miss_days),1):.3f} ATR | max {max((d['mae'] for d in miss_days), default=0):.3f} ATR")
    if hit_days:
        hit_days.sort(key=lambda x: x["mae"])
        for p in (50, 75, 90, 95):
            idx = int(len(hit_days) * p / 100)
            print(f"  winner MAE p{p}: {hit_days[idx]['mae']:.3f} ATR")
    return study


if __name__ == "__main__":
    if len(sys.argv) > 2 and sys.argv[1] == "sweep":
        sweep_pair(sys.argv[2].upper())
    elif len(sys.argv) > 1 and sys.argv[1] == "sweep":
        all_sweep()
    elif len(sys.argv) > 2 and sys.argv[1] == "mae":
        mae_report(sys.argv[2].upper())
    elif len(sys.argv) > 1 and sys.argv[1] == "mae":
        for i in INSTRUMENTS:
            mae_report(i)
    elif len(sys.argv) > 1:
        print_report(sys.argv[1].upper())
    else:
        all_pairs()
