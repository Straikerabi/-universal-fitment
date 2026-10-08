export const jobGuidance={
  'car-demo-1:car-oil-service':{
    status:'demo',
    tools:[
      {label:'Drehmomentschlüssel',kind:'standard',required:true,note:'Drehmomentwerte selbst sind in diesem Demo-Fahrzeug nicht verifiziert.'},
      {label:'Ölfilter-Werkzeug',kind:'standard',required:true,note:'Bauform muss zum verwendeten Filter passen.'},
      {label:'Auffangwanne',kind:'standard',required:true},
      {label:'Hebebühne / sichere Aufbockmöglichkeit',kind:'safety',required:true}
    ],
    technical:[
      {label:'Motoröl-Freigabe',value:'nicht verifiziert',status:'unknown'},
      {label:'Füllmenge',value:'nicht verifiziert',status:'unknown'},
      {label:'Ablassschraube',value:'Drehmoment nicht verifiziert',status:'unknown'}
    ]
  },
  'car-demo-1:car-drive-shaft':{
    status:'demo',
    tools:[
      {label:'Drehmomentschlüssel',kind:'standard',required:true},
      {label:'geeignete Nüsse / Vielzahn',kind:'standard',required:true,note:'Exakte Größen müssen fahrzeugspezifisch verifiziert werden.'},
      {label:'Hebebühne / sichere Aufbockmöglichkeit',kind:'safety',required:true},
      {label:'Abdrück-/Lösewerkzeug',kind:'special',required:false,note:'Je nach Ausführung erforderlich.'}
    ],
    technical:[
      {label:'Zentralschraube / Achsmutter',value:'Drehmoment/Winkel nicht verifiziert',status:'unknown'},
      {label:'Getriebeseitige Schrauben',value:'Drehmoment nicht verifiziert',status:'unknown'}
    ]
  }
};
export function getJobGuidance(productId,jobId){return jobGuidance[`${productId}:${jobId}`]||{status:'none',tools:[],technical:[]};}
