# Marketing Branding Wave12 — noch nicht abgeschlossener Testbericht
**Issue #107** · Team Marketing · **NO-GO** für externe Marke, Domain oder App-Umbenennung.

## Definierte native Prüfungen (Ausführung/Run-ID folgt erst nach GitHub Actions)
- `node --check docs/branding/wave12/{validate.mjs,validate.test.mjs,domain-probe.mjs}` (jeder Pfad einzeln)
- `node docs/branding/wave12/validate.mjs`
- `node --test docs/branding/wave12/validate.test.mjs` mit Basisfall und echten negativen Mutationen.
- `node docs/branding/wave12/domain-probe.mjs`: **read-only**, zehn RDAP-HEAD-Signale mit Timeouts und explizitem Unknown-Fallback, nur Momentaufnahme.
- GitHub Compare auf 100% reservierten Paths und Digest des tatsächlichen finalen Heads. Keine Node-/CI-Pässe vor konkretem Log-Nachweis behaupten.

## Aussagegrenze
25 Marketing-Ideen, fünf priorisierte Kandidaten, fünf gewichtete Kriterien. Scores subjektiv. App-Store-Verfügbarkeit, Markenfreiheit, Gewerbename, Bild-/Medienrechte, Live-Consumer-Funktionen sowie .de/.com-Registrierungsrechte **nicht** durch Namensscore oder CI freigegeben.
