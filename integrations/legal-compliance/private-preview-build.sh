#!/usr/bin/env bash
# Rebuild a fully functional site locally in your private Codespace.
# Never deploy, never activate third-party credentials or change backend settings.
set -euo pipefail
cd "$(dirname "$0")/../.."

if [ ! -e site ]; then
  python3 integrations/restore-source-checkpoint.py --target site
fi
if [ ! -f site/package.json ]; then
  printf >&2 "ERROR: site/ exists but has no package.json. Refusing overwrite.\n"
  exit 1
fi

# The preview includes clear legal notices and keeps pilot passwords disabled
# on *.app.github.dev / *.github.io. Do not input real customer information.
python3 integrations/legal-compliance/hardening.py apply --site site
npm ci --prefix integrations/auth-sdk --ignore-scripts
node integrations/build-app.mjs
node integrations/build-app.mjs --check
npm test --prefix site
npm run check --prefix site

printf '\nPrivate preview READY. Open port 4173 in the Codespaces PORTS tab.\n'
printf 'Verify Port Visibility = Private (GitHub authentication required).\n'
printf 'Stop the Codespace when finished to conserve usage.\n'
