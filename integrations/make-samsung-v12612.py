"""Prepare a source-verified Samsung v1.26.12 release with exact /WD model-to-article evidence."""
from pathlib import Path
import sys, json, shutil

root=Path(__file__).resolve().parent.parent
site=root/"site"
phase=sys.argv[1]
old_version="1.26.11"
new_version="1.26.12"

def replace(path,from_text,to_text):
    text=path.read_text()
    assert text.count(from_text)==1,(str(path),from_text)
    path.write_text(text.replace(from_text,to_text,1))

if phase=="prepare":
    assert json.loads((site/"package.json").read_text())["version"]==old_version
    baseline=root/"baseline/site"
    assert not baseline.exists()
    shutil.copytree(site,baseline)
    edited=[]
    for file in site.rglob("*"):
        if not file.is_file() or file.name.startswith(("app-v","catalog-","services-v")): continue
        if file.suffix not in {".js",".mjs",".json",".html",".css",".webmanifest"}: continue
        original=file.read_text()
        updated=original
        for n in range(5,0,-1):
            dot="\\"*n+"."
            updated=updated.replace("1"+dot+"26"+dot+"11","1"+dot+"26"+dot+"12")
        updated=updated.replace(old_version,new_version)
        if updated!=original:
            file.write_text(updated)
            edited.append(str(file.relative_to(site)))
    assert json.loads((site/"package.json").read_text())["version"]==new_version
    assert "APP_VERSION = '1.26.12'" in (site/"src/app.js").read_text()
    assert "./app-v1.26.12.js" in (site/"index.html").read_text()
    assert "catalog-samsung-v1.26.12.js" in (site/"sw.js").read_text()
    tests=site/"tests/catalog-v126.test.mjs"
    for a,b in [
        ("r.brand==='Samsung').partsMissing,65","r.brand==='Samsung').partsMissing,64"),
        ("samsungParts.length,35","samsungParts.length,36"),
        ("p.modelIds.length).length,27","p.modelIds.length).length,29"),
        ("r.brand==='Samsung').recordsWithoutParts,49","r.brand==='Samsung').recordsWithoutParts,47"),
        ("r.brand==='Samsung').models,66","r.brand==='Samsung').models,67"),
    ]: replace(tests,a,b)
    anchor="assert.equal(catalogCoverage().find(r=>r.brand==='Samsung').recordsWithoutParts,47);"
    checks="""const samsungJetAIVariants=[['VS28C97B4QK',4],['VS28C97B7QK',4],['VS80F28EGS',6]];
for(const [code,count] of samsungJetAIVariants){
 const device=products.find(p=>p.brand==='Samsung'&&p.identifiers.some(i=>i.value===code));
 assert.ok(device,'Exact /WD Samsung AI model '+code);
 assert.equal(device.parts.length,count,'Samsung explicit optional accessories '+code);
 assert.equal(device.physicalPartCount,count);
 assert.ok(device.parts.every(p=>p.fitment.status==='variant_check_required'));
}
assert.equal(catalogCoverage().find(r=>r.brand==='Samsung').models,67);
const jetBrush=samsungParts.find(p=>p.identifiers.some(i=>i.value==='VCA-SABC97/GL'));
assert.ok(jetBrush,'Distinct Slim LED+ brush model VCA-SABC97/GL');
assert.equal(jetBrush.modelIds.length,2,'Attach this brush only to source-listed two exact /WD models');
assert.equal(quoteForPart(jetBrush),null);
assert.equal(installationTime(jetBrush).status,'unknown');
"""
    replace(tests,anchor,anchor+"\n"+checks)
    totals=site/"tests/catalog-seven-brands.test.mjs"
    for a,b in [("catalogStats.modelCount,870","catalogStats.modelCount,871"),("catalogStats.recordCount,881","catalogStats.recordCount,882"),("r.slots,0),657","r.slots,0),658")]: replace(totals,a,b)
    legacy=site/"tests/vorwerk-expansion.test.mjs"
    for a,b in [
        ("catalogStats.modelCount,870","catalogStats.modelCount,871"),
        ("catalogStats.recordCount,881","catalogStats.recordCount,882"),
        (".size,1929",".size,1930"),
        ("partsCatalog.length,1929","partsCatalog.length,1930"),
        ("r.slots,0),657","r.slots,0),658"),
    ]: replace(legacy,a,b)
    print(json.dumps({"phase":"prepare","updated_version_files":edited,"new_version":new_version}))

elif phase=="sync":
    compiled=site/"catalog-samsung-v1.26.12.js"
    assert compiled.is_file()
    size=compiled.stat().st_size
    idx=site/"src/data/new-brands-index.js"
    source=idx.read_text()
    tag="export const newBrandsManifest="
    assert source.count(tag)==1
    prefix,post=source.split(tag)
    manifest=json.loads(post.strip().rstrip(";"))
    assert manifest["Samsung"]["modelCount"]==67
    assert manifest["Samsung"]["partCount"]==36
    manifest["Samsung"]["packBytes"]=size
    idx.write_text(prefix+tag+json.dumps(manifest,separators=(",",":"),ensure_ascii=False)+";\n")
    print(json.dumps({"phase":"sync","compiled_samsung_pack_bytes":size}))

elif phase=="finish":
    report={"version":new_version,"source_date":"2026-10-08",
        "evidence_file":"integrations/samsung-evidence-v12612.json",
        "new_model_references":1,"new_distinct_articles":1,"new_source_optional_relationships":14,
        "samsung_models":67,"samsung_articles":36,
        "samsung_models_with_parts":20,"samsung_models_without_parts":47,
        "all_model_names":871,"all_model_records":882,
        "all_catalog_articles":1930,"all_physical_articles":1812,
        "all_models_without_parts":236,"model_target_slots":658,
        "limitations":["Manufacturer-listed optional articles, not unqualified mechanical compatibility","No live prices, stock or shipping estimates","Wipe pads require matching mop attachment and station bags require station"],
        "validation":["App test suite","Code syntax","Reproducible browser bundles","SHA-256 verified patch replay","SHA-256 verified source checkpoint"]}
    (root/"integrations/samsung-release-v12612.json").write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n")
    readme=root/"README.md"
    for a,b in [
      ("# Universal Fitment v1.26.11","# Universal Fitment v1.26.12"),
      ("870 Modellbezeichnungen in 881","871 Modellbezeichnungen in 882"),
      ("1.929 unterschiedliche Katalogartikel","1.930 unterschiedliche Katalogartikel"),
      ("**1.811**","**1.812**"),
      ("657 von 1.000","658 von 1.000"),
      ("| Samsung | 66 | 66 | 35 | 0 | 49 |","| Samsung | 67 | 67 | 36 | 0 | 47 |"),
      ("316 zusätzliche benannte Herstellerartikel","317 zusätzliche benannte Herstellerartikel"),
      ("Samsung +35","Samsung +36"),
      ("68 zuvor leere Modelleinträge","70 zuvor leere Modelleinträge"),
      ("Samsung enthält 66 Hersteller-Modellreferenzen. 17","Samsung enthält 67 Hersteller-Modellreferenzen. 20"),
      ("27 unterschiedliche Artikel wenigstens einem Modell zugeordnet","29 unterschiedliche Artikel wenigstens einem Modell zugeordnet"),
      ("mindestens 65 weitere Samsung-","mindestens 64 weitere Samsung-"),
      ("238 Modelleinträge haben noch keine","236 Modelleinträge haben noch keine"),
    ]:replace(readme,a,b)
    t=readme.read_text()
    marker="\nHoover enthält 24 deutsche Hersteller-Modelle"
    assert t.count(marker)==1
    more="\n\nMit **v1.26.12** wurden zwei existierende Bespoke-Jet-AI-Modelle um vier exakte optional gelistete Zubehörartikel ergänzt. Zudem kommt der konkrete **VS80F28EGS/WD** (Bespoke AI Jet Akku+ Wet & Clean) mit sechs Zubehörnennungen hinzu. Die neu getrennt erfasste **Slim LED+ Hartbodenbürste VCA-SABC97/GL** wurde ausschließlich den beiden ausdrücklich belegten Modellen zugeordnet. Wischpads erfordern ihren Wischaufsatz, Stationsbeutel die passende Clean Station. Quellen: [Samsung-Ausbau v1.26.12](integrations/samsung-evidence-v12612.json).\n"
    readme.write_text(t.replace(marker,more+marker,1))
    history=root/"CHANGELOG.md"
    h=history.read_text()
    header="# Universal Fitment — Patchnotes / patch notes\n"
    assert h.startswith(header) and "## v1.26.12" not in h
    history.write_text(h.replace(header,header+"""
## v1.26.12 — 8. Oktober 2026

- **DE:** Zwei vorhandene Bespoke Jet AI /WD-Modelle und das neu erfasste VS80F28EGS/WD erhalten 14 exakt quellenbelegte optionale Zubehörbeziehungen; Samsung: 67 Modelle, 36 verschiedene Artikel, 20 Modelle mit Artikelzuordnungen.
- **DE:** Neu katalogisiert: Slim LED+ Hartbodenbürste VCA-SABC97/GL. Wisch-/Clean-Station-Bedingungen bleiben erhalten; kein erfundener Preis, Bestand oder pauschaler Passungsnachweis.
- **EN:** Added 14 optional accessory listings across two existing and one new Samsung Bespoke AI Jet /WD model; one distinct brush SKU. Exact suffix and attachment prerequisites remain.
- **Prüfung:** Vollständige Tests, SHA-geprüfter Patch-Replay, Quellen-Wiederherstellung und zusätzlicher GitHub-Pages-CI.

""",1))
    print(json.dumps({"phase":"finish","report":report}))
else:
    raise SystemExit("Choose prepare, sync or finish")
