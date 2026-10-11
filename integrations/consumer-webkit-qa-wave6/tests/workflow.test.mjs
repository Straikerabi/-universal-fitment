import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const workflow=readFileSync(new URL('../../../.github/workflows/consumer-webkit-qa-wave6.yml',import.meta.url),'utf8');
test('workflow is read-only PR QA on the correct owner target, with immutable action refs',()=>{
 assert.match(workflow,/pull_request:\n\s+branches: \[integration\/private-unified-preview-wave5-owner\]/);
 assert.match(workflow,/permissions:\n\s+contents: read/);assert.match(workflow,/persist-credentials: false/);
 const actions=[...workflow.matchAll(/uses: (actions\/[a-z-]+)@([a-f0-9]{40})/g)];assert.equal(actions.length,3);
 assert.doesNotMatch(workflow,/pull_request_target|secrets\.|contents: write|id-token: write|git push|continue-on-error/);
});
test('both browsers, the complete runner and fail-closed gate are mandatory; failed artifacts are retained',()=>{
 assert.match(workflow,/install --with-deps chromium webkit/);assert.match(workflow,/npm ci --ignore-scripts/);
 assert.match(workflow,/npm run test:browser --prefix integrations\/consumer-webkit-qa-wave6/);
 assert.match(workflow,/npm run gate --prefix integrations\/consumer-webkit-qa-wave6/);
 assert.match(workflow,/if-no-files-found: error/);assert.match(workflow,/steps.scope.outcome == 'success'/);
 assert.doesNotMatch(workflow,/UF_QA_CASE|UF_QA_ENGINES|UF_CHROMIUM_EXECUTABLE|UF_WEBKIT_EXECUTABLE/);
});
