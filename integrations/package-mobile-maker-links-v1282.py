"""Package verified mobile manufacturer-spare-parts link layout fix for v1.28.2."""
from pathlib import Path
import json, shutil, sys

root=Path(__file__).resolve().parent.parent
site=root/"site"
old="1.28.1";new="1.28.2"
phase=sys.argv[1]

def replace_one(file, original, updated):
    content=file.read_text()
    assert content.count(original)==1,(str(file),original,content.count(original))
    file.write_text(content.replace(original,updated,1))

if phase=="prepare":
    assert json.loads((site/"package.json").read_text())["version"]==old
    baseline=root/"baseline/site"
    assert not baseline.exists()
    shutil.copytree(site,baseline)
    print(json.dumps({"baseline":old,"copied":True}))
elif phase=="bump":
    assert json.loads((site/"package.json").read_text())["version"]==old
    changed=[]
    for p in site.rglob("*"):
        if not p.is_file() or p.name.startswith(("app-v","catalog-","services-v")):continue
        if p.suffix not in {".js",".mjs",".json",".html",".css",".webmanifest"}:continue
        text=p.read_text()
        updated=text
        for n in range(6,0,-1):
            dot="\\"*n+"."
            updated=updated.replace("1"+dot+"28"+dot+"1","1"+dot+"28"+dot+"2")
        updated=updated.replace(old,new)
        if updated!=text:
            p.write_text(updated)
            changed.append(str(p.relative_to(site)))
    assert json.loads((site/"package.json").read_text())["version"]==new
    assert "APP_VERSION = '1.28.2'" in (site/"src/app.js").read_text()
    assert "./app-v1.28.2.js" in (site/"index.html").read_text()
    assert "catalog-samsung-v1.28.2.js" in (site/"sw.js").read_text()
    print(json.dumps({"releaseVersion":new,"updatedFiles":changed}))
elif phase=="finish":
    report={
      "version":new,"date":"2026-10-08","reason":"iPhone screenshot: 7 manufacturer spare parts links overlapped and clipped in card on catalog page",
      "issue":28,
      "changedSource":["src/app.js","styles.css"],
      "improvements":[
        "Semantic manufacturer link navigation inside catalog coverage card",
        "CSS grid with single vertical column at <=600px, auto-fit multiple columns at larger widths",
        "Independent buttons, 48px minimum touch area, normal text wrapping, explicit gap and no overflow",
        "All 7 existing manufacturer source links and labels retained"
      ],
      "catalogChanges":0,"newFitmentClaims":0,"modelNames":943,"modelRecords":954,
      "catalogArticles":1940,"physicalParts":1822,"modelTargetSlots":730,
      "samsungArticles":46,
      "validation":["All existing application test groups","JavaScript checks","manufacturer link DOM+CSS regression",
        "byte-identical reproducible app bundles","SHA256 exact delta replay","SHA256 restored checkpoint"],
      "iosPhysicalDeviceTest":"User screenshot established bug; physical iOS Safari verification after deployment remains recommended"
    }
    (root/"integrations/mobile-maker-links-release-v1282.json").write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n")
    readme=root/"README.md"
    replace_one(readme,"# Universal Fitment v1.28.1","# Universal Fitment v1.28.2")
    text=readme.read_text()
    marker="\n## Teile auf einen Blick"
    assert text.count(marker)==1
    desc=("\n\n**Mobile Darstellung v1.28.2:** Die sieben externen Hersteller-Links im Kasten „Weitere Ersatzteile anhand deines Geräts prüfen“ sind jetzt im responsiven Raster angeordnet; auf schmalen iPhone-Displays stehen sie untereinander. Lange Linktexte umbrechen innerhalb der Schaltfläche, mit mindestens 48 px Tippflächenhöhe und klarem vertikalen Abstand. Zieladressen/Bezeichnungen unverändert. Keine Änderung an Geräte-/Artikeldaten oder technischen Passungsbeziehungen. [Fehlerbeleg & Layoutprüfung](integrations/mobile-maker-links-release-v1282.json).\n")
    readme.write_text(text.replace(marker,desc+marker,1))
    changelog=root/"CHANGELOG.md"
    raw=changelog.read_text()
    heading="# Universal Fitment — Patchnotes / patch notes\n"
    assert raw.startswith(heading) and "## v1.28.2" not in raw
    raw=raw.replace(heading,heading+"""
## v1.28.2 — 8. Oktober 2026

- **DE:** Schwerer iPhone-Darstellungsfehler in „Weitere Ersatzteile anhand deines Geräts prüfen“ behoben. Sieben Hersteller-Links stehen auf schmalen Bildschirmen in getrennten, vollständig lesbaren Schaltflächen mit ausreichend Tippfläche und Abstand.
- **DE:** Responsive CSS-Grid, normaler Umbruch, keine überlappenden oder abgeschnittenen Links. Offizielle Hersteller-Ziele und Linktexte bleiben unverändert.
- **DE:** Keine Änderung an Staubsauger-Modellen, Artikelbestand, Passungen oder Händlerpreisen. Weiterhin 943 Modellnamen, 954 Records, 1.940 Katalogartikel und 1.822 physische Teile.
- **EN:** Fixed stacked/overlapping external maker spare links on mobile screens with accessible single-column link layout. All seven original destinations unchanged.

""",1)
    changelog.write_text(raw)
    print(json.dumps({"releaseReport":report}))
else:
    raise SystemExit("Use prepare|bump|finish")
