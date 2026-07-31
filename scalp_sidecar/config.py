"""Scalp research module — Phase 0/1 configuration.

Standalone module. No shared logic with the Slayers Model.
Rules here are pure numbers/thresholds — no ICT/narrative concepts.
"""
import os


def _load_dotenv(path=None):
    """Minimal .env loader (no dependency). Real env vars win over .env."""
    if path is None:
        path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
    if not os.path.exists(path):
        return
    with open(path) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, val = line.partition("=")
            key, val = key.strip(), val.strip().strip("'\"")
            if key and not os.environ.get(key):
                os.environ[key] = val


_load_dotenv()

# ---------------------------------------------------------------------------
# Oanda API
# ---------------------------------------------------------------------------
# Environment variables (set in shell, or a local .env in this directory that
# is git-ignored). Uses the LIVE account by default; set OANDA_ENV=practice to
# hit the demo environment instead.
OANDA_TOKEN = os.environ.get("OANDA_TOKEN", "")
OANDA_ENV = os.environ.get("OANDA_ENV", "live")  # "live" | "practice"

OANDA_BASE = {
    "live": "https://api-fxtrade.oanda.com/v3",
    "practice": "https://api-fxpractice.oanda.com/v3",
}[OANDA_ENV]

# ---------------------------------------------------------------------------
# Instruments (Oanda symbol format)
# ---------------------------------------------------------------------------
INSTRUMENTS = {
    "US30": "US30_USD",
    "SPX500": "SPX500_USD",
    "NAS100": "NAS100_USD",
    "EURUSD": "EUR_USD",
    "GBPUSD": "GBP_USD",
    "USDJPY": "USD_JPY",
    "AUDUSD": "AUD_USD",
}

# Display / decimal places for reporting
DECIMALS = {"US30": 2, "SPX500": 2, "NAS100": 2, "EURUSD": 5, "GBPUSD": 5,
            "USDJPY": 3, "AUDUSD": 5}

# ---------------------------------------------------------------------------
# Data window
# ---------------------------------------------------------------------------
# Years of history to fetch per instrument.
LOOKBACK_YEARS = float(os.environ.get("LOOKBACK_YEARS", "1.0"))

# Granularities to fetch and store.
GRANULARITIES = ["M1", "M5"]

# Oanda paginates candles; max candles per request.
OANDA_CANDLE_CHUNK = 5000

# ---------------------------------------------------------------------------
# Time / session definitions (America/New_York)
# ---------------------------------------------------------------------------
TZ = "America/New_York"

# NY open window — the ONLY tradeable window (Phase 0 lock).
NY_OPEN = (9, 30)     # 09:30 local (EST/EDT auto via tz)
NY_CLOSE = (11, 30)   # 11:30 local

# Opening-range window length in minutes (measured from NY open).
# This is the range we report in the Phase 1 gate query.
OPEN_RANGE_MINUTES = int(os.environ.get("OPEN_RANGE_MINUTES", "30"))

# Session boundaries by local hour (America/New_York).
# Used only for candle tagging — nothing here is tradeable logic.
SESSION_BOUNDS = [
    (0, 6, "ASIA"),
    (6, 9, "LONDON"),   # 06:00–09:00 covers FX London overlap
    (9, 16, "NY"),      # 09:00–16:00 NY (09:30 is the real equity open)
    (16, 24, "CLOSED"),
]

# ---------------------------------------------------------------------------
# High-impact news days (flagging only — decision to trade/exclude is later)
# ---------------------------------------------------------------------------
# NFP: first Friday of the month (auto-detected).
NFP_FIRST_FRIDAY = True

# CPI: release days — approximate monthly schedule (10th, or next business day).
CPI_DAY_OF_MONTH = 10

# FOMC: explicit dates (US federal rate decisions). Extend/trim as needed.
FOMC_DATES = [
    # 2025 (known scheduled dates)
    "2025-01-29", "2025-03-19", "2025-05-07", "2025-06-18",
    "2025-07-30", "2025-09-17", "2025-10-29", "2025-12-10",
    # 2026 (scheduled FOMC dates)
    "2026-01-28", "2026-03-18", "2026-05-06", "2026-06-17",
    "2026-07-29", "2026-09-16", "2026-10-28", "2026-12-09",
]

# ---------------------------------------------------------------------------
# Output
# ---------------------------------------------------------------------------
DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
# SCALP_DB_PATH overrides the DB location (e.g. a Render Disk mount). The bot
# reads the same path via SCALP_DB_PATH, so both processes share one file.
DB_PATH = os.environ.get("SCALP_DB_PATH") or os.path.join(DATA_DIR, "scalps.sqlite")
