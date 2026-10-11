import assert from 'node:assert/strict';
import {TAXONOMY_VERSION,groups,categories,identificationProfiles,validateTaxonomy} from '../universal-category-foundation/registry.mjs';

// Registry is authoritative; queued category research never grants a fitment or commercial licence.
const preferred=new Map([['vacuum-cleaner',10],['washing-machine',20],['car',30],['dishwasher',40],['tumble-dryer',50],['coffee-machine',60],['cordless-drill',70],['electric-saw',71],['angle-grinder',72],['rotary-hammer',73],['sander',74],['pressure-washer',75],['washer-dryer',80]]);
const fields=(o,keys,label)=>{assert.ok(o&&typeof o==='object'&&!Array.isArray(o),label+' object');assert.deepEqual(Object.keys(o).sort(),keys.slice().sort(),label+' unexpected/missing keys')};
const filled=s=>typeof s==='string'&&s.trim()===s&&s.length>0;
export const batchId=(id,n=1)=>id+'::research-'+String(n).padStart(4,'0');
export function deriveMaster(reg={TAXONOMY_VERSION,groups,categories,identificationProfiles},validate=validateTaxonomy){
 validate(reg.groups,reg.categories);assert.equal(reg.TAXONOMY_VERSION,'0.4.0','Taxonomy migration requires Owner');
 const groupMap=new Map(reg.groups.map((g,i)=>[g.id,{label:g.label,index:i}]));
 const entries=reg.categories.map((c,i)=>{
  const group=groupMap.get(c.group),profile=reg.identificationProfiles[c.profile];
  assert.ok(group&&profile,'Orphan registry group/profile');
  const ownerGate=c.regulatedScope!=='none-asserted';
  const dependencies=['official-manufacturer-evidence','exact-model-variant-and-market','raw-source-audit',
   'data-and-image-rights-review','independent-physical-fitment-and-safety-review'];
  if(c.id==='car')dependencies.push('licensed-specialist-HSN-TSN-VIN-KBA-data');
  if(ownerGate)dependencies.push('restricted-public-reference-or-qualified-service-scope-review');
  return {id:c.id,parentId:c.group,group:{id:c.group,label:group.label},ordinal:i,label:c.label,aliases:[...(c.aliases||[])],
   identificationProfile:{id:c.profile,requiredForCatalog:[...profile.requiredForCatalog],
    variantChecks:[...profile.variantChecks],safety:[...new Set([...profile.safety,...(c.safetyExtra||[])])]},
   registryPolicy:{phase:c.phase,availability:c.availability,fitmentPolicy:c.fitmentPolicy,
    fitmentEngineCategory:c.fitmentEngineCategory,regulatedScope:c.regulatedScope,
    publicCommercialUse:c.publicCommercialUse,partCommerceAuthorized:c.partCommerceAuthorized,
    installationApprovalAuthorized:c.installationApprovalAuthorized},
   market:{researchTarget:'DE',sourceMarketVerified:false,verifiedMarkets:[]},
   priority:{score:preferred.get(c.id)??1000+c.phase*100+group.index*10+i/1000,
    reason:preferred.has(c.id)?'owner-wave12-priority':'registry-phase-and-order',ownerScopeRequired:ownerGate},
   dependencies,research:{workStatus:'ready',batchTarget:25,specializedSource:c.id==='car'?'HSN-TSN-FIN-KBA-separate-license':null},
   evidenceGates:{originalBytes:'unknown',variantVerified:false,rightsApproved:false,fitmentConfirmed:false,consumerPublished:false}};
 });
 assert.equal(new Set(entries.map(x=>x.id)).size,entries.length);
 return {schema:'uf-master-wave12/1',taxonomyVersion:reg.TAXONOMY_VERSION,groups:reg.groups.map(x=>({id:x.id,label:x.label})),
  leafCount:entries.length,categoryIds:entries.map(x=>x.id),categories:entries,livePublicationClaim:false};
}
export function validateEvidence(evidence,master){
 fields(evidence,['schema','taxonomyVersion','observations'],'evidence');
 assert.equal(evidence.schema,'uf-evidence-wave12/1');assert.equal(evidence.taxonomyVersion,master.taxonomyVersion);
 assert.ok(Array.isArray(evidence.observations));const ids=new Set(),valid=new Set(master.categoryIds);
 for(const x of evidence.observations){
  fields(x,['id','categoryId','batchId','reference','sourceStatus','rightsStatus','fitmentStatus','published'],'evidence observation');
  assert.ok(filled(x.id)&&!ids.has(x.id),'Repeated evidence ID');ids.add(x.id);
  assert.ok(valid.has(x.categoryId)&&x.batchId.startsWith(x.categoryId+'::research-'));
  assert.ok(filled(x.reference),'Missing evidence reference');
  assert.equal(x.sourceStatus,'reference_unverified');assert.equal(x.rightsStatus,'unknown');
  assert.equal(x.fitmentStatus,'not_authorized');assert.equal(x.published,false);
 }
 return true;
}
export function deriveStates(master,journal){
 fields(journal,['schema','taxonomyVersion','events'],'journal');
 assert.equal(journal.schema,'uf-journal-wave12/1');assert.equal(journal.taxonomyVersion,master.taxonomyVersion);
 assert.ok(Array.isArray(journal.events));
 const states=new Map(master.categoryIds.map(id=>[id,{batch:1,status:'ready',completed:[],blocker:null}]));
 const ids=new Map();
 for(const e of journal.events){
  fields(e,['eventId','categoryId','batchId','action','receiptRef','reviewer','recordedAt'],'journal event');
  assert.ok(filled(e.eventId)&&/^[a-zA-Z0-9.:-]+$/.test(e.eventId),'Bad event ID');
  assert.ok(states.has(e.categoryId),'Unknown registry category');
  assert.ok(filled(e.reviewer)&&filled(e.recordedAt)&&Number.isFinite(Date.parse(e.recordedAt)));
  assert.ok(e.receiptRef===null||filled(e.receiptRef));
  if(ids.has(e.eventId)){assert.deepEqual(ids.get(e.eventId),e,'Event replay conflict');continue;}
  ids.set(e.eventId,e);
  const st=states.get(e.categoryId);
  assert.equal(e.batchId,batchId(e.categoryId,st.batch),'Batch ID cannot be changed');
  if(e.action==='start'){assert.equal(st.status,'ready');assert.equal(e.receiptRef,null);st.status='in_progress';}
  else if(e.action==='complete'){assert.equal(st.status,'in_progress');assert.ok(filled(e.receiptRef));st.status='completed';st.completed.push(e.batchId);}
  else if(e.action==='block'){assert.ok(['ready','in_progress'].includes(st.status));assert.ok(filled(e.receiptRef));st.status='blocked';st.blocker=e.receiptRef;}
  else if(e.action==='resume'){assert.equal(st.status,'blocked');assert.ok(filled(e.receiptRef));st.status='ready';st.blocker=null;}
  else if(e.action==='next-batch'){assert.equal(st.status,'completed');assert.ok(filled(e.receiptRef));st.batch++;st.status='ready';st.blocker=null;}
  else throw Error('Unsupported journal action');
 }
 return states;
}
export function appendEvent(journal,e,master,evidence){
 const copy=structuredClone(journal),prior=copy.events.find(x=>x.eventId===e.eventId);
 if(prior){assert.deepEqual(prior,e,'Conflicting event replay');return copy;}
 copy.events.push(structuredClone(e));deriveStates(master,copy);validateEvidence(evidence,master);return copy;
}
export function nextWork(master,journal,evidence,limit=12){
 assert.ok(Number.isSafeInteger(limit)&&limit>=1&&limit<=master.leafCount,'Batch limit invalid');
 validateEvidence(evidence,master);const states=deriveStates(master,journal);
 return master.categories.filter(x=>!x.priority.ownerScopeRequired).map(x=>{
  const s=states.get(x.id);
  return {categoryId:x.id,label:x.label,batchId:batchId(x.id,s.batch),workStatus:s.status,
   priority:x.priority.score,completedBatches:s.completed.length,modelBatchTarget:x.research.batchTarget,
   rightsApproved:false,fitmentConfirmed:false};
 }).filter(x=>x.workStatus==='ready')
 .sort((a,b)=>a.priority-b.priority||a.categoryId.localeCompare(b.categoryId)).slice(0,limit);
}
export function deriveReport(master,journal,evidence){
 const states=deriveStates(master,journal);validateEvidence(evidence,master);
 const statuses={ready:0,in_progress:0,completed:0,blocked:0};
 for(const row of states.values())statuses[row.status]++;
 return {schema:'uf-queue-report-wave12/1',taxonomyVersion:master.taxonomyVersion,
  groupCount:master.groups.length,categoryCount:master.leafCount,
  plannedCount:master.categories.filter(x=>x.registryPolicy.availability==='planned').length,
  privatePilotIds:master.categories.filter(x=>x.registryPolicy.availability==='private-consumer-pilot').map(x=>x.id),
  workStatuses:statuses,journalEvents:journal.events.length,unverifiedEvidenceReferences:evidence.observations.length,
  ownerRestrictedCategories:master.categories.filter(x=>x.priority.ownerScopeRequired).length,
  nextSuggested:nextWork(master,journal,evidence,12),
  gates:{commercialRightsApproved:false,fitmentConfirmed:false,consumerPublished:false,launchApproved:false}};
}
export function markdownReport(r){
 return ['# Wave12 Kategorien-Masterliste und Forschungsqueue','',
  'Registry v'+r.taxonomyVersion+': '+r.groupCount+' Gruppen, '+r.categoryCount+' vollständige Leaf-Kategorien, '+
  r.plannedCount+' geplant; private Pilotkategorie(n): '+r.privatePilotIds.join(', ')+'.',
  'Operative Work-Statuswerte: '+JSON.stringify(r.workStatuses)+'. Belegreferenzen: '+r.unverifiedEvidenceReferences+
  ' (unbestätigt). Regulierter Owner-Scope: '+r.ownerRestrictedCategories+'.','',
  '## Nächste Research-Chargen','',
  '| Reihenfolge | Kategorie-ID | Batch-ID | Priorität |','|---:|---|---|---:|',
  ...r.nextSuggested.map((x,i)=>'| '+(i+1)+' | '+x.categoryId+' | '+x.batchId+' | '+x.priority+' |'),
  '', '## Grenzen','',
  'Die Arbeits-Queue ist append-only. Complete benötigt internen Work-Receipt, aber niemals daraus eine Geräte-/Passungsfreigabe.',
  'Nach complete keine automatische Wiederholung. Neue Batch nur nach explizitem next-batch-Event mit Research-Auftragsreferenz.',
  'Eigener Belegindex getrennt von Arbeitsstatus, keine automatische Anhebung von Raw-Audit, Lizenz, Fitment oder Publikation.',
  'KFZ/PKW benötigt spezialisierte HSN/TSN/FIN/KBA-Quellen und Fachprüfung. Regulierte Kategorien nur mit Owner-Scope.',
  'Keine frei erfundenen Taxonomie-IDs und keine Änderungen an Registry, Consumer, Offline oder Source-Lock.','',
  '## CLI',
  'node integrations/catalog-master-queue-wave12/cli.mjs --check',
  'node integrations/catalog-master-queue-wave12/cli.mjs --next 12',
  'node integrations/catalog-master-queue-wave12/cli.mjs --append-event EVENT.json',
  'node --test integrations/catalog-master-queue-wave12/master.test.mjs',''].join('\n');
}
