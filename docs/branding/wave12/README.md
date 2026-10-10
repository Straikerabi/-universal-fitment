# Wave12 – Internationales Marken-Naming (intern)
**Issue:** #107 · **Stand:** 2026-10-11 · **Arbeitsname bleibt „Universal Fitment“** · **Release:** NO-GO.
**Aktuelle Phase:** kreative Namensentwicklung und **nicht abschließende** Markt-/Domain-Vorrecherche. Keine Marke freigegeben, kein Domainkauf, keine Anmeldung, keine App-Umbenennung, keine Veröffentlichung.

## Quelle der Wahrheit / Begrenzung
- [Issue #99](https://github.com/Straikerabi/-universal-fitment/issues/99) reserviert Wave12 exklusiv für Marketing: `work/branding-name-shortlist-wave12`, Schreibscope `docs/branding/wave12/**` plus neuer dedizierter `.github/workflows/branding-wave12.yml`.
- Basis bei Branch-Anlage: privater Owner-HEAD `40eb076541da1360ef671f9b54e549b0026382cd`.
- [Issue #107](https://github.com/Straikerabi/-universal-fitment/issues/107) verlangt 20–30 Kandidaten, fünf priorisierte Namen und getrennte DE/COM Domain-Momentaufnahmen. [Issue #108](https://github.com/Straikerabi/-universal-fitment/issues/108) **allein** führt rechtliches DPMA-/EUIPO-/WIPO-/Firma-/AppStore-Clearing durch.
- Langfristig kostenlose Consumer-Software und mögliche professionelle B2B-Plattform für viele Gerätetypen; **nicht** nur Staubsauger oder KFZ im Markennamen verankern. 200 Kategorien sind Planung, keine nutzbaren Produkte.

## Dateien
- `candidates.json`: 25 jeweils hergeleitete Kunstnamen, Herkunft, DE-/EN-Aussprache, rationale Marketing-Risiken, 5 gewichtete Kriterien; 5 markierte Favoriten mit Rank 1–5. Je Kandidat ist der Domain-/Marken-/App-Store-Status separat dokumentiert: **für die fünf Favoriten je .de/.com echter RDAP-HEAD-Snapshot vom 11.10.2026, für übrige Kandidaten unknown**. Auch HTTP 404 bedeutet nur momentan nicht registriert; kein Kaufrecht.
- `SHORTLIST.md`: Priorisierung und Anwendungstest als Markenfamilie, ohne endgültige Entscheidung.
- `RESEARCH.md`: konkrete Links zu bereits entdeckten Namenskollisionen, seriöse Such-/RDAP-Methodik und Suchdatum.
- `domain-probe.mjs`: optionaler read-only, timeoutbegrenzter **Registry-HEAD**-Check für 5× .de und .com. Zeigt UTC-Datum, HTTP-Code und eindeutigen Status. **404 ist Momentaufnahme „nicht registriert bei Check“, niemals Rechtefreigabe**; Timeout/403/429 = unknown. Der Workflow nutzt nur diesen technischen Probe-Output in Logs.
- `validate.mjs` / `validate.test.mjs`: harte Negativtests gegen erfundene Markenfreiheit, Umbenennung, falsche Domain-Belege oder Rankings.
- `TEST-REPORT.md`: nach ausgeführter CI mit tatsächlichen Counts, SHA und Risikohinweisen.
- `.github/workflows/branding-wave12.yml`: isolierte Node-22-CI, nur read-only Checkout/Test und optionaler Domain-Registry-Check; keine Deploy-/Social-/Write-Schritte.

## Namensbewertung (heuristisch, keine Markeneintragung)
Kriterien jeweils **1–5**, gewichtete Punkte von max. 100:
Distinctiveness **30%**, deutsch/englische Sprechbarkeit **20%**, wahrgenommene geringe Verwechselbarkeit **20%**, App-Store-Lesbarkeit und Kürze **15%**, B2C-/B2B-Skalierbarkeit **15%**. Die Scores sind **redaktionelle Hypothesen**, keine Trefferwahrscheinlichkeiten oder juristischen Risikoprozente. Bei Gleichstand wirkt die redaktionelle Priorisierung; die Marke muss final durch QA/Recht und Owner ausgewählt werden.

## Tests (nur nach tatsächlicher Ausführung als bestanden melden)
```bash
node --check docs/branding/wave12/validate.mjs
node --check docs/branding/wave12/validate.test.mjs
node --check docs/branding/wave12/domain-probe.mjs
node docs/branding/wave12/validate.mjs
node --test docs/branding/wave12/validate.test.mjs
node docs/branding/wave12/domain-probe.mjs
```
**Erste native CI:** [GitHub Actions #38095246015](https://github.com/Straikerabi/-universal-fitment/actions/runs/38095246015) auf Commit `7f870ddf7a3dd165392c37b26564be5253bf5257`: **26/26** Node-Tests (inkl. 25 Negativfälle), 0 FAIL, 0 SKIP; 10/10 RDAP-Anfragen beantwortet mit 5×.de 404, 3×.com 404, 2×.com 200. Spätere Commit-Heads erfordern erneute CI.

Ein positives Naming-/CI-Ergebnis ist **kein** rechtliches Go; private Marketing-Dokumentation darf ohne Produktfreigabe nicht in App-/Store-/Pressemetadaten übernommen werden.
