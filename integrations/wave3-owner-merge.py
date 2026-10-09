#!/usr/bin/env python3
"""Merge *separate, already verified* Worker output trees by three-way, without weakening Worker branch gates.

Inputs are four independent restored sites (one base and three worker-generated).
On overlapping changed paths, GNU/Git's 3-way merge is used. An unresolved conflict
fails instead of selecting the last writer. Output is a scratch directory only.
Never write to an original worker checkout, main, or an actual user worktree.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile


def sha(data: bytes | None) -> str | None:
    return hashlib.sha256(data).hexdigest() if data is not None else None


def inventory(root: Path) -> dict[str, bytes]:
    if not root.is_dir() or root.is_symlink():
        raise ValueError(f"Not a safe root directory: {root}")
    found: dict[str, bytes] = {}
    for folder, dirs, files in os.walk(root, followlinks=False):
        if any((Path(folder) / n).is_symlink() for n in dirs + files):
            raise ValueError(f"Symlink in site: {folder}")
        for filename in files:
            p = Path(folder, filename)
            if not p.is_file():
                raise ValueError(f"Unexpected special file: {p}")
            rel = p.relative_to(root).as_posix()
            if rel.startswith(".git/"):
                raise ValueError("Unexpected .git source")
            found[rel] = p.read_bytes()
    return found


def merge_bytes(path: str, base: bytes, ours: bytes, theirs: bytes) -> tuple[bytes | None, str]:
    if ours == theirs:
        return ours, "identical"
    if ours == base:
        return theirs, "new-worker"
    if theirs == base:
        return ours, "unchanged-worker"
    if b"\x00" in base + ours[:4096] + theirs[:4096]:
        return None, "binary-collision"
    with tempfile.TemporaryDirectory(prefix="uf-wave3-diff3-") as td:
        a, b, c = [Path(td, n) for n in ("ours", "base", "theirs")]
        a.write_bytes(ours)
        b.write_bytes(base)
        c.write_bytes(theirs)
        result = subprocess.run(
            ["git", "merge-file", "--stdout", "-L", "accumulated", "-L", "v1.29.0",
             "-L", "next-worker", str(a), str(b), str(c)],
            stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=20,
        )
        if result.returncode != 0:
            return None, "overlapping-source-conflict"
        return result.stdout, "three-way-clean"


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--baseline", required=True)
    p.add_argument("--model", required=True)
    p.add_argument("--parts", required=True)
    p.add_argument("--media", required=True)
    p.add_argument("--output", required=True)
    p.add_argument("--report", required=True)
    args = p.parse_args()
    original = inventory(Path(args.baseline).resolve())
    worker_files = [(name, inventory(Path(getattr(args, name)).resolve()))
                    for name in ("model", "parts", "media")]
    output = Path(args.output).resolve()
    report = Path(args.report).resolve()
    if output.exists() or output == Path(args.baseline).resolve():
        raise ValueError("Output must be a new isolated directory")
    if any(output == Path(getattr(args, name)).resolve() for name, _ in worker_files):
        raise ValueError("Cannot overwrite worker output")
    # Every input must start from the exact same file tree.
    merged = dict(original)
    changed: dict[str, list[str]] = {}
    resolutions: dict[str, list[str]] = {}
    conflicts: list[dict] = []
    for name, files in worker_files:
        for rel, baseline_data in original.items():
            if rel not in files:
                conflicts.append(dict(path=rel, worker=name, reason="worker-deleted-baseline-file"))
        for rel in sorted(set(files) | set(original)):
            after = files.get(rel)
            before = original.get(rel)
            if before == after:
                continue
            if after is None:
                continue
            changed.setdefault(rel, []).append(name)
            if rel not in merged:
                merged[rel] = after
                resolutions.setdefault(rel, []).append(f"{name}:created")
                continue
            ours = merged[rel]
            if before is None and ours != after:
                conflicts.append(dict(path=rel, worker=name, reason="different-added-files"))
                continue
            if before is not None:
                result, resolution = merge_bytes(rel, before, ours, after)
                resolutions.setdefault(rel, []).append(f"{name}:{resolution}")
                if result is None:
                    conflicts.append(dict(path=rel, worker=name, reason=resolution,
                                          initial=sha(before), accumulated=sha(ours), incoming=sha(after)))
                else:
                    merged[rel] = result
    report.parent.mkdir(parents=True, exist_ok=True)
    payload = dict(
        originalFiles=len(original),
        workerChanges={name:sum(1 for path, content in files.items() if content != original.get(path))
                       for name, files in worker_files},
        changedPaths={key: workers for key, workers in sorted(changed.items())},
        resolutions={key: steps for key, steps in sorted(resolutions.items())},
        conflicts=conflicts,
        accepted=not conflicts,
        expectedModelRecords=1115,
        expectedCatalogArticles=1961,
        # These are PROJECTIONS until a complete combined catalog test passes.
        verifiedCombinedModelRecords=None,
        verifiedCombinedCatalogArticles=None,
    )
    report.write_text(json.dumps(payload, indent=2, ensure_ascii=False)+"\n")
    print(json.dumps(dict(changes=len(changed), overlapping=sum(len(w)>1 for w in changed.values()),
                          conflicts=len(conflicts), report=str(report)), ensure_ascii=False))
    if conflicts:
        print("NOT INTEGRATED: explicit source-level owner review required for all conflicts.")
        return 2
    output.mkdir(parents=True)
    for rel, data in sorted(merged.items()):
        dst = output / rel
        dst.parent.mkdir(parents=True, exist_ok=True)
        dst.write_bytes(data)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
