import {createHash} from 'node:crypto';
import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.dirname(fileURLToPath(import.meta.url));
export const assets=['index.html','styles.css','component.css','app.mjs','navigation.mjs','readiness.mjs','deletion.mjs','offline-control.mjs','sw.mjs'];
export async function expectedConfig(){
 const hash=createHash('sha256');for(const name of assets){hash.update(name+'\0');hash.update(await readFile(path.join(root,name)));hash.update('\0');}
 const fingerprint=hash.digest('hex');
 return `// Generated from all shipped navigation assets; excludes self-reference.\nexport const fingerprint=${JSON.stringify(fingerprint)};\nexport const cacheName=${JSON.stringify('uf-legal-wave7-assets-'+fingerprint.slice(0,24))};\nexport const assetPaths=${JSON.stringify(['./',...assets.map(x=>'./'+x),'./offline-config.mjs'])};\n`;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const expected=await expectedConfig(),target=path.join(root,'offline-config.mjs');
 if(process.argv.includes('--check')){if(await readFile(target,'utf8')!==expected)throw Error('Offline fingerprint drift');console.log('Offline fingerprint matches every shipped asset');}
 else{await writeFile(target,expected);console.log('Generated navigation-only offline fingerprint');}
}
