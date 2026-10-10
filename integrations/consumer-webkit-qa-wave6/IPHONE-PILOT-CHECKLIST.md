# Spätere echte iPhone-/Safari-Abnahme · noch nicht ausgeführt

Vorlage für einen ausdrücklich freigegebenen, freiwilligen Hardware-/Nutzerpilot. **Keine Kontakte, Termine oder Ergebnisse wurden erhoben.** Linux-Playwright-Simulation und diese leere Vorlage zählen nicht als Testpersonen. Kein Launchbeschluss allein aus Automationszahlen.

## Vor dem Pilot

- Freigegebenen privaten Build/Commit, Datenstand und bekannte Fehler festhalten; W6-B1 nach Owner-Fix erneut prüfen.
- Tatsächliches iPhone-Modell, iOS-/Safari-Version, Anzeige-/Schriftgröße, Sprache, Browser-/Homescreen-Modus und Verbindung dokumentieren. Keine Annahmen aus User-Agent oder Playwright-Gerätenamen.
- Zustimmung zu Zweck und Umfang einholen; jederzeit abbrechbar. Nur anonymen Teilnehmercode verwenden. Keine Kontaktdaten, Seriennummern, Kundenaufträge, Fotos privater Räume oder Tracking in dieser Vorlage speichern.
- Identische Aufgaben vorab festlegen: normale offene reale Pilotmission, abweichende Kennung, leere/gefiltete Baugruppe, synthetisch positiver und negativer Test. Demo immer ausdrücklich erklären.
- „Bestanden“, „fehlgeschlagen“, „blockiert“, „nicht durchgeführt“ und „nicht anwendbar mit Grund“ getrennt führen. Unbeobachtete Werte bleiben `null`.

## Hardware-Fälle

| Fall | Tatsächliche Aktion | Zu beobachten |
| --- | --- | --- |
| H01 · Start/Navigation | Safari, echte Drehung Hoch/Quer, sichere Bereiche, Scrollen | kein verdeckter Inhalt durch Safari-Leisten, Notch, Bildschirmtastatur oder Safe Areas; Zustand bleibt passend |
| H02 · Schrift | iOS größere Schrift + Safari-Seitenzoom; 200-%-Anforderung getrennt dokumentieren | Beschriftungen/Varianten vollständig lesbar, kein Überlaufen oder unbedienbares Menü |
| H03 · Touch | Baugruppen, verschachtelte Quellen, Filter, Checkliste, Entfernen bedienen | tatsächliche Trefferflächen, keine Fehlberührungen/versehentlichen Auswahlverluste |
| H04 · VoiceOver | Einschalten; Rotor, Überschriften, Fieldset/Legend, Zustandswechsel, Live-Meldungen | sinnvolle Reihenfolge/Namen, auf-/zu-Zustand, aktive Stufe, verständliche offene Passung; keine behauptete Zertifizierung |
| H05 · Eingabe | echte Gerätekennung ablesen, eigene Angabe separat notieren | Quellenreferenz, Produktcode, Markt und Nutzerangabe bleiben unterscheidbar; kein ähnliches Modell wird automatisch gewählt |
| H06 · Passung | reale offene sowie klar synthetische positive/negative Szene | keine reale Positiv-, Kauf- oder Setfreigabe; negative Demo nicht als Einkaufsposition |
| H07 · Filter/Listen | Kandidat vormerken, ausfiltern, wiederfinden, ausdrücklich entfernen | Vormerken erhalten, offene Angaben/Teile/Belege getrennt, leere Liste erklärt |
| H08 · Kalt offline | Website-Daten in Safari löschen, Flugmodus/WLAN aus, neu öffnen | kein erfundener gespeicherter Zustand; ehrlicher Verbindungs-/Startfehler |
| H09 · Warm offline | einmal vollständig vorwärmen, echten Flugmodus, Tab schließen/neustarten | gespeicherte gleiche UI/Datenversion, offene Prüfliste; Quellenlinks nicht als neu geprüft ausgeben |
| H10 · Offline-Löschung | gespeicherte Vorschau entfernen, Mission separat löschen | Cache und Notizen separat behandelt; nach Cache-Löschung kein ungerechtfertigtes Offlineversprechen |
| H11 · Speicher/Version | Website-Speicher verweigern/verdrängen, privaten Modus, Update/mehrere Tabs testen | nonfataler Exportweg, keine stale Freigabe, konsistente Versionsgrenze; Quota-/Eviction-Verhalten ehrlich dokumentieren |
| H12 · JSON/Text | Prüfpass in iOS-Dateien herunterladen/teilen, Bytefolge extern prüfen | korrektes JSON/SHA-256; veränderter Payload ohne neue Prüfsumme wird verweigert; keine Signatur/OEM-Freigabe behaupten |
| H13 · Homescreen | nur nach Freigabe „Zum Home-Bildschirm“, Start/Beenden/Offline | echte Installation/Standalone-Darstellung getrennt von Safari-Browser dokumentieren |
| H14 · Hell/Dunkel | Systemdarstellung ändern, Fokus/Status-/Warnfarben betrachten | Warnung und Quellenstatus bleiben verständlich; reale Kontrast-/Lesbarkeitsprobleme notieren |

## Menschliche Messung, nicht erfinden

Pro vorab definierter Aufgabe: tatsächlichen Start/Ende, freiwilligen Abbruch, beobachteten Abschluss, Hilfebedarf, Fehler und Missverständnisse notieren. Aufgabe erfolgreich vorbereitet bedeutet **nicht** reale Passung oder Reparatur gelungen. Automatische Skriptlaufzeiten sind keine menschlichen Bearbeitungszeiten.

Abbruch-/Erfolgsraten erst aus vollständig dokumentierten echten Beobachtungen mit explizitem Nenner berechnen. Keine hypothetische Conversion-Rate, keine Mischung mit den 66 Automationsfällen oder historischen 24 Skriptaufgaben. Kleine Stichprobe und fehlende repräsentative Geräte-/Nutzerabdeckung ausdrücklich nennen. Die ersten Felder stehen in [human-pilot-template.json](human-pilot-template.json); die Vorlage enthält bewusst keine Beispielerfolge.

Hardware-/Accessibility-Mängel, rechtliche/Quellen-/Angebotsfreigaben und Feldverständnis müssen unabhängig vom Browser-Gate reviewt werden. Freigabeinstanz/Datum erst bei tatsächlicher Entscheidung eintragen.
