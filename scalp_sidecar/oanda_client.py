"""Oanda v20 candle puller with backwards pagination.

Reads historical candles for (instrument, granularity) in blocks of up to
5000, walking backwards in time towards START_DATE, and returns them in
oldest->newest order. Rate-limit friendly: sleeps between requests and
backs off on HTTP 429.
"""
import json
import socket
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone

import config


class OandaError(Exception):
    pass


def parse_time(s):
    """Parse an Oanda nanosecond ISO time with py3.9's fromisoformat."""
    s = s.replace("Z", "+00:00")
    if "." in s:
        head, _, frac = s.partition(".")
        s = head + "." + frac[:6] + "+00:00"
    return datetime.fromisoformat(s)


def _parse_time(s):
    return parse_time(s)


def _get(path, params, retries=6):
    url = config.OANDA_BASE + path
    if params:
        url += "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"Authorization": "Bearer " + config.OANDA_TOKEN})
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=90) as r:
                return json.loads(r.read().decode())
        except (urllib.error.HTTPError, urllib.error.URLError, socket.timeout, TimeoutError) as e:
            if isinstance(e, urllib.error.HTTPError):
                if e.code == 429:  # rate limited
                    time.sleep(5 + attempt * 5)
                    continue
                if e.code == 404:
                    raise OandaError(f"GET {path} -> 404 (instrument/timeframe not available)")
                if e.code >= 500:
                    time.sleep(3)
                    continue
                raise OandaError(f"GET {path} -> HTTP {e.code}: {e.read().decode()[:300]}")
            # network / socket timeout / transient TLS drop
            time.sleep(3 + attempt * 3)
            continue
    raise OandaError(f"GET {path} failed after {retries} retries")


def pull_candles(instrument, granularity, start, end=None, price="M"):
    """Return oldest->newest list of {time, open, high, low, close, volume}.

    Walks backwards in blocks of `count` ending before `to` each round;
    stops once the earliest retrieved candle is older than `start`.
    """
    if end is None:
        end = datetime.now(timezone.utc)
    chunk = config.OANDA_CANDLE_CHUNK
    to = end.strftime("%Y-%m-%dT%H:%M:%SZ")
    out = []
    while True:
        data = _get(
            f"/instruments/{instrument}/candles",
            {"granularity": granularity, "count": chunk, "to": to, "price": price},
        )
        batch = [c for c in data.get("candles", []) if c.get("complete", True)]
        if not batch:
            break
        rows = [
            {
                "time": c["time"],
                "open": float(c["mid"]["o"]),
                "high": float(c["mid"]["h"]),
                "low": float(c["mid"]["l"]),
                "close": float(c["mid"]["c"]),
                "volume": int(c.get("volume", 0)),
            }
            for c in batch
        ]
        rows.sort(key=lambda r: r["time"])
        out = rows + out
        first_t = _parse_time(out[0]["time"])
        if first_t <= start:
            break
        to = (first_t - timedelta(seconds=1)).strftime("%Y-%m-%dT%H:%M:%SZ")
        time.sleep(config.OANDA_SLEEP)
        # Safety valve: if Oanda returned fewer than a full chunk, we've hit
        # the account's history limit for this instrument.
        if len(batch) < chunk and first_t <= start + timedelta(days=1):
            break

    # Prune anything older than the requested start
    out = [r for r in out if _parse_time(r["time"]) >= start]
    return out