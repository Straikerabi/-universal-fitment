"""Read-only recheck of the manufacturer evidence; never edits catalog/evidence files."""
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from hashlib import sha256
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse
import argparse
import json
import subprocess


class ServiceMetadata(HTMLParser):
    def __init__(self):
        super().__init__()
        self.field = None
        self.fields = {}

    def handle_starttag(self, tag, attrs):
        if tag == 'li':
            self.field = dict(attrs).get('data-sdf-prop')

    def handle_endtag(self, tag):
        if tag == 'li':
            self.field = None

    def handle_data(self, value):
        if self.field in {'modelCode', 'modelName', 'subTypeIaCode'}:
            self.fields.setdefault(self.field, []).append(value.strip())


def check(source):
    url = urlparse(source['url'])
    if url.scheme != 'https' or url.netloc != 'www.samsung.com' or not url.path.startswith('/de/') or url.query or url.fragment:
        return {'id': source['id'], 'ok': False, 'error': 'Unexpected manufacturer URL'}
    result = subprocess.run(
        ['curl', '-sSL', '--max-time', '30', '--proto', '=https', '--proto-redir', '=https',
         '-w', '\n%{http_code}\n%{url_effective}', source['url']], capture_output=True)
    try:
        body, status, resolved = result.stdout.rsplit(b'\n', 2)
        status, resolved = int(status), resolved.decode('utf8')
    except (ValueError, UnicodeDecodeError):
        return {'id': source['id'], 'ok': False, 'error': result.stderr.decode('utf8', errors='replace').strip()}
    text = body.decode('utf8', errors='replace')
    parser = ServiceMetadata()
    parser.feed(text)
    ok = result.returncode == 0 and status == 200 and resolved == source['url']
    if source['kind'] == 'manufacturer_support':
        ok = ok and source['observedFullCode'] in parser.fields.get('modelCode', [])
        ok = ok and source['categoryCode'] in parser.fields.get('subTypeIaCode', [])
    else:
        ok = ok and all(ref in text for ref in source['equivalentReferences'])
        ok = ok and ('baugleich' in text or 'produktgleich' in text)
    return {'id': source['id'], 'url': source['url'], 'ok': bool(ok), 'httpStatus': status,
            'resolvedUrl': resolved, 'observedCodes': parser.fields.get('modelCode', []),
            'observedCategories': parser.fields.get('subTypeIaCode', []), 'responseSha256': sha256(body).hexdigest(),
            'error': result.stderr.decode('utf8', errors='replace').strip() if result.returncode else None}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--all', action='store_true', help='Also recheck deferred/existing candidates')
    parser.add_argument('--output', type=Path, help='Optional separate observation log (not the evidence file)')
    args = parser.parse_args()
    evidence_path = Path(__file__).with_name('samsung-model-research-next.json')
    if args.output and args.output.resolve() == evidence_path.resolve():
        parser.error('Do not overwrite the manually reviewed evidence')
    evidence = json.loads(evidence_path.read_text())
    selected = {sid for model in evidence['models'] for sid in model['referenceSources'].values()}
    selected |= {model['equivalenceSourceId'] for model in evidence['models'] if 'equivalenceSourceId' in model}
    sources = [source for source in evidence['sources'] if args.all or source['id'] in selected]
    with ThreadPoolExecutor(max_workers=4) as executor:
        observations = list(executor.map(check, sources))
    output = {'checkedAt': datetime.now(timezone.utc).isoformat(), 'sourceCount': len(observations),
              'passed': sum(row['ok'] for row in observations), 'observations': observations}
    if args.output:
        args.output.write_text(json.dumps(output, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({key: output[key] for key in ['checkedAt', 'sourceCount', 'passed']}))
    for row in observations:
        if not row['ok']:
            print(json.dumps(row, ensure_ascii=False))
    raise SystemExit(0 if output['passed'] == output['sourceCount'] else 1)


if __name__ == '__main__':
    main()
