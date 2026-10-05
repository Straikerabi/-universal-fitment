# Universal Fitment v1.5

Blind-test build with a real device flow for the Krups KP310 test machine.

## New in v1.5

- Explicit iPhone photo-library picker: Live-Scan, Foto aufnehmen, Aus Fotos.
- Universal cart stored locally in the browser.
- Cart groups items by merchant and keeps fitment context attached to every item.
- Checkout still happens at the merchant; Universal Fitment does not pretend to be the merchant of record yet.
- Manufacturer-linked Krups offer snapshots for MS-624360, MS-624569 and MS-624570 with source URL, retrieval date, item price, availability and delivery label.
- Unknown shipping is shown as unknown instead of silently treated as zero.
- Official manuals/support links are visible on device pages.
- Verified offers are separated from demo ranking data.

## Trust rule

Identity, compatibility, merchant availability and checkout are separate claims. Every layer can have its own source and timestamp. No live price or shipping cost is invented.
