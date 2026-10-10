# Wave8 · OEM-Gerätesteckbriefe (isoliertes Content-Staging)

**Ticket:** #86 · **Branch:** `work/catalog-oem-passports-wave8` · **Startbasis:** Owner `99fd8fa18773ce8c774772600c2ac90d850be2c2` (Snapshot v1, 11 Geräte). **Kein automatischer Consumer-Import**, keine Änderung der Fitment-Engine, kein Launch. Owner integriert ausschließlich nach Review. Issue #85 und PR #84 sind separat.

## Datenumfang und Messverfahren

`observations.json`: fünf separat beobachtete, eindeutige Gerätevarianten; sämtliche 11 Consumer-Referenzen sind als harte Snapshot-Grenze fixiert. `validate.mjs`: striktes Herkunfts-/Rechte-/Quellen-/Varianzen-/Teile-Gate, projektiert alle 11 mit explizit `unknown` für fehlende Felder. Die Statusklasse ist **`source_observed`**, niemals `independently_verified`: Zum 10.10.2026 wurden diese öffentlichen OEM-Seiten textlich betrachtet, aber **keine Originalbytes und keine extern verifizierten SHA-256-Audits im Branch erfasst**. Sichtbare URLs und Locator belegen nur abgelesene Angaben, keine Lizensierung. `not_applicable` wird nicht als Ausrede für fehlende Daten eingesetzt.

**Staging-Zahlen für den gesperrten Owner-Snapshot v1 (Tests prüfen live):** 11/11 bekannte exakte Identitäts-Referenzen aus der Consumer-Basis, **5/11** zusätzliche OEM-Quellenbeobachtungen (5/5 Basismarken), **4/11** gerätespezifische technische Kenndaten, **21** Felddaten, **3** gerätespezifisch geführte OEM-Teilelistungen auf **2/11** Geräten, **5/11** offizielle OEM-Service-/Dokumenten-Einstiegsseiten, **1/11** gerätebezogener Wartungshinweis ohne verifizierte Schritte. **0/11** verifizierte Schritt-für-Schritt-Reparaturen, Werkzeuge, Sicherheitsanweisungen, Einzelhandbuch-Downloads und B2C-medienlizenzierte Modellbilder; **0** reale Einbaupassungen; kommerzielle Rechte `unknown`; Marktstart `NO-GO`. Diese Zähler dürfen erst nach tatsächlich integrierter Projektion in die Owner-Scorecard übernommen werden, nicht bereits wegen dieser Datenablage.

| OEM | Genaues Consumer-Gerät | Öffentliche Originalquelle und nur beobachteter Inhalt |
| --- | --- | --- |
| Miele | Boost CX1 Parquet PowerLine · 11602400 · DE | [Miele 11602400](https://www.miele.de/product/11602400/bodenstaubsauger-ohne-beutel-boost-cx1-parquet-powerline-lotosweiss), Produktdatenblatt: 890 W, 1 l, 400 × 280 × 280 mm, 10 m Aktionsradius; als mitgelieferte Düse SBD 365-3 beobachtet |
| Bosch | BGL75X1PRQ · DE, **/xx unbekannt** | [Bosch BGL75X1PRQ](https://www.bosch-home.com/de/de/product/staubsauger/staubsauger-mit-beutel/BGL75X1PRQ), Produktmerkmale: 275 × 320 × 480 mm, 5 l, 15 m, 6,1 kg ohne externes Zubehör; **nicht** auf BGL75X1PRQ/23 extrapolieren |
| Samsung | VS20C95D4TK/WD · DE | [Samsung /WD](https://www.samsung.com/de/vacuum-cleaners/stick/vs9500al-stick-more-advance-cleaning-performance-hexajet-motor-jet-cyclone-black-vs20c95d4tk-wd/), technische Daten: 2,51 kg netto, 930 × 250 × 202 mm; kein Transfer auf anderen /Ländercode |
| Hoover | HF202P 011 · SKU 39401035 · DE | [Hoover 39401035](https://www.hoover-home.com/de_DE/akkusauger/39401035/hf202p-011/), technische Daten: 14,4 V, 165 W, max. 80 min, 1,3 kg **als Handgerät**; 1 l **äquivalentes verdichtetes Volumen**. Anti-Twist-Fenster erwähnt, **keine validierte Anleitung** |
| Dyson | V15 Detect Absolute · SKU 369535-01 · DE | [Dyson Ersatzteilindex 369535-01](https://www.dyson.de/support/journey/replacement-parts/search.369535-01), OEM führt explizit Bürstenleiste 971634-01 und Akku 970938-01; elektrische Anschlussvariante, Serienstand und realer Einbau **nicht bestätigt** |

Alle Quellen sind OEM-Seiten. Kein Herstellerbild, OEM-PDF, HTML-Rohtext, Preis, Lagerstatus oder OEM-geschützte Zeichnung wird gespeichert. Miele, Bosch, Samsung und Hoover verlinken auf Herstellerseiten mit Dokumentenbereichen; ein verifizierter einzelner Bedienungsanleitungs-PDF-Link wird **nicht** behauptet. Eine genaue Seitenstelle steht bei jedem Feld in `observations.json`.

## Ausführen

Ab Repo-Wurzel mit Node.js 20+:

```sh
node integrations/catalog-oem-passports-wave8/validate.mjs
node --test integrations/catalog-oem-passports-wave8/validate.test.mjs
```

Der erste Aufruf gibt messbare JSON-Zähler für die **tatsächlich ausgecheckte** Consumer-Datei aus und wirft bei Snapshot-/Variantenänderungen eine Exception. Tests manipulieren jeweils *synthetisch* Kopien (nicht die echten Quelldaten): falsche /xx- und /WD-Varianten, GB/DE-Transfer, neue Modelle, gefälschte OEM-Artikel und Teilkanten, erfundene Werkzeuglisten/Serviceanweisungen, medienrechtliche Hochstufungen, fingierte Hash-/Quellenverifikation und unbelegte Einbaupassungen müssen abgelehnt werden. Bis CI oder lokaler Testlauf tatsächlich geprüft sind, keine grüne Abnahme behaupten.

## Übergabe an den Owner

1. **Vor Freigabe:** OEM-Seiten mit rechtmäßiger Datennutzung und echten privaten Originalantworten/Datum erneut abrufen; ggf. neue Audits mit Hash, HTML-/PDF-Fundstelle und Domain-/Redirect-Prüfung. Abweichungen manuell auflösen, keine Hash-Pins automatisch überschreiben.
2. **Bei Integration #85:** 11→29 nur nach independently auditiertem OEM-Quellenarchiv und der separaten PR-#84-Review, dann `baseSnapshotExactVariants` und die neuen 18 echten Varianten bewusst einzeln nachziehen. Kein blindes Materialisieren dieses Staging-Pakets in App/Engine.
3. **Reparaturfachlichkeit:** OEM-Handbücher/Servicehinweise seiten- oder abschnittsgenau und sicherheitsgeprüft erfassen, Teile inkl. tatsächlicher Serien-/Revisionstransfers und Werkzeuggrößen gesondert reviewen. Akku-, Netzspannung- und Öffnungsanweisungen ohne tragfähige OEM-Grenzen nicht publizieren. Wartungshinweis ist keine komplette Reparaturanleitung.
4. **Rechte/UX/Offline:** jedes Feld in Consumer nur mit Quelle, Abrufdatum, Status und klaren Lücken anzeigen; keine Fotos ohne dokumentierte B2C-Rechte; Offline-Mission und Source-Lock nach Integration neu auditieren; P0 bleibt gesperrt.

**Keine** Zusage einer Wiederveröffentlichungs-/B2C-Lizenz, keine bestätigte physische Passung, kein Merge nach `main`, kein Deployment.
