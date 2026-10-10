// Read-only discovery helpers. Never infer physical fitment, price, or a right to use artwork.
const collator = new Intl.Collator('de', {numeric: true, sensitivity: 'base'});
const hasText = x => typeof x === 'string' && x.trim().length > 0;
const text = x => hasText(x) ? x.trim() : 'Nicht dokumentiert';
export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const normalize = value => String(value ?? '').replace(/ß/gi, 'ss').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z0-9]/g, '');
export const safeSourceUrl = raw => {
  if (!hasText(raw)) return null;
  try { const url = new URL(raw); return url.protocol === 'https:' && url.hostname && !url.username && !url.password ? url.href : null; }
  catch { return null; }
};
export const typeLabels = Object.freeze({cordless:'Akkusauger', bagless:'Beutellos', bagged:'Mit Beutel', floor:'Bodenstaubsauger'});
export const assemblyLabels = Object.freeze({filter:'Filter',bag:'Staubbeutel',roller:'Bürstenwalzen',nozzle:'Düsen und Bürsten',battery:'Akkus',charger:'Ladegeräte',electrical:'Elektrik',hose:'Schläuche',bin:'Behälter',mechanical:'Mechanik',storage:'Aufbewahrung'});
const deviceTerms = device => [device.brand,device.model,device.reference,device.productCode,...(Array.isArray(device.identifiers)?device.identifiers.map(x=>x?.value):[])].filter(hasText);
const exactTerms = device => [device.reference,device.productCode,...(Array.isArray(device.identifiers)?device.identifiers.map(x=>x?.value):[])].filter(hasText);
const rank = (device, query) => {
  const tokens = query.trim().split(/\s+/).map(normalize).filter(Boolean);
  if (!tokens.length) return 0;
  const terms = deviceTerms(device).map(normalize);
  if (!tokens.every(token => terms.some(term => term.includes(token)))) return -1;
  const joined = normalize(query);
  if (exactTerms(device).some(x=>normalize(x)===joined)) return 300;
  if (normalize(device.model)===joined) return 260;
  if (terms.some(x=>x.startsWith(joined))) return 200;
  return 100 + tokens.reduce((sum,t)=>sum + (terms.some(x=>x.startsWith(t))?4:1),0);
};
export function facets(snapshot){
  const devices = Array.isArray(snapshot?.devices) ? snapshot.devices : [];
  return {
    brands:[...new Set(devices.map(x=>x.brand).filter(hasText))].sort(collator.compare),
    types:[...new Set(devices.map(x=>x.type).filter(hasText))].sort((a,b)=>collator.compare(typeLabels[a]||a,typeLabels[b]||b)),
    total:devices.length
  };
}
export function findDevices(snapshot,{query='',brand='all',type='all',sort='relevance'}={}){
  const devices = Array.isArray(snapshot?.devices) ? snapshot.devices : [];
  const search = typeof query==='string' ? query.trim().slice(0,100) : '';
  const matches = devices.map(device=>({device,score:rank(device,search)}))
    .filter(x=>x.score>=0 && (brand==='all'||x.device.brand===brand) && (type==='all'||x.device.type===type));
  matches.sort((a,b)=>{
    if (sort==='relevance' && search && b.score!==a.score) return b.score-a.score;
    if (sort==='brand') return collator.compare(a.device.brand||'',b.device.brand||'')||collator.compare(a.device.model||'',b.device.model||'')||collator.compare(a.device.reference||'',b.device.reference||'');
    return collator.compare(a.device.model||'',b.device.model||'')||collator.compare(a.device.reference||'',b.device.reference||'')||collator.compare(a.device.id||'',b.device.id||'');
  });
  return {items:matches.map(x=>({...x,exactIdentifier:search.length>0&&exactTerms(x.device).some(y=>normalize(y)===normalize(search))})),visibleCount:matches.length,total:devices.length,query:search};
}
export function deviceProfile(snapshot,id){
  const device=(Array.isArray(snapshot?.devices)?snapshot.devices:[]).find(d=>d.id===id);
  if (!device) return null;
  const allParts=Array.isArray(snapshot?.parts)?snapshot.parts:[];
  const referenced=Array.isArray(device.candidatePartIds)?device.candidatePartIds:[];
  const byId=new Map(allParts.filter(p=>p&&hasText(p.id)).map(p=>[p.id,p]));
  const parts=[...new Set(referenced)].map(partId=>byId.get(partId)).filter(Boolean);
  const unresolved=referenced.filter(partId=>!byId.has(partId)).length;
  const groups=new Map();
  for(const part of parts){
    const key=hasText(part.assembly)?part.assembly:'other';
    if(!groups.has(key))groups.set(key,[]);
    groups.get(key).push({id:part.id,name:text(part.name),code:text(part.code),sourceUrl:safeSourceUrl(part.source?.url)});
  }
  return {
    id:device.id,brand:text(device.brand),model:text(device.model),reference:text(device.reference),productCode:text(device.productCode),market:text(device.market),type:typeLabels[device.type]||text(device.type),
    variantHint:text(device.variantHint),
    identifiers:(Array.isArray(device.identifiers)?device.identifiers:[]).filter(x=>hasText(x?.value)).map(x=>({type:text(x.type),value:text(x.value)})),
    source:{name:text(device.source?.name),url:safeSourceUrl(device.source?.url),checkedAt:text(device.source?.checkedAt)},
    groups:[...groups.entries()].sort((a,b)=>collator.compare(assemblyLabels[a[0]]||a[0],assemblyLabels[b[0]]||b[0])).map(([key,items])=>({key,label:assemblyLabels[key]||'Weitere Baugruppe',parts:items.sort((a,b)=>collator.compare(a.name,b.name))})),
    documentedCandidates:parts.length,unresolvedCandidateReferences:unresolved,
    fitmentConfirmed:false,fitmentStatus:'unclear',purchaseAllowed:false
  };
}
export function deviceCardMarkup(device,{exactIdentifier=false}={}){
  const model=escapeHtml(text(device.model)),brand=escapeHtml(text(device.brand)),reference=escapeHtml(text(device.reference));
  return `<article class="device-card"><div><p class="device-brand">${brand}</p><h3>${model}</h3><p class="device-code">Gerätekennung: <code>${reference}</code></p>${exactIdentifier?'<p class="exact-hint">Exakte Katalogkennung gefunden – eigene Ausführung trotzdem vergleichen.</p>':''}</div><button type="button" data-select-device="${escapeHtml(device.id)}" aria-label="Steckbrief für ${brand} ${model} öffnen">Steckbrief ansehen <span aria-hidden="true">→</span></button></article>`;
}
export function profileMarkup(profile){
  if(!profile)return '<p class="hint">Wähle ein Gerät ausdrücklich aus der Ergebnisliste.</p>';
  const e=escapeHtml;
  const fact=(label,value)=>`<div class="profile-fact"><dt>${e(label)}</dt><dd>${e(value)}</dd></div>`;
  const source=profile.source.url?`<a href="${e(profile.source.url)}" target="_blank" rel="noopener noreferrer">Herstellerquelle für die Geräteidentität öffnen ↗</a>`:'<span>Kein sicherer Herstellerlink dokumentiert.</span>';
  return `<div class="profile-header"><div><p class="eyebrow">Gerätesteckbrief · Identität</p><h2>${e(profile.brand)} ${e(profile.model)}</h2></div><button class="close-profile" type="button" data-close-profile aria-label="Gerätesteckbrief schließen">Schließen ×</button></div>
  <p class="status-unknown" role="note"><strong>Passung nicht bestätigt.</strong> Kennungen und gelistete Artikel sind keine Einbaufreigabe. Prüfe immer die genaue Ausführung.</p>
  <dl class="profile-facts">${fact('Herstellerkennung',profile.reference)}${fact('Produktcode',profile.productCode)}${fact('Geräteart',profile.type)}${fact('Quellenmarkt',profile.market)}${fact('Herstellerquellen-Stand',profile.source.checkedAt)}</dl>
  <section><h3>Ausführung abgleichen</h3><p>${e(profile.variantHint)}</p><p class="hint">Einen Index, Ländercode oder eine Revision niemals automatisch von einem ähnlich benannten Modell übernehmen.</p>
  ${profile.identifiers.length?`<ul class="identifiers">${profile.identifiers.map(i=>`<li><span>${e(i.type)}</span> <code>${e(i.value)}</code></li>`).join('')}</ul>`:'<p class="hint">Keine weiteren Kennungen dokumentiert.</p>'}</section>
  <section><h3>Originalquelle</h3><p>${e(profile.source.name)}</p><p>${source}</p><p class="hint">Nur verlinkte Identitätsinformation; keine übertragenen Produktbilder und keine bestätigten Bezugsrechte.</p></section>
  <section><h3>Dokumentierte Artikelidentitäten <span class="count">${profile.documentedCandidates}</span></h3><p class="hint">Lediglich Prüfkandidaten aus dem Katalog. Keines dieser Teile hat hier eine bestätigte physische Passung. Keine Preise oder Kaufbuttons.</p>
  ${profile.groups.map(g=>`<details class="part-group"><summary>${e(g.label)} <span>${g.parts.length}</span></summary><ul>${g.parts.map(p=>`<li><div><strong>${e(p.name)}</strong><code>${e(p.code)}</code></div>${p.sourceUrl?`<a href="${e(p.sourceUrl)}" target="_blank" rel="noopener noreferrer">Artikelquelle ↗</a>`:'<span>Artikelquelle offen</span>'}</li>`).join('')}</ul></details>`).join('')||'<p class="hint">Für dieses Gerät sind noch keine Artikelidentitäten dokumentiert. Das bedeutet nicht, dass es keine Ersatzteile gibt.</p>'}
  ${profile.unresolvedCandidateReferences?`<p class="hint">${profile.unresolvedCandidateReferences} referenzierte Artikel ohne auflösbare Identität bleiben offen.</p>`:''}</section>`;
}