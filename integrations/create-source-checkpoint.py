"""Keep rebuildable source in GitHub without depending on a temporary workspace."""
from pathlib import Path
import argparse, base64, hashlib, io, json, re, zipfile

parser = argparse.ArgumentParser()
parser.add_argument('--site', default='site')
args = parser.parse_args()
root = Path(__file__).resolve().parent.parent
site = Path(args.site).resolve()
version = json.loads((site/'package.json').read_text())['version']
assert re.fullmatch(r'\d+\.\d+\.\d+', version)
folder = root/f'.demo/source-v{version}'
assert not folder.exists(), 'A source checkpoint must use a new version'
data = io.BytesIO()
files = []
with zipfile.ZipFile(data, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
    for path in sorted(site.rglob('*')):
        if not path.is_file():
            continue
        if path.parent == site and path.name.startswith(('app-v', 'catalog-', 'services-v')):
            continue
        if '__pycache__' in path.parts or 'node_modules' in path.parts or '.git' in path.parts:
            continue
        name = str(path.relative_to(site))
        item = zipfile.ZipInfo(name, date_time=(1980, 1, 1, 0, 0, 0))
        item.compress_type = zipfile.ZIP_DEFLATED
        item.external_attr = 0o100644 << 16
        archive.writestr(item, path.read_bytes(), compresslevel=9)
        files.append(name)
payload = data.getvalue()
encoded = base64.b64encode(payload).decode()
folder.mkdir(parents=True)
for index, offset in enumerate(range(0, len(encoded), 10000)):
    (folder/f'part-{index:03d}').write_text(encoded[offset:offset+10000])
meta = {'version': version, 'segment_dir': str(folder.relative_to(root)), 'segments': len(list(folder.iterdir())), 'archive_sha256': hashlib.sha256(payload).hexdigest(), 'archive_bytes': len(payload), 'file_count': len(files), 'compiled_assets_included': False}
(root/'integrations/source-checkpoint.json').write_text(json.dumps(meta, indent=2)+'\n')
print(json.dumps(meta))
