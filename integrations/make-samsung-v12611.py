"""Build and package source-linked Samsung v1.26.11 using audited checkpoints."""
from pathlib import Path
import json, shutil, sys

root=Path(__file__).resolve().parent.parent
site=root/"site"
phase=sys.argv[1]
version_from="1.26.10"
version_to="1.26.11"

def replace_exact(path, a, b):
    text=path.read_text()
    assert text.count(a)==1, (str(path),a)
    path.write_text(text.replace(a,b,1))

if phase=="prepare":
    assert json.loads((site/"package.json").read_text())["version"]==version_from
    target=root/"baseline"/"site"
    assert not target.exists()
    shutil.copytree(site,target)
    converted=[]
    for path in site.rglob("*"):
        if not path.is_file() or path.name.startswith(("app-v","catalog-","services-v")):
            continue
        if path.suffix not in {".js",".mjs",".json",".html",".css",".webmanifest"}: continue
        old=path.read_text()
        content=old
        for escapes in range(5,0,-1):
            escaped="\\"*escapes+"."
            content=content.replace("1"+escaped+"26"+escaped+"10","1"+escaped+"26"+escaped+"11")
        content=content.replace(version_from,version_to)
        if content!=old:
            path.write_text(content)
            converted.append(str(path.relative_to(site)))
    assert json.loads((site/"package.json").read_text())["version"]==version_to
    assert "APP_VERSION = '1.26.11'" in (site/"src/app.js").read_text()
    assert "./app-v1.26.11.js" in (site/"index.html").read_text()
    assert "catalog-samsung-v1.26.11.js" in (site/"sw.js").read_text()
    test=site/"tests/catalog-v126.test.mjs"
    for a,b in [
        ("r.brand==='Samsung').partsMissing,66","r.brand==='Samsung').partsMissing,65"),
        ("samsungParts.length,34","samsungParts.length,35"),
        ("p.modelIds.length).length,26","p.modelIds.length).length,27"),
        ("r.brand==='Samsung').recordsWithoutParts,53","r.brand==='Samsung').recordsWithoutParts,49"),
    ]:replace_exact(test,a,b)
    anchor="assert.equal(catalogCoverage().find(r=>r.brand==='Samsung').recordsWithoutParts,49);"
    assertions="""const samsungBatch3=[
 ['VS20C85G2TN',10],['VS20B95B43N',11],['VS20B95B73B',11],['VS20A95973B',4]
];
for(const [code,count] of samsungBatch3){
 const model=products.find(p=>p.brand==='Samsung'&&p.identifiers.some(i=>i.value===code));
 assert.ok(model,'Exact Samsung v1.26.11 model '+code);
 assert.equal(model.parts.length,count,'Model exact optional accessory count '+code);
 assert.equal(model.physicalPartCount,count);
 assert.ok(model.parts.every(p=>p.fitment.status==='variant_check_required'));
}
assert.ok(samsungParts.find(p=>p.identifiers.some(i=>i.value==='VCA-SABA95'))?.modelIds.length===1);
const newSamsungBrush=samsungParts.find(p=>p.identifiers.some(i=>i.value==='VCA-SABA95'));
assert.equal(quoteForPart(newSamsungBrush),null);
assert.equal(installationTime(newSamsungBrush).status,'unknown');
assert.ok(!samsungParts.find(p=>p.identifiers.some(i=>i.value==='VCA-SPW95'))?.modelIds.includes('vac-samsung-model-vs20c85g2tn'),'Unsuffixed pad not silently linked to /VT models');
"""
    replace_exact(test,anchor,anchor+"\n"+assertions)
    alltest=site/"tests/vorwerk-expansion.test.mjs"
    for a,b in [(".size,1928",".size,1929"),("partsCatalog.length,1928","partsCatalog.length,1929")]:
        replace_exact(alltest,a,b)
    print(json.dumps({"phase":"prepare","converted_version_files":converted,"test_assertions_updated":True}))

elif phase=="sync":
    compiled=site/"catalog-samsung-v1.26.11.js"
    assert compiled.is_file()
    bytesize=compiled.stat().st_size
    path=site/"src/data/new-brands-index.js"
    content=path.read_text()
    sep="export const newBrandsManifest="
    assert content.count(sep)==1
    start,end=content.split(sep)
    manifest=json.loads(end.strip().rstrip(";"))
    assert manifest["Samsung"]["partCount"]==35
    manifest["Samsung"]["packBytes"]=bytesize
    path.write_text(start+sep+json.dumps(manifest,ensure_ascii=False,separators=(",",":"))+";\n")
    print(json.dumps({"phase":"sync","samsung_pack_bytes":bytesize}))

elif phase=="finish":
    report={"version":"1.26.11","date":"2026-10-08","manufacturer_evidence":"integrations/samsung-evidence-v12611.json",
      "added_exact_optional_relationships":36,"new_unique_article_codes":["VCA-SABA95"],
      "newly_populated_models":4,"samsung_models":66,"samsung_articles":35,
      "samsung_models_with_parts":17,"samsung_models_without_parts":49,
      "all_model_names":870,"all_model_records":881,
      "all_catalog_articles":1929,"all_physical_articles":1811,
      "total_model_entries_without_parts":238,"model_target_slots":657,
      "validation":["full unit test suite","static syntax","reproducible main+optional bundles","SHA256 patch replay","SHA256 source checkpoint restore"],
      "no_claims":["guaranteed physical fitment","current price or inventory","present-day bestseller ranking","availability for purchase"]}
    (root/"integrations/samsung-release-v12611.json").write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n")
    readme=root/"README.md"
    doc=readme.read_text()
    for a,b in [
      ("# Universal Fitment v1.26.10","# Universal Fitment v1.26.11"),
      ("1.928 unterschiedliche Katalogartikel","1.929 unterschiedliche Katalogartikel"),
      ("**1.810**","**1.811**"),
      ("| Samsung | 66 | 66 | 34 | 0 | 53 |","| Samsung | 66 | 66 | 35 | 0 | 49 |"),
      ("315 zusätzliche benannte Herstellerartikel","316 zusätzliche benannte Herstellerartikel"),
      ("Samsung +34","Samsung +35"),
      ("64 zuvor leere Modelleinträge","68 zuvor leere Modelleinträge"),
      ("13 genaue deutsche /WD-Modelle verfügen","17 genaue deutsche /WD- und /WA-Modelle verfügen"),
      ("26 unterschiedliche Artikel wenigstens einem Modell zugeordnet","27 unterschiedliche Artikel wenigstens einem Modell zugeordnet"),
      ("mindestens 66 weitere Samsung-","mindestens 65 weitere Samsung-"),
      ("242 Modelleinträge haben noch keine","238 Modelleinträge haben noch keine")
    ]:replace_exact(readme,a,b)
    doc=readme.read_text()
    marker="\nHoover enthält 24 deutsche Hersteller-Modelle"
    assert doc.count(marker)==1
    paragraph=("\n\nIn **v1.26.11** wurden vier weitere, bereits vorhandene Samsung-Modelle mit zusammen "
      "**36** exakten Herstellernennungen optionaler Zubehörkennungen verbunden: Jet 85 PetPRO, "
      "Bespoke Jet Plus 100, Bespoke Jet Plus Akku+ Wet & Clean und Bespoke Jet PetPRO extra. "
      "Die neue Slim Action Bürste **VCA-SABA95** ist als eigenständiger Originalzubehör-Artikel erfasst. "
      "Die Modellvarianten /WD und /WA sowie die Codes VCA-SPW95 und VCA-SPW95/VT bleiben ausdrücklich getrennt. "
      "Herstellerquellen: [Samsung-Zubehörnachweise v1.26.11](integrations/samsung-evidence-v12611.json).\n")
    readme.write_text(doc.replace(marker,paragraph+marker,1))
    changelog=root/"CHANGELOG.md"
    c=changelog.read_text()
    head="# Universal Fitment — Patchnotes / patch notes\n"
    assert c.startswith(head) and "## v1.26.11" not in c
    changelog.write_text(c.replace(head,head+"""
## v1.26.11 — 8. Oktober 2026

- **DE:** Vier Samsung-Geräte mit 36 belegten optionalen Zubehörbeziehungen ergänzt. Jetzt 17 von 66 Samsung-Geräten mit expliziter Zubehörliste, noch 49 ohne Zuordnung.
- **DE:** Ein neuer eindeutig benannter Originalartikel: VCA-SABA95 Slim Action Bürste. Samsung zählt 35, der gesamte Katalog 1.929 unterschiedliche Artikel. Variantenkennungen /WD, /WA und /VT bleiben getrennt.
- **EN:** 36 optional OEM accessory references across four exact Samsung devices, including one new VCA-SABA95 brush article. Explicit fitment check and accessory prerequisites remain; no live price or stock claim.
- **Release:** Local build, tests and source/patch checks are followed by independent GitHub Pages CI verification.

""",1))
    print(json.dumps({"phase":"finish","report":report}))

else:
    raise SystemExit("Usage: make-samsung-v12611.py prepare|sync|finish")
