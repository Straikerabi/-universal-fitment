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

## Tatsächliche CI-Abnahme und eigene Screenshots

[Exact-SHA-Run 38077673869](https://github.com/Straikerabi/-universal-fitment/actions/runs/38077673869), Head 328ed84701c6959c5b48d8fc702368f7e336d4bf, erster Versuch vollständig grün. [Unverändertes unabhängiges Owner-Gate 38077673915](https://github.com/Straikerabi/-universal-fitment/actions/runs/38077673915) ebenfalls 66/66 grün. Kein selektiv zusammengesetzter Lauf, keine Testskips oder verlängerten Timeouts.

| Gemessene Prüfung | Ergebnis |
| --- | --- |
| Chromium 156.0.8078.4 / Linux-WebKit 27.2 | 33/33 + 33/33 |
| Bestehende vollständige Matrix | **66/66**, 0 Fehler, 0 Blocker, 0 nicht ausgeführt |
| Neue Finder-/Profil-/Carryoverfälle | **32/32**, 320/375/390/430 px × 100/200 % × hell/dunkel × beide Engines |
| Node-Tests | 84/84, 0 Skips |
| Unveränderte Legacy-UI / tatsächliche Prüfpassdownloads | 31/31 + 4/4 |
| Quelle/Worker/Cache | 20 ausgelieferte Ressourcen und 19 Cacheantworten bytegeprüft |
| Reale aktive Geräte / Marken / Teile / bestätigte reale Passungen | 11 / 5 / 11 / 0 |

Baseline-Matrix gemessen 2026-10-10T18:55:49.816Z bis 2026-10-10T18:56:58.169Z, Zusatzfälle 2026-10-10T18:56:59.090Z bis 2026-10-10T18:57:43.421Z. Beide warmen Offline-Fälle bestehen Controller, Cache, Sourcebytes, tatsächlichen Offline-Neustart, JSON-SHA-256/Tamperprüfung und Löschung ohne Notizverlust. UI-/Core-Budget bleibt unter 300 kB.

[Vollständiger unveränderter tatsächlicher Report](evidence/acceptance.json) · [CI-/Artefaktmetadaten](evidence/ci-metadata.json). Source-Protected-Digest: fc2e8a01beedad8866e5c5404bb929113cf16b9253353cdf2ad03e4bf46f8034. Testcode-Digest: b66c09f778588eee1e8c659784d7c3b00cbcae007657c071b259822e5e349400. Scope vorher/nachher identisch, 3.826 unveränderte Baseline-Dateien; die sieben erlaubten Consumer-Dateien stehen mit echten Hash-Deltas in [source-delta.json](source-delta.json).

Eigene Oberfläche: [Finder und offener Steckbrief, hell](evidence/chromium-375-100-light-profile.png), [dunkel](evidence/chromium-375-100-dark-profile.png). Keine fremden Medien. Steckbrief und Artikelgruppen sind einklappbar; die lange Review-Ansicht zeigt absichtlich beide offenen Ebenen. Praktischer Vorher/Nachher-Ablauf siehe oben; [historische eigene Wave4-Geräteansicht](../consumer-repair-mission-poc/qa-wave4/01-identify-375.png) ist kein neuer Vorher-CI-Lauf.

[Vollständiges CI-ZIP inklusive 32 neuer Screenshots und 66er-Matrix](https://github.com/Straikerabi/-universal-fitment/actions/runs/38077673869/artifacts/11679062192), SHA-256 2132fdd95841c7aac0a0ac44aac576b1a6287d153ea122f3dbdcad63cce66e32, 21109144 Bytes, GitHub-Ablauf 2026-10-24T18:58:29Z. Zwei Review-PNGs und Ergebnis-JSON sind zusätzlich dauerhaft im Git-Branch archiviert.

### Erhaltene Zwischenfehler und Grenzen

- Erster Exact-SHA-Lauf 38076399285: 66/66 bestanden, danach Scope-Guard durch ausschließlich ungetrackte, generierte Owner-Screenshots gestoppt. Korrektur erkennt nur diesen Artefaktordner/diese Dateitypen; getrackte Sourceänderungen bleiben strikt verboten. Testcodebytes zusätzlich gehasht.
- [Run 38077053681, Versuch 1](https://github.com/Straikerabi/-universal-fitment/actions/runs/38077053681/attempts/1), Head 90509092fcf9d4c1e461670cae6ce6ad4da616f1: 65/66, WebKit Controller-Phase überschreitet unverändert 12 s. Unabhängiger Runner am selben Code grün; eine einzige **vollständige** Wiederholung bestand 66/66 + 32/32 + Legacy. [Originaler Fehlversuch](evidence/controller-timeout-attempt-1.txt) bleibt erhalten. Tiefere Ursache nicht bewiesen; Wiederholungserfolg beweist keine endgültige Beseitigung des Zuverlässigkeitsbefunds. Owner soll ihn bei weiteren Browser-/Hardwareprüfungen beobachten.
- Finaler Produktcode-Run 38077673869 besteht im **ersten** Versuch einschließlich zusätzlicher 200%-Breitenassertion. Kein Expected Failure, keine automatische Fall-Wiederholung, kein versteckter Flake.
- [Separate unveränderte Legal-Preflight-CI 38077673925](https://github.com/Straikerabi/-universal-fitment/actions/runs/38077673925) bleibt ROT am alten Source-Lock/Beispielreport; nachfolgende Schritte dort nicht ausgeführt. Neue Abnahme bestätigt ausdrücklich BLOCKED, source-identity:UNKNOWN, launchApproved:false. Nicht sämtliche Repository-Checks sind grün.
- Historischer #81-Workflow bereits durch Owner auf damaligen Branch beschränkt, auf #95 nicht ausgeführt. Beide aktuellen vollständigen 66er-Gates führen unabhängig tatsächlich alle Fälle aus; keine Testskips in diesen Matrizen.
- Linux-WebKit ist kein physischer iPhone-/Safari-/VoiceOver-Test; 0 Menschenpiloten, kein Rechts-/Hosting-/B2C-Lizenz-/Launch-GO. #85-Rohquellenprüfung und #91-Rechte-/Provenienzreview bleiben eigene Owner-Gates.
