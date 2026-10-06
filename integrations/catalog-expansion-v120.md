# v1.20.1 — four vacuum brands and on-demand catalogs

The app now presents 249 distinct model names, 260 catalog references and 759 unique parts/accessories. The new AEG and Dyson content is usable from home, search, device details, parts/prices, marketplace searches, repair referrals, the cart and reviewed JSON backups. Model references do not assert that a spare part fits the user's actual device.

| Brand | Model names | References | Unique articles | Direct manual coverage |
| --- | ---: | ---: | ---: | ---: |
| Miele | 57 | 62 | 167 | 57 references |
| Bosch | 60 | 60 | 47 | 60 references |
| Dyson | 54 | 60 | 191 | 54 references |
| AEG | 78 | 78 | 354 | PNC manual finder; no direct PDFs claimed |

Nine existing Miele family fallback records remain separate from the 260 concrete/reference records. An article shared by several models is counted once. Distinct references may share a model name. This is captured-source coverage, not an exhaustive German catalog or a German sales ranking.

## New content and provenance

- AEG: 78 normalized model references and all 120 full PNCs found on their captured manufacturer model pages. Their observed pagination yielded 381 public PNC search pages. The pack contains 354 deduplicated articles explicitly classified by the manufacturer as vacuum articles, with model/PNC relationships, dated prices, stock snapshots, photographs and technician-only flags. Search-directory collisions with ovens, refrigerators and freezers are excluded. Foreign-appliance articles that appear inside PNC results are excluded. A PNC list can still contain duplicates or source inconsistencies; its captured count/page coverage is displayed per device and never promoted to part approval.
- Dyson: 60 source-listed SKU references for floor and cordless vacuums. Only original articles/accessories with an actual spare-card link for the corresponding device SKU enter the pack; generic page metadata alone is insufficient. Standalone hand vacuums and wet-cleaning Submarine models are excluded. There are 191 deduplicated articles, 178 visible EUR/VAT price snapshots and 54 references with direct manufacturer manual PDFs. Thirteen article prices and two device parts lists remain open. Linked support/video pages remain available. PDF links are manufacturer documents, not 191 separate repair procedures.
- Prices preserve the public file retrieval timestamp and their actual source. Stock snapshots, dispatch policy and an arrival promise are separate. Unknown prices and installation times stay unknown. New AEG/Dyson aftermarket fitment is not invented.

Primary source entry points, reviewed 2026-10-06:

- https://shop.aeg.de/model/staubsauger
- https://shop.aeg.de/search?pnc=90025863800 (PNC search pattern; exact source PNC/page URL retained on each relationship)
- https://www.aeg.de/support/user-manuals/
- https://shop.aeg.de/delivery
- https://www.aeg.de/support/contact-us/
- https://www.dyson.de/ersatzteile/staubsauger/kabellose-staubsauger
- https://www.dyson.de/ersatzteile/staubsauger/bodenstaubsauger
- https://www.dyson.de/support/journey/replacement-parts/search.369535-01 (exact per-SKU URLs retained)
- https://www.dyson.de/support/journey/spare-details.972204-01
- https://www.dyson.de/support/repairs-and-servicing-information

Exact model, article, photograph and document URLs are embedded in the source packs. No entire manufacturer article or marketing passage is republished.

## Identity, cart and service behavior

AEG accepts a nine-digit PNC stem or eleven-digit full PNC. A matching stem explicitly leaves the revision open. A matching full PNC is a source-listed model identity; the article still requires checking. Editing removes the stale external link. The input is temporary and is not copied into saved data or a share URL.

Dyson distinguishes manufacturer device SKU from spare-part SKU and serial number. Generation, battery attachment, filter form and visible part identifiers require comparison. Both new brands remain `variant_check_required`; a captured price does not enable a confirmed-price cart selection. Manufacturer article keys include the brand to avoid code collisions.

Unpriced part notes preserve a direct manufacturer article link. Shopping handoff remains external, retains the article number even before a brand pack is loaded, and does not transfer quantities, create an order or accept payment. Reviewed backup restoration loads needed packs first, including devices found only in maintenance/job maps, and preserves unpriced article links. Existing references are hydrated in place so saved-device/backup maps stay valid.

Dyson shipping: EUR 6 below EUR 49, free from EUR 49. AEG shipping: EUR 5.99 per order, with no free threshold asserted. Generic source dispatch notes are shown separately. Repair referrals are now brand-specific for all four makers; model availability, guarantee status and final service pricing remain with the provider.

The protected marketplace registry remains scoped to 167 Miele articles. New brands use source pages and part-specific eBay/Amazon search links. No provider credentials, database grants, new paid services or payment handling are introduced.

## Loading and validation

- Main bundle: 1,043,141 bytes; core offline assets: 1,098,423 bytes before transport compression. AEG details: 698,022 bytes; Dyson details: 260,570 bytes; service data: 3,331 bytes. The small index is in the core; these detail packs load only when needed. Brand pack sizes are shown on the coverage page.
- First-use pack imports deduplicate simultaneous requests, fail with a retry view, reject a mismatched brand and register atomically. Route changes suppress stale rendering. Optional packs become available offline after first fetch; manufacturer photos/PDFs and arbitrary API responses are excluded from app cache.
- Default home renders 40 model cards and offers 40 more. Switching brands resets this limit. Standard lists use the local vacuum illustration; manufacturer photos follow the existing detail/on-demand preference.
- All 29 app test groups and syntax checks passed. Server provider/access/quota/pilot contracts and generated Edge smoke passed without external provider calls. Main and all optional bundles are reproducible with pinned esbuild.
- The built-bundle DOM simulation passed brand filters, pagination, device/part navigation, PNC full/stem/edit handling, unpriced cart entries, source links, price views, coverage, manufacturer isolation and late-load races. A separate cold backup simulation loaded both packs before preview and retained the new-brand cart position. These are simulated DOM tests, not real-camera/OCR or physical-device fitment tests.
- Packaging must reconstruct from the immutable v1.19 baseline byte-for-byte. CI and live deployment verification follow publication.

## Next work — authorized catalog expansion

Continue in substantial batches without asking the user to choose each routine implementation step. Keep floor and cordless vacuum coverage ahead of robots, wet/dry vacuums and standalone hand vacuums.

1. Philips/Versuni, Rowenta and Siemens: collect actual model identifiers/variant codes, primary device-part relationships, dated merchant prices, photographs and manuals; reuse the compact index and on-demand pack interface. Verified starting sources: Philips parts/support and model-specific accessory pages; Rowenta bagged/bagless/cordless accessory directories; Siemens vacuum E-Nr. spare-parts finder.
2. Extend the existing makers' source-backed component and variant coverage. Add aftermarket parts only from primary supplier model/article evidence, with explicit scope and restrictions. Keep technician-only parts and unknown installation times visible.
3. Add further German-market makers when their source data supports the same boundaries. Obtain a defensible German market/sales source before describing this catalog as the most-bought nationwide. A manufacturer directory or search popularity is not sales evidence.
4. Broaden the marketplace server only after its existing source/provider licensing, access and fitment contracts support the added brands; use realistic adapters/mocks while credentials remain deferred. Do not hide these dependencies behind successful search-link navigation.
5. Validate real device labels and representative replacement workflows before claiming exact fitment. Then build the separate robot, wet/dry and standalone handheld catalogs.

Next-source entry points verified via primary manufacturer search results:

- https://www.philips.de/c-w/support-home/parts-and-accessories.html
- https://www.philips.de/shop/haushalt/zubehoer-fuer-staubsauger-und-wischmopps/c/VACUUM_CLEANER_PARTS_SU
- https://www.rowenta.de/Zubeh%C3%B6r-Shop/Staubsauger/csc/FloorCare
- https://www.rowenta.de/Zubeh%C3%B6r-Shop/Staubsauger/Staubsauger-mit-Beutel/csc/WithBag_Vacuum
- https://www.rowenta.de/Zubeh%C3%B6r-Shop/Staubsauger/Staubsauger-ohne-Beutel/csc/Bagless_Vacuum
- https://www.rowenta.de/Zubeh%C3%B6r-Shop/Staubsauger/Akku-Staubsauger/csc/CordlessHandstickCleaner
- https://www.siemens-home.bsh-group.com/de/produkte/ersatzteile/staubsauger
