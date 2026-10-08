# ENTWURF – NICHT VERÖFFENTLICHEN
## DSGVO-Datenflussblatt und Datenschutzhinweise für Universal Fitment

Eine tatsächlich zutreffende Datenschutzerklärung muss die **konkrete** produktive Technik, Rechtsgrundlagen und Dienstleister abbilden. Dieses Dokument sammelt belegte technische Tatsachen und offene Fragen. **Kein Muster darf als geprüfter Rechtstext in die App kopiert werden.**

| Verarbeitung | Aktuell bekannt | Vor Freigabe noch nachweisen |
|---|---|---|
| Auslieferung der Website | GitHub Pages v1.29.0, künftige kommerzielle Plattform noch offen | Neuer Hostingvertrag, Webserver-/CDN-Logs, IP-Verarbeitung, Löschung, AVV, eingesetzte Subdienstleister |
| Lokaler Gerätepass, Warenkorb, Merkliste | Client-Speicher und Offline-PWA dokumentiert | tatsächliche Speicherarten und -schlüssel, Zweck der Speicherung nach §25 TDDDG, verständliche Löschen-/Resetfunktion |
| Optionaler Login | Supabase Auth mit E-Mail/Passwort für bestehende Piloten, persistSession:false, API Auth Endpoint | tatsächliche produktive Verfügbarkeit, Kontenerstellung/Löschung, Mailversand, Datenfluss, Aufbewahrung und Nutzerrechte |
| Pilot-API | Supabase Edge Function `marketplace-search`, User JWT, Zugriffskontrolle und Quota; Pilotliste derzeit leer | Zugriff-/Fehlerprotokolle, IP-/User-ID-Verarbeitung und Löschfristen, laufende TOMs und AVV |
| Fotos/Herstellerlinks | Quellen und Bilder teilweise erst nach ausdrücklichem Abruf; externe Hosts möglich | alle tatsächlich eingebetteten externen Inhalte mit URL/Host/Zweck; Bildnutzungsrechte/Hotlink-Bedingungen |
| Typenschild, Kamera und OCR | Benutzergeführte Erkennung und Scanner sind implementiert | Test, ob Gerätefotos ausschließlich im Browser verarbeitet werden; externe OCR-Modelle/Netzwerkzugriffe prüfen |
| Amazon/eBay | derzeit normale ausgehende Suchlinks; produktive Marketplace-APIs gesperrt | bei Partnerschaft: trackingfähige Affiliate-Links, Klick-Attribution, Werbekennzeichnung, Empfänger und Aufbewahrung |
| Kontakt und Support | GitHub-Feedback ist öffentlich; eigenes Supportpostfach noch nicht verifiziert | privater Kontaktkanal, Supportdatenfristen, Hinweise vor Übergabe zu GitHub |
| Cookies / Tracking | keine ausreichend belegte vollständige Browser-Netzwerkanalyse | Browser Network Audit vor/nach Interaktion, Service Worker, Cookies/localStorage/IndexedDB, Einwilligung falls erforderlich |

### Pflichtteile der finalen Datenschutzerklärung (Art. 13 DSGVO)
1. Verantwortlicher und erreichbare Anschrift/Kontakt (gegebenenfalls Datenschutzbeauftragter).
2. Konkrete Verarbeitungsvorgänge mit jeweiligem Zweck und **passender** Rechtsgrundlage; bei berechtigtem Interesse genau dieses Interesse.
3. Empfänger und Auftragsverarbeiter einschließlich Hosting, E-Mail/Auth, Analytics falls aktiviert.
4. Drittlandtransfers und passende Rechtsinstrumente, nicht bloß 'Server in Deutschland'.
5. Speicher-/Löschfristen oder Kriterien pro Datentyp.
6. Betroffenenrechte, Beschwerderecht bei einer Aufsichtsbehörde, Widerruf von Einwilligungen und Pflicht/freiwillige Bereitstellung.
7. Technische Browser-Speicherung nach § 25 TDDDG und ggf. echte Einwilligungsentscheidung.
8. Aktualität: Änderungen an Domain, Tracking, Werbeprogrammen, SDKs oder Login erfordern neue Prüfung.

### Sofortige Sicherheitsgrenzen
- Keine fremden Kunden-, Account- oder Authdaten in öffentliche Issues oder Commits.
- Keine Login- oder Trackingaktivierung über ein unpassendes Hosting.
- Kein ungeklärtes Herstellerbild rehosten; kein automatischer Shop-/Produktdaten-Import ohne Nutzungsprüfung.
- **Nicht** behaupten, allein lokales Speichern bedeute automatisch vollständige Datenschutzfreiheit.

Quellen: https://eur-lex.europa.eu/eli/reg/2016/679/oj und https://www.gesetze-im-internet.de/ttdsg/__25.html
