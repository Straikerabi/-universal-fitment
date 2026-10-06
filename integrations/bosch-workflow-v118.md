# Bosch device-to-part workflow v1.18.0

The second brand is already released as 60 Bosch model references and 47 part entries. This update completes the E-Nr. handoff from local type-plate review to the selected model, its parts and manufacturer checking. Catalog sources, captured prices and the protected Miele server remain unchanged.

## Resulting behavior

After a valid Bosch type-plate review, the actual full two-digit E-Nr. is prefilled on the matching device. If the brand was missing, the existing Bosch checkbox must be confirmed first. A bare model reference or a device EAN never supplies an invented /xx index. Invalid or conflicting fields prevent the handoff.

The normalized E-Nr. stays in memory while opening that device's parts, price list, marketplace searches and valid care/job pages. Support is available directly on the device, price/parts list, marketplace list and individual part detail. A selected part adds an **E-Nr. & Teilenummer kopieren** button with the actual part identifiers and an explicit unresolved-fitment statement. Aftermarket text identifies the supplier claim and does not become a Bosch approval.

Editing the E-Nr. immediately clears the old context, manufacturer link and copy button. Rechecking requires the same model and a real two-digit index. **E-Nr. verwerfen** clears both the input and context. Switching devices, opening a global catalog, leaving for the cart/home/scan/account/backup or reloading also discards the context. It is excluded from saved device records, cart records, backup files, share URLs and diagnostics. Raw plate text, FD and serial numbers are never carried by this module.

The service link checks only the entered number's format. It does not confirm that the index exists or that any replacement fits. Catalog fitment statuses and priced-cart gates remain unchanged, so all Bosch device-part relations still require manufacturer/supplier checking. Opening or copying the workflow does not call an external catalog or provider, create an account, place an order or transfer a merchant cart.

Global parts, prices and marketplace views offer series and components only from parts for the selected device brand. Stale series/component selections are reset when no longer available. The marketplace device selector also follows the selected brand. A valid empty search remains visible when the user's other filters have no results.

## Validation and size

26 app test groups and all syntax checks passed locally. The new workflow group covers all 60 Bosch references with synthetic /02 input, missing-brand confirmation, conflicting or malformed fields, invalidation of old values, isolation between devices and routes, discard/new-page behavior, copied-part membership, narrow aftermarket warnings, unchanged priced-cart gating and nonempty brand-specific filter choices. Synthetic /02 inputs are parser/context test fixtures, not claims that those 60 variants exist.

The pinned esbuild artifact is reproducible. App bundle: 974,083 bytes; unique core offline assets: 1,028,302 bytes (about 1.03 MB uncompressed). Bundle SHA-256: dc3a5238b30d41d3545e8fdddccddfa107b1f13e53564550029c42d7e6d246f8. Optional manufacturer photos and OCR downloads remain separate. The incremental deployment must reconstruct the tested source byte-for-byte before CI runs.

## Publication QA

Deployment and real browser interaction will be recorded after publication. Real-file photo OCR remains unverified after the earlier declined file upload; this release does not retry that upload. Individual manufacturer-confirmed /xx fitment, physical blind type-plate tests and licensed provider access remain open.

See [Bosch source scope and v1.17 QA](bosch-second-brand-v117.md) for the unchanged manufacturer/supplier sources and [checkout model](checkout.md) for the existing merchant handoff.
