# Consumer Legal-/Privacy-Navigation · Wave7

**PRIVATE LOKALE PREVIEW, NICHT VERÖFFENTLICHEN.** Issue #82; Basis `620a4ae8bf49f5c0c212da4acddad249b8b8764b`. Keine rechtsgültigen Musterseiten, echten Betreiber-/Kontaktdaten, Angebote oder Rechtsfreigabe. Die vier Navigationseinträge sind funktionierende lokale Ziele, keine leeren `href="#"`-Buttons und keine erfundenen externen Kontakte.

## Lokal starten

Node 22+, im Repo-Root (Start und Unit-Tests benötigen keine Installation):

```sh
npm start --prefix integrations/consumer-legal-navigation-wave7
```

Öffne `http://127.0.0.1:4182`. Server bindet nur Loopback, lehnt fremde Host-/Origin-Header, Schreibmethoden und nicht erlaubte Dateien ab. Quelltests, Dokumente, npm-Dateien und private Belege werden nicht ausgeliefert. CSP blockiert Seiten-Netzwerkdienste, Formversand und Framing. Keine Remote-Bilder, Fonts, SDKs, Cookies, Consent-Banner oder Analytics. Keine Hersteller-/Händlerkontakte. Das Projekt verwendet eigene HTML/CSS-Elemente, keine ungeklärten Medien.

## Prüfen

```sh
npm test --prefix integrations/consumer-legal-navigation-wave7
npm run offline:check --prefix integrations/consumer-legal-navigation-wave7
python3 -m unittest discover -s integrations/consumer-launch-preflight-wave6 -v
npm test --prefix integrations/consumer-repair-mission-poc
```

Browser-Setup ausschließlich für lokale QA (kein Deploy, npm-Abhängigkeiten im Lockfile festgelegt):

```sh
npm ci --ignore-scripts --prefix integrations/consumer-legal-navigation-wave7
cd integrations/consumer-legal-navigation-wave7
npx playwright install chromium
npm run test:browser
```

Alternativ vorhandene intakte Browser-Runtime mit `UF_PLAYWRIGHT_MODULE=/absoluter/pfad/playwright/index.mjs` und `UF_CHROMIUM=/absoluter/pfad/chromium` verwenden. Der Browserlauf schreibt synthetische Resultate in `qa/browser-results.json` und zwei ignorierte QA-Screenshots. Screenshots zeigen keine Personen-/Betreiberdaten. CI installiert seine Testbrowser und lädt Diagnoseartefakte hoch, veröffentlicht aber keine Website.

## Navigation und Datenschutzkontrolle

| Ziel | Tatsächlicher Inhalt | Release-Status |
|---|---|---|
| `#legal-impressum` | Betreiberfakten fehlen; keine gültige Impressumsseite behauptet | P0 / BLOCKED |
| `#legal-datenschutz` | Vollständige technische Hinweise zu dieser lokalen Preview: Mission/Variante, Browserprofil, Offline-Dateien, Downloads und externe Abgrenzung | Art.-13-/Provider-/Betreiberabnahme P0 / BLOCKED |
| `#legal-kontakt` | Kein verifizierter Kontaktkanal, keine Fake-Adresse oder Kontaktform | P0 / BLOCKED |
| `#legal-daten` | Bestätigung und technisch überprüfte lokale Löschfunktion, Teilfehler sichtbar | Keine Serverlöschung, keine Rechtsfreigabe |

Normale Links, Back-/Deep-Link-/Reload-Unterstützung, `aria-current=page`, fokussierbare Überschriftencontainer, Tastaturbedienung und Live-Status. Die Navigation bleibt neben allen fünf synthetischen Schritten sichtbar. Keine zweite Fitment-Engine: die Testmission navigiert nur und bestätigt niemals ein Teil oder eine Passung.

Die Preview speichert nur eine explizit gespeicherte synthetische Mission. Die Löschpolicy umfasst beide reservierten Missionsspeicher, damit auch der zweite Modus/alte Teststände verschwinden. Kein Autosave oder automatische Worker-Installation. Erst ausdrückliches „Offline-Vorschau speichern“ schreibt die allowlisteten App-Dateien; das ist **keine** rechtliche Consent-/Erforderlichkeitsentscheidung. Ein Banner ohne nachgewiesenen Zweck wird nicht gebaut.

`readiness.mjs` unterscheidet kostenlose read-only Beta / Affiliate / B2B-SaaS. Alle bleiben `launchApproved:false`, `commercialApproved:false`, insgesamt BLOCKED. Eine syntaktische Belegreferenz beweist nichts und ergibt höchstens UNKNOWN. Die bestehende Wave6-Suite wird unverändert zusätzlich getestet; sie bleibt der Launch-Gate und wird nicht über ein grünes Navigationsresultat deaktiviert.

Weiter: [Produktintegration](INTEGRATION.md), [Löschgrenzen](PRIVACY-BOUNDARIES.md), [private Owner-Eingaben/Abnahme](OWNER-ACCEPTANCE.md), [gemessene Tests](VALIDATION.md).
