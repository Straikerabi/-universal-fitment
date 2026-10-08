import copy
import importlib.util
import json
import unittest
from pathlib import Path
from tempfile import TemporaryDirectory

root=Path(__file__).parent
spec=importlib.util.spec_from_file_location('launch_preflight',root/'launch_preflight.py')
mod=importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
example=json.loads((root/'operator.example.json').read_text())

class CommercialGateTests(unittest.TestCase):
    def test_example_blocks_without_leaking_values(self):
        with TemporaryDirectory() as d:
            p=Path(d)
            (p/'index.html').write_text('<html></html>')
            a=mod.assess(copy.deepcopy(example),p)
            self.assertFalse(a['ready_for_manual_release_review'])
            self.assertFalse(a['automatic_production_approval'])
            self.assertIn('operator.legal_name',a['missing'])
            self.assertIn('site/datenschutz.html',a['missing'])

    def test_complete_self_attestation_only_reaches_review(self):
        with TemporaryDirectory() as d:
            p=Path(d)
            cfg=copy.deepcopy(example)
            cfg['operator'].update(legal_form='individual', legal_name='Testbetrieb Muster')
            cfg['operator']['business_address'].update(street='Pruefweg',house_number='1',postal_code='12345',city='Teststadt')
            cfg['operator'].update(public_email='kontakt@betrieb.test',additional_immediate_contact='Rueckrufkontakt')
            cfg['hosting'].update(production_domain='betrieb.test',provider='Test Provider')
            cfg['business']['gewerbe_registration_confirmed']=True
            for key in cfg['hosting']:
                if key.endswith('approved') or key.endswith('checked'):cfg['hosting'][key]=True
            for group in ('privacy','marketplace','content','launch'):
                for key in cfg[group]:
                    cfg[group][key]=True
            (p/'index.html').write_text('<a href="impressum.html">Impressum</a><a href="datenschutz.html">Datenschutz</a>')
            for name in ('impressum.html','datenschutz.html'):
                (p/name).write_text('<html>'+('Reviewed content for a separate fake integration test. '*20)+'</html>')
            status=mod.assess(cfg,p)
            self.assertEqual([],status['missing'],status)
            self.assertTrue(status['ready_for_manual_release_review'])
            self.assertFalse(status['automatic_production_approval'])
            cfg['hosting']['production_domain']='straikerabi.github.io'
            self.assertIn('hosting.production_domain:not-commercial-github-pages',mod.assess(cfg,p)['missing'])

    def test_individual_vs_registered_company(self):
        with TemporaryDirectory() as d:
            cfg=copy.deepcopy(example)
            cfg['operator']['commercial_register']={'registered':True,'court':'','number':''}
            status=mod.assess(cfg,Path(d))
            self.assertIn('operator.commercial_register.court',status['missing'])
            self.assertIn('operator.commercial_register.number',status['missing'])

    def test_fake_pages_are_not_compliance(self):
        with TemporaryDirectory() as d:
            p=Path(d)
            (p/'index.html').write_text('impressum.html datenschutz.html')
            (p/'impressum.html').write_text('TODO')
            (p/'datenschutz.html').write_text('Lorem ipsum')
            a=mod.assess(example,p)
            self.assertIn('site/datenschutz.html:needs-manual-content-review',a['missing'])
            self.assertIn('site/impressum.html:needs-manual-content-review',a['missing'])

    def test_checkout_needs_own_legal_review(self):
        with TemporaryDirectory() as d:
            cfg=copy.deepcopy(example)
            cfg['business']['own_checkout_enabled']=True
            status=mod.assess(cfg,Path(d))
            self.assertIn('business.own_checkout_enabled:must-be-false-for-this-scope',status['missing'])

if __name__=='__main__': unittest.main()
