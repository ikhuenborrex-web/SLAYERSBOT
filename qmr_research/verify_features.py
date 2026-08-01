"""Quick verification that 4H scan + news filter behave like live.

Runs the engine over a short window (first ~6 months of EURUSD) with each
feature independently toggled and reports the tf distribution of fired
trades and the suppression reasons. No look-ahead concerns beyond the port.
"""
import os
import sys
from collections import Counter

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config import DATA_DIR  # noqa: E402
from engine.backtest import QMRBacktest  # noqa: E402
from run_backtest import load_csv  # noqa: E402


def run(pair, days, **cfg_extra):
    f = os.path.join(DATA_DIR, f"{pair}_H1.csv")
    times, o, h, l, c = load_csv(f)
    end = times[-1]
    start = end - timedelta(days=days)
    idx = next(i for i, t in enumerate(times) if t >= start)
    times, o, h, l, c = times[:idx], o[:idx], h[:idx], l[:idx], c[:idx]
    cfg = {"require_4_4": True}
    cfg.update(cfg_extra)
    if cfg.get("use_news_filter"):
        cfg["news_csv"] = os.path.join(DATA_DIR, "news_events.csv")
    bt = QMRBacktest(pair, times, o, h, l, c, cfg)
    bt.run()
    return bt


if __name__ == "__main__":
    from datetime import timedelta  # noqa: E402

    pair = "EURUSD"
    for label, extra in [
        ("1H-only", {}),
        ("+4H", {"use_4h": True}),
        ("+news", {"use_news_filter": True}),
        ("+4H+news", {"use_4h": True, "use_news_filter": True}),
    ]:
        bt = run(pair, 400, **extra)
        tfs = Counter(t.get("tf", "1H") for t in bt.trades_log)
        reasons = Counter()
        for s in bt.suppressed_log:
            r = s["reason"].split(";")[0] if s["reason"] else "filtered"
            reasons[r] += 1
        print(f"{label:10s} trades={len(bt.trades_log)} tf={dict(tfs)} "
              f"suppressed_top={reasons.most_common(6)}")
