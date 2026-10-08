# Universal Fitment — juristische Risiko-Triage (DE/EU)

**Stand:** 2026-10-08, Quellstand v1.29.0, `main` SHA `71f7826ba936a1f3830c8b2a67e8085a9cfe234e`. Koordination: #42, Entwurfs-PR #43.

> Technischer Vorab-Audit, keine anwaltliche Freigabe. Dies ist ausdrücklich keine Zusage von „Abmahnfreiheit“. Hier wurden weder echte persönliche Betreiberangaben erhoben noch Verträge mit Dienstleistern geprüft.

## Bestätigte Fakten

- Repo erzeugt die Website aus einem SHA256-geprüften Quellcheckpoint mit 136 Source-Dateien. Nur `main` triggert das GitHub-Pages-Deployment; dieser Audit-Branch tut das **nicht**.
- GitHub Actions hat `hardening.py apply` zweimal identisch ausgeführt, fünf negative/positive Tests bestanden und die v1.29.0-App inkl. Build und Regressionstests erfolgreich ausgeführt.
- Die `impressum.html`- und `datenschutz.html`-Dateien sind im wiederhergestellten App-Root nicht vorhanden. Andere mögliche UI-Rechtstexte/Links werden separat untersucht; Dateimangel **allein** beweist nicht, dass kein Rechtstext erreichbar ist.
- Quelltext enthält Anmeldefunktionen über Supabase, Browser-Speicherzugriffe, externe Links und Bild-/Dokumentbezüge. **Keywordzahlen sind keine Anzahl realer Browserkontakte**.
- Externe Händlersuchen werden als Suchlinks beschrieben, nicht als eigene Bestellung oder gesicherte Live-Angebote. Eine produktive Händler-API ist noch gesperrt.
- Supabase-Metadatenprüfung vom 08.10.2026: Projekt in `eu-central-1`, zwei private Marketplace-Tabellen mit aktivem RLS und 0 Zeilen, Security-Advisor ohne gemeldete Findings. Kein DSGVO-Konformitätsnachweis.

## Verbindliche Blocker vor öffentlichem geschäftsmäßigen Rollout

| Thema | Risiko | Nachweis / technische Maßnahme |
|---|---|---|
| § 5 DDG | Fehlende oder fehlerhafte Betreiberangaben | Echte veröffentlichungsfähige Stammdaten + mobiles, direkt zugängliches Impressum; keine Fake-/GitHub-Profil-Adresse |
| Art. 13, 15–22 DSGVO | Unvollständige Angaben zu Verarbeitung und Betroffenenrechten | Verantwortlicher, Zwecke, Rechtsgrundlagen, Drittlandtransfers, Empfänger und Löschfristen, Betroffenenkontakt, TOMs und Dienstleisterverträge dokumentieren; echte Datenschutzerklärung |
| GitHub Pages | Limits gegen geschäftliches SaaS/Commerce und sensible Passworttransaktionen | Passenden Hostingvertrag/Domain wählen; Login auf Pages nicht kommerziell aktivieren, bestehende Kunden-Pilotfunktion separat prüfen |
| Medien-/Datenbankrecht | Kein gesichertes Veröffentlichungsrecht für Bilder, Shoptexte oder massenhaft extrahierte Herstellerdaten | Freigabeliste je Asset / Lizenz / Quelle / Zweck; unklare Bilder konsequent ausblenden, nicht rehosten |
| Preis/UWG/Links | Irreführende Angebote, versteckte Affiliate-Werbung, inkorrekte Preisreihenfolge | Alter, Herkunft, USt/Währung, Versand offenlegen; Affiliate-Links und bezahlte Rankings unmittelbar kennzeichnen, keine Live-Behauptung |
| Herstellerbezug | Falsche OEM-Autorisierung oder Fitment | Nur Kennungsreferenzen im Rahmen § 23 MarkenG, unabhängigen Charakter nennen; Fitment nur explizit nachweisbar |
| § 25 TDDDG | Optionale Browserzugriffe ohne Einwilligung | Cookies, localStorage, IndexedDB, PWA und externe SDKs nach Zweck inventarisieren; strikt notwendige Funktionen separat dokumentieren; nicht essenzielle Tracker bis zu wirksamer Einwilligung deaktivieren |
| Produktsicherheit | Unsichere oder falsche Einbauanweisungen/Akku-Zuordnungen | Fachgerechte Hinweise; spannungs-/akku-/regionabhängige Passung nicht verallgemeinern; GPSR Art. 19 prüfen, falls eigener Fernabsatz hinzukommt |
| BFSG | Barrierefreiheit bei in den Anwendungsbereich fallenden Verbraucher-E-Commerce-Diensten | Geschäftsmodell und Kleinstunternehmens-Ausnahme prüfen; Test von Tastatur, 200 % Text, Dialogen, Screenreadern |
| Sicherheits-/Lizenzpflichten | Offenliegende SDK-Keys, ungesicherte API-Aufrufe, fehlende OSS-Hinweise | Veröffentlichte Keys auf publishable-only begrenzen, Server Secrets nie ins Repo; `src/vendor/LICENSES.txt` mit konkretem Build vergleichen |
| Shopfunktion | Zukünftiger Checkout vs. bloße ausgehende Suchlinks | Widerrufs-/Fernabsatzpflichten, Endpreis, Bestellbutton erst bei eigener Verkaufsfunktion aktivieren |
| Plattform-/Supportpflichten | Öffentliche Beiträge, Kontakt, Accountlöschung | Öffentliches GitHub Issues nicht als private Supportkanal darstellen; Accountlöschprozess und Datenexport für echte Nutzer bereitstellen |

## Bereits erarbeiteter nicht-produktiver Schutz

`hardening.py apply --site site` ergänzt eine kleine, barrierearme Hinweiszeile und eine eigenständige Projekt-Hinweisseite. Das schafft Transparenz, aber **ersetzt nie** Impressum/Datenschutzerklärung und hat keine automatisch gesundende Wirkung.

`hardening.py release-check --site site` verweigert die öffentliche Freigabe ausdrücklich, auch wenn Dateinamen bloß angelegt werden. Diese Blockierung ist gegenwärtig **nicht** im Deployment-Workflow von `main` eingebunden; es handelt sich um eine isolierte Vorlage für den künftigen Releaseprozess.

### Konkrete Freigabereihenfolge

1. Betreiber entscheidet Rechtsform, geschäftlichen Sitz, veröffentlichbare Anschrift, Kontakt, steuerlichen Status und konkretes Monetarisierungsmodell. Niemals private Kontaktdaten ohne Zustimmung ins öffentliche GitHub-Repo übertragen.
2. Tatsächliche Datenflüsse und die in der App sichtbaren Funktionen im Browser/PWA prüfen; echte Informationen für Impressum und Datenschutzerklärung anwaltlich bzw. fachlich abnehmen.
3. Hosting und ggf. Affiliate-/API-Verträge, Bilderlizenzen und Unternehmens-/Verbraucherinformationspflichten dokumentieren.
4. Audit-Feststellungen in echte App-Änderungen und einen freigabefähigen Deployment-Gate überführen, inklusive manueller Freigabe; vollständige Tests und mobile UI-Prüfung.
5. Erst dann kontrollierte Veröffentlichung auf geeignetem Host. Kein automatischer Merge des vorliegenden PR.

## Öffentliche Primärquellen

- https://www.gesetze-im-internet.de/ddg/__5.html
- https://eur-lex.europa.eu/legal-content/DE/ALL/?uri=celex:32016R0679
- https://www.gesetze-im-internet.de/ttdsg/__25.html
- https://www.gesetze-im-internet.de/uwg_2004/__5a.html
- https://www.gesetze-im-internet.de/markeng/__23.html
- https://www.gesetze-im-internet.de/bfsg/__3.html
- https://eur-lex.europa.eu/eli/reg/2023/988/oj
- https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
