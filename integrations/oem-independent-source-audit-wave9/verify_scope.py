"""Read-only task branch/file-scope guard; never switches or writes refs."""
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
BASE = '3bafbc7fd8c8da5ed6fe3bddc70eacbc0be1e035'
PREFIX = 'integrations/oem-independent-source-audit-wave9/'
CI = '.github/workflows/oem-independent-source-audit-wave9.yml'


def git(*args):
    return subprocess.check_output(['git', *args], cwd=ROOT, text=True).strip()


if __name__ == '__main__':
    assert git('branch', '--show-current') == 'work/wave9-oem-independent-source-audit', 'wrong branch'
    subprocess.run(['git', 'merge-base', '--is-ancestor', BASE, 'HEAD'], cwd=ROOT, check=True)
    paths = set(git('diff', '--name-only', BASE).splitlines()) | set(git('ls-files', '--others', '--exclude-standard').splitlines())
    assert all(p.startswith(PREFIX) or p == CI for p in paths), 'change outside exclusive issue scope'
    assert all(not p.lower().endswith(('.html', '.pdf', '.zip', '.png', '.jpg', '.jpeg', '.webp')) for p in paths), 'raw OEM/media artifact in Git changes'
    subprocess.run(['git', 'diff', '--check', BASE], cwd=ROOT, check=True)
    print('PASS: required branch; only isolated audit/CI files; no catalog/engine/UI/legal-lock changes or raw OEM artifacts')
