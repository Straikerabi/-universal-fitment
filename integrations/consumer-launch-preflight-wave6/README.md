# Consumer Launch Preflight — Wave6 / Issue #76

**DRAFT / NICHT VERÖFFENTLICHEN / KEINE RECHTSFREIGABE.** Bezug: #42, #43, PR #73. Quelle: `456c8b8936617f5275d8d1ccfc29601d559cac89`, v1.29.0 und privater Wave5-Consumer. Keine Änderung bestehender Apps, Engine, Kataloge oder produktiver Dienste.

## Lokal, ohne Installation oder Netzwerk

Python 3.11+; im Repository-Root:

```sh
python3 -m unittest discover -s integrations/consumer-launch-preflight-wave6 -v
python3 integrations/consumer-launch-preflight-wave6/preflight.py
python3 integrations/consumer-launch-preflight-wave6/preflight.py --mode affiliate --json
python3 integrations/consumer-launch-preflight-wave6/preflight.py --mode b2b-saas
```

CLI-Exit **2** ist der erwartete Launch-Stopp, kein Testfehler. Ungültige CLI-Argumente stoppen ebenfalls mit 2. `PASS` heißt nur: dieser technische Prüfschritt erfüllt seinen engen Scope. `UNKNOWN` heißt: nicht zugänglich/nicht nachgewiesen oder Beleg braucht menschliche Prüfung. `BLOCKED` heißt: bekannte offene Pflicht/Entscheidung. Jeder anwendbare Nicht-PASS-Check steht in `blockingChecks`; auch P1/P2 werden nicht heimlich übergangen. Priorität bestimmt Bearbeitungsreihenfolge, keine automatische rechtliche Gewichtung.

`overall`, `launchApproved` und `commercialApproved` werden **niemals** freigegeben. Ein grüner CI-Test bestätigt, dass die Sperren funktionieren; er ist kein grüner Launch. Diese Suite ist eine überprüfbare Vorbereitung, kein Produktionsfreigabe-Service. Ein späterer menschlicher Entscheid braucht separate Autorisierung und tatsächliche Belege; er wird hier nicht erzeugt.

## Reproduzierbarkeit und Sicherheit

- Checkpoint ausschließlich im Speicher: SHA-256, Version, 99 Segmente, Archivgröße, 136 Dateien, Größenlimit, keine Duplikate/Traversal/Symlinks. Kein Entpacken, keine Ausführung von App-/Importer-Code.
- 136 Checkpointdateien sowie 26 Consumer-/direkte gemeinsame Abhängigkeitsdateien im `source-lock.json`. Zusätzliches/fehlendes/geändertes Consumer-Quellmaterial stoppt als `UNKNOWN`; kein automatisches Lock-Update. Archiv-SHA ist im Code festgelegt.
- `baseline-report.json` enthält Hashes, Dateipfade, Zeilen und Trefferzahlen, **keine Quelltextauszüge, E-Mails, Tokens, Betreiberangaben oder Storage-Inhalte**. Minifizierte Katalogzeilen haben mehrere Treffer; Zahlen sind keine Anzahl individueller veröffentlichter Assets oder Rechtefreigaben.
- Regex-Inventar liefert Kandidaten, keine vollständige AST-, Browser-, Datenschutz- oder Rechtsanalyse. Vendor-Code und Tests werden nicht als tatsächliche OAuth-Nutzung gezählt; reine Apple-PWA-Metadaten sind kein Apple-Login.
- Kein Netzwerkzugriff, Shell-Aufruf, Cloud-Client, Registrierung, Zahlung, Secret, Upload oder Deployment. Keine automatische Katalog-/Fitmentmigration.

Optional `--receipts /absoluter/lokaler/pfad.json`: ausschließlich erlaubte Check-IDs und opaque SHA-256-Belegreferenzen. Beispiel `{}` bleibt gesperrt. Keine Namen, Anschriften, Steuerdaten, Dokumentinhalte, URLs oder Verträge eintragen. Ein syntaktischer Digest beweist weder echten Inhalt noch Reviewer-Identität; er verschiebt den jeweiligen Check höchstens von BLOCKED zu UNKNOWN, nie PASS. Auch vollständig gefüllte Referenzen autorisieren nichts. Lokale Referenzen nicht committen; `*.local.json` wird ignoriert. Personenbezogene Originalbelege separat in einem vom Owner bestimmten geschützten System verwalten, nicht in GitHub/CI.

## Modusgrenzen

| Modus | Enger Scope | Weiterhin gesperrt |
|---|---|---|
| `free-readonly` | Kostenloser Consumer, keine Kaufabwicklung, keine aktivierten Affiliate-Feeds, kein Kunden-SaaS | Betreiber, Datenschutz, Rechte, Hosting, Storage, Löschung, Betriebs-/Steuerentscheidung, Zielumgebung |
| `affiliate` | Separate geplante Monetarisierung | Zusätzlich Programme/API-/Assetrechte, Werbung/Ranking, Tracking, echte aktuelle Angebote und Preisangaben |
| `b2b-saas` | Separate geplante Händler-/Kundenplattform | Zusätzlich echte Mandanten-/Rollen-/API-Sicherheit, Verträge und Auftragsverarbeitung; synthetische Demo genügt nicht |

Nicht anwendbare Checks sind ausdrücklich markiert; sie genehmigen keine spätere Aktivierung. Eigener Checkout ist nicht unterstützt. Kostenlos bedeutet nicht automatisch privat, DDG-frei oder datenschutzfrei.

Weiter: [Quellenprüfung](SOURCE-AUDIT.md), [Rechts-/Gewerbeentscheidungen](LEGAL-DECISIONS.md), [Hosting-Matrix](HOSTING-MIGRATION.md), [Owner-Abnahmeplan](OWNER-TODO.md).

## Optionaler mobiler Loopback-Audit

`browser-audit.mjs` prüft den unveränderten Consumer mit ausschließlich synthetischer Mission bei 320/375/430px: fehlende Legalnavigation auf allen fünf Schritten wird als BLOCKED festgehalten, dazu Offline-Reload und Grenzen der zwei Löschbuttons. Es schreibt keine Dateien, blockiert externe Page-Requests und ändert keine Appquellen. Vorhandenes Playwright/Chromium vorausgesetzt; kein automatischer Download oder Installationsschritt:

```sh
UF_PLAYWRIGHT_MODULE=/absoluter/pfad/playwright/index.mjs UF_CHROMIUM=/absoluter/pfad/chromium node integrations/consumer-launch-preflight-wave6/browser-audit.mjs
```

Dieser zusätzliche Lauf ist in dieser Arbeitsumgebung **nicht erfolgreich verifiziert** (beschädigtes vorhandenes Browserbinary; alternative lokale Runtime-Aufbereitung scheiterte an `chown /tmp/fonts`). Syntaxcheck bestand. Keine Umgehung der Runtime-Berechtigung, keine als bestanden ausgegebenen Browserresultate. Er ist nicht Teil des offline CI-Testnachweises. Physisches iPhone/Safari und Zielhosting bleiben ebenfalls UNKNOWN; siehe [Validierung](VALIDATION.md).
