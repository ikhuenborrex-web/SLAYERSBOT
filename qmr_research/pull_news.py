"""Historical economic-calendar pull from the TradingView events endpoint.

Replicates exactly what the live server consumes in fetchNewsEvents (source 1:
economic-calendar.tradingview.com/events): events with importance>=1, with
country=(currency||country).toUpperCase() and the ISO date. The endpoint caps
each request at ~2000 rows, so we chunk by week over [START_DATE, END_DATE].

Writes data/news_events.csv: date,country,title,importance,impact.

Usage:  python3 pull_news.py
"""
import argparse
import csv
import json
import time
import urllib.request

import config

EVENTS_URL = "https://economic-calendar.tradingview.com/events"
CHUNK_DAYS = 7  # ~<1000 events/week, safely under the endpoint cap


def fetch(from_iso, to_iso):
    url = f"{EVENTS_URL}?from={from_iso}&to={to_iso}"
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Referer": "https://www.tradingview.com/",
        "Origin": "https://www.tradingview.com",
    })
    with urllib.request.urlopen(req, timeout=30) as r:
        data = json.load(r)
    return (data.get("result") or [])


def to_iso(dt):
    return dt.strftime("%Y-%m-%dT%H:%M:%S.000Z")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--start", default=config.START_DATE)
    ap.add_argument("--end", default=config.END_DATE)
    ap.add_argument("--out", default=f"{config.DATA_DIR}/news_events.csv")
    args = ap.parse_args()

    from datetime import datetime, timezone, timedelta
    start = datetime.fromisoformat(args.start).replace(tzinfo=timezone.utc)
    end = datetime.fromisoformat(args.end).replace(tzinfo=timezone.utc)

    rows = []
    cur = start
    while cur < end:
        nxt = min(cur + timedelta(days=CHUNK_DAYS), end)
        try:
            arr = fetch(to_iso(cur), to_iso(nxt))
        except Exception as e:
            print(f"  !! {cur.date()} .. {nxt.date()}: {type(e).__name__}: {e}")
            cur = nxt
            continue
        kept = 0
        for e in arr:
            imp = e.get("importance")
            if imp is None or imp < 1:
                continue
            rows.append({
                "date": e.get("date"),
                "country": (e.get("currency") or e.get("country") or "").upper(),
                "title": e.get("title") or "",
                "importance": imp,
                "impact": e.get("impact") or "",
            })
            kept += 1
        print(f"  {cur.date()} -> {nxt.date()}: {len(arr)} events, {kept} kept")
        cur = nxt
        time.sleep(0.4)

    with open(args.out, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["date", "country", "title", "importance", "impact"])
        w.writeheader()
        w.writerows(rows)

    from collections import Counter
    print(f"\nWrote {len(rows)} events to {args.out}")
    print("importance distribution:", dict(Counter(r["importance"] for r in rows)))
    print("country distribution (top 12):", dict(Counter(r["country"] for r in rows).most_common(12)))


if __name__ == "__main__":
    main()
