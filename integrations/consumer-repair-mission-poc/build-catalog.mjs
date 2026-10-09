// Read-only projection of the approved v1.29.0 checkpoint. Not a fitment importer.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {parseArgs} from 'node:util';
const folder=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(folder,'../..');
const checkpoint='c600a5c5a83a6f096ff5999e5ce5582c37ec424155919d487dfd6ca2221bd42b';
const baseCommit='71f7826ba936a1f3830c8b2a67e8085a9cfe234e';
const sha=b=>createHash('sha256').update(b).digest('hex');
export const deviceIds=['vac-miele-model-11806000','vac-miele-model-11602400','vac-bosch-model-bgl75x1prq','vac-bosch-model-bch3all21','vac-samsung-model-vs20c95d4tk','vac-samsung-model-vs90f40eek','vac-hoover-model-hf202p011','vac-hoover-model-fd22g','vac-hoover-model-hu300rhm001','vac-dyson-model-369535-01','vac-dyson-model-419634-01'];
// Hoover Y81 / 35602897 has only a collection URL in this baseline: omit it.
export const partIds=['miele-part-13070280','miele-part-13000250','miele-part-11384710','miele-part-11805640','bosch-part-00579421','bosch-part-00460431','samsung-part-vca-shf95w','samsung-part-vca-sapb95_2Fwa','hoover-part-35602893','dyson-part-971634-01','dyson-part-970938-01'];
const allowed={Miele:['www.miele.de'],Bosch:['www.bosch-home.com'],Samsung:['www.samsung.com'],Hoover:['www.hoover-home.com','service.hoover.co.uk'],Dyson:['www.dyson.de']};
const source=(s,brand)=>{assert.ok(s&&s.type==='manufacturer'&&s.retrievedAt);const u=new URL(s.url);assert.equal(u.protocol,'https:');assert.ok(allowed[brand].includes(u.hostname));return {name:s.name,url:s.url,checkedAt:s.retrievedAt,scope:'catalog-identity-observation',rights:'link-and-factual-identity-only; no artwork copied'};};
export async function projectCatalog(sourceRoot){
 const meta=JSON.parse(fs.readFileSync(path.join(root,'integrations/source-checkpoint.json')));assert.equal(meta.version,'1.29.0');assert.equal(meta.archive_sha256,checkpoint);
 // Check every restored file against the archive before loading trusted baseline modules.
 const {execFileSync}=await import('node:child_process');
 const audit=JSON.parse(execFileSync('python3',['-c',`import base64,hashlib,io,json,zipfile,pathlib,sys
r=pathlib.Path(sys.argv[1]);s=pathlib.Path(sys.argv[2]);m=json.loads((r/'integrations/source-checkpoint.json').read_text());b=base64.b64decode(''.join((r/m['segment_dir']/f'part-{i:03d}').read_text() for i in range(m['segments'])),validate=True);assert hashlib.sha256(b).hexdigest()==sys.argv[3]
with zipfile.ZipFile(io.BytesIO(b)) as z:
 assert len(z.infolist())==136
 hashes={}
 for e in z.infolist():
  p=pathlib.Path(e.filename);assert not p.is_absolute() and '..' not in p.parts;assert (s/p).resolve().is_relative_to(s.resolve());assert not (s/p).is_symlink();old=z.read(e.filename);assert (s/p).read_bytes()==old, e.filename;hashes[e.filename]=hashlib.sha256(old).hexdigest()
print(json.dumps(hashes))`,root,sourceRoot,checkpoint],{encoding:'utf8'}));
 const data=path.join(sourceRoot,'src/data');const catalog=await import(pathToFileURL(path.join(data,'catalog.js')));
 const packs={};for(const b of ['samsung','hoover','dyson']){const {brandPack}=await import(pathToFileURL(path.join(data,b+'-pack.js')));packs[brandPack.brand]=brandPack;catalog.registerCatalogPack(brandPack);}
 const {partType}=await import(pathToFileURL(path.join(data,'part-taxonomy.js')));
 const all=catalog.partsCatalog;
 const parts=partIds.map(id=>{const p=all.find(p=>p.id===id);assert.ok(p,id);const brand=p.brand||catalog.products.find(d=>deviceIds.includes(d.id)&&d.parts.some(x=>x.id===id))?.brand;assert.ok(brand);const identity=p.fitment.evidence.find(s=>s.url===p.sourceUrl)||p.fitment.evidence.find(s=>!catalog.products.some(d=>d.sources?.some(x=>x.url===s.url)));const code=p.identifiers.find(x=>['material-number','manufacturer-article'].includes(x.type));assert.ok(code);return {id:p.id,brand,name:p.name,code:code.value,identifiers:p.identifiers,assembly:partType(p).id,source:source(identity,brand),legacyStatus:p.fitment.status,assessment:'unavailable'};});
 const devices=deviceIds.map(id=>{const p=catalog.products.find(x=>x.id===id);assert.ok(p,id);const raw=packs[p.brand]?.models.find(m=>m.model===p.model);const s=source(p.sources[0],p.brand);const key=p.identifiers.find(x=>['material-number','device-sku'].includes(x.type));let reference=p.deviceReferences?.[0]||key?.value||p.model;
  if(p.brand==='Samsung'){reference=p.identifiers.filter(x=>x.type==='manufacturer-model'&&x.value.includes('/')).map(x=>x.value).find(x=>s.url.toLowerCase().includes(x.toLowerCase())||s.url.endsWith(x.toLowerCase().replace('/','-')+'/'));assert.ok(reference,'No supported full Samsung variant');}
  const hints={Miele:'Materialnummer und Gerätetyp vergleichen; derselbe Gerätetyp kann mehrere Modelle umfassen.',Bosch:'Vollständige E-Nr. mit /xx-Index prüfen. Der Produktname allein belegt den Index nicht.',Samsung:'Vollständigen Modellcode einschließlich Länderkennung vergleichen. EEK und EEM sind getrennte Kennungen.',Hoover:'Modell und achtstelligen Produktcode vergleichen. GB-, DE- und FR-Ausführungen nicht übertragen.',Dyson:'Produktnummer, Generation und tatsächliche Anschlussausführung getrennt prüfen. Ein Modellname ist keine Akku-Freigabe.'};
  const identifiers=p.identifiers.filter(x=>x.type!=='ean'&&(p.brand!=='Samsung'||x.type!=='manufacturer-model'||x.value===reference||x.value===reference.split('/')[0]));
  return {id:p.id,brand:p.brand,model:p.model,reference,identifiers,productCode:raw?.productCode||null,type:p.vacuumMeta?.deviceType||'unknown',market:raw?.sourceMarket||'DE',source:s,variantHint:hints[p.brand],candidatePartIds:p.parts.map(x=>x.id).filter(x=>partIds.includes(x)),legacyListedPartCount:p.parts.length,assessment:'unavailable'};
 });
 return {snapshot:{version:1,baseCommit,appVersion:'1.29.0',checkpointSha256:checkpoint,wave3Integrated:false,engineIntegrated:false,devices,parts},lock:{baseCommit,appVersion:'1.29.0',checkpointSha256:checkpoint,restoredFileCount:136,fileSha256:audit,deviceIds,partIds}};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const {values}=parseArgs({options:{source:{type:'string'},check:{type:'boolean',default:false}}});assert.ok(values.source,'--source must be a fresh restored checkpoint');
 if(!values.check){const {execFileSync}=await import('node:child_process');assert.equal(execFileSync('git',['branch','--show-current'],{cwd:root,encoding:'utf8'}).trim(),'work/consumer-repair-mission-poc','Projection writes require the assigned work branch');}
 const {snapshot,lock}=await projectCatalog(path.resolve(values.source));const output='// Factual identity snapshot only. No new fitment decisions, prices or images.\nexport const catalogSnapshot='+JSON.stringify(snapshot,null,2)+';\n';lock.snapshotSha256=sha(output);
 for(const [name,content] of [['catalog-snapshot.mjs',output],['catalog-lock.json',JSON.stringify(lock,null,2)+'\n']]){const file=path.join(folder,name);if(values.check)assert.equal(fs.readFileSync(file,'utf8'),content,name+' differs');else fs.writeFileSync(file,content);}
 console.log(JSON.stringify({state:values.check?'byte-identical':'projected',devices:snapshot.devices.length,parts:snapshot.parts.length,newFitments:0,wave3Integrated:false}));
}
