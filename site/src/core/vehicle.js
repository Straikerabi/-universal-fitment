export function normalizeVin(value=''){return String(value).toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g,'').slice(0,17);}
export function validateVin(value=''){
  const vin=normalizeVin(value);
  if(vin.length!==17) return {valid:false,vin,reason:'Eine VIN/FIN hat 17 Zeichen.'};
  if(/[IOQ]/.test(vin)) return {valid:false,vin,reason:'VIN enthält unzulässige Zeichen.'};
  return {valid:true,vin,reason:'Format plausibel. Fahrzeugdaten müssen noch über eine lizenzierte Quelle aufgelöst werden.'};
}
export function normalizeHsn(value=''){return String(value).toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,4);}
export function normalizeTsn(value=''){return String(value).toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,8);}
