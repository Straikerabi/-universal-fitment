# Cart handoff and payment model — v1.12

The pilot uses an outbound shopping plan. Universal Fitment retains part identities, desired quantities, dated price records and seller-independent search notes. The user opens each merchant, chooses the concrete offer/condition, adds the quantity there and completes that merchant's checkout. Multiple shops remain separate orders. Product prices and shipping totals are planning snapshots, not payment authorizations.

## Implemented now

- A clear cart action routes to a merchant handoff page.
- Exact source product URLs, part reference pages and marketplace searches have different labels. References/searches never become a selected offer or current stock merely because they have a link.
- Each line shows part number, desired quantity and a captured sale unit where applicable. Copying works for the complete list or one merchant group.
- A fresh price snapshot may retain the existing gross EUR planning total. Search notes, old/unknown prices or shipping keep the final total open.
- Opening a link or copying a list does not clear the cart, submit an order, charge a buyer, create a seller cart or mark an order paid. No foreign-cart contents or purchase confirmation are read.
- Unsafe links are rejected. Missing links remain unresolved. An unselected reference may use its known part-source page; a device material number is never used as a substitute product.

`site/src/core/handoff.js` exposes `buildHandoffPlan` and `handoffListText` as pure functions. Capabilities explicitly report `automaticCartTransfer: false`, `createsOrder: false` and `acceptsPayment: false`. Tests cover mixed merchants, source/search/reference distinctions, quantities, preserved cart state, unsafe URLs, older prices and clipboard text. DOM tests verify the complete cart-to-handoff route and copy actions.

## Deferred, requiring separate access and validation

| Feature | Required before implementation |
| --- | --- |
| eBay checkout embedded in our app | Specific Order API approval, supported marketplace/offer, authenticated member or approved guest flow, eBay checkout requirements and a server integration |
| Amazon cart transfer | A current supported partner/cart mechanism, verified offer identifiers and permitted use in the target marketplace; verify the exact seller/condition, especially for used goods |
| Other merchant cart transfer | Documented supported integration and consent/agreements from that merchant; do not invent add-to-cart URLs or private endpoints |
| Our own marketplace payment | Defined seller/payment roles, partner agreements, seller onboarding, order and fulfillment processes, a backend and payment/refund/dispute handling |

eBay documents separate member and guest checkout APIs and requires checkout approval. The existing v1.11 Browse provider is not an approved Order API integration and cannot be silently used to buy.

Amazon's current Creators API documents catalog/search operations, not a consumer cart-transfer operation. An older Associates FAQ mentions an Add-to-Cart form; its linked documentation now redirects to the PA-API deprecation notice. Therefore it is not treated as a verified current cart contract. There are no selected Amazon ASIN/offer records in the public search templates. A plain part search cannot choose a seller, used condition or quantity.

An own-platform payment processor would not, by itself, submit or fulfill an Amazon/eBay order. Stripe's marketplace documentation describes a separate seller/account, payment, payout and refund/dispute integration. The exact commercial/payment roles must be chosen before implementing that model. No payment account or fee collection is enabled by v1.12.

## Primary references checked 2026-10-06

- [eBay Order API](https://www.developer.ebay.com/api-docs/buy/static/api-order.html)
- [eBay checkout approval and UI requirements](https://developer.ebay.com/api-docs/buy/buy-requirements.html)
- [Amazon Creators API operations](https://partnernet.amazon.de/creatorsapi/docs/en-us/introduction)
- [Amazon historical cart FAQ](https://partnernet.amazon.de/help/node/topic/GUVFJTV7MGMMNY94)
- [Amazon PA-API deprecation notice reached from the cart-form link](https://affiliate-program.amazon.com/creatorsapi/docs/en-us/paapiv5-deprecation)
- [Stripe marketplace architecture](https://docs.stripe.com/connect/marketplace)
