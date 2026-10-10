# Universal Fitment – Wave8 Consumer Discovery (privater UX-Pilot)

**GitHub-Auftrag:** #90 · **Integrationsabhängigkeiten:** PR #89 und Owner-Issue #85. Dieser Ordner ist ein **isolierter, nur lesender** Prototyp. Er ersetzt keine bestehenden Consumer-Dateien, ist nicht in die App oder deren Offline-/Service-Worker-Liste eingebunden und darf nicht als freigegebene Live-Funktion bezeichnet werden.

## Konkrete Verbesserungen

- Dynamischer Gerätefinder: exakte Modell-/Material-/Hersteller-/Produktkennungen vor Teiltreffern, Suche mit mehreren Worten, tolerante Leerzeichen/Umlaute/Trennzeichen, aber **kein Fuzzy-Mapping** von /WD nach /WA oder fremden Revisionen.
- Facetten für Marke und im Snapshot dokumentierte Geräteart, stabile Sortierung und dynamische Treffer-/Katalogzahlen ohne eingebaute 11-/29er-Annahme.
- Native mobile Bedienelemente und explizite Gerätewahl. Der Steckbrief gruppiert **nur referenzierte Artikelidentitäten** in aufklappbaren Baugruppen, zeigt unbekannte Daten als „Nicht dokumentiert“ und trennt Quellenmarkt, Identität und **Passung ungeprüft** strikt.
- Safe HTML-Escaping und HTTPS-only externe Links mit `noopener noreferrer`; kein Tracking, keine Herstellerbilder, keine Preise, keine kaufbaren oder positiv passenden realen Teile.
- Responsive 320/375/390/430px-Layouts, 44px Mindest-Touchziele, Fokus-Indikatoren, Live-Ergebnismeldung, Dark Mode und Reduced Motion (visuelles Hardware-Review noch offen).

## Lokal prüfen

Node 22+, keine neuen NPM-Abhängigkeiten:

```sh
node --test integrations/consumer-discovery-wave8/*.test.mjs
cd integrations && python3 -m http.server 4179 --bind 127.0.0.1
# Private Vorschau: http://127.0.0.1:4179/consumer-discovery-wave8/preview.html
```

Die Vorschau importiert **ausschließlich** `../consumer-repair-mission-poc/catalog-snapshot.mjs` des gewählten Checkout-Branches. Es werden keine OEM-Daten kopiert oder erweitert. Der Basissnapshot kann 11 Geräte enthalten; PR #84 hat isoliert 29 Geräte, ist aber durch Issue #85 noch nicht endgültig integriert. Alle Zahlen werden **zur Laufzeit** aus dem jeweils importierten Snapshot ermittelt. Neue Kategorien werden nicht ohne reale Daten als verfügbar dargestellt.

## Schnittstelle für den Owner

`discovery.mjs` exportiert `normalize`, `safeSourceUrl`, `facets(snapshot)`, `findDevices(snapshot, filters)`, `deviceProfile(snapshot, id)`, `deviceCardMarkup(device, options)` und `profileMarkup(profile)`. Die Funktionen lesen Daten und entscheiden niemals Einbaupassungen. Das bestehende `mission-state.mjs` sowie das real-/synthetic-Mode-Handling bleiben unverändert. Wenn der Owner den Gerätefinder integriert, führt **nur er** die Navigation von einer ausdrücklich ausgewählten Geräte-ID zur existierenden `transition(..., {type:'device', value:id})`-Funktion aus.

### Vor Integration zwingend

1. PR #89 fachlich/CI prüfen; #85 mit dem WebKit-/Offline-Katalog und Originalquellen-Audit separat lösen. Keine ausstehende Quellenfreigabe durch diesen UX-Prototyp übergehen.
2. Gemeinsames `app.mjs`, `styles.css`, `catalog-snapshot.mjs`, Worker, Offline-Konfiguration und Legal-Source-Lock **nur durch den Owner** anfassen. Bei Einbindung Offline-Assets deterministisch neu fingerprinten und vorhandene Versionen invalidieren.
3. Owner CI erneut durchführen: 53+ Consumer-Tests, WebKit/Chromium **66/66**, Search-/Variant-/State-/Source-/Preflight-Gates und reales iPhone/Safari-A11y-Review. Eine rote oder nicht ausgeführte Prüfung ist kein Erfolg.
4. Bis manuelle Rechts-, Betreiber-, Herstellerquellen-, Sicherheits- und Hardware-Gates geklärt sind: `launchApproved:false`, reale bestätigte Einbaupassungen **0**, kein `main`-Merge, kein Deployment.

**Abgrenzung:** Der Steckbrief liefert bewusst weder Montageanleitungen noch Werkzeug-/Drehmomentangaben. Diese müssen nach Issue #86 erst quellen- und gerätespezifisch belegt werden; ein Designmuster erfindet keine Reparaturfakten.