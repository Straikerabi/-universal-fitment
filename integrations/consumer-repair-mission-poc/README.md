# Consumer-Reparaturmission · isolierter Prototyp für #49

Ein lokaler mobiler Ablauf führt von der Gerätekennung über Ausführung und Baugruppe zu einer begründeten Prüfansicht und einer gespeicherten Checkliste. Die Oberfläche nutzt eigene SVG-Grafiken, Systemschriften und vorhandene, quellengebundene Identitäten. Alle Änderungen liegen ausschließlich in diesem Verzeichnis auf `work/consumer-repair-mission-poc`.

**Echte Passungen werden noch nicht entschieden.** Die gemeinsame Engine aus [#48](https://github.com/Straikerabi/-universal-fitment/issues/48) ist nicht integriert. Positive und negative Ergebnisse erscheinen ausschließlich in einem getrennten, sichtbar synthetischen Demomodus. Dieser Draft erfüllt den am 09.10.2026 freigegebenen isolierten UI-Umfang; die vollständige Feldabnahme von [#49](https://github.com/Straikerabi/-universal-fitment/issues/49) bleibt offen.

## Lokal starten

Node.js 22 oder neuer; keine Laufzeitpakete, kein Build, kein Konto.

```bash
npm start --prefix integrations/consumer-repair-mission-poc
```

Vorschau: `http://127.0.0.1:4179`. Der Server bindet ausschließlich an Loopback, erlaubt GET/HEAD und liefert nur die sechs UI-Dateien aus. Die Content Security Policy blockiert Netzwerkdienste, Frames und Formulare. Es werden keine Händlerfeeds, Analysen, OEM-Bilder oder Cloud-Services geladen. Herstellerlinks werden nur auf ausdrücklichen Klick geöffnet und tragen den Geltungsbereich „Identität“.

## Ablauf

1. **Gerät:** Modell, Materialnummer oder vollständige Kennung suchen und einen Eintrag ausdrücklich wählen. Kein automatischer Ersatz durch ein ähnliches Modell. Die Reparaturfrage bleibt als Kontext erhalten.
2. **Ausführung:** ursprüngliche Quellenkennung, Markt und vorhandenen Produktcode vergleichen; eigene Kennung optional lokal notieren. Fehlende Revisionen und Zusätze bleiben offen. Abweichende Eingaben werden erklärt.
3. **Baugruppe:** vier interaktive Bereiche mit eigener neutraler Orientierung und Zahl der vorhandenen Prüfkandidaten. Die Grafik stellt kein konkretes Gerät oder dessen Einbaupositionen dar.
4. **Passung:** Gründe, fehlende Informationen und belegte Identitäten getrennt ansehen. Reale Kandidaten bleiben unbestätigt. Keine Kaufbuttons, Preise, Bestände oder Lieferzusagen.
5. **Checkliste:** offene Angaben und ausgewählte Prüfkandidaten vormerken, lokale Notizen abhaken und Text inklusive Quellen und unverändertem Prüfstatus kopieren oder herunterladen. Abhaken bestätigt weder Passung noch Vollständigkeit.

Geräte-, Varianten- oder Baugruppenwechsel verwerfen alte Teileauswahl und Erledigt-Markierungen. Die lokalen Speicher für echte Daten und Demo sind getrennt. Veraltete, fremde oder manipulierte gespeicherte Antworten werden verworfen. Speicherung ist optional; bei gesperrtem Local Storage bleibt der laufende Ablauf nutzbar und bietet einen Textexport.

## Daten und Grenzen

| Umfang | Stand dieses Drafts |
| --- | --- |
| Baseline | main `71f7826ba936a1f3830c8b2a67e8085a9cfe234e`, App v1.29.0 |
| Checkpoint | SHA-256 `c600a5c5a83a6f096ff5999e5ce5582c37ec424155919d487dfd6ca2221bd42b`, 136 Dateien |
| Ausgewählte Identitäten | 11 Geräte, 11 vorhandene Originalteil-Identitäten; Miele, Bosch, Samsung, Hoover, Dyson |
| Quellenstand | ursprüngliche Katalogbeobachtungen 06./08.10.2026; keine Behauptung einer neuen Live-Verifikation |
| Neue reale Fitments | 0 |
| Shared Engine / Wave3 | beide nicht integriert |
| Synthetische Antworten | fünf statische Fixtures mit `demo:`-/`DEMO-`-Kennungen |

Die vollständige Zuordnung von Identität, Region, Datum und Originalquelle steht in [SOURCE-MANIFEST.md](SOURCE-MANIFEST.md); die unveränderten IDs und Originalkennungen stehen in `catalog-snapshot.mjs`. `legacyStatus` und `candidatePartIds` beschreiben frühere Katalogeinträge, keine hier neu erteilte Passungsfreigabe. EEK wird nicht aus EEM abgeleitet, `/WA` wird nicht auf `/WD` übertragen und ein gemeinsamer Miele-Gerätetyp wählt kein Modell automatisch. Der Samsung-Artikelcode `VCA-SAPB95/WA` bleibt als Artikelkennung erhalten und ersetzt keine Geräte-Länderkennung.

Hoover Y81 / `35602897` wurde bewusst ausgelassen: im Baseline-Datensatz steht hierfür nur eine allgemeine Zubehör-Collection als Quelle. GB-Artikelquellen werden nicht als DE-Fitment benutzt. Bei Bosch fehlen vollständige `/xx`-Indizes, bei Hoover regionale Serien-/Revisionsbereiche; diese Lücken sind sichtbar. Ein leerer Bereich bedeutet ausschließlich „im Pilotbestand nicht dokumentiert“.

Die zentrale Wave3-Integration gehört [#54](https://github.com/Straikerabi/-universal-fitment/issues/54). Dieser Branch übernimmt keine Änderungen aus #51/#52/#53, führt keinen Wave3-Importer aus und verändert weder Checkpoint, Produktdaten, Produktionsoberfläche, Shared Tests, Workflows noch Media-/Build-Pipeline. Die spätere Übergabe ist in [INTEGRATION.md](INTEGRATION.md) beschrieben.

## Identitätssnapshot reproduzieren

Vom Repository-Root aus einen **neuen** Zielordner außerhalb des Repositories verwenden:

```bash
python3 integrations/restore-source-checkpoint.py --target /tmp/uf-mission-baseline
node integrations/consumer-repair-mission-poc/build-catalog.mjs --source /tmp/uf-mission-baseline --check
```

Ohne `--check` schreibt das Projektionsskript ausschließlich `catalog-snapshot.mjs` und `catalog-lock.json` in diesem Prototypverzeichnis. Vor dem Laden der Baseline-Module prüft es die gepinnte Archivsumme und alle 136 restaurierten Dateien gegen die Archivbytes. Veränderte Quellen werden abgewiesen. Die Projektion liest Identitäten und bestehende Katalogmitgliedschaften; sie berechnet keine Passung, importiert keine neuen Artikel und greift nicht auf das Netzwerk zu.

## Tests und Review

```bash
npm test --prefix integrations/consumer-repair-mission-poc
npm run check --prefix integrations/consumer-repair-mission-poc
```

Browserprüfungen benötigen eine separat installierte Playwright-Version und deren Chromium; im Repository gibt es keine neuen Shared Dependencies. `UF_PLAYWRIGHT_MODULE` bezeichnet optional einen absoluten Pfad zum Playwright-Modul, `UF_CHROMIUM_EXECUTABLE` optional den ausführbaren Chromium-Pfad, `UF_MISSION_QA_DIR` optional einen Ausgabeordner. Beispiel nach einer lokalen Playwright-Installation:

```bash
UF_PLAYWRIGHT_MODULE=/absoluter/pfad/node_modules/playwright/index.mjs npm run test:browser --prefix integrations/consumer-repair-mission-poc
```

Ergebnisse und Einschränkungen: [VALIDATION.md](VALIDATION.md). Die PNGs unter `qa/` zeigen ausschließlich diese eigene Oberfläche. [pilot-cases.json](pilot-cases.json) enthält 24 vorbereitete Aufgaben mit echten Katalogidentitäten, darunter 18 schwierige Fälle; sie behaupten keine erhobenen Reparaturereignisse. [PILOT-PROTOCOL.md](PILOT-PROTOCOL.md) und [pilot-results-template.json](pilot-results-template.json) bereiten die noch ausstehenden fünf externen iPhone-Personen, Blindbewertung und Vergleichsmessungen vor. Unbeobachtete Resultate bleiben `null`.

Kein Merge, kein Deployment, keine vollständige Issue-Abnahme durch diesen Draft.
