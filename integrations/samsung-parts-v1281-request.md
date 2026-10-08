# Verify Samsung original spare/accessory intake

Reconstruct v1.28.0, import 10 primary-source Samsung original article SKUs with GTIN, zero unverified exact-device relationships and no fabricated prices. Require full tests, reproducible bundles, source archive and SHA-verified patch; no direct main edits from this branch.

Preflight: print exact 36 existing SKUs for collision-free import.

Second-source preflight: prior SKU VCA-SAPF80/WA already catalogued; replaced with direct-source Pet Tool+ VCA-PTB95/AA. Repeat the release gate.

Third preflight: fix test parser delimiter; official Samsung product SKU import succeeded, retest combined app and checksum package.

Retest 4: importer + 10 original product checks already pass. Update two cross-brand article-total assertions (1930 -> 1940).

Retest 5: all cross-brand tests pass except Samsung physical-parts target expectation; adjusted 100 - 46 = 54.
