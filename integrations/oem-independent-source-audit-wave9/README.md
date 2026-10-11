# Wave9 · Reproduzierbarer OEM-Quellenaudit, keine Migration

Auftrag [#96](https://github.com/Straikerabi/-universal-fitment/issues/96), ausschließlich `work/wave9-oem-independent-source-audit`. Vorbereitete Basis **`3bafbc7fd8c8da5ed6fe3bddc70eacbc0be1e035`**; aktueller Owner-Stand bei Prüfung **`be7afa00ff2f69b9071d4d85da4c1f7c7e1a9b38`**. Handoff und Owner-STATUS auf beiden Ständen gelesen. Die Fortschrittsdokumentation ist neuer als die vorbereitete Basis; sie wird hier nicht geändert. Beziehungen: [#85](https://github.com/Straikerabi/-universal-fitment/issues/85), [#86](https://github.com/Straikerabi/-universal-fitment/issues/86), [Draft #84](https://github.com/Straikerabi/-universal-fitment/pull/84), [privat integrierter Research-PR #91](https://github.com/Straikerabi/-universal-fitment/pull/91).

## Tatsächlich geprüft

| Kennzahl | Lokaler echter Byte-Replay | CI/CLI ohne private Bytes |
| --- | ---: | ---: |
| `originalSourcesIndependentlyReplayable` | **33/33** | **0/33** |
| `newPageObservations` | **3/3** | **0/3** |
| `fullExactIdentity` neue Seiten | **2/3** | **0/3** |
| `individualFieldsWithOemLocator` neue Seiten | **14** | **0** |
| `unverified` Quellenrecords, nicht Feldvollständigkeit | **0/36** | **36/36** |
| `rightsGranted` | **0** | **0** |
| `approvedRealFits` | **0** | **0** |
| Wave7-Migration / Launch freigegeben | **nein / nein** | **nein / nein** |

Die **100 zusätzlichen Identitäts-/Locale-Fundstellen** in den 33 Originalantworten sind separat unter `originalArchive.records[].fields` nachprüfbar, nicht als 100 neue Consumer-Fakten zu zählen. Auch bei Quellenrecord `unverified=0` bleiben Serienstand, Anschlüsse, Rechte und physische Passungen offen. Der tatsächlich ausgecheckte Owner-Consumer ist unverändert **v1, 11 Geräte, 5 Marken, 11 Teile, 0 reale Fits** (erneut mit bestehender `catalog-scorecard.mjs` gemessen). Die 29 Geräte von #84 sind weiter ein isolierter, nicht integrierter Pilot. Kein #84-Merge und keine Änderung von #91, Consumer, CSS, Snapshot, Offline-Worker, Engine oder bestehenden Legal-Locks.

## Ursprüngliches Wave7-Archiv: erstmals in diesem Auftrag tatsächlich erneut bezogen

`wave7-private-oem-audit-2026-10-10.zip` wurde über den autorisierten privaten Dateizugriff erneut materialisiert, **nicht** aus einem Dateinamen oder Chat-Hash als verfügbar angenommen. Tatsächlich gelesen: **2.363.333 Bytes**, ZIP-SHA256 **`187f6bde4c88691b9521bb0d5e5cdeab0a0093ead750b1eb235341752cee535e`**, 33 HTML-Mitglieder sowie `receipts.json` und `AUDIT-ONLY.txt`. Alle 33 Originalantworten wurden mit den unveränderten Pins und vollständigen archivierten Receipts abgeglichen. `original-sources.json` ist eine byte-identische, reine Metadatenkopie von `integrations/catalog-wave7/sources.json` aus **PR-#84-HEAD `98532ea374f033f71c28bb9f4f47c00bf957c6b8`**; SHA256 **`61b31173fb6f620eb939120e818ef57aa9e976264b3cb7d27fee2cc75dbaa363`**. Dieser Pin wird hart geprüft.

`audit.py` ist ein **separater Standardbibliothek-Prüfpfad**: kein Aufruf des bisherigen Wave7-Importers, keine Code-/Datenänderung an dessen Branch. Für jede Originalquelle: exakte Source-ID, erlaubte OEM-URL und archivierte tatsächliche End-URL, Zeitzonenzeit, HTTP-/Content-Type-/Größenprüfung, SHA256 des gelesenen Rohmembers und konkrete eigene Geräte-/Artikel-Fundstelle. Vollständige PNC, BSH `/xx`, Dyson-SKU und Samsung `/WD` bleiben erhalten. Vorwerk FP7/MF7 bleiben **Teilebezeichnungen**, keine erfundenen numerischen Artikel. Drei damals ausgeschlossene AEG-PNC-Seiten werden nur als Originalantworten geprüft, nicht zu neuen Geräten gemacht.

**Grenzen der Unabhängigkeit:** Dies ist eine zweite technische Implementierung und ein erneuter autorisierter Archivbezug, **keine unabhängige Person, OEM-Beglaubigung oder signierte historische HTTP-Aufzeichnung**. Historische Abrufzeiten/End-URLs werden gegen die archivierten Receipts geprüft; aus einem HTML-Hash allein sind frühere TLS-Herkunft oder Zeitpunkt nicht beweisbar. Der Audit prüft die 33 Rohantworten und ihre Identitätskontexte, **nicht alle 14 ursprünglichen Geräte-Teile-Listungskanten, die komplette Consumer-Projektion oder Einbau-/Serienbedingungen**. Diese separaten #85-Abnahmen bleiben erforderlich.

Ohne Original-ZIP: `UNVERIFIED_ARCHIVE`, exakt **0/33**, exit **2**. Falsche Größe, ZIP-Digest, Mitgliednamen, doppelte Receipts, veränderte Originalpins oder fehlende eigene Identität verweigern die vollständige Archiveinstufung. Das ZIP wird nicht entpackt, HTML nicht ausgeführt. `VERIFIED_ORIGINAL_BYTES` öffnet lediglich den Nachweis des lokalen technischen Rohbyte-Replays: `migrationAllowed` und `legacyWave7MigrationAllowed` bleiben **false**.

## Distinkter neuer OEM-Batch

Der fertige Fetch-Code hat die folgenden **drei echten neuen Antworten** am **10.10.2026 ab 18:37 UTC / 20:37 Berlin** abgeholt. `observedAt` bezeichnet den dokumentierten Requestbeginn; `finalUrl` stammt vom tatsächlichen Response-Objekt. Dieser neue Batch ersetzt **keinen** alten Wave7- oder Wave3-Digest.

| Neue offizielle Quelle | Genau belegter Umfang | Bewusst nicht behauptet |
| --- | --- | --- |
| [Miele 11602400](https://www.miele.de/product/11602400/bodenstaubsauger-ohne-beutel-boost-cx1-parquet-powerline-lotosweiss) | Material 11602400, Boost CX1 Parquet PowerLine, Typ SNCF0, eigene Produktüberschrift, Locale de-DE, Behälter 1 l: **6 Felder** | Keine Serien-/Anschlussprüfung; der gleiche Typ SNCF0 rechtfertigt keinen Transfer auf 11602420 |
| [Bosch BGL75X1PRQ](https://www.bosch-home.com/de/de/product/staubsauger/staubsauger-mit-beutel/BGL75X1PRQ) | Eigener Produktcode in produktspezifischem Flight-Objekt, eigene Überschrift, Locale de-DE: **3 Felder** | **Kein `/xx`-Serviceindex belegt**; insbesondere nicht BGL75X1PRQ/23. Deshalb `fullExactIdentityVerified=false` |
| [Hoover HF202P 011 / 39401035](https://www.hoover-home.com/de_DE/akkusauger/39401035/hf202p-011/) | Handelscode HF202P 011, SKU 39401035, Locale de-DE, Leistung 165 W, Spannung 14,4 V: **5 Felder** | Keine Akkuteilnummer, Reparaturanleitung, Einbau- oder Sicherheitsfreigabe |

Alle drei HTTP **200**, kein Redirect, echtes HTML; bytegenaue SHA256/Größen in `new-receipts.json`. Die Kennzahl „vollständige Identität“ bedeutet ausschließlich die belegte Hersteller-/Handelskennung auf Material-/SKU-Ebene, **nicht** Vollständigkeit sämtlicher Serien-/Hardwarestände. Kein Zubehör und keine Passung im neuen Batch erfunden oder abgeleitet. Kein Bedarf, zusätzliche Varianten zur Zahlensteigerung hinzuzufügen.

Eigene DOM-Selektoren bzw. bei Bosch JSON-Flight-Pfade werden als konkrete Locator ausgegeben. Wiederholtes responsives OEM-Markup ist nur bei vollständig übereinstimmenden Identitätswerten erlaubt; ein passender Eintrag unter widersprechenden Geschwistern besteht nicht. Allgemeine Empfehlungen, URL-Substring oder globales Erwähnen eines Modellnamens sind keine Ersatzbelege.

## Rechte und Rohdaten

Jede Quelle trennt `factualUse=review_pending`, `pageRedistribution=not_granted`, `mediaB2c=not_granted`, `commercialUse=not_granted`. Diese konservativen Gates sind **keine Behauptung, dass jedes Faktum lizenzpflichtig sei**, und keine Rechtsberatung. Öffentliche Erreichbarkeit, Modellkennung, Request oder Hash erzeugen keine Wiederveröffentlichungs-/Commerce-/Bildlizenz. Quellen-/Plattformnutzung erfordert getrenntes Owner-/Rechtsreview. Keine vollständigen Seiten, PDFs, geschützten Bilder, Preise oder Lagerstände im Git.

Neuer privater Replay-Cache: `wave9-private-oem-observations-2026-10-10.zip`, **231.573 Bytes**, SHA256 **`f525b1ea4c55283d2da59016d5df5b4cbbfba4900b3bfcb5be2f59c480c9824c`**. Er enthält nur die drei Rohantworten, ihre neuen Receipts und den eingeschränkten Audit-Hinweis und wurde separat privat gesichert. **Nicht automatisch für einen anderen Chat/CI/Owner verfügbar.** Owner muss beide Archive autorisiert außerhalb Git bereitstellen; Digest und relative `rawLocator` dienen danach der Kontrolle. Keine signierten Download-URLs, Geheimnisse oder privaten Datei-IDs im Repository.

## Reproduzieren (Python 3.12+, Node 22 für bestehende Regressionen)

Reiner CI-Prüfpfad — benötigt weder Netzwerk noch private Browser-/Dateigeheimnisse:

```sh
python -B -m unittest discover -s integrations/oem-independent-source-audit-wave9 -v
python -B integrations/oem-independent-source-audit-wave9/verify_scope.py
python -B integrations/oem-independent-source-audit-wave9/audit.py
# letzter Aufruf absichtlich exit 2: ohne Rohdaten 0/33, 0/3, UNKNOWN/UNVERIFIED
```

Tatsächlicher Replay nach autorisierter Bereitstellung außerhalb Repo (Pfade durch die eigenen tatsächlichen Cachepfade ersetzen):

```sh
python -B integrations/oem-independent-source-audit-wave9/audit.py \
  --archive /external/wave7-private-oem-audit-2026-10-10.zip \
  --cache /external/wave9-unpacked-cache \
  --expected-report integrations/oem-independent-source-audit-wave9/audit-report.json
```

Exit 0 ist **ausschließlich** 33/33 Originalreplay + 3/3 neue Seiten, keine Import-/Passungs-/Launchfreigabe. Der erwartete Bericht wird immer aus den Rohbytes neu abgeleitet, nie als Inputbeweis übernommen. Andere Rechte-/Integrationsgates bleiben blockiert. `missing-evidence-report.json` dokumentiert den tatsächlich ausgeführten fehlenden-Bytes-Pfad.

Ein weiterer aktueller Abruf erzeugt stets einen **neuen externen Cache**, überschreibt keine alten Pins und gibt neue Receipts/Beobachtungen aus:

```sh
python -B integrations/oem-independent-source-audit-wave9/audit.py \
  --fetch --cache /external/new-distinct-cache \
  --archive /external/wave7-private-oem-audit-2026-10-10.zip
```

Dieser CLI ist branch-gesperrt. Bestehende Cachepfade werden verweigert, Antworten auf 4 MB begrenzt, fremde bzw. andere finale OEM-URLs blockiert. Bei späteren Netzwerk-/OEM-Sperren: Status `blocked`/`unverified`, kein Fixture als Ersatz; neue Hashes sind nur die tatsächlich geholten neuen Bytes. Bei späteren Änderungen wird ein abweichender neuer Bericht manuell geprüft, nicht das alte `audit-report.json` umgedeutet. Kein wiederholtes Aufrufen notwendig, um eine Sperre zu umgehen.

## Gemessene Tests und verbleibender Owner-Auftrag

Lokale Logs unter `evidence/`: **40/40** reine Schema-/Parser-/Negativtests, **167/167** unveränderte Node-Regressionen (Consumer, Engine, Wave8-Research, Scorecard), **16/16** bestehende Legal-Preflight-Tests; **0 Skips**. Zusätzlich zwei echte Netzabruf-/Byteprüfläufe für die Prioritätsseiten (Initialprobe und fertiger Fetch-CLI), vollständiger Archiv-Replay und deterministischer Reportvergleich. Die Netzwerkabrufe sind **keine** 40 automatisierten öffentlichen CI-Tests. Kein neuer Browser-/iPhone-/Menschenpilot behauptet; keine UI-Änderung in diesem Auftrag.

Mutationstests: vertauschte BSH-Revision/BOM, falsche PNC/SKU/Ländersuffixe/Teilecodes, irreführende Geschwister/Empfehlungen, fremde oder gleiche-OEM-falsche Redirectziele, Checksumme/Größe, fehlendes Archiv/Cache, doppelte Receipts, falsche Locale, Zeitstempel, Pfadtraversal, Cacheüberschreiben, Lizenzerhöhung und positive Fit-Claims. **Alle synthetischen HTML-/Hash-Inputs sind ausschließlich als solche markierte Unit-Testmutationen**, niemals Herstellerbelege oder Quellenrecords. Ein eigener isolierter Workflow führt reine Validierungen und den fehlenden-Bytes-Fail-closed-Pfad mit null Skips aus; keine Secret-abhängigen übersprungenen Rohdatenprüfungen.

Der Owner muss beide Archive selbst erhalten und den Replay wiederholen, die separaten ursprünglichen Geräte-Teile-Kanten/Consumer-Projektion prüfen, Rechte bewerten und #85 mit #95 konfliktfrei integrieren samt kombinierter Browser-/Offline-/Legal-Abnahme. **Wave3 bleibt wegen 56 fehlender alter Quellen blockiert. Keine Migration der 29, kein main-Merge, kein Deployment, keine echten Passungs-/Lizenz-/Launchclaims.**
