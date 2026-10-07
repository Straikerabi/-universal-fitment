# v1.22 catalog recovery checkpoint

Status: implementation prepared and locally exercised; NOT published. Public main remains v1.21.2 at 04cace23a344c1425cb2ed4307a0b3798c50f384. Local execution stopped responding while finishing the article pass and release packaging. This branch is a recovery note, not a complete release.

## Prepared content

- 139 Philips model stems from the published German Philips household sitemap and actual German Home.ID model-support pages. 137 direct DFU/user manuals; 268 observed /xx/R references grouped as aliases. All verified metadata have the de-DE locale. One explicitly named 8000 Series cordless-stick vacuum (XC8043) has an unmapped manufacturer category; seven legacy floor vacuums keep their unknown bag system.
- 101 Siemens VS model stems: union of 23 German marketing pages and 92 named historical support/BOM records. Two unnamed records (VSM120B and VSZ3XTRMCH) are excluded. 83 models with direct IU device manuals, 10 positive dated EUR device-shop prices; unknown prices remain explicit.
- Existing catalog baseline: 418 model labels, 429 references, 763 unique parts across Miele, Bosch, Dyson, AEG and Rowenta. New model total: 658 labels, 669 references, seven active brands and 549/1000 capped target slots. This is not a German bestseller ranking or full parts coverage.
- Latest generated local development snapshot had 464 named Siemens articles, 244 positive article prices and five Philips articles. The 1008-observed-Siemens-article source pass was still running at the last confirmed progress (800 checked, 548 named); finish it before producing final article totals. Do not publish transient counts as a completed release.

## Critical source and fitment boundaries

Siemens VSZ7A400 requested through an old index returns VSZ7A400/17 in the actual manufacturer service and BOM. Keep only the actual returned /17 as the observed reference; /08 remains an unlisted-index check. The full manufacturer BOM has 50 positions for this source. All 92 captured Siemens BOMs contain 3566 drawing positions; unresolved descriptions remain visible, not invented generic parts.

Keep manufacturer article relationships from actual BOM/accessory rows with model stem, full reference, source URL, drawing position when provided and original source article ID. Include only matching named ACC articles; full devices appearing as BOM positions are not spare parts. Deduplicate only explicit equivalentProductCode pairs. Do not infer successor identity, stock from undocumented G1/R2 codes, fitment for all /xx indices or internal repair procedures from exploded drawings.

All new device-specific parts remain variant_check_required. Global factory catalog parts with unreviewed fitment keep installation time unknown. Source prices, device prices, actual stock and device fitment remain separate. Siemens article stock and delivery stay unknown; source quotes cannot become confirmed cart purchases. Internal electrical components have no inferred DIY care procedure.

Siemens shipping source: https://www.siemens-home.bsh-group.com/de/produkte/versandkosten — EUR 4.70 through EUR 19.99; EUR 5.95 from EUR 20 through 49.99; free from EUR 50, per Siemens end-consumer basket. Philips Home filter page states free shipping from EUR 20; fee below this is unknown.

## Five primary Philips articles

- FC8003/01 filter set: https://www.home-appliances.philips/de/de/p/FC8003_01 ; visible compatibility FC9729, FC9741, FC9742, FC9743, FC9744, FC9745, FC9747. Source says not in stock; current price unknown. Do not promote an old category price to a fresh quote.
- XV1653/01 25.2 V battery: https://www.philips.de/c-p/XV1653_01/cordless-vc-5000-series-lithium-ion-battery-252v ; visible references XC5043/01R1, XC5141/01R1, XC5243/10, XC5244/10, XC5242/10, XC5041/01, XC5141/01, XC5043/01, XC5142/01. Retain only models in the verified catalog.
- CP0496/01 clip/hose: https://www.philips.de/c-p/CP0496_01/schlauch ; visible references FC9333/09R1 and FC9333/09. Manufacturer-discontinued source record, no fabricated price.
- CP0766/01 upholstery nozzle: https://www.philips.de/c-p/CP0766_01/moebelzubehoer ; visible references FC9550/09R1, FC9552/19R1, FC9555/09R1, FC9556/09R1, FC9570/01R1, XD6122/12, XD5122/10, XD6142/12, FC9553/09, FC9555/09. Manufacturer-discontinued source record. Do not infer hidden expanded rows.
- CP0542/01 hose: https://www.philips.de/c-p/CP0542_01/schlauch ; catalog-only because no exact model compatibility table was observed.

Philips discovery source: https://www.philips.de/prx/sitemap-B2C-de_DE-products-product-catalog-ho.xml . Correct current model support routes are https://www.home.id/de-DE/FC9745 etc.; legacy c-p pages can redirect to generic support. Actual model photos and PDFs are external links, not bundled downloads.

Siemens examples: https://www.siemens-home.bsh-group.com/de/de/product/staubsauger/staubsauger-mit-beutel/VS06A111 ; https://www.siemens-home.bsh-group.com/de/de/productservice/VS06A111-13 ; https://www.siemens-home.bsh-group.com/de/de/productservice/VSZ7A400-17 ; https://www.siemens-home.bsh-group.com/de/de/spare-parts-list/VSZ7A400-17 ; https://www.siemens-home.bsh-group.com/de/de/product/11012212 . Named matching article facts come from the public /de/de/product/{observedArticleId} route.

## Local recovery files

Working tree: fitment-v121. Baseline snapshot baseline-v1.21.2 was taken before edits. The reconstructed untracked site/ source is NOT directly tracked: durable publication must use the existing checksum-protected .demo patch chain.

New/relevant research and helpers: research-v122/fetch_catalog.py ; philips-verified-source.json ; siemens-model-source.json ; siemens-service-source.json ; siemens-articles/*.json ; previous-index.json ; v122-statistics.json ; generate_v122.py ; check-ui-v122.mjs . A large attempted apply_patch creating docs_v122.py and package_v122.py stopped responding; inspect whether those files actually exist before recreating or running them.

Source edits: src/core/brand-identity.js (Siemens full E-Nr. and Philips full /xx/R parsing); src/core/typeplate.js (brand and serial boundaries); src/data/brand-products.js (source quotes, alias-safe encoded part IDs and exact Siemens index conditions); brand-index.js plus philips-pack.js and siemens-pack.js; catalog.js (seven brands, optional brands); miele-commerce.js (own shipping rules); miele-parts.js (internal electrical category); miele-installation-times.js (unknown global unreviewed part duration); src/app.js (new identity checkers, visible part-list coverage, all-brand filters/loading); package version, entry, service worker and tests updated to 1.22.0. Existing old optional artifacts are retained for already-open v1.21.2 tabs.

Philips slash-coded part IDs use encodeURIComponent and percent-to-underscore, e.g. philips-part-fc8003_2F01. The actual manufacturer article code remains FC8003/01 in identifiers, backup and handoff. New details load only on use and cache after first fetch; manufacturer PDFs/images and Auth/API responses are excluded. Main bundle snapshot was about 1.36 MB before final metadata, not a multi-GB download.

## Validation and next release actions

All existing 30 app test groups and syntax passed against the development data. The new catalog-seven-brands test also passed after correcting test assumptions for service accessories without drawing positions and uppercase percent encoding; offline behavior passed for all five optional brand packs. Built-app LinkeDOM UI checks passed: seven brands, new filters, source manuals and diagrams, coverage gaps, Siemens typed-index review, part routes, budget groups and open cart-price gates. A final installation-time guard was added afterward and still requires the final rebuild/test cycle.

1. Restore responsive local execution, inspect preserved files and finish the 1008-article source pass. Retry only transient timeout/503 source failures conservatively; do not bypass access controls or turn missing old records into names.
2. Regenerate Philips/Siemens packs from verified primary facts. Compute final canonical named-article counts, manual coverage, source-position gaps and packBytes; update README and integrations/catalog-goal-v122.md with those actual counts.
3. Build using existing pinned esbuild; verify reproducibility; run all 31 app groups, syntax and built-app UI checks. Verify device and article price separation, exact /xx relationships and unpriced backup/handoff.
4. Create a fresh .demo/v1.22-patch/part-* against baseline-v1.21.2. Add a checksum-protected v1.22 workflow step without changing the v1.21 checksum. A local placeholder zero checksum was added during preparation: NEVER publish it as a release.
5. Reconstruct the final patch and compare all site files byte-for-byte. Publish only owned patch/workflow/build/docs files with a fresh main lease and force:false. Do not add untracked research, node_modules, baselines or all of site/.
6. Require successful CI/deployment and public browser verification before calling v1.22 live. Capture and preserve a real final UI screenshot only after deployment. Current server provider/auth scope stays Miele-only; no Supabase changes, purchases, subscriptions, credentials or external messages are part of this catalog release.

User target remains a complete vacuum parts app. Still open: Samsung/Hoover/Vorwerk, additional real models below 100 for current brands, comprehensive model-specific parts, verified aftermarket, more device-price snapshots, actual installation procedures, physical fitment validation and a reliable German sales-ranking source. Robots, wet/dry vacuums and standalone handhelds follow.
