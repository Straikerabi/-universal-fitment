# Bosch second-brand release v1.17

Source collection and validation date: 2026-10-06. The second brand is Bosch; the existing Miele catalog and version-4 protected marketplace server remain available.

## Captured scope

| Record | Count | Identity scope |
| --- | ---: | --- |
| Bosch bagged vacuums | 22 | Manufacturer model reference; /xx index open |
| Bosch bagless vacuums | 18 | Manufacturer model reference; /xx index open |
| Bosch cordless vacuums | 20 | Manufacturer model reference; /xx index open |
| Unique original Bosch articles | 45 | Actual manufacturer material/article codes |
| Bosch original articles with captured prices | 40 | Dated own-article DE shop snapshots |
| Swirl Anti-Geruch bag sources | 2 | Narrow supplier scope; no price captured |
| Device instruction / product documents | 225 | Official links, not bundled PDFs |
| Combined parts catalog | 214 | 167 Miele plus 47 Bosch entries |
| Combined concrete records | 122 | 62 Miele material variants plus 60 Bosch references |
| Distinct model names / references | 117 | 57 Miele names plus 60 Bosch references |

The raw manufacturer accessory requests contain 46 article codes, including an alias for an existing material number; the public catalog deduplicates them to 45 originals. Each model OEM relationship is present in that model's manufacturer accessory list. No general Bosch bag, filter or battery interchangeability is inferred from a series name. Device material numbers and product-type fields are not invented.

Swirl S67 examples remain catalog-only because none of the captured examples is the exact new Bosch record. Swirl S73 names BGL8SIL; only BGL8SIL0L is shown as a family candidate, with the suffix, holder and full E-Nr. left to review. Neither source becomes a Bosch manufacturer approval or an all-Serie-8 recommendation.

## User flow and boundaries

Brand filters work on the device, spare-parts and used-parts pages. Each Bosch model has its official image, technical facts and available manual/product links. Failing images use the existing local vacuum illustration. The photo containers use a fixed block frame so grid intrinsic-height expansion cannot clip the actual device or article photo. Product sheets are distinguished from installation instructions. General care jobs open the actual device manual and basic safe checks without displaying a confirmed repair kit or a completeness score. Active replacement-time estimates stay open for unresolved Bosch variants.

Bosch E-Nr. parsing preserves the actual two-digit /xx index, requires the model code to match the opened reference and generates a manufacturer service link only after format validation. It explicitly does not certify that the index exists or that any replacement part fits. Typing a new value clears/disables the previous service link. The service URL pattern was observed on the existing BBS611BSC/02 Bosch service page; other index values are not invented as catalog variants.

Local type-plate review distinguishes Bosch model references from exact Miele material variants. A Bosch EAN identifies the model reference, not a /xx variant. FD, Z-Nr. and serial fields are ignored for identification, including next-line values. Contradictory model/EAN values, different repeated indices, unsupported or mixed brands block selection. Missing brand requires confirmation for the brand of the known candidate. Known part material/article/EAN codes open part review rather than a vacuum identity; a valid-looking EAN-8 checksum never overrides a known eight-digit material number.

Full type-plate text stays in memory, is cleared when leaving review and is excluded from saved devices, backup files, diagnostics and links. E-Nr. text entered on a device page is not persisted; Bosch opens only when the user follows the link. Device notes and cart backups retain the existing local-only behavior.

Bosch OEM part keys include their maker (`oem:Bosch:<material>`), preserving the existing Miele keys. eBay/Amazon searches use the actual part maker and code, never the vacuum EAN. Both ordinary part notes and marketplace search notes preserve the open variant state. Cart quantity changes and reviewed backup imports retain the Bosch part relationship and open price; handoff includes the variant warning, exact part reference or canonical marketplace search links. No merchant cart transfer, order, own-site payment or user account creation is added.

## Commerce

Prices are own-article Bosch Shop structured-data snapshots collected on 2026-10-06, with their actual retrieval timestamp, EUR/VAT basis and source link. Stock is parsed separately from price; unknown arrival time stays null. No live price feed is claimed and the existing 24-hour age handling remains active. An article page price does not approve unresolved E-Nr. fitment and cannot enter a confirmed cart total for these Bosch references.

Bosch end-customer DE shipping is modeled by basket bands: through 19.99 EUR 4.70 EUR; 20.00 through 49.99 EUR 5.95 EUR; from 50 EUR free. Cent-based boundary checks prevent rounding drift; a different merchant cannot contribute to the Bosch free-shipping threshold. Shipping is an estimate from the linked policy and the current checkout controls actual terms.

The protected marketplace server remains version 4 with its existing 167 Miele entries, pilot grants, quotas, authentication and disabled providers. Bosch in-app provider buttons are hidden; direct part-specific eBay/Amazon search links remain usable without login. No credentials, provider access, Supabase schema, access grant, subscription or backend deployment changes are made here.

## Primary sources

- [Bosch bagged vacuums](https://www.bosch-home.com/de/de/category/staubsauger/staubsauger-mit-beutel)
- [Bosch bagless vacuums](https://www.bosch-home.com/de/de/category/staubsauger/beutellose-staubsauger)
- [Bosch cordless vacuums](https://www.bosch-home.com/de/de/category/staubsauger/kabellose-handstaubsauger)
- [Bosch spare parts by E-Nr.](https://www.bosch-home.com/de/produkte/ersatzteile)
- [Bosch manual finder](https://www.bosch-home.com/de/service/hilfe-und-unterstuetzung/gebrauchsanleitungen)
- [Observed BBS611BSC/02 service page](https://www.bosch-home.com/de/de/productservice/BBS611BSC-02)
- [Bosch end-customer shipping policy](https://www.bosch-home.com/de/produkte/versandkosten)
- [Swirl MicroPor Plus Anti-Geruch product scopes](https://www.swirl.de/de/staubsaugen/staubsaugerbeutel/micropor-plus-anti-geruch-staubsaugerbeutel)

Exact product/article/image/document URLs and factual source snapshots are in `site/src/data/bosch-records.js` after the deployment patch chain is rebuilt. Manufacturer marketing prose, ratings, fake reviews and guessed fitment are not imported.

## Validation

25 app suites plus syntax checks passed locally, including all 60 Bosch references, valid device EANs, distinct brand keys, 22/18/20 device filters, manufacturer model-list relationships, narrow Swirl candidates, explicit unresolved fitment and cart-price gates. Bosch boundary tests exercise malformed /xx formats, brand conflicts, all OEM material/article/EAN codes, FD/serial exclusion, shipping bands, cross-merchant isolation and Bosch cart/backup/handoff preservation. Existing Miele tests retain their full 62-variant and 167-part scope. Server provider/endpoint/access/quota/pilot contracts and the generated Edge package passed with synthetic data; no production provider request was made.

The pinned esbuild artifact was regenerated and byte-checked. Current app v1.17.2 bundle: 970,631 bytes. Core offline assets: 1,024,850 bytes (about 1.02 MB uncompressed); optional photos/OCR downloads are additional. Manuals stay linked. The v1.17 patch reconstruction must be byte-identical to the tested source tree.

## Publication and browser evidence

GitHub Actions run 37506070452 succeeded for build-and-test and Pages deployment at release commit 81ab230e0bf03a17d1a96575ff294f2976890257. The public app-v1.17.2.js download is byte-identical to the tested bundle (SHA-256 a9fb6373110a3bb4997836f50f7b969c7e097e9ca21127a4ad38c58ee0a2c076). The verified app URL is https://straikerabi.github.io/-universal-fitment/?v=1.17.2#home.

Real browser interaction on the published v1.17 release verified: Bosch brand filter 60 records, cordless filter 20, Miele reset/filter 62 variants; full BBS611BSC/02 review with missing-brand confirmation; invalid /2 and changed model/index clearing or disabling old links; full-index device support refusing another model; official care-manual links; model-specific Bosch prices and the 4.70/5.95 EUR shipping bands; 47 Bosch catalog articles and 2 Swirl aftermarket results; correct New/Used eBay condition URLs and canonical part queries; hidden protected API/priced-cart buttons for unresolved Bosch parts; ordinary and marketplace cart notes retaining variant warnings; a quantity-2 search note surviving handoff; and clipboard shopping-list content with the proper part, quantity, query and warning. Created cart test notes were removed after verification.

The final v1.17.2 UI verifies human-readable model/article labels, price freshness counting only actual captured prices (13 of 14 for BGB6MPOW), separate open arrival time and readable stock text. Its full manufacturer photos load for both hero devices; image rectangles are 152 px inside 170 px frames, correcting the old grid overflow that clipped the vacuum bodies. The brand heading is stacked separately from the subtitle.

A synthetic Bosch photo fixture was prepared for a real-file OCR browser test. The browser file upload was declined before a file or OCR result reached the app. No workaround or second upload was attempted, and no successful v1.17 end-to-end photo OCR result is claimed. Parser and OCR lifecycle tests remain synthetic. Real camera/mobile and blind physical type-plate tests, confirmed /xx fitment for each device, a positive pilot-account login and licensed marketplace provider access remain open.
