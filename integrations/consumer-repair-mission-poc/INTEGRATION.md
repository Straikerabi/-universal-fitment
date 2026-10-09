# Wave4-Übergabe an den Owner

[#63](https://github.com/Straikerabi/-universal-fitment/issues/63) verbessert ausschließlich die Consumer-Oberfläche auf `work/consumer-mobile-ux-wave4`. Der Draft richtet sich an `integration/dual-platform-owner-review`, Ausgangscommit `52f056664ddbf1a6c263a3d86feac3ee0128c054` aus [#59](https://github.com/Straikerabi/-universal-fitment/pull/59). Keine Änderungen an B2B, gemeinsamem Core, Produktions-App, Datencheckpoint, Importern anderer Waves, Workflows oder Deployment.

## Bestehende Engine-Grenze

| Ebene | Eingabe | Aussage |
| --- | --- | --- |
| Historischer Identitätssnapshot | bytegeprüfter v1.29.0-Checkpoint | Geräte-/Artikelidentität und bestehende Mitgliedschaft; keine neue Passung |
| Reale Consumer-Mission | ausgewähltes Gerät, ungeprüfte eigene Kennung, Baugruppe | Passung offen; Kandidaten, Originalquellen und fehlende Angaben |
| Synthetischer Consumer-Test | vorhandenes `buildSyntheticUiRequest` und `inspectOnBothSurfaces` aus #59 | gemeinsame v1-Engine entscheidet den Demo-Status; keine echte Marke/OEM-Freigabe |
| Darstellung | vorhandene Identitäten bzw. Core-Demoantwort | aufklappbare Listen, wörtliche Filter, stabile Name-/Code-Sortierung, Gründe und Lücken |
| Checkliste/Export | Auswahl und Notizen | keine Freigabe durch Vormerken, Abhaken oder Wiederherstellen |

Die bereits eingebundene Engine und ihre fünf vom Consumer-Server ausgelieferten Shared-Module bleiben unverändert. `mock-fitment-adapter.mjs` bleibt als historischer, isolierter Fixturebestand erhalten; er entscheidet nicht anstelle des v1-Core über den aktuellen UI-Status. Die bestehende Owner-Bridge lehnt reale Aufträge ab und erlaubt keine kommerzielle Freigabe. `purchaseAllowed` und `completeKit` bleiben false.

`parts-view.mjs` berechnet nur Darstellung: Baugruppenmitgliedschaften, Identitätsnachweis, Filtertreffer, Reihenfolge und Checklistenabschnitte. Ein ursprünglicher Quellenlink, historischer Status, eigenes Eingabefeld oder Filter erzeugt keine positive oder negative OEM-Entscheidung. Real sind alle Kandidaten „Passung unbestätigt“. Positiv bewertete synthetische Szenen zählen separat und bestätigen 0 reale Teile.

## Datenintegration #61

Die Zusammenführung und Migration der Wave3-Daten gehört [#61](https://github.com/Straikerabi/-universal-fitment/issues/61), aufbauend auf [#54](https://github.com/Straikerabi/-universal-fitment/issues/54). Dieser Branch verändert weder `catalog-snapshot.mjs` noch `catalog-lock.json`, `build-catalog.mjs`, `SOURCE-MANIFEST.md` oder den Quellcheckpoint. Zusätzliche Artikel- oder Fitmentzahlen aus anderen Waves werden nicht als bereits integriert angezeigt.

Wenn der Owner einen neuen geprüften Snapshot einbindet:

1. Den freigegebenen Datencommit, Checkpoint und präzise regionale/serielle Quellenbedingungen dokumentieren; die bestehende Projektion und Originalquellen unabhängig prüfen.
2. Die neue Daten-/Vertragsversion mit der bereits gemeinsamen Engine verbinden. Darstellung aus Core-Antworten übernehmen; keine Consumer-Regeln zur Kompatibilität, Variantenvererbung oder Evidenzgewichtung hinzufügen.
3. `offline:prepare` auf dem zulässigen Arbeitsbranch ausführen. Der lokale Cache-Fingerprint muss sich mit Snapshot/Core/Fixtures ändern. UI-/Worker-/Serveränderungen ändern ebenfalls die Offline-Version. Anschließend `offline:check`, Node- und Browserprüfungen ausführen.
4. Alte Missionen verwerfen, wenn ihr Schema oder Daten-/Core-Fingerprint nicht passt. Keine gespeicherten Statusantworten übernehmen. Quellenwebsite, Gerätevariante, Einbauentscheidung und lizenziertes aktuelles Angebot bleiben getrennte Aussagen.

Die aktuelle Wave4-UI nutzt Mission-Schema 2. Schema-1-Auswahlen werden beim Laden zurückgesetzt; dies ist keine Datensatzmigration. Die stabile Speicher-Namensgebung enthält historisch `v1`, der gespeicherte Payload ist dennoch versioniert. Filter sind flüchtige Darstellung und enthalten keine Fitmententscheidung.

## Offline- und Review-Grenzen

`prepare-offline.mjs` liest nur lokale Dateien und generiert in diesem Verzeichnis `offline-config.mjs`. 17 feste URLs enthalten die Consumer-Assets und die unveränderten Shared-Module, keine Nutzerantworten, Dokumente, Quellarchive oder externen Herstellerseiten. Der Worker speichert die Liste atomar; eine neue Version übernimmt erst nach Beendigung älterer Tabs. Es gibt kein erzwungenes `skipWaiting` und kein dynamisches Laufzeit-Caching. Ein Cache-Fehler behauptet keine gespeicherte Offline-Version.

Die lokale Vorschau benötigt Loopback oder einen sicheren Kontext. Der Draft veröffentlicht oder deployt sie nicht. Die Browserprüfung verwendet Chromium mit mobilen Viewports; physisches iPhone, Safari/WebKit, native Installation und Feldtests bleiben separate Prüfungen. Aktuelle Nachweise stehen in [WAVE4-VALIDATION.md](WAVE4-VALIDATION.md).

Der vorhandene Owner-Workflow startet bei Push auf den Integration-Branch oder PR gegen `main`. Ein Draft gegen den Integration-Branch kann daher ohne neue GitHub-Checks bleiben. Lokale Tests sind dokumentiert; auf diesem Branch werden keine fremden Workflows verändert oder Checks als gelaufen ausgegeben.
