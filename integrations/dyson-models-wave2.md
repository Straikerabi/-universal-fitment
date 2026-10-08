# Dyson Wave 2 — Übergabe zu Issue #23

38 zusätzliche, getrennt belegte Dyson-Modell-/Generationsreferenzen; acht Forschungsfälle bleiben zurückgestellt, zwölf Kandidaten ausgeschlossen. Import ausschließlich auf `work/model-dyson-wave2`, gefrorene Integrationsbasis `d254df54d7bb4d72febdf9f2587efec9a66be336` / v1.28.0. Entwurfs-PR gegen `main`; Integration und Release gehören zu [#12](https://github.com/Straikerabi/-universal-fitment/issues/12).

## Zählung und Grenzen

| Größe | Ausgang | Nach lokalem Import |
|---|---:|---:|
| Verschiedene Dyson-Katalognamen | 54 | 92 |
| Dyson-Gerätedatensätze | 60 | 98 |
| Neu belegte OEM-Modell-/Generationsreferenzen | 0 | 38 |
| Unabhängige Grundgeräte insgesamt | nicht ermittelt | nicht ermittelt |
| Physische Dyson-Artikel | 185 | 185 |
| Alle Dyson-Artikel inkl. 6 sonstiger Einträge | 191 | 191 |
| Neue Artikel / neue Teilebeziehungen | 0 / 0 | 0 / 0 |
| Bestehende Artikel-Gerätebeziehungen | 754 | 754 |
| Dyson-Geräte ohne geprüfte physische Teile | 2 | 40 |
| Globale Modellnamen / Modell-Datensätze | 943 / 954 | 981 / 992 |
| Bestehende Ziel-Slots (namenbasierte UI) | 730 | 768 |
| Globale Artikel / physische Artikel auf v1.28.0 | 1930 / 1812 | 1930 / 1812 |

Die 54 bisherigen Namen enthalten Farb-, Lieferumfangs- und Zustandsvarianten. Sie sind keine belegten 54 unabhängigen Konstruktionen. Die bestehenden 60 numerischen Produktnummern bleiben erhalten und verbrauchen **keinen neuen Grundgeräte-Slot**. `baseline.modelAudit` dokumentiert jeden Datensatz; `baseline.identityGroups` gruppiert die 14 bisherigen Serien ohne daraus technische Gleichheit abzuleiten.

Gezählt wird je neuem, separat vom Hersteller geführtem Gerätemodell bzw. dokumentierter Generation genau eine Referenz. DC-Kennungen werden nur aus deutschen Hersteller-Geräteauswahlen und den zugehörigen, erfolgreich gelesenen Modellseiten aufgenommen; eigene Anleitungen unterstützen die Abgrenzung, soweit abrufbar. Die drei Namen Big Ball 2, Omni-glide und PencilVac bezeichnen eigenständige Hersteller-Generationen/Formate. Deren numerische Produktnummer und SV-/UP-Typcode sind offen und werden nicht erfunden. Gemeinsame Komponenten beweisen weder Aliasgleichheit noch neue Teilepassung.

**Warum nicht 100:** Die erfassten Primärquellen belegen 38 fehlende, qualifizierte Modellreferenzen. Weitere Namen ohne ausreichende Abgrenzung, Zubehörpakete und ausgeschlossene Gerätekategorien werden nicht aufgefüllt. Selbst 92 Katalognamen sind keine belegten 92 unabhängigen Grundgeräte. Das ist ein begrenzter DE-Quellenbefund, keine Behauptung, weltweit hätten niemals 100 Dyson-Konstruktionen existiert.

## Primärquellen und Rechercheverfahren

Rechercheprüfung: 2026-10-08. Systematisch ausgewertet wurden die deutschen [Bodenstaubsauger](https://www.dyson.de/support/vacuum-cleaners/cylinders), [Bürststaubsauger](https://www.dyson.de/support/vacuum-cleaners/uprights), [kabellosen Geräte](https://www.dyson.de/support/vacuum-cleaners/cordless), [multidirektionalen Geräte](https://www.dyson.de/support/vacuum-cleaners/multi-directional), aktuelle Produktseiten sowie die [Altgeräteliste](https://www.dyson.de/support/retired-machines) und [Reparaturgrenzen](https://www.dyson.de/support/repairs-and-servicing-information). Sekundärquellen geben keine Freigabe.

Die JSON-Datei enthält direkte Hersteller-URLs, beobachtete Seitentitel, Datum, Geräteart, Varianten-/Ländergrenzen, Abgrenzung, Zählentscheidung und Unsicherheiten. `sourceExtractSha256` bezeichnet den damaligen Web-Extrakt, **keinen HTML-/HTTP-Body-Hash**. `retrieved` bedeutet, dass Inhalt über die Web-Recherche gelesen wurde; es behauptet keinen selbst gemessenen HTTP-200-Status. Quellenprüfung ist eine datierte Beobachtung. Der offline deterministische Import führt keine erneute Live-Bestätigung durch.

### Angenommen

| Modell / Kennung | Geräteart | Hersteller-Modellquelle | Direkt gelesene PDF |
|---|---|---|---|
| Big Ball 2 | Bodenstaubsauger | [Dyson](https://www.dyson.de/support/vacuum-cleaners/cylinders/big-ball-2) | [Anleitung](https://www.dyson.de/content/dam/dyson/maintenance/user-guides/de_DE/vacuumcleaners/cylindervacuums/dysonbigball2cylinders/228564-01.pdf) |
| DC01 | Bürststaubsauger | [Dyson](https://www.dyson.de/support/vacuum-cleaners/uprights/dc01) | nicht erfasst |
| DC02 | Bodenstaubsauger | [Dyson](https://www.dyson.de/support/vacuum-cleaners/cylinders/dc02) | [Anleitung](https://www.dyson.de/content/dam/dyson/maintenance/user-guides/de_DE/vacuumcleaners/cylindervacuums/dc02/00409-08.pdf) |
| DC03 | Bürststaubsauger | [Dyson](https://www.dyson.de/support/vacuum-cleaners/uprights/dc03) | [Anleitung](https://www.dyson.de/content/dam/dyson/maintenance/user-guides/de_DE/vacuumcleaners/uprightvacuums/dc03/03334-14.pdf) |
| DC04 | Bürststaubsauger | [Dyson](https://www.dyson.de/support/vacuum-cleaners/uprights/dc04) | nicht erfasst |
| DC05 | Bodenstaubsauger | [Dyson](https://www.dyson.de/support/vacuum-cleaners/cylinders/dc05) | [Anleitung](https://www.dyson.de/content/dam/dyson/maintenance/user-guides/de_DE/vacuumcleaners/cylindervacuums/dc05/02311-03.pdf) |
| DC07 | Bürststaubsauger | [Dyson](https://www.dyson.de/support/vacuum-cleaners/uprights/dc07) | [Anleitung](https://www.dyson.de/content/dam/dyson/maintenance/user-guides/de_DE/vacuumcleaners/uprightvacuums/dc07/05036-01.pdf) |
| DC08 | Bodenstaubsauger | [Dyson](https://www.dyson.de/support/vacuum-cleaners/cylinders/dc08) | [Anleitung](https://www.dyson.de/content/dam/dyson/maintenance/user-guides/de_DE/vacuumcleaners/cylindervacuums/dc08/04460-02.pdf) |
| DC08T | Bodenstaubsauger | [Dyson](https://www.dyson.de/support/vacuum-cleaners/cylinders/dc08t) | Link beobachtet, Inhalt offen |
| DC11 | Bodenstaubsauger | [Dyson](https://www.dyson.de/support/vacuum-cleaners/cylinders/dc11) | [Anleitung](https://www.dyson.de/content/dam/dyson/maintenance/user-guides/de_DE/vacuumcleaners/cylindervacuums/dc11/06555-08.pdf) |
| DC15 | Bürststaubsauger | [Dyson](https://www.dyson.de/support/vacuum-cleaners/uprights/dc15) | [Anleitung](https://www.dyson.de/content/dam/dyson/maintenance/user-guides/de_DE/vacuumcleaners/uprightvacuums/dc15/09329-10.pdf) |
| DC18 | Bürststaubsauger | [Dyson](https://www.dyson.de/support/vacuum-cleaners/uprights/dc18) | [Anleitung](https://www.dyson.de/content/dam/dyson/maintenance/user-guides/de_DE/vacuumcleaners/uprightvacuums/dc18/12867-01.pdf) |
| DC19 | Bodenstaubsauger | [Dyson](https://www.dyson.de/support/vacuum-cleaners/cylinders/dc19) | [Anleitung](https://www.dyson.de/content/dam/dyson/maintenance/user-guides/de_DE/vacuumcleaners/cylindervacuums/dc19/12779-01.pdf) |
| DC19T2 | Bodenstaubsauger | [Dyson](https://www.dyson.de/support/vacuum-cleaners/cylinders/dc19t2) | [Anleitung](https://www.dyson.de/content/dam/dyson/maintenance/user-guides/de_DE/vacuumcleaners/cylindervacuums/dc19t2/24030-01.pdf) |
| DC20 | Bodenstaubsauger | [Dyson](https://www.dyson.de/support/vacuum-cleaners/cylinders/dc20) | nicht erfasst |
| DC21 | Bodenstaubsauger | [Dyson](https://www.dyson.de/support/vacuum-cleaners/cylinders/dc21) | Link beobachtet, Inhalt offen |
| DC22 | Bodenstaubsauger | [Dyson](https://www.dyson.de/support/vacuum-cleaners/cylinders/dc22) | [Anleitung](https://www.dyson.de/content/dam/dyson/maintenance/user-guides/de_DE/vacuumcleaners/cylindervacuums/dc22/14557-01.pdf) |
| DC23 | Bodenstaubsauger | [Dyson](https://www.dyson.de/support/vacuum-cleaners/cylinders/dc23) | [Anleitung](https://www.dyson.de/content/dam/dyson/maintenance/user-guides/de_DE/vacuumcleaners/cylindervacuums/dc23/14969-01.pdf) |
| DC23T2 | Bodenstaubsauger | [Dyson](https://www.dyson.de/support/vacuum-cleaners/cylinders/dc23t2) | [Anleitung](https://www.dyson.de/content/dam/dyson/maintenance/user-guides/de_DE/vacuumcleaners/cylindervacuums/dc23t2/21634-01.pdf) |
| DC24 | Bürststaubsauger | [Dyson](https://www.dyson.de/support/vacuum-cleaners/uprights/dc24) | [Anleitung](https://www.dyson.de/content/dam/dyson/maintenance/user-guides/de_DE/vacuumcleaners/uprightvacuums/dc24/15289-01.pdf) |
| DC25 | Bürststaubsauger | [Dyson](https://www.dyson.de/support/vacuum-cleaners/uprights/dc25) | [Anleitung](https://www.dyson.de/content/dam/dyson/maintenance/user-guides/de_DE/vacuumcleaners/uprightvacuums/dc25/15276-01.pdf) |
| DC26 | Bodenstaubsauger | [Dyson](https://www.dyson.de/support/vacuum-cleaners/cylinders/dc26) | [Anleitung](https://www.dyson.de/content/dam/dyson/maintenance/user-guides/de_DE/vacuumcleaners/cylindervacuums/dc26city/20441-01.pdf) |
| DC29 | Bodenstaubsauger | [Dyson](https://www.dyson.de/support/vacuum-cleaners/cylinders/dc29) | [Anleitung](https://www.dyson.de/content/dam/dyson/maintenance/user-guides/de_DE/vacuumcleaners/cylindervacuums/dc29/21840-01.pdf) |
| DC32 | Bodenstaubsauger | [Dyson](https://www.dyson.de/support/vacuum-cleaners/cylinders/dc32) | [Anleitung](https://www.dyson.de/content/dam/dyson/maintenance/user-guides/de_DE/vacuumcleaners/cylindervacuums/dc32/19755-01.pdf) |
| DC33C | Bodenstaubsauger | [Dyson](https://www.dyson.de/support/vacuum-cleaners/cylinders/dc33c) | [Anleitung](https://www.dyson.de/content/dam/dyson/maintenance/user-guides/de_DE/vacuumcleaners/cylindervacuums/dc33c/101849-01.pdf) |
| DC35 | Akku-/Stickgerät | [Dyson](https://www.dyson.de/support/vacuum-cleaners/cordless/dc35) | [Anleitung](https://www.dyson.de/content/dam/dyson/maintenance/user-guides/de_DE/vacuumcleaners/cordlessstickvacuums/dc35/20831-01.pdf) |
| DC36 | Bodenstaubsauger | [Dyson](https://www.dyson.de/support/vacuum-cleaners/cylinders/dc36) | [Anleitung](https://www.dyson.de/content/dam/dyson/maintenance/user-guides/de_DE/vacuumcleaners/cylindervacuums/dc36/23723-01.pdf) |
| DC37 | Bodenstaubsauger | [Dyson](https://www.dyson.de/support/vacuum-cleaners/cylinders/dc37) | [Anleitung](https://www.dyson.de/content/dam/dyson/maintenance/user-guides/de_DE/vacuumcleaners/cylindervacuums/dc37/22349-01.pdf) |
| DC37C | Bodenstaubsauger | [Dyson](https://www.dyson.de/support/vacuum-cleaners/cylinders/dc37c) | [Anleitung](https://www.dyson.de/content/dam/dyson/maintenance/user-guides/de_DE/vacuumcleaners/cylindervacuums/dc37c/207517-01.pdf) |
| DC42 | Bürststaubsauger | [Dyson](https://www.dyson.de/support/vacuum-cleaners/uprights/dc42) | [Anleitung](https://www.dyson.de/content/dam/dyson/maintenance/user-guides/de_DE/vacuumcleaners/uprightvacuums/dc42/205550-01.pdf) |
| DC45 | Akku-/Stickgerät | [Dyson](https://www.dyson.de/support/vacuum-cleaners/cordless/dc45) | [Anleitung](https://www.dyson.de/content/dam/dyson/maintenance/user-guides/de_DE/vacuumcleaners/cordlessstickvacuums/dc45/204150-01.pdf) |
| DC46 | Bodenstaubsauger | [Dyson](https://www.dyson.de/support/vacuum-cleaners/cylinders/dc46) | [Anleitung](https://www.dyson.de/content/dam/dyson/maintenance/user-guides/de_DE/vacuumcleaners/cylindervacuums/dc46/25432-01.pdf) |
| DC48 | Bodenstaubsauger | [Dyson](https://www.dyson.de/support/vacuum-cleaners/cylinders/dc48) | [Anleitung](https://www.dyson.de/content/dam/dyson/maintenance/user-guides/de_DE/vacuumcleaners/cylindervacuums/dc48/64128-01.pdf) |
| DC51 | Bürststaubsauger | [Dyson](https://www.dyson.de/support/vacuum-cleaners/uprights/dc51) | [Anleitung](https://www.dyson.de/content/dam/dyson/maintenance/user-guides/de_DE/vacuumcleaners/uprightvacuums/dysondc51ballcompactvacuums/24754-01.pdf) |
| DC52 Cinetic | Bodenstaubsauger | [Dyson](https://www.dyson.de/support/vacuum-cleaners/cylinders/dc52-cinetic) | [Anleitung](https://www.dyson.de/content/dam/dyson/maintenance/user-guides/de_DE/vacuumcleaners/cylindervacuums/dc52/103882-01.pdf) |
| DC63 | Bodenstaubsauger | [Dyson](https://www.dyson.de/support/vacuum-cleaners/cylinders/dc63) | nicht erfasst |
| Omni-glide | Akku-/Stickgerät | [Dyson](https://www.dyson.de/support/vacuum-cleaners/multi-directional/omni-glide) | [Anleitung](https://www.dyson.de/content/dam/dyson/maintenance/user-guides/de_DE/vacuumcleaners/cordlessstickvacuums/omniglide/Bedienungsanleitung%20_Manual_Omni_glide.pdf) |
| PencilVac | Akku-/Stickgerät | [Dyson](https://www.dyson.de/staubsauger/kabellos/pencilvac/fluffycones) | nicht erfasst |

31 neue Geräte haben direkt gelesene Hersteller-PDFs. Die ältere Manifestzahl 54 bleibt als Bestandszählung erhalten; lokal ergeben sich 85 Anleitungseinträge nach der bestehenden Zählweise. Fehlende oder nicht lesbare PDFs erhalten keine fingierten Links. Supportseiten bleiben über den Herstellerlink erreichbar.

### Zurückgestellt

| Kandidat | Offene Grenze | Primärquelle |
|---|---|---|
| DC26 City | DC26-Servicevarianten teilen die gleiche Geräteform/Anleitungsklasse; City allein beweist keine eigenständige Generation. | [Dyson](https://www.dyson.de/support/vacuum-cleaners/cylinders/dc26-city) |
| DC62 | Eigenständigkeit gegenüber bereits vorhandenem V6 nicht technisch belegt; gemeinsame V6-Akkunennung ist weder Alias- noch Trennungsbeweis. | [Dyson](https://www.dyson.de/support/vacuum-cleaners/cordless/dc62) |
| Small Ball | Service-Seite vorhanden; technische Generationstrennung gegenüber DC51 bzw. regionale UP-Kennung nicht ausreichend belegt. | [Dyson](https://www.dyson.de/support/vacuum-cleaners/uprights/small-ball) |
| Ball | Generische Herstellerbezeichnung; eindeutige Grundgeräte-/Regionalkennung gegenüber DC37/DC37C bleibt offen. | [Dyson](https://www.dyson.de/support/vacuum-cleaners/cylinders/ball) |
| DC17 | Offiziell in Altgeräte-/Reparaturübersicht genannt, aber keine separat abrufbare DE-Modellseite/Anleitung und vollständige Ausführungsabgrenzung belegt. | [Dyson](https://www.dyson.de/support/retired-machines) |
| DC27 | Offiziell in Altgeräte-/Reparaturübersicht genannt, aber keine separat abrufbare DE-Modellseite/Anleitung und vollständige Ausführungsabgrenzung belegt. | [Dyson](https://www.dyson.de/support/retired-machines) |
| DC28 | Offiziell in Altgeräte-/Reparaturübersicht genannt, aber keine separat abrufbare DE-Modellseite/Anleitung und vollständige Ausführungsabgrenzung belegt. | [Dyson](https://www.dyson.de/support/repairs-and-servicing-information) |
| DC43 | Reparaturseite nennt DC43, Altgeräteauswahl nennt Handstaubsauger DC43H. Kein Alias oder eigenständiges Bodengerät aus dem gekürzten Code abgeleitet. | [Dyson](https://www.dyson.de/support/repairs-and-servicing-information) |

### Ausgeschlossen

| Kandidat | Grund | Primärquelle |
|---|---|---|
| Omni-glide+ | Plus kennzeichnet ein Ausstattungs-/Zubehörpaket; keine zusätzliche technische Generation belegt. | [Dyson](https://www.dyson.de/support/journey/replacement-parts/search.370471-01) |
| V16 Piston Animal mit Spezialreinigungsset | Vorhandenes V16-Grundgerät mit zusätzlichen Aufsätzen, kein weiteres Grundgerät. | [Dyson](https://www.dyson.de/staubsauger/tierhaare) |
| PencilVac Fluffycones | Produkt-/Bodendüsenname derselben neu erfassten PencilVac-Generation; kein zweiter Import. | [Dyson](https://www.dyson.de/staubsauger/kabellos/pencilvac/fluffycones) |
| V16 Piston Animal Submarine | Nass-/Trocken-Kombigerät außerhalb des Issue-Scope. | [Dyson](https://www.dyson.de/staubsauger/nass-trocken) |
| V15s Detect Submarine | Nass-/Trocken-Kombigerät außerhalb des Issue-Scope. | [Dyson](https://www.dyson.de/staubsauger/nass-trocken) |
| 360 Vis Nav / Spot+Scrub Ai | Robotermodelle außerhalb des Issue-Scope. | [Dyson](https://www.dyson.de/staubsauger) |
| WashG1 / PencilWash | Nassreiniger/Mopps außerhalb des Issue-Scope. | [Dyson](https://www.dyson.de/nassreiniger) |
| DC16 | Dyson ordnet dieses Gerät als Handstaubsauger ein; kein Boden-/Stickgerät im Issue-Scope. | [Dyson](https://www.dyson.de/support/retired-machines) |
| DC30 | Dyson ordnet dieses Gerät als Handstaubsauger ein; kein Boden-/Stickgerät im Issue-Scope. | [Dyson](https://www.dyson.de/support/retired-machines) |
| DC31 | Dyson ordnet dieses Gerät als Handstaubsauger ein; kein Boden-/Stickgerät im Issue-Scope. | [Dyson](https://www.dyson.de/support/retired-machines) |
| DC34 | Dyson ordnet dieses Gerät als Handstaubsauger ein; kein Boden-/Stickgerät im Issue-Scope. | [Dyson](https://www.dyson.de/support/retired-machines) |
| DC43H | Dyson ordnet dieses Gerät als Handstaubsauger ein; kein Boden-/Stickgerät im Issue-Scope. | [Dyson](https://www.dyson.de/support/retired-machines) |

DC04 mit/ohne Kupplung ist eine Ausführungsgrenze innerhalb des einen aufgenommenen DC04-Modells. DC26 City/DC26 und DC62/V6 werden ohne Hersteller-Abgrenzung nicht doppelt gezählt. Regionale Codes werden nicht anhand von Händlerbezeichnungen ergänzt. Submarine, Saugroboter und reine Handgeräte bleiben außerhalb des Scopes.

## Bestehende Artikel und Quellenprüfung

Alle 60 bisherigen Geräte-URLs wurden erneut angefragt: 44 Inhalte waren abrufbar, 16 blieben offen. Alle 185 physischen Artikelkennungen wurden auf kanonischen Dyson-Artikel-URLs geprüft: 176 Kennungen bestätigten sich, neun Abrufe blieben offen. Die Original-URLs und Quelldaten bleiben erhalten. Der Prüfdatensatz dokumentiert Original- und kanonische URL, beobachtete Kennung und Abrufgrenze.

Diese Prüfung erneuert **keine** Geräte-/Artikelpassung, Preise, Bestände, Versandkosten oder Liefertermine. `fitmentReapproved` bleibt false. Alle 191 Rohartikel, 754 bestehenden Beziehungen, früheren Preise/Zustände sowie die hydratisierten Modell-/Artikelobjekte stimmen mit vor dem Import aufgenommenen SHA-256-Snapshots überein. Neue Geräte haben 0 Teile und keine Geräteangebote, EAN oder numerische Produktnummer.

Offene Artikelabrufe: 965670-01, 965177-01, 969290-01, 969043-04, 969043-06, 967477-03, 967477-04, 967369-01, 972126-01. Die gescheiterten Abrufe entfernen keine vorhandenen Artikel und werden nicht als aktuell verifiziert bezeichnet.

## Reproduktion

Voraussetzung: Checkout des zugewiesenen Branches mit unverändertem v1.28.0-Checkpoint; Node, Python 3 und die vom bestehenden Builder verwendete esbuild-Version. Die folgenden Befehle laufen im Repository, ohne Veröffentlichung:

```sh
python3 integrations/restore-source-checkpoint.py --target site
node integrations/import-dyson-models-wave2.test.mjs
node integrations/import-dyson-models-wave2.mjs --target site
node integrations/import-dyson-models-wave2.mjs --target site --check
# Falls esbuild nicht über integrations/auth-sdk auflösbar ist:
# UF_ESBUILD_MODULE=/absolute/path/to/esbuild/lib/main.js node integrations/build-app.mjs
node integrations/build-app.mjs
(cd site && npm test && npm run check)
node integrations/build-app.mjs --check
```

`restore-source-checkpoint.py` verlangt ein nicht existentes Ziel. Bereits vorhandene Kopien separat erhalten, nicht überschreiben. Der Importer akzeptiert `--target` und `--evidence`; `--check` prüft ausschließlich einen bereits identischen Import und schreibt nichts. Keine Netzwerkzugriffe oder zusätzlichen npm-Abhängigkeiten im Importer.

Sicherheitsgrenzen: Branch, Ziel-Repository, ungetracktes Ziel, Symlinks in Pfad/Baum, alle 131 Checkpoint-Dateihashes, Evidenzstruktur, OEM-Quellen und eindeutige Patch-Anker werden vor Zielmutation geprüft. Generierte Dateien dürfen nicht kollidieren. Danach wird eine vollständige Kopie gestaged; ein erneuter Baumvergleich erkennt zwischenzeitliche Änderungen. Erst dann wird das Ziel mit Rückfallkopie ersetzt. Fehlgeschlagene Schreib-/Commit-Schritte erhalten den ursprünglichen Baum. Ein Zustandsprotokoll enthält die unveränderten Patch-Eingaben; Wiederholung prüft die gesamten erwarteten Ausgaben und überschreibt keine abweichenden Folgeänderungen.

## Validierung

- Vollständige App-Suite: 39 Testgruppen bestanden, einschließlich neuer Dyson-Integration.
- Vollständiges `npm run check` und Syntax aller drei eingereichten JavaScript-Dateien bestanden.
- 53 ungültige/konfliktbehaftete Fälle abgewiesen; Fremdbranch, externe Quellen, Dubletten, Farb-/Bundle-Füller, offene Identitäten, erfundene Preise/Artikel/Kennungen, Checkpointkonflikte, Symlinks und Ausgabekollisionen eingeschlossen.
- Schreibfehler und fehlgeschlagener zweiter Rename rollen zurück; gleichzeitige Änderungen werden erhalten.
- Zwei unabhängig wiederhergestellte Checkpoints erzeugen bytegleiche Quellen. Wiederholung und `--check` verändern keine Datei.
- Alle 10 kompilierten Pakete aus zwei frischen Wiederherstellungen sind bytegleich; `build-app.mjs --check` besteht.
- Alte IDs, Objektidentität beim Lazy Load, alle Artikel/Preise/Zustände, Backup, Filter, Coverage und Index/Payload-Konsistenz getestet.
- Neue Hersteller-Modellreferenzen besitzen keine `device-sku`. OCR prüft ganze Kennungen; falsche Marke, Seriennummer, unvollständige/falsche Suffixe, Produktnummernfelder und ähnliche Bundle-Namen bestätigen kein neues Gerät. Bestehende echte Dyson-Produktnummern bleiben suchbar. Kein Modelltreffer gibt eine Teilepassung frei.

Nachweise: [dyson-validation-wave2.json](dyson-validation-wave2.json), [dyson-validation-wave2.log](dyson-validation-wave2.log).

## Nur lokal erzeugte Dateien

Diese Source-Dateien sind **nicht** Bestandteil des Work-Commits. Der Release-Owner übernimmt die Patches nach Prüfung:

| Lokale Datei unter `site/` | Änderung / Konfliktstelle |
|---|---|
| `src/data/dyson-models-wave2.js` | 38 neue Rohreferenzen, keine Teile oder Produktnummern |
| `tests/dyson-models-wave2.test.mjs` | Neue Regressionen und vorher aufgenommene Bestandshashes |
| `src/data/dyson-pack.js` | Append-Hook; unveränderte Rohdaten erhalten |
| `src/data/brand-index.js` | Append-Hook und Manifest; 92 Namen, 98 Records, unabhängige Gesamtzahl offen; packBytes bis zum Release-Build offen |
| `src/data/brand-products.js` | Nur neue Dyson-Modellreferenzen von echten numerischen SKU-Datensätzen trennen |
| `src/core/typeplate.js` | Neue DC-/Generationsreferenzen exakt erkennen; ganze Dyson-Modellfelder erhalten |
| `tests/catalog-seven-brands.test.mjs` | Globale Modell-/Record-/Slot-Deltas +38 |
| `tests/vorwerk-expansion.test.mjs` | Globale Modell-/Record-/Slot-Deltas +38, übrige Assertions erhalten |
| `tests/philips-expansion.test.mjs` | Dyson-Namenszählung +38; Artikelzahl unverändert |
| `package.json` | Dyson-Test/Syntax ergänzen; keine Versionsanhebung |
| `src/data/dyson-models-wave2-state.json` | Lokales Integritäts-/Idempotenzprotokoll; kein App-Import |

Daneben entstehen lokal die vorhandenen zehn v1.28.0-Buildpakete (`app`, `services`, acht `catalog-*`). Diese sind ebenfalls nicht eingereicht. Core +40.475 Byte, Dyson-Paket +39.688 Byte (300.258 Byte nach Import); die übrigen acht Pakete bleiben unverändert. Das Buildprotokoll erfasst deren genaue Hashes.

## Zwischenzeitliches main und Übergabe an #12

`main` wurde während der Arbeit auf `9419d49419fd2d3257b910f49c9afd30f40de289` / **v1.28.2** geändert: zehn Samsung-OEM-Artikel in v1.28.1 und mobile Herstellerlinks in v1.28.2. Der neue Checkpoint wurde lesend vollständig geprüft (SHA-256 `bc272af5578364432f7ccd1279b600cc2afa086225c87be84ec748fc5379c378`). Dyson-Pack, Brand-Products, Brand-Index und Typenschildkern sind unverändert; Modellbasissummen bleiben 943 / 954. Die globalen Artikelbasissummen steigen durch Samsung um 10 (1940 / 1822), nicht durch diese Dyson-Arbeit.

Der neue Checkpoint weicht in 16 Dateien vom zugewiesenen ab. Besonders `package.json` und `tests/vorwerk-expansion.test.mjs` überschneiden sich mit lokalen Patches. Der eingefrorene Importer verweigert diesen neuen Checkpoint absichtlich. **Kein direktes Replay auf v1.28.2 und kein ungeprüftes Überschreiben:** #12 muss den Datendelta +38 und die kleinen Shared-Patches portieren, aktuelle Version/Samsung-Artikel/Mobilkorrektur erhalten, alle Basishashes und Bestands-Snapshots aktualisieren, Manifest `packBytes` aus seinem Build setzen und danach erneut die vollständige Suite/build/check ausführen. Anwendungsintegration ist bis dahin offen; die Work-PR liefert den geprüften Intake, keine bereits veröffentlichte App.

Offene Recherche: acht zurückgestellte Identitäten, numerische Produkt-/SV-/UP-Ausführungen neuer Generationen, fehlende/unlesbare Anleitungen und neun nicht erneut bestätigte Artikelabrufe. Neue konkrete Teilelisten erfordern eigene Modell-Ausführungsbelege. Kein Merge, kein Deployment, keine Änderung an Release-/Versions-/Workflow-/Checkpoint-/Roadmap-Dateien durch diese Work-PR.
