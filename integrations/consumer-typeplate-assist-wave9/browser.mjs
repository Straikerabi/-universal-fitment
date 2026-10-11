// Real browser smoke for the isolated preview. No mocks, skipped browsers or external navigation.
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {createPreviewServer} from './serve.mjs';

if(!process.env.UF_PLAYWRIGHT_MODULE)throw Error('UF_PLAYWRIGHT_MODULE missing: browser smoke must fail closed');
const {chromium,webkit}=await import(pathToFileURL(process.env.UF_PLAYWRIGHT_MODULE).href);
const server=createPreviewServer();
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const url='http://127.0.0.1:'+server.address().port+'/integrations/consumer-typeplate-assist-wave9/';
let passed=0;
try{
 for(const [name,browserType] of [['Chromium',chromium],['WebKit',webkit]]){
  const browser=await browserType.launch({headless:true});
  try{
   for(const width of [320,375,390,430]){
    const context=await browser.newContext({viewport:{width,height:812},colorScheme:width===390?'dark':'light',reducedMotion:width===430?'reduce':'no-preference'});
    const page=await context.newPage();
    const external=[],errors=[];
    page.on('request',request=>{if(new URL(request.url()).hostname!=='127.0.0.1')external.push(request.url());});
    page.on('pageerror',error=>errors.push(error.message));
    try{
     const response=await page.goto(url,{waitUntil:'load'});
     assert.equal(response.status(),200);
     await page.locator('button.result-card').first().waitFor();
     assert.equal(await page.locator('#brand option').count(),6);
     assert.equal(await page.locator('#profile').isVisible(),false);
     assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Horizontal overflow at '+width);
     await page.selectOption('#brand','Samsung');
     await page.locator('#code').fill('VS20C95D4TK/WD');
     await page.getByRole('button',{name:/Kennung vergleichen/}).click();
     assert.match(await page.locator('#resultStatus').textContent(),/1 Katalogeinträge sichtbar/);
     assert.match(await page.locator('.result-evidence').first().textContent(),/Katalogreferenz gefunden/);
     await page.locator('button.result-card').first().click();
     assert.equal(await page.locator('#profile').isVisible(),true);
     assert.match(await page.locator('#profileContent').textContent(),/0 bestätigte reale Teile/);
     assert.equal(await page.locator('a.source-link').count(),1);
     const link=page.locator('a.source-link');
     assert.equal(await link.getAttribute('rel'),'noopener noreferrer');
     await page.locator('#code').fill('VS20C95D4TK/WA');
     assert.match(await page.locator('#resultStatus').textContent(),/0 Katalogeinträge sichtbar/);
     assert.equal(await page.locator('#profile').isVisible(),false);
     await page.locator('#code').fill('VS20C95D4TK');
     assert.match(await page.locator('.result-evidence').first().textContent(),/Teilkennung gefunden/);
     await page.locator('#code').focus();
     await page.keyboard.press('Tab');
     assert.equal(await page.evaluate(()=>document.activeElement?.classList.contains('primary')),true);
     await page.locator('#reset').click();
     assert.equal(await page.locator('#code').inputValue(),'');
     assert.equal(await page.locator('#brand').inputValue(),'all');
     assert.deepEqual(external,[]);
     assert.deepEqual(errors,[]);
     passed++;
     console.log('PASS '+name+' '+width+'px: code/suffix rejection, focused keyboard, profile, CSP/network, no overflow');
    }finally{await context.close();}
   }
  }finally{await browser.close();}
 }
 assert.equal(passed,8);
 console.log('Browser cases: '+passed+'/8 successful (4 viewports × Chromium/WebKit); 0 skipped');
}finally{await new Promise(resolve=>server.close(resolve));}
