# Gemessene Abnahme · Issue #82

Stand 10.10.2026, Basis `620a4ae8bf49f5c0c212da4acddad249b8b8764b`, Branch ausschließlich `work/wave7-legal-navigation-readiness`. Technische Abnahme der **isolierten** Preview, keine tatsächliche Consumerintegration, Rechtsfreigabe, main-Merge oder Deployment.

| Prüfung | Gemessenes Ergebnis | Grenze |
|---|---|---|
| Neue Node-Tests | 24/24 bestanden, 0 skips | Routes/Mode-/Beleggrenzen, sichere Policies, Fehler-/Restdaten-/Hookfälle, Worker-ACK, Offline-Fingerprint, Loopback/CSP/Datei-Allowlist |
| Neue Browsermatrix | 26/26 Szenarien bestanden, Chromium 153.0.8010.0 lokal | 320/375/390/430, Light/Dark, alle 4 Legalziele und 5 synthetischen Schritte, Fokus/Keyboard, Back/Deep Link/Reload, 200%-Text, echter Offline-Neustart |
| Lokale Datenkontrolle | Beide reservierten Missionsrecords gelöscht, fremder Storage/Cache erhalten, eigener Worker abgemeldet, zweiter Tab zurückgesetzt, keine automatische Neuerzeugung beim Reload | Explizite Bestätigung, synthetischer Download und Storagefehler geprüft; externe Daten/Downloads bleiben ausdrücklich erhalten |
| Seitenrequests/Laufzeitfehler | 0 externe Page-Requests / 0 JavaScript-Runtimefehler | Installations-/QA-Netzwerk für Testtools ist nicht Appbetrieb; kein Produktionsnetztest |
| Consumer-Regression | 53/53 bestehende Node-Tests bestanden | Consumer/CSS/Snapshot/Engine unverändert |
| Launch-Preflight-Regression | 16/16 bestehende Python-Tests bestanden; Gate bleibt BLOCKED/exit 2 | Alle 3 Modi; echte Operator-/Privacy-/Hosting-/Rechteabnahmen bleiben offen |
| Offline-Artefakte | SHA256 aus allen 9 eigentlichen Runtimeassets; Config separat, insgesamt 11 erlaubte Cache-Einträge (Root und index.html enthalten denselben Seiteninhalt) | Kein Katalog-/Core-/Consumerfingerprint verändert; keine Engine im neuen Assetset |
| Visuelle QA | Helle Privacy- und dunkle Löschansicht bei 390px tatsächlich gerendert und geprüft | Screenshots lokal/CI-Diagnostik, keine Personen/Betreiber; kein physisches iPhone/Safari-Testresultat behauptet |
| CI | No-deploy-Workflow und fest gepinnte Actions; Browserdownload nur Testumgebung; QA-Resultate separat | Tatsächlichen Runstatus im Draft-PR prüfen, lokale Resultate nicht als CI-Erfolg ausgeben |

`qa/browser-results.json` hält die tatsächlich durchgeführten Browserchecks und den eigenen Runtime-Fingerprint fest. Wiederholung kann Chromium-Version/Runtimeartefakte verändern, nicht die Abnahmegrenzen. Vor jedem Produktintegrationsschritt die volle Matrix erneut ausführen.

Während der Entwicklung behoben: tatsächliches Fokusproblem bei Hashnavigation, Reflow bei 200%-Text, fragmentunabhängige Offline-Cacheidentität und Worker-Stopp vor Cachelöschung; außerdem zwei Fehler im Testaufbau (Hostheader-Test via rohem HTTP statt Fetch; Groß-/Kleinschreibung im Textmatcher). Keine Fehler durch Testskips oder pauschal abgeschwächte Erfolgskriterien ausgeblendet.

P0/P1 und private Ownerdatenfelder in OWNER-ACCEPTANCE.md. #42/#43 bleiben offen. Kein rechtsgültiges Impressum/Art13-Dokument und kein Fake-Kontaktkanal vorhanden oder veröffentlicht. `launchApproved:false` gilt unverändert.
