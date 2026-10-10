# Lokale Abnahme / Issue #74, 2026-10-10

**Status: Blockierter Draft, keine fertige Datenmigration.** Alle Ergebnisse beziehen sich auf den unveränderten Owner-Baseline-Consumer und die neue Archiv-Vorprüfung, nicht auf einen integrierten Wave3-Consumer.

| Prüfung | Tatsächliches Ergebnis |
| --- | --- |
| Neue Archive-Gate-Tests (`unittest`, `integrations/catalog-wave6`) | 24 bestanden |
| Bestehende Consumer-Node-Tests (`npm test`) | 53 bestanden |
| Bestehender gemeinsamer v1-Core / Owner-Bridge | 101 bestanden |
| Bestehende 18-Listings-Review-Gate-Tests | 8 bestanden |
| Bestehende Wave4-Evidenz-Python-Tests | 58 bestanden |
| Originalcheckpoint-Restore | 136 Dateien, SHA-/CRC-geprüft |
| Vorhandener Modellquellen-Verifier gegen privaten Originalcache | 15 Quellen / 22 historische Profile erfolgreich nachgespielt; **nicht** in Consumer importiert |
| Originaler Consumer-Projector `--check` gegen frischen Restore | byte-identisch, 11 Geräte / 11 Teile / 0 neue Passungen |
| Consumer `offline:check` | byte-identisch, 17 lokale Assets |
| Neues Archive-Gate / `--check-report --require-complete` | erwarteter Abbruch mit 56 fehlenden Originalantworten |
| Responsive Browser | **nicht gestartet**: Runtime-Playwright vorhanden, Chromium-Binary fehlt |
| Neue GitHub-CI für diesen Work-Branch / PR-Ziel | **nicht konfiguriert**, kein grüner Run behauptet |

Insgesamt **244 erfolgreiche lokale Unit-/Regressionstests**. Der absichtliche `--require-complete`-Abbruch zählt nicht als erfolgreicher Import. Die Browserumgebung scheiterte zunächst an CJS/ESM-Exports des Runtime-Moduls; mit der richtigen `index.mjs`-Variante wurde als tatsächlicher verbleibender Blocker die fehlende Chromium-Executable festgestellt. Kein Browser-QA-Framework wurde geändert, keine Screenshots oder responsive Erfolge werden erfunden. Ein Browserdownload wurde nicht als Voraussetzung für den bereits gesperrten Katalogimport erzwungen.

## Reproduktion der zusätzlichen bestehenden Prüfungen

```sh
node --test integrations/real-fitment-review-owner/review.test.mjs
python3 -m unittest discover -s integrations/verified-repair-cases-wave4 -p 'test_*.py'
```

Die übrigen Befehle stehen in README. Der Screenshot-/Browserlauf bleibt derselbe bestehende Befehl `npm run test:browser --prefix integrations/consumer-repair-mission-poc`, sobald eine passende lokale Playwright-Chromium-Installation vorhanden ist; Testausgaben in ein externes Scratchverzeichnis umleiten, keine fremden QA-Artefakte überschreiben.

Modellbelege nachspielen: `node integrations/import-model-gap-wave3-sources.mjs --cache-dir /absolute/private-model-source-cache`. Dies ist eine read-only Quellenprüfung, kein Katalogimport.

## Unveränderte Daten- und Freigabegrenzen

Der Archive-Report zeigt separat: 36 historische bedingte Herstellerkanten, 18 Wave4-Listings, **0 neue reale Einbaufreigaben**, 0 neu projizierte Geräte, 0 neue Artikel. Nachgewiesene Artikelnummern, Revisions-/PNC-/SKU-/Marktgrenzen und führende Nullen werden nicht überschrieben. Alte Missionen bleiben auf der alten gültigen Snapshot-/Core-Version; sie werden **nicht** als gegen eine neue Datenversion geprüft ausgegeben.

SHA-256-Pins für Snapshot, Catalog-Lock, Offline-Config, Consumer-App und Shared Contract stimmen exakt mit Ausgangs-HEAD `456c8b8936617f5275d8d1ccfc29601d559cac89` überein. Alle neuen Dateien bleiben ausschließlich unter `integrations/catalog-wave6/`. Kein main-Merge, Deployment, Image-Rehosting, Shopbutton, Livepreis oder B2B-Import.
