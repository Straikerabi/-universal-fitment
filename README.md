# Universal Fitment v1.12 – cart-to-merchant handoff and shopping lists

The public product is now intentionally focused on one vertical and one brand: **Miele vacuum cleaners**.

## Current pilot scope
- Category exposed in the app: vacuum cleaners only
- Brand exposed in the catalog: Miele only
- 57 distinct manufacturer model names, represented by 62 material-number variants; colors and nine family fallbacks do not inflate the model count
- Covers Guard L1/M1/S1, Complete C3/C2, Classic C1, Compact C2, Boost CX1, Blizzard CX1, Triflex HX2/HX3 and Duoflex HX1
- Each concrete variant has a device material number, validated device EAN, product type, technical facts and an official product-source link
- 167 distinct parts and accessories, including all 109 vacuum items from the public Miele spare-parts category and 10 curated aftermarket articles. Four dishwasher items incorrectly placed in that category are excluded
- Existing accessories still come from concrete device OPTIONAL_ACCESSORY references; the verified family mapping supplies a four-pack bag where only an XXL pack is listed
- Original spare parts use explicit manufacturer series/type statements. Electrical hoses, nozzle-specific wear parts, ambiguous filter holders and multiple assemblies stay in a separate variant-check section
- Aftermarket bags, filters, hoses, batteries and a charger are linked to primary supplier statements and visibly labelled as supplier claims, not Miele approvals. No HX2 battery is inferred to fit HX3; a supplier typo is not treated as Duoflex evidence
- Every concrete model displays its exact official product photo, with a local vacuum illustration when a photo fails or the device is offline
- A complete parts catalog and per-device filters support original/aftermarket, category, series, name, material number, article number and EAN
- A used-parts page searches all 167 part templates or a selected device, with original/aftermarket, component, series and New/Used filters. eBay opens a part-specific Buy It Now search with a condition filter; Amazon opens a part-specific search and leaves used buying options to the product page
- Part details provide both marketplace choices. Searches are not verified fitment evidence, stock or source-price records. Device material numbers never substitute for part identifiers
- Searches can be saved to the cart as part notes with requested condition and both links. Seller, price, stock, shipping and total remain open. Source quotes check part membership for the device; separate marketplace sellers cannot share a shipping threshold
- The cart now has an explicit **Beim Händler bestellen** step. It groups product links, marketplace searches and reference pages, shows the desired quantity and sale unit, and copies the complete or per-merchant shopping list with part numbers and URLs
- Handoff opens the actual part page, not a guessed cart or device page. Reference pages and searches do not become selected offers. Quantities are not automatically transferred, no order is submitted, no payment is collected and the saved cart is never cleared by opening or copying the list
- Server-only eBay Browse and Amazon Creators OAuth providers, response adapters and failure/deadline contracts are prepared and tested with synthetic responses. Missing access triggers no external calls; flagged mock/sandbox data, auctions, defective conditions and stale responses are rejected. No production API call or live feed is claimed
- Global and per-device price lists cover all 167 catalog entries. Each price links its own part page, gives its retrieval date and distinguishes sale-unit/pack price, VAT basis, currency and provider availability
- 157 original Miele prices were fetched directly from their exact material-number pages on 2026-10-06. Seven vhbw prices come from current German Electropapa pages. SQOON net quantity-tier prices, a Polish PLN hose price and an older Müller/Swirl reference remain visibly separate
- Shipping policies link the provider's own terms. Miele's 6.50 EUR fee and inclusive 49 EUR free-shipping threshold are applied once per merchant basket; the captured German Electropapa product pages explicitly offer free DE shipping
- The cart accepts available, recently retrieved gross EUR source prices for a selected device, recomputes the merchant threshold as quantity changes and keeps incomplete totals open. Unknown values are never converted to zero; net, foreign-currency, unavailable and older prices do not enter a confirmed EUR total
- Quotes are dated snapshots, not a live merchant feed. Prices older than 24 hours are marked; the deliberately older Swirl source is marked from the outset. The provider's current price and selected delivery method are checked on its product page
- 89 parts have editorial estimates of active replacement time, with a task-specific range and explicit exclusion of charging, drying and diagnosis. Internal assemblies and unresolved variants retain an open time instead of an invented labor standard
- Part details link available illustrated bag-change instructions, supplier manuals and the selected device's instruction PDF. Product sheets are explicitly distinguished from installation instructions; internal part repair steps are not invented
- Exact instruction/data-sheet downloads are linked where published; missing full instructions link to Miele's explicitly labelled manual finder
- Explicit camera, photo-library and OCR paths remain available
- Search resolves material numbers and EANs locally, including GTIN-14 equivalents; shared accessory codes are not treated as exact device identities
- Filters combine series, device type (bagged/bagless/cordless), bag system and sorting; inconsistent combinations show an empty state
- Jobs, Smart Stock, cart, repair-readiness, tools and repair-service finder remain available around the vacuum workflow

## Data-quality rule
Other categories and brands are deliberately hidden until the Miele pilot is deep enough. Expansion happens brand-by-brand after blind tests and source-quality checks.

Source snapshot: **2026-10-06**. Provider prices, stock and arrival ranges are shown as dated source records, never as live offers or fabricated rating-based recommendations. Installation minutes are our own planning estimates, not manufacturer specifications. CI checks exact device identifiers, job references, category/series filters, spare-part provenance, supplier scope, generation/variant boundaries, VAT/currency/age handling and same-merchant shipping thresholds. The public spare-parts catalog is not the complete serial-specific internal service inventory; unlisted motors/electronics require an official Miele check using the type plate.

## Deliberately not faked
Cloud accounts, client login OAuth, payments, licensed VIN decode, TecDoc/GS1/EPREL credentials, partner repair-service booking and live merchant feeds remain disabled until the real backend/contracts/credentials exist. The eBay/Amazon search links are available now; their server modules and access requirements are documented in [integrations/README.md](integrations/README.md). API keys never enter the static site. CI checks the app and server request contracts before deployment.

The first marketplace server endpoint is now deployed on the existing Supabase Free project. Its health check reports all 167 catalog parts; search requests require a validated Supabase user and an explicit pilot allowlist. Provider calls remain disabled. Live offers, account UI and a persistent global request budget are still pending; see [integrations/edge/README.md](integrations/edge/README.md).

## Checkout model

The current pilot is an outbound shopping planner: customers choose the actual offer, add the desired quantity and pay at each merchant/marketplace. Several shops mean separate orders. Automatic cart transfer requires selected offer identifiers and an officially supported, permitted provider integration; it is not assumed from search results or a generic URL parameter. Own-platform payments are a separate business/integration decision, not enabled by installing a payment widget. See [integrations/checkout.md](integrations/checkout.md).
