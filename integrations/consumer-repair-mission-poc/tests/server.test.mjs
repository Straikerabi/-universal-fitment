import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {createPreviewServer} from '../serve.mjs';

async function withServer(run){
 const server=createPreviewServer();
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const port=server.address().port;
 const request=(target,method='GET')=>new Promise((resolve,reject)=>{
  const req=http.request({hostname:'127.0.0.1',port,path:target,method},res=>{
   const chunks=[];res.on('data',x=>chunks.push(x));
   res.on('end',()=>resolve({status:res.statusCode,headers:res.headers,body:Buffer.concat(chunks).toString('utf8')}));
  });req.on('error',reject);req.end();
 });
 try{await run(request);}finally{await new Promise(resolve=>server.close(resolve));}
}

test('preview serves local UI with a policy that prevents network services and embedding',async()=>{
 await withServer(async request=>{
  const page=await request('/');assert.equal(page.status,200);assert.match(page.body,/id="workspace"/);
  assert.match(page.headers['content-security-policy'],/connect-src 'none'/);
  assert.match(page.headers['content-security-policy'],/frame-ancestors 'none'/);
  assert.equal(page.headers['referrer-policy'],'no-referrer');
  assert.equal(page.headers['x-content-type-options'],'nosniff');
  const script=await request('/app.mjs');assert.equal(script.status,200);assert.match(script.headers['content-type'],/javascript/);
  const head=await request('/styles.css','HEAD');assert.equal(head.status,200);assert.equal(head.body,'');
 });
});

test('preview does not expose tooling, evidence, repository paths or malformed URLs',async()=>{
 await withServer(async request=>{
  for(const target of ['/serve.mjs','/build-catalog.mjs','/check.mjs','/package.json','/catalog-lock.json','/tests/state.test.mjs','/qa/browser-results.json','/.git/config','/%2e%2e%2fpackage.json','/%ZZ']){
   const response=await request(target);assert.ok([403,404].includes(response.status),target);assert.equal(response.body,'');
  }
 });
});

test('preview rejects mutation methods',async()=>{
 await withServer(async request=>{for(const method of ['POST','PUT','DELETE'])assert.equal((await request('/app.mjs',method)).status,405);});
});
