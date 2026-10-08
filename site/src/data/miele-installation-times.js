import { partCategory } from './miele-parts.js';

// Editorial planning estimates, not measured labor values or Miele specifications.
// Only the active replacement of one matching part is estimated; charging/drying is excluded.
export function installationTime(part){
  const text=`${part.name} ${part.kind||''}`.toLowerCase();
  const unknown=reason=>({status:'unknown',minMinutes:null,maxMinutes:null,label:'Einbauzeit offen',reason});
  if(part.fitment?.status==='catalog_only'&&['Bosch','AEG','Dyson','Rowenta','Philips','Siemens','Vorwerk','Samsung','Hoover'].includes(part.brand))return unknown('Der Katalogartikel ist noch keinem geprüften Gerätewechsel zugeordnet. Montageablauf und Ausführung anhand des Geräts prüfen.');
  if(part.fitment?.status==='variant_check_required')return unknown('Die benötigte Ausführung ist noch ungeklärt. Erst das Altteil und die Geräteausstattung vergleichen.');
  if(/wandhalter/.test(text))return estimate(15,30,'Wandhalter montieren','Mit passendem Befestigungsmaterial und Werkzeug; Wand und Montageort beeinflussen den Aufwand.');
  if(/filterrahmen|elek[.-]|funk|klappe|griff.*bürstenwalze|bürstenwalze griff|powerunit|behälter|zyklonabscheider|feinstaubkassette/.test(text))return unknown('Für diese Baugruppe ist kein ausreichender Montageablauf hinterlegt. Der Reparaturdienst kann die Zeit anhand des Geräts einschätzen.');
  const category=partCategory(part);
  if(category==='Gehäuse & Mechanik')return unknown('Zeit hängt von der Gerätezerlegung und der konkreten Ausführung ab; keine belastbare Schätzung hinterlegt.');
  if(category==='Staubsaugerbeutel')return estimate(2,5,'Einen Beutel wechseln','Spanne gilt für einen Beutelwechsel, unabhängig von der Beutelanzahl in der gekauften Packung.');
  if(category==='Filter')return estimate(3,10,'Zugänglichen Filter wechseln','Für einen passenden Ersatzfilter ohne Gerätezerlegung. Reinigung und vollständige Trocknung benötigen zusätzliche Zeit.');
  if(/bürstenwalze/.test(text))return estimate(5,15,'Herausnehmbare Bürstenwalze wechseln','Nur für eine laut Geräteanleitung herausnehmbare Walze; keine Zerlegung der Elektrobürste eingeschlossen.');
  if(['Schläuche','Rohre','Griffe'].includes(category))return estimate(2,5,'Steckverbindungen lösen und wieder einsetzen','Für ein passendes komplettes Teil mit zugänglichen Anschlüssen, ohne Reparatur im Inneren.');
  if(category==='Düsen & Bürstenköpfe'&&!/fadenheber/.test(text))return estimate(1,3,'Komplette Düse aufstecken','Zeit für den Zubehörwechsel; keine Reparatur oder Zerlegung der Düse.');
  if(category==='Akkus'&&/akku/.test(text))return estimate(2,5,'Herausnehmbaren Akku wechseln','Für einen vom Nutzer herausnehmbaren passenden Akku. Ladezeit und Inbetriebnahme nach Tiefentladung kommen separat dazu.');
  if(category==='Ladegeräte'&&/ladegerät|ladeschale|hx-la|hx-ls/.test(text))return estimate(1,5,'Passendes Ladezubehör anschließen','Ohne Wandmontage; Stecker und Gerätevorgaben prüfen. Die Ladezeit ist nicht eingeschlossen.');
  return unknown('Für dieses Teil fehlt ein ausreichender Montageablauf für eine sinnvolle Zeitangabe.');
}
function estimate(minMinutes,maxMinutes,task,reason){
  return {status:'estimate',minMinutes,maxMinutes,label:`ca. ${minMinutes}–${maxMinutes} Min.`,task,reason,basis:'Eigene Schätzung für die Arbeitsplanung · keine Hersteller-Zeitvorgabe',excludes:['Ladezeit','Trocknungszeit','Fehlersuche']};
}
