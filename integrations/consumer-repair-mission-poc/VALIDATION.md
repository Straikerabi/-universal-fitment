# Validierung vom 09.10.2026

Der isolierte UI-Umfang ist implementiert und automatisiert geprüft. Die vollständige menschliche/Safari-Abnahme von #49 ist noch offen; dieser Bericht behauptet keine getestete reale Reparaturpassung und keine Überlegenheit gegenüber Vergleichsangeboten.

## Ausgeführt

| Prüfung | Ergebnis | Aussagegrenze |
| --- | --- | --- |
| Node-Test-Suite | 25 bestanden, 0 Fehler | Zustandsübergänge, Quellen-/Cachegrenzen, Namespace-Trennung, Export, Preview-Server |
| Browser-Suite | 21 Prüfgruppen bestanden | Playwright mit Chromium 153.0.8010.0; mobile Viewports, kein physisches iPhone |
| Pilot-Aufgaben | 24 automatisierte UI-Abläufe, jeweils realer Status offen | vorgegebene Quellenaufgaben, keine erhobenen menschlichen Zeiten oder OEM-Fitment-Genauigkeit |
| Externe UI-Requests | 0; alle nicht lokalen Requests im Test blockiert | Herstellerlinks wurden nicht als Händlerangebote geöffnet |
| Datenprojektion | byteidentische Reproduktion; veränderter Checkpoint abgewiesen; Ausgabe unverändert | 136 Baseline-Dateien gegen Archivbytes, kein neuer Artikel oder Fitment |
| Syntax und Branch-Scope | bestanden auf `work/consumer-repair-mission-poc` | ausschließlich dieser Prototypordner; keine Produktions-/Shared-Dateien |
| Eigene Medien | zehn UI-PNGs visuell geprüft | eigene SVGs und eigene Oberfläche, keine fremden Diagramme |

Maschinenlesbare Browserdetails und tatsächliche automatisierte Millisekunden: [qa/browser-results.json](qa/browser-results.json). Reproduktions-/Driftprüfung: [qa/projection-results.json](qa/projection-results.json). Prüflingshashes und Umgebung: [qa/validation-results.json](qa/validation-results.json). Automatisierte Laufzeiten sind ausdrücklich keine menschlichen Aufgabenzeiten.

## Browserabdeckung

Alle fünf realen Schritte wurden bei 320×740, 375×812, 390×844, 430×932, 844×390, 768×1024 und 1280×900 geprüft. Es gab keine horizontale Seitenüberbreite oder abgeschnittenen geprüften Buttons, Formularfelder, Quellenfelder, Statuskarten und fehlenden Angaben. Unklare, negative und unvollständige Demo-Antworten wurden zusätzlich bei 320/390/430 Pixeln durchlaufen.

Große Schrift (200 % Root-Schriftgröße), Dark Mode und Reduced Motion erhielten die sichtbaren Demo-/Negativhinweise. Die Tests prüfen mindestens 44 Pixel hohe Buttons und mindestens 16 Pixel große Eingabetexte. Der Skip-Link erscheint bei Tastaturfokus und verdeckt die Oberfläche nach dem Schrittwechsel nicht. Quellen-Details sind über die Tastatur bedienbar. Diese Prüfungen ersetzen keine vollständige Barrierefreiheits- oder Safari-Zertifizierung.

Verifizierte Gegenproben: Samsung EEM statt dokumentiertem EEK, `/WA` statt `/WD`, fehlender Bosch-Index, nicht dokumentierter Artikelbereich, ungeklärte Revision, synthetisch abweichender Akkuanschluss, fehlende Demo-Paketposition, anderer Geräte-/Variantenkontext und manipulierte gespeicherte Antworten. Für reale Daten bleibt auch nach „Kennung bekannt“ oder abgehakten Notizen jede Passung offen. Negative Demo-Positionen gelangen nicht in die Teileliste.

Nach der Sichtprüfung wurden ein zuvor sichtbarer Skip-Link, umbrechende lange Checklistenangaben und die Schrittnavigation bei großer Schrift korrigiert; die abschließenden Browserergebnisse beziehen sich auf die korrigierte Oberfläche.

## Reproduzieren

Die Befehle und optionalen Playwright-Pfade stehen in [README.md](README.md). In dieser Umgebung liefen Node.js 24.19.0, Playwright 1.62.1 und ein lokal verfügbarer Chromium-Build 153.0.8010.0. `UF_PLAYWRIGHT_MODULE` und `UF_CHROMIUM_EXECUTABLE` wurden auf lokale Installationen gesetzt; Browserbinärdateien und Playwright-Pakete sind nicht Bestandteil des PRs. Die Browser-Suite startet und beendet ihren eigenen zufälligen Loopback-Port.

Der zusätzliche Driftcheck verwendete eine temporäre Kopie der restaurierten Baseline, änderte ausschließlich deren `package.json`-Bytes und verifizierte den Abbruch vor dem Laden der Katalogmodule. Snapshot und Lock blieben byteidentisch. Die temporäre Kopie wurde anschließend entfernt.

## Ausstehend und nicht als bestanden gewertet

- **Physisches iPhone/Safari:** nicht ausgeführt. WebKit konnte in dieser Umgebung wegen fehlender Systembibliotheken nicht starten; die Systemabhängigkeiten ließen sich hier nicht installieren. Chromium-Ergebnisse werden nicht als Safari-Ergebnisse ausgegeben.
- **Fünf externe Testpersonen und Blindtest:** nicht durchgeführt; keine Personen oder Resultate erfunden. Aufgaben, Definitionen, Gegenproben und leeres Ergebnisformular liegen bei.
- **Vergleichsmessung:** zwei öffentliche Sucheinstiege recherchiert, keine Zeiten/Klicks/Richtigkeitsdaten erhoben und keine Preise/Angebote kopiert.
- **Reale definitive Passungen:** warten auf den versionierten Core aus #48 und die unabhängige Wave3-Integration #54. Die UI ist kein Ersatz für diese Entscheidungen.

Im Draft-PR keine automatische Schließung von #49; kein Merge und kein Deployment.
