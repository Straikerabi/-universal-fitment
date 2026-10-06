import { createMarketplaceHandler } from './handler.mjs';
import { createEbayProvider, createAmazonProvider } from './marketplace-providers.mjs';
import { partIndex } from './part-index.mjs';
import { createQuotaReservation } from './marketplace-quota.mjs';

const env = Deno.env.toObject();
const reserveQuota = createQuotaReservation({env});
let quotaBackendVerifiedAtStartup = false;
try { quotaBackendVerifiedAtStartup = await reserveQuota.probe(); } catch {}
Deno.serve(createMarketplaceHandler({
  env, partIndex, reserveQuota, quotaBackendVerifiedAtStartup,
  providers: { ebay: createEbayProvider({env}), amazon: createAmazonProvider({env}) }
}));
