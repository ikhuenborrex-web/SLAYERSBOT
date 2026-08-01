"""Phase 4 — ML feature importance: what actually predicts a QMR win vs loss.

Uses the Phase 2 trade log (re-run in-memory for full dicts: origSL, signalIdx).
Target: outcome WIN (1) vs SL (0). Features are all known at signal time
(no leakage: duration/closeReason/rMultiple excluded).

Models: RandomForest, HistGradientBoosting. CV: 5-fold Stratified + GroupKFold
(by pair) + expanding TimeSeriesSplit. Importance: RF impurity + permutation
importance (both RF and GBM). Dummy classifier included as the "guessing" floor.
"""
import os
import sys
import warnings
from datetime import timedelta

import numpy as np
import pandas as pd

warnings.filterwarnings("ignore")
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config import OUTPUT_DIR  # noqa: E402
from run_backtest import load_csv, QMR_PAIRS  # noqa: E402
from engine.backtest import QMRBacktest, WINDOW  # noqa: E402
from engine.indicators import calc_atr  # noqa: E402

from sklearn.model_selection import StratifiedKFold, GroupKFold, TimeSeriesSplit
from sklearn.ensemble import RandomForestClassifier, HistGradientBoostingClassifier
from sklearn.dummy import DummyClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import roc_auc_score, accuracy_score
from sklearn.inspection import permutation_importance


def oof_permutation_importance(X, y, model, splitter, n_repeats=10, random_state=42):
    """Per-fold permutation importance: fit on train, measure test-AUC drop from
    shuffling each feature. Returns (mean, std) over all fold/repeat drops."""
    rng = np.random.RandomState(random_state)
    drops = {c: [] for c in X.columns}
    for tr, te in splitter.split(X, y):
        Xt, Xe, yt, ye = X.iloc[tr], X.iloc[te], y.iloc[tr], y.iloc[te]
        model.fit(Xt, yt)
        base = roc_auc_score(ye, model.predict_proba(Xe)[:, 1])
        Xe = Xe.to_numpy()
        for j, c in enumerate(X.columns):
            for _ in range(n_repeats):
                Xp = Xe.copy()
                Xp[:, j] = rng.permutation(Xp[:, j])
                a = roc_auc_score(ye, model.predict_proba(Xp)[:, 1])
                drops[c].append(base - a)
    mean = {c: float(np.mean(drops[c])) for c in X.columns}
    std = {c: float(np.std(drops[c])) for c in X.columns}
    return mean, std


def build_features():
    rows = []
    for pair in QMR_PAIRS:
        times, o, h, l, c = load_csv(os.path.join(os.path.dirname(os.path.abspath(__file__)),
                                                  "data", f"{pair}_H1.csv"))
        bt = QMRBacktest(pair, times, o, h, l, c, {"require_4_4": True, "compute_4h_alignment": False})
        bt.run()
        for tr in bt.trades_log:
            if tr["outcome"] not in ("WIN", "SL"):
                continue
            i = tr["signalIdx"]
            start = i - (WINDOW - 1)
            atr = calc_atr(o, h, l, c, start, i + 1, 14)
            risk = abs(tr["qmLevel"] - tr["origSL"])
            cp = c[i]
            d = 1 if tr["type"] == "BULLISH" else -1
            rows.append({
                "pair": pair,
                "session": tr.get("session", ""),
                "htfBias": tr.get("htfBias", "NEUTRAL"),
                "is_bull": tr["type"] == "BULLISH",
                "open_time": tr["openTime"],
                "score": tr["score"],
                "n_factors": len(tr["factors"]),
                "rr_gate": tr["rr"],
                "risk_atr": risk / atr if atr > 0 else np.nan,
                "cp_gap_atr": (cp - tr["qmLevel"]) * d / atr if atr > 0 else np.nan,
                "tp1_r": (tr["tp1"] - tr["qmLevel"]) * d / risk if risk > 0 else np.nan,
                "tp2_r": (tr["tp2"] - tr["qmLevel"]) * d / risk if risk > 0 else np.nan,
                "atr_pct": atr / cp * 100 if cp else np.nan,
                "fib_count": (len(tr["fibZones"].split(","))
                              if isinstance(tr["fibZones"], str) and tr["fibZones"] != "NONE" else 0),
                "counter_trend": 1 if tr.get("counterTrend") else 0,
                "hour": tr["openTime"].hour,
                "day_of_week": tr["openTime"].weekday(),
                "outcome": 1 if tr["outcome"] == "WIN" else 0,
            })
    df = pd.DataFrame(rows).sort_values("open_time").reset_index(drop=True)
    df["time_since_last_h"] = np.nan
    for pair in QMR_PAIRS:
        idx = df.index[df["pair"] == pair]
        t = df.loc[idx, "open_time"].values
        gap = np.full(len(t), np.nan)
        if len(t) > 1:
            gap[1:] = (t[1:] - t[:-1]) / np.timedelta64(1, "h")
        df.loc[idx, "time_since_last_h"] = gap
    df["time_since_last_h"] = np.log1p(df["time_since_last_h"].fillna(df["time_since_last_h"].max()))
    return df


def main():
    df = build_features()
    cat_cols = ["pair", "session", "htfBias"]
    num_cols = ["score", "n_factors", "rr_gate", "risk_atr", "cp_gap_atr", "tp1_r", "tp2_r",
                "atr_pct", "fib_count", "counter_trend", "hour", "day_of_week", "time_since_last_h"]
    for c in cat_cols:
        df[c] = LabelEncoder().fit_transform(df[c].astype(str))
    X = df[num_cols + cat_cols].astype(float)
    y = df["outcome"].astype(int)

    lines = []
    add = lines.append
    add("=" * 72)
    add("PHASE 4 — ML FEATURE IMPORTANCE (predict WIN vs SL)")
    add("=" * 72)
    add(f"samples: {len(df)} (WIN {int(y.sum())} / SL {int((1 - y).sum())})")
    add(f"features ({len(X.columns)}): {', '.join(X.columns)}")
    add(f"leakage excluded: duration_min, closeReason, rMultiple (target-derived)")
    add("")

    base_rate = max(y.mean(), 1 - y.mean())
    add(f"baseline 'always guess majority' accuracy: {base_rate:.1%} (AUC floor 0.50)")
    add("")

    dummy = DummyClassifier(strategy="stratified")
    cv_s = StratifiedKFold(5, shuffle=True, random_state=42)
    auc_d = []
    for tr, te in cv_s.split(X, y):
        dummy.fit(X.iloc[tr], y.iloc[tr])
        auc_d.append(roc_auc_score(y.iloc[te], dummy.predict_proba(X.iloc[te])[:, 1]))
    add(f"Dummy classifier 5-fold AUC: {np.mean(auc_d):.3f} +- {np.std(auc_d):.3f} (guessing floor)")
    add("")

    rfc = RandomForestClassifier(n_estimators=600, max_depth=5, min_samples_leaf=4,
                                 max_features="sqrt", random_state=42, n_jobs=-1)
    gbm = HistGradientBoostingClassifier(max_depth=3, learning_rate=0.05, max_iter=300,
                                         l2_regularization=1.0, min_samples_leaf=5, random_state=42)

    def run_cv(model, X, y, splitter, name):
        auc, acc = [], []
        for tr, te in splitter.split(X, y, groups=df["pair"] if isinstance(splitter, GroupKFold) else None):
            model.fit(X.iloc[tr], y.iloc[tr])
            auc.append(roc_auc_score(y.iloc[te], model.predict_proba(X.iloc[te])[:, 1]))
            acc.append(accuracy_score(y.iloc[te], model.predict(X.iloc[te])))
        add(f"  {name:34s} AUC {np.mean(auc):.3f} +- {np.std(auc):.3f} | acc {np.mean(acc):.1%}")

    add("CROSS-VALIDATION (out-of-fold, never training accuracy)")
    add("  RandomForest")
    run_cv(rfc, X, y, StratifiedKFold(5, shuffle=True, random_state=42), "5-fold stratified")
    run_cv(rfc, X, y, GroupKFold(5), "GroupKFold by pair")
    tss = TimeSeriesSplit(n_splits=5)
    run_cv(rfc, X, y, tss, "expanding TimeSeriesSplit")
    add("  HistGradientBoosting")
    run_cv(gbm, X, y, StratifiedKFold(5, shuffle=True, random_state=42), "5-fold stratified")
    run_cv(gbm, X, y, GroupKFold(5), "GroupKFold by pair")
    add("")

    # Train on full data for impurity; permutation importance done CROSS-VALIDATED (OOF)
    rfc.fit(X, y)
    gbm.fit(X, y)
    imp_rf = pd.Series(rfc.feature_importances_, index=X.columns).sort_values(ascending=False)
    cv5 = StratifiedKFold(5, shuffle=True, random_state=42)
    perm_rf_mean, perm_rf_std = oof_permutation_importance(X, y, rfc, cv5)
    perm_gbm_mean, perm_gbm_std = oof_permutation_importance(X, y, gbm, cv5)

    add("FEATURE IMPORTANCE")
    add("  RF impurity gain (in-sample, mean decrease in impurity)")
    for f, v in imp_rf.items():
        add(f"    {f:22s} {v:.4f}")
    add("")
    add("  Cross-validated permutation importance (OOF AUC drop) — RF")
    prf = pd.Series(perm_rf_mean, index=X.columns)
    for f, v in prf.sort_values(ascending=False).items():
        add(f"    {f:22s} {v:+.4f} +- {perm_rf_std[f]:.4f}")
    add("")
    add("  Cross-validated permutation importance (OOF AUC drop) — GBM")
    pg = pd.Series(perm_gbm_mean, index=X.columns)
    for f, v in pg.sort_values(ascending=False).items():
        add(f"    {f:22s} {v:+.4f} +- {perm_gbm_std[f]:.4f}")
    add("")

    # Flatness check
    top = imp_rf.iloc[0]
    bottom = imp_rf.iloc[-1]
    cv_imp = imp_rf.std() / imp_rf.mean()
    add("MODEL DIAGNOSTIC")
    add(f"  RF impurity: top feature {imp_rf.index[0]} {top:.4f} vs bottom {imp_rf.index[-1]} {bottom:.4f} "
        f"(ratio {top / bottom:.1f}x) | CV {cv_imp:.2f}")
    add("  -> ratio near 1 / importances flat = model is guessing; "
        "clear spread + stable OOF AUC > 0.60 = real signal")
    add("")

    # Feature distribution summary for the reader
    add("FEATURE RANGES (train matrix)")
    for f in X.columns:
        add(f"    {f:22s} mean {X[f].mean():8.3f}  min {X[f].min():8.3f}  max {X[f].max():8.3f}")
    add("")

    report = "\n".join(lines)
    print(report)
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    with open(os.path.join(OUTPUT_DIR, "phase4_ml_report.txt"), "w") as f:
        f.write(report + "\n")
    print(f"Written: {os.path.join(OUTPUT_DIR, 'phase4_ml_report.txt')}")


if __name__ == "__main__":
    main()
