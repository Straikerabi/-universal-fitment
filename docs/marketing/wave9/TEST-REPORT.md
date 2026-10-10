# Wave9 Marketing — native Node-/GitHub-CI-Abnahme (privat)

**Stand:** 2026-10-10 (Europe/Berlin) · **Issue:** #99 · **Draft:** #102 · **Scope:** nur `docs/marketing/wave9/**` plus vom Owner in PR #102 ausdrücklich autorisierter *neuer* Workflow `.github/workflows/marketing-wave9.yml`.

## Tatsächlich geprüfter Head und native GitHub-CI

- **Head beim ersten vollständigen CI-Nachweis:** `1b4ea7f5c628d631c847c218e8a9d7a208e8ea74`.
- **Push-Run:** [38081765119](https://github.com/Straikerabi/-universal-fitment/actions/runs/38081765119) — completed **success**.
- **Pull-Request-Run:** [38081769320](https://github.com/Straikerabi/-universal-fitment/actions/runs/38081769320) — completed **success**, Job `Validate internal marketing drafts (NO-GO)`, Logs unabhängig gelesen.
- **Laufzeit:** tatsächliches `Node v22.23.3` im Linux-GitHub-Runner.
- **Syntax:** `node --check docs/marketing/wave9/{validate.mjs,check-references.mjs,validate.test.mjs}` (je separate Node-Aufrufe) erfolgreich.
- **Testkommando:** `node --test docs/marketing/wave9/validate.test.mjs` **28/28 PASS, 0 FAIL, 0 CANCEL, 0 SKIP** laut native Node-TAP-Ausgabe; 1 erlaubter privater Basissatz + **27/27** mutierte unzulässige Zustände wurden abgewiesen.
- **Manifest↔Markdown:** `node docs/marketing/wave9/check-references.mjs` erfolgreich, **14 Manifest-Assets, 14 registrierte IDs, 14 reale Abschnittsüberschriften in 3 Referenz-Dokumenten**, `errors: []`.
- **Workflow:** read-only Checkout (`persist-credentials:false`), `contents:read`, Node 22, keine Publishing-/Ads-/Contacts-/Deployment-Schritte. Getestet wird explizit `github.event.pull_request.head.sha || github.sha` und nicht unbesehen ein wechselnder Owner-Branch.
- **Neue Report-/README-Änderung:** dieser Bericht wird nach den obigen Läufen hinzugefügt. **Deren alte Run-IDs werden nicht als CI-Beweis für spätere Commits ausgegeben.** Die endgültige aktualisierte PR-Head-CI muss gesondert grün bestätigt werden (siehe PR-Kommentar).

## Negative Validierungen, geprüft statt behauptet
Alle 27 Mutationstests erzwingen fail-closed: künstliches Publikations-GO, geänderter Release-Status, bezahlte Werbung, Posts, Lead-Sammlung, erfundene Partner/Nutzer/positive Fits, 29er-Draft als reale 11er-App, 200 geplante Kategorien als verfügbar, falsche Owner-/Legal-Freigabe, persönliche Daten, fremde oder eingesetzte Medien, doppelte IDs, Passungsgarantien und Reichweitenversprechen, externe CTA-URL, ungültige Channel/Doc/Safety-Verknüpfung, B2B-Kanal-Missbrauch, leere Assets und falscher Provenienz-SHA.

## Produktevidenz und echte Grenzen
- Die 14 Assets bleiben `draft_internal`, `published:false`, `ownerApproval:false`, `legalApproval:false`, `mediaUsed:false`; Run meldet `releaseState:NO_GO` und `externalPublicationAuthorized:false`.
- Basis-Snapshot: private Consumer-App **11 Geräte, 5 Marken, 11 OEM-Teilidentitäten, 0 reale positive Fits**. #84 **29 Geräte nur im getrennten Draft**, 199 weitere Kategorien **nur geplant**.
- Die Tests sind **Marketing-Metadaten-/Claims-Checks**, keine Quelllizenzprüfung, reale physische Passungsprüfung, juristische Rechtsfreigabe oder App-Regression.
- Keine Accounts, Kampagnen, personenbezogene Daten, Tracking, Versand, öffentliches Presse-Kit, `main`-Merge oder Deployment.

## Reproduktion
```bash
node --check docs/marketing/wave9/validate.mjs
node --check docs/marketing/wave9/check-references.mjs
node --check docs/marketing/wave9/validate.test.mjs
node --test docs/marketing/wave9/validate.test.mjs
node docs/marketing/wave9/check-references.mjs
```

## Offene Launch-Gates (keine Freigabe)
Owner/QA/Recht müssen vor **jedem** öffentlichen Text reale Datenscope-, Marken-/Bild-/Musikrechte, sichere Anwendung, Nutzer-/B2B-Nutzenbeweise, Datenschutz/Betreiber/Hosting/Impressum, Werbekennzeichnung und Supportprozesse separat prüfen. Keine Veröffentlichungsautomatik aus CI.
