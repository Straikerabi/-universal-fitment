# Universal Fitment — Private Wave5 Integrationsstand (Owner)

KEIN LIVE-RELEASE. Dieser Branch vereint die Ergänzungen aus PR #70, #71 und #72 auf dem privaten Wave4-Owner-Stand #68. Das ist noch kein Merge der PRs oder eine Beförderung nach main. Original-Worker und main bleiben unverändert.

## Hier liegt jetzt gemeinsam

- Fünfstufige mobile Reparaturmission: Geräteauswahl, Variantenprüfung, 5 aufklappbare Baugruppen, Filter, Sortierung, Checkliste und lokale Offline-Vorschau.
- Exportierbarer Reparatur-Prüfpass mit Herstellerquellen, offenen Fragen, Gerätekennung und SHA-256-Prüfsumme. Keine OEM-Signatur.
- 10 recherchierte echte Gerätefälle und 18 konkrete Originalteil-Listings werden durch dieselbe gemeinsame B2C/B2B-Fitment-v1-Engine geprüft. 18-mal unconfirmed, 0 reale Einbaufreigaben.
- Versionierter, read-only Wave3-Katalog-Prüfeingang. Der CI-Scratch umfasst 1.115 Modellzeilen / 1.961 Katalogartikel, aber der Consumer-Snapshot umfasst weiterhin nur 11 Geräte und 11 Teilidentitäten. Issue #69 ist NICHT abgeschlossen.
- Die synthetische B2B-Demo und die gemeinsame v1-Engine liegen im Wave4-Vorgänger.

## Lokal anschauen

Branch integration/private-unified-preview-wave5-owner auschecken; Node.js 22 oder neuer. Im Repository-Root ausführen:

    npm start --prefix integrations/consumer-repair-mission-poc

Browser auf http://127.0.0.1:4179 öffnen; über den fünfstufigen Ablauf bis Schritt 5 gehen und Prüfpass (JSON) verwenden. Testserver ist ausdrücklich nur an Loopback gebunden, also nicht von einem entfernten iPhone über das LAN zugänglich. Keine Cloud-Uploads.

Prüfungen:

    npm test --prefix integrations/consumer-repair-mission-poc
    node --test integrations/real-fitment-review-owner/review.test.mjs
    node integrations/real-fitment-review-owner/review.mjs

Private gemeinsame CI: .github/workflows/wave5-private-unified.yml.

## Vor echter Veröffentlichung noch offen

- #69: versionierte Wave3-Migration in den wirklich benutzten Consumer-Snapshot, Negativ- und Offline-Regressionsprüfungen.
- Erste echte, vollständige Einbau-Fitments: OEM-Belege plus Revision, Serienbereich, Anschluss und geprüfte Rechte, keine pauschale Freigabe.
- Physisches iPhone/Safari, Nutzer- und Sicherheitsvalidierung.
- Produktionssichere B2B-Mandantentrennung, Identitäts-/Rollensystem und Datenschutz; alle B2B-Daten aktuell synthetisch.
- Rechte und Impressum/Datenschutz/Gewerbe-Gates aus #42/#43 vor öffentlichem Launch.
- Aktuelle reale Angebote/Preise erst mit genehmigten Händler-Feeds; keine erfundenen Preise oder Lagerbestände.

Kein Deploy, kein Main-Merge und keine automatische Freigabe. Ein grüner Integrationslauf belegt nur den geprüften Scope, keinen allgemeinen Marktstart.
