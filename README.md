# Universal Fitment v1.2

Blind-test build with smarter identifier handling.

## New in v1.2

- Distinguishes valid GTIN/EAN/UPC from long manufacturer / serial / production codes.
- Does not waste generic product-database queries on codes that are very likely serial or production identifiers.
- Scanner now explains when a decoded barcode is probably not the model number.
- Typenschild photo flow tries to prefer a model/product-number candidate over a serial-like barcode.
- Users can still force a live lookup if the heuristic is wrong.
- Added GTIN checksum validation and regression tests for the blind-test code pattern.

## Coffee-machine blind test

The app still knows nothing about the user's actual machine in advance. The goal is:

scan/photo/manual entry → identify exact device → verify care/parts separately → never fabricate fitment.

A serial or production code alone may be insufficient to identify the exact model. In that case the app explicitly asks for the complete type plate instead of pretending the product lookup failed mysteriously.
