# QMR RULE CHANGE — "A+D" (no-sell-into-bullish-week + drop London/NY overlap)

Status: APPROVED AND IMPLEMENTED in live `server.js` (2026-08-01).
Result of train(70%)/holdout(30%) validation.

## The rule (plain English)

1. **A — no selling into a bullish week.**
   Skip any BEARISH (sell) QMR setup when the current weekly candle is BULLISH
   (the last completed weekly candle closed up).

2. **D — drop the London/NY overlap.**
   Skip any QMR setup that fires during the London/NY overlap window
   (UTC hours 13-16, i.e. 9:00-12:00 EDT).

Everything else in the current QMR system stays unchanged: signal detection,
4/4 gates, RR gate, SL = live retestSL/head rule, TP1 (2h min age, entry+-0.3R
buffer, BE), trailing 1x SL, TP2 = structural capped 2.5R, 5-day TP1 expiry,
news filter (still skipped in backtest).

## Backtest evidence (7 QMR pairs, 1H, 2023-08-01 -> 2026-07-31)

Training window (first 70%, where the rule was selected):

| config   | trades | WR   | avgR | netR |
|----------|--------|------|------|------|
| baseline | 113    | 50%  | +0.21| +23.4R |
| **A+D**  | **73** | **59%** | **+0.49** | **+36.0R** |

Holdout (final 30%, never touched during selection):

| config   | trades | WR   | avgR | netR |
|----------|--------|------|------|------|
| baseline | 37     | 59%  | +0.58| +21.5R |
| **A+D**  | **20** | **80%** | **+1.06** | **+21.1R** |

Holdout read: same total profit (+21.1R vs +21.5R) on ~half the trades
(20 vs 37), win rate up 59% -> 80%, per-trade R up +0.58 -> +1.06.

Both components passed the holdout independently before being stacked:

| config      | holdout trades | holdout WR | holdout avgR | holdout netR |
|-------------|---------------|-----------|--------------|-------------|
| baseline    | 37 | 59% | +0.58 | +21.5R |
| A only      | 23 | 70% | +0.87 | +19.9R |
| D only      | 33 | 67% | +0.72 | +23.7R |
| **A+D**     | **20** | **80%** | **+1.06** | **+21.1R** |

## Engine reproduction (qmr_research)

```python
cfg = {
    "require_4_4": True,
    "compute_4h_alignment": False,
    "no_bear_vs_bull_week": True,
    "exclude_sessions": {"London/NY Overlap"},
}
```

- `engine/backtest.py`: `_evaluate_signal` rejects BEARISH when
  `htf_bias == "BULLISH"` (filter A) and rejects signals whose
  `session_label(t) == "London/NY Overlap"` (filter D). Both are default-off.
- Overlap window in UTC = hours [13, 16): `7 <= h < 16` (London) AND
  `13 <= h < 22` (NY).

## server.js port notes (IMPLEMENTED — line ~1490 and ~1658)

1. In the 1H QMR scan / checkQMRTrades path, compute the weekly bias as the
   last completed weekly candle (same as existing `getWBias`).
   If `type === "BEARISH" && wbias === "BULLISH"` -> do not fire.
2. Skip firing when the signal hour (UTC) is `13 <= hour < 16`.

Applied to BOTH the conservative (standard) 1H QMR path and the early/aggressive
1H pre-alert path. 4H signals are left untouched (the validation was 1H-only).

## Dead ends intentionally NOT taken (validated and rejected)

- SL = 2.0 x ATR blanket: curve-fit, failed holdout (avgR inverted).
- cp_gap_atr "no-chase" filter: failed holdout (excluded tail flipped sign).
- ML feature filter: no extractable signal at n=150.
- TP2 cap raised to 3.0/3.5R: failed holdout (give-back), cap stays 2.5R.

## Caveats

- Holdout slice is small (20 trades): 80% WR is directionally strong, not a
  precise estimate.
- Do not tune this rule further on the same holdout — freeze it. Any further
  changes require new data or a new out-of-sample window.
