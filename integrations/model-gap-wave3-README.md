# Modelllücken Wave 3 · Issue #37

Exklusiver Branch: `work/catalog-model-gap-wave3`. Geprüfte Importbasis: `d4853c4e5245410630742f58aead661d77f42c32`, Source-Checkpoint v1.29.0. Kein Merge, Release, neuer Checkpoint oder Deployment. Nur eigene Wave3-Dateien in `integrations/` sind Bestandteil dieses Work-PRs.

## Ergebnis und Zählgrenzen

22 zusätzliche, einzeln herstellerbelegte Profile vollständiger Haushaltsstaubsauger; **keine** zusätzlichen Roboter, Vorsatzgeräte, Farben, Verkaufssets oder frei erfundenen Nummern. Ein Profil ist ausdrücklich **kein** Nachweis einer unabhängigen technischen Konstruktion oder einer konkreten Reparaturausführung. Der bestehende Katalog zählt Modellbezeichnungen und enthält bereits Varianten; diese Altzählung wird nicht nachträglich in eine Konstruktionen-Zahl umgedeutet.

| Marke | Vorher | Netto neue Profile | Danach | Rest bis Suchziel 100 | Aufnahmegrenze |
|---|---:|---:|---:|---:|---|
| Miele | 82 | 2 | 84 | 16 | S 5981, S 4812; historische Modellcode-Referenzen, Material/Typ/EAN offen |
| Dyson | 92 | 4 | 96 | 4 | DC14, DC17, DC27, DC28; US-Modellreferenzen, keine Produkt-SKUs |
| Samsung | 77 | 2 | 79 | 21 | Je ein exakt belegter VC2500-/SC52-Linienvertreter, keine weiteren Farb-/Ländervarianten |
| Vorwerk | 18 | 14 | 32 | 68 | Zwölf historische Original-Gerätenamen plus VK240 und VT250; Details unten |

Gedeckelte Zielplätze: **869 → 891 von 1.000**, Rest 109. Katalognamen: **1.082 → 1.104**, Modellrows: **1.093 → 1.115**. Die anderen sechs Marken bleiben unverändert. Netto neue Artikel, Preise, Fotos, EANs, Materialnummern und Teilepassungen: **0**.

Identitätsklassen der 22 Aufnahmen: **12 historische Namen vollständiger Geräte ohne belegte Typenschildkennung**, **8 Hersteller-Modellcode-Referenzen**, **2 repräsentative Gerätecodes bislang nicht repräsentierter Herstellerlinien**. Keine zusätzlichen reinen Marketing-Seriennamen. Eine genaue Nettozahl *unabhängiger technischer Konstruktionen* bleibt `null`: insbesondere aus 96 Dyson-Katalognamen folgt nicht „96 eigenständige Konstruktionen“.

## Primärquellen und Abgrenzung

Alle URLs, Regionen, Abrufdatum 2026-10-09, HTTP-Status, Dateigröße und SHA-256 stehen in `model-gap-wave3-research.json`. 15 offizielle Antworten wurden heruntergeladen und geprüft; die Herstellerdateien selbst werden nicht in diesem PR veröffentlicht. Die PDF-Methode umfasst Textextraktion und Sichtprüfung der relevanten Seiten.

- **Miele S 5981, DE:** [Herstellerkatalog 2011](https://www1.miele.de/ex/prospects/de/2011_10/9013391_Bodenpflege_FH/pdf/all.pdf#page=12), PDF-Seite 12 / gedruckte Seiten 22–23. Eigene ungebündelte Geräteabbildung/-beschriftung löst die bisherige Zurückstellung „S5981 + SEB217“ auf. SEB217 bleibt Zubehör, kein zusätzliches Gerät und keine neue Passung. Die genaue Ausführung bleibt offen.
- **Miele S 4812, SK:** [Herstellerbroschüre, Seite17](https://www1.miele.de/ex/ejournal/sk/vysavace/soubory/assets/basic-html/page17.html). Die Gerätetabelle nennt ausdrücklich **S 4812 Hybrid** und erläutert Netz-/Akkubetrieb. „Miele Hybrid“ wird nicht zusätzlich importiert. Keine Übernahme von Akku-/Beutel-/Düsenpassungen; SK-Quelle ist kein DE-Verkaufsnachweis.
- **Dyson, US:** eigene Herstellerseiten [DC14](https://www.dyson.com/support/vacuum-cleaners/uprights/dc14/clutched), [DC17](https://www.dyson.com/support/vacuum-cleaners/uprights/dc17), [DC27](https://www.dyson.com/support/vacuum-cleaners/uprights/dc27), [DC28](https://www.dyson.com/support/vacuum-cleaners/uprights/dc28), jeweils mit offizieller US-Geräteanleitung. DC14 Clutched/Clutchless, Absolute/Complete/Drive und Bundles werden nicht als weitere Geräte gezählt. Die DC14-PDF belegt den Grundnamen, nicht die konkrete Kupplungs-/SKU-Ausführung. DC17/27/28 waren zuvor wegen fehlender DE-Einzelquellen zurückgestellt; der neue Beleg ist sichtbar **US**, nicht erfundenes DE. Spannung, regionale Baugleichheit und Teile bleiben offen. Potenzielle regionale DC41/DC50/UP-/Ball-Aliase werden nicht aufgefüllt.
- **Samsung VC2500, CH:** [Produktseite](https://www.samsung.com/ch/vacuum-cleaners/canister/canister-gold-vc07m25m9wd-sw/), vollständiger Code **VC07M25M9WD/SW** aus dem Hersteller-`modelCode`-Feld. Ein neuer Linienvertreter, nicht zusätzlich Gold/Farbe/M25-Suffixe.
- **Samsung SC52, RU:** [modellgenaue Supportseite](https://www.samsung.com/ru/support/model/VCC5241S3K/XEV/), vollständiger Code **VCC5241S3K/XEV** im Geräteheader. „SC5241“ ist ein Alias desselben Profils. Kein DE-Marktnachweis und keine Extrapolation von SC52-Varianten. Supportseiten in beliebigen Ländern allein beweisen keinen Verkauf in diesen Ländern.

Vorherige Recherchen, unveränderte Input-Dateihashes und die konkreten Auflösungen stehen in `model-gap-wave3-prior-audit.json`. Alle vorhandenen Modellnamen, Codes und Aliase der vier betroffenen Marken wurden gegen die Aufnahmen normalisiert abgeglichen. Das ist **keine** pauschale Baugleichheitszertifizierung aller internationalen Geräte.

## Vorwerk: realistischer Archivrahmen statt Auffüllung auf100

Primärbelege: [deutscher Hersteller-Zeitstrahl](https://www.vorwerk.com/de/de/c/dam-home/newsroom/downloads/kobold/Kobold-Zeitstrahl-1930-heute.pdf), [deutsche Gerätehistorie](https://www.vorwerk.com/de/de/c/home/rezepte-und-ideen/ideenreich/kobold/wissen/kobold-handstaubsauger-effiziente-reinigung-seit-90-jahren), [Schweizer Nicht-reparierbar-Register](https://support-switzerland.vorwerk.com/hc/de-ch/articles/26524330442908-Kobold-Nicht-mehr-reparierbare-Modelle-im-%C3%9Cberblick) vom 2.April2026.

Zwölf neue vollständige historische Geräte unter den **exakt gedruckten Originalnamen**: Kobold30,32,33,35,38,52,53,114,116,117,118,119. Keine Umbenennung in aus der Zahl konstruierte VK30/VK117 usw.; interne IDs kodieren den belegten Namen. Der Typenschildcode dieser Profile bleibt ausdrücklich unbelegt. Klassische historische Hand-/Stiel-Haushaltsgeräte sind keine modernen Mini-Hand-/Autostaubsauger.

Zwei weitere ausdrücklich belegte Kennungen: **Kobold VK240** (Hersteller-Zeitstrahl: erster Bodenstaubsauger; **nicht** in VT240 umschreiben) und **Tiger250 / VT250** (DE-Zeitstrahl plus ausdrückliches CH-Register). DE und CH erzeugen dafür genau ein Profil.

| Abgegrenztes Archiv-Universum | Anzahl | Bedeutung |
|---|---:|---|
| Bestehende belegte Profile | 18 | VK7/VB100, VK120–200-Einzelmodelle und sechs vorhandene VT-/Tiger-Modelle |
| Zusätzliche einzeln benannte vollständige Geräte | 14 | Zwölf historische Originalnamen und zwei belegte Modellcodes |
| Bestätigte Geräteprofile nach Import | **32** | Kein globaler Konstruktionen-Zähler |
| Noch ungeklärte ausdrücklich genannte CH-Labels | 5 | Modell34,T,S,Elf52,Elf53; regionale Aliase/Baugleichheit offen |
| Nur hypothetische Restplätze im Bereich111–122 | 4 | Zwölf numerische Plätze minus acht einzeln bereits belegte Namen; **keine** daraus erzeugten Modelle |
| Bedingte obere Label-Hülle dieses Archiv-Universums | **41** | 32+5+4, absichtlich konservativ, mit potenziellen Alias-Dubletten |

**41 ist keine Behauptung, dass41 Grundkonstruktionen existieren, und keine absolute weltweite technische Obergrenze.** Die Archive sind keine nachgewiesen vollständige Weltinventur. Eine absolute Hersteller-Gesamtobergrenze bleibt unbelegt (`null`). Die realistisch belegte Aufnahmezahl aus diesen Archiven ist32; selbst die großzügige bedingte Hülle liegt deutlich unter100. Fehlende Einzelbelege werden nicht durch interpolierte Nummern, Vorsätze oder Länder-/Marketingnamen ersetzt.

EB/ET/SP/PB und andere ungesicherte Vorsatz-/Reinigungsgeräte zählen nicht zusätzlich; VR-Roboter sind ausgeschlossen. Die historische VB100-Abbildung aus1970 ist kein Beleg für ein zusätzliches Staubsauger-Grundgerät und wird nicht mit dem vorhandenen Akku-VB100 aus2018 verwechselt. Der widersprüchliche Fließtext „VK188“ wird nicht als zusätzliches Modell aufgenommen. Keine heutige Reparierbarkeit oder Ersatzteilverfügbarkeit für Altgeräte zugesichert.

## Reproduzierbarer Import

Voraussetzungen: Node.js mit ESM, Python3, Git und die im vorhandenen Lockfile gebundene esbuild-Installation. Für erneute Quellenprüfung zusätzlich curl und Poppler (`pdftotext`, `pdfinfo`). Kein Account, keine Auth-Geheimnisse und kein Backend nötig.

```sh
npm ci --prefix integrations/auth-sdk --ignore-scripts
python3 integrations/restore-source-checkpoint.py --target site
node integrations/import-model-gap-wave3-catalog.mjs --target site --dry-run
node integrations/import-model-gap-wave3-catalog.mjs --target site
node integrations/import-model-gap-wave3-catalog.mjs --target site --check
node integrations/build-app.mjs
npm test --prefix site
npm run check --prefix site
node integrations/build-app.mjs --check
node --test integrations/import-model-gap-wave3-catalog.test.mjs
node integrations/model-gap-wave3-verify.mjs --report integrations/model-gap-wave3-validation.json
```

Der Restorer verlangt ein noch nicht existierendes Ziel. Bereits vorhandene Benutzerarbeit nicht löschen/überschreiben. Der Gesamtverifier verwendet immer eigene temporäre Ziele, zwei unabhängige Restores, Volltests und Bytevergleiche; er verändert kein `site/` im Checkout. Die Wiederholung und `--check` sind auf dem Ziel lesend. Alle136 Source-Dateien und der komplette Forschungsdatensatz sind gepinnt. Abweichende/partielle Source-Stände, neue Ausgabekollisionen, Symlinks und konkurrierende Änderungen führen vor der Veröffentlichung zum Abbruch. Gesperrte, gestagte Transaktion mit Rollback bei abfangbaren Fehlern; nach Prozess-/Stromausfall **keine** automatische Teil-Reparatur, sondern frischen Checkpoint verwenden.

Quellen erneut in einem ausdrücklich gewählten, frischen Cache abrufen:

```sh
node integrations/import-model-gap-wave3-sources.mjs --cache-dir /ABSOLUTER/FRISCHER/CACHE --download
node integrations/import-model-gap-wave3-sources.mjs --cache-dir /ABSOLUTER/FRISCHER/CACHE
node integrations/model-gap-wave3-verify.mjs --report integrations/model-gap-wave3-validation.json --cache-dir /ABSOLUTER/CACHE
```

Ein geänderter Herstellerantwort-Hash ist Prüfbedarf, **keine** automatische neue Freigabe. Dynamische HTML-Seiten können sich ohne Modelländerung unterscheiden. Der hier protokollierte Vollverifier prüfte die15 Originalantworten des dokumentierten Abrufes; sie sind nicht als redistribuierbare Herstellerdateien beigelegt. Der Katalogimport bleibt vollständig offline reproduzierbar.

## Tests, Erhaltung und lokale Integration für Projektleitung #12

22 isolierte Importer-Tests und41 App-Testgruppen grün; zusätzlich `npm run check`, Syntaxprüfung aller restaurierten JS/MJS-Quelldateien und sechs eigener MJS-Dateien, zwei byte-identische frische Source-/10-Bundle-Builds und alle15 Sourceprüfungen. Quellen- und Volltestprotokoll: `model-gap-wave3-validation.json` / `.log`.

Die neue App-Vertragsprüfung hashvergleicht **sämtliche1093 alten Modellrows plus Familienprofile** vor und nach Lazy-Hydration sowie **alle1940 vorhandenen Artikel inklusive Preisen, Beziehungen und bestätigten Fitments**. Kein altes Modell wird ersetzt. Neue Profile sind leer bezüglich Teilen, Bildern, Preisen, Materialnummer/EAN und Variantenfreigabe. Exakte Modelle, beide Samsung-Länderkennungen, Serien-/FD-Ausschluss, Fremdmarken, widersprüchliche Kennungen, unbekannte Suffixe, neue Vorwerk-Namensgrenzen, Offline-Auflösung und Backup-IDs werden geprüft. Alte Wave2-Tests prüfen weiterhin ihre ursprünglichen Teilmengen und hashes; nur neue globale Zähler/zusätzliche Testabgrenzungen werden lokal erzeugt.

Der PR enthält **keine** Änderungen an `site/`, `.demo/`, `.github/`, globalen Paketen/README/ROADMAP, Versionen, Checkpoint oder Release-/Deploymentdateien. Der Importer erzeugt lokal17 Source-/Test-/Package-Pfade; genaue Pfade und Vorher-/Nachher-SHA-256 stehen in `model-gap-wave3-integration.json`. Dabei bleibt die Source-Version1.29.0 unverändert; die Projektleitung entscheidet über das spätere Release.

Ein präziser Unified-Patch lässt sich nach dem geprüften Import **außerhalb des Work-Repositories** erzeugen:

```sh
node integrations/model-gap-wave3-patch.mjs --target site --output /ABSOLUTER/EXTERNER/PFAD/model-gap-wave3-local.patch
```

Der Gesamtverifier erzeugt diesen Patch lokal, prüft `git apply --check`, wendet ihn auf einen dritten frischen Restore an und verlangt exakt dieselben Source-Bytes wie beim Importer. Der Patch und die generierten zentralen Source-/Build-Dateien werden **nicht** mit diesem Work-PR committed. Integrationsreihenfolge: **sauberer v1.29.0-Checkpoint → dieser Modellimport → neu geprüfte Teile-/Medienimporte durch Projektleitung**, jeweils Konfliktprüfung und erneute gemeinsame Volltests. Import gegen einen veränderten Zentralstand wird bewusst verweigert; keine stillen Rebase-/Merge-Heuristiken.

`main` wurde nachgeprüft: `71f7826ba936a1f3830c8b2a67e8085a9cfe234e` ergänzt nur PR-Scope-QA. Checkpoint/Restorer/Builder gegenüber der Issue-Basis identisch. Es wurde weder nachmain gewechselt noch dieser QA-Commit in den exklusiven Branch übernommen. Eine weltweite Vollständigkeit oder eine harte Obergrenze für Miele/Dyson/Samsung ist nicht bewiesen; die verbleibenden109 Suchzielplätze bleiben ehrlich offen.
