# Universal Fitment Business — Wave-4-Pilotvorbereitung

Issue [#64](https://github.com/Straikerabi/-universal-fitment/issues/64), Branch `work/business-pilot-readiness-wave4`, Basis `52f056664ddbf1a6c263a3d86feac3ee0128c054`, Draft-PR gegen `integration/dual-platform-owner-review`. Scope nur dieser Ordner. Keine Änderungen an Consumer, Engine, Katalog, Workflow oder Release. Weiterentwicklung des lokalen #50-Labors, keine echte SaaS-/OEM-Kooperation.

## Lokal starten

Node.js 22+; keine Installation und keine externen Dienste erforderlich:

```sh
node integrations/business-embed-poc/serve.mjs
```

Öffnen: **http://127.0.0.1:4175/**. Bei belegtem Port `UF_BUSINESS_PORT=4176` setzen. Loopback-only, absichtlich keine externen Host-Header oder localhost-Namensfreigabe. Stoppen mit Ctrl+C. Kein öffentliches Hosting, Tunnel, Deployment oder echter Shopanschluss.

Zwei erfundene Händler, White-Label-Stile, Desktop/Mobil, sechs synthetische Fälle, Variantenangabe und Herkunft. Testgerät → Variante → Belegantwort, getrennt von synthetischer Händler-SKU. Exakter Testfall, fehlende Revision, Ausschluss, SKU/OEM-Konflikt, unbekannter Anschluss, mandantengebundener Testbeleg. Deutsche Erklärungen behalten gemeinsame Reason-Codes. Nie reale Einbau-/Kaufbestätigung, Preise, Bestand oder Kauflinks.

Im **Zugriffslabor** lassen sich Rolle/Scope, Fremdmandant, Fremdfeed, Ablauf, fehlender Scope und Produktivnutzung testen. Acht erlaubte Zugriffe pro Demo-Tenant/Minute, neunter begrenzt; rein fiktive Testquote, keine Preis-/API-Zusage. Admin liest nur eigene minimale Laborevents. Höchstens 50 Events, ältere als fünf Minuten bei nächstem Zugriff entfernt; keine zeitgenaue Heap-Löschung. Neuladen oder Löschen verwirft alle Events und Budgets. Frei wählbare Rollen/Tenants sind ausdrücklich **kein** echtes IAM oder Geheimnisschutz.

Keine Cookies, Accounts, persistenten Speicher, externen Fonts/Bilder/Analytics, Uploads oder Anfrageprotokollierung. Nach initialem lokalen Laden auch ohne Netzwerk bedienbar; Seiten-/iframe-Neuladen benötigt lokalen Server, keine Offline-Reload/PWA-Zusage. Änderungen an Auswahl/Variante/Rolle invalidieren alte Antworten und Auditansichten.

## Gemeinsamer FitmentResponse aus #48

Die Integrationsbasis verbindet bereits beide Oberflächen mit der **einzigen** Engine. `shared-adapter.mjs` verwendet deren vorhandenen Fixture-Builder und Owner-Brücke; Originalvalidatoren prüfen Vertrag 1.0.0. Alle Business-Requests sind synthetic/private-test, `testOnly=true`, `canConfirmFitment=false`, `canConfirmPurchase=false`. Keine zweite Entscheidungsschicht, kein kopierter Kern, keine API-Verbindung. Das UI-Format `demo-view/1` dient nur Darstellung.

Exakte Geräte-/Teile-/Assembly-/Datenversionen, Mandant/Fall, Quellen-/Beleg-IDs und synthetischer Modus werden gebunden; Fremd-/Stale-/Produktivantworten abgewiesen. Auswahlgeneration verhindert verzögerte Bestätigungen nach Kontextwechsel. Der Legacy-`fixtureProvider` bleibt nur als isolierter Adapter-Testdouble, nicht im Runtime-Pfad. Die gelesenen gemeinsamen Module enthalten auch unbenutzte Engine-Testhelfer; Business ruft ausschließlich den synthetischen Builder auf, keine realen Katalogfälle/URLs.

`shared-source-lock.json` dokumentiert vier unveränderte Quellhashes der Basis. Owner-Änderungen bewusst neu prüfen/pinnen, nicht Schutzprüfungen umgehen. [Vertrag und Pilotgrenzen](PILOT-READINESS.md).

## Reproduzieren

```sh
node --test integrations/business-embed-poc/tests.mjs integrations/business-embed-poc/pilot.test.mjs
node integrations/business-embed-poc/verify.mjs
```

95 Business-Tests (36 bestehende + 59 neue), zusätzlich 101 gemeinsame Engine-/Owner-Konformitätstests im Verifier: **196 Tests**, Syntax und Auslieferungs-SHA256. Tests brauchen kein Internet, APIs oder Packages. Verifier schreibt nur das eigene `validation.json`. Direkte statische Auslieferung, kein Bundle-/CDN-Build. Gleiche Dateien liefern gleiche Hashes; gemeinsame Dateien sind gelockt. `validation.json` und `browser-evidence.json` enthalten tatsächliche Testläufe, keine CI-Erfolgsbehauptung.

Für die 15 Browserprüfungen mit vorhandenem Playwright und Chromium:

```sh
UF_PLAYWRIGHT_MODULE=/absoluter/pfad/playwright/index.mjs \
UF_CHROMIUM_EXECUTABLE=/absoluter/pfad/chromium \
node integrations/business-embed-poc/browser-tests.mjs
```

Geprüft: iframe/Theme, sechs gemeinsame Fälle, Keyboard, Suchtext/XSS, 320/375/768 px und 200 % Text, Offline-Interaktion, Varianten-/Stale-Invalidierung, Rollen/Scopes/Fremdfeed/Expiry, Budget/Reset, unbekannter Tenant, keine Cookies/Speicherung/externen Anfragen/Seitenfehler. Vier Screenshots visuell geprüft: `desktop.png`, `mobile-confirmed.png`, `mobile-unknown.png`, `mobile-access-lab.png`. Chromium-Emulation, kein physischer iPhone-/Screenreader-Test. CSP bleibt restriktiv; QA verändert Schrift nur testseitig über vorhandenes Stylesheet.

## Dokumentation und ehrliche Abnahme

- [Konkrete Rechte-/Audit-/API-/Datenschutzgrenzen und Pilot-Gates](PILOT-READINESS.md)
- [Architektur und API-/Kostenoptionen](ARCHITECTURE.md)
- [5–8 Interviews, KPI-Messplan und hypothetische Preis-/Tierexperimente](DISCOVERY.md)
- [Owner-Handoff](HANDOFF.md)

**0 Interviews, keine echten Kunden, Verträge, Preise, Einnahmen oder APIs. Kein Go für einen echten Pilot.** Synthetische Testrollen sind keine Anmeldung; Server-IAM, rechtmäßige Feeds, Tenantdatenisolation und produktive Audit-/Securityprüfung bleiben Voraussetzungen. Die Repo-Dateien sind keine vertraulichen Kundendaten; es läuft kein öffentlicher Dienst. Kein main-Merge oder Deployment.
