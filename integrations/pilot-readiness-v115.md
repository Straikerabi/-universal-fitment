# Pilot readiness v1.15 / marketplace server v4

The access-status page (`#access`, reachable through Konto & Pilotzugang) separates the guest catalog, public server connectivity, permission of the authenticated account, and provider configuration. The public health request and authenticated GET `/access` do not reserve search quota or call eBay/Amazon. Provider `configured` means the server configuration gate is open, not that production connectivity, offers or fitment have been verified. Startup database probes are explicitly labelled as startup checks.

The diagnostic report contains only whitelisted app/server versions, catalog count and access states. It excludes account email/UUID, device serials, device records and credentials. Copying is explicit, after preview; nothing is sent to support automatically.

Auth mutations are serialized. Cancelling login or logging out clears the app identity immediately and queues local SDK logout after any earlier login. A late login cannot restore the usable SDK session. Missing session and HTTP 401 clear the local identity; Auth/backend failures remain distinct from absent permission. Sessions remain memory-only. Existing verified accounts only; no real account was created or authenticated in this release.

Photo OCR is explicit after photo selection. The photo stays in the browser. A native barcode can be used separately, with existing type-plate/serial-number safeguards. Optional Tesseract engine/worker/core are pinned to 5.1.1 from the npm CDN; English recognition files and WASM are additional downloads outside the offline app core. Failed engine downloads can be retried. Navigation or photo replacement cancels recognition and terminates a worker, including a handle arriving after cancelled initialization. An already-started engine/language download may still finish before a worker handle becomes available. Physical camera tests and blind OCR accuracy on real type plates remain outstanding.

Schema 3 backups must contain all expected arrays/maps before the replace flow can proceed. Malformed and duplicate cart rows are counted as skipped. Schema 2 backups remain supported; prices and links still use canonical catalog checks.

Validation before publishing: all 20 app suites and syntax checks passed; provider, request handler, access-status, quota, pilot and generated Edge entrypoint suites passed. These tests use synthetic Auth/provider/camera/OCR data. Deployment of server v4 preserves existing custom JWT validation, CORS, private database permissions and persistent quota enforcement. No provider call, transaction, pilot grant, SMTP subscription or paid upgrade was made.

Core offline assets: 850,424 bytes (about 0.85 MB, uncompressed). Manufacturer photos and optional OCR downloads are additional. Live browser verification follows deployment.
