"""SMC backtest config — pure numbers, no strategy logic.

Edit INSTRUMENTS / TIMEFRAMES / START_DATE here, then run:  python3 main.py
"""
import os
import datetime as dt


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

OANDA_TOKEN = os.environ.get("OANDA_TOKEN", "")
OANDA_ENV = os.environ.get("OANDA_ENV", "practice")  # "live" | "practice"
OANDA_BASE = {
    "live": "https://api-fxtrade.oanda.com/v3",
    "practice": "https://api-fxpractice.oanda.com/v3",
}[OANDA_ENV]
OANDA_CANDLE_CHUNK = 5000  # max candles per request
OANDA_SLEEP = 0.4  # seconds between pulls (rate-limit friendly)

# ---------------------------------------------------------------------------
# Data scope
# ---------------------------------------------------------------------------
# A-list: pairs that cleared n>=10 AND PF>=2.0 in the full backtest
# (see results/alist.csv). Full report regenerated via `python3 full_report.py`.
INSTRUMENTS = [
    "EUR_GBP", "AUD_CHF", "NZD_CAD", "EUR_NZD", "AUD_NZD",
    "CAD_JPY", "NZD_JPY", "GBP_NZD", "AUD_CAD", "XAU_USD",
    "BTC_USD", "USD_CHF", "EUR_CHF", "EUR_AUD", "EUR_USD",
    "GBP_AUD", "CHF_JPY",
]
# H4 = structure/bias, M15 = entries.
TIMEFRAMES = ["H4", "M15"]
START_DATE = dt.datetime(2023, 8, 16, tzinfo=dt.timezone.utc)

# ---------------------------------------------------------------------------
# SQLite cache
# ---------------------------------------------------------------------------
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "candles.sqlite")