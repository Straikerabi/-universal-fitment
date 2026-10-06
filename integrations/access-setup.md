# Phase 4: eBay- und Amazon-Zugänge

Stand: 2026-10-06. Vorbereitung für Universal Fitment v1.12; keine Registrierung, Freigabe oder produktive API-Verbindung wird durch dieses Dokument behauptet.

## Tatsächlicher Stand

| Zugang | Status | Nächster Nachweis |
| --- | --- | --- |
| GitHub / öffentliche App | Repository und v1.12 vorhanden | Bestehender Projektzugang |
| Supabase | Projekt `universal-fitment`, Frankfurt, Free; Marketplace-Server Version 2 und dauerhafte Aufrufgrenzen bereitgestellt | Anbieterzugänge und angemeldeter Pilotnutzer noch offen |
| eBay Developers | Kontostatus und Schlüssel unbekannt; Anmeldung aus dem Cloud-Browser ausgeschlossen | Aktiviertes Produktions-Keyset und verfügbare OAuth-Berechtigungen |
| eBay Partner Network | Mitgliedschaft, Publisher-ID und Kampagne unbekannt | Bestätigte Teilnahme für Provisionslinks |
| Amazon PartnerNet DE | Mitgliedschaft und Partner-Tag unbekannt; Anmelde-Einstieg weist diese Browser-Sitzung zurück | PartnerNet-Kontostatus und endgültige Annahme |
| Amazon Creators API | Berechtigung und Schlüssel unbekannt | Zugewiesene API-Anwendung, Credential ID, Secret und Version |

In dieser Einrichtung wurden keine kostenpflichtigen Tarife gebucht, Konten registriert, Vertragsbedingungen angenommen oder API-Schlüssel erzeugt. Es gibt keine produktiven Zugangsdaten im Repository.

## Angaben, die wir bereits belegen können

| Feld | Vorbereitete Angabe |
| --- | --- |
| Anwendungsname | Universal Fitment |
| Öffentliche Website | https://straikerabi.github.io/-universal-fitment/?v=1.12 |
| Repository | https://github.com/Straikerabi/-universal-fitment |
| Zielmarkt | Deutschland; Lieferung nach Deutschland |
| Kategorie | Ersatzteile und Zubehör für Miele-Staubsauger |
| Pilot | 57 Modellnamen, 62 Materialnummer-Varianten, 167 Teile und Zubehörartikel |
| Geschäftsmodell | Geplanter Ersatzteilfinder mit Angebotsvergleich und ausgehenden Händlerlinks; Affiliate-Einnahmen erst nach Teilnahmefreigabe |
| eBay-Funktion | Teilebezogene Browse-Suche, Festpreisangebote, neu oder gebraucht, `EBAY_DE` |
| Amazon-Funktion | Geplante Creators-Suche in `www.amazon.de`, mit zugewiesenem DE-Partner-Tag |
| Aktuelle Nutzung | Gewöhnliche Suchlinks; Provider-Code mit synthetischen Tests vorbereitet. Keine produktive Marketplace-API genutzt |
| Bestellablauf | Merkliste mit Teilenummer und gewünschter Menge; Angebot auswählen, beim jeweiligen Händler bestellen und bezahlen |

Betreiber-/Firmendaten, Kontaktkonto, Anschrift, Rechtsform, Steuer-/Auszahlungsdaten, Besucherzahlen und Umsatzprognosen sind nicht verifiziert. Sie dürfen nicht aus der Projektidee geschätzt oder als bereits bestehendes Geschäft eingetragen werden. Ein Suchtreffer bestätigt keine Teileidentität oder Passform.

## eBay: zuerst den normalen Browse-Zugang prüfen

Das aktuelle EPN Developer Questionnaire nennt die Browse API ausdrücklich als ohne zusätzliche Genehmigung zugänglich. Der allgemeine Buy-API-Leitfaden beschreibt weiterhin Freigaben und Verträge. Deshalb zuerst das konkrete Produktions-Keyset, seine Scopes und den normalen Browse-Zugriff prüfen; ein Antrag für erweiterte Rechte ist kein automatischer erster Schritt.

Neue Produktions-Keysets müssen vor dem ersten Aufruf die Account-Deletion-Anforderungen erfüllen: Benachrichtigungen abonnieren oder eine zulässige Ausnahme beantragen. Die Ausnahme darf erst gewählt werden, wenn die tatsächliche Verarbeitung und Speicherung von eBay-Daten sie erfüllt; das ist für unseren noch nicht bereitgestellten Server nicht geprüft.

EPN-Teilnahme betrifft Provisionslinks. Das Questionnaire betrifft eingeschränkte APIs, Feeds und höhere Limits; es verlangt unter anderem die registrierte E-Mail, Produktions-Client-ID und eine Umsatzschätzung. Kein Client Secret in dieses Formular eintragen. Für unseren Pilot werden Checkout, Bieten, Feeds und erhöhte Limits derzeit nicht beantragt.

## Amazon: PartnerNet und API getrennt prüfen

Zuerst PartnerNet für Deutschland und den zugewiesenen DE-Partner-Tag prüfen. Die Creators-Onboarding-Seite verlangt endgültige Programmaufnahme; nur der primäre Kontoinhaber kann die API-Anmeldung vornehmen. Die Einführung nennt mindestens zehn qualifizierte Verkäufe in den vergangenen 30 Tagen für den dort beschriebenen PA-API-Zugang über Creators API. Diese Voraussetzungen sind bei unserem Konto nicht nachgewiesen.

Erst bei vorhandener Berechtigung folgt unter Tools > Creators API eine Anwendung namens `Universal Fitment` und ein gültiges Credential-Set. Ein normales Amazon-Kundenkonto oder die öffentliche Website allein belegt keine API-Berechtigung.

## Technische Vorbereitung und Aktivierung

1. Kontostatus, verfügbare APIs, Bedingungen und Limits des jeweiligen Anbieters belegen.
2. Schlüssel ausschließlich als Server-Secrets speichern; `.env.example` enthält nur die Variablennamen. Keine Secrets in Chat, Browser-App, Git oder Screenshots übertragen.
3. Der Server-Endpunkt ist bereitgestellt und nimmt nur Katalog-Teile an. Dauerhafte globale Aufrufgrenzen sind installiert und geprüft. Für die Live-Aktivierung fehlen noch Anbieterzugänge, ein freigegebener Auth-Nutzer und die Client-Anbindung.
4. OAuth und einen echten, zulässigen Produktionsaufruf testen; Angebot, Zustand, EUR-Preis, Verkäufer, Lieferung und Quellenzeit prüfen. Danach die öffentliche Oberfläche anbinden.

`EBAY_BUY_APPROVED` ist momentan die ausdrückliche Aktivierungssperre des Server-Moduls. Der Name bedeutet nicht, dass die normale Browse API grundsätzlich einen separaten Antrag benötigt. Beide Provider bleiben gesperrt, bis der tatsächliche Zugang geprüft ist. Synthetische Tests bleiben außerhalb der Live-Anzeige.

## Quellen, geprüft am 2026-10-06

- [eBay Developers: Registrierung](https://developer.ebay.com/join)
- [eBay: Produktionsanforderungen](https://developer.ebay.com/api-docs/buy/buy-requirements.html)
- [EPN: Developer Questionnaire](https://partnernetwork.ebay.com/page/developer-questionnaire)
- [eBay: Account-Deletion-Anforderungen](https://developer.ebay.com/develop/guides/sell/marketplace-user-account-deletion)
- [Amazon PartnerNet DE](https://partnernet.amazon.de/welcome)
- [Amazon: Creators-Voraussetzungen](https://partnernet.amazon.de/creatorsapi/docs/en-us/introduction)
- [Amazon: Creators-Registrierung](https://partnernet.amazon.de/creatorsapi/docs/en-us/onboarding/register-for-creators-api)
