# Wave9 OEM-Katalog-Qualität · Issue #99

Exklusiver Dateiscope `integrations/catalog-content-quality-wave9/**` und eigener Workflow `.github/workflows/catalog-content-quality-wave9.yml`. `catalog-snapshot.mjs` und PR-#91-`observations.json` nur **lesen**. Work A #96 besitzt neue OEM-Rohquellen. Projektleitung allein integriert in Owner-Branch.

```sh
node integrations/catalog-content-quality-wave9/quality.mjs --check
node --test integrations/catalog-content-quality-wave9/quality.test.mjs
```

`--check` verifiziert deterministische Reportdateien fail-closed, `--write` aktualisiert ausschließlich diese zwei eigenen Reportdateien. Alle Kennzahlen zählen **den echten 11er Consumer**, nicht 29 isolierte Wave7-Geräte oder geplante Kategorien. Report führt je Gerät/Marke: exakte Herstellerreferenz und Markt, E-Nr./xx-/SKU-/PNC-Variantenstatus, 21 bisher nur beobachtete technische Einzelfelder, OEM-Listenbeobachtungen gegenüber 11 Kandidatenkanten, fehlende Reparatur/Tools/Safety, einzelne Handbücher, B2C-Bild-/Textrechte und Originalquellen-Audit. `unknown` ist nicht `not_applicable`. PNC ist ausschließlich synthetischer AEG-Negativtest, kein echtes Consumer-Gerät.

**P0 offen:** keine unabhängigen OEM-Rohbytes, keine freigegebenen B2C-Lizenzen oder sicherheitsgeprüften Reparaturschritte, 0 bestätigte physische Einbaupassungen, Launch NO-GO. Owner-Rechte-/Offline-/Source-Lock-Review bleibt zwingend. Kein Merge/Deployment.
