# Universal Fitment — Spezialhändler statt nur Amazon/eBay
Stand: 08.10.2026. Ausschließlich Recherche und Offline-Prototyp. **Keine Werbepartner angenommen, kein Gewerbe registriert, keine Affiliate-Links freigeschaltet, keine Live-Preise.**

## Verifizierte öffentlich beworbene Programme

| Händler | ADCELL-Programm | Veröffentlichte Vergütung | Datenwerkzeuge | Einschränkung |
|---|---|---|---|---|
| Staubsaugermanufaktur | ID 11914, https://www.adcell.de/partnerprogramme/staubsaugermanufaktur | **4,5–7 %** je vergütetem Verkauf | 1 CSV und 1 Deeplink gelistet | Vorwerk, Beutel, Filter, Bürsten; einzelne echte OEM-Codes und CSV-Rechte noch unbekannt |
| ersatzteilshop.de | ID 6277, https://www.adcell.de/partnerprogramme/ersatzteilshop.de | **7–8 %** laut Programmübersicht, FAQ widerspricht dem teilweise | Deeplink; CSV-Zugang nicht bestätigt | Große Ersatzteilauswahl laut Programmbetreiber, aber keine garantierten Teile unseres Katalogs |
| Schraub-Doc | ID 9879, https://www.adcell.de/partnerprogramme/schraub-doc | **7 %** | 1 CSV und 1 Deeplink gelistet | Geräte-/Teileabdeckung muss mit exakten OEM-Nummern geprüft werden |

Weitere potenzielle Direktpartner ohne verifiziertes Affiliate-Programm: https://www.fiyo.de/ und https://www.ersatzteile-24.com/. Keine Provision oder Produktfeed-Nutzung ohne individuelle vertragliche Bestätigung.

**NICHT aufnehmen:** Roboparts CH (https://www.adcell.de/partnerprogramme/roboparts-ch) und Staubbeutel-Discount (https://www.adcell.de/partnerprogramme/staubbeutel-discount), weil ADCELL diese Programme als beendet kennzeichnet.

## Einnahmenmechanik
1. Nutzer sucht Modell/Produktionstyp, und wir zeigen nur vom Hersteller belegte exakte Teile.
2. Ein lizenzierter Händler-Produktfeed liefert ein **verifiziertes OEM-Feld**, Warenpreis, Verfügbarkeit und direkten Produktlink. Eine Verkäufer-SKU ist kein OEM-Nachweis.
3. Ein von Händler/Netzwerk ausdrücklich autorisierter Deeplink wird transparent als Affiliate-/Werbelink beschriftet.
4. Der Nutzer kauft und bezahlt beim Händler; nur der vom Partner bestätigte qualifizierte Kauf erzeugt Provision. Retouren, Cookie-Laufzeit und Produktkategorie können sie ändern.

**Illustration, keine Umsatzprognose:** 40 € tatsächlich provisionsfähiger Umsatz × 7 % = 2,80 € Provision; für ungefähr 1.000 € monatliche Brutto-Provision wären bei identischen Voraussetzungen etwa 358 bestätigte Verkäufe nötig. Falls nur Nettowarenwert abzüglich Umsatzsteuer/Versand provisionsfähig ist, fällt die tatsächliche Provision geringer aus. Unklar sind Traffic, Conversion, Stornos und Kosten.

## Wirtschaftlicher Ausbau
- Start: Spezialhändler statt leere Marktplatzsuchen; Verschleißteile mit wiederkehrendem Kaufbedarf plus exakte OEM-Reparaturteile.
- Nach belastbaren Verkaufsdaten: individuelle Verträge mit Ersatzteil-Fachhändlern/Großhändlern; Partner vergütet nachprüfbare Sales statt bloßer Sichtkontakte.
- Später: unabhängig gekennzeichnete gesponserte Platzierungen, bezahlte B2B-Werkstatt-Zugänge oder Reparaturanleitungen, jeweils erst nach gesonderter Rechts- und Produktprüfung.
- Wachstum: Suchmaschinen-Seiten zu nachgewiesenen Modellkennungen und OEM-Teilen, Quellenqualität, modellgenaue Reparaturhinweise und lizenzierten Fotos. Keine Fake-Bewertungen und keine Hersteller-Partnerschaft vorspiegeln.

## Freigabeplan
1. Gewerbe/Unternehmeridentität, geeigneter Host, Domain, Impressum, Datenschutz und ggf. Auslands-Affiliate-Umsatzsteuer klären.
2. ADCELL-Publisher-Account **erst dann** anlegen und für jeden Händler gesonderte Freigabe beantragen.
3. Vertrag/Feed-Lizenz/Datenschutz: Zulässige Publikationsformen, Bildrechte, erlaubte Caches, Aktualisierungsintervalle, Direktlinks, Provision auf Brutto-/Netto-Umsatz, Stornos und zugelassene Herkunft des Traffics.
4. Aus unserem Katalog **10–20 offiziell belegte OEM-Ersatzteilnummern** von Miele, Bosch, Vorwerk, Dyson und Samsung stichprobenartig gegen den genehmigten Shop-Feed prüfen. Trefferquote dokumentieren, nicht erfinden.
5. Lizenzierte Feeds getrennt vom Geräte-/Fitment-Katalog verarbeiten: merchantId, merchantProductId, brand, merchantExplicitOem, lastVerified, grossPrice, shipping, inStock, destinationUrl. Nur eine **exakte nachweisbare OEM+Marke-Verknüpfung** (plus unser vorhandener exakter Geräte-Fitmentbeleg) darf als „passend“ markiert werden. Abweichende Bezeichnungen und Familiennamen nur als Suchvorschlag.
6. Angebote erst nach Freigabe öffnen: eindeutige Kennzeichnung des Drittanbieters, Status der Preis-/Versandangabe, Zeitpunkt der letzten Prüfung, klare Affiliate-Werbekennzeichnung. Keine behauptete Vorrätigkeit, kein unerlaubtes Kopieren fremder Bilder.
7. Marktbeobachtung: Anteil unserer OEM-Codes mit mindestens einer exakten Kaufmöglichkeit, echte Sales, Stornos und Besucherabsprünge. Nicht die Anzahl blind kopierter Händlerartikel optimieren.

## Technische Absicherung dieses Branches
Die Kandidaten stehen in merchant-candidates.json mit **liveAffiliateOffersEnabled=false**, **not_applied**, **not_granted**, **commercialRightsVerified=false** und **keinen** verifizierten Händler-Hosts. offer-gate.mjs verweigert Angebote bei unzureichender OEM-Quelle, falscher Marke, ungesicherter Verfügbarkeit, Preisen älter als 24 Stunden, unsicherem Link oder nicht freigegebenem Vertrag. Die Tests nutzen ausschließlich synthetische Beispiele; keine API-Abfrage, Scrapes, Bilder oder echten Shop-Artikel.

**Nicht ändern:** main, den Rechts-/Codespaces-Branch und alle Work-Branches. Kein Deployment, keine Partnerregistrierung, keine automatisierte Buchung.
