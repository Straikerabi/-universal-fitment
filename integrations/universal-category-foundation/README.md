# Universal Fitment · Mehrkategorien-Fundament (Owner Draft)

**Status 10.10.2026, Taxonomie v0.3.0:** Nur **private Architektur-Vorbereitung**, kein zweites reales Gerät in der App, kein Public Launch und keine automatische Passungsfreigabe. Epic #87; aktuelle Owner-App und offene Nacharbeiten #85 (Consumer 11→29) und #86 (qualitativ brauchbare Reparatursteckbriefe).

## Wozu dieses Modul dient
Wir bauen keine unabhängigen Waschmaschinen-, Konsolen- und Industriewerkzeug-Apps. Die Gerätearten bekommen **eine gemeinsame Kategorie-Hierarchie** und später dieselbe Suche, Belegverwaltung, neue Consumer-Oberfläche und B2B-Rechte. `registry.mjs` ist ein erster ausführbarer Proof der Kategorien, kein Datenimport. Die Taxonomie ist **intern**, nicht die Anzahl öffentlich unterstützter Gerätetypen. Die vorhandenen, laufenden Staubsaugerdaten bleiben unverändert.

- Sektoren: Haushalt & Küche; Elektro-/Gartengeräte; Elektronik & IT; Robotik/Smart Home; Maschinen & Industrie; Fahrzeuge/Mobilität; Drohnen/Flugtechnik; Energie/Gebäudetechnik; Wasserfahrzeuge/Outdoor.
- Blattkategorien: Waschmaschinen, Wäschetrockner, Waschtrockner, Geschirrspüler, Kaffee, Kühlung, Ofen/Herd/Mikrowelle, Elektro-/Gartengeräte, Smartphones/Tablets, PCs/Laptops, Konsolen, TVs/Monitore, verschiedene Roboter, Industriemaschinen/CNC/Kompressoren/Pumpen/3D-Drucker, später Fahrzeuge.
- Für neue Domänen gilt **`planned` und `fitmentPolicy='not-authorized'`**, NICHT „betriebsbereit“. Nur `vacuum-cleaner` ist als **private Consumer-Pilotkategorie** bekannt; selbst dort sind echte Einbaupassungen derzeit 0.
- Deutsche Aliasse/Falschzuordnungen: Jeder gültige Alias ordnet genau einer Kategorie zu; unbekannte Begriffe bleiben null. Gerätevarianten werden NIEMALS aus Kategorienamen, Serienfamilien oder ähnlichen Codes geschlossen.

## Kritische vorhandene Engine-Schranke
`integrations/fitment-engine-v1-poc/contract.mjs` hat derzeit **`POLICY_VERSION='vacuum-poc-1'`**, lässt reale Anfragen nur für `asset.category==='vacuum'` zu und blockiert neue Kategorien mit `POLICY_BLOCKED`. **Der Schutz bleibt im aktuellen Draft unverändert.** Tests prüfen sogar explizit, dass Waschmaschinen, Saugroboter, Smartphones, Laptops und Industriemaschinen nicht plötzlich als passend bewertet werden. Ein späterer Umbau benötigt eine separate, von Fachleuten geprüfte Sicherheits-/Schnittstellen-Matrix und **denselben gemeinsamen Fitment-Engine-Vertrag** statt zweiter unvereinbarer Motoren.

## Erweiterung: Robotik allgemein, humanoide Roboter und intelligente Assistenten

Robotik bedeutet für das Projekt weit mehr als Saug-/Mähroboter. Die Registry unterstützt als zunächst **geplante** Kategorien auch humanoide Roboter, soziale/Begleitroboter, körperliche KI-Assistenten, Telepräsenz, Bildungs-/Forschungs- und Hobbyroboter, mobile Universalroboter und Robotik-Bausätze. Dazu kommen physische Smart-Speaker- und Display-Geräte als Assistenzterminals sowie professionelle Industrieroboter (weiterhin eigene Industriegruppe).

**Kampfroboter** bedeutet hier technisch gewartete **Roboter-Sport-/Wettkampfgeräte**. Wir erfassen potenziell allgemeine Identitäten, Steuerungen, Akkus und Wartungs-/Sicherheitsinformationen ausschließlich nach sauberer Hersteller-/Regelwerkslage. Hochenergetische Mechanismen benötigen kontrollierte Arenen, Abschaltung und Fachprüfung. Kein Angebot für Waffen, schädigende Nutzlasten oder Anleitungen zu deren Bau, Leistungssteigerung oder Einsatz.

| Robotik-Typ | Unverzichtbare Variantendaten | Zusätzlich sensible Grenzen |
| --- | --- | --- |
| Humanoide Roboter | Gelenk-/Aktuatorgeneration, Boardrevision, Controller, Serienbereich, Firmware | Quetschen, Last, Not-Aus, Kalibrierung, Fachpersonal |
| Smarte Assistenten (physische Roboter) | Modell, Mikrofon-/Kameramodul, Sensor, Funkstandard, Softwarestand, Accountbindung | Datensicherheit/Privatsphäre, Pairing, Cloud-Abhängigkeiten |
| Smarte Lautsprecher/Displays | Geräte- und Boardrevision, Netzteil/Anzeige/Mikrofon, Firmware, Region | Netzspannung, personenbezogene Sprach-/Videodaten und Softwarebindung |
| Bildungs-/Hobby-/Forschungsroboter | Kit-Version, Platine, Servos, Motoren, Sensormodule, Anschluss-/Firmwarestand | Akkus, Motorik und je nach Bauart Fachfreigabe |
| Sport-Kampfroboter | Chassis-/Controllerrevision, Antriebs-/Batterieplattform, zulässige Wettbewerbsklasse | Hochenergetische Bewegung, mechanische Sicherung, Kontrollarena |
| Industrie-/mobile Roboter | Serien-/Maschinenkennung, Sicherheitssensorik, Aktoren, Steuerung | Sicherheitssteuerungen, Energieisolierung und Fachbetrieb |

**Abgrenzung:** Ein rein digitaler Sprachassistent oder eine Software-/KI-Agent-Anwendung ist kein physisches Ersatzteilgerät. Universal Fitment kann Software-/Firmwareabhängigkeiten eines **realen** Geräts als Information dokumentieren, aber keine erfundenen Hardware-Teile für reine Softwaredienste listen.

Für humanoide Systeme unterscheiden wir außerdem Reparatur-Kandidaten (z. B. Gelenkmodul) von **tatsächlich freigegebener Kalibrierung oder sicherem Einbau**. Letztere setzen dokumentierte Mechanik/Elektronik und spezifische Fachabnahme voraus. Alle neuen Robotik-Kategorien bleiben `planned`; die bestehende Fitment-Engine blockiert sie als `POLICY_BLOCKED`.

## Erweiterung: Fahrzeuge, Elektroantriebe, Drohnen, Kameras und Energie

**Neu registriert: 125 unterscheidbare Blattkategorien in 9 Sektoren**, davon **124 nur als `planned`** und weiter ausschließlich `vacuum-cleaner` als privater Consumer-Pilot. Diese Zahl beschreibt nur die **Architektur**, nicht Hersteller, Modelle, Teile, OEM-Nutzungsrechte oder einen öffentlichen Funktionsumfang. Kennung und Zuordnungsbeleg einer realen Variante müssen je Domäne eigens recherchiert werden.

| Segment | Konkrete Kategorien | Fachliche Abgrenzung |
| --- | --- | --- |
| PKW/Nutzfahrzeuge | Pkw, Hybrid-/E-Pkw, LKW/E-LKW, Transporter/E-Transporter, Bus/E-Bus, Wohnmobil, Wohnwagen, Anhänger, UTV/Quad | VIN **wo passend**, HSN/TSN/KBA, Teilekatalog-/PR-Codes, Motor/Getriebe, Modelljahr, Homologation, Varianten-/Serienbereich; die allgemeine Eingabe `KFZ` bleibt bewusst mehrdeutig und wird nicht unbemerkt als Pkw eingeordnet |
| Motorisierte Zweiräder | Motorräder/E-Motorräder, Mopeds/Mofas, Motorroller mit Sitz und elektrische Motorroller | Fahrzeug-/Typnummer, Baureihe, Bremse, Antrieb, Reifen, Markt – Fahrzeugteile sind nicht allein wegen gleichen Modellnamens kompatibel |
| Mikro- und E-Mobilität | Fahrrad, E-Bike/Pedelec, Lastenrad/E-Lastenrad, E-Tretroller/E-Scooter, Tretroller, elektrische Einräder | **E-Roller mit Sitz** und **E-Scooter/Tretroller** sind verschiedene Gerätetypen; Controller-, Motor-, Batterie-, Brems- und Zulassungsvariante prüfen |
| Flugtechnik & Drohnen | Kamera-, FPV-, Inspektions-, Vermessungs-, Agrar-, Liefer-, Flächenflugdrohnen, Modellflugzeuge, Fernsteuerungen | Flight Controller, Funkregion, Gimbal/Propeller, Akku, Firmware, Revisionsstand und Flugtauglichkeit sind separate Sicherheits-/Rechtsprüfungen, kein automatisch sicherer Austausch |
| Kameras & Optik | DSLR, spiegellose Systemkameras, Action-/360°-/Videokameras, Webcams, Überwachungs-/Wärmebildkameras, Objektive, Gimbals, Blitzgeräte | Sensor-/Board-/Firmwaregeneration, Objektivanschluss, Interface, Teilepaarung und Bildrechte voneinander unterscheiden |
| Energie/Haustechnik | Wallboxen, öffentliche Lader, Photovoltaik, Wechselrichter, Heimspeicher, Powerstations, Wärmepumpen, Klimaanlagen, Heizungen, Generatoren, USV | Netzspannung, HV-Batterie, Netzanschluss, Brandschutz, ggf. Gas/Kältemittel und Fachbetrieb – ohne passende Fachfreigabe keinerlei Einbau-/Inbetriebnahmeempfehlung |
| Wasser & Maschinen | Boote/E-Boote, Jetski, Außenbord-/E-Außenbordmotoren, Unterwasser-ROVs, Landmaschinen, Traktoren, Gabelstapler/E-Stapler | Rumpf-/Motorserienbereich, Dichtigkeit, elektrische Systeme, Energieisolierung, Antriebs-/Zulassungs- und Wasser-Sicherheitsregeln |

**Kein pauschales „E-Fahrzeug“-Kompatibilitätsprofil:** E-Bike, E-Tretroller, E-Motorrad und E-LKW besitzen jeweils unterschiedliche Identitäten, Einsatzbedingungen und Anforderungen. Sie teilen einzelne Sicherheitsprüfungen, aber nicht automatisch Akkus, Ladegeräte oder Werkzeuge. Bei Foto-/Drohnenhardware sind Firmware, Boardrevision, Objektiv-/Gimbalaufnahme und Funkregion genauso wichtig wie mechanische Abmessungen.

**Ausbauempfehlung:** Nach Staubsauger-Datenqualität (#85, #86) zuerst sorgfältig ausgesuchte B2C-Piloten für Waschmaschinen/Geschirrspüler, E-Bike/Elektrowerkzeuge oder Kameras prüfen; die genaue Reihenfolge nach **verfügbaren lizenzierten Primärdaten und Reparaturnutzen** auswählen. KFZ hat ein potenziell starkes B2B-Geschäftsmodell, braucht aber besondere Hersteller-/Typdatenrechte und Einbauprüfungen. Drohnen, HV-/Netztechnik, Gas/Kälte und Industriemaschinen bleiben separate streng gesperrte Freigabedomänen.

## Geräteidentitäten und Inhalte pro Domäne
| Domäne | Exakte Ausführung erfordert oft | Besonders wichtig vor Reparatur-/Passungsfreigabe |
| --- | --- | --- |
| Weiße Ware (Waschen/Spülen/Trocknen) | E-Nr inkl. `/xx`, PNC/ELC, Service-/Produktnummer, Markt, Serial-Bereich | Netzspannung, Wasser, Leckage, Heizung, Lager-/BOM-Index |
| Küchengeräte / Herde | Geräte-/E-Nr, Modelltyp, Strom-/Gas-Ausführung, Produktion | Netzspannung, Ofenhitze, Gas, Kondensatoren, Kältemittel |
| Elektrowerkzeuge | Modell, Typnummer, Produktionsstand, Akku-Plattform, Aufnahme | Schneidwerkzeuge, Drehmoment, Akku-/Elektrik-Gefahr |
| PCs/Laptops/TVs/Konsolen/Phones | Hardware-Modell, Board-Revision, Region, Display/Chip/Batterie-ID | ESD, Akku, Teilekopplung, Firmware-/Software-Registrierung |
| Robotik | Exaktes Chassis, Hardware-Rev, Akku, Firmware, Ladestation | Automatische Bewegung, Batterie, Klingen, Nässe/Elektrik |
| Industrie | Maschinen-ID/Serienbereich, Motorvariante, Schutzsystem | Energieisolierung, autorisierte Fachperson, Maschinenrisiko |
| Fahrzeuge (später) | VIN, KBA/HSN/TSN, Motor/Getriebe, PR-/Variantencode | Sicherheits-/Typgenehmigungen, Fahrwerks-/Bremsenrisiken |

Diese Tabelle enthält **zu prüfende Kennungstypen und Gefahren**, keine Behauptung über die Daten oder Verfügbarkeit einzelner Hersteller.

## Roadmap in Wellen
1. **Heute:** #85 tatsächlich 29-vs-11 Geräte sicher integrieren, #86 Informationsqualität verbessern; parallel generische Kategorie-Architektur aufbauen.
2. **Frühe Domänenpilot-Projekte:** Geschirrspüler, Waschmaschinen und Saugroboter – mit kleinen echten, eindeutig identifizierten Referenzmengen und Originalteilnummern; Trockner als nahe Folge, weil oft zusätzliche Wärme-/Brandsicherheit.
3. **Danach:** Kaffee-/Kleinküchengeräte und ausgewählte Elektrowerkzeuge; anschließend weitere Weiße Ware.
4. **Elektronik:** Konsolen, PCs/Laptops, Handys, TVs. Hier gelten neue Teile-/Board-/Software-Kompatibilitätsgrenzen.
5. **Roboter/Industrie/Fahrzeuge:** erst mit passenden Fachpartnern, Maschinen- und Risikoprüfung. Sicherheitskritische Arbeiten nicht als allgemeine Do-it-yourself-Anleitungen anbieten.

Die Reihenfolge folgt erwarteter Quellenzugänglichkeit, Wiederverwendbarkeit von Geräteidentifikation und Risiken, **nicht** angeblich bereits gemessener Nachfrage oder fixen Markteintrittsterminen.

## Technische nächste Arbeitspakete
**Work A – Category/Variant Schema:** stabile kanonische IDs, identifier profile, region/revision, per-asset provenance; keine zweiten Engine-Entscheider und keine Geräte-Fakes. **Work B – Consumer Navigation:** mobile Auswahl der zukünftigen Kategorien, getrennt `geplant` vs `verfügbar`, echte Links und Suchfunktion nur für abgenommene Modellbestände. **Work C – OEM/Policy Forschung:** echte Herstellerquellen, genaue Modelle/Teile und Lizenz-/Safety-Klassen zunächst für Geschirrspüler/Waschmaschinen/Roboter. All diese Tracks in neuen isolierten Branches gegen private Owner-Integration; nicht an aktuellen #85-Katalog-/offline-/legal-Bytes parallel herumeditieren.

## Künftige KPI-Regeln
- Globale Kennzahlen: Sektoren und **geplante Kategorien** ≠ verfügbare Kategorien. `Kategorie verfügbar` zählt nur nach tatsächlicher geprüfter Consumer-Funktion.
- Pro Kategorie: `Geräte / explizites Pilotziel`, `OEM-Originalteilidentitäten`, `exakte Gerät-Teil-Beobachtungen`, `Quellenabdeckung`, `Anleitungs-/Tool-/Sicherheits- und Bildrechte-Feldabdeckung`, `verifizierte reale Positivpassungen`.
- Prozentwerte über Kategorien dürfen **nicht** als Anzahl von geplanten Slugs berechnet werden; für neu geplante Kategorien ohne Daten gilt `0 real verfügbare Geräte`.
- Die bisherigen Katalog-2,2 % beziehen sich auf das **Staubsauger-Ausbauziel von 500**, nicht auf alle Universalkategorien oder auf gesamte weltweite Ersatzteilabdeckung.

## CI / Grenzen
```bash
node --test integrations/universal-category-foundation/registry.test.mjs
node integrations/universal-category-foundation/report.mjs
```
Die neue CI testet Kategorie-Referenzen, Alias-Kollisionen, Risiko-/Kennungsprofile, den nachweislich weiter blockierten Multi-Kategorie-Fitment-Eingang und dass genau **eine** private Kategorie existiert. Keine Mutation von `main`, gemeinsamem v1-Core, live Consumer-CSS/Katalog, B2B, OAuth oder Rechtsfreigaben. Kein Deployment, keine individuellen Kunden-/Firmenwerte.
