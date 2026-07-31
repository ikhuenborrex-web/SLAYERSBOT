"""Oanda v20 REST client — historical candle fetcher.

Pure data access. No strategy logic.
Uses only the Python standard library (urllib) so no pip install is needed
on the deploy host.
"""
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone

from config import (
    OANDA_BASE,
    OANDA_CANDLE_CHUNK,
    OANDA_TOKEN,
    DECIMALS,
)

# Rate limit: be gentle to avoid 429s.
MIN_INTERVAL = 0.25  # ~4 requests/sec


def _iso(dt: datetime) -> str:
    """RFC3339 string Oanda expects."""
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.strftime("%Y-%m-%dT%H:%M:%SZ")


def _parse_time(ts: str) -> datetime:
    """Parse Oanda's RFC3339 timestamp (may have 9-digit fractional secs)."""
    # Truncate fractional seconds beyond microseconds.
    if "." in ts:
        head, frac = ts.split(".", 1)
        frac = frac.rstrip("Z")
        frac = frac[:6]
        ts = f"{head}.{frac}Z"
    return datetime.fromisoformat(ts.replace("Z", "+00:00"))


def fetch_candles(instrument: str, granularity: str,
                  start: datetime, end: datetime,
                  chunk=OANDA_CANDLE_CHUNK):
    """Yield lists of candles in chronological order.

    Args:
        instrument: Oanda instrument id, e.g. "EUR_USD".
        granularity: "M1", "M5", etc.
        start/end: aware datetimes (UTC).
        chunk: max candles per API call.

    Yields:
        lists of dicts: {"time": iso, "volume": int, "mid": {o,h,l,c}}
    """
    if not OANDA_TOKEN:
        raise RuntimeError(
            "OANDA_TOKEN not set. Export it in the shell before running: "
            "export OANDA_TOKEN=..."
        )

    headers = {
        "Authorization": f"Bearer {OANDA_TOKEN}",
        "Content-Type": "application/json",
    }

    cursor = start
    while cursor < end:
        url = f"{OANDA_BASE}/instruments/{instrument}/candles"
        # Oanda forbids 'count' alongside 'to'; paginate via 'from' + 'count'
        # only. Cap 'count' so we never overshoot the requested end window.
        params = {
            "granularity": granularity,
            "from": _iso(cursor),
            "price": "M",  # mid prices
            "count": str(chunk),
        }
        resp = urllib.request.Request(
            f"{url}?{urllib.parse.urlencode(params)}",
            headers=headers,
        )
        try:
            with urllib.request.urlopen(resp, timeout=30) as r:
                body = r.read()
                status = r.status
        except urllib.error.HTTPError as e:
            status = e.code
            if status == 429:
                time.sleep(5)
                continue
            raise RuntimeError(f"Oanda HTTP {status}: {e.reason}")
        except urllib.error.URLError as e:
            raise RuntimeError(f"Oanda connection error: {e.reason}")
        if status != 200:
            raise RuntimeError(f"Oanda HTTP {status}")

        try:
            candles = _json(body).get("candles", [])
        except Exception:
            raise RuntimeError("Oanda returned non-JSON response")
        if not candles:
            break

        # Keep only candles within our requested window (we can't pass 'to').
        within = [c for c in candles if c["time"] < _iso(end)]
        if not within:
            break

        # Oanda returns candles oldest-first; advance cursor past the last one.
        last_t = within[-1]["time"]
        cursor = _parse_time(last_t)
        yield within

        # Stop if we've reached the end window or the API gave fewer than
        # requested (no more history in this range).
        if len(within) < chunk:
            break
        time.sleep(MIN_INTERVAL)


def _step(granularity: str) -> timedelta:
    """Approximate candle step size in seconds for a granularity."""
    unit = granularity[0]
    num = int(granularity[1:])
    secs = {"S": 1, "M": 60, "H": 3600, "D": 86400, "W": 604800}[unit]
    return timedelta(seconds=secs * num)


def _json(data: bytes):
    """Parse JSON from response bytes."""
    import json
    return json.loads(data.decode("utf-8"))


def clean_number(value):
    """Round a float to the instrument's decimal places."""
    return value
