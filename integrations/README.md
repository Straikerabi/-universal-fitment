# eBay and Amazon integration contracts — v1.12

The published GitHub Pages app opens ordinary external search links for each catalog part. It does not scrape listing pages, reproduce marketplace photos/reviews, attach an invented affiliate tag, or claim live marketplace stock. eBay uses a Buy It Now search with condition 3000 for Used or 1000 for New. Amazon search links use the part query without claiming a condition filter; used buying options must be checked on the product page. A search is not listing availability or proof of fitment.

## Priorities for the fitment and cart core

| Priority | Dependency | Available now | Boundary before live use |
| --- | --- | --- | --- |
| 1 | Manufacturer part/device mappings | Sourced Miele model and series records | Marketplace titles cannot change mappings or resolve variant restrictions |
| 2 | Seller condition, price, stock and DE delivery | Part-specific search links; tested provider contracts | Approved API access, listing identity checks, current prices and explicit seller/delivery data |
| 3 | Aftermarket compatibility | Ten primary supplier sources | Seller claims stay distinct from manufacturer confirmation |

## Provider modules

`marketplace-providers.mjs` exports server-only `createEbayProvider` and `createAmazonProvider`. Their `search(request, { signal })` methods receive a part query, condition and DE market. `site/src/core/marketplaces.js` supplies the common request boundary, response adapters and offer validation. Missing credentials or approval return `access_required` without a network request. Deadlines, access failures and malformed responses return an unavailable state, never fabricated zero stock or prices. OAuth tokens are cached in server memory; listing prices are not persisted.

The eBay client uses Browse API, client-credentials OAuth, `EBAY_DE`, `deliveryCountry:DE`, fixed-price and explicit condition-ID filters. Production use requires a valid, activated keyset with the required scopes and applicable terms. The current EPN questionnaire says Browse does not require additional approval; restricted APIs and extended limits have separate requirements. The existing `EBAY_BUY_APPROVED` flag remains an explicit server enablement gate until actual access is verified. The client does not implement checkout or assume an EPN affiliate relationship.

The Amazon client uses Creators API catalog v1, Login with Amazon OAuth, a valid DE Partner Tag and `www.amazon.de`. Supported credential versions are 3.1, 3.2 and 3.3; 3.2 selects the EU token endpoint. Old PA-API keys and legacy 2.x credentials are not silently reused. The condition request is New, Used or Any. OffersV2 supplies featured listings and no shipping charges: shipping/delivery stay unknown, and `violatesMAP` suppresses the price. This is not a complete comparison or a lowest-used-price claim.

## Access and deployment

The first Supabase Edge endpoint is deployed and its public readiness check and blocked-access responses have been verified. It remains a backend foundation: all marketplace calls are disabled, and the public app still uses ordinary search links. See [edge/README.md](edge/README.md) for the API contract, custom authentication and the remaining activation gates.

1. eBay: developer account, activated production keyset, required OAuth scopes and agreements for the application's model. Meet account-deletion notification or eligible exemption requirements before the first production call. Check ordinary Browse access first; apply for additional approval only for restricted capabilities or extended access. EPN participation is additionally relevant to affiliate links.
2. Amazon: Associates membership for the target market, Creators API eligibility/registration and credentials, and a valid assigned Partner Tag. The checked documentation requires at least ten qualifying sales in the preceding 30 days for its stated API access path. Review the current content license and participation policies before displaying licensed data.
3. The first endpoint is deployed with user authentication and an empty private-pilot allowlist. Before activating provider calls, add persistent global quota enforcement, verified provider access and authenticated client integration. GitHub Pages cannot run the server modules. Keep flags, keys and secrets in that server's environment. `.env.example` lists variable names only. Do not put credentials in the app or public repository.
4. Verify authorized production responses, token renewal, quotas, attribution, caching and display rules. Then connect an endpoint to the public UI. The v1.12 public app remains in search-link mode; this repository does not claim a completed production API connection.

The current account blockers, prepared registration facts and provider-specific next steps are recorded in [access-setup.md](access-setup.md). No provider account or API key was created during this setup attempt.

## Fitment and cart rules

- Search with the part's material/article number, never the device's material number.
- API search results retain `identityStatus: unverified` and `fitmentStatus: offer_check_required`, even when a title contains the expected number. Listing identity, execution and physical condition need separate verification.
- Auctions, defective/unknown conditions, stale responses, unsafe URLs and flagged mock/sandbox data cannot become usable live results. Results expire after one hour at the request boundary.
- Missing amounts/currency, foreign currency and MAP restrictions cannot become confirmed EUR totals. Shipping is not inferred as free.
- Saved public searches are cart notes with requested condition and both links. Price, seller, stock and total remain open. Merging a source quote cannot turn a search note into a confirmed marketplace price.
- Separate marketplace sellers cannot combine spending for a merchant's free-shipping threshold. Adding an HX2 battery to an HX3 device through a search or quote is rejected.
- Synthetic responses exist only in tests. The public UI imports neither fixtures nor server modules. Missing access, failures, deadlines, condition conflicts and suspect matches are tested without external API calls.

Run `cd site && npm test && npm run check`, then from the repository root `node integrations/marketplace-providers.test.mjs`. CI runs both before publishing. Server modules and example environment files stay outside the published `site/` directory.

## Official references (checked 2026-10-06)

- [eBay Buy API production requirements](https://developer.ebay.com/api-docs/buy/buy-requirements.html)
- [EPN access questionnaire and Browse exception](https://partnernetwork.ebay.com/page/developer-questionnaire)
- [eBay account-deletion and production-key activation requirements](https://developer.ebay.com/develop/guides/sell/marketplace-user-account-deletion)
- [eBay Browse filters](https://www.developer.ebay.com/api-docs/buy/static/ref-buy-browse-filters.html)
- [eBay condition IDs](https://developer.ebay.com/api-docs/sell/static/metadata/condition-id-values.html)
- [eBay OAuth](https://developer.ebay.com/api-docs/static/oauth-client-credentials-grant.html)
- [Amazon Creators API access](https://partnernet.amazon.de/creatorsapi/docs/en-us/introduction)
- [Amazon Creators API OAuth and regions](https://partnernet.amazon.de/creatorsapi/docs/en-us/get-started/using-curl)
- [Amazon SearchItems](https://partnernet.amazon.de/creatorsapi/docs/en-us/api-reference/operations/search-items)
- [Amazon OffersV2](https://partnernet.amazon.de/creatorsapi/docs/en-us/api-reference/resources/offersV2)
- [Amazon participation policies](https://partnernet.amazon.de/help/operating/policies)
