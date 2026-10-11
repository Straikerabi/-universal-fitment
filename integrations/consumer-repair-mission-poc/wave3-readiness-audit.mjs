/**
 * Read-only Wave3 -> Consumer identity readiness audit for owner issue #69.
 * Intentionally does NOT change catalog-snapshot, offline config, the v1 engine,
 * fitment decisions, the source checkpoint or anything under site/.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {pathToFileURL, fileURLToPath} from 'node:url';

const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const expected = Object.freeze({models:1115, articles:1961, associations:36, legacyDevices:11, legacyParts:11});
export const wave3Sources = Object.freeze({
  base:'71f7826ba936a1f3830c8b2a67e8085a9cfe234e',
  checkpointSha256:'c600a5c5a83a6f096ff5999e5ce5582c37ec424155919d487dfd6ca2221bd42b',
  model:'da0dcae52c2a0abc2fcd90df7636289a890f5e04',
  parts:'443489b39f57be28239dd2f1cafd637329eb0d4e',
  media:'2526e243eaf8425b91c8373ef4e5513ff4994a80'
});

function uniqueRows(rows, predicate) {return rows.filter(predicate);}
function exactPartCode(part, code) {
  return part.identifiers?.some(i=>['manufacturer-article','material-number'].includes(i.type) && i.value===code);
}
function exactDeviceIdentity(device, edge) {
  if(device.brand!==edge.brand||device.recordType!=='model')return false;
  const ids=device.identifiers||[];
  if(edge.productCode) return ids.some(i=>i.type==='device-sku'&&i.value===edge.productCode);
  return ids.some(i=>i.value===edge.reference && ['manufacturer-model','material-number','device-sku'].includes(i.type));
}

export function auditWave3Readiness({products,parts,evidence,legacySnapshot,strictCounts=false,evidenceSha256=null}) {
  assert.ok(Array.isArray(products)&&Array.isArray(parts),'Provide actual combined catalogue arrays');
  assert.ok(evidence&&Array.isArray(evidence.fitments),'Expected reviewed Wave3 association evidence');
  assert.ok(legacySnapshot&&Array.isArray(legacySnapshot.devices)&&Array.isArray(legacySnapshot.parts),'Expected existing Consumer selection');
  const errors=[];
  const models=products.filter(p=>p.recordType==='model');
  if(legacySnapshot.baseCommit!==wave3Sources.base || legacySnapshot.checkpointSha256!==wave3Sources.checkpointSha256)
    errors.push('Consumer baseline source lock differs from reviewed v1.29.0');
  if(legacySnapshot.devices.length!==expected.legacyDevices || legacySnapshot.parts.length!==expected.legacyParts)
    errors.push('Original 11/11 Consumer pilot selection unexpectedly changed');
  if(evidence.fitments.length!==expected.associations)
    errors.push('Reviewed Wave3 association count changed');
  if(strictCounts && (models.length!==expected.models || parts.length!==expected.articles))
    errors.push('Combined source count differs: models='+models.length+', articles='+parts.length);
  if(new Set(models.map(m=>m.id)).size!==models.length) errors.push('Duplicate model IDs in combined source');
  if(new Set(parts.map(p=>p.id)).size!==parts.length) errors.push('Duplicate article IDs in combined source');

  const preservedDevices=legacySnapshot.devices.map(d=>{
    const matches=uniqueRows(models,p=>p.id===d.id && p.brand===d.brand);
    if(matches.length!==1)errors.push('Original device missing/ambiguous: '+d.id);
    return {id:d.id,brand:d.brand,reference:d.reference,found:matches.length===1};
  });
  const preservedParts=legacySnapshot.parts.map(p=>{
    const matches=uniqueRows(parts,x=>x.id===p.id && (!x.brand||x.brand===p.brand) && exactPartCode(x,p.code));
    if(matches.length!==1)errors.push('Original OEM item missing/ambiguous: '+p.id);
    return {id:p.id,brand:p.brand,code:p.code,found:matches.length===1};
  });
  const associations=evidence.fitments.map((edge,index)=>{
    if(!edge.brand||!edge.partCode||!edge.reference||!Array.isArray(edge.conditions)||!edge.conditions.length)
      errors.push('Incomplete association identity/conditions at row '+(index+1));
    const devices=uniqueRows(models,m=>exactDeviceIdentity(m,edge));
    const articles=uniqueRows(parts,p=>p.brand===edge.brand&&exactPartCode(p,edge.partCode));
    const market=edge.region||'unreported';
    return {
      brand:edge.brand,deviceReference:edge.reference,productCode:edge.productCode||null,
      partCode:edge.partCode,sourceId:edge.sourceId||null,market,
      serialScope:edge.serialScope||'unknown',revisionScope:edge.revisionScope||'unknown',
      conditions:edge.conditions,deviceId:devices.length===1?devices[0].id:null,
      articleId:articles.length===1?articles[0].id:null,
      identityResolution:devices.length===1&&articles.length===1?'matched-for-review':'needs-identity-review',
      fitmentDecision:'unconfirmed',installationApproved:false
    };
  });
  const key=edge=>[edge.brand,edge.deviceReference,edge.productCode||'',edge.partCode].join('\u001f');
  if(new Set(associations.map(key)).size!==associations.length)errors.push('Duplicate manufacturer association identities');
  return {
    schema:'uf-wave3-consumer-readiness-audit/1',
    scope:'private-owner-review-only',sources:wave3Sources,evidenceSha256,
    measured:{models:models.length,catalogArticles:parts.length,retainedPilotDevices:preservedDevices.filter(x=>x.found).length,
      retainedPilotParts:preservedParts.filter(x=>x.found).length,conditionalAssociations:associations.length,
      resolvedAssociationIdentities:associations.filter(x=>x.identityResolution==='matched-for-review').length,
      realInstallationApproved:0},
    preservedDevices,preservedParts,associations,
    // Matching a manufacturer's listed item and a device is NOT mechanical fitment approval.
    reportOnly:true,consumerSnapshotMigrated:false,merchantOffersConnected:false,
    canDeclareFullySynchronizedConsumer:false,errors
  };
}

async function cli(site) {
  const catalog=await import(pathToFileURL(resolve(site,'src/data/catalog.js')));
  for(const name of ['samsung','hoover','dyson']) {
    const pack=await import(pathToFileURL(resolve(site,'src/data/'+name+'-pack.js')));
    catalog.registerCatalogPack(pack.brandPack);
  }
  const {catalogSnapshot}=await import('./catalog-snapshot.mjs');
  const evidenceBytes=readFileSync(new URL('../parts-fitment-wave3-evidence.json',import.meta.url));
  const output=auditWave3Readiness({products:catalog.products,parts:catalog.partsCatalog,
    evidence:JSON.parse(evidenceBytes),legacySnapshot:catalogSnapshot,
    strictCounts:true,evidenceSha256:digest(evidenceBytes)});
  process.stdout.write(JSON.stringify(output,null,2)+'\n');
  if(output.errors.length)process.exitCode=2;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  if(process.argv.length!==3)throw Error('Usage: node wave3-readiness-audit.mjs /absolute/verified-combined-Wave3/site');
  await cli(process.argv[2]);
}
