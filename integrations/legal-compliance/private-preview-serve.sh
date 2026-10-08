#!/usr/bin/env bash
# Starts an HTTP server only inside the personal Codespace.
# Codespaces HTTPS port forwarding MUST remain set to Private.
set -euo pipefail
cd "$(dirname "$0")/../.."

if [ ! -f site/index.html ]; then
  printf >&2 "Site not built. Run: bash integrations/legal-compliance/private-preview-build.sh\n"
  exit 1
fi

if command -v curl >/dev/null && curl -fsS --max-time 2 -o /dev/null http://127.0.0.1:4173/index.html; then
  printf 'Existing private preview server is already responding on 4173.\n'
  exit 0
fi

nohup python3 -m http.server 4173 --bind 0.0.0.0 --directory site > /tmp/uf-private-preview.log 2>&1 < /dev/null &
printf 'Universal Fitment preview server PID %s; port 4173.\n' "$!"
printf 'IMPORTANT: Codespaces > PORTS > 4173 > Port Visibility > Private.\n'
