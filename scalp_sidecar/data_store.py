"""SQLite candle cache — one row per (instrument, granularity, time).

Lets us pull once and re-run backtests without hitting Oanda again.
"""
import os
import sqlite3

import config


def _connect():
    os.makedirs(os.path.dirname(config.DB_PATH), exist_ok=True)
    con = sqlite3.connect(config.DB_PATH)
    con.execute(
        """CREATE TABLE IF NOT EXISTS candles(
            instrument TEXT NOT NULL,
            granularity TEXT NOT NULL,
            time TEXT NOT NULL,
            open REAL, high REAL, low REAL, close REAL, volume INTEGER,
            PRIMARY KEY(instrument, granularity, time)
        )"""
    )
    return con


def save(instrument, granularity, rows):
    con = _connect()
    con.executemany(
        "INSERT OR REPLACE INTO candles VALUES (?,?,?,?,?,?,?,?)",
        [
            (instrument, granularity, r["time"], r["open"], r["high"], r["low"], r["close"], r["volume"])
            for r in rows
        ],
    )
    con.commit()
    con.close()


def has(instrument, granularity, min_rows=1000):
    con = _connect()
    cur = con.execute(
        "SELECT COUNT(*) FROM candles WHERE instrument=? AND granularity=?", (instrument, granularity)
    )
    n = cur.fetchone()[0]
    con.close()
    return n >= min_rows


def load(instrument, granularity):
    con = _connect()
    cur = con.execute(
        "SELECT time, open, high, low, close, volume FROM candles "
        "WHERE instrument=? AND granularity=? ORDER BY time ASC",
        (instrument, granularity),
    )
    rows = cur.fetchall()
    con.close()
    return [
        {"time": r[0], "open": r[1], "high": r[2], "low": r[3], "close": r[4], "volume": r[5]}
        for r in rows
    ]