# Universal Fitment — kostenlose B2C-App + B2B-Plattform: verteidigbare Strategie und Arbeitsplan

**Beschluss des Produktinhabers:** 09.10.2026. **Status:** interne Strategie, keine öffentliche Produktzusage, keine Partnerbeziehung und kein Produktionsrelease. Dieses Dokument ist eine Entscheidungs- und Testvorlage, keine Marktprognose.

## 1. Leitbild und strategische Wette

**„Universal Fitment ist die neutrale, beleggestützte Infrastruktur, die ein konkretes reparierbares Objekt mit den nachweisbar passenden Bauteilen, Reparaturvoraussetzungen und autorisierten Bezugsquellen verbindet.“**

**Zwei Vertriebsprodukte, ein gemeinsamer Kern:**
- **B2C / Universal Fitment Free:** schnelle, accountfreie Identifikation und Suche für Privatleute, belegte Passung und offene Unsicherheit, gespeicherte Geräte, kontextbezogene Baugruppen, zugelassene Händlerangebote und Reparaturchecklisten; kostenlose Basisfunktionen. Optionales Scannen nur im betriebswirtschaftlich tragbaren Kostenrahmen, kein unbegrenztes bezahltes Cloud-KI-Versprechen.
- **B2B / Universal Fitment Business:** Embed-Widget/White-Label-Fitmentfinder und später API für Händler, Reparaturbetriebe und OEM-Aftersales; vertraglich verifizierte Berechtigungen, getrennte Tenant-Daten, Änderungsprotokolle, SLA nur wenn lieferbar. Abrechnung nach Pilot und nachweislichem Nutzen, z. B. Einrichtung + monatlicher Zugang oder Abfragevolumen. Keine Geldflüsse oder Preisgarantien ohne Vertrag.

**Eine überprüfbare Kundenaussage statt „wir sind für alles besser“:**
> Bei explizit unterstützten Modellen erklären wir vor dem Kauf, **welches Teil für die exakte Ausführung belegt passt, welche Information fehlt und warum** – sowie welche legalen aktuellen Bezugsquellen verfügbar sind.

## 2. Der zusammengesetzte Burggraben (kein einzelnes kopierbares Feature)

| Moat-Baustein | Wie wir ihn tatsächlich aufbauen | Gegenmaßnahme gegen Kopierbarkeit | Messsignal |
|---|---|---|---|
| Provenienz- und Varianten-Graph | Asset → Variant/Revision → Assembly → Part → präzise Passungs-/Ausschlusskante mit Herstellernachweis | überprüfbare Kanten, differenzierte Anschluss-/Komponentendaten | Anteil geprüfter Kanten und nachträglich widerrufener Fehler |
| Datenqualitäts- und Feedbackkreislauf | gemeldete echte Einbauten, Fehlpassungen, Varianten; fachliche Moderation; streng getrennt von offiziellen Herstellerbelegen | wachsende qualifizierte Evidenz; negative Fitmentfälle ausdrücklich speichern | verifizierte Berichte und behobene Fehler je Monat |
| Berechtigter Partnerzugang | Feed-/API-Lizenzen + Änderungs- und Datenrechtsschutz, Verträge mit Mehrfachlieferanten | keine riskanten unautorisierten Kopien, vertragliche Integrationskosten | aktive genehmigte Feeds, Abdeckung realer OEM-Teile |
| B2B-Distribution | kleiner eingebetteter Teilefinder im Shop/Service-Portal; gemeinsamer Kern, sauber isolierte Kundendaten | Prozesse, Integration und quantifizierte Fehlervermeidung | echte B2B-Testnutzer, Pilot-Nutzung und Verlängerung |
| Verbraucher-Vertrauen | Quellen, Unsicherheitsstatus, keine gekauften Falschrankings, kostenlose Basis, klare Betreiber-/Datenschutzinfo | nachvollziehbarer Produktnutzen und wiederkehrender Gerätepass | erfolgreiche Reparaturentscheidung, Wiederkehr und Empfehlungen |

**Warnung:** Ein Netzwerkeffekt ist ein zu beweisendes Ergebnis, kein automatisch eintretender Vorteil. Wettbewerber verfügen bereits über größere Datenbanken, KI-Assistenten, Herstellerverträge, OCR-Scanner oder interaktive Explosionszeichnungen. Ein Design-Refresh, eine App-Store-Veröffentlichung oder 1 Mio. unbestätigte Artikel sind für sich genommen kein Schutz.

## 3. Aktueller Ist-Stand – aus README v1.29.0 (09.10.2026)

- 10 Staubsaugermarken, 1.093 konkrete Modelleinträge, 1.940 Artikel insgesamt, davon 1.822 physische Ersatz-, Zubehör- und Verbrauchsteile.
- 447 Modelleinträge ohne konkrete Teilezuordnung; **646/1.093** haben mindestens eine, ungefähr **59,1 %**. Das bedeutet nicht: alle Beziehungen sind belegbar, alle Modellvarianten abgedeckt oder Kaufangebote vorhanden.
- Einzelne Marken sind datenarm (z. B. Hoover und Samsung); Quellen und Variante getrennt prüfen. Ältere README-Roadmap-Tabellen können bereits überholt sein.
- Keine nachgewiesenen aktiven zahlenden B2B-Kunden, keine Herstellerverträge, keine bewiesene Conversion oder repräsentativen Retentionsdaten.
- Derzeit **private Codespaces-Vorschau** als Entwicklungspfad; öffentliches GitHub-Repository bedeutet weiterhin sichtbaren Code. `main`/Deployment und rechtliche Freigabe unangetastet.

## 4. Arbeitsphasen und Gate-Entscheidungen

### Phase A — Tage 1–30: Wahrheit messen, statt Größe behaupten

**Engineering**
1. Abdeckungsreport automatisieren: echte Modellvarianten, physische Teile, Fitment-Kanten **mit nachvollziehbaren Primärquellen**, fehlende/ungeprüfte Bereiche und Baustufen. Keine ungeprüften Kanten als Erfolg zählen.
2. 20–30 reale, manuell geprüfte Reparatur- und Teilefindefälle über mehrere Staubsaugermarken; **mindestens 5 bewusst mehrdeutige oder negative Fälle** in den Tests.
3. „Warum passt es / warum noch unklar?“ mit drei expliziten Zuständen und Quellen auf Geräte- und Teilebene als **privater UX-Prototyp**, wo Belege existieren.
4. Fünf externe Testpersonen, jeweils dieselben Suchaufgaben in Universal Fitment und 1–2 Wettbewerbern; gleiche Geräte, Gerätekennungen, iPhone-Test, Vergleich von Zeit, Klicks, false positives und Verständlichkeit.

**Business**
5. 5–8 nicht-verkäuferische Problemgespräche mit kleinen Werkstätten, Reparaturdiensten oder spezialisierten Teilehändlern (bei Bedarf als unverbindliche Marktforschung); keine Produktpartnerschaften vortäuschen.
6. Drei eng umrissene B2B-Probleme messen: Häufigkeit von Falschbestellungen, Zeit für Teileidentifizierung und Supportanfragen. Bereitschaft zu einem bezahlten Pilot nur als Hypothese.

**Entscheidungs-Gate A**
- Tests reproduzierbar; **null bekannte falsch-positive Passungsversprechen in der gesicherten Testsuite**, auch bei Variantenkonflikten;
- Für 20 dokumentierte Fälle nachvollziehbar, wie viele ohne Herstellerbeleg bleiben; fehlende Daten niemals als Erfolg darstellen;
- >=3 konkrete Interviewpartner bestätigen dasselbe Problem (explorativer Richtwert, keine Marktvalidierung);
- Wenn UX/Genauigkeit nicht besser: erst Daten-/Interaktionskonzept ändern, nicht Modellzahl aufblasen.

### Phase B — Tage 31–90: Verbraucher-WOW und B2B-Wert aus einem Kern

**Produkt**
1. Varianten-/Baugruppenkarte, Teilenummern-/Maßabgleich und „fehlende Info“ auf 25–50 gut belegten **Pilotgeräten**, keine Lizenzbilder kopieren.
2. Verbraucher-Reparaturmission als geführter Ablauf: exakte Identifikation → Teile-/Anschlusscheck → Materialcheckliste → nur bei Beleg geeigneter Händler.
3. Einheitliches maschinenlesbares Begründungsobjekt (FitmentEvidenceResponse) für **beide** Oberflächen, ohne schon eine öffentliche API mit personenbezogenen Daten zu eröffnen.
4. Synthetischer Demo-Embed für Händler mit Testdaten. Tenant-Rechte, Logging, Rate-Limits, Berechtigungstrennung und verständliche Einbaunachweise.
5. Affiliate-Kandidaten über lizenzierte Feeds erst nach Zulassung und erfülltem Legal-Gate verbinden; ohne echte Partnerdaten keine „live kaufbar“-Behauptung.

**B2B**
6. 2–3 potenziellen Fachhändlern die Demo **ohne Zugriff auf Kundendaten** zeigen, gegenüber ihrem Ist-Prozess testen. Eine bezahlte Pilotzusage oder ein signiertes unverbindliches Interesse dokumentieren, falls es zustande kommt; **niemals als vorhanden darstellen**.

**Entscheidungs-Gate B**
- Mehrere echte Testpersonen können für definierte Fälle schneller zu einer **korrekten und begründeten** Entscheidung kommen als mit ihrem bisherigen Suchweg; Ergebnisse und Grenzen offenlegen.
- B2B-Nachfrage an konkret messbarem Kostenproblem geprüft (keine erfundene Ersparnis).
- Feeds/Datennutzung/IP/Bildrechte rechtlich sauber, bevor irgendetwas extern integriert wird.

### Phase C — Monate 4–6: kontrollierter B2B-Pilot und zweiter Gerätebereich

1. Wenn Freigaben vorhanden: 1 **zahlender** oder klar begrenzt unentgeltlicher B2B-Pilot mit Datenschutz-/Datennutzungsvertrag, Erfolgskriterien und Exit-Option.
2. Pilotmetriken vorab festlegen: Zeit bis korrekter Teileidentifikation, falsch-positive Treffer, Supporttickets, Bestellabschlüsse, Retouren (nur wenn Händler diese Daten freiwillig rechtmäßig bereitstellt); A/B-Vergleich mit Baseline.
3. Zweite **ungefährliche** Produktfamilie (beispielsweise Kaffeemaschinen oder Wasserarmaturen), zunächst 10–20 reale Modell-/Baugruppen-Fälle mit Primärquellen, die unser generisches Asset-/Varianten-Schema tatsächlich herausfordern.
4. Nur mit ausreichender Qualität weitere Hersteller/OEM-Aftersales-Abteilungen kontaktieren: Demo, Daten-/Lizenzkonzept, konkreter Nutzen und Abgleich mit bisherigen Supportkosten.

**Gate C:** Fortsetzen nur, wenn eine klar messbare Kundennutzen-Verbesserung plus bezahlbarer Datenpflege-/Betriebsaufwand erkennbar sind. Sonst Pivot zurjenigen Unterkategorie mit nachgewiesener Nachfrage.

### Phase D — Monate 7–12: Skalierbarer wiederholbarer Verkauf

- B2B-Integrationen reproduzierbar machen: standardisierte Importer, Tests, Audit-Logs, Rollbacks, Tenant-Datenmodell, Support- und Abrechnungsprozesse.
- 2–5 **echte** zahlende B2B-Kunden als ambitionierte **Validierungsziele**, keine Prognose; ggf. zuerst bei 1 Pilot bleiben.
- Verbraucher-App nach rechtlicher Gründung/Release-Freigabe öffentlich starten, regelmäßiges Nutzungsfeedback; erst danach native Store-App gegen messbaren Install-/Retention-Vorteil abwägen.
- Weitere Kategorien anhand Nachfrage + lizenzierter Quellen + verfügbarem Handel + Haftungs-/Sicherheitsrisiko priorisieren.
- OEM-Partner nicht als automatische Zahler annehmen: einige werden **Datengeber**, andere Vertriebspartner, manche können Integration bezahlen.

### Phase E — 1–3 Jahre (Option, keine Zusage)

Branchenübergreifendes B2C/B2B-Netzwerk, wiederkehrende API/SaaS-Einnahmen, offizielle Herstellerdaten, Qualitäts-/Sicherheitsaudits, übertragbare Rechte und Verträge, gegebenenfalls langfristige Finanzierungs- oder Exit-Prüfung. **Kein Exit ohne stabile Markt-/Gewinnzahlen und Due Diligence.**

## 5. Kommerzielles System

**B2C:** für Kernsuche und belegte Passung kein Abo/Accountzwang; gekennzeichnete Affiliate/CPS-Links zu genehmigten Fachhändlern. Falls später Bild-/KI-Kosten > tragfähiger Deckungsbeitrag: Nutzung lokal, caching nach Rechten, Kontingente und transparente optionale Zusatzfunktionen – keinen unbegrenzten kostenpflichtigen KI-Dienst verschenken.

**B2B:** Händler kauft nicht unsere „schöne App“, sondern einen Effekt: weniger Fehlkäufe und Supportzeit, bessere Auffindbarkeit, rechtmäßig eingespeiste Artikel und nachvollziehbare Variantenregeln. Angebote als **Pilot-Preisexperimente** (z. B. monatlicher Paketpreis + einmalige Integrationspauschale; keine Behauptung marktüblicher Sätze), nach nachvollziehbarer Zahlungsbereitschaft.

**OEM:** Ziel ist autorisierter Datenzugang, bessere Service-Distribution oder lizenzierte White-Label-Lösung. Ein Hersteller gibt uns nicht automatisch exklusive Daten, Lizenzrechte oder Provisionen. Abhängigkeitsrisiko durch mehrere Kategorien/Partner reduzieren. Keine Manipulation von Fitment nach Provision.

**Kosten-/Wirtschaftlichkeits-Gate:** Monatlich variable Hosting-/OCR-/KI-/Datenfeed-/Support-/Rechts-/Steuerkosten und Zeitaufwand gegen **reale bestätigte** Netto-Deckungsbeiträge je Kanal führen. Bis zur Validierung keine neuen wiederkehrenden KI-Abos, Mitarbeiter, großen Cloud-Speicher oder teuren Paid Ads.

## 6. Warum Händler bei uns zahlen sollten: Pilot-Pitch

- „Ihr Team investiert Zeit in die manuelle Prüfung von Varianten und nimmt Teile zurück, die für das Hauptgerät angeblich passen, aber beim Anschluss abweichen.“
- „Unsere Integration zeigt die vorhandene Variante, verifizierte Teile-/Anschlussbedingungen, fehlende Merkmale und die Herstellerbelege direkt in Ihrem bestehenden Shop.“
- „Wir messen gemeinsam 20–50 reale Auswahlvorgänge und die Falschzuordnung/Supportzeit **vorher und nachher**.“
- „Wir verkaufen keine nicht vorhandenen Daten und versprechen keine automatischen Einsparungen, bevor der Pilot sie belegt.“
- **Kanalverträglichkeit:** B2C verlinkt neutrale Shopangebote; B2B erhält Rechte-/Tenant-geschützte individuelle Integrationen, aber keine exklusive Kontrolle über die öffentliche Kompatibilitätsbewertung.

## 7. Risiken, Kontrollen und Stoppsignale

| Risiko | Kontrolle | Stoppsignal |
|---|---|---|
| Quantität ohne Passung | Fitment-Kanten mit Belegen, automatische Fehlpassungs-Tests | viele Modelle ohne sinnvoll geprüfte Teile |
| Datenrechte/Geheimhaltung | Lizenzrechte je Quellfeld und Verwendung, Schutz öffentlicher Branches/Assets, getrennte B2B-Tenants | OEM-Dokument/Bild/API ohne schriftliche Veröffentlichungserlaubnis |
| Falsche Teile führen zu Schäden | positive Fitments nur bei hinreichenden Quellen, explizite Negativ-/Unknown-Fälle, Kategorie-Policy | wiederholte unbelegte „passt“-Aussagen |
| Zu breiter Fokus | nur Pilotsegmente mit Gate, keine neue Kategorie vor Test | ständiger Richtungswechsel ohne Nutzertests |
| B2B-Handel untergräbt Neutralität | Trennung Händlerangebote und technische Fitment-Wahrheit; klare Werbekennzeichnung | Partner verlangt unrichtige Fitmentpriorisierung |
| Abokosten ohne Umsatz | keine neuen wiederkehrenden Tools vor messbarem ROI; Budgetkontrolle | feste Kosten steigen ohne Nutzer-, Pilot- oder Umsatzbeleg |
| Scheitern bei Vertriebsvalidierung | direkte Interviews und messbarer Pilot, statt nur Produktplanung | keinerlei Zahlungsbereitschaft nach mehreren realen Gesprächen |
| Öffentliche Haftung/Datenschutz | Codespaces private Preview; Review Legal #42 / Draft #43 vor Veröffentlichung | fehlender Betreiber/Impressum/Lizenz-/Datenschutzstatus |
| Dual Use/sicherheitskritische Güter | kategorieweise Policy mit default deny, fachliche Prüfung und harte Sperren | Waffen/Munition, explosive/nuklearbezogene Komponenten oder ungeprüftes Hochrisikofitment |

**IP-Achtung:** Der Repository-Code ist aktuell öffentlich lesbar; vor einem kommerziellen OEM-Datenprodukt Software-Lizenzen, Drittcode/IP, Branding und Datenverträge gesondert auditieren. Ein GitHub-Repo ist kein geschützter Datenraum. Nicht ohne ausdrückliche Freigabe privat stellen, löschen, neu lizenzieren oder Rechte von Dritten importieren.

## 8. Konkrete Engineering-Pakete (getrennte Issues / Branches, ohne main)

**T1 – Data Quality Baseline:** reproduzierbarer maschinenlesbarer Fitment-Coverage-Report + harte Negativtests. Verknüpft mit #46.

**T2 – Consumer Repair Mission:** klickbarer iPhone-Prototyp mit 20–30 belegten Testfällen, Unknown-/Negativstatus, variantensicherer Baugruppenauswahl; keine externen unberechtigten Grafiken. Verknüpft mit #45, #47.

**T3 – Shared Fitment Contract:** versionsfähiges Schema und pure, deterministische `assessFitment`-Entscheidungsfunktion für B2C und B2B; Quellenstatus, Rechte, Serienbereich, Anschlussanforderungen, Kategorie-Risiko; synthetische No-Match-Tests. Verknüpft mit UNIVERSAL-CATALOG-ARCHITECTURE.md.

**T4 – Offline B2B Embed Demonstrator:** Testdaten statt echte OEM-/Shopdaten; tenant-scoped API-Vertrag, rollenbasierte Rechte, Importer-Plan und sauberer Nachweis von fehlenden Daten. Kein Kundendatenimport, Hosting oder Vertragsabschluss.

**T5 – Pilot Discovery:** Interviews, Vergleichsfälle und Tracking ohne personenbezogene Daten; Datenerhebung mit Rechtsgrundlage. Keine fingierten Kunden-/Erfolgsmetriken.

## 9. Owner-Entscheidungen / No-Go

- **B2C-Kern dauerhaft kostenlos**, B2B darf kostenpflichtig sein.
- **Ein gemeinsamer, belegter technischer Kern**, zwei klar getrennte Nutzererlebnisse und Geschäftsmodelle.
- **Qualität → Testnutzen → frühe B2B-Probleminterviews → Pilot → Skalierung**, nicht Modellmenge → Abo-Ausgaben → große Hoffnung.
- Bis neue Freigabe: keine unbegründeten Datenimporte, Herstellerbehauptungen, Affiliate-Freischaltung, Drittbilder, Traktionserfindung, main-Merge oder Deployment.

## Primär-/Branch-Quellen
- GitHub README v1.29.0 auf main, bekannt zum Stand 09.10.2026: https://github.com/Straikerabi/-universal-fitment/blob/main/README.md
- Issue #45 Praxisfall und Anschlussprüfung: https://github.com/Straikerabi/-universal-fitment/issues/45
- Issue #46 Teileabdeckung/Baugruppen: https://github.com/Straikerabi/-universal-fitment/issues/46
- Issue #47 Rezensionen/Wettbewerbs-Benchmark: https://github.com/Straikerabi/-universal-fitment/issues/47
- Rechtliches Release-Gate: https://github.com/Straikerabi/-universal-fitment/issues/42
- EU-Kommission Recht auf Reparatur (2026): https://commission.europa.eu/news-and-media/news/right-repair-new-consumer-rights-easy-and-attractive-repairs-2026-07-31_en
- iFixit Herstellerlösungen und reale OEM-Partnerschaften: https://www.ifixit.com/solutions
- Partful Hersteller-3D-Ersatzteilkataloge: https://partful.io/partful-3d-parts-catalogue
