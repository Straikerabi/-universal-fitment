# Vorbereitung: kommerzieller Launch (Deutschland, v1.29.0)

**Status: BLOCKIERT.** Dies ist ein interner Entwurf, keine Rechtsberatung und keine Freigabe. **Keine realen Anschriften, Personendaten, Telefonnummern, Geburtsdaten, Kontonummern oder Zugangsdaten in diesem öffentlichen GitHub-Repository erfassen.** Insbesondere `operator.example.json` bleibt leer.

## Zielmodell
Unabhängiger Staubsauger-Ersatzteilfinder mit ausgehenden Händlerlinks und eventuell künftig Provisionslinks. **Keine eigene Bestellung, Zahlung, Warenhaltung, eigene Preis- oder Versandgarantie.** Änderungen des Geschäftsmodells erfordern einen neuen Audit. Händlerpartnerschaften und automatisierte Live-Angebotsabfragen sind noch nicht freigegeben.

## Sichere lokale Datenerfassung
1. Datei `operator.example.json` **nur auf einem privaten, geschützten Arbeitsgerät** nach `operator-private.json` kopieren und echte Angaben dort ergänzen. Diese Datei ist ignoriert; trotzdem vor jedem Git-Push prüfen, niemals mit `git add -f` übergehen.
2. Angaben **nicht** in öffentliche Issues, PRs, Chat-Screenshots, CI-Logs oder Beispielcode schreiben. Daten sicher an den zuständigen rechtlichen Prüfer geben.
3. `python3 integrations/legal-compliance/launch_preflight.py --config integrations/legal-compliance/operator-private.json --site site` prüft formale Muss-Angaben und Vertrags-/Datenstatus. Der Test zeigt **nur Feldnamen**, keine sensiblen Werte.
4. `launch_preflight.py` erstellt **keine automatische juristische Freigabe**. Vor einem Produktivstart sind unterschriebene bzw. nachweisbare vertragliche/technische Prüfungen sowie eine menschliche Abnahme Pflicht.

## Was der Betreiber tatsächlich liefern muss
- Betreiber-Rechtsform und richtiger rechtlicher Name; bei Einzelunternehmen voller bürgerlicher Name, ggf. ergänzend verwendete Geschäftsbezeichnung.
- **Ladungsfähige** geschäftliche Anschrift: Straße, Hausnummer, Postleitzahl, Ort, Land (kein bloßes Postfach). Eine private Wohnanschrift **nicht** ungeprüft öffentlich machen. Eine geeignete Geschäftsadresse vorab organisieren und rechtlich prüfen.
- Eine dauerhaft erreichte geschäftliche E-Mail und funktionierende Möglichkeit zur schnellen, unmittelbaren Kommunikation. Alternativer direkter Kontaktweg je Fall.
- Falls vorhanden/erforderlich: Handels-/Gesellschaftsregister samt Registergericht und Nummer, **Umsatzsteuer-ID** bzw. Wirtschafts-ID im Umfang des § 5 DDG; **keine** private Steuer-ID als Ersatz ins Impressum. Bei erlaubnispflichtiger Tätigkeit zuständige Behörde und weitere Sonderpflichten.
- Gewerbeanmeldung bzw. steuerliche Erfassung im maßgeblichen Fall klären. Für Affiliate-Einnahmen ist in Deutschland grundsätzlich die Gewerbefrage zu prüfen. § 19 UStG Kleinunternehmer ist eine separate Umsatzsteuerregelung, **nicht** Befreiung von Impressums-/Gewerbepflichten.
- Domain und Produktionshoster samt AGB, Auftragsverarbeitungsvertrag, Hosting-Logs/Speicherfristen, technischer Sicherheit. GitHub Pages **nicht** als dauerhaften kommerziellen Host verwenden.
- Für die DSGVO: verantwortliche Person, erreichbarer Datenschutzkontakt, Verarbeitungszwecke, Rechtsgrundlagen, Empfänger, Drittlandübermittlungen, Speicherdauer, Betroffenenrechte, Cookie-/Browser-Speicher-Protokoll, Löschweg für Pilotkonten. Echte Nutzungs- und Auth-Flows in Browser prüfen.
- Nur nachweislich erlaubte Bilder, Inhalte, Softwarelizenzen und Hersteller-/Teilepassungen veröffentlichen. Affiliate-Verträge, Kennzeichnung von Werbung und Preisaktualisierung nachweisen.
- BFSG-Anwendung prüfen; Kleinstunternehmen-Ausnahme nach § 3 Abs. 3 BFSG nur bei Vorliegen **aller gesetzlichen Voraussetzungen** und nur für Dienstleistungen. Barrierefreiheit bleibt empfehlenswert.
- **Keine EU-OS-Plattform verlinken** (seit 20.07.2025 eingestellt); VSBG-Pflichten falls tatsächlich einschlägig.

## Gesonderte Integration
Der Preview-Patch `hardening.py apply` fügt bloß vorläufige Hinweise und eine Projekt-Hinweisseite ein. Produktiver Impressums-/Datenschutztext und seine sichtbaren Links, ein geeigneter Host, nachweisbare Datenflüsse sowie ggf. Freigabe von Affiliate- und Bildquellen fehlen. Der `release-check` bleibt absichtlich gesperrt.

## Rechtsquellen
- § 5 DDG: https://www.gesetze-im-internet.de/ddg/__5.html
- Art. 13 DSGVO: https://eur-lex.europa.eu/eli/reg/2016/679/oj
- § 14 GewO: https://www.gesetze-im-internet.de/gewo/__14.html
- § 19 UStG: https://www.gesetze-im-internet.de/ustg_1980/__19.html
- § 25 TDDDG: https://www.gesetze-im-internet.de/ttdsg/__25.html
- § 5a UWG: https://www.gesetze-im-internet.de/uwg_2004/__5a.html
- § 3 BFSG: https://www.gesetze-im-internet.de/bfsg/__3.html
- GitHub Pages Limit: https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
