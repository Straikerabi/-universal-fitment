# Hoover – Work C, Runde 2 (#24)

Branch `work/model-hoover-wave2`, zugewiesene Integrationsbasis
`d254df54d7bb4d72febdf9f2587efec9a66be336`, App v1.28.0. Stand: 2026-10-08.
Der PR liefert Forschungsdaten, Importer, Tests und Integrationsnachweise.
Die Anwendung wird ausschließlich lokal aus dem geprüften Checkpoint erzeugt.
Der zentrale Release-Owner (#12) übernimmt die gemeinsamen Änderungen.

## Ergebnis

| Kennzahl | Vorher | Lokal nach Import |
| --- | ---: | ---: |
| Eigenständige Hoover-Grundmodelle | 24 | 100 |
| Physische Hoover-Artikel | 60 | 60 |
| Hoover-Geräte-Artikel-Beziehungen | 22 | 22 |
| Hoover-Modelle ohne Teileliste | 22 | 98 |
| Katalog-Grundmodelle aller Marken | 943 | 1019 |
| Katalog-Modellrecords aller Marken | 954 | 1030 |
| Auf 100 pro Marke begrenzte Zielplätze | 730 | 806 |

76 neue Modelle, **0 neue Artikel, 0 neue Passungen**. Quellenmärkte der neuen
Modelle: **3 DE, 1 FR, 72 GB**. Der Markt erscheint in den Geräteinformationen.
Die britischen/französischen Referenzen werden weder als deutsche Varianten
noch als deutsche Verkaufsangebote ausgegeben. Neue Modelle erhalten keine
Preise, Bestände, EAN, PNC, technische Revisionen oder Zubehörfreigaben.

Die ursprünglichen 24 Modellrecords einschließlich Codes, Aliase und Quellen
bleiben erhalten. Alle ursprünglichen Artikel, Preise, Zustände und Beziehungen
werden vor und nach `applyHooverFitment` vollständig verglichen. HF202P 011
(39401035) behält 10, HF201H 011 (39401038) 12 Artikelbeziehungen. Die übrigen
22 ursprünglichen und alle 76 neuen Geräte bleiben ohne Teileliste.

## Quellen und Zählentscheidungen

`hoover-model-research-wave2.json` dokumentiert alle **522** Kandidaten mit
genauem Modell-/Produktcodepaar, Quellenmarkt, URL, Datum, Geräteart,
Entscheidung, Begründung und Unsicherheiten: **76 angenommen, 372
zurückgestellt, 74 abgelehnt**. `hoover-source-evidence-wave2.json` enthält die
faktischen Quellenbeobachtungen und Hashes, ohne Herstellerhandbücher zu kopieren.

Ausgangspunkt sind 518 Geräte im offiziellen
[Hoover-UK-Serviceverzeichnis](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/)
und vier individuell geprüfte aktuelle Herstellerseiten aus DE/FR. Jede
angenommene UK-Referenz wurde auf ihrer individuellen Service-Seite mit exakt
angezeigtem Modell und achtstelligem Produktcode geprüft. Ihr offizielles
PDF-Handbuch war erreichbar und wurde durch Inhaltshash abgeglichen.
Die DE/FR-Seiten wurden über ihre gerenderte Produktansicht geprüft; der direkte
HTTP-Abruf wurde dort mit 403 gesperrt und wird nicht als erfolgreicher Abruf
ausgewiesen.

Für UK wurde je Code-Präfix und separat verlinktem Handbuch nur ein Vertreter
aufgenommen. Bytegleiche Handbücher ergeben ohne zusätzliche Abgrenzung kein
weiteres Grundmodell. Handbücher belegen dabei keine technische Teilegleichheit.
Bestehende Geräte und deren Aliase/Produktcodes werden vor dem Import abgezogen.
Die vollständige Liste der aufgenommenen Referenzen steht am Ende dieses Berichts.

Zurückgestellt sind unter anderem zusätzliche Regional-/Ausstattungsvarianten,
gemeinsame Handbücher, ungeprüfte individuelle Verzeichniseinträge sowie
CP71CP01 (39001183/39001417) und SL8123 (39100171/39100248): gleichnamige
Geräte mit verschiedenen Produktcodes werden ohne Plattformbeleg nicht doppelt
gezählt. DM4468 und UTP1605 hatten keinen erfolgreichen Detailseitenabruf;
das TP6206-Handbuch war nicht erreichbar. HE520PET, HL500HM und WRE01 haben
keinen geprüften Handbuchbeleg und bleiben zurückgestellt. HE520PET wird außerdem
wegen möglicher Überschneidung mit der FR-H-ENERGY-500-Referenz nicht gezählt.
Handheld-only, Roboter und KIT-/Zubehör-Einträge werden abgelehnt. Ein
integrierter Handstaubsauger macht ein vollständiges 2-in-1-Bodengerät nicht zu
einem zusätzlichen Grundmodell.

Der EU-Serviceabruf für die zwei ursprünglichen HF2-Passungslisten war blockiert.
Ihre Hersteller-Modell-/Produktcodepaare wurden geprüft; die früher erfassten
Passungen bleiben unverändert aus dem geprüften Checkpoint erhalten. **Es wird
keine neue Live-Verifikation dieser 22 Passungen behauptet.**

## Reproduzierbarer Import und vollständige Prüfung

Voraussetzungen: Node.js 24 (verwendet: 24.19.0), Python 3, npm, Git; die
Projektabhängigkeit esbuild ist auf 0.25.12 festgelegt. Der Build benötigt kein
Herstellernetzwerk. Auf einer frischen Arbeitskopie des zugewiesenen Branches:

```sh
npm ci --prefix integrations/auth-sdk --ignore-scripts
python3 integrations/restore-source-checkpoint.py --target site
node integrations/import-hoover-models-wave2.mjs --target site --check
node integrations/import-hoover-models-wave2.mjs --target site
node integrations/import-hoover-models-wave2.mjs --target site --check
node integrations/build-app.mjs
node integrations/build-app.mjs --check
npm --prefix site test
npm --prefix site run check
node --test integrations/hoover-models-wave2.test.mjs
```

`site/` muss vor dem Wiederherstellen fehlen. Vorhandene Arbeit nicht löschen.
`UF_ESBUILD_MODULE` kann alternativ auf die bereits installierte esbuild-
Moduldatei zeigen; die Version wird trotzdem geprüft.

Der vollständige Nachweis mit **zwei separaten, frischen Checkpoints** wird so
reproduziert; eine vorhandene `site/`-Arbeitskopie wird dabei nicht angefasst:

```sh
node integrations/hoover-verify-wave2.mjs --report integrations/hoover-validation-wave2.json
```

Der geprüfte Lauf hat **38 App-Testgruppen und 29 zusätzliche Hoover-Tests ohne
Fehler** bestanden, außerdem App-/Importer-/Test-Syntax und beide Build-Checks.
Alle sechs generierten Source-Dateien und zehn Buildpakete waren zwischen beiden
frischen Läufen bytegleich. Die tatsächlichen SHA-256-Hashes und Paketgrößen
stehen in `hoover-validation-wave2.json`. Das Hoover-Paket hat 187679 Bytes;
Index-`packBytes` und tatsächliches Buildpaket stimmen überein.

Die Hoover-Tests prüfen alle 76 neuen Modell-/Produktcodepaare vor und nach
Lazy Loading, Index/Payload-Gleichheit, unveränderte ursprüngliche Records und
Artikel, Modellzähler, 0 Kandidatenteile/Angebote, stabile IDs/Backup und
Hydration derselben gespeicherten Geräteobjekte. Synthetische Typenschild-/OCR-
Fixtures prüfen falsche Hersteller, Seriennummer/PNC, unbekannte oder
widersprüchliche Produktcodes (auch mit Leerzeichen), ungezählte `/9`-Varianten
und bekannte Codes eines anderen Gerätes. Solche Konflikte liefern keine
Gerätefreigabe. Eine physische Geräteprüfung ist damit nicht behauptet.

Der Importer liest JSON-Daten, führt keine Quellpakete aus und prüft vor Mutation
die gepinnten Forschungs-/Beleg-/Basis-Snapshots, alle 131 Checkpointdateien,
Quellenhosts, Gerätearten, Produktcodes, Dubletten und esbuild-Version. Es gibt
keinen Force-Modus. Symlinks in Ziel oder Quelldateien, Änderungen anderer
Marken, abweichende Source-Dateien und gemischte Teilimporte werden abgelehnt.
`--check` schreibt nichts; ein zweiter vollständiger Import schreibt nichts.
Anwendung auf `main`, `master` oder detached HEAD wird verweigert.

Vor Schreibzugriff werden alle Dateien gestaged und nochmals mit der gesamten
Quelle verglichen. Ein exklusiver Transaktionslock verhindert konkurrierende
Importer. Jede Ersetzung nutzt Rename; gewöhnliche Schreibfehler rollen bereits
ersetzte Dateien zurück. Tests simulieren Quellkonflikte, Änderungen zwischen
Planung und Commit, Rename-Fehler, Symlinks und vorhandenen Lock. Ein Prozess-
oder Systemabbruch während mehrerer Renames ist nicht vollständig atomar: Lock
und Teilzustand verhindern einen weiteren Import; dann eine frische lokale
Checkpointkopie anlegen. Der Importer ersetzt nie eine abweichende Source-Datei.

## Lokal erzeugte Source-Patches für den Release-Owner

Genau diese sechs Dateien werden lokal generiert und **nicht im Work-PR
committet**:

| Datei in `site/` | Inhalt / Integrationsstelle |
| --- | --- |
| `src/data/hoover-pack.js` | 76 Herstellerreferenzen; ursprüngliche Records/Artikel erhalten |
| `src/data/new-brands-index.js` | Hoover-Index, Zähler, Handbücher, Paketgröße; Samsung unverändert auf der zugewiesenen Basis |
| `src/core/typeplate.js` | Enger Hoover-Konfliktcheck für unbekanntes Modell oder widersprüchlichen achtstelligen Produktcode |
| `tests/catalog-seven-brands.test.mjs` | 1019/1030 Records und 806 begrenzte Zielplätze |
| `tests/vorwerk-expansion.test.mjs` | dieselben gemeinsamen Katalogzähler |
| `tests/catalog-v126.test.mjs` | 98 Hoover-Records ohne Teileliste |

Konfliktstellen sind insbesondere der gemeinsame Markenindex, die gemeinsamen
Zählertests und der Typenschildparser. Die Parseränderung betrifft ausschließlich
Hoover; bestehende OCR-Muster anderer Hersteller bleiben erhalten.
`hoover-checkpoint-lock-wave2.json` ist ein separater markenspezifischer
Basisnachweis. Der gemeinsame `source-checkpoint.json`, `.demo/`, Version,
Workflows, Release-Dateien und Roadmap werden nicht verändert.

## Erneuter Abgleich mit geändertem main

Vor PR-Erstellung wurde `main` **nur gelesen**, nicht ausgecheckt oder geändert:
`9419d49419fd2d3257b910f49c9afd30f40de289`, App v1.28.2. Der neue Checkpoint
wurde mit seinem Archivhash geprüft. `hoover-main-recheck-wave2.json`
dokumentiert die Source-Unterschiede, den erneuten Hoover-Abgleich und den
mutationfreien Abbruch des v1.28.0-Importers auf v1.28.2.

Hoover-Pack und Fitment-Source sind bytegleich zur zugewiesenen Basis; die 24
Hoover-Indexrecords sind unverändert. Somit gelten weiterhin 24 → 100 Modelle,
60 Artikel und 22 Passungen. Der aktuelle Gesamtkatalog hat 943 Modelle,
954 Modellrecords, 1940 Artikel und 1822 physische Artikel. Nach gezielter
Owner-Integration werden 1019 Modelle und 1030 Records erwartet; die Artikel-
summen bleiben 1940/1822.

**Offene Owner-Aufgaben:** Die sechs Patches auf einer aktuellen Integrations-
branch gezielt übernehmen, den Basis-Lock und die Versions-/Buildpfade geprüft
neu erzeugen, die zehn neuen Samsung-Artikel und den mobilen Herstellerlink-Fix
beibehalten und anschließend alle Prüfungen erneut laufen lassen. Der
v1.28.0-Importer darf nicht durch Umgehen der Hashprüfung auf den neueren
Checkpoint angewandt werden. PR nicht direkt mergen; Rebase, Verpackung und
Veröffentlichung bleiben beim zentralen Release-Owner #12.

## Aufgenommene Modell-/Produktcodepaare

Die Tabelle wird aus den 76 `accepted`-Datensätzen der Forschungsdatei erzeugt.
Jede Quelle nennt das konkrete Modell und den achtstelligen Produktcode.

| Markt | Modell | Produktcode | Herstellerquelle |
| --- | --- | --- | --- |
| DE | HE210P 011 | 39002352 | [Hoover](https://www.hoover-home.com/de_DE/bodenstaubsauger/39002352/he210p-011/) |
| DE | HE310HM 011 | 39002270 | [Hoover](https://www.hoover-home.com/de_DE/bodenstaubsauger/39002270/he310hm-011/) |
| DE | HP210P 011 | 39002351 | [Hoover](https://www.hoover-home.com/de_DE/bodenstaubsauger/39002351/hp210p-011/) |
| FR | HE510HM 011 | 39002267 | [Hoover](https://www.hoover-home.com/fr_FR/products/39002267-he510hm-011) |
| GB | AC73SE20001 | 39001364 | [Hoover](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/ac73se20001/) |
| GB | AL71SZ01001 | 39100442 | [Hoover](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/al71sz01001/) |
| GB | AT70ID40 | 39001187 | [Hoover](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/at70id40/) |
| GB | ATC18LI | 39001570 | [Hoover](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/atc18li/) |
| GB | BF70VS01001 | 39001365 | [Hoover](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/bf70vs01001/) |
| GB | BV71CP10 | 39001522 | [Hoover](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/bv71cp10/) |
| GB | CA18TG2 | 39400189 | [Hoover](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/ca18tg2/) |
| GB | CH51S20 | 39001560 | [Hoover](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/ch51s20/) |
| GB | CP70CP11 | 39001182 | [Hoover](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/cp70cp11/) |
| GB | CU81CU11001 | 39001178 | [Hoover](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/cu81cu11001/) |
| GB | DI2200 | 39100314 | [Hoover](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/di2200/) |
| GB | DME7133 | 39100271 | [Hoover](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/dme7133/) |
| GB | DML5224 | 39100268 | [Hoover](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/dml5224/) |
| GB | DS22G | 39400303 | [Hoover](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/ds22g/) |
| GB | DV70ID02 | 39400170 | [Hoover](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/dv70id02/) |
| GB | FD22G | 39400273 | [Hoover](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/fd22g/) |
| GB | FE144AG | 39400293 | [Hoover](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/fe144ag/) |
| GB | FJ120R2 | 39400090 | [Hoover](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/fj120r2/) |
| GB | FM144B2 | 39400235 | [Hoover](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/fm144b2/) |
| GB | FR7183 | 39100174 | [Hoover](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/fr7183/) |
| GB | GL1103 | 39100292 | [Hoover](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/gl1103/) |
| GB | GLE900 | 39100379 | [Hoover](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/gle900/) |
| GB | HF222RH 001 | 39400912 | [Hoover](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/hf222rh-001/) |
| GB | HFC216R 001 | 39400360 | [Hoover](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/hfc216r-001/) |
| GB | HP310HM 001 | 39002258 | [Hoover](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/hp310hm-001/) |
| GB | HU300RHM 001 | 39101032 | [Hoover](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/hu300rhm-001/) |
| GB | JA1600 | 39100283 | [Hoover](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/ja1600/) |
| GB | JC2145 | 39100118 | [Hoover](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/jc2145/) |
| GB | KS51_OP2 | 39001566 | [Hoover](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/ks51op2/) |
| GB | LA71SM10 | 39001524 | [Hoover](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/la71sm10/) |
| GB | PR60_SL40 | 39001568 | [Hoover](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/pr60sl40/) |
| GB | PU31EN10 | 39100507 | [Hoover](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/pu31en10/) |
| GB | RE71TP03001 | 39001354 | [Hoover](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/re71tp03001/) |
| GB | RU70RU15001 | 39001352 | [Hoover](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/ru70ru15001/) |
| GB | SE71SP05 | 39001390 | [Hoover](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/se71sp05/) |
| GB | SEA1RA02001 | 39001238 | [Hoover](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/sea1ra02001/) |
| GB | SI216RB | 39400305 | [Hoover](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/si216rb/) |
| GB | SP71_BL06001 | 39001409 | [Hoover](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/sp71bl06001/) |
| GB | ST70ST01001 | 39001356 | [Hoover](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/st70st01001/) |
| GB | STC18LI | 39001574 | [Hoover](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/stc18li/) |
| GB | SU204B2001 | 39400194 | [Hoover](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/su204b2001/) |
| GB | SX70HU01 | 39001180 | [Hoover](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/sx70hu01/) |
| GB | SY71NM02 | 39400171 | [Hoover](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/sy71nm02/) |
| GB | TAV1610 | 39000488 | [Hoover](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/tav1610/) |
| GB | TC1182 | 39000342 | [Hoover](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/tc1182/) |
| GB | TCP2011 | 39000822 | [Hoover](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/tcp2011/) |
| GB | TCR4213 | 39000616 | [Hoover](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/tcr4213/) |
| GB | TCU1410 | 39000956 | [Hoover](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/tcu1410/) |
| GB | TCW1610 | 39000787 | [Hoover](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/tcw1610/) |
| GB | TE70ID30001 | 39001189 | [Hoover](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/te70id30001/) |
| GB | TF2005 | 39000588 | [Hoover](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/tf2005/) |
| GB | TFB2010 | 39000442 | [Hoover](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/tfb2010/) |
| GB | TFC6283 | 39000401 | [Hoover](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/tfc6283/) |
| GB | TFS5206 | 39000474 | [Hoover](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/tfs5206/) |
| GB | TFV2015 | 39000722 | [Hoover](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/tfv2015/) |
| GB | TGP1410 | 39000794 | [Hoover](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/tgp1410/) |
| GB | TH71BL01 | 39100404 | [Hoover](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/th71bl01/) |
| GB | TJA1410 | 39000957 | [Hoover](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/tja1410/) |
| GB | TMI2015 | 39000828 | [Hoover](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/tmi2015/) |
| GB | TS2061 | 39000334 | [Hoover](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/ts2061/) |
| GB | TSB1906 | 39000742 | [Hoover](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/tsb1906/) |
| GB | TSE0100 | 39000614 | [Hoover](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/tse0100/) |
| GB | TSM1805 | 39000952 | [Hoover](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/tsm1805/) |
| GB | TSP2004 | 39000818 | [Hoover](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/tsp2004/) |
| GB | TSU2001 | 39000877 | [Hoover](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/tsu2001/) |
| GB | TSX2101 | 39000775 | [Hoover](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/tsx2101/) |
| GB | TTE2203 | 39000990 | [Hoover](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/tte2203/) |
| GB | TTG1100 | 39001095 | [Hoover](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/ttg1100/) |
| GB | TW1750 | 39000248 | [Hoover](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/tw1750/) |
| GB | TXP1215 | 39000784 | [Hoover](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/txp1215/) |
| GB | VR81HL01 | 39100472 | [Hoover](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/vr81hl01/) |
| GB | XP71EG25001 | 39001269 | [Hoover](https://service.hoover.co.uk/advice-centre/vacuum-cleaners/xp71eg25001/) |
