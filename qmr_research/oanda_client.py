"""OANDA v20 REST client — historical candle fetcher for the QMR pipeline.

Pure data access. No strategy logic. Uses only the Python standard library
(urllib) so no pip install is needed.
"""
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone

from config import OANDA_BASE, OANDA_CANDLE_CHUNK, OANDA_TOKEN

MIN_INTERVAL = 0.25  # ~4 requests/sec to avoid 429s


def _iso(dt: datetime) -> str:
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.strftime("%Y-%m-%dT%H:%M:%SZ")


def _parse_time(ts: str) -> datetime:
    if "." in ts:
        head, frac = ts.split(".", 1)
        frac = frac.rstrip("Z")[:6]
        ts = f"{head}.{frac}Z"
    return datetime.fromisoformat(ts.replace("Z", "+00:00"))


def fetch_candles(instrument: str, granularity: str,
                  start: datetime, end: datetime,
                  chunk=OANDA_CANDLE_CHUNK):
    """Yield lists of candles in chronological order.

    Yields lists of dicts: {"time": iso, "volume": int, "mid": {o,h,l,c}}.
    """
    if not OANDA_TOKEN:
        raise RuntimeError(
            "OANDA_TOKEN not set. Add it to qmr_research/.env or export it: "
            "export OANDA_TOKEN=..."
        )

    headers = {
        "Authorization": f"Bearer {OANDA_TOKEN}",
        "Content-Type": "application/json",
    }

    cursor = start
    while cursor < end:
        url = f"{OANDA_BASE}/instruments/{instrument}/candles"
        params = {
            "granularity": granularity,
            "from": _iso(cursor),
            "price": "M",
            "count": str(chunk),
        }
        req = urllib.request.Request(
            f"{url}?{urllib.parse.urlencode(params)}", headers=headers)
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                body = r.read()
                status = r.status
        except urllib.error.HTTPError as e:
            status = e.code
            if status == 429:
                time.sleep(5)
                continue
            raise RuntimeError(f"OANDA HTTP {status}: {e.reason}")
        except urllib.error.URLError as e:
            raise RuntimeError(f"OANDA connection error: {e.reason}")
        if status != 200:
            raise RuntimeError(f"OANDA HTTP {status}")

        try:
            candles = json_load(body).get("candles", [])
        except Exception:
            raise RuntimeError("OANDA returned non-JSON response")
        if not candles:
            break

        within = [c for c in candles if c["time"] < _iso(end)]
        if not within:
            break

        last_t = within[-1]["time"]
        cursor = _parse_time(last_t)
        yield within

        if len(within) < chunk:
            break
        time.sleep(MIN_INTERVAL)


def json_load(data: bytes):
    import json
    return json.loads(data.decode("utf-8"))
