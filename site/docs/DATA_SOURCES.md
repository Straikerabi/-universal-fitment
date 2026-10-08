# Data source policy

Production adapters must document:
- provider name
- API/feed/license URL
- fields used
- storage/caching restrictions
- attribution requirements
- rate limits
- commercial/affiliate terms
- deletion/expiry requirements

Planned resolver families:
- manufacturer catalogues / official manual links
- GS1 / GTIN resolution where licensed
- EPREL public product model data
- authorized merchant/affiliate APIs such as eBay
- automotive catalogue provider later (e.g. licensed fitment catalogue)

Never scrape a source merely because the page is publicly visible. A visible page is not automatically a reusable commercial dataset.
