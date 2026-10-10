# Universal Fitment · Wave9 Typenschild-Hilfe (privater UX-Pilot)

**Scope:** ausschließlich `integrations/consumer-typeplate-assist-wave9/**` plus dedizierter CI-Workflow.
**Status:** isolierte mobile/tastaturfreundliche Vorschau, noch **nicht** in den fünfstufigen Consumer-Ablauf integriert, nicht live, keine Launch- oder Medienfreigabe.
**Owner-Gate:** #99; Work B #95/PR #98 besitzt alle Shared-App-/CSS-/Offline-Dateien.

## Nutzen und bewusst harte Produktgrenzen

Dieser eigenständige Prototyp zeigt eine **manuelle, reine Client-Suche** nach existierenden Katalogreferenzen. Er liest bei Laufzeit *unverändert* das bereits integrierte Modul `../consumer-repair-mission-poc/catalog-snapshot.mjs`. Damit werden weder ein zweiter OEM-Datensatz aufgebaut noch der Legal-Source-Lock oder Offline-Bytes angepasst.

Ablauf:
1. Marke wählen oder markenübergreifend bleiben. Daneben erscheint ein unverbindlicher generischer Hinweis zum Auffinden der Modell-, Typ-, Produkt-, E-Nr.- oder Materialkennung.
2. **Nur** die Gerätekennung ohne Seriennummer oder Bild eingeben. Trennzeichen und führende Nullen bleiben erhalten.
3. Trefferstufen transparent unterscheiden: ganze Katalogreferenz, eigenständiger Produktcode, Teilkennung/Modellstem, **nur ähnliche** Katalogreferenz. Keine Stufe bestätigt die am individuellen Gerät verbaute Revision oder Passung.
4. Eintrag bewusst anklicken und *nur* beobachtete Identitätsfelder, Quellenmarkt, Katalogreferenz, vorhandenen Varianten-Hinweis sowie gegebenenfalls Teile-**Prüfkandidaten** lesen. Unbekanntes bleibt unbekannt. Herstellerlink öffnet die externe Website erst nach ausdrücklicher Nutzeraktion.

**Keine automatisierte OCR, keine Kamera, kein Upload, kein Tracking, kein Cookie/LocalStorage/SessionStorage, kein Internetabruf und keine Datenübertragung vom Frontend**. Laufzeit-Server bindet nur Loopback; stark eingeschränkte Dateiliste/CSP (u. a. `connect-src 'none'`). Der bewusst gewählte externe Herstellerlink kann eigene Zugriffe beim Hersteller auslösen; deshalb ist er als extern gekennzeichnet, nutzt `target=_blank rel=noopener noreferrer` und eine feste Host-Allowlist. Keine fremden Herstellerbilder werden eingebunden.

## Lokaler Start und reproduzierbare Tests

Voraussetzung: Node.js **22+**. Im Repo-Root:

```sh
npm run check --prefix integrations/consumer-typeplate-assist-wave9
npm start --prefix integrations/consumer-typeplate-assist-wave9
```

Dann http://127.0.0.1:4178/integrations/consumer-typeplate-assist-wave9/ im Browser öffnen.
Es werden keine npm-Abhängigkeiten geladen oder externen APIs abgefragt.

Die isolierte GitHub-Actions-CI führt dieselben Syntax-/Node-Tests sowie 8 tatsächliche Chromium-/WebKit-Browserfälle (320/375/390/430 px) aus. Lokaler Browserlauf nach Installation des im Repository vorhandenen Playwright-Locks: `UF_PLAYWRIGHT_MODULE=/absoluter/pfad/zu/playwright/index.mjs npm run test:browser --prefix integrations/consumer-typeplate-assist-wave9`. Fehlende Browserbinaries sind ein harter Testfehler, kein Skip. Testgruppen: dynamisches Snapshot-Read-only, exakte Kennungen und Präfixsuchfälle, Bosch-/Samsung-Index-/Suffix-Gegenbeispiele, Hoover-Produktcode, fehlende Daten, XSS- und unsichere URLs, manuelle Privatsphäre, statische Accessibility-CSS-Kennzeichen, CSP/Server-GET-HEAD/Blockliste. **Weder simulierte Interaktionen noch Node-CI sind echte Nutzer- oder iPhone-Tests**.

## Prüffälle für spätere echte Hardwareabnahme (NICHT als bestanden zählen)

- iPhone Safari 320/375/390/430 px, Schrift 200 %, Light/Dark/Reduced Motion
- VoiceOver-Reihenfolge, Formularbeschriftungen, Suchergebnisansage und Fokus nach Profil-Auswahl
- Dynamisches Eintippen von `VS20C95D4TK/WD` gegenüber `VS20C95D4TK/WA`; keine automatische Gleichsetzung
- Bosch-E-Nr. `/01` und `/02`, Hoover-Produktcode mit führenden Nullen
- Kein reales Foto verarbeiten; keine Seriennummer speichern; externe Herstellerlinks nur nach bewusster Auswahl
- Kein Fingerprint-/Offline-Asset neu erzeugen solange Work B #95 die gemeinsame App integriert

## Abhängigkeit und Integrationsübergabe

Das Projektteam darf das Modul **nicht automatisch** in `consumer-repair-mission-poc/app.mjs` übernehmen, solange Work B #95 den Dateiscope besitzt. Der Owner kann nach Branch- und Source-Diff die UX-Flows separat reviewen. Alle angenommenen Kennungen sind **nur katalogseitige Identitäten**. Ein Ergebnis zu einem Vollsuffix ist **keine reale Typenschild-/Variantenfreigabe**, ein Herstellerlink ist **keine Bild-, Handels- oder Lizenzfreigabe**. Die gemeinsame Engine meldet weiter **0 bestätigte reale Teilepassungen**. Der Preflight bleibt weiterhin Launch **NO-GO**.

CI-Ausfall/Fehlbeleg oder fehlender hardwarebasierter UX-Test muss als offen dokumentiert werden – keinesfalls Source-Locks abschwächen oder „alle Geräte kompatibel“ kommunizieren.
