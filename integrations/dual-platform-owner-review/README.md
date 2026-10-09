# Dual-platform owner review — 09.10.2026

**Isolierter Integrationsstand:** Branch `integration/dual-platform-owner-review`; nicht main, kein Deployment, keine zahlenden Kunden und kein gesetzlich freigegebenes öffentliches Angebot.

## Was dieser Branch tatsächlich macht

- Enthält durch unveränderte Git-Binärblobs/Dateien die **drei vollständig isolierten Arbeitsergebnisse** #56 (gemeinsame Fitment-Engine), #57 (Consumer-Reparaturmission) und #55 (synthetische B2B-Embed-Demo). Branches/PRs der Works bleiben unverändert.
- Fügt `bridge.mjs` als **synthetischen Konformitäts-Testadapter** hinzu. Der Adapter wertet **immer die eine** Funktion `assessFitment` aus #56 aus und überträgt deren Status in zwei ausdrücklich als Test gekennzeichnete Darstellungsformate. Er unterstellt weder Produktrechten noch Händlerberechtigungen.
- `bridge.test.mjs` prüft gemeinsames Mapping bei bestätigtem **synthetischem** Testfall, ausdrücklichem Ausschluss, abweichendem Anschluss, unbekannter Revision, falscher OEM-Nummer, fehlender Quelle, unbekannter Nutzungslizenz, anderer Region, überholter Schema-Version, Datenmanipulation und Tenant-Kontext.
- Neue GitHub-Action `Dual-platform owner conformance` führt Node-Tests beider UIs, Engine-/Source-/Coverage-Validierung und den neuen Bridge-Test im **gleichen Checkout** aus. Der Workflow hat ausschließlich Lese-Rechte, keinerlei Deploy-/Secret-/Publish-Aktion.
- Haupt-App `site/` wird dadurch **nicht verändert**. Die neue gemeinsame Engine ist **noch nicht an die vollständigen echten UI-Abläufe** angebunden; die bestehenden Demos benutzen weiterhin ihre eigenen isolierten Darstellungsszenen. Der Bridge-Test ist der erste Cross-Produkt-Kontrollpunkt, kein abgeschlossener Produktrelease.

## Testen in einem Checkout

```sh
node --test integrations/dual-platform-owner-review/bridge.test.mjs
node --test integrations/fitment-engine-v1-poc/contract.test.mjs
npm test --prefix integrations/consumer-repair-mission-poc
npm run check --prefix integrations/consumer-repair-mission-poc
node --test integrations/business-embed-poc/tests.mjs
node integrations/business-embed-poc/verify.mjs
npm ci --prefix integrations/auth-sdk --ignore-scripts
node integrations/fitment-engine-v1-poc/verify.mjs --check --app
```

Die Browser-/responsive Testberichte der UI-Arbeiter wurden **getrennt** erzeugt; dieser Workflow führt keine eigenen WebKit-/echten iPhone-Prüfungen durch. Node 22+ benötigt.

## Die beiden vorhandenen privaten Demo-UIs separat starten

- Consumer: `npm start --prefix integrations/consumer-repair-mission-poc` → Loopback `http://127.0.0.1:4179/`.
- Business: `node integrations/business-embed-poc/serve.mjs` → Loopback `http://127.0.0.1:4175/`.
- Beide Loopback-Server **sind absichtlich nicht direkt über Codespaces-Portfreigaben öffentlich erreichbar**. Nicht eigenmächtig Ports oder Hostheader-Schutz lockern. Eine private externe iPhone-Testvorschau benötigt eine gesonderte, geprüfte Lösung.

## Sicherheitsgrenzen

1. **Alle positiven/negativen Demo-Entscheidungen sind ausdrücklich erfunden und nur für Tests**; `canConfirmPurchase` und `canConfirmFitment` sind für diese Daten false.
2. Der Hauptkatalog enthält laut #56 weiterhin **0 nach dem neuen Vertrag vollständig bestätigte reale Passungen und 0 berechtigte kaufbare Angebote**. Die vielen bisherigen Hersteller-Listings sind *keine* finale Installationsfreigabe.
3. Bestehende `demo-view/1`- und `consumer-ui-fixture/1`-Adapter sind **keine** Alternative zu `FitmentResponse 1.0.0`. UI-Produktintegration darf später ausschließlich nach geprüftem Schema/Quellenrecht erfolgen; Dummy-Belege niemals auf echte Marken umetikettieren.
4. Browserinterner Mandantenwechsel ist keine echte Mandantenisolierung; Security-/SaaS-Anforderungen benötigen Backend-IAM, Berechtigungen, Audit, Data Protection Impact und eigene Tests.
5. **Wave-3-PRs #51–#53 sind NICHT enthalten**. Ihre kombinierte Migration ist explizit separate **Issue #54**. Der Consumer-Katalogsnapshot akzeptiert nur den alten Source-Checkpoint. Nach #54 neue Quellbytes und Goldens bewusst prüfen, nicht Hash-Schutz umgehen.
6. Kein Affiliate, keine Dritt-OEM-Medienfreigabe, keine öffentlichen / geheimen Kundendaten, kein Marketplace oder Live-Preis; Rechtliches Gate #42 / PR #43 bleibt verbindlich.

## Nächste Owner-Arbeit / echte Akzeptanz

- Ergebnis der kombinierten CI-Verifikation überprüfen und bei Abweichung im **isolierten Integrationsbranch** korrigieren.
- B2C- und B2B-UI auf denselben Originalvertrag über **separat geprüfte Presentation-Adapter** wirklich umbauen; nur synthetische Testfälle dürfen eine positive Demo zeigen. Echte Katalogteile weiter unbestätigt.
- #54 den Wave-3-Datenstand migrieren und Coverage neu erzeugen; keine voreilige finale Modell-/Artikelzahl.
- Reale iPhone-/Safari-Abnahme, Blindtest mit mindestens fünf externen Nutzern, Händler-Discovery-Gespräche; nicht behaupten, sie hätten bereits stattgefunden.
- Datenrechte und Legal Release (inkl. Rechte/Impressum/Hosting) separat abnehmen. Erst danach überhaupt über produktive Freigabe sprechen.

Verweise: [#55](https://github.com/Straikerabi/-universal-fitment/pull/55), [#56](https://github.com/Straikerabi/-universal-fitment/pull/56), [#57](https://github.com/Straikerabi/-universal-fitment/pull/57), [Issue #58](https://github.com/Straikerabi/-universal-fitment/issues/58), [Wave 3 #54](https://github.com/Straikerabi/-universal-fitment/issues/54).
