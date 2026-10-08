const source = (name,url,note,{type='manufacturer',grade='A'}={}) => ({
  name,type,url,retrievedAt:'2026-10-06',license:'source-linked',note,grade
});

const mieleFinderSource = source(
  'Miele · Staubsaugerbeutel- & Filter-Finder',
  'https://www.miele.de/c/staubsaugerbeutel-und-filter-10520.htm',
  'Offizielle Miele-Zuordnung von Staubsaugerfamilien zu HyClean-Pure-Beuteln und AirClean-Abluftfiltern.'
);

const bagSources = {
  GN: source('Miele · GN HyClean Pure 12421170','https://www.miele.de/product/12421170/4-staubsaugerbeutel-gn-hyclean-pure','Offizieller 4er-Pack für Complete C2, Complete C3, Classic C1, S8, S5 und S2. EAN 4002516766940.'),
  FJM: source('Miele · FJM HyClean Pure 12421180','https://www.miele.de/product/12421180/4-staubsaugerbeutel-fjm-hyclean-pure','Offizieller 4er-Pack für Complete C1, Compact C1, Compact C2, S6 und S4. EAN 4002516747505.'),
  TU: source('Miele · TU HyClean Pure 12557060','https://www.miele.de/product/12557060/4-staubsaugerbeutel-tu-hyclean-pure','Offizieller 4er-Pack für Guard L1 und Guard S1. EAN 4002516829751.'),
  CO: source('Miele · CO HyClean Pure 12557080','https://www.miele.de/product/12557080/4-staubsaugerbeutel-co-hyclean-pure','Offizieller 4er-Pack für alle Guard M1 Modelle. EAN 4002516830085.')
};

const filterSources = {
  HA50: source('Miele · HEPA AirClean SF-HA 50-1','https://www.miele.de/product/12785390/hepa-airclean-filter-sf-ha-50-1','HEPA-Klasse 13 nach DIN EN 1822/2019; Miele nennt u. a. Guard S1/M1/L1, Complete C2/C3 und Compact C1/C2.'),
  AA50: source('Miele · Active AirClean SF-AA 50-1','https://www.miele.de/product/12785350/active-airclean-filter-sf-aa-50-1','Aktivkohlefilter; Miele nennt u. a. Guard S1/M1/L1, Complete C2/C3 und Compact C1/C2.'),
  AP50: source('Miele · AirClean Plus SF-AP 50-1','https://www.miele.de/product/12868930/airclean-plus-filter-sf-ap-50-1','Offizieller AirClean-Plus-Filter der 50er Bauform; Miele listet ihn in den passenden Familienabschnitten.'),
  SA50: source('Miele · Silence AirClean SF-SA 50-1','https://www.miele.de/product/12785400/silence-airclean-filter-sf-sa-50-1','Offizieller Silence-AirClean-Filter der 50er Bauform; Miele listet ihn in den passenden Familienabschnitten.'),
  HA30: source('Miele · HEPA AirClean SF-HA 30-1','https://www.miele.de/product/12785370/hepa-airclean-filter-sf-ha-30-1','Offizieller HEPA-AirClean-Filter der 30er Bauform, von Miele im Classic-C1-/Complete-C1-Kontext gelistet.'),
  AA30: source('Miele · Active AirClean SF-AA 30-1','https://www.miele.de/product/12718090/active-airclean-filter-sf-aa-30-1','Offizieller Aktivkohlefilter der 30er Bauform, von Miele im Classic-C1-/Complete-C1-Kontext gelistet.')
};

const bagMeta = {
  GN:{material:'12421170',ean:'4002516766940',label:'GN HyClean Pure'},
  FJM:{material:'12421180',ean:'4002516747505',label:'FJM HyClean Pure'},
  TU:{material:'12557060',ean:'4002516829751',label:'TU HyClean Pure'},
  CO:{material:'12557080',ean:'4002516830085',label:'CO HyClean Pure'}
};

const filterMeta = {
  HA50:{material:'12785390',label:'HEPA AirClean SF-HA 50-1',kind:'HEPA AirClean · HEPA 13'},
  AA50:{material:'12785350',label:'Active AirClean SF-AA 50-1',kind:'Aktivkohle-Abluftfilter'},
  AP50:{material:'12868930',label:'AirClean Plus SF-AP 50-1',kind:'AirClean Plus Abluftfilter'},
  SA50:{material:'12785400',label:'Silence AirClean SF-SA 50-1',kind:'Silence Abluftfilter'},
  HA30:{material:'12785370',label:'HEPA AirClean SF-HA 30-1',kind:'HEPA AirClean'},
  AA30:{material:'12718090',label:'Active AirClean SF-AA 30-1',kind:'Aktivkohle-Abluftfilter'}
};

const stockPlan=(id,label,defaultStock=2)=>({
  id,label,unit:'Beutel',defaultStock,avgDaysPerUnit:90,leadTimeMinDays:2,leadTimeMaxDays:5,safetyDays:7,supplyRisk:'normal',dataStatus:'verified',
  sourceLabel:'Miele nennt eine lange Nutzungsdauer; tatsächlicher Verbrauch wird nach Nutzerbestätigung gelernt.'
});

const issue=(id,label,summary,steps,linkedPartIds=[])=>({id,label,summary,steps,linkedPartIds,confidence:.78,dataStatus:'guidance'});
const jobItem=(id,label,role,overrides={})=>({id,label,role,required:role==='required',includedWithMain:false,dataStatus:'verified',...overrides});
const job=(id,label,summary,mainPartId,items,evidenceNote)=>({id,label,summary,mainPartId,items,dataStatus:'verified',evidenceNote});

function partFromBag(system){
  const meta=bagMeta[system];
  return {
    id:`miele-bag-${system.toLowerCase()}`,
    name:`Miele ${meta.label}`,
    kind:'Original-Staubsaugerbeutel · 4er-Pack',
    tier:'oem',
    identifiers:[{type:'material-number',value:meta.material},{type:'ean',value:meta.ean},{type:'bag-system',value:system}],
    fitment:{status:'manufacturer_verified',confidence:.99,evidence:[bagSources[system],mieleFinderSource]},
    offers:[]
  };
}

function partFromFilter(key){
  const meta=filterMeta[key];
  return {
    id:`miele-filter-${key.toLowerCase()}`,
    name:`Miele ${meta.label}`,
    kind:meta.kind,
    tier:'oem',
    identifiers:[{type:'material-number',value:meta.material},{type:'filter-system',value:key.replace(/[A-Z]+/,m=>m)}],
    fitment:{status:'manufacturer_verified',confidence:.98,evidence:[filterSources[key],mieleFinderSource]},
    offers:[]
  };
}

const familyConfig=[
  {id:'complete-c3',model:'Complete C3',aliases:['COMPLETE C3 EXTRA','COMPLETE C3 SILENCE','COMPLETE C3 FLEX','COMPLETE C3 STARLIGHT','S8'],bag:'GN',filters:['HA50','AA50','AP50','SA50'],filterSystem:'50',generation:'Bodenstaubsauger mit Beutel'},
  {id:'complete-c2',model:'Complete C2',aliases:['COMPLETE C2','S5'],bag:'GN',filters:['HA50','AA50','AP50','SA50'],filterSystem:'50',generation:'Bodenstaubsauger mit Beutel'},
  {id:'classic-c1',model:'Classic C1',aliases:['CLASSIC C1','S2'],bag:'GN',filters:['HA30','AA30'],filterSystem:'30',generation:'Bodenstaubsauger mit Beutel'},
  {id:'compact-c1',model:'Compact C1',aliases:['COMPACT C1','S4'],bag:'FJM',filters:['HA50','AA50','AP50','SA50'],filterSystem:'50',generation:'Kompakter Bodenstaubsauger mit Beutel'},
  {id:'compact-c2',model:'Compact C2',aliases:['COMPACT C2','S6'],bag:'FJM',filters:['HA50','AA50','AP50','SA50'],filterSystem:'50',generation:'Kompakter Bodenstaubsauger mit Beutel'},
  {id:'complete-c1',model:'Complete C1',aliases:['COMPLETE C1'],bag:'FJM',filters:['HA30','AA30'],filterSystem:'30',generation:'Bodenstaubsauger mit Beutel'},
  {id:'guard-l1',model:'Guard L1',aliases:['GUARD L1'],bag:'TU',filters:['HA50','AA50','AP50','SA50'],filterSystem:'50',generation:'Guard-Bodenstaubsauger mit Beutel'},
  {id:'guard-s1',model:'Guard S1',aliases:['GUARD S1'],bag:'TU',filters:['HA50','AA50','AP50','SA50'],filterSystem:'50',generation:'Guard-Bodenstaubsauger mit Beutel'},
  {id:'guard-m1',model:'Guard M1',aliases:['GUARD M1'],bag:'CO',filters:['HA50','AA50','AP50','SA50'],filterSystem:'50',generation:'Guard-Bodenstaubsauger mit Beutel'}
];

function buildFamily(config){
  const bag=bagMeta[config.bag];
  const bagPart=partFromBag(config.bag);
  const filterParts=config.filters.map(partFromFilter);
  const parts=[bagPart,...filterParts];
  const stockId=`miele-${config.id}-bags`;
  return {
    id:`vac-miele-${config.id}`,
    category:'vacuum',icon:'🧹',brand:'Miele',model:config.model,
    type:`${config.generation} · Miele Herstellerdaten`,
    aliases:[config.model,...config.aliases,bag.label,bag.material,bag.ean],
    identifiers:[
      {type:'model-family',value:config.model},
      {type:'bag-system',value:config.bag},
      {type:'bag-material-number',value:bag.material},
      {type:'bag-ean',value:bag.ean}
    ],
    dataStatus:'manufacturer-verified',
    vacuumMeta:{bagSystem:config.bag,filterSystem:config.filterSystem,deviceType:'bagged'},
    sources:[mieleFinderSource,bagSources[config.bag],...config.filters.map(key=>filterSources[key])],
    manuals:[{label:'Miele Beutel- & Filter-Finder',url:mieleFinderSource.url}],
    stockPlans:[stockPlan(stockId,`Miele ${bag.label}`)],
    issues:[
      issue(`${config.id}-weak-suction`,'Saugkraft ist schwach','Beutelstand, Abluftfilter und Luftweg systematisch prüfen.',[
        'Staubbeutel-Füllstand prüfen und bei Bedarf wechseln.',
        'Abluftfilter auf Sättigung bzw. Wechselanzeige prüfen.',
        'Schlauch, Rohr und Bodendüse auf Blockaden kontrollieren.',
        'Wenn die Saugkraft danach weiter schwach ist, Reparaturdienst erwägen.'
      ],[bagPart.id]),
      issue(`${config.id}-smell`,'Gerät / Abluft riecht','Beutel, Filter und aufgesaugtes Material als erste Ursachen prüfen.',[
        'Staubbeutel prüfen und bei Geruchsbelastung ersetzen.',
        'Abluftfilter prüfen.',
        'Bei Haustieren oder Rauch kann ein Active-AirClean-Filter eine passende Herstelleroption sein, sofern für die Familie gelistet.'
      ],[bagPart.id,...filterParts.filter(p=>p.id.includes('aa')).map(p=>p.id)])
    ],
    jobs:[
      job(`${config.id}-bag-change`,'Staubsaugerbeutel wechseln',`Passenden ${config.bag}-Beutel einsetzen und Vorrat aktualisieren.`,bagPart.id,[
        jobItem(`${config.id}-bag-main`,`${bag.label} · ${bag.material}`,'required',{partId:bagPart.id,includedWithMain:true,stockPlanId:stockId,reason:`Miele ordnet ${config.model} dem ${config.bag}-Beutelsystem zu.`}),
        jobItem(`${config.id}-bag-seal`,'Beutelsitz und Fach kontrollieren','recommended',{reason:'Nach dem Wechsel Sitz des Beutels und freien Luftweg prüfen.'})
      ],`Beutelsystem ${config.bag} ist über den offiziellen Miele Beutel- & Filter-Finder belegt.`),
      job(`${config.id}-filter-change`,'Abluftfilter prüfen / wechseln','Nur die von Miele für diese Familie gelisteten Filterbauformen verwenden.',filterParts[0]?.id||null,[
        ...filterParts.map((part,index)=>jobItem(`${config.id}-filter-${index}`,part.name,index===0?'recommended':'optional',{partId:part.id,reason:'Miele listet diesen Abluftfilter für die Gerätefamilie.'}))
      ],`Filterbauform ${config.filterSystem} und die sichtbaren Varianten stammen aus der offiziellen Miele-Zuordnung.`)
    ],
    parts,
    facts:[
      {label:'Gerätefamilie',value:config.model},
      {label:'Staubbeutel',value:`${config.bag} · ${bag.label}`},
      {label:'Beutel Material-Nr.',value:bag.material},
      {label:'Beutel EAN',value:bag.ean},
      {label:'Abluftfilter-System',value:`AirClean ${config.filterSystem}`},
      {label:'Datenstand',value:'06.10.2026'}
    ]
  };
}

export const mieleVacuumProducts=familyConfig.map(buildFamily);

export const mieleVacuumScenarios=[
  {label:'Complete C3',query:'Complete C3',productId:'vac-miele-complete-c3'},
  {label:'GN Beutel',query:'12421170',productId:'vac-miele-complete-c3'},
  {label:'Classic C1',query:'Classic C1',productId:'vac-miele-classic-c1'},
  {label:'Compact C2',query:'Compact C2',productId:'vac-miele-compact-c2'},
  {label:'Guard L1',query:'Guard L1',productId:'vac-miele-guard-l1'},
  {label:'Guard M1',query:'12557080',productId:'vac-miele-guard-m1'}
];

export const mieleVacuumCategory={id:'vacuum',name:'Staubsauger',icon:'🧹'};
