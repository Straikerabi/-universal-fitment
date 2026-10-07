# Kontakt, Roadmap und Nutzungszahlen

## Aktueller Stand

- Öffentliche Roadmap auf Deutsch und Englisch, im README und im Kontaktbereich verlinkt.
- `#contact` ist über Mehr → Kontakt & Roadmap und die FAQ erreichbar.
- Thema, optionales Gerät/Teil und Nachricht werden im Browser zu einem sichtbaren Entwurf zusammengesetzt. Keine Gerätehistorie, Seriennummer oder persönliche Kontodaten werden automatisch angehängt.
- GitHub-Entwurf und Kopieren sind nutzbar. Beiträge werden erst vom Nutzer auf GitHub veröffentlicht und sind öffentlich. Die App behauptet weder automatischen Versand noch Empfang.
- `src/core/feedback.js` enthält `supportEmail=null` als gezielt vorbereitete Konfiguration. Mit einer echten Betreiberadresse kann ein Mailto-Entwurf aktiviert werden. Ein Mailto-Link öffnet das Mailprogramm; er ist kein serverseitiger Versand und bestätigt keine Zustellung.
- Bestehende Meldungen an Produkt-/Teilseiten bleiben lokale Notizen. Die FAQ erklärt diesen Unterschied.

## Vor einem privaten Kontaktkanal

Abi sollte ein separates Supportpostfach wählen, möglichst unter der späteren eigenen Domain. Das Postfach sollte vor dem öffentlichen Start erreichbar und geprüft sein; die Erstellung muss nicht bis zum Abschluss aller Katalogarbeiten warten.

Danach Betreiberadresse bestätigen, Testzustellung und Antwortweg prüfen und die Konfiguration aktivieren. Für Versand direkt aus dem Formular wird später ein eigener erreichbarer Server-Endpunkt bzw. ein bewusst gewählter Versanddienst benötigt. Zugangsdaten gehören niemals in öffentliches Frontend oder Repository. Empfangsbestätigung erst nach tatsächlicher Serverbestätigung. Missbrauchsschutz, Zustellfehler und Umgang mit Kontaktdaten müssen im gewählten Versandweg behandelt werden.

Für diese Nacht wurden kein Postfach, kein Versanddienst und kein neuer Server angelegt. Es ist keine private E-Mail-Adresse des Repository-Eigentümers als Supportadresse übernommen worden.

## Benutzt schon jemand die App?

Im eigenen App-Code und in der veröffentlichten HTML-Einbindung ist keine zentrale Besucher-/Nutzungsanalyse vorhanden. Lokale Geräte, Meldungen, Suchverlauf und Einkaufsnotizen liefern dem Betreiber keine Gesamtzahl der Nutzer. GitHub-Repository-Traffic ist eine andere Metrik als Nutzung der Pages-App.

Der verfügbare GitHub-Connector lässt den `traffic/views`-Endpunkt nicht zu (INVALID_ARGUMENT). Daher wurde keine Repository-Besucherzahl behauptet. Der Betreiber kann Repository-Traffic unter Insights → Traffic selbst ansehen; die GitHub-Dokumentation beschreibt ein Fenster von 14 Tagen.

Ein sinnvoller späterer erster Messumfang: aggregierte App-Aufrufe, Starts der Gerätesuche, erfolgreiche Modelltreffer, leere Teilelisten und externe Händlerweiterleitungen. Keine Seriennummern, Nachrichteninhalte oder ungefilterten Suchtexte aufnehmen. Testaufrufe, Bots und echte Nutzung unterscheiden; fehlende Messung niemals als null Nutzer ausgeben. Tool, Betreiberzugang und konkrete Dateneinstellungen erst bewusst auswählen und den realen Umfang verständlich dokumentieren.

Primärquellen:
- https://docs.github.com/en/repositories/viewing-activity-and-data-for-your-repository/viewing-traffic-to-a-repository
- https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages

Für diese Nacht wurde kein Analytikdienst eingebunden. Ob schon externe Menschen die App verwendet haben, bleibt aus dem vorhandenen Stand unbekannt.
