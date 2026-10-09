# Übergabe an #48 und #54

Der Prototyp ist ein Consumer-Workflow, kein zweiter Fitment-Core. `mission-state.mjs` verwaltet Auswahl, offene Angaben und lokale Notizen. Für reale Geräte liefert die UI ausschließlich den eigenen Anbindungszustand „Passung noch nicht geprüft“, ohne OEM-Entscheidung. Vorhandene Katalogzuordnungen werden weder neu bewertet noch als Einbaufreigabe präsentiert.

## Heutige Grenze

| Ebene | Eingabe | Ausgabe und Geltungsbereich |
| --- | --- | --- |
| Identitätsprojektion | bytegeprüfter v1.29.0-Checkpoint | quellengebundene Geräte-/Artikelidentitäten; keine Fitmententscheidung |
| Reale UI-Mission | explizit ausgewähltes Gerät, ungeprüfte Nutzerangabe, Baugruppe | Status offen; Prüfkandidaten und fehlende Angaben |
| `mock-fitment-adapter.mjs` | ausschließlich `mode: synthetic`, `assetId: demo:vacuum-a`, bekannte Szene, passender Demo-Kontext | statische synthetische Fixture; kein Netzwerk und kein OEM-Beleg |
| Checkliste/Cache/Export | UI-Auswahl und Notizen | erhält Geltungsbereich und Quellen; keine Freigabe durch Abhaken oder Wiederherstellen |

`consumer-ui-fixture/1` ist eine lokale Fixture-Markierung, **kein Vorschlag für den Shared-FitmentResponse-Vertrag**. Der Adapter prüft Eingabe und Ausgabe: Modus, Gerätekennung, Variante, Baugruppe, Szene und Request-ID müssen zusammenpassen. Fehlende Demo-Ausführung, falsche Baugruppe oder abweichender Kontext erhalten keine positive Antwort. Eine inkompatible Demo-Position kommt nicht in die Teileliste. Fehlende Paketpositionen bleiben offen. In jeder Szene bleiben `purchaseAllowed` und `completeKit` false.

Reale Gerätekennungen, OEM-Artikelcodes, Herstellerbelege sowie Felder für Preise, Angebote, Bestand oder Lieferung werden vom synthetischen Adapter abgewiesen. Die Demo nutzt keine echten Marken und keine OEM-Quellen. Beide Modi haben getrennte Speicher. Es wird keine FitmentResponse gespeichert; nach dem Wiederherstellen wird der UI-Zustand neu abgeleitet.

## Spätere Shared-Engine-Anbindung

Erst nach einem dokumentierten Vertrag und einer ausdrücklichen Owner-Integration:

1. Den freigegebenen, versionierten #48-Vertrag lesen. Eine kleine Darstellungsschicht übersetzt dessen echte Antwort in UI-Texte; keine Consumer-Regeln zur Evidenzgewichtung, Kompatibilität oder Variantenvererbung hinzufügen.
2. Realen Auftrag mit vollständiger Geräte-/Variantenkennung, Baugruppe und eindeutiger Request-ID senden. Eine Antwort muss genau dazu gehören. Unbekannte Vertragsversion, veralteter Kontext oder fehlende Pflichtfelder bleiben offen; frühere Antworten werden nach Auswahlwechsel verworfen.
3. Status, belegte Gründe, fehlende Attribute, regionale/serielle Bedingungen und Originalquellen aus dem gemeinsamen Core anzeigen. Ein Quellenlink allein, Nutzertext oder historischer Katalogstatus darf keine positive Aussage erzeugen. Eine negative Aussage benötigt ebenfalls den entsprechenden Core-Beleg.
4. Source-/Rechteinformationen und Genauigkeitsgrenzen erhalten. Artikelidentität, modellgenaue Passung, vollständiges Reparaturset und genehmigtes aktuelles Angebot sind getrennte Aussagen.
5. Tests für reale positive, negative und unklare Antworten, widersprüchliche OEM-Belege, falsche Region/Revision, veraltete Requests und Cache-Versionen auf dem freigegebenen Vertrag ergänzen. Die synthetische Demo bleibt separat sichtbar und ersetzt keine Abnahme.

## Wave3-Handoff

#54 besitzt die Zusammenführung der Wave3-Ergebnisse und den neuen gültigen Checkpoint. Die aktuelle Projektion akzeptiert absichtlich nur den oben gepinnten Ausgangsstand und stoppt bei anderen Bytes. Auf diesem Branch keine Importer aneinanderhängen, Hash- oder Branchprüfungen umgehen, andere Work-Branches rebasen oder neue Artikel-/Fitmentzahlen als bereits integriert ausgeben.

Nach #54 müssen der freigegebene Commit, Checkpoint und die Quellensummen explizit aktualisiert, die Identitätsprojektion erneut geprüft und der Cache-Fingerprint versioniert werden. Nicht belegte Regionen oder Revisionen bleiben unbekannt. Shared-Engine- und Wave3-Handoff sind jeweils unabhängig zu reviewen; ein neuer Datenstand allein integriert keine Engine.
