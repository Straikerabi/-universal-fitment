// One visual vocabulary for every brand. Type describes the article, not its fitment.
const type=(id,label,color,icon,purpose)=>Object.freeze({id,label,color,icon,purpose});
export const partTypes=Object.freeze([
 type('nozzle','Düsen & Bürstenköpfe','#2563eb','M9 3h6v9H9z M5 12h14l2 7H3z M7 19v2 M17 19v2','accessory'),
 type('bag','Staubsaugerbeutel','#d49a12','M8 3h8v4l3 3v10H5V10l3-3z M10 5h4 M9 12h6 M9 16h6','consumable'),
 type('filter','Filter','#16a16b','M5 4h14v16H5z M8 7v10 M12 7v10 M16 7v10','consumable'),
 type('battery','Akkus','#8b5cf6','M9 3h6v3 M6 6h12v15H6z M13 9l-3 5h4l-3 4','spare'),
 type('charger','Ladegeräte','#6366f1','M8 3v5 M16 3v5 M6 8h12v4a6 6 0 0 1-6 6v4 M10 18h4','spare'),
 type('hose','Schläuche','#0d9488','M4 5h4v3 M8 6c12-3 13 6 5 6s-10 8 1 7 M14 17h6v4h-6z','spare'),
 type('tube','Rohre','#0284c7','M6 3h5v18H6z M6 9h5 M6 15h5 M15 3h3v18h-3','spare'),
 type('handle','Griffe','#b77945','M5 18v-7a7 7 0 0 1 14 0v7 M5 14h4v7H5z M15 14h4v7h-4','spare'),
 type('roller','Bürstenwalzen','#db5794','M5 7h14v10H5z M3 10v4 M21 10v4 M8 7l3 10 M13 7l3 10','spare'),
 type('bin','Behälter & Zyklon','#0891b2','M6 6h12l-1 15H7z M5 6h14 M9 3h6 M10 10h4 M10 14h4','spare'),
 type('electrical','Motoren & Elektrik','#e15b53','M5 7h14v10H5z M2 10h3 M19 10h3 M7 17v3 M17 17v3 M14 9l-4 4h4l-3 3','spare'),
 type('cable','Kabel & Kabeltrommeln','#a57b54','M7 4h3v5H7z M8 9c-8 9 13 13 9 2 M15 4h4v7h-4z M16 2v2 M18 2v2','spare'),
 type('mechanical','Gehäuse & Mechanik','#7b879a','M9 3h6l1 4 4 2v6l-4 2-1 4H9l-1-4-4-2V9l4-2z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6','spare'),
 type('adapter','Adapter & Verbindungsteile','#b18b41','M4 8h6v8H4z M10 10h4v4h-4 M14 6h6v12h-6','accessory'),
 type('storage','Halterungen & Aufbewahrung','#9778ab','M5 4h14v17H5z M8 8h8 M8 13h8 M8 18h8','accessory'),
 type('care','Reinigungs- & Pflegemittel','#739329','M9 3h6v4l3 3v11H6V10l3-3z M9 12h6v5H9z','consumable'),
 type('kit','Zubehörsets','#5c76a8','M3 7l9-4 9 4v12l-9 3-9-3z M3 7l9 4 9-4 M12 11v11','accessory'),
 type('unit','Handeinheiten & Baugruppen','#9d647e','M6 6h12v14H6z M9 3h6v3 M9 11h6 M9 15h6','spare'),
 type('document','Anleitungen & Dokumente','#69839f','M5 3h10l4 4v14H5z M15 3v5h4 M8 11h8 M8 15h8 M8 18h5','document'),
 type('device','Komplettgeräte','#687da6','M5 12h14v7H5z M7 19v2 M17 19v2 M12 12V6c0-4 7-4 7 0v6','device'),
 type('other','Weitere Teile','#7b879a','M5 5h5v5H5z M14 5h5v5h-5z M5 14h5v5H5z M14 14h5v5h-5z','unknown')
]);
export const partPurposes=Object.freeze([
 ['spare','Ersatzteil'],['accessory','Zubehör'],['consumable','Verbrauchsmaterial'],['unknown','Einordnung offen'],['document','Dokument'],['device','Komplettgerät']
].map(([id,label])=>Object.freeze({id,label})));
const byId=new Map(partTypes.map(t=>[t.id,t]));
const purposeById=new Map(partPurposes.map(t=>[t.id,t]));
const normalize=value=>String(value||'').toLowerCase().normalize('NFKD').replace(/\p{M}/gu,'').replace(/ß/g,'ss').replace(/buerst/g,'burst').replace(/dues/g,'dus').replace(/gehaeus/g,'gehaus').replace(/behaelter/g,'behalter').replace(/geblaes/g,'geblas').replace(/verlaenger/g,'verlanger').replace(/traeger/g,'trager').replace(/buegel/g,'bugel').replace(/daempf/g,'dampf').replace(/raeder/g,'rader');

export function partType(part={}){
 if(byId.has(part.partTypeId))return byId.get(part.partTypeId);
 function classify(name,full=false){
 const title=name,text=name;
 if(/(?:ladestation|ladegerat),\s*(?:bodenplatte|deckel|gehause|abdeckung)\b/.test(title))return 'mechanical';
 // Classify the named component before its fitment, included parts or connection size.
 if(!full)name=name.split(/\s+(?:fur|fuer|for|mit|with|incl\.?|inkl\.?)\b|\b[fm]\.|[,;](?!\d)|[([]/)[0];
 name=name.replace(/\s+(?:und|and)\s+(?:dichtung|seal)\b.*$/,'');
 let id='other';
 // Specific assemblies precede words in their descriptions: a filter holder is no filter.
 if(/bedienungsanleitung|gebrauchsanleitung|gebrauchsanweisung|user manual/.test(title))id='document';
 else if(/^(?:siemens|bosch|dyson|aeg|philips|rowenta|hoover|samsung|vorwerk) staubsauger(?:\b|,)/.test(title)&&!/(?:fur|filter|rohr|schlauch|motor|beutel|burste|duse|elektronik|griff|kabel|gehause|dicht|halter|deckel|absorber|schwamm|rolle|clip|adapter)/.test(title.split('staubsauger')[1]))id='device';
 else if(/hand,?\s*einheit|handgerat|handheld unit|einheit,?\s*komplett.*dust.cup/.test(title))id='unit';
 else if(/filter(?:rahmen|halter|aufnahme|deckel|gehause)|rahmen.*filter|\b(?:distanz)?halter\b|gehause|kappe|beutel(?:halter|aufnahme)|aufnahme.*beutel|batterie(?:deckel|gehause)|akku(?:deckel|abdeckung)|(?:staub)?behalter(?:deckel|abdeckung)|deckel|klappe|abdeckung|dicht|rohrclip|schlauchclip|bodenplatte|verriegelung|entriegelung|aufhangung|absorber|dampfer|feder|schalldampf|motor(?:halter|schwammhalter)|laufrolle|lenkrolle|laufrad|lauf(?:rader)|rad\b/.test(name))id='mechanical';
 else if(/staubsaugerbeutel|staubbeutel|vliesbeutel|filtertute|filtertuete|hyclean|\bfp[1-7]\b|bag pack|dust bag|s.bag/.test(name))id='bag';
 else if(/(?:^|\s)(?:staub|schmutz)?behalter\b/.test(name))id='bin';
 else if(/(?:^|[\s,])(?:ersatz-?|wechsel-?)?akku$/.test(name))id='battery';
 else if(/filter|hepa|airclean sf-|microfilter|exhaust filter|pre.?filter|motorschwamm/.test(name))id='filter';
 else if(/ladegerat|ladeschale|ladeadapter|netzteil|ladestation|charging|charger|ladesockel|ladekabel|hx-la|hx-ls/.test(name))id='charger';
 else if(/akk(?:u|\b)|batterie|battery/.test(name.replace(/akku[- ]?staubsauger/g,'staubsauger')))id='battery';
 else if(/netzkabel|netzleitung|anschlussleitung|kabeltrommel|kabelaufwick|kabelwinde|anschlusskabel|kabelbaum|kabelsatz|\bkabel\b|cord reel|power cord/.test(name))id='cable';
 else if(/(?:motor|elektronik|platine|leiterplatte|transformator|kondensator|schalter|schaltmodul|display|sensor|anzeigemodul|bedienmodul|irmodul|modul.*(?:anzeige|led)|geblase|potentiometer|regler.*saugkraft|regler.*leistung)/.test(name)&&!/(?:motorbar|motorduse|motorisierte|motorized|digital motorbar)/.test(name))id='electrical';
 else if(/burstwalze|burstenwalze|burstenrolle|burstenleiste|rundburste|borstenwalze|softrolle|ersatzrolle|walzenburste|burstenband|brush bar|brush roll|walze|platt.*(?:burs|sohle)|fadenheber|borstenplatte|borstentrager|reinigungswalze/.test(name))id='roller';
 else if(/staubbehalter|schmutzbehalter|behalter|zyklon|cyclone|\bbin\b|staub,?\s*fach|staubabscheider|\babscheider\b/.test(name))id='bin';
 else if(/duse|burste|\bbrush\b|\bnozzle\b|aufsatz|saugwischer|pinsel|duster|bodensaugzubehor|hardfloor care tool|aquatwister|ansaugvorrichtung|motorbar|fluffy|submarine|reinigungskopf|cleaner head|floor head|\beb[3-7][0-9]*\b|\bsb[bd]\s*\d|\bsfd\s*\d|\bstb\s*\d/.test(name))id='nozzle';
 else if(/adapter|verbindungsstuck|winkelstutzen/.test(name))id='adapter';
 else if(/wandhalter|zubehorhalter|aufbewahrung|halterung|standfuss|standfuß|zubehortasche|zubehorbox|standsaul|wandsteckdose/.test(name))id='storage';
 else if(/saugschlauch|schlauch|hose/.test(name))id='hose';
 else if(/handgriff|griff|handle/.test(name))id='handle';
 else if(/saugrohr|teleskoprohr|verlangerungsrohr|rohr|wand assembly|extension wand|teleskopstange|\btube\b/.test(name))id='tube';
 else if(/reinigungsmittel|reinigungspulver|reinigungsgranulat|kobosan|lavenia|koboclean|pflegemittel|mikrofasertuch|reinigungstuch|reinigungspad|wischpad|wischtuch|sanfte pads|mop.*pads|mikrofaserpads|tuchset|duftchip|dovina/.test(name))id='care';
 else if(/deckel|klappe|abdeckung|gehause|dichtung|dichtlippe|drehfeder|feder|verriegelung|drehknopf|druckknopf|tritttaste|tritthebel|achse|laufrolle|vorderrolle|rollensatz|lauf(?:rad|rader)|rad\b|riemen|eingriffschutz|sicherung|stutzen|sperr|halter|aufnahme|fuhrung|bedienelement|schraube|ventil|blende|spindel|schelle|lager|schieber|gitter|leiste|einsatz|trager|verschluss|bodenplatte|schale|dampf|absorber|schalldampf|faltenbalg|\bplatte\b|nebenluftregler|feinstaubkassette|anzeige|bugel|dammplatte|daemmplatte|lenkrolle|schaber|einlage|lichtleiter|taste|hebel|drehregler|\brader\b|\bfusse\b/.test(name))id='mechanical';
 else if(/ersatzschuh/.test(name))id='mechanical';
 else if(/zubehorset|ersatzkit|zubehor.?kit|zubehorpaket|accessory kit|accessory set|\bkit\b|reinigungsset/.test(name))id='kit';
 // Generic source labels such as "Original-Ersatzteil / Zubehör" cannot disambiguate an article.
 else if(/staubbeutel|filtertute/.test(text))id='bag';
 if(id==='kit'&&/s.bag|staubbeutel|filtertute/.test(title))id='bag';
 return id==='other'&&!full&&title!==name?classify(title,true):id;
 }
 let id=classify(normalize(part.name));
 const kind=normalize(part.kind);
 if(id==='other'&&!/original|ersatzteil|zubehor|nachbau/.test(kind))id=classify(kind);
 return byId.get(id);
}
export function partPurpose(part={}){
 const explicit=purposeById.get(part.purposeId);
 if(explicit)return explicit;
 const type=partType(part);
 if(type.id==='kit'&&/filter|s.bag/i.test(part.kind||''))return purposeById.get('consumable');
 return purposeById.get(type.purpose);
}
export function partTypeSummary(parts){
 const counts=new Map();
 for(const p of parts){const id=partType(p).id;counts.set(id,(counts.get(id)||0)+1);}
 return partTypes.filter(t=>counts.has(t.id)).map(t=>({...t,count:counts.get(t.id)}));
}
export function groupPartsByType(parts){
 const groups=new Map();
 for(const part of parts){
  const id=partType(part).id;
  if(!groups.has(id))groups.set(id,[]);
  groups.get(id).push(part);
 }
 return partTypes.filter(type=>groups.has(type.id)).map(type=>({...type,parts:groups.get(type.id)}));
}
export const isPhysicalPart=part=>['spare','accessory','consumable'].includes(partPurpose(part).id);
