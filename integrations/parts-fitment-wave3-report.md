# Issue #38: belegte Originalteile und exakte Modelllisten

Entwurfsarbeit auf **`work/parts-fitment-wave3`**, ausschließlich Integrationsartefakte. Startcommit `d4853c4e5245410630742f58aead661d77f42c32`, Source v1.29.0, Archiv-SHA256 `c600a5c5a83a6f096ff5999e5ce5582c37ec424155919d487dfd6ca2221bd42b`. Recherchestand 8./9. Oktober 2026. Kein Merge, Deployment, Releasepaket, Foto-Upload oder externer Einkauf.

## Ergebnis und Grenzen

21 zusätzliche **eindeutige physische Originalartikel** und 36 neue **explizite, prüfpflichtige** Modell-/Produktcodebeziehungen. Sechs vorhandene Records gehen von null auf mindestens ein gelistetes Teil. Die 1.940 alten Artikel und sämtliche alten Zuordnungen bleiben erhalten. Gesamt: 1.961 Artikel, 1.843 physische, weiterhin 1.093 Modellrecords; 441 statt 447 ohne Teileliste.

Die Bezeichnung „exakt“ beschreibt die **Quellenzuordnung**, nicht eine Freigabe jeder Seriennummer, Revision oder jedes Anschlusses. Artikel bleiben `catalog_only`, gerätebezogene Einträge `variant_check_required`. Kein neuer Preis, Bestand, Versand, Lieferbarkeit, bestätigter Einkaufsstatus oder Installationszeitwert. EAN nur aus dem Artikeltext; fehlende EAN bleiben `null` und erzeugen keinen Barcode-Identifier. OEM-Nummer und ein gegebenenfalls separat genanntes Materialkennzeichen werden nicht erfunden oder mit Shop-PID/Stock-No verwechselt.

| Marke | Physische Artikel vorher → nachher | Neu | Neue genaue Beziehungen | 0 → Teile | Ohne Teile vorher → nachher | Zurückgestellt |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Miele | 167 → 167 | 0 | 0 | 0 | 25 → 25 | 1 |
| Bosch | 102 → 102 | 0 | 0 | 0 | 42 → 42 | 1 |
| Dyson | 185 → 185 | 0 | 0 | 0 | 40 → 40 | 1 |
| AEG | 351 → 351 | 0 | 0 | 0 | 22 → 22 | 0 |
| Rowenta | 100 → 100 | 0 | 0 | 0 | 75 → 75 | 0 |
| Philips | 101 → 101 | 0 | 0 | 0 | 84 → 84 | 0 |
| Siemens | 605 → 605 | 0 | 0 | 0 | 0 → 0 | 0 |
| Samsung | 46 → 51 | 5 | 18 | 3 | 57 → 54 | 18 |
| Hoover | 60 → 76 | 16 | 18 | 3 | 98 → 95 | 45 |
| Vorwerk | 105 → 105 | 0 | 0 | 0 | 4 → 4 | 0 |

Zurückstellungen zählen **dokumentierte Kandidaten**, nicht alle fehlenden Artikel oder sämtliche noch ungeprüften Modelle. Die 100-Teile-Ziele bleiben bei Samsung um 49 und Hoover um 24 echte Artikel offen. Kein künstliches Auffüllen durch Seriennamen, Farb-Marketing, Bundles oder regionale Doppelzählung. Unterschiede mit eigenem belegtem OEM-Code bleiben verschiedene Artikel; nur Namen oder Länderlabels erzeugen keinen zusätzlichen Artikel.

## Primärquellen und Nachweiskette

Samsung: eigene deutsche Hersteller-Produktseiten, deren Datenfeld „Optionales Zubehör“ einen konkreten vollständigen `/WD`- bzw. `/WA`-Modellcode und konkrete VCA-SKUs nennt. Zubehörseiten mit bloßen Serienangaben begründen **keine** zusätzliche genaue Gerätepassung. 22 vorhandene Produktseiten wurden erneut gelesen; zusätzlich wurden die EEK-/EEM-Listen getrennt geprüft. Bestehende `/WA`-Beziehungen bleiben unverändert.

Hoover: [offizieller britischer Hersteller-Service](https://service.hoover.co.uk/) verlinkt `hooverspares.co.uk`. Dieser Shop wird von Screwfix Spares / 4ourhouse betrieben; **herstellerverlinkte Originalteilequelle, nicht ein als Hoover-eigen ausgegebener Drittshop**. Die beobachteten Links und der HTTP-Seitenhash stehen in `parts-fitment-wave3-source-audit.json`. Akzeptierte Teile benötigen die OEM-Nummer und Originalteilkennzeichnung im live gelesenen Artikeltext **sowie** die Aufnahme in einer tatsächlich angezeigten Produktcodeliste. Titel/PID im URL-Pfad oder ein indexierter Suchtreffer allein reichen nicht.

| Genaues Gerät / regionale Ausführung | Neuer Umfang | Direkte Modell-/Servicequelle |
| --- | ---: | --- |
| Samsung VS70H28HEK/WD, DE | 5 Beziehungen | [Jet 95S /WD](https://www.samsung.com/de/vacuum-cleaners/stick/jet-95s-stick-vacuum-cleaner-jet-95s-stick-vacuum-cleaner-satin-black-vs70h28hek-wd/) |
| Samsung VS80F28EFP/WD, DE | 8 Beziehungen | [Bespoke AI Jet /WD](https://www.samsung.com/de/vacuum-cleaners/stick/stick-vc-with-light-powerful-jet-ailite-280w-bespoke-jet-ai-lite-280w-vs9500al-gray-vs80f28efp-wd/) |
| Samsung VS90F40EEK/WD, DE | 5 Beziehungen | [Bespoke AI Jet Ultra /WD](https://www.samsung.com/de/vacuum-cleaners/stick/vc9700cl-stick-vc-with-most-powerful-jet-aiultra-400w-black-vs90f40eek-wd/) |
| Hoover FD22G 001, Produktcode 39400273, GB | 10 Beziehungen | [Produktcodeliste 39400273](https://www.hooverspares.co.uk/vacuum-cleaner-floorcare/fd22g-001-39400273/catalogue.pl?path=1056568%2C1056551&model_ref=11873381) |
| Hoover DS22G 001, Produktcode 39400303, GB | 4 Beziehungen | [Produktcodeliste 39400303](https://www.hooverspares.co.uk/vacuum-cleaner-floorcare/ds22g-001-39400303/catalogue.pl?model_ref=12058177&path=1056568%2C1056551) |
| Hoover HU300RHM 001, Produktcode 39101032, GB | 4 Beziehungen | [Produktcodeliste 39101032](https://www.hooverspares.co.uk/vacuum-cleaner-floorcare/hu300rhm-001-39101032/catalogue.pl?path=600307&model_ref=14737057) |

Beziehungen werden nach vollständiger Modellreferenz bzw. Produktcode gezählt; keine Serien- oder Alias-Erweiterung. Die beiden vorhandenen Hoover-Produktcodes 39401035/39401038 behalten ihre 10/12 Beziehungen vollständig. Deren ältere EU-Service-Belege werden nicht erneut als aktuelle Freigabe ausgegeben.

### Akzeptierte zusätzliche Artikel

Der folgende Stand ist eine Belegtabelle, keine Verkaufsliste. Direkter Artikel-URL, Prüftag, EAN und Quellenhash stehen zu jedem OEM in der maschinenlesbaren Evidence. Keine separate Materialnummer wurde in diesen Quellen bestätigt.

| Marke / Markt | Exakter OEM-Code | Originalartikel / Klasse | Neue Zielreferenz oder Grenze |
| --- | --- | --- | --- |
| Samsung DE | VCA-SHFF80K | HEPA-Filter, Satin Black | VS70H28HEK/WD |
| Samsung DE | VCA-SHFF80P | HEPA-Filter, Pebble Grey | VS80F28EFP/WD |
| Samsung DE | VCA-SHFF90K | HEPA-Filter, Satin Black | VS90F40EEK/WD |
| Samsung DE | VCA-SHFF90M | HEPA-Filter, Satin Mint | Artikel belegt; EEM-Liste nicht auf EEK übertragen |
| Samsung DE | VCA-TABF95 | Jet Dual+ Bürste | Artikel belegt; nur Serienkompatibilität, keine genaue Gerätebeziehung |
| Hoover GB | 35601731 | T113 Abluftfilter | 39400273 |
| Hoover GB | 48021590 | Fugendüse | 39400273 |
| Hoover GB | 35601730 | Y38 Bürstenwalze | 39400273 |
| Hoover GB | 49037664 | UK-Ladegerät YLS0121A-U260040 | 39400273; kein DE-Netzstecker |
| Hoover GB | 48022207 | Zykloneinheit | 39400273 |
| Hoover GB | 48021583 | Mesh-Filter | 39400273 |
| Hoover GB | 48022206 | Parkettdüse mit Elektrobürste | 39400273 |
| Hoover GB | 48022191 | Wandhalterung | 39400273 |
| Hoover GB | 35601796 | J63 Mini-Turbodüse | 39400273 |
| Hoover GB | 48023954 | UK-Ladegerät KPTEC K12S260050B | 39400303; kein DE-Netzstecker |
| Hoover GB | 35601876 | J64 Mini-Turbodüse | 39400303 |
| Hoover GB | 35601687 | Bürstenwalze | 39400303 |
| Hoover GB | 39800043 | Lithium-Ionen-Akku | 39400303; Akku-/Anschluss-/Serienausführung prüfen |
| Hoover GB | 35602487 | Y62 Bürstenwalze | 39101032; EAN offen |
| Hoover GB | 35602491 | U100 Filtersatz | 39101032; EAN offen |
| Hoover GB | 49125117 | Verlängerte Fugendüse | 39101032; EAN offen |

Die 18 neuen Hoover-Beziehungen umfassen zusätzlich die **bereits vorhandenen** Artikel 35601729 (B001-Akku an 39400273) und 35602489 (D186-Schlauch an 39101032). Sie zählen nicht nochmals als neue Artikel.

### Bedingungen und Zurückstellungen

- Clean-Station-Beutel gelten nur bei passender Stationsausführung; Pads/Tücher erfordern den passenden separaten Wischaufsatz. Akku mit Ladegerät ist nicht automatisch der gleiche Artikel wie Akku ohne Ladegerät; 2200/3970 mAh oder gleiche Spannung sind kein Gerätebeleg.
- Der indexierte Primärinhalt zur DS22G-Liste enthält einen Seriennummernhinweis, der im live gelesenen HTML nicht erschien. Diese unterschiedliche Beobachtung ist getrennt dokumentiert. Alle übernommenen Hoover-Zuordnungen bleiben auf Produktcodelisten-Ebene **serien-/revisionsprüfpflichtig**, ohne erfundenen Serienbereich.
- Für 44 konkret angezeigte Hoover-Serviceartikel fehlte die OEM-Nummer im live gelesenen Text oder die Detailseite war nicht abrufbar. Stock-No/PID und ältere indexierte OEM-Angaben wurden nicht ersatzweise übernommen.
- HF222RH/39400912 lieferte live einen allgemeinen 9706-Artikel-Katalog. Keine Zuordnung allein aus seinem Modellnamen im URL-Pfad; ausdrücklich zurückgestellt.
- Die verlinkte HU300RHM-Zeichnung wurde per PDF-Rendering visuell kontrolliert. Sie zeigt Positionsnummern (z. B. 20/349/1169), aber keine achtstelligen OEM-Nummern. Kein Bildvergleich als Passungsbeweis, kein verwechselter Positionscode und keine Veröffentlichung der Herstellerabbildung.
- Samsung VS90F40EEM/WD wird trotz vorhandenem EEM-Alias nicht mit VS90F40EEK/WD gleichgesetzt. 17 bestehende Artikel mit nur Familienbeleg bleiben ohne neue Beziehung; zusätzlich die EEM-Modellliste zurückgestellt.
- Anschließend geprüft: Bosch BCH3ALL21 und Dyson 419634-01 (V10 Konical). Die abgerufenen Herstellerseiten lieferten hier keine gesicherte Artikel-/Revisionsbeziehung. Der Miele-S192-Serviceansatz lieferte 404; die historische Modellquelle allein beweist kein OEM-Teil. Keine Erweiterung für diese Marken.
- Aftermarket wurde nicht eingemischt; dieser Import enthält ausschließlich Originalartikel. Ungeprüfte deutsche Hoover-EU-Service- und französische Passungen bleiben offen. GB/FR-Kontext ist keine DE-Verfügbarkeit.

## Reproduzierbare lokale Integration

Nur auf dem exklusiven Work-Branch und in einem **ungetrackten**, frisch restaurierten Source-Verzeichnis:

```sh
python3 integrations/restore-source-checkpoint.py --target site
node integrations/import-parts-fitment-wave3-oem.mjs --target site --check
node integrations/import-parts-fitment-wave3-oem.mjs --target site
node integrations/import-parts-fitment-wave3-oem.mjs --target site --check
node integrations/parts-fitment-wave3-importer.test.mjs
node integrations/build-app.mjs
cd site
npm test
npm run check
```

Für den Build wird esbuild aus der bestehenden Build-Umgebung benötigt; hier wurde die vorhandene Version via `UF_ESBUILD_MODULE` genutzt, ohne neue Dependencies/Locks ins Repository aufzunehmen. `--check` ist schreibfrei, auch auf einem noch nicht integrierten Checkpoint. Zwei frische Importe sind byte-identisch; unveränderter Replay ist idempotent. Ein veränderter Checkpoint, veränderte Evidence/Baseline, fremder Branch/Worktree, Symlink, Dateikollision oder konkurrierender Schreibzugriff führt zum Abbruch. Staging-Schreib- und Rename-Fehler sind mit Rollback getestet. Genehmigte Evidence und das gesamte 136-Dateien-Lock besitzen feste Digests; nachträglich „selbst zertifizierte“ Werte werden nicht akzeptiert.

## Tests und Release-Handoff

Vollständige `npm test`-Suite und `npm run check`, zusätzlicher Importer-Test mit 64 Negativfällen, Golden-Checks aller alten Artikel/Identifier/Beziehungen/Modellmitgliedschaften und kommerziellen Felder, Index-vs.-Lazy-Hydration, gespeicherte Objektidentität, Länder-/Produktcode-/Akkuvarianten, null-EAN, Quelle/PID, unbekannte Serienbereiche und Cart-Gates. Build erneut mit `--check` geprüft. Ausführungsprotokoll und exakte Paket-Digests: `parts-fitment-wave3-validation.json`.

**Keine direkten `site/`-Änderungen im PR.** Der Importer erzeugt ausschließlich lokal die zwei neuen Datenmodule, Markenpack-/Index-Hooks, belegte EANs nur für neue Artikel, sichtbare genaue Bedingungen, aktualisierte passende Regressionen und lokale Test-Scripts. Gemeinsame Source-, Checkpoint-, Build-, Versions- und Deployment-Dateien bleiben der Releasekoordination #12 vorbehalten. Keine Änderung der Modellidentitäten, Such-/Checkout-Logik oder Version.

Der am 9. Oktober erneut gelesene `main`-Stand `71f7826ba936a1f3830c8b2a67e8085a9cfe234e` ergänzt den Wave-3-Scope-Guard; der Worker behält seinen vorgegebenen v1.29.0-Startpunkt. Zulässige PR-Pfade: `integrations/parts-fitment-wave3-*` sowie der ausdrücklich beauftragte `integrations/import-parts-fitment-wave3-*`. Keine autonome Integration, PR-Merge-Aktion oder Veröffentlichung.
