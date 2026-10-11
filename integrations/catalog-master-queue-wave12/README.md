# Wave12 – Katalog Master/Queue (Issue #109)

**Single Source of Truth:** Version 0.4.0 aus `integrations/universal-category-foundation/registry.mjs` (nur gelesen). `master.json` ist vollständig deterministisch abgeleitet: 13 Gruppen, **200 bestehende Blattkategorien**, 199 `planned`, eine private Pilotkategorie `vacuum-cleaner`. Master-Einträge enthalten Original-ID, Parent/Gruppe, Label/Aliasse, Original-Identifikationsprofil (Pflichtfelder/Varianten/Sicherheit), Registry-Fitment-Policy, Research-Zielmarkt DE als **nicht verifiziert**, Priorität, Statusvorschlag, Abhängigkeiten, Rechte-/Quell-/Passungs-Sperren. Keine anderen Kategorien erfunden.

**Dauerhafte Queue:** `queue-state.json` ist ein sparsames append-only Ereignisjournal, nicht eine zweite händisch kopierte Kategorieliste. Die jeweils vorgeschlagene Kategoriecharge lautet `<category-id>::research-0001`, anschließend nur nach tatsächlich abgeschlossener Charge und **explizitem next-batch-Event** `0002` usw. Ereignisse: `start`, `complete`, `block`, `resume`, `next-batch`. Gleicher Event-ID + gleicher Inhalt ist idempotent; widersprüchliche Events werden verweigert. Ein `complete` verlangt eine **interne Arbeitsbelegreferenz**, die ausdrücklich **kein** OEM-/Lizenz-/Safety-Beleg ist. Finished work wird niemals automatisch neu vorgeschlagen. `evidence-state.json` hält Quelle/Rechte/Fitment getrennt und verweigert jeden ungeprüften Freigabeanspruch.

**Owner-Reihenfolge:** Staubsauger → Waschmaschinen → Pkw-Identitätsdaten (eigenständige HSN/TSN/FIN/KBA-Datenquelle ohne Fahrzeugpassungsfreigabe) → Geschirrspüler → Trockner → Kaffee → Elektrowerkzeuge. Nach den fachlichen Prioritäten entscheidet Registry-Phase/Gruppe/Index. **18 regulierungsrelevante Kategorien** benötigen eine separate Owner-Scope-Entscheidung, bevor sie automatisch vorgeschlagen werden. Vorhandene Identitäts-/Safety-Policies einschließlich Luftfahrt, Sonderbereiche und reine öffentliche Referenzdaten werden unverändert beachtet.

## Ausführen

```sh
node integrations/catalog-master-queue-wave12/cli.mjs --check
node integrations/catalog-master-queue-wave12/cli.mjs --next 12
node --test integrations/catalog-master-queue-wave12/master.test.mjs
```

Status-Ereignis als JSON-Datei vorbereiten und ausschließlich mit `node integrations/catalog-master-queue-wave12/cli.mjs --append-event EVENT.json` übernehmen. Beispiel für reines Research-Start-Ereignis:

```json
{"eventId":"owner-ticket-001-start","categoryId":"vacuum-cleaner","batchId":"vacuum-cleaner::research-0001","action":"start","receiptRef":null,"reviewer":"project-owner","recordedAt":"2026-10-11T00:00:00Z"}
```

Die CLI schreibt nur `queue-state.json` und die generierten Reportdateien im **eigenen** Verzeichnis. Sie führt weder Scraping noch OEM-Datenimports aus. `--check` sperrt Registry-Drift, abweichende JSON-/Markdown-Reports, Quell-/Lizenz-/Fitment-Scheinfreigaben und unzulässige Journalübergänge. Im GitHub-Draft wird keine Queue-Arbeit als tatsächlich abgeschlossen vorgetäuscht.

**Kein App-Name geändert**, keine Daten anderer Abteilungen, keine Consumer-/Offline-/Source-Lock-Dateien, kein Main-Merge, kein Launch, kein Deployment. Die Owner-Rechteprüfung #108 zur Namensshortlist und das Marketing #107 laufen separat.
