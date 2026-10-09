// Reproduce pinned manufacturer evidence without making catalogue changes.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {readEvidence,validateEvidence,digest,canonical} from './import-model-gap-wave3-catalog.mjs';

export function verifySources({cacheDir,download=false,evidence=readEvidence()}={}){
 const {models,sources}=validateEvidence(evidence);
 assert.ok(cacheDir,'Provide an explicit evidence cache directory');
 if(download)fs.mkdirSync(cacheDir,{recursive:true});
 assert.equal(fs.realpathSync(cacheDir),path.resolve(cacheDir),'Evidence cache may not follow symlinks');
 const observations=[];
 for(const source of sources.values()){
  const filename=path.join(cacheDir,source.id+'.'+source.format);
  let exists=false;try{const stat=fs.lstatSync(filename);assert.ok(!stat.isSymbolicLink(),'Evidence file may not be a symlink');exists=true;}catch(error){if(error.code!=='ENOENT')throw error;}
  if(download){assert.ok(!exists,'Download never overwrites a previous observation');execFileSync('curl',['--fail','--location','--proto','=https','--proto-redir','=https','--silent','--show-error','--max-time','55','--output',filename,source.url]);}
  const bytes=fs.readFileSync(filename);assert.equal(digest(bytes),source.responseSha256,'Reviewed response changed; manual review required: '+source.id);
  assert.equal(bytes.length,source.responseBytes);
  const text=source.format==='pdf'?execFileSync('pdftotext',['-layout',filename,'-'],{encoding:'utf8',maxBuffer:10*1024*1024}):bytes.toString();
  if(source.format==='pdf')assert.equal(Number(execFileSync('pdfinfo',[filename],{encoding:'utf8'}).match(/Pages:\s+(\d+)/)[1]),source.pageCount);
  observations.push({id:source.id,sha256:digest(bytes),bytes:bytes.length});
  for(const model of models.filter(c=>c.sourceIds[0]===source.id)){
   let identityText=text;
   if(source.id==='samsung-sc52')identityText=text.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]||'';
   if(source.id==='samsung-vc2500')identityText=text.match(/<input[^>]+id="modelCode"[^>]+value="([^"]+)"/i)?.[1]||'';
   if(source.id.startsWith('dyson-'))identityText=text.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]||'';
   if(model.locator.pdfPage)identityText=execFileSync('pdftotext',['-f',String(model.locator.pdfPage),'-l',String(model.locator.pdfPage),'-layout',filename,'-'],{encoding:'utf8'});
   assert.ok(canonical(identityText.replace(/<[^>]+>/g,' ')).includes(canonical(model.observedLabel)),'Manufacturer identity not present in reviewed heading/model column: '+model.id);
  }
 }
 return {issue:37,verifiedSources:observations.length,groundedProfiles:models.length,observations};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
  const args=process.argv.slice(2);let cacheDir,download=false;
  while(args.length){const arg=args.shift();if(arg==='--cache-dir'){assert.ok(args[0]&&!args[0].startsWith('--'));cacheDir=args.shift();}else if(arg==='--download')download=true;else throw Error('Unknown argument: '+arg);}
  console.log(JSON.stringify(verifySources({cacheDir,download}),null,2));
 }catch(error){console.error(error.message);process.exitCode=1;}
}
