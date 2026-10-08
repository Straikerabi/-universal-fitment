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

changed("tests/catalog-v126.test.mjs",[(r"r\.brand==='Hoover'\)\.recordsWithoutParts,\s*22","r.brand==='Hoover').recordsWithoutParts,98")],"Hoover +76 zero-part model references")

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

# Cross-work tests were independently pinned to v1.28.0, where the other
# two brands had not been expanded. Test the final multi-brand invariants
# explicitly instead of comparing a no-longer-valid whole-other-brand hash.
miele=site/"tests/miele-models-wave2.test.mjs"
t=miele.read_text()
before="assert.equal(hash(products.filter(p => p.brand !== 'Miele')), audit.baseline.otherProductsSha256, 'other brands unchanged');"
assert t.count(before)==1
new="assert.equal(products.filter(p => p.brand === 'Dyson').length,98); assert.equal(products.filter(p => p.brand === 'Hoover').length,100); assert.equal(products.filter(p => p.brand === 'Samsung').length,77); // Other Work intakes are deliberately present."
t=t.replace(before,new,1)
for old,new in [
  ("catalogStats.modelCount, 943 + audit.result.addedModelCount","catalogStats.modelCount, 1082"),
  ("catalogStats.recordCount, 954 + audit.result.addedModelCount","catalogStats.recordCount, 1093"),
  ("0), 730 + audit.result.addedModelCount","0), 869"),
]:
 assert t.count(old)==1,(old,t.count(old))
 t=t.replace(old,new,1)
miele.write_text(t)

dyson=site/"tests/dyson-models-wave2.test.mjs"
t=dyson.read_text()
needle="assert.equal(digest(products.filter(p=>p.brand!=='Dyson')),evidence.baseline.otherBrandIndexSha256,'Other brand indices unchanged');"
assert t.count(needle)==1,(needle,t.count(needle))
t=t.replace(needle,"assert.equal(products.filter(p=>p.brand==='Miele'&&p.recordType==='model').length,87); assert.equal(products.filter(p=>p.brand==='Hoover').length,100); assert.equal(products.filter(p=>p.brand==='Samsung').length,77); // Cross-Work index additions explicitly allowed.",1)
for old,new in [("catalogStats.modelCount,981","catalogStats.modelCount,1082"),("catalogStats.recordCount,992","catalogStats.recordCount,1093")]:
 assert t.count(old)==1,(old,t.count(old))
 t=t.replace(old,new,1)
dyson.write_text(t)
print(json.dumps({"rebasedIntegrationTests":["miele-models-wave2","dyson-models-wave2"],"individualBrandArticleIntegrityAssertionsRetained":True}))

for file in ["src/data/miele-models-wave2.js","src/data/dyson-models-wave2.js","src/data/hoover-pack.js"]:
 assert (site/file).exists(),file
print(json.dumps({"count_sync":"complete","global_model_names":1082,"global_records":1093,"goal_slots":869,"catalog_articles":1940,"physical_parts":1822}))
