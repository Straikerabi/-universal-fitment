# Gemessene lokale Abnahme / #75

**Gate ROT. Keine Beta-/Launchfreigabe.** Die isolierte Suite ist implementiert; die Produktabnahme ist nicht erfolgreich abgeschlossen. Produktfehler werden gemäß Issue nur berichtet, nicht im geschützten Consumer behoben.

Gemessener vollständiger Lauf: **2026-10-10 07:06:57.039–07:08:40.906 UTC**. Ausgangs-HEAD `456c8b8936617f5275d8d1ccfc29601d559cac89`; neue QA-Dateien waren beim Lauf noch uncommitted. Ihre tatsächlich ausgeführten Bytes werden unabhängig vom späteren Commit durch den Suite-SHA-256 `46d0cf09a0ae926fe6fc02a92b6e1a9d40e978e894b6b72b77c2bb061ac3eb96` gebunden. Vor-/Nachher-Digest identisch; Dokumentation und archivierte Ergebnisse sind nicht Teil dieses Code-Digests.

| Prüfung | Gemessenes Ergebnis |
| --- | --- |
| Lockfile-Installation / Syntax / Scope | bestanden |
| Node-Tests für Fail-closed-Gate und CI-Policy | 12 bestanden; synthetische Reporterfixtures, keine Browserresultate |
| Chromium | 33 ausgeführt: 32 bestanden, 1 fehlgeschlagen |
| WebKit | 33 blockiert; Browser konnte nicht starten |
| Pflichtmatrix | 66 geplant, 32 bestanden, 1 fehlgeschlagen, 33 blockiert, 0 ausgelassen |
| Instrumentierte App-Flows | 0 externe Requests, 0 aufgezeichnete App-Laufzeitfehler |
| Geschützte Ausgangsdateien | 3.719 bytegleich, vor und nach dem Lauf |
| UI-Screenshots | 10 eigene Consumer-Aufnahmen, ausschließlich Chromium |
| Physisches iPhone / macOS Safari / externe Nutzer | nicht durchgeführt / 0 Personen |
| Menschliche Erfolgs-/Abbruchraten | nicht erhoben; null, keine erfundenen Messwerte |

Runtime: Node.js 24.19.0, Playwright **1.62.1** aus der eigenen Lockdatei. Chromium **153.0.8010.0** wurde über einen ausdrücklich lokalen Executable-Override gestartet; dies ist kein behaupteter Lauf des Playwright-Standard-Chromium-Bundles. Der offizielle WebKit-Download (26.5, Revision 2336) war vorhanden, aber 21 Systembibliotheken fehlten. Es wurden lokal keine Systempakete installiert. Linux-WebKit wäre ohnehin kein echtes iOS Safari.

Der vollständige Runner und das anschließende Gate liefern erwartungsgemäß Exit-Code 1. Ein zweiter vollständiger Chromium-Lauf bestätigte denselben Layoutbefund. Die archivierten Ergebnisse stammen ausschließlich aus dem hier angegebenen letzten Lauf.

## Fehler und belastbare Grenzen

- **W6-B1:** 375 × 812, Root-Schrift 200 %, Schritt 1: das Label „Modell oder Gerätekennung“ hat 223 px Textbreite in 213 px verfügbarer Breite. Der minimale Umbruchvorschlag wurde nur temporär im Test-DOM gemessen (danach 213/213 px); kein Produktfix wurde angewandt.
- **W6-E1:** lokale WebKit-Ausführung wegen fehlender Bibliotheken blockiert. Jeder der 33 Fälle trägt `blocked`, keine erfundenen WebKit-Screenshots, Laufzeiten oder Erfolge.
- **W6-H1:** echte Safari-, VoiceOver-, Flugmodus-, Speicherverdrängungs- und Nutzerprüfung offen. Die vorbereitete Hardware-Checkliste ist kein ausgefülltes Ergebnis.

Details, reproduzierbare Schritte und vorgeschlagener Minimalfix: [BUGS.md](BUGS.md). Hardware: [IPHONE-PILOT-CHECKLIST.md](IPHONE-PILOT-CHECKLIST.md).

## Nachweise

- [Vollständiger gemessener Report](evidence/local/results.json): alle 66 Zeilen, Engine-Startblocker, Laufzeiten, erwartete negative Abbruchbedingungen, Checksummenprüfungen, Scope- und Suite-Beweise.
- [Artefaktmanifest](evidence/local/manifest.json): SHA-256 und Größe jedes archivierten Nachweises.
- [Temporäre Label-Diagnose](evidence/local/label-proposal.json): Baseline und DOM-only-Vorschlag getrennt.
- [Fehlerscreenshot](evidence/local/chromium-text-200-375-failure.png), [Dunkelmodus](evidence/local/chromium-dark-375-expanded.png), [warmer Offline-Start](evidence/local/chromium-warm-offline-cached-notes.png), [regionale Kennungen](evidence/local/chromium-identity-boundaries-regional-source.png).

Geschützter Tree-Einträge-SHA-256: `6f98deb7acd44b41d6ec047dc0d9ce1643f18f9397e5fe069fd66c97af9d4b08`. Kein Katalog, Consumer, Snapshot, Shared-Core, Offline-Fingerprint oder B2B-Adapter verändert.

## CI ist eine gesonderte Ausführung

Der neue PR-Workflow installiert beide Playwright-Browser einschließlich Systemabhängigkeiten in einer isolierten Ubuntu-24.04-VM und verlangt alle 66 Fälle. Ein vorhandener Workflow ist noch kein erfolgreicher CI-Lauf; tatsächliche Runs und ihr Status müssen im Draft-PR geprüft werden. Der lokale WebKit-Blocker darf durch einen tatsächlich ausgeführten CI-Nachweis ergänzt, niemals rückwirkend als lokaler Erfolg umetikettiert werden. Auch vollständig grüne Automation wäre keine Hardware-/Beta-Freigabe.
