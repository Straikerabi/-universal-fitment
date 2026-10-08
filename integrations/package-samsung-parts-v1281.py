"""Prepare and document manufacturer-verified Samsung original parts, release v1.28.1."""
from pathlib import Path
import json, shutil, sys, subprocess

root=Path(__file__).resolve().parent.parent
site=root/"site"; old="1.28.0"; new="1.28.1"
phase=sys.argv[1]

def once(file,before,after):
 text=file.read_text()
 assert text.count(before)==1,(str(file),before,text.count(before))
 file.write_text(text.replace(before,after,1))

if phase=="prepare":
 assert json.loads((site/"package.json").read_text())["version"]==old
 assert not (root/"baseline/site").exists()
 shutil.copytree(site,root/"baseline/site")
 changed=[]
 for p in site.rglob("*"):
  if not p.is_file() or p.name.startswith(("app-v","catalog-","services-v")):continue
  if p.suffix not in {".js",".mjs",".json",".html",".css",".webmanifest"}:continue
  text=p.read_text();newer=text
  for n in range(6,0,-1):
   dot="\\"*n+"."
   newer=newer.replace("1"+dot+"28"+dot+"0","1"+dot+"28"+dot+"1")
  newer=newer.replace(old,new)
  if newer!=text:
   p.write_text(newer);changed.append(str(p.relative_to(site)))
 assert json.loads((site/"package.json").read_text())["version"]==new
 assert "APP_VERSION = '1.28.1'" in (site/"src/app.js").read_text()
 assert "./app-v1.28.1.js" in (site/"index.html").read_text()
 assert "catalog-samsung-v1.28.1.js" in (site/"sw.js").read_text()
 print(json.dumps({"prepared":new,"updatedVersionFiles":changed}))
elif phase=="update-tests":
 p=site/"tests/catalog-v126.test.mjs"
 text=p.read_text()
 oldassert="assert.equal(samsungParts.length,36);"
 assert text.count(oldassert)==1,("Samsung article-count assertion not exactly once",text.count(oldassert))
 p.write_text(text.replace(oldassert,"assert.equal(samsungParts.length,46);",1))
 print("Samsung catalog article expectation 36 -> 46")
elif phase=="sync":
 p=site/"src/data/new-brands-index.js"
 t=p.read_text();tag="export const newBrandsManifest="
 assert t.count(tag)==1
 front,tail=t.split(tag)
 data=json.loads(tail.strip().rstrip(";"))
 assert data["Samsung"]["partCount"]==46
 assert data["Samsung"]["physicalPartCount"]==46
 assert data["Samsung"]["modelCount"]==77
 bundle=site/"catalog-samsung-v1.28.1.js"
 assert bundle.is_file()
 data["Samsung"]["packBytes"]=bundle.stat().st_size
 p.write_text(front+tag+json.dumps(data,ensure_ascii=False,separators=(",",":"))+";\n")
 print(json.dumps({"packBytes":bundle.stat().st_size,"samsungParts":46}))
elif phase=="finish":
 report={"version":new,"checked_at":"2026-10-08","evidence":"integrations/samsung-parts-wave1-v1281.json",
  "newManufacturerParts":10,"newBatteries":4,"newMotorizedBrushesOrMopHeads":6,
  "samsungPartsBefore":36,"samsungPartsAfter":46,"samsungModels":77,
  "globalDistinctArticles":1940,"globalPhysicalParts":1822,
  "globalDistinctModels":943,"globalModelRecords":954,"globalModelTargetSlots":730,
  "modelsWithoutParts":308,"newIndividualModelFitments":0,
  "manufacturerFamilyCompatibilityNotExactFitment":True,
  "pricesInvented":0,"stockInvented":0,
  "checks":["SKU collision-free","EAN unique on manufacturer pages","specific model fitment remains empty",
   "38 app test groups","new Samsung spare tests","deterministic code/build","SHA256 patch","SHA256 source checkpoint"],
  "important":"SKU inclusion documents original accessory existence, not compatibility with a specific model revision or live salability"}
 (root/"integrations/samsung-parts-release-v1281.json").write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n")
 readme=root/"README.md"
 for before,after in [
  ("# Universal Fitment v1.28.0","# Universal Fitment v1.28.1"),
  ("**1.930 unterschiedliche Katalogartikel**","**1.940 unterschiedliche Katalogartikel**"),
  ("**1.812** als katalogisierte Ersatzteile","**1.822** als katalogisierte Ersatzteile"),
  ("| Samsung | 77 | 77 | 36 | 0 | 57 |","| Samsung | 77 | 77 | 46 | 0 | 57 |")
 ]:once(readme,before,after)
 t=readme.read_text()
 marker="\n## Teile auf einen Blick"
 assert marker in t
 add=("\n\n**Originalteile-Ausbau v1.28.1:** Samsung +10 herstellerseitig belegte Original-Zubehörartikel: vier unterschiedliche Wechselakku-SKUs (mit/ohne Ladestation, 2.200/3.970 mAh), fünf Bürsten und ein Spinning-Sweeper-Wischaufsatz. Jede Position enthält die konkrete Samsung-Artikelkennung, veröffentlichte EAN, Herstellerlink und geprüfte Gerätefamilie. **Keine der zehn neu aufgenommenen SKUs wurde einer bestimmten Geräteausführung ohne separaten Nachweis als passend zugewiesen.** Unbekannte Preis- und Lagerangaben bleiben unbekannt. [Herstellerquellen und Akkuvarianten](integrations/samsung-parts-wave1-v1281.json).\n")
 readme.write_text(t.replace(marker,add+marker,1))
 history=root/"CHANGELOG.md"
 raw=history.read_text()
 h="# Universal Fitment — Patchnotes / patch notes\n"
 assert raw.startswith(h) and "## v1.28.1" not in raw
 raw=raw.replace(h,h+"""
## v1.28.1 — 8. Oktober 2026

- **DE:** Zehn getrennte Samsung-Originalzubehörartikel direkt mit EAN/Typ über Samsung DE bestätigt: vier Ersatz-Akkus (Ladegerät und Kapazitätsvarianten separat) sowie sechs Bürsten-/Wischaufsatz-SKUs.
- **DE:** Samsung: 36 → **46 physische** Zubehörartikel; gesamt **1.940 Katalogartikel, 1.822 physische Artikel**. Weiterhin 943 einzigartige Gerätemodelle, 954 Records, 730/1.000 Modellplätze.
- **DE:** Familienkompatibilität ist keine gerätespezifische Passung. Daher **0 neue Geräte-/Teilebeziehungen** und keine unbelegten Preise, Lagerbestände oder Versandangaben.
- **EN:** Adds 10 original Samsung accessory SKUs with German manufacturer evidence and explicitly no unverified exact-device compatibility. No fabricated commerce data.

""",1)
 history.write_text(raw)
 print(json.dumps({"release":report}))
else:
 raise SystemExit("Usage: package-samsung-parts-v1281.py prepare|update-tests|sync|finish")
