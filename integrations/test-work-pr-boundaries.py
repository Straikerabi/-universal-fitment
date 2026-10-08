#!/usr/bin/env python3
"""Offline regression tests for the concurrency safety guard.

No GitHub token, secrets, network, model code or customer data required.
"""
import importlib.util
import pathlib
import unittest

THIS = pathlib.Path(__file__).parent / "check-work-pr-boundaries.py"
spec = importlib.util.spec_from_file_location("work_guard", THIS)
guard = importlib.util.module_from_spec(spec)
spec.loader.exec_module(guard)


def row(name, previous=None, status="modified"):
    record = {"filename": name, "status": status}
    if previous is not None:
        record["previous_filename"] = previous
    return record


class ParallelWorkGuardTests(unittest.TestCase):
    def test_isolated_samsung_evidence_and_importer_pass(self):
        result = guard.assess("work/model-samsung-next", [
            row("integrations/samsung-model-research-next.json", status="added"),
            row("integrations/import-samsung-models-next.mjs", status="added"),
            row("integrations/tests/samsung-models-next.test.mjs", status="added"),
        ])
        self.assertEqual(result["status"], "pass")
        self.assertEqual(result["files_checked"], 3)
        self.assertFalse(result["blocked"])
        self.assertFalse(result["review"])

    def test_isolated_bosch_evidence_and_e_number_checks_pass(self):
        result = guard.assess("work/model-bosch-next", [
            row("integrations/bosch-model-research-next.json"),
            row("integrations/import-bosch-models-next.mjs"),
            row("integrations/bsh-identity-edge-cases.test.mjs"),
        ])
        self.assertEqual(result["status"], "pass")

    def test_isolated_ux_patches_and_tests_pass(self):
        result = guard.assess("work/ui-vacuum-detail-next", [
            row("integrations/ui-vacuum-detail-patch.mjs"),
            row("integrations/mobile-ux-tests.mjs"),
            row("integrations/accordion-sort-fixtures.json"),
        ])
        self.assertEqual(result["status"], "pass")

    def test_second_wave_miele_dyson_hoover_isolation(self):
        for brand, branch in [
            ("miele", "work/model-miele-wave2"),
            ("dyson", "work/model-dyson-wave2"),
            ("hoover", "work/model-hoover-wave2"),
        ]:
            with self.subTest(brand=brand):
                files = [
                    row(f"integrations/{brand}-model-research-wave2.json", status="added"),
                    row(f"integrations/import-{brand}-models-wave2.mjs", status="added"),
                    row(f"integrations/{brand}-wave2.test.mjs", status="added"),
                ]
                result = guard.assess(branch, files)
                self.assertTrue(result["managed"])
                self.assertEqual(result["status"], "pass")
                self.assertEqual(result["files_checked"], 3)
                self.assertFalse(result["blocked"])
                self.assertFalse(result["review"])

    def test_second_wave_rejects_release_archives_and_cross_brand_data(self):
        for own, other in [
            ("miele", "dyson"),
            ("dyson", "hoover"),
            ("hoover", "miele"),
        ]:
            with self.subTest(own=own):
                branch = f"work/model-{own}-wave2"
                forbidden = guard.assess(branch, [
                    row(f".demo/source-v1.28.0/part-002"),
                    row("site/src/data/catalog.js"),
                    row(".github/workflows/pages.yml"),
                ])
                self.assertEqual(forbidden["status"], "blocked")
                self.assertEqual(len(forbidden["blocked"]), 3)
                crossover = guard.assess(branch, [
                    row(f"integrations/{other}-model-research-wave2.json")
                ])
                self.assertEqual(crossover["status"], "manual-review")
                self.assertEqual(len(crossover["review"]), 1)

    def test_old_work_branch_scopes_still_available(self):
        self.assertEqual(guard.assess("work/model-samsung-next", [
            row("integrations/samsung-models-next.json")
        ])["status"], "pass")
        self.assertEqual(guard.assess("work/model-bosch-next", [
            row("integrations/bosch-models-next.json")
        ])["status"], "pass")
        self.assertEqual(guard.assess("work/ui-vacuum-detail-next", [
            row("integrations/ui-vacuum-detail-patch.mjs")
        ])["status"], "pass")

    def test_wave3_strict_ownership_and_allowed_artefacts(self):
        suites = [
            ("work/catalog-model-gap-wave3", "integrations/model-gap-wave3-research.json", "integrations/import-model-gap-wave3-devices.mjs"),
            ("work/parts-fitment-wave3", "integrations/parts-fitment-wave3-verified.json", "integrations/import-parts-fitment-wave3-parts.mjs"),
            ("work/catalog-media-wave3", "integrations/catalog-media-wave3-audit.json", "integrations/catalog-media-wave3-validate.mjs"),
        ]
        for branch, research, importer in suites:
            with self.subTest(branch=branch):
                ok = guard.assess(branch, [row(research), row(importer)])
                self.assertTrue(ok["managed"])
                self.assertEqual(ok["status"], "pass")
                self.assertEqual(ok["files_checked"], 2)

    def test_wave3_fails_closed_for_cross_scope_shared_files_and_releases(self):
        cases = [
            ("work/catalog-model-gap-wave3", "integrations/parts-fitment-wave3-verified.json"),
            ("work/parts-fitment-wave3", "integrations/catalog-media-wave3-research.json"),
            ("work/catalog-media-wave3", "integrations/model-gap-wave3-import.json"),
        ]
        for branch, other in cases:
            with self.subTest(branch=branch):
                result = guard.assess(branch, [
                    row(other),
                    row("integrations/shared-file.json"),
                    row("site/src/app.js"),
                    row(".demo/source-v1.29.0/part-001"),
                    row("README.md"),
                ])
                self.assertEqual(result["status"], "blocked")
                self.assertEqual(len(result["blocked"]), 5)
                self.assertFalse(result["review"])

    def test_wave3_filename_rename_attack_blocked(self):
        self.assertEqual(
            guard.assess("work/catalog-media-wave3", [
                row("integrations/catalog-media-wave3-audit.json", "site/src/catalog.js", "renamed"),
            ])["status"], "blocked",
        )

    def test_site_worktree_and_release_archives_blocked(self):
        for filename in [
            "site/src/app.js",
            "site/tests/catalog-v126.test.mjs",
            ".demo/source-v1.27.1/part-001",
            ".demo/v1.27.2-patch/part-000",
            ".github/workflows/pages.yml",
            ".github/workflows/new-worker.yml",
            "integrations/source-checkpoint.json",
            "integrations/overnight-state-2026-10-08.json",
            "integrations/model-first-plan-v1270.md",
        ]:
            with self.subTest(filename=filename):
                result = guard.assess("work/model-samsung-next", [row(filename)])
                self.assertEqual(result["status"], "blocked")
                self.assertIn(filename, result["blocked"])

    def test_release_scripts_and_global_docs_blocked(self):
        for filename in [
            "README.md",
            "CHANGELOG.md",
            "ROADMAP.md",
            "ROADMAP.en.md",
            "integrations/package-site-patch.py",
            "integrations/build-app.mjs",
            "integrations/create-source-checkpoint.py",
            "integrations/restore-source-checkpoint.py",
            "integrations/check-work-pr-boundaries.py",
            "integrations/test-work-pr-boundaries.py",
            "integrations/samsung-release-v1272.json",
            "integrations/package-release-v1.28.0.py",
            "integrations/samsung-models-v1.28.0.json",
        ]:
            with self.subTest(filename=filename):
                result = guard.assess("work/model-bosch-next", [row(filename)])
                self.assertEqual(result["status"], "blocked")

    def test_renaming_release_archive_into_valid_file_is_still_forbidden(self):
        result = guard.assess("work/model-bosch-next", [
            row("integrations/bosch-new-dataset.json", ".demo/source-v1.27.1/part-001", "renamed"),
        ])
        self.assertEqual(result["status"], "blocked")
        self.assertIn(".demo/source-v1.27.1/part-001", result["blocked"])

    def test_cross_department_is_manual_review_not_silent_pass(self):
        result = guard.assess("work/model-samsung-next", [
            row("integrations/bosch-model-research-next.json"),
            row("integrations/shared-identity.mjs"),
        ])
        self.assertEqual(result["status"], "manual-review")
        self.assertEqual(len(result["review"]), 2)
        self.assertFalse(result["blocked"])

    def test_multiple_cross_scope_and_blocked_combined(self):
        result = guard.assess("work/ui-vacuum-detail-next", [
            row("integrations/samsung-data.json"),
            row("site/src/app.js"),
            row("integrations/ui-vacuum-detail-patch.mjs"),
        ])
        self.assertEqual(result["status"], "blocked")
        self.assertEqual(result["blocked"], ["site/src/app.js"])
        self.assertEqual(result["review"], ["integrations/samsung-data.json"])

    def test_noncanonical_paths_and_bad_records_fail_closed(self):
        invalid_paths = [
            "/site/src/app.js", "../site/src/app.js", "docs/../site/src/app.js",
            "site//src/app.js", "site\\src\\app.js", "integrations/file/",
            "integrations/\x00file", "./integrations/samsung.json",
        ]
        for filename in invalid_paths:
            with self.subTest(filename=repr(filename)):
                result = guard.assess("work/model-samsung-next", [row(filename)])
                self.assertEqual(result["status"], "blocked")
        self.assertEqual(guard.assess("work/model-bosch-next", [{}])["status"], "blocked")
        self.assertEqual(
            guard.assess("work/model-bosch-next", [{"filename": "integrations/bosch.json", "previous_filename": 1}])["status"],
            "blocked",
        )

    def test_unmanaged_branches_are_not_restricted_by_project_policy(self):
        for branch in ["dependabot/npm-security", "work/release-quality", "feature/new-model", "main"]:
            with self.subTest(branch=branch):
                self.assertEqual(guard.assess(branch, [row(".github/workflows/pages.yml")])["status"], "not-managed")
                self.assertFalse(guard.assess(branch, [row(".github/workflows/pages.yml")])["managed"])

    def test_uppercase_aliases_do_not_bypass_reserved_path_check(self):
        self.assertEqual(
            guard.assess("work/model-samsung-next", [row("SiTe/SrC/app.js")])["status"], "blocked"
        )
        self.assertEqual(
            guard.assess("work/model-samsung-next", [row(".GITHUB/workflows/pages.yml")])["status"], "blocked"
        )


if __name__ == "__main__":
    unittest.main(verbosity=2)
