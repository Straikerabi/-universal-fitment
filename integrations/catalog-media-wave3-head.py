"""Explicit HEAD-only availability audit; never downloads or embeds an image."""
import argparse
import concurrent.futures
import datetime
import json
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

HOSTS = {'media.miele.com', 'media3.bsh-group.com', 'electrolux.bynder.com',
         'dyson-h.assetsadobe2.com', 'dam.versuni.com', 'www.backend.vbs.versuni.com'}

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None

def probe(url):
    parsed = urllib.parse.urlsplit(url)
    result = {'url': url, 'method': 'HEAD', 'bodyBytesDownloaded': 0,
              'status': None, 'contentType': None, 'contentLength': None,
              'corsAllowOrigin': None, 'redirect': None, 'error': None}
    if parsed.scheme != 'https' or parsed.hostname not in HOSTS or parsed.username or parsed.password or parsed.port:
        result['error'] = 'URL rejected by HTTPS/exact-host policy'
        return result
    request = urllib.request.Request(url, method='HEAD', headers={
        'User-Agent': 'UniversalFitment-MediaAudit/1.0 (HEAD only; no image reuse)',
        'Origin': 'https://straikerabi.github.io'})
    try:
        with urllib.request.build_opener(NoRedirect()).open(request, timeout=4) as response:
            result['status'] = response.status
            headers = response.headers
    except urllib.error.HTTPError as error:
        result['status'] = error.code
        headers = error.headers
    except Exception as error:
        result['error'] = type(error).__name__ + ': ' + str(error)[:160]
        return result
    result.update(contentType=headers.get('Content-Type'), contentLength=headers.get('Content-Length'),
                  corsAllowOrigin=headers.get('Access-Control-Allow-Origin'), redirect=headers.get('Location'))
    return result

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--inventory', required=True)
    parser.add_argument('--output', required=True)
    args = parser.parse_args()
    inventory = json.loads(Path(args.inventory).read_text())
    rows = inventory.get('rows')
    if rows is None:
        rows = [row for group in ['models', 'parts', 'familyFallbacks'] for row in inventory[group]]
    urls = sorted({row['imageUrl'] for row in rows if row.get('imageUrl')})
    results = []
    output = Path(args.output)
    if output.exists():
        previous = json.loads(output.read_text())
        assert previous['method'] == 'HEAD' and previous['bodyBytesDownloaded'] == 0
        results = [r for r in previous['results'] if r['url'] in urls]
    completed = {r['url'] for r in results}
    report = {'schemaVersion': 1, 'checkedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
              'method': 'HEAD', 'bodyBytesDownloaded': 0,
              'limits': ['HEAD availability does not establish GET/hotlink permission, image dimensions, actual decoding or legal reuse.',
                         '403/429/5xx/timeouts are indeterminate; only 404/410 means the resource was missing during HEAD.',
                         'Redirects are recorded but not followed; no protected shop is scraped.'],
              'results': results}
    def checkpoint():
        report['pending'] = len(urls) - len(results)
        output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    checkpoint()
    with concurrent.futures.ThreadPoolExecutor(max_workers=12) as pool:
        for number, result in enumerate(pool.map(probe, [u for u in urls if u not in completed]), len(results) + 1):
            results.append(result)
            if number % 10 == 0: checkpoint()
            if number % 100 == 0: print(f'HEAD {number}/{len(urls)}', flush=True)
    checkpoint()
    print(json.dumps({'urls': len(results), 'bodyBytesDownloaded': 0,
                      'successfulImageHeads': sum(r['status'] == 200 and (r['contentType'] or '').startswith('image/') for r in results)}))

if __name__ == '__main__':
    main()
