# Owner: geprüfte reale Hersteller-Listings → Fitment-v1-Prüfeingang

**Status 10.10.2026: privater Prüfeingang, NICHT 18 freigegebene Ersatzteilpassungen.**

## Ergebnis

Dieses Paket liest die unveränderten, bereits in Wave4 dokumentierten **10 echten Hersteller-Recherchefälle aus sieben Marken** und deren **18 konkrete Originalteil-Listings**. Es erzeugt für jede Teilekante einen vollständigen `FitmentRequest 1.0.0`, ruft ausschließlich die **bestehende gemeinsame** `assessFitment`-Engine auf und produziert eine priorisierte manuelle Prüfwarteschlange. Es entsteht **keine zweite Engine**, kein ungeprüfter Positiventscheid, kein Shopangebot und kein Deployment.

Nach erfolgreichem unabhängigen GitHub-Actions-Lauf [38029755945](https://github.com/Straikerabi/-universal-fitment/actions/runs/38029755945):
- 10 Hersteller-Recherchefälle / 18 ursprüngliche Teilzuordnungen normalisiert;
- 18 gültige v1-Vertragsanfragen und Antworten, 18-mal `unconfirmed`, **0 reale freigegebene Einbaupassungen**;
- Alle ursprünglichen 48 Consumer-Tests, gemeinsame Engine-/Bridge-Tests und Python-Quelltests erfolgreich;
- Quellen-/Varianten-Mismatch-, Bedingungs- und Mutationsprüfungen grün.

## Was wir vor einer Einbaufreigabe wirklich noch brauchen

Jeder Bericht nennt **pro Originalartikel**: Quelle/Belegkennung, genauen Hersteller-/Gerätecode, Markt, Baugruppe, Prüflücken und nur *bedingte* Ausschlüsse. Die Mindestprüfungen sind:

1. Vollständigen Gerätetyp und ggf. BSH E-Nr. `/xx` oder Dyson-/Samsung-Ausführung mit echten Herstellerdaten abgleichen.
2. Serien- und Revisions-Gültigkeit anhand überprüfbarer Herstellerinformation belegen. `null` wird **niemals** zu `any`.
3. Anbausitz, Gegenstück, Befestigung und bei elektrischen Teilen Spannung/Stecker/Anschluss am **konkreten Gerät** prüfen; keine Abmessungen erfinden.
4. Herstellerseite, Artikelnummer und exakten Beleg noch einmal anhand der aufgezeichneten Originalantwort bzw. einer neu überprüften Quelle auditieren.
5. Nutzungsrechte für die tatsächliche private und später kommerzielle Evidenzverwendung klären; öffentlich erreichbare HTML-Seiten sind nicht automatisch lizenziert.
6. Negative Herstellerbedingungen nur auf den **belegten Ausschlussfall** anwenden (Beispiel: Dyson V8 YH5-Akkuserie, nicht sämtliche Dyson V8 pauschal sperren).

Besonders aussichtsreiche **Recherchefolge** aus der rein technischen Warteschlange: einfache Beutel-/Filter-Identitäten (zunächst AEG AB61C3GG / 9001677690, Miele C3/Boost und Bosch BGL75), weil bei diesen weniger explizite elektrische Zusatzfragen anfallen. Diese Reihenfolge ist **keine** behauptete geringere reale Fehlerquote und ersetzt keine praktische Prüfung oder Lizenz.

## Reproduzierbar ohne Schreibzugriff

```sh
node integrations/real-fitment-review-owner/review.mjs
node integrations/real-fitment-review-owner/review.mjs --json > /tmp/uf-review-queue.json
node --test integrations/real-fitment-review-owner/review.test.mjs
```

`--json` liefert die 18 Fälle mit eindeutiger Artikelidentität, namentlich offenen Gates und den `FitmentResponse`-Statuscodes. Kein `site/`-, `main`-, Datenarchiv-, Work-Branch- oder Consumer-Snapshot-Merge. Diese Ausgabe darf nicht als Freigabedatei oder bestätigte Händler-Kompatibilität importiert werden.

**Nächster echter Produkt-Meilenstein:** Ein vollständiger, prüfbar dokumentierter Einzelfall mit OEM-Geräte- und Artikelidentität, Markt/Revisions-/Serienbezug, Anschlussnachweisen, überprüften Nutzungsrechten, expliziten Negativtests sowie bestandenem Shared-v1-Check. Erst danach auf der privaten Consumer-Seite als real bestätigt darstellen; öffentlicher Launch hat zusätzliche Rechts- und Betriebs-Gates.
