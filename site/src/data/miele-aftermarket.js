// Curated supplier statements checked 2026-10-06. They are not approvals from Miele.
// A series statement is not an exact serial-number verification. No live offers.
const ep='https://electropapa.com/de/';
const document=(code)=>({label:'vhbw · Bedienung & Sicherheit',kind:'supplier-manual',url:`https://www.vhbw.de/media/${code}/generic/documents_manufacturer/manuals_out/${code}-manual.pdf`});

export const mieleAftermarketRecords=[
  {
    code:'swirl-m40-m50-anti-geruch',brand:'Swirl',name:'M 40 / M 50 MicroPor Plus Anti-Geruch · 4 Beutel',kind:'Staubsaugerbeutel',
    url:'https://www.swirl.de/de/staubsaugen/staubsaugerbeutel/micropor-plus-anti-geruch-staubsaugerbeutel',
    scope:{series:['Classic C1','Compact C1','Compact C2','Complete C1','Complete C3'],models:['Complete C2 Tango EcoLine'],bagSystems:['GN','FJM']},
    replaces:['GN','FJM'],
    note:'Swirl nennt diese Familien und die Originalbeutelsysteme GN/FJM. Complete C2 wird nur als Tango EcoLine genannt; andere C2-Ausführungen werden nicht pauschal zugeordnet.',
    manuals:[{label:'Swirl · Beutelwechsel mit Bildern',kind:'installation-guide',url:'https://www.swirl.de/de/haushaltstipps/staubsaugerbeutel-wechseln'}]
  },
  {
    code:'685205812',brand:'SQOON',name:'Vliesbeutel für Guard · 12 Beutel + 3 Gebläsefilter',kind:'Staubsaugerbeutel',ean:'8720812661139',
    url:'https://www.reinigungsberater.de/staubsaugerbeutel-sqoon-fuer-miele-guard-m1-l1-s1-aus-vlies-p-685205812',
    sourceType:'seller',scope:{series:['Guard M1','Guard L1','Guard S1'],bagSystems:['CO','TU']},replaces:['CO','TU'],
    note:'Reinigungsberater listet diesen SQOON-Nachbau für Guard M1/L1/S1 und als Ersatz für CO/TU. Dies ist eine Händlerangabe, keine Miele-Freigabe.',manuals:[]
  },
  {
    code:'889005195',brand:'vhbw',name:'Ersatzakku AP01/AP02 · 25,2 V · 2500 mAh',kind:'Akku',
    url:ep+'akku-als-ersatz-fuer-ap01-hx-la-1010042-ap02-hs19-11384710-fuer-miele-staubsauger-2500mah-25-2v-li-ion-889005195',
    scope:{series:['Triflex HX1','Triflex HX2']},replaces:['AP01','AP02','11384710','HX-LA'],
    note:'Der Nachbau-Anbieter nennt Triflex HX1/HX1 Facelift/HX2. Triflex HX3 und Duoflex sind nicht belegt. Akku-Code und Ladegerät müssen übereinstimmen.',manuals:[document('889005195')]
  },
  {
    code:'889005194',brand:'vhbw',name:'Ersatzakku AP01/AP02 · 25,2 V · 2000 mAh',kind:'Akku',
    url:ep+'akku-als-ersatz-fuer-ap01-hx-la-1010042-ap02-hs19-11384710-fuer-miele-staubsauger-2000mah-25-2-v-li-ion-889005194',
    scope:{series:['Triflex HX1','Triflex HX2']},replaces:['AP01','AP02','11384710','HX-LA'],
    note:'Anbieterzuordnung für Triflex HX1/HX1 Facelift/HX2. Unterschiedliche Kapazität; vorhandenen Akku-Code und Ladegerät vor Auswahl vergleichen.',manuals:[document('889005194')]
  },
  {
    code:'889002523',brand:'vhbw',name:'Ladegerät · 30 V / 0,7 A',kind:'Ladegerät',
    url:ep+'ladegeraet-als-ersatz-fuer-miele-11681701-11015473-11015470-fuer-miele-handstaubsauger-akkustaubsauger-889002523',
    scope:{series:['Triflex HX1','Triflex HX2']},replaces:['11681701','11015473','11015470','LG01/01','LG02/01'],
    note:'Die Quelle nennt Triflex HX1/HX2; der zusätzliche Eintrag „Duroflex HX1“ ist uneindeutig und wird nicht als Duoflex-Zuordnung übernommen. Stecker, Spannung und Originalcode prüfen.',manuals:[document('889002523')]
  },
  {
    code:'889008816',brand:'vhbw',name:'Lamellen-Zentralfilter mit Vorfilter · Boost CX1',kind:'Filter',
    url:ep+'lamellen-zentralfilter-mit-vorfilter-als-ersatz-fuer-miele-11169285-11639250-fuer-miele-staubsauger-889008816',
    scope:{series:['Boost CX1']},replaces:['11169285','11639250'],
    note:'Anbieter nennt Boost CX1 und mehrere PowerLine-, Parquet-, Cat & Dog- und Sondereditionen. Filterform und Originalnummer vergleichen.',manuals:[document('889008816')]
  },
  {
    code:'889004762',brand:'vhbw',name:'Abluftfilter als Ersatz für SF-HY 60',kind:'Filter',
    url:ep+'filter-als-ersatz-fuer-miele-sf-hy-60-11639240-fuer-miele-staubsauger-889004762',
    scope:{models:['Boost CX1 125 Edition','Boost CX1 125 Gala Edition','Boost CX1 Active','Boost CX1 Allergy','Boost CX1 Car Care','Boost CX1 Cat & Dog PowerLine','Boost CX1 Parquet','Boost CX1 Parquet PowerLine','Boost CX1 PowerLine'],typeCodes:['SNCF0','SNCI3','SNRF0','SNRF3']},replaces:['SF-HY 60','11639240'],
    note:'Anbieter nennt konkrete Boost-CX1-Modelle und Typen. Dies ist ein SF-HY-60-Nachbau; eine gleichwertige HEPA-Klasse wird hier nicht zugesagt.',manuals:[]
  },
  {
    code:'889010451',brand:'vhbw',name:'4 Filter als Ersatz für HX-FDF20 · Duoflex',kind:'Filter',
    url:ep+'4x-filter-als-ersatz-fuer-miele-hx-fdf20-fuer-miele-staubsauger-889010451',
    scope:{series:['Duoflex HX1']},replaces:['HX-FDF20'],
    note:'Anbieter nennt Miele Duoflex und HX-FDF20. Nicht für Triflex zugeordnet; Originalfilterbezeichnung vergleichen.',manuals:[document('889010451')]
  },
  {
    code:'888302080',brand:'vhbw',name:'3 HEPA-Abluftfilter als Ersatz für SF-AA 50',kind:'Filter',
    url:ep+'3x-hepa-abluft-filter-passend-fuer-miele-complete-c3-staubsauger-ersetzt-sf-aa-50-888302080',
    scope:{series:['Compact C1','Compact C2','Complete C3'],models:['Complete C2 Jubilee PowerLine','Complete C2 Tango EcoLine']},replaces:['SF-AA 50'],
    note:'Die Anbieterquelle nennt diese Serien/Modelle. Der Nachbau ersetzt SF-AA 50; die HEPA-13-Angabe stammt vom Anbieter. Kein pauschaler Nachweis für Guard oder Classic C1.',manuals:[document('888302080')]
  },
  {
    code:'888400575',brand:'vhbw',name:'Saugschlauch mit Griff · 1,8 m',kind:'Schlauch',
    url:'https://electropapa.com/pl/waz-do-odkurzacza-miele-complete-c3-z-uchwytem-1-8-m-888400575',
    scope:{series:['Classic C1','Compact C2','Complete C1','Complete C3']},replaces:[],
    excludeHandleControl:true,
    note:'Die polnische Produktseite des Anbieters nennt diese Serien. Mechanischer Schlauch; Funk-/Elektro-Handgriff und Anschlüsse separat prüfen.',manuals:[]
  }
];
