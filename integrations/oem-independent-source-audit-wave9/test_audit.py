"""All in-memory HTML below is SYNTHETIC test input, never an OEM receipt.

Real source replay runs separately through audit.py, not through secret/optional
unittest fixtures. All validation tests execute in public CI with zero skips.
"""
import copy
import datetime as dt
import importlib.util
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('wave9_audit', Path(__file__).with_name('audit.py'))
a = importlib.util.module_from_spec(spec)
spec.loader.exec_module(a)


def page(content):
    return a.Page(('<html lang="de-DE"><body>' + content + '</body></html>').encode())


def pair(label, value):
    return '<div class="table__item"><dt>' + label + '</dt><dd>' + value + '</dd></div>'


def miele(code='11602400', heading='Synthetic model'):
    return page('<h1>' + heading + '</h1>' + pair('Materialnummer Hersteller', code)
                + pair('Modellbezeichnung', 'Synthetic model') + pair('Produkttyp', 'SYNTHETIC'))


def flight(obj):
    return '<script>self.__next_f.push(' + json.dumps([1, 'a:' + json.dumps(obj)]) + ')</script>'


def source(key='miele-11602400', brand='Miele'):
    return {'id': key, 'brand': brand, 'url': a.PRIORITIES[0]['url'], 'finalUrl': a.PRIORITIES[0]['url'],
            'status': 200, 'contentType': 'text/html', 'bytes': 9,
            'sha256': a.digest(b'synthetic'), 'observedAt': '2026-10-10T00:00:00+00:00'}


class PureAuditTests(unittest.TestCase):
    def test_01_original_manifest_is_exact_pinned_33(self):
        self.assertEqual(len(a.load_original_sources()), 33)

    def test_02_no_bytes_no_archive_verification(self):
        r = a.report()
        self.assertEqual(r['originalArchive']['status'], 'UNVERIFIED_ARCHIVE')
        self.assertEqual(r['counts'], {'originalSourcesIndependentlyReplayable': 0,
            'newPageObservations': 0, 'fullExactIdentity': 0, 'individualFieldsWithOemLocator': 0,
            'unverified': 36, 'rightsGranted': 0, 'approvedRealFits': 0})
        self.assertFalse(r['legacyWave7MigrationAllowed'])
        self.assertFalse(r['launchApproved'])

    def test_03_missing_archive_stays_zero(self):
        r = a.original_archive('/does-not-exist-wave9.zip')
        self.assertEqual(r['independentlyReplayable'], 0)
        self.assertEqual(r['status'], 'UNVERIFIED_ARCHIVE')

    def test_04_fabricated_archive_cannot_supply_original_bytes(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'synthetic.zip'
            path.write_bytes(b'SYNTHETIC NOT OEM')
            r = a.original_archive(path)
        self.assertEqual(r['independentlyReplayable'], 0)
        self.assertFalse(r['zipDigestVerified'])

    def test_05_archive_checksum_mismatch_fail_closed(self):
        with patch.object(Path, 'stat') as stat, patch.object(Path, 'read_bytes', return_value=b'SYNTHETIC'):
            stat.return_value.st_size = 2363333
            r = a.original_archive('/synthetic-test.zip')
        self.assertEqual(r['independentlyReplayable'], 0)
        self.assertIn('digest differs', r['reason'])

    def test_06_wrong_material_not_family_match(self):
        with self.assertRaisesRegex(ValueError, 'identity mismatch'):
            a.identity(source(), miele('11602420'), '11602400')

    def test_07_sibling_heading_not_own_product(self):
        with self.assertRaisesRegex(ValueError, 'neighbor'):
            a.identity(source(), miele(heading='Synthetic sibling'), '11602400')

    def test_08_swapped_bsh_revision(self):
        p = page('<h1>VS06A110/12</h1>' + flight({'variantId': 'VS06A110/12', 'productName': {'description': 'synthetic'}}))
        with self.assertRaises(ValueError):
            a.identity(source('siemens-vs06a110-03', 'Siemens'), p)

    def test_09_wrong_bom_revision_even_with_heading(self):
        p = page('<h1>VS06A110/03</h1>' + flight({'variantId': 'VS06A110/12', 'bomRelations': []}))
        with self.assertRaisesRegex(ValueError, 'indexed Flight'):
            a.identity(source('siemens-bom-vs06a110-03', 'Siemens'), p)

    def test_10_samsung_market_suffix_preserved(self):
        p = page('<li data-sdf-prop="modelCode">VS20C85G4PB/UK</li><li data-sdf-prop="siteCode">de</li>')
        with self.assertRaises(ValueError):
            a.identity(source('samsung-vs20c85g4pb-wd', 'Samsung'), p)

    def test_11_conflicting_responsive_siblings_rejected(self):
        p = page('<li data-sdf-prop="modelCode">VS20C85G4PB/WD</li><li data-sdf-prop="modelCode">VS20C85G4TB/WD</li><li data-sdf-prop="siteCode">de</li>')
        with self.assertRaisesRegex(ValueError, 'conflicting'):
            a.identity(source('samsung-vs20c85g4pb-wd', 'Samsung'), p)

    def test_12_dyson_wrong_part_number(self):
        p = page('<meta property="og:url" content="https://www.dyson.de/replacement-parts/filter.969082-02">')
        with self.assertRaisesRegex(ValueError, 'wrong Dyson part'):
            a.identity(source('dyson-part-969082-01', 'Dyson'), p)

    def test_13_dyson_wrong_device_sku(self):
        p = page('<title>Synthetic</title><a href="/support/journey/spare-details.969082-01.226397-02">Part</a>')
        with self.assertRaisesRegex(ValueError, 'SKU-bound'):
            a.identity(source('dyson-226397-01', 'Dyson'), p)

    def test_14_vorwerk_recommendation_not_manual_identity(self):
        p = page('<h1>Recommendations VK200 VK7</h1><a href="/de/de/c/dam-home/downloads/user-manuals/vk200.pdf">Kobold VK200</a>')
        with self.assertRaises(ValueError):
            a.identity(source('vorwerk-vk7', 'Vorwerk'), p)

    def test_15_aeg_complete_pnc_not_short_index(self):
        p = page('<h1>PNC 900258638</h1><meta name="description" content="90025863800">')
        with self.assertRaisesRegex(ValueError, 'full PNC'):
            a.identity(source('aeg-90025863800', 'AEG'), p)

    def test_16_official_url_cannot_redirect_to_third_party(self):
        s = source(); s['finalUrl'] = 'https://www.miele.de.evil.invalid/product/11602400'
        with self.assertRaisesRegex(ValueError, 'OEM URL'):
            a.metadata(s)

    def test_17_same_oem_redirect_to_sibling_still_rejected(self):
        s = source(); s['finalUrl'] = s['url'].replace('11602400', '11602420')
        with self.assertRaisesRegex(ValueError, 'final URL'):
            a.metadata(s)

    def test_18_altered_checksum_rejected(self):
        with self.assertRaisesRegex(ValueError, 'checksum'):
            a.verify_body(source(), b'ALTERED!!')

    def test_19_hash_only_is_not_content(self):
        s = source(); s['bytes'] = 8
        with self.assertRaisesRegex(ValueError, 'checksum'):
            a.verify_body(s, b'synthetic')

    def test_20_unavailable_source_is_blocked_not_pass(self):
        receipts = json.loads((a.ROOT / 'new-receipts.json').read_text())
        receipts[0].update(status=403, error='SYNTHETIC OEM denial')
        r = a.new_observations(receipts=receipts)
        self.assertEqual(r[0]['status'], 'blocked')
        self.assertFalse(r[0]['fullExactIdentityVerified'])

    def test_21_license_escalation_rejected(self):
        receipts = json.loads((a.ROOT / 'new-receipts.json').read_text())
        receipts[0]['rights'] = {**a.RIGHTS, 'commercialUse': 'granted'}
        r = a.new_observations(receipts=receipts)
        self.assertIn('licence escalation', r[0]['error'])
        self.assertEqual(r[0]['status'], 'unverified')

    def test_22_unknown_fit_claim_rejected(self):
        receipts = json.loads((a.ROOT / 'new-receipts.json').read_text())
        receipts[0]['physicalFitApproved'] = True
        self.assertIn('unsupported claim', a.new_observations(receipts=receipts)[0]['error'])

    def test_23_raw_locator_traversal_rejected(self):
        receipts = json.loads((a.ROOT / 'new-receipts.json').read_text())
        receipts[0]['rawLocator'] = '../private-secret.html'
        self.assertIn('raw locator', a.new_observations(receipts=receipts)[0]['error'])

    def test_24_bosch_product_not_unproved_service_revision(self):
        p = page('<h1 data-testid="buy-area-title">BGL75X1PRQ</h1>' + flight({'productCode': 'BGL75X1PRQ', 'specifications': []}))
        a.identity(source('bosch-bgl75x1prq', 'Bosch'), p, 'BGL75X1PRQ')
        self.assertFalse(a.PRIORITIES[1]['fullExactIdentity'])
        with self.assertRaises(ValueError):
            a.identity(source('bosch-bgl75x1prq', 'Bosch'), p, 'BGL75X1PRQ/23')

    def test_25_wrong_html_locale(self):
        p = a.Page(miele().html.replace('de-DE', 'de-AT').encode())
        with self.assertRaisesRegex(ValueError, 'HTML market'):
            a.identity(source(), p, '11602400')

    def test_26_timestamps_require_actual_aware_observation(self):
        for value in ['2026-10-10', '', (dt.datetime.now(dt.timezone.utc) + dt.timedelta(days=1)).isoformat()]:
            s = source(); s['observedAt'] = value
            with self.assertRaises(ValueError):
                a.metadata(s)

    def test_27_cache_inside_git_refused(self):
        with self.assertRaisesRegex(ValueError, 'outside repository'):
            a.external(a.ROOT / 'raw')

    def test_28_duplicate_receipts_refused(self):
        receipts = json.loads((a.ROOT / 'new-receipts.json').read_text())
        receipts[1] = copy.deepcopy(receipts[0])
        with self.assertRaisesRegex(ValueError, 'duplicate'):
            a.new_observations(receipts=receipts)

    def test_29_missing_real_cache_no_pass(self):
        for r in a.new_observations('/unavailable-wave9-source-cache'):
            self.assertEqual(r['status'], 'unverified')
            self.assertEqual(r['fields'], [])

    def test_30_schema_not_synthetic_OEM_fixture(self):
        records = json.loads((a.ROOT / 'new-receipts.json').read_text())
        self.assertEqual(len(records), 3)
        for source_record, plan in zip(records, a.PRIORITIES):
            a.metadata({**source_record, 'brand': plan['brand']})
            self.assertEqual(source_record['url'], plan['url'])

    def test_31_fetch_refuses_old_cache_overwrite(self):
        with tempfile.TemporaryDirectory() as directory:
            with self.assertRaisesRegex(ValueError, 'overwrite'):
                a.fetch(directory)

    def test_32_response_size_bound(self):
        s = source(); s['bytes'] = 4_000_001
        with self.assertRaisesRegex(ValueError, 'body size'):
            a.metadata(s)

    def test_33_deceptive_token_prefix_not_exact(self):
        self.assertFalse(a.exact_token('000276060', '00027606'))
        self.assertFalse(a.exact_token('BGL75X1PRQ/23', 'BGL75X1PRQ'))

    def test_34_correct_synthetic_parser_control(self):
        fields = a.identity(source(), miele(), '11602400')
        self.assertEqual(fields[0]['value'], '11602400')
        self.assertTrue(all(f['locator'].startswith('/') for f in fields))

    def test_35_network_redirect_handler_does_not_follow_sibling(self):
        import urllib.request
        request = urllib.request.Request(a.PRIORITIES[0]['url'])
        with self.assertRaisesRegex(ValueError, 'redirect blocked'):
            a.RestrictedRedirect().redirect_request(request, None, 302, '', {}, request.full_url.replace('11602400', '11602420'))

    def test_36_hoover_wrong_sku_not_nearby_model(self):
        p = page('<h1>HF202P 011</h1><li><span class="detail-title">Produktname/Handelscode</span><span>HF202P 011</span></li><li><span class="detail-title">Produktcode</span><span>39401036</span></li>')
        with self.assertRaisesRegex(ValueError, 'identity mismatch'):
            a.identity(source('hoover-39401035', 'Hoover'), p, 'HF202P 011')

    def test_37_any_incomplete_fields_are_not_counted_as_verified(self):
        receipts = json.loads((a.ROOT / 'new-receipts.json').read_text())
        with tempfile.TemporaryDirectory() as directory, patch.object(a, 'verify_body', return_value=miele()):
            # Synthetic parser succeeds on identity but misses the required
            # technical field. No partial PASS may survive exception handling.
            for s in receipts:
                (Path(directory) / s['rawLocator']).write_bytes(b'SYNTHETIC')
            r = a.new_observations(directory, receipts)
        self.assertEqual(r[0]['status'], 'unverified')
        self.assertEqual(r[0]['fields'], [])
        self.assertFalse(r[0]['fullExactIdentityVerified'])

    def test_38_original_manifest_mutation_rejected(self):
        with patch.object(Path, 'read_bytes', return_value=b'[]'):
            with self.assertRaisesRegex(ValueError, 'manifest changed'):
                a.load_original_sources()

    def test_39_malicious_url_credentials_refused(self):
        s = source(); s['url'] = s['finalUrl'] = 'https://secret@www.miele.de/product/11602400'
        with self.assertRaisesRegex(ValueError, 'OEM URL'):
            a.metadata(s)

    def test_40_rights_always_separate_from_byte_match(self):
        r = a.report()
        for item in r['newObservations']:
            self.assertEqual(item['rights'], a.RIGHTS)
            self.assertFalse(item['physicalFitApproved'])
        self.assertEqual(r['counts']['rightsGranted'], 0)
        self.assertEqual(r['counts']['approvedRealFits'], 0)


if __name__ == '__main__':
    unittest.main()
