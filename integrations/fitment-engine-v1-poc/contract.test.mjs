import {test} from 'node:test';
import assert from 'node:assert/strict';
import {assessFitment,validateRequest,validateResponse,contractSchema,identifierKey,isManufacturerUrl,sourceRightsReasons} from './contract.mjs';
import {syntheticRequest,realCatalogUnknownRequest} from './fixtures.mjs';
const assess=r=>{const before=JSON.stringify(r);const out=assessFitment(r);assert.deepEqual(validateResponse(out),[]);assert.equal(JSON.stringify(r),before,'pure: request unchanged');assert.equal(out.canConfirmPurchase,false);return out;};
test('supported strict request/response; schema has no public endpoint',()=>{assert.deepEqual(validateRequest(syntheticRequest()),[]);assert.equal(contractSchema.$id,'urn:universal-fitment:contract:1.0.0');});
test('positive complete synthetic chain is explicitly test-only, never authorizes purchase or real fitment',()=>{const o=assess(syntheticRequest());assert.equal(o.status,'evidenced_compatible');assert.equal(o.canConfirmFitment,false);assert.equal(o.testOnly,true);assert.deepEqual(o.evidenceIds,['test-claim']);assert.equal(o.sources[0].id,'test-source');});
const mutations = [
 ['unsupported major version',r=>r.schemaVersion='2.0.0','INVALID_CONTRACT'],
 ['unsupported minor version',r=>r.schemaVersion='1.1.0','INVALID_CONTRACT'],
 ['missing mandatory field',r=>delete r.variant,'INVALID_CONTRACT'],
 ['unknown property',r=>r.fitmentConfirmed=true,'INVALID_CONTRACT'],
 ['invalid risk',r=>r.policy.risk='guaranteed','INVALID_CONTRACT'],
 ['same brand different execution',r=>r.variant.identifiers[0].value='TEST-ASSET-B','VARIANT_MISMATCH'],
 ['identifier suffix cannot be erased',r=>r.variant.identifiers[0].value='TEST-ASSET/99','VARIANT_MISMATCH'],
 ['different OEM number',r=>r.part.identifiers[0]={...r.part.identifiers[0],value:'TEST-PART-B'},'OEM_IDENTITY_MISMATCH'],
 ['merchant SKU is not OEM',r=>r.part.identifiers[0]={...r.part.identifiers[0],namespace:'merchant-sku'},'OEM_IDENTITY_MISSING'],
 ['EAN is not OEM',r=>r.part.identifiers[0]={...r.part.identifiers[0],namespace:'ean'},'OEM_IDENTITY_MISSING'],
 ['supplier SKU is not OEM',r=>r.part.identifiers[0]={...r.part.identifiers[0],namespace:'supplier-article'},'OEM_IDENTITY_MISSING'],
 ['issuer is scoped',r=>r.part.identifiers[0]={...r.part.identifiers[0],issuer:'Other'},'OEM_IDENTITY_MISSING'],
 ['source namespace mismatch',r=>r.evidence[0].partIdentifier={...r.evidence[0].partIdentifier,namespace:'merchant-sku'},'OEM_IDENTITY_MISMATCH'],
 ['unknown revision',r=>r.variant.revision=null,'REVISION_UNKNOWN'],
 ['unreviewed revision scope',r=>r.evidence[0].variant.revision={mode:'unknown',value:null},'REVISION_UNKNOWN'],
 ['wrong revision',r=>r.variant.revision='TEST-REV-B','REVISION_MISMATCH'],
 ['malformed any revision',r=>r.evidence[0].variant.revision={mode:'any',value:'guessed'},'REVISION_UNKNOWN'],
 ['unknown serial scope',r=>r.evidence[0].variant.serial.mode='unknown','SERIAL_UNKNOWN'],
 ['missing numeric serial',r=>r.evidence[0].variant.serial={mode:'range',min:'1',max:'20'},'SERIAL_UNKNOWN'],
 ['serial outside interval',r=>{r.variant.serial='21';r.evidence[0].variant.serial={mode:'range',min:'1',max:'20'};},'SERIAL_MISMATCH'],
 ['serial interval reversed',r=>{r.variant.serial='15';r.evidence[0].variant.serial={mode:'range',min:'20',max:'1'};},'SERIAL_MISMATCH'],
 ['malformed universal serial scope',r=>r.evidence[0].variant.serial.min='1','SERIAL_UNKNOWN'],
 ['unknown market',r=>r.variant.market=null,'MARKET_UNKNOWN'],
 ['different market',r=>r.variant.market='OTHER','MARKET_MISMATCH'],
 ['no explicit edge',r=>r.evidence=[],'NO_EXACT_EVIDENCE'],
 ['wrong asset binding',r=>r.evidence[0].assetId='OTHER','NO_EXACT_EVIDENCE'],
 ['wrong part binding',r=>r.evidence[0].partId='OTHER','NO_EXACT_EVIDENCE'],
 ['wrong assembly binding',r=>r.evidence[0].assemblyId='OTHER','NO_EXACT_EVIDENCE'],
 ['missing source reference',r=>r.evidence[0].sourceIds=['missing'],'SOURCE_CHAIN_INVALID'],
 ['unverified source',r=>r.sources[0].status='unverified','SOURCE_UNVERIFIED'],
 ['withdrawn source',r=>r.sources[0].status='withdrawn','SOURCE_UNVERIFIED'],
 ['missing digest',r=>r.sources[0].digest=null,'SOURCE_UNVERIFIED'],
 ['bad digest',r=>r.sources[0].digest='not-hash','INVALID_CONTRACT'],
 ['impossible date',r=>r.sources[0].checkedAt='2026-02-30','SOURCE_UNVERIFIED'],
 ['unknown private use rights',r=>r.sources[0].rights.privateTest='unknown','SOURCE_RIGHTS_UNKNOWN'],
 ['denied private use rights',r=>r.sources[0].rights.privateTest='denied','SOURCE_RIGHTS_UNKNOWN'],
 ['missing rights reference',r=>r.sources[0].rights.reference=null,'SOURCE_RIGHTS_UNKNOWN'],
 ['untrusted domain',r=>r.sources[0].url='https://shop.invalid/part','SOURCE_AUTHORITY_INVALID'],
 ['untrusted publisher',r=>r.sources[0].publisher='Other','SOURCE_AUTHORITY_INVALID'],
 ['duplicate source id',r=>r.sources.push(structuredClone(r.sources[0])),'DUPLICATE_ID'],
 ['duplicate claim id',r=>r.evidence.push(structuredClone(r.evidence[0])),'DUPLICATE_ID'],
 ['duplicate connection id',r=>r.interfaces.requirements.push(structuredClone(r.interfaces.requirements[0])),'DUPLICATE_ID'],
 ['absent installation review',r=>r.interfaces.reviewSourceIds=[],'INTERFACE_REVIEW_MISSING'],
 ['unknown connection shape',r=>r.interfaces.requirements[0].actual=null,'INTERFACE_UNKNOWN'],
 ['unknown required dimension',r=>r.interfaces.requirements[0].expected=null,'INTERFACE_UNKNOWN'],
 ['units differ',r=>r.interfaces.requirements[0].actualUnit='other-unit','INTERFACE_UNITS_UNKNOWN'],
 ['unverified connection evidence',r=>r.interfaces.requirements[0].sourceIds=['missing'],'SOURCE_CHAIN_INVALID'],
 ['different connected assembly',r=>r.interfaces.requirements[0].assemblyId='OTHER','ASSEMBLY_MISMATCH'],
 ['documents are not physical parts',r=>r.part.kind='document','NOT_PHYSICAL_PART'],
 ['whole devices are not parts',r=>r.part.kind='device','NOT_PHYSICAL_PART'],
 ['cross-manufacturer unapproved',r=>r.part.manufacturer='Other','MANUFACTURER_MISMATCH'],
 ['unknown category default deny',r=>r.asset.category='unknown-category','POLICY_BLOCKED'],
 ['high risk category default deny',r=>r.asset.category='automotive','POLICY_BLOCKED'],
 ['review required',r=>r.policy.risk='review-required','POLICY_BLOCKED'],
 ['prohibited risk',r=>r.policy.risk='prohibited','POLICY_BLOCKED'],
 ['unknown risk',r=>r.policy.risk='unknown','POLICY_BLOCKED'],
 ['synthetic B2C denied',r=>r.context.usage='b2c','SYNTHETIC_NOT_PRODUCTION'],
 ['synthetic B2B denied',r=>r.context.usage='b2b','SYNTHETIC_NOT_PRODUCTION']
];
for(const [name,mutate,reason]of mutations)test(name,()=>{const r=syntheticRequest();mutate(r);const o=assess(r);assert.equal(o.status,'unconfirmed');assert.equal(o.canConfirmFitment,false);assert.ok(o.reasons.includes(reason),JSON.stringify(o));});
test('malformed input returns safe response',()=>{for(const v of [null,undefined,[],{},'bad',1])assert.equal(assess(v).status,'unconfirmed');});
test('explicit incompatible exact variant',()=>{const r=syntheticRequest();r.evidence[0].assertion='incompatible';const o=assess(r);assert.equal(o.status,'evidenced_incompatible');assert.deepEqual(o.reasons,['EXPLICIT_EXCLUSION']);});
test('main assembly matches but connected synthetic thread differs: incompatible',()=>{const r=syntheticRequest();r.interfaces.requirements[0]={...r.interfaces.requirements[0],parameter:'synthetic-thread-diameter',unit:'synthetic-unit',actualUnit:'synthetic-unit',expected:20,actual:21};const o=assess(r);assert.equal(o.status,'evidenced_incompatible');assert.deepEqual(o.reasons,['INTERFACE_MISMATCH']);});
test('exact typed values: no automatic string/number or unit conversion',()=>{const r=syntheticRequest();r.interfaces.requirements[0].expected=20;r.interfaces.requirements[0].actual='20';assert.equal(assess(r).status,'evidenced_incompatible');});
test('conflicting exclusion blocks compatible claim',()=>{const r=syntheticRequest();r.evidence.push({...structuredClone(r.evidence[0]),id:'other-claim',assertion:'incompatible'});assert.deepEqual(assess(r).reasons,['EVIDENCE_CONFLICT']);});
test('numeric serial inclusive endpoints; no vendor-specific lexicographic guess',()=>{for(const serial of ['1','20','00020']){const r=syntheticRequest();r.variant.serial=serial;r.evidence[0].variant.serial={mode:'range',min:'1',max:'20'};assert.equal(assess(r).status,'evidenced_compatible');}});
test('reviewed all revisions is explicit, never inferred',()=>{const r=syntheticRequest();r.variant.revision=null;r.evidence[0].variant.revision={mode:'any',value:null};assert.equal(assess(r).status,'evidenced_compatible');});
test('reviewed no interface conditions allowed only with review evidence',()=>{const r=syntheticRequest();r.interfaces.requirements=[];assert.equal(assess(r).status,'evidenced_compatible');r.interfaces.reviewSourceIds=[];assert.equal(assess(r).status,'unconfirmed');});
test('link permission does not grant commercial reuse',()=>{const r=syntheticRequest();assert.equal(assess(r).rights.reuseAllowed,false);r.sources[0].rights.link='denied';assert.deepEqual(assess(r).sources,[]);assert.equal(assess(r).status,'evidenced_compatible');});
test('real recorded Miele listing remains unconfirmed, no fabricated conditions',()=>{const r=realCatalogUnknownRequest();assert.equal(assess(r).status,'unconfirmed');assert.equal(assess(r).testOnly,false);assert.equal(r.variant.revision,null);assert.equal(r.sources[0].digest,null);});
test('B2C and B2B receive byte-identical real catalog decision',()=>{const a=realCatalogUnknownRequest(),b=structuredClone(a);a.context.usage='b2c';b.context.usage='b2b';assert.equal(JSON.stringify(assess(a)),JSON.stringify(assess(b)));});
test('stable order under source and claim permutation',()=>{const r=syntheticRequest();r.sources.push({...r.sources[0],id:'another-source'});r.evidence.push({...structuredClone(r.evidence[0]),id:'another-claim',sourceIds:['another-source']});const a=assess(r);r.sources.reverse();r.evidence.reverse();assert.deepEqual(a,assess(r));});
test('strict issuer/namespace/value: zeros, case and punctuation remain significant',()=>{const a={namespace:'material-number',issuer:'Bosch',value:'001'};assert.notEqual(identifierKey(a),identifierKey({...a,value:'1'}));assert.notEqual(identifierKey(a),identifierKey({...a,issuer:'Siemens'}));});
test('manufacturer URL boundaries reject spoofing, credentials and HTTP',()=>{assert.equal(isManufacturerUrl('Miele','https://www.miele.de/product/11602400/x'),true);for(const url of ['https://miele.de.attacker.invalid/x','https://user:secret@miele.de/x','http://miele.de/x','not-url'])assert.equal(isManufacturerUrl('Miele',url),false);});
test('merchant device identity cannot assert exact variant even if matching both sides',()=>{const r=syntheticRequest();r.variant.identifiers[0].namespace='merchant-sku';r.evidence[0].variant.identifiers[0].namespace='merchant-sku';assert.equal(assess(r).status,'unconfirmed');});
test('missing and cyclic manufacturer delegation cannot authenticate third-party claims',()=>{for(const authority of [null,'missing','test-source']){const r=syntheticRequest();r.sources[0].kind='manufacturer-linked';r.sources[0].authoritySourceId=authority;assert.equal(assess(r).status,'unconfirmed');}});
test('synthetic evidence cannot be relabelled as catalog manufacturer evidence',()=>{const r=syntheticRequest();r.datasetKind='catalog';r.asset.category='vacuum';assert.equal(assess(r).status,'unconfirmed');});
test('non-finite connection values refused by strict JSON contract',()=>{for(const n of [NaN,Infinity,-Infinity]){const r=syntheticRequest();r.interfaces.requirements[0].actual=n;assert.deepEqual(assess(r).reasons,['INVALID_CONTRACT']);}});
test('immutable request is valid; function needs no ambient clock/network/randomness',()=>{const r=syntheticRequest();function freeze(v){if(v&&typeof v==='object'){Object.values(v).forEach(freeze);Object.freeze(v);}}freeze(r);assert.equal(assess(r).status,'evidenced_compatible');});
test('additional observed variant identity cannot be silently ignored',()=>{const r=syntheticRequest();r.variant.identifiers.push({namespace:'pnc',issuer:'Synthetic Fixture',value:'TEST-OTHER-VARIANT'});assert.equal(assess(r).status,'unconfirmed');});
test('schema cannot be mutated by consumer import',()=>{assert.ok(Object.isFrozen(contractSchema));assert.throws(()=>contractSchema.$defs.FitmentRequest.properties.schemaVersion.const='2.0.0',TypeError);});
test('B2C/B2B rights gate: unknown/denied reuse never promoted from link/private permission',()=>{const s=syntheticRequest().sources[0];for(const rights of ['unknown','denied']){s.rights.reuse=rights;for(const usage of ['b2c','b2b'])assert.deepEqual(sourceRightsReasons(s,usage),['SOURCE_REUSE_DENIED']);assert.deepEqual(sourceRightsReasons(s,'private-test'),[]);}});
test('B2C and B2B rights checks identical for explicit synthetic permission',()=>{const s=syntheticRequest().sources[0];s.rights.reuse='granted';assert.deepEqual(sourceRightsReasons(s,'b2c'),[]);assert.deepEqual(sourceRightsReasons(s,'b2b'),[]);});
test('permission label without reference never grants use',()=>{const s=syntheticRequest().sources[0];s.rights.reuse='granted';s.rights.reference=null;for(const usage of ['private-test','b2c','b2b'])assert.deepEqual(sourceRightsReasons(s,usage),['SOURCE_RIGHTS_UNKNOWN']);});
