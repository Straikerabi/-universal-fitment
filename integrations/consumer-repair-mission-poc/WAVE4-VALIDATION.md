# Wave4-Validierung · Issue #63

Die Prüfungen beziehen sich auf `work/consumer-mobile-ux-wave4` ab Owner-Basis `52f056664ddbf1a6c263a3d86feac3ee0128c054`, Ziel `integration/dual-platform-owner-review`. Alle Änderungen bleiben im Consumer-Verzeichnis. Kein Merge oder Deployment. Die historische Prüfung in `VALIDATION.md`/`qa/` bleibt unverändert.

## Ergebnisse

| Prüfung | Ergebnis |
| --- | --- |
| Consumer-Node-Tests | 41 bestanden, 0 fehlgeschlagen |
| Bestehender Shared-Core + Owner-Bridge, nur lesend ausgeführt | 101 bestanden, 0 fehlgeschlagen |
| Browserprüfgruppen | 31 bestanden, 0 fehlgeschlagen |
| Vorbereitete Pilotaufgaben | 24 automatisiert durchlaufen; alle realen Ergebnisse bleiben offen |
| Quellenprojektion | bytegleich; 11 Geräte, 11 Originalteil-Identitäten, 0 neue Fitments |
| Quellen-/Core-Schutz | 13 relevante Dateien bytegleich zur Review-Basis; Hashes im JSON-Nachweis |
| Syntax, Branch, Dateiumfang, Offline-Konfiguration, `git diff --check` | bestanden |
| Laufzeitfehler / externe Anfragen | 0 / 0 im instrumentierten Browserlauf |
| Offline | erfolgreicher Neustart mit derselben gespeicherten UI/Core-Version; 17 feste URL-Pfade |
| Cachefähige lokale UI-/Core-Assets | 128.699 Bytes unkomprimiert, Budget 300.000 Bytes |
| Screenshots | 19 PNGs der eigenen Oberfläche |

Browser: Chromium `153.0.8010.0`, Playwright `1.62.1`; Node `24.19.0`. Messzeit des Browserlaufs: `2026-10-09T21:15:28.157Z`. Die genaue Prüfliste und automatischen Ablaufzeiten stehen in [browser-results.json](qa-wave4/browser-results.json); [validation-results.json](qa-wave4/validation-results.json) enthält Versionen, unveränderte Datei-Hashes und Screenshot-Summen. Die Assetmessung zählt eindeutige cachefähige Dateien, nicht Netzwerk-/HTTP-Overhead oder Server-/Testwerkzeuge.

## Abgedeckte Fälle

- Alle fünf Schritte bei 320×740, 375×812, 390×844, 430×932, 844×390, 768×1024 und 1280×900 ohne horizontales Überlaufen. Aufgeklappte Filter, Baugruppenbelege und Checklistenbelege werden zusätzlich in allen Größen geprüft.
- Fünf native Baugruppen-Details, Tastaturöffnung, getrennte Kandidaten-/Freigabezahlen, wörtliche Namen-/Code-/Teileart-Suche, sich schneidende Filter und deterministische Name-/Code-Sortierung. Preiswahl ist nativ deaktiviert und begründet.
- Filter ohne Treffer und Bereiche ohne Dokumentation bleiben unterscheidbar. Keine erfundenen Alternativteile, Angebote oder Nichtverfügbarkeitsaussagen. Ausgeblendete vorgemerkte Kandidaten bleiben in der Checkliste, bis sie ausdrücklich entfernt werden.
- Geräte-/Artikelkennung, Quellenmarkt und ungeprüfte eigene Ausführung bleiben sichtbar. `/WA` wird nicht auf `/WD` übertragen; EEM ersetzt nicht EEK. Ein GB-Hoover-Artikelbeleg wird neben dem DE-Gerät ausdrücklich als GB-Website angezeigt, ohne Fitmentfreigabe.
- Reale Kandidaten bleiben unbestätigt. Die fünf klar gekennzeichneten synthetischen Szenen decken positive, fehlende Revision, negative Revision, Anschlussausschluss und unvollständiges Paket ab. Ihre Statusantwort bleibt die des unveränderten gemeinsamen v1-Cores; kein Kaufknopf und keine Paketfreigabe.
- Geräte-/Varianten-/Baugruppenwechsel verwerfen fremde Notizen; gleiche Baugruppe erhält die Auswahl. Alte Fingerprints, Schema 1, doppelte Erledigt-IDs und manipulierte Statusantworten werden beim Laden zurückgesetzt. Reale Mission und Demo bleiben getrennt.
- Checklistenabschnitte enthalten jedes Element einmal. Vormerken, Abhaken, Wiederherstellen und Textdownload ändern keinen Fitmentstatus. HTML in Nutzertext wird als Text behandelt; verweigertes Clipboard liefert eine Exportalternative.
- Hell-/Dunkelmodus, reduzierte Bewegung, 200 % CSS-Textgröße, sichtbarer Tastaturfokus und Skip-Link. Native Labels, Fieldsets, Details und Live-Status für Filter/Verbindung. Mindesthöhe der Buttons und 16-Pixel-Eingaben wurden in den ersten drei Schritten geprüft; dies ist kein vollständiges Accessibility-Audit.
- Echter lokaler Service Worker: Online vorwärmen, feste Cacheliste prüfen, Verbindung sperren, Seite neu laden, unveränderte reale Prüfliste öffnen, Offline-Quellenklick erklären und Vorschau-Cache entfernen, ohne die Notizen zu löschen. Bei blockiertem Worker erklärt die laufende Sitzung, dass ein Offline-Neustart nicht gespeichert ist.
- Loopback-Server verweigert fremde Host-/Origin- und Proxyanfragen, private Pfade sowie Schreibmethoden. Die Seite bleibt ohne Netzwerkschnittstelle; nur der Worker darf freigegebene Ressourcen desselben Origins laden. Keine automatischen Hersteller-, Analyse- oder Händleranfragen.

## Screenshots

| Ansicht | Nachweis |
| --- | --- |
| Gerätewahl / Ausführung | [01](qa-wave4/01-identify-375.png), [02](qa-wave4/02-variant-375.png) |
| Baugruppe / offene reale Prüfung / Checkliste | [03](qa-wave4/03-assembly-375.png), [04](qa-wave4/04-real-unclear-375.png), [05](qa-wave4/05-checklist-375.png) |
| Synthetisch positiv / negativ | [06](qa-wave4/06-demo-supported-375.png), [07](qa-wave4/07-demo-negative-375.png) |
| Große Schrift / dunkle negative Demo / Desktop | [08](qa-wave4/08-text-200-375.png), [09](qa-wave4/09-dark-negative-375.png), [10](qa-wave4/10-desktop-assembly.png) |
| Leerer Schlauchbereich bei 320 px | [11](qa-wave4/11-accordion-hose-empty-320.png) |
| Teilefilter / Filter ohne Treffer | [12](qa-wave4/12-filter-energy-375.png), [13](qa-wave4/13-filter-miss-375.png) |
| Gruppierte Prüfliste / abweichende Variante | [14](qa-wave4/14-checklist-grouped-375.png), [15](qa-wave4/15-variant-gaps-430.png) |
| Aufgeklappte Filter, große Schrift / Dunkelmodus | [16](qa-wave4/16-expanded-text-200-375.png), [17](qa-wave4/17-dark-filters-375.png) |
| Echter Offline-Neustart | [18](qa-wave4/18-offline-reloaded-390.png) |
| Hoover GB-Quellenwebsite neben DE-Gerät | [19](qa-wave4/19-hoover-source-region-375.png) |

## Reproduktion und Grenzen

```bash
npm test --prefix integrations/consumer-repair-mission-poc
node --test integrations/fitment-engine-v1-poc/contract.test.mjs integrations/dual-platform-owner-review/bridge.test.mjs
node integrations/consumer-repair-mission-poc/build-catalog.mjs --source /pfad/zum/restaurierten-v1.29-checkpoint --check
npm run check --prefix integrations/consumer-repair-mission-poc
UF_PLAYWRIGHT_MODULE=/pfad/node_modules/playwright/index.mjs UF_CHROMIUM_EXECUTABLE=/pfad/chromium npm run test:browser --prefix integrations/consumer-repair-mission-poc
git diff --check
```

**Kein physisches iPhone, Safari/WebKit oder externer Feldtest wurde ausgeführt.** Es wurden keine Reparaturen beobachtet oder Erfolgsquoten erfunden. Die 24 Aufgaben sind automatisierte Regressionen; sie liefern keine Aussage zur realen OEM-Fitmentgenauigkeit. Das unveränderte Pilotprotokoll und leere Ergebnistemplate bleiben für spätere Feldtests bestehen.

Offline funktioniert nach erfolgreichem Vorwärmen und bei verfügbarem Browserspeicher. Ein nicht gespeicherter Kaltstart benötigt eine Verbindung; Herstellerbelege sind historische Identitätsbeobachtungen, offline nicht neu verifiziert. Die native Installation unter iOS und Verhalten bei Browser-Speicherverdrängung bleiben separat zu prüfen.

Der aktuelle Owner-Workflow adressiert Push auf den Integration-Branch oder PR gegen `main`; für diesen Draft gegen den Integration-Branch werden keine neuen GitHub-Checks behauptet. Die lokalen Prüfergebnisse sind im Draft dokumentiert. Die Wave3-Datenintegration #61 und reale Engine-Anbindung bleiben getrennte Owner-Aufgaben.
