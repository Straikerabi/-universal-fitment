"""Integrate three isolated Work deliverables in their required sequence.

Stage Samsung and Bosch model imports before the independently verified UI
patch; reconcile only the two package.json script suffix additions from Bosch
and UX. No raw site files are committed on the GitHub source branch.
"""
import json
import os
import pathlib
import shutil
import subprocess
import sys

root=pathlib.Path(__file__).resolve().parent.parent
site=root/"site"
base=root/"baseline/site"
reference=root/"ui-standalone-site"
old="1.27.1"
new="1.28.0"


def run(*args):
    print("+", " ".join(str(x) for x in args),flush=True)
    subprocess.run([str(x) for x in args],cwd=root,check=True)


def verify_equal(x,y,label):
    assert x==y,(label,x,y)


def merge_ui():
    verify_equal(json.loads((site/"package.json").read_text())["version"],old,"model source version")
    verify_equal(json.loads((reference/"package.json").read_text())["version"],old,"UI source version")
    expected={
        "src/app.js","styles.css","src/core/model-parts-view.js","tests/model-parts-view.test.mjs"
    }
    for filename in expected:
        source=reference/filename
        target=site/filename
        if filename in {"src/app.js","styles.css"}:
            verify_equal((base/filename).read_bytes(),target.read_bytes(),"UI-only owned source "+filename)
        target.parent.mkdir(parents=True,exist_ok=True)
        shutil.copy2(source,target)

    base_pkg=json.loads((base/"package.json").read_text())
    bosch_pkg=json.loads((site/"package.json").read_text())
    ui_pkg=json.loads((reference/"package.json").read_text())
    for script in ("test","check"):
        baseline=base_pkg["scripts"][script]
        assert ui_pkg["scripts"][script].startswith(baseline)
        assert bosch_pkg["scripts"][script].startswith(baseline)
        delta=ui_pkg["scripts"][script][len(baseline):]
        assert delta in (" && node tests/model-parts-view.test.mjs"," && node --check src/core/model-parts-view.js")
        assert delta not in bosch_pkg["scripts"][script]
        bosch_pkg["scripts"][script]+=delta
    verify_equal(set(base_pkg["scripts"]),set(ui_pkg["scripts"]),"UI only extends scripts")
    for key in base_pkg:
        if key!="scripts":
            verify_equal(base_pkg[key],ui_pkg[key],"UI does not change manifest "+key)
    for key in base_pkg["scripts"]:
        if key not in ("test","check"):
            verify_equal(base_pkg["scripts"][key],ui_pkg["scripts"][key],"UI only extends tests/check")
    (site/"package.json").write_text(json.dumps(bosch_pkg,indent=2)+"\n")
    print(json.dumps({"merge":"Samsung → Bosch → UX","uiFiles":sorted(expected),
      "scripts":"Both Bosch and UX test/syntax suites retained","appTestGroups":38}))


def bump():
    assert json.loads((site/"package.json").read_text())["version"]==old
    changed=[]
    for p in site.rglob("*"):
        if not p.is_file() or p.name.startswith(("app-v","catalog-","services-v")):
            continue
        if p.suffix not in {".js",".mjs",".json",".html",".css",".webmanifest"}:
            continue
        original=p.read_text()
        updated=original
        for n in range(6,0,-1):
            dot="\\"*n+"."
            updated=updated.replace("1"+dot+"27"+dot+"1","1"+dot+"28"+dot+"0")
        updated=updated.replace(old,new)
        if updated!=original:
            p.write_text(updated)
            changed.append(str(p.relative_to(site)))
    pkg=json.loads((site/"package.json").read_text())
    verify_equal(pkg["version"],new,"release number")
    assert "APP_VERSION = '1.28.0'" in (site/"src/app.js").read_text()
    assert "./app-v1.28.0.js" in (site/"index.html").read_text()
    assert "catalog-samsung-v1.28.0.js" in (site/"sw.js").read_text()
    print(json.dumps({"versionBump":new,"files":changed}))


def sync():
    # Only the optional Samsung pack changed after the model import.
    bundle=site/"catalog-samsung-v1.28.0.js"
    assert bundle.exists()
    path=site/"src/data/new-brands-index.js"
    raw=path.read_text()
    tag="export const newBrandsManifest="
    assert raw.count(tag)==1
    before,after=raw.split(tag)
    data=json.loads(after.strip().rstrip(";"))
    verify_equal(data["Samsung"]["modelCount"],77,"Samsung model count")
    verify_equal(data["Samsung"]["partCount"],36,"No new OEM articles")
    data["Samsung"]["packBytes"]=bundle.stat().st_size
    path.write_text(before+tag+json.dumps(data,separators=(",",":"),ensure_ascii=False)+";\n")
    print(json.dumps({"samsungPackBytes":bundle.stat().st_size,"modelCount":77}))


def checks():
    # These counts reflect 8 Samsung and 40 Bosch independent ground devices.
    source=(site/"src/data/catalog.js").read_text()
    assert "catalogBrands=" in source
    index=(site/"src/data/new-brands-index.js").read_text()
    assert '"modelCount":77' in index
    records=(site/"src/data/bosch-models-next.js").read_text()
    assert "boschNextModels" in records
    suite=json.loads((site/"package.json").read_text())["scripts"]
    for value in ["tests/bosch-models-next.test.mjs","tests/model-parts-view.test.mjs"]:
        assert value in suite["test"]
    for value in ["src/data/bosch-models-next.js","src/core/model-parts-view.js"]:
        assert value in suite["check"]
    legacy=(site/"tests/catalog-seven-brands.test.mjs").read_text()
    for value in ["catalogStats.modelCount,943","catalogStats.recordCount,954","r.slots,0),730"]:
        assert value in legacy,("Combined model total missing",value)
    vorwerk=(site/"tests/vorwerk-expansion.test.mjs").read_text()
    for value in ["catalogStats.modelCount,943","catalogStats.recordCount,954","r.slots,0),730"]:
        assert value in vorwerk,("Combined vorwerk total missing",value)
    samsung=(site/"tests/catalog-v126.test.mjs").read_text()
    for value in ["models,77","recordsWithoutParts,57"]:
        assert value in samsung,("Samsung count missing",value)
    assert "VS(?:(?:15|20|28)" in (site/"src/core/typeplate.js").read_text()
    print(json.dumps({"combinedCountsVerified":True,"modelNames":943,"records":954,"goalSlots":730,
      "newModels":48,"partsUnchanged":1930,"physicalArticles":1812}))


def finish():
    state={
        "version":new,"date":"2026-10-08",
        "sources":[
          {"issue":13,"pr":18,"branch":"work/model-samsung-next","modelsAdded":8,"source":"integrations/samsung-model-research-next.json"},
          {"issue":14,"pr":20,"branch":"work/model-bosch-next","modelsAdded":40,"source":"integrations/bosch-model-research-next.json"},
          {"issue":15,"pr":19,"branch":"work/ui-vacuum-detail-next","modelsAdded":0,"source":"integrations/ui-vacuum-detail-next/manifest.json"}
        ],
        "modelsBefore":895,"modelsAfter":943,
        "recordsBefore":906,"recordsAfter":954,
        "targetSlotsBefore":682,"targetSlotsAfter":730,
        "catalogArticles":1930,"physicalArticles":1812,
        "samsungModels":77,"boschModels":100,"aegModels":100,
        "modelRecordsWithoutParts":308,
        "partsFitmentAdded":0,"modelsAdded":48,"newUIAppTests":2,
        "technicalConstraints":[
          "No invented device-to-part relationships or current retail offers",
          "Samsung /WD, /XEG, /EG and exact support identifiers retained",
          "Bosch /xx E-Nr must be read from source; no extra suffix tokens",
          "No model code or spare part identity has been recycled",
          "Unknown prices stay explicitly unknown in mobile UI"
        ],
        "validation":[
          "Standalone Work teams verified source evidence and tests",
          "Clean baseline restore and sequential Samsung/Bosch importer application",
          "UI independently checksum-validated then source files merged",
          "All 38 combined app tests and code checks",
          "Browser bundle byte reproducibility",
          "Exact SHA-256 patch replay",
          "Source checkpoint SHA-256 restore"
        ],
        "visualMobileRetest":"Chromium proof from PR #19 on baseline; fully combined live Safari review not completed"
    }
    (root/"integrations/work-integration-v1280.json").write_text(json.dumps(state,indent=2,ensure_ascii=False)+"\n")
    readme=root/"README.md"
    content=readme.read_text()
    changes=[
       ("# Universal Fitment v1.27.1","# Universal Fitment v1.28.0"),
       ("895 Modellbezeichnungen in 906","943 Modellbezeichnungen in 954"),
       ("682 von 1.000","730 von 1.000"),
       ("| Samsung | 69 | 69 | 36 | 0 | 49 |","| Samsung | 77 | 77 | 36 | 0 | 57 |"),
       ("| Bosch | 60 | 60 | 102 | 1 | 2 |","| Bosch | 100 | 100 | 102 | 1 | 42 |"),
       ("260 Modelleinträge haben noch keine","308 Modelleinträge haben noch keine"),
       ("Samsung enthält 69 Hersteller-Modellreferenzen.","Samsung enthält 77 Hersteller-Modellreferenzen.")
    ]
    for a,b in changes:
        assert content.count(a)==1,(a,"README count",content.count(a))
        content=content.replace(a,b,1)
    marker="\n## Teile auf einen Blick"
    assert marker in content
    note="\n\n**v1.28.0 – drei geprüfte Work-Arbeitsstränge vereint:** Samsung +8 exakt belegte Grundgeräte (69 → 77), Bosch +40 eigenständige Grundmodelle (60 → 100) und eine überarbeitete **mobile Gerätesicht mit aufklappbaren Bauteilgruppen, Filtern und Preissortierung**. Neue Geräte ohne geprüfte Teilenummern bleiben bei **0 passenden Artikeln**. Die 1.930 bisherigen Katalogartikel bleiben erhalten; unbekannte Preise werden in der Oberfläche nicht als 0 € oder als Live-Angebot dargestellt. Die vollständigen unabhängigen Arbeitsberichte sind in [Samsung](integrations/samsung-models-next.md), [Bosch](integrations/bosch-models-next.md) und [UX](integrations/ui-vacuum-detail-next/README.md) dokumentiert.\n"
    readme.write_text(content.replace(marker,note+marker,1))
    history=root/"CHANGELOG.md"
    content=history.read_text()
    marker="# Universal Fitment — Patchnotes / patch notes\n"
    assert content.startswith(marker) and "## v1.28.0" not in content
    content=content.replace(marker,marker+"""
## v1.28.0 — 8. Oktober 2026

- **DE:** Samsung +8 Hersteller-belegte, eindeutig abgegrenzte Grundmodelle (69 → 77). Zwei ausdrücklich baugleiche Ultra-Farbvarianten zählen zusammen als ein Gerät, kein künstlicher Modellplatz.
- **DE:** Bosch +40 Original-Grundmodelle (60 → 100). Vollständige E-Nr.-Indizes nur, wenn im Hersteller-Service belegt; sechs neue Modelle bleiben in dieser Recherche ohne nachgewiesene vollständige Serviceausführung.
- **DE:** Mobile Geräteansicht überarbeitet: aufklappbare Filter-/Bürsten-/Akkugruppen, lokale Sortierung, Gesamtfilter, Preisgrenzen, klare nicht verfügbare Preise und Lade-/Leerzustände; bestehende persönliche Daten und Offlinenutzung werden beibehalten.
- **DE:** 943 unterschiedliche Modellnamen, 954 Modelleinträge, 730/1.000 Modellzielplätze. **1.930 Artikel / 1.812 physische** unverändert, keine erfundene technische Teilepassung.
- **EN:** Released three independently prepared Work streams, model-first Samsung/Bosch coverage and responsive vacuum detail UX with reproducible combined CI checks.

""",1)
    history.write_text(content)
    plan=root/"integrations/model-first-plan-v1270.md"
    content=plan.read_text()
    for a,b in [
      ("| Samsung | 69 | 31 | 1 |","| Samsung | 77 | 23 | 1 |"),
      ("| Bosch | 60 | 40 | 2 |","| Bosch | 100 | 0 | abgeschlossen v1.28.0 |"),
      ("682 von 1.000 gedeckelten Modellplätzen; 318 noch offen. 895 Modellbezeichnungen, 906 konkreten Modelleinträge","730 von 1.000 gedeckelten Modellplätzen; 270 noch offen. 943 Modellbezeichnungen, 954 konkreten Modelleinträge"),
      ("260 Modelleinträge aktuell ohne gelistete Teile","308 Modelleinträge aktuell ohne gelistete Teile")
    ]:
      assert content.count(a)==1,(a,content.count(a))
      content=content.replace(a,b,1)
    plan.write_text(content)
    print(json.dumps({"releaseReport":state}))


if __name__=="__main__":
    phase=sys.argv[1]
    if phase=="merge-ui":
        merge_ui()
    elif phase=="bump":
        bump()
    elif phase=="sync":
        sync()
    elif phase=="checks":
        checks()
    elif phase=="finish":
        finish()
    else:
        raise SystemExit("Use merge-ui / bump / sync / checks / finish")
