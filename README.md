# Universal Fitment

Premium mobile-first demo for a universal product, spare-part and compatibility finder.

## Current build

**v0.7 demo**

- Light / Dark / System theme
- Search and guided demo flows
- Product → part → compatibility evidence → offers
- Transparent ranking and fitment confidence
- Guided troubleshooting
- Saved devices, history and local device notes
- Camera / BarcodeDetector support when available
- PWA / offline cache
- Automated core, data and static checks

> Demo data only. Compatibility and merchant information in this prototype must not be treated as real purchase advice.

## Deployment

The checked v0.7 package is stored losslessly in `.demo/v0.7/`. GitHub Actions rebuilds it, verifies its SHA-256 checksum, runs the automated tests, and deploys the extracted app to GitHub Pages.

Package SHA-256:

`c02466e0c2a55cbdce895fae64bf1359b725bd09de4a9de69b483bb2b090078e`
