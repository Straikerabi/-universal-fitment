# Universal Fitment Business — lokales Händler-Labor

Issue [#50](https://github.com/Straikerabi/-universal-fitment/issues/50), ausschließlich `work/business-embed-poc`. Basis `71f7826ba936a1f3830c8b2a67e8085a9cfe234e` (v1.29.0). Keine Änderungen am Consumer, Katalog, gemeinsamen Fitment-Kern, Release oder Deployment.

## Start in unter einer Minute

Node.js 22+; keine Installation, Pakete oder externen Dienste nötig:

```sh
node integrations/business-embed-poc/serve.mjs
```

Öffnen: **http://127.0.0.1:4175/**. Bei belegtem Port `UF_BUSINESS_PORT=4176` setzen. Server bindet ausschließlich Loopback. `localhost`-Hostnamen und externe Host-Header werden absichtlich nicht akzeptiert. Stoppen mit Ctrl+C. Nicht öffentlich tunneln, hosten oder in einen echten Shop einbauen.

Die Shop-Vorschau enthält einen eigenständigen iframe-Teilefinder. Zwei **erfundene** Händler (Atelier Teile / Nordlicht Service), zwei Farbstile, Desktop-/Mobilansicht, Suchfilter, sechs synthetische Szenarien, drei deutlich beschriftete Ergebniszustände, aufklappbare Herkunft und strikt separate Händlerartikel. Kein Preis, Bestand, Kauf-Link, Kontaktformular oder Zahlungsfluss. Alle `DEMO-*`-Geräte, `SYN-*`-Codes und Belege sind frei erfunden; keinerlei reale OEM-/Kundendaten.

Der geladene Finder funktioniert auch nach Trennung vom Netzwerk. Ein frischer Seitenaufruf oder Wechsel des iframe benötigt den laufenden lokalen Server; keine PWA-/Offline-Reload-Zusage. Kein Service Worker, kein Cache, keine Cookies oder Browser-Speicherung, keine Webfonts, Bilder, CDNs oder Analytics. Der Server protokolliert keine Anfragen.

## Ein gemeinsamer Vertrag, keine eigene Engine

Stand der lesenden Prüfung vom 09.10.2026: Branch `work/fitment-engine-v1-poc` steht auf `71f7826ba936a1f3830c8b2a67e8085a9cfe234e`; kein #48-Vertrag veröffentlicht. Deshalb ist `demo-view/1` **nur ein lokales Darstellungsformat**, kein Ersatz oder angeblich kompatibler `FitmentResponse`-Vertrag. Der Fixture-Provider schlägt ausschließlich vorbereitete Testantworten anhand exakter Testfall-/Geräte-/Teilekennung nach. Er bewertet keine Modell-, OEM-, Anschluss- oder Belegregeln.

`createAdapter({invoke, validateContract, mapToView})` ist der vorbereitete Anschluss:

1. `invoke` ruft später ausschließlich den gemeinsamen #48-Kern auf; vertrauenswürdiger Server liefert den berechtigten Mandantenkontext.
2. `validateContract` wird mit dem von #48 veröffentlichten **Originalvalidator und Version** verbunden, nicht anhand dieses UI-Formats geraten.
3. `mapToView` projiziert ausschließlich erlaubte Felder in die UI. Technischen Status und Bedingungen aus #48 unverändert erhalten; keine eigene Passungsentscheidung, Risiko-Abschwächung oder provisionsabhängige Sortierung.
4. B2C und B2B gegen denselben #48-Vertrag und dieselben Entscheidungsfixtures testen. Unknown/Ausschluss, unbekannte Version und Rechteverletzungen müssen in beiden Oberflächen gleich bleiben.
5. Die jetzige Rechteprüfung lässt **nur synthetische** Belege durch. Ein späterer Produktionsadapter braucht ausdrücklich separat geprüfte, feldbezogene #48-/Mandanten-Rechteprojektion; nicht einfach den Marker ändern.

Tests beweisen Hook-Aufruf, Zurückweisung, Kontextbindung, Timeout-Abbruch und redigierte Fehler. Sie beweisen keine fertige #48-Integration oder echte Datenberechtigung. Bei Vertragsveröffentlichung: Schema-Commit und Hash pinnen, Mapping überprüfen, Consumer-/Business-Konformitätsfälle ergänzen und Owner-Review verlangen. Keine fremden Branches bearbeiten/importieren oder gemeinsamen Kern duplizieren.

## Testen und Nachweise

```sh
node --test integrations/business-embed-poc/tests.mjs
node integrations/business-embed-poc/verify.mjs
```

Browserprüfungen zusätzlich mit einem vorhandenen lokalen Playwright-Modul und Chromium:

```sh
UF_PLAYWRIGHT_MODULE=/absoluter/pfad/playwright/index.mjs \
UF_CHROMIUM_EXECUTABLE=/absoluter/pfad/chromium \
node integrations/business-embed-poc/browser-tests.mjs
```

36 Node-Prüfungen: zwölf Fixture-Fälle, Mandanten-/Beleg-/Versions-/Code-/Feld-/Rechtegrenzen, keine inferierte Passung, Timeouts, Fehlerredaktion, Provider-Injektion, Server-/Host-/Pfad-/Methodengrenzen. Browser: iframe, Theme-/Mandantenwechsel, alle sechs Ergebniszustände, Suche/XSS-Text, Tastatur/Herkunft, 320/375/768 px und 200 % Text, Offline-Interaktion, unbekannter Tenant, keine Cookies/Speicherung/externen Anfragen. Details und tatsächliche Browserzahl in `browser-evidence.json`; `desktop.png`, `mobile-confirmed.png`, `mobile-unknown.png` wurden visuell geprüft. Chromium-Emulation ersetzt keinen realen iPhone-/Screenreader-Audit.

Der Verifier prüft Syntax und Node-Tests und erzeugt SHA256 für die acht ausgelieferten Demo-Dateien. Statische Module werden direkt ausgeliefert: kein nicht reproduzierbarer Build-/Minifier-/CDN-Schritt. Ein bestehender CI-Job kann den Node-Testbefehl ausführen; in diesem Branch wird keine gemeinsame Workflow-Datei geändert und kein bereits erfolgter CI-Lauf behauptet.

## Dokumentation und Abnahmegrenze

- [Mandanten, Datenschutz und API-/Preismodelloptionen](ARCHITECTURE.md)
- [Interviewplan, KPI-Protokoll und Go/No-Go](DISCOVERY.md)
- [Vorprüfung, Ergebnisse und Owner-Handoff](HANDOFF.md)

Technische Demo und Interviewvorbereitung sind geliefert. **Keine Interviews durchgeführt, kein Nutzen oder Zahlungswille bewiesen, kein Pilot freigegeben.** Die nach Gesprächen geforderte Bedarfsauswertung kann erst mit echten, autorisierten Ergebnissen erfolgen. Keine Personen angeschrieben, Firmenbehauptungen, Partnerschaften oder Verträge angelegt. Code/Fixtures können im öffentlichen Repo gelesen werden; „lokal/privat“ bedeutet hier kein öffentlich laufender Dienst, nicht vertrauliche GitHub-Dateien.
