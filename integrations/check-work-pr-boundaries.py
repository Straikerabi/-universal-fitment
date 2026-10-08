#!/usr/bin/env python3
"""Read-only PR ownership/safety audit for concurrent Money Maker Finder Work jobs.

This is a PR review aid, NOT a substitute for repository branch protection or
a guarantee against direct writes to main. It never downloads or executes PR code.
"""
from __future__ import annotations

import json
import os
import re
import sys
import urllib.error
import urllib.request
from pathlib import PurePosixPath

WORK_BRANCHES = {
    "work/model-samsung-next": "samsung",
    "work/model-bosch-next": "bosch",
    "work/ui-vacuum-detail-next": "ux",
    "work/model-miele-wave2": "miele",
    "work/model-dyson-wave2": "dyson",
    "work/model-hoover-wave2": "hoover",
}
BRAND_ALIASES = {
    "samsung": ("samsung",),
    "bosch": ("bosch", "bsh", "e-number", "enr"),
    "ux": ("ux", "ui-", "-ui", "mobile", "detail", "accordion", "sort", "filter", "responsive", "layout", "vacuum-view"),
    "miele": ("miele",),
    "dyson": ("dyson",),
    "hoover": ("hoover", "candy", "haier"),
}
EXACT_RESTRICTED = {
    "README.md", "CHANGELOG.md", "ROADMAP.md", "ROADMAP.en.md",
    "package.json", "package-lock.json",
    "integrations/source-checkpoint.json",
    "integrations/model-first-plan-v1270.md",
    "integrations/build-app.mjs",
    "integrations/create-source-checkpoint.py",
    "integrations/restore-source-checkpoint.py",
    "integrations/package-site-patch.py",
    "integrations/check-work-pr-boundaries.py",
    "integrations/test-work-pr-boundaries.py",
}
RESTRICTED_PREFIXES = (
    ".github/",
    ".demo/",
    "site/",
    "integrations/overnight-state-",
    "integrations/aeg-release-",
    "integrations/samsung-release-",
    "integrations/samsung-model-release-",
    "integrations/hoover-release-",
    "integrations/release-",
)


def _safe_path(name: str) -> bool:
    """Reject noncanonical path shapes before applying prefix-based checks."""
    if not name or "\x00" in name or "\\" in name or name.startswith("/"):
        return False
    if "//" in name or name.endswith("/"):
        return False
    tokens = name.split("/")
    return all(token not in (".", "..", "") for token in tokens)


def _restricted(name: str) -> bool:
    if not _safe_path(name):
        return True
    lower = name.lower()
    if lower in {p.lower() for p in EXACT_RESTRICTED}:
        return True
    if any(lower.startswith(prefix.lower()) for prefix in RESTRICTED_PREFIXES):
        return True
    # Frozen global build, production deployment and release-publish files are
    # owned by the release coordinator, even if a worker picks a new basename.
    if name.startswith("integrations/"):
        leaf = PurePosixPath(name).name.lower()
        if leaf.startswith(("make-release-", "package-release-", "publish-", "deploy-")):
            return True
        if re.search(r"(?:^|[-_])(v?\d+\.\d+\.\d+)(?:[-_.]|$)", leaf):
            return True
    return False


def _belongs_to_owner(filename: str, owner: str) -> bool:
    text = filename.lower()
    leaf = PurePosixPath(filename).name.lower()
    # Shared files should be individually reviewed, even when not forbidden.
    if owner == "ux":
        return any(s in text for s in BRAND_ALIASES[owner])
    return any(s in leaf for s in BRAND_ALIASES[owner])


def assess(branch: str, files: list[dict]) -> dict:
    """Pure function; filesystem-free and usable by tests and GH API audits."""
    if branch not in WORK_BRANCHES:
        return {
            "branch": branch, "managed": False, "status": "not-managed",
            "files_checked": 0, "blocked": [], "review": [],
        }
    owner = WORK_BRANCHES[branch]
    blocked: set[str] = set()
    review: set[str] = set()
    actual_files: set[str] = set()
    invalid_records = 0
    for record in files:
        if not isinstance(record, dict) or not isinstance(record.get("filename"), str):
            invalid_records += 1
            blocked.add("<invalid API file record>")
            continue
        names = [record["filename"]]
        if record.get("previous_filename"):
            if not isinstance(record["previous_filename"], str):
                blocked.add("<invalid previous_filename>")
                invalid_records += 1
            else:
                names.append(record["previous_filename"])
        for name in names:
            actual_files.add(name)
            if _restricted(name):
                blocked.add(name)
            elif not _belongs_to_owner(name, owner):
                review.add(name)
    review.difference_update(blocked)
    return {
        "branch": branch,
        "managed": True,
        "status": "blocked" if blocked else ("manual-review" if review else "pass"),
        "files_checked": len(actual_files),
        "blocked": sorted(blocked),
        "review": sorted(review),
        "invalid_records": invalid_records,
    }


def _github_get(url: str, token: str) -> dict | list:
    request = urllib.request.Request(url, headers={
        "Accept": "application/vnd.github+json",
        "User-Agent": "universal-fitment-parallel-work-guard",
        "X-GitHub-Api-Version": "2022-11-28",
        "Authorization": "Bearer " + token,
    })
    with urllib.request.urlopen(request, timeout=20) as response:
        return json.load(response)


def _append_summary(text: str) -> None:
    target = os.getenv("GITHUB_STEP_SUMMARY")
    if target:
        with open(target, "a", encoding="utf-8") as file:
            file.write(text + "\n")


def run() -> int:
    repo = os.getenv("GITHUB_REPOSITORY", "")
    number_text = os.getenv("PR_NUMBER", "")
    token = os.getenv("GITHUB_TOKEN", "")
    if not re.fullmatch(r"[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+", repo):
        raise ValueError("GITHUB_REPOSITORY must be owner/repo")
    if not number_text.isdecimal() or int(number_text) < 1:
        raise ValueError("PR_NUMBER must be a positive integer")
    if not token:
        raise ValueError("GITHUB_TOKEN is missing")
    base = "https://api.github.com/repos/" + repo
    pr = _github_get(f"{base}/pulls/{int(number_text)}", token)
    if not isinstance(pr, dict):
        raise ValueError("Unexpected PR metadata response")
    head = pr.get("head") or {}
    base_data = pr.get("base") or {}
    head_repo = (head.get("repo") or {}).get("full_name")
    branch = str(head.get("ref") or "")
    target = str(base_data.get("ref") or "")
    # This guard is designed for the three internal Work streams only.
    # Other PRs are deliberately not rejected by a project-specific policy.
    if branch not in WORK_BRANCHES or head_repo != repo or target != "main":
        line = f"Skipped unmanaged PR branch {branch!r} → {target!r} (source {head_repo!r})."
        print(line)
        _append_summary("### Parallel-work guard\n" + line)
        return 0
    all_files = []
    page = 1
    while True:
        page_rows = _github_get(f"{base}/pulls/{int(number_text)}/files?per_page=100&page={page}", token)
        if not isinstance(page_rows, list):
            raise ValueError("Unexpected PR files response")
        all_files.extend(page_rows)
        if len(page_rows) < 100:
            break
        page += 1
        if page > 30:
            raise ValueError("Review exceeds 3000 files; manual review required")
    result = assess(branch, all_files)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    summary = [
        "### Parallel-work ownership guard",
        f"- Work branch: \`{branch}\`",
        f"- Checked changed paths: **{result['files_checked']}**",
        f"- Status: **{result['status']}**",
    ]
    if result["blocked"]:
        summary.append("- **Release-only or forbidden files (must be removed):**")
        summary.extend("  - \`" + path + "\`" for path in result["blocked"])
    if result["review"]:
        summary.append("- **Cross-scope/shared files (review required, not automatically forbidden):**")
        summary.extend("  - \`" + path + "\`" for path in result["review"])
    summary.append("- This audit does not enable branch protection, grant fitment approval, run PR code, or merge/deploy anything.")
    _append_summary("\n".join(summary))
    return 1 if result["blocked"] else 0


if __name__ == "__main__":
    try:
        sys.exit(run())
    except (ValueError, urllib.error.HTTPError, urllib.error.URLError, TimeoutError) as exc:
        print("Parallel-work audit could not complete safely:", exc, file=sys.stderr)
        sys.exit(2)
