# Universal Fitment v1.8 – 57 concrete Miele vacuum models

The public product is now intentionally focused on one vertical and one brand: **Miele vacuum cleaners**.

## Current pilot scope
- Category exposed in the app: vacuum cleaners only
- Brand exposed in the catalog: Miele only
- 57 distinct manufacturer model names, represented by 62 material-number variants; colors and nine family fallbacks do not inflate the model count
- Covers Guard L1/M1/S1, Complete C3/C2, Classic C1, Compact C2, Boost CX1, Blizzard CX1, Triflex HX2/HX3 and Duoflex HX1
- Each concrete variant has a device material number, validated device EAN, product type, technical facts and an official product-source link
- Accessories come from the concrete device's OPTIONAL_ACCESSORY manufacturer references; the verified family mapping supplies a four-pack bag where only an XXL pack is listed
- Exact instruction/data-sheet downloads are linked where published; missing full instructions link to Miele's explicitly labelled manual finder
- Explicit camera, photo-library and OCR paths remain available
- Search resolves material numbers and EANs locally, including GTIN-14 equivalents; shared accessory codes are not treated as exact device identities
- Filters combine series, device type (bagged/bagless/cordless), bag system and sorting; inconsistent combinations show an empty state
- Jobs, Smart Stock, cart, repair-readiness, tools and repair-service finder remain available around the vacuum workflow

## Data-quality rule
Other categories and brands are deliberately hidden until the Miele pilot is deep enough. Expansion happens brand-by-brand after blind tests and source-quality checks.

Source snapshot: **2026-10-06**. No snapshot prices, merchant stock, ratings or delivery claims become live offers. The catalog target of at least 50 real model names is checked in CI, alongside every device's exact identifier matches, job references, bagless handling and filter combinations.

## Deliberately not faked
Cloud accounts, OAuth, payments, licensed VIN decode, TecDoc/GS1/EPREL credentials, partner repair-service booking and live merchant feeds remain disabled until the real backend/contracts/credentials exist.
