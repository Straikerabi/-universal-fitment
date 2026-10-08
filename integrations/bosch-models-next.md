# Bosch-Modellrecherche für Issue #14

Auf `work/model-bosch-next`, Basis `6545d9affb6b3c6c04b8d585084f2094a09e77b1`, ergänzt dieser Import **40 echte Bosch-Grundmodellreferenzen**. Lokal steigt Bosch von 60 auf **100** Modelle. Jeder neue Eintrag hat eine deutsche Hersteller-Produktseite, eine ausdrücklich ausgegebene kanonische Gerätekennung, eine eigene Geräte-Materialkennung und eine unterschiedliche Hersteller-EAN. Diese Geräte-Materialnummer ist ausschließlich ein Dublettenmerkmal und wird nicht als Ersatzteilnummer oder Geräte-ID verwendet.

Die 60 bestehenden Geräte, alle 103 Bosch-Katalogartikel einschließlich 102 physischer Teile und alle anderen Marken bleiben unverändert. Alle 40 neuen Modelle starten mit **0 zugeordneten Teilen**. Es wurden keine Preise, Bestände, Versandkosten, Montagezeiten oder technischen Teilefreigaben übernommen.

## Quellen und Dublettenprüfung

| Prüfung | Ergebnis |
|---|---:|
| Deutsche Bosch-Sitemap: URLs / unterschiedliche Codes | 141 / 136 |
| Exakt gelesene Produktseiten insgesamt | 145 |
| Davon vorhandene Modelle / weitere Kandidaten | 60 / 85 |
| Aufgenommene Grundmodelle / zurückgestellte Kandidaten | 40 / 45 |
| Neue Geräte nach Art: mit Beutel / ohne Beutel / Akku | 12 / 12 / 16 |
| Code-, EAN- oder beobachtete Geräte-Materialkollisionen | 0 |
| Aus dem Inhalt belegte vollständige E-Nr.-Referenzen | 36 |
| Neue Modelle mit belegtem Index / hier offenem Index | 34 / 6 |
| Erneute Herstellerabrufe: Produktseiten / Serviceseiten | 40 / 36 |
| Fehlgeschlagene erneute Identitätsprüfungen | 0 |

Evidenz, Quellenzeitpunkte, zurückgestellte Kandidaten und nicht bestätigte Indexabfragen stehen in [bosch-model-research-next.json](bosch-model-research-next.json). Die gesonderte Wiederholungsprüfung steht in [bosch-model-source-verification-next.json](bosch-model-source-verification-next.json). Ein `/xx`-Index zählt niemals als zusätzliches Grundmodell. Mehrere Shop-URLs, Farbtexte oder Länderkennungen erzeugen ebenfalls keine weiteren Einträge. Die Auswahl ist keine Bestseller-Rangliste.

Die Service-Prüfung verlangt, dass **variantId und productId im Seiteninhalt** dieselbe vollständige E-Nr. ausgeben. Eine angefragte `/01`-URL oder ein HTTP-404 wird nicht als Indexnachweis gespeichert. Die dokumentierte Indexmenge ist bewusst nicht vollständig. Offen bleiben in dieser Recherche **BGB38BA1, BGB41POW1, BGL75XPRQ, BGL8SIL5, BGC41XECO und BCH3K2852**; daraus wird weder das Fehlen anderer Ausführungen noch eine Ersatzteilpassung abgeleitet.

Für 58 der 60 bestehenden Geräte enthält die Hersteller-Produktseite zusätzlich die Geräte-Materialkennung. Bei BDS9BWHTE und BHH4WM28 fehlt dieses Metadatum. Die Code- und EAN-Prüfung deckt trotzdem alle 60 bestehenden Modelle ab. Die neuen Geräte werden zusätzlich untereinander gegen ihre eigenen Materialkennungen geprüft.

## Reproduzierbare Integration

Der PR enthält ausschließlich Bosch-Evidenz, Importer, Vorlagen, Prüfskript und Berichte unter `integrations/`. Die rekonstruierte `site/`-Arbeitskopie und lokale Browserpakete werden nicht mitgeliefert. `.demo/*`, Source-Checkpoint, Pages-Workflow und globale Versionsdateien bleiben bei der Projektleitung.

Aus dem Repository-Stamm in eine noch nicht vorhandene `site/`-Arbeitskopie:

```sh
python3 integrations/restore-source-checkpoint.py --target site
node integrations/import-bosch-models-next.mjs --target site
node integrations/import-bosch-models-next.mjs --target site --check
npm ci --prefix integrations/auth-sdk --ignore-scripts
node integrations/build-app.mjs
node integrations/build-app.mjs --check
npm --prefix site run check
npm --prefix site test
node integrations/import-bosch-models-next.test.mjs
python3 integrations/verify-bosch-model-sources.py --report /tmp/bosch-source-check.json
```

Im lokalen Lauf wurde die bereits vorhandene passende Esbuild-Version **0.25.12** über `UF_ESBUILD_MODULE` verwendet. Ein zweiter Import schreibt keine Dateien und fügt keine weiteren Modelle hinzu. Änderungen an den beiden bestehenden Bosch-Datendateien oder unerwartete Patch-Anker stoppen den Import vor der ersten Quelländerung. Ein frischer, checksum-geprüfter Checkpoint-Replay erzeugt dieselben elf Quelldateien bytegenau.

Bosch ist bereits synchron im kleinen Geräteverzeichnis enthalten und besitzt kein optionales Markenpaket. Der neue kompakte Datensatz wird über denselben bestehenden Bosch-Einstieg geladen. Die acht anderen Markenpakete bleiben bei Bedarf ladbar; die neuen Bosch-Geräte benötigen keinen zusätzlichen Import.

## Gemeinsam genutzte Dateien: isolierte Änderungen für die Projektleitung

| Lokales Integrationsziel | Änderung |
|---|---|
| `src/data/bosch-models-next.js` | Aus der Evidenz erzeugte neue Modellreferenzen, Quellen, echte Indizes und leere Teilelisten |
| `src/data/bosch-vacuum.js` | Neue Modelle anhängen; bestehende 60 Modelle und Teile unverändert aufbauen |
| `src/core/typeplate.js` | Zwei Erfassungsmuster behalten zusätzliche `/xx`-Tokens, damit z. B. `BGB6X300/01/02` als ungültig abgewiesen wird |
| `tests/bosch-models-next.test.mjs` | Neue Modell-, E-Nr.-, Marken-, Seriennummern-, Backup- und Ladegrenzen |
| `tests/bosch-catalog.test.mjs` | Alle ursprünglichen Zubehör-/EAN-/Handbuchprüfungen für den unveränderten Bestand behalten; Gesamtfilter um die neuen Modelle ergänzen |
| `tests/bosch-boundaries.test.mjs` | EAN nur bei vorhandener Herstellerkennung in die Typenschild-Testeingabe setzen |
| `tests/bosch-workflow.test.mjs` | Konsolentext an den erweiterten Modellumfang anpassen |
| `tests/catalog-seven-brands.test.mjs` | Nur Modell-/Eintrags-/Zielplatzzahlen um den Bosch-Zuwachs ergänzen |
| `tests/philips-expansion.test.mjs` | Nur die Bosch-Zeile der markenübergreifenden Statistik von 60 auf 100 ändern |
| `tests/vorwerk-expansion.test.mjs` | Nur globale Modell-/Eintrags-/Zielplatzzahlen ergänzen |
| `package.json` | Neue App-Testgruppe und Syntaxprüfung anhängen; Version unverändert |

Es gibt keine Änderung an Samsung-Daten, UX-Komponenten, Styles, Service Worker oder den vorhandenen kompakten Indizes anderer Marken. Die gemeinsame Typenschildänderung bestätigt weiterhin nur die Modellreferenz; auch ein syntaktisch gültiger, hier nicht belegter Index erzeugt keine Quellenbehauptung oder Teilefreigabe.

## Validierung und Übergabe

**37 App-Testgruppen**, Syntaxprüfungen, zehn bytegenau reproduzierbare Browserpakete und **34 negative Importer-Fälle** bestanden. Die Importer-Prüfung deckt zusätzlich einen fehlerhaften Patch-Anker ohne Teilmutation, einen zweiten identischen Import, unveränderte Quellbereiche und den frischen Checkpoint-Replay ab. Kennungsprüfungen schließen falsche Marken, Seriennummern/FD, kollidierende EANs, erfundene Indizes, Verkaufssets, fremde Märkte und unqualifizierte Herstellerlinks aus.

Details, lokale Zielprüfsummen und Testausgaben: [bosch-model-validation-next.json](bosch-model-validation-next.json). Hauptpaket: 1.592.802 → 1.630.451 Bytes, **+37.649 Bytes**. Keine zusätzliche Bosch-Nachladeanforderung; andere Markenpakete bleiben unverändert.

Lokal ergeben sich 935 Modellbezeichnungen in 946 Modelleinträgen, 722/1.000 Zielplätze und 300 Modelle ohne Teilezuordnung. Diese Zahlen beziehen sich auf den vereinbarten v1.27.1-Checkpoint einschließlich dieses Bosch-Imports. Die Teilezahl bleibt unverändert.

`main` ist inzwischen um die PR-Grenzprüfung auf `b8752146109a583dd1f7e29e01466b13424bf99d` weitergelaufen; dessen Source-Checkpoint besitzt weiterhin dieselbe geprüfte Archiv-SHA. Gemäß Koordination #12 integriert die Projektleitung Samsung zuerst und spielt danach diesen Import auf dem dann aktuellen Checkpoint erneut ein. Die Statistik-Patches addieren den Bosch-Zuwachs zu den vorhandenen Gesamtzahlen. Bei abweichenden Bosch-Stammdaten oder veränderten Patch-Ankern ist eine gezielte Anpassung und erneute Prüfung nötig. Dieser Work-Strang hat weder nach `main` gemergt noch veröffentlicht.

Es wird keine Prüfung an realen Geräten oder visuelle UX-Abnahme behauptet. Die gerätespezifischen Teilelisten für alle 40 neuen Modelle und die sechs noch unbelegten E-Nr.-Indizes bleiben sichtbar offen.
