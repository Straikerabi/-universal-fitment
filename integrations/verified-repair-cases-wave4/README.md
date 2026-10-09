# Issue #62: belegte Reparaturfälle, Wave 4

Isolierte Evidenzaufnahme auf `work/verified-repair-cases-wave4`, Basis main v1.29.0 (`71f7826ba936a1f3830c8b2a67e8085a9cfe234e`). Nur Dateien in diesem Verzeichnis. Kein Engine-Import, keine UI-/Katalogänderung, kein Deployment.

Ergebnis und zehn Fallberichte: [REPORT.md](REPORT.md). Quellenübersicht und Grenzen: [AUDIT.md](AUDIT.md). Maschinenlesbare Eingaben: `cases.json`, `sources.json`, `observations.json`. Datensatzvertrag: `repair-case-evidence/1.0.0`. Ein `manufacturer_listing` ist **keine** positive Reparaturfreigabe; sämtliche Kanten bleiben `unconfirmed`. Nullwerte bedeuten fehlende Beobachtung, nie „beliebig“.

## Offline reproduzieren

Ab Repository-Root, Python 3.12+ ohne zusätzliche Python-Pakete:

```sh
python3 integrations/verified-repair-cases-wave4/validate.py
python3 integrations/verified-repair-cases-wave4/report.py --check
python3 -m unittest discover -s integrations/verified-repair-cases-wave4 -p 'test_*.py' -v
```

Berichte neu erzeugen: `python3 integrations/verified-repair-cases-wave4/report.py`. Der Generator schreibt nur in dieses Verzeichnis. `coverage.json` und die zwölf Markdown-Berichte sind vollständig deterministisch; keine Uhrzeit oder Live-Netzabfrage beeinflusst sie.

## Herstellerbelege nachspielen

Die Erstprüfung verglich 36 erfolgreiche offizielle Antworten mit SHA-256 und 37 kontextgebundenen Beobachtungen (Zahlen durch `source_audit.py` verifizieren). Aus Datenschutz-/Nutzungsrechtsgründen werden die privaten HTML-/PDF-Kopien nicht mitgeliefert. `sources.json` enthält Abrufdatum, Original-/Weiterleitungs-URL, Hash, HTTP-Status und Rechtezustand; `observations.json` enthält Selektoren, genaue Gerätebereiche, Artikel und PDF-Seiten. `audit-lock.json` schützt die überprüften normalisierten Audit-Eingaben vor stiller Änderung innerhalb der Offline-Prüfung; er ist keine digitale Hersteller-Signatur.

Mit vorhandenen privaten Originalantworten (Dateinamen stehen in `sources.json`):

```sh
python3 integrations/verified-repair-cases-wave4/source_audit.py --cache /absolute/private-source-cache
```

Optionaler Neuabruf in ein **leeres externes** Cacheverzeichnis, Internet und Poppler `pdftotext` erforderlich:

```sh
python3 integrations/verified-repair-cases-wave4/source_audit.py --cache /absolute/new-private-cache --download
```

Live-Seiten können ihre Bytes ändern. Ein abweichender Hash führt zum Abbruch und manueller erneuter Quellenprüfung, nicht zur automatischen Freigabe oder Anpassung des Pins. Hersteller-Redirects müssen auf zugelassenen eigenen Domains bleiben. 404-Fehlversuche sind getrennt dokumentiert und liefern weder Artikel noch Unpassungsbeweise. PDFs wurden für die einschlägigen Seiten auch gerendert und visuell geprüft; keine Zeichnung wird kopiert.

Der Parser liest modellbezogene Miele-Zubehörkarten, BSH-Produktzubehör bzw. E-Nr.-BOMs, AEG-PNC-Ergebniskarten, Dyson-SKU-Teilekarten und Samsungs optionale Zubehör-Spezifikation. Vorwerk-Designation und bedingte Ausschlüsse sind manuell überprüfte, per Hash/Seite und Textmerkmalen reproduzierbare Herstellerangaben. Allgemeine Navigation, ähnliche Produktnamen und Marketing-„baugleich“ werden nicht zu Teilekanten expandiert.

## Bereits vorhandene Geräte prüfen

Der unveränderte Baseline-Checkpoint lässt sich mit dem vorhandenen Repository-Skript in ein neues Scratch-Verzeichnis restaurieren:

```sh
python3 integrations/restore-source-checkpoint.py --target /absolute/new-restored-checkpoint
node integrations/verified-repair-cases-wave4/catalog_selection.mjs /absolute/new-restored-checkpoint
```

Der Vergleich verlangt exakt ein bestehendes echtes Modellprofil pro Fall. Im Samsung-Baselineprofil stehen EEK/WD und EEM/WD gemeinsam; dieser Datensatz hält die recherchierte Black-Ausführung und ihre K-/M-Filtergrenze ausdrücklich getrennt. Das ist keine Änderung am main-Katalog.

## Tests und Übergabegrenze

Tests akzeptieren echte Herstellerlistings und deren eng begrenzte Ausschlüsse. Sie verwerfen erfundene Artikel, verlorene führende Nullen, falsche OEM-/PNC-Namensräume, Revisionstransfers, falsche BOM-Positionen, ungeprüfte Aliasse, Akku-/Farb-/Ländertransfers, falsche Quellen und jede positive Freigabe aus fehlenden Anschluss-, Geräte- oder Rechtenachweisen. Synthetische HTML- und Mutationsfixtures existieren ausschließlich im Testcode.

Es handelt sich um Dokumentrecherche, nicht um zehn physisch ausgeführte Reparaturen. Ausgewählte Baugruppen sind **partial**, keine vollständigen Explosionsstücklisten. Weitere Motor-, Elektronik-, Dichtungs-, Gehäuse- und Anschlussdetails bleiben offen. Öffentlich abrufbare Quellen werden nicht als kommerziell lizenzierte Dokumente ausgegeben. Der Datensatz implementiert keine konkurrierende Engine und enthält keinen produktiven Import in deren Vertrag; spätere Integration braucht geprüfte vollständige Nachweise.
