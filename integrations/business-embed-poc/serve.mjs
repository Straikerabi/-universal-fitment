import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
export const root=path.dirname(fileURLToPath(import.meta.url));
const files={'/':'index.html','/index.html':'index.html','/embed.html':'embed.html','/style.css':'style.css','/pilot.css':'pilot.css','/host.mjs':'host.mjs','/widget.mjs':'widget.mjs','/adapter.mjs':'adapter.mjs','/fixtures.mjs':'fixtures.mjs','/shared-adapter.mjs':'shared-adapter.mjs','/access-lab.mjs':'access-lab.mjs'};
const mime={html:'text/html; charset=utf-8',mjs:'text/javascript; charset=utf-8',css:'text/css; charset=utf-8'};
const sharedFiles=Object.freeze({
 '/dual-platform-owner-review/bridge.mjs':'dual-platform-owner-review/bridge.mjs',
 '/dual-platform-owner-review/ui-fixtures.mjs':'dual-platform-owner-review/ui-fixtures.mjs',
 '/fitment-engine-v1-poc/contract.mjs':'fitment-engine-v1-poc/contract.mjs',
 '/fitment-engine-v1-poc/fixtures.mjs':'fitment-engine-v1-poc/fixtures.mjs',
 '/business-embed-poc/adapter.mjs':'business-embed-poc/adapter.mjs'
});
export function createServer(){return http.createServer((req,res)=>{
 const host=req.headers.host||'';
 const headers={'Content-Security-Policy':"default-src 'none'; script-src 'self'; style-src 'self'; frame-src 'self'; frame-ancestors 'self'; connect-src 'none'; img-src 'none'; base-uri 'none'; form-action 'none'; object-src 'none'",'X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Cache-Control':'no-store','Permissions-Policy':'camera=(), microphone=(), geolocation=()'};
 const reject=(code)=>{res.writeHead(code,headers);res.end('Local demo request rejected');};
 if(!/^127\.0\.0\.1:\d+$/.test(host))return reject(403);
 if(!['GET','HEAD'].includes(req.method))return reject(405);
 let url;try{url=new URL(req.url,'http://'+host);}catch{return reject(400);}
 const shared=Object.hasOwn(sharedFiles,url.pathname);
 if(!shared&&!Object.hasOwn(files,url.pathname))return reject(404);
 const name=shared?sharedFiles[url.pathname]:files[url.pathname];
 const file=shared?path.resolve(root,'..',name):path.join(root,name);
 const data=fs.readFileSync(file);
 res.writeHead(200,{...headers,'Content-Type':mime[name.split('.').at(-1)],'Content-Length':data.length});
 res.end(req.method==='HEAD'?undefined:data);
 });}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const value=process.env.UF_BUSINESS_PORT||'4175';if(!/^\d+$/.test(value)||+value<1024||+value>65535)throw Error('Invalid local port');
 const server=createServer();server.listen(+value,'127.0.0.1',()=>console.log(`Local synthetic demo: http://127.0.0.1:${value}`));
}
