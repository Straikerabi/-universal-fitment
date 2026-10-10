# Wave9 Marketing — Test- und Abnahmeprotokoll
**Datum:** 2026-10-10. **Scope:** `docs/marketing/wave9/**` auf `work/marketing-playbook-wave9`. **Owner-Referenz bei Anlage:** `be7afa00ff2f69b9071d4d85da4c1f7c7e1a9b38`. Kein Code im Consumer/Katalog/Offline/Worker/Source-Lock verändert.

## Tatsächlich ausgeführt (nicht bloß Testcode geschrieben)
1. **In-process JavaScript-V8-Lauf:** `validate.mjs` direkt aus dem GitHub-Branch gelesen und unverändert bis auf das Entfernen der `export`-Kennzeichnung als JavaScript-Funktion kompiliert. `campaign-manifest.json` **ebenfalls aus dem Branch** geholt. Das `validate.test.mjs`-Testszenario wurde geladen und mit einem synchronen, minimalen Test-/Assert-Adapter ausgeführt (Import-/Node-Dateileseteil durch das tatsächlich abgerufene Manifest ersetzt; `structuredClone` durch eine JSON-taugliche Deep-Copy simuliert). Ergebnis: **28/28 erfolgreich, 0 fehlgeschlagen, 0 unterdrückte Testfälle**. Dieser Adapter-Lauf ist ausdrücklich **nicht** mit `node --test` oder GitHub CI gleichzusetzen.
2. **Positivfall:** vollständiges Manifest wird durch `validateManifest` ohne Fehler akzeptiert (**1/1**).
3. **Gezielte Negativfälle:** **27/27** erwartungsgemäß zurückgewiesen: öffentliches GO, GO-Status, Ausgaben, Posts, Leads, Partner, erfundene Nutzer/Fits, 29 statt 11 live, 200 statt 1 aktiv, publiziertes Asset, falsche Owner-/Legal-Abnahme, personenbezogene Daten, verwendete Medien ohne Prüfung, unzulässige Medienrechtsangabe, ID-Duplikat, garantierte Passung, erfundene Reichweite, Link zur Datenerhebung, ungültiger Kanal, Querverweis außerhalb Scope, Safety-Skip, falscher B2B-Kanal, fehlende Assetliste, falscher Owner-SHA.
4. **Dokumenten-/Manifest-Abgleich:** reale GitHub-Dateien `B2C-STARTPAKET.md`, `B2B-STARTPAKET.md`, `LANDING-PRESS.md`, `COMMUNITY-PLAYBOOK.md` per GitHub gelesen. **14/14** Asset-IDs haben je eine passende Überschrift im deklarierten Dokument, **0 fehlende Referenzen**. **14 Assets / 9 Kanäle**; davon neun Einträge mit Audience B2C (acht Social/Edu und ein Landing), vier B2B und ein Presse.
5. **Branch-/Diff-Scope:** per GitHub Compare im PR erneut zu prüfen; keine fremden Dateien geplant und keine technischen App-Tests beansprucht.

## Reproduktion in einer normalen Node-Arbeitsumgebung
```bash
node --test docs/marketing/wave9/validate.test.mjs
node --input-type=module -e "import {readFileSync} from 'node:fs';import {validateManifest} from './docs/marketing/wave9/validate.mjs';const m=JSON.parse(readFileSync('./docs/marketing/wave9/campaign-manifest.json','utf8'));const errors=validateManifest(m);console.log(JSON.stringify({assets:m.assets.length,errors},null,2));if(errors.length)process.exitCode=1;"
```
`node --test` wurde in dieser Bearbeitungsumgebung **nicht** tatsächlich ausgeführt, da ein Repository-Checkout/Dateitransfer dorthin nicht verfügbar war. Der tatsächliche unabhängige V8-Testlauf aus den Connector-Dateien ist oben getrennt dokumentiert. Keine CI eingeführt: #99 erlaubt ausschließlich `docs/marketing/wave9/**`, nicht `.github/workflows/**`.

## Release- und Integrationsrisiken
- **Fehlende Rechte/Lizenzen:** Eigene Bilder/Audiorechte müssen vor Verwendung nachgewiesen werden, `mediaUsed:false` markiert nur „nicht im Paket enthalten“, **nicht** eine Lizenzfreigabe.
- **Sicherheit:** Allgemeine Typenschild- und Variantenhilfe; kein Ersatz für elektrische, Akku- oder mechanische Reparaturfreigaben.
- **Außenclaims:** 11 / 5 / 0 / 29 / 199 beziehen sich ausdrücklich auf den Owner-Snapshot vom 10.10.2026. Vor späterem Posting **neu messen**, nicht ungeprüft wiederverwenden.
- **Recht/Marketing:** Rechte-, Marken-, DSGVO-, Plattform- und Werbekennzeichnungsprüfung offen. Keine reale Consumer-Beta, kein echter B2B-Geschäftsnachweis.
- **Release:** `launchApproved` wird hier nicht gesetzt. **NO-GO** unabhängig von Teststatus.

## Owner-Rückmeldung erforderlich
Interne Copy kann fachlich bewertet werden. Produktfreigabe, Veröffentlichung, Social-Accounts, Kontaktsammlung, Anzeigenbuchung, B2B-Kaltansprache, Domain und Deploy sind **ausdrücklich nicht autorisiert**.
