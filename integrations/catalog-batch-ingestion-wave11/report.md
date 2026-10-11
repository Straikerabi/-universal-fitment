# Wave11 · OEM Batch-Research / synthetischer Lasttest

> Hersteller-Modellseiten bilden ausschließlich Research-Kandidaten; kein Raw-Replay, Lizenznachweis oder bestätigte Einbaupassung.

## Echte und synthetische Counts

| Prüfung | Ergebnis |
|---|---:|
| Echte OEM-Recherchekandidaten mit URL/Fundstelle | 37 |
| Strukturell validiert | 37 |
| Unabhängig durch Originalbytes verifiziert | 0 |
| Rechtlich geprüfte Lizenzfreigaben | 0 |
| Consumer-Integration | 0 |
| Bestätigte reale Teilepassungen | 0 |
| Synthetische Leistungstest-Fixtures (nicht echt) | 250 |

## Verteilung der 37 Modellquellen

| Domäne / Hersteller | Nur beobachtet |
|---|---:|
| vacuum-cleaner/Dyson | 6 |
| vacuum-cleaner/Hoover | 2 |
| vacuum-cleaner/Miele | 21 |
| washing-machine/AEG | 2 |
| washing-machine/Bosch | 2 |
| washing-machine/Miele | 4 |

## Geschlossene Evidenzstufen

- candidate_observed: **37**
- original_bytes_archived: **0**
- identity_independently_verified: **0**
- rights_reviewed: **0**
- fitment_verified: **0**

Beide Bosch-Modelle ohne belegte vollständige E-Nr. /xx: 2. Serien-/Revisions-Audit unbekannt bei 37 Forschungsgeräten.

## Nächste Skalierungsschritte

1. Schriftlich genehmigte Herstellerfeeds und kommerzielle Datenverträge statt unautorisiertem Massenscraping.
2. Reproduzierbare Byte-/SHA-Archiv-Queue mit getrenntem unabhängigen Identitätsaudit einschließlich Markt-/E-Nr.-/PNC-/SKU-Grenzen.
3. Eigener Lizenz-/Medien-/Textreview; keine automatischen Rechteannahmen aus öffentlichen Herstellerlinks.
4. Teilnummern, Modell-BOMs und physische sicherheitsbezogene Fits durch separate Fachreviews vor der Consumer-Projektion.
5. Stichprobenstrategie, Delta-Batches, Format- und Dubletten-Reporting; alle synthetischen Lasttests bleiben separat.

Kein Consumer-Edit, kein Workflow-Scraping, kein main-Merge, kein Release/Deployment.

## Ausführen

`node integrations/catalog-batch-ingestion-wave11/ingest.mjs --check`
`node --test integrations/catalog-batch-ingestion-wave11/ingest.test.mjs`
