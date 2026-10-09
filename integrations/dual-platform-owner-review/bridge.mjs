// Owner review: the single shared FitmentResponse drives both presentation adapters.
// This is a PRIVATE synthetic conformance harness, not the consumer app or a live B2B service.
import {assessFitment,validateResponse,SCHEMA_VERSION} from '../fitment-engine-v1-poc/contract.mjs';
import {validateView} from '../business-embed-poc/adapter.mjs';
const outcomes=Object.freeze({
 evidenced_compatible:{consumer:'supported',business:'confirmed'},
 unconfirmed:{consumer:'unclear',business:'unknown'},
 evidenced_incompatible:{consumer:'incompatible',business:'excluded'}
});
const MAX_REASON_LENGTH=600;
const show=(value)=>String(value??'').slice(0,MAX_REASON_LENGTH);
export function inspectOnBothSurfaces(request,{tenantId='demo-tenant',caseId='demo-case'}={}) {
  // Never trust a response pasted by a caller: evaluate from one canonical engine.
  if(!request || request.schemaVersion!==SCHEMA_VERSION)throw Error('Shared contract version required');
  if(typeof tenantId!=='string'||!tenantId.startsWith('demo-')||
     typeof caseId!=='string'||!caseId.startsWith('demo-'))throw Error('Synthetic review context required');
  if(request.datasetKind!=='synthetic'||request.context?.usage!=='private-test')throw Error('Synthetic-only review; real data is not approved for B2B');
  const engine=assessFitment(request);
  if(validateResponse(engine).length)throw Error('Invalid shared engine response');
  if(engine.testOnly!==true||engine.canConfirmFitment!==false||engine.canConfirmPurchase!==false)throw Error('Synthetic permissions violated');
  const states=outcomes[engine.status];
  if(!states)throw Error('Unknown engine status');
  // An evidenced result without a referenced and display-authorized synthetic source
  // must never be presented as positive/negative.
  const ids=engine.sourceIds;
  const evidenceOk=ids.length>0&&engine.sources.length>0&&
    engine.sources.every(s=>s.kind==='synthetic'&&s.id.startsWith('test-'));
  const verified=engine.status==='unconfirmed'?false:evidenceOk;
  const consumerStatus=verified?states.consumer:'unclear';
  const businessStatus=verified?states.business:'unknown';
  const reason=engine.reasons.length?engine.reasons.join(', '):'Synthetische Nachweiskette für einen Testfall';
  const next=engine.nextChecks.length?engine.nextChecks.join('; '):'Keine echte Einbaufreigabe oder Kaufentscheidung';
  const consumer=Object.freeze({
    mode:'synthetic',synthetic:true,status:consumerStatus,
    schemaVersion:engine.schemaVersion,assetId:engine.assetId,partId:engine.partId,assemblyId:engine.assemblyId,
    reasons:Object.freeze([...engine.reasons]),nextChecks:Object.freeze([...engine.nextChecks]),
    evidenceIds:Object.freeze([...engine.evidenceIds]),purchaseAllowed:false,fitmentAuthorized:false
  });
  // Business demo supports only synthetic evidence. Public and tenant-only
  // OEM/partner data must not be projected via this harness.
  const business=validateView({
    presentationVersion:'demo-view/1',tenantId,caseId,outcome:businessStatus,
    reason:show(reason),next:show(next),
    evidence:verified?engine.sources.slice(0,8).map(s=>({
      id:s.id,scope:'public',tenantId:null,label:'Synthetische Testquelle',
      text:'Keine reale OEM- oder Kaufzusage.',rights:'synthetic-test-only'
    })):[]
  },{tenantId,caseId});
  return {engine,consumer,business};
}
