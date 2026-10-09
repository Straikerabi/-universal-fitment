# Staubsauger-Coverage v1.29.0 (isolierter Baseline-Report)

Basis: `71f7826ba936a1f3830c8b2a67e8085a9cfe234e`; Checkpoint `c600a5c5a83a6f096ff5999e5ce5582c37ec424155919d487dfd6ca2221bd42b`. Keine Wave-3-Integration.

1093 konkrete Modellrows / 1082 unterschiedliche Marke-Modell-Namen; 9 Familienfallbacks separat. 1940 Artikelrows, 1822 physische Artikelrows.

| Marke | Namen | Rows | 0 Teile | 1 Teil | n Teile | Physische Zuordnungen | Explizite Hersteller-Listings* |
|---|---:|---:|---:|---:|---:|---:|---:|
| AEG | 100 | 100 | 22 | 0 | 78 | 2843 | 2843 |
| Bosch | 100 | 100 | 42 | 0 | 58 | 641 | 641 |
| Dyson | 92 | 98 | 40 | 0 | 58 | 747 | 747 |
| Hoover | 100 | 100 | 98 | 0 | 2 | 22 | 0 |
| Miele | 82 | 87 | 25 | 0 | 62 | 1156 | 614 |
| Philips | 140 | 140 | 84 | 21 | 35 | 161 | 158 |
| Rowenta | 272 | 272 | 75 | 95 | 102 | 402 | 402 |
| Samsung | 77 | 77 | 57 | 0 | 20 | 164 | 164 |
| Siemens | 101 | 101 | 0 | 0 | 101 | 2402 | 2347 |
| Vorwerk | 18 | 18 | 4 | 0 | 14 | 105 | 105 |

**447 ohne physisches Teil**, 116 mit genau einem, 530 mit mehreren. 8643 deduplizierte physische Zuordnungen, 8021 strukturierte Hersteller-Listings.

*Listings sind im gepinnten Katalog aufgezeichnete, modellbezogene Quellenbehauptungen. Keine neue Live-Quellenprüfung, Rechtefreigabe oder Montagebestätigung. Familien-/Präfix-/Aftermarket-Inferenz zählt nicht; Drittservice ohne strukturierte Delegationskette ebenfalls nicht. Bosch-Modellzubehör besitzt hier keine bestätigten /xx-Indizes.

**0 v1-bestätigte Passungen / 0 autorisiert bestellbare Teile.** Nicht: alle Teile passen nicht. Der Baseline fehlen vollständige v1-Belegketten mit Varianten-, Anschluss- und Nutzungsprüfung. Durchschnitt v1-bestätigter Teile pro Modell: 0. Fehlende Baugruppen bleiben unknown, auch wenn für einen Gerätetyp z. B. Beutel nicht zutreffen könnten.

Abweichungen von dokumentierten 1093/447/1940/1822: `{"modelRecordsDelta":0,"recordsWithoutPhysicalPartsDelta":0,"articleRowsDelta":0,"physicalArticleRowsDelta":0}`. Jede konkrete Modellrow und Hersteller-Listing-Quelle sowie alle 136 unveränderten Dateihashes stehen im JSON. Neun Miele-Familienfallbacks erhöhen keine Modellzahl. Namen/Rows sind keine belegte Zahl unabhängiger Konstruktionen oder zertifizierter Reparaturvarianten.

PRs #51–#53 nur gelesen. Gemeinsame Integration: #54. Deren geplante 1115/1961/463 sind keine Messwerte dieses Reports. Keine API, UI, Preise, Feeds, Bilder, Secrets oder neuen OEM-Daten.
