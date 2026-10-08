"""Release two exact-model Samsung references without claiming new part fitment."""
from pathlib import Path
import json, shutil, sys

root=Path(__file__).resolve().parent.parent
site=root/"site"
phase=sys.argv[1]
old="1.27.0";new="1.27.1"

def exact(path, a, b):
    value=path.read_text()
    assert value.count(a)==1,(str(path),a)
    path.write_text(value.replace(a,b,1))

if phase=="prepare":
    assert json.loads((site/"package.json").read_text())["version"]==old
    assert not (root/"baseline/site").exists()
    shutil.copytree(site,root/"baseline/site")
    updated=[]
    for p in site.rglob("*"):
        if not p.is_file() or p.name.startswith(("app-v","catalog-","services-v")):continue
        if p.suffix not in {".js",".mjs",".json",".html",".css",".webmanifest"}:continue
        t=p.read_text(); nxt=t
        for n in range(6,0,-1):
            dot="\\"*n+"."
            nxt=nxt.replace("1"+dot+"27"+dot+"0","1"+dot+"27"+dot+"1")
        nxt=nxt.replace(old,new)
        if t!=nxt:
            p.write_text(nxt)
            updated.append(str(p.relative_to(site)))
    assert json.loads((site/"package.json").read_text())["version"]==new
    assert "APP_VERSION = '1.27.1'" in (site/"src/app.js").read_text()
    assert "./app-v1.27.1.js" in (site/"index.html").read_text()
    assert "catalog-samsung-v1.27.1.js" in (site/"sw.js").read_text()
    for test in ("catalog-seven-brands.test.mjs","vorwerk-expansion.test.mjs"):
        file=site/"tests"/test
        for a,b in [
          ("catalogStats.modelCount,893","catalogStats.modelCount,895"),
          ("catalogStats.recordCount,904","catalogStats.recordCount,906"),
          ("r.slots,0),680","r.slots,0),682")
        ]:exact(file,a,b)
    file=site/"tests/catalog-v126.test.mjs"
    exact(file,"r.brand==='Samsung').recordsWithoutParts,47","r.brand==='Samsung').recordsWithoutParts,49")
    t=file.read_text()
    assert t.count("r.brand==='Samsung').models,67")==2,'Two existing model assertions expected'
    file.write_text(t.replace("r.brand==='Samsung').models,67","r.brand==='Samsung').models,69"))
    anchor="assert.equal(catalogCoverage().find(r=>r.brand==='Samsung').recordsWithoutParts,49);"
    additions="""const newSamsungDeviceCodes=['VS70H28HEK','VS80F28EFP'];
for(const code of newSamsungDeviceCodes){
 const device=products.find(p=>p.brand==='Samsung'&&p.identifiers.some(i=>i.value===code));
 assert.ok(device,'Samsung /WD model: '+code);
 assert.deepEqual(device.deviceReferences,[code+'/WD']);
 assert.equal(device.parts.length,0,'Model-first: do not infer technical parts from optional lists');
 assert.equal(device.partCount,0);
 assert.equal(device.physicalPartCount,0);
 assert.equal(device.deviceQuote,null,'No inferred retail offer');
 assert.ok(device.partListCoverage?.note);
 assert.ok(device.sources.some(s=>s.url.includes(code.toLowerCase()+'-wd/')),'Exact manufacturer model landing page');
}
assert.equal(filterCatalog({brand:'Samsung',partCoverage:'missing'}).length,49);
"""
    exact(file,anchor,anchor+"\n"+additions)
    print(json.dumps({"stage":"prepared","version":new,"updated_files":updated}))

elif phase=="sync":
    bundle=site/"catalog-samsung-v1.27.1.js"
    assert bundle.is_file()
    size=bundle.stat().st_size
    path=site/"src/data/new-brands-index.js"
    content=path.read_text()
    marker="export const newBrandsManifest="
    assert content.count(marker)==1
    before,after=content.split(marker)
    manifest=json.loads(after.strip().rstrip(";"))
    assert manifest["Samsung"]["modelCount"]==69
    assert manifest["Samsung"]["partCount"]==36
    manifest["Samsung"]["packBytes"]=size
    path.write_text(before+marker+json.dumps(manifest,separators=(",",":"),ensure_ascii=False)+";\n")
    print(json.dumps({"stage":"synced","samsung_pack_bytes":size}))

elif phase=="finish":
    release={"version":new,"source_date":"2026-10-08",
      "new_model_source":"integrations/samsung-model-first-v1271.json",
      "exact_new_model_codes":["VS70H28HEK/WD","VS80F28EFP/WD"],
      "new_model_references":2,"new_articles":0,"new_fitment_claims":0,
      "samsung_models":69,"samsung_models_without_parts":49,
      "samsung_physical_articles":36,
      "all_model_names":895,"all_model_records":906,
      "all_catalog_articles":1930,"all_physical_articles":1812,
      "all_models_without_parts":260,"all_model_goal_slots":682,
      "validation":["36 app tests","syntax","byte-identical compiled bundles","SHA-verified release patch replay","SHA-verified source checkpoint"],
      "limitations":["Manufacturer model listing is not a verified part-fitment matrix",
      "Specific article listing must be checked before a part relationship may be added",
      "No new price, availability, delivery, warranty or ranking claims"]}
    (root/"integrations/samsung-model-release-v1271.json").write_text(json.dumps(release,indent=2,ensure_ascii=False)+"\n")
    readme=root/"README.md"
    for a,b in [
      ("# Universal Fitment v1.27.0","# Universal Fitment v1.27.1"),
      ("893 Modellbezeichnungen in 904","895 Modellbezeichnungen in 906"),
      ("680 von 1.000","682 von 1.000"),
      ("| Samsung | 67 | 67 | 36 | 0 | 47 |","| Samsung | 69 | 69 | 36 | 0 | 49 |"),
      ("Samsung enthält 67 Hersteller-Modellreferenzen.","Samsung enthält 69 Hersteller-Modellreferenzen."),
      ("258 Modelleinträge haben noch keine","260 Modelleinträge haben noch keine")
    ]:exact(readme,a,b)
    t=readme.read_text()
    marker="\nHoover enthält 24 deutsche Hersteller-Modelle"
    assert t.count(marker)==1
    note="\n\n**Modell-zuerst v1.27.1:** Zwei weitere offiziell benannte Geräte wurden ohne spekulative Teilepassung aufgenommen: Samsung Jet 95S **VS70H28HEK/WD** und Bespoke AI Jet CompleteClean **VS80F28EFP/WD**. Beide Geräte sind unter der vollständigen deutschen /WD-Kennung und mit direkten Herstellerseiten gespeichert; einzelne Zubehörnennungen der Herstellerseite werden bis zur separate Artikelprüfung nur als Forschungsliste geführt. [Exakte Herstellerseiten](integrations/samsung-model-first-v1271.json).\n"
    readme.write_text(t.replace(marker,note+marker,1))
    c=root/"CHANGELOG.md"
    raw=c.read_text()
    header="# Universal Fitment — Patchnotes / patch notes\n"
    assert raw.startswith(header) and "## v1.27.1" not in raw
    c.write_text(raw.replace(header,header+"""
## v1.27.1 — 8. Oktober 2026

- **DE:** Zwei konkrete Samsung-Staubsauger mit nachgewiesener deutscher /WD-Modellkennung ergänzt: VS70H28HEK und VS80F28EFP. Samsung erreicht 69 unterschiedliche Modelle, 49 aktuell ohne erfasste Teile.
- **DE:** Modell-zuerst-Strategie: keine nicht nachgewiesene Ersatzteilpassung; 36 Samsung-Artikel und 1.930 Katalogartikel bleiben unverändert. Insgesamt 895 unterschiedliche Modellbezeichnungen und 682 von 1.000 Zielplätzen.
- **EN:** Two manufacturer-verified Samsung vacuum devices added without guessing optional-accessory fitment, prices or inventory. Tested release patch and source checkpoint.

""",1))
    plan=root/"integrations/model-first-plan-v1270.md"
    content=plan.read_text()
    assert "| Samsung | 67 | 33 | 1 |" in content
    content=content.replace("| Samsung | 67 | 33 | 1 |","| Samsung | 69 | 31 | 1 |")
    content=content.replace("680 von 1.000 gedeckelten Modellplätzen; 320 noch offen. 893 Modellbezeichnungen, 904 konkreten Modelleinträge","682 von 1.000 gedeckelten Modellplätzen; 318 noch offen. 895 Modellbezeichnungen, 906 konkreten Modelleinträge")
    content=content.replace("258 Modelleinträge aktuell ohne gelistete Teile","260 Modelleinträge aktuell ohne gelistete Teile")
    plan.write_text(content)
    print(json.dumps({"stage":"finished","release":release}))
else:
    raise SystemExit("Usage: package-samsung-models-v1271.py prepare|sync|finish")
