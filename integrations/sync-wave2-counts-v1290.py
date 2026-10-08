"""Reconcile only known global and per-brand regression counters after Wave2 merge.

Never relax assertions or fake test results. Counts are explicitly derived from
three reviewed Work model-only intakes, and original article totals stay fixed.
"""
from pathlib import Path
import json,re,sys
site=Path(sys.argv[1]).resolve()

def changed(file,patterns, label):
    p=site/file
    t=p.read_text()
    old=t
    for pattern,new in patterns:
        t,n=re.subn(pattern,new,t)
        if n:
            print(json.dumps({"file":file,"label":label,"pattern":pattern[:75],"changed":n}))
    if t!=old:p.write_text(t)

counts=[
  (r'catalogStats\.modelCount,\s*\d+', 'catalogStats.modelCount,1082'),
  (r'catalogStats\.recordCount,\s*\d+', 'catalogStats.recordCount,1093'),
  (r'progress\.reduce\(\(n,r\)=>n\+r\.slots,0\),\s*\d+', 'progress.reduce((n,r)=>n+r.slots,0),869'),
  (r'r\.slots,0\),\s*\d+', 'r.slots,0),869'),
]
for test in ["tests/catalog-seven-brands.test.mjs","tests/vorwerk-expansion.test.mjs"]:
    changed(test,counts,"combined global model counters")

brands=[
 (r"\['Miele',\s*\d+,\s*167\]", "['Miele',82,167]"),
 (r"\['Dyson',\s*\d+,\s*191\]", "['Dyson',92,191]"),
 (r"\['Hoover',\s*\d+,\s*60\]", "['Hoover',100,60]")
]
changed("tests/philips-expansion.test.mjs",brands,"reviewed brand counts")

package=site/"package.json"
pkg=json.loads(package.read_text())
assert pkg["version"]=="1.28.2"
for script,addition in [
 ("test","node tests/miele-models-wave2.test.mjs"),
 ("test","node tests/dyson-models-wave2.test.mjs"),
 ("check","node --check src/data/miele-models-wave2.js"),
 ("check","node --check src/data/dyson-models-wave2.js"),
 ("check","node --check tests/dyson-models-wave2.test.mjs"),
]:
 if addition not in pkg["scripts"][script]:
    pkg["scripts"][script]+=" && "+addition
    print(json.dumps({"script":script,"added":addition}))
package.write_text(json.dumps(pkg,indent=2,ensure_ascii=False)+"\n")

for file in ["src/data/miele-models-wave2.js","src/data/dyson-models-wave2.js","src/data/hoover-pack.js"]:
 assert (site/file).exists(),file
print(json.dumps({"count_sync":"complete","global_model_names":1082,"global_records":1093,"goal_slots":869,"catalog_articles":1940,"physical_parts":1822}))
