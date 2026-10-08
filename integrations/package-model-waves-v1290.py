"""Build/record a single coordinated release from three model-only Work streams."""
from pathlib import Path
import json,re,sys

root=Path(__file__).resolve().parent.parent
site=root/"site"
old="1.28.2"
new="1.29.0"
phase=sys.argv[1]

def exactly(file,old,new):
    t=file.read_text()
    assert t.count(old)==1,(str(file),old,t.count(old))
    file.write_text(t.replace(old,new,1))

if phase=="bump":
    pkg=json.loads((site/"package.json").read_text())
    assert pkg["version"]==old
    updated=[]
    for p in site.rglob("*"):
        if not p.is_file() or p.name.startswith(("app-v","catalog-","services-v")):continue
        if p.suffix not in {".js",".mjs",".json",".html",".css",".webmanifest"}:continue
        t=p.read_text()
        o=t
        for n in range(6,0,-1):
            dot="\\"*n+"."
            o=o.replace("1"+dot+"28"+dot+"2","1"+dot+"29"+dot+"0")
        o=o.replace(old,new)
        if o!=t:
            p.write_text(o)
            updated.append(str(p.relative_to(site)))
    pkg=json.loads((site/"package.json").read_text())
    assert pkg["version"]==new
    assert "APP_VERSION = '1.29.0'" in (site/"src/app.js").read_text()
    assert "./app-v1.29.0.js" in (site/"index.html").read_text()
    assert "catalog-dyson-v1.29.0.js" in (site/"sw.js").read_text()
    print(json.dumps({"bumped":new,"files":updated}))

elif phase=="sync":
    f=site/"src/data/brand-index.js"
    t=f.read_text()
    tag="export const brandManifest="
    assert t.count(tag)==1
    before,rest=t.split(tag,1)
    anchor=";\napplyHooverIndexFitment"
    assert rest.count(anchor)==1
    payload,tail=rest.split(anchor,1)
    manifest=json.loads(payload)
    assert manifest["Dyson"]["modelCount"]==92 and manifest["Dyson"]["recordCount"]==98
    assert manifest["Dyson"]["physicalPartCount"]==185
    manifest["Dyson"]["packBytes"]=(site/"catalog-dyson-v1.29.0.js").stat().st_size
    f.write_text(before+tag+json.dumps(manifest,separators=(",",":"),ensure_ascii=False)+anchor+tail)
    f=site/"src/data/new-brands-index.js"
    t=f.read_text()
    tag="export const newBrandsManifest="
    assert t.count(tag)==1
    before,payload=t.split(tag,1)
    m=json.loads(payload.strip().rstrip(";"))
    assert m["Hoover"]["modelCount"]==100 and m["Hoover"]["partCount"]==60
    assert m["Samsung"]["modelCount"]==77 and m["Samsung"]["partCount"]==46
    m["Hoover"]["packBytes"]=(site/"catalog-hoover-v1.29.0.js").stat().st_size
    m["Samsung"]["packBytes"]=(site/"catalog-samsung-v1.29.0.js").stat().st_size
    f.write_text(before+tag+json.dumps(m,separators=(",",":"),ensure_ascii=False)+";\n")
    print(json.dumps({"sync":"source pack bytes","dyson":manifest["Dyson"]["packBytes"],"hoover":m["Hoover"]["packBytes"],"samsung":m["Samsung"]["packBytes"]}))

elif phase=="finish":
    report={
     "release":"1.29.0","checkedDate":"2026-10-08",
     "baseVersion":"1.28.2",
     "originalWorkPullRequests":[30,32,31],
     "miele":{"previousModelNames":57,"newModelNames":82,"newNames":25,"newRecords":25,"partsUnchanged":167,"newFitment":0,"unlinkedNew":25,"evidence":"integrations/miele-model-research-wave2.json"},
     "dyson":{"previousModelNames":54,"newModelNames":92,"newNames":38,"newRecords":38,"partsUnchanged":191,"physicalPartsUnchanged":185,"newFitment":0,"unlinkedNew":38,
       "note":"92 catalog references, NOT a manufacturer-confirmed tally of 92 independent constructions","evidence":"integrations/dyson-model-research-wave2.json"},
     "hoover":{"previousModelNames":24,"newModelNames":100,"newNames":76,"newRecords":76,"partsUnchanged":60,"newFitment":0,"unlinkedNew":76,
       "sourceRegions":{"DE":3,"FR":1,"GB":72},"note":"Only 3 of 76 new Hoover models have DE primary sources; 72 GB and 1 FR references are not German offers","evidence":"integrations/hoover-model-research-wave2.json"},
     "totalNewModelNames":139,"modelNames":1082,"modelRecords":1093,"targetSlotsOf1000":869,
     "totalParts":1940,"totalPhysicalParts":1822,"modelRecordsWithoutParts":447,
     "realDevicePartRelationshipsNew":0,"newPricingClaims":0,
     "preservedVersions":["v1.28.1 Samsung 10 original SKUs","v1.28.2 iPhone manufacturer links fixed"],
     "checks":["each original Work importer applied to the exact locked baseline in isolated branches",
       "all three source outputs 3-way merged on verified production v1.28.2",
       "shared model parsing merged from precise brand-specific edits",
       "Samsung 46 physical parts preserved","full app tests and independent Miele/Dyson model suites",
       "all JS syntax and deterministic browser bundle build","SHA256 verified patch replay and source checkpoint restore"],
     "limitations":["Model reference is not a separately proven device construction","Most new Hoover sources originate outside DE",
       "All new devices require verified original parts catalog matching","Real physical iOS Safari test not run by this CI"]
    }
    (root/"integrations/model-wave2-release-v1290.json").write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n")
    readme=root/"README.md"
    updates=[
      ("# Universal Fitment v1.28.2","# Universal Fitment v1.29.0"),
      ("**943 Modellbezeichnungen in 954","**1.082 Modellbezeichnungen in 1.093"),
      ("730 von 1.000 gedeckelten Modellplätzen","869 von 1.000 gedeckelten Modellplätzen"),
      ("| Miele | 57 | 62 | 167 | 0 | 0 |","| Miele | 82 | 87 | 167 | 0 | 25 |"),
      ("| Dyson | 54 | 60 | 185 | 6 | 2 |","| Dyson | 92 | 98 | 185 | 6 | 40 |"),
      ("| Hoover | 24 | 24 | 60 | 0 | 22 |","| Hoover | 100 | 100 | 60 | 0 | 98 |"),
      ("308 Modelleinträge haben noch keine","447 Modelleinträge haben noch keine"),
      ("Noch offen sind die Modellziele für sechs Marken","Noch offen sind die Modellziele für vier Marken")
    ]
    for a,b in updates:exactly(readme,a,b)
    t=readme.read_text()
    marker="\n## Teile auf einen Blick"
    assert t.count(marker)==1
    add=("""
**v1.29.0 – zweite Modellwelle:** Miele +25 historisch dokumentierte S-Geräteprofile (jetzt 82), Dyson +38 offizielle Modell-/Generationsreferenzen (jetzt 92 Katalognamen) und Hoover +76 produktcodegenaue Geräte (jetzt 100). **Dysons 92 Katalognamen sind ausdrücklich keine 92 bestätigten unabhängigen Gerätekonstruktionen.** Von den 76 Hoover-Neuzugängen stammen 72 aus britischen und einer aus französischen Herstellerquellen; nur drei neue Modelle aus Deutschland. Ausländische Modelle sind keine deutsche Lager-/Verkaufsbehauptung. Alle **139 neuen Geräte starten ohne ungeprüfte Teilezuordnung**. Gesamt: 1.082 verschiedene Katalognamen in 1.093 Modelleinträgen, 869/1.000 Zielplätze. **1.940 Artikel und 1.822 physische Artikel unverändert**. Quellen, abgelehnte und offene Kandidaten: [Miele](integrations/miele-models-wave2.md), [Dyson](integrations/dyson-models-wave2.md), [Hoover](integrations/hoover-models-wave2.md). [Releasebericht](integrations/model-wave2-release-v1290.json).

""")
    readme.write_text(t.replace(marker,"\n"+add+marker,1))
    c=root/"CHANGELOG.md"
    t=c.read_text()
    h="# Universal Fitment — Patchnotes / patch notes\n"
    assert t.startswith(h) and "## v1.29.0" not in t
    c.write_text(t.replace(h,h+"""
## v1.29.0 — 8. Oktober 2026

- **DE:** Drei unabhängig geprüfte Work-Arbeitsstränge auf v1.28.2 integriert: +25 Miele-S-Codes, +38 Dyson-Modell-/Generationsbelege, +76 Hoover-Grundgeräte mit achtstelligem Original-Produktcode. Herkunft und Grenzen werden pro Gerät dokumentiert.
- **DE:** 1.082 Modellnamen, 1.093 Modelleinträge, 869/1.000 auf Marken gedeckelte Modellplätze. Dyson 92 Katalognamen ≠ 92 belegte unabhängige Konstruktionen. Hoover 72/76 neue Geräte aus GB, 1 FR, 3 DE.
- **DE:** Alle 1.940 bisherigen Katalogartikel, 1.822 physische Artikel und vorhandene Fitmentbeziehungen erhalten. **Keine** erfundenen Teilepassungen oder deutschen Angebote für neue Auslandsmodelle. 447 Modelleinträge benötigen noch gerätespezifisch geprüfte Teile.
- **DE:** Gemeinsame Miele-/Dyson-/Hoover-Typenschildregeln und Regressionstests zusammengeführt; mobile Fixes aus v1.28.2 und Samsung-Originalartikel v1.28.1 bleiben erhalten.
- **EN:** Adds 139 primary-source manufacturer model references across Miele, Dyson and Hoover. No inferred articles, prices or exact part compatibility.

""",1))
    plan=root/"integrations/model-first-plan-v1270.md"
    t=plan.read_text()
    t=t.replace("(v1.28.0)","(v1.29.0)",1)
    for a,b in [
      ("| Miele | 57 | 43 | 3 |","| Miele | 82 | 18 | Work #30 integrated |"),
      ("| Dyson | 54 | 46 | 4 |","| Dyson | 92 | 8 | Work #32 integrated; construction count unresolved |"),
      ("| Hoover | 24 | 76 | 5 |","| Hoover | 100 | 0 | Work #31 integrated; 72 GB, 1 FR, 3 DE |"),
      ("730 von 1.000 gedeckelten Modellplätzen; 270 noch offen. 943 Modellbezeichnungen, 954 konkreten Modelleinträge",
       "869 von 1.000 gedeckelten Modellplätzen; 131 noch offen. 1.082 Modellbezeichnungen, 1.093 konkreten Modelleinträge"),
      ("308 Modelleinträge aktuell ohne gelistete Teile","447 Modelleinträge aktuell ohne gelistete Teile")
    ]:
       assert t.count(a)==1,(a,t.count(a))
       t=t.replace(a,b,1)
    plan.write_text(t)
    state=root/"integrations/overnight-state-2026-10-08.json"
    d=json.loads(state.read_text())
    d["current_totals"]={"version":new,"model_names":1082,"model_records":1093,
      "articles":1940,"physical_parts":1822,"models_without_parts":447,"target_slots":869}
    for brand,count,phys,missing in [("Miele",82,167,25),("Dyson",92,185,40),("Hoover",100,60,98)]:
       items=[x for x in d["coverage"] if x["brand"]==brand]
       assert len(items)==1
       items[0].update(models=count,physical_parts=phys,models_without_parts=missing)
    d["completed_notes"].append("v1.29.0: Miele +25, Dyson +38 (nur Referenzen), Hoover +76 (72 GB, 1 FR, 3 DE) in einem integrierten Release mit vollständigen QA-Gates. 1082/1093 Modelle/Records, 869/1000 Zielplätze, 1940/1822 Artikel unverändert.")
    state.write_text(json.dumps(d,indent=2,ensure_ascii=False)+"\n")
    print(json.dumps({"preparedRelease":new,"modelNames":1082,"modelRecords":1093,"targetSlots":869,
        "modelsWithoutParts":447,"articlesUnchanged":1940,"newFitment":0}))
else:
    raise SystemExit("Use bump|sync|finish")
