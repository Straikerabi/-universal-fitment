# Universal Fitment v1.3

Blind-test build with portable type-plate OCR and the first exact Krups manufacturer dataset.

## New in v1.3

- iPhone/Safari no longer depends on the experimental browser TextDetector.
- Full type-plate photos fall back to client-side Tesseract OCR when native text detection is missing.
- OCR prefers labelled REF, TYPE, MODEL and Product No. values instead of a serial barcode.
- Added manufacturer-verified Krups NDG ESPERTA KP310 / KP310510 / KP310510/7Z0 data.
- Added source-linked original Krups parts including MS-624360, MS-624569, MS-624570, MS-624673 and MS-624688.
- Product identity and part compatibility remain separate evidence claims.

The OCR library is loaded only when a type-plate photo actually needs the fallback path. If OCR cannot load, manual model entry remains available.
