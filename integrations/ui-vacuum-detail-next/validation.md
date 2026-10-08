# Prüfbericht · 8. Oktober 2026

Basis: v1.27.1, Commit `6545d9affb6b3c6c04b8d585084f2094a09e77b1`.
Der Ausgangsstand wurde per Prüfsumme aus dem Quellcheckpoint wiederhergestellt.
Nach dem notwendigen lokalen Bundle-Bau waren alle 36 bestehenden
App-Testgruppen und Syntaxprüfungen erfolgreich.

## Ergebnis nach der UI-Änderung

| Prüfung | Ergebnis |
| --- | --- |
| `npm test --prefix site` | 37 Testgruppen erfolgreich, einschließlich der neuen UI-Logikprüfung |
| `npm run check --prefix site` | Bestehende und neue Syntaxprüfungen erfolgreich |
| `node integrations/build-app.mjs --check` | Hauptbundle und alle optionalen Pakete bytegenau reproduzierbar |
| `apply.test.py` | Frischer Checkpoint, exakt fünf geänderte/neue Dateien, bytegleiche übrige Dateien, zweiter Lauf ohne Änderungen, abweichende UI-Datei ohne Überschreiben verweigert |
| Playwright / Chromium 153.0.8010.0 | 14 Browser-Prüfgruppen erfolgreich, keine JavaScript-Seitenfehler |
| Mobile Umbrüche | Kein horizontaler Seitenüberlauf bei 320/375 px; ebenso 768/1280 px und 200 % CSS-Textvergrößerung bei 375 px |
| Visuelle Prüfung | Sechs Screenshots geprüft: zwei Marken mit Artikeln, leere Modellliste, ungeladene Marke, dunkle Darstellung, Textvergrößerung |

## Abgedeckte Funktionen

- Startseite lädt keine Detailpakete vorzeitig. Native Kategorien lassen sich
  mit Enter und Leertaste öffnen/schließen. Gemeinsame Sortierung erhält die
  geöffneten Kategorien; lokale Sortierung lässt andere Kategorien und den
  Fokus unverändert.
- Preisgrenzen mit Komma/Punkt sind inklusive; ungültige und umgekehrte
  Grenzen haben beschriftete Fehlermeldungen. Leere Felder sind keine Null.
  Fehlende, negative, ungültige, fremdwährungs-, Netto- und Staffelpreise
  können keinen günstigen EUR-Treffer erzeugen. Nicht vergleichbare Werte
  stehen bei auf- wie absteigender Preissortierung am Ende.
- Suche, Original-/Nachbau-, Artikelart-, Bauteil- und Zuordnungsfilter
  verwenden nur die bestehenden Modellartikel. Kein Geräteindex wird als
  passende Ausführung bestätigt. Modellobjekte und Kennungen bleiben vor/nach
  Hydration identisch; alle acht Detailpakete werden in der Logikprüfung
  untersucht, inklusive leerer und befüllter Modelllisten.
- Im Browser wurden Miele/Bosch-Kerndaten durch die App-Regressionstests sowie
  konkrete Bosch-, Samsung- und Hoover-Zustände durch UI-Flows geprüft. Die
  vollständigen Samsung-/WD- und /XEG-Codes sowie der Hoover-Produktcode
  bleiben sichtbar. Eine leere erfasste Liste wird von einem Filter ohne
  Treffer und einem noch nicht geladenen Paket unterschieden.
- Der Foto-Button öffnet keine Artikelroute. Der Artikel-Button lässt sich
  per Tastatur bedienen. Warenkorb-Teilenotizen, Gerätespeicherung,
  Sicherungsdownload und Importvorschau funktionieren weiterhin.
- Fehlgeschlagener Markenabruf lässt sich tatsächlich wiederholen. Eine
  bereits gecachte Samsung-Marke funktioniert nach Offline-Neuladen; eine
  ungecachte Hoover-Marke zeigt offline den Ladefehler und ihre Gerätekennung.
  Der Service-Worker und seine Cache-/Auth-Ausschlüsse wurden nicht geändert.

## Grenzen und Integration

Getestet wurde Desktop-Chromium mit mobilen Viewports. Ein physisches iPhone,
Safari/WebKit, VoiceOver/TalkBack, eine eingeblendete Smartphone-Tastatur und
das reale PWA-Installationsdialogverhalten sind noch nicht manuell geprüft.
Die 200-%-Prüfung vergrößert die CSS-Basisschrift; sie ersetzt keine Prüfung
aller Betriebssystem- und Browser-Zoomvarianten. Herstellerbilder wurden
absichtlich nicht extern abgerufen; Symbole und Foto-Ladebuttons wurden
geprüft. Keine Live-Händlerangebote oder Herstellerpassung wurden behauptet.

Das Prüfskript des Pakets ist im Entwurfs-PR enthalten, aber nicht in die
produktive Pages-Workflowkette eingebunden. Die Projektleitung muss den Patch
mit den Katalog-Branches zusammenführen, erneut bauen/testen und die
Release-/Cache-Version gemeinsam festlegen. Dieser Branch führt keinen
Versionswechsel, Merge nach `main` oder Deployment aus.
