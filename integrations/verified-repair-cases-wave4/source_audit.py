"""Replay manufacturer evidence against privately cached, SHA-256-pinned responses.

No eval, browser execution, family expansion, alias stripping or engine imports.
"""
import argparse
import hashlib
import json
import re
import subprocess
import urllib.request
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent
DOMAINS = {
    'Miele': {'www.miele.de', 'media.miele.com'},
    'Bosch': {'www.bosch-home.com'},
    'Siemens': {'www.siemens-home.bsh-group.com'},
    'AEG': {'shop.aeg.de'},
    'Dyson': {'www.dyson.de'},
    'Samsung': {'www.samsung.com'},
    'Vorwerk': {'www.vorwerk.com', 'assets.vorwerk.com'},
}


class Node:
    def __init__(self, tag='', attrs=()):
        self.tag, self.attrs, self.children = tag, dict(attrs), []

    def walk(self):
        yield self
        for child in self.children:
            if isinstance(child, Node):
                yield from child.walk()

    def text(self):
        if self.tag in {'script', 'style'}:
            return ''
        return ' '.join(c.text() if isinstance(c, Node) else c for c in self.children)


class Document(HTMLParser):
    VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'}

    def __init__(self, html):
        super().__init__(convert_charrefs=True)
        self.root = Node()
        self.stack = [self.root]
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        node = Node(tag, attrs)
        self.stack[-1].children.append(node)
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


def norm(text):
    return ' '.join(text.split())


def objects(value):
    if isinstance(value, dict):
        yield value
        for item in value.values():
            yield from objects(item)
    elif isinstance(value, list):
        for item in value:
            yield from objects(item)


def flight_objects(html):
    for match in re.finditer(r'self\.__next_f\.push\((\[.*?\])\)</script>', html, re.S):
        for chunk in json.loads(match[1]):
            if not isinstance(chunk, str):
                continue
            for line in chunk.splitlines():
                try:
                    decoded = json.loads(line.split(':', 1)[1])
                except (ValueError, IndexError):
                    continue
                yield from objects(decoded)


def extract(data, recipe):
    """Return only explicit, context-bound identities; absence is an audit error."""
    kind = recipe['kind']
    if kind == 'pdf-page':
        text = subprocess.run(['pdftotext', '-layout', '-', '-'], input=data,
                              stdout=subprocess.PIPE, check=True).stdout.decode()
        visible = norm(text.split('\f')[recipe['page'] - 1])
    else:
        html = data.decode('utf-8')
        dom = Document(html).root
        visible = norm(dom.text())
        if 'canonical' in recipe:
            canonicals = [n.attrs.get('content') for n in dom.walk()
                          if n.tag == 'meta' and n.attrs.get('property') == 'og:url']
            if canonicals != [recipe['canonical']]:
                raise ValueError('canonical article identity absent or ambiguous')
    for token in recipe.get('requires', []):
        if norm(token) not in visible:
            raise ValueError(f'missing source assertion: {token}')
    if kind in {'visible', 'pdf-page'}:
        return {'assertions': recipe['requires'], **({'page': recipe['page']} if kind == 'pdf-page' else {})}
    scope = recipe['scope']
    if kind == 'bsh-bom':
        candidates = [o for o in flight_objects(html) if o.get('variantId') == scope and 'bomRelations' in o]
        if len(candidates) != 1:
            raise ValueError('BOM variant context ambiguous or absent')
        return {'scope': scope, 'articles': sorted([
            {'code': r['productId'], 'position': r['positionNumber']}
            for r in candidates[0]['bomRelations']], key=lambda x: (x['position'], x['code']))}
    if kind == 'bsh-accessories':
        candidates = [o for o in flight_objects(html) if o.get('productCode') == scope and 'additionalAccessoryProductIDs' in o]
        if len(candidates) != 1:
            raise ValueError('product accessory context ambiguous or absent')
        codes = candidates[0]['additionalAccessoryProductIDs']
    elif kind == 'miele-accessories':
        codes = []
        for node in dom.walk():
            if 'hls-accessories-wrapper-item' in node.attrs.get('class', '').split():
                codes.extend(m[1] for a in node.walk() if a.tag == 'a'
                             if (m := re.match(r'/product/(\d+)/', a.attrs.get('href', ''))))
    elif kind == 'aeg-pnc-cards':
        # Header names full PNC and model; only result ProductCards are read.
        codes = [n.attrs['data-product-code'] for n in dom.walk()
                 if n.attrs.get('data-component-name') == 'ProductCard']
    elif kind == 'dyson-spares':
        codes = []
        for node in dom.walk():
            if 'plp-spare-card__item' in node.attrs.get('class', '').split():
                for a in node.walk():
                    m = re.search(r'/spare-details\.(\d{6}-\d{2})\.' + re.escape(scope) + r'(?:$|[/?])', a.attrs.get('href', ''))
                    if m:
                        codes.append(m[1])
    elif kind == 'samsung-optional':
        candidates = [n for n in dom.walk() if n.tag == 'li'
                      and 'pdd32-product-spec__content-item' in n.attrs.get('class', '').split()
                      and any(norm(c.text()) == 'Optionales Zubehör' for c in n.walk())]
        if len(candidates) != 1:
            raise ValueError('optional accessory spec context ambiguous')
        codes = re.findall(r'\((VCA-[A-Z0-9]+(?:/[A-Z]+)?)\)', candidates[0].text())
    else:
        raise ValueError(f'unknown extractor {kind}')
    return {'scope': scope, 'articles': sorted(set(codes))}


def trusted(source):
    hosts = DOMAINS.get(source['brand'], set())
    return all(urlparse(source[key]).scheme == 'https' and urlparse(source[key]).hostname in hosts
               for key in ('url', 'finalUrl'))


def replay(cache, sources, observations):
    by_id = {s['id']: s for s in sources}
    bodies = {}
    for source in sources:
        if not trusted(source):
            raise ValueError('non-manufacturer source or redirect')
        data = (cache / source['file']).read_bytes()
        if hashlib.sha256(data).hexdigest() != source['sha256']:
            raise ValueError(f"source changed: {source['id']}; manual review required")
        bodies[source['id']] = data
    for observation in observations:
        actual = extract(bodies[observation['source']], observation['recipe'])
        if actual != observation['observed']:
            raise ValueError(f"extraction changed: {observation['id']}")
    return {'sources': len(by_id), 'observations': len(observations), 'hashesAndSelectors': 'verified'}


def download(cache, sources):
    # Cache is deliberately external: original manuals/HTML are not redistributed.
    if cache.resolve().is_relative_to(ROOT.parent.parent):
        raise ValueError('use an external private cache, outside the repository')
    cache.mkdir(parents=True, exist_ok=True)
    for source in sources:
        if not trusted(source):
            raise ValueError('non-manufacturer URL')
        target = cache / source['file']
        if target.exists():
            raise ValueError(f'will not overwrite {target}')
        req = urllib.request.Request(source['url'], headers={'User-Agent': 'Mozilla/5.0 (manufacturer source audit)'})
        with urllib.request.urlopen(req, timeout=45) as response:
            if urlparse(response.url).hostname not in DOMAINS[source['brand']]:
                raise ValueError('untrusted redirect')
            data = response.read()
        target.write_bytes(data)
        if hashlib.sha256(data).hexdigest() != source['sha256']:
            raise ValueError(f"source changed: {source['id']}; preserved for manual review, not accepted")


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--cache', required=True, type=Path)
    parser.add_argument('--download', action='store_true')
    args = parser.parse_args()
    sources = json.loads((ROOT / 'sources.json').read_text())['sources']
    observations = json.loads((ROOT / 'observations.json').read_text())
    if args.download:
        download(args.cache, sources)
    print(json.dumps(replay(args.cache, sources, observations), sort_keys=True))
