// Consume the owner's single engine and projection. No compatibility rules here.
import {buildSyntheticUiRequest} from '../dual-platform-owner-review/ui-fixtures.mjs';
import {inspectOnBothSurfaces} from '../dual-platform-owner-review/bridge.mjs';
import {validateRequest,validateResponse,SCHEMA_VERSION} from '../fitment-engine-v1-poc/contract.mjs';
import {createAdapter} from './adapter.mjs';
import {listScenarios} from './fixtures.mjs';
const copy=Object.freeze({
 EXACT_EVIDENCE_AND_INTERFACES:['Der synthetische Beleg und die Anschlussprüfung decken genau diesen Testfall ab.','Keine reale Einbau- oder Kaufbestätigung.'],
 REVISION_UNKNOWN:['Die Revision fehlt. Ein gleicher Modellname reicht nicht.','Revision am Typenschild prüfen; bis dahin offen lassen.'],
 EXPLICIT_EXCLUSION:['Der synthetische Beleg schließt diese Ausführung ausdrücklich aus.','Anderes Teil nur mit einer eigenen belegten Prüfung auswählen.'],
 OEM_IDENTITY_MISSING:['Eine Händler-SKU ersetzt keine Hersteller-Teilenummer.','Hersteller-Code und verifizierte SKU-Zuordnung anfordern.'],
 INTERFACE_UNKNOWN:['Eine geprüfte Anschlussangabe fehlt.','Anschlusskennung anhand eines passenden Belegs ergänzen.'],
 NO_EXACT_EVIDENCE:['Kein exakter Beleg für diese Geräte-/Teilausführung verfügbar.','Fehlende Varianten- und Teileangaben klären.']
});

export function canonicalRequest(request,context) {
 const c=listScenarios(context.tenantId).find(s=>s.id===request.caseId);
 if(!c||request.caseId!==context.caseId||request.asset!==c.asset||request.part!==c.part||typeof request.variantKnown!=='boolean')throw Error('Exact synthetic request required');
 const input=buildSyntheticUiRequest(c.id,{identity:c.asset,variantKnown:request.variantKnown});
 if(validateRequest(input).length||input.datasetKind!=='synthetic'||input.context.usage!=='private-test')throw Error('Synthetic v1 input required');
 return input;
}
export function createBusinessAdapter({inspect=inspectOnBothSurfaces}={}) {
 return createAdapter({
  invoke:(request,context)=>{
   const input=canonicalRequest(request,context);
   return {decision:inspect(input,{tenantId:'demo-'+context.tenantId,caseId:'demo-'+context.caseId}),tenantId:context.tenantId,caseId:context.caseId};
  },
  validateContract:(raw,request,context)=>{
   const input=canonicalRequest(request,context),r=raw?.decision?.engine;
   return raw.tenantId===context.tenantId&&raw.caseId===context.caseId&&r?.schemaVersion===SCHEMA_VERSION&&validateResponse(r).length===0&&r.testOnly===true&&r.canConfirmFitment===false&&r.canConfirmPurchase===false&&
    r.assetId===input.asset.id&&r.partId===input.part.id&&r.assemblyId===input.assembly.id&&r.dataVersion===input.dataVersion&&
    r.sourceIds.every(id=>input.sources.some(s=>s.id===id))&&r.evidenceIds.every(id=>input.evidence.some(e=>e.id===id))&&
    r.sources.every(s=>s.kind==='synthetic'&&s.url==='https://manufacturer.test.invalid/evidence'&&input.sources.some(i=>i.id===s.id))&&
    raw.decision.business?.tenantId==='demo-'+context.tenantId&&raw.decision.business?.caseId==='demo-'+context.caseId&&
    raw.decision.business.evidence.every(e=>r.sources.some(s=>s.id===e.id));
  },
  mapToView:(raw,context)=>{
   const view=raw.decision.business;
   const expected={evidenced_compatible:'confirmed',unconfirmed:'unknown',evidenced_incompatible:'excluded'}[raw.decision.engine.status];
   // Owner may conservatively downgrade a result; never upgrade its status.
   if(view.outcome!==expected&&view.outcome!=='unknown')throw Error('Projection changed engine status');
   const evidence=view.evidence.map(e=>context.caseId==='private'?{...e,id:'SYN-'+context.tenantId+'-PRIVATE',scope:'tenant',tenantId:context.tenantId,text:e.text+' · Quellkennung: '+e.id}:{...e});
   const codes=raw.decision.engine.reasons;
   return {...view,tenantId:context.tenantId,caseId:context.caseId,evidence,
    reason:codes.map(code=>`${copy[code]?.[0]||'Weitere Prüfung erforderlich.'} (${code})`).join(' '),
    next:codes.map(code=>copy[code]?.[1]||'Offene Prüfung anhand des gemeinsamen Vertrags klären.').join(' ')};
  }
 });
}

// Selection lifecycle, not a fitment rule: late results cannot resurrect a previous case.
export function createSelectionSession() {
 let revision=0;
 return {invalidate(){revision++;},async run(task){const token=++revision;const value=await task();return token===revision?{current:true,value}:{current:false,value:null};}};
}
