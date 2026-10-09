import {tenants,listScenarios} from './fixtures.mjs';
import {createBusinessAdapter,createSelectionSession} from './shared-adapter.mjs';
import {createAccessLab,demoPrincipal,demoGrant} from './access-lab.mjs';
const requested=new URLSearchParams(location.search).get('tenant')||'atelier';
const root=document.querySelector('#widget');
if(!Object.hasOwn(tenants,requested)){
 root.replaceChildren(Object.assign(document.createElement('p'),{textContent:'Unbekannter Demo-Mandant. Keine Daten geladen.'}));
}else{
 const tenant=tenants[requested],scenarios=listScenarios(requested),select=document.querySelector('#scenario'),search=document.querySelector('#search'),result=document.querySelector('#result'),button=document.querySelector('#check');
 document.body.dataset.theme=tenant.theme;
 document.querySelector('#shopIcon').textContent=tenant.initials;document.querySelector('#shopName').textContent=tenant.name;document.querySelector('#tagline').textContent=tenant.tagline;
 const adapter=createBusinessAdapter(),session=createSelectionSession(),lab=createAccessLab();
 const variant=document.querySelector('#variant'),role=document.querySelector('#role');
 function element(tag,text,className){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(className)n.className=className;return n;}
 function clear(){session.invalidate();result.replaceChildren();document.querySelector('#audit').textContent='';button.disabled=!select.value;}
 function populate(){const q=search.value.toLocaleLowerCase('de');select.replaceChildren();for(const c of scenarios.filter(c=>[c.label,c.asset,c.part].join(' ').toLocaleLowerCase('de').includes(q))){const o=element('option',`${c.asset} — ${c.label}`);o.value=c.id;select.append(o);}clear();if(!select.value)result.append(element('p','Kein synthetischer Testfall gefunden. Es wird keine Passung geraten.','empty'));}
 search.addEventListener('input',populate);select.addEventListener('change',clear);variant.addEventListener('change',clear);role.addEventListener('change',clear);populate();
 button.addEventListener('click',async()=>{
  const c=scenarios.find(r=>r.id===select.value);if(!c)return;
  const now=Date.now(),permission=lab.check(demoPrincipal(requested,role.value,now),{tenantId:requested,action:'fitment:read',usage:'private-test',grant:demoGrant(requested,c.id==='private'?'tenant':'public',now)});
  if(!permission.allowed){clear();result.append(element('p',`Zugriffslabor: ${permission.decision}. Keine Antwort freigegeben.`,'empty'));return;}
  button.disabled=true;result.replaceChildren(element('p','Testantwort wird geladen …','empty'));
  const pending=await session.run(()=>adapter({caseId:c.id,asset:c.asset,part:c.part,variantKnown:variant.value==='known'},{tenantId:requested,caseId:c.id}));
  if(!pending.current)return;const response=pending.value;button.disabled=false;result.replaceChildren();
  if(!response.ok){result.append(element('p',response.error,'empty'));return;}
  const v=response.view,labels={confirmed:'Im Testbeleg passend',unknown:'Noch nicht bestätigt',excluded:'Im Testbeleg ausgeschlossen'};
  const card=element('article',undefined,`decision ${v.outcome}`);card.dataset.outcome=v.outcome;
  card.append(element('p','GEMEINSAME FITMENT-ENGINE V1 · SYNTHETISCHE ANTWORT','eyebrow'),element('h2',labels[v.outcome]),element('p',v.reason));
  const facts=element('dl');for(const [k,value] of [['Testgerät',c.asset],['Variantenangabe',variant.value==='known'?'Angabe aus synthetischem Testfall':'Revision nicht angegeben'],['Test-Teilecode',c.part],['Nächster Schritt',v.next]])facts.append(element('dt',k),element('dd',value));card.append(facts);
  const evidence=element('details');evidence.append(element('summary',`Herkunft ansehen · ${v.evidence.length} Testbeleg`));for(const e of v.evidence){const box=element('div',undefined,'evidence');box.append(element('strong',e.label),element('p',e.text),element('small',`${e.scope==='public'?'Öffentlicher synthetischer Beleg':'Mandantengebundener synthetischer Beleg'} · ${e.id} · Nur Testdaten`));evidence.append(box);}card.append(evidence);result.append(card);
  const offer=element('div',undefined,'offer');offer.append(element('span','HÄNDLERARTIKEL · SYNTHETISCH','eyebrow'),element('strong',`Demo-Artikel ${c.part}`),element('p',`${tenant.name} · Händler-SKU ${c.sku}`),element('small','Keine Preise, kein Bestand und kein Kauf-Link. Händlerangebot und technische Antwort sind getrennt.'));result.append(offer);
 });
 document.querySelector('#accessCheck').addEventListener('click',()=>{
  const now=Date.now(),principal=demoPrincipal(requested,role.value,now),action=document.querySelector('#action').value,condition=document.querySelector('#boundary').value;
  const req={tenantId:requested,action,usage:'private-test',grant:demoGrant(requested,'tenant',now)};
  if(condition==='foreign-tenant')req.tenantId=requested==='atelier'?'nordlicht':'atelier';
  if(condition==='foreign-feed')req.grant.tenantId=requested==='atelier'?'nordlicht':'atelier';
  if(condition==='expired-token')principal.token.expiresAt=now;
  if(condition==='missing-scope')principal.token.scopes=[];
  if(condition==='production')req.usage='b2b';
  const decision=lab.check(principal,req),out=document.querySelector('#accessResult');
  out.textContent=`${decision.allowed?'Im Konzept erlaubt':'Im Konzept gesperrt'} · ${decision.decision}${decision.retryAfterMs?' · Wartezeit '+Math.ceil(decision.retryAfterMs/1000)+' s':''}`;
  const audit=document.querySelector('#audit');try{audit.textContent=JSON.stringify(lab.audit(principal),null,2);}catch{audit.textContent='Audit-Leserecht fehlt oder Token ungültig. Keine Ereignisse angezeigt.';}
 });
 document.querySelector('#clearLab').addEventListener('click',()=>{lab.clear();clear();document.querySelector('#accessResult').textContent='Lokaler Testzustand gelöscht.';document.querySelector('#audit').textContent='';});
 for(const id of ['role','action','boundary'])document.querySelector('#'+id).addEventListener('change',()=>{document.querySelector('#accessResult').textContent='';document.querySelector('#audit').textContent='';});
}
