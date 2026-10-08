import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';

const require=createRequire(import.meta.url);
const {chromium}=process.env.UF_PLAYWRIGHT_MODULE?await import(process.env.UF_PLAYWRIGHT_MODULE):require('playwright');
const root=fileURLToPath(new URL('../',import.meta.url));
const site=path.resolve(process.argv[2]||path.join(root,'site'));
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.json':'application/json','.webmanifest':'application/manifest+json','.png':'image/png'};
const server=http.createServer(async(req,res)=>{
 try{
  const u=new URL(req.url,'http://127.0.0.1');
  const file=path.resolve(site,'.'+decodeURIComponent(u.pathname));
  if(file!==site&&!file.startsWith(site+path.sep)){res.writeHead(403).end();return;}
  const location=(await fs.stat(file)).isDirectory()?path.join(file,'index.html'):file;
  res.setHeader('Content-Type',mime[path.extname(location)]||'application/octet-stream');
  res.end(await fs.readFile(location));
 }catch{res.writeHead(404).end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port+'/';
const results=[],consoleErrors=[];
let browser;
try{
 browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-gpu'],...(process.env.UF_CHROMIUM_EXECUTABLE?{executablePath:process.env.UF_CHROMIUM_EXECUTABLE}:{})});
 for(const width of [320,375,390,430,600,768,1024]){
  const ctx=await browser.newContext({viewport:{width,height:812},serviceWorkers:'block'});
  const page=await ctx.newPage();
  page.on('pageerror',e=>consoleErrors.push(e.message));
  await page.route('https://**/*',route=>route.abort());
  await page.goto(base+'#parts');
  await page.locator('.catalog-coverage .maker-part-links > a.btn').first().waitFor({timeout:18000});
  const actual=await page.evaluate(()=>{
   const card=document.querySelector('.catalog-coverage');
   const nav=card?.querySelector('.maker-part-links');
   const anchors=[...nav?.querySelectorAll('a.btn')||[]];
   const relative=element=>{
    const r=element.getBoundingClientRect();
    return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom,scrollWidth:element.scrollWidth,clientWidth:element.clientWidth};
   };
   return {viewport:innerWidth,pageScrollWidth:document.documentElement.scrollWidth,
    card:relative(card),nav:relative(nav),
    anchors:anchors.map(a=>({text:a.textContent,url:a.href,position:getComputedStyle(a).position,whiteSpace:getComputedStyle(a).whiteSpace,...relative(a)})),
    computed:{columns:getComputedStyle(nav).gridTemplateColumns,display:getComputedStyle(nav).display}};
  });
  assert.equal(actual.anchors.length,7,'Exactly seven sources at '+width);
  assert.equal(actual.computed.display,'grid');
  assert.ok(actual.pageScrollWidth<=width+1,'No page horizontal overflow at '+width+': '+JSON.stringify(actual));
  for(let i=0;i<actual.anchors.length;i++){
   const b=actual.anchors[i];
   assert.ok(b.height>=47.5,'Touch target too short at '+width+': '+b.text);
   assert.ok(b.right<=actual.card.right+1&&b.x>=actual.card.x-1,'Maker link outside card width at '+width+': '+b.text);
   assert.ok(b.bottom<=actual.card.bottom+1,'Maker link extends below card at '+width+': '+b.text);
   assert.ok(b.scrollWidth<=b.clientWidth+1,'Wrapped maker link text still clipped: '+b.text);
   assert.equal(b.whiteSpace,'normal');
   for(let j=0;j<i;j++){
    const a=actual.anchors[j];
    const intersection=Math.min(a.right,b.right)-Math.max(a.x,b.x);
    const overlap=Math.min(a.bottom,b.bottom)-Math.max(a.y,b.y);
    assert.ok(intersection<=0.5||overlap<=0.5,'Manufacturer buttons overlap at '+width+': '+a.text+' / '+b.text);
   }
   if(width<=600&&i){
    assert.ok(b.y>=actual.anchors[i-1].bottom+5,'Mobile maker links must form separate rows at '+width);
   }
  }
  assert.ok(actual.nav.height>0&&actual.nav.height<=actual.card.height);
  if(width===375){
   await page.locator('.maker-part-links').scrollIntoViewIfNeeded();
   await page.screenshot({path:'/tmp/uf-maker-links-375.png',animations:'disabled'});
  }
  results.push({width,links:actual.anchors.length,columns:actual.computed.columns,overflow:false,overlap:false});
  console.log('PASS '+width+'px manufacturer sources; layout '+actual.computed.columns);
  await ctx.close();
 }
 assert.deepEqual(consoleErrors,[],'No JS page crashes');
 console.log(JSON.stringify({browserVersion:await browser.version(),testedViewports:results,network:'No external URLs requested',screenshots:['/tmp/uf-maker-links-375.png'],iosPhysicalDevice:'Not tested'},null,2));
}finally{
 await browser?.close();
 await new Promise(resolve=>server.close(resolve));
}
