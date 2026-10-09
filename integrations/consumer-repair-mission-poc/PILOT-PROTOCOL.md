# iPhone-Pilot und Blindbewertung · vorbereitet, noch nicht durchgeführt

Status am 09.10.2026: **0 externe Personen, 0 physisch validierte Reparaturfälle, 0 Vergleichsmessungen.** Die automatisierten Abläufe unter `qa/browser-results.json` sind keine Nutzerstudie. #49 bleibt hinsichtlich seiner Feldabnahme offen. Die fünf synthetischen Szenen zählen nicht als reale Pilotfälle.

## Material und Rekrutierung

`pilot-cases.json` enthält 24 Aufgaben auf 11 bestehenden Geräteidentitäten mit Originalquellen, OEM-Kandidaten nur dort, wo dokumentiert, und 18 schwierigen Aufgaben. Es handelt sich um vorbereitete Fragestellungen, keine behaupteten Defekte. P23/P24 sind ausdrücklich Gegenproben mit absichtlich ungesicherter Eingabe beziehungsweise Region; sie erzeugen keinen zusätzlichen realen Katalogeintrag.

Fünf externe Personen mit tatsächlich eigenem iPhone einladen; keine erfundenen Personen oder Stellvertreter durch Browserautomatisierung. Anonyme IDs T01–T05 genügen. Modell, iOS/Safari-Version, Datum und Zustimmung zur anonymen Messung notieren. Keine Seriennummern, privaten Fotos oder Kontodaten in Git speichern. Noch wurden keine Personen kontaktiert.

Jede Person erhält sechs Aufgaben, mindestens zwei davon schwierig. Die Zuordnung muss alle 24 eindeutigen Aufgaben abdecken; sechs Wiederholungen ermöglichen den Vergleich zwischen Personen. Vor Beginn müssen unabhängige Quellenprüfer die jeweilige vollständige Geräteausführung und die OEM-Befundlage prüfen. Eine vorhandene Gerätequelle ohne gerätegenauen Ersatzteilbeleg zählt als „unklar“. Falls physische Geräte fehlen, den Fall als Quellenaufgabe markieren; er erfüllt keine physische Reparaturabnahme.

Die Entwickler erstellen ein neutrales Aufgabenblatt ohne vorgesehene Statusantwort. Auf dem iPhone lokal prüfen, ohne eine öffentliche Vorschau zu deployen; beispielsweise den vorhandenen Localhost-Prototyp über einen USB-Port-Forward zum Testgerät öffnen. Zugriffsmethode tatsächlich protokollieren; der beigefügte Server bleibt auf Loopback. Synthetische Demonstrationen dürfen anschließend separat gezeigt werden, fließen aber nicht in reale Trefferraten ein.

## Vergleich und Reihenfolge

Als Vergleichsangebote sind bestehende öffentliche Ersatzteil-Suchen vorgesehen; ihre Einstiegslinks stehen im Ergebnisformular. Vor der Sitzung prüfen, ob die jeweilige Suche ohne Konto zugänglich ist und den betreffenden Fall überhaupt unterstützt. Kein Anbieter wird hier als lieferfähig oder modellgenau passend bestätigt. Während der Studie keine Bestellungen auslösen.

Vorbereitete Einstiege, auf den Originalseiten am 09.10.2026 recherchiert: [FixPart · Staubsauger-Ersatzteile](https://fixpart.de/staubsauger-ersatzteile) und [ersatzteilshop.de · Geräte-/Typennummer-Suche](https://www.ersatzteilshop.de/ersatzteile-fuer/staubsauger). Hier wurden ausschließlich die Such-Einstiege festgestellt; kein Fallvergleich, keine Preise und keine Lieferbarkeit gemessen. Anbieterbilder und Texte werden nicht in die UI übernommen.

Pro Person für jede Aufgabe Universal Fitment und mindestens eine Vergleichssuche prüfen. Wenn zwei Vergleichsangebote verwendet werden, beide separat auswerten. Die Reihenfolge zwischen Personen und Aufgaben wechseln; keine Wiederholung eines identischen Falls immer mit Universal Fitment beginnen. Aufgabentext, Suchzeitlimit (vorab fünf Minuten), Quellenzugang und Definition einer erfolgreichen Antwort bleiben für alle Angebote gleich. Lern-, Reihenfolge- und Abdeckungsunterschiede dokumentieren.

## Erhebung und Definitionen

| Messung | Definition |
| --- | --- |
| Zeit | Sekunden vom sichtbaren Aufgabenblatt bis zur protokollierten finalen Antwort; Lade-/Verbindungsprobleme separat kennzeichnen |
| Klicks/Taps | bewusste Aktivierungen von Links, Buttons, Auswahlfeldern oder Checkboxen; Scrollen und einzelne Tastatureingaben separat als Suchtexteingaben zählen |
| Geräteidentität | vollständige OEM-Geräte-/Variantenkennung korrekt, unvollständig oder falsch; Markt/Revision nicht aus einer Familie erraten |
| Finaler Status | „belegt“, „unklar“ oder „belegt nicht passend“, einschließlich Originalbeleg und noch fehlender Angabe |
| Richtigkeit | unabhängiger Befund und Antwort stimmen in Status, Variante und Begründung überein; begründetes „unklar“ kann korrekt sein |
| Falsch positiv | positive Passungsbehauptung ohne erforderlichen Beleg oder trotz Ausschluss; separat unter allen Aufgaben und unter positiven Antworten berichten |
| Vollständigkeit | gefundene notwendige Positionen gegen unabhängig belegte Reparaturaufgabe prüfen; offene Positionen und fehlende Ground Truth separat ausweisen |
| Selbsthilfe | ob die Person den Grund und den nächsten Klärungsschritt nach eigener Aussage versteht; wörtliche anonyme Rückmeldung nur mit Zustimmung |
| Ungünstiger Befund | Abbruch, Zeitlimit, Fehlidentifikation, falsche Sicherheit, unverständliche Begründung oder nicht dokumentiertes Teil unverändert aufnehmen |

In der heutigen UI ist jede reale Passung offen. Eine Null bei automatisierten positiven Freigaben belegt die konservative UI-Grenze, **keine** reale Treffergenauigkeit, Reparatursicherheit oder bessere Leistung gegenüber Anbietern. Menschliche Zeiten/Klicks und OEM-Fitment-Richtigkeit bleiben bis zur Erhebung `null`.

## Blindbewertung

1. Prüfer A erstellt vor dem Test ein unabhängiges Quellenblatt mit genauer Kennung, Markt, Revision, Originalquelle, Abrufdatum und Unsicherheiten. Die UI-Entwickler dürfen dessen Ergebnis nicht als neue Passung in diesen Prototyp importieren.
2. Moderator B führt die Sitzungen mit neutralem Aufgabenblatt durch und protokolliert Antworten, Zeit, Aktivierungen und Abbrüche ohne Hilfestellung zur Lösung. Alle ungünstigen Fälle bleiben im Datensatz.
3. Prüfer C erhält nach der Sitzung anonymisierte Antworten mit zufälligen Angebotscodes statt Marken-/UI-Namen und beurteilt sie gegen das getrennte Quellenblatt. Vollständige Verblindung kann durch zitierte Anbieterquellen scheitern; solche Fälle ausdrücklich markieren.
4. Erst danach Angebotscodes auflösen und Unterschiede berichten. Bei strittigem OEM-Befund keine Richtigkeitszahl erzwingen: Befund bleibt offen. Anzahl fehlender/strittiger Quellen, Ausfälle und Ausschlüsse mit Nenner veröffentlichen.

## Offene Abnahme

- [ ] Fünf echte externe iPhone-Personen dokumentiert.
- [ ] 20–30 reale, unabhängig belegte Aufgaben validiert; mindestens fünf schwierige/negative Fälle.
- [ ] Safari auf physischen iPhones einschließlich schmaler Ansicht, großer Schrift, Tastatur und Wiederaufnahme geprüft.
- [ ] Mindestens ein tatsächliches Vergleichsangebot gemessen; Reihenfolge und Abdeckung dokumentiert.
- [ ] Blinde Richtigkeitsbewertung einschließlich ungünstiger Ergebnisse, positiver Treffer und aller fehlenden Belege durchgeführt.
- [ ] #48-/#54-Anbindung für echte definitive Antworten separat freigegeben und geprüft.

`pilot-results-template.json` ist ein leeres Erhebungsformular. `null` bedeutet „nicht erhoben“, `0` wird nur für tatsächlich gezählte Ereignisse verwendet. Keine Felder automatisch mit Browserlaufzeiten als menschliche Daten befüllen.
