# Miele Modellwelle 2 – Nachweis für Issue #22

25 belegte historische S-Modellprofile ergänzen die unveränderten 57 Verkaufsnamen / 62 Ausführungen: **82 verschiedene Modellnamen, 87 Datensätze, weiterhin 167 physische Artikel**. Alle 25 Ergänzungen starten mit **0 Teilen**, ohne EAN, Materialnummer, Länder-/Ausführungskennung, Preis, Bestands- oder Fotoannahme. 17 Kandidaten sind zurückgestellt, 10 Dubletten-/Zählfälle abgelehnt; 18 Plätze bis zum Zielwert 100 bleiben offen.

Branch: `work/model-miele-wave2`. Issue-Basis: `d254df54d7bb4d72febdf9f2587efec9a66be336`, App `v1.28.0`, Quellarchiv-SHA-256 `5cb8e5b9c155b8493ded22211778cbf224c538f73214cb41590dc95f6f41d0a3`. Ausschließlich Miele-Integrationsdateien werden committed; die App-Quellen und Builddateien entstehen lokal. Keine Release-/Versionsänderung, kein Merge und kein Deployment.

## Quellen und Zählung

Drei originale deutsche Miele-Kataloge wurden am 08.10.2026 erneut mit HTTP 200 heruntergeladen, vollständig gehasht, mit Poppler ausgelesen und die relevanten Modelltabellen visuell geprüft. Die Kennungen stehen in einzelnen Spalten „Typ-/Verkaufsbezeichnung“ bei vollständigen Haushaltsstaubsaugern. S-Nummernbereiche in Zubehörlisten liefern keine Modelle.

Die neue Modellzahl zählt jeden ausdrücklich belegten numerischen S-Modellcode einmal. Farben, gleichcodierte EcoLine-/Special-Ausführungen und Zubehörpakete werden zusammengefasst. Gemeinsame Plattformen werden nicht als getrennte Chassisarchitekturen behauptet. Unbelegte spätere Umbenennungen werden nicht angenommen; die genaue Produktionsausführung bleibt offen. Die bereits bestehenden 57 Verkaufsnamen werden nicht nachträglich als 57 technische Grundkonstruktionen umgedeutet.

| Herstellerquelle | Umfang | SHA-256 |
|---|---:|---|
| [Bodenpflege-Geräte, Herstellerkatalog 2011](https://www1.miele.de/ex/prospects/de/2011_10/9013391_Bodenpflege_FH/pdf/all.pdf) | 51 PDF-Seiten; 9,390,014 Bytes | `a0b22d802bd66cb2fa13b8bfd1b6747e7b155d149c108f2ae8f895503da55c25` |
| [Staubsaugen, Herstellerkatalog mit Impressum 03/13](https://www1.miele.de/ex/prospects/de/2013_04/121700_MMS120308_Staubsaugen_April2012/pdf/all.pdf) | 84 PDF-Seiten; 20,769,822 Bytes | `b4160e666a0c26607950a76cd35088a58c05c0646e477c31ee4660b31a17a138` |
| [Bodenpflege-Geräte, Herstellerkatalog 2012](https://www1.miele.de/ex/prospects/de/2012_10/9013393_Bodenpflege/pdf/all.pdf) | 45 PDF-Seiten; 7,952,239 Bytes | `1b28cfba25d44511d6b79f582cf09a3d4c9e5cd9588d2082d553c5385d75ba5f` |

PDF-Seiten sind 1-basiert. Die Kataloge 2011 und Oktober 2012 enthalten Doppelseiten; PDF-Seite und gedruckte Seitenzahl unterscheiden sich. Der April-2012-URL-Pfad enthält tatsächlich das Impressum 03/13. Die JSON-Nachweise führen alle bestätigenden Tabellen und Seitenhashes auf. Die PDFs bleiben bei Miele; deren vollständige Inhalte werden nicht ins Repository kopiert.

### Angenommene Profile

| Exakter Modellcode | Geräteart | Primärbeleg | Ausführung / Teile |
|---|---|---|---|
| S 192 | Stiel | [catalog-2013, PDF 50](https://www1.miele.de/ex/prospects/de/2013_04/121700_MMS120308_Staubsaugen_April2012/pdf/all.pdf#page=50) | offen / 0 |
| S 194 | Stiel | [catalog-2013, PDF 50](https://www1.miele.de/ex/prospects/de/2013_04/121700_MMS120308_Staubsaugen_April2012/pdf/all.pdf#page=50) | offen / 0 |
| S 195 | Stiel | [catalog-2013, PDF 51](https://www1.miele.de/ex/prospects/de/2013_04/121700_MMS120308_Staubsaugen_April2012/pdf/all.pdf#page=51) | offen / 0 |
| S 771 | Boden | [catalog-2013, PDF 46](https://www1.miele.de/ex/prospects/de/2013_04/121700_MMS120308_Staubsaugen_April2012/pdf/all.pdf#page=46) | offen / 0 |
| S 2121 | Boden | [catalog-2013, PDF 47](https://www1.miele.de/ex/prospects/de/2013_04/121700_MMS120308_Staubsaugen_April2012/pdf/all.pdf#page=47) | offen / 0 |
| S 2131 | Boden | [catalog-2013, PDF 47](https://www1.miele.de/ex/prospects/de/2013_04/121700_MMS120308_Staubsaugen_April2012/pdf/all.pdf#page=47) | offen / 0 |
| S 5211 | Boden | [catalog-2011, PDF 18](https://www1.miele.de/ex/prospects/de/2011_10/9013391_Bodenpflege_FH/pdf/all.pdf#page=18) | offen / 0 |
| S 5311 | Boden | [catalog-2011, PDF 18](https://www1.miele.de/ex/prospects/de/2011_10/9013391_Bodenpflege_FH/pdf/all.pdf#page=18) | offen / 0 |
| S 5381 | Boden | [catalog-2013, PDF 43](https://www1.miele.de/ex/prospects/de/2013_04/121700_MMS120308_Staubsaugen_April2012/pdf/all.pdf#page=43) | offen / 0 |
| S 5781 | Boden | [catalog-2011, PDF 22](https://www1.miele.de/ex/prospects/de/2011_10/9013391_Bodenpflege_FH/pdf/all.pdf#page=22) | offen / 0 |
| S 6210 | Boden | [catalog-2013, PDF 44](https://www1.miele.de/ex/prospects/de/2013_04/121700_MMS120308_Staubsaugen_April2012/pdf/all.pdf#page=44) | offen / 0 |
| S 6240 | Boden | [catalog-2013, PDF 44](https://www1.miele.de/ex/prospects/de/2013_04/121700_MMS120308_Staubsaugen_April2012/pdf/all.pdf#page=44) | offen / 0 |
| S 6260 | Boden | [catalog-2011, PDF 21](https://www1.miele.de/ex/prospects/de/2011_10/9013391_Bodenpflege_FH/pdf/all.pdf#page=21) | offen / 0 |
| S 6350 | Boden | [catalog-2011, PDF 17](https://www1.miele.de/ex/prospects/de/2011_10/9013391_Bodenpflege_FH/pdf/all.pdf#page=17) | offen / 0 |
| S 6760 | Boden | [catalog-2011, PDF 17](https://www1.miele.de/ex/prospects/de/2011_10/9013391_Bodenpflege_FH/pdf/all.pdf#page=17) | offen / 0 |
| S 7510 | Bürststaubsauger | [catalog-2013, PDF 58](https://www1.miele.de/ex/prospects/de/2013_04/121700_MMS120308_Staubsaugen_April2012/pdf/all.pdf#page=58) | offen / 0 |
| S 7580 | Bürststaubsauger | [catalog-2013, PDF 58](https://www1.miele.de/ex/prospects/de/2013_04/121700_MMS120308_Staubsaugen_April2012/pdf/all.pdf#page=58) | offen / 0 |
| S 8310 | Boden | [catalog-2013, PDF 38](https://www1.miele.de/ex/prospects/de/2013_04/121700_MMS120308_Staubsaugen_April2012/pdf/all.pdf#page=38) | offen / 0 |
| S 8330 | Boden | [catalog-2013, PDF 38](https://www1.miele.de/ex/prospects/de/2013_04/121700_MMS120308_Staubsaugen_April2012/pdf/all.pdf#page=38) | offen / 0 |
| S 8340 | Boden | [catalog-2013, PDF 41](https://www1.miele.de/ex/prospects/de/2013_04/121700_MMS120308_Staubsaugen_April2012/pdf/all.pdf#page=41) | offen / 0 |
| S 8360 | Boden | [catalog-2013, PDF 41](https://www1.miele.de/ex/prospects/de/2013_04/121700_MMS120308_Staubsaugen_April2012/pdf/all.pdf#page=41) | offen / 0 |
| S 8390 | Boden | [catalog-2013, PDF 41](https://www1.miele.de/ex/prospects/de/2013_04/121700_MMS120308_Staubsaugen_April2012/pdf/all.pdf#page=41) | offen / 0 |
| S 8530 | Boden | [catalog-2013, PDF 39](https://www1.miele.de/ex/prospects/de/2013_04/121700_MMS120308_Staubsaugen_April2012/pdf/all.pdf#page=39) | offen / 0 |
| S 8730 | Boden | [catalog-2013, PDF 39](https://www1.miele.de/ex/prospects/de/2013_04/121700_MMS120308_Staubsaugen_April2012/pdf/all.pdf#page=39) | offen / 0 |
| S 8930 | Boden | [catalog-2013, PDF 40](https://www1.miele.de/ex/prospects/de/2013_04/121700_MMS120308_Staubsaugen_April2012/pdf/all.pdf#page=40) | offen / 0 |

### Zurückgestellt

| Kandidat | Herstellerbeleg | Offene Abgrenzung |
|---|---|---|
| S 5981 + SEB 217 | [catalog-2011, PDF 18](https://www1.miele.de/ex/prospects/de/2011_10/9013391_Bodenpflege_FH/pdf/all.pdf#page=18) | Numerischer Grundcode im Gerätepaket genannt, aber in diesen Quellen nur als Paket. Eigenständige Identität/Ausführung des Grundgeräts zunächst mit Service-/Anleitungsbeleg prüfen. |
| Premium 5000 + SEB 236 | [catalog-2011, PDF 19](https://www1.miele.de/ex/prospects/de/2011_10/9013391_Bodenpflege_FH/pdf/all.pdf#page=19) | Verkaufsname plus Elektrobürste; exakten S-Grundmodellcode und mögliche Gleichheit zu S 5981 nicht ableiten. |
| Premium 8000 | [catalog-2013, PDF 40](https://www1.miele.de/ex/prospects/de/2013_04/121700_MMS120308_Staubsaugen_April2012/pdf/all.pdf#page=40) | Verkaufsname ohne numerischen Grundcode in der Spalte; mögliche Ausführung von S 8930 offen. |
| S8 UniQ | [catalog-2013, PDF 40](https://www1.miele.de/ex/prospects/de/2013_04/121700_MMS120308_Staubsaugen_April2012/pdf/all.pdf#page=40) | Vollständiges Gerät gezeigt, exakter numerischer S-Modellcode und Abgrenzung zu anderen S8-Ausführungen nicht belegt. |
| S8 Cat & Dog | [catalog-2013, PDF 42](https://www1.miele.de/ex/prospects/de/2013_04/121700_MMS120308_Staubsaugen_April2012/pdf/all.pdf#page=42) | Verkaufsname einer S8-Ausstattung; unabhängigen numerischen Grundcode nicht ableiten. |
| S8 Parkett & Co. | [catalog-2013, PDF 42](https://www1.miele.de/ex/prospects/de/2013_04/121700_MMS120308_Staubsaugen_April2012/pdf/all.pdf#page=42) | Verkaufsname, numerischer Grundcode und Abgrenzung offen. |
| S8 Haus & Co. | [catalog-2013, PDF 42](https://www1.miele.de/ex/prospects/de/2013_04/121700_MMS120308_Staubsaugen_April2012/pdf/all.pdf#page=42) | Verkaufsname, numerischer Grundcode und Abgrenzung offen. |
| S8 Medicair | [catalog-2013, PDF 43](https://www1.miele.de/ex/prospects/de/2013_04/121700_MMS120308_Staubsaugen_April2012/pdf/all.pdf#page=43) | Verkaufsname, numerischer Grundcode und Abgrenzung offen. |
| Cat & Dog 6000 | [catalog-2013, PDF 44](https://www1.miele.de/ex/prospects/de/2013_04/121700_MMS120308_Staubsaugen_April2012/pdf/all.pdf#page=44) | Ausstattungsname der S6-Reihe; Grundcode und mögliche Dublette offen. |
| Parkett & Co. 6000 | [catalog-2013, PDF 45](https://www1.miele.de/ex/prospects/de/2013_04/121700_MMS120308_Staubsaugen_April2012/pdf/all.pdf#page=45) | Ausstattungsname, Grundcode offen. |
| Silent & Compact 6000 | [catalog-2013, PDF 45](https://www1.miele.de/ex/prospects/de/2013_04/121700_MMS120308_Staubsaugen_April2012/pdf/all.pdf#page=45) | Ausstattungsname, mögliche Dublette zu S 6260 offen. |
| S4 EcoLine | [catalog-2011, PDF 21](https://www1.miele.de/ex/prospects/de/2011_10/9013391_Bodenpflege_FH/pdf/all.pdf#page=21) | Konkretes Gerät abgebildet, jedoch kein numerischer S4-Grundcode in der Spalte. |
| S5 EcoLine | [catalog-2011, PDF 21](https://www1.miele.de/ex/prospects/de/2011_10/9013391_Bodenpflege_FH/pdf/all.pdf#page=21) | Numerischen S5-Grundcode nicht aus Baureihen-/Marketingname ableiten. |
| S5 EcoLine green | [catalog-2011, PDF 21](https://www1.miele.de/ex/prospects/de/2011_10/9013391_Bodenpflege_FH/pdf/all.pdf#page=21) | Numerischer S5-Grundcode und Variantenabgrenzung offen. |
| S5 EcoComfort | [catalog-2011, PDF 22](https://www1.miele.de/ex/prospects/de/2011_10/9013391_Bodenpflege_FH/pdf/all.pdf#page=22) | Numerischer S5-Grundcode und mögliche Dublette offen. |
| Tango Plus | [catalog-2011, PDF 16](https://www1.miele.de/ex/prospects/de/2011_10/9013391_Bodenpflege_FH/pdf/all.pdf#page=16) | Historischer S300-Verkaufsname, exakte Grundkennung nicht ableiten. |
| Miele Hybrid | [catalog-2011, PDF 30](https://www1.miele.de/ex/prospects/de/2011_10/9013391_Bodenpflege_FH/pdf/all.pdf#page=30) | Eigenes Hybrid-Gerät gezeigt, jedoch kein genauer Modellcode. Kein willkürlicher Code oder Generationseintrag. |

### Abgelehnte zusätzliche Zählungen

| Kandidat | Entscheidung |
|---|---|
| S 8310 Diamantgrau | Zweite Farbspalte des identischen S 8310, kein weiterer Grundmodellcode. |
| S 5211 Koi-Orange | Zweite Farbspalte des identischen S 5211. |
| S 6760 Purpurschwarz | Zweite Farb-/Oberflächenausführung, identischer S 6760. |
| S 194 + SEB 217 | Bereits gezähltes Grundgerät S 194 mit Elektrobürste SEB 217. Der Vorsatz und das Paket zählen nicht zusätzlich. |
| S 8730 Special | Identischer numerischer S 8730 mit anderer Ausstattung/Farbe; in einem Profil zusammengefasst. |
| S 5781 Special | S 5781 EcoLine/Special gemeinsam unter einem S 5781-Modellcode; Motor- und Ausführungsdaten bleiben offen. |
| S 2131 EcoLine | S 2131 und EcoLine-Version gemeinsam in einem Codeprofil, keine zweite Modellzahl. |
| S 6240 EcoLine | Bereits belegter S 6240-Grundcode, Ausstattungs-/Motorvariante nicht zusätzlich gezählt. |
| S 5381 EcoLine | S 5381 und EcoLine in einem Profil, keine zweite Modellzahl. |
| S 300–S 456 / S 5000–S 5981 | Bereiche in Zubehörtabellen sind keine einzeln belegten Modelle; keine Interpolation. |

## Import und Wiederholung

Der Importer prüft alle 131 Dateien der Issue-Quellbasis, bindet die komplette Basis, Hersteller-Tabellenmetadaten und freigegebenen Modellidentitäten an feste SHA-256-Werte und validiert alle Entscheidungen vor jeder Mutation. Er lehnt abweichende Versionen, fremde Änderungen, Teilimporte, geänderte Zielpayloads und Symlinks ab. Ein exklusiver Lock, vollständig vorbereitete Dateien und eine erneute Prüfung unter Lock schützen den Schreibvorgang; simulierte I/O-Fehler werden vollständig zurückgerollt. Konfliktabbruch ist ohne Quellmutation getestet. Ein Prozess-/Stromausfall mitten in mehreren Dateiumbenennungen ist keine Dateisystemtransaktion: dann die lokale Arbeitskopie aus dem Checkpoint wiederherstellen, keinen Teilimport fortsetzen.

`--dry-run` und `--check` schreiben keine Quelldateien. Der zweite Import schreibt nichts und ergänzt 0 Modelle. `--check` verlangt einen bereits vollständig importierten Zielbaum. `miele-models-wave2.baseline.json` enthält 11 gehashte Originaldateitexte für die Wiederholungsprüfung; alle werden vor Mutation validiert. Das ist kein neuer gemeinsamer Checkpoint.

```bash
python3 integrations/restore-source-checkpoint.py --target site
node integrations/import-miele-models-wave2.mjs --target site --dry-run
node integrations/import-miele-models-wave2.mjs --target site
node integrations/import-miele-models-wave2.mjs --target site
node integrations/import-miele-models-wave2.mjs --target site --check
npm ci --prefix integrations/auth-sdk --ignore-scripts
node integrations/build-app.mjs
npm test --prefix site
npm run check --prefix site
node integrations/build-app.mjs --check
```

`site/` muss beim Wiederherstellen fehlen. Die obigen Befehle gelten für die unveränderte Issue-Basis auf dem Work-Branch. Der folgende vollständige Nachweis arbeitet stattdessen in zwei unabhängigen temporären Arbeitskopien, baut vor der App-Suite und vergleicht sämtliche Quellen und zehn Buildpakete byteweise:

```bash
node integrations/miele-models-wave2.verify.mjs --report integrations/miele-models-wave2.validation.json
python3 integrations/miele-models-wave2.sources.py --cache /tmp/miele-wave2-pdfs --report integrations/miele-models-wave2.sources.json
python3 integrations/miele-models-wave2.sources.py --cache /tmp/miele-wave2-pdfs --offline
node --test --test-reporter=tap integrations/miele-models-wave2.test.mjs
```

Quellenprüfung benötigt Python 3 und `pdftotext`; Downloads haben Größenlimit und Timeout. Bei einer Hersteller-PDF-Änderung wird der Hashkonflikt gemeldet, ohne neue Geräte automatisch zu akzeptieren. Manipulierte PDF-Pins und erfundene Tabellenkennungen wurden auch beim Offline-Quellenprüfer negativ getestet.

## Geprüfte Integration

- **39 App-Testgruppen bestanden**, einschließlich alter EAN-/Materialvarianten, Filter, Originalartikel, Handel/Preis/Zustand, Backup, Offline, Index/Detail, OCR und Typenschild.
- **10 Importer-Testgruppen bestanden**, einschließlich Dubletten, Aliasüberschneidung, manipuliertem Manifest, erfundenen Tabellen-/Ausführungsdaten, Preis-/Markendrift, Teilimport, Symlink, Lock und I/O-Rollback.
- `npm run check` sowie Syntaxprüfung aller wiederhergestellten JS-/MJS-Dateien und der zusätzlichen Module bestanden.
- Aktueller Work-Branch-Scope-Guard: **pass** für alle 13 Commit-Dateien; der beigefügte lokale Patch wurde zusätzlich auf einem frischen Checkpoint angewendet und alle 13 Ergebnishashes stimmen.
- Zwei unabhängige frische Checkpoints: sämtliche Quellen und **10 Buildpakete byteidentisch**; beide Original-Buildskript-Läufe mit `--check` bestanden.
- Alle 62 bestehenden Miele-Ausführungen, 167 Artikel einschließlich Beziehungen/Zuständen sowie Preisrecords und fremde Katalogprodukte stimmen in ihren vollständigen JSON-SHA-256-Werten mit der Basis überein.
- Jeder neue Code löst lokal auf. Typschild/OCR akzeptieren ausschließlich begrenzte genaue Miele-Modellcodes und geben `model_reference` aus; Seriennummern, andere Marken, widersprüchliche Identifikatoren, erfundene Suffixe und Gerätezubehör ergeben keine exakte Variante/Teilepassung. Numerischer Code ist kein Material- oder EAN-Beleg.

### Buildnachweis

Node `v24.19.0`, esbuild `0.25.12`; App-Version unverändert. Die optionalen Markenpakete bleiben byteidentisch zur Baseline. Der App-Bundle wächst durch die Modellprofile von 1.647.752 auf 1,707,245 Bytes (+59,493).

| Lokal erzeugtes Paket | Bytes | SHA-256 |
|---|---:|---|
| `app-v1.28.0.js` | 1,707,245 | `fd20563022f1c701ef66c11a705aa8100e5e04fab9b40c18b180e315cd35d4a6` |
| `catalog-aeg-v1.28.0.js` | 725,910 | `78db9817f4f437d2ddf65a910bfadb190e849990a8b35a67a3f420ed69ad8422` |
| `catalog-dyson-v1.28.0.js` | 260,570 | `cfbb6c417fe56af42ad8811c445adef7cf9d95b5f31dad220a6dbf9f6937a868` |
| `catalog-hoover-v1.28.0.js` | 53,707 | `402bcc52da2eb8ededfb52a5c2b91ae3e665f38626182a5a9dbe257b7b3cd8f9` |
| `catalog-philips-v1.28.0.js` | 352,773 | `28f2ba1da41522658a86df8db5b43efe8eaec7240a21a84e9813846511391e22` |
| `catalog-rowenta-v1.28.0.js` | 502,458 | `ab2ad6dbaacb32d625e02987faa81d32f0a59fa171f45d170d1322b8e7e0c898` |
| `catalog-samsung-v1.28.0.js` | 175,773 | `03d7d9453c4940ac646b29aa36bdaa08ac347997d843a47b6bbd7fb7a8ac24af` |
| `catalog-siemens-v1.28.0.js` | 1,234,312 | `80a968bb58b1f9ed06b26f42562e6c1c260935df274bd97122897d4465e15ba8` |
| `catalog-vorwerk-v1.28.0.js` | 108,090 | `b9c6084b4841eebc30c367c1136dd88881f6f6d2a7ee89e6f4111255a2bb490e` |
| `services-v1.28.0.js` | 3,331 | `accc35b5028711192c011ab4bce9a27c7a85da1fd75c10366d2d585f3a78741d` |

## Genau lokal geänderte App-Dateien

Der Importer erzeugt genau die folgenden 13 Dateien; `miele-models-wave2.local.patch` enthält denselben getesteten Source-Diff als Integrationshilfe. Diese App-Dateien und kompilierten Pakete werden **nicht** auf dem Work-Branch committed.

| Lokale Datei unter `site/` | Zweck |
|---|---|
| `src/data/miele-models-wave2.js` | Neue Modellreferenzen und Prüfhashes; keinerlei Teileableitung |
| `src/data/miele-models.js` | Einfügen der zusätzlichen Profile ohne vorhandene Familien-Teileanreicherung |
| `src/core/typeplate.js` | Genaue historische Codes, Ausführung offen, Konflikt-/Markengrenzen |
| `src/core/identifiers.js` | OCR: genaue begrenzte Miele-Codes; keine Serien-/Suffixableitung |
| `tests/miele-models.test.mjs` | Bestehende Zähler aktualisieren bzw. alte EAN-/Fotoanforderung auf belegte Varianten begrenzen |
| `tests/miele-parts.test.mjs` | Bestehende Zähler aktualisieren bzw. alte EAN-/Fotoanforderung auf belegte Varianten begrenzen |
| `tests/typeplate.test.mjs` | Bestehende Zähler aktualisieren bzw. alte EAN-/Fotoanforderung auf belegte Varianten begrenzen |
| `tests/bosch-catalog.test.mjs` | Bestehende Zähler aktualisieren bzw. alte EAN-/Fotoanforderung auf belegte Varianten begrenzen |
| `tests/philips-expansion.test.mjs` | Bestehende Zähler aktualisieren bzw. alte EAN-/Fotoanforderung auf belegte Varianten begrenzen |
| `tests/catalog-seven-brands.test.mjs` | Bestehende Zähler aktualisieren bzw. alte EAN-/Fotoanforderung auf belegte Varianten begrenzen |
| `tests/vorwerk-expansion.test.mjs` | Bestehende Zähler aktualisieren bzw. alte EAN-/Fotoanforderung auf belegte Varianten begrenzen |
| `tests/miele-models-wave2.test.mjs` | Neue Modelle und vollständige Bestands-/Preis-/Identitätsgrenzen |
| `package.json` | 39. Testgruppe; keine Versionsänderung |

## Abgleich mit aktuellem main und Konfliktstellen

`main` wurde vor PR-Erstellung erneut gelesen: `9419d49419fd2d3257b910f49c9afd30f40de289`, Version **1.28.2**. Das aktuelle Source-Archiv wurde integritätsgeprüft separat wiederhergestellt. Miele ist weiterhin bei **57 Namen / 62 Ausführungen / 167 Artikeln**; Miele-Modelle, Teile, Preise und die fremden Indexprodukte haben unveränderte vollständige JSON-Hashes. Globale Basissummen bleiben **943 Namen / 954 Datensätze**; auf dieser Katalogbasis nach dieser Welle **968 / 979**.

16 Source-Dateien haben sich seit der Issue-Basis verändert. Direkte Überschneidungen mit diesem lokalen Patch: `package.json`, `tests/miele-models.test.mjs`, `tests/miele-parts.test.mjs`, `tests/vorwerk-expansion.test.mjs`. Die zwei zentralen Resolver-/Typenschilddateien sind aktuell unverändert, bleiben aber gemeinsame Integrationsstellen. Der bisherige Importer verweigert den aktuellen v1.28.2-Baum **ohne eine Datei zu ändern**; der negative Nachweis umfasst alle 131 Dateien.

Der Release-Owner **#12** muss vor Verpackung die Basis auf das dann aktuelle main anheben, Guardhashes und genau diese Test-/Paketüberschneidungen neu prüfen und die Miele-Patches gezielt integrieren. `package.json` darf dabei die aktuelle Release-Version behalten. Die Samsung-Artikelergänzung und mobile Herstellerlinks auf main dürfen nicht überschrieben werden. Dieser Work-PR enthält nur neue Integrationsdateien; kein Rebase-Merge, Releasearchiv oder Deployment wird ausgeführt.

Der maschinenlesbare Einzelabgleich steht in `miele-models-wave2.main-audit.json`, der vollständige Ausführungs-/Buildnachweis in `miele-models-wave2.validation.json`, Live-Quellenprüfungen in `miele-models-wave2.sources.json`.

## Offene Recherche

Materialnummern, EANs, konkrete Typschild-/Produktionsausführungen, Länderzusätze und gerätespezifische Service-Teilelisten für die 25 neuen Profile bleiben offen. Zubehörnennungen in einem Katalog ersetzen keine exakte Kompatibilitätsbestätigung. Die 17 zurückgestellten Kandidaten benötigen präzisere Hersteller-Service-/Anleitungsbelege; keine Zielzahl wird mit Namens-, Farb- oder Familienvarianten gefüllt.
