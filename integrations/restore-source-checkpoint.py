"""Restore the checksum-verified source checkpoint fetched through GitHub tools."""
from pathlib import Path
import argparse, base64, hashlib, io, json, stat, zipfile

parser = argparse.ArgumentParser()
parser.add_argument('--target', required=True)
args = parser.parse_args()
root = Path(__file__).resolve().parent.parent
meta = json.loads((root/'integrations/source-checkpoint.json').read_text())
folder = (root/meta['segment_dir']).resolve()
assert folder.is_relative_to(root)
target = Path(args.target).resolve()
assert not target.exists(), 'Use an empty target to preserve other work'
encoded = ''.join((folder/f'part-{i:03d}').read_text() for i in range(meta['segments']))
payload = base64.b64decode(encoded, validate=True)
assert hashlib.sha256(payload).hexdigest() == meta['archive_sha256'], 'Checkpoint checksum differs'
with zipfile.ZipFile(io.BytesIO(payload)) as archive:
    entries = archive.infolist()
    assert len(entries) == meta['file_count']
    for entry in entries:
        name = Path(entry.filename)
        assert not name.is_absolute() and '..' not in name.parts
        assert not stat.S_ISLNK(entry.external_attr >> 16)
        assert (target/name).resolve().is_relative_to(target)
    archive.extractall(target)
assert json.loads((target/'package.json').read_text())['version'] == meta['version']
print(json.dumps({'restored': True, 'version': meta['version'], 'source_files': meta['file_count'], 'target': str(target)}))
