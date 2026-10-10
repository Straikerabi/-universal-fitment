# #81 · WebKit-Fixes und vollständige Abnahme

Bestehender Branch `work/wave6-consumer-webkit-qa`, bestehender Draft-PR #79 gegen `integration/private-unified-preview-wave5-owner`. Startpunkt `eb1c7848d7eef08a905b82645c69552e72df53ee`. #81 autorisiert minimale Consumer-Fixes; kein Katalog-/Snapshot-/Engine-Merge, kein Deployment.

## Reproduzierte Ursachen und Änderungen

| Pflichtfall | Eindeutiger Befund | Fix |
| --- | --- | --- |
| `webkit:text-200-375` | Schritt 1, Gerätekennungslabel: 223 px Inhalt / 213 px verfügbare Breite | `.search-row .field-label`: `overflow-wrap:anywhere` |
| `webkit:text-200-320` | Schritt 3: `.orientation p` endet bei x=337,14 im 320-px-Viewport, intrinsische Flex-Mindestbreite. Nach diesem Fix wurde Schritt 4 erstmals erreicht: `.evidence-path li > span` endet bei x=325,81 | In beiden Textcontainern `min-width:0; overflow-wrap:anywhere`, kein Abschneiden oder Verstecken |
| `webkit:warm-offline` | Playwright 1.62.1: Controller/Cache vorhanden, Offline-Neustart meldet internen WebKit-Fehler. Playwright 1.64.0: Modulregistrierung bleibt in `installing`, Controller null und Cache leer nach unverändertem 12-s-Limit | QA-Abhängigkeit exakt auf 1.64.0 pinnen; echten Worker selbständig als Classic-Script generieren, Registrierung `type:classic`. Keine zusätzlichen Worker-Importfetches. Keine erhöhte Wartezeit, kein Skip, keine Antwortsimulation |

Vorher-Diagnose [Run 38046187775](https://github.com/Straikerabi/-universal-fitment/actions/runs/38046187775), Head `0340ba240324826e8516f08fd1fd7789b7465801`: Chromium 33/33, WebKit 30/33. Instrumentierung bestimmt Stufe/Element und Offline-Phase; kein Produktfix in diesem Diagnoselauf.

Erster Fixlauf [38046664541](https://github.com/Straikerabi/-universal-fitment/actions/runs/38046664541), Head `e454c994d0420ebfd55c125ffef7b03080911845`: 64/66, Chromium 33/33, WebKit 31/33. Dieser Lauf blieb korrekt rot und zeigte den zusätzlichen Schritt-4-Überlauf sowie die Modul-Installationsblockade. Das Betriebssystem-/Font-/Browserdetail ist Teil der Messung, keine Behauptung über jedes Safari-Gerät.

Primärbeleg für den ursprünglichen Emulationsfehler: [microsoft/playwright#42775](https://github.com/microsoft/playwright/issues/42775), upstream geschlossen durch [#42894](https://github.com/microsoft/playwright/pull/42894), [Release 1.64.0](https://github.com/microsoft/playwright/releases/tag/v1.64.0). Die neue Modul-Installationsblockade ist unser konkreter CI-Befund; ihre tiefere WebKit-interne Ursache wird nicht als bewiesen ausgegeben. Der selbständige klassische Worker entfernt genau diesen Import-/Modulladeweg. Sein tatsächlicher Gesamtflow muss erneut bestehen.

## Bytegenaue Offline-Generierung und Source-Lock

`prepare-offline.mjs` generiert sowohl `offline-config.mjs` als auch die Konstanten im bestehenden `offline-worker.mjs`. Der Cache-Hash umfasst alle 16 Source-Asset-Einträge, die unveränderte Serverpolicy und den tatsächlichen Worker-Policytext. Generierte Worker-Konstanten werden aus dem Policyhash ausgeklammert, um eine zirkuläre Cache-Namensberechnung zu verhindern. `--check` vergleicht danach **beide gesamten generierten Dateien bytegenau**; ein manipuliertes Headerpräfix kann dadurch nicht unbemerkt bleiben. Zweite Generierung muss identische Bytes liefern.

Cachewechsel: `uf-consumer-mobile-wave4-51bb0317bdaeffb78fb5ddf0` → `uf-consumer-mobile-wave4-a8757230e3f2b3713822f82f`. Katalog-/Missionsfingerprint bleibt `a20b269f32838c739a80a60c3d88ebc667e438624a32a9ce2c204768a908f33d:consumer-ui/2`, da Geräte-/Engine-/Fixturebytes unverändert sind. Aktivierung, Kein-`skipWaiting`, exakt 17 lokale Cache-URLs, Verweigerung externer/Query-/Mutationsrequests und Notizerhalt bleiben erhalten.

[Owner-Delta-Lock](owner-authorized-delta.json) enthält die echten Vorher-/Nachher-SHA-256 aller **fünf** erlaubten Consumer-Dateien. Alle übrigen **3.714** Ausgangsdateien müssen ihren Original-Git-Blob behalten. Insgesamt werden alle 3.719 Produkt-/Repository-Sourcebytes vor und nach dem Browserlauf gehasht; Änderungen während des Laufs halten das Gate rot. QA-Code, Workflow und Lockfile haben einen zusätzlichen Vorher-/Nachher-Digest.

Die Preview wird nicht mit Testantworten aufgebaut: HTTP-Probe verlangt bei allen **18** ausgelieferten UI-/Worker-Ressourcen dieselben SHA-256 wie auf Disk. Der echte warme Cache muss zusätzlich für jede seiner **17** Antworten dieselben Source-SHA-256 liefern. Darauf folgen tatsächliche Transport-Offlineschaltung, Neustart, echte JSON-Datei, unabhängiger SHA-256-/Tampercheck, Offline-Quellenklick, Stale-State-Abweisung und Cache-Löschung ohne Notizverlust.

## Prüfungen und verbleibende Grenzen

Lokal: 53 unveränderte Legacy-Consumer-Node-Tests und die QA-/Source-Lock-Tests bestanden; `offline:check` für generierten Manifest-/Workertext bestanden. Die CI verlangt zusätzlich unveränderte Legacy-Consumer-Browser- und JSON-Prüfpasstests, Ausgabe ausschließlich im QA-Artefaktordner, keine Überschreibung alter Consumer-Screenshots.

Abweichung transparent: Der historische `consumer-repair-mission-poc/check.mjs` ist weiterhin auf `work/consumer-mobile-ux-wave4` und den alten Wave4-Gesamtdiff festgelegt. Auf dem ausdrücklich gewünschten #81-Branch bricht er an diesem Branchvergleich ab. Er wird nicht gelockert oder als bestanden behauptet. Der engere #81-Syntax-/Hash-/Delta-Scope-Guard sowie die unveränderten Legacy-Tests und `offline:check` sind verpflichtend und ersetzen den unpassenden historischen Branch-Gesamtdiff.

## Vollständige CI-Abnahme — 66/66, eigenes Gate GRÜN

[Run 38047125232](https://github.com/Straikerabi/-universal-fitment/actions/runs/38047125232), getesteter Commit `8ca52cd6bb865a9871a2179a03323b1b18da0dee`. Vollmatrix tatsächlich ausgeführt am 2026-10-10, 11:05:28.628–11:06:37.562 UTC, nicht aus selektiven Läufen zusammengesetzt. Job einschließlich Legacy-Browserprüfung und Artefaktupload erfolgreich.

| Prüfung | Gemessenes Ergebnis |
| --- | --- |
| Chromium 156.0.8078.4 | 33/33 |
| Linux-WebKit 27.2 | 33/33 |
| Gesamt / fehlgeschlagen / blockiert / nicht ausgeführt | 66/66 / 0 / 0 / 0 |
| QA-Node-Tests / unveränderte Legacy-Node-Tests | 16/16 / 53/53, keine Skips |
| Unveränderte Legacy-Browserprüfungen / echte JSON-Downloads | 31/31 / 4/4 |
| Offline-Fingerprint, Manifest und selbständiger Worker | bytegenau, bestanden |
| Externe App-Requests / aufgezeichnete App-Laufzeitfehler | 0 / 0 |

Beide warmen Offline-Fälle bestehen alle sechs Phasen: Controller, Cache, Cache-Sourcebytes, tatsächlicher Offline-Neustart, JSON-SHA-256 und Cache-Löschung. 17 echte Cacheantworten und 18 HTTP-Ressourcen sind bytegleich mit den ausgeführten Quellen. Vorher-/Nachher-Source-Digest: `fca72e334908b27ac0305ebdc0fd4da825405824c5a11160dd33550eddaa86b0`. Vorher-/Nachher-Suite-Digest: `51575b84e2db6f98b0ed4ed9edf388790468ec03deb7223f2b8c92784b31b108`.

Dauerhafte tatsächliche CI-Nachweise: [66-Zeilen-Report](evidence/ci-issue-81/results.json), [CI-/Artefaktmetadaten](evidence/ci-issue-81/ci-metadata.json), [roter Zwischenlauf 64/66](evidence/ci-issue-81/intermediate-module-worker-64-of-66.json). Diese Dokumentationsarchivierung ändert weder Produkt- noch Suitebytes und behauptet keinen neuen Testlauf.

[Eigene UI-Screenshots und vollständige CI-Artefakte](https://github.com/Straikerabi/-universal-fitment/actions/runs/38047125232/artifacts/11667866660): SHA-256 `b099b8cd6f4f33e038c0ffb6de5fc4577e63e4aff21fa392601f3fff62cbeb6c`, 7.134.947 Bytes, GitHub-Ablauf 2026-10-24. Der dauerhafte Ergebnisreport bleibt unabhängig vom ZIP-Ablauf nachvollziehbar.

## Separater Integrationspunkt — Preflight bleibt ROT

[Preflight-Run 38047125236](https://github.com/Straikerabi/-universal-fitment/actions/runs/38047125236) scheitert im separaten Source-Evidence-Test: dessen alter Source-Lock und reproduzierbarer Beispielreport berücksichtigen die fünf ausdrücklich durch #81 autorisierten Consumer-Änderungen noch nicht. Dieser fremde Workflow wurde nicht gelockert, übersprungen oder verändert. Nachfolgende Schritte dieses separaten Jobs sind wegen des frühen Fehlers nicht ausgeführt; das ist **keine** Behauptung einer vollständig grünen Repository-CI. Owner-Review/Aktualisierung des separaten Preflight-Locks bleibt ein Integrationspunkt. Die eigene 66/66-Suite und alle ihre Jobschritte sind dagegen vollständig erfolgreich, ohne Skips.

Physisches iPhone, echtes macOS-/iOS-Safari, VoiceOver und menschlicher Pilot bleiben getrennte manuelle Gates; 0 Testpersonen, keine erfundenen Conversionraten, keine Beta-/Launchfreigabe. Keine Katalogänderungen, kein main-Merge, kein Deployment.
