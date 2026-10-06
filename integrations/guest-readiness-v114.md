# v1.14 – guest reliability and backup release

Implemented 2026-10-06. Scope remains Miele vacuum cleaners: 57 model names, 62 material-number variants, nine family fallbacks and 167 unique parts/accessories. No new compatibility, source prices, provider access, paid service or production account was created.

## Behavior

- Corrupt JSON, wrong storage shapes, null rows and duplicate cart keys no longer crash guest workflows. A failed browser write retains a temporary current-tab copy; the UI warns to export before closing/reloading. This is not durable cloud storage.
- Quantities are whole numbers from 1 to 999; zero/removal still works. Smart Stock bounds malformed negative/excessive values and keeps defaults for absent/null inputs.
- Part text search accepts words in either order; exact material/EAN queries accept formatting and do not become broad digit-token matches. Known-part handoff links are regenerated from canonical identifiers.
- Price age distinguishes under 24 hours, older, invalid, future and reference records. Variant-check prices remain excluded from confirmed totals. Source snapshots still date from 2026-10-06; this release does not refresh them.
- The new `#backup` page exports local devices, user notes/serial numbers, history, maintenance, cart and search preferences to JSON. Auth sessions/passwords are not included. Both schema 2 and the new schema 3 are accepted. Maximum file size is 1 MiB; export also checks the limit.
- Restore first previews counts, date and skipped/open-price records. Only an explicit second confirmation replaces local data. Import is local, not a server upload. Known-device/part boundaries are checked. Unknown entries are skipped. Exact canonical source-price fields are required to retain a quote; altered/unsupported prices remain open, and restore cannot renew the retrieval timestamp. Multiple storage writes are not atomic; a blocked write uses the temporary-data warning.
- Camera streams are stopped when playback fails. Late barcode detection, photo/OCR results and product lookup results cannot repaint a departed screen. Physical camera and OCR recognition accuracy are not claimed by the synthetic lifecycle tests.

## Download and updates

`index.html` loads `app-v1.14.0.js` (783,144 bytes) and `styles.css?v=1.14.0`. An older service worker cannot substitute cached v1.13 module files for the new entry. Sources remain available for development/tests; their presence on the host does not cause a normal visitor to download them.

Nine unique core offline assets total **835,352 bytes**, compared with **1,033,667 bytes** in v1.13, a **19.2% reduction**. Summed gzip estimates are 167,676 bytes; actual transferred bytes depend on hosting compression, cache and requests. The entire site directory is about 1.93 MB including source/test files and the bundle. Manufacturer photos and optional external OCR engine/language files are outside these core figures. PDFs open through source links.

Rebuild with `npm ci --prefix integrations/auth-sdk --ignore-scripts`, then `node integrations/build-app.mjs`. `--check` requires the committed reconstructed bundle to match byte-for-byte. The existing lock pins esbuild 0.25.12; no new dependency subscription is required.

## Validation

All 18 app suites and syntax checks passed locally. Additional regressions cover malformed local data, blocked-storage fallback, quantity bounds, exact-code/text search, backup round trips, forged/open/stale prices, HX2/HX3 boundaries, old backups, credential-field exclusion, cancelled scanner detection and simulated offline navigation. The offline test checks versioned assets, cache removal and exclusion of cross-origin Auth/API responses.

Provider, endpoint, quota and generated Edge smoke tests passed with synthetic responses. These do not establish a real merchant feed or a successful production-account login. GitHub Pages runs the same tests plus a reproducible bundle check before deployment. Public browser QA is performed after deployment; physical mobile-device/camera testing remains separate.

## Remaining external dependencies

The public marketplace backend remains version 2 on the existing Free project. Live eBay/Amazon calls are disabled; official search links remain available. A real pilot account and authorized access are still needed for a positive protected-search test. Public signup/mail delivery and device sync are not ready.

The separate private pilot-permission proposal in PR #3 remains unmerged. Its schema/RLS/grants were not installed because automatic approval rejected the persistent permission change for lack of specific authorization. This guest release neither retries that operation nor changes database permissions. Checkout remains separate merchant orders and payment at each merchant.
