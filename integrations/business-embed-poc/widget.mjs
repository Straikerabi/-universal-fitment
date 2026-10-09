import {tenants,listScenarios,fixtureProvider} from './fixtures.mjs';
import {createAdapter,viewVersion} from './adapter.mjs';
const requested=new URLSearchParams(location.search).get('tenant')||'atelier';
const root=document.querySelector('#widget');
if(!Object.hasOwn(tenants,requested)){
 root.replaceChildren(Object.assign(document.createElement('p'),{textContent:'Unbekannter Demo-Mandant. Keine Daten geladen.'}));
}else{
 const tenant=tenants[requested],scenarios=listScenarios(requested),select=document.querySelector('#scenario'),search=document.querySelector('#search'),result=document.querySelector('#result'),button=document.querySelector('#check');
 document.body.dataset.theme=tenant.theme;
 document.querySelector('#shopIcon').textContent=tenant.initials;document.querySelector('#shopName').textContent=tenant.name;document.querySelector('#tagline').textContent=tenant.tagline;
 const adapter=createAdapter({invoke:fixtureProvider,validateContract:r=>r?.presentationVersion===viewVersion,mapToView:r=>r});
 let revision=0;
 function element(tag,text,className){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(className)n.className=className;return n;}
 function clear(){revision++;result.replaceChildren();button.disabled=!select.value;}
 function populate(){const q=search.value.toLocaleLowerCase('de');select.replaceChildren();for(const c of scenarios.filter(c=>[c.label,c.asset,c.part].join(' ').toLocaleLowerCase('de').includes(q))){const o=element('option',`${c.asset} — ${c.label}`);o.value=c.id;select.append(o);}clear();if(!select.value)result.append(element('p','Kein synthetischer Testfall gefunden. Es wird keine Passung geraten.','empty'));}
 search.addEventListener('input',populate);select.addEventListener('change',clear);populate();
 button.addEventListener('click',async()=>{
  const c=scenarios.find(r=>r.id===select.value);if(!c)return;const token=++revision;button.disabled=true;result.replaceChildren(element('p','Testantwort wird geladen …','empty'));
  const response=await adapter({caseId:c.id,asset:c.asset,part:c.part},{tenantId:requested,caseId:c.id});
  if(token!==revision)return;button.disabled=false;result.replaceChildren();
  if(!response.ok){result.append(element('p',response.error,'empty'));return;}
  const v=response.view,labels={confirmed:'Im Testbeleg passend',unknown:'Noch nicht bestätigt',excluded:'Im Testbeleg ausgeschlossen'};
  const card=element('article',undefined,`decision ${v.outcome}`);card.dataset.outcome=v.outcome;
  card.append(element('p','VORGEFERTIGTE SYNTHETISCHE ANTWORT','eyebrow'),element('h2',labels[v.outcome]),element('p',v.reason));
  const facts=element('dl');for(const [k,value] of [['Testgerät',c.asset],['Test-Teilecode',c.part],['Nächster Schritt',v.next]])facts.append(element('dt',k),element('dd',value));card.append(facts);
  const evidence=element('details');evidence.append(element('summary',`Herkunft ansehen · ${v.evidence.length} Testbeleg`));for(const e of v.evidence){const box=element('div',undefined,'evidence');box.append(element('strong',e.label),element('p',e.text),element('small',`${e.scope==='public'?'Öffentlicher synthetischer Beleg':'Mandantengebundener synthetischer Beleg'} · ${e.id} · Nur Testdaten`));evidence.append(box);}card.append(evidence);result.append(card);
  const offer=element('div',undefined,'offer');offer.append(element('span','HÄNDLERARTIKEL · SYNTHETISCH','eyebrow'),element('strong',`Demo-Artikel ${c.part}`),element('p',`${tenant.name} · Händler-SKU ${c.sku}`),element('small','Keine Preise, kein Bestand und kein Kauf-Link. Händlerangebot und technische Antwort sind getrennt.'));result.append(offer);
 });
}
