"""Candle cleaning + session tagging.

Pure data prep — produces no tradeable output (Phase 1 gate).
"""
from datetime import datetime, timezone

from zoneinfo import ZoneInfo

from config import TZ, SESSION_BOUNDS

_LOCAL = ZoneInfo(TZ)


def parse_ts(ts_iso: str) -> datetime:
    """Parse Oanda's RFC3339 timestamp (may have 9-digit fractional secs)."""
    if "." in ts_iso:
        head, frac = ts_iso.split(".", 1)
        frac = frac.rstrip("Z")[:6]
        ts_iso = f"{head}.{frac}Z"
    return datetime.fromisoformat(ts_iso.replace("Z", "+00:00"))


def est_time(ts_iso: str) -> datetime:
    """UTC ISO string -> aware datetime in America/New_York."""
    return parse_ts(ts_iso).astimezone(_LOCAL)


def tag_session(local_dt: datetime) -> str:
    """Tag a candle by its local (America/New_York) hour."""
    h = local_dt.hour
    for start, end, name in SESSION_BOUNDS:
        if start <= h < end:
            return name
    return "CLOSED"


def tag_candle(ts_iso: str, o, h, l, c, vol):
    """Return a cleaned candle dict with est + session fields."""
    local = est_time(ts_iso)
    return {
        "ts": ts_iso,
        "open": float(o),
        "high": float(h),
        "low": float(l),
        "close": float(c),
        "volume": int(vol or 0),
        "est": local.strftime("%Y-%m-%dT%H:%M:%S"),
        "session": tag_session(local),
    }
