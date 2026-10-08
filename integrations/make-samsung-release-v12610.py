"""Three-phase, source-backed Samsung accessory release packaging."""
from pathlib import Path
import json, re, shutil, subprocess, sys

root=Path(__file__).resolve().parent.parent
site=root/"site"
phase=sys.argv[1]
old="1.26.9"
new="1.26.10"

def replace_once(file, old_text, new_text):
    contents=file.read_text()
    assert contents.count(old_text)==1, (file,old_text)
    file.write_text(contents.replace(old_text,new_text,1))

if phase=="prepare":
    assert json.loads((site/"package.json").read_text())["version"]==old
    baseline=root/"baseline"/"site"
    assert not baseline.exists()
    shutil.copytree(site,baseline)
    for path in [site/"src/app.js",site/"package.json",site/"index.html",site/"sw.js",*sorted((site/"tests").glob("*.mjs"))]:
        content=path.read_text()
        updated=content
        for escapes in range(5,0,-1):
            dot="\\"*escapes+"."
            updated=updated.replace("1"+dot+"26"+dot+"9","1"+dot+"26"+dot+"10")
        updated=updated.replace(old,new)
        if updated!=content:
            path.write_text(updated)
    assert json.loads((site/"package.json").read_text())["version"]==new
    assert "APP_VERSION = '1.26.10'" in (site/"src/app.js").read_text()
    tests=site/"tests"/"catalog-v126.test.mjs"
    replace_once(tests,"r.brand==='Samsung').recordsWithoutParts,57","r.brand==='Samsung').recordsWithoutParts,53")
    anchor="assert.equal(catalogCoverage().find(r=>r.brand==='Samsung').recordsWithoutParts,53);"
    cases="""const newlyLinkedSamsungModels=[['VS15A60BGR5',8],['VS20C85G7TB',9],['VS20C95D4TK',9],['VS20C85G4TB',9]];
for(const [code,count] of newlyLinkedSamsungModels){
 const model=products.find(p=>p.brand==='Samsung'&&p.identifiers.some(id=>id.value===code));
 assert.ok(model,'Samsung model with source-linked option list: '+code);
 assert.equal(model.parts.length,count,'exact option count: '+code);
 assert.equal(model.physicalPartCount,count);
 assert.ok(model.parts.every(p=>p.fitment.status==='variant_check_required'));
}
"""
    replace_once(tests,anchor,anchor+"\n"+cases)
    print(json.dumps({"stage":"prepared","old":old,"new":new}))

elif phase=="sync":
    compiled=site/"catalog-samsung-v1.26.10.js"
    assert compiled.exists(),compiled
    size=compiled.stat().st_size
    file=site/"src/data"/"new-brands-index.js"
    text=file.read_text()
    marker="export const newBrandsManifest="
    assert text.count(marker)==1
    before,after=text.split(marker)
    manifest=json.loads(after.strip().rstrip(";"))
    manifest["Samsung"]["packBytes"]=size
    file.write_text(before+marker+json.dumps(manifest,ensure_ascii=False,separators=(",",":"))+";\n")
    print(json.dumps({"stage":"synced","samsung_pack_bytes":size}))

elif phase=="finish":
    release={"version":new,"source_date":"2026-10-08","samsung_models":66,"samsung_physical_articles":34,
             "new_optional_relationships":35,"new_distinct_articles":0,
             "samsung_models_with_parts":13,"samsung_models_without_parts":53,
             "catalog_articles":1928,"catalog_physical_articles":1810,
             "model_names":870,"model_records":881,"model_target_slots":657,
             "total_models_without_parts":242,
             "limitations":["Manufacturer optional list; not a technical fitment approval",
                            "No prices, stock or shipping inferred","Mop and Clean Station accessories still require corresponding attachment"]}
    (root/"integrations/samsung-release-v12610.json").write_text(json.dumps(release,ensure_ascii=False,indent=2)+"\n")
    readme=root/"README.md"
    text=readme.read_text()
    text=text.replace("# Universal Fitment v1.26.9","# Universal Fitment v1.26.10",1)
    replace={
       "| Samsung | 66 | 66 | 34 | 0 | 57 |":"| Samsung | 66 | 66 | 34 | 0 | 53 |",
       "60 zuvor leere Modelleinträge":"64 zuvor leere Modelleinträge",
       "246 Modelleinträge haben noch keine":"242 Modelleinträge haben noch keine",
       "Neun genaue deutsche /WD-Modelle verfügen":"13 genaue deutsche /WD-Modelle verfügen"
    }
    for a,b in replace.items():
        assert a in text,a
        text=text.replace(a,b)
    extra="\n\nVier weitere genaue Samsung-Geräte erhalten in v1.26.10 zusammen **35** ausdrücklich auf den deutschen Herstellerseiten gelistete Zubehörbeziehungen. Die Artikelzahl erhöht sich nicht: alle 17 beteiligten Artikelkennungen sind bereits erfasst. Die zusätzlichen Modelle sind Jet 65 PetPRO, Jet 85 Wet & Clean, Jet 85 CompleteClean und Jet 95 Akku+ CompleteClean. Details: [Samsung-Quellen v1.26.10](integrations/samsung-optional-batch2-2026-10-08.json).\n"
    text=text.replace("Hoover enthält 24 deutsche Hersteller-Modelle",extra+"\nHoover enthält 24 deutsche Hersteller-Modelle",1)
    readme.write_text(text)
    changelog=root/"CHANGELOG.md"
    content=changelog.read_text()
    insert="""## v1.26.10 — 8. Oktober 2026

- **DE:** Vier vorhandene Samsung-Staubsauger erhalten 35 exakte optionale Zubehör-Zuordnungen aus den deutschen Herstellerseiten. Jetzt 13 von 66 Samsung-Modellen mit konkreter Zubehörliste; 53 bleiben offen.
- **DE:** Bestehende Artikelkennungen wiederverwendet, ohne neue Teile zu erfinden. Samsung bleibt bei 34 verschiedenen Artikeln, der Gesamtkatalog bei 1.928.
- **EN:** Added 35 manufacturer-listed optional accessory links to four existing Samsung models. No duplicate articles, prices, stock or guaranteed fitment inferred.
- **Prüfung:** Tests, reproduzierbare Browserpakete, SHA-geprüftes Versionspatch und Quellarchiv vor Deployment. CI/Pages folgt gesondert.

"""
    assert "## v1.26.10" not in content
    header="# Universal Fitment — Patchnotes / patch notes\n"
    assert content.startswith(header)
    changelog.write_text(content.replace(header,header+"\n"+insert,1))
    print(json.dumps({"stage":"docs","release":release}))

else:
    raise SystemExit("Choose prepare, sync or finish")
