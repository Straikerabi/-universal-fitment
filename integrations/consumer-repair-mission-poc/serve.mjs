import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
export const root=path.dirname(fileURLToPath(import.meta.url));
const mime={'.html':'text/html;charset=utf-8','.mjs':'text/javascript;charset=utf-8','.css':'text/css;charset=utf-8','.json':'application/json;charset=utf-8','.svg':'image/svg+xml','.png':'image/png'};
// Serve only the UI's root assets. Build scripts, tests and evidence stay private.
const publicFiles=new Set(['index.html','styles.css','app.mjs','mission-state.mjs','mock-fitment-adapter.mjs','catalog-snapshot.mjs']);
// Explicit same-origin, read-only shared v1 modules; no arbitrary parent directories.
const sharedFiles=Object.freeze({
 '/dual-platform-owner-review/bridge.mjs':'dual-platform-owner-review/bridge.mjs',
 '/dual-platform-owner-review/ui-fixtures.mjs':'dual-platform-owner-review/ui-fixtures.mjs',
 '/fitment-engine-v1-poc/contract.mjs':'fitment-engine-v1-poc/contract.mjs',
 '/fitment-engine-v1-poc/fixtures.mjs':'fitment-engine-v1-poc/fixtures.mjs',
 '/business-embed-poc/adapter.mjs':'business-embed-poc/adapter.mjs'
});
export function createPreviewServer(){return http.createServer(async(req,res)=>{
 try{
  if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405).end();return;}
  const pathname=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);let file=path.resolve(root,'.'+pathname);
  const shared=Object.hasOwn(sharedFiles,pathname);
  if(shared)file=path.resolve(root,'..',sharedFiles[pathname]);
  else {
   if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403).end();return;}
   if(pathname==='/'||pathname==='/index.html')file=path.join(root,'index.html');
  }
  const relative=path.relative(root,file);
  if(!shared&&!publicFiles.has(relative)){res.writeHead(404).end();return;}
  const stat=await fs.lstat(file);if(!stat.isFile()||stat.isSymbolicLink()){res.writeHead(404).end();return;}
  res.setHeader('Content-Type',mime[path.extname(file)]||'text/plain;charset=utf-8');res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');
  res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'none'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'");
  res.end(req.method==='HEAD'?undefined:await fs.readFile(file));
 }catch{res.writeHead(404).end();}
});}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){const server=createPreviewServer();server.listen(Number(process.env.PORT||4179),'127.0.0.1',()=>console.log('Local preview: http://127.0.0.1:'+server.address().port));}
