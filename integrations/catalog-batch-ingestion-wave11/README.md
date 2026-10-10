# Wave11 · Katalog-Batch-Pipeline (#105)

**Separater Branch:** `work/catalog-batch-ingestion-wave11`. Nur Dateien im gleichnamigen `integrations/**`-Unterordner und der neue eigene CI-Workflow. Consumer-Katalog, App, andere Fachabteilungen, OEM-Quellenarchiv, Source-Locks, Worker und Owner werden nicht bearbeitet.

**Quelle/Wahrheitsgrad:** 37 nur quellenbeobachtete echte OEM-Modellkandidaten mit exakter Herstellerseite, Fundstelle und Markt: 8 aus bereits Owner-integriertem Wave10-Recherchestand plus 29 mit Herstellerseiten zu Miele und Dyson separat nachgeschlagen. **0** unabhängige Rohbyte-Quellprüfungen, **0** Lizenzfreigaben, **0** Consumer-Imports, **0** reale Fits; alle Serien-/Revisionen unbekannt, Bosch /xx ausdrücklich pending. 250 eindeutig getrennte rein synthetische Datensätze pro Stresslauf, nicht als echte Modelle gezählt.

```sh
node integrations/catalog-batch-ingestion-wave11/ingest.mjs --check
node --test integrations/catalog-batch-ingestion-wave11/ingest.test.mjs
```

Der Pipeline-Validator prüft Modellidentitäten, dedupliziert exakte Region/PNC/E-Nr./SKU-Tupel, verweigert Status- und Rechte-Eskalation ohne Prüfkette, erzeugt deterministische JSON- und Markdown-Reports und führt keinerlei Webrequests aus. CI misst Performance der synthetischen Batch-Abnahme; Zahlen und Fehlerquote stehen im GitHub Actions Log. Vollständige JSON-/CSV-Feldspezifikation und Gate-Hinweise in `SCHEMA.md`.

**Nächste Durchsatzhebel:** lizenzierte Hersteller-Datenfeeds, eigenständige Originalbyte-/SHA-Archivqueue, unabhängige Identitäts- und Marktsuffix-Audits mit Stichproben, separate B2C-/Bildrechteverträge, nur dann gerätespezifische Teileidentitäten und reale Installationsprüfungen. Die 11 echten bestehenden Consumer-Modelle werden nicht verändert, Waschmaschinen bleiben in der Engine nicht freigegeben, Release weiterhin NO-GO.
Ein eigener **synthetischer SHA-256-Evidenzketten-Test** prüft das prinzipielle Durchlaufen aller fünf Statusstufen und deren Abhängigkeiten, ohne irgendeine echte Hersteller-, Rechte- oder Passungsfreigabe zu erzeugen.
