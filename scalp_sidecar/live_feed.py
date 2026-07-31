"""Live Oanda M5 feed + daily ATR sidecar for the Slayers Bot NY-open module.

Keeps scalps.sqlite warm with current M5 candles for the module pairs and
maintains the `daily_atr` table: Wilder ATR(14) over daily bars built from
M5 candles, valued at each day's OPEN (no lookahead) — byte-for-byte the
same semantics as phase3_replay.daily_atr_map, so live ATR is guaranteed to
match the backtest.

The bot reads candles + daily_atr from scalps.sqlite via node:sqlite.

Usage:
    python3 live_feed.py            # loop: fetch + refresh ATR every 60s
    python3 live_feed.py --once     # single fetch + ATR refresh, then exit
    python3 live_feed.py --atr-only # only rebuild daily_atr (no Oanda fetch)
"""
import sys
import time
from datetime import datetime, timedelta, timezone

from zoneinfo import ZoneInfo

import db
from clean import tag_candle
from config import INSTRUMENTS, TZ
from oanda_client import fetch_candles

PAIRS = ["US30", "NAS100"]          # must match phase3_trade.PAIRS
GRAN = "M5"
REFETCH_DAYS = 3                    # refetch this many days back each cycle
BOOTSTRAP_DAYS = 45                 # history needed for daily ATR14 warm-up
MIN_BARS_FOR_ATR = 15               # daily bars required before ATR is usable
REFRESH_SEC = int(sys.argv[sys.argv.index("--every") + 1]) \
    if "--every" in sys.argv else 60


def ny_today() -> str:
    return datetime.now(ZoneInfo(TZ)).strftime("%Y-%m-%d")


def _daily_bars(conn, inst) -> int:
    return conn.execute(
        "SELECT COUNT(DISTINCT substr(est,1,10)) AS n FROM candles "
        "WHERE instrument=? AND granularity=?", (inst, GRAN)).fetchone()["n"]


def fetch_pair(conn, inst, days=REFETCH_DAYS):
    """Fetch M5 candles for inst from (now - days) to now. Idempotent."""
    symbol = INSTRUMENTS[inst]
    end = datetime.now(timezone.utc).replace(microsecond=0)
    start = end - timedelta(days=days)
    total = 0
    for chunk in fetch_candles(symbol, GRAN, start, end):
        rows = [tag_candle(c["time"], c["mid"]["o"], c["mid"]["h"],
                           c["mid"]["l"], c["mid"]["c"], c.get("volume", 0))
                for c in chunk]
        db.upsert_many_candles(conn, inst, GRAN, rows)
        total += len(rows)
    conn.commit()
    return total


def refresh_atr(conn, inst):
    """Rebuild daily_atr for inst using the exact phase3_replay method."""
    from phase3_replay import daily_atr_map
    atr_map = daily_atr_map(inst)
    n = 0
    for day, atr14 in atr_map.items():
        db.upsert_daily_atr(conn, inst, day, atr14)
        n += 1
    today = ny_today()
    if today not in atr_map:
        row = conn.execute(
            "SELECT day, atr14 FROM daily_atr WHERE instrument=? "
            "ORDER BY day DESC LIMIT 1", (inst,)).fetchone()
        if row:
            db.upsert_daily_atr(conn, inst, today, row["atr14"])
            n += 1
    conn.commit()
    return n


def once():
    conn = db.connect()
    for inst in PAIRS:
        try:
            if _daily_bars(conn, inst) < MIN_BARS_FOR_ATR:
                n = fetch_pair(conn, inst, days=BOOTSTRAP_DAYS)
                print(f"{inst}: bootstrap fetch {n} M5 candles ({BOOTSTRAP_DAYS}d)")
            else:
                n = fetch_pair(conn, inst)
                print(f"{inst}: fetched {n} M5 candles")
        except RuntimeError as e:
            print(f"{inst}: fetch skipped ({e})")
        na = refresh_atr(conn, inst)
        print(f"{inst}: daily_atr rows -> {na}")


def loop():
    conn = db.connect()
    print(f"live_feed loop every {REFRESH_SEC}s for {PAIRS} (hit Ctrl-C to stop)")
    while True:
        t0 = time.time()
        try:
            for inst in PAIRS:
                try:
                    if _daily_bars(conn, inst) < MIN_BARS_FOR_ATR:
                        n = fetch_pair(conn, inst, days=BOOTSTRAP_DAYS)
                    else:
                        n = fetch_pair(conn, inst)
                except RuntimeError as e:
                    n = 0
                    print(f"{inst}: fetch skipped ({e})")
                refresh_atr(conn, inst)
                if n:
                    print(f"{time.strftime('%H:%M:%S')} {inst}: +{n} candles")
        except KeyboardInterrupt:
            break
        except Exception as e:
            print(f"cycle error: {e}")
        dt = REFRESH_SEC - (time.time() - t0)
        if dt > 0:
            try:
                time.sleep(dt)
            except KeyboardInterrupt:
                break


if __name__ == "__main__":
    if "--atr-only" in sys.argv:
        c = db.connect()
        for p in PAIRS:
            print(f"{p}: daily_atr rows -> {refresh_atr(c, p)}")
    elif "--once" in sys.argv:
        once()
    else:
        loop()
