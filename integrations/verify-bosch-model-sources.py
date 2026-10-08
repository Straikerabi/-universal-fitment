"""Re-read explicit German Bosch model/variant identities; never infer an index from a URL."""
import argparse
import concurrent.futures
import datetime
import hashlib
import json
import re
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def manufacturer_url(url):
    parsed = urllib.parse.urlsplit(url)
    assert parsed.scheme == 'https' and parsed.netloc == 'www.bosch-home.com'
    assert parsed.path.startswith(('/de/de/product/', '/de/de/productservice/'))
    assert not parsed.query and not parsed.fragment
    return url


def flight_objects(body, key):
    chunks = re.findall(r'self\.__next_f\.push\((\[1,.*?\])\)</script>', body, re.S)
    stream = ''.join(json.loads(chunk)[1] for chunk in chunks)
    for match in re.finditer(r'"' + key + r'":\{', stream):
        yield json.JSONDecoder().raw_decode(stream[match.end() - 1:])[0]


def read_identity(body, code, variant=False):
    if variant:
        content = next(value for value in flight_objects(body, 'content') if 'entrySectionData' in value)
        return {'brand': content['productBrand'], 'eNumber': content['entrySectionData']['variantId'],
                'productId': content['productId']}
    product = next(value for value in flight_objects(body, 'product') if value.get('productCode') == code)
    title = product['title']
    return {'brand': product['productBrand'], 'code': product['productCode'],
            'canonicalModel': product['productActualCode'], 'deviceMaterial': product['equivalentProductCode'],
            'ean': product['ean'], 'productType': product['type'], 'productFamily': product['productFamily'],
            'name': ((title.get('valueClass') or '') + ' ' + (title.get('headline') or '')).strip(),
            'manualUrls': [doc['url'] for doc in product['technicalDocuments']]}


def verify(task):
    code, url, expected, variant = task
    report = {'model': code, 'url': url, 'kind': 'service' if variant else 'product', 'status': 'failed'}
    try:
        with urllib.request.urlopen(manufacturer_url(url), timeout=35) as response:
            payload = response.read()
            assert response.status == 200
            manufacturer_url(response.url)
            assert response.url == url, 'Manufacturer redirect must be reviewed before changing evidence'
        identity = read_identity(payload.decode(), code, variant)
        for key, value in expected.items():
            assert identity[key] == value, 'Changed source identity: ' + key
        report.update(status='verified', httpStatus=200, observedIdentity=identity,
                      sha256=hashlib.sha256(payload).hexdigest(),
                      checkedAt=datetime.datetime.now(datetime.timezone.utc).isoformat())
    except Exception as error:
        report['error'] = str(error)
    return report


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--evidence', type=Path, default=ROOT/'integrations/bosch-model-research-next.json')
    parser.add_argument('--report', type=Path)
    parser.add_argument('--workers', type=int, default=3)
    args = parser.parse_args()
    evidence = json.loads(args.evidence.read_text())
    tasks = []
    for model in evidence['models']:
        source = model['sourceObservation']
        tasks.append((model['baseModel'], model['manufacturerUrl'],
                      {'brand': 'BOSCH', 'code': model['baseModel'], 'canonicalModel': model['baseModel'],
                       'deviceMaterial': source['deviceMaterial'], 'ean': source['ean'],
                       'productType': 'VIB', 'productFamily': source['productFamily'], 'name': model['name'],
                       'manualUrls': source['manualUrls']}, False))
        for variant in model['variants']:
            tasks.append((model['baseModel'], variant['url'],
                          {'brand': 'BOSCH', 'eNumber': variant['eNumber'], 'productId': variant['eNumber']}, True))
    with concurrent.futures.ThreadPoolExecutor(max_workers=max(1,min(args.workers,4))) as executor:
        results = list(executor.map(verify, tasks))
    report = {'checkedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
              'summary': {'productPages': sum(r['kind']=='product' for r in results),
                          'servicePages': sum(r['kind']=='service' for r in results),
                          'verified': sum(r['status']=='verified' for r in results),
                          'failed': sum(r['status']!='verified' for r in results)}, 'results': results}
    if args.report:
        args.report.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps(report['summary']))
    for result in results:
        if result['status']!='verified':
            print(json.dumps(result,ensure_ascii=False))
    return int(report['summary']['failed']>0)


if __name__ == '__main__':
    raise SystemExit(main())
