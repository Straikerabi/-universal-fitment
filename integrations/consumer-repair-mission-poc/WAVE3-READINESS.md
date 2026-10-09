# Wave3 → Consumer: schreibgeschützter Datenabgleich (Owner #69)

**Status: private technische Vorprüfung; keine Katalogmigration und keine Live-Freigabe.**

Die mobile Consumer-Reparaturansicht verwendet noch den v1.29.0-Snapshot mit 11 Geräte- und 11 Artikelidentitäten. Der Owner-PR #68 testete separat den zusammengeführten Wave3-Katalog mit 1.115 Modellzeilen und 1.961 Katalogartikeln. Diese Daten wurden **noch nicht** vollständig in die mobile Ansicht projiziert.

## Leistung des Audit-Skripts

`wave3-readiness-audit.mjs` prüft ein **bereits separat geprüftes** zusammengesetztes Wave3-Scratch-Verzeichnis. Es liest nur die Daten und schreibt einen JSON-Bericht auf stdout.

- Nachweis, dass alle 11 alten Pilotgeräte und 11 alten Originalartikel als eindeutige Identitäten erhalten geblieben sind.
- Tatsächliche Zählung der 1.115 Modellrecords, 1.961 Artikel und 36 bedingten Herstellerbeziehungen; Abweichungen und Dubletten werden gemeldet.
- Ausschließlich exakte Hersteller-Modell- oder Produktcode-Kennungen zur Identitätsauflösung. Keine Übertragung über bloße Modellnamen, Serienfamilien oder Länderkennungen.
- Herkunft, Markt, Serien-/Revisionsbedingungen und Original-Quellenkennung bleiben bei allen 36 Beziehungen erhalten.
- Selbst bei eindeutiger Identität bleibt die Einbauentscheidung `unconfirmed`. Der Report erteilt **keine** Positivfreigabe und enthält keine Preise, Angebote, Bilder oder neue Lizenzrechte.
- Gepinnte Basis-, Archiv- und Worker-Commit-SHAs für Vergleich mit `.github/workflows/wave4-private-unified.yml`.

## Reproduktion

Zuerst wie im privaten Owner-CI den unveränderten Ausgangskatalog wiederherstellen, drei Worker-Imports getrennt prüfen und konfliktkontrolliert in ein Scratch-`site/` zusammenführen. Anschließend:

```sh
node --test integrations/consumer-repair-mission-poc/tests/wave3-readiness-audit.test.mjs
node integrations/consumer-repair-mission-poc/wave3-readiness-audit.mjs "$(pwd)/site" > /tmp/uf-wave3-readiness.json
```

Das CLI beendet bei festgestellten Verletzungen seiner Prüfregeln mit Exitcode 2. `errors: []` zeigt **nur** erfolgreiche Datenidentitätsprüfungen, keinen abschließenden System-/Launch-Test. Die Ausgabe enthält einen SHA-256 der lokalen Evidenzdatei, **nicht** den Hash des vollständig kombinierten Scratch-Trees.

## Weiterhin offen

- Freigabe und Nachweis eines expliziten erweiterten mobilen Pilot-Sets.
- Versionierter read-only Projektor für das neue Consumer-`catalog-snapshot.mjs`, `catalog-lock.json` und seinen Cache-Fingerprint.
- Invalidation alter Missionen, Regression der fünf Baugruppen, Filter, Checklisten und Offline-/Browser-/iPhone-Prüfungen.
- Vollständige reale Einbau-/Anschlussfreigaben aus konkreten Primärbelegen.

**Schutz:** kein Merge nach `main`, kein Deployment, kein Consumer-Release, keine Händlerintegration. Diese Vorprüfung ist ein eigenständiger, noch nicht produktiver Beitrag zu Issue #69.