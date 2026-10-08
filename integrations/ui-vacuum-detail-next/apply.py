"""Apply the reviewed UI patch to a restored source checkout, without a release."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import subprocess
import tempfile

PACKAGE = Path(__file__).resolve().parent
ALLOWED = {"package.json", "styles.css", "src/app.js", "src/core/model-parts-view.js", "tests/model-parts-view.test.mjs"}


def digest(content):
    return hashlib.sha256(content).hexdigest()


def apply(target):
    manifest = json.loads((PACKAGE / "manifest.json").read_text())
    patch = PACKAGE / "changes.patch"
    if digest(patch.read_bytes()) != manifest["patch_sha256"]:
        raise ValueError("Patch checksum differs; no files changed.")
    files = manifest["files"]
    if {entry["path"] for entry in files} != ALLOWED or len(files) != len(ALLOWED):
        raise ValueError("Unexpected UI file scope; no files changed.")
    target = target.resolve()
    if not target.is_dir():
        raise ValueError("Restore the checkpoint into the target first.")
    original = {}
    for entry in files:
        destination = target / entry["path"]
        if not destination.resolve().is_relative_to(target) or destination.is_symlink():
            raise ValueError("Target contains a linked UI path; no files changed.")
        original[entry["path"]] = destination.read_bytes() if destination.is_file() else None
    current = {name: digest(data) if data is not None else None for name, data in original.items()}
    if all(current[entry["path"]] == entry["after_sha256"] for entry in files):
        return {"status": "already_applied", "files": len(files)}
    conflicts = [entry["path"] for entry in files if current[entry["path"]] != entry["before_sha256"]]
    if conflicts:
        raise ValueError("UI base differs in " + ", ".join(conflicts) + "; no files changed. Rebase the patch deliberately; do not overwrite other branch work.")
    # Validate every output in staging before writing any source file.
    with tempfile.TemporaryDirectory(prefix="uf-ui-patch-") as folder:
        staging = Path(folder)
        for name, data in original.items():
            destination = staging / name
            destination.parent.mkdir(parents=True, exist_ok=True)
            if data is not None:
                destination.write_bytes(data)
        subprocess.run(["patch", "--batch", "--fuzz=0", "-p1", "-d", str(staging), "-i", str(patch)], check=True, capture_output=True, text=True)
        outputs = {entry["path"]: (staging / entry["path"]).read_bytes() for entry in files}
        if any(digest(outputs[entry["path"]]) != entry["after_sha256"] for entry in files):
            raise ValueError("Patched source checksum differs; no files changed.")
        written = []
        try:
            for name, content in outputs.items():
                destination = target / name
                destination.parent.mkdir(parents=True, exist_ok=True)
                with tempfile.NamedTemporaryFile(dir=destination.parent, delete=False) as stream:
                    temp = Path(stream.name)
                    stream.write(content)
                temp.chmod(destination.stat().st_mode & 0o777 if destination.exists() else 0o644)
                try:
                    os.replace(temp, destination)
                    written.append(name)
                finally:
                    temp.unlink(missing_ok=True)
        except Exception:
            for name in written:
                destination = target / name
                if original[name] is None:
                    destination.unlink(missing_ok=True)
                else:
                    destination.write_bytes(original[name])
            raise
    return {"status": "applied", "files": len(files), "base": manifest["base_commit"], "version_unchanged": manifest["base_version"]}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--target", required=True, type=Path)
    arguments = parser.parse_args()
    try:
        print(json.dumps(apply(arguments.target)))
    except (ValueError, OSError, subprocess.CalledProcessError) as error:
        parser.exit(1, str(error) + "\n")
