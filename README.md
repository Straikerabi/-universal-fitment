# Universal Fitment v1.29.0 – Bosch 100, Samsung 77 und mobile Teileansicht

[Roadmap · Deutsch](ROADMAP.md) · [Roadmap · English](ROADMAP.en.md) · [Patchnotes](CHANGELOG.md) · [Ideen & Kommentare](https://github.com/Straikerabi/-universal-fitment/issues)

Universal Fitment beginnt mit Staubsaugern für Deutschland. Unser langfristiges Ziel ist die verständliche Ersatzteilsuche für weitere Geräte und internationale Märkte. Die öffentliche Roadmap trennt vorhandene Funktionen, nächste Prioritäten und Zukunftspläne.

Der neue Kontaktbereich unter **Mehr → Kontakt & Roadmap** bereitet überprüfbare GitHub-Beiträge vor. Ein eigenes Supportpostfach und privater Versand sind noch offen; es werden keine E-Mails automatisch verschickt. Zentrale App-Nutzungszahlen sind bisher nicht erfasst.

Der Staubsaugerkatalog enthält **1.082 Modellbezeichnungen in 1.093 konkreten Modelleinträgen** und **1.940 unterschiedliche Katalogartikel**. Davon zählen **1.822** als katalogisierte Ersatzteile, Zubehörartikel oder Verbrauchsmaterialien. Dokumente, Komplettgeräte und noch nicht eingeordnete Artikel werden separat geführt. Neun Miele-Familienhinweise zählen nicht als konkrete Geräte.

Die Ziele sind getrennt: **100 echte Modellreferenzen und mindestens 100 katalogisierte Teile je Marke**. 869 von 1.000 gedeckelten Modellplätzen sind belegt. Acht von zehn Marken erreichen das Teileziel. Zusätzliche Artikel einer Marke füllen die Lücken einer anderen Marke nicht. Verkaufssets und Zubehör erzeugen keine weiteren Grundmodelle.

| Marke | Modellnamen | Modelleinträge | Physische Teile | Weitere Artikel | Modelle ohne Teilezuordnung |
|---|---:|---:|---:|---:|---:|
| Miele | 82 | 87 | 167 | 0 | 25 |
| Bosch | 100 | 100 | 102 | 1 | 42 |
| Dyson | 92 | 98 | 185 | 6 | 40 |
| AEG | 100 | 100 | 351 | 3 | 22 |
| Rowenta | 272 | 272 | 100 | 0 | 75 |
| Philips | 140 | 140 | 101 | 3 | 84 |
| Siemens | 101 | 101 | 605 | 105 | 0 |
| Samsung | 77 | 77 | 46 | 0 | 57 |
| Hoover | 100 | 100 | 60 | 0 | 98 |
| Vorwerk | 18 | 18 | 105 | 0 | 4 |

Eine vorhandene Teilezuordnung bestätigt weder eine vollständige Teileliste noch eine reale Passform. Farb-, Länder-, R- und Produktionsausführungen werden gesondert geführt. Die Arbeitsliste ist keine belegte deutsche Bestseller-Rangliste.


**v1.28.0 – drei geprüfte Work-Arbeitsstränge vereint:** Samsung +8 exakt belegte Grundgeräte (69 → 77), Bosch +40 eigenständige Grundmodelle (60 → 100) und eine überarbeitete **mobile Gerätesicht mit aufklappbaren Bauteilgruppen, Filtern und Preissortierung**. Neue Geräte ohne geprüfte Teilenummern bleiben bei **0 passenden Artikeln**. Die 1.930 bisherigen Katalogartikel bleiben erhalten; unbekannte Preise werden in der Oberfläche nicht als 0 € oder als Live-Angebot dargestellt. Die vollständigen unabhängigen Arbeitsberichte sind in [Samsung](integrations/samsung-models-next.md), [Bosch](integrations/bosch-models-next.md) und [UX](integrations/ui-vacuum-detail-next/README.md) dokumentiert.


**Originalteile-Ausbau v1.28.1:** Samsung +10 herstellerseitig belegte Original-Zubehörartikel: vier unterschiedliche Wechselakku-SKUs (mit/ohne Ladestation, 2.200/3.970 mAh), fünf Bürsten und ein Spinning-Sweeper-Wischaufsatz. Jede Position enthält die konkrete Samsung-Artikelkennung, veröffentlichte EAN, Herstellerlink und geprüfte Gerätefamilie. **Keine der zehn neu aufgenommenen SKUs wurde einer bestimmten Geräteausführung ohne separaten Nachweis als passend zugewiesen.** Unbekannte Preis- und Lagerangaben bleiben unbekannt. [Herstellerquellen und Akkuvarianten](integrations/samsung-parts-wave1-v1281.json).


**Mobile Darstellung v1.28.2:** Die sieben externen Hersteller-Links im Kasten „Weitere Ersatzteile anhand deines Geräts prüfen“ sind jetzt im responsiven Raster angeordnet; auf schmalen iPhone-Displays stehen sie untereinander. Lange Linktexte umbrechen innerhalb der Schaltfläche, mit mindestens 48 px Tippflächenhöhe und klarem vertikalen Abstand. Zieladressen/Bezeichnungen unverändert. Keine Änderung an Geräte-/Artikeldaten oder technischen Passungsbeziehungen. [Fehlerbeleg & Layoutprüfung](integrations/mobile-maker-links-release-v1282.json).


**v1.29.0 – zweite Modellwelle:** Miele +25 historisch dokumentierte S-Geräteprofile (jetzt 82), Dyson +38 offizielle Modell-/Generationsreferenzen (jetzt 92 Katalognamen) und Hoover +76 produktcodegenaue Geräte (jetzt 100). **Dysons 92 Katalognamen sind ausdrücklich keine 92 bestätigten unabhängigen Gerätekonstruktionen.** Von den 76 Hoover-Neuzugängen stammen 72 aus britischen und einer aus französischen Herstellerquellen; nur drei neue Modelle aus Deutschland. Ausländische Modelle sind keine deutsche Lager-/Verkaufsbehauptung. Alle **139 neuen Geräte starten ohne ungeprüfte Teilezuordnung**. Gesamt: 1.082 verschiedene Katalognamen in 1.093 Modelleinträgen, 869/1.000 Zielplätze. **1.940 Artikel und 1.822 physische Artikel unverändert**. Quellen, abgelehnte und offene Kandidaten: [Miele](integrations/miele-models-wave2.md), [Dyson](integrations/dyson-models-wave2.md), [Hoover](integrations/hoover-models-wave2.md). [Releasebericht](integrations/model-wave2-release-v1290.json).


## Teile auf einen Blick

Alle Marken verwenden dieselbe Teileart, Farbe und dasselbe SVG-Symbol: Düsen blau, Beutel gelb, Filter grün, Akkus violett. Weitere Kategorien unterscheiden Ladegeräte, Schläuche, Rohre, Griffe, Bürstenwalzen, Behälter, Elektrik, Kabel, Mechanik, Adapter, Aufbewahrung, Pflegemittel, Sets und Baugruppen. Textbeschriftungen ergänzen jede Farbe. Filterhalter und Gehäusedeckel werden von den eigentlichen Filtern und Behältern unterschieden.

Artikelart und Teileart sind unabhängig filterbar: Ersatzteil, Zubehör, Verbrauchsmaterial, Dokument, Komplettgerät oder offene Einordnung. Die farbigen Schnellfilter funktionieren im globalen Katalog und in der Marktplatzansicht. Unter jedem Modell stehen die zugeordneten Artikel in einzeln aufklappbaren Kategorien mit derselben Farbe, demselben Symbol und einer Artikelanzahl. Alle Kategorien lassen sich gemeinsam öffnen oder schließen. Name A–Z/Z–A, erfasster Artikelpreis auf-/absteigend und Einbauzeit sortieren innerhalb jeder Kategorie. Vergleichbare erfasste Bruttopreise in EUR für Deutschland bleiben auch als ältere Quellenpreise sortierbar; fehlende, fremdwährungs-, Netto- und Staffelpreise stehen am Ende. Die Sortierung bestätigt weder Aktualität noch Bestellbarkeit. Suche und Filter öffnen die passenden Kategorien; eine Änderung der Sortierung behält geöffnete und geschlossene Kategorien bei. Ein gemeinsamer Rücksetzknopf setzt Suche, Artikelart, Bauteil und Sortierung auf die Ausgangswerte. Das FAQ erklärt die zehn aktiven Marken, die Kategorien, fehlende Teilelisten und die Grenzen erfasster Preise. Fotos bleiben optional; ohne Foto zeigt die Karte das passende Symbol.

Die Startseite und die Zielübersicht zeigen fehlende Modellteile. Der Filter **Ohne erfasste Teile** funktioniert bereits mit dem kleinen Modellindex und nach dem Laden eines Markenpakets mit denselben Zahlen.


## AEG-Modellkatalog vollständig erfasst

AEG umfasst jetzt **100 konkrete Modellbezeichnungen**. Die 22 neu aufgenommenen Modelle wurden über Hersteller-Produktseiten bzw. AEG-/Electrolux-Modell- und PNC-Register nachgewiesen. Die Marken-Zielzahl wurde damit ohne Zubehörtricks erreicht. Dabei wurden **keine Ersatzteilbeziehungen behauptet oder Teilezahlen künstlich erhöht**: 22 AEG-Modelle haben noch keine erfasste Original-Ersatzteilliste.

Sechs Produktseiten nennen lediglich die neunstellige AEG-Produktnummer. Die fehlenden zwei Ausführungsstellen einer elfstelligen Ersatzteil-PNC werden nicht erfunden. Für weitere Modelle sind konkrete elfstellige PNCs bereits belegt. Exakte Quellen und Kennungsqualität: [AEG-Quellen v1.27.0](integrations/aeg-model-candidates-v1270.json).


## Neue Herstellerdaten

327 zusätzliche benannte Herstellerartikel ergänzen den bisherigen Bestand: Bosch +56, Rowenta +44, Philips +40, Vorwerk +81, Samsung +46 und Hoover +60. 70 zuvor leere Modelleinträge haben mindestens eine ausdrücklich belegte Teilezuordnung erhalten. Quellen und Ausführungsbedingungen bleiben am Artikel sichtbar. Ein 3D-Ersatzdeckel für einen Dampferzeuger wurde bei der Recherche ausgeschlossen.

Samsung enthält 77 Hersteller-Modellreferenzen. 20 genaue deutsche /WD- und /WA-Modelle verfügen jetzt über ausdrücklich gelistetes optionales Zubehör; bei den zuletzt ergänzten sechs Modellen sind das insgesamt 50 Nennungen und sieben zusätzliche unterschiedliche Artikelkennungen. Einschließlich der bisherigen Samsung-Zubehörlisten sind 29 unterschiedliche Artikel wenigstens einem Modell zugeordnet. Clean-Station-Beutel und Wischverbrauchsmaterial behalten zusätzliche Zubehörbedingungen. Eine Liste optionalen Zubehörs ist keine vollständige Ersatzteilliste oder automatische Passungsfreigabe.



Vier weitere genaue Samsung-Geräte erhalten in v1.26.10 zusammen **35** ausdrücklich auf den deutschen Herstellerseiten gelistete Zubehörbeziehungen. Die Artikelzahl erhöht sich nicht: alle 17 beteiligten Artikelkennungen sind bereits erfasst. Die zusätzlichen Modelle sind Jet 65 PetPRO, Jet 85 Wet & Clean, Jet 85 CompleteClean und Jet 95 Akku+ CompleteClean. Details: [Samsung-Quellen v1.26.10](integrations/samsung-optional-batch2-2026-10-08.json).


In **v1.26.11** wurden vier weitere, bereits vorhandene Samsung-Modelle mit zusammen **36** exakten Herstellernennungen optionaler Zubehörkennungen verbunden: Jet 85 PetPRO, Bespoke Jet Plus 100, Bespoke Jet Plus Akku+ Wet & Clean und Bespoke Jet PetPRO extra. Die neue Slim Action Bürste **VCA-SABA95** ist als eigenständiger Originalzubehör-Artikel erfasst. Die Modellvarianten /WD und /WA sowie die Codes VCA-SPW95 und VCA-SPW95/VT bleiben ausdrücklich getrennt. Herstellerquellen: [Samsung-Zubehörnachweise v1.26.11](integrations/samsung-evidence-v12611.json).


Mit **v1.26.12** wurden zwei existierende Bespoke-Jet-AI-Modelle um vier exakte optional gelistete Zubehörartikel ergänzt. Zudem kommt der konkrete **VS80F28EGS/WD** (Bespoke AI Jet Akku+ Wet & Clean) mit sechs Zubehörnennungen hinzu. Die neu getrennt erfasste **Slim LED+ Hartbodenbürste VCA-SABC97/GL** wurde ausschließlich den beiden ausdrücklich belegten Modellen zugeordnet. Wischpads erfordern ihren Wischaufsatz, Stationsbeutel die passende Clean Station. Quellen: [Samsung-Ausbau v1.26.12](integrations/samsung-evidence-v12612.json).


**Modell-zuerst v1.27.1:** Zwei weitere offiziell benannte Geräte wurden ohne spekulative Teilepassung aufgenommen: Samsung Jet 95S **VS70H28HEK/WD** und Bespoke AI Jet CompleteClean **VS80F28EFP/WD**. Beide Geräte sind unter der vollständigen deutschen /WD-Kennung und mit direkten Herstellerseiten gespeichert; einzelne Zubehörnennungen der Herstellerseite werden bis zur separate Artikelprüfung nur als Forschungsliste geführt. [Exakte Herstellerseiten](integrations/samsung-model-first-v1271.json).

Hoover enthält 24 deutsche Hersteller-Modelle und deren achtstellige Produktcodes. 55 Artikelstammsätze stammen aus dem britischen Herstellerverzeichnis; dieser Quellenmarkt bleibt sichtbar. Für HF202P 011 (39401035) und HF201H 011 (39401038) nennt der von Hoover Deutschland verlinkte EU-Ersatzteilservice 10 beziehungsweise 12 konkrete Artikel. Fünf dabei zusätzlich gefundene Teile erhöhen den Hoover-Bestand auf 60. Die im Service sichtbare italienische Preis-/Ländereinstellung wird nicht als deutscher Preis, Bestand oder deutsches Angebot übernommen. Hoover-Geräteseiten beschriften die achtstellige Kennung ausdrücklich als **Hoover-Produktcode**; die Dyson-Bezeichnung bleibt ausschließlich bei Dyson-Geräten.

Vorwerk enthält weiterhin 18 echte VK-/VT-/VB-Grundmodelle. Die 105 Artikel umfassen auch Teile für Elektrobürsten, Saugwischer und weitere Vorsätze. Deren eigene Kennung, etwa EB400, wird angezeigt. Abweichende Überschriften desselben Herstellerartikels erzeugen keine doppelten Einträge. Die Herstellerbezeichnungen werden nicht als erfundene numerische Artikelnummern dargestellt.

Neue Samsung-Quellen: [Ausbau v1.26.9](integrations/samsung-import-v1269.md) und [herstellerbezogene Modell- und Artikelnachweise](integrations/samsung-accessory-evidence-2026-10-08.json). Vorheriger Katalogstand: [v1.26](integrations/catalog-expansion-v126.md). Frühere Berichte: [v1.25 Vorwerk](integrations/catalog-expansion-v125.md) und [v1.24 Philips](integrations/catalog-expansion-v124.md).

## Kennungen, Preise und Betrieb

Miele-Materialnummer, Bosch/Siemens-E-Nr., AEG-PNC, Philips-/xx/R-Code, Rowenta-Ref., Vorwerk-Grundgerät, Samsung-Modellcode und Hoover-Produktcode bleiben getrennte Kennungswege. Samsung-VS-Codes werden nicht als Siemens-E-Nr. behandelt. Seriennummern identifizieren kein Modell. Die Gerätekennung bestätigt keine Ersatzteilpassung.

Für neue Artikel wurden keine Preise, Bestände, Lieferzeiten oder Montagezeiten erfunden. Bestehende Quellenpreise und deren Datum bleiben erhalten; sie sind keine Live-Angebote. Offene Artikel lassen sich als unbepreiste Einkaufsnotiz speichern. Herstellerfotos und externe PDFs werden weiterhin erst auf Wunsch beziehungsweise beim Öffnen abgerufen. Acht detaillierte Markenpakete laden bei Bedarf und sind anschließend offline verfügbar.

Der geschützte Marketplace-Server behält seinen bestehenden Vertrag mit 167 Miele-Vorlagen. Weitere Herstellerkataloge erweitern diese API-Freigabe nicht. Auth/API-Antworten werden nicht offline gespeichert. Geräteobjekte und Artikelidentitäten bleiben für gespeicherte Geräte, Sicherungen und Einkaufslisten stabil.

## Prüfung und verbleibende Ziele

38 App-Testgruppen prüfen unter anderem Kategorien, Artikelarten, Ladezustände, genaue Zielzahlen, Quellenidentitäten, Zubehörtypen, Kennungsgrenzen, Warenkorb, Sicherungen und Offline-Verhalten. Syntaxprüfungen und bytegenau reproduzierbare Haupt- und optionale Pakete gehören zur Veröffentlichung. Die Prüfsummen-geschützte Änderung wird vor GitHub Pages aus dem bisherigen Stand rekonstruiert; bestehende synthetische Serverprüfungen laufen ebenfalls in CI.

Noch offen sind die Modellziele für vier Marken, mindestens 64 weitere Samsung- und 40 weitere Hoover-Teile sowie vollständige gerätespezifische Teilelisten. 447 Modelleinträge haben noch keine konkrete Teilezuordnung. Einzelne Montageanleitungen, breitere belegte Nachbauten, aktuelle Gerätepreise und reale Geräteprüfungen bleiben Teil des Ausbaus. Kleine eigenständige Handsauger, Roboter und weitere Gerätekategorien werden nicht zum Auffüllen der Modellziele verwendet.

