# Universal Fitment — Projektleitungsübergabe und Chat-Team-Betrieb

**Stand:** 10. Oktober 2026 (Europa/Berlin)  
**Geltung:** Koordinationsdokument. Die GitHub-Branches, Pull Requests, offenen Issues und aktuellen CI-Runs haben Vorrang vor jeder statischen Zahl in dieser Datei.  
**Quelle der Wahrheit:** Dieses Repository, nicht einzelne Chat-Zusammenfassungen.

## Mission

Universal Fitment wird eine zunächst kostenlose Consumer-App für das exakte Identifizieren technischer und mechanischer Geräte, dokumentierte Ersatzteil-Identitäten, Gerätevarianten und hilfreiche Reparaturinformationen; perspektivisch B2B-Plattform für Hersteller und Händler. **Staubsauger sind die erste praktisch getestete Domäne**, nicht die endgültige Produktgrenze. Für weitere Domänen wurde in PR #88 eine **nur geplante** Taxonomie integriert: 13 Sektoren und 200 Blattkategorien; 199 `planned`, 1 private Consumer-Pilotdomäne (`vacuum-cleaner`). Dazu zählen Haushalt/Küche, Werkzeuge, Elektronik/IT, Robotik und smarte Assistenten, Fahrzeuge aller Art, E-Mobilität, Drohnen, Kameras, Maschinen, mechanische Bauteile, Sonderfahrzeuge, zivile Luftfahrt und eingeschränkte öffentliche Referenzbereiche für Militär- und Raumfahrt.

**Keine breite Kategorie als erhältlich oder geprüft bezeichnen, solange echte Geräte-/Teile-/Rechte-/Sicherheitsdaten fehlen.** Wichtige Regulierung: Nicht alle Teile lassen sich rechtmäßig ohne spezifische Zertifizierung installieren oder handeln. Militärische und Raumfahrtkategorien sind im jetzigen Modell ausschließlich unsensitive öffentliche Referenzdaten; keine Waffen-, kontrollierte Hardware-, Export- oder Lufttüchtigkeitsfreigabe.

## Rollen – maximal vier normale Chat-Bereiche plus drei Work-Ausführungsteams

| Chat/Team | Verantwortung | Branch-/Dateirechte |
| --- | --- | --- |
| **Leitstand / Projektleiter** | Priorisieren, CI-/PR-Abnahme, Statusberichte, rechtlich/technisch sichere Integration und Handoffs | **Einziger Owner**, der in `integration/private-unified-preview-wave5-owner` integriert; niemals ungefragt `main` |
| **Katalog & OEM** | Offizielle Quellen, vollständige Gerätetypen, Originalteilcodes, Provenienz, Datenqualität, Prüfkandidaten | Eigene `work/`- oder `research/`-Branches; nie ohne Owner auf Owner-Integration |
| **Consumer & Design** | Suche, Filter, aufklappbare Baugruppen, Geräteansicht, responsive WebKit/iPhone, Offline/PWA, Accessibility | Eigene isolierte Branches, Änderungen an `app.mjs`, `styles.css`, Offline-Dateien nur nach Task-Scope; nicht zeitgleich mit dem Katalog-Integrator |
| **QA, Recht & Business** | Verifizierbare Tests, Legal-/Privacy-/Hosting-Gates, B2C-Beta, spätere Commerce-/B2B-Prüfungen | Isolierte QA-/Preflight-/Business-Branches; niemals rechtliche Freigabe automatisieren |
| **Work A/B/C** | Die drei bestehenden Work-Sitzungen bleiben Ausführungsteams für größere geschlossene Tasks | Jeder Auftrag eigene Issue-ID, isolierten Branch, explizite DoD, CI und Draft-PR gegen Owner; keine parallelen Bearbeitungen derselben Dateien |

**Wichtig:** Normale Chats sind keine automatisch laufenden Hintergrundprozesse und besitzen nicht unabhängig mehr Work-Kontingent. Neue Chat-Fenster umgehen keine kontobasierten Limits. **Nicht** dieselbe Datei von mehreren Chats gleichzeitig bearbeiten. Aufgaben erst aus GitHub lesen, Work-Ergebnisse tatsächlich prüfen, Änderungen erst nach Review übernehmen.

## Ausführungsschema für alle Chats

1. Aktuelle offene GitHub-Issues, Pull Requests, Branch-HEADs, zuletzt abgeschlossene Actions/Fehler und die vorhandenen Owner-Statusdateien prüfen. Nicht auf ältere im Chat zitierte SHAs vertrauen.
2. Einen messbaren, nützlichen Task aus dem vorhandenen Backlog wählen oder fehlenden Task präzise erstellen; Dateiscope, Inputs, Nachweise, Befehle und Test-/Sicherheits-Gates definieren.
3. **Immer isolierter Branch und Draft-PR** gegen den privaten Owner-Integrationsbranch; kein direktes `main`, keine öffentliche Site, kein Deployment. Kleinere GitHub-/Datenarbeiten möglichst direkt in normalen Chats erledigen; Work nur für größere Browser-, Code- und Integrationsaufgaben einsetzen.
4. CI und reproduzierbare Zahlen vor Status-Aussagen prüfen. Eine rote CI wird **niemals** als „alles grün“ bezeichnet. Reale Manufacturer-ID/Quell-URL/Digest bedeutet **nicht** verifizierte Einbaupassung, B2C-Lizenz oder rechtliche Freigabe.
5. Der **Leitstand** führt Reviews und eventuelle private Owner-Merges aus, aktualisiert zentralen Status, veröffentlicht eine neue Aufgabenverteilung. Keine Worker-Merges untereinander.

## Tatsächlicher geprüfter Zustand bei Anlage dieser Datei

### Mehrdimensionale Scorecard (Planungswerte, keine Testabdeckung)

- **Technische App-Entwicklung:** 59 % (Projektleitungs-Schätzung)
- **Marktreife:** 41 % (gewichtete Projektleitungs-Schätzung)
- **Katalog in der gemeinsamen privaten Consumer-App:** **11 Staubsaugermodelle, 5 Marken, 11 Originalteilidentitäten, 11 Geräte-Teile-Kandidaten**
- **Staubsauger-Ausbauziel:** 11/500 = 2,2 %; die 500 sind **kein** Gesamtziel für alle 200 Kategorien und keine gesetzliche Beta-Mindestzahl
- **Strukturierte Informationstiefe:** 28,2 % (interner quellenbezogener Feldabdeckungsindex), gerätespezifische Reparaturschritte und Werkzeuge derzeit 0/11
- **Reale positive freigegebene Einbaupassungen:** **0**
- **Gewerbe:** Abhängig vom realen Beginn einer gewerblichen Tätigkeit, nicht vom Prozentsatz. Vor tatsächlichem geschäftlichem Beginn rechtzeitig klären/anmelden; unkommerzieller privater Prototyp ist anders zu behandeln.
- **Marktstart:** **NO-GO** (Betreiber-/DSGVO-/Hosting-/Bild-/Quellen-/Safety-/Realgeräte-/Beta-P0 fehlen).

**Anderer Stand, nicht mit Owner verwechseln:** Work A PR #84 enthält im *isolierten Draft* 29 Modelle, 8 Marken, 22 Teilidentitäten, insgesamt 25 Kandidatenkanten. Kein positiver realer Fit. Nicht im gemeinsamen Owner-Consumer integriert; Originalauditarchiv `wave7-private-oem-audit-2026-10-10.zip` (33 Antworten) liegt laut Worker **außerhalb GitHub** und ist dem neuen Chat nicht automatisch verfügbar. Alte Wave3-Scratch-Zahlen (1.115 Zeilen) sind **nicht** als aktiver Consumer-Katalog zu zählen.

### Technische Vorarbeiten / PRs

- **PR #73:** privater Owner-Integrations-PR gegen Wave4; Branch `integration/private-unified-preview-wave5-owner`.
- **PR #88:** 200-Kategorien-Registry wurde am 10.10.2026 bereits in **privaten Owner-Branch** integriert (Commit `fd256275000afcb498577364cf250398483785f1`); 6/6 Registry-Tests bestanden. Kein Katalogzuwachs durch Registrierung.
- **PR #84 / Issue #80:** isolierter Wave7-OEM-Modellpilot, weiter Draft und **nicht vollständig unabhängig auditiert / nicht konfliktfrei integriert**.
- **PR #77 / Issue #74 / #69:** historischer Wave3-Import **BLOCKED** wegen fehlender Originalantworten (56 von 71 benötigten).
- **Issue #85:** Owner-Integration PR #84 mit WebKit-/Offline-Fixes und Source-Lock-Audit; zentrale Daten-/Integrationspriorität.
- **Issue #86:** tiefe gerätespezifische Inhalte, Datenfelder, Reparaturhilfe, Werkzeuge, Sicherheitsinformationen und Rechte.
- **Issue #87:** längerfristige Multi-Domänenarchitektur, keine automatische Live-Freischaltung.
- **PR #89:** aktueller isolierter eigener Consumer-UI-Fix im Branch `integration/consumer-catalog-live-count-owner`: feste Anzeigen `11 Geräte/5 Marken/v1.29` künftig anhand des *tatsächlichen geladenen Snapshots* berechnet. **53/53 Consumer- und 6/6 Katalog-Node-Tests bestanden** auf eigenem Branch ([Run 38071757005](https://github.com/Straikerabi/-universal-fitment/actions/runs/38071757005)); neu generierte Offline-Fingerprints. **Weiter Draft:** getrennte Browser-WebKit-/Preflight-Läufe zuletzt teilweise **ROT**, finale CI und überprüfter Source-Lock noch offen. Hash-Delta-Kontrolle [38071860529](https://github.com/Straikerabi/-universal-fitment/actions/runs/38071860529) lief erfolgreich und bestätigte `BLOCKED`. Vor Übernahme Recheck/Fehlerursachen beheben; nicht still `source-lock.json` und `baseline-report.json` umschreiben.
- **Work B #79** wurde vorher mit 66/66 Chromium/WebKit in Owner integriert, aber jede weitere Änderung an Consumer-Assets erfordert **erneute kombinierte Browserprüfung**.

## Nächste echte Arbeit (Reihenfolge)

**P0 / 1: PR #89 sauber abnehmen.** Branch/CI/Source-Diffs auf aktuellem SHA inspizieren, rote Browser-/Preflight-Gates analysieren und korrekte Offline-Hash-Pins/Legal Source-Review nachweisen; nur nach Abnahme privat integrieren. **Nie durch Deaktivieren der Guards.**

**P0 / 2: Issue #85, PR #84.** OEM-Quellenarchiv unabhängig lesen oder, falls nicht vorhanden, fehlende Quellen **explizit blockieren**. Consumer-Katalogprojektion und bestehenden WebKit/Offline-Worker konfliktfrei zusammenführen. Modell-, Teile-, Source-/Rechte-, Negative-Fitment- und Browser-Tests mit gemessenen Counts. Kein erfundener Nachweis.

**P1 / 3: Issue #86.** Strukturierte, modellbezogene Gerätesteckbriefe aus legal nutzbaren tatsächlichen Herstellerquellen: Varianten, Maße, technische Daten, Werkzeuge, sichere Anleitungen, Originalteile, Serien-/Revisionseinschränkungen, Bildrechte. Bei fehlenden Daten im UI als unbekannt anzeigen, nicht durch Fantasiefakten auffüllen.

**P1 / 4: Reale UX-/Hardware-Beta.** Physisches iPhone/Safari, Accessibility und echter Nutzerpilot; künstliche Aufgaben werden nicht als echte Nutzer gewertet.

**P2 / 5: Vorsichtige zweite Geräteklasse.** Zuerst ein vollständig quellengeprüfter Mini-Pilot (z. B. Waschmaschine oder Geschirrspüler); Kategorie-Registry allein ermächtigt die aktuelle `vacuum-poc-1` Fitment-Engine **nicht** zu positiven Nicht-Staubsauger-Passungen.

### Generelle Freigabegrenzen

- **Kein Merge nach `main` oder Deployment**, außer der Nutzer autorisiert beides ausdrücklich nach Legal-/Operator-/Safety-/Hosting-Review.
- **Kein bestätigtes reales Fitment** aus bloßen Herstellerlisten; Differenzierung: beobachtete OEM-Teileidentität / modellbezogene Listung / unabhängig bestätigte physische Montage- und Sicherheitspassung.
- Keine fingierten OEM-Modelle, Teilnummern, Preise, Lieferzeiten, Rechtslizenzen oder B2C-Bildrechte.
- Kein öffentliches Impressum mit ausgedachten Betreiberangaben; kein automatisches `launchApproved:true`.
- Die noch offenen rechtlichen P0 sind **nicht** durch 200 geplante Kategorien beseitigt.

## Führung und Wechsel des Projektleiter-Chats

Beim Wechsel zuerst **diese Datei und den aktuellen GitHub-Zustand** lesen. Der neue Leitstand übernimmt danach die **alleinige Owner-Integrationsrolle**. Den vorherigen Leitstand ab dann für keine parallelen Merge-Aufträge mehr verwenden. Die drei Spezialisten-Chats und die drei vorhandenen Works können weiterhin isoliert arbeiten. Für aktuelle Arbeit stets Issues/PRs als Transferprotokoll; keine Erwartung, dass ein neuer Chat die vollständige Geschichte anderer Chats automatisch sieht.

**Satz für den neuen Leitstand:** „Übernimm die Projektleitung von Universal Fitment. Lies `docs/PROJECT-LEAD-HANDOFF.md`, `integrations/private-owner-wave5/STATUS.md`, offene Issues/PRs und aktuelle CI im Repo `Straikerabi/-universal-fitment`. Koordiniere drei bestehende Work-Sitzungen und spezialisierte Chats, prüfe alle tatsächlichen Ergebnisse und führe ausschließlich sichere private Integrationen aus. Kein `main`-Merge oder Deployment. Melde Technik, Marktreife, echte Katalogabdeckung, Inhaltstiefe, positive reale Passungen, Gewerbe und Launch-Status separat. Priorisiere aktuelle PR #89, Issue #85 und #86.“ 
