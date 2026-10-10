import {execFileSync} from 'node:child_process';
import {readdirSync,readFileSync} from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {here,scopeProof} from './scope.mjs';
import {PLAYWRIGHT_VERSION} from './policy.mjs';
function walk(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(e=>
 e.name==='node_modules'||e.name==='artifacts'||e.name==='evidence'?[]:
 e.isDirectory()?walk(path.join(dir,e.name)):e.name.endsWith('.mjs')?[path.join(dir,e.name)]:[]);}
for(const file of walk(here))execFileSync(process.execPath,['--check',file]);
const pkg=JSON.parse(readFileSync(path.join(here,'package.json'),'utf8'));
assert.equal(pkg.devDependencies.playwright,PLAYWRIGHT_VERSION);
console.log(JSON.stringify({syntax:'passed',scope:scopeProof()}));
