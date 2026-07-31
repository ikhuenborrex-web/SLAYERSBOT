#!/usr/bin/env bash
# Render start command: run the Oanda sidecar (keeps scalps.sqlite warm) in the
# background, then start the Node bot in the foreground.
set -euo pipefail
cd "$(dirname "$0")"

if [ -n "${SCALP_DB_PATH:-}" ]; then
  export SCALP_DB_PATH
  mkdir -p "$(dirname "$SCALP_DB_PATH")"
  echo "sidecar: using SCALP_DB_PATH=$SCALP_DB_PATH"
fi

# Install the single Python dep if missing (Render images may not ship it).
if command -v python3 >/dev/null 2>&1; then
  python3 -c "import requests" 2>/dev/null || pip3 install -r scalp_sidecar/requirements.txt --quiet
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
