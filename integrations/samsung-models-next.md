# Samsung-Modellrecherche zu Issue #13

Der vorbereitete Import ergänzt **8 Grundgeräte** und **9 vollständige Modellkennungen**. Samsung steigt auf der unveränderten v1.27.1-Basis von **69 auf 77 Modellgruppen**. Die zwei vom Hersteller ausdrücklich als baugleich bezeichneten Ultra-Farbausführungen belegen gemeinsam einen Modellplatz. Alle neuen Geräte haben **0 gelistete Teile**. Die vorhandenen 36 Samsung-Artikel und ihre Beziehungen bleiben erhalten.

**Arbeitsbranch:** `work/model-samsung-next`. **Basis:** `6545d9affb6b3c6c04b8d585084f2094a09e77b1`. Die Ergebnisse sind Vorbereitung für die Projektleitung gemäß #12; keine Änderung an Releasearchiven, Source-Checkpoint, Versionsnummer oder Pages-Workflow.

## Herstellerbelege und Zählentscheidung

57 offizielle Samsung-DE-Seiten wurden geprüft: 56 Support-Kandidaten mit expliziten `modelCode`-/`modelName`-Metadaten und eine Ultra-Produktseite mit dem Gleichheitsbeleg. Abrufdatum, Vollcode, URL, HTTP-Ergebnis, Geräte-Unterkategorie, Antwort-Prüfsumme und jede Dublettenentscheidung stehen in [samsung-model-research-next.json](samsung-model-research-next.json).

| Neues Grundgerät | Vollständige Kennung(en) | Primärquelle |
|---|---|---|
| SC4041 | `VCC4040V34/XEG` | [Samsung-DE-Service](https://www.samsung.com/de/support/model/VCC4040V34/XEG/) |
| VC-7413V | `VC7413VN3B/XEG` | [Samsung-DE-Service](https://www.samsung.com/de/support/model/VC7413VN3B/XEG/) |
| VC-6713H | `VC6713HN3S/XEG` | [Samsung-DE-Service](https://www.samsung.com/de/support/model/VC6713HN3S/XEG/) |
| VC4100 | `VC07K41E0VY/EG` | [Samsung-DE-Service](https://www.samsung.com/de/support/model/VC07K41E0VY/EG/) |
| VC5100 | `VC07K51H0VD/EG` | [Samsung-DE-Service](https://www.samsung.com/de/support/model/VC07K51H0VD/EG/) |
| VCF500G | `VC07F50HNRB/EG` | [Samsung-DE-Service](https://www.samsung.com/de/support/model/VC07F50HNRB/EG/) |
| VCDC20 | `VC08QHNDCBB/EG` | [Samsung-DE-Service](https://www.samsung.com/de/support/model/VC08QHNDCBB/EG/) |
| Bespoke AI Jet Ultra | `VS90F40EEK/WD`, `VS90F40EEM/WD` | [Black-Service](https://www.samsung.com/de/support/model/VS90F40EEK/WD/), [Mint-Service](https://www.samsung.com/de/support/model/VS90F40EEM/WD/), [Samsung-Gleichheitsbeleg](https://www.samsung.com/de/vacuum-cleaners/stick/vc9700cl-stick-vc-with-most-powerful-jet-aiultra-400w-black-vs90f40eek-wd/) |

Die 56 Supportentscheidungen umfassen 8 neue Grundgeräte, 1 zugeordnete Ultra-Variante, 22 bereits vorhandene Modellstämme, 12 ungeklärte Serienvarianten, 12 Ausführungen ohne ausreichenden deutschen Marktbeleg und 1 Gerät außerhalb der zugelassenen Unterkategorien. Eine deutsche Serviceoberfläche allein beweist keinen deutschen Verkauf. Historische Nachweise bleiben als Modellreferenzen erkennbar, ohne Verkaufs-, Preis- oder Lieferbehauptung.

**23 Zielplätze bleiben offen. 77 ist der belegte Katalogstand dieser Recherche, keine bewiesene absolute Herstellerobergrenze.** Die Recherche konnte keine weiteren 23 unabhängigen Grundgeräte sicher abgrenzen. Besonders VC59/60/67/76/89-Nachbarmodelle, VCDC20- und F50-Ausführungen sowie regionale Codes brauchen zusätzliche technische oder Marktbelege. Für SC4041 und VC-7413V war keine deutsche Anleitung direkt in der geprüften Serviceantwort hinterlegt. Artikelquellen und technische Teilepassungen sind für alle acht neuen Modellgruppen offen.

## Reproduzieren und prüfen

Node 24, Python 3, `curl` und das bereits im Repository gepinnte esbuild 0.25.12 werden verwendet. Für esbuild kann entweder `npm ci --prefix integrations/auth-sdk` ausgeführt oder wie beim bestehenden Build `UF_ESBUILD_MODULE` auf eine vorhandene Installation gesetzt werden. Diese Vorbereitung benötigt keinen Supabase-Zugang.

```bash
python3 integrations/restore-source-checkpoint.py --target site
node integrations/import-samsung-models-next.mjs --target site
node integrations/import-samsung-models-next.mjs --target site --check
node --test integrations/samsung-models-next.test.mjs
node integrations/build-app.mjs
node integrations/build-app.mjs --check
npm --prefix site test
npm --prefix site run check
python3 integrations/check-samsung-sources-next.py --output /tmp/samsung-source-check.json
```

Restore verlangt ein noch nicht vorhandenes Ziel. Der Import ist wiederholbar und prüft vor Schreibzugriff die gespeicherten Samsung-Basisprüfsummen. Geänderte Altmodelle, Artikel, halbe Importe, unbelegte Varianten und unsichere Links führen zum Abbruch. Der optionale Netzwerkprüfer verändert weder Evidenz noch Katalog; `--all` überprüft zusätzlich die zurückgestellten und bereits vorhandenen Kandidaten. Dynamische Herstellerseiten können andere Antwort-Prüfsummen liefern; entscheidend bleiben exakte Metadaten und die Modell-/Kategoriebindung.

## Isolierte Änderungen an der lokalen Arbeitskopie

Im PR werden ausschließlich die eigenen Samsung-Dateien unter `integrations/` geliefert. Der Importer bereitet nach Restore sechs lokale Dateien vor:

| Datei unter `site/` | Vorbereitete Änderung |
|---|---|
| `src/data/samsung-pack.js` | 8 neue Modellgruppen, vorhandene Modelle/Artikel unverändert |
| `src/data/new-brands-index.js` | Gleiche neue Modellgruppen; nur Samsung-Zähler, Hinweis und exakte Paketgröße aktualisiert |
| `src/core/typeplate.js` | Samsung-VS70/80/90-Codes mit ihrem kürzeren Suffix erkennen; bestehende VS15/20/28- und Siemens-Grenzen bleiben erhalten |
| `tests/catalog-v126.test.mjs` | Samsung-Zähler 69 → 77 und Geräte ohne Teile 49 → 57 |
| `tests/catalog-seven-brands.test.mjs` | Globale Modell-/Referenz-/Zielplatz-Zähler 895/906/682 → 903/914/690 |
| `tests/vorwerk-expansion.test.mjs` | Dieselben globalen Zähler; keine Änderung an Vorwerk-Daten oder anderen Assertions |

Die Typenschildkorrektur ist notwendig: Das bisherige Samsung-Muster erkennt nur VS15/20/28 und würde einen nackten VS90-Vollcode als Siemens-E-Nr. behandeln. Die vorbereitete Änderung trennt die bereits vorhandenen langen Samsung-Codes von den belegten kürzeren VS70/80/90-Formen. Exakte Länderbindung, fremde Marken und Seriennummern bleiben geprüft. Diese einzelne gemeinsame Codezeile und die globalen Testzähler sind ausdrücklich zur isolierten Übernahme durch die Projektleitung dokumentiert.

Die Quelle bleibt v1.27.1; lokale Builddateien dienen nur der Prüfung und gehören nicht zum PR. Für einen geänderten Source-Checkpoint oder bereits integrierte Bosch-/UX-Änderungen muss die Projektleitung die geprüften Ausgangswerte und gemeinsamen Assertion-Patches neu abgleichen. Der Importer überschreibt solchen Drift nicht stillschweigend.

## Validierung

Die unveränderte Basis und der vorbereitete Stand werden separat geprüft. Neun eigene Integrationstests rekonstruieren eine frische, checksum-geprüfte Arbeitskopie und vergleichen sämtliche bestehenden Geräte, Artikel, Angebote und Passungen über alle zehn Marken. Sie prüfen neue IDs, Index/Detail-Gleichheit, exakte Länder- und Ultra-Variantenbindung, Ablehnung unsicherer Quellen und erfundener Daten, atomaren Abbruch bei Validierungsfehlern, Wiederholbarkeit und ausschließlich die sechs dokumentierten lokalen Quelländerungen.

Die vollständigen 36 App-Testgruppen, Syntaxprüfung und byte-identische Wiederholung des lokalen Builds gehören zur Abnahme. Der gesonderte Prüfbericht steht in [samsung-models-next-validation.json](samsung-models-next-validation.json). Physische Teilepassung, aktuelle Händlerangebote und eine visuelle Oberflächenprüfung wurden nicht durchgeführt; sie werden durch die Datenprüfungen nicht behauptet.
