# #95 · Gerätefinder im echten Consumer-Ablauf

Branch ausschließlich `work/wave9-consumer-discovery-owner-bridge`, Ausgangs-Owner `3bafbc7fd8c8da5ed6fe3bddc70eacbc0be1e035`. Draft gegen `integration/private-unified-preview-wave5-owner`, kein main-Merge, kein Deployment.

Vorher: Suchzeile mit einfachem Text-/Markenfilter; ausführlicher Gerätefinder und Steckbrief nur auf einer getrennten Wave8-Seite.

Nachher: Im bestehenden Schritt **Gerät** exakte Kennungen suchen, Marke/Geräteart filtern, Suchrelevanz/Modell/Marke sortieren, ausgewählten Steckbrief aufklappen, bekannte Identitäten und fehlende Felder unterscheiden. Weiter führt dieselbe ausgewählte Geräte-ID in **Ausführung → Baugruppe → Passung → Checkliste** und den unveränderten Prüfpass. Filter ändern nicht heimlich eine Mission; eine ausdrückliche andere Gerätewahl verwirft stale Teil-/Erledigtzustände wie bisher. Real-/Demo-Missionen bleiben getrennt.

## Daten- und Integrationsgrenzen

- Live ausschließlich 11 Geräte/5 Marken aus `catalogSnapshot`, 11 Artikelidentitäten, 0 positive reale Fits. 29 Geräte ausschließlich ausdrücklich synthetisches Testfixture, kein Import von PR #84.
- Die reinen Discovery-Helper aus #92 bleiben unverändert und werden importiert, nicht dupliziert. Kein Import von `observations.json` aus #91, keine unreviewten numerischen OEM-Fakten, Reparaturschritte oder Rechte.
- Bestehende Quellenlinks mit Beobachtungsdatum, Snapshot-/Appfassung und Status **nicht unabhängig verifiziert**. URLs/Artikelidentitäten sind keine Einbau-, Datennutzungs-, Bildrechte-, Gewährleistungs- oder Partnerschaftsfreigabe. Fehlende technische Daten/Werkzeuge/Sicherheitsinformationen ausdrücklich offen.
- Gemeinsame Engine, Mission-State, Prüfpass, Snapshot, bestehende Testfälle und Legal-Source-Locks unverändert. Der lokale Server ergänzt nur die explizit zulässige UI-Datei und genau einen reinen gemeinsamen Discovery-Helper; angrenzende Forschung/Tooling bleibt HTTP 404.
- Offline-Generator erfasst die tatsächlichen kombinierten UI-/Discoverybytes, erzeugt vollständiges Manifest und klassischen Worker bytegenau. Discoverysemantik geht zusätzlich in den Mission-Fingerprint ein: alte Missionen der vorherigen Version werden fail-closed zurückgesetzt. Keine Übernahme alter Passungsantworten, kein `skipWaiting`, kein neuer Worker von einem fremden Branch.

## Exakte Pfade / Owner-Handoff

Gemeinsame Änderungen nur `consumer-repair-mission-poc/{app.mjs,styles.css,serve.mjs,prepare-offline.mjs,offline-config.mjs,offline-worker.mjs}` und neue `discovery-ui.mjs`; dazu dieses isolierte Test-/Nachweisverzeichnis und ein neuer read-only Workflow. Scope vorab in #95 kommentiert. [Source-Delta](source-delta.json) verifiziert echte Vorher-/Nachher-SHA-256 und alle unveränderten Baselinebytes. CI schreibt den Delta-Lock nicht neu.

`source-lock.json` und `baseline-report.json` bleiben bewusst unverändert; Preflight muss `BLOCKED`, `source-identity:UNKNOWN` und `launchApproved:false` melden. Der unabhängige Owner-Browserworkflow wird nicht geändert. Der historische #81-Workflow ist bereits durch den Owner auf seinen Originalbranch beschränkt und bleibt unverändert; er ist kein Ersatz für die neue vollständige Matrix.

## Reproduktion

```sh
node --test integrations/consumer-repair-mission-poc/tests/*.test.mjs integrations/private-owner-wave5/catalog-scorecard.test.mjs integrations/consumer-discovery-wave8/*.test.mjs integrations/consumer-discovery-owner-bridge-wave9/integration.test.mjs
node integrations/consumer-repair-mission-poc/prepare-offline.mjs --check
node integrations/consumer-discovery-owner-bridge-wave9/scope.mjs
npm ci --ignore-scripts --no-audit --no-fund --prefix integrations/consumer-webkit-qa-wave6
node integrations/consumer-webkit-qa-wave6/node_modules/playwright/cli.js install --with-deps chromium webkit
node integrations/private-owner-wave5/browser-owner-catalog-smoke.mjs
node integrations/consumer-discovery-owner-bridge-wave9/browser.mjs
node integrations/consumer-discovery-owner-bridge-wave9/report.mjs
```

Zusätzlich unveränderte Legacy-Browser-/JSON-Tests mit `UF_MISSION_QA_DIR` auf den eigenen Artefaktordner ausführen (siehe Workflow). Der alte Wave4-Branch-Gesamtdiff-Check wird nicht als bestanden ausgegeben; der enge #95-Delta-Guard übernimmt den tatsächlichen Scope-Nachweis.

## Gemessen / noch offen

Lokal: 84 Node-Tests (53 Consumer, 6 Scorecard, 13 Discovery, 12 neue Integration), 0 Skips; Offline-Dateien bytegenau, Scorecard 11/5/0. Lokaler Download des Playwright-Chromium-Bundles liefert hier eine unbrauchbare/trunkierte ZIP-Antwort; kein lokaler Browsererfolg behauptet. Die verbindliche Browserabnahme erfolgt in Linux-CI mit den gepinnten Bundles.

CI/Screenshots: werden erst nach tatsächlich abgeschlossenem Run ergänzt. 66/66 bestehende Fälle sowie 32 zusätzliche Finder-/Profil-Reflow- und Zustandsübernahmefälle müssen vollständig bestehen. Keine erhöhte Wartezeit oder Testskips. Screenshots ausschließlich eigene Oberfläche, keine OEM-Bilder/Diagramme. Linux-WebKit ist kein physischer iPhone-/Safari-/VoiceOver-Test; kein menschlicher Pilot oder rechtlicher Launch-GO.
