# Wave10 · Offizieller Modell-Erweiterungsplan

Owner-Kommentar Issue #99 vom 10.10.2026. Ausschließlich Research-Staging im isolierten Branch; keine Consumer-, Fitment-Engine-, Offline-, Source-Lock- oder anderen Teamdateien geändert.

**Quelle:** acht beobachtete offizielle Herstellerseiten am 10.10.2026. Die Tabelle in `source-candidates.json` führt exakten Hersteller-Modellcode, AEG-PNC bzw. Hoover-Produktcode bzw. Dyson-SKU, Markt, URL, konkrete Quellenfundstelle und explizit offene Revision-/Serienfragen. Bosch WGG244ZR90 und WGG244ZV0 haben **keine** vollständig belegte E-Nr /xx. Keine Original-HTML-/PDF-Bytes archiviert, keine neue Nutzungsrechtsfreigabe.

| Domäne | Exakte Modelle |
| --- | --- |
| Waschmaschine | Bosch WGG244ZR90, WGG244ZV0 (beide /xx offen); AEG LR8EG75480 (PNC 914500822), LR7D70490 (PNC 914501011) |
| Staubsauger | Hoover HF610H 011 (SKU 39401101), HF610P 011 (39401105); Dyson V12 Detect Slim Absolute (394167-01), Absolute + (394461-01) |

Nur in der Recherche: 4 Waschmaschinen und 4 Staubsauger, 4 Hersteller. Im Owner-Consumer bleiben 11 Geräte und 11 Teile; neue Teilekanten = 0 und bestätigte reale Fits = 0. Es gibt keine Domain-Freigabe für Waschmaschinen durch die bisherige Staubsauger-v1-Engine.

## Native Tests und Report

```sh
node integrations/catalog-washer-vacuum-expansion-wave10/validate.mjs --check
node --test integrations/catalog-washer-vacuum-expansion-wave10/validate.test.mjs
```

Der Validator prüft gegen den nur gelesenen gemeinsamen Consumer-Snapshot und blockiert falsche OEM-Domains, Varianten-Siblings, fehlende PNC-Ziffern, widersprüchliche Produktcodes, gefälschte Rechte/Rohbelege, positive Fitments und nicht genehmigte Imports. Der eigene CI-Workflow führt die nativen Tests auf dem Work-Branch und im Draft-PR aus.

## Owner-Gates

Für eine spätere Consumer-Freigabe benötigen wir separat: tatsächliche Typenschild-Revisions-/Serienangaben, unabhängige Hersteller-Originalbytes und Fundstellen-/Redirect-Audits, Daten-/Bildrechte, Hersteller-OEM-Teilecodes mit exakten Modell-Listings und sichere Einbaufreigabe, Mehrdomänen-Engine-/UI-/Offline-/Legal-Tests. Work-A-Quellenarchiv und alle anderen Teamverzeichnisse bleiben unangetastet. Kein Main-Merge, Deployment oder Veröffentlichung.
