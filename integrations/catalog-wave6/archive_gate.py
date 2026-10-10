"""Issue #74 read-only preflight. Missing original responses STOP projection.

No network calls, snapshot writes, importer bypasses or compatibility decisions.
"""
import argparse
import base64
import hashlib
import io
import json
import os
import subprocess
import zipfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parent.parent
PINS = {
    'integrations/source-checkpoint.json': 'f1eb796a11ec6e98e5e41a44337c198c46158253b74b64c33b99c85c9c9b6a22',
    'integrations/model-gap-wave3-research.json': '85d6f95c191d295e5fbe49bb7a777e3a061d509f342298653ae02963596d4a5c',
    'integrations/parts-fitment-wave3-evidence.json': '9b610d64d2edcf1485c7e05ca5295db79253995a799e5218ee37c5ef4858d1d3',
    'integrations/parts-fitment-wave3-source-audit.json': 'c6086b848be8e166263c5b57044e7daa8f19d876aeaa9a959cf212c4ec997af5',
    'integrations/consumer-repair-mission-poc/catalog-snapshot.mjs': '4b0f6fc17d22b0bc6f320b02eee5fdb39bb23d0083fadb3135e4bed38d3de9ae',
    'integrations/consumer-repair-mission-poc/catalog-lock.json': '71a7566cddcdc8fcef7f58346ec2f666a94594d674917f9b678d5d6e9ac5d423',
    'integrations/consumer-repair-mission-poc/offline-config.mjs': '1a39eb338762ccb32821b6233127192f0d8ef508b7fae3ebe128afb2f47a3fa2',
    'integrations/consumer-repair-mission-poc/app.mjs': 'c6875789809ffa4914a4ec2a0fc6f4dc9cb2b116f1f9e986a22e5003f7c01822',
    'integrations/fitment-engine-v1-poc/contract.mjs': 'f609d8c4a2d894632b46db76c28e83d581190dcfed0484a3aab3f12efb36e7b3',
}
CHAIN = {
    'ownerBase': '456c8b8936617f5275d8d1ccfc29601d559cac89',
    'checkpointBase': '71f7826ba936a1f3830c8b2a67e8085a9cfe234e',
    'checkpointSha256': 'c600a5c5a83a6f096ff5999e5ce5582c37ec424155919d487dfd6ca2221bd42b',
    'modelWorker': 'da0dcae52c2a0abc2fcd90df7636289a890f5e04',
    'partsWorker': '443489b39f57be28239dd2f1cafd637329eb0d4e',
    'mediaWorker': '2526e243eaf8425b91c8373ef4e5513ff4994a80',
}


def digest(data):
    return hashlib.sha256(data).hexdigest()


def checked_inputs(repo=REPO):
    for name, expected in PINS.items():
        path = repo / name
        if path.is_symlink() or digest(path.read_bytes()) != expected:
            raise ValueError('Owner input changed; explicit review required: ' + name)
    return {name: json.loads((repo / name).read_text()) for name in PINS if name.endswith('.json')}


def verify_checkpoint(repo, metadata):
    data = base64.b64decode(''.join((repo / metadata['segment_dir'] / f'part-{i:03d}').read_text()
                                  for i in range(metadata['segments'])), validate=True)
    if digest(data) != CHAIN['checkpointSha256']:
        raise ValueError('Original checkpoint archive changed')
    with zipfile.ZipFile(io.BytesIO(data)) as archive:
        entries = archive.infolist()
        if len(entries) != 136 or len({e.filename for e in entries}) != len(entries):
            raise ValueError('Unexpected or duplicate checkpoint entries')
        for entry in entries:
            path = Path(entry.filename)
            if path.is_absolute() or '..' in path.parts:
                raise ValueError('Unsafe checkpoint path')
            archive.read(entry.filename)  # Verify every ZIP CRC, without restoration.
    return {'archiveSha256': digest(data), 'fileCount': len(entries), 'verified': True}


def requirements(inputs):
    models = inputs['integrations/model-gap-wave3-research.json']
    parts = inputs['integrations/parts-fitment-wave3-evidence.json']
    audit = inputs['integrations/parts-fitment-wave3-source-audit.json']
    result = []
    for s in models['sources']:
        result.append({'group': 'model', 'id': s['id'], 'url': s['url'], 'sha256': s['responseSha256'],
                       'bytes': s['responseBytes'], 'market': s['market'], 'checkedAt': s['checkedAt'],
                       'usageRights': 'unknown; no original document/artwork redistribution'})
    for s in parts['sources']:
        result.append({'group': 'parts', 'id': s['id'], 'url': s['url'], 'sha256': s['bodySha256'],
                       'bytes': None, 'market': s.get('market', 'unreported'), 'checkedAt': s['checkedAt'],
                       'usageRights': 'unknown; no original document/artwork redistribution'})
    for s in audit['authorityChains']:
        if 'bodySha256' in s:
            result.append({'group': 'authority', 'id': 'hoover-manufacturer-service-entry',
                           'url': s['manufacturerEntryUrl'], 'sha256': s['bodySha256'], 'bytes': None,
                           'market': s['market'], 'checkedAt': s['checkedAt'],
                           'usageRights': 'unknown; manufacturer-linked service is not brand-owned'})
    if len({(r['group'], r['id']) for r in result}) != len(result):
        raise ValueError('Duplicate archive requirement IDs')
    return result


def inventory(cache_roots, required):
    """Accept only original bytes. Names, receipts, excerpts and new HTML do not suffice."""
    wanted = {r['sha256'] for r in required}
    found = set()
    for root in cache_roots:
        root = Path(root)
        if root.is_symlink() or not root.is_dir():
            raise ValueError('Cache root must be an existing real directory')
        for folder, dirs, files in os.walk(root, followlinks=False):
            dirs[:] = sorted(d for d in dirs if d not in {'.git', 'node_modules', '__pycache__'}
                             and not (Path(folder) / d).is_symlink())
            for name in sorted(files):
                file = Path(folder) / name
                if file.is_symlink() or not file.is_file():
                    continue
                sha = digest(file.read_bytes())
                if sha in wanted:
                    for requirement in required:
                        if requirement['sha256'] == sha and requirement['bytes'] is not None:
                            if file.stat().st_size != requirement['bytes']:
                                raise ValueError('Pinned source length mismatch')
                    found.add(sha)
    # Report deliberately contains no local personal paths or copied response bodies.
    return [{**r, 'originalResponse': 'present_hash_verified' if r['sha256'] in found else 'missing'}
            for r in required]


def import_gate(responses):
    if not responses or len({(r['group'], r['id']) for r in responses}) != len(responses):
        raise ValueError('Empty/duplicate archive audit cannot authorize projection')
    missing = [r for r in responses if r['originalResponse'] != 'present_hash_verified']
    if missing:
        raise ValueError(f'IMPORT STOPPED: {len(missing)} original pinned responses unavailable')
    # This preflight has no projector. Complete archives need content replay on each
    # protected worker, deterministic composition and source-tree review NEXT.
    return {'archivesComplete': True, 'projectionAuthorized': False,
            'nextGate': 'Replay original worker extractors and protected composition'}


def pilot_measurement(repo):
    consumer = repo / 'integrations/consumer-repair-mission-poc'
    script = """import {catalogSnapshot as s} from './catalog-snapshot.mjs';
import {catalogFingerprint,cacheName} from './offline-config.mjs';
console.log(JSON.stringify({snapshotVersion:s.version,checkpointSha256:s.checkpointSha256,
models:s.devices.length,physicalArticleIdentities:s.parts.length,wave3Integrated:s.wave3Integrated,
deviceIds:s.devices.map(x=>x.id),articleIds:s.parts.map(x=>x.id),catalogFingerprint,cacheName}));"""
    result = json.loads(subprocess.check_output(['node', '--input-type=module', '-e', script], cwd=consumer, text=True))
    for field in ('deviceIds', 'articleIds'):
        if len(result[field]) != len(set(result[field])):
            raise ValueError('Duplicate existing Consumer identities')
    return result


def report(cache_roots, repo=REPO):
    inputs = checked_inputs(repo)
    checkpoint = verify_checkpoint(repo, inputs['integrations/source-checkpoint.json'])
    responses = inventory(cache_roots, requirements(inputs))
    missing = [r for r in responses if r['originalResponse'] == 'missing']
    pilot = pilot_measurement(repo)
    evidence = inputs['integrations/parts-fitment-wave3-evidence.json']
    wave4 = json.loads((repo / 'integrations/verified-repair-cases-wave4/cases.json').read_text())
    return {
        'schema': 'uf-wave6-catalog-archive-preflight/1', 'checkedAt': '2026-10-10',
        'sourceChain': CHAIN, 'inputSha256': PINS, 'originalCheckpoint': checkpoint,
        'state': 'blocked_missing_original_responses' if missing else 'archives_present_replay_still_required',
        'projectionAuthorized': False, 'consumerSnapshotMigrated': False,
        'compositionExecuted': False, 'combinedCatalogMeasured': None,
        'historicalOwnerCiCountsNotRemeasuredHere': {'modelRows': 1115, 'catalogArticles': 1961, 'physicalParts': 1843},
        'measured': {
            'originalResponsesRequired': len(responses),
            'originalResponsesPresent': len(responses) - len(missing),
            'originalResponsesMissing': len(missing),
            'modelResponsesPresent': sum(r['group'] == 'model' and r['originalResponse'] != 'missing' for r in responses),
            'partsResponsesMissing': sum(r['group'] == 'parts' and r['originalResponse'] == 'missing' for r in responses),
            'authorityResponsesMissing': sum(r['group'] == 'authority' and r['originalResponse'] == 'missing' for r in responses),
            'actualConsumerModels': pilot['models'], 'actualConsumerArticleIdentities': pilot['physicalArticleIdentities'],
            'projectedNewDevices': 0, 'projectedNewArticles': 0,
            'historicalConditionalEdgesInEvidence': len(evidence['fitments']),
            'wave4ManufacturerListingsInEvidence': sum(len(c['edges']) for c in wave4['cases']),
            'newRealInstallationApprovals': 0,
        },
        'unchangedConsumer': pilot, 'archiveRequirements': responses,
        'nextSteps': ['Provide original byte-identical response archives, including Hoover authority entry',
                      'Replay reviewed manufacturer identity/content extractors; hashes alone are not fitment',
                      'Compose only original pinned Worker outputs without bypassing branch guards',
                      'Project unique physical identities, version snapshot/lock/offline fingerprint and test stale missions',
                      'Owner wires read-only CI for the Wave5-target Draft PR; no workflow edits in Work A scope'],
    }


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--cache-root', action='append', required=True, type=Path)
    parser.add_argument('--check-report', type=Path)
    parser.add_argument('--require-complete', action='store_true')
    args = parser.parse_args()
    result = report(args.cache_root)
    if args.check_report:
        if json.loads(args.check_report.read_text()) != result:
            raise SystemExit('Archive availability/report changed: explicit review required')
    else:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    if args.require_complete:
        import_gate(result['archiveRequirements'])
