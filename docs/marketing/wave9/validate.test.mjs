import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateManifest } from './validate.mjs';
const original = JSON.parse(readFileSync(new URL('./campaign-manifest.json',import.meta.url),'utf8'));
const mutate = (edit) => { const m=structuredClone(original);edit(m);return m; };
test('baseline: content strictly private and legal gate blocked',()=>assert.deepEqual(validateManifest(original),[]));
const negatives=[
['launch authority',m=>m.externalPublicationAuthorized=true,'snapshot.externalPublicationAuthorized'],
['release GO',m=>m.releaseState='GO','snapshot.releaseState'],
['money spent',m=>m.budgetSpentEUR=5,'snapshot.budgetSpentEUR'],
['post sent',m=>m.publicationActions=1,'snapshot.publicationActions'],
['leads stored',m=>m.leadsCollected=1,'snapshot.leadsCollected'],
['invented partners',m=>m.confirmedPartners=2,'snapshot.confirmedPartners'],
['invented user metrics',m=>m.publicUserClaims=23,'snapshot.publicUserClaims'],
['positive real fit',m=>m.verifiedRealFits=1,'snapshot.verifiedRealFits'],
['draft 29 as live',m=>m.currentConsumerDevices=29,'snapshot.currentConsumerDevices'],
['200 categories claimed active',m=>m.plannedInactiveLeafCategories=0,'snapshot.plannedInactiveLeafCategories'],
['wrong 200 pilot count',m=>m.privatePilotLeafCategories=200,'snapshot.privatePilotLeafCategories'],
['asset published',m=>m.assets[0].published=true,'assets[0].release_gate'],
['owner approval assumed',m=>m.assets[0].ownerApproval=true,'assets[0].release_gate'],
['legal approval assumed',m=>m.assets[0].legalApproval=true,'assets[0].release_gate'],
['uses personal data',m=>m.assets[0].usesPersonalData=true,'assets[0].personal_data'],
['image used before rights',m=>m.assets[0].mediaUsed=true,'assets[0].media_use_not_authorized'],
['scraped third-party image',m=>m.assets[0].mediaRights='third_party_scraped','assets[0].media_rights'],
['duplicate id',m=>m.assets[1].id=m.assets[0].id,'assets[1].duplicate_id'],
['guaranteed compatibility',m=>m.assets[0].copy='Garantiert passend – jetzt herunterladen.','assets[0].unsupported_claim.copy'],
['false user base',m=>m.assets[0].copy='Millionen Nutzer verwenden das Produkt.','assets[0].unsupported_claim.copy'],
['lead URL injected',m=>m.assets[0].cta='https://example.org/signup','assets[0].outbound_link.cta'],
['invalid channel',m=>m.assets[0].channel='other','assets[0].channel'],
['outside reserved file set',m=>m.assets[0].doc='../STRATEGY.md','assets[0].doc'],
['safety review skipped',m=>m.assets[0].safetyReview='done','assets[0].safety_review'],
['b2b marketed on wrong channel',m=>m.assets[8].channel='tiktok','assets[8].b2b_channel'],
['missing assets',m=>m.assets=[],'assets.missing_or_too_few'],
['incorrect owner evidence',m=>m.referenceOwnerSha='bad','snapshot.referenceOwnerSha']
];
for (const [name,edit,expected] of negatives)
  test('reject '+name,()=>assert.ok(validateManifest(mutate(edit)).includes(expected),expected));
