"""QMR research pipeline configuration.

Pure numbers/config — no strategy logic. Edit PAIRS, TIMEFRAMES and the date
range here, then run:  python3 pull_data.py
"""
import os
import sys


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
# OANDA API
# ---------------------------------------------------------------------------
# Set in qmr_research/.env (git-ignored) or as real env vars.
OANDA_TOKEN = os.environ.get("OANDA_TOKEN", "")
OANDA_ENV = os.environ.get("OANDA_ENV", "practice")  # "live" | "practice"

OANDA_BASE = {
    "live": "https://api-fxtrade.oanda.com/v3",
    "practice": "https://api-fxpractice.oanda.com/v3",
}[OANDA_ENV]

OANDA_CANDLE_CHUNK = 5000  # max candles per request

# ---------------------------------------------------------------------------
# Data window
# ---------------------------------------------------------------------------
START_DATE = os.environ.get("QMR_START", "2023-08-01")  # ~3 years back
END_DATE = os.environ.get("QMR_END", "2026-08-01")      # inclusive window

# ---------------------------------------------------------------------------
# Pairs (QMR + bonus) — OANDA symbol, display name, decimal places
# ---------------------------------------------------------------------------
PAIRS = [
    {"key": "EURUSD",  "sym": "EUR_USD",    "name": "EUR/USD",  "dec": 5},
    {"key": "XAUUSD",  "sym": "XAU_USD",    "name": "XAU/USD",  "dec": 2},
    {"key": "BTCUSD",  "sym": "BTC_USD",    "name": "BTC/USD",  "dec": 1},
    {"key": "EURGBP",  "sym": "EUR_GBP",    "name": "EUR/GBP",  "dec": 5},
    {"key": "EURCAD",  "sym": "EUR_CAD",    "name": "EUR/CAD",  "dec": 5},
    {"key": "USDJPY",  "sym": "USD_JPY",    "name": "USD/JPY",  "dec": 3},
    {"key": "CHFJPY",  "sym": "CHF_JPY",    "name": "CHF/JPY",  "dec": 3},
    # Bonus pairs (also resolve on OANDA)
    {"key": "GBPUSD",  "sym": "GBP_USD",    "name": "GBP/USD",  "dec": 5},
    {"key": "AUDUSD",  "sym": "AUD_USD",    "name": "AUD/USD",  "dec": 5},
    {"key": "SPX500",  "sym": "SPX500_USD", "name": "SPX500",   "dec": 2},
    {"key": "US30",    "sym": "US30_USD",   "name": "US30",     "dec": 2},
    {"key": "NAS100",  "sym": "NAS100_USD", "name": "NAS100",   "dec": 2},
    # FX candidates (candidates to replace underperforming live pairs)
    {"key": "USDCHF",  "sym": "USD_CHF",    "name": "USD/CHF",  "dec": 5},
    {"key": "NZDUSD",  "sym": "NZD_USD",    "name": "NZD/USD",  "dec": 5},
    {"key": "USDCAD",  "sym": "USD_CAD",    "name": "USD/CAD",  "dec": 5},
    {"key": "EURJPY",  "sym": "EUR_JPY",    "name": "EUR/JPY",  "dec": 3},
    {"key": "GBPJPY",  "sym": "GBP_JPY",    "name": "GBP/JPY",  "dec": 3},
    {"key": "EURAUD",  "sym": "EUR_AUD",    "name": "EUR/AUD",  "dec": 5},
    {"key": "EURNZD",  "sym": "EUR_NZD",    "name": "EUR/NZD",  "dec": 5},
    {"key": "AUDNZD",  "sym": "AUD_NZD",    "name": "AUD/NZD",  "dec": 5},
    {"key": "GBPNZD",  "sym": "GBP_NZD",    "name": "GBP/NZD",  "dec": 5},
    {"key": "GBPCAD",  "sym": "GBP_CAD",    "name": "GBP/CAD",  "dec": 5},
]

# Timeframes to pull per pair.
#  - 1H: primary — QMR logic runs here
#  - 4H: confirmation / higher-timeframe confluence (matches server QMR_TFS)
TIMEFRAMES = ["H1", "H4"]

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
OUTPUT_DIR = os.path.join(BASE_DIR, "output")
for _d in (DATA_DIR, OUTPUT_DIR):
    os.makedirs(_d, exist_ok=True)

# CSV layout
COLUMNS = ["time", "volume", "open", "high", "low", "close"]
