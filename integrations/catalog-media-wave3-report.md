# Issue #39 — geprüfte Medien, erster sicherer Import

Entwurfsstand vom 9. Oktober 2026. Ausschließlich `work/catalog-media-wave3`, Basis `d4853c4e5245410630742f58aead661d77f42c32`, Quellcheckpoint v1.29.0. Keine Änderungen an main, Deployment, Fitments, Artikelpreisen oder Geräte-/Artikelidentitäten. Shared-Source-Integration bleibt bei Owner #12.

## Vollständige Bestandsprüfung

Alle acht Lazy-Packs wurden für den Audit geladen. Die vollständigen Datensatz-, Marken-, Kategorie-, URL-Duplikat- und Statuslisten stehen in `catalog-media-wave3-coverage.json`. Marken-Auswertungen für Artikel verwenden targetBrands; ein markenübergreifender Artikel kann mehrfach in Marken-Buckets vorkommen, im Gesamttotal nur einmal.

| Bestand | Datensätze | Vorhandene rohe Bild-URLs | Keine URL | Dokumentierte Freigaben vorher | Freigegeben nach Import | Lokaler Fallback nach Import |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Modelle | 1093 | 535 | 558 | 0 | 1 | 1092 |
| Artikel | 1940 | 676 | 1264 | 0 | 0 | 1940 |
| Familien-Fallbacks, separat | 9 | 0 | 9 | 0 | 0 | 9 |

1093 Modellzeilen entsprechen 1082 verschiedenen Marke/Modell-Bezeichnungen; diese Begriffe sind nicht austauschbar. Vorhandene Herstellerprovenienz ist keine bildspezifische Veröffentlichungsfreigabe. Die 1211 bisherigen URL-Zuordnungen bleiben als Quellen im unveränderten Katalog erhalten, werden aber vom neuen Renderer nicht angefordert.

1180 unterschiedliche Bestands-URLs wurden ausschließlich per HEAD geprüft: 616 HTTP 200, ein Redirect und 563 Netzwerkfehler/Timeouts. 582 Antworten weisen einen Bild-Content-Type aus; 598 URLs bleiben unbestimmt (inklusive 34 Nicht-Bild-Antworten mit HTTP 200). Keine 404/410 beobachtet. Das beweist weder funktionierende GETs noch defekte URLs, korrekte Produktzuordnung, Hotlink-Erlaubnis oder Nutzungsrechte. Redirects werden nicht verfolgt. Es wurden dabei keine Bildkörper heruntergeladen. Content-Type, Status, Länge, CORS und Fehlerbelege stehen in `catalog-media-wave3-head-evidence.json`. Fehlende CORS-Header verhindern gewöhnliche img-Anzeige nicht automatisch; Canvas-Zugriff ist eine andere Frage.

## Recherche und Nutzungsrechte

`catalog-media-wave3-research.json` enthält 24 genaue Kandidaten mit Modell-/OEM-Bindung, Herstellerquelle, Produktcode, Original-URL soweit ermittelt, Seitenmetadaten, Rechteprüfung und Entscheidung: je ein Modell und Originalartikel pro zehn Marken, drei zusätzliche Vorwerk-Commons-Kandidaten und das freigegebene DC19-Foto. Die 20 Herstellerseiten waren abrufbar; ihre Bildkörper wurden nicht heruntergeladen. Ohne ausdrückliche kommerzielle Veröffentlichungs-/Weitergabefreigabe bleiben diese 20 Kandidaten gesperrt. Die drei Vorwerk-Bilder sind wegen unscharfer Modell-/Bundle-Zuordnung bzw. unvollständiger Einzelrechte gesperrt, trotz teilweise freier Lizenzen. Keine geschützten Shops umgangen, keine Wasserzeichen entfernt.

Einzige freigegebene Zuordnung: `vac-dyson-model-dc19`, Hersteller-Modellcode **DC19**. [Offizielle Modellquelle](https://www.dyson.de/support/vacuum-cleaners/cylinders/dc19). Tatsächliches fotografisches Modellreferenzbild von Alexx.net, [Commons-Datei und Lizenzbeleg, feste Revision](https://commons.wikimedia.org/w/index.php?title=File:Dyson_DC19_vacuum_cleaner.jpg&oldid=1054412410), [Originaldatei](https://upload.wikimedia.org/wikipedia/commons/0/0b/Dyson_DC19_vacuum_cleaner.jpg), [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/). Bild und Dateiseite wurden visuell geprüft. Keine Behauptung einer bestimmten DE-Verkaufsvariante, Farbe, Revision oder DC19-T2-Passung. Der Renderer zeigt Autor, Lizenz, Quellenlink und Modellreferenz-Hinweis. CC0 ist keine Marken-/Empfehlungsfreigabe.

Die beiden mitgelieferten JPEGs sind proportionale 320×460-/640×920-Ableitungen (22.719/68.070 Bytes) mit entfernten Metadaten, ohne Beschnitt. Original-/Ableitungs-Hashes und Transformation stehen im Recherchemanifest. Kein Ersatzteilfoto ist freigegeben. Insbesondere die [Dyson-AGB, Abschnitt 14](https://www.dyson.de/einblicke-in-dyson/bedingungen/agb) und [Philips-Nutzungsbedingungen](https://www.philips.de/a-w/nutzungsbedingungen.html) ersetzen keine projektspezifische Bildfreigabe.

## Sicherer Import und Runtime

Der Import hat keine Netzwerkfunktion. Er überprüft den gepinnten Rechercheentscheid, alle 136 Checkpoint-Dateien, exakte Hersteller-/Entity-/Code-Bindung, erlaubte HTTPS-Quellen, Bildhash, JPEG-Format, Dimensionen und Größen. Fremde Varianten, nachträgliche Selbstfreigaben, Dubletten, Symlinks, unbekannte Dateien, veränderte Quellen, Teilimporte und falsche Branches werden verweigert. Dry-run schreibt nichts; Wiederholungen sind idempotent. Sperrdatei, zweite Konfliktprüfung und Rollback decken gewöhnliche Laufzeitfehler ab. Mehrdatei-Renames sind nicht crash-atomar: bei Prozess-/Stromausfall Sperre/Teilstand erhalten und einen frischen Checkpoint verwenden, nicht blind fortsetzen.

Der Renderer verwendet ausschließlich die geprüfte lokale Registry, nie rohe Katalog-/Live-Lookup-URLs. Ein permanentes lokales SVG bleibt bis zum erfolgreichen Laden erhalten und wird bei Fehlern wieder sichtbar; feste Abmessungen, object-fit contain, srcset, Lazy-Loading, Alt-Text, Tastaturbedienung und sichtbare Herkunft sind enthalten. Ungeprüfte Bilder haben keinen Foto-Ladebutton. Das alte Foto-An/Aus-Verhalten bleibt für freigegebene Fotos erhalten. Ohne Bild funktionieren Suche und Filter. PWA-Cache-Regeln werden nicht erweitert: nicht gecachte Fotos fallen offline auf SVG zurück.

Sieben lokale Owner-Ausgaben: `src/app.js`, `styles.css`, `src/core/catalog-media.js`, `src/data/catalog-media.js`, beide JPEGs unter `media/`, `tests/miele-parts.test.mjs`. Der letzte Test passt nur die bestehende Renderer-Quelltextprüfung an die ausgelagerte Medienfunktion an; keine Katalogprüfung entfällt. Diese gemeinsamen Dateien und Build-Bundles sind ausdrücklich **nicht** im PR eingecheckt.

## Reproduktion

Im exakten Arbeitsbranch und Repo-Verzeichnis; `site` muss für die erste Wiederherstellung fehlen:

```sh
python3 integrations/restore-source-checkpoint.py --target site
node integrations/catalog-media-wave3-audit.mjs --target site --heads integrations/catalog-media-wave3-head-evidence.json --output integrations/catalog-media-wave3-coverage.json
node integrations/catalog-media-wave3-import.mjs --target site --check
node integrations/catalog-media-wave3-import.mjs --target site
node integrations/catalog-media-wave3-import.mjs --target site --check
node integrations/build-app.mjs
node integrations/build-app.mjs --check
npm --prefix site test
npm --prefix site run check
node --test integrations/catalog-media-wave3-test.mjs
node integrations/catalog-media-wave3-verify.mjs
node integrations/catalog-media-wave3-browser.mjs
```

Build/Verifier benötigen das vorhandene esbuild 0.25.12 (optional `UF_ESBUILD_MODULE` als absoluter Modulpfad); Browser-QA Playwright (`UF_PLAYWRIGHT_MODULE`) und einen Chromium-Browser (`UF_CHROMIUM_EXECUTABLE`). Keine neuen Paket-/Lockfile-Änderungen. Der Verifier erzeugt zwei isolierte frische Checkpoints, prüft beide Imports und Builds und entfernt erfolgreiche temporäre Ausgaben. HEAD-Recherche ist getrennt und wird für reproduzierbare Tests aus dem archivierten Report gelesen, nicht live wiederholt. Für einen neuen HEAD-Audit vorher das JSON-Inventar mit dem Audit erzeugen, dann `python3 integrations/catalog-media-wave3-head.py --inventory <inventar.json> --output <neuer-report.json>`; keine ungeprüften Bild-GETs.

## Nachweise und Grenzen

- 40 bestehende App-Testgruppen und Syntaxprüfungen bestanden.
- 33 zusätzliche Medien-/Importer-Tests bestanden, einschließlich Konflikt, Rollback, Hash, Rechte, exakter Bindung, unerlaubter URL, Idempotenz und Branch-Grenze.
- Zwei frische Checkpoints: sieben Ausgabedateien und zehn Bundles byte-identisch; Hashbelege in `catalog-media-wave3-validation.json`.
- Acht Browserprüfungen bestanden: 320/375/768/1280 px, 200 % Text, echtes freigegebenes Bild, 404-Fallback, ungeprüfte Bilder ohne Netzwerkabruf, Tastatur, Teile-Fallback, warmes PWA-offline. Keine JS-Seitenfehler/externen Bildabrufe. `catalog-media-wave3-browser-evidence.json` und drei mobile Screenshots.
- Chromium-Emulation 153, keine physische iPhone-/VoiceOver-Prüfung. Mangels freigegebener Teilebilder ist deren load/error-Lebenszyklus synthetisch geprüft, keine reale Ersatzteilzuordnung behauptet.
- Main wurde nur lesend nachgeprüft: `71f7826ba936a1f3830c8b2a67e8085a9cfe234e`; dessen v1.29.0-Quellcheckpoint hat unverändert SHA256 `c600a5c5a83a6f096ff5999e5ce5582c37ec424155919d487dfd6ca2221bd42b`. Keine Rebase-/Main-Schreiboperation.

## Owner-Handoff #12

Entwurfs-PR prüfen, Import lokal auf unverändertem Quellcheckpoint reproduzieren und die sieben gemeinsamen Ausgaben über den Owner integrieren. Bei neuem Quellcheckpoint zuerst Lock/Import neu prüfen, nicht die Schutzprüfungen umgehen. Für weitere Fotos bildspezifische kommerzielle Rechte und exakte Variante/OEM-Bindung einholen und separat reviewen; vor neuer Batchfreigabe Manifestpins und Tests bewusst aktualisieren. Keine automatische Freigabe der 23 Kandidaten. Erst danach Shared-Checkpoint und Release nach dem Owner-Verfahren; dieser PR führt keinen Merge oder Deployment aus.
