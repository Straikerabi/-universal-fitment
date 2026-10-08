// Exact product-code searches in Hoover's manufacturer-linked EU service catalogue.
// The service session exposed Italian prices, so prices and German availability stay unset.
const serviceSearch = productCode =>
 'https://www.premiumservicesforhoover.eu/de/Search/KeyW_'+productCode;

const verifiedModels = {
 HF202P011: {model:'HF202P 011',productCode:'39401035'},
 HF201H011: {model:'HF201H 011',productCode:'39401038'}
};
const sharedHf2Codes = [
 '35602846','35602822','35602893','35602897','35602894',
 '35602895','35602896','48700995','70049123','35603235'
];
const modelPartCodes = {
 HF202P011: sharedHf2Codes,
 HF201H011: [...sharedHf2Codes,'48700997','48700984']
};
const serviceParts = [
 {code:'48700995',name:'Düse · Boden- und Teppichbürste',partTypeId:'nozzle'},
 {code:'70049123',name:'Motor · Saugmotor komplett',partTypeId:'electrical'},
 {code:'35603235',name:'Bürstenwalze · Y89 Rührwerk',partTypeId:'roller'},
 {code:'48700997',name:'Rohr · Saugrohrverlängerung',partTypeId:'tube'},
 {code:'48700984',name:'Gehäuse · Gerätekörper',partTypeId:'mechanical'}
];
const fitmentFor = modelCode => {
 const device=verifiedModels[modelCode];
 return {
  code:modelCode,model:device.model,
  reference:device.model+' · '+device.productCode,
  productCode:device.productCode,url:serviceSearch(device.productCode),
  checkedAt:'2026-10-08',basis:'manufacturer-linked-product-code-search'
 };
};
const relationshipsFor = partCode => Object.entries(modelPartCodes)
 .filter(([,codes])=>codes.includes(partCode)).map(([modelCode])=>fitmentFor(modelCode));
const serviceNote='Die Artikelzuordnung wurde über die exakte achtstellige Produktcode-Suche im von Hoover Deutschland verlinkten EU-Ersatzteilservice geprüft. Die dort sichtbare italienische Preis- und Ländereinstellung wird nicht als deutscher Preis, Bestand oder deutsches Angebot übernommen.';

export function applyHooverFitment(pack){
 if(pack.brand!=='Hoover')return pack;
 const models=pack.models.map(model=>({...model,partListCoverage:{...model.partListCoverage}}));
 const parts=pack.parts.map(part=>({...part,relationships:[...(part.relationships||[])],sourceCoverage:{...part.sourceCoverage}}));
 for(const part of parts){
  const relationships=relationshipsFor(part.code);
  if(!relationships.length)continue;
  Object.assign(part,{
   relationships,checkedAt:'2026-10-08',
   sourcePageType:'manufacturer-linked-product-code-search',
   sourceMarket:'GB / EU-Service',
   sourceCoverage:{
    status:'partial',
    note:'Artikelstammsatz aus dem britischen Hoover-Herstellerverzeichnis; konkrete Zuordnung zu den genannten deutschen Produktcodes im EU-Service geprüft. '+serviceNote,
    observedProductCodes:relationships.map(item=>item.productCode)
   }
  });
 }
 for(const part of serviceParts){
  const relationships=relationshipsFor(part.code);
  parts.push({
   brand:'Hoover',...part,url:serviceSearch(relationships[0].productCode),
   sourcePageType:'manufacturer-linked-product-code-search',
   checkedAt:'2026-10-08',relationships,sourceMarket:'EU-Service',
   sourceCoverage:{
    status:'partial',note:serviceNote,
    observedProductCodes:relationships.map(item=>item.productCode)
   }
  });
 }
 for(const [modelCode,codes] of Object.entries(modelPartCodes)){
  const model=models.find(item=>item.code===modelCode);
  if(!model)throw new Error('Hoover model missing: '+modelCode);
  model.partsUrl=serviceSearch(model.productCode);
  model.checkedAt='2026-10-08';
  model.partListCoverage={
   status:'partial',sourceUrl:model.partsUrl,
   note:codes.length+' physische Artikel aus der exakten Produktcode-Suche erfasst. Weitere Ausführungen und Lieferumfänge bleiben offen; italienische Servicepreise werden nicht als deutsche Preise übernommen.'
  };
 }
 return {...pack,models,parts};
}

export function applyHooverIndexFitment(records){
 for(const record of records){
  const count=modelPartCodes[record.code]?.length;
  if(!count)continue;
  record.partCount=count;
  record.physicalPartCount=count;
  record.partsUrl=serviceSearch(record.productCode);
  record.checkedAt='2026-10-08';
  record.partListCoverage={
   status:'partial',sourceUrl:record.partsUrl,
   note:count+' physische Artikel aus der exakten Produktcode-Suche erfasst; fremde Servicepreise werden nicht als deutsche Preise übernommen.'
  };
 }
 return records;
}
