// All names, identifiers, evidence and offers are fictional. No fitment inference.
export const tenants = Object.freeze({
  atelier: {name:'Atelier Teile · DEMO', initials:'AT', theme:'teal', tagline:'Die richtige Ausführung zuerst.'},
  nordlicht: {name:'Nordlicht Service · DEMO', initials:'NS', theme:'indigo', tagline:'Teile finden. Unsicherheit erkennen.'}
});
const publicEvidence = {id:'SYN-EVID-001', scope:'public', tenantId:null, label:'Synthetischer Prüfbeleg A', text:'Nur Testbeleg: DEMO-V100, Revision A, Filter SYN-OEM-101.', rights:'synthetic-test-only'};
const cases = [
  ['exact','Exakte Ausführung','DEMO-V100 · Revision A','SYN-OEM-101','confirmed','Testbeleg nennt genau diese Modellrevision und diesen Teilecode.','Keine weitere Angabe im Testfall nötig.',publicEvidence],
  ['revision','Revision unbekannt','DEMO-V100 · Revision ?','SYN-OEM-101','unknown','Der Modellname allein reicht nicht aus. Die Revision fehlt.','Revision am Typenschild prüfen.',publicEvidence],
  ['excluded','Belegter Ausschluss','DEMO-V100 · Revision B','SYN-OEM-101','excluded','Der synthetische Ausschlussbeleg schließt Revision B ausdrücklich aus.','Anderes Teil anhand eines eigenen Belegs prüfen.',{...publicEvidence,id:'SYN-EVID-002',label:'Synthetischer Ausschlussbeleg B',text:'Nur Testbeleg: Revision B ist ausgeschlossen.'}],
  ['sku','Händler-SKU ist kein OEM-Code','DEMO-V100 · Revision A','SYN-SHOP-101','unknown','Eine Händler-SKU ersetzt keinen verifizierten Hersteller-Teilecode.','OEM-Code und verifizierte Zuordnung anfordern.',publicEvidence],
  ['connector','Anschluss unklar','DEMO-V200 · Revision A','SYN-OEM-202','unknown','Der synthetische Fall enthält keine geprüften Anschlussbedingungen.','Anschlusskennung vor Auswahl ergänzen.',publicEvidence],
  ['private','Mandantenbeleg','DEMO-V300 · Revision A','SYN-OEM-303','confirmed','Vorgefertigte Testantwort mit mandantengebundenem synthetischem Beleg.','Keine echte Händlerfreigabe.',null]
];
export function listScenarios(tenantId) {
  if(!Object.hasOwn(tenants,tenantId)) throw Error('Unknown tenant');
  return cases.map(([id,label,asset,part,outcome,reason,next,evidence])=>({
    id,label,asset,part,tenantId,sku:`SYN-${tenantId.toUpperCase()}-${id.toUpperCase()}`,
    response:{presentationVersion:'demo-view/1',tenantId,caseId:id,outcome,reason,next,
      evidence:[evidence || {id:`SYN-${tenantId}-PRIVATE`,scope:'tenant',tenantId,label:'Synthetischer Mandantenbeleg',text:`Nur ${tenants[tenantId].name}; kein realer Partnerdatensatz.`,rights:'synthetic-test-only'}]}
  }));
}
// An exact prerecorded case lookup, NOT an assessFitment implementation.
export async function fixtureProvider(request,context) {
  const scenario=listScenarios(context.tenantId).find(r=>r.id===request.caseId);
  if(!scenario || request.asset!==scenario.asset || request.part!==scenario.part) throw Error('Fixture binding mismatch');
  return structuredClone(scenario.response);
}
