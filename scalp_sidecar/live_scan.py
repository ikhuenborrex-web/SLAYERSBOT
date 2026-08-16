"""Live SMC swing scanner sidecar for the Slayers Bot SMC module.

Keeps `smc.sqlite` warm with current H4 + M15 candles for the A-list pairs
and a `smc_signals` table of freshly-confirmed SMC setups (liquidity sweep
-> CHoCH -> pullback to zone -> confirmation candle), detected with the same
backtest-proven engine (signals.detect / signals.sequence with main.DEFAULTS).

The bot reads candles + signals from smc.sqlite via node:sqlite.

Usage:
    python3 live_scan.py              # loop: sync + scan every 60s
    python3 live_scan.py --once       # single sync + scan, then exit
    python3 live_scan.py --dry        # single scan, print fresh signals, no DB writes
    python3 live_scan.py --every 120  # loop interval (seconds)
"""
import os
import sys
import time
from datetime import datetime, timedelta, timezone

import config
import data_store
import oanda_client
import signals as signals_mod
from main import DEFAULTS

# Rolling-window sizes for live detection.  The backtest uses full history;
# live uses a trailing window that still covers lq_window + zone_window and a
# few weeks of structure, so every scan is fast (~0.3s/pair).
H4_WINDOW = 800
M15_WINDOW = 3000
# A signal is "fresh" (worth emitting) if it confirmed within FRESH_HOURS of
# now (wall clock). Time-based, not bar-based, so a setup that confirms right
# before the close or a weekend still gets emitted when the bot next scans.
# Node dedupes on (instrument, conf_time), so a re-scan never re-fires.
FRESH_HOURS = 36
# Store the trailing M15 window in smc.sqlite so the bot can walk exits like
# it walks scalp candles today.
CANDLE_WINDOW = 3000
REFRESH_SEC = int(sys.argv[sys.argv.index("--every") + 1]) \
    if "--every" in sys.argv else 60

HERE = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.environ.get("SMC_DB_PATH", os.path.join(HERE, "data", "smc.sqlite"))


_SCHEMA = """
CREATE TABLE IF NOT EXISTS candles (
    instrument  TEXT NOT NULL,
    granularity TEXT NOT NULL,
    time        TEXT NOT NULL,   -- UTC ISO, e.g. 2026-08-14T20:45:00.000000000Z
    open REAL, high REAL, low REAL, close REAL, volume INTEGER,
    PRIMARY KEY (instrument, granularity, time)
);
CREATE TABLE IF NOT EXISTS smc_signals (
    instrument     TEXT NOT NULL,
    conf_time      TEXT NOT NULL,   -- M15 candle time of the confirmation bar
    side           INTEGER NOT NULL, -- +1 LONG / -1 SHORT
    entry          REAL NOT NULL,
    sl             REAL NOT NULL,
    tp             REAL NOT NULL,    -- final target (pool / min_rr)
    tp1            REAL NOT NULL,    -- partial target (+1.0R entry-level)
    risk           REAL NOT NULL,
    atr14          REAL NOT NULL,
    sweep_time     TEXT,
    sweep_extreme  REAL,
    pool_level     REAL,
    choch_time     TEXT,
    choch_level    REAL,
    zone_time      TEXT,
    zone_top       REAL,
    zone_bott      REAL,
    detected_at    TEXT NOT NULL,
    PRIMARY KEY (instrument, conf_time)
);
CREATE INDEX IF NOT EXISTS idx_smc_sig_time ON smc_signals (conf_time);
"""


def connect():
    import sqlite3
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    con.executescript(_SCHEMA)
    return con


def sync_all():
    """Update the raw candle cache (data/candles.sqlite) to the present so the
    latest rolling window contains the newest closed M15 bar."""
    import sqlite3
    con = sqlite3.connect(config.DB_PATH)
    for instrument in config.INSTRUMENTS:
        for gran in config.TIMEFRAMES:
            row = con.execute(
                "SELECT MAX(time) AS t FROM candles "
                "WHERE instrument=? AND granularity=?",
                (instrument, gran)).fetchone()
            last = row[0] if row else None
            if last is None:
                continue
            start = oanda_client.parse_time(last)
            try:
                rows = oanda_client.pull_candles(instrument, gran, start)
            except oanda_client.OandaError as e:
                print(f"  {instrument} {gran}: sync skipped ({e})")
                continue
            data_store.save(instrument, gran, rows)
            print(f"  synced {instrument} {gran}: +{len(rows)} candles")
            time.sleep(0.2)
    con.close()
    print("sync_all: cache current")


def scan(conn, dry=False):
    """Run the SMC engine over the trailing window for every A-list pair and
    persist (or print) any freshly-confirmed signals."""
    fresh = []
    for instrument in config.INSTRUMENTS:
        h4 = data_store.load(instrument, "H4")[-H4_WINDOW:]
        m15 = data_store.load(instrument, "M15")[-M15_WINDOW:]
        if len(h4) < 400 or len(m15) < 2000:
            continue
        try:
            det = signals_mod.detect(DEFAULTS, h4, m15)
            seq = signals_mod.sequence(det, DEFAULTS)
        except Exception as e:
            print(f"  {instrument}: detect failed ({e})")
            continue
        latest = len(m15) - 1
        cutoff = datetime.now(timezone.utc) - timedelta(hours=FRESH_HOURS)
        # helper: H4-sourced bars are in H4 time — we filter on the M15 row timestamps
        def _is_fresh(sig, bars):
            t = oanda_client.parse_time(bars[sig.conf_bar]["time"])
            return t >= cutoff

        for s in seq["signals"]:
            if s.conf_bar > latest:
                continue
            if not _is_fresh(s, m15):
                continue
            row = signal_row(instrument, s, m15)
            if dry:
                fresh.append(row)
                continue
            try:
                conn.execute(
                    """INSERT OR IGNORE INTO smc_signals
                       (instrument, conf_time, side, entry, sl, tp, tp1, risk,
                        atr14, sweep_time, sweep_extreme, pool_level, choch_time,
                        choch_level, zone_time, zone_top, zone_bott, detected_at)
                       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                    tuple(row.values()))
                conn.commit()
            except Exception as e:
                print(f"  {instrument}: insert failed ({e})")
            fresh.append(row)
    # Mirror trailing M15 candles for the bot's exit walking
    if not dry:
        mirror_m15(conn)
    return fresh


def signal_row(instrument, s, m15):
    return {
        "instrument": instrument,
        "conf_time": m15[s.conf_bar]["time"],
        "side": int(s.side),
        "entry": s.entry,
        "sl": s.sl,
        "tp": s.tp,
        "tp1": s.tp1,
        "risk": s.risk,
        "atr14": s.atr14,
        "sweep_time": m15[s.sweep_bar]["time"],
        "sweep_extreme": s.sweep_extreme,
        "pool_level": s.pool_level,
        "choch_time": m15[s.choch_bar]["time"],
        "choch_level": s.choch_level,
        "zone_time": m15[s.zone_bar]["time"],
        "zone_top": s.zone_top,
        "zone_bott": s.zone_bott,
        "detected_at": datetime.now(timezone.utc).isoformat(),
    }


def mirror_m15(conn):
    """Copy the trailing M15 window from the raw cache into smc.sqlite so the
    bot can walk candles after a signal the same way it walks scalp M5s."""
    for instrument in config.INSTRUMENTS:
        rows = data_store.load(instrument, "M15")[-CANDLE_WINDOW:]
        conn.executemany(
            """INSERT OR REPLACE INTO candles
               (instrument, granularity, time, open, high, low, close, volume)
               VALUES (?,?,?,?,?,?,?,?)""",
            [(instrument, "M15", r["time"], r["open"], r["high"], r["low"],
              r["close"], r["volume"]) for r in rows])
    conn.commit()


def once(dry=False):
    conn = connect()
    if not dry:
        sync_all()
    fresh = scan(conn, dry=dry)
    if dry:
        print(f"\nFRESH SIGNALS ({len(fresh)}):")
        for r in fresh:
            print(f"  {r['instrument']} {'LONG' if r['side'] > 0 else 'SHORT'} "
                  f"conf={r['conf_time']} entry={r['entry']:.5f} "
                  f"sl={r['sl']:.5f} tp={r['tp']:.5f} risk={r['risk']:.5f}")
    else:
        print(f"scan done — {len(fresh)} fresh signal(s)")


def loop():
    conn = connect()
    print(f"live_scan loop every {REFRESH_SEC}s for {config.INSTRUMENTS} "
          f"(hit Ctrl-C to stop)")
    while True:
        t0 = time.time()
        try:
            sync_all()
            fresh = scan(conn)
            if fresh:
                for r in fresh:
                    print(f"  {time.strftime('%H:%M:%S')} "
                          f"{r['instrument']} {'LONG' if r['side'] > 0 else 'SHORT'} "
                          f"conf={r['conf_time']}")
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
    if "--dry" in sys.argv:
        once(dry=True)
    elif "--once" in sys.argv:
        once()
    else:
        loop()