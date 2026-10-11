import test from 'node:test';
import assert from 'node:assert/strict';
import {read,validate} from './validate.mjs';
const baseline=read();
const changed=fn=>{const d=structuredClone(baseline);fn(d);return d};
test('25 names and top five, private and blocked',()=>{
 assert.equal(baseline.candidates.length,25);
 assert.equal(baseline.candidates.filter(x=>x.shortlistRank!==null).length,5);
 assert.deepEqual(validate(baseline),[]);
});
const negatives=[
 ['rename',d=>d.currentBrandName='Nolvanta','meta.unauthorized'],
 ['release',d=>d.launchAllowed=true,'meta.unauthorized'],
 ['legal right',d=>d.legalClearance='approved','meta.unauthorized'],
 ['domain right',d=>d.domainRightToUseConfirmed=true,'meta.unauthorized'],
 ['short list too short',d=>d.candidates=d.candidates.slice(0,19),'candidates.count'],
 ['short list too long',d=>d.candidates=[...d.candidates,...d.candidates.slice(0,6)],'candidates.count'],
 ['duplicate name',d=>d.candidates[1].name=d.candidates[0].name,'BR-02.duplicate'],
 ['bad name',d=>d.candidates[0].name='A','BR-01.name'],
 ['lost origin',d=>d.candidates[0].origin='','BR-01.rationale'],
 ['lost english pronunciation',d=>d.candidates[0].pronunciation.en='','BR-01.rationale'],
 ['weights changed',d=>d.scoreWeights.distinctiveness=20,'meta.weights'],
 ['invalid rating',d=>d.candidates[0].score.distinctiveness=6,'BR-01.rating.distinctiveness'],
 ['fake total',d=>d.candidates[0].scoreTotal=1,'BR-01.weighted_total'],
 ['duplicate rank',d=>d.candidates[1].shortlistRank=1,'BR-02.rank'],
 ['no fifth rank',d=>d.candidates[4].shortlistRank=null,'shortlist.count'],
 ['rank scored wrong',d=>{d.candidates[0].shortlistRank=5;d.candidates[4].shortlistRank=1},'shortlist.score_order'],
 ['fake copyright',d=>d.candidates[0].legalStatus='cleared','BR-01.release_violation'],
 ['fake appstore',d=>d.candidates[0].appStoreStatus='free','BR-01.release_violation'],
 ['fake chosen brand',d=>d.candidates[0].brandChosen=true,'BR-01.release_violation'],
 ['false post',d=>d.candidates[0].published=true,'BR-01.release_violation'],
 ['free domain status invented',d=>d.candidates[0].domains.com.status='free','BR-01.domain_status.com'],
 ['fake registered without evidence',d=>d.candidates[5].domains.de.status='registered','BR-06.domain_missing_evidence.de'],
 ['unknown dated',d=>d.candidates[5].domains.com.checkedAt='2026-10-11T00:00:00Z','BR-06.domain_unknown.com'],
 ['fake 404 vs 200',d=>{const x=d.candidates[0].domains.de;x.status='not_registered_at_check';x.httpStatus=200;x.checkedAt='2026-10-11T00:00:00Z'},'BR-01.domain_wrong_code.de'],
 ['wrong registry URL',d=>d.candidates[0].domains.de.source='https://wrong.invalid/','BR-01.domain_url.de']
];
for(const [name,fn,code] of negatives)test('reject '+name,()=>assert.ok(validate(changed(fn)).includes(code),code));
