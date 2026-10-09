# Shared FitmentResponse v1 — Issue #48

Isolierter Offline-Prototyp für **denselben** B2C-/B2B-Kern. Branch `work/fitment-engine-v1-poc`, Basis main `71f7826ba936a1f3830c8b2a67e8085a9cfe234e`, Source v1.29.0. Keine Änderungen an Consumer-/Business-UI, Katalog, Checkpoint, globalem Paket, Version, Deployment oder bestehenden Workflows. Ein eigener **nur lesender Testworkflow** führt ausschließlich diese Prüfungen aus; er besitzt keine Schreib-/Pages-/Secret-Berechtigungen und publiziert keine Artefakte.

## Reproduktion

```sh
npm ci --prefix integrations/auth-sdk --ignore-scripts
node integrations/fitment-engine-v1-poc/coverage.mjs
node integrations/fitment-engine-v1-poc/verify.mjs --check --app
```

Keine Daten-/Herstellerabfrage nötig. Der unveränderte Restorer prüft den gepinnten Archivhash und alle 136 Source-Dateien; Reports nutzen jeweils frische temporäre Restores. Der Verifier baut ebenfalls ausschließlich in einem temporären Verzeichnis, führt alle 40 bestehenden App-Testgruppen und Syntaxchecks aus und verifiziert zehn byte-reproduzierbare Bundles. Keine Installation/Änderung in anderen Worktrees. Die abgeschlossene Prüfung steht in `validation.json`. `--check` überschreibt keine Goldens.

`coverage.md` und `baseline-report.json` sind der kleine versionierte Report. `coverage.json` enthält nach obigem ersten Befehl **alle 1093 Modellrows, jede gezählte Hersteller-Listing-Kante mit URLs, Datum, Varianten-/Artikelreferenz und sämtliche Dateihashes**. Diese ausführliche private Testausgabe bleibt git-ignoriert; ihr vollständiger SHA256 ist im Golden gepinnt. Zwei voneinander unabhängige Restores müssen exakt denselben vollständigen Report erzeugen. Änderungen an Source oder Zählregeln scheitern am Golden und erfordern explizite Review.

## Version und Aufrufvertrag für Work B/C

```js
import {assessFitment, validateRequest, validateResponse}
  from './integrations/fitment-engine-v1-poc/contract.mjs';
const response = assessFitment(trustedNormalizedRequest);
```

Keine URL, kein HTTP-Handler, Tenant-System oder zweite Engine. **Nicht UI-Nutzereingaben direkt als Quellenfreigabe übernehmen.** Work #49/#50 können später diese reine Funktion importieren, dürfen aber keine konkurrierende Kompatibilitätsentscheidung bauen. Vor der UI-Anbindung benötigt jeder reale Fall eine geprüfte normalisierte Belegkette. Nicht Legacy-`confidence`, `manufacturer_listed`, `manufacturer-verified` oder bloße Artikelmitgliedschaft in `evidenced_compatible` umdeuten.

Die vollständig geschlossenen JSON-Schemas in `contract.schema.json` verwenden Draft 2020-12; `$defs.FitmentRequest` und `$defs.FitmentResponse` sind die Integrationspunkte. Das Root-Schema beschreibt den Request. Der Runtime-Validator interpretiert genau dieselben Schemaobjekte, ohne neue Dependencies. Unterstützt exakt `schemaVersion: "1.0.0"`; unbekannte Felder und andere Versionen ergeben `unconfirmed / INVALID_CONTRACT`. Daten-, Engine- und Policy-Versionen bleiben getrennt. Eine Schemaänderung erhält eine neue Version; v1 wird nicht still in-place semantisch erweitert. Ein neuer Katalogstand bekommt eine neue `dataVersion` und neue Coverage-Goldens, keine still übernommenen Wave-3-Zahlen.

| Ebene | Pflichtinformationen | Verhalten bei fehlender Angabe |
|---|---|---|
| Asset | stabile ID, Kategorie, Hersteller, Katalogmodell | ungültiger Vertrag / keine Freigabe |
| Variante | typisierte Kennungen mit Herausgeber, Markt, Revision und Seriennummer nullable | unbekannt bleibt unbekannt |
| Baugruppe | eigene stabile ID, Bindung jedes Claims und Anschlusses | falsche Bindung zählt nicht als Nachweis |
| Teil | ID, Hersteller, physischer Typ, exakt typisierte Kennungen | SKU/EAN/Dokument bestätigt kein OEM-Teil |
| Claim | Asset/Teil/Baugruppe, OEM-Kennung, konkrete Variantenscope, compatible/incompatible, Quellen-IDs | kein Claim → unconfirmed |
| Quelle | Publisher, HTTPS-URL, Datum, SHA256, Locator, Prüfstatus, Nutzungsrechte/-referenz | Quelle/Rechte unverified → unconfirmed |
| Einbau/Anschluss | belegte Prüfung plus einzelne Soll-/Istwerte mit getrennten Einheiten und Quellen | keine Prüfung oder unbekannter Wert → unconfirmed |
| Policy | versioniertes, vertrauenswürdig festgelegtes Risiko | unbekannt, review-required, prohibited und nicht unterstützte Kategorien gesperrt |

`manufacturer-model`, `device-sku`, `material-number`, `product-type`, `pnc`, `e-number` dürfen eine Gerätevariante bezeichnen. `material-number`, `manufacturer-article`, `manufacturer-designation` sind getrennte Hersteller-Teileidentitäten; eine **Designation ist keine erfundene numerische OEM-Nummer**. `merchant-sku`, `supplier-article`, `ean` werden nicht zu OEM- oder Gerätevariantenkennungen. Exact Matching erhält führende Nullen, /xx-, Länder-, Akku-/Generationssuffixe, Groß-/Kleinschreibung und Herausgeber. Ein normalisierender Adapter muss Aliasgleichheit separat belegen; die Engine rät nicht.

`revision.mode: unknown` verweigert Freigabe. `exact` muss dem beobachteten Wert entsprechen. `any` ist nur zulässig als **explizite, geprüfte Herstellerbehauptung für alle Revisionen**, niemals als Default. Dasselbe gilt für `serial.mode: any`; `unknown` bleibt gesperrt. `range` unterstützt ausschließlich dokumentierte numerische inklusive Intervalle (BigInt), kein geratenes herstellerspezifisches Serienordnungsmodell. Markt muss auf beiden Seiten bekannt und gleich sein. Nicht übereinstimmender Scope bedeutet **unconfirmed**, nicht automatisch nachgewiesen unpassend.

`interfaces.reviewSourceIds` muss eine überprüfte Installation/Anschlussprüfung belegen, selbst bei leerer Anforderungsliste. Ohne sie gilt leer **nicht** als „keine Bedingungen“. Jede Anforderung bindet eine Baugruppe und einen Parameter, `expected`, `actual`, `unit`, `actualUnit`, `sourceIds`. `null` heißt unbekannt. Unterschiedliche Einheiten ergeben unconfirmed; es gibt keine automatische Umrechnung oder technische Spezifikationsinferenz. Gleiche dokumentierte Einheiten, geprüfte Werte, aber abweichende Werte ergeben evidenced_incompatible. Typen sind signifikant (`20` ≠ `"20"`). Parameter können später Gewindeform/-steigung, Steckergeometrie, Sensoranschluss, Dichtfläche oder Einbauraum ausdrücken, **ohne jetzt echte Maße einzutragen**.

## Ergebnisse und Rechte

| Status | Deutsche Bedeutung | Bestätigen? |
|---|---|---|
| `evidenced_compatible` | belegt passend für den gesamten geprüften Scope | `canConfirmFitment` nur für realen, berechtigten Datensatz |
| `unconfirmed` | unbestätigt / konkreter Prüfschritt fehlt | nein |
| `evidenced_incompatible` | exakt belegter Ausschluss oder belegter Anschlusskonflikt | nein |

`reasons` und `nextChecks` sind deterministisch sortierte parallele Arrays (gleicher Index); `evidenceIds`, `sourceIds` sowie freigegebene Quell-Metadaten machen die Kette auditierbar. Positiv und negativ zugleich → `EVIDENCE_CONFLICT / unconfirmed`. Fremde Variantenscopes werden nicht als Negativbeweis erfunden. Zurückgezogene/unverifizierte Quellen, doppelte IDs, ungültige Delegation, fehlende Nutzungsrechte und unbekannte Kategorien sperren Bestätigung.

Die Quellen-Domain-Allowlist ist nur eine **Herkunftsprüfung**, keine Lizenz oder Inhaltsverifikation. `manufacturer-linked` verlangt zusätzlich eine geprüfte echte Herstellerquelle, deren Locator ausdrücklich die genaue Service-HTTPS-URL delegiert, einschließlich ihrer eigenen Rechte. Ein erreichbarer Drittshop oder grade A allein reicht nicht. Datum/Digest/Locator kennzeichnen geprüfte Beobachtungen; die pure Funktion kann **nicht** prüfen, ob ein Aufrufer einen Digest oder Status erfunden hat. Sie ist ausschließlich für vom zentralen Owner geprüfte, versionierte Manifeste vorgesehen. Quelle/Katalog/Policy müssen vor jeder späteren öffentlichen Anbindung außerhalb untrusted Client-JSON autorisiert werden; dieser PoC bietet keine Authentifizierung oder OEM-Dateningestion.

`rights.privateTest`, `rights.link`, `rights.reuse` sind getrennt (`granted / unknown / denied`) und benötigen eine Belegreferenz. `source-linked` aus dem alten Katalog erzeugt **keine** Freigabe. B2C und B2B benötigen für verwendete Claims jeweils dieselbe explizite reuse-Freigabe; bei gleichem zugelassenem Kontext sind Entscheidungen identisch. URLs/Locators werden nur bei link-Freigabe ausgegeben, Referenz-IDs bleiben für das interne Audit. `rights.reuseAllowed` sagt nur, ob alle verwendeten Quellen diese Nutzung erlauben. Keine Rohdokumente, Lizenzbilder, Secrets, privaten OEM-Feeds oder Händlerdaten werden importiert.

**`canConfirmPurchase` bleibt immer false.** Technische Passung ersetzt weder genehmigten Händlerfeed, aktuelle Verfügbarkeit noch Kauf-/Installations-/Sicherheitsberatung. Die Low-Risk-Policy wird vom vertrauenswürdigen Owner festgelegt, nicht vom Nutzer. Andere Kategorien sind default deny; Automotive-/Hochrisikoanwendungen benötigen gesonderte Kategorie- und Fachfreigaben (#45).

## Belege und Testgrenzen

Der reale Miele-Fall Boost CX1 Parquet PowerLine, Geräte-Material **11602400**, SBD 365-3 **11805640**, stammt unverändert aus dem gepinnten Herstellerzubehör-Record:

- https://www.miele.de/product/11602400/bodenstaubsauger-ohne-beutel-boost-cx1-parquet-powerline-lotosweiss
- https://www.miele.de/product/11805640/allteq-bodenduese-sbd-365-3

Die Baseline zeichnet ihn als Zubehörlisting am 2026-10-06 auf; **kein neuer Live-Abruf oder behauptete aktuelle Freigabe**. Im v1-Beispiel bleiben Revision/Serienbereich, Quellen-Digest, Nutzungsrecht und Anschlüsse unbekannt; Ergebnis unconfirmed. Jede im Coverage-JSON gezählte Kante besitzt ihre eigene vorhandene Quellenkette, zählt aber nicht automatisch als bestätigte Passung.

Positive Funktions- und nachgewiesene Anschluss-Negativfälle verwenden ausschließlich `Synthetic Fixture`, `.invalid`, `TEST-*` und sichtbare `datasetKind: synthetic / testOnly: true`. Die synthetischen Zahlen sind keine echten Gewindemaße. Synthetische Tests können weder reales `canConfirmFitment` noch B2C-/B2B-/Kauffreigabe erzeugen. Kein echter Ausschluss wird aus fehlenden Daten konstruiert. Das ist ein geprüfter Vertragskern, **keine Behauptung 8021 neu unabhängig verifizierter Installationen**.

Strenger OEM-Abgleich: 337 Siemens-Quellbehauptungen mit Referenzen wie `VZ46001(00)` gegenüber Artikel-Identifier `VZ46001` werden nicht als exakt identifizierte Nachweise gezählt. Bei 282 Modell/Artikel-Paaren existiert daneben ein anderer exakt identifizierter Quellenclaim; 55 Paare verlieren dadurch die Aufnahme in die strengere Hersteller-Kantenmetrik. Der Report entfernt keine Katalogbeziehungen und behauptet keine Inkompatibilität; ohne zusätzliche belegte Aliasfreigabe bleibt der Suffix offen. `exactOemReferenceExclusions` dokumentiert alle 337 offenen Referenzen im vollständigen JSON. Zusammen mit Familien-/Aftermarket-Inferenz und dem Hoover-Drittservice ohne normalisierte Delegationskette bleiben 622 von 8643 vorhandenen Zuordnungen außerhalb der strengeren 8021-Listing-Metrik.

## Wave-3-Handoff nur gelesen

| PR | Gelesener HEAD | Schema-Auswirkung, noch nicht integriert |
|---|---|---|
| #51 | `2526e243eaf8425b91c8373ef4e5513ff4994a80` | Fotorechte unabhängig von technischer Passung; CC0-Modellbild kein Teile-/Variantenbeweis |
| #52 | `da0dcae52c2a0abc2fcd90df7636289a890f5e04` | 22 zusätzliche Profile, darunter historische Namen ohne Typenschildcode; keine neue Passung |
| #53 | `443489b39f57be28239dd2f1cafd637329eb0d4e` | 21 Artikel / 36 bedingte Beziehungen; exakte Referenz und OEM-Typ erhalten, variant_check_required bleibt unbestätigt |

Die zentrale unabhängige Integration übernimmt **Issue #54**. Keine PR-Datei verändert, kein Wave-3-Importer ausgeführt, kein Rebase. 1115 Modelleinträge / 1961 Artikel / rechnerisch 463 ohne Teil (447+22−6) sind lediglich spätere Projektionswerte; erst gemeinsame Tests dürfen sie bestätigen. Neue Quellen-/Varianten-/Rechtebelege werden durch #54 nach expliziter Review in einen neuen v1-Datenstand normalisiert. Consumer-/Business-UI-Anbindung erfolgt ausschließlich bei deren Ownern.

Draft-PR zur technischen Begutachtung. **Kein main-Merge, kein Deployment, keine öffentliche API.**
