// Fail-closed, read-only release evidence gate. No legal approvals are inferred.
export const REQUIRED = Object.freeze([
  ['P0','operator'],['P0','privacy'],['P0','sourceRights'],['P0','assetRights'],
  ['P0','hosting'],['P0','safety'],['P0','sourceLock'],
  ['P1','browser'],['P1','hardware'],['P1','security'],
  ['P2','b2cPilot'],['P2','b2bPilot']
]);
const isRecord = x => x !== null && typeof x === 'object' && !Array.isArray(x);
export function evaluate(evidence) {
  const entries = isRecord(evidence) ? evidence : {};
  const gates = REQUIRED.map(([priority,id]) => {
    const e = entries[id];
    const hasProof = isRecord(e) && typeof e.commit === 'string' && /^[a-f0-9]{40}$/.test(e.commit)
      && typeof e.evidence === 'string' && e.evidence.trim().length > 0
      && typeof e.reviewer === 'string' && e.reviewer.trim().length > 0
      && typeof e.reviewDate === 'string' && /^\\d{4}-\\d{2}-\\d{2}$/.test(e.reviewDate)
      && typeof e.command === 'string' && e.command.trim().length > 0
      && typeof e.runUrl === 'string' && /^https:\/\//.test(e.runUrl)
      && Number.isSafeInteger(e.passed) && Number.isSafeInteger(e.total)
      && e.total > 0 && e.passed === e.total;
    const status = hasProof && e.status === 'pass' ? 'pass' :
      (isRecord(e) && e.status === 'fail' ? 'fail' : 'blocked');
    return {id,priority,status};
  });
  const counts = Object.fromEntries(['P0','P1','P2'].map(p => [p,{
    total:gates.filter(g=>g.priority===p).length,
    passed:gates.filter(g=>g.priority===p && g.status==='pass').length
  }]));
  // No automated launch approval. Human and legal review remain mandatory.
  return {launchApproved:false,releaseStatus:'BLOCKED',counts,gates};
}
export function cli(argv, output=console.log) {
  if (argv.length) throw new Error('No launch approval or input override supported');
  output(JSON.stringify(evaluate({}),null,2));
  return 2;
}
if (process.argv[1] && import.meta.url === new URL('file://' + process.argv[1]).href) {
  try { process.exitCode = cli(process.argv.slice(2)); }
  catch (e) { console.error(e.message); process.exitCode = 2; }
}
