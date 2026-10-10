# Marketing / Branding Wave12 – tatsächlicher Testbericht
**Datum:** 2026-10-11 (Europe/Berlin). **Issue:** #107. **Kein rechtliches Marken-GO**. Branding-/Domain-Vorprüfung, kein Schreibzugriff auf App-, Owner-, Consumer-, OEM-, Legal- oder Katalogdateien.

## Native GitHub Actions (erster Workflow-Head, tatsächlich gelesen)
- **Commit:** `7f870ddf7a3dd165392c37b26564be5253bf5257`
- **Push-CI:** [Run #38095246015](https://github.com/Straikerabi/-universal-fitment/actions/runs/38095246015) **COMPLETED SUCCESS**, Job `naming-qa` SUCCESS. Exakte Job-Logs über GitHub gelesen.
- **Native Node 22:** `node --check` für `validate.mjs`, `validate.test.mjs`, `domain-probe.mjs` erfolgreich; `node docs/branding/wave12/validate.mjs` validierte **25 Kandidaten, fünf Favoriten, 0 Fehler**.
- **Tests:** `node --test docs/branding/wave12/validate.test.mjs` **26/26 bestanden, 0 failed, 0 skipped, 0 cancelled**, darin **25/25** Negativmutationen gegen versteckte Umbenennung, Fake-Rechte, Rang-/Scorefehler, Domainstatus ohne Beleg, Dubletten etc.
- **Registry-Snapshot:** `node docs/branding/wave12/domain-probe.mjs` führte **10/10 tatsächliche offizielle HEAD-Abfragen** aus; **Nolvanta, Varidaro, Partidra .de/.com jeweils HTTP 404**, **Varunexa und Modantra .de HTTP 404/.com HTTP 200 (registriert)**. HTTP, Registry-URLs und genaue UTC-Daten aus dem tatsächlichen Run in `candidates.json` übertragen.
- **PR-Run:** Beim erstmaligen Dokumentieren zusätzlich zum Push gestartet; erst nach erneutem CI-Read final als erfolgreich zählen.

## Keine Bedeutungsverschiebung
- 404 in RDAP bedeutet „nicht registriert bei Abfrage“, nicht „kaufbar/markenfrei/registrierbar“.
- 200 bei .com bedeutet bestehende Domainregistrierung; keine Rechte-/Lizenzschlüsse über den Betreiber.
- Suchmaschinenvorrecherche kann Ähnlichkeitsrechte nicht ausschließen. **Rechtsprüfung #108 für alle fünf bleibt ausstehend**, ebenso AppStore-, Handelsregister-, DPMA-/EUIPO-/WIPO-Recherche.
- Das heutige App-Label **Universal Fitment** bleibt unverändert. Keine Ankündigung, Presseaussage, Social-Account-, Domain-, Trademark-, Logo- oder Store-Änderung.

## Reproduzierbare Befehle (No write, Domain-Probe read-only)
```bash
node --check docs/branding/wave12/validate.mjs
node --check docs/branding/wave12/validate.test.mjs
node --check docs/branding/wave12/domain-probe.mjs
node docs/branding/wave12/validate.mjs
node --test docs/branding/wave12/validate.test.mjs
node docs/branding/wave12/domain-probe.mjs
```
**Wichtig:** Nach dieser Dokumentation wird CI auf dem endgültigen Head erneut geprüft; Ergebnisse des alten SHA gelten nicht automatisch für den neuen Commit. Die endgültigen neuen SHA-/CI-Links stehen dann als GitHub-PR-Kommentar in #112.

## Owner-/QA-Übergabe
Die fünf Namen stehen *nur als Marketing-Shortlist* in `SHORTLIST.md` und `candidates.json`. #108 führt den eigentlichen rechtsbezogenen Check durch; bis dahin `legalStatus:pending_qa_legal`, `brandChosen:false`, `published:false`, keine Veröffentlichung oder Umbenennung.
