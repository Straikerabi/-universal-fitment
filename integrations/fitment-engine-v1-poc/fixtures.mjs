// SYNTHETIC ONLY: no real manufacturer/model/OEM identity, size or fitment is asserted.
export function syntheticRequest() {
  const device={namespace:'manufacturer-model',issuer:'Synthetic Fixture',value:'TEST-ASSET'};
  const part={namespace:'manufacturer-article',issuer:'Synthetic Fixture',value:'TEST-PART'};
  return {schemaVersion:'1.0.0',dataVersion:'synthetic-fixtures-1',datasetKind:'synthetic',context:{usage:'private-test'},asset:{id:'test-asset',category:'synthetic-fixture',manufacturer:'Synthetic Fixture',model:'Synthetic test asset'},variant:{identifiers:[device],revision:'TEST-REV-A',market:'TEST',serial:null},assembly:{id:'test-assembly'},part:{id:'test-part',manufacturer:'Synthetic Fixture',identifiers:[part],kind:'physical'},policy:{risk:'low'},sources:[{id:'test-source',url:'https://manufacturer.test.invalid/evidence',publisher:'Synthetic Fixture',kind:'synthetic',authoritySourceId:null,checkedAt:'2026-10-09',digest:'a'.repeat(64),locator:'SYNTHETIC: exact fixture identifiers, revision and interface review; not a manufacturer claim.',status:'verified',rights:{privateTest:'granted',link:'granted',reuse:'denied',reference:'SYNTHETIC fixture owned by this test suite'}}],evidence:[{id:'test-claim',assetId:'test-asset',partId:'test-part',partIdentifier:{...part},assemblyId:'test-assembly',assertion:'compatible',variant:{identifiers:[{...device}],market:'TEST',revision:{mode:'exact',value:'TEST-REV-A'},serial:{mode:'any',min:null,max:null}},sourceIds:['test-source']}],interfaces:{reviewSourceIds:['test-source'],requirements:[{id:'test-connector',assemblyId:'test-assembly',parameter:'synthetic-connector-shape',unit:null,actualUnit:null,expected:'TEST-SHAPE-A',actual:'TEST-SHAPE-A',sourceIds:['test-source']}]}};
}

// Recorded public identities/URLs only. No invented technical conditions or new claims.
export function realCatalogUnknownRequest() {
  const device={namespace:'material-number',issuer:'Miele',value:'11602400'};
  const part={namespace:'material-number',issuer:'Miele',value:'11805640'};
  const r=syntheticRequest();
  r.datasetKind='catalog';r.dataVersion='v1.29.0-checkpoint';r.asset={id:'vac-miele-model-11602400',category:'vacuum',manufacturer:'Miele',model:'Boost CX1 Parquet PowerLine'};
  r.variant={identifiers:[device],revision:null,market:'DE',serial:null};r.assembly={id:'unknown-installation-assembly'};
  r.part={id:'miele-part-11805640',manufacturer:'Miele',identifiers:[part],kind:'physical'};
  r.sources=[{id:'recorded-miele-device',url:'https://www.miele.de/product/11602400/bodenstaubsauger-ohne-beutel-boost-cx1-parquet-powerline-lotosweiss',publisher:'Miele',kind:'manufacturer',authoritySourceId:null,checkedAt:'2026-10-06',digest:null,locator:'v1.29.0 miele-model-records.js accessory material 11805640; recorded listing, not reviewed v1 evidence.',status:'unverified',rights:{privateTest:'unknown',link:'granted',reuse:'unknown',reference:null}}];
  r.evidence=[{id:'recorded-miele-accessory',assetId:r.asset.id,partId:r.part.id,partIdentifier:part,assemblyId:r.assembly.id,assertion:'compatible',variant:{identifiers:[device],market:'DE',revision:{mode:'unknown',value:null},serial:{mode:'unknown',min:null,max:null}},sourceIds:['recorded-miele-device']}];
  r.interfaces={reviewSourceIds:[],requirements:[]};return r;
}
