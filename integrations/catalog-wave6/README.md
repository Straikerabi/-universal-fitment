# Issue #74 — Import gestoppt: Originalquellen fehlen

**Kein migrierter Consumer-Katalog.** Dieser Draft dokumentiert den im Issue ausdrücklich geforderten Abbruchfall und liefert eine read-only Vorprüfung. Er löst #74/#69 **nicht** vollständig. Weder neue Snapshot-Version noch neue Cache-Freigabe werden vorgetäuscht.

Branch ausschließlich `work/wave6-catalog-consumer-bridge`; PR-Ziel ausschließlich `integration/private-unified-preview-wave5-owner`. Ausgangs-HEAD `456c8b8936617f5275d8d1ccfc29601d559cac89`. Alle Änderungen liegen unter `integrations/catalog-wave6/`. Consumer `app.mjs`, Layout, Browser-QA, Shared Contract, B2B, Legal, main und Deployment bleiben unverändert.

## Exakter Blocker / gemessener Ist-Zustand

| Bereich | Tatsächlich geprüft | Fehlend / Grenze |
| --- | ---: | --- |
| Originalcheckpoint v1.29.0 | 136 Dateien, ZIP-CRC und SHA-256 gültig | Kein neuer Wave3-Checkpoint erzeugt |
| Modell-Worker-Originalantworten | 15 von 15 hash-identisch vorhanden | Rohdaten bleiben privat, nicht im PR |
| Teile-Worker-Originalantworten | 0 von 55 vorhanden | 55 historische HTTP-200-Antworten fehlen |
| Hersteller-Servicedelegation Hoover | 0 von 1 vorhanden | Ursprünglicher Hersteller-Service-Entry fehlt |
| Originalantworten insgesamt | 15 von 71 | **56 fehlen**, Import STOP |
| Tatsächlicher Consumer-Snapshot | 11 Geräte, 11 Artikelidentitäten | Keine neuen Geräte/Artikel projiziert |
| Historische bedingte Beziehungen in Evidenz | 36 | Keine Einbaufreigabe daraus |
| Wave4-Listings in Evidenz | 18 | 0 neue reale bestätigte Einbaupassungen |
| Kombinierter Wave3-Katalog | **hier nicht ausgeführt / nicht neu gemessen** | 1.115/1.961/1.843 sind historische Owner-CI-Zahlen, keine aktuellen Projektionsergebnisse |

Die vorhandenen Originalantworten wurden im verfügbaren Scratch rekursiv nach ihrem tatsächlichen SHA-256 gefunden, unabhängig von Dateinamen. Der spätere vollständige Scan berücksichtigt alle regulären Dateien außer Git-/Node-Abhängigkeiten und Python-Bytecode. Keine Rohantwort, Herstellerzeichnung oder Bilddatei wird versioniert.

**Jede benötigte URL, Quellen-ID, SHA-256, ursprüngliches Abrufdatum, Markt und Verfügbarkeitsstatus steht in [archive-report.json](archive-report.json).** Diese Liste ist das präzise Übergabepaket für die fehlenden Archive. Es fehlen 29 Samsung-Seiten, 25 Hoover-Artikel-/Modellseiten und eine verlinkte Hoover-Zeichnung aus dem Teile-Worker sowie ein Hoover-Hersteller-Service-Entry. Die Zeichnung ist nur Kontext, kein OEM-Nummernbeweis; ihre ursprüngliche Prüfkette darf nicht still wegfallen.

Metadaten, `observationSha256`, extrahierte OEM-Fakten, erfolgreiche historische CI und ein heute neu geladener ähnlicher HTML-Text ersetzen keine exakt gepinnte ursprüngliche Antwort. Auch die im Wave4-Cache vorhandenen Samsung-Antworten sind **andere Byteversionen**; ihre Hashes werden nicht umgeschrieben oder als Wave3-Archive ausgegeben. Kein Download und keine Quell-Pin-Ersetzung erfolgen automatisch.

## Reproduzieren

Python 3.12+, Node vorhanden; keine neuen Python-/npm-Abhängigkeiten nötig:

```sh
python3 -m unittest discover -s integrations/catalog-wave6 -p 'test_*.py' -v
python3 integrations/catalog-wave6/archive_gate.py --cache-root /absolute/private-source-cache
```

Mehrere externe Verzeichnisse sind mit wiederholtem `--cache-root` möglich. Ohne `--require-complete` erzeugt das read-only Audit einen JSON-Bericht; Erfolg der Inventarisierung ist **keine** Importfreigabe. Vollständigkeit als harte Schranke:

```sh
python3 integrations/catalog-wave6/archive_gate.py --cache-root /absolute/private-source-cache --require-complete
```

Mit dem hier geprüften Workspace stoppt dieser Befehl mit `IMPORT STOPPED: 56 original pinned responses unavailable` und Exit 1. Das ist der erwartete Schutzfall, kein erfolgreicher Import. Der gespeicherte Bericht kann mit `--check-report integrations/catalog-wave6/archive-report.json` byteunabhängig als strukturierte JSON-Ausgabe verglichen werden. Ein sauberer Checkout ohne private Originalcache-Dateien wird entsprechend weniger verfügbare Quellen messen und darf den lokalen 15/71-Stand nicht behaupten.

`archive_gate.py` hat weder eine Schreiboption noch einen Projector/Engine-Aufruf. Selbst vollständig vorhandene Archive erlauben noch keine Projektion: Zuerst Originalextraktoren auf den exakt gepinnten Worker-Ständen nachspielen, dann geschützte Owner-Komposition und deren Quellen-/Dateifingerprints prüfen. Ein vorhandener Hash ist keine mechanische Passung.

## Unveränderten Pilot regressionsprüfen

```sh
python3 integrations/restore-source-checkpoint.py --target /absolute/new-baseline-scratch
node integrations/consumer-repair-mission-poc/build-catalog.mjs --source /absolute/new-baseline-scratch --check
npm test --prefix integrations/consumer-repair-mission-poc
npm run offline:check --prefix integrations/consumer-repair-mission-poc
node --test integrations/fitment-engine-v1-poc/contract.test.mjs integrations/dual-platform-owner-review/bridge.test.mjs
```

Es wird die bestehende Schutzprüfung nicht umgangen: ausschließlich `--check`, kein Schreiben über den alten Worker-Build. Revisions-/E-Nr.-, PNC-, SKU-, Markt-, Quellen- und Cache-Fehler werden zusätzlich durch unveränderte Consumer-/v1-Regressionen geprüft. Der neue Preflight pinnt die OEM-/Modell-Evidenzdateien vollständig und verweigert jede geänderte Quellversion. Er implementiert ausdrücklich **keine** bereits abgenommene Wave3-Identitätsprojektion oder neue Variant-Matching-Logik.

## Abnahmekriterien: ehrlicher Status

| Issue-Kriterium | Status dieses Drafts |
| --- | --- |
| 1. Originalcheckpoint / geprüfte Quellen / Komposit | Checkpoint geprüft, Quellen inventarisiert; Import wegen fehlenden Archiven gestoppt |
| 2. Realer fail-closed Projector / eindeutige Geräte und OEM-Artikel | Noch blockiert; nur Vorprüfung, 11/11-Pilot erhalten |
| 3. Neue Snapshot-Version / Lock / Offline-Invaliderung | Absichtlich nicht durchgeführt, weil keine neuen Daten importiert wurden |
| 4. 36 bedingte Kanten / 18 Listings / keine Positivfreigabe | Evidenz unverändert, 0 neue Freigaben; UI unverändert |
| 5. Tests / reale Coverage / responsive Ablauf | Preflight und bestehende Regressionen geprüft; keine Tests eines migrierten Vollkatalogs behauptet |
| 6. Draft-PR / Ist-Soll / CI / Lücken | Blockierter Draft; neue Ziel-CI fehlt, siehe unten |

## CI-Grenze und nächste Owner-Schritte

Die vorhandene `wave5-private-unified.yml` läuft auf **Push zum Owner-Branch** oder PRs **gegen Wave4**, nicht auf diesem Work-Branch bzw. PRs gegen den vorgegebenen Wave5-Owner. Andere vorhandene QA-Workflows und der PR-Safety-Guard decken dieses neue Ziel ebenfalls nicht ab. Keine `.github`-Änderung liegt im erlaubten Work-A-Dateibereich. Deshalb wird kein historischer Run als CI dieses Drafts ausgegeben. Der Owner muss eine read-only Ziel-QA freischalten, ohne Merge oder Deployment.

Benötigt werden zunächst die **56 ursprünglichen Antwortdateien** mit genau den angegebenen Hashes, privat bereitgestellt; nicht erneut abgeleitete JSON-Records. Danach die originalen Model-/Parts-/Media-Worker-SHAs aus `archive-report.json` reproduzieren. Ihre Schreib-/Branchguards bleiben unverändert. Rechte für öffentliches/kommerzielles Rehosting von Originalseiten, PDFs und Bildern sind **unknown**, kein Rechtegrant wird erfunden.

Nach der Quellenabnahme: Vollindex gegen eine auditierbare Teilmenge bewusst entscheiden, Hersteller-/Länder-/Revisionskennungen und führende Nullen erhalten, 11 Pilotgeräte und 11 Originalartikel nachweisen, nur physische OEM-Identitäten zählen, echte leere Baugruppen zeigen, Snapshot/Lock/Offline-Fingerprint gemeinsam versionieren und alte Missionen zurücksetzen. Keine der 36 bedingten Kanten oder 18 Listings darf dadurch bestätigt werden.

**UI-Nacharbeit nur als Übergabe:** Work B/Owner muss nach einer genehmigten Projektion die sichtbare Datenversion, Such-/Filter-/Leermengen, Referenzgrenzen und gegebenenfalls Vollindex-Ladebudget prüfen. `app.mjs`, Layout und Browser-QA werden hier nicht überschrieben. Bis dahin ist die Vorschau ausdrücklich der bisherige 11/11-Pilot, nicht eine synchronisierte 1.115-Modell-App.
