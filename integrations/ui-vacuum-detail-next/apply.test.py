"""Reproduction and refusal checks, entirely inside temporary directories."""
import hashlib
import importlib.util
import json
from pathlib import Path
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[2]
PACKAGE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("ui_patch", PACKAGE / "apply.py")
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


def hashes(target):
    return {str(file.relative_to(target)): hashlib.sha256(file.read_bytes()).hexdigest() for file in target.rglob("*") if file.is_file()}


with tempfile.TemporaryDirectory(prefix="uf-ui-reproduce-") as folder:
    target = Path(folder) / "site"
    subprocess.run(["python3", str(ROOT / "integrations/restore-source-checkpoint.py"), "--target", str(target)], check=True, capture_output=True)
    before = hashes(target)
    assert module.apply(target)["status"] == "applied"
    after = hashes(target)
    expected = {entry["path"] for entry in json.loads((PACKAGE / "manifest.json").read_text())["files"]}
    assert {name for name in set(before) | set(after) if before.get(name) != after.get(name)} == expected
    assert module.apply(target)["status"] == "already_applied"
    assert hashes(target) == after
    subprocess.run(["node", str(target / "tests/model-parts-view.test.mjs")], check=True)
    file = target / "src/app.js"
    file.write_text(file.read_text() + "\n// other branch work\n")
    changed = hashes(target)
    try:
        module.apply(target)
        raise AssertionError("Changed source must be refused")
    except ValueError as error:
        assert "no files changed" in str(error)
    assert hashes(target) == changed
print("UI patch reproduction passed: exact file scope, all catalog/PWA files unchanged, idempotency, preserved conflicting work and view tests from restored source.")
