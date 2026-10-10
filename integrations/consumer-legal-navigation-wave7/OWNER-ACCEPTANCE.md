# Private Owner-Eingaben und separate P0/P1-Abnahme

Alle Fakten/Originalbelege **außerhalb des Repositorys** in einem vom Owner bestimmten geschützten, zugriffsbeschränkten Verfahren erfassen. Dieses Dokument nennt nur Feldnamen/Prüfgegenstände, keine echten oder erfundenen Werte. Keine Adressen, Geburts-/Steuer-/Kunden-/Loginangaben in GitHub, CI, Screenshots oder lokale Testfixtures. Keine Dokumentinhalte an diesen PoC übergeben.

## Private Input-Felder

| Bereich | Feld-/Prüfgegenstände außerhalb Git | Verantwortliche Rolle |
|---|---|---|
| Betreiber | tatsächliche Identität/Rechtsform; verifizierter Geschäftskontakt und zustellfähige Anschrift; Vertretung/Register/IDs soweit einschlägig; geprüfter Impressumstext und Geltung | Owner + fachkundiger Rechtsreviewer |
| Datenschutz | realer Verantwortlicher/Rechtekontakt; Datenkategorien/Zwecke/Rechtsgrundlagen; Empfänger/Rollen; Fristen/Transfers/DPA; Betroffenenprozess; überprüfte Notice-Version | Privacy reviewer + Owner |
| Hosting | konkret gewählter Tarif/Domain/Region; Verträge/DPA/Unterauftragnehmer; Access/Auth/Audit-/Backupretention; Zugang/Rollen; Zielumgebungsnachweise | Hosting/Engineering owner |
| Rechte | Asset-/Text-/Datensatzidentität, Berechtigter, Nutzungsumfang/Dauer/Gebiet, Bearbeitung/Credit, Nachweisquelle und Entscheidung | Content rights owner |
| Tätigkeit/Steuer | tatsächlicher Beginn/Einordnung; zuständige Stelle; anwendbare Anzeige/steuerliche Erfassung und Fristenentscheidung | Owner + qualifizierte Beratung |
| Aktivation | gewählter Modus, reviewed build/source, Verantwortlichkeit, Datum/Belegversion, explizit noch offene Punkte | Owner + fachliche Reviewer |

Ein Digest ist kein Beweis für echte Identität, vollständigen Text oder Reviewerfreigabe. Maschinenprüfungen dürfen höchstens Belegstruktur/Verweisexistenz prüfen; sie übernehmen keine inhaltliche Rechtsprüfung. `readiness()` nimmt keine Namen/Adressen/Steuerwerte an und kann eine Referenz nur UNKNOWN nennen. Wave6 bleibt unverändert BLOCKED.

## Überprüfbare Abnahmecheckliste (alle realen Abnahmen offen)

| Priorität / Gate | Nachweis vor späterem Start | Nicht ausreichend |
|---|---|---|
| P0 Ziel-App/Navigationsintegration | Owner-Integrations-PR; echte Ziel-IDs in allen 5 Schritten, Deep Link/Reload/Back, Tastatur, 320/375/390/430, Dark/200%-Text, Offline-Version und iPhone/Safari | Isolierte Preview allein; nur README-Link |
| P0 Betreiber/Impressum | reale private Fakten und fachliche Prüfung; sofort erreichbar veröffentlichungsfähige tatsächliche Darstellung | P0-Draftpanel, Platzhalter, syntaktischer Hash |
| P0 Privacy/Löschung | reale vollständige Datenflüsse/Notice; lokale Löschgrenzen, eigener Worker-Stopp, Storagefehler, kooperierende Tabs und externe Erasureprozesse getrennt belegt | lokaler Reset = Account-/Serverlöschung behaupten |
| P0 Hosting/Rechte/Tätigkeit | tatsächliche Entscheidungen/Vertrags-/Nutzungsbelege und Zielumgebung; #42/#43-Prüfgegenstände einzelfallbezogen abgenommen | kostenlos = automatisch frei; öffentliche Bild-/Daten-URL = Lizenz; grüne CI = Rechtsfreigabe |
| P1 Affiliate (vor Aktivierung) | reale Programme/API-/Assetrechte, Werbung/Ranking/Tracking, Angebote/Preise und neue Datenflüsse geprüft | normales Suchlinkziel oder synthetische Angebote |
| P0 B2B/SaaS (separate Aktivierung) | echte Mandanten-/Rollen-/API-Sicherheit, Vertrags-/DPA-/Logging-/Erasureprozesse | lokale synthetische Demo, Affiliate-Abnahme |
| P1 Qualität/Sicherheit | zugängliche Warnungen und reale Varianten-/Fitment-/Produktsicherheitsbelege nach Bedarf | Modell-/Teileidentität oder Prüfpass als Einbaufreigabe |
| P0 menschlicher Releaseentscheid | separat autorisierter dokumentierter Owner-/Rechts-/Privacyentscheid mit aktuellem Scope und noch offenen Einschränkungen | diesen Code ändern, um Sperren zu entfernen |

Kostenlose read-only Beta benötigt ihre P0-Abnahmen auch ohne Checkout. Affiliate und B2B sind getrennte Scopeentscheidungen. #42/#43 bleiben offen; keine Behördengänge, echten Kontakte, Verträge, Registrierung, Bestellung oder Zahlung in diesem Paket. Die technische Navigation ist fertig prüfbar, das Produkt bleibt rechtlich und hostingseitig gesperrt.
