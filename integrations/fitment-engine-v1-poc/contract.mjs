// Shared offline contract. No imports from either product UI and no network/I/O.
export const SCHEMA_VERSION = '1.0.0';
export const ENGINE_VERSION = '1.0.0';
export const POLICY_VERSION = 'vacuum-poc-1';
const text = {type:'string',minLength:1,maxLength:2048};
const nullable = {type:['string','null'],maxLength:2048};
const enumeration = (...values) => ({enum:values});
const array = items => ({type:'array',items,maxItems:10000});
const object = properties => ({type:'object',properties,required:Object.keys(properties),additionalProperties:false});
const identifier = object({namespace:enumeration('manufacturer-model','device-sku','material-number','manufacturer-article','manufacturer-designation','pnc','e-number','product-type','supplier-article','merchant-sku','ean'),issuer:text,value:text});
const identifiers = {...array(identifier),minItems:1};
const scalar = {type:['string','number','boolean','null']};
const source = object({id:text,url:text,publisher:text,kind:enumeration('manufacturer','manufacturer-linked','synthetic'),authoritySourceId:nullable,checkedAt:{type:'string',pattern:'^\\d{4}-\\d{2}-\\d{2}$'},digest:{type:['string','null'],pattern:'^[a-f0-9]{64}$'},locator:text,status:enumeration('verified','unverified','withdrawn'),rights:object({privateTest:enumeration('granted','unknown','denied'),link:enumeration('granted','unknown','denied'),reuse:enumeration('granted','unknown','denied'),reference:nullable})});
const variantScope = object({identifiers,market:nullable,revision:object({mode:enumeration('exact','any','unknown'),value:nullable}),serial:object({mode:enumeration('any','range','unknown'),min:nullable,max:nullable})});
const evidence = object({id:text,assetId:text,partId:text,partIdentifier:identifier,assemblyId:text,assertion:enumeration('compatible','incompatible'),variant:variantScope,sourceIds:{...array(text),minItems:1}});
const request = object({schemaVersion:{const:SCHEMA_VERSION},dataVersion:text,datasetKind:enumeration('catalog','synthetic'),context:object({usage:enumeration('private-test','b2c','b2b')}),asset:object({id:text,category:text,manufacturer:text,model:text}),variant:object({identifiers,revision:nullable,market:nullable,serial:nullable}),assembly:object({id:text}),part:object({id:text,manufacturer:text,identifiers,kind:enumeration('physical','document','device','unknown')}),sources:array(source),evidence:array(evidence),interfaces:object({reviewSourceIds:array(text),requirements:array(object({id:text,assemblyId:text,parameter:text,unit:nullable,actualUnit:nullable,expected:scalar,actual:scalar,sourceIds:{...array(text),minItems:1}}))}),policy:object({risk:enumeration('low','review-required','prohibited','unknown')})});
const response = object({schemaVersion:{const:SCHEMA_VERSION},engineVersion:{const:ENGINE_VERSION},policyVersion:{const:POLICY_VERSION},dataVersion:nullable,assetId:nullable,partId:nullable,assemblyId:nullable,status:enumeration('evidenced_compatible','unconfirmed','evidenced_incompatible'),testOnly:{type:'boolean'},canConfirmFitment:{type:'boolean'},canConfirmPurchase:{const:false},reasons:array(text),nextChecks:array(text),evidenceIds:array(text),sourceIds:array(text),sources:array(object({id:text,url:text,checkedAt:text,locator:text,publisher:text,kind:text,digest:text,authoritySourceId:nullable})),rights:object({reuseAllowed:{type:'boolean'}})});
export const contractSchema = {$schema:'https://json-schema.org/draft/2020-12/schema',$id:'urn:universal-fitment:contract:1.0.0',title:'Shared FitmentRequest / FitmentResponse v1',...request,$defs:{FitmentRequest:request,FitmentResponse:response}};
function freezeSchema(value){if(value&&typeof value==='object'&&!Object.isFrozen(value)){Object.values(value).forEach(freezeSchema);Object.freeze(value);}}
freezeSchema(contractSchema);

// Complete interpreter for the keywords used above; the schema is the single authority.
export function validate(value, schema=request, path='$', errors=[]) {
  if(schema.const!==undefined && value!==schema.const) errors.push(path+':const');
  if(schema.enum && !schema.enum.includes(value)) errors.push(path+':enum');
  const type=value===null?'null':Array.isArray(value)?'array':typeof value;
  if(schema.type && !(Array.isArray(schema.type)?schema.type:[schema.type]).includes(type)) {errors.push(path+':type');return errors;}
  if(type==='number' && !Number.isFinite(value)) errors.push(path+':finite');
  if(type==='string') {
    if(schema.minLength && value.trim().length<schema.minLength) errors.push(path+':minLength');
    if(schema.maxLength && value.length>schema.maxLength) errors.push(path+':maxLength');
    if(schema.pattern && !new RegExp(schema.pattern).test(value)) errors.push(path+':pattern');
  }
  if(type==='array') {
    if(schema.minItems && value.length<schema.minItems)errors.push(path+':minItems');
    if(schema.maxItems && value.length>schema.maxItems)errors.push(path+':maxItems');
    value.forEach((v,i)=>validate(v,schema.items,`${path}[${i}]`,errors));
  }
  if(type==='object') {
    if(Object.getPrototypeOf(value)!==Object.prototype && Object.getPrototypeOf(value)!==null) errors.push(path+':plainObject');
    for(const key of schema.required||[])if(!Object.hasOwn(value,key))errors.push(path+'.'+key+':required');
    for(const key of Object.keys(value)) {
      if(!Object.hasOwn(schema.properties||{},key)) {if(schema.additionalProperties===false)errors.push(path+'.'+key+':additionalProperty');}
      else validate(value[key],schema.properties[key],path+'.'+key,errors);
    }
  }
  return errors;
}
export const validateRequest = value => validate(value);
export const validateResponse = value => validate(value,response);
export const identifierKey = i => JSON.stringify([i.namespace,i.issuer,i.value]);
export const sameIdentifier = (a,b) => identifierKey(a)===identifierKey(b);
export const isOemIdentifier = i => ['material-number','manufacturer-article','manufacturer-designation'].includes(i.namespace);
export function sourceRightsReasons(source,usage) {
  const reasons=[];
  if(source.rights.privateTest!=='granted'||!source.rights.reference)reasons.push('SOURCE_RIGHTS_UNKNOWN');
  if(usage!=='private-test'&&source.rights.reuse!=='granted')reasons.push('SOURCE_REUSE_DENIED');
  return reasons;
}

const hosts = {
  Miele:['miele.de','miele.com'],Bosch:['bosch-home.com'],Siemens:['siemens-home.bsh-group.com'],
  Dyson:['dyson.de','dyson.com'],AEG:['aeg.de','shop.aeg.de'],Rowenta:['rowenta.de'],
  Philips:['home-appliances.philips','philips.de','philips.com'],Samsung:['samsung.com'],
  Hoover:['hoover-home.com','hoover-home.com','hoover.co.uk'],Vorwerk:['vorwerk.com']
};
export function isManufacturerUrl(brand,url) {
  try {const u=new URL(url);return u.protocol==='https:' && !u.username && !u.password && (hosts[brand]||[]).some(h=>u.hostname===h||u.hostname.endsWith('.'+h));}catch{return false;}
}

export function assessFitment(input) {
  const errors=validateRequest(input);
  const out={schemaVersion:SCHEMA_VERSION,engineVersion:ENGINE_VERSION,policyVersion:POLICY_VERSION,dataVersion:errors.length?null:input.dataVersion,assetId:errors.length?null:input.asset.id,partId:errors.length?null:input.part.id,assemblyId:errors.length?null:input.assembly.id,status:'unconfirmed',testOnly:errors.length?false:input.datasetKind==='synthetic',canConfirmFitment:false,canConfirmPurchase:false,reasons:[],nextChecks:[],evidenceIds:[],sourceIds:[],sources:[],rights:{reuseAllowed:false}};
  const reasons=new Set(),used=new Set();
  const finish = () => {
    out.reasons=[...reasons].sort();out.nextChecks=out.reasons.map(code=>NEXT_CHECKS[code]||'Validate the v1 contract and trusted evidence intake.');
    out.evidenceIds.sort();
    if(!errors.length) {
      out.sourceIds=[...used].sort();
      out.sources=out.sourceIds.map(id=>input.sources.find(s=>s.id===id)).filter(s=>s.rights.link==='granted').map(s=>({id:s.id,url:s.url,checkedAt:s.checkedAt,locator:s.locator,publisher:s.publisher,kind:s.kind,digest:s.digest,authoritySourceId:s.authoritySourceId}));
      out.rights.reuseAllowed=used.size>0 && [...used].every(id=>{const r=input.sources.find(s=>s.id===id).rights;return r.reuse==='granted' && !!r.reference;});
    }
    return out;
  };
  if(errors.length){reasons.add('INVALID_CONTRACT');return finish();}
  if(new Set(input.sources.map(s=>s.id)).size!==input.sources.length || new Set(input.evidence.map(e=>e.id)).size!==input.evidence.length || new Set(input.interfaces.requirements.map(r=>r.id)).size!==input.interfaces.requirements.length) {reasons.add('DUPLICATE_ID');return finish();}
  if(input.datasetKind==='synthetic' && input.context.usage!=='private-test') reasons.add('SYNTHETIC_NOT_PRODUCTION');
  if(input.policy.risk!=='low' || !(input.asset.category==='vacuum'||(out.testOnly && input.asset.category==='synthetic-fixture'))) reasons.add('POLICY_BLOCKED');
  if(input.part.kind!=='physical')reasons.add('NOT_PHYSICAL_PART');
  if(input.asset.manufacturer!==input.part.manufacturer)reasons.add('MANUFACTURER_MISMATCH');
  if(!input.part.identifiers.some(i=>isOemIdentifier(i)&&i.issuer===input.part.manufacturer))reasons.add('OEM_IDENTITY_MISSING');
  if(reasons.size)return finish();
  const byId=new Map(input.sources.map(s=>[s.id,s]));
  function validSources(ids, visiting=new Set()) {
    let ok=true;
    for(const id of ids) {
      const s=byId.get(id);
      if(!s || visiting.has(id)){reasons.add('SOURCE_CHAIN_INVALID');ok=false;continue;}
      const day=s?.checkedAt;const validDay=day&&Number.isFinite(Date.parse(day))&&new Date(day).toISOString().slice(0,10)===day;
      if(s.status!=='verified'||!s.digest||!validDay){reasons.add('SOURCE_UNVERIFIED');ok=false;}
      for(const reason of sourceRightsReasons(s,input.context.usage)){reasons.add(reason);ok=false;}
      if(s.kind==='synthetic') {
        if(!out.testOnly || s.publisher!==input.asset.manufacturer || s.url!=='https://manufacturer.test.invalid/evidence'){reasons.add('SOURCE_AUTHORITY_INVALID');ok=false;}
      }else if(s.kind==='manufacturer') {
        if(s.publisher!==input.asset.manufacturer||!isManufacturerUrl(s.publisher,s.url)||s.authoritySourceId!==null){reasons.add('SOURCE_AUTHORITY_INVALID');ok=false;}
      }else {
        // A third-party service needs a checked OEM delegation referring to this exact HTTPS URL.
        const authority=byId.get(s.authoritySourceId);
        let https=false;try{const u=new URL(s.url);https=u.protocol==='https:'&&!u.username&&!u.password;}catch{}
        if(!authority || authority.kind!=='manufacturer'||!authority.locator.includes(s.url)||!https){reasons.add('SOURCE_AUTHORITY_INVALID');ok=false;}
        else {const next=new Set(visiting);next.add(id);if(!validSources([authority.id],next))ok=false;}
      }
      if(ok)used.add(id);
    }
    return ok;
  }
  function matches(e) {
    if(e.assetId!==input.asset.id||e.partId!==input.part.id||e.assemblyId!==input.assembly.id)return false;
    if(!isOemIdentifier(e.partIdentifier)||e.partIdentifier.issuer!==input.part.manufacturer||!input.part.identifiers.some(i=>sameIdentifier(i,e.partIdentifier))){reasons.add('OEM_IDENTITY_MISMATCH');return false;}
    if(e.variant.identifiers.some(i=>!['manufacturer-model','device-sku','material-number','product-type','pnc','e-number'].includes(i.namespace)||i.issuer!==input.asset.manufacturer||!input.variant.identifiers.some(v=>sameIdentifier(i,v)))){reasons.add('VARIANT_MISMATCH');return false;}
    if(input.variant.identifiers.some(i=>!e.variant.identifiers.some(v=>sameIdentifier(i,v)))){reasons.add('VARIANT_MISMATCH');return false;}
    if(!e.variant.market||!input.variant.market){reasons.add('MARKET_UNKNOWN');return false;}
    if(e.variant.market!==input.variant.market){reasons.add('MARKET_MISMATCH');return false;}
    const rev=e.variant.revision;
    if(rev.mode==='unknown'||(rev.mode==='exact'&&!input.variant.revision)|| (rev.mode==='any'&&rev.value!==null)){reasons.add('REVISION_UNKNOWN');return false;}
    if(rev.mode==='exact'&&(!rev.value||rev.value!==input.variant.revision)){reasons.add('REVISION_MISMATCH');return false;}
    const serial=e.variant.serial;
    if(serial.mode==='unknown'){reasons.add('SERIAL_UNKNOWN');return false;}
    if(serial.mode==='any'&&(serial.min!==null||serial.max!==null)){reasons.add('SERIAL_UNKNOWN');return false;}
    if(serial.mode==='range') {
      // v1 supports only explicitly numeric serial intervals; no guessed vendor ordering.
      if(![serial.min,serial.max,input.variant.serial].every(v=>typeof v==='string'&&/^\d+$/.test(v))){reasons.add('SERIAL_UNKNOWN');return false;}
      const [min,max,value]=[serial.min,serial.max,input.variant.serial].map(BigInt);
      if(min>max||value<min||value>max){reasons.add('SERIAL_MISMATCH');return false;}
    }
    return true;
  }
  const applicable=[];
  for(const e of [...input.evidence].sort((a,b)=>a.id<b.id?-1:a.id>b.id?1:0)) {
    if(matches(e)&&validSources(e.sourceIds)){applicable.push(e);out.evidenceIds.push(e.id);}
  }
  if(!applicable.length){reasons.add('NO_EXACT_EVIDENCE');return finish();}
  // Conservative: a malformed/conflicting candidate cannot be hidden behind another claim.
  if(reasons.size)return finish();
  const positive=applicable.some(e=>e.assertion==='compatible'),negative=applicable.some(e=>e.assertion==='incompatible');
  if(positive&&negative){reasons.add('EVIDENCE_CONFLICT');return finish();}
  if(negative){out.status='evidenced_incompatible';reasons.add('EXPLICIT_EXCLUSION');return finish();}
  if(!input.interfaces.reviewSourceIds.length){reasons.add('INTERFACE_REVIEW_MISSING');return finish();}
  validSources(input.interfaces.reviewSourceIds);
  let mismatch=false;
  for(const r of input.interfaces.requirements) {
    if(r.assemblyId!==input.assembly.id){reasons.add('ASSEMBLY_MISMATCH');continue;}
    if(!validSources(r.sourceIds))continue;
    if(r.unit!==r.actualUnit){reasons.add('INTERFACE_UNITS_UNKNOWN');continue;}
    if(r.expected===null||r.actual===null){reasons.add('INTERFACE_UNKNOWN');continue;}
    if(r.expected!==r.actual)mismatch=true;
  }
  if(reasons.size)return finish();
  if(mismatch){out.status='evidenced_incompatible';reasons.add('INTERFACE_MISMATCH');return finish();}
  out.status='evidenced_compatible';out.canConfirmFitment=!out.testOnly;reasons.add('EXACT_EVIDENCE_AND_INTERFACES');return finish();
}
export const NEXT_CHECKS=Object.freeze({
  INVALID_CONTRACT:'Supply the exact supported schemaVersion and all required fields.',
  VARIANT_MISMATCH:'Read the complete device identifier from the type plate; obtain evidence for that exact variant.',
  REVISION_UNKNOWN:'Read the revision or obtain an explicit manufacturer statement covering every revision.',
  REVISION_MISMATCH:'Obtain evidence for the observed revision.',
  OEM_IDENTITY_MISSING:'Obtain the manufacturer-issued article identity; merchant SKUs and EANs are insufficient.',
  OEM_IDENTITY_MISMATCH:'Compare the exact manufacturer-issued article namespace, issuer and value.',
  SOURCE_UNVERIFIED:'Review the source content, locator, observation date and digest.',
  SOURCE_RIGHTS_UNKNOWN:'Record the permission for this use with its reference; public access is insufficient.',
  SOURCE_REUSE_DENIED:'Obtain explicit permission for the B2C/B2B use before sharing evidence-derived decisions.',
  SOURCE_CHAIN_INVALID:'Repair the missing or cyclic evidence/delegation references.',
  SOURCE_AUTHORITY_INVALID:'Verify the manufacturer domain or its explicit delegation to this service.',
  INTERFACE_REVIEW_MISSING:'Review installation and connected assemblies; record the review source even if no conditions apply.',
  INTERFACE_UNKNOWN:'Obtain the missing connection value and its source; do not infer dimensions.',
  INTERFACE_UNITS_UNKNOWN:'Obtain values in the same documented unit; v1 does not guess or convert units.',
  INTERFACE_MISMATCH:'Resolve the evidenced connection mismatch before selecting this part.',
  NO_EXACT_EVIDENCE:'Obtain an explicit manufacturer claim for this asset, variant, assembly and article.',
  EVIDENCE_CONFLICT:'Review conflicting positive and negative claims; neither may authorize selection.',
  POLICY_BLOCKED:'Obtain category and safety review; the default policy denies unknown or high-risk cases.',
  MARKET_UNKNOWN:'Read the country/market variant and obtain market-specific evidence.',
  MARKET_MISMATCH:'Obtain a manufacturer statement for the actual market; do not transfer regional fitments.',
  SERIAL_UNKNOWN:'Obtain explicit serial scope; an unknown interval is not universal.',
  SERIAL_MISMATCH:'Obtain a manufacturer claim for the observed serial interval.',
  ASSEMBLY_MISMATCH:'Identify and check the connected assembly separately.',
  NOT_PHYSICAL_PART:'Select a physical component; documents and complete devices do not count as replacement parts.',
  MANUFACTURER_MISMATCH:'Obtain a separately reviewed cross-manufacturer interchange approval.',
  SYNTHETIC_NOT_PRODUCTION:'Keep synthetic fixtures in private tests.',
  DUPLICATE_ID:'Resolve duplicate source, evidence or connection identifiers.',
  EXPLICIT_EXCLUSION:'Select another component only after a separate positive assessment.',
  EXACT_EVIDENCE_AND_INTERFACES:'Follow the source-backed installation instructions; merchant availability requires a separate authorized feed.'
});
