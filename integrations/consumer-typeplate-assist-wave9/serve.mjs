import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';

const here=dirname(fileURLToPath(import.meta.url));
const prefix='/integrations/consumer-typeplate-assist-wave9/';
const files=new Map([
 [prefix,'index.html'],[prefix+'index.html','index.html'],
 [prefix+'styles.css','styles.css'],[prefix+'app.mjs','app.mjs'],
 [prefix+'typeplate.mjs','typeplate.mjs'],
 ['/integrations/consumer-repair-mission-poc/catalog-snapshot.mjs','../consumer-repair-mission-poc/catalog-snapshot.mjs']
]);
const extensions={'index.html':'text/html; charset=utf-8','styles.css':'text/css; charset=utf-8',
 'app.mjs':'text/javascript; charset=utf-8','typeplate.mjs':'text/javascript; charset=utf-8',
 'catalog-snapshot.mjs':'text/javascript; charset=utf-8'};
export const csp="default-src 'none'; script-src 'self'; style-src 'self'; base-uri 'none'; object-src 'none'; img-src 'none'; font-src 'none'; connect-src 'none'; form-action 'none'; frame-ancestors 'none'; worker-src 'none'";
export async function handler(req,res){
 res.setHeader('Content-Security-Policy',csp);
 res.setHeader('Referrer-Policy','no-referrer');
 res.setHeader('X-Content-Type-Options','nosniff');
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405,{'Allow':'GET, HEAD'});res.end();return;}
 let path;
 try{path=new URL(req.url,'http://127.0.0.1').pathname;}catch{res.writeHead(400);res.end();return;}
 if(path==='/'){res.writeHead(302,{'Location':prefix});res.end();return;}
 if(!files.has(path)){res.writeHead(404);res.end();return;}
 const target=files.get(path);
 try{
  const content=await readFile(resolve(here,target));
  res.writeHead(200,{'Content-Type':extensions[target.split('/').at(-1)]});
  res.end(req.method==='HEAD'?undefined:content);
 }catch{res.writeHead(503);res.end();}
}
export function createPreviewServer(){return createServer((req,res)=>{handler(req,res).catch(()=>{if(!res.headersSent)res.writeHead(500);res.end();});});}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const server=createPreviewServer(),port=Number(process.env.PORT||4178);
 server.listen(port,'127.0.0.1',()=>console.log('Lokale Typenschild-Vorschau: http://127.0.0.1:'+server.address().port+'/integrations/consumer-typeplate-assist-wave9/'));
}
