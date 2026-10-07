"""Package a tested site delta for the existing GitHub Pages rebuild workflow."""
from pathlib import Path
import argparse, base64, gzip, hashlib, json, re, shutil, subprocess, tempfile

parser = argparse.ArgumentParser()
parser.add_argument('--baseline', required=True)
parser.add_argument('--site', default='site')
parser.add_argument('--version', required=True)
parser.add_argument('--description', required=True)
parser.add_argument('--build-in-ci', action='store_true')
args = parser.parse_args()
assert re.fullmatch(r'\d+\.\d+\.\d+', args.version), 'Use a new semantic version'
root = Path(__file__).resolve().parent.parent
base = Path(args.baseline).resolve()
site = Path(args.site).resolve()
assert json.loads((site/'package.json').read_text())['version'] == args.version
parts = root/f'.demo/v{args.version}-patch'
assert not parts.exists(), 'Never overwrite a published patch/version'

with tempfile.TemporaryDirectory(prefix='site-delta-') as tmp:
    work = Path(tmp)/'repo'
    shutil.copytree(base, work)
    subprocess.run(['git', 'init', '-q', str(work)], check=True)
    subprocess.run(['git', '-C', str(work), 'add', '.'], check=True)
    subprocess.run(['git', '-C', str(work), '-c', 'user.name=Codex', '-c', 'user.email=codex@example.test', 'commit', '-qm', 'Source baseline'], check=True)
    for path in work.iterdir():
        if path.name == '.git':
            continue
        if path.is_dir():
            shutil.rmtree(path)
        else:
            path.unlink()
    shutil.copytree(site, work, dirs_exist_ok=True)
    subprocess.run(['git', '-C', str(work), 'add', '-A'], check=True)
    patch = subprocess.check_output(['git', '-C', str(work), 'diff', '--cached', '--no-ext-diff', '--no-color', '--binary'])
    replay = Path(tmp)/'replay'
    shutil.copytree(base, replay)
    result = subprocess.run(['patch', '-p1', '--batch', '-d', str(replay)], input=patch, capture_output=True)
    assert result.returncode == 0, result.stdout.decode()+result.stderr.decode()
    def hashes(folder):
        return {str(p.relative_to(folder)): hashlib.sha256(p.read_bytes()).hexdigest() for p in folder.rglob('*') if p.is_file()}
    expected = hashes(site)
    assert hashes(replay) == expected, 'Replayed source differs from the tested source'

sha = hashlib.sha256(patch).hexdigest()
encoded = base64.b64encode(gzip.compress(patch, compresslevel=9, mtime=0)).decode()
parts.mkdir(parents=True)
for index, offset in enumerate(range(0, len(encoded), 10000)):
    (parts/f'part-{index:03d}').write_text(encoded[offset:offset+10000])
(root/f'update-v{args.version}.patch').write_bytes(patch)
workflow = root/'.github/workflows/pages.yml'
text = workflow.read_text()
marker = '      - name: Verify reproducible app bundle\n'
assert text.count(marker) == 1
step = f'''      - name: {json.dumps('Apply v'+args.version+' '+args.description)}
        shell: bash
        run: |
          cat .demo/v{args.version}-patch/part-* | base64 -d | gzip -d > update-v{args.version}.patch
          echo "{sha}  update-v{args.version}.patch" | sha256sum -c -
          patch -p1 -d site < update-v{args.version}.patch

'''
text = text.replace(marker, step+marker)
text = text.replace(text.splitlines()[0], 'name: '+json.dumps('Deploy v'+args.version+' '+args.description+' to GitHub Pages'), 1)
if args.build_in_ci:
    old = '          npm ci --prefix integrations/auth-sdk --ignore-scripts\n          node integrations/build-app.mjs --check'
    if '          node integrations/build-app.mjs\n' not in text:
        assert old in text
        text = text.replace(old, old.replace('          node integrations/build-app.mjs --check', '          node integrations/build-app.mjs\n          node integrations/build-app.mjs --check'), 1)
workflow.write_text(text)
info = {'version': args.version, 'patchSha': sha, 'patchBytes': len(patch), 'encodedBytes': len(encoded), 'parts': len(list(parts.iterdir())), 'files': len(expected), 'exactReplay': True}
(root/f'publish-info-v{args.version}.json').write_text(json.dumps(info))
print(json.dumps(info))
