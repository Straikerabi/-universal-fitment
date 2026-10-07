# Money Maker Finder – Nachtarbeit bis 08:00 am 8. Oktober 2026

Abi hat den eigenständigen Ausbau des bestehenden Staubsaugerprojekts bis zum kommenden 08:00 Uhr (Europe/Berlin) freigegeben. Die Zeitbudgets beschreiben die geplante Bearbeitung, keine zugesagten Artikelzahlen. Offene Ziele bleiben sichtbar, wenn die Herstellerquelle nicht reicht. Änderungen am bestehenden öffentlichen Frontend dürfen nach erfolgreichen Prüfungen veröffentlicht werden.

## Arbeitsliste

| Nr. | Aufgabe | Budget | Startstatus |
|---|---|---:|---|
| 1 | Bestand, Dubletten und offene Modell-Teilelisten prüfen | 15 Min. | Erledigt / erster Release |
| 2 | Samsung-Ersatzteile und Zubehör aus Herstellerquellen ergänzen | 45 Min. | Geplant |
| 3 | Hoover-Ersatzteile und Zubehör aus Herstellerquellen ergänzen | 40 Min. | Geplant |
| 4 | Samsung-Artikel zu vollständig genannten Modellcodes zuordnen | 25 Min. | Geplant |
| 5 | Hoover-Artikel zu deutschen Modellen und Produktcodes prüfen | 25 Min. | Geplant |
| 6 | Weitere echte Miele-Modellreferenzen recherchieren und erfassen | 20 Min. | Geplant |
| 7 | Weitere echte Bosch-Modellreferenzen recherchieren und erfassen | 20 Min. | Geplant |
| 8 | Weitere echte Dyson-Modellreferenzen recherchieren und erfassen | 20 Min. | Geplant |
| 9 | Weitere echte AEG-Modellreferenzen recherchieren und erfassen | 20 Min. | Geplant |
| 10 | Teilelücken bei Rowenta, Philips, Siemens und Vorwerk bearbeiten | 30 Min. | Geplant |
| 11 | Noch offene Teilearten und fehlerhafte Einordnungen prüfen | 15 Min. | Geplant |
| 12 | Düsen, Bürstenköpfe und einzelne Bürstenwalzen sauber unterscheiden | 10 Min. | Geplant |
| 13 | Modellfilter mit einem Knopf zurücksetzen | 10 Min. | Erledigt / erster Release |
| 14 | FAQ auf zehn Marken und die aktuelle Teileansicht aktualisieren | 10 Min. | Erledigt / erster Release |
| 15 | Preisstand, fehlende Preise und Preisquellen kontrollieren | 15 Min. | Geplant |
| 16 | Versand- und Händlerhinweise bei offenen Angaben prüfen | 10 Min. | Geplant |
| 17 | Artikelquellen, Kennungen und Ausführungsbedingungen verständlich ergänzen | 15 Min. | Geplant |
| 18 | Fehlende offizielle Anleitungs- und Servicelinks ergänzen | 10 Min. | Geplant |
| 19 | Schmale Layouts, Zeilenumbrüche und bedienbare Filter prüfen | 15 Min. | Geplant |
| 20 | Katalog, Zuordnungen, Suche, Preise und Offline-Verhalten prüfen | 20 Min. | Geplant |
| 21 | Geprüfte Änderungen veröffentlichen und live kontrollieren | 20 Min. | Geplant |
| 22 | Fertigstand mit neuen Zahlen, offenen Punkten und App-Link erstellen | 10 Min. | Geplant |

Erweiterung nach Abis letzter Nachricht:

| Nr. | Aufgabe | Budget | Startstatus |
|---|---|---:|---|
| 23 | Öffentliche Roadmap auf Deutsch und Englisch erstellen und verlinken | 20 Min. | Vorbereitet |
| 24 | Kontaktbereich mit prüfbarem GitHub-Entwurf und Kopieren | 20 Min. | Vorbereitet |
| 25 | Supportpostfach und privaten Versandweg planen | 5 Min. | Erledigt / Adresse offen |
| 26 | Vorhandene Nutzungsstatistik prüfen und Messumfang festhalten | 5 Min. | Erledigt / keine zentrale Messung |

Erweitertes Arbeitsbudget: 470 Minuten. Die Liste ist damit größer als das verbleibende Nachtfenster. Abi hat ausdrücklich gesagt, dass nicht alles bis zum Endtermin fertig sein muss; nach Priorität arbeiten, keine Belege oder Erledigung erfinden. Inventur, FAQ und Filterrücksetzung sind bereits bearbeitet. Die übrigen Punkte werden nach Priorität fortgesetzt. Der Abschlussbericht ist für 08:00 Uhr vorgesehen.

## Öffentliche Kommunikation

Die Roadmap steht in `ROADMAP.md` und `ROADMAP.en.md`, Releaseänderungen in `CHANGELOG.md`. Jede tatsächlich veröffentlichte Nachtversion bekommt dort kurze Patchnotes auf Deutsch und Englisch. Zwischen vorbereiteten, getesteten und veröffentlichten Änderungen unterscheiden. Der Bericht um 08:00 folgt dem Stil Neu, Verbessert, Behoben, Katalogzahlen, Bekannte offene Punkte, Als Nächstes.

`integrations/contact-feedback-plan.md` dokumentiert den echten Kontakt-/Messstand. Kein Postfach oder Analytikdienst ist eingerichtet; eine private Adresse nicht aus Commitmetadaten übernehmen. Ein GitHub-Entwurf ist eine Nutzerweiterleitung, kein automatischer Versand. `supportEmail=null` bleibt offen, bis eine echte Adresse bestätigt ist.

## Ausgangsstand

868 Modellnamen, 879 konkrete Modelleinträge, 1.903 Artikel, davon 1.785 physische Ersatzteile/Zubehör-/Verbrauchsartikel; 255 Modelleinträge ohne Teilezuordnung. Acht Marken erreichen mindestens 100 physische Teile. Noch fehlen insbesondere Samsung 86 und Hoover 45 Artikel zum Teileziel. Sieben Marken liegen unter 100 Modellnamen. Vorwerk hat derzeit 18 belegte VK-/VT-/VB-Grundmodelle; Vorsätze und Verkaufssets werden nicht als zusätzliche Grundgeräte gezählt.

## Fortsetzung ohne temporären Ordner

Repository: `Straikerabi/-universal-fitment`, Branch `main`. Es ist ein bestehendes GitHub-Pages-Projekt; Sites wird hierfür nicht verwendet. Der Fortschritt steht in `integrations/overnight-state-2026-10-08.json`.

1. Über die GitHub-App den aktuellen Branch-Head und dessen Git-Tree lesen. Fortschritt, Quellensicherung und alle Segmente mit genau dieser Commit-Referenz abrufen, damit keine Versionen gemischt werden.
2. `integrations/source-checkpoint.json` nennt Version, Segmentordner, Segmentzahl und SHA-256. Die benannten `part-000` usw. sind UTF-8 Base64-Text. GitHub `fetch_file` unterstützt diese Dateien. Alle Segmente in exakt numerischer Reihenfolge wiederherstellen; `integrations/restore-source-checkpoint.py --target <neuer Ordner>` prüft die SHA-256 und entpackt Source, Daten, Tests und statische Dateien. Kompilierte Pakete sind ausdrücklich ausgenommen. Der Wiederherstellungsweg wurde lokal bytegenau geprüft.
3. Falls der temporäre Originalordner noch existiert, ihn nur verwenden, wenn Version und Quellenstand mit dem aktuell gelesenen Head übereinstimmen. Ein alter lokaler Ordner ist keine Autorität für den neuesten Stand.
4. Root-Dateien nach Bedarf über GitHub abrufen: `.github/workflows/pages.yml`, `integrations/build-app.mjs`, `integrations/auth-sdk/package.json` und Lockfile, `integrations/package-site-patch.py`, `integrations/create-source-checkpoint.py`, `integrations/restore-source-checkpoint.py`, README und Katalogbericht. Das Root-Repository enthält eine geprüfte Folge kumulativer Patches; nicht den kompletten alten Patchverlauf für jede Recherche herunterladen.
5. Vor Änderungen die wiederhergestellte Site als unveränderte Vergleichsbasis sichern. Jede neue Veröffentlichung bekommt eine neue Versionsnummer. Versionswerte in `src/app.js`, `package.json`, `index.html`, `sw.js` und den versionsabhängigen Tests einschließlich der escapten Regex-Formen aktualisieren. Ältere veröffentlichte Pakete behalten ihre Dateinamen.
6. Mit dem gepinnten esbuild über `integrations/build-app.mjs` erzeugen und `--check` prüfen; `npm test` und `npm run check` in der Site ausführen. Falls der Compiler im Cloud-Lauf nicht lokal verfügbar ist, den Quellendelta mit `integrations/package-site-patch.py --build-in-ci` vorbereiten. Diese Option lässt GitHub den Compiler aus der vorhandenen gepinnten SDK-Installation ausführen, bevor alle App- und Serverprüfungen laufen. Lokale Checks, die dabei nicht ausgeführt wurden, nicht als bestanden melden.
7. `integrations/package-site-patch.py --baseline <Basis> --site <Site> --version <neue Version> --description <kurzer Text>` erzeugt die gzip/Base64-Patchsegmente und ergänzt den Workflow mit SHA-256. Es prüft das Delta durch vollständiges erneutes Anwenden auf die Basis. Die bestehenden Serverprüfungen und Deploy-Schritte bleiben erhalten.
8. Bei Datenänderungen den kleinen Markenindex mit den neuen Modell-/Teilezahlen und tatsächlichen kompilierten Paketgrößen synchron halten. Die Hauptmarken werden über `brand-index.js`, Vorwerk über `vorwerk-index.js`, Samsung/Hoover über `new-brands-index.js` zusammengeführt. Ein Paket darf keine anderen Zielzahlen zeigen als der kleine Index.
9. Mit `integrations/create-source-checkpoint.py --site <Site>` eine neue Quellenfassung und `source-checkpoint.json` erstellen. Quellen, Katalogbericht, Fortschritt, neue Patchsegmente und Quellensicherung gemeinsam über GitHub `create_tree`/`create_commit` hochladen; `update_ref` mit `expected_sha` und `force:false` verwenden. Bei fremdem neuem Head zuerst lesen und zusammenführen. Keine Fremdänderungen überschreiben.
10. GitHub-Actions-Build und Pages-Deployment müssen erfolgreich sein. Aktuelle Modellseite über den öffentlichen Browser prüfen, genaue URL verifizieren und bei UI-Änderungen einen Screenshot sichern. Ein laufender oder fehlgeschlagener Build ist keine fertige Veröffentlichung.

## Ausführung pro Nachtlauf

Den nächsten offenen Abschnitt bearbeiten und innerhalb von ungefähr 45–50 Minuten einen konkreten geprüften Zwischenstand sichern. `active_run` mit Startzeit und Abschnitt im Fortschritt führen. Ist ein anderer frischer Lauf aktiv, keine gleichzeitigen Änderungen beginnen; lieber den bestätigten Stand prüfen und melden. Fertige Punkte nicht erneut abarbeiten. Fehlende Primärquellen und nicht ausgeführte Prüfungen konkret dokumentieren.

Ab 07:00 auf Prüfung, Fehlerbehebung, Veröffentlichung und Abschluss konzentrieren. Nach 07:45 keine neue breite Recherche beginnen. Um 08:00 folgt der tatsächliche Fertigstand. Die automatische Fortsetzung endet nach dem letzten geplanten Lauf.

## Datenregeln

Nur belegte Hersteller- oder klar benannte Anbieterquellen verwenden. Ein Modellbereich in einer Quelle wird nicht in erfundene Einzelmodelle expandiert. Kennungen, Länder- und Produktionsausführungen erhalten. Bei Bosch/Siemens /xx, AEG vollständige PNC, Philips /xx/R und Rowenta /xxx nicht raten. Samsung-Modellcodes nicht als Siemens-E-Nr. deuten. Hoover-Produktcodes nicht mit Modellnamen verwechseln.

Samsung hat noch keine konkret zugeordneten Modellteile. Unter `integrations/samsung-research-leads-2026-10-08.json` sind drei neu geöffnete deutsche Produktseiten mit vollständigen /WD-Gerätecodes und explizit genanntem optionalem Zubehör vorgemerkt. Die passenden Modelle sind bereits im Katalog. Herstellerartikel, die nur mit einer verkürzten Familienkennung genannt sind, werden nicht stillschweigend einer vorhandenen vollständigen Länderkennung gleichgesetzt. Akku-plus-Ladegerät als Lieferumfang kennzeichnen; Clean-Station-Beutel und Wischaufsatz-Verbrauchsmaterial benötigen den jeweils vorhandenen Zubehörtyp. Die Quelle zum Akku VCA-SAPB95/WA enthält Template-Platzhalter und generische Beispielpreise: daraus keinen Preis übernehmen.

Hoover hat 55 Herstellerartikel aus GB, bisher ohne deutsche Zuordnung. Britische Angaben belegen weder deutsche Passung noch deutsche Preise oder Bestände. Der Quellenmarkt bleibt sichtbar. Vorwerk-Vorsätze bleiben vom Grundgerät getrennt. Dokumente, komplette Geräte und offene Klassifikationen füllen das physische Teileziel nicht. Gleiche Teileart behält über alle Marken Farbe und SVG-Symbol.

Preise werden nur mit tatsächlicher Quelle, Währung, Preisbasis, Steuer-/Marktangabe und Datum erfasst. Keine unbekannten Werte als null Euro behandeln. Quellenpreise bleiben von Live-Angeboten getrennt; Warenkorb-, Nachbau-, Händler- und Ausführungsprüfungen erhalten. Kein behaupteter vollautomatischer Checkout, keine erfundenen Bewertungen und keine Zusagen über aktuelle Bestände.

Keine Auth-, Supabase-, Rollen-, Sicherheits- oder Zahlungsänderungen in diesem Nachtauftrag. Kein Kauf, keine Kontoanlage, keine Nachrichten an Dritte und keine zusätzlichen externen Dienste. Der geschützte Serververtrag mit 167 Miele-Vorlagen bleibt bestehen. Keine Subagenten starten, sofern nicht später ausdrücklich angefordert.
