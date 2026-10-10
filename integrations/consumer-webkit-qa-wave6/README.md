# Consumer WebKit-/Chromium-Gate · Wave 6 / #75

Isolierte, reproduzierbare Abnahme der unveränderten Consumer-Reparaturmission aus Owner-PR #73. Arbeitsbranch `work/wave6-consumer-webkit-qa`, Reviewziel `integration/private-unified-preview-wave5-owner`, feste Ausgangsbasis `456c8b8936617f5275d8d1ccfc29601d559cac89`.

**Die Testsuite ist keine zweite Fitment-Engine und kein echter Nutzerpilot.** Linux-Playwright-WebKit ist eine Simulation, kein physisches iPhone und kein Apple-iOS-Safari. Auch ein grünes Automationsgate erteilt keine Beta-/Launchfreigabe. Der lokale gemessene Stand steht in [VALIDATION.md](VALIDATION.md); tatsächliche Fehler und Blocker in [BUGS.md](BUGS.md).

## Eigentumsgrenze

Nur dieses neue Verzeichnis und `.github/workflows/consumer-webkit-qa-wave6.yml` werden verändert. Consumer-App, Snapshot, Versions-/Offline-Fingerprint, Shared-Core, B2B und paralleler Katalog bleiben bytegleich. `scope.mjs` prüft alle 3.719 geschützten Ausgangsdateien gegen ihre Git-Blob-Hashes, vor und nach Browserausführung. Zusätzlich werden die tatsächlich ausgeführten QA-Dateien vor/nach dem Lauf mit SHA-256 gebunden. Keine heimliche Datenmigration und kein Quellenabruf.

## Reproduzieren

Node.js 22 oder neuer. Die eigene Lockdatei pinnt Playwright 1.62.1 samt Integrity-Werten; keine Produkt-/Shared Dependencies werden verändert.

```bash
npm ci --ignore-scripts --no-audit --no-fund --prefix integrations/consumer-webkit-qa-wave6
npm test --prefix integrations/consumer-webkit-qa-wave6
npm run check --prefix integrations/consumer-webkit-qa-wave6
node integrations/consumer-webkit-qa-wave6/node_modules/playwright/cli.js install --with-deps chromium webkit
npm run test:browser --prefix integrations/consumer-webkit-qa-wave6
npm run gate --prefix integrations/consumer-webkit-qa-wave6
```

Die Systemabhängigkeiten nur in einer dafür freigegebenen Umgebung installieren. Fehlende Bibliotheken oder Browser sind Blocker, keine bestandenen Tests. Der Workflow benutzt dafür eine isolierte Ubuntu-24.04-CI-Maschine. Die lokal verwendete Work-Umgebung wurde nicht mit Systempaketen verändert.

`UF_PLAYWRIGHT_MODULE` kann optional eine bereits installierte, exakt passende Playwright-Version benennen. `UF_CHROMIUM_EXECUTABLE`/`UF_WEBKIT_EXECUTABLE` sind ausschließlich lokale Diagnose-Overrides; tatsächliche Browserversion und Bundle-/Override-Nutzung erscheinen im Bericht. CI nutzt keine Overrides, sondern beide zur Lockdatei gehörenden Browserbundles.

`UF_QA_CASE` oder `UF_QA_ENGINES` ermöglichen gezielte lokale Diagnose, aber **niemals ein grünes vollständiges Gate**: nicht ausgeführte Pflichtfälle bleiben blockiert. Beispiel für den bekannten Label-Fehler:

```bash
UF_QA_ENGINES=chromium UF_QA_CASE=text-200-375 npm run test:browser --prefix integrations/consumer-webkit-qa-wave6
node integrations/consumer-webkit-qa-wave6/reproduce-label.mjs
```

Das zweite Skript misst zunächst den unveränderten Fehler und bewertet anschließend nur in einem kurzlebigen Browser eine einzelne CSS-Eigenschaft. Es schreibt keine Produktdatei; es gehört nicht zu den bestandenen Baseline-Fällen. Falls der Fehler auf einem anderen Browser-/Fontsystem nicht auftritt, meldet es ausdrücklich „nicht reproduziert“, statt den Vorschlag als getesteten Produktfix auszugeben.

## Pflichtmatrix

| Gruppe | Fälle pro Engine | Inhalt |
| --- | ---: | --- |
| Viewports | 8 | 320×740 / 740×320, 375×812 / 812×375, 390×844 / 844×390, 430×932 / 932×430; alle fünf Schritte |
| Große Schrift | 4 | 320, 375, 390, 430 px; CSS-Root-Schrift 200 %, alle fünf Schritte; kein behaupteter physischer Pinch-Zoom |
| Dunkelmodus | 4 | vier mobile Breiten, aufgeklappte Filter und alle fünf Schritte |
| Funktion / Negativfälle | 17 | echte offene Mission, getrennte Kennungen, synthetische Statusfälle, Zustand/Checksumme/Offline, Tastatur/Semantik, Touch, Exportfehler |
| Gesamt | 33 | **66 Pflichtfälle für Chromium + WebKit**, keine selektive Erfolgsausgabe |

Die funktionalen Fälle prüfen vorhandene reale Pilotidentitäten und ausschließlich gekennzeichnete synthetische Szenen/Nutzereingaben/Fehlerinjektionen. Keine neuen Artikel, Preise, Passungen, Kontakte oder Conversion-Zahlen. Quellenlinks bleiben Identitätsbelege; Produktcode, Quellenkennung, Quellenmarkt und eigene ungeprüfte Angabe werden nicht gleichgesetzt. Positive Demoantworten bleiben synthetisch; reale Kandidaten bleiben unbestätigt. Alle JSON-Prüfpässe verweigern reale Einbau-/Kauf- und vollständige-Set-Freigaben.

## Netzwerk, Offline und Prüfpass

Browserrequests werden pro Fall aufgezeichnet und externe HTTP(S)-Versuche vorsorglich geblockt. Auch ein geblockter externer Versuch ist ein Gate-Fehler. App-Laufzeitfehler werden aufgezeichnet; fehlgeschlagene Worker-Installation, Cache-Aufbau und Offline-Neustarts führen zu Fehlern oder Timeouts der entsprechenden Pflichtfälle. Die Installation der Testwerkzeuge selbst benötigt natürlich npm-/Browser-Downloadserver; „0 externe Requests“ bezieht sich auf die instrumentierten App-Flows, nicht auf CI-Bootstrap.

Ein frischer, ungespeicherter Offline-Start muss ohne erfundene Oberfläche abbrechen. Der warme Test prüft die genaue vorhandene 17-URL-Cacheliste, echten offline gesperrten Transport, Neustart, offene Checkliste, JSON-Download mit unabhängiger SHA-256-Nachrechnung und Browser-Verifikation, unveränderte Prüfsumme bei manipuliertem Inhalt, Quellenklick, Stale-Fingerprint sowie Cache-Löschung ohne Notizverlust. Ein blockierter Worker erklärt nur die laufende, nicht gespeicherte Sitzung.

`context.setOffline(true)` aktualisiert unter Service-Worker-Kontrolle nicht zuverlässig `navigator.onLine`. Darum werden zusätzlich der öffentliche OS-Offline-Indikator und das Offline-Ereignis ausdrücklich simuliert, wie bereits in der Owner-Basis. Beide Signale und native Vorher-/Nachher-Werte werden gemessen. Das ist **kein echter Flugmodus-/iPhone-Test**.

Die JSON-Checksumme ist keine Signatur oder OEM-Zertifizierung. Unveränderte Checksumme plus geänderter Payload wird verweigert; fehlerhaftes JSON und fehlende Prüfsumme ebenfalls. Die Oberfläche hat keinen JSON-Import-/Zertifikat-Annahmeweg. Eine neu berechnete Prüfsumme kann die Herkunft nicht beweisen; Rechte-/Passungsfreigaben dürfen niemals aus ihr abgeleitet werden.

## Artefakte und CI

Der Runner schreibt nur `artifacts/latest/` in dieser Suite: Ergebnis-JSON, Laufzeiten, erwartete Abbruchgründe, Request-/Fehlerlisten, semantische Snapshots, Touchmaße und ausgewählte eigene UI-Screenshots. Bilder werden nicht aufgenommen, wenn Raster-/SVG-Bildelemente auftauchen. Der veröffentlichte lokale Nachweis ist separat unter `evidence/local/` archiviert; ein neuer Lauf überschreibt ihn nicht. Ein temporär erstellter Prüfpass bleibt Browser-Testdownload, kein erfundenes Reparaturereignis.

Der eigene Workflow läuft nur als `pull_request` gegen den Owner-Branch, mit `contents: read`, unveränderlichen Action-SHAs und deaktiviertem Credential-Persistieren. Er testet den genauen PR-Head, keine virtuelle Zusammenführung mit dem parallelen Katalog. Fehler, fehlende Browser, unvollständige Matrix, doppelte Fälle, falsche Version, fehlende Bytebeweise und veränderte QA-Dateien halten das Gate rot. Fehlende Reports/Artefakte sind ebenfalls Fehler. Es gibt kein `continue-on-error`, keinen Merge- oder Deployment-Schritt. Fehlerscreenshots/-reports werden für 14 Tage als CI-Artefakt gehalten.

## Echte iPhone-Abnahme bleibt offen

[IPHONE-PILOT-CHECKLIST.md](IPHONE-PILOT-CHECKLIST.md) und [human-pilot-template.json](human-pilot-template.json) sind vorbereitete, noch unausgefüllte Hardware-/Nutzerprüfungen. Keine externe Person wurde kontaktiert; kein Mensch wurde als automatisierter Test gezählt. Native Safari-/VoiceOver-/Installations-/Speicherverdrängungstests und menschliche Abbruch-/Erfolgsraten bleiben ausdrücklich offen.

Methodische Primärquelle: [Playwright Browser-Dokumentation](https://playwright.dev/docs/browsers), insbesondere WebKit-Plattformgrenzen und versionsgebundene Browserinstallation. Kein Linux-WebKit-Resultat wird als Apple-Safari-Hardwareabnahme ausgegeben.
