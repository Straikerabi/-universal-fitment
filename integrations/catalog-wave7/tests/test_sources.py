"""Replay real private receipts; rejection mutants below are SYNTHETIC, never OEM facts."""
import copy
import hashlib
import importlib.util
import json
import os
import shutil
import tempfile
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('fresh_importer',ROOT/'import_sources.py')
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)


class FreshReplay(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.cache=Path(os.environ['UF_OEM_AUDIT_CACHE'])
        cls.sources=json.loads((ROOT/'sources.json').read_text())

    def mutant(self,key,old,new,repin):
        with tempfile.TemporaryDirectory(prefix='uf-wave7-mutant-') as temp:
            root=Path(temp)
            for s in self.sources:
                shutil.copyfile(self.cache/(s['id']+'.html'),root/(s['id']+'.html'))
            target=root/(key+'.html');data=target.read_bytes();self.assertIn(old,data);changed=data.replace(old,new);target.write_bytes(changed)
            sources=copy.deepcopy(self.sources)
            if repin:
                # Simulated newly reviewed bytes cannot relax contextual identity binding.
                s=next(s for s in sources if s['id']==key);s['sha256']=hashlib.sha256(changed).hexdigest();s['bytes']=len(changed)
            with self.assertRaises(ValueError):m.extract(root,sources)

    def test_all_private_pins_and_scoped_facts_reproduce_byte_identical_pilot(self):
        actual=m.extract(self.cache,self.sources)
        self.assertEqual(m.dump(actual),(ROOT/'pilot.json').read_text())
        self.assertEqual((len(actual['sources']),len(actual['devices']),len(actual['parts']),len(actual['listings'])),(33,18,11,14))

    def test_changed_body_not_silently_repinned(self):
        self.mutant('miele-11602450',b'Materialnummer',b'Mutantnummer',False)

    def test_complete_pnc_index_required(self):
        self.mutant('aeg-90025863800',b'900 258 638 00',b'900 258 638 01',True)

    def test_samsung_de_country_suffix_required(self):
        self.mutant('samsung-vs20c85g4pb-wd',b'VS20C85G4PB/WD',b'VS20C85G4PB/WA',True)

    def test_dyson_links_cannot_use_another_full_sku(self):
        self.mutant('dyson-227312-01',b'.227312-01',b'.227312-99',True)

    def test_bom_index_cannot_transfer_from_sibling(self):
        self.mutant('siemens-bom-vs06a110-03',b'VS06A110/03',b'VS06A110/12',True)

    def test_vorwerk_own_listing_cannot_transfer_to_vk200(self):
        self.mutant('vorwerk-fp7',b'>VK7<',b'>VK200<',True)

    def test_miele_part_must_have_an_own_scoped_card(self):
        self.mutant('miele-11602450',b'/product/11639250/',b'/product/99999999/',True)


if __name__=='__main__':unittest.main()
