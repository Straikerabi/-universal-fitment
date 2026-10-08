export const categories = [
  {id:'vacuum', icon:'🧹', name:'Staubsauger'},
  {id:'washing', icon:'🧺', name:'Waschmaschinen'},
  {id:'coffee', icon:'☕', name:'Kaffeemaschinen'},
  {id:'tools', icon:'🧰', name:'Elektrowerkzeuge'},
  {id:'car', icon:'🚗', name:'Autos'}
];

const src = (name, type='demo', note='Prototype fixture', grade='B') => ({
  name,type,url:null,retrievedAt:'2026-10-05',license:'prototype-only',note,grade
});
const offer = (merchant, price, shipping, qualityScore, rating, reviewCount, overrides={}) => ({
  merchant, price, shipping, currency:'EUR', qualityScore,
  rating, reviewCount, reviewTrust: reviewCount > 500 ? 8.5 : 7,
  sellerScore:8, returnsScore:7.5, compatibilityConfidence:0.9,
  sponsored:false, deliveryDays:3, stock:'in-stock', dataStatus:'demo', ...overrides
});
const issue = (id,label,summary,linkedPartIds,steps,overrides={}) => ({
  id,label,summary,linkedPartIds,steps,confidence:.8,risk:'low',dataStatus:'demo',...overrides
});
const jobItem = (id,label,role,overrides={}) => ({
  id,label,role,required:role==='required',includedWithMain:false,dataStatus:'demo',...overrides
});
const job = (id,label,summary,mainPartId,items,overrides={}) => ({
  id,label,summary,mainPartId,items,dataStatus:'demo',...overrides
});
const stockPlan = (id,label,unit,defaultStock,avgDaysPerUnit,overrides={}) => ({
  id,label,unit,defaultStock,avgDaysPerUnit,leadTimeMinDays:2,leadTimeMaxDays:4,safetyDays:4,supplyRisk:'normal',dataStatus:'demo',...overrides
});

export const products = [
  {
    id:'tool-demo-1', category:'tools', icon:'🧰', brand:'Bosch', model:'GSR 18V-55', type:'Akku-Bohrschrauber', aliases:['GSR18V55'],
    identifiers:[{type:'model',value:'GSR 18V-55'},{type:'demo-code',value:'UF-TOOL-001'}],
    dataStatus:'demo', manuals:[], stockPlans:[],
    issues:[
      issue('tool-low-runtime','Akku hält kaum noch','Kurze Laufzeit kann am Akku, Ladezustand oder an hoher Last liegen.',['p-tool-bat'],['Akku vollständig laden und erneut testen.','Wenn vorhanden, zweiten kompatiblen Akku gegenprüfen.','Kontakte auf Schmutz oder Beschädigung prüfen.'],{confidence:.86})
    ],
    jobs:[
      job('tool-battery-change','Akku ersetzen','Passenden Akku auswählen und sinnvolle Begleitpunkte prüfen.','p-tool-bat',[
        jobItem('tool-battery-main','18-V-Akku 5,0 Ah','required',{partId:'p-tool-bat',includedWithMain:true,reason:'Hauptteil'}),
        jobItem('tool-contact-check','Akkukontakte prüfen / reinigen','recommended',{reason:'Verhindert Fehlersuche am falschen Bauteil'}),
        jobItem('tool-charger-check','Ladegerät gegenprüfen','recommended',{reason:'Hilft Akku- und Ladefehler zu unterscheiden'})
      ])
    ],
    parts:[
      {id:'p-tool-bat',name:'18-V-Akku 5,0 Ah',kind:'Akku',tier:'oem-or-compatible',fitment:{status:'catalog-like-demo',confidence:0.96,evidence:[src('Demo-Herstellerdatensatz','manufacturer-demo','Simulierter Hersteller-Nachweis für den Demo-Flow','A'),src('Demo-Fitment-Katalog','catalog-demo','Zweiter unabhängiger Demo-Nachweis','A')]},offers:[offer('Original Option',74.90,0,9.1,4.8,2410,{sellerScore:9.2,returnsScore:9.0,compatibilityConfidence:.96,deliveryDays:2}),offer('Compatible Pro',46.90,4.90,8.2,4.5,830,{compatibilityConfidence:.91,deliveryDays:2}),offer('Budget Parts',31.90,5.90,6.8,4.3,380,{compatibilityConfidence:.88,deliveryDays:4})]},
      {id:'p-tool-chuck',name:'Bohrfutter',kind:'Ersatzteil',tier:'aftermarket',fitment:{status:'demo',confidence:0.82,evidence:[src('Demo-Fitment-Katalog','catalog-demo','Prototypischer Katalogabgleich','B')]},offers:[offer('Example Shop',29.90,4.90,7.8,4.6,170,{compatibilityConfidence:.82})]}
    ]
  },
  {
    id:'wash-demo-1', category:'washing', icon:'🧺', brand:'Bosch', model:'WAN282H3', type:'Waschmaschine', aliases:['WAN 282 H3'],
    identifiers:[{type:'model',value:'WAN282H3'},{type:'demo-code',value:'UF-WASH-001'}],
    dataStatus:'demo', manuals:[],
    stockPlans:[
      stockPlan('wash-detergent','Waschmittel','Packungen',1,35,{leadTimeMinDays:2,leadTimeMaxDays:4,safetyDays:5}),
      stockPlan('wash-cleaner','Maschinenreiniger','Anwendungen',2,45,{leadTimeMinDays:2,leadTimeMaxDays:5,safetyDays:7})
    ],
    issues:[
      issue('wash-no-drain','Wasser wird nicht abgepumpt','Häufig sind Filter, Fremdkörper oder Ablaufpumpe beteiligt.',['p-wash-filter','p-wash-pump'],['Gerät ausschalten und Netzstecker ziehen.','Pumpenfilter nach Bedienungsanleitung kontrollieren.','Ablaufschlauch auf Knick oder Blockade prüfen.','Erst danach die Ablaufpumpe als Ursache weiter prüfen.'],{confidence:.88}),
      issue('wash-smell','Unangenehmer Geruch','Geruch entsteht oft durch Rückstände, stehendes Wasser oder einen verschmutzten Filter.',['p-wash-filter'],['Pumpenfilter kontrollieren.','Türdichtung und Waschmittelschublade reinigen.','Leeren heißen Pflegegang nach Herstellerangabe durchführen.'],{confidence:.76})
    ],
    jobs:[
      job('wash-pump-change','Ablaufpumpe ersetzen','Nicht nur die Pumpe: Dichtung, Befestigung und angrenzende Teile werden als Arbeitskorb geprüft.','p-wash-pump',[
        jobItem('wash-pump-main','Ablaufpumpe','required',{partId:'p-wash-pump',includedWithMain:true,reason:'Hauptteil'}),
        jobItem('wash-pump-seal','Pumpendichtung / O-Ring','required',{partId:'p-wash-seal',reason:'Im Demo-Arbeitsvorgang als zu erneuernde Abdichtung hinterlegt'}),
        jobItem('wash-clamp','Schlauchschelle / Befestigung prüfen','recommended',{partId:'p-wash-clamp',reason:'Nur ergänzen, wenn Ausführung oder Zustand es erfordern'}),
        jobItem('wash-filter-check','Pumpenfilter prüfen','recommended',{partId:'p-wash-filter',reason:'Ist der Arbeitsbereich ohnehin offen, kann der Zustand direkt kontrolliert werden'})
      ],{evidenceNote:'Demo-Arbeitsvorgang – keine echte Hersteller-Reparaturanweisung'}),
      job('wash-care','Maschine reinigen & pflegen','Pflegeprodukte und Prüfpunkte für einen sauberen Pflegegang bündeln.',null,[
        jobItem('wash-care-cleaner','Maschinenreiniger','care',{stockPlanId:'wash-cleaner',reason:'Pflegeprodukt – Auswahl später nach Herstellerangabe und Wasserhärte'}),
        jobItem('wash-care-drawer','Waschmittelschublade reinigen','recommended',{reason:'Mechanischer Pflegepunkt, kein Kauf erforderlich'}),
        jobItem('wash-care-seal','Türdichtung reinigen','recommended',{reason:'Mechanischer Pflegepunkt, kein Kauf erforderlich'}),
        jobItem('wash-care-detergent','Waschmittel passend zu Wäsche & Wasserhärte','consumable',{stockPlanId:'wash-detergent',reason:'Nicht pauschal „bestes“ Produkt – Empfehlung muss Dosierung, Wasserhärte und Textilien berücksichtigen'}),
        jobItem('wash-care-softener','Weichspüler nur nach Bedarf','optional',{reason:'Persönliche Präferenz; nicht als notwendiges Produkt verkaufen'})
      ])
    ],
    parts:[
      {id:'p-wash-pump',name:'Ablaufpumpe',kind:'Ersatzteil',tier:'aftermarket',fitment:{status:'demo',confidence:0.89,evidence:[src('Demo-Gerätekatalog','catalog-demo','Simulierter Katalognachweis','A'),src('Demo-Modellabgleich','model-match-demo','Modellkennung stimmt im Demo-Datensatz überein','B')]},offers:[offer('Parts Direct',34.90,5.90,7.8,4.7,310,{compatibilityConfidence:.89}),offer('Original Option',58.90,0,9.0,4.8,680,{compatibilityConfidence:.94,deliveryDays:2})]},
      {id:'p-wash-seal',name:'Pumpendichtung / O-Ring',kind:'Anbauteil',tier:'aftermarket',fitment:{status:'demo',confidence:0.82,evidence:[src('Demo-Arbeitsvorgang','prototype-fixture','Dichtung als separates Begleitteil modelliert','B')]},offers:[offer('Parts Direct',7.90,3.90,7.5,4.5,94,{compatibilityConfidence:.82})]},
      {id:'p-wash-clamp',name:'Schlauchschelle / Befestigung',kind:'Anbauteil',tier:'aftermarket',fitment:{status:'demo',confidence:0.70,evidence:[src('Prototyp-Datensatz','prototype-fixture','Ausführung muss am konkreten Gerät geprüft werden','C')]},offers:[offer('Example Shop',5.90,3.90,6.8,4.3,61,{compatibilityConfidence:.70})]},
      {id:'p-wash-filter',name:'Pumpenfilter',kind:'Verschleißteil',tier:'aftermarket',fitment:{status:'demo',confidence:0.84,evidence:[src('Demo-Gerätekatalog','catalog-demo','Simulierter Zubehörabgleich','B')]},offers:[offer('Example Shop',15.90,4.90,7.2,4.4,140,{compatibilityConfidence:.84})]}
    ]
  },
  {
    id:'vac-demo-1', category:'vacuum', icon:'🧹', brand:'Dyson', model:'V11', type:'Staubsauger', aliases:['DYSONV11'],
    identifiers:[{type:'model',value:'DYSON V11'},{type:'demo-code',value:'UF-VAC-001'}],
    dataStatus:'demo', manuals:[], stockPlans:[],
    issues:[
      issue('vac-low-suction','Saugkraft ist schwach','Filter oder Luftweg können zugesetzt sein.',['p-vac-filter'],['Behälter leeren.','Filterzustand prüfen und nur nach Herstellerangabe reinigen.','Rohr und Bodendüse auf Blockaden kontrollieren.'],{confidence:.9})
    ],
    jobs:[
      job('vac-filter-care','Filter warten','Filterzustand und Luftwege gemeinsam prüfen.','p-vac-filter',[
        jobItem('vac-filter-main','Nachmotorfilter','required',{partId:'p-vac-filter',includedWithMain:true,reason:'Hauptteil'}),
        jobItem('vac-airway','Rohr und Düse auf Blockaden prüfen','recommended',{reason:'Kein Kauf erforderlich'})
      ])
    ],
    parts:[
      {id:'p-vac-filter',name:'Nachmotorfilter',kind:'Filter',tier:'oem-or-compatible',fitment:{status:'demo',confidence:0.93,evidence:[src('Demo-Modellabgleich','model-match-demo','Modellfamilie im Demo-Datensatz abgeglichen','B'),src('Demo-Zubehörkatalog','catalog-demo','Simulierter Zubehörkatalog','A')]},offers:[offer('Original Option',39.90,0,9.0,4.7,1200,{compatibilityConfidence:.95,deliveryDays:1}),offer('Compatible Option',18.90,3.90,7.2,4.4,520,{compatibilityConfidence:.90,deliveryDays:3})]}
    ]
  },
  {
    id:'vac-bag-demo-1', category:'vacuum', icon:'🧹', brand:'Miele', model:'Complete C3 · Demo', type:'Beutelstaubsauger · Demoprofil', aliases:['COMPLETE C3 DEMO'],
    identifiers:[{type:'demo-code',value:'UF-VAC-BAG-001'}], dataStatus:'demo', manuals:[], issues:[],
    stockPlans:[
      stockPlan('vac-bags','Staubsaugerbeutel','Beutel',2,24,{leadTimeMinDays:24,leadTimeMaxDays:35,safetyDays:7,supplyRisk:'elevated',sourceLabel:'Auslandsversand · Demo'})
    ],
    jobs:[
      job('vac-bag-change','Staubsaugerbeutel wechseln','Beutelwechsel inklusive Vorratsplanung.',null,[
        jobItem('vac-bag-stock','Staubsaugerbeutel','consumable',{stockPlanId:'vac-bags',reason:'Bestand und Lieferzeit steuern den Nachbestellzeitpunkt'}),
        jobItem('vac-bag-compartment','Beutelfach und Dichtung prüfen','recommended',{reason:'Kein Kauf erforderlich'})
      ])
    ],
    parts:[]
  },
  {
    id:'car-demo-1', category:'car', icon:'🚗', brand:'Škoda', model:'Octavia 1U 1.6', type:'Fahrzeug · AKL-Demoprofil', aliases:['SKODA OCTAVIA 1U AKL','OCTAVIA 1U'],
    identifiers:[{type:'engine-code-demo',value:'AKL'},{type:'demo-code',value:'UF-CAR-001'}],
    dataStatus:'demo', manuals:[], stockPlans:[],
    issues:[
      issue('car-cabin-smell','Lüftung riecht muffig','Ein alter Innenraumfilter kann Gerüche und reduzierten Luftdurchsatz begünstigen.',['p-car-cabin'],['Innenraumfilter-Zustand kontrollieren.','Einbaurichtung des Filters beachten.','Bei anhaltendem Geruch weitere Ursachen prüfen.'],{confidence:.72})
    ],
    jobs:[
      job('car-oil-service','Ölservice','Servicepositionen als vollständigen Arbeitskorb zusammenstellen.','p-car-oil-filter',[
        jobItem('car-oil-filter','Ölfilter','required',{partId:'p-car-oil-filter',includedWithMain:true,reason:'Serviceteil'}),
        jobItem('car-drain-plug','Ablassschraube / Dichtring','required',{partId:'p-car-drain-plug',reason:'Im Demo-Arbeitsvorgang als zu erneuernde Abdichtung modelliert'}),
        jobItem('car-engine-oil','Motoröl mit passender Freigabe und Füllmenge','consumable',{reason:'Freigabe und Füllmenge müssen aus verifizierter Fahrzeugquelle kommen'}),
        jobItem('car-cabin-filter','Innenraumfilter nach Serviceumfang','optional',{partId:'p-car-cabin',reason:'Nur wenn nach Intervall fällig'})
      ],{evidenceNote:'Fahrzeugdaten in dieser Demo sind absichtlich nicht als echter Teilekatalog verifiziert'}),
      job('car-drive-shaft','Antriebswelle vorne rechts ersetzen','Hauptteil plus Einmal- und Anbauteile sichtbar machen, bevor bestellt wird.','p-car-drive-shaft',[
        jobItem('car-shaft-main','Antriebswelle vorne rechts','required',{partId:'p-car-drive-shaft',includedWithMain:true,reason:'Hauptteil'}),
        jobItem('car-axle-bolt','Zentralschraube / Achsmutter','required',{partId:'p-car-axle-bolt',reason:'Demo-Einmalteil – echte Vorgabe muss fahrzeugspezifisch belegt werden'}),
        jobItem('car-flange-bolts','Getriebeseitige Befestigungsschrauben','required',{partId:'p-car-flange-bolts',reason:'Demo-Arbeitsvorgang – konkrete Ausführung prüfen'}),
        jobItem('car-gear-oil','Getriebeölstand / Verlust beim Ausbau prüfen','recommended',{reason:'Nur falls konstruktionsbedingt relevant'})
      ],{evidenceNote:'Nur Funktionsdemo. Keine echte Reparaturanweisung oder Teilefreigabe.'})
    ],
    parts:[
      {id:'p-car-oil-filter',name:'Ölfilter',kind:'Serviceteil',tier:'aftermarket',fitment:{status:'unverified-demo',confidence:0.74,evidence:[src('Prototyp-Datensatz','prototype-fixture','Kein verifizierter Fahrzeugkatalog – nur Demo','C')]},offers:[offer('Auto Parts Demo',9.90,4.90,7.8,4.6,820,{compatibilityConfidence:.74})]},
      {id:'p-car-drain-plug',name:'Ablassschraube / Dichtring',kind:'Anbauteil',tier:'aftermarket',fitment:{status:'unverified-demo',confidence:0.70,evidence:[src('Prototyp-Datensatz','prototype-fixture','Ausführung und Ersetzbarkeit müssen aus echter Reparaturquelle kommen','C')]},offers:[offer('Auto Parts Demo',4.90,4.90,7.2,4.5,310,{compatibilityConfidence:.70})]},
      {id:'p-car-drive-shaft',name:'Antriebswelle vorne rechts',kind:'Ersatzteil',tier:'aftermarket',fitment:{status:'unverified-demo',confidence:0.68,evidence:[src('Prototyp-Datensatz','prototype-fixture','Keine echte VIN-/PR-Code-Prüfung in der Demo','C')]},offers:[offer('Auto Parts Demo',119.90,0,7.8,4.5,190,{compatibilityConfidence:.68,deliveryDays:3})]},
      {id:'p-car-axle-bolt',name:'Zentralschraube / Achsmutter',kind:'Einmalteil · Demo',tier:'aftermarket',fitment:{status:'unverified-demo',confidence:0.66,evidence:[src('Prototyp-Datensatz','prototype-fixture','Befestiger nur als Job-Kit-Demo modelliert','C')]},offers:[offer('Auto Parts Demo',6.90,4.90,7.0,4.4,121,{compatibilityConfidence:.66})]},
      {id:'p-car-flange-bolts',name:'Getriebeseitige Schrauben · Satz',kind:'Einmalteil · Demo',tier:'aftermarket',fitment:{status:'unverified-demo',confidence:0.64,evidence:[src('Prototyp-Datensatz','prototype-fixture','Befestiger nur als Job-Kit-Demo modelliert','C')]},offers:[offer('Auto Parts Demo',11.90,4.90,7.0,4.3,84,{compatibilityConfidence:.64})]},
      {id:'p-car-cabin',name:'Innenraumfilter',kind:'Serviceteil',tier:'aftermarket',fitment:{status:'unverified-demo',confidence:0.74,evidence:[src('Prototyp-Datensatz','prototype-fixture','Kein verifizierter Fahrzeugkatalog – absichtlich als niedrigeres Vertrauen dargestellt','C')]},offers:[offer('Auto Parts Demo',14.90,4.90,7.6,4.6,600,{compatibilityConfidence:.74})]},
      {id:'p-car-wiper',name:'Wischersatz',kind:'Serviceteil',tier:'aftermarket',fitment:{status:'unverified-demo',confidence:0.72,evidence:[src('Prototyp-Datensatz','prototype-fixture','Kein verifizierter Fahrzeugkatalog – absichtlich als niedrigeres Vertrauen dargestellt','C')]},offers:[offer('Auto Parts Demo',24.90,4.90,7.8,4.5,450,{compatibilityConfidence:.72})]}
    ]
  }
];

export const demoScenarios = [
  {label:'Bosch Werkzeug', query:'GSR 18V-55', productId:'tool-demo-1'},
  {label:'Bosch Waschmaschine', query:'WAN282H3', productId:'wash-demo-1'},
  {label:'Beutel-Vorrat', query:'UF-VAC-BAG-001', productId:'vac-bag-demo-1'},
  {label:'Dyson V11', query:'DYSON V11', productId:'vac-demo-1'},
  {label:'Škoda AKL', query:'AKL', productId:'car-demo-1'}
];
