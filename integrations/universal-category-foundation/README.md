# Universal Fitment · Mehrkategorien-Fundament (Owner Draft)

**Status 10.10.2026:** Nur **private Architektur-Vorbereitung**, kein zweites reales Gerät in der App, kein Public Launch und keine automatische Passungsfreigabe. Epic #87; aktuelle Owner-App und offene Nacharbeiten #85 (Consumer 11→29) und #86 (qualitativ brauchbare Reparatursteckbriefe).

## Wozu dieses Modul dient
Wir bauen keine unabhängigen Waschmaschinen-, Konsolen- und Industriewerkzeug-Apps. Die Gerätearten bekommen **eine gemeinsame Kategorie-Hierarchie** und später dieselbe Suche, Belegverwaltung, neue Consumer-Oberfläche und B2B-Rechte. `registry.mjs` ist ein erster ausführbarer Proof der Kategorien, kein Datenimport. Die Taxonomie ist **intern**, nicht die Anzahl öffentlich unterstützter Gerätetypen. Die vorhandenen, laufenden Staubsaugerdaten bleiben unverändert.

- Sektoren: Haushalt & Küche; Elektro-/Gartengeräte; Elektronik & IT; Robotik/Smart Home; Maschinen & Industrie; Fahrzeuge/Mobilität.
- Blattkategorien: Waschmaschinen, Wäschetrockner, Waschtrockner, Geschirrspüler, Kaffee, Kühlung, Ofen/Herd/Mikrowelle, Elektro-/Gartengeräte, Smartphones/Tablets, PCs/Laptops, Konsolen, TVs/Monitore, verschiedene Roboter, Industriemaschinen/CNC/Kompressoren/Pumpen/3D-Drucker, später Fahrzeuge.
- Für neue Domänen gilt **`planned` und `fitmentPolicy='not-authorized'`**, NICHT „betriebsbereit“. Nur `vacuum-cleaner` ist als **private Consumer-Pilotkategorie** bekannt; selbst dort sind echte Einbaupassungen derzeit 0.
- Deutsche Aliasse/Falschzuordnungen: Jeder gültige Alias ordnet genau einer Kategorie zu; unbekannte Begriffe bleiben null. Gerätevarianten werden NIEMALS aus Kategorienamen, Serienfamilien oder ähnlichen Codes geschlossen.

## Kritische vorhandene Engine-Schranke
`integrations/fitment-engine-v1-poc/contract.mjs` hat derzeit **`POLICY_VERSION='vacuum-poc-1'`**, lässt reale Anfragen nur für `asset.category==='vacuum'` zu und blockiert neue Kategorien mit `POLICY_BLOCKED`. **Der Schutz bleibt im aktuellen Draft unverändert.** Tests prüfen sogar explizit, dass Waschmaschinen, Saugroboter, Smartphones, Laptops und Industriemaschinen nicht plötzlich als passend bewertet werden. Ein späterer Umbau benötigt eine separate, von Fachleuten geprüfte Sicherheits-/Schnittstellen-Matrix und **denselben gemeinsamen Fitment-Engine-Vertrag** statt zweiter unvereinbarer Motoren.

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
