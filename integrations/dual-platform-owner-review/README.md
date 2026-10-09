# Dual-platform owner review — 09.10.2026

**Isolierter Integrationsstand:** Branch `integration/dual-platform-owner-review`; nicht main, kein Deployment, keine zahlenden Kunden und kein gesetzlich freigegebenes öffentliches Angebot.

## Was dieser Branch tatsächlich macht

- Enthält durch unveränderte Git-Binärblobs/Dateien die **drei vollständig isolierten Arbeitsergebnisse** #56 (gemeinsame Fitment-Engine), #57 (Consumer-Reparaturmission) und #55 (synthetische B2B-Embed-Demo). Branches/PRs der Works bleiben unverändert.
- Fügt `bridge.mjs` als **synthetischen Konformitäts-Testadapter** hinzu. Der Adapter wertet **immer die eine** Funktion `assessFitment` aus #56 aus und überträgt deren Status in zwei ausdrücklich als Test gekennzeichnete Darstellungsformate. Er unterstellt weder Produktrechten noch Händlerberechtigungen.
- `bridge.test.mjs` prüft gemeinsames Mapping bei bestätigtem **synthetischem** Testfall, ausdrücklichem Ausschluss, abweichendem Anschluss, unbekannter Revision, falscher OEM-Nummer, fehlender Quelle, unbekannter Nutzungslizenz, anderer Region, überholter Schema-Version, Datenmanipulation und Tenant-Kontext.
- Neue GitHub-Action `Dual-platform owner conformance` führt Node-Tests beider UIs, Engine-/Source-/Coverage-Validierung und den neuen Bridge-Test im **gleichen Checkout** aus. Der Workflow hat ausschließlich Lese-Rechte, keinerlei Deploy-/Secret-/Publish-Aktion.
- **Die beiden lokal gestarteten UI-Demos verwenden jetzt für alle synthetischen Prüffälle denselben v1-Kern:** `ui-fixtures.mjs` liefert versionierte `FitmentRequest`-Testdaten; der Consumer-Ablauf und die B2B-Widget-Ansicht benutzen `bridge.mjs` und die originale `assessFitment`-Funktion. Die alten Fixture-Module bleiben nur als Auswahl-/Darstellungsdaten und für unveränderte Originaltests erhalten – sie dürfen die Entscheidung nicht überschreiben.
- Die zwei lokalen Server liefern ausschließlich fünf fest erlaubte, gleiche-Origin-ES-Module aus den Schwesterverzeichnissen aus; Pfad-/Host-/Methodenbegrenzungen bleiben bestehen. Keine öffentliche HTTP-Fitment-API.
- Haupt-App `site/` wird **nicht verändert**. Reale Katalogeinträge bleiben ohne positive v1-Passungsentscheidung; hier ist nur der synthetische Demo-Modus tatsächlich verkabelt.

## Testen in einem Checkout

```sh
node --test integrations/dual-platform-owner-review/bridge.test.mjs
node --test integrations/fitment-engine-v1-poc/contract.test.mjs
npm test --prefix integrations/consumer-repair-mission-poc
find integrations/consumer-repair-mission-poc -type f -name '*.mjs' -print0 | xargs -0 -n1 node --check # Worker check.mjs gehört ausschließlich auf den Originalbranch
node --test integrations/business-embed-poc/tests.mjs
node integrations/business-embed-poc/verify.mjs
npm ci --prefix integrations/auth-sdk --ignore-scripts
node integrations/fitment-engine-v1-poc/verify.mjs --check --app
```

Zusätzlich führt die neue Owner-CI die Browserregressionen **beider lokal ausgeführten Benutzeroberflächen** mit Playwright/Chromium aus. Das ist kein Test mit physischem iPhone, Safari/WebKit oder externen Testpersonen. Node 22+ benötigt. Browser-Tests benötigen Playwright; im CI wird es nur temporär installiert, ohne neues Laufzeit-Abo oder Änderungen am Repository-Lockfile.

## Die beiden vorhandenen privaten Demo-UIs separat starten

- Consumer: `npm start --prefix integrations/consumer-repair-mission-poc` → Loopback `http://127.0.0.1:4179/`.
- Business: `node integrations/business-embed-poc/serve.mjs` → Loopback `http://127.0.0.1:4175/`.
- Beide Loopback-Server **sind absichtlich nicht direkt über Codespaces-Portfreigaben öffentlich erreichbar**. Nicht eigenmächtig Ports oder Hostheader-Schutz lockern. Eine private externe iPhone-Testvorschau benötigt eine gesonderte, geprüfte Lösung.

## Sicherheitsgrenzen

1. **Alle positiven/negativen Demo-Entscheidungen sind ausdrücklich erfunden und nur für Tests**; `canConfirmPurchase` und `canConfirmFitment` sind für diese Daten false.
2. Der Hauptkatalog enthält laut #56 weiterhin **0 nach dem neuen Vertrag vollständig bestätigte reale Passungen und 0 berechtigte kaufbare Angebote**. Die vielen bisherigen Hersteller-Listings sind *keine* finale Installationsfreigabe.
3. `demo-view/1` und `consumer-ui-fixture/1` bleiben ausschließlich **Anzeige-/Alt-Testformate**. Der technische Status der laufenden synthetischen Demos stammt bereits aus `FitmentResponse 1.0.0`. Keine echte Quelle oder Teilefreigabe durch Umbenennen einer Dummy-Antwort.
4. Browserinterner Mandantenwechsel ist keine echte Mandantenisolierung; Security-/SaaS-Anforderungen benötigen Backend-IAM, Berechtigungen, Audit, Data Protection Impact und eigene Tests.
5. **Wave-3-PRs #51–#53 sind hier NICHT enthalten**. Ihre Kombination wurde unter **Issue #54 / Draft-PR #60** am isolierten CI-Scratch-Katalog (1.115 Modelle/1.961 Artikel) erfolgreich getestet. Dieser Consumer-Katalogsnapshot akzeptiert aber noch ausschließlich den alten v1.29.0-Checkpoint. Spätere Migration braucht aktualisierte geprüfte Quellbytes/Goldens, nicht ein Umgehen des Hash-Schutzes.
6. Kein Affiliate, keine Dritt-OEM-Medienfreigabe, keine öffentlichen / geheimen Kundendaten, kein Marketplace oder Live-Preis; Rechtliches Gate #42 / PR #43 bleibt verbindlich.

## Nächste Owner-Arbeit / echte Akzeptanz

- Ergebnis der kombinierten CI-Verifikation überprüfen und bei Abweichung im **isolierten Integrationsbranch** korrigieren.
- Die synthetischen UI-Anbindungen sind implementiert. Nach Browser-CI den gemeinsamen tatsächlichen Lauf einschließlich unbekannter Revision, falschem Teil, Ausführung und Tenantwechsel abnehmen; echte Katalogteile weiter unbestätigt.
- #54 den Wave-3-Datenstand migrieren und Coverage neu erzeugen; keine voreilige finale Modell-/Artikelzahl.
- Reale iPhone-/Safari-Abnahme, Blindtest mit mindestens fünf externen Nutzern, Händler-Discovery-Gespräche; nicht behaupten, sie hätten bereits stattgefunden.
- Datenrechte und Legal Release (inkl. Rechte/Impressum/Hosting) separat abnehmen. Erst danach überhaupt über produktive Freigabe sprechen.

Verweise: [#55](https://github.com/Straikerabi/-universal-fitment/pull/55), [#56](https://github.com/Straikerabi/-universal-fitment/pull/56), [#57](https://github.com/Straikerabi/-universal-fitment/pull/57), [Issue #58](https://github.com/Straikerabi/-universal-fitment/issues/58), [Wave 3 #54](https://github.com/Straikerabi/-universal-fitment/issues/54).
