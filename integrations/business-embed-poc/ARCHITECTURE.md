# Architektur, Datenschutz und wirtschaftliche Optionen

Status: Konzept für Issue #64 auf Basis des lokalen #50-Demonstrators, keine SaaS-/Rechts-/Compliance-Zusage, keine implementierte externe API. Aktuelle testbare Grenzen und Pilot-Gates stehen in [PILOT-READINESS.md](PILOT-READINESS.md). Der gemeinsame #48-Kern ist jetzt lokal verbunden. Dokument geprüft am 09.10.2026 gegen die [interne Strategie](https://github.com/Straikerabi/-universal-fitment/blob/research/affiliate-specialists-wave1/integrations/affiliate-specialists/B2C-B2B-DEFENSIBLE-ROADMAP-2026.md). Das [Release-Gate #42](https://github.com/Straikerabi/-universal-fitment/issues/42) bleibt bestehen.

## Heute implementiert / später erforderlich

| Grenze | Lokale Demo | Vor einem echten Pilot |
| --- | --- | --- |
| Mandant | Allowlist zweier frei wählbarer Testmandanten; Adapter verweigert fremde Antworten/Belege | Serverseitig authentifizierte Identität; Tenant aus Session/Token, niemals URL-/Body-Angabe vertrauen |
| Daten | Ausschließlich synthetische öffentliche/private Marker | Berechtigte, lizenzierte Daten außerhalb öffentlich zugänglicher Repos/Assets |
| Zugriff | Lokales Rollen-/Scope-Labor, keine Accounts/Geheimnisse; iframe ist keine Tenant-Sicherheitsgrenze | Authentisierte Rollenprüfung vor Lesen, Bewertung, Projektion, Export und Caching |
| Fitment | Lokaler gemeinsamer #48-Kern und Owner-Projektion, synthetisch/private-test | Berechtigter Datenintake und produktive Freigabe, keine kopierten Regeln |
| Transporte | Loopback-Staticserver, feste Dateiallowlist, Host-Prüfung, CSP, keine API | Separater authentifizierter Backenddienst, TLS, Origin-Allowlist, Rate-Limits, Monitoring |
| Logs | Minimale synthetische Zugriffsevents im Arbeitsspeicher, keine Server-/Benutzerlogs oder Nutzungsmetriken | Feldminimiertes manipulationsgeschütztes Audit-/Kostenprotokoll mit Zweck, Zugriff, Löschfrist |

Die Client-Testfixtures enthalten beide Händler und sind einsehbar. Ein query parameter wechselt bewusst zwischen den synthetischen Shops. Das ist **keine** Zugriffskontrolle für echte Daten. Tests sichern die Adapterprojektion, nicht eine vorhandene produktive Datenbankisolation. Auch die iframe-Sandbox mit allow-scripts/allow-same-origin im gleichen lokalen Origin ist keine Grenze gegen bösartigen eingebetteten Code. Eine spätere Einbettung benötigt einen eigenen kontrollierten Widget-Origin und minimale Sandboxrechte; die Demo-CSP erlaubt nur den eigenen lokalen Parent, keine fremden Shops.

## Mandantenmodell für einen späteren Pilot

Konzept: `Tenant → Member/Roles → DataGrant → SourceRecord → FitmentEvidence → Offer`. Jede private Zeile, Blob-, Cache- und Exportkennung trägt Tenant plus Daten-/Vertragsversion. Öffentliche Herstellerbelege werden in separatem öffentlichen Datenbereich geführt; private Händlerpreise und gemietete OEM-Belege werden nie durch Join/Export in öffentliches B2C kopiert. „Partner“ ist eine Rechteklasse, keine höhere technische Wahrheit. Ein Händlerangebot bestätigt keine Passung.

| Rolle (Konzept) | Minimaler Zugriff |
| --- | --- |
| Embed-Leser | Freigegebene UI-Antworten und erlaubte Angebote eines Tenants; kein Rohfeed |
| Händler-Redakteur | Eigene SKU-/OEM-Bindungen als Vorschläge; keine automatische Fitment-Freigabe |
| Tenant-Admin | Eigene Mitglieder/Quellrechte; keine fremden Daten, keine öffentliche Belegmanipulation |
| Qualitätsreviewer | Belege im ausdrücklich gewährten Review-Scope; Vier-Augen-Freigabe |
| Betreiber-Support | Kein pauschaler Datenzugriff; zeitlich begrenztes dokumentiertes Break-glass-Verfahren |

Default deny, object-level Tenant-Prüfung, Rechte vor Cachezugriff und Projektion, Feld-Allowlist, key rotation/revocation und Widerruf von Lizenzen. Deny-Tests vor Pilot: manipulierte tenantId, fremde Record-ID, gleiche SKU in zwei Shops, Cache-Key-Kollision, Export fremder Belege, abgelaufener Grant, Rollenwechsel, Supportzugriff ohne Zweck. Ein bloßer UI-Filter/RLS-Konzepttext ist keine umgesetzte Isolation; der spätere Backendentwurf braucht unabhängige Sicherheitsprüfung.

## Datenschutz und Herkunft

Demo: keine PII-Eingabefelder, keine Bilder/Uploads, keine Cookies, persistenten Speicher oder Analytics. Suchtext bleibt im Arbeitsspeicher und wird nicht übertragen. Typenschild-/Seriennummern und Reparaturfälle können später personenbeziehbar werden: nicht pauschal als anonym bezeichnen. Pseudonyme bleiben unter Umständen personenbezogen. Freitext und Originalbilder nicht in öffentliche Issues/Logs aufnehmen.

Vor Pilot Zweck/Rechtsgrundlage, Rollen als Verantwortlicher/Auftragsverarbeiter, Informationspflichten, Lösch-/Auskunftsprozess und mögliche Auftragsverarbeitung prüfen. Datenminimierung und zweckbezogene Speicherfristen aus Art. 5; Schutz durch Gestaltung aus Art. 25; Auftragsverarbeitungsprüfung nach Art. 28; angemessene Sicherheit nach Art. 32. Primärquelle: [DSGVO, EUR-Lex](https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX%3A32016R0679). Dies sind Prüfpunkte, kein Gutachten oder bestätigter rechtmäßiger Produktionsbetrieb.

Pro Quelle dokumentieren: Owner, Lizenz, erlaubte Zwecke/Tenants/Felder, Gebiet, Laufzeit, Änderungsrecht, Export-/Cachingrecht, Widerruf, Herkunft und Abrufversion. Drittbilder, OEM-Geheimnisse und unautorisierte Shopfeeds bleiben ausgeschlossen. Öffentliche technische Begründung und Händlerangebot separat darstellen; gesponserte Platzierungen als Werbung kennzeichnen, nie Ergebnis „passend“ kaufen. Demo enthält keine Sponsorzahlung oder Affiliate-Links.

## Spätere API-Optionen, nicht implementiert

Nur Konzept: eine private versionierte Request/Response-Schnittstelle nutzt direkt den gemeinsamen #48-Vertrag. Request enthält exakte Objekt-/Varianten-/Teilkennung und erlaubte Baugruppenbedingungen; Tenant kommt ausschließlich aus verifizierter serverseitiger Identität. Unbekannte Vertragsversion ablehnen, fehlende Informationen offen lassen. Antwort enthält nur lizenzierbare technische Begründung und davon getrennte Händlerangebote. Keine Einbettung von API-Geheimnissen im Browser.

| Option | Geeignet wenn | Grenze / Aufwand |
| --- | --- | --- |
| Host-Service + schlanker iframe | Händler wenig eigene Frontendressourcen hat | Betreiber übernimmt Herkunft, CSP, Verfügbarkeit und Datenschutzprüfung |
| Backend-SDK/Private API | Händler bestehende UI und Engineering hat | Versionierung, Auth, Tenant-Rechte und Integrationssupport erforderlich |
| Autorisierter Offline-Snapshot | keine Liveangebote benötigt werden | Lizenz muss Verteilung/Caching erlauben; Version/Expiry/Widerruf lösen |

Rate-Limits serverseitig nach Tenant **und** Benutzer/Token/IP soweit zulässig: gleitendes Fenster, begrenzte Parallelität, Payloadgrößen, zeitliche Laufzeitgrenzen; 429 plus retry-after, begrenztes Backoff. Rate-Limit schützt Kosten, kein Sicherheitsersatz. Beispiel-Testkontingente erst nach Messung festlegen; hier keine reale Quote oder API-Gebühr. Globale Schutzgrenzen verhindern einen lauten Tenant; private Fehler- und Rohdaten nie über Fehlermeldungen leaken.

Auditkonzept: Zeitpunkt, pseudonyme Actor-/Tenant-Kennung, Aktion, Vertrags-/Quellversion, Rechteentscheidung, Ergebnisklasse, Dauer/Kostenklasse. Keine vollständigen Typenschilder, Namen, E-Mail, Freitexte oder Geheimnisse loggen. Manipulationsschutz, enges Leserecht, dokumentierte zweckbezogene Frist; Sicherheits- und Rechnungsnachweise separat. Betreiberspezifische Infrastrukturzugriffe/IP-Logs ebenfalls vor Pilot berücksichtigen.

## API-/Preismodelle ohne erfundene Marktpreise

| Preisexperiment | Kostenbasis | Zu validierende Händlerfrage |
| --- | --- | --- |
| Einrichtung + monatliches Embed-Paket | Integrationsstunden, Datenpflege, Support, Betrieb | Kann das Team integrieren und rechtfertigt der gemessene Nutzen die Fixkosten? |
| Grundpreis + begrenztes Abfragekontingent | Fixkosten plus reale marginale Rechen-/Feed-/Supportkosten | Sind Menge und monatliche Kosten vorhersehbar? |
| Lizenzierter Snapshot + Wartung | erlaubte Distribution, Update-/Reviewkosten | Reicht Offline-Nutzen und wer prüft neue Varianten? |

Keine Europreise, SLA, Umsatz-/Ersparnisversprechen oder zugesagte Verfügbarkeit. Kostenmodell mit leeren Messfeldern: `C_monat = Infrastruktur + Datenlizenzen + Reviewstunden*Vollkostensatz + Support + Recht/Steuer + variable Abfragen`. `Mindestpreis_netto = C_monat / (1 - Zieldeckungsquote)` nur bei tragfähiger Zielquote und real gemessenen Kosten; Zahlungsbereitschaft separat ermitteln. Einrichtung amortisiert sich nicht automatisch. Bei Kontingentüberschreitung transparente Grenzen statt stiller Kostenexplosion. B2C-Kern bleibt kostenlos; kein bezahlter Passungsstatus und keine gekaufte Rangfolge.
