# Owner-Abnahmeplan / Issue #76

**Alle Einträge offen; keine reale Launchfreigabe.** Rollen sind Zuständigkeitsempfehlungen, keine erfundenen Personen oder beauftragten Rechtsberater. Owner benennt echte Verantwortliche außerhalb GitHub. In Git nur Status + nicht personenbezogene Prüfnachweise; Originaldaten privat halten. #42/#43 bleiben fachliche Abhängigkeiten.

## P0 — vor öffentlicher kostenloser Beta

| Reihenfolge | Verantwortliche Rolle | Konkretes To-do / akzeptabler Nachweis |
|---|---|---|
| 1 | Owner | Ziel-App/Modus/Scope schriftlich festlegen: neue read-only Mission oder Alt-App; kein Checkout, keine Affiliate-/SaaS-Aktivierung. Geprüften Quell-/Buildhash festhalten |
| 2 | Owner + fachkundiger Rechtsreviewer | Echte Betreiberfakten, Rechtsform, Kontakt, Register/IDs soweit einschlägig privat verifizieren; reale vollständige Impressumsdarstellung abnehmen |
| 3 | Owner + Steuerberatung/zuständige Stelle | Tätigkeit/Beginn/Gewerbe-/steuerliche Erfassung individuell entscheiden, Fristen planen; keine persönliche Steuernummer/Adresse in Git |
| 4 | Privacy reviewer | SOURCE-AUDIT-Datenflüsse vervollständigen, Rechtsgrundlagen/Art.13-Notice, Rechtekontakt, Rollen/DPA/Transfers und konkrete Retention klären |
| 5 | Content rights owner | Je veröffentlichtem Asset/Text/Datensatz Nutzungskette prüfen; ungeklärtes Material blockieren/entfernen. Herstelleridentität ist kein Rechtebeleg |
| 6 | Hosting owner | Konkreten kommerziellen Tarif/Domain/AGB/DPA/Region/Logs entscheiden; kein Pages-Business-Bypass. Noch keine Registrierung/Kaufgenehmigung |
| 7 | Consumer + privacy owners | Fehlende echte Legalnavigation separat implementieren; TDDDG-Zwecke, gegebenenfalls Consent, Löschung beider Modi/Caches und Downloadhinweise korrekt umsetzen |
| 8 | Auth owner (nur falls aktiviert) | Testumgebung: tatsächliche Auth/Sessions/Redirect/Erasure und Serverdaten nachweisen, keine produktiven Settingsänderungen durch diesen PR |
| 9 | Engineering | Vollständige HOSTING-MIGRATION-Matrix auf separat autorisierter Testumgebung, mobiles/PWA/Safari-Protokoll und Buildbelege liefern; Lockdrift erfordert neuen Review |
| 10 | Owner + Rechts-/Privacyreviewer | Offene Punkte einzeln entscheiden und echte fachliche Abnahme dokumentieren. Human release bleibt separate Aktion; CLI/CI erzeugt sie niemals |

## P1 — vor Affiliate-/Angebotsaktivierung bzw. Sicherheitsabnahme

- Affiliate owner: reale Programmzulassung, API-/Bild-/Caching-/Trackingrechte und Werbung/Rankingkennzeichnung prüfen; keine Neutralität bei bezahlter Beeinflussung behaupten.
- Commerce owner: echte aktuelle Preise/Verfügbarkeit/Anbieter/Gesamtpreis, Datenalter und Versand-/Kostenhinweise nachweisen; keine erfundenen/0-Euro-Ersatzwerte.
- Fitment owner: reale Passungs-/Varianten-/Produktsicherheitsbelege und Warnungen UI-seitig abnehmen. Keine zweite Engine oder Belegfreigabe aus Modellähnlichkeit/Prüfpass.
- Vor echten B2B-Kunden zusätzlich **P0**: B2B/security/privacy owners weisen Mandantentrennung, Identität/Rollen, API-Autorisierung, Verträge/DPA und Lösch-/Auditprozesse nach. Synthetische Demo ist keine Pilotfreigabe.

## P2 — Pflege / situationsabhängig vor Funktion aufzuwerten

- Consumer owner: reale iPhone/Safari-/Assistive-Tech-Tests und BFSG-Anwendungsentscheidung.
- Legal reviewer: VSBG/Verbraucher-Vertragsfunktionen prüfen, eigenen Checkout weiterhin ausgeschlossen lassen.
- Content/Engineering owners: Marken-/Logo-/OSS-Prüfung, Hinweisversionen und regelmäßige Quellen-/Providerupdates.

## Definition of done dieses Draft-PRs

Reproduzierbarer Quellenbefund, klare offene P0/P1/P2, getrennte Modi, offline Tests inklusive absichtlich geblocktem Beispiel und private Hosting-/Gewerbeentscheidungsgrundlage. **Nicht**: erledigte echte Rechts-/Steuer-/Providerklärung oder veröffentlichungsfähige Rechtstexte. Suite immer exit 2; Tests müssen gerade diesen Stopp bestätigen. Keine personenbezogenen Testdaten, neuen Engine-/Consumer-/Katalogänderungen, Cloudverbindungen, Merge oder Deployment.
