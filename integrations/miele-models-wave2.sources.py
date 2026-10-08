"""Verify pinned Miele PDFs and their explicit model-table columns (Poppler required)."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import argparse
import hashlib
import json
import os
import re
import subprocess
import tempfile
import urllib.request
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parent.parent
PINS = {
    'catalog-2011': ('https://www1.miele.de/ex/prospects/de/2011_10/9013391_Bodenpflege_FH/pdf/all.pdf', 'a0b22d802bd66cb2fa13b8bfd1b6747e7b155d149c108f2ae8f895503da55c25'),
    'catalog-2013': ('https://www1.miele.de/ex/prospects/de/2013_04/121700_MMS120308_Staubsaugen_April2012/pdf/all.pdf', 'b4160e666a0c26607950a76cd35088a58c05c0646e477c31ee4660b31a17a138'),
    'catalog-2012-oct': ('https://www1.miele.de/ex/prospects/de/2012_10/9013393_Bodenpflege/pdf/all.pdf', '1b28cfba25d44511d6b79f582cf09a3d4c9e5cd9588d2082d553c5385d75ba5f'),
}

def sha(data):
    return hashlib.sha256(data).hexdigest()

def verify(source, cache, offline):
    assert (source['url'], source['responseSha256']) == PINS[source['id']], 'Unreviewed source'
    filename = cache / (source['id'] + '.pdf')
    status = None
    if offline:
        payload = filename.read_bytes()
    else:
        request = urllib.request.Request(source['url'], headers={'User-Agent': 'Miele-Issue22-source-verification/1.0'})
        with urllib.request.urlopen(request, timeout=45) as response:
            status = response.status
            assert status == 200 and response.url == source['url'], 'Unexpected status or redirect'
            payload = response.read(32 * 1024 * 1024 + 1)
        assert len(payload) <= 32 * 1024 * 1024, 'Unexpectedly large source'
    assert payload.startswith(b'%PDF-'), 'Not a PDF'
    assert sha(payload) == source['responseSha256'], 'Manufacturer PDF bytes changed: ' + source['id']
    assert len(payload) == source['responseBytes'], 'Source size changed'
    if not offline:
        cache.mkdir(parents=True, exist_ok=True)
        with tempfile.NamedTemporaryFile(dir=cache, delete=False) as staged:
            staged.write(payload)
            temporary = Path(staged.name)
        try:
            os.replace(temporary, filename)
        finally:
            temporary.unlink(missing_ok=True)
    text = subprocess.run(['pdftotext', '-layout', str(filename), '-'], check=True, capture_output=True).stdout.decode('utf-8')
    pages = text.split('\f')
    assert len(pages) - 1 == source['pageCount'], 'PDF page count changed'
    tables = []
    for number, content in enumerate(pages, 1):
        rows = [row.strip() for row in content.splitlines() if 'Typ-/Verkaufsbezeichnung' in row]
        if rows:
            codes = sorted(set('S ' + code for row in rows for code in re.findall(r'\bS\s+([1-9]\d{2,3})\b', row)))
            tables.append({'pdfPage': number, 'tableLabel': 'Typ-/Verkaufsbezeichnung', 'observedCodes': codes, 'pageTextSha256': sha(content.encode('utf-8'))})
    assert tables == source['tables'], 'Model-table evidence differs from the PDF: ' + source['id']
    return {'sourceId': source['id'], 'url': source['url'], 'mode': 'offline-pinned-cache' if offline else 'live-download', 'httpStatus': status, 'bytes': len(payload), 'sha256': sha(payload), 'pageCount': len(pages) - 1, 'modelTablesVerified': len(tables)}

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--evidence', type=Path, default=ROOT / 'integrations/miele-model-research-wave2.json')
    parser.add_argument('--cache', type=Path, required=True)
    parser.add_argument('--offline', action='store_true')
    parser.add_argument('--report', type=Path)
    args = parser.parse_args()
    evidence = json.loads(args.evidence.read_text())
    assert {s['id'] for s in evidence['sources']} == set(PINS) and len(evidence['sources']) == 3
    with ThreadPoolExecutor(max_workers=3) as pool:
        results = list(pool.map(lambda source: verify(source, args.cache, args.offline), evidence['sources']))
    sources = {s['id']: s for s in evidence['sources']}
    accepted = [c for c in evidence['candidates'] if c['decision'] == 'accepted']
    for model in accepted:
        assert model['sources']
        assert any(r['sourceId'] == model['primarySourceId'] and r['pdfPage'] == model['primaryPdfPage'] for r in model['sources'])
        for ref in model['sources']:
            table = next(t for t in sources[ref['sourceId']]['tables'] if t['pdfPage'] == ref['pdfPage'])
            assert ref['observedCode'] == model['modelCode'] and model['modelCode'] in table['observedCodes']
    report = {'issue': 22, 'verifiedAt': datetime.now(timezone.utc).isoformat(), 'researchSha256': sha(args.evidence.read_bytes()), 'acceptedModelReferencesVerified': len(accepted), 'sources': results, 'popplerVersion': subprocess.run(['pdftotext', '-v'], capture_output=True, text=True, check=True).stderr.splitlines()[0]}
    if args.report:
        args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'verifiedSources': len(results), 'verifiedModels': len(accepted), 'mode': 'offline' if args.offline else 'live'}))

if __name__ == '__main__':
    main()
