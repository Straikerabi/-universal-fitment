// Wave9 Marketing: offline/read-only; validating copy is NOT a legal or launch approval.
const CHANNELS = new Set(['instagram','tiktok','youtube','facebook','reddit','website','linkedin','document','press']);
const DOCS = new Set(['B2C-STARTPAKET.md','B2B-STARTPAKET.md','LANDING-PRESS.md']);
const FORMATS = new Set(['reel','carousel','short','tutorial','post','reply','article','onepager','interviewguide','landing','fact-sheet']);
const BANNED = [
  'garantiert passend','garantierte passung','jetzt herunterladen',
  'im app store verfügbar','offizieller partner','offizielle partner',
  '200 kategorien live','200 kategorien verfügbar','200 kategorien unterstützt',
  'millionen nutzer','millionen downloads'
];
export function validateManifest(m) {
  const errors = [];
  const fail = (code) => errors.push(code);
  if (!m || typeof m !== 'object' || Array.isArray(m)) return ['manifest.invalid'];
  const exact = {
    schemaVersion:1,project:'Universal Fitment',asOf:'2026-10-10',
    evidenceBranch:'integration/private-unified-preview-wave5-owner',
    referenceOwnerSha:'be7afa00ff2f69b9071d4d85da4c1f7c7e1a9b38',
    releaseState:'NO_GO',externalPublicationAuthorized:false,
    budgetSpentEUR:0,publicationActions:0,leadsCollected:0,
    confirmedPartners:0,publicUserClaims:0,currentConsumerDevices:11,
    currentBrands:5,verifiedRealFits:0,draftProposedDevicesSeparate:29,
    plannedInactiveLeafCategories:199,privatePilotLeafCategories:1
  };
  for (const [key,value] of Object.entries(exact)) if (m[key] !== value) fail('snapshot.'+key);
  if (!Array.isArray(m.assets) || m.assets.length < 12) {
    fail('assets.missing_or_too_few');
    return errors;
  }
  const ids = new Set(), audiences = new Set();
  for (const [i,a] of m.assets.entries()) {
    const where = 'assets['+i+']';
    if (!a || typeof a !== 'object' || Array.isArray(a)) { fail(where+'.invalid'); continue; }
    if (typeof a.id !== 'string' || !/^(B2C|B2B|WEB|PRESS)-[0-9]{2}$/.test(a.id)) fail(where+'.id');
    if (ids.has(a.id)) fail(where+'.duplicate_id');
    ids.add(a.id);
    if (!['b2c','b2b','press'].includes(a.audience)) fail(where+'.audience');
    else audiences.add(a.audience);
    if (!CHANNELS.has(a.channel)) fail(where+'.channel');
    if (!FORMATS.has(a.format)) fail(where+'.format');
    if (!DOCS.has(a.doc)) fail(where+'.doc');
    if (a.state !== 'draft_internal' || a.published !== false || a.ownerApproval !== false || a.legalApproval !== false) fail(where+'.release_gate');
    if (a.usesPersonalData !== false) fail(where+'.personal_data');
    if (a.safetyReview !== 'required') fail(where+'.safety_review');
    if (!['none','original_pending','owned_verified'].includes(a.mediaRights)) fail(where+'.media_rights');
    if (a.mediaUsed !== false) fail(where+'.media_use_not_authorized');
    for (const key of ['hook','copy','cta']) {
      const value=a[key];
      if (typeof value !== 'string' || value.trim().length < 8) {fail(where+'.'+key);continue;}
      const clean=value.normalize('NFKC').toLocaleLowerCase('de').replace(/\s+/g,' ');
      if (BANNED.some(term=>clean.includes(term))) fail(where+'.unsupported_claim.'+key);
      if (clean.includes('https://') || clean.includes('http://')) fail(where+'.outbound_link.'+key);
    }
    if (a.audience === 'b2b' && !['linkedin','document'].includes(a.channel)) fail(where+'.b2b_channel');
    if (a.audience === 'press' && a.channel !== 'press') fail(where+'.press_channel');
  }
  for (const audience of ['b2c','b2b','press']) if (!audiences.has(audience)) fail('audience_missing.'+audience);
  return errors;
}
