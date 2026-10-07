# Universal Fitment v1.22.0 – sieben Marken mit Originalteilen und Geräteanleitungen

Der öffentliche Staubsaugerkatalog enthält **658 Modellbezeichnungen, 669 Modellreferenzen und 1478 unterschiedliche Ersatzteile/Zubehörartikel** von Miele, Bosch, Dyson, AEG, Rowenta, Philips und Siemens. Neun Miele-Familienhinweise zählen nicht als konkrete Modellreferenzen. Das Ausbauziel bleibt zehn Marken mit je ungefähr 100 echten Modellreferenzen: **549 von 1.000 gedeckelten Zielplätzen** sind belegt. Länder-, R- und Produktionsausführungen werden separat geführt. Die Arbeitsliste ist keine belegte deutsche Bestseller-Rangliste.

| Marke | Modellbezeichnungen | Referenzen | Teile/Zubehör | Direkte Geräteanleitungen |
|---|---:|---:|---:|---:|
| Miele | 57 | 62 | 167 | 57 |
| Bosch | 60 | 60 | 47 | 60 |
| Dyson | 54 | 60 | 191 | 54 |
| AEG | 78 | 78 | 354 | 0 |
| Rowenta | 169 | 169 | 4 | 0 |
| Philips | 139 | 139 | 5 | 137 |
| Siemens | 101 | 101 | 710 | 83 |

AEG und Rowenta haben zusätzlich ihre offiziellen Anleitungsfinder. Die Teilezahl bezeichnet erfasste Originalartikel sowie die bestehenden eng belegten Miele/Bosch-Nachbauten; sie bestätigt keine vollständige Teileversorgung aller Ausführungen.

## Neu in v1.22

**240 echte Philips/Siemens-Modellreferenzen, 715 benannte Originalartikel und 220 direkte Geräteanleitungen** wurden ergänzt. Philips verwendet tatsächlich abrufbare deutsche Home.ID-Geräteunterlagen. Siemens verbindet aktuelle Modelle und ältere Baureihen mit E-Nr.-Teilelisten, Zeichnungspositionen und Explosionszeichnungen. Fehlende Artikelbeschreibungen bleiben am Gerät sichtbar. Die erfasste Siemens-Quelle VSZ7A400 liefert /17; andere /xx-Indizes werden dadurch nicht freigegeben. Details, Quellen und Prüfumfang: [v1.22 Katalogstand](integrations/catalog-goal-v122.md).

Das Hauptpaket und die Kern-Dateien benötigen zusammen **1,412,158 Byte (ca. 1.41 MB unkomprimiert)**. Detaillierte AEG-, Dyson-, Rowenta-, Philips- und Siemens-Pakete laden bei Bedarf und sind nach dem ersten Abruf offline verfügbar. Herstellerfotos, externe PDFs und die optionalen OCR-Downloads kommen getrennt hinzu; PDFs und Fotos werden nicht vorab heruntergeladen. Die Standardansicht zeigt lokale Staubsauger-Illustrationen.

## Gerätekennung, Preise und Einbau

Miele-Materialnummer, Bosch/Siemens E-Nr. mit /xx, AEG-PNC, Dyson-Produktnummer/Generation, Rowenta-Ref. Nr. und Philips /xx/R-Produktcodes haben eigene Prüfwege. Serien-/FD-Kennungen werden nicht als Modell- oder Teilebeweis verwendet. Widersprüchliche oder fremde Markenkennungen werden abgefangen. Modellreferenzen und gespeicherte Preise bestätigen keine Teilepassung; alle neuen gerätebezogenen Artikel bleiben `variant_check_required`.

24 Rowenta- und zehn Siemens-Gerätepreise unterstützen die Budgetfilter: bis 150 EUR, über 150 bis 350 EUR und über 350 EUR. Unbekannte Gerätepreise bleiben offen; Ersatzteilpreise bestimmen kein Gerätebudget. Siemens ergänzt 420 positive Artikelpreise aus den eigenen Herstellerseiten. Lagerbestand und Liefertermin sind hier noch offen. Philips-Artikelpreise bleiben offen. Preisdatum, VAT-/Währungsbasis, Verkaufseinheit und Quelle gehören zum einzelnen Preis; es handelt sich um Quellenstände, nicht um Live-Angebote.

Siemens-Endkundenversand: 4,70 EUR bis 19,99 EUR Warenwert, 5,95 EUR von 20 bis 49,99 EUR und kostenfrei ab 50 EUR, jeweils im Siemens-Warenkorb. Die erfasste Philips-Home-Filterseite nennt kostenlosen Versand ab 20 EUR; der Betrag darunter bleibt offen. Händlergrenzen werden nicht zusammengelegt. Geräteanleitungen, Produktblätter und Explosionszeichnungen sind unterschiedlich gekennzeichnet. Zeichnungen ersetzen keine Reparaturanleitung; ungeklärte Wechsel behalten eine offene Einbauzeit. Bestehende Schätzungen schließen Ladezeit, Trocknung und Fehlersuche aus.

## Warenkorb und Pilot

Teilespezifische eBay-/Amazon-Suchen, Gebrauchtfilter, lokale Teilenotizen und Händlerübergabe sind verfügbar. Die Übergabe öffnet die echte Artikelseite oder eine gekennzeichnete Suche und kopiert auf Wunsch die Einkaufsliste mit Nummern, Menge und Links. Offene Preise, unbestätigte Passung und getrennte Händler bleiben getrennt. Automatische externe Warenkorbfüllung, Bestellungen und eigene Zahlungen sind nicht aktiviert. [Bestellmodell](integrations/checkout.md).

Der bestehende geschützte Marketplace-Server bleibt auf 167 Miele-Teilevorlagen begrenzt. Herstellerkataloge aktivieren keine neue API-Zulassung. Produktionszugänge zu eBay/Amazon und der echte angemeldete Pilot-Test bleiben offen. Supabase-Pilotfreigaben, Auth und Kontingente sind in den [Integrationen](integrations/README.md), [Auth-Unterlagen](integrations/auth-sdk/README.md) und [Server-Unterlagen](integrations/edge/README.md) beschrieben. Auth/API-Antworten gelangen nicht in den Offline-Cache; lokale Geräte und Warenkörbe werden noch nicht mit der Cloud synchronisiert.

JSON-Sicherungen prüfen beim Wiederherstellen bekannte Geräte, konkrete Teilezuordnung und die ursprünglichen Preisstände. Modellobjekte bleiben beim Nachladen stabil. Foto-OCR ist ausdrücklich gestartet, bearbeitbar und abbrechbar. Es werden keine neue Registrierung, Zugangsdaten, kostenpflichtige Abonnements oder Käufe eingeführt.

## Prüfung und offene Inhalte

CI rekonstruiert die App aus Prüfsummen-geschützten Änderungen, verifiziert das reproduzierbare Hauptpaket und sechs optionale Pakete, führt **31 App-Testgruppen**, Syntax- und bestehende synthetische Serverprüfungen aus und veröffentlicht erst danach auf GitHub Pages. Die gebaute Oberfläche wird mit sieben Marken, Budgetfiltern, Geräteanleitungen, Zeichnungen, /xx-Eingaben, Teilepfaden und offenen Warenkorbpreisen geprüft. Diese Prüfungen bestätigen keine physische Teilepassung oder echte Kameraerkennung.

Noch offen: Samsung, Hoover und Vorwerk aus der vorläufigen Zehn-Marken-Liste; weitere echte Modelle für Marken unter 100; vollständige gerätespezifische Teilelisten, breitere belegte Nachbauten, Gerätepreise, einzelne Einbauanleitungen und reale Geräteprüfungen. Bestsellerangaben benötigen eine belastbare Verkaufsquelle. Roboter, Nass-/Trockensauger und eigenständige Handsauger folgen nach dem Boden-/Akku-Katalog. Frühere Ausbauberichte bleiben in den Integrationsunterlagen erhalten.
