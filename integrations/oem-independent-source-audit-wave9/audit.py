"""Read-only OEM byte/identity audit. No imports into catalog, engine or UI.

Standard-library parser, separate from the Wave7 importer. HTML is never
executed. Network retrieval is opt-in and writes only to an external cache.
"""
import argparse
import datetime as dt
import hashlib
import json
import re
import subprocess
import urllib.error
import urllib.request
import zipfile
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parent.parent
BRANCH = 'work/wave9-oem-independent-source-audit'
BASE = '3bafbc7fd8c8da5ed6fe3bddc70eacbc0be1e035'
ZIP_SHA = '187f6bde4c88691b9521bb0d5e5cdeab0a0093ead750b1eb235341752cee535e'
SOURCES_SHA = '61b31173fb6f620eb939120e818ef57aa9e976264b3cb7d27fee2cc75dbaa363'
HOSTS = {'Miele': 'www.miele.de', 'Bosch': 'www.bosch-home.com',
         'Siemens': 'www.siemens-home.bsh-group.com', 'Dyson': 'www.dyson.de',
         'AEG': 'shop.aeg.de', 'Samsung': 'www.samsung.com',
         'Vorwerk': 'www.vorwerk.com', 'Hoover': 'www.hoover-home.com'}
RIGHTS = {'factualUse': 'review_pending', 'pageRedistribution': 'not_granted',
          'mediaB2c': 'not_granted', 'commercialUse': 'not_granted'}
PRIORITIES = [
    {'id': 'miele-11602400', 'brand': 'Miele', 'reference': '11602400',
     'market': 'DE', 'fullExactIdentity': True,
     'url': 'https://www.miele.de/product/11602400/bodenstaubsauger-ohne-beutel-boost-cx1-parquet-powerline-lotosweiss'},
    {'id': 'bosch-bgl75x1prq', 'brand': 'Bosch', 'reference': 'BGL75X1PRQ',
     'market': 'DE', 'fullExactIdentity': False,
     'url': 'https://www.bosch-home.com/de/de/product/staubsauger/staubsauger-mit-beutel/BGL75X1PRQ'},
    {'id': 'hoover-39401035', 'brand': 'Hoover', 'reference': 'HF202P 011',
     'market': 'DE', 'fullExactIdentity': True,
     'url': 'https://www.hoover-home.com/de_DE/akkusauger/39401035/hf202p-011/'}]


def need(ok, message):
    if not ok:
        raise ValueError(message)


def digest(data):
    return hashlib.sha256(data).hexdigest()


def norm(value):
    return ' '.join(value.split())


class Element:
    def __init__(self, tag='root', attrs=(), path='/'):
        self.tag, self.attrs, self.path, self.children = tag, dict(attrs), path, []

    def walk(self):
        yield self
        for child in self.children:
            if isinstance(child, Element):
                yield from child.walk()

    def text(self):
        if self.tag in {'script', 'style'}:
            return ''
        return norm(' '.join(c.text() if isinstance(c, Element) else c for c in self.children))


class Page(HTMLParser):
    VOID = set('area base br col embed hr img input link meta param source track wbr'.split())

    def __init__(self, data):
        super().__init__(convert_charrefs=True)
        self.html = data.decode('utf-8', errors='strict')
        self.root = Element()
        self.stack = [self.root]
        self.feed(self.html)
        self.nodes = list(self.root.walk())

    def handle_starttag(self, tag, attrs):
        parent = self.stack[-1]
        ordinal = 1 + sum(isinstance(c, Element) and c.tag == tag for c in parent.children)
        node = Element(tag, attrs, parent.path.rstrip('/') + '/' + tag + '[' + str(ordinal) + ']')
        parent.children.append(node)
        if tag not in self.VOID:
            self.stack.append(node)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in self.VOID:
            self.handle_endtag(tag)

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, 0, -1):
            if self.stack[i].tag == tag:
                del self.stack[i:]
                break

    def handle_data(self, data):
        self.stack[-1].children.append(data)

    def select(self, tag, attr=None, value=None):
        return [n for n in self.nodes if n.tag == tag and (attr is None or n.attrs.get(attr) == value)]

    def one(self, nodes, label):
        need(len(nodes) == 1, 'absent/ambiguous locator: ' + label)
        return nodes[0]

    def repeated(self, nodes, label):
        # Responsive/duplicated OEM markup is acceptable only if every
        # selected identity agrees; a matching sibling among others is not.
        need(nodes and len({n.text() for n in nodes}) == 1, 'absent/conflicting repeated locator: ' + label)
        return nodes[0]

    def pair(self, label, kind='miele'):
        matches = []
        for n in self.nodes:
            if kind == 'miele' and n.tag == 'div' and 'table__item' in n.attrs.get('class', '').split():
                children = [c for c in n.children if isinstance(c, Element)]
                if len(children) == 2 and children[0].tag == 'dt' and children[0].text() == label:
                    matches.append(children[1])
            if kind == 'hoover' and n.tag == 'li':
                children = [c for c in n.children if isinstance(c, Element)]
                if len(children) == 2 and children[0].attrs.get('class') == 'detail-title' and children[0].text() == label:
                    matches.append(children[1])
        return self.one(matches, label)

    def flight(self):
        def descend(obj, path):
            if isinstance(obj, dict):
                yield obj, path
                for key, value in obj.items():
                    yield from descend(value, path + '/' + key)
            elif isinstance(obj, list):
                for i, value in enumerate(obj):
                    yield from descend(value, path + '/' + str(i))
        for script in self.select('script'):
            raw = ''.join(c for c in script.children if isinstance(c, str))
            match = re.fullmatch(r'self\.__next_f\.push\((\[.*\])\)', raw, re.S)
            if not match:
                continue
            for chunk_i, chunk in enumerate(json.loads(match[1])):
                if isinstance(chunk, str):
                    for line_i, line in enumerate(chunk.splitlines()):
                        try:
                            obj = json.loads(line.split(':', 1)[1])
                        except (ValueError, IndexError):
                            continue
                        yield from descend(obj, script.path + '/Flight/' + str(chunk_i) + '/' + str(line_i))


def field(key, value, locator):
    return {'key': key, 'value': value, 'locator': locator}


def exact_token(value, token):
    return re.search(r'(?<![\w/-])' + re.escape(token) + r'(?![\w/-])', value) is not None


def identity(source, page, reference=None):
    """Selectors refer to own product context, never global substring search."""
    key, brand = source['id'], source['brand']
    ref = reference or key.split('-part-', 1)[-1].removeprefix(brand.lower() + '-')
    fields = []
    def add(name, node, expected=None, attribute=None):
        value = node.attrs[attribute] if attribute else node.text()
        need(expected is None or value == expected, 'identity mismatch: ' + name)
        fields.append(field(name, value, node.path + ('/@' + attribute if attribute else '/text()')))
        return value
    if brand == 'Miele':
        add('materialNumber', page.pair('Materialnummer Hersteller'), ref)
        model = add('model', page.pair('Modellbezeichnung'))
        heading = page.one(page.select('h1'), 'own Miele h1')
        if '-part-' not in key:
            need(model in heading.text(), 'neighbor Miele heading')
        fields.append(field('ownHeading', heading.text(), heading.path + '/text()'))
        if '-part-' not in key:
            add('productType', page.pair('Produkttyp'))
    elif brand in {'Bosch', 'Siemens'} and '-part-' not in key and reference is None:
        ref = key.removeprefix(brand.lower() + '-').removeprefix('bom-').upper()
        ref = ref[:-3] + '/' + ref[-2:]
        add('eNumber', page.one([n for n in page.select('h1') if exact_token(n.text(), ref)], 'indexed device h1'))
        objects = [(o, p) for o, p in page.flight() if o.get('variantId') == ref and ('bomRelations' in o if '-bom-' in key else 'productName' in o)]
        need(len(objects) == 1, 'missing exact indexed Flight device')
        fields.append(field('variantId', ref, objects[0][1] + '/variantId'))
    elif brand == 'Bosch':
        heads = page.select('h1', 'data-testid', 'buy-area-title')
        need(heads and all(exact_token(n.text(), ref) for n in heads), 'wrong Bosch own product heading')
        objects = [(o, p) for o, p in page.flight() if o.get('productCode') == ref and 'specifications' in o]
        need(len(objects) == 1, 'missing Bosch product-scoped object')
        fields.append(field('productCode', ref, objects[0][1] + '/productCode'))
        fields.append(field('ownHeadingReference', ref, heads[0].path + '/text()'))
    elif brand == 'Siemens':
        node = page.repeated(page.select('h1'), 'own Siemens article h1')
        need(exact_token(node.text(), ref), 'wrong Siemens part')
        fields.append(field('articleNumber', ref, node.path + '/text()'))
    elif brand == 'AEG':
        if '-part-' in key:
            node = page.one(page.select('title'), 'AEG own article title')
            need(exact_token(node.text(), ref) and urlparse(source['url']).path.endswith('/' + ref), 'wrong AEG article')
            fields.append(field('articleNumber', ref, node.path + '/text()'))
        else:
            node = page.one(page.select('h1'), 'AEG own PNC h1')
            need(''.join(re.findall(r'\d', node.text())) == ref, 'wrong full PNC')
            fields.append(field('pnc', ref, node.path + '/text()'))
            meta = page.one(page.select('meta', 'name', 'description'), 'PNC model metadata')
            need(ref in meta.attrs['content'], 'wrong PNC metadata')
            fields.append(field('pncContext', ref, meta.path + '/@content'))
    elif brand == 'Dyson':
        if '-part-' in key:
            node = page.one(page.select('meta', 'property', 'og:url'), 'Dyson own canonical article')
            need(exact_token(node.attrs['content'].split('/')[-1], ref), 'wrong Dyson part canonical')
            fields.append(field('articleNumber', ref, node.path + '/@content'))
        else:
            anchors = [n for n in page.select('a') if re.search(r'/(?:spare-details\.|replacement-parts/)\d{6}-\d{2}\.' + re.escape(ref) + r'(?:$|[/?])', n.attrs.get('href', ''))]
            need(anchors, 'missing own SKU-bound Dyson part links')
            fields.append(field('deviceSku', ref, anchors[0].path + '/@href'))
            add('modelTitle', page.one(page.select('title'), 'own Dyson title'))
    elif brand == 'Samsung':
        ref = ref.upper().replace('-WD', '/WD')
        add('modelCode', page.repeated(page.select('li', 'data-sdf-prop', 'modelCode'), 'full Samsung modelCode'), ref)
        add('siteCode', page.repeated(page.select('li', 'data-sdf-prop', 'siteCode'), 'Samsung market'), 'de')
    elif brand == 'Vorwerk':
        ref = ref.upper()
        if ref in {'FP7', 'MF7'}:
            node = page.one(page.select('h1'), 'Vorwerk own part heading')
            need(exact_token(node.text(), ref), 'wrong Vorwerk part designation')
            fields.append(field('partDesignation', ref, node.path + '/text()'))
        else:
            anchors = [n for n in page.select('a') if n.text() in {'Gebrauchsanleitung Kobold ' + ref, 'Kobold ' + ref} and n.attrs.get('href', '').startswith('/de/de/c/dam-home/downloads/user-manuals/') and ref.lower() in n.attrs['href']]
            node = page.one(anchors, 'own DE Vorwerk model manual')
            fields.append(field('manufacturerModel', ref, node.path + '/@href'))
    elif brand == 'Hoover':
        add('manufacturerModel', page.pair('Produktname/Handelscode', 'hoover'), ref)
        add('sku', page.pair('Produktcode', 'hoover'), '39401035')
        heads = page.select('h1')
        need(heads and all(exact_token(n.text(), ref) for n in heads), 'wrong Hoover own heading')
    else:
        raise ValueError('unsupported OEM selector')
    locales = [n for n in page.select('html') if 'lang' in n.attrs]
    need(locales and all(n.attrs['lang'].lower() in {'de', 'de-de'} for n in locales), 'wrong/missing HTML market')
    html = locales[0]
    fields.append(field('documentLocale', html.attrs['lang'], html.path + '/@lang'))
    return fields


def metadata(source):
    key = source['id']
    need(re.fullmatch(r'[a-z0-9-]+', key), 'unsafe source identity')
    for name in ['url', 'finalUrl']:
        u = urlparse(source[name])
        need(u.scheme == 'https' and u.hostname == HOSTS[source['brand']] and not u.username and not u.password and u.port in {None, 443}, 'unapproved OEM URL/redirect')
    need(source['finalUrl'] == source['url'], 'changed final URL requires new review')
    observed = dt.datetime.fromisoformat(source.get('observedAt', source.get('retrievedAt', '')))
    need(observed.tzinfo is not None and observed <= dt.datetime.now(dt.timezone.utc), 'invalid observed timestamp')
    need(source['status'] == 200 and source['contentType'].lower().startswith('text/html'), 'unavailable source/type')
    need(type(source['bytes']) is int and 0 < source['bytes'] <= 4_000_000, 'invalid body size')
    need(re.fullmatch(r'[0-9a-f]{64}', source['sha256']), 'invalid content fingerprint')


def verify_body(source, data):
    metadata(source)
    need(len(data) == source['bytes'] and digest(data) == source['sha256'], 'altered bytes/checksum')
    return Page(data)


def load_original_sources():
    data = (ROOT / 'original-sources.json').read_bytes()
    need(digest(data) == SOURCES_SHA, 'original manifest changed from pinned PR #84')
    sources = json.loads(data)
    need(len(sources) == 33 and len({s['id'] for s in sources}) == 33, 'original source count/duplicates')
    return sources


def original_archive(archive=None):
    result = {'status': 'UNVERIFIED_ARCHIVE', 'required': 33, 'independentlyReplayable': 0,
              'zipDigestVerified': False, 'records': [], 'migrationAllowed': False,
              'reason': 'Original ZIP not supplied; metadata is not raw evidence.'}
    if archive is None:
        return result
    try:
        path = external(Path(archive))
        need(path.stat().st_size == 2363333, 'original ZIP size differs')
        need(digest(path.read_bytes()) == ZIP_SHA, 'original ZIP digest differs')
        result['zipDigestVerified'] = True
        with zipfile.ZipFile(path) as z:
            sources = load_original_sources()
            expected = {s['id'] + '.html' for s in sources} | {'receipts.json', 'AUDIT-ONLY.txt'}
            need(len(z.namelist()) == 35 and set(z.namelist()) == expected, 'missing/duplicate/unsafe ZIP member')
            need(all(i.file_size <= 4_000_000 and not i.is_dir() for i in z.infolist()), 'unsafe ZIP size')
            receipts = json.loads(z.read('receipts.json'))
            need(len(receipts) == 33 and len({s['id'] for s in receipts}) == 33, 'missing/duplicate receipts')
            by_id = {s['id']: s for s in receipts}
            for source in sources:
                record = {'id': source['id'], 'url': source['url'], 'finalUrl': source['finalUrl'],
                          'observedAt': source['retrievedAt'], 'sha256': source['sha256'],
                          'rawLocator': 'zip-member:' + source['id'] + '.html',
                          'rights': dict(RIGHTS), 'status': 'unverified'}
                try:
                    need(all(by_id[source['id']].get(k) == source[k] for k in ['url', 'finalUrl', 'status', 'contentType', 'retrievedAt', 'bytes', 'sha256']), 'receipt mismatch')
                    page = verify_body(source, z.read(source['id'] + '.html'))
                    record['fields'] = identity(source, page)
                    record['status'] = 'independently_replayed_original_bytes'
                    result['independentlyReplayable'] += 1
                except (ValueError, KeyError, UnicodeError) as e:
                    record['error'] = str(e)
                result['records'].append(record)
        if result['independentlyReplayable'] == 33:
            result['status'] = 'VERIFIED_ORIGINAL_BYTES'
            result['reason'] = '33/33 original digests, receipts and own identity locators replayed. Not a licence, fitment or migration approval.'
    except (OSError, ValueError, KeyError, zipfile.BadZipFile) as e:
        result['reason'] = str(e)
    return result


def external(path):
    need(not path.resolve().is_relative_to(REPO), 'raw evidence/cache must remain outside repository')
    return path


def new_observations(cache=None, receipts=None):
    if receipts is None:
        receipts = json.loads((ROOT / 'new-receipts.json').read_text())
    need(len(receipts) == 3 and {s['id'] for s in receipts} == {p['id'] for p in PRIORITIES}, 'missing/duplicate priority receipts')
    results = []
    for plan in PRIORITIES:
        source = next(s for s in receipts if s['id'] == plan['id'])
        result = {**plan, 'observedAt': source['observedAt'], 'finalUrl': source.get('finalUrl'),
                  'sha256': source.get('sha256'), 'rawLocator': source.get('rawLocator'),
                  'status': 'unverified', 'fields': [], 'rights': dict(RIGHTS),
                  'fullExactIdentityVerified': False, 'physicalFitApproved': False,
                  'missing': ['serial-range', 'connectors', 'installation-proof', 'reuse-permission']}
        try:
            need(set(source) <= {'id', 'url', 'observedAt', 'finalUrl', 'status', 'contentType', 'bytes', 'sha256', 'rawLocator', 'rights', 'error'}, 'unsupported claim in source receipt')
            need(source['url'] == plan['url'], 'wrong priority URL/variant')
            need(source.get('rights', RIGHTS) == RIGHTS, 'unproved licence escalation')
            need(source.get('rawLocator') == source['id'] + '.html', 'unsafe/misleading raw locator')
            need(source.get('status') == 200, 'blocked OEM response: ' + str(source.get('error', source.get('status'))))
            if cache is None:
                result['error'] = 'No raw cache supplied; stored receipts are not verification.'
            else:
                path = external(Path(cache)) / source['rawLocator']
                page = verify_body({**source, 'brand': plan['brand']}, path.read_bytes())
                result['fields'] = identity({**source, 'brand': plan['brand']}, page, plan['reference'])
                if plan['brand'] == 'Miele':
                    for label, name in [('Staubbehältervolumen in l', 'dustContainerLitres')]:
                        node = page.pair(label)
                        result['fields'].append(field(name, node.text(), node.path + '/text()'))
                if plan['brand'] == 'Hoover':
                    for label, name in [('Leistung (W)', 'ratedPowerWatts'), ('Spannung (V)', 'voltageVolts')]:
                        node = page.pair(label, 'hoover')
                        result['fields'].append(field(name, node.text(), node.path + '/text()'))
                result['status'] = 'independently_verified_actual_bytes'
                result['fullExactIdentityVerified'] = plan['fullExactIdentity']
                if plan['brand'] == 'Bosch':
                    result['missing'].append('E-Nr-/xx-revision: product page does not establish a service revision')
        except (ValueError, KeyError, OSError, UnicodeError) as e:
            result['status'] = 'blocked' if source.get('status') != 200 else 'unverified'
            result['fields'] = []
            result['fullExactIdentityVerified'] = False
            result['error'] = str(e)
        results.append(result)
    return results


def report(archive=None, cache=None, receipts=None):
    original = original_archive(archive)
    observations = new_observations(cache, receipts)
    return {'schema': 'uf.oem-independent-audit/1', 'issue': 96, 'baseSha': BASE,
            'batch': 'wave9-new-oem-2026-10-10', 'originalArchive': original,
            'newObservations': observations,
            'counts': {'originalSourcesIndependentlyReplayable': original['independentlyReplayable'],
                       'newPageObservations': sum(r['status'] == 'independently_verified_actual_bytes' for r in observations),
                       'fullExactIdentity': sum(r['fullExactIdentityVerified'] for r in observations),
                       'individualFieldsWithOemLocator': sum(len(r['fields']) for r in observations),
                       'unverified': 33 - original['independentlyReplayable'] + sum(r['status'] != 'independently_verified_actual_bytes' for r in observations),
                       'rightsGranted': 0, 'approvedRealFits': 0},
            'legacyWave7MigrationAllowed': False, 'launchApproved': False,
            'blockers': ['platform reuse rights not granted', 'Owner #85 integration and combined regression outstanding',
                         'no physical-fit or serial/connector proof', 'historical Wave3 56 missing sources not resolved'],
            'caveat': 'Reproducible second code-path byte audit, not an external human OEM certification. Historical receipt times/final URLs are archived claims; live requests are a separate batch.'}


class RestrictedRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        need(newurl == req.full_url, 'OEM redirect blocked; distinct URL needs explicit review')
        return super().redirect_request(req, fp, code, msg, headers, newurl)


def fetch(cache):
    path = external(Path(cache))
    need(not path.exists(), 'new dated cache must not overwrite previous evidence')
    path.mkdir(parents=True)
    opener = urllib.request.build_opener(RestrictedRedirect())
    receipts = []
    for plan in PRIORITIES:
        r = {'id': plan['id'], 'url': plan['url'], 'observedAt': dt.datetime.now(dt.timezone.utc).isoformat(),
             'finalUrl': None, 'status': None, 'rawLocator': None, 'rights': dict(RIGHTS)}
        try:
            with opener.open(urllib.request.Request(plan['url'], headers={'User-Agent': 'Mozilla/5.0 (OEM factual audit)'}), timeout=30) as response:
                body = response.read(4_000_001)
                need(0 < len(body) <= 4_000_000, 'response body exceeds bounded audit size')
                r.update(finalUrl=response.url, status=response.status,
                         contentType=response.headers.get('Content-Type', ''), bytes=len(body),
                         sha256=digest(body), rawLocator=plan['id'] + '.html')
                metadata({**r, 'brand': plan['brand']})
                (path / r['rawLocator']).write_bytes(body)
        except (OSError, ValueError) as e:
            r.update(status=getattr(e, 'code', None), finalUrl=getattr(e, 'url', None), rawLocator=None, error=type(e).__name__ + ': ' + str(e))
        receipts.append(r)
    (path / 'receipts.json').write_text(json.dumps(receipts, indent=2) + '\n')
    return receipts


def main():
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument('--archive', type=Path)
    cli.add_argument('--cache', type=Path)
    cli.add_argument('--fetch', action='store_true')
    cli.add_argument('--receipts', type=Path)
    cli.add_argument('--expected-report', type=Path, help='compare derived report, never treat stored report as evidence')
    args = cli.parse_args()
    if args.fetch:
        need(args.cache is not None and args.receipts is None, '--fetch requires new external cache, no receipts override')
        need(subprocess.check_output(['git', 'branch', '--show-current'], cwd=REPO, text=True).strip() == BRANCH, 'wrong write branch')
        receipts = fetch(args.cache)
    else:
        receipts = json.loads(args.receipts.read_text()) if args.receipts else None
    result = report(args.archive, args.cache, receipts)
    if args.expected_report:
        need(result == json.loads(args.expected_report.read_text()), 'derived audit differs from expected report')
    print(json.dumps(result, ensure_ascii=False, indent=2))
    # A successful audit is never a migration/release licence.
    return 0 if result['counts']['originalSourcesIndependentlyReplayable'] == 33 and result['counts']['newPageObservations'] == 3 else 2


if __name__ == '__main__':
    raise SystemExit(main())
