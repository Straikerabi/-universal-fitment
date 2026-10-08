#!/usr/bin/env bash
# Starts and verifies an HTTP preview inside the current personal Codespace.
# GitHub forwarding of port 4173 must stay PRIVATE (not Public).
set -euo pipefail
cd "$(dirname "$0")/../.."

if [ ! -f site/index.html ]; then
  printf >&2 "Preview HTML missing; rebuilding before serving.\n"
  bash integrations/legal-compliance/private-preview-build.sh
fi
if [ ! -f site/index.html ]; then
  printf >&2 "ERROR: preview could not be built; site/index.html is still missing.\n"
  exit 1
fi

url=http://127.0.0.1:4173/index.html
if curl --fail --silent --show-error --max-time 3 --output /dev/null "$url" 2>/dev/null; then
  printf 'Universal Fitment preview is already running on port 4173.\n'
  exit 0
fi

# Avoid an unreported 502 caused by a failed/backgrounded server.
nohup python3 -u -m http.server 4173 --bind 0.0.0.0 --directory site > /tmp/uf-private-preview.log 2>&1 < /dev/null &
pid=$!
printf 'Waiting for private preview HTTP server (PID %s) on port 4173...\n' "$pid"
for attempt in $(seq 1 20); do
  if curl --fail --silent --show-error --max-time 2 --output /dev/null "$url" 2>/dev/null; then
    printf 'READY: Universal Fitment preview HTTP 200 on port 4173.\n'
    printf 'Codespaces > PORTS > 4173 > Port Visibility must be PRIVATE.\n'
    exit 0
  fi
  if ! kill -0 "$pid" 2>/dev/null; then
    printf >&2 'ERROR: preview server stopped unexpectedly. Log output:\n'
    tail -n 30 /tmp/uf-private-preview.log >&2 || true
    exit 1
  fi
  sleep 1
done
printf >&2 'ERROR: preview server did not answer in time. Log output:\n'
tail -n 30 /tmp/uf-private-preview.log >&2 || true
exit 1
