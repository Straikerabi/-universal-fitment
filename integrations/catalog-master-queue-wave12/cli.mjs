// Wave12, writes only this directory; event files are input, never edited.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,renameSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {deriveMaster,deriveReport,markdownReport,nextWork,appendEvent} from './master.mjs';
const home=new URL('./',import.meta.url);
const file=name=>new URL(name,home);
const read=name=>JSON.parse(readFileSync(file(name),'utf8'));
const stable=(name,body)=>{
 const dest=fileURLToPath(file(name)),tmp=dest+'.wave12-tmp';
 writeFileSync(tmp,body,{flag:'w'});renameSync(tmp,dest);
};
export function current(){return {master:deriveMaster(),journal:read('queue-state.json'),evidence:read('evidence-state.json')}}
export function generated(master,journal,evidence){
 const r=deriveReport(master,journal,evidence);
 return {report:r,files:[['master.json',JSON.stringify(master,null,2)+'\n'],
  ['queue-report.json',JSON.stringify(r,null,2)+'\n'],['queue-report.md',markdownReport(r)]]};
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===path.resolve(process.argv[1])){
 const args=process.argv.slice(2),{master,journal,evidence}=current();
 const out=generated(master,journal,evidence);
 if(args[0]==='--check'){
  assert.equal(args.length,1);
  for(const [name,contents] of out.files)assert.equal(readFileSync(file(name),'utf8'),contents,'Stale or edited '+name);
  console.log(JSON.stringify({state:'PASS',version:master.taxonomyVersion,groups:master.groups.length,leaves:master.leafCount,
   planned:out.report.plannedCount,privatePilot:out.report.privatePilotIds,
   events:journal.events.length,top:out.report.nextSuggested.map(x=>x.categoryId),release:out.report.gates}));
 }else if(args[0]==='--next'){
  assert.ok(args.length<=2);console.log(JSON.stringify(nextWork(master,journal,evidence,args[1]?Number(args[1]):12),null,2));
 }else if(args[0]==='--append-event'){
  assert.equal(args.length,2,'Exactly one local event JSON file');
  const event=JSON.parse(readFileSync(args[1],'utf8'));
  const newJournal=appendEvent(journal,event,master,evidence);
  const next=generated(master,newJournal,evidence);
  // Any failure to validate must happen before a write. All outputs remain exclusively inside this module.
  for(const [name,text] of next.files)if(name!=='master.json')stable(name,text);
  stable('queue-state.json',JSON.stringify(newJournal,null,2)+'\n');
  console.log(JSON.stringify({state:'PASS',eventId:event.eventId,replay:newJournal.events.length===journal.events.length,
   next:next.report.nextSuggested.map(x=>x.categoryId)}));
 }else if(args[0]==='--write'){
  assert.equal(args.length,1);for(const [name,text] of out.files)stable(name,text);
  console.log('Master/queue artifacts regenerated; registry unchanged');
 }else if(args.length===0)console.log(JSON.stringify(out.report,null,2));
 else throw Error('Unknown action. Use --check, --next N, --append-event EVENT.json or --write');
}
