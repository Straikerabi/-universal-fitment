"""Document-only preflight tests. Synthetic response bytes exist only in tests."""
import json
import tempfile
import unittest
from pathlib import Path
from archive_gate import CHAIN, PINS, REPO, checked_inputs, digest, import_gate, inventory, pilot_measurement, requirements, verify_checkpoint


class ArchiveGateTests(unittest.TestCase):
    def test_owner_metadata_and_consumer_inputs_match_the_exact_reviewed_bytes(self):
        self.assertEqual(len(checked_inputs()), 5)

    def test_original_136_file_checkpoint_is_valid_without_restoring_or_importing(self):
        metadata = checked_inputs()['integrations/source-checkpoint.json']
        result = verify_checkpoint(REPO, metadata)
        self.assertTrue(result['verified'])
        self.assertEqual(result['fileCount'], 136)
        self.assertEqual(result['archiveSha256'], CHAIN['checkpointSha256'])

    def test_archive_requirements_include_hoover_manufacturer_authority_not_just_service_shop(self):
        rows = requirements(checked_inputs())
        self.assertEqual(len(rows), 71)
        self.assertEqual(sum(r['group'] == 'model' for r in rows), 15)
        self.assertEqual(sum(r['group'] == 'parts' for r in rows), 55)
        self.assertEqual(sum(r['group'] == 'authority' for r in rows), 1)
        self.assertTrue(all(r['usageRights'].startswith('unknown') for r in rows))

    def test_one_missing_response_stops_import(self):
        with self.assertRaisesRegex(ValueError, 'IMPORT STOPPED: 1'):
            import_gate([{'group':'synthetic','id':'fixture','originalResponse':'missing'}])

    def test_empty_audit_cannot_authorize_projection(self):
        with self.assertRaisesRegex(ValueError, 'Empty/duplicate'):
            import_gate([])

    def test_duplicate_receipts_cannot_substitute_for_missing_sources(self):
        row={'group':'synthetic','id':'fixture','originalResponse':'present_hash_verified'}
        with self.assertRaisesRegex(ValueError, 'Empty/duplicate'):
            import_gate([row,row])

    def test_complete_archives_still_do_not_authorize_projection_or_fitment(self):
        r=import_gate([{'group':'synthetic','id':'fixture','originalResponse':'present_hash_verified'}])
        self.assertTrue(r['archivesComplete'])
        self.assertFalse(r['projectionAuthorized'])

    def fixture(self, body=b'synthetic response', size=None):
        return {'group':'synthetic','id':'fixture','url':'https://invalid.example.test/',
                'sha256':digest(body),'bytes':size,'market':'synthetic','usageRights':'synthetic only'}

    def test_original_bytes_are_accepted_independent_of_arbitrary_cache_filename(self):
        with tempfile.TemporaryDirectory() as directory:
            (Path(directory)/'response.body').write_bytes(b'synthetic response')
            rows=inventory([Path(directory)],[self.fixture(size=18)])
            self.assertEqual(rows[0]['originalResponse'],'present_hash_verified')

    def test_changed_live_response_does_not_replace_historical_pin(self):
        with tempfile.TemporaryDirectory() as directory:
            (Path(directory)/'response.html').write_bytes(b'synthetic changed response')
            rows=inventory([Path(directory)],[self.fixture()])
            self.assertEqual(rows[0]['originalResponse'],'missing')

    def test_a_hash_in_json_is_not_an_archived_response(self):
        with tempfile.TemporaryDirectory() as directory:
            (Path(directory)/'receipt.json').write_text(json.dumps(self.fixture()))
            self.assertEqual(inventory([Path(directory)],[self.fixture()])[0]['originalResponse'],'missing')

    def test_symlink_cache_root_is_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            folder=Path(directory)/'real';folder.mkdir()
            link=Path(directory)/'link';link.symlink_to(folder,target_is_directory=True)
            with self.assertRaisesRegex(ValueError,'real directory'):
                inventory([link],[self.fixture()])

    def test_symlink_response_is_not_counted(self):
        with tempfile.TemporaryDirectory() as directory:
            parent=Path(directory);folder=parent/'cache';folder.mkdir()
            real=parent/'original';real.write_bytes(b'synthetic response')
            (folder/'linked.html').symlink_to(real)
            self.assertEqual(inventory([folder],[self.fixture()])[0]['originalResponse'],'missing')

    def test_wrong_pinned_source_length_fails_closed(self):
        with tempfile.TemporaryDirectory() as directory:
            (Path(directory)/'response').write_bytes(b'synthetic response')
            with self.assertRaisesRegex(ValueError,'length mismatch'):
                inventory([Path(directory)],[self.fixture(size=1)])

    def test_existing_pilot_and_cache_are_measured_not_renamed_to_wave3(self):
        result=pilot_measurement(REPO)
        self.assertEqual((result['models'],result['physicalArticleIdentities']),(11,11))
        self.assertEqual(result['snapshotVersion'],1)
        self.assertFalse(result['wave3Integrated'])
        self.assertEqual(len(set(result['deviceIds'])),11)
        self.assertEqual(len(set(result['articleIds'])),11)

    def test_historical_artifact_is_explicitly_blocked_and_has_no_combined_measured_counts(self):
        result=json.loads((REPO/'integrations/catalog-wave6/archive-report.json').read_text())
        self.assertEqual((result['measured']['originalResponsesPresent'],result['measured']['originalResponsesMissing']),(15,56))
        self.assertFalse(result['projectionAuthorized'])
        self.assertFalse(result['consumerSnapshotMigrated'])
        self.assertFalse(result['compositionExecuted'])
        self.assertIsNone(result['combinedCatalogMeasured'])
        self.assertEqual(result['measured']['projectedNewDevices'],0)
        self.assertEqual(result['measured']['newRealInstallationApprovals'],0)
        with self.assertRaisesRegex(ValueError,'IMPORT STOPPED: 56'):
            import_gate(result['archiveRequirements'])


def pin_mutation_test(name):
    def test(self):
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory)
            for p in PINS:
                target=root/p;target.parent.mkdir(parents=True,exist_ok=True)
                target.write_bytes((REPO/p).read_bytes())
            with (root/name).open('ab') as file:
                file.write(b' changed')
            with self.assertRaisesRegex(ValueError,'Owner input changed'):
                checked_inputs(root)
    return test

# Source, OEM/PNC/SKU/market observations and consumer fingerprints are pinned as
# whole artifacts. No made-up replacement identity can be loaded for projection.
for index,name in enumerate(PINS):
    setattr(ArchiveGateTests,'test_reject_changed_pinned_input_'+str(index),pin_mutation_test(name))

if __name__=='__main__':
    unittest.main()
