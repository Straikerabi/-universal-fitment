import {readFileSync} from 'node:fs';
import {summarize} from './policy.mjs';
try{
 const report=JSON.parse(readFileSync(process.argv[2]||new URL('./artifacts/latest/results.json',import.meta.url),'utf8'));
 const gate=summarize(report);console.log(JSON.stringify(gate,null,2));
 process.exitCode=gate.automatedGatePassed?0:1;
}catch(error){console.error('FAIL-CLOSED: missing, unreadable or invalid report: '+error.message);process.exitCode=1;}
