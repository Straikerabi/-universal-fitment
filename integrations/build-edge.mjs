import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { mielePartsCatalog } from '../site/src/data/catalog.js';
import { partSearchIdentity } from '../site/src/core/marketplaces.js';

const root=fileURLToPath(new URL('../',import.meta.url));
const output=resolve(process.argv[2]||`${root}/build-marketplace-edge`);
const partIndex=mielePartsCatalog.map(partSearchIdentity);
if(partIndex.some(part=>!part)||new Set(partIndex.map(part=>part.partKey)).size!==partIndex.length)throw new Error('Invalid catalog identities');
const files=[];
const copy=async(name,path,from,to)=>{
  let content=await readFile(`${root}/${path}`,'utf8');
  if(from){if(!content.includes(from))throw new Error(`Missing dependency in ${path}`);content=content.replace(from,to);}
  files.push({name,content});
};
await copy('index.ts','integrations/edge/index.ts');
await copy('handler.mjs','integrations/marketplace-handler.mjs',"'../site/src/core/marketplaces.js'","'./marketplaces.js'");
await copy('marketplace-quota.mjs','integrations/marketplace-quota.mjs');
await copy('marketplace-pilot.mjs','integrations/marketplace-pilot.mjs');
await copy('marketplace-providers.mjs','integrations/marketplace-providers.mjs',"'../site/src/core/marketplaces.js'","'./marketplaces.js'");
await copy('marketplaces.js','site/src/core/marketplaces.js',"'../data/miele-parts.js'","'./miele-parts.js'");
await copy('miele-parts.js','site/src/data/miele-parts.js');
await copy('part-taxonomy.js','site/src/data/part-taxonomy.js');
await copy('miele-spare-records.js','site/src/data/miele-spare-records.js');
await copy('miele-aftermarket.js','site/src/data/miele-aftermarket.js');
files.push({name:'part-index.mjs',content:`export const partIndex=${JSON.stringify(partIndex,null,2)};\n`});
// Mark .js files as ESM for a local Node smoke test; the Edge runtime uses ES modules directly.
files.push({name:'package.json',content:'{"type":"module"}\n'});
files.push({name:'deno.json',content:'{"compilerOptions":{"allowJs":true,"checkJs":false}}\n'});
await mkdir(output,{recursive:true});
for(const file of files)await writeFile(`${output}/${file.name}`,file.content);
await writeFile(`${output}/deploy.json`,JSON.stringify({entrypoint_path:'index.ts',files}));
console.log(`Edge package built: ${partIndex.length} catalog parts, ${files.length} files.`);
