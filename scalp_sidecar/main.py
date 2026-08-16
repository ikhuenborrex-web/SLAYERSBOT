"""Sidecar params — mirrors smc_backtest/main.py DEFAULTS.

Kept intentionally tiny (no report/simulate imports) so live_scan.py can pull
just the exit/entry parameters on the host. Keep in sync with the backtest
main.py DEFAULTS block.
"""
DEFAULTS = {
    "swing_length": 5,
    "lq_window": 200,
    "zone_window": 300,
    "choch_max_gap": 150,
    "zone_max_gap": 90,
    "sl_buffer_atr": 0.5,
    "min_rr": 2.0,
    "zone_pre_gap": 12,
    "confirm_mode": "lenient",
    "partial_at": 1.5,
    "partial_frac": 0.5,
    "trail_atr": 1.5,
}