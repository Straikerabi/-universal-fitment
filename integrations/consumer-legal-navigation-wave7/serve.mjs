import http from 'node:http';
import {readFile,lstat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const publicFiles=new Set(['index.html','styles.css','component.css','app.mjs','navigation.mjs','readiness.mjs','deletion.mjs','offline-control.mjs','sw.mjs','offline-config.mjs']);
export function createServer(){return http.createServer(async(req,res)=>{
 try{
  const host=new URL('http://'+req.headers.host),base=`http://127.0.0.1:${req.socket.localPort}`;
  if(!['127.0.0.1','localhost'].includes(host.hostname)||Number(host.port)!==req.socket.localPort||!req.url.startsWith('/')||req.url.startsWith('//')||(req.headers.origin&&req.headers.origin!==host.origin)){res.writeHead(403).end();return;}
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405).end();return;}
  const url=new URL(req.url,base);if(url.search){res.writeHead(404).end();return;}
  const name=decodeURIComponent(url.pathname)==='/'?'index.html':decodeURIComponent(url.pathname).slice(1);
  if(!publicFiles.has(name)){res.writeHead(404).end();return;}
  const file=path.join(root,name),info=await lstat(file);if(!info.isFile()||info.isSymbolicLink()){res.writeHead(404).end();return;}
  res.setHeader('Content-Type',name.endsWith('.html')?'text/html;charset=utf-8':name.endsWith('.css')?'text/css;charset=utf-8':'text/javascript;charset=utf-8');
  res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');
  res.setHeader('Content-Security-Policy',`default-src 'none'; script-src 'self'; style-src 'self'; img-src data:; worker-src 'self'; connect-src ${name==='sw.mjs'?"'self'":"'none'"}; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'`);
  res.end(req.method==='HEAD'?undefined:await readFile(file));
 }catch{res.writeHead(404).end();}
});}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){const server=createServer();server.listen(Number(process.env.PORT||4182),'127.0.0.1',()=>console.log(`Private local preview: http://127.0.0.1:${server.address().port}`));}
