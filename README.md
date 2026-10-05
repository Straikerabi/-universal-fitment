# Universal Fitment v1.0

The prototype now contains its first **real, source-linked records** instead of treating every product as demo data.

## Real seed records

- Dyson V11 click-in-battery family → original filter **970013-02**, compatibility linked to Dyson Germany.
- Miele Complete C3 family → **HyClean 3D Efficiency GN**, EAN **4002515488492**, material number **09917730**, linked to the official Miele data sheet.
- Bosch WAE24166UK → EAN **4242002720524** and technical identity linked to the official Bosch product data sheet.

No merchant offers are invented for verified records. A verified part can therefore show real fitment evidence while its offers section remains empty until an official marketplace/shop API is connected.

## Live barcode resolver

Unknown valid barcodes first query **Open Products Facts API v3**, with the wider Open Facts endpoint as fallback. External barcode results are identity candidates only and never become spare-part fitment proof by themselves.

## Data status

- `manufacturer-verified`: linked manufacturer evidence, Grade A.
- `demo`: prototype fixtures for unfinished workflows.
- Live external identification is shown separately from compatibility evidence.

## Next production data connectors

1. eBay Browse API for live offers and selected vehicle compatibility signals (requires app credentials and a backend token proxy).
2. EPREL Public API for EU appliance model data (requires an EPREL public API key).
3. GS1 / Verified by GS1 for trusted GTIN identity where licensed.
4. TecDoc or equivalent licensed catalog for production automotive fitment.

The repository intentionally does not embed API secrets in the GitHub Pages client.
