# OEM-Content-Lücken Wave9

> Read-only Consumer-Vergleich; keine positiv belegte Montagepassung, Rechte-, Sicherheits- oder Launchfreigabe.

## Gesamt
- 11 Geräte / 5 Marken / 11 Teilidentitäten / 11 Kandidaten.
- 5/11 zusätzliche OEM-Beobachtungen, 4/11 Geräte mit 21 technischen Einzelangaben.
- 3/11 exakt beobachtete OEM-Teilelistungen, 0 real geprüfte Einbaupassungen.
- 9/11 bekannte Herstellerdiscriminator, 2/2 Bosch /xx E-Nr. ungeklärt.
- Reparatur, Werkzeuge, Safety, einzelne Handbücher, B2C-Lizenzen, unabhängige Rohquellen: je 0/11.

## Marken

| Marke | Geräte | OEM-Quellen | Technikgeräte / Fakten | OEM-Kanten / Kandidaten | Varianten offen |
|---|---:|---:|---:|---:|---:|
| Bosch | 2 | 1/2 | 1/2 / 6 | 0/2 | 2 |
| Dyson | 2 | 1/2 | 0/2 / 0 | 2/2 | 0 |
| Hoover | 3 | 1/3 | 1/3 / 5 | 0/1 | 0 |
| Miele | 2 | 1/2 | 1/2 / 6 | 1/4 | 0 |
| Samsung | 2 | 1/2 | 1/2 / 4 | 0/2 | 0 |

## Geräte

| Consumer ID | Referenz | Markt | Variante | OEM-Status | Technikfelder | OEM-Kanten / Kandidaten | Reparatur / Tool / Safety / Media |
|---|---|---|---|---|---:|---:|---|
| vac-miele-model-11806000 | 11806000 | DE | catalog_reference_observed | unknown | 0 | 0/3 | unknown / unknown / unknown / unknown |
| vac-miele-model-11602400 | 11602400 | DE | catalog_reference_observed | source_observed | 6 | 1/1 | unknown / unknown / unknown / unknown |
| vac-bosch-model-bgl75x1prq | BGL75X1PRQ | DE | incomplete | source_observed | 6 | 0/2 | unknown / unknown / unknown / unknown |
| vac-bosch-model-bch3all21 | BCH3ALL21 | DE | incomplete | unknown | 0 | 0/0 | unknown / unknown / unknown / unknown |
| vac-samsung-model-vs20c95d4tk | VS20C95D4TK/WD | DE | catalog_reference_observed | source_observed | 4 | 0/2 | unknown / unknown / unknown / unknown |
| vac-samsung-model-vs90f40eek | VS90F40EEK/WD | DE | catalog_reference_observed | unknown | 0 | 0/0 | unknown / unknown / unknown / unknown |
| vac-hoover-model-hf202p011 | HF202P 011 | DE | catalog_reference_observed | source_observed | 5 | 0/1 | unknown / unknown / unknown / unknown |
| vac-hoover-model-fd22g | FD22G | GB | catalog_reference_observed | unknown | 0 | 0/0 | unknown / unknown / unknown / unknown |
| vac-hoover-model-hu300rhm001 | HU300RHM 001 | GB | catalog_reference_observed | unknown | 0 | 0/0 | unknown / unknown / unknown / unknown |
| vac-dyson-model-369535-01 | 369535-01 | DE | catalog_reference_observed | source_observed | 0 | 2/2 | unknown / unknown / unknown / unknown |
| vac-dyson-model-419634-01 | 419634-01 | DE | catalog_reference_observed | unknown | 0 | 0/0 | unknown / unknown / unknown / unknown |

## Negativ-Gates

- Bosch ohne E-Nr. /xx ist keine genaue Revision. Samsung /WD und /WE, Hoover achtstelliger Produktcode/Markt, Miele Material- und Produkttyp sowie Dyson SKU sind keine austauschbaren Geschwister.
- PNC-Lücken einschließlich führender Nullen werden **synthetisch** getestet; die elf realen Consumer-Geräte enthalten keine AEG-PNC.
- Die 29 Geräte von Wave7/PR #84 und 200 geplante Kategorien sind nicht integriert und werden nicht gezählt.
- Ein öffentliches OEM-Geräte- oder Teilelisting ist weder Nachweis der sicheren Einbaupassung noch Bild-/B2C-/Textlizenz.
- Work A #96 beschafft Rohquellen. Owner #85/#99 prüft integrierten Snapshot, Source-Lock/Offline/Rechte/Launch. Keine Main-Merges oder Deployments.

## Tests

node integrations/catalog-content-quality-wave9/quality.mjs --check
node --test integrations/catalog-content-quality-wave9/quality.test.mjs
