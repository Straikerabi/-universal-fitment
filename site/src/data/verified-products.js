const source = (name,url,note,{type='manufacturer',grade='A',license='source-linked'}={}) => ({
  name,type,url,retrievedAt:'2026-10-05',license,note,grade
});

const stockPlan = (id,label,unit,defaultStock,avgDaysPerUnit,overrides={}) => ({
  id,label,unit,defaultStock,avgDaysPerUnit,leadTimeMinDays:2,leadTimeMaxDays:4,safetyDays:4,supplyRisk:'normal',dataStatus:'verified',...overrides
});

const jobItem = (id,label,role,overrides={}) => ({
  id,label,role,required:role==='required',includedWithMain:false,dataStatus:'verified',...overrides
});

const job = (id,label,summary,mainPartId,items,overrides={}) => ({
  id,label,summary,mainPartId,items,dataStatus:'verified',...overrides
});

const dysonSource = source(
  'Dyson Deutschland · Ersatzfilter 970013-02',
  'https://www.dyson.de/support/journey/spare-details.970013-02',
  'Dyson nennt Teil 970013-02 als kompatibel mit Dyson V11 und V15; die Seite listet konkrete V11-Varianten mit Klick-Akku.'
);

const mieleSource = source(
  'Miele · HyClean 3D Efficiency GN Datenblatt',
  'https://media.miele.com/downloads/e-/de/FS_09917730_DED_DE-de-DE.pdf',
  'Offizielles Miele-Datenblatt: EAN 4002515488492, Materialnummer 09917730, Inhalt 4 Beutel + Motorschutz- und Abluftfilter; u. a. für Complete C3.'
);



const krupsEspertaSource = source(
  'Krups · NDG ESPERTA KP310',
  'https://www.krups.de/Zubeh%C3%B6r-Shop/getraenkezubereitung/nescafe-dolce-gusto/ndg-esperta-kp310/csp/8010000306',
  'Offizielle Krups-Seite: NDG ESPERTA KP310, Artikelnummer KP310510, Ref. Nr. KP310510/7Z0.'
);

const krupsCapsuleHolderSource = source(
  'Krups · Kapselhalter MS-624360',
  'https://www.krups.de/Zubeh%C3%B6r-Shop/kapselhalter-ms-624360/a/8030000075',
  'Krups führt MS-624360 ausdrücklich als kompatibel mit NDG ESPERTA KP310 / KP310510.'
);

const krupsDripTraySource = source(
  'Krups · Abtropfbehälter MS-624569',
  'https://www.krups.de/Zubeh%C3%B6r-Shop/abtropfbeholter-ms-624569/a/8030000629',
  'Krups führt MS-624569 ausdrücklich für NDG ESPERTA KP310 / KP310510.'
);

const krupsGridSource = source(
  'Krups · Gitter MS-624570',
  'https://www.krups.de/Zubeh%C3%B6r-Shop/gitter-ms-624570/a/8030000630',
  'Krups führt MS-624570 ausdrücklich für NDG ESPERTA KP310 / KP310510.'
);

const krupsTankLidSource = source(
  'Krups · Deckel Wasserbehälter MS-624673',
  'https://www.krups.de/Zubeh%C3%B6r-Shop/deckel-des-wasserbehalters-ms-624673/a/8030000903',
  'Krups führt MS-624673 als kompatibel mit NDG ESPERTA KP310 / KP310510.'
);

const krupsTrayHolderSource = source(
  'Krups · Halter Abtropfschale MS-624688',
  'https://www.krups.de/Zubeh%C3%B6r-Shop/halter-fur-die-abtropfschale-ms-624688/a/8030000918',
  'Krups führt MS-624688 als kompatibel mit NDG ESPERTA KP310 / KP310510.'
);

const delonghiCoffeeSource = source(
  "De'Longhi · Magnifica Evo",
  'https://www.delonghi.com/de-de/c/kaffee/kaffeemaschinen/kaffeevollautomaten/magnifica/magnifica-evo',
  "Offizielle De'Longhi-Produktseite der Magnifica-Evo-Familie; listet ECAM290.89.SBX EX:1 als Modellvariante."
);

const delonghiDescalerSource = source(
  "De'Longhi · Decalk Care DLSC500",
  'https://www.delonghi.com/de-de/p/entkalker-und-wasserfilter-decalk-care-entkalker--500-ml--flasche-fur-5-anwendungen/DLSC500.html?pid=5513296041',
  "De'Longhi nennt DLSC500 als Original-Pflegeprodukt für alle De'Longhi Kaffeemaschinen."
);

const philipsCoffeeSource = source(
  'Philips · Series 5500 EP5547/90',
  'https://acc.philips.de/c-p/EP5547_90/series-5500-kaffeevollautomat',
  'Offizielle Philips-Produktseite für den Series 5500 Kaffeevollautomaten EP5547/90.'
);

const philipsAquaCleanSource = source(
  'Philips · AquaClean CA6903/22',
  'https://www.philips.de/c-p/CA6903_22/kalk-und-wasserfilter',
  'Offizielle Philips-Seite führt EP5547/90 unter den kompatiblen Produkten des AquaClean-Filters.'
);

const nespressoCoffeeSource = source(
  'Nespresso · VERTUO Pop',
  'https://www.nespresso.com/de/de/order/machines/vertuo/vertuo-pop-aquamint-nespresso-kaffeemaschine-und-aeroccino3',
  'Offizielle Nespresso-Produktseite für die VERTUO-Pop-Maschinenfamilie.'
);

const nespressoDescalerSource = source(
  'Nespresso · Maschinen-FAQ',
  'https://www.contact.nespresso.com/faq-3/de/de',
  'Nespresso nennt das eigene Entkalkerset als für alle Maschinen geeignet.'
);

const boschSource = source(
  'Bosch · WAE24166UK Produktdatenblatt',
  'https://media3.bosch-home.com/Documents/specsheet/en-GB/WAE24166UK.pdf',
  'Offizielles Bosch-Datenblatt für WAE24166UK mit EAN 4242002720524 und technischen Gerätedaten.'
);

export const verifiedProducts = [
  {
    id:'coffee-krups-kp310510-real', category:'coffee', icon:'☕', brand:'Krups', model:'KP310510/7Z0', type:'Nescafé Dolce Gusto Esperta KP310 · Kapselmaschine · Herstellerdaten',
    aliases:['KP310','KP310510','KP310510/7Z0','NDG ESPERTA KP310','ESPERTA KP310'],
    identifiers:[{type:'type',value:'KP310'},{type:'product-number',value:'KP310510'},{type:'reference',value:'KP310510/7Z0'}],
    dataStatus:'manufacturer-verified', sources:[krupsEspertaSource],
    manuals:[{label:'Krups Bedienungsanleitungen / FAQ',url:'https://www.krups.de/bedienungsanleitungen/getraenkezubereitung/nescafe-dolce-gusto/ndg-esperta-kp310/csp/8010000306',source:'Krups'}],
    stockPlans:[], issues:[],
    jobs:[
      job('krups-kp310-accessories','Ersatzteil auswählen','Herstellerbestätigte Außenteile für die Esperta KP310 anzeigen.','krups-ms624360',[
        jobItem('krups-kp310-holder','Kapselhalter MS-624360','required',{partId:'krups-ms624360',includedWithMain:true,reason:'Krups führt KP310510 in der offiziellen Kompatibilitätsliste'}),
        jobItem('krups-kp310-tray','Abtropfbehälter MS-624569','recommended',{partId:'krups-ms624569',reason:'Offiziell für KP310510 gelistet'}),
        jobItem('krups-kp310-grid','Gitter MS-624570','recommended',{partId:'krups-ms624570',reason:'Offiziell für KP310510 gelistet'})
      ],{evidenceNote:'Alle hier als kompatibel markierten Teile sind mit einer Krups-Herstellerquelle verknüpft.'})
    ],
    parts:[
      {id:'krups-ms624360',name:'Kapselhalter MS-624360',kind:'Original-Ersatzteil',tier:'oem',identifiers:[{type:'part-number',value:'MS-624360'}],fitment:{status:'manufacturer_verified',confidence:.99,evidence:[krupsCapsuleHolderSource]},offers:[]},
      {id:'krups-ms624569',name:'Abtropfbehälter MS-624569',kind:'Original-Ersatzteil',tier:'oem',identifiers:[{type:'part-number',value:'MS-624569'}],fitment:{status:'manufacturer_verified',confidence:.99,evidence:[krupsDripTraySource]},offers:[]},
      {id:'krups-ms624570',name:'Gitter MS-624570',kind:'Original-Ersatzteil',tier:'oem',identifiers:[{type:'part-number',value:'MS-624570'}],fitment:{status:'manufacturer_verified',confidence:.99,evidence:[krupsGridSource]},offers:[]},
      {id:'krups-ms624673',name:'Deckel Wasserbehälter MS-624673',kind:'Original-Ersatzteil',tier:'oem',identifiers:[{type:'part-number',value:'MS-624673'}],fitment:{status:'manufacturer_verified',confidence:.99,evidence:[krupsTankLidSource]},offers:[]},
      {id:'krups-ms624688',name:'Halter für die Abtropfschale MS-624688',kind:'Original-Ersatzteil',tier:'oem',identifiers:[{type:'part-number',value:'MS-624688'}],fitment:{status:'manufacturer_verified',confidence:.99,evidence:[krupsTrayHolderSource]},offers:[]}
    ],
    facts:[{label:'System',value:'Nescafé Dolce Gusto'},{label:'Wassertank',value:'1,4 l'},{label:'Pumpendruck',value:'bis 15 bar'}]
  },
  {
    id:'coffee-delonghi-ecam29089-real', category:'coffee', icon:'☕', brand:"De'Longhi", model:'ECAM290.89.SBX EX:1', type:'Kaffeevollautomat · Magnifica Evo · Herstellerdaten',
    aliases:['ECAM290.89.SBX','ECAM29089SBX','MAGNIFICA EVO'],
    identifiers:[{type:'model',value:'ECAM290.89.SBX EX:1'},{type:'family',value:'Magnifica Evo'}],
    dataStatus:'manufacturer-verified', sources:[delonghiCoffeeSource], manuals:[], stockPlans:[], issues:[],
    jobs:[
      job('delonghi-descale-job','Entkalken','Original-Pflegeprodukt mit Herstellerquelle für die Maschine vormerken.','delonghi-dlsc500',[ 
        jobItem('delonghi-descale-main','Decalk Care DLSC500','required',{partId:'delonghi-dlsc500',includedWithMain:true,reason:"De'Longhi empfiehlt DLSC500 für alle eigenen Kaffeemaschinen"})
      ],{evidenceNote:"Die konkrete Entkalkungsprozedur richtet sich nach der Bedienungsanleitung der Maschine."})
    ],
    parts:[
      {id:'delonghi-dlsc500',name:'Decalk Care DLSC500',kind:'Entkalker · 500 ml',tier:'oem',identifiers:[{type:'part-number',value:'DLSC500'}],fitment:{status:'manufacturer_verified',confidence:.99,evidence:[delonghiDescalerSource]},offers:[]}
    ]
  },
  {
    id:'coffee-philips-ep554790-real', category:'coffee', icon:'☕', brand:'Philips', model:'EP5547/90', type:'Kaffeevollautomat · Series 5500 · Herstellerdaten',
    aliases:['EP5547/90','EP554790','SERIES 5500','LATTEGO 5500'],
    identifiers:[{type:'model',value:'EP5547/90'},{type:'family',value:'Series 5500'}],
    dataStatus:'manufacturer-verified', sources:[philipsCoffeeSource], manuals:[], stockPlans:[], issues:[],
    jobs:[
      job('philips-filter-job','Wasserfilter wechseln','Herstellerbestätigten AquaClean-Filter für dieses Modell verwalten.','philips-ca690322',[ 
        jobItem('philips-filter-main','AquaClean CA6903/22','required',{partId:'philips-ca690322',includedWithMain:true,reason:'Philips führt EP5547/90 ausdrücklich als kompatibles Produkt'})
      ],{evidenceNote:'Austauschhinweise und Aktivierung immer nach der aktuellen Philips-Anleitung ausführen.'})
    ],
    parts:[
      {id:'philips-ca690322',name:'AquaClean CA6903/22',kind:'Wasserfilter · 2er-Pack',tier:'oem',identifiers:[{type:'part-number',value:'CA6903/22'}],fitment:{status:'manufacturer_verified',confidence:.99,evidence:[philipsAquaCleanSource]},offers:[]}
    ],
    facts:[{label:'Getränke',value:'20 Heiß- und Kaltgetränke'},{label:'Milchsystem',value:'LatteGo'}]
  },
  {
    id:'coffee-nespresso-vertuo-pop-real', category:'coffee', icon:'☕', brand:'Nespresso', model:'VERTUO Pop', type:'Kapselmaschine · Herstellerdaten',
    aliases:['VERTUO POP','NESPRESSO VERTUO POP'],
    identifiers:[{type:'model-family',value:'VERTUO Pop'}],
    dataStatus:'manufacturer-verified', sources:[nespressoCoffeeSource], manuals:[], stockPlans:[], issues:[],
    jobs:[
      job('nespresso-descale-job','Entkalken','Originales Entkalkerset passend zur Nespresso-Maschinenfamilie vormerken.','nespresso-descaler',[ 
        jobItem('nespresso-descale-main','Nespresso Entkalkerset','required',{partId:'nespresso-descaler',includedWithMain:true,reason:'Nespresso nennt das Set als für alle Maschinen geeignet'})
      ],{evidenceNote:'Der Ablauf ist modellabhängig; Nespresso verweist auf den Maschinen-Assistenten.'})
    ],
    parts:[
      {id:'nespresso-descaler',name:'Nespresso Entkalkerset',kind:'Pflege · 2 Anwendungen',tier:'oem',identifiers:[{type:'product',value:'Nespresso Entkalkerset'}],fitment:{status:'manufacturer_verified',confidence:.99,evidence:[nespressoDescalerSource]},offers:[]}
    ]
  },
  {
    id:'vac-dyson-v11-real', category:'vacuum', icon:'🧹', brand:'Dyson', model:'V11 · Klick-Akku', type:'Staubsauger · Herstellerdaten',
    aliases:['DYSON V11','V11 ABSOLUTE EXTRA','V11 CLICK IN','970013-02'],
    identifiers:[{type:'model-family',value:'Dyson V11'},{type:'part-number',value:'970013-02'}],
    dataStatus:'manufacturer-verified', sources:[dysonSource], manuals:[], stockPlans:[], issues:[],
    jobs:[
      job('dyson-v11-filter-job','Filter ersetzen','Herstellerbestätigten Ersatzfilter auswählen und Luftwege mitprüfen.','dyson-v11-filter',[
        jobItem('dyson-v11-filter-main','Dyson Filter 970013-02','required',{partId:'dyson-v11-filter',includedWithMain:true,reason:'Dyson führt das Teil als kompatibel für V11-Modelle mit Klick-Akku'}),
        jobItem('dyson-v11-airway-check','Rohr und Düse auf Blockaden prüfen','recommended',{reason:'Prüfpunkt ohne Teilekauf'})
      ],{evidenceNote:'Kompatibilität des Filters basiert auf der verlinkten Dyson-Herstellerseite. Vor Bestellung konkrete V11-Ausführung gegenprüfen.'})
    ],
    parts:[
      {
        id:'dyson-v11-filter', name:'Dyson Staubsaugerfilter 970013-02', kind:'Originalfilter', tier:'oem',
        identifiers:[{type:'part-number',value:'970013-02'}],
        fitment:{status:'manufacturer_verified',confidence:.99,evidence:[dysonSource]},
        offers:[]
      }
    ]
  },
  {
    id:'vac-miele-c3-real', category:'vacuum', icon:'🧹', brand:'Miele', model:'Complete C3 · GN-System', type:'Beutelstaubsauger · Herstellerdaten',
    aliases:['MIELE COMPLETE C3','HYCLEAN GN','09917730','4002515488492'],
    identifiers:[{type:'model-family',value:'Complete C3'},{type:'ean',value:'4002515488492'},{type:'material-number',value:'09917730'}],
    dataStatus:'manufacturer-verified', sources:[mieleSource], manuals:[], issues:[],
    stockPlans:[
      stockPlan('miele-gn-bags','Miele HyClean 3D Efficiency GN','Beutel',2,24,{leadTimeMinDays:2,leadTimeMaxDays:5,safetyDays:5,supplyRisk:'normal',sourceLabel:'Lieferzeit vom Nutzer / Händler'})
    ],
    jobs:[
      job('miele-gn-change','Staubsaugerbeutel wechseln','Original-GN-Beutel und Filterbestand als einen Verbrauchsvorgang verwalten.','miele-gn-bag',[
        jobItem('miele-gn-main','HyClean 3D Efficiency GN','required',{partId:'miele-gn-bag',includedWithMain:true,stockPlanId:'miele-gn-bags',reason:'Miele nennt Complete C3 ausdrücklich im offiziellen Datenblatt'}),
        jobItem('miele-gn-filter-check','Motorschutz- und Abluftfilter prüfen','recommended',{reason:'Das offizielle 4er-Paket enthält je einen Motorschutz- und Abluftfilter'})
      ],{evidenceNote:'Herstellerdaten auf Familienebene. Das konkrete Gerät sollte vor Bestellung anhand seiner Modellkennung bestätigt werden.'})
    ],
    parts:[
      {
        id:'miele-gn-bag', name:'Miele HyClean 3D Efficiency GN', kind:'Staubsaugerbeutel · 4er-Pack', tier:'oem',
        identifiers:[{type:'ean',value:'4002515488492'},{type:'material-number',value:'09917730'}],
        fitment:{status:'manufacturer_verified',confidence:.99,evidence:[mieleSource]},
        offers:[]
      }
    ]
  },
  {
    id:'wash-bosch-wae24166uk-real', category:'washing', icon:'🧺', brand:'Bosch', model:'WAE24166UK', type:'Waschmaschine · 6 kg · 1200 U/min · Herstellerdaten',
    aliases:['WAE24166UK','4242002720524'],
    identifiers:[{type:'model',value:'WAE24166UK'},{type:'ean',value:'4242002720524'}],
    dataStatus:'manufacturer-verified', sources:[boschSource], manuals:[], stockPlans:[], issues:[], jobs:[], parts:[],
    facts:[
      {label:'Kapazität',value:'6 kg'},
      {label:'Schleudern',value:'1200 U/min'},
      {label:'Abmessungen',value:'847 × 600 × 590 mm'}
    ]
  }
];

export const verifiedScenarios = [
  {label:'✓ Krups Esperta echt',query:'KP310510/7Z0',productId:'coffee-krups-kp310510-real'},
  {label:'✓ De’Longhi echt',query:'ECAM290.89.SBX',productId:'coffee-delonghi-ecam29089-real'},
  {label:'✓ Philips Kaffee echt',query:'EP5547/90',productId:'coffee-philips-ep554790-real'},
  {label:'✓ Nespresso echt',query:'VERTUO POP',productId:'coffee-nespresso-vertuo-pop-real'},
  {label:'✓ Dyson V11 echt',query:'970013-02',productId:'vac-dyson-v11-real'},
  {label:'✓ Miele GN echt',query:'4002515488492',productId:'vac-miele-c3-real'},
  {label:'✓ Bosch EAN echt',query:'4242002720524',productId:'wash-bosch-wae24166uk-real'}
];
