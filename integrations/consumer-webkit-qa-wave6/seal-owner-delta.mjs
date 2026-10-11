// Explicit sealing step for #81 only; CI verifies and never rewrites this record.
import {readFileSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {BASE_COMMIT,BRANCH,OWNER_DELTA_PATHS} from './policy.mjs';
import {repo,here,git,validateOwnerDelta} from './scope.mjs';
assert.equal(git('branch','--show-current'),BRANCH);
assert.ok(process.argv.includes('--write'),'Use --write explicitly; CI must only verify');
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const files=OWNER_DELTA_PATHS.map(file=>({path:file,
 beforeSha256:sha(execFileSync('git',['show',BASE_COMMIT+':'+file],{cwd:repo})),
 afterSha256:sha(readFileSync(path.join(repo,file)))
})).filter(f=>f.beforeSha256!==f.afterSha256);
const lock=validateOwnerDelta({schema:'uf.owner-authorized-consumer-delta/1',issue:81,
 authorization:'https://github.com/Straikerabi/-universal-fitment/issues/81',baseCommit:BASE_COMMIT,files});
writeFileSync(path.join(here,'owner-authorized-delta.json'),JSON.stringify(lock,null,2)+'\n');
console.log(JSON.stringify(lock));
