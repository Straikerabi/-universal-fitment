# Wave 7: frischer OEM-Pilot direkt im Consumer — Issue #80

Branch `work/wave7-fresh-oem-consumer-pilot`, Ausgangspunkt `620a4ae8bf49f5c0c212da4acddad249b8b8764b`. Draft-Ziel: `integration/private-unified-preview-wave5-owner`. Kein main-Merge, kein Deployment, kein Zusammenführen paralleler Worker-Branches.

## Tatsächlich gemessener Zuwachs

Der wirklich geladene `consumer-repair-mission-poc/catalog-snapshot.mjs` enthält **29 Geräte** statt 11, also **18 neue vollständige Herstellerkennungen aus sieben Marken**. Alle ursprünglichen 11 Geräte und 11 Teile sind einschließlich IDs und Inhalte unverändert erhalten. Insgesamt **22 Teilidentitäten**: 11 vorherige plus 11 neue. Die neuen Daten enthalten **14 gezielte Herstellerlistungen**, **acht Geräte ohne ausgewählte Teile**, **null reale Einbau-/Kauffreigaben** und **null hochgestufte Wave-3-Kanten**. Insgesamt acht Consumer-Marken einschließlich der unverändert erhaltenen Hoover-Baseline.

`coverage-wave7.json` misst ausschließlich den verwendeten Consumer-Snapshot. Historische 1.115 Modellrows zählen **nicht** als neu importierte App-Daten. Issue #74/#69 und die 56 fehlenden historischen Archive bleiben offen; PR #77 wird weder ersetzt noch umetikettiert.

## Herstellerbelege und Grenzen

33 frische offizielle Antworten vom 10.10.2026, mit vollständigem Abrufzeitpunkt, URL, Redirect, Byteumfang und SHA-256 in `sources.json`. `pilot.json` trennt Geräteidentität, OEM-Teilidentität und exakt scoped Geräte-/Baugruppenlisting. Jede Identität und Kante hat eine konkrete Fundstelle. Der Importer liest eigene Gerätefelder, indexed BSH-Flight-Objekte, PNC-Ergebnisse, SKU-gebundene Dyson-Karten und eigene Vorwerk-Kompatibilitätsblöcke; keine Familienexpansion, keine empfohlenen Produkte als Passungsbeweis.

Die 33 Rohantworten liegen **nur im privaten Auditarchiv** `wave7-private-oem-audit-2026-10-10.zip` (2363333 Bytes, SHA-256 `187f6bde4c88691b9521bb0d5e5cdeab0a0093ead750b1eb235341752cee535e`). Metadaten: `audit-cache.json`. Keine Voll-HTML/PDF-Datei, kein Herstellerbild, Preis oder Lagerbestand ist im Git-Diff bzw. den App-Assets enthalten. Die private Sicherung ermöglicht Replay nach Sitzungsunterbrechungen; sie wurde mit unveränderten Antwort-Hashes wiederhergestellt, nicht historisch neu bestätigt.

Interne Recherche ist als eingeschränkter Auditgebrauch dokumentiert, **nicht** als pauschale urheberrechtliche Lizenz. Kommerzielle B2C-Nutzung bleibt für jede neue Quelle `unknown`; öffentliche Herstellerlinks sind keine Nutzungslizenz. Rechtebilder werden nicht übernommen. Keine Seriennummern-/Revisionsabdeckung, Montageanweisung oder mechanisch/elektrisch geprüfte Passung wird behauptet.

Vorwerk `VK7` und `VK200` sind hier nur die exakt benannten Geräte der jeweiligen deutschen Anleitung. Bundle-/Farb-/Serienvarianten und numerische Handels-SKUs sind nicht hinzu erfunden. `FP7`/`MF7` sind explizit **Hersteller-Teilebezeichnungen**, keine erfundenen numerischen Artikelnummern. Sie werden nicht auf VK200 übertragen. Die Siemens `00027606` ist die vordere Laufrolle (Hersteller nennt 67 mm), keine Kabeltrommel; der BOM-Eintrag gilt nur für `VS06A110/03`, Position `0109`, nicht `/12`.

Ausgeschlossen: PNC `90025855700` und `90025856400` liefern frisch `LX82-1-ANI`, `90025855400` liefert `LX82-1-OKO`, nicht die historischen AL61-Kandidaten. Dieser ungeklärte Marken-/Modellkontext wird nicht als AEG-Zuwachs gezählt.

## Reproduzieren

Privates Archiv außerhalb des Repositories entpacken; `UF_OEM_AUDIT_CACHE` auf diesen Ordner setzen. Python-Standardbibliothek und Node erforderlich. Es gibt keine neue Produktionsabhängigkeit. Der vorhandene Wave-4-HTML/BOM-Parser wird als Code wiederverwendet, **nicht dessen Daten oder Quell-Pins**.

```bash
python -B integrations/catalog-wave7/import_sources.py --cache "$UF_OEM_AUDIT_CACHE"
node integrations/catalog-wave7/project.mjs --cache "$UF_OEM_AUDIT_CACHE"
node integrations/catalog-wave7/verify.mjs
node --test integrations/catalog-wave7/tests/*.test.mjs integrations/consumer-repair-mission-poc/tests/*.test.mjs integrations/fitment-engine-v1-poc/*.test.mjs integrations/dual-platform-owner-review/*.test.mjs integrations/business-embed-poc/tests.mjs integrations/business-embed-poc/pilot.test.mjs
python -B -m unittest discover -s integrations/catalog-wave7/tests -p 'test_*.py' -v
```

Nur bei einer bewusst neu freigegebenen Datengeneration: `import_sources.py --write --cache ...`, anschließend `project.mjs --write --cache ...`. Beide Schreibwege prüfen den vorgesehenen Branch. Der Projector schreibt erst nach erfolgreichem privatem Quellen-Replay. `--fetch` darf fehlende Auditbytes anhand der echten URLs nachladen, akzeptiert aber **nur byte-identische Pins**. Bei geänderter Live-Antwort: Stop und neue manuelle Quellenprüfung, kein Umschreiben bestehender Hashes. Keine Wiederherstellung alter Wave-3-Archive.

Browser-Runner isoliert installieren, z. B. Playwright in einem externen Testordner. `UF_PLAYWRIGHT_MODULE` auf dessen `playwright/index.mjs` setzen; optional `UF_CHROMIUM_EXECUTABLE` für einen expliziten Headless-Chromium-Pfad. Ausgabeverzeichnisse bleiben außerhalb des Repositories.

```bash
node integrations/catalog-wave7/tests/browser.mjs
node integrations/consumer-repair-mission-poc/tests/browser.mjs
node integrations/consumer-repair-mission-poc/tests/passport-browser.mjs
```

Für den neuen Runner optional `UF_WAVE7_QA_DIR`, für den bestehenden allgemeinen Runner `UF_MISSION_QA_DIR` setzen. Der Prüfpass-Runner schreibt nur Stdout und temporäre Downloads; er nutzt die isolierte Browserinstallation aus `PLAYWRIGHT_BROWSERS_PATH`. Tatsächlich getestet mit Playwright 1.62.1 und Chromium Headless 131.0.6778.85 (expliziter Testbrowser, keine Behauptung einer aktuellen Safari-/iPhone-Abnahme). Keine Testskips, physischen iPhones oder externen Testpersonen.

## Versionierung, Status und Konfliktgrenzen

Snapshot-Version 2 mit eigenem Fresh-Release und Manifestdigest; der alte Archivcheckpoint bleibt explizite Baseline. `catalog-lock.json` enthält die ursprünglichen 136 Pins plus getrennte Fresh-Pins, gemessene Zahlen und den aktuellen Snapshotdigest. Der vorhandene Offline-Generator berechnet den Cache/Fingerprint aus den tatsächlichen lokalen Bytes. Der alte Generator-Schreibschutz wurde nicht erweitert oder umgangen; der branchgeschützte neue Projector verwendet seine reine Exportfunktion.

Alte Missionen mit dem tatsächlich vorherigen Fingerprint werden verworfen und im lokalen Speicher aktiv durch eine leere neue Mission ersetzt. Geräte-/Teileauswahl, Baugruppe und abgehakte Notizen werden gelöscht; blockierte Speicherung bleibt fail-closed. Der Prüfpass nennt Snapshot-Version, Fresh-Release und Fresh-Manifestdigest. Alle realen Assessments bleiben `unclear` bzw. exportiert `unconfirmed`, ohne Bestellung oder vollständiges Reparaturkit.

Nur migrationsnotwendige Consumer-Bindings wurden verändert: zwei zuvor hartcodierte Mengenlabels, DE-Quellenwebsite-Zuordnung für neue Hersteller, persistente Invalidierung und Datenprovenienz. **Keine Layout-/CSS-/Work-B-QA-Änderung, keine Business-UI, Engine oder Work-C-Rechtsnavigation geändert.** Der Owner kombiniert die generierten Offline-Daten mit den parallelen Worker-PRs nach Review.

Der zusätzliche eingefrorene Wave-6-Launch-Preflight hat zwei bekannte Referenzabweichungen: `test_actual_sources_and_lock` und `test_example_report_is_reproducible`. Seine alte Consumer-Quellenlock ist nach der echten Migration zwangsläufig nicht mehr identisch. Der Gate-Zustand bleibt `BLOCKED`, Source-Identity `UNKNOWN` — **keine** automatische Rechts-/Releasefreigabe. Die fremden Lock-/Golden-Dateien werden hier nicht still neu bestätigt. Der Owner muss den zusammengeführten Stand gesondert prüfen und diesen eingefrorenen Prüfstand aktualisieren. Die kompletten tatsächlichen Logs werden mit dem Draft geliefert, einschließlich dieser zwei Abweichungen.

## Testabnahme am tatsächlich gelieferten Stand

| Prüfung | Gemessenes Ergebnis |
| --- | --- |
| Node: frischer Projector, Consumer, gemeinsamer v1-Core, Bridge und Business-Regressionen | 294/294 bestanden |
| Private echte Quellen-Replays und synthetische Negativmutationen | 8/8 bestanden; 33 Originalantworten byte-identisch |
| Neue Consumer-Migration im Chromium | 10/10 bestanden; 72 neue Varianten-/Viewport-Durchläufe |
| Unveränderte bestehende Browser-Abnahme | 31/31 bestanden; zusätzlich 24 dokumentierte automatisierte Pilotaufgaben |
| Unveränderter echter Prüfpass-Download | 4/4 bestanden: 320/375/390/430 px |
| Offline-/Catalog-Lock, Branch-/Scope-/Syntaxkontrolle und `git diff --check` | bestanden, reproduzierbar |
| Zusätzlicher eingefrorener Wave-6-Release-Preflight | 14/16 bestanden; zwei alte Lock/Golden-Referenzen abweichend, siehe oben |

Die eigene Katalog-/Consumer-Abnahme umfasst damit **302 erfolgreiche Node-/Quellenprüfungen plus 45 erfolgreiche Browserchecks**. Kein „alles grün“ für den zusätzlich ausgeführten fremden Release-Prüfstand: seine beiden Abweichungen sind ausdrücklich im vollständigen `evidence/full-test-log.txt` enthalten. `evidence/test-summary.json` und beide Browserberichte enthalten die tatsächlich gemessenen Daten. Die lokalen UI/Core-Assets messen 189355 Bytes, unter dem unveränderten 300000-Byte-Budget. Alle realen Ergebnisse bleiben ungeprüft, warme Offline-Nutzung zeigt nur den gespeicherten Quellstand; kaltes Offline ohne vorherige Installation lädt keinen Katalog und erfindet keine Abdeckung.

## Aufgenommene Geräte und getrennte Teilidentitäten

| Marke | Modell | Vollständige Quellenkennung | Ausgewählte Teile | Offizieller DE-Beleg |
| --- | --- | --- | ---: | --- |
| AEG | AB61C3GG | 90025863800 | 2 | [Hersteller](https://shop.aeg.de/search?pnc=90025863800) |
| Bosch | BGL35MON1 | BGL35MON1/01 | 0 | [Hersteller](https://www.bosch-home.com/de/de/productservice/BGL35MON1-01) |
| Bosch | BGL35MON4 | BGL35MON4/01 | 0 | [Hersteller](https://www.bosch-home.com/de/de/productservice/BGL35MON4-01) |
| Dyson | Dyson Cyclone V10 Absolute | 226397-01 | 1 | [Hersteller](https://www.dyson.de/support/journey/replacement-parts/search.226397-01) |
| Dyson | Dyson V8 Absolute Pro | 227312-01 | 1 | [Hersteller](https://www.dyson.de/support/journey/replacement-parts/search.227312-01) |
| Dyson | Dyson V11 Absolute (Generation 2019) | 268700-01 | 1 | [Hersteller](https://www.dyson.de/support/journey/replacement-parts/search.268700-01) |
| Miele | Boost CX1 Cat & Dog PowerLine | 11602420 | 2 | [Hersteller](https://www.miele.de/product/11602420/bodenstaubsauger-ohne-beutel-boost-cx1-cat-und-dog-powerline-obsidianschwarz) |
| Miele | Boost CX1 PowerLine | 11602450 | 2 | [Hersteller](https://www.miele.de/product/11602450/bodenstaubsauger-ohne-beutel-boost-cx1-powerline-lotosweiss) |
| Miele | Complete C3 Silence | 12031660 | 1 | [Hersteller](https://www.miele.de/product/12031660/bodenstaubsauger-mit-beutel-complete-c3-silence-lotosweiss) |
| Miele | Guard M1 Cat & Dog | 12560300 | 1 | [Hersteller](https://www.miele.de/product/12560300/bodenstaubsauger-mit-beutel-guard-m1-cat-und-dog-obsidianschwarz) |
| Samsung | VS20C85G2TW | VS20C85G2TW/WD | 0 | [Hersteller](https://www.samsung.com/de/support/model/VS20C85G2TW/WD/) |
| Samsung | Jet 85 CompleteClean Plus mit 2-in-1 Ladestation, 580 W Motorleistung | VS20C85G4PB/WD | 0 | [Hersteller](https://www.samsung.com/de/support/model/VS20C85G4PB/WD/) |
| Samsung | Jet 85 CompleteClean mit 2-in-1 Ladestation, 580 W Motorleistung | VS20C85G4TB/WD | 0 | [Hersteller](https://www.samsung.com/de/support/model/VS20C85G4TB/WD/) |
| Siemens | VS06A110 | VS06A110/03 | 1 | [Hersteller](https://www.siemens-home.bsh-group.com/de/de/productservice/VS06A110-03) |
| Siemens | VS06A110 | VS06A110/12 | 0 | [Hersteller](https://www.siemens-home.bsh-group.com/de/de/productservice/VS06A110-12) |
| Siemens | VSZ4G1400 | VSZ4G1400/01 | 0 | [Hersteller](https://www.siemens-home.bsh-group.com/de/de/productservice/VSZ4G1400-01) |
| Vorwerk | Kobold VK200 | VK200 | 0 | [Hersteller](https://www.vorwerk.com/de/de/c/home/service/kobold/gebrauchsanleitungen/handstaubsauger) |
| Vorwerk | Kobold VK7 | VK7 | 2 | [Hersteller](https://www.vorwerk.com/de/de/c/home/service/kobold/gebrauchsanleitungen/akku-staubsauger) |

| Marke | OEM-Identität | Baugruppe | Identitätsbeleg | Separat gelistete Gerätekennungen |
| --- | --- | --- | --- | --- |
| AEG | 9001677690 · AFS1W Allergy Plus s-filter waschbar | filter | [Hersteller](https://shop.aeg.de/staubsauger/staubsauger/filter/afs1w-allergy-plus-s-filter-waschbar-fur-air-max-ultrasilencer/p/9001677690) | 90025863800 |
| AEG | 9001684746 · GR201S s-bag Classic Long Performance | bag | [Hersteller](https://shop.aeg.de/staubsauger/staubsauger/staubsaugerbeutel/gr201s-s-bag-classic-long-performance-staubsaugerbeutel/p/9001684746) | 90025863800 |
| Dyson | 967834-07 · Dyson V8 Akku E | battery | [Hersteller](https://www.dyson.de/support/journey/spare-details.967834-07.227312-01) | 227312-01 |
| Dyson | 969082-01 · Dyson Staubsaugerfilter | filter | [Hersteller](https://www.dyson.de/support/journey/replacement-parts/969082-01.226397-01) | 226397-01 |
| Dyson | 970145-06 · Dyson V11 Akku | battery | [Hersteller](https://www.dyson.de/support/journey/spare-details.970145-06.268700-01) | 268700-01 |
| Miele | 11639210 · SF-HA 60 | filter | [Hersteller](https://www.miele.de/product/11639210/hepa-airclean-filter-mit-timestrip-sf-ha-60) | 11602420, 11602450 |
| Miele | 11639250 · CX FSF | filter | [Hersteller](https://www.miele.de/product/11639250/feinstaubfilter-cx-fsf) | 11602420, 11602450 |
| Miele | 12785390 · SF-HA 50-1 | filter | [Hersteller](https://www.miele.de/product/12785390/hepa-airclean-filter-sf-ha-50-1) | 12031660, 12560300 |
| Siemens | 00027606 · Laufrolle vorne | mechanical | [Hersteller](https://www.siemens-home.bsh-group.com/de/de/product/00027606) | VS06A110/03 |
| Vorwerk | FP7 · Kobold FP7 Premium Filtertüten Set (12 Stk.) | bag | [Hersteller](https://www.vorwerk.com/de/de/s/shop/kobold-fp7-premium-filtertueten-set-12stk-de) | VK7 |
| Vorwerk | MF7 · Kobold MF7 Motorschutzfilter | filter | [Hersteller](https://www.vorwerk.com/de/de/s/shop/kobold-mf7-motorschutzfilter-de) | VK7 |
