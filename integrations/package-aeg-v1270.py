"""Release AEG 100 distinct model names without guessing 11-digit PNC variants or spare fitment."""
from pathlib import Path
import json,sys,shutil

root=Path(__file__).resolve().parent.parent
site=root/"site"
phase=sys.argv[1]
old="1.26.12"
new="1.27.0"

def exact(file,a,b):
    text=file.read_text()
    assert text.count(a)==1,(str(file),a)
    file.write_text(text.replace(a,b,1))

if phase=="prepare":
    assert json.loads((site/"package.json").read_text())["version"]==old
    baseline=root/"baseline/site"
    assert not baseline.exists()
    shutil.copytree(site,baseline)
    converted=[]
    for p in site.rglob("*"):
        if not p.is_file() or p.name.startswith(("app-v","catalog-","services-v")):continue
        if p.suffix not in {".js",".mjs",".json",".html",".css",".webmanifest"}:continue
        text=p.read_text()
        newer=text
        for slashes in range(6,0,-1):
            dot="\\"*slashes+"."
            newer=newer.replace("1"+dot+"26"+dot+"12","1"+dot+"27"+dot+"0")
        newer=newer.replace(old,new)
        if newer!=text:
            p.write_text(newer);converted.append(str(p.relative_to(site)))
    assert json.loads((site/"package.json").read_text())["version"]==new
    assert "APP_VERSION = '1.27.0'" in (site/"src/app.js").read_text()
    assert "./app-v1.27.0.js" in (site/"index.html").read_text()
    assert "catalog-aeg-v1.27.0.js" in (site/"sw.js").read_text()
    for test in ("catalog-seven-brands.test.mjs","vorwerk-expansion.test.mjs"):
        path=site/"tests"/test
        for a,b in [
            ("catalogStats.modelCount,871","catalogStats.modelCount,893"),
            ("catalogStats.recordCount,882","catalogStats.recordCount,904"),
            ("r.slots,0),658","r.slots,0),680")
        ]:exact(path,a,b)
    expanded=site/"tests/catalog-expansion.test.mjs"
    marker="assert.deepEqual(catalogCoverage().map(r=>r.brand),['Miele','Bosch','Dyson','AEG','Rowenta','Philips','Siemens','Samsung','Hoover','Vorwerk']);"
    additions="""const aegNewCodes=new Set([
 'AB61C1WP','AB61H6SW','AP72UB21ES','AP91HB21ES','AP72UB21DG',
 'AP61CB21OG','AB51C2DG','AP82A25SHX','FX8-1-ECO','AP81B25WET',
 'AP81UB25GG','AP82UB25SH','AP61AB21DG','AP61HB21SH','AP61CB21DB',
 'AP61CB21RS','AP61AB21DB','AP61AB21SH','AP83A25XNX',
 'AP81P25GRN','AP81P25ECO','AP81UP25DB'
]);
const aegNew=filterCatalog({brand:'AEG'}).filter(d=>aegNewCodes.has(d.model));
assert.equal(aegNewCodes.size,22);
assert.equal(aegNew.length,22);
assert.equal(aegPack.models.length,100,'All original 78 AEG devices remain present');
assert.equal(brandManifest.AEG.modelCount,100);
assert.equal(catalogCoverage().find(r=>r.brand==='AEG').recordsWithoutParts,22);
for(const d of aegNew){
 assert.equal(d.parts.length,0,'Do not invent part compatibility for a new model: '+d.model);
 assert.equal(d.partCount,0);
 assert.equal(d.physicalPartCount,0);
 assert.equal(d.deviceQuote,null,'No invented new retail prices');
 assert.equal(d.brand,'AEG');
 assert.ok(d.partListCoverage,'Missing AEG coverage explanation');
 assert.equal(new URL(d.sources[0].url).protocol,'https:');
}
for(const code of ['AB61C1WP','AB61H6SW','AP72UB21ES','AP91HB21ES','AP61CB21OG','AB51C2DG']){
 const d=aegNew.find(x=>x.model===code);
 assert.ok(d);
 assert.equal(d.pncs.length,0,'Never fabricate the missing two AEG PNC suffix digits');
 assert.ok(d.facts.some(f=>f.label.includes('Neunstellige Produktnummer')));
}
for(const code of ['AP81P25GRN','AP81P25ECO','AP81UP25DB']){
 const d=aegNew.find(x=>x.model===code);
 assert.ok(d);
 assert.ok(d.sources[0].url.includes('shop.aeg.')||d.sources[0].url.includes('shop.electrolux.'),'Manufacturer model source required');
 assert.equal(d.pncs.length,1);
 assert.match(d.pncs[0],/^\\d{11}$/);
}
"""
    exact(expanded,marker,marker+"\n"+additions)
    print(json.dumps({"prepared":new,"files":converted,"aeg_target":100}))

elif phase=="sync":
    bundle=site/"catalog-aeg-v1.27.0.js"
    assert bundle.exists(),bundle
    size=bundle.stat().st_size
    path=site/"src/data/brand-index.js"
    text=path.read_text()
    marker="export const brandManifest="
    assert text.count(marker)==1
    header,tail=text.split(marker,1)
    payload,rest=tail.split(";\napplyHooverIndexFitment",1)
    data=json.loads(payload)
    assert data["AEG"]["modelCount"]==100
    data["AEG"]["packBytes"]=size
    path.write_text(header+marker+json.dumps(data,separators=(",",":"),ensure_ascii=False)+";\napplyHooverIndexFitment"+rest)
    print(json.dumps({"bundle":"catalog-aeg-v1.27.0.js","bytes":size}))

elif phase=="finish":
    report={"version":new,"checked_at":"2026-10-08",
      "sources":"integrations/aeg-model-candidates-v1270.json",
      "manufacturer_verified_models_added":22,"aeg_models":100,"aeg_models_without_parts":22,
      "aeg_catalog_articles":354,"aeg_physical_articles":351,
      "new_spare_parts_claims":0,"nine_digit_PNC_preserved_without_suffix":6,
      "all_distinct_model_names":893,"all_model_records":904,
      "all_catalog_articles":1930,"all_physical_articles":1812,
      "total_model_records_without_parts":258,"model_goal_slots":680,
      "validation":["full unit tests","syntax/static bundle","reproducible bundles","SHA-verified patch replay","SHA-verified source checkpoint"],
      "external_live_offer_refresh":"not_performed",
      "limitations":["Actual 11-digit AEG PNC needed for spare-part technical fitment","Model page validates the device, not its full original spare parts list"]}
    (root/"integrations/aeg-release-v1270.json").write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n")
    readme=root/"README.md"
    for a,b in [
      ("# Universal Fitment v1.26.12","# Universal Fitment v1.27.0"),
      ("871 Modellbezeichnungen in 882","893 Modellbezeichnungen in 904"),
      ("658 von 1.000","680 von 1.000"),
      ("| AEG | 78 | 78 | 351 | 3 | 0 |","| AEG | 100 | 100 | 351 | 3 | 22 |"),
      ("Noch offen sind die Modellziele für sieben Marken","Noch offen sind die Modellziele für sechs Marken"),
      ("236 Modelleinträge haben noch keine","258 Modelleinträge haben noch keine")
    ]:exact(readme,a,b)
    text=readme.read_text()
    marker="\n## Neue Herstellerdaten"
    addition=("""
## AEG-Modellkatalog vollständig erfasst

AEG umfasst jetzt **100 konkrete Modellbezeichnungen**. Die 22 neu aufgenommenen Modelle wurden über Hersteller-Produktseiten bzw. AEG-/Electrolux-Modell- und PNC-Register nachgewiesen. Die Marken-Zielzahl wurde damit ohne Zubehörtricks erreicht. Dabei wurden **keine Ersatzteilbeziehungen behauptet oder Teilezahlen künstlich erhöht**: 22 AEG-Modelle haben noch keine erfasste Original-Ersatzteilliste.

Sechs Produktseiten nennen lediglich die neunstellige AEG-Produktnummer. Die fehlenden zwei Ausführungsstellen einer elfstelligen Ersatzteil-PNC werden nicht erfunden. Für weitere Modelle sind konkrete elfstellige PNCs bereits belegt. Exakte Quellen und Kennungsqualität: [AEG-Quellen v1.27.0](integrations/aeg-model-candidates-v1270.json).

""")
    assert text.count(marker)==1
    readme.write_text(text.replace(marker,"\n"+addition+marker,1))
    changelog=root/"CHANGELOG.md"
    ch=changelog.read_text()
    h="# Universal Fitment — Patchnotes / patch notes\n"
    assert ch.startswith(h) and "## v1.27.0" not in ch
    changelog.write_text(ch.replace(h,h+"""
## v1.27.0 — 8. Oktober 2026

- **DE:** AEG erreicht 100 echte unterschiedliche Staubsauger-Modellreferenzen (+22), alle direkt aus AEG-/Electrolux-Herstellerseiten belegt. Keine Zubehörteile als zusätzliche Geräte gerechnet.
- **DE:** PNC-Sicherheit: neunstellige Hersteller-Produktnummern werden nicht als vollständige elfstellige Ersatzteil-PNC behandelt. Die neuen AEG-Modelle bleiben bis zur Teilezuordnung mit 0 Artikeln gekennzeichnet.
- **DE:** Weiterhin 1.930 Katalogartikel und 1.812 physische Ersatzteile/Zubehörartikel. 893 Modellbezeichnungen, 904 konkrete Modelleinträge und 680 von 1.000 Zielplätzen.
- **EN:** AEG reaches 100 verified vacuum model references without inferred spare-part compatibility, model aliases or fabricated PNC suffixes. Verified release candidate; Pages CI is checked separately.

""",1))
    print(json.dumps({"finished":new,"report":report}))

else:
    raise SystemExit("Usage: package-aeg-v1270.py prepare|sync|finish")
