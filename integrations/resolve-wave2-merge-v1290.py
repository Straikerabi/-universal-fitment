"""Reconcile three audited model-only Work source changes without discarding live Samsung/UI data.

Use only on the isolated local synthetic git source-merge repository; never
run git checkout --ours to silently discard product or model source changes.
"""
from __future__ import annotations

import difflib
import json
import re
import subprocess
import sys
from pathlib import Path

repo=Path(sys.argv[1]).resolve()
brand=sys.argv[2]
assert brand in ("miele","dyson","hoover"),brand

def git(*args):
    return subprocess.check_output(["git","-C",str(repo),*args],text=True)

def contents(stage,file):
    return git("show",f":{stage}:{file}")

def write(path,data):
    target=repo/path
    target.parent.mkdir(parents=True,exist_ok=True)
    target.write_text(data,encoding="utf-8")
    subprocess.run(["git","-C",str(repo),"add","--",path],check=True)

def parse_index(source):
    prefix="export const newBrandsIndex="
    mid="export const newBrandsManifest="
    assert source.count(prefix)==1 and source.count(mid)==1
    a,b=source.split(mid,1)
    i=json.loads(a.split(prefix,1)[1].strip().removesuffix(";"))
    m=json.loads(b.strip().removesuffix(";"))
    return i,m

def reconcile_hoover_index():
    a,b=parse_index(contents(2,"src/data/new-brands-index.js"))
    c,d=parse_index(contents(3,"src/data/new-brands-index.js"))
    original_samsung=[x for x in a if x["brand"]=="Samsung"]
    assert len(original_samsung)==77
    result=[x for x in c if x["brand"]!="Samsung"]+original_samsung
    # Original index order is Samsung then Hoover; don't change ordering.
    result=original_samsung+[x for x in c if x["brand"]=="Hoover"]
    assert len(result)==177
    assert len([x for x in result if x["brand"]=="Hoover"])==100
    assert len(set((x["brand"],x["code"]) for x in result))==177
    merged={**b,"Hoover":d["Hoover"]}
    assert merged["Samsung"]["partCount"]==46
    assert merged["Samsung"]["physicalPartCount"]==46
    assert merged["Samsung"]["modelCount"]==77
    assert merged["Hoover"]["modelCount"]==100
    write("src/data/new-brands-index.js",
        "// Samsung and Hoover exact device and source coverage, coordinated v1.29.0.\n"+
        "export const newBrandsIndex="+json.dumps(result,separators=(",",":"),ensure_ascii=False)+";\n"+
        "export const newBrandsManifest="+json.dumps(merged,separators=(",",":"),ensure_ascii=False)+";\n")
    print(json.dumps({"resolved":"src/data/new-brands-index.js","samsung":77,"hoover":100,"samsungParts":46}))

def reconcile_typeplate():
    file="src/core/typeplate.js"
    baseline=git("show",f"old:{file}")
    ours=contents(2,file)
    theirs=contents(3,file)
    # Only additive model-specific edits; do not let a conflicting line
    # discard existing recognized brands or change the surrounding parser.
    matcher=difflib.SequenceMatcher(None,baseline,theirs,autojunk=False)
    edits=[(tag,baseline[i:j],theirs[k:l],i) for tag,i,j,k,l in matcher.get_opcodes() if tag!="equal"]
    merged=ours
    report=[]
    for tag,before,after,loc in edits:
        if before:
            count=merged.count(before)
            if count!=1:
                print(json.dumps({"error":"model identity anchor mismatch","brand":brand,"tag":tag,"before":before[:360],"after":after[:360],"n":count}))
                raise AssertionError("Cannot safely apply identity edit: "+brand+" "+repr(before[:80]))
            merged=merged.replace(before,after,1)
        else:
            left=baseline[max(0,loc-45):loc]
            right=baseline[loc:loc+45]
            anchor=left+right
            if merged.count(anchor)==1:
                merged=merged.replace(anchor,left+after+right,1)
            else:
                print(json.dumps({"error":"ambiguous model insertion","brand":brand,"left":left,"right":right,"hits":merged.count(anchor)}))
                raise AssertionError("Cannot safely apply insertion: "+brand)
        report.append([tag,len(before),len(after)])
    assert "<<<<<<<" not in merged and ">>>>>>>" not in merged
    write(file,merged)
    print(json.dumps({"resolved":file,"brand":brand,"edits":report}))

unmerged=git("diff","--name-only","--diff-filter=U").strip().splitlines()
for name in unmerged:
    assert name in {
        "package.json","src/core/typeplate.js","src/data/new-brands-index.js",
        "tests/vorwerk-expansion.test.mjs","tests/catalog-seven-brands.test.mjs",
        "tests/philips-expansion.test.mjs"
    },"Unexpected overlapping source file, requires manual inspection: "+name
    if name=="src/core/typeplate.js":
        reconcile_typeplate()
    elif name=="src/data/new-brands-index.js":
        assert brand=="hoover"
        reconcile_hoover_index()
    else:
        # These files contain only stale brand-independent counts and app test
        # registrations; resolve them after all brand source merges.
        write(name,contents(2,name))
        print(json.dumps({"deferred_global_tests":name,"brand":brand}))
assert not git("diff","--name-only","--diff-filter=U").strip()
print(json.dumps({"merged_work":brand,"fileConflicts":len(unmerged)}))
