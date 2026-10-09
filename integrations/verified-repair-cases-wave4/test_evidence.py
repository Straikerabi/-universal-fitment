"""Real document findings plus explicitly synthetic parser/mutation fixtures.

Tests never assert physical fitment and never add synthetic records to cases.json.
"""
import copy
import hashlib
import json
import tempfile
import unittest
from pathlib import Path
from source_audit import extract, replay, trusted
from validate import load, validate
from report import render


class EvidenceTests(unittest.TestCase):
    def setUp(self):
        self.data, self.audit, self.observations = load()

    def test_all_ten_real_document_cases_accepted_without_installation_release(self):
        result = validate(self.data, self.audit, self.observations)
        self.assertEqual((result['models'], result['brands'], result['reviewedAssemblies']), (10, 7, 30))
        self.assertEqual(result['fullyV1EligibleRealFitments'], 0)

    def test_eighteen_exact_scoped_listings_are_preserved(self):
        self.assertEqual(validate(self.data, self.audit, self.observations)['manufacturerListedOemEdges'], 18)

    def test_four_manufacturer_conditional_exclusions_are_distinct_from_unknowns(self):
        r = validate(self.data, self.audit, self.observations)
        self.assertEqual((r['sourceBackedConditionalNegatives'], r['explicitUnknownCases']), (4, 13))

    def test_shared_siemens_article_keeps_two_different_bom_positions(self):
        edges = [c['edges'][0] for c in self.data['cases'] if c['brand'] == 'Siemens']
        self.assertEqual([e['part']['code'] for e in edges], ['00027606', '00027606'])
        self.assertEqual([e['position'] for e in edges], ['0109', '0111'])

    def test_vorwerk_designations_are_not_invented_numeric_articles(self):
        c = self.data['cases'][-1]
        self.assertEqual([e['part']['code'] for e in c['edges']], ['FP7', 'MF7'])
        self.assertTrue(all(e['part']['namespace'] == 'designation' for e in c['edges']))

    def test_reports_are_deterministic_and_checked_in(self):
        from validate import ROOT
        a, b = render(*load()), render(*load())
        self.assertEqual(a, b)
        for path, content in a.items():
            self.assertEqual((ROOT / path).read_text(), content, path)

    def test_rejected_404_guesses_are_not_source_authority(self):
        ids = {s['id'] for s in self.audit['sources']}
        self.assertNotIn('dyson-screw', ids)
        self.assertNotIn('samsung-filter', ids)
        self.assertEqual(len(self.audit['rejectedLookups']), 2)

    def test_raw_response_hash_change_fails_closed(self):
        source = copy.deepcopy(self.audit['sources'][0])
        with tempfile.TemporaryDirectory() as folder:
            (Path(folder) / source['file']).write_bytes(b'changed page')
            with self.assertRaisesRegex(ValueError, 'source changed'):
                replay(Path(folder), [source], [])

    def test_manufacturer_subdomain_lookalike_is_not_trusted(self):
        s = copy.deepcopy(self.audit['sources'][0])
        s['url'] = 'https://www.miele.de.example.org/product/11639210'
        self.assertFalse(trusted(s))

    def test_untrusted_redirect_is_not_trusted(self):
        s = copy.deepcopy(self.audit['sources'][0])
        s['finalUrl'] = 'https://seller.example/part'
        self.assertFalse(trusted(s))

    def test_miele_only_reads_model_accessory_cards(self):
        html = b'<p>11602400 SNCF0</p><a href="/product/12785390/">unrelated</a><div class="hls-accessories-wrapper-item"><a href="/product/11639210/">filter</a></div>'
        r = extract(html, {'kind':'miele-accessories','scope':'11602400','requires':['11602400','SNCF0']})
        self.assertEqual(r['articles'], ['11639210'])

    def test_dyson_foreign_sku_card_is_not_a_model_edge(self):
        html = b'<p>V8 Absolute Pro</p><div class="plp-spare-card__item"><a href="/support/journey/spare-details.970145-06.268700-01">battery</a><a href="/support/journey/spare-details.967834-07.227312-01">battery</a></div>'
        r = extract(html, {'kind':'dyson-spares','scope':'227312-01','requires':['V8 Absolute Pro']})
        self.assertEqual(r['articles'], ['967834-07'])

    def test_samsung_recommendation_text_is_not_an_optional_accessory_spec(self):
        with self.assertRaisesRegex(ValueError, 'context ambiguous'):
            extract(b'<p>VS90F40EEK/WD VCA-SHFF90K</p>', {'kind':'samsung-optional','scope':'VS90F40EEK/WD','requires':['VS90F40EEK/WD']})

    def test_bsh_bom_requires_one_exact_variant_context(self):
        fixture = {'variantId':'VS06A110/12','bomRelations':[{'productId':'00027606','positionNumber':'0109'}]}
        chunk = '6:' + json.dumps(fixture)
        html = ('<p>VS06A110/03</p><script>self.__next_f.push(' + json.dumps([1, chunk]) + ')</script>').encode()
        with self.assertRaisesRegex(ValueError, 'variant context'):
            extract(html, {'kind':'bsh-bom','scope':'VS06A110/03','requires':['VS06A110/03']})

    def test_bsh_double_exact_context_is_rejected(self):
        fixture = {'variantId':'VS06A110/03','bomRelations':[]}
        chunk = '6:' + json.dumps([fixture, fixture])
        html = ('<p>VS06A110/03</p><script>self.__next_f.push(' + json.dumps([1, chunk]) + ')</script>').encode()
        with self.assertRaisesRegex(ValueError, 'variant context'):
            extract(html, {'kind':'bsh-bom','scope':'VS06A110/03','requires':['VS06A110/03']})


def mutation_test(mutate, message):
    def test(self):
        mutate(self.data, self.audit, self.observations)
        with self.assertRaisesRegex(ValueError, message):
            validate(self.data, self.audit, self.observations)
    return test


# Independent unsafe intake requests exercise actual schema/identity boundaries.
MUTATIONS = {
 'extra_approval_field': (lambda d,a,o: d['cases'][0]['edges'][0].update(approved=True), 'schema field'),
 'electrical_exclusion_wrong_assembly': (lambda d,a,o: d['cases'][9]['negativeCases'][0].update(assembly='bag'), 'broadened exclusion'),
 'duplicate_case': (lambda d,a,o: d['cases'].append(copy.deepcopy(d['cases'][0])), 'ten cases'),
 'duplicate_catalog_profile': (lambda d,a,o: d['cases'][1].update(catalogId=d['cases'][0]['catalogId']), 'duplicate catalog'),
 'wrong_branch': (lambda d,a,o: d.update(branch='main'), 'work baseline'),
 'unsupported_schema': (lambda d,a,o: d.update(schemaVersion='2'), 'unsupported schema'),
 'cross_region_device': (lambda d,a,o: d['cases'][8].update(market='US'), 'region transfer'),
 'observed_serial_invented': (lambda d,a,o: d['cases'][6]['observedDevice'].update(serial='YH5'), 'no real unit'),
 'unknown_connector_promoted': (lambda d,a,o: d['cases'][0]['edges'][0].update(connection='compatible'), 'unverified technical'),
 'fake_rights_grant': (lambda d,a,o: d['cases'][0]['edges'][0].update(reusePermission='granted'), 'unverified technical'),
 'uninspected_unit_promoted': (lambda d,a,o: d['cases'][0]['edges'][0].update(deviceInspection='verified'), 'unverified technical'),
 'unchecked_positive_release': (lambda d,a,o: d['cases'][0]['edges'][0].update(release='confirmed'), 'positive release'),
 'listing_becomes_fitment': (lambda d,a,o: d['cases'][0]['edges'][0].update(status='compatible'), 'positive release'),
 'unknowns_erased': (lambda d,a,o: d['cases'][0]['assemblies'][0].update(unknowns=[]), 'assembly completion'),
 'partial_assembly_completed': (lambda d,a,o: d['cases'][0]['assemblies'][0].update(completeness='complete'), 'assembly completion'),
 'cross_manufacturer_oem': (lambda d,a,o: d['cases'][0]['edges'][0]['part'].update(issuer='Bosch'), 'OEM identity'),
 'leading_zero_removed': (lambda d,a,o: d['cases'][3]['edges'][0]['part'].update(code='27606'), 'leading zeros'),
 'integer_oem_code': (lambda d,a,o: d['cases'][3]['edges'][0]['part'].update(code=27606), 'OEM identity'),
 'wrong_bom_position': (lambda d,a,o: d['cases'][3]['edges'][0].update(position='0111'), 'BOM article/position'),
 'siemens_revision_transfer': (lambda d,a,o: d['cases'][3]['edges'][0].update(scope='VS06A110/12'), 'scope/assembly'),
 'family_proof_transfer': (lambda d,a,o: d['cases'][3]['edges'][0].update(listingProof='vsz4-list'), 'variant listing'),
 'wrong_manufacturer_proof': (lambda d,a,o: d['cases'][0]['edges'][0].update(listingProof='bosch-list'), 'manufacturer'),
 'made_up_article': (lambda d,a,o: d['cases'][0]['edges'][0]['part'].update(code='99999999'), 'scoped manufacturer'),
 'unproven_suffix_alias': (lambda d,a,o: d['cases'][4]['edges'][0]['part']['aliases'].append('VZ10TFG'), 'alias normalization'),
 'aeg_pnc_truncated': (lambda d,a,o: d['cases'][5]['identifiers'].update(pnc='900258638'), 'full PNC'),
 'aeg_article_used_as_pnc': (lambda d,a,o: d['cases'][5]['identifiers'].update(pnc='9001677690'), 'full PNC'),
 'aeg_pnc_used_as_article': (lambda d,a,o: d['cases'][5]['edges'][0]['part'].update(code='90025863800'), 'AEG article'),
 'miele_type_changed': (lambda d,a,o: d['cases'][0]['identifiers'].update(type='SGSK5'), 'material/type'),
 'bosch_index_guessed': (lambda d,a,o: d['cases'][2]['identifiers'].update(eNrIndex='01'), 'unobserved Bosch'),
 'dyson_device_sku_as_article': (lambda d,a,o: d['cases'][6]['edges'][0]['part'].update(code='227312-01'), 'scoped manufacturer'),
 'dyson_wrong_identity_source': (lambda d,a,o: d['cases'][6]['edges'][0].update(identityProof='v11-battery-id'), 'OEM identity proof'),
 'samsung_k_m_transfer': (lambda d,a,o: d['cases'][8]['edges'][0]['part'].update(code='VCA-SHFF90M'), 'scoped manufacturer'),
 'samsung_other_region': (lambda d,a,o: d['cases'][8]['identifiers'].update(modelCode='VS90F40EEK/AA'), 'regional code'),
 'vorwerk_numeric_sku_invented': (lambda d,a,o: d['cases'][9]['edges'][0]['part'].update(code='123456'), 'designation statement'),
 'vorwerk_namespace_changed': (lambda d,a,o: d['cases'][9]['edges'][0]['part'].update(namespace='article'), 'OEM namespace'),
 'unknown_color_called_negative': (lambda d,a,o: d['cases'][8]['unknownCases'][0].update(status='excluded'), 'unknown promoted'),
 'yh5_exclusion_broadened_to_all_v8': (lambda d,a,o: d['cases'][6]['negativeCases'][0].update(when='Alle V8'), 'broadened exclusion'),
 'click_exclusion_wrong_target': (lambda d,a,o: d['cases'][7]['negativeCases'][0].update(target='970145-06'), 'broadened exclusion'),
 'electrical_exclusion_used_for_filter_bags': (lambda d,a,o: d['cases'][9]['negativeCases'][0].update(target='FP7'), 'broadened exclusion'),
 'source_forged': (lambda d,a,o: a['sources'][0].update(url='https://seller.example/item'), 'provenance changed'),
 'source_hash_forged': (lambda d,a,o: a['sources'][0].update(sha256='0'*64), 'provenance changed'),
 'normalized_article_evidence_forged': (lambda d,a,o: o[0]['observed']['articles'].append('99999999'), 'provenance changed'),
 'pdf_wrong_page': (lambda d,a,o: o[-1]['recipe'].update(page=14), 'provenance changed'),
}
for name, (mutation, message) in MUTATIONS.items():
    setattr(EvidenceTests, 'test_reject_' + name, mutation_test(mutation, message))

if __name__ == '__main__':
    unittest.main()
