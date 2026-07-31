"""SQLite storage for the scalp research dataset.

Tables:
  candles      — raw OHLCV per instrument/granularity, tagged with session
                 and EST timestamp.
  daily_stats  — per-instrument per-day aggregates (ATR14, opening range,
                 NY session high/low, news flag).
"""
import sqlite3

from config import DB_PATH

SCHEMA = """
CREATE TABLE IF NOT EXISTS candles (
    instrument  TEXT NOT NULL,
    granularity TEXT NOT NULL,
    ts          TEXT NOT NULL,        -- UTC ISO, e.g. 2026-01-05T14:35:00Z
    open        REAL, high REAL, low REAL, close REAL,
    volume      INTEGER,
    est         TEXT NOT NULL,        -- local (America/New_York) ISO
    session     TEXT NOT NULL,        -- ASIA | LONDON | NY | CLOSED
    PRIMARY KEY (instrument, granularity, ts)
);
CREATE INDEX IF NOT EXISTS idx_candles_sess ON candles (instrument, granularity, est);

CREATE TABLE IF NOT EXISTS daily_stats (
    instrument      TEXT NOT NULL,
    day             TEXT NOT NULL,    -- 'YYYY-MM-DD' in America/New_York
    atr14           REAL,
    open_range_high REAL,
    open_range_low  REAL,
    open_range_min  INTEGER,
    ny_high         REAL,
    ny_low          REAL,
    news_day        TEXT,             -- NULL | NFP | CPI | FOMC | (combos)
    PRIMARY KEY (instrument, day)
);

-- Live daily ATR for the NY-open module: Wilder ATR(14) over daily bars
-- built from M5 candles, valued at the day's OPEN (no lookahead). Populated
-- by the sidecar (live_feed.py); read by the bot.
CREATE TABLE IF NOT EXISTS daily_atr (
    instrument TEXT NOT NULL,
    day        TEXT NOT NULL,         -- 'YYYY-MM-DD' in America/New_York
    atr14      REAL NOT NULL,
    PRIMARY KEY (instrument, day)
);
"""


def connect():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.executescript(SCHEMA)
    return conn


def upsert_candle(conn, instrument, gran, row):
    conn.execute(
        """INSERT OR REPLACE INTO candles
           (instrument, granularity, ts, open, high, low, close, volume, est, session)
           VALUES (?,?,?,?,?,?,?,?,?,?)""",
        (instrument, gran, row["ts"], row["open"], row["high"],
         row["low"], row["close"], row["volume"], row["est"], row["session"]),
    )


def upsert_many_candles(conn, instrument, gran, rows):
    conn.executemany(
        """INSERT OR REPLACE INTO candles
           (instrument, granularity, ts, open, high, low, close, volume, est, session)
           VALUES (?,?,?,?,?,?,?,?,?,?)""",
        [(instrument, gran, r["ts"], r["open"], r["high"], r["low"],
          r["close"], r["volume"], r["est"], r["session"]) for r in rows],
    )


def upsert_daily(conn, instrument, d):
    conn.execute(
        """INSERT OR REPLACE INTO daily_stats
           (instrument, day, atr14, open_range_high, open_range_low,
            open_range_min, ny_high, ny_low, news_day)
           VALUES (?,?,?,?,?,?,?,?,?)""",
        (instrument, d["day"], d["atr14"], d["open_range_high"],
         d["open_range_low"], d["open_range_min"], d["ny_high"], d["ny_low"],
         d["news_day"]),
    )


def upsert_daily_atr(conn, instrument, day, atr14):
    conn.execute(
        "INSERT OR REPLACE INTO daily_atr (instrument, day, atr14) VALUES (?,?,?)",
        (instrument, day, atr14),
    )


def candles_for(conn, instrument, gran, est_day):
    """All candles for one local trading day, sorted ascending."""
    day_start = est_day + "T00:00:00"
    day_end = est_day + "T23:59:59"
    cur = conn.execute(
        """SELECT * FROM candles
           WHERE instrument=? AND granularity=? AND est BETWEEN ? AND ?
           ORDER BY ts ASC""",
        (instrument, gran, day_start, day_end),
    )
    return [dict(r) for r in cur.fetchall()]


def distinct_days(conn, instrument, gran):
    cur = conn.execute(
        """SELECT DISTINCT substr(est,1,10) AS d FROM candles
           WHERE instrument=? AND granularity=?
           ORDER BY d ASC""",
        (instrument, gran),
    )
    return [r["d"] for r in cur.fetchall()]


def summary_counts(conn):
    cur = conn.execute("SELECT instrument, granularity, COUNT(*) n FROM candles GROUP BY instrument, granularity")
    return [dict(r) for r in cur.fetchall()]
