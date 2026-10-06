# Universal Fitment v1.9 – Miele spare parts, aftermarket alternatives and instructions

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
- Part details link available illustrated bag-change instructions, supplier manuals and the selected device's instruction PDF. Product sheets are explicitly distinguished from installation instructions; internal part repair steps are not invented
- Exact instruction/data-sheet downloads are linked where published; missing full instructions link to Miele's explicitly labelled manual finder
- Explicit camera, photo-library and OCR paths remain available
- Search resolves material numbers and EANs locally, including GTIN-14 equivalents; shared accessory codes are not treated as exact device identities
- Filters combine series, device type (bagged/bagless/cordless), bag system and sorting; inconsistent combinations show an empty state
- Jobs, Smart Stock, cart, repair-readiness, tools and repair-service finder remain available around the vacuum workflow

## Data-quality rule
Other categories and brands are deliberately hidden until the Miele pilot is deep enough. Expansion happens brand-by-brand after blind tests and source-quality checks.

Source snapshot: **2026-10-06**. No snapshot prices, merchant stock, ratings or delivery claims become live offers. CI checks every exact device identifier, job reference, category/series filter, spare-part provenance, supplier scope and sensitive generation/variant boundary. The public spare-parts catalog is not the complete serial-specific internal service inventory; unlisted motors/electronics require an official Miele check using the type plate.

## Deliberately not faked
Cloud accounts, OAuth, payments, licensed VIN decode, TecDoc/GS1/EPREL credentials, partner repair-service booking and live merchant feeds remain disabled until the real backend/contracts/credentials exist.
