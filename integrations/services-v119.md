# v1.19 — vacuum repair, rental referrals and photo loading

Users can open repair and rental pages from home, their device and the More menu. Repair is scoped to the selected Miele or Bosch vacuum, with a manufacturer service link, telephone link and copyable request. The former generic repair query and placeholder partner filters are removed. Local Maps searches explicitly request vacuum repair and electronics service; results are unverified, with no asserted radius, appointment, rating or brand acceptance.

Rental currently links one source-backed OBI 45-litre wet/dry vacuum. The four duration tariffs, VAT, possible 10% fee and EUR 70 deposit have dated provenance. Local stock, transport, accessory costs and final pricing require provider confirmation. No exact Miele/Bosch model rental or try-before-buy agreement is asserted. Booking and payment remain external.

## Sources reviewed 2026-10-06

- Miele hand/floor vacuum repair tariffs (distinct from large appliance, coffee and robot tariffs): https://www.miele.de/c/reparatur-26.htm
- Bosch small-appliance repair explicitly includes vacuums and asks for E-Nr./FD/Z-Nr.: https://www.bosch-home.com/de/de/repair-for/kleingeraete/0A1b
- OBI rental device, duration tariffs, deposit and possible fee: https://www.obi.de/markt/mietgeraete/reinigung/nass-trockensauger-45l-230v-18105

## Loading and scope

- Default catalog lists use the local vacuum illustration. Product and large part views load a manufacturer image at visibility. A saved on-demand setting requires a click for catalog device and part photos; automatic list photos remain selectable.
- Service/rental records are bundled into an optional versioned ES module (2,097 bytes), fetched only on those routes, and cached after first use. Missing first-use network shows a retry state. Route changes discard stale asynchronous rendering.
- The offline cache admits only known app files and the current service pack; it excludes arbitrary same-origin APIs/assets as well as all external Auth/marketplace/photo responses.
- Core offline files total 1,035,104 bytes (uncompressed); main app bundle 980,451 bytes. This release does **not** move manufacturer catalogs to a cloud database. Brand packs, a bounded downloaded-catalog cache and catalog-update checks remain the next scaling task.
- Bosch full E-Nr. remains temporary inside a matching-device repair route; request copying does not send messages, store FD/serials or assert fitment. Global or unrelated routes still clear the context.

## Validation

- All 28 app test groups passed, plus syntax checks and reproducible main/optional bundle checks.
- New service tests cover all 122 concrete catalog records, category/brand boundaries, invalid locations, scoped request text, explicit rental limitations and exclusion from install precache.
- Photo tests cover default/detail/on-demand/automatic modes and shared parts-photo policy. Offline tests cover same-origin API/photo exclusion and optional-pack reuse after first load.
- A local LinkeDOM simulation of the built bundle passed home/device/More entry points, maker isolation, Maps query, OBI rates/deposit, photo actions, unknown-device routes and stale render suppression. This is simulated DOM evidence, not a production browser/device test.
- Reconstruction from the immutable v1.18 baseline is checked byte-for-byte by the packaging script. Existing backend contracts remain unchanged.

## Publication

The preceding v1.18 build passed but its GitHub Pages deploy job was waiting for the existing `github-pages` environment approval. This release supersedes that build; deployment protection is preserved. Public visibility must be checked separately after successful deployment. No paid quota reset or upgrade has been used.
