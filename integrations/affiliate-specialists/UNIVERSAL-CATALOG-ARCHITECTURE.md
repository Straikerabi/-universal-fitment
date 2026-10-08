# Universal Fitment — universelle Produkt- und Ersatzteilarchitektur (Zielbild)

**Version:** konzeptioneller Entwurf vom 08.10.2026. **Kein Feature-Rollout, keine neue rechtliche Freigabe und keine aktuelle Katalogabdeckung.** Der Name Universal Fitment beschreibt unsere langfristige Datenarchitektur; Staubsauger bleiben das erste reale, eng begrenzte Pilotsegment.

## Was „universal“ genau bedeutet

Ein Nutzer identifiziert einen **reparierbaren Gegenstand, eine Baugruppe oder ein System**, nicht zwingend ein elektrisches „Gerät“. Universal Fitment soll nach überprüfbarer Primärquelle die relevanten Komponenten, deren Kompatibilitätsbedingungen, Qualitäts-/Sicherheitsstatus und legale Bezugsquellen anzeigen.

Beispielhafte unkritische Objektfamilien:
- Haushaltsgeräte: Staubsauger, Kaffeemaschinen, Spülmaschinen
- Sanitär: Wasserhahn/Armatur, Kartusche, Dichtungen, Gewinde, Baujahr-/Serienunterschiede
- Fahrrad: Baureihen, Maßnormen, Fahrradteile (sicherheitskritische Untergruppen nur mit fachlicher Freigabe)
- Werkzeuge, Garten- und Freizeitgeräte, Computer/Elektronik, Einrichtungsgegenstände
- Später eventuell komplexere Industrieanlagen oder Fahrzeugbaugruppen nur mit passender Verifikation und rechtlicher Klassifizierung

**Ein einziges branchenübergreifendes hartkodiertes „Modellnummer“-Feld wäre falsch.** Wir brauchen ein *typisiertes, versionsfähiges* Identifikationsmodell pro Objektklasse.

## Neutrale Datenstruktur (nicht auf Staubsauger beschränkt)

| Objekt | Zweck | Beispieldaten / Invarianten |
|---|---|---|
| ProductDomain | Kategorien und gültige rechtliche Richtlinien | `household-vacuum`, `plumbing-fixture`; eigene Kennungs- und Sicherheitsregeln |
| AssetModel | Hersteller, Produktfamilie, Modellbezeichnung | Echte Grundmodelle, keine erfundenen Serien-/Farbvarianten |
| AssetVariant | Baujahr, Produktionsrevision, Region, elektrische/physische Version | Typenschildcodes, Seriennummern-Spanne, Ausführungen |
| Assembly | Hierarchischer Ort/Baugruppe | Gehäuse, Motor, Dichtung, Griffarmatur, Wasserführung |
| Part | Unabhängig dokumentierte Teilidentität | OEM-/Artikelnummer und ausdrücklich klassifizierte Nummerntypen, ggf. Norm-/Maßdaten |
| FitmentEdge | **Belegbare** Kante zwischen konkreter Variante/Baugruppe und Teil | Hersteller-Quelle, Ausführungsbereich, Effektivdatum, Ausschlüsse, Sicherheitsauflagen |
| Evidence | Prüfbarkeit/Nutzungsrechte | Hersteller-PDF/Teileseite, Lizenz, Region, Dokumentversion, zuletzt geprüft |
| MerchantItem | Artikel eines **autorisierten** Händlers | Händler-SKU, explizit gekennzeichnetes OEM-Feld, Rechts-/Lizenzstatus, Shop-URL |
| OfferSnapshot | Aktualisierte, kaufbare Option | Währung, Versand, Verfügbarkeit, Prüfdatum, Affiliate-Hinweis |
| PolicyDecision | Zulässigkeit der Ausgabe/Aktion | Kategorie-/Teilrisiko, Jurisdiktion, `allow` / `expert-review` / `block` |

**Erforderliche Trennung:** Ein Händler-SKU ist keine OEM-Nummer; ein Markenname ist kein Herstellervertrag; eine semantisch ähnliche Beschreibung ist kein Fitmentbeleg. Ein Angebot ist nur kaufbar, wenn die Angebotsdaten aktuell und rechtlich zur Anzeige berechtigt sind. Preis-/Lager-/Kompatibilitätsaussagen erhalten nachvollziehbare Quellen und Datumsstempel.

## Kategorien sind Plugins – die Engine bleibt gleich

Jede neue Kategorie benötigt vor Aufnahme:
1. **Identifikation**: Welche Typenschild-/Serien-/Maßangaben sind hinreichend? Wie unterscheiden sich Revisionen und Regionen? Wie behandeln wir unbekannte Kennungen?
2. **Datenquellen**: lizenzierte OEM-Listen, Dokumentationen, Betreiberfreigaben, regionale Zertifikate; Rechts- und Bildrechte prüfen.
3. **Baugruppenstruktur**: nachvollziehbare Unterbaugruppen statt einer einzigen flachen Teileliste.
4. **Teilevergleich**: exakte Herstellerzuordnung oder bewusst als nicht bestätigter alternativer Suchvorschlag. Mechanische Maße allein begründen keine Passung.
5. **Sicherheits- und Rechtsklassifizierung**: vor Suchergebnis, Schnittstellen-Antwort, Produktkarte und Händlerlink zentral auswerten.
6. **Händleradapter**: nur lizenzierte Feeds bzw. genehmigte API, keine Bilderrechte/Angebotsdaten aus bloßer Erreichbarkeit ableiten.
7. **QA/KPI**: echte Suchfälle, Passungsfehler, SKU-Mismatch, Käuferabbrüche, Verfügbarkeit und laufende Aktualisierung.

Die UI kann weiterhin eine leicht bedienbare Einstiegssuche bieten („Foto oder exakte Kennung“). Darunter liegt aber der jeweilige Kategorienprüfer; unklare Systeme lösen Rückfragen statt erfundener Listen aus.

## Sicherheitsgrenzen: universal heißt nicht „alles vermitteln“

**Vorgeschlagene Default-Regel ist Verweigerung bis explizit dokumentierter Freigabe.**

| Richtlinie | Beispiele | Zulässige Produktfunktion im MVP |
|---|---|---|
| Normale Alltagsteile | Staubsaugerbeutel/Filter, Haushaltsdichtungen, unkritische Armaturkartuschen | Identifikation + belegte Passung + autorisierter Händlerlink |
| Sicherheitskritische Baugruppen | Brems-/Lenkkomponenten, Gasinstallationen, Hochvolt-Elektrik, Maschinen-Schutzeinrichtungen | **Keine automatische Freischaltung**; Fachreview, regionale Norm-/Haftungsprüfung und sachgerechte Hinweise vor jedem Fitment/Kaufangebot |
| Reglementierte/missbrauchsanfällige Güter | Waffen/Munition, Explosiv- oder Raketenantriebskomponenten, nuklearbezogene Materialien/Spezialkomponenten | **Blockieren**; keine Teiledetails, keine Bau-/Beschaffungslisten, keine Kauf- oder Partnerlinks |

Diese Schranke muss in der Datenpipeline, der API und der UI wirksam sein. **Ein bloßer Hinweis im Footer reicht nicht.** Länderrecht, Ausfuhrkontrolle, Produktsicherheitsregeln, Haftung und Anbieterqualifikation werden vor möglicher Erweiterung separat fachjuristisch geprüft. Die besonders regulierten Beispiele des Gründers sind eine Größenmetapher, kein geplantes Verkaufssortiment.

## Technische Migrationsstrategie ohne Umbau-Chaos

**Jetzt:** Eine kompatible Schnittstellenschicht für „Asset + Variant + Part + Evidence + Policy“ designen, aber die bestehende Staubsauger-App nicht überhastet aufbrechen. Alle bisherigen Katalog-/Fitmentdaten müssen beim späteren Migrationsadapter unverändert verifizierbar bleiben.

**Nächster Proof of Concept:** Eine **zweite harmlose Testkategorie** mit wenigen echten, offiziell belegten Datensätzen, z. B. Wasserarmaturen oder Kaffeevollautomaten. Dort prüfen: andere Identifikatoren, Baugruppen, Maße/Revisionen, Teilebeleg, Händlerabdeckung und mobile Suchnavigation. Kein neues Produktionssortiment ohne Lizenz- und Betriebsfreigaben.

**Erst danach:** gemeinsame API und eigenständige Kategorienpakete ausbauen. Mandantenfähige Herstellerdaten und zugriffsrechtlich getrennte B2B-OEM-Quellen berücksichtigen. Nie Partnervertragsdaten öffentlich in einen globalen Katalog duplizieren.

## Strategischer Erfolg

Skalierung wird gemessen an belegter Teilezuordnung, tatsächlicher Problemlösung, nutzbarer Händlerabdeckung, weniger Fehlkäufen, wiederkehrender Nachfrage und B2B-/OEM-Zahlungsbereitschaft. Nicht allein anhand von Millionen blind gesammelten Produktdatensätzen.

Der langfristige Unternehmenswert entsteht aus **vertrauenswürdiger, auditierbarer Fitment-Engine, eigener Software/IP, Nutzern, Verteilungsnetz und übertragbaren Lizenz-/Partnerverträgen**. Damit sind eigenständiger Betrieb, White-Label-SaaS, Lizenzierung, Partnerschaften oder ein späterer Exit Optionen.

## Verknüpfte Dokumente

- [Strategie und Exit](PLATFORM-VISION-AND-EXIT.md)
- [Fachhändler- und Affiliate-Einstieg](REVENUE-STRATEGY.md)
- [Rechtsvorbereitung](https://github.com/Straikerabi/-universal-fitment/pull/43)

**Unverändert:** Keine Umsetzung gefährlicher Kategorien, kein Merge auf `main`, kein Deployment oder Händler-Onboarding.
