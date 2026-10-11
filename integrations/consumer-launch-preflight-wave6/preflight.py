"""Offline evidence inventory, NOT a legal approval or deployment tool (issue #76)."""
import argparse
import base64
import hashlib
import io
import json
from pathlib import Path, PurePosixPath
import re
import stat
import sys
import zipfile

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
ARCHIVE_SHA = 'c600a5c5a83a6f096ff5999e5ce5582c37ec424155919d487dfd6ca2221bd42b'
BASE = '456c8b8936617f5275d8d1ccfc29601d559cac89'
MODES = ('free-readonly', 'affiliate', 'b2b-saas')
CONSUMER = 'integrations/consumer-repair-mission-poc/'
PATTERNS = {
    'legal_link_candidates': r'<a\b[^>]*href\s*=\s*["\'][^"\']*(?:impressum|datenschutz|privacy|legal)[^"\']*["\']',
    'legal_draft_notice': r'Pre-Launch|finale Rechtstexte',
    'storage_access': r'localStorage|sessionStorage|indexedDB|readLocal\(|writeLocal\(',
    'storage_keys': r'["\'](?:uf[:_-]|sb-)[^"\'\n]{1,90}["\']',
    'service_worker': r'serviceWorker\.register|caches\.(?:open|delete)|cache\.addAll',
    'local_erase': r'resetDemoStorage|removeItem|removeLocal|unregister\(',
    'password_login': r'auth\.signInWithPassword\(',
    'logout': r'auth\.signOut\(',
    'account_delete_candidates': r'auth\.admin\.deleteUser\(|delete-account|deleteAccount\(',
    'oauth_calls': r'(?:auth\.)?signInWithOAuth\(',
    'network_calls': r'\bfetch(?:Impl)?\(',
    'image_references': r'["\']imageUrl["\']\s*:|\bimageUrl\s*:',
    'price_labels': r'Quellenpreis|Erfasster Preis|aktuellen.*Shoppreis|priceSortAvailable:false',
    'affiliate_candidates': r'[?&](?:tag|campid|customid|affiliate)=[^\s"\']+',
}


def digest(data):
    return hashlib.sha256(data).hexdigest()


def safe_read(root, relative):
    """Reject traversal and symlinks; never echo file contents or input values."""
    rel = PurePosixPath(relative)
    if rel.is_absolute() or '..' in rel.parts or '\\' in relative:
        raise ValueError('unsafe path')
    path = root / relative
    if any(p.is_symlink() for p in [path, *path.parents] if p != root.parent):
        raise ValueError('symlink')
    if not path.resolve().is_relative_to(root.resolve()) or path.stat().st_size > 12_000_000:
        raise ValueError('unsafe file')
    return path.read_bytes()


def checkpoint(root):
    meta = json.loads(safe_read(root, 'integrations/source-checkpoint.json'))
    if (meta.get('archive_sha256'), meta.get('version'), meta.get('segments')) != (ARCHIVE_SHA, '1.29.0', 99):
        raise ValueError('checkpoint identity')
    encoded = b''.join(safe_read(root, f"{meta['segment_dir']}/part-{i:03d}") for i in range(99))
    payload = base64.b64decode(encoded, validate=True)
    if len(payload) != 737921 or digest(payload) != ARCHIVE_SHA:
        raise ValueError('checkpoint checksum')
    result = {}
    with zipfile.ZipFile(io.BytesIO(payload)) as archive:
        entries = archive.infolist()
        if len(entries) != 136 or sum(e.file_size for e in entries) > 30_000_000:
            raise ValueError('archive bounds')
        for entry in entries:
            path = PurePosixPath(entry.filename)
            if path.is_absolute() or '..' in path.parts or '\\' in entry.filename or stat.S_ISLNK(entry.external_attr >> 16) or entry.filename in result:
                raise ValueError('archive entry')
            result[entry.filename] = archive.read(entry)
    return result


def sources(root):
    groups, errors = {}, []
    try:
        groups['checkpoint'] = checkpoint(root)
    except (OSError, ValueError, KeyError, zipfile.BadZipFile):
        groups['checkpoint'] = {}
        errors.append('checkpoint unavailable or identity invalid')
    try:
        paths = sorted(p for p in (root / CONSUMER).iterdir() if p.suffix in ('.mjs', '.html', '.css', '.json', '.svg', '.webmanifest'))
        required = {'index.html', 'app.mjs', 'mission-state.mjs', 'offline-worker.mjs', 'offline-config.mjs', 'catalog-snapshot.mjs'}
        if not required.issubset({p.name for p in paths}):
            raise ValueError('consumer source incomplete')
        groups['consumer'] = {str(p.relative_to(root)): safe_read(root, str(p.relative_to(root))) for p in paths}
        for relative in ('integrations/dual-platform-owner-review/bridge.mjs', 'integrations/dual-platform-owner-review/ui-fixtures.mjs', 'integrations/fitment-engine-v1-poc/contract.mjs', 'integrations/fitment-engine-v1-poc/fixtures.mjs', 'integrations/business-embed-poc/adapter.mjs'):
            groups['consumer'][relative] = safe_read(root, relative)
    except (OSError, ValueError):
        groups['consumer'] = {}
        errors.append('consumer unavailable or incomplete')
    return groups, errors


def inventory(groups):
    result = {}
    for group, files in groups.items():
        observations = {key: [] for key in PATTERNS}
        hashes = {name: digest(data) for name, data in sorted(files.items())}
        for name, data in sorted(files.items()):
            if not name.endswith(('.js', '.mjs', '.html')) or '/vendor/' in name or name.startswith('tests/') or Path(name).name in ('prepare-offline.mjs', 'build-catalog.mjs', 'wave3-readiness-audit.mjs', 'check.mjs', 'serve.mjs'):
                continue
            text = data.decode('utf-8', errors='replace')
            for key, pattern in PATTERNS.items():
                for line, value in enumerate(text.splitlines(), 1):
                    count = len(re.findall(pattern, value, re.I))
                    if count:
                        observations[key].append({'file': name, 'line': line, 'count': count})
        result[group] = {'files': hashes, 'observations': observations}
    return result


def evaluate(inv, errors, mode='free-readonly', receipts=None, lock=None):
    if mode not in MODES:
        raise ValueError('unsupported mode')
    checks = []
    def add(id, priority, status, owner, reason, applicable=True):
        checks.append(dict(id=id, priority=priority, status=status, owner=owner, reason=reason, applicable=applicable))
    complete = not errors and all(inv.get(g, {}).get('files') for g in ('checkpoint', 'consumer'))
    add('source-access', 'P0', 'PASS' if complete else 'UNKNOWN', 'Engineering', 'Both actual source sets inspected' if complete else 'Source access incomplete; absence cannot be inferred')
    matches = complete and isinstance(lock, dict) and all(inv[g]['files'] == lock.get(g, {}) for g in ('checkpoint', 'consumer'))
    add('source-identity', 'P0', 'PASS' if matches else 'UNKNOWN', 'Engineering', 'Pinned source hashes match' if matches else 'Missing lock or source drift: refresh review, never silently adopt')
    for group in ('checkpoint', 'consumer'):
        observations = inv.get(group, {}).get('observations', {})
        available = bool(inv.get(group, {}).get('files'))
        add(f'{group}-legal-navigation', 'P0', 'UNKNOWN' if not available or observations.get('legal_link_candidates') else 'BLOCKED', 'Consumer owner', 'No legal link candidates in inspected source' if available and not observations.get('legal_link_candidates') else 'Candidate links need route/mobile/offline accessibility and real-text review')
    manual = [
        ('operator', 'P0', 'Owner + legal reviewer', 'No independently verified operator/imprint facts'),
        ('privacy', 'P0', 'Privacy reviewer', 'Real controller, data flows, Art. 13 notice and processor review missing'),
        ('rights', 'P0', 'Content rights owner', 'Per-published-asset/database/mark use scope not accepted; public URLs are not licenses'),
        ('hosting', 'P0', 'Hosting owner', 'Commercial package/domain/DPA/retention suitability not accepted; Pages is not a default launch choice'),
        ('storage-consent', 'P0', 'Privacy + consumer owner', 'Per-purpose TDDDG necessity/consent and deletion review missing'),
        ('erasure-auth', 'P0', 'Privacy + auth owner', 'Local reset/logout is not account or server erasure; runtime verification unavailable'),
        ('business-tax', 'P0', 'Owner + tax adviser', 'Case-specific activity/start date/registration/tax decision missing'),
        ('migration-runtime', 'P0', 'Engineering + hosting owner', 'Target-origin/mobile/PWA/log/redirect tests not performed'),
        ('affiliate-disclosure', 'P1', 'Affiliate owner', 'Partner acceptance, labels, ranking, tracking and rights review missing'),
        ('offer-prices', 'P1', 'Commerce owner', 'Live offer provenance, freshness, total-price and availability review missing'),
        ('b2b-contract-security', 'P0', 'B2B + security + privacy owners', 'Tenant isolation, identity, DPA/API terms/security need separate acceptance'),
        ('fitment-safety', 'P1', 'Fitment owner', 'Evidence/variant warnings and safety presentation require manual acceptance; no new engine'),
        ('accessibility', 'P2', 'Consumer owner', 'BFSG applicability and physical iPhone/assistive-technology testing pending'),
        ('consumer-contracts', 'P2', 'Legal reviewer', 'VSBG/consumer-contract duties require case-specific decision; own checkout out of scope'),
        ('oss-marks', 'P2', 'Content + engineering owners', 'OSS notices and descriptive trademark use need review; no partnership/registered-right claim'),
    ]
    # Narrow receipt protocol: ONLY opaque digest references, no legal texts or PII.
    receipts = {} if receipts is None else receipts
    valid = isinstance(receipts, dict) and set(receipts).issubset({r[0] for r in manual}) and all(isinstance(v, str) and re.fullmatch(r'[a-f0-9]{64}', v) and len(set(v)) > 8 for v in receipts.values())
    add('receipt-schema', 'P0', 'PASS' if valid else 'BLOCKED', 'Owner', 'Opaque references only; their contents/authenticity are NOT verified' if valid else 'Rejected unknown fields or invalid references (values redacted)')
    for id, priority, owner, reason in manual:
        applicable = not ((id in ('affiliate-disclosure', 'offer-prices') and mode != 'affiliate') or (id == 'b2b-contract-security' and mode != 'b2b-saas'))
        status = ('UNKNOWN' if valid and id in receipts else 'BLOCKED') if applicable else 'PASS'
        add(id, priority, status, owner, reason if applicable else f'Outside selected {mode} scope; NOT accepted for activation', applicable)
    add('human-release', 'P0', 'BLOCKED', 'Owner + legal reviewer', 'This suite has no release authority; a separate human decision is always required')
    blocking = [c['id'] for c in checks if c['applicable'] and c['status'] != 'PASS']
    return {'schemaVersion': 1, 'reviewedBase': BASE, 'mode': mode, 'overall': 'BLOCKED', 'launchApproved': False, 'commercialApproved': False, 'blockingChecks': blocking, 'checks': checks, 'sources': inv, 'limitations': ['Static candidates, not complete AST/runtime/legal analysis', 'No network, production auth, real personal data or deployment', 'Receipt hashes cannot prove authenticity; manual gates never become PASS']}


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=ROOT)
    parser.add_argument('--mode', choices=MODES, default='free-readonly')
    parser.add_argument('--receipts', type=Path, help='Optional local JSON of opaque SHA256 references only; never legal texts/PII')
    parser.add_argument('--json', action='store_true')
    args = parser.parse_args(argv)
    try:
        groups, errors = sources(args.root.resolve())
        lock = json.loads((HERE / 'source-lock.json').read_text())
        if args.receipts and args.receipts.stat().st_size > 65536:
            raise ValueError('receipt size')
        receipts = json.loads(args.receipts.read_text()) if args.receipts else {}
        report = evaluate(inventory(groups), errors, args.mode, receipts, lock)
    except (OSError, ValueError, TypeError, KeyError):
        print(json.dumps({'overall': 'BLOCKED', 'launchApproved': False, 'commercialApproved': False, 'error': 'Invalid or inaccessible input; values redacted'}))
        return 2
    if args.json:
        print(json.dumps(report, indent=2, sort_keys=True))
    else:
        print(f"{report['mode']}: BLOCKED — no automatic legal/commercial approval")
        for check in report['checks']:
            print(f"{check['priority']} {check['status']:7} {check['id']} — {check['owner']}: {check['reason']}")
    return 2  # Deliberate hard stop, even if every receipt has been supplied.


if __name__ == '__main__':
    sys.exit(main())
