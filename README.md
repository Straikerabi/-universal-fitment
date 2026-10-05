# Universal Fitment

Premium mobile-first demo for identifying products, verifying fitment evidence and comparing compatible parts.

## Current build

**v0.8 demo**

- Premium Light / Dark / System themes
- Search, scan and guided troubleshooting
- Product → part → evidence → offer flow
- Transparent fitment confidence and offer ranking
- Saved devices, history and local device notes
- Camera / BarcodeDetector support when available
- PWA / offline cache
- Automated core, data, static and resolver tests
- New resolver boundary for external product identification
- Unknown valid barcodes can optionally query Open Facts as a live identification candidate
- External barcode matches are **never** treated as proof of spare-part compatibility

> Demo records remain prototype data unless explicitly marked as a live external identification result. No demo fitment or price record is a purchase recommendation.

## Trust rule

AI or an external product database may help identify a product. Compatibility requires separate evidence such as a manufacturer source or verified fitment catalog.

## Deployment

GitHub Actions reconstructs the checked v0.7 base package, applies the v0.8 overlay, runs all automated checks, then deploys the result to GitHub Pages.

v0.8 overlay SHA-256:

`21995e6ae8621e0718a7e804ba82684dfba25132f89922fcc0a41cc8bcf3c071`
