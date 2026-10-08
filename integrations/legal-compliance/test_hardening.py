import importlib.util
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest

spec=importlib.util.spec_from_file_location('hardening',Path(__file__).with_name('hardening.py'))
mod=importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

class TestHardening(unittest.TestCase):
    def test_repeated_and_content(self):
        with TemporaryDirectory() as folder:
            s=Path(folder)
            (s/'index.html').write_text('<!doctype html><html><head><title>X</title></head><body><div id="app"></div></body></html>')
            a=mod.apply(s)
            self.assertTrue(a['modified_index'])
            new=(s/'index.html').read_bytes()
            self.assertIn(b'Keine Bestellung',new)
            self.assertFalse(mod.apply(s)['modified_index'])
            self.assertEqual(new,(s/'index.html').read_bytes())
            self.assertFalse(mod.release_check(s)['ready'])

    def test_missing_anchors_fails_closed(self):
        with TemporaryDirectory() as folder:
            s=Path(folder)
            (s/'index.html').write_text('<html><body>No head</body></html>')
            with self.assertRaises(ValueError):mod.apply(s)
            self.assertFalse((s/mod.NOTICE_FILE).exists())

    def test_collision_fails_closed(self):
        with TemporaryDirectory() as folder:
            s=Path(folder)
            (s/'index.html').write_text('<html><head></head><body></body></html>')
            (s/mod.NOTICE_FILE).write_text('unrelated page')
            with self.assertRaises(ValueError):mod.apply(s)
            self.assertNotIn(mod.MARK_START,(s/'index.html').read_text())

    def test_release_check_never_auto_approves(self):
        with TemporaryDirectory() as folder:
            s=Path(folder)
            for file in ('impressum.html','datenschutz.html'):(s/file).write_text('unfinished')
            self.assertFalse(mod.release_check(s)['ready'])

    def test_login_guard_is_idempotent(self):
        with TemporaryDirectory() as folder:
            s=Path(folder)
            (s/'index.html').write_text('<html><head></head><body></body></html>')
            (s/'src/core').mkdir(parents=True)
            p=s/'src/core/pilot-client.js'
            p.write_text('async function run(auth,email,password){const signed=await auth.signInWithPassword({email,password});return signed;}')
            self.assertTrue(mod.apply(s)['login_guard_added'])
            guarded=p.read_text()
            self.assertIn('UF_GITHUB_PAGES_LOGIN_DISABLED',guarded)
            self.assertIn("hostname.toLowerCase().endsWith('.github.io')",guarded)
            self.assertFalse(mod.apply(s)['login_guard_added'])
            self.assertEqual(guarded,p.read_text())

    def test_inventory(self):
        with TemporaryDirectory() as folder:
            s=Path(folder)
            (s/'index.html').write_text('localStorage and fetch( and datenschutz and partnerTag')
            x=mod.inventory(s)
            for name in ('browser_storage','external_network','imprint_privacy','affiliate'):
                self.assertGreater(x['counts'][name],0)

if __name__=='__main__': unittest.main()
