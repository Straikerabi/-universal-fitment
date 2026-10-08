# Modell-zuerst-Plan, Stand 8. Oktober 2026 (v1.28.0)

## Nächster Arbeitsabschnitt

**v1.28.0 abgeschlossen:** Samsung +8, Bosch +40 und Mobile UX aus den drei Work-Entwurfs-PRs integriert. Für 308 Modellrecords fehlen noch konkret geprüfte Ersatzteillisten; Modell- und Teileabdeckung bleiben bewusst getrennt.

Vor weiteren großen Teileimporten bauen wir die **Gerätemodell-Abdeckung** aus. Ziel: je Marke bis zu 100 tatsächlich unterscheidbare Staubsauger-Grundmodelle mit Herkunftsbelegen. Es werden keine Zubehörteile, regional identischen Duplikate oder Marketing-Seriennamen als neue Staubsauger gezählt. Wenn ein Hersteller weniger als 100 unabhängige Grundmodelle anbietet, dokumentieren wir die echte Obergrenze statt Namen zu erfinden.

| Marke | Verschiedene Modelle | Zielplätze offen | Reihenfolge |
|---|---:|---:|---:|
| AEG | 100 | 0 | **abgeschlossen v1.27.0** |
| Samsung | 77 | 23 | 1 |
| Bosch | 100 | 0 | abgeschlossen v1.28.0 |
| Miele | 57 | 43 | 3 |
| Dyson | 54 | 46 | 4 |
| Hoover | 24 | 76 | 5 |
| Vorwerk | 18 | 82 | 6, echte Grundmodelle gesondert prüfen |
| Rowenta | 272 | 0 | erfüllt |
| Philips | 140 | 0 | erfüllt |
| Siemens | 101 | 0 | erfüllt |

**Summe:** 730 von 1.000 gedeckelten Modellplätzen; 270 noch offen. 943 Modellbezeichnungen, 954 konkreten Modelleinträge und 1.930 Katalogartikel. 308 Modelleinträge aktuell ohne gelistete Teile.

## Verbindliche Datenregeln

1. Exakte Modellkennung und offizieller Hersteller-/Service-/Ersatzteilregister-Link als Erstquelle; internationale Herstellerquellen mit Land kennzeichnen.
2. Regionalcodes und vollständige AEG-PNC bzw. Bosch-/Siemens-E-Nr. inklusive Variantenindex nicht zusammenfantasieren. Neunstellige AEG-PNC ohne 11-stellige Reparaturvariante bleibt offen.
3. Zuerst den Modellindex ergänzen. Ohne konkrete Hersteller-/Servicezuordnung **0 gelistete Teile**, kein erfundener Filter, Bürste oder Akku.
4. Bereits belegte Teilebeziehungen nicht verlieren; alte Originalartikelkennungen sowie Nutzergerät-IDs unverändert lassen.
5. App- und Shop-Bereiche für Modell- und Teilefilter bleiben synchron, Markenpakete müssen lazy/offline ladbar bleiben.
6. Keine modellbasierten Bestseller-Rankings, Preise, Bestände, Versandversprechen oder technische Passungsfreigaben aus Marketingtexten erfinden.
7. Jede Release: Dublettenprüfung, 36 App-Testgruppen, Browserpaket-Reproduzierbarkeit, SHA-verifizierter Delta-Patch, Source-Checkpoint und erfolgreicher GitHub-Pages-Build.

## Nach Abschluss der belegbaren Modellbasis

Dann modellweise echte Ersatzteil- und Zubehörkategorien (Bürsten, Düsen, Beutel, Filter, Akkus, Rohre usw.) mit Quellen und PNC-/Gerätevarianten erarbeiten. Preise und Angebote erst übernehmen, wenn ein datierter deutscher Händlernachweis samt Versand-/Bestandsinformationen vorliegt. Externe Artikel bleiben bei ungesicherter Passung als Prüfbedarf gekennzeichnet.

## AEG-Abschluss

22 direkt in AEG-/Electrolux-Herstellerquellen nachgewiesene Modelle ergänzen 78 Bestandseinträge. Keine neuen Ersatzteilbeziehungen behauptet. Sechs neunstellige AEG-Produktnummern nicht mit erfundenen zweistelligen PNC-Suffixen ergänzt. Details: [AEG-Nachweise](aeg-model-candidates-v1270.json) und [Releasebericht](aeg-release-v1270.json).
