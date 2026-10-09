"""Precisely reviewed model+parts merge collisions. No generic last-write-wins behavior."""
import json

SUPPORTED = {
    "package.json", "src/data/brand-index.js", "src/data/samsung-pack.js",
    "tests/catalog-v126.test.mjs", "tests/vorwerk-expansion.test.mjs",
}

def once(text,old,new):
    if text.count(old)!=1:
        raise ValueError("Expected precisely one reviewed anchor: "+old)
    return text.replace(old,new)

def resolve(path,baseline,model,parts):
    if path not in SUPPORTED: return None
    b,m,p=[x.decode("utf-8") for x in (baseline,model,parts)]
    if path=="package.json":
        old,mm,pp=map(json.loads,(b,m,p))
        old_test=old["scripts"]["test"]
        ms=" && node tests/model-gap-wave3.test.mjs"
        ps=" && node tests/parts-fitment-wave3.test.mjs"
        if mm["scripts"]["test"]!=old_test+ms or pp["scripts"]["test"]!=old_test+ps:
            raise ValueError("Unexpected worker test script")
        chk=json.loads(m);chk["scripts"]["test"]=old_test
        if chk!=old:raise ValueError("Unreviewed model package fields")
        chk=json.loads(p);chk["scripts"]["test"]=old_test
        chk["scripts"]["check"]=old["scripts"]["check"]
        if chk!=old:raise ValueError("Unreviewed parts package fields")
        mm["scripts"]["test"]=old_test+ms+ps
        mm["scripts"]["check"]=pp["scripts"]["check"]
        return (json.dumps(mm,indent=2,ensure_ascii=False)+"\n").encode()
    if path in {"src/data/brand-index.js","src/data/samsung-pack.js"}:
        if not m.startswith(b) or not p.startswith(b):
            raise ValueError("Not a strictly append-only approved source modification")
        result=b+m[len(b):]+p[len(b):]
        if path=="src/data/brand-index.js":
            result+="\nif(typeof brandManifest.Samsung.note==='string')brandManifest.Samsung.note=brandManifest.Samsung.note.replace(/^77 Geräteeinträge;/,'79 Geräteeinträge;');\n"
        return result.encode()
    if path=="tests/catalog-v126.test.mjs":
        edits=[
          ("progress.find(r=>r.brand==='Samsung').partsMissing,54","progress.find(r=>r.brand==='Samsung').partsMissing,49"),
          ("progress.find(r=>r.brand==='Hoover').partsMissing,40","progress.find(r=>r.brand==='Hoover').partsMissing,24"),
          ("hooverParts.length,60","hooverParts.length,76"),
          ("hooverParts.filter(p=>p.modelIds.length).length,12","hooverParts.filter(p=>p.modelIds.length).length,30"),
          ("r.brand==='Hoover').recordsWithoutParts,98","r.brand==='Hoover').recordsWithoutParts,95"),
          ("samsungParts.length,46","samsungParts.length,51"),
          ("samsungParts.filter(p=>p.modelIds.length).length,29","samsungParts.filter(p=>p.modelIds.length).length,32"),
          ("r.brand==='Samsung').recordsWithoutParts,59","r.brand==='Samsung').recordsWithoutParts,56"),
          ("partCoverage:'missing'}).length,59","partCoverage:'missing'}).length,56"),
          ("assert.equal(device.parts.length,0,'Model-first: do not infer technical parts from optional lists');","assert.equal(device.parts.length,code==='VS70H28HEK'?5:8,'Only source-listed exact /WD accessories');"),
          ("assert.equal(device.partCount,0);","assert.equal(device.partCount,code==='VS70H28HEK'?5:8);"),
          ("assert.equal(device.physicalPartCount,0);","assert.equal(device.physicalPartCount,code==='VS70H28HEK'?5:8);")
        ]
        for a,z in edits:m=once(m,a,z)
        if "recordsWithoutParts,56" not in m or "models,79" not in m:
            raise ValueError("Combined Samsung model and article coverage lost")
        return m.encode()
    if path=="tests/vorwerk-expansion.test.mjs":
        for a,z in [
          ("size,1940","size,1961"),
          ("length,1940","length,1961"),
          ("1,921 distinct articles","1,961 distinct articles")
        ]:
            m=m.replace(a,z)
        if "brandPack.models.slice(0,18).map(m=>m.code)" not in m:
            raise ValueError("Historic Vorwerk original scope lost")
        return m.encode()
    return None
