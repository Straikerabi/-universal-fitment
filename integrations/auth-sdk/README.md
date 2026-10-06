# Pilot authentication – v1.13

The static app uses the existing project's enabled email/password Auth provider for **existing accounts only**. No user account, password, invitation, registration or test email was created. The API's private database pilot-permission table remains empty; marketplace credentials and live calls remain disabled.

Account UI: `#account`; protected search buttons: individual part details. Guest catalog/cart workflows remain available. Sign-in uses `signInWithPassword`, followed by server-verified `getUser`. SDK session storage is memory-only (`persistSession:false`), with SDK token refresh, no callback URL parsing and local-scope logout. Closing/reloading ends the local session. No cross-device data sync is implemented. Login transmits email/password directly to the project Auth endpoint; no app password/token storage or logging is added.

The frontend contains only the project's existing **publishable** API key. Search POSTs carry the current user access token, exact catalog part key, provider and condition. The server independently validates the user and database pilot permission, then applies persistent quota before live provider dispatch. Listing URLs, age, condition, currency and test-data flags are sanitized again in the client; identity and fitment stay unverified, shipping/delivery stay unknown. Results arriving after logout or route replacement cannot repopulate visible offers. Service worker cross-origin requests bypass caching.

## Rebuild the local SDK

Pinned npm dependencies and integrity lock are included here. From this directory:

```sh
npm ci
./node_modules/.bin/esbuild node_modules/@supabase/supabase-js/dist/index.mjs --bundle --format=esm --platform=browser --minify --legal-comments=eof --outfile=../../site/src/vendor/supabase.js
```

Supabase JS 2.117.2, esbuild 0.25.12. Runtime licenses are in `site/src/vendor/LICENSES.txt`. No third-party CDN request is needed. The CI reconstructs the complete site from versioned patches and runs the client tests.

## Remaining release dependencies

1. Create an actual pilot account through an authorized secure account workflow; confirm it and grant its verified UUID a time-limited entry in the private pilot-permission table through an authorized administrator. No shared/default password and no credential exchange in chat.
2. Verify positive login, token refresh/logout and the authenticated 403/access-required response with that real account. Tests so far use synthetic Auth/API contracts; they do not prove a real login.
3. Public signup, reset-password and magic-link UI require configured mail delivery, permitted redirect URLs and final operator/privacy information. The public Auth settings read confirmed `external.email:true`, email confirmation enabled and social providers disabled. This read does not reveal SMTP configuration.
4. The default Supabase SMTP service only delivers to organization team addresses and is not a public-user production mail service. No custom SMTP provider/account or paid subscription has been configured in this increment.
5. Activate legitimate eBay/Amazon access before enabling live calls. No automatic merchant cart transfer or payment processing is implemented.

Primary references checked 2026-10-06: https://supabase.com/docs/guides/auth/passwords ; https://supabase.com/docs/guides/auth/auth-smtp ; https://supabase.com/docs/guides/auth/auth-email-passwordless
