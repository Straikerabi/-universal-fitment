import {createHash} from 'node:crypto';
import {readFile,writeFile,mkdtemp,rm,readdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve,dirname,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';
import {isManufacturerUrl,SCHEMA_VERSION} from './contract.mjs';
export const BASE_COMMIT='71f7826ba936a1f3830c8b2a67e8085a9cfe234e';
export const CHECKPOINT_SHA='c600a5c5a83a6f096ff5999e5ce5582c37ec424155919d487dfd6ca2221bd42b';
export const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
export const sha = bytes=>createHash('sha256').update(bytes).digest('hex');
const order=(a,b)=>a<b?-1:a>b?1:0;
export const stable = value => {
  if(Array.isArray(value))return value.map(stable);
  if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort(order).map(k=>[k,stable(value[k])]));
  return value;
};
export const serialize=value=>JSON.stringify(stable(value),null,2)+'\n';
export function articleKey(part,owner) {
  const namespace=part.tier==='aftermarket'?'supplier-article':null;
  const i=part.identifiers?.find(i=>namespace?i.type===namespace:['material-number','manufacturer-article','manufacturer-designation'].includes(i.type));
  // OEM namespaces and issuers remain distinct. Do not strip zeros, suffixes or punctuation.
  return JSON.stringify([part.tier||'unknown',part.brand||owner,i?.type||'record-id',i?.value||part.id]);
}
const qualifiedSource=(brand,s)=>s&&s.type==='manufacturer'&&isManufacturerUrl(brand,s.url)&&/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}\.\d{3}Z)?$/.test(s.retrievedAt||'')&&Number.isFinite(Date.parse(s.retrievedAt));

export function buildCoverage({products,parts,isPhysicalPart,partType,explicitEdges,sourceFiles=[]}) {
  const models=products.filter(p=>p.recordType==='model');
  if(new Set(models.map(p=>p.id)).size!==models.length)throw new Error('Duplicate model record IDs');
  const allRows=[],edgeRows=[],brands=[],exactOemReferenceExclusions=[];
  for(const brand of [...new Set(models.map(p=>p.brand))].sort(order)) {
    const records=models.filter(p=>p.brand===brand),local=[];
    for(const m of [...records].sort((a,b)=>order(a.id,b.id))) {
      const physical=new Map();
      for(const p of m.parts||[])if(isPhysicalPart(p))physical.set(articleKey(p,m.brand),p);
      const candidates=new Set((m.candidateParts||[]).filter(isPhysicalPart).map(p=>articleKey(p,m.brand)));
      const explicit=[];
      for(const [key,p] of [...physical].sort(([a],[b])=>order(a,b))) {
        for(const e of explicitEdges.get(JSON.stringify([m.id,key]))||[])if(e.articleReference&&!p.identifiers?.some(i=>['material-number','manufacturer-article','manufacturer-designation'].includes(i.type)&&i.value===e.articleReference))exactOemReferenceExclusions.push({modelId:m.id,articleKey:key,sourceArticleReference:e.articleReference,reason:'SOURCE_ARTICLE_SUFFIX_OR_ALIAS_NOT_EXACTLY_IDENTIFIED'});
        const evidence=(explicitEdges.get(JSON.stringify([m.id,key]))||[]).filter(e=>p.tier==='oem'&&(p.brand||brand)===brand&&e.articleReference&&e.variantReference&&e.basis&&p.identifiers?.some(i=>['material-number','manufacturer-article','manufacturer-designation'].includes(i.type)&&i.value===e.articleReference)&&e.sources.length&&e.sources.every(s=>qualifiedSource(brand,s)));
        if(evidence.length) {
          explicit.push(key);
          edgeRows.push({modelId:m.id,articleKey:key,scope:'manufacturer-recorded-model-or-variant-listing',confirmedInstallation:false,sourceClaims:evidence});
        }
      }
      const categories=[...new Set([...physical.values()].map(p=>partType(p).id))].sort(order);
      const row={modelId:m.id,brand,model:m.model,identifiers:m.identifiers||[],identityScope:m.identityScope||'catalog-reference',physicalParts:physical.size,mappedArticleRows:(m.parts||[]).length,candidatePhysicalParts:candidates.size,explicitManufacturerRecordedEdges:explicit.length,confirmedFitments:0,categoryIds:categories,missingCategoryIds:['bag','filter','nozzle','hose','electrical','mechanical'].filter(k=>!categories.includes(k)),missingCategoryStatus:'unknown',variantStatus:'exact-repair-variant-not-certified',sources:(m.sources||[]).filter(s=>qualifiedSource(brand,s)).map(({url,retrievedAt})=>({url,retrievedAt}))};
      local.push(row);allRows.push(row);
    }
    const articles=parts.filter(p=>(p.brand===brand)||(brand==='Miele'&&!p.brand)||(p.targetBrands||[]).includes(brand));
    brands.push({brand,modelNames:new Set(records.map(p=>p.model)).size,modelRecords:records.length,zero:local.filter(r=>r.physicalParts===0).length,one:local.filter(r=>r.physicalParts===1).length,multiple:local.filter(r=>r.physicalParts>1).length,mappedPhysicalEdges:local.reduce((n,r)=>n+r.physicalParts,0),explicitManufacturerRecordedEdges:local.reduce((n,r)=>n+r.explicitManufacturerRecordedEdges,0),physicalArticleRows:articles.filter(isPhysicalPart).length,articleRows:articles.length,confirmedFitments:0});
  }
  const distinctArticles=new Set(parts.map(p=>articleKey(p,p.brand||'Miele')));
  const counts={modelNames:brands.reduce((n,b)=>n+b.modelNames,0),modelRecords:models.length,familyFallbackRecords:products.length-models.length,articleRows:parts.length,distinctScopedArticleIdentities:distinctArticles.size,physicalArticleRows:parts.filter(isPhysicalPart).length,zero:brands.reduce((n,b)=>n+b.zero,0),one:brands.reduce((n,b)=>n+b.one,0),multiple:brands.reduce((n,b)=>n+b.multiple,0),mappedPhysicalEdges:brands.reduce((n,b)=>n+b.mappedPhysicalEdges,0),explicitManufacturerRecordedEdges:edgeRows.length,confirmedFitments:0,independentlyReauditedSourceClaims:0,authorizedPurchasableParts:0};
  return {reportVersion:'1.0.0',contractVersion:SCHEMA_VERSION,baseline:{commit:BASE_COMMIT,version:'1.29.0',checkpointSha256:CHECKPOINT_SHA},definitions:{modelNames:'Distinct exact [brand, model] catalog labels; not a count of independent constructions.',modelRecords:'Concrete recordType=model identities; nine family fallback records excluded.',physicalParts:'Existing v1.29.0 taxonomy: spare/accessory/consumable. Document/device/unknown excluded.',explicitManufacturerRecordedEdges:'Unique model-record/physical-article pairs supported by structured model-specific manufacturer listings in the pinned source. Source URLs and dates retained. Not an independent live re-audit, exact repair certification, permission grant or installation approval.',confirmedFitments:'Zero: baseline has no v1 reviewed variant+installation+rights evidence chain. Legacy status/confidence cannot authorize confirmation.',missingCategories:'Unknown coverage gaps; never evidence of not_sold_separately or incompatibility.',articles:'Rows and exact tier/issuer/identifier-namespace/value identities reported separately. Merchant SKUs, EAN and designations never become numeric OEM codes.'},counts,exactOemReferenceExclusions,documentedBaseline:{modelRecords:1093,recordsWithoutPhysicalParts:447,articleRows:1940,physicalArticleRows:1822},reconciliation:{modelRecordsDelta:counts.modelRecords-1093,recordsWithoutPhysicalPartsDelta:counts.zero-447,articleRowsDelta:counts.articleRows-1940,physicalArticleRowsDelta:counts.physicalArticleRows-1822},pendingIntegration:{ownerIssue:54,readOnlyPullRequests:[51,52,53],included:false,note:'Wave-3 outputs are not imported. Future 1115 models/1961 articles/463 without physical parts are an unverified combined projection (447+22-6), not this baseline.'},brands,models:allRows,manufacturerRecordedEdges:edgeRows,sourceFiles};
}

export async function snapshotSource(site) {
  const hashes=[];
  async function walk(dir,relative='') {
    for(const entry of (await readdir(dir,{withFileTypes:true})).sort((a,b)=>order(a.name,b.name))) {
      const path=join(dir,entry.name),name=relative+entry.name;
      if(entry.isSymbolicLink())throw new Error('Source symlinks refused');
      if(entry.isDirectory())await walk(path,name+'/');else hashes.push({path:name,sha256:sha(await readFile(path))});
    }
  }
  await walk(site);return hashes;
}

export async function createBaselineReport() {
  const meta=JSON.parse(await readFile(join(ROOT,'integrations/source-checkpoint.json'),'utf8'));
  if(meta.archive_sha256!==CHECKPOINT_SHA||meta.version!=='1.29.0'||meta.file_count!==136)throw new Error('Baseline checkpoint changed; review a new data version');
  const temp=await mkdtemp(join(tmpdir(),'uf-fitment-baseline-'));
  try {
    const site=join(temp,'source');
    execFileSync('python3',[join(ROOT,'integrations/restore-source-checkpoint.py'),'--target',site],{stdio:'pipe'});
    const sourceFiles=await snapshotSource(site);
    const mod=rel=>import(pathToFileURL(join(site,'src/data',rel)).href);
    const catalog=await mod('catalog.js');
    for(const brand of catalog.optionalCatalogBrands)catalog.registerCatalogPack((await mod(brand.toLowerCase()+'-pack.js')).brandPack);
    const {isPhysicalPart,partType}=await mod('part-taxonomy.js');
    const {brandDeviceId}=await mod('brand-products.js');
    const {mieleModelRecords}=await mod('miele-model-records.js');
    const {boschPartRecords}=await mod('bosch-records.js');
    const explicitEdges=new Map();
    const add=(m,p,claim)=>{
      const key=JSON.stringify([m.id,articleKey(p,m.brand)]),list=explicitEdges.get(key)||[];
      list.push(claim);explicitEdges.set(key,list);
    };
    for(const m of catalog.products.filter(m=>m.recordType==='model'))for(const p of m.parts.filter(isPhysicalPart)) {
      if(m.brand==='Miele') {
        const record=mieleModelRecords.find(r=>'vac-miele-model-'+r.material===m.id);
        const accessory=record?.accessories.find(a=>p.identifiers.some(i=>i.type==='material-number'&&i.value===a.material));
        if(accessory)add(m,p,{basis:'pinned-miele-device-accessory-list',variantReference:record.material,articleReference:accessory.material,sources:(p.fitment?.evidence||[]).filter(s=>s.url===record.url||s.url===accessory.url)});
      }else if(m.brand==='Bosch') {
        const r=boschPartRecords.find(r=>r.modelCodes?.some(code=>'vac-bosch-model-'+code.toLowerCase()===m.id)&&p.identifiers.some(i=>i.type==='manufacturer-article'&&i.value===r.code));
        if(r)add(m,p,{basis:'pinned-bosch-model-accessory-list',variantReference:m.model,articleReference:r.code,sources:(p.fitment?.evidence||[]).filter(s=>s.url===r.url||m.sources.some(x=>x.url===s.url))});
      }
      for(const r of p.relationships||[])if(brandDeviceId(m.brand,r.code)===m.id) {
        // Third-party Hoover delegation isn't encoded as a source chain in the old schema:
        // it remains mapped but is excluded from the strict first-party recorded-edge metric.
        const sources=(p.fitment?.evidence||[]).filter(s=>s.url===r.url);
        add(m,p,{basis:r.basis||'pinned-structured-manufacturer-relationship',variantReference:r.pnc||r.reference||r.code,articleReference:r.sourceArticle||p.identifiers.find(i=>['material-number','manufacturer-article','manufacturer-designation'].includes(i.type))?.value||null,position:r.position||null,sources});
      }
    }
    const report=buildCoverage({products:catalog.products,parts:catalog.partsCatalog,isPhysicalPart,partType,explicitEdges,sourceFiles});
    if(serialize(sourceFiles)!==serialize(await snapshotSource(site)))throw new Error('Coverage mutated restored source');
    return report;
  }finally{await rm(temp,{recursive:true,force:true});}
}

export function markdown(report) {
  const c=report.counts;
  return `# Staubsauger-Coverage v1.29.0 (isolierter Baseline-Report)\n\nBasis: \`${BASE_COMMIT}\`; Checkpoint \`${CHECKPOINT_SHA}\`. Keine Wave-3-Integration.\n\n${c.modelRecords} konkrete Modellrows / ${c.modelNames} unterschiedliche Marke-Modell-Namen; ${c.familyFallbackRecords} Familienfallbacks separat. ${c.articleRows} Artikelrows, ${c.physicalArticleRows} physische Artikelrows.\n\n| Marke | Namen | Rows | 0 Teile | 1 Teil | n Teile | Physische Zuordnungen | Explizite Hersteller-Listings* |\n|---|---:|---:|---:|---:|---:|---:|---:|\n`+report.brands.map(b=>`| ${b.brand} | ${b.modelNames} | ${b.modelRecords} | ${b.zero} | ${b.one} | ${b.multiple} | ${b.mappedPhysicalEdges} | ${b.explicitManufacturerRecordedEdges} |`).join('\n')+`\n\n**${c.zero} ohne physisches Teil**, ${c.one} mit genau einem, ${c.multiple} mit mehreren. ${c.mappedPhysicalEdges} deduplizierte physische Zuordnungen, ${c.explicitManufacturerRecordedEdges} strukturierte Hersteller-Listings.\n\n*Listings sind im gepinnten Katalog aufgezeichnete, modellbezogene Quellenbehauptungen. Keine neue Live-Quellenprüfung, Rechtefreigabe oder Montagebestätigung. Familien-/Präfix-/Aftermarket-Inferenz zählt nicht; Drittservice ohne strukturierte Delegationskette ebenfalls nicht. Bosch-Modellzubehör besitzt hier keine bestätigten /xx-Indizes.\n\n**0 v1-bestätigte Passungen / 0 autorisiert bestellbare Teile.** Nicht: alle Teile passen nicht. Der Baseline fehlen vollständige v1-Belegketten mit Varianten-, Anschluss- und Nutzungsprüfung. Durchschnitt v1-bestätigter Teile pro Modell: 0. Fehlende Baugruppen bleiben unknown, auch wenn für einen Gerätetyp z. B. Beutel nicht zutreffen könnten.\n\nAbweichungen von dokumentierten 1093/447/1940/1822: \`${JSON.stringify(report.reconciliation)}\`. Jede konkrete Modellrow und Hersteller-Listing-Quelle sowie alle 136 unveränderten Dateihashes stehen im JSON. Neun Miele-Familienfallbacks erhöhen keine Modellzahl. Namen/Rows sind keine belegte Zahl unabhängiger Konstruktionen oder zertifizierter Reparaturvarianten.\n\nPRs #51–#53 nur gelesen. Gemeinsame Integration: #54. Deren geplante 1115/1961/463 sind keine Messwerte dieses Reports. Keine API, UI, Preise, Feeds, Bilder, Secrets oder neuen OEM-Daten.\n`;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const args=process.argv.slice(2);
  if(args.length>1||(args.length===1&&args[0]!=='--check'))throw new Error('Usage: node coverage.mjs [--check]');
  const report=await createBaselineReport();
  const full=serialize(report);
  const summary={...report,models:undefined,manufacturerRecordedEdges:undefined,sourceFiles:undefined,exactOemReferenceExclusions:undefined,exactOemReferenceExclusionsCount:report.exactOemReferenceExclusions.length,fullReportSha256:sha(full),sourceFilesSha256:sha(serialize(report.sourceFiles))};
  if(args[0]!=='--check')await writeFile(join(dirname(fileURLToPath(import.meta.url)),'coverage.json'),full);
  for(const [file,body] of [['baseline-report.json',serialize(summary)],['coverage.md',markdown(report)]]) {
    const path=join(dirname(fileURLToPath(import.meta.url)),file);
    if(args[0]==='--check'){if(await readFile(path,'utf8')!==body)throw new Error('Non-reproducible report: '+file);}else await writeFile(path,body);
  }
  console.log(JSON.stringify({reproducible:args[0]==='--check',counts:report.counts,reconciliation:report.reconciliation}));
}
