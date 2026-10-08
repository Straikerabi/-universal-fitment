const source = (name,url,note,grade='A') => ({
  name,type:'manufacturer',url,retrievedAt:'2026-10-05',license:'source-linked',note,grade
});

const profiles = [
  {
    key:'delonghi', label:"De'Longhi", aliases:['delonghi','de longhi','de’longhi','de\'longhi'],
    supportUrl:'https://support.delonghi.com/de/de-de',
    partsUrl:'https://www.delonghi.com/de-de/c/kaffee/zubehor/entkalker-und-wasserfilter',
    supportNote:'De\'Longhi bietet Produktsuche, Hilfe, Zubehör und Ersatzteil-Support über Modellbezeichnung/Produktnummer.'
  },
  {
    key:'philips', label:'Philips / Saeco', aliases:['philips','saeco'],
    supportUrl:'https://www.home-appliances.philips/de/de/parts-accessories',
    partsUrl:'https://www.home-appliances.philips/de/de/parts-accessories',
    supportNote:'Philips Home erlaubt die Suche nach Produktname oder Modellnummer und zeigt Originalteile/Zubehör.'
  },
  {
    key:'bosch', label:'Bosch', aliases:['bosch'],
    supportUrl:'https://www.bosch-home.com/de/produkte/ersatzteile/kaffeemaschinen/',
    partsUrl:'https://www.bosch-home.com/de/produkte/ersatzteile/kaffeemaschinen/',
    supportNote:'Bosch sucht Originalteile anhand der E-Nr. des Geräts.'
  },
  {
    key:'siemens', label:'Siemens', aliases:['siemens'],
    supportUrl:'https://www.siemens-home.bsh-group.com/de/produkte/ersatzteile/freistehende-kaffeevollautomaten/',
    partsUrl:'https://www.siemens-home.bsh-group.com/de/produkte/ersatzteile/freistehende-kaffeevollautomaten/',
    supportNote:'Siemens sucht passende Originalteile anhand der E-Nr. des Kaffeevollautomaten.'
  },
  {
    key:'jura', label:'JURA', aliases:['jura'],
    supportUrl:'https://de.jura.com/de/support/ersatzteile',
    partsUrl:'https://de.jura.com/de/support/ersatzteile',
    supportNote:'JURA zeigt Original-Ersatzteile über die 5-stellige Artikelnummer des Geräts.'
  },
  {
    key:'krups', label:'Krups', aliases:['krups'],
    supportUrl:'https://www.krups.de/Zubeh%C3%B6r-Shop',
    partsUrl:'https://www.krups.de/Zubeh%C3%B6r-Shop',
    supportNote:'Krups führt Zubehör und Ersatzteile mit Kompatibilitätsprüfung über die Produktnummer.'
  },
  {
    key:'nespresso', label:'Nespresso', aliases:['nespresso'],
    supportUrl:'https://www.nespresso.com/de/de/machine-assistance',
    partsUrl:'https://www.nespresso.com/de/de/machine-assistance',
    supportNote:'Nespresso bietet Maschinen-Assistent, Modell-/Seriennummernsuche und technischen Ersatzteilservice.'
  }
];

const delonghiDescalerSource = source(
  "De'Longhi · Decalk Care DLSC500",
  'https://www.delonghi.com/de-de/p/entkalker-und-wasserfilter-decalk-care-entkalker--500-ml--flasche-fur-5-anwendungen/DLSC500.html?pid=5513296041',
  "De'Longhi bezeichnet DLSC500 als Original-Pflegeprodukt für alle De'Longhi Kaffeemaschinen und nennt 500 ml für fünf Anwendungen."
);

const delonghiFilterSource = source(
  "De'Longhi · Wasserfilter DLSC002",
  'https://www.delonghi.com/de-de/p/entkalker-und-wasserfilter-wasserfilter--entharter-und-reiniger/DLSC002.html',
  "De'Longhi führt DLSC002 als Wasserfilter für De'Longhi-Kaffeemaschinen und nennt einen Wechsel frühestens alle zwei Monate.",
  'B'
);

const philipsAquaCleanSource = source(
  'Philips · AquaClean CA6903/10',
  'https://www.philips.de/c-p/CA6903_10/kalk-und-wasserfilter',
  'Philips nennt kompatible Maschinenfamilien und bietet auf der Produktseite eine Modellprüfung für AquaClean an.',
  'B'
);

const krupsClarisSource = source(
  'Krups · Claris F08801',
  'https://www.krups.de/Zubeh%C3%B6r-Shop/filtereinsatz-fuer-espressomaschinen-f08801/csp/8000003687',
  'Krups listet für F08801 konkrete kompatible Produktnummern und bietet eine Kompatibilitätssuche.',
  'A'
);

const nespressoDescaleSource = source(
  'Nespresso · Maschinen-FAQ',
  'https://www.contact.nespresso.com/faq-3/de/de',
  'Nespresso nennt das eigene Entkalkerset als für alle Maschinen geeignet und verweist für modellabhängige Abläufe auf den Maschinen-Assistenten.',
  'A'
);

export function getCoffeeBrandProfile(brand='',title=''){
  const hay=`${brand} ${title}`.toLowerCase().replace(/[’']/g,'');
  return profiles.find(profile=>profile.aliases.some(alias=>hay.includes(alias.replace(/[’']/g,'')))) || null;
}

export function isLikelyCoffeeMachine(candidate={}){
  const hay=[candidate.name,candidate.title,candidate.category,candidate.productType,candidate.brand,candidate.model]
    .filter(Boolean).join(' ').toLowerCase();
  return /coffee|kaffee|espresso|cappuccino|nespresso|vollautomat|latte|bean.?to.?cup|coffee maker|coffee machine/.test(hay) || Boolean(getCoffeeBrandProfile(candidate.brand,hay));
}

export function coffeeCareSuggestions(candidate={}){
  const profile=getCoffeeBrandProfile(candidate.brand,candidate.name||candidate.title||'');
  if(!profile) return [];
  const model=String(candidate.model||candidate.name||candidate.title||'').toUpperCase();
  if(profile.key==='delonghi'){
    return [
      {id:'delonghi-dlsc500',label:'Decalk Care DLSC500',kind:'Entkalker',status:'manufacturer_verified',confidence:.99,scope:'Für alle De\'Longhi Kaffeemaschinen laut Hersteller',source:delonghiDescalerSource,identifier:'DLSC500',required:false},
      {id:'delonghi-dlsc002',label:'Wasserfilter DLSC002',kind:'Wasserfilter',status:'manufacturer_supported',confidence:.88,scope:'Hersteller-Zubehör; Modell vor Kauf im Support prüfen',source:delonghiFilterSource,identifier:'DLSC002',required:false}
    ];
  }
  if(profile.key==='nespresso'){
    return [
      {id:'nespresso-descaler',label:'Nespresso Entkalkerset',kind:'Pflege',status:'manufacturer_verified',confidence:.99,scope:'Für alle Nespresso Maschinen laut Hersteller-FAQ',source:nespressoDescaleSource,identifier:'Entkalkerset',required:false}
    ];
  }
  if(profile.key==='philips'){
    const familyMatch=/\b(800|1200|2200|2300|3200|3300|4300|4400|5400|5500)\b|GRANAROMA|XELSIS|\bEP\d{4}\b|\bSM\d{4}\b/.test(model);
    return [
      {id:'philips-aquaclean',label:'AquaClean CA6903',kind:'Wasserfilter',status:familyMatch?'manufacturer_supported':'verify_model',confidence:familyMatch?.88:.68,scope:familyMatch?'Maschinenfamilie wirkt passend; exaktes Modell beim Hersteller bestätigen':'Nur nach positiver Modellprüfung bei Philips verwenden',source:philipsAquaCleanSource,identifier:'CA6903',required:false}
    ];
  }
  if(profile.key==='krups'){
    const exact=['EA907810','EA873810','EA875E10','EA872B10','EA819E10','EA901010','EA907D10','XP524010','EA9000PN'].some(code=>model.includes(code));
    return exact ? [
      {id:'krups-f08801',label:'Claris F08801',kind:'Wasserfilter',status:'manufacturer_verified',confidence:.99,scope:'Diese Produktnummer ist in der offiziellen Krups-Kompatibilitätsliste aufgeführt',source:krupsClarisSource,identifier:'F08801',required:false}
    ] : [];
  }
  return [];
}

export function coffeeSourceBundle(candidate={}){
  const profile=getCoffeeBrandProfile(candidate.brand,candidate.name||candidate.title||'');
  return {profile,suggestions:coffeeCareSuggestions(candidate)};
}

export { profiles as coffeeBrandProfiles };
