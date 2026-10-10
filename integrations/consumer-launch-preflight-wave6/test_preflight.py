import contextlib
import copy
import hashlib
import io
import json
from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest.mock import patch

import preflight as p


class PreflightTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.groups, cls.errors = p.sources(p.ROOT)
        cls.inv = p.inventory(cls.groups)
        cls.lock = json.loads((p.HERE / 'source-lock.json').read_text())

    def report(self, **kwargs):
        return p.evaluate(self.inv, self.errors, lock=self.lock, **kwargs)

    def check(self, report, id):
        return next(c for c in report['checks'] if c['id'] == id)

    def stopped(self, report):
        self.assertEqual(report['overall'], 'BLOCKED')
        self.assertIs(report['launchApproved'], False)
        self.assertIs(report['commercialApproved'], False)
        self.assertEqual(self.check(report, 'human-release')['status'], 'BLOCKED')

    def test_actual_sources_and_lock(self):
        self.assertEqual(self.errors, [])
        self.assertEqual(len(self.inv['checkpoint']['files']), 136)
        self.assertEqual(len(self.inv['consumer']['files']), 26)
        for id in ('source-access', 'source-identity'):
            self.assertEqual(self.check(self.report(), id)['status'], 'PASS')

    def test_empty_example_stops_every_mode(self):
        example = json.loads((p.HERE / 'receipts.example.json').read_text())
        for mode in p.MODES:
            with self.subTest(mode=mode):
                report = self.report(mode=mode, receipts=example)
                self.stopped(report)
                for id in ('operator', 'privacy', 'rights', 'hosting', 'business-tax'):
                    self.assertEqual(self.check(report, id)['status'], 'BLOCKED')

    def test_placeholder_and_arbitrary_data_never_accepted_or_echoed(self):
        for value in ('', 'TODO', 'unknown', 'example', 'Muster', '<operator>', 'REPLACE_ME', 'a'*64, '0'*64, True, None, 123, [], {}):
            with self.subTest(value=value):
                report = self.report(receipts={'operator': value})
                self.stopped(report)
                self.assertEqual(self.check(report, 'receipt-schema')['status'], 'BLOCKED')
                self.assertEqual(self.check(report, 'operator')['status'], 'BLOCKED')
        for data in ([], '', True, {'address': 'DO_NOT_ECHO'}, {'launchApproved': True}, {'price': 999}):
            report = self.report(receipts=data)
            self.stopped(report)
            self.assertEqual(self.check(report, 'receipt-schema')['status'], 'BLOCKED')
            self.assertNotIn('DO_NOT_ECHO', json.dumps(report))

    def test_digest_is_not_a_real_review(self):
        ids = [c['id'] for c in self.report(mode='affiliate')['checks'] if c['status'] == 'BLOCKED' and c['id'] not in ('human-release', 'checkpoint-legal-navigation', 'consumer-legal-navigation')]
        refs = {id: hashlib.sha256(('synthetic:'+id).encode()).hexdigest() for id in ids}
        for mode in p.MODES:
            report = self.report(mode=mode, receipts=refs)
            self.stopped(report)
            self.assertEqual(self.check(report, 'receipt-schema')['status'], 'PASS')
            self.assertEqual(self.check(report, 'privacy')['status'], 'UNKNOWN')
            self.assertNotIn(list(refs.values())[0], json.dumps(report))

    def test_mode_boundaries(self):
        for mode in p.MODES:
            report = self.report(mode=mode)
            for id, active in [('affiliate-disclosure', mode == 'affiliate'), ('offer-prices', mode == 'affiliate'), ('b2b-contract-security', mode == 'b2b-saas')]:
                check = self.check(report, id)
                self.assertEqual(check['applicable'], active)
                self.assertEqual(check['status'], 'BLOCKED' if active else 'PASS')
            self.stopped(report)
        with self.assertRaises(ValueError):
            self.report(mode='checkout')

    def test_source_drift_and_missing_access_are_unknown(self):
        changed = copy.deepcopy(self.inv)
        changed['consumer']['files']['new.mjs'] = '0'*64
        report = p.evaluate(changed, [], lock=self.lock)
        self.assertEqual(self.check(report, 'source-identity')['status'], 'UNKNOWN')
        self.stopped(report)
        for malformed in ([], 'lock', 1, None):
            report = p.evaluate(self.inv, [], lock=malformed)
            self.assertEqual(self.check(report, 'source-identity')['status'], 'UNKNOWN')
            self.stopped(report)
        report = p.evaluate({'checkpoint': {}, 'consumer': {}}, ['no access'], lock=self.lock)
        for id in ('source-access', 'source-identity', 'checkpoint-legal-navigation', 'consumer-legal-navigation'):
            self.assertEqual(self.check(report, id)['status'], 'UNKNOWN')
        self.stopped(report)

    def test_candidates_never_prove_real_legal_documents(self):
        changed = copy.deepcopy(self.inv)
        changed['consumer']['observations']['legal_link_candidates'] = [{'file': 'index.html', 'line': 1, 'count': 1}]
        report = p.evaluate(changed, [], lock=self.lock)
        self.assertEqual(self.check(report, 'consumer-legal-navigation')['status'], 'UNKNOWN')
        self.stopped(report)

    def test_actual_findings(self):
        old = self.inv['checkpoint']['observations']
        new = self.inv['consumer']['observations']
        self.assertEqual(old['legal_link_candidates'], [])
        self.assertEqual(new['legal_link_candidates'], [])
        self.assertTrue(old['password_login'])
        self.assertTrue(old['logout'])
        self.assertEqual(old['account_delete_candidates'], [])
        for obs in (old, new):
            self.assertTrue(obs['storage_access'])
            self.assertTrue(obs['service_worker'])
            self.assertTrue(obs['local_erase'])
            self.assertEqual(obs['oauth_calls'], [])
            self.assertEqual(obs['affiliate_candidates'], [])
        self.assertEqual(new['password_login'], [])
        self.assertEqual(new['image_references'], [])

    def test_report_has_only_locations_counts_and_hashes(self):
        encoded = json.dumps(self.report())
        for forbidden in ('sb_publishable_', 'riorfdgoovydfyzjwdvf', 'signInWithPassword({email', 'uf:preferences:v1'):
            self.assertNotIn(forbidden, encoded)
        for group in self.inv.values():
            for refs in group['observations'].values():
                for ref in refs:
                    self.assertEqual(set(ref), {'file', 'line', 'count'})
                    self.assertGreater(ref['line'], 0)

    def test_no_network_or_execution_during_inventory(self):
        with patch('socket.socket', side_effect=AssertionError('network forbidden')), patch('subprocess.run', side_effect=AssertionError('execution forbidden')):
            groups, errors = p.sources(p.ROOT)
            self.assertEqual(errors, [])
            self.assertEqual(p.inventory(groups), self.inv)

    def test_checkpoint_checksum_and_identity_fail_closed(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            (root / 'integrations').mkdir()
            (root / 'integrations/source-checkpoint.json').write_text('{}')
            groups, errors = p.sources(root)
            self.assertFalse(groups['checkpoint'])
            self.assertTrue(errors)
        original = p.safe_read
        def corrupt(root, name):
            return b'AAAA' if name.endswith('part-000') else original(root, name)
        with patch.object(p, 'safe_read', side_effect=corrupt):
            groups, errors = p.sources(p.ROOT)
            self.assertFalse(groups['checkpoint'])
            self.assertTrue(errors)

    def test_safe_read_rejects_traversal_and_symlinks(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            (root / 'actual').write_text('synthetic')
            (root / 'alias').symlink_to(root / 'actual')
            for name in ('../actual', '/etc/passwd', 'alias', 'x\\y'):
                with self.subTest(name=name), self.assertRaises(ValueError):
                    p.safe_read(root, name)

    def test_cli_all_modes_exit_two_and_deterministic(self):
        for mode in p.MODES:
            args = [sys_executable(), str(p.HERE / 'preflight.py'), '--mode', mode, '--json']
            one = subprocess.run(args, capture_output=True, text=True)
            two = subprocess.run(args, capture_output=True, text=True)
            self.assertEqual(one.returncode, 2)
            self.assertEqual(one.stdout, two.stdout)
            self.stopped(json.loads(one.stdout))
            self.assertEqual(one.stderr, '')

    def test_cli_invalid_private_input_redacted(self):
        with tempfile.TemporaryDirectory() as temp:
            path = Path(temp) / 'synthetic.json'
            for content in ('{DO_NOT_ECHO', '{"address":"DO_NOT_ECHO"}', '[]'):
                path.write_text(content)
                output = io.StringIO()
                with contextlib.redirect_stdout(output):
                    code = p.main(['--receipts', str(path), '--json'])
                self.assertEqual(code, 2)
                self.assertNotIn('DO_NOT_ECHO', output.getvalue())
                self.assertFalse(json.loads(output.getvalue())['commercialApproved'])

    def test_cli_rejects_oversize_receipts(self):
        with tempfile.TemporaryDirectory() as temp:
            path = Path(temp) / 'synthetic.json'
            path.write_text(' ' * 65537)
            output = io.StringIO()
            with contextlib.redirect_stdout(output):
                self.assertEqual(p.main(['--receipts', str(path), '--json']), 2)
            self.assertFalse(json.loads(output.getvalue())['launchApproved'])

    def test_example_report_is_reproducible(self):
        saved = json.loads((p.HERE / 'baseline-report.json').read_text())
        self.assertEqual(saved, self.report())


def sys_executable():
    import sys
    return sys.executable


if __name__ == '__main__':
    unittest.main()
