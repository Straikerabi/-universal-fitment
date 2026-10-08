# Architecture v0.4

## Reliability rules

1. AI may identify or rank candidates, but cannot be the sole evidence for compatibility.
2. Every production compatibility claim must point to one or more evidence records.
3. Exact identifiers (manufacturer model number, GTIN, catalogue key) outrank fuzzy text/image matching.
4. Ambiguous identification requires user confirmation.
5. Demo/unverified records can never render as verified.
6. Safety-critical categories get stricter thresholds and can be excluded from automatic recommendations.

## Resolution pipeline

1. Own database exact identifier lookup.
2. Barcode/GTIN resolver.
3. Manufacturer or regulatory model resolver.
4. Text/OCR model resolver.
5. External catalogue candidate resolver.
6. Image search only as a candidate-generation fallback.
7. User confirmation.
8. Compatibility graph lookup.
9. Offer aggregation and transparent ranking.

## Frontend

The current prototype is deliberately dependency-free and static so it can run on GitHub Pages with very little deployment risk. Native iOS/Android and a framework migration come after the core flows and data model are proven.

## Backend target

PostgreSQL/Supabase with row-level security, server-side provider keys, source provenance and auditable compatibility claims.
