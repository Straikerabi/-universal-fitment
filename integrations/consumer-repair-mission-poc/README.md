# Consumer-Reparaturmission · mobile UX Wave 4

Der lokale Consumer-Prototyp führt von der Gerätekennung über Ausführung und Baugruppe zur begründeten Prüfansicht und einer gespeicherten Checkliste. [#63](https://github.com/Straikerabi/-universal-fitment/issues/63) ergänzt aufklappbare Baugruppen, Teilefilter, stabile Sortierung und getrennte Listen für offene Angaben, vorgemerkte Kandidaten und Vorbereitung. Alle Änderungen liegen in diesem Verzeichnis auf `work/consumer-mobile-ux-wave4`; Reviewziel ist `integration/dual-platform-owner-review` ab `52f056664ddbf1a6c263a3d86feac3ee0128c054`.

**Reale Passungen bleiben unbestätigt.** Die Owner-Integration aus [Draft #59](https://github.com/Straikerabi/-universal-fitment/pull/59) verbindet die synthetischen UI-Testfälle bereits mit der gemeinsamen v1-Engine. Diese Anbindung bleibt erhalten; es gibt keinen zweiten Consumer-Core. Ein positives Demoergebnis ist keine reale OEM-Freigabe. Die Datenintegration aus [#61](https://github.com/Straikerabi/-universal-fitment/issues/61) bleibt beim Owner und ist in diesem historischen Pilot-Snapshot nicht enthalten.

## Lokal starten

Node.js 22 oder neuer; keine Laufzeitpakete, kein Build und kein Konto:

```bash
npm start --prefix integrations/consumer-repair-mission-poc
```

Vorschau: `http://127.0.0.1:4179`. Der Server bindet ausschließlich an Loopback. Seine feste Dateiliste enthält die Consumer-Oberfläche und die fünf bereits verwendeten Shared-Module aus #59. GET/HEAD sind erlaubt; fremde Hosts/Origins, private Dateien und Proxyanfragen werden abgewiesen. Die Seiten-CSP blockiert Netzwerkdienste, Frames und Formulare. Nur der lokale Offline-Worker darf die freigegebenen lokalen Ressourcen speichern. Keine Händlerfeeds, Analysen, OEM-Bilder oder Cloud-Services werden geladen.

## Ablauf

1. **Gerät:** genaue Modell-/Materialkennung suchen und einen Eintrag ausdrücklich wählen. Ähnliche Modelle werden nicht automatisch übernommen.
2. **Ausführung:** Quellenkennung, Markt und vorhandenen Produktcode vergleichen; eigene Kennung optional lokal notieren. Länderzusätze, Revisionen und abweichende Angaben bleiben sichtbar und ungeprüft.
3. **Baugruppe:** Filter/Beutel, Bürsten/Düsen, Akku/Elektrik, Schläuche und Gehäuse als native aufklappbare Bereiche. Jede Gruppe trennt belegte Identitätskandidaten von **0 bestätigten realen Teilen**. Die eigene neutrale SVG dient nur der Orientierung, nicht als modellgenaues Diagramm.
4. **Passung:** Gründe, fehlende Angaben und Identitätsbelege getrennt ansehen. Kandidaten nach wörtlichem Namen/Teilecode, Baugruppe, Teileart und Identitätsnachweis eingrenzen; innerhalb der Gruppe nach Name oder Code sortieren. Preise sind mit sichtbarer Begründung deaktiviert. Es gibt keine Kaufbuttons, Angebote oder Lieferzusagen.
5. **Checkliste:** „Noch zu klären“, „Vorgemerkte Prüfkandidaten“ und „Gerät & Belege“ behalten Quellen und Prüfstatus. Kandidaten lassen sich ausdrücklich entfernen. Text kopieren/herunterladen enthält weiterhin unbestätigte Passungen. Abhaken bestätigt weder Einbau noch Vollständigkeit.

Filter verändern keine Passung und löschen keine vorgemerkten Kandidaten. Eine ausgeblendete Auswahl bleibt in der Checkliste. Geräte-, Varianten- und Baugruppenwechsel verwerfen kontextfremde Auswahl/Erledigt-Markierungen; erneutes Auswählen derselben Baugruppe erhält sie. Eine Liste ohne Filtertreffer unterscheidet sich von einem Bereich ohne dokumentierten Artikel. Beides behauptet keine Nichtverfügbarkeit.

## Daten und Quellen

| Umfang | Stand dieser UI |
| --- | --- |
| Review-Basis | Owner-Integration #59, Commit `52f056664ddbf1a6c263a3d86feac3ee0128c054` |
| Identitäts-Snapshot | unveränderter v1.29.0-Checkpoint aus `71f7826ba936a1f3830c8b2a67e8085a9cfe234e` |
| Checkpoint | SHA-256 `c600a5c5a83a6f096ff5999e5ce5582c37ec424155919d487dfd6ca2221bd42b`, 136 Dateien |
| Reale Identitäten | 11 Geräte und 11 vorhandene Originalteil-Identitäten; Miele, Bosch, Samsung, Hoover, Dyson |
| Quellenbeobachtungen | 06./08.10.2026; keine neue Live-Verifikation durch #63 |
| Bestätigte reale Teile / neue Fitments | 0 / 0 |
| Gemeinsame v1-Engine | bestehende Anbindung für fünf ausdrücklich synthetische Demo-Szenen |
| Wave3-Datenmigration | noch nicht enthalten; getrennte Owner-Aufgabe #61 |

[SOURCE-MANIFEST.md](SOURCE-MANIFEST.md) dokumentiert unveränderte Originalquellen und Identitätsgrenzen. `catalog-snapshot.mjs`, `catalog-lock.json` und der Projektionsimporter bleiben bytegleich zur Review-Basis. Die historischen Felder `engineIntegrated: false` und `wave3Integrated: false` beschreiben den Snapshot, nicht die spätere synthetische Owner-Anbindung. `candidatePartIds` sind bestehende Katalogmitgliedschaften, keine neu bestätigten Fitments.

„Originalteil-Identität belegt“ bedeutet ausschließlich Hersteller-Artikelidentität mit vorhandenem Originalbeleg und Kennung. Es gibt keine belegten Alternativteile in diesem Ausschnitt; der entsprechende Filter liefert einen erklärten leeren Zustand. Die Teileart „Akku / Elektrik“ fasst bestehende elektrische Kategorien zusammen, ohne die historische Taxonomie umzuschreiben. Preise, Verfügbarkeit, Bilder und alternative Artikel werden nicht ergänzt.

EEK wird nicht aus EEM abgeleitet, `/WA` nicht auf `/WD` übertragen und ein gemeinsamer Miele-Gerätetyp wählt kein Modell automatisch. `VCA-SAPB95/WA` bleibt ein Artikelcode. Hoover U112 / `35602893` hat einen GB-Webbeleg (`en_GB`), während das ausgewählte HF202P 011 im DE-Katalog steht: Beide Quellenregionen sind ausdrücklich sichtbar, eine grenzüberschreitende Passung wird nicht angenommen. Y81 / `35602897` bleibt mangels genauer Artikelquelle ausgelassen.

## Lokale Speicherung und Offline-Vorschau

Notizen liegen nur im Browser; reale Mission und synthetische Demo haben getrennte Speicher. Schema 2 und ein Fingerprint aus Identitätsdaten, bestehendem Shared-Core und Demo-Fixtures weisen alte oder manipulierte gespeicherte Antworten ab. Keine FitmentResponse wird gespeichert. Nach Wiederherstellung werden Antworten aus dem aktuellen Kontext neu abgeleitet. Schema-1-Notizen werden zurückgesetzt; vorherige Exporte bleiben nutzbar.

Nach einem erfolgreichen Online-Start kann der lokale Service Worker genau 17 freigegebene URL-Pfade atomar speichern. Er hält UI, Identitätssnapshot und unveränderte Shared-Module derselben Version zusammen. Es gibt keine dynamischen Daten- oder OEM-Seiten-Caches. Ein kalter, nicht gespeicherter Offline-Start benötigt eine Verbindung. Die Statusanzeige unterscheidet gespeicherte Vorschau, laufende Sitzung und gesperrten Speicher; externe Herstellerbelege lassen sich offline nicht neu öffnen.

„Offline-Vorschau entfernen“ löscht nur den eigenen Vorschau-Cache und dessen Worker, nicht die Prüfliste. „Mission löschen“ betrifft nur den aktuellen Datenmodus. Bei gesperrtem Local Storage bleibt die laufende Sitzung samt Textexport nutzbar. Keine Aufrufe an Tracking-, Kauf- oder Cloud-Dienste.

Nach UI-/Worker-/Server-Änderungen:

```bash
npm run offline:prepare --prefix integrations/consumer-repair-mission-poc
npm run offline:check --prefix integrations/consumer-repair-mission-poc
```

## Reproduktion und Tests

Die Datenprojektion lässt sich unverändert und ohne Schreibzugriff prüfen. Vom Repository-Root einen neuen Zielordner außerhalb des Repositories verwenden:

```bash
python3 integrations/restore-source-checkpoint.py --target /tmp/uf-mission-baseline
node integrations/consumer-repair-mission-poc/build-catalog.mjs --source /tmp/uf-mission-baseline --check
npm test --prefix integrations/consumer-repair-mission-poc
npm run check --prefix integrations/consumer-repair-mission-poc
```

Der bestehende Datenimporter bleibt für Schreibvorgänge an seinen ursprünglichen Branch gebunden. #63 führt ihn ausschließlich mit `--check` aus. Er prüft die Archivsumme und alle 136 restaurierten Dateien vor dem Laden von Datenmodulen. Kein Netzwerkzugriff oder neue Kompatibilitätsberechnung.

Browserprüfungen benötigen separat Playwright 1.62.1 und Chromium; keine Shared Dependencies werden hinzugefügt:

```bash
UF_PLAYWRIGHT_MODULE=/absoluter/pfad/node_modules/playwright/index.mjs UF_CHROMIUM_EXECUTABLE=/absoluter/pfad/chromium npm run test:browser --prefix integrations/consumer-repair-mission-poc
```

Standardausgabe ist `qa-wave4/`; `UF_MISSION_QA_DIR` kann einen anderen Ausgabeordner wählen. Aktuelle Ergebnisse, Screenshots und Grenzen stehen in [WAVE4-VALIDATION.md](WAVE4-VALIDATION.md). [VALIDATION.md](VALIDATION.md) und `qa/` bleiben als historische #49-Prüfung erhalten. Die 24 Pilotaufgaben sind automatisierte Ablaufprüfungen mit vorhandenen Identitäten, keine erhobenen Reparaturereignisse oder Tests mit externen Personen. Das unveränderte [PILOT-PROTOCOL.md](PILOT-PROTOCOL.md) beschreibt die spätere Feldprüfung.

Kein Merge, kein Deployment. Die Grenzen zur Owner-Integration stehen in [INTEGRATION.md](INTEGRATION.md).
