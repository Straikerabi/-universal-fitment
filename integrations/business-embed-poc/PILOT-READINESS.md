# Wave 4: testbare Grenzen und offene Pilot-Freigaben

Issue #64, Basis `52f056664ddbf1a6c263a3d86feac3ee0128c054`, Branch `work/business-pilot-readiness-wave4`, PR-Ziel `integration/dual-platform-owner-review`. Sämtliche Änderungen bleiben in `integrations/business-embed-poc/`. Keine fremde Engine, keine Consumer-/Katalog-/Workflow-Änderung und keine Veröffentlichung eines Dienstes.

## Lokaler Rundgang — 5 Minuten

1. `node integrations/business-embed-poc/serve.mjs`, `http://127.0.0.1:4175/` öffnen. Fiktiven Händler und Mobilansicht auswählen. Der Tenantwechsel ist absichtlich keine Authentifizierung.
2. Exakten Testfall prüfen, Herkunft öffnen. „Im Testbeleg passend“ ist eine synthetische Demonstration, keine Einbau-/Kaufentscheidung.
3. Revision auf „fehlt“ stellen: alte Bestätigung verschwindet sofort; der gemeinsame Kern liefert Unknown. Ausschluss, SKU und unklaren Anschluss vergleichen.
4. Zugriffslabor öffnen: Embed-Leser darf im Konzept `fitment:read`, aber nicht `audit:read`; Reviewer zusätzlich `evidence:read`; Admin zusätzlich eigenes Audit. Fremden Tenant/Feed, fehlenden Scope, abgelaufenen Token und produktive Nutzung testen.
5. Acht erlaubte Zugriffe je Tenant/Minute, der neunte wird im Labor begrenzt. Zweiter Tenant hat einen eigenen Bucket. „Lokalen Testzustand löschen“ setzt Audit/Limits/Auswahl zurück. Diese Testquote ist kein späteres SaaS-Angebot.

## Der gemeinsame Vertrag

Der vorhandene Owner-Builder erzeugt synthetische FitmentRequest 1.0.0. `shared-adapter.mjs` ruft ausschließlich die vorhandene Owner-Brücke auf; diese benutzt `assessFitment` aus #48. Request-/Response-Validatoren bleiben im gemeinsamen Kern. Kein neuer Fitmentalgorithmus oder technische Regel in dieser Demo.

Adapterprüfung: exaktes Testfall-/Geräte-/Teil-Binding, Private-Test-/Synthetic-Modus, Schema-/Daten-/Asset-/Part-/Assembly-Version, gleiche Mandanten-/Fallprojektion, bekannte synthetische Quellen/Belege. Antwort darf `testOnly` nicht verlieren; `canConfirmFitment` und `canConfirmPurchase` müssen false bleiben. UI darf eine Engine-Antwort höchstens konservativ Unknown darstellen, niemals aufwerten. Deutsche Texte übersetzen nur Reason-Codes, die Codes bleiben sichtbar. `demo-view/1` bleibt ein UI-Format, kein zusätzlicher Fitment-Vertrag.

Die vier gemeinsamen Quellmodule sind mit Basis-Commit und SHA256 in `shared-source-lock.json` festgehalten und werden lesend geprüft. Runtime lädt diese lokalen Module ohne Internet; der Verifier verweigert unbemerkte Veränderungen. Dies ist ein Review-Lock, keine signierte Supply-Chain. Eine spätere Änderung des gemeinsamen Kerns braucht bewusst neuen Lock, Konformitätstests und Owner-Review. Der gemeinsame Kern/Owner-Brücke werden hier nicht geändert.

## Konkretes Zugriffsmodell — begrenzter Konzepttest

`access-lab.mjs` prüft bei jedem Laborzugriff: Tenant → Rolle/Aktion → Token-Tenant/Scope/Expiry/Revocation → Private-Test-Nutzung → Feed-Scope/Rechte/Expiry/Revocation → Tenantbudget. Unbekannt bedeutet gesperrt. Rechte sind unabhängig von technischer Passung: ein gültiger Mandant oder Händler-SKU bestätigt kein Teil.

| Objekt | Heute testbar | Vor Produktivfreigabe |
| --- | --- | --- |
| Principal | frei erzeugte synthetische Testrolle | serverseitig verifizierte Identität; kein Browser-Tenant als Autorität |
| Token | Objekt mit Scopes, Tenant, Ablauf und Widerruf | signierter/opaque Token, sichere Ausgabe, serverseitige Prüfung, Rotation, Revocation, Audiences |
| Feed-Grant | nur synthetic/private-test; public vs tenant Marker | erlaubte Felder/Purpose/Region/Vertrag/Version je rechtmäßigem Feed; private Daten aus öffentlichen Bundles fernhalten |
| API-Zugriff | reine Funktionen, keine API-Route | gemeinsamer versionierter Vertrag, Auth vor Intake/Read/Projection; kein Secret im Embed |
| Cache | getestete Namespace-Funktion Tenant/Rolle/Grantversion/Vertragsversion/Fall; **kein aktiver Cache** | Berechtigungen vor Cache lesen, Rechtewiderruf invalidiert Cache/Export, eigene Schlüssel für private Datensätze |
| Rate-Limit | fiktive Tenant-Quote im Arbeitsspeicher | serverseitige Tenant-/Token-/globale Budgets, Parallelitäts-/Payloadgrenzen, Retry-After und Denial-Flood-Schutz |
| Audit | minimale bounded Events, rollen-/tenantgefiltertes Lesen | manipulationsgeschützter Auditdienst, definierte Verantwortlichkeit, Frist und Zugriff; kein Produktivnachweis durch UI |

Die Demo-Principals, Rollen und Token-Objekte sind editierbar und keine Credentials. Clientdaten enthalten beide Testshops. Reale Datenbankisolation, Authentifizierung, Verschlüsselung, Secretmanagement und Backend sind nicht implementiert. Same-origin-iframe mit allow-scripts/allow-same-origin ist keine Sicherheitsgrenze gegen bösartigen Embed-Code. Vor fremder Shopeinbettung eigener Widget-Origin, restriktive Herkunftsfreigabe und Securityreview; die lokale CSP erlaubt ausschließlich eigene Dateien/Frames und blockiert connect-src, Formulare und externe Ressourcen.

## Datenminimierung und Audit

Keine Kontakte, Freitextformulare, Bilder, Seriennummern, Cookies, persistenten Speicher, HTTP-Anfragelogs oder Analytics. Suche/Varianten bleiben im Arbeitsspeicher. Das Audit nimmt ausschließlich `sequence, at, tenantId, role, action, decision` auf, nie Request, Suchtext, Token oder Beleginhalt. Maximal 50 Events; nach 5 Minuten werden alte Einträge **beim nächsten Zugriff** verworfen, bei Neuladen/Löschen komplett. Ohne Aktivität ist dies keine zeitgenaue Heap-Löschung. Events sind synthetische Laboraktivität, kein Händlernutzen und keine Produktionsüberwachung. Audit des anderen Tenants und Zugriff als Leser/Reviewer sind verweigert.

Vor Pilot Datenzwecke/Rechtsgrundlage, Verantwortlicher/Auftragsverarbeiter, Information und Lösch-/Auskunftsweg klären; ggf. Auftragsverarbeitung und Unterauftragnehmer prüfen. DSGVO-Prüfpunkte: Art. 5 Datenminimierung/Frist, Art. 25 Gestaltung, Art. 28 Auftragsverarbeitung, Art. 32 Sicherheit. [Konsolidierte Primärquelle EUR-Lex](https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX%3A02016R0679-20160504), geprüft 09.10.2026. Dies ist eine Prüfliste, keine rechtliche Konformitätszusage.

## Audit-/API-/Preisoptionen und Freigabe

Keine Live-API, Feed-Verbindung, Zahlung, reale Europreise oder SLA. Die [Architekturoptionen](ARCHITECTURE.md) und [Kosten-/Discovery-Experimente](DISCOVERY.md) sind Planungsunterlagen; Kundennutzen wird erst mit freigegebenen Beobachtungen gemessen. Technische Passung wird unabhängig von Preis, Rolle und Provision bewertet; Händlerangebote bleiben getrennt und künftig Werbeplatzierung klar kennzeichnen.

| Gate für echten Pilot | Heute |
| --- | --- |
| Synthetische Demo reproduzierbar, Konformität/Negativ-/Stale-Tests grün | technisch geprüft; keine Produktivfreigabe |
| Echte Probleme in 5–8 autorisierten Gesprächen, messbare Baseline | ausstehend, 0 Interviews |
| Fachlich korrekte reale Belegfälle und Nutzungsrechte | nicht Gegenstand synthetischer Demo, ausstehend |
| Server-IAM, Tenantdaten, Scopes, Logs, Sicherheit und Datenschutz geprüft | Konzepttest vorhanden, produktiv ausstehend |
| Gewerbe-/Rechts-/Daten-/Teilnehmerfreigabe und tragfähige Kosten | ausstehend |

**Entscheidung: kein Go für einen echten Pilot.** Engineering-Review ist möglich; Bedarf, Zahlungsbereitschaft und Einsparungen nicht bewiesen. Keine Kontakte, Verträge, Angebote, Produktiv-Tokens oder API-Verbindungen angelegt. Kein main-Merge oder Deployment.
