import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const require=createRequire(new URL('./auth-sdk/package.json',import.meta.url));
const esbuild=process.env.UF_ESBUILD_MODULE?await import(process.env.UF_ESBUILD_MODULE):require('esbuild');
const version=JSON.parse(fs.readFileSync(path.join(root,'site/package.json'),'utf8')).version;
const target=path.join(root,`site/app-v${version}.js`);
const result=await esbuild.build({entryPoints:[path.join(root,'site/src/app.js')],bundle:true,format:'esm',platform:'browser',target:'es2022',minify:true,legalComments:'inline',write:false});
const bytes=result.outputFiles[0].contents;
if(process.argv.includes('--check')){
  if(!fs.existsSync(target)||!Buffer.from(bytes).equals(fs.readFileSync(target)))throw Error('Published bundle differs from the current source. Run integrations/build-app.mjs.');
}else fs.writeFileSync(target,bytes);
console.log(`App ${version}: ${bytes.length} bytes; ${process.argv.includes('--check')?'reproducible artifact verified':'bundle written'}.`);

const servicesTarget=path.join(root,`site/services-v${version}.js`);
const servicesResult=await esbuild.build({entryPoints:[path.join(root,'site/src/data/services.js')],bundle:true,format:'esm',platform:'browser',target:'es2022',minify:true,legalComments:'inline',write:false});
const servicesBytes=servicesResult.outputFiles[0].contents;
if(process.argv.includes('--check')){
 if(!fs.existsSync(servicesTarget)||!Buffer.from(servicesBytes).equals(fs.readFileSync(servicesTarget)))throw Error('Optional service pack differs from source.');
}else fs.writeFileSync(servicesTarget,servicesBytes);
console.log(`Optional services: ${servicesBytes.length} bytes; loaded on demand.`);

for(const brand of ['dyson','aeg','rowenta','philips','siemens','vorwerk']){
 const output=path.join(root,`site/catalog-${brand}-v${version}.js`);
 const pack=await esbuild.build({entryPoints:[path.join(root,`site/src/data/${brand}-pack.js`)],bundle:true,format:'esm',platform:'browser',target:'es2022',minify:true,legalComments:'inline',write:false});
 const packed=pack.outputFiles[0].contents;
 if(process.argv.includes('--check')){
  if(!fs.existsSync(output)||!Buffer.from(packed).equals(fs.readFileSync(output)))throw Error(`Optional ${brand} catalog differs from source.`);
 }else fs.writeFileSync(output,packed);
 console.log(`Optional ${brand} catalog: ${packed.length} bytes; loaded on demand.`);
}

