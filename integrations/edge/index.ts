import { createMarketplaceHandler } from './handler.mjs';
import { createEbayProvider, createAmazonProvider } from './marketplace-providers.mjs';
import { partIndex } from './part-index.mjs';

const env = Deno.env.toObject();
Deno.serve(createMarketplaceHandler({
  env, partIndex,
  providers: { ebay: createEbayProvider({env}), amazon: createAmazonProvider({env}) }
}));
