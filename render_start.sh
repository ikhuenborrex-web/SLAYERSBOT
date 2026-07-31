#!/usr/bin/env bash
# Render start command: run the Oanda sidecar (keeps scalps.sqlite warm) in the
# background, then start the Node bot in the foreground.
set -euo pipefail
cd "$(dirname "$0")"

if [ -n "${SCALP_DB_PATH:-}" ]; then
  if mkdir -p "$(dirname "$SCALP_DB_PATH")" 2>/dev/null; then
    export SCALP_DB_PATH
    echo "sidecar: using SCALP_DB_PATH=$SCALP_DB_PATH"
  else
    # Directory not writable (e.g. no Render Disk mounted at /data yet).
    # Fall back to a writable location and export the SAME path so the bot
    # reads the identical DB file. History is lost on redeploy without a Disk.
    export SCALP_DB_PATH="${HOME:-/tmp}/scalps.sqlite"
    echo "WARNING: cannot create dir for SCALP_DB_PATH — falling back to $SCALP_DB_PATH (mount a Render Disk at /data to persist history)"
  fi
fi

# Sidecar uses only the Python standard library (urllib) — no pip install needed.
if command -v python3 >/dev/null 2>&1; then
  (cd scalp_sidecar && exec python3 live_feed.py --every 60) &
  SIDECAR_PID=$!
  echo "sidecar started (pid $SIDECAR_PID)"
else
  echo "WARNING: python3 not available on this host — scalp live feed DISABLED. Bot runs without scalp data."
fi

# Resolve node: on Render it's on PATH; locally it may live elsewhere.
if ! command -v node >/dev/null 2>&1; then
  for NODE in "$HOME/.local/bin/node" /usr/local/bin/node /opt/render/project/node; do
    if [ -x "$NODE" ]; then export PATH="$(dirname "$NODE"):$PATH"; break; fi
  done
fi
exec node server.js
