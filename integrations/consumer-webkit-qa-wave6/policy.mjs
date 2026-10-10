export const BASE_COMMIT='456c8b8936617f5275d8d1ccfc29601d559cac89';
export const BRANCH='work/wave6-consumer-webkit-qa';
export const TARGET='integration/private-unified-preview-wave5-owner';
export const PLAYWRIGHT_VERSION='1.62.1';
export const ENGINES=Object.freeze(['chromium','webkit']);
export const ROOT_PATH='integrations/consumer-webkit-qa-wave6/';
export const WORKFLOW='.github/workflows/consumer-webkit-qa-wave6.yml';
export const allowedPath=path=>path.startsWith(ROOT_PATH)||path===WORKFLOW;
export const VIEWPORTS=Object.freeze([
 {id:'320-portrait',width:320,height:740},{id:'320-landscape',width:740,height:320},
 {id:'375-portrait',width:375,height:812},{id:'375-landscape',width:812,height:375},
 {id:'390-portrait',width:390,height:844},{id:'390-landscape',width:844,height:390},
 {id:'430-portrait',width:430,height:932},{id:'430-landscape',width:932,height:430}
]);
export const WIDTHS=Object.freeze([320,375,390,430]);
export const FUNCTIONAL_CASES=Object.freeze([
 'real-passport','identity-boundaries','unknown-identifiers','demo-positive','demo-negative',
 'demo-unknown','demo-connector','demo-incomplete','mode-isolation','stale-and-tampered-state',
 'filters-and-checklist','keyboard-and-semantics','touch-targets','cold-offline',
 'warm-offline','blocked-offline','storage-and-export-failures'
]);
export const CASE_IDS=Object.freeze([
 ...VIEWPORTS.map(v=>'viewport-'+v.id),...WIDTHS.map(w=>'text-200-'+w),
 ...WIDTHS.map(w=>'dark-'+w),...FUNCTIONAL_CASES
]);

export function summarize(report){
 const problems=[];
 if(report?.schema!=='uf.consumer-browser-gate/1')problems.push('report-schema');
 if(report?.baseCommit!==BASE_COMMIT)problems.push('wrong-base');
 if(report?.playwrightVersion!==PLAYWRIGHT_VERSION)problems.push('unpinned-playwright');
 if(report?.scopeProof?.unchanged!==true||report?.scopeProof?.afterUnchanged!==true)problems.push('scope-not-proved');
 if(!Number.isInteger(report?.scopeProof?.protectedFiles)||report.scopeProof.protectedFiles<1||
    !/^[a-f0-9]{64}$/.test(report?.scopeProof?.protectedTreeEntriesSha256||'')||
    report?.scopeProof?.protectedTreeEntriesSha256!==report?.scopeProof?.afterProtectedTreeEntriesSha256)problems.push('scope-digest-missing-or-changed');
 if(report?.fatalError||report?.scopeError)problems.push('fatal-or-scope-error');
 if(!/^[a-f0-9]{64}$/.test(report?.suiteProof?.digest||'')||report?.suiteProof?.digest!==report?.suiteProof?.afterDigest)problems.push('suite-changed-or-unrecorded');
 const rows=Array.isArray(report?.cases)?report.cases:[];
 const required=ENGINES.flatMap(e=>CASE_IDS.map(id=>e+':'+id));
 const keys=rows.map(r=>r.engine+':'+r.id);
 if(keys.length!==required.length||new Set(keys).size!==keys.length||
    required.some(k=>!keys.includes(k))||keys.some(k=>!required.includes(k)))problems.push('incomplete-or-duplicate-matrix');
 for(const engine of ENGINES)if(report?.engines?.[engine]?.started!==true||
    typeof report?.engines?.[engine]?.version!=='string')problems.push('browser-not-started:'+engine);
 const counts={planned:required.length,passed:0,failed:0,blocked:0,notRun:0};
 for(const row of rows){
  if(row.status==='passed')counts.passed++;
  else if(row.status==='failed')counts.failed++;
  else if(row.status==='blocked')counts.blocked++;
  else counts.notRun++;
  if(row.automated!==true||row.realHumanTest!==false)problems.push('mislabelled-case:'+row.id);
  if(row.status==='passed'&&(!Number.isFinite(row.elapsedMs)||row.elapsedMs<0))problems.push('missing-measurement:'+row.id);
  if(!Array.isArray(row.externalRequests)||row.externalRequests.length)problems.push('external-network:'+row.id);
  if(!Array.isArray(row.runtimeErrors)||row.runtimeErrors.length)problems.push('runtime-error:'+row.id);
 }
 if(counts.passed!==required.length)problems.push('not-all-cases-passed');
 if(report?.physicalIPhone!==false||report?.macOSSafari!==false||report?.externalTestPeople!==0)problems.push('unsupported-hardware-or-human-claim');
 return {automatedGatePassed:problems.length===0,betaOrLaunchApproved:false,counts,problems:[...new Set(problems)]};
}
