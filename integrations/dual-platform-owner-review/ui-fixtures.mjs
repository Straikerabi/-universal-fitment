// Synthetic UI-to-core fixtures. NO manufacturer/model/OEM claims and NO commerce.
import {syntheticRequest} from '../fitment-engine-v1-poc/fixtures.mjs';

const cases=Object.freeze({
 'filter-positive':{variant:'DEMO-R1',assembly:'filter',part:'DEMO-FILTER-R1',kind:'compatible'},
 'revision-missing':{variant:null,assembly:'filter',part:'DEMO-FILTER-R1',kind:'missing-revision'},
 'filter-negative':{variant:'DEMO-R2',assembly:'filter',part:'DEMO-FILTER-R1',kind:'excluded'},
 'connector-negative':{variant:'DEMO-R1',assembly:'battery',part:'DEMO-BATTERY-B',kind:'connector-mismatch'},
 'kit-incomplete':{variant:'DEMO-R1',assembly:'filter',part:'DEMO-FILTER-R1',kind:'missing-kit-part'},
 exact:{variant:'DEMO-R1',assembly:'test-assembly',part:'SYN-OEM-101',kind:'compatible'},
 revision:{variant:null,assembly:'test-assembly',part:'SYN-OEM-101',kind:'missing-revision'},
 excluded:{variant:'DEMO-R2',assembly:'test-assembly',part:'SYN-OEM-101',kind:'excluded'},
 sku:{variant:'DEMO-R1',assembly:'test-assembly',part:'SYN-SHOP-101',kind:'merchant-sku'},
 connector:{variant:'DEMO-R1',assembly:'test-assembly',part:'SYN-OEM-202',kind:'connector-unknown'},
 private:{variant:'DEMO-R1',assembly:'test-assembly',part:'SYN-OEM-303',kind:'compatible'}
});
export function buildSyntheticUiRequest(scenarioId,{variantKnown=true,assemblyId,identity}={}) {
 const row=cases[scenarioId];
 if(!row||typeof scenarioId!=='string')throw Error('Unknown synthetic fixture');
 if(assemblyId!==undefined && (typeof assemblyId!=='string'||!assemblyId))throw Error('Invalid UI assembly');
 if(identity!==undefined && (!/^(DEMO-|SYN-)/.test(identity)||identity.length>100))throw Error('Not a synthetic device');
 const r=syntheticRequest();
 r.asset.id='test-asset-'+scenarioId;
 r.asset.model='SYNTHETIC '+(identity||'TEST-ASSET');
 r.variant.identifiers[0].value=identity||'TEST-ASSET';
 r.evidence[0].assetId=r.asset.id;
 r.evidence[0].variant.identifiers[0].value=r.variant.identifiers[0].value;
 r.assembly.id=assemblyId||row.assembly;
 r.evidence[0].assemblyId=row.assembly; // mismatch is unknown, not a borrowed positive claim
 r.part.id='test-part-'+scenarioId;
 r.part.identifiers[0].value=row.part;
 r.evidence[0].partId=r.part.id;
 r.evidence[0].partIdentifier.value=row.part;
 r.variant.revision=variantKnown?row.variant:null;
 r.evidence[0].variant.revision={mode:'exact',value:row.variant||'DEMO-R1'};
 r.interfaces.requirements[0].assemblyId=row.assembly;
 if(row.kind==='excluded')r.evidence[0].assertion='incompatible';
 if(row.kind==='connector-mismatch')r.interfaces.requirements[0].actual='SYNTHETIC WRONG SHAPE';
 if(row.kind==='connector-unknown')r.interfaces.requirements[0].actual=null;
 if(row.kind==='merchant-sku')r.part.identifiers[0].namespace='merchant-sku';
 if(row.kind==='missing-kit-part')r.evidence=[]; // fitment cannot certify an incomplete repair pack
 if(row.kind==='missing-revision')r.variant.revision=null;
 return r;
}
