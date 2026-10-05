# Universal Fitment v1.1

Blind-test build for real coffee-machine identification.

## What works now

- Live barcode and model/product-number lookup.
- Search order: verified local records → UPCitemdb → Open Products Facts fallback for barcodes.
- External matches are identity candidates only and never become fitment proof automatically.
- Coffee-machine support bridges for De'Longhi, Philips/Saeco, Bosch, Siemens, JURA, Krups and Nespresso.
- Officially sourced seed records for De'Longhi Magnifica Evo ECAM290.89.SBX EX:1, Philips Series 5500 EP5547/90 and Nespresso VERTUO Pop.
- Browser image scan can use BarcodeDetector and, where supported, TextDetector. Manual model entry remains the reliable fallback.
- Confirmed live devices can be saved locally and opened like a normal device record.

## Trust rule

Product identity, spare-part compatibility and merchant availability are separate claims. A live product-database hit is not enough to mark a spare part compatible. Compatibility must be backed by manufacturer or other verifiable catalog evidence.

No merchant price or stock is invented when no live merchant API is connected.
