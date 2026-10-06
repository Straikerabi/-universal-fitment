import { createMarketplaceHandler } from './handler.mjs';
import { createEbayProvider, createAmazonProvider } from './marketplace-providers.mjs';
import { partIndex } from './part-index.mjs';
import { createQuotaReservation } from './marketplace-quota.mjs';
import { createPilotAuthorization } from './marketplace-pilot.mjs';

const env = Deno.env.toObject();
const reserveQuota = createQuotaReservation({env});
const authorizePilot = createPilotAuthorization({env});
let pilotBackendVerifiedAtStartup = false;
try { pilotBackendVerifiedAtStartup = await authorizePilot.probe(); } catch {}
let quotaBackendVerifiedAtStartup = false;
try { quotaBackendVerifiedAtStartup = await reserveQuota.probe(); } catch {}
Deno.serve(createMarketplaceHandler({
  env, partIndex, reserveQuota, authorizePilot, pilotBackendVerifiedAtStartup, quotaBackendVerifiedAtStartup,
  providers: { ebay: createEbayProvider({env}), amazon: createAmazonProvider({env}) }
}));
