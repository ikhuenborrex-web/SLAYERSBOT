#!/usr/bin/env bash
# Render start command: run the SMC sidecar (keeps smc.sqlite warm) in the
# background, then start the Node bot in the foreground.
set -euo pipefail
cd "$(dirname "$0")"

if [ -n "${SMC_DB_PATH:-}" ]; then
  if mkdir -p "$(dirname "$SMC_DB_PATH")" 2>/dev/null; then
    export SMC_DB_PATH
    echo "sidecar: using SMC_DB_PATH=$SMC_DB_PATH"
  else
    # Directory not writable (e.g. no Render Disk mounted at /data yet).
    # Fall back to a writable location and export the SAME path so the bot
    # reads the identical DB file. History is lost on redeploy without a Disk.
    export SMC_DB_PATH="${HOME:-/tmp}/smc.sqlite"
    echo "WARNING: cannot create dir for SMC_DB_PATH — falling back to $SMC_DB_PATH (mount a Render Disk at /data to persist history)"
  fi
fi

# Sidecar needs numpy/pandas/smartmoneyconcepts. The postinstall hook in
# package.json pip-installs them at build time; fall back to a boot-time
# install if that didn't happen (e.g. build image lacked pip).
if command -v python3 >/dev/null 2>&1; then
  if ! python3 -c "import numpy, pandas, smartmoneyconcepts" >/dev/null 2>&1; then
    echo "sidecar: python deps missing — installing from requirements.txt..."
    (cd scalp_sidecar && python3 -m pip install -r requirements.txt >/dev/null 2>&1) || echo "WARNING: pip install failed — SMC scan DISABLED. Bot runs without SMC signals."
  fi
  if python3 -c "import numpy, pandas, smartmoneyconcepts" >/dev/null 2>&1; then
    (cd scalp_sidecar && exec python3 live_scan.py --every 60) &
    SIDECAR_PID=$!
    echo "sidecar started (pid $SIDECAR_PID)"
  else
    echo "WARNING: python deps unavailable — SMC live scan DISABLED. Bot runs without SMC signals."
  fi
else
  echo "WARNING: python3 not available on this host — SMC live scan DISABLED. Bot runs without SMC signals."
fi

# Resolve node: on Render it's on PATH; locally it may live elsewhere.
if ! command -v node >/dev/null 2>&1; then
  for NODE in "$HOME/.local/bin/node" /usr/local/bin/node /opt/render/project/node; do
    if [ -x "$NODE" ]; then export PATH="$(dirname "$NODE"):$PATH"; break; fi
  done
fi
exec node server.js
