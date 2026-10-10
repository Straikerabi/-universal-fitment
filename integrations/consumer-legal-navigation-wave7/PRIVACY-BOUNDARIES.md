# Lokale Datenschutzhinweise / überprüfbarer technischer Scope

Privater Entwurf. Keine vollständige Art.-13-Notice, kein bestätigter Verantwortlicher, keine rechtliche Freigabe. Die technische Beschreibung ist in der Preview tatsächlich erreichbar, online und nach vorbereiteter Offline-Speicherung. Sie dient nicht als ungeprüfter Text für ein öffentliches Produkt.

## Was wo verbleibt

| Bereich | Diese Preview | Bestehender Consumer nach möglicher Owner-Integration | Nicht durch App-Button gelöscht |
|---|---|---|---|
| Mission/Variante | Synthetische Angaben, Schritt und explizite Speicherung im Browserprofil unter `uf-legal-wave7:mission:synthetic`; zweiter reservierter Key `uf-legal-wave7:mission:real` ebenfalls in Löschpolicy | `uf-repair-mission-poc-v1-real` und `uf-repair-mission-poc-v1-synthetic`; lokal gespeicherte Auswahl/Variante/Prüfliste, keine gespeicherte authoritative Fitmentantwort | Andere Apps, andere Origins/Profile/Geräte, Browser-Verlauf |
| In-Memory-Zustand | Aktuelles Formular/Schritt wird vor Löschung zurückgesetzt; kein Autosave | Owner muss `state`, Suchtexte/Filter/Selection und laufende Persistenz atomar stoppen/zurücksetzen | Nicht kooperierende andere Tabs; tabübergreifende Nachrichten sind kein globaler Browser-Adminzugriff |
| Offline-Dateien | Eigene `uf-legal-wave7-assets-…`-Caches, nur lokale allowlistete Artefakte; explizite Installation | Eigene `uf-consumer-mobile-wave4-…`-Caches und Offline-Flag; künftige Versionen separat prüfen | Fremde Caches/Worker, HTTP-Cache außerhalb CacheStorage, Dateien auf anderen Geräten |
| Worker | Stop-/ACK-Protokoll verhindert neue Cache-Opens in kontrollierten Tabs, danach exakt eigenen Worker/Scope abmelden | Legacy-Worker unterstützt das neue Protokoll noch nicht; Owner muss eine geprüfte Quiescence-Lösung ergänzen, sonst keine vollständige Löschbehauptung | Fremde Worker; bestehende Worker-Kontrolle kann bis zum Online-Neustart weiterbestehen |
| Prüfpass/Downloads | Auf Wunsch synthetische JSON-Datei mit `launchApproved:false`, ohne Upload | Bestehende Text-/JSON-Prüfpässe können Variantenangaben enthalten | Downloadordner, Kopien, Clipboard, OS-/Cloud-Backups; Nutzer muss diese selbst verwalten/löschen |
| Auth/Cloud/Logs | Nicht aktiviert; loopback HTTP-Zugriffe ohne persistenten Serverlog dieses Testservers | Ältere v1.29.0-App besitzt separate Auth/Edge/Quota-Flows. Nicht automatisch in dieser Consumer-Navigation aktiv | Externe Konten/Sessions/Quotas/Providerlogs; kein lokaler Button löscht sie |

Local Storage ist nicht verschlüsselt und bleibt bis expliziter Löschung bzw. Browserdatenverwaltung gespeichert; keine ausgedachte automatische Frist. Technische Browser-/Betriebssystemspuren sind nicht durch diese Suite administrierbar. Variantsuchfelder dürfen keine persönlichen Angaben verlangen; Testdaten sind ausschließlich synthetisch. Ein Download-/Integritätsdigest ist kein Anonymitäts-, Lizenz-, OEM- oder Rechtsbeweis.

## „Alles lokal löschen“ — tatsächlich geprüfte Operation

1. Nutzer bestätigt konkret beide ausgewiesenen Missionsspeicher und eigene Offline-Dateien; ohne Bestätigung keine Mutation.
2. Mission im aktuellen Tab zurücksetzen; kooperierende Tabs werden über den eigenen BroadcastChannel benachrichtigt (nur soweit unterstützt, keine personenbezogene Nachricht). Kein Autosave darf alte Angaben zurückschreiben.
3. Eigene Worker im exakt passenden Scope müssen das Stop-Protokoll bestätigen. Fehlender/ungültiger ACK: PARTIAL, kein angeblich vollständiger Erfolg. Installations-/Fetch-Races nicht ausblenden.
4. Nur fest erlaubte Storage-Keys entfernen und Abwesenheit prüfen; kein `localStorage.clear()`.
5. Nur eigene Worker mit exakt passendem Script/Scope abmelden und Abwesenheit prüfen; fremde Registrierungen bleiben.
6. Nur eigenen Cache-Namespace entfernen und Abwesenheit prüfen. Bei unbekanntem Workerzustand keine riskante Cache-Löschbehauptung; einzelne Fähigkeiten können UNKNOWN bleiben.
7. UI zeigt PASS für den **engen technischen Löschscope** oder PARTIAL. Ein technisches PASS autorisiert keinen Launch, keine Serverlöschung und kein vollständiges DSGVO-Rechteverfahren. Offline-Neustart ist nach entfernten App-Dateien nicht zugesichert. Keine automatische Wiederinstallation; eine spätere explizite Speicherung ist eine neue Nutzeraktion.

## Vor Veröffentlichung zusätzlich außerhalb dieses PoCs

Echter Verantwortlicher und Datenschutzkontakt; Hosting-IP-/Access-/Errorlogs und Retention; Rollen/DPA/Transfers; realer Auth-/Sitzungs-/Account-Löschprozess inklusive Quote/Auditdaten; externe Quelllinks und eventuelle Bildabrufe; Affiliate-/Trackingzwecke; echte B2B-Mandanten und API-Berechtigungen. Betroffenenbegehren, Ausnahmen/gesetzliche Aufbewahrung und vollständige Informationspflichten benötigen reale fachkundige Prüfung. Nicht aus der Loopback-Vorschau heraus als erledigt markieren. #42/#43 bleiben offen.
