# Genaues Owner-Integrationsrezept — kein automatischer Consumer-Patch

Issue #82 arbeitet ausschließlich in der isolierten Wave7-Suite. **Keine Änderungen** an Work Bs Consumer-CSS/WebKit-Fixes, Work As Snapshot/Katalog, Engine, alter Preflight-Suite oder Quellcheckpoint. Dies ist nicht die eigentliche Consumer-Integration und kein Deploy.

## Hooks in der aktuellen privaten Consumer-App

Basis: `620a4ae8bf49f5c0c212da4acddad249b8b8764b`. Nach parallel geänderten Quellen neu prüfen; keine Zeilennummer allein als Patch-Anweisung verwenden.

| Ziel | Aktueller Hook | Owner-Aktion nach Review |
|---|---|---|
| Persistent sichtbare Legalnavigation | `consumer-repair-mission-poc/index.html`: `.privacy-note` und `#workspace`; `app.mjs` ersetzt `#workspace` bei jedem Render | Neue separate Nav-/Panel-Hosts **außerhalb** des rerenderten Workspace anlegen, einmal mounten, bei App-Unmount destroy aufrufen. Auf allen 5 Schritten erhalten |
| Routing/Fokus | Consumer ist bislang kein eigener Legal-Hashrouter | Namensraum `#legal-*` reservieren; echte IDs/History/Back und Fokus koordinieren. Andere Hashes nicht abfangen. `#mission`/Rückkehr integriert Owner in seinen vorhandenen Ablauf; aktuelle Mission unverändert erhalten |
| Darstellung | Work B bearbeitet Consumer-CSS parallel | `styles.css` ist **nur Preview**, nicht global importieren. Optional `component.css` verwendet ausschließlich `data-uf-legal`-Roots; Theme/Reflow im Owner-Branch prüfen, bestehendes CSS hier nicht ändern |
| Lokale Daten | `mission-state.mjs` exportiert `storageKey(mode)`; `app.mjs` führt `state`, Such-/Filterzustand und `persist()` | Löschadapter mit `policy:'consumer'`, aktuellem realem Scope und Browserfähigkeiten. `beforeErase` stoppt Persistenz/laufende Aktionen und setzt beide Modi/In-Memory-Zustand zurück; `afterErase` rendert sicher ohne direktes Wieder-Speichern |
| Bisherige Löschbuttons | `#eraseMission` nur aktiver Modus; `#eraseOffline` trennt Cache von Mission | Eindeutige Beschriftung beibehalten oder neue „Alles lokal“-Aktion über bestätigten Adapter. Nicht stillschweigend aus einem Modus-Reset eine globale Löschung machen |
| Worker/Offline | `registerOffline()`, `toggleOffline()`, `offline-worker.mjs`, `offline-config.mjs`, `prepare-offline.mjs`, `serve.mjs` | Bestehender Worker hat kein Stop-/ACK-Protokoll. Eine aktuelle Quiescence-Lösung und Tabkoordination erst separat integrieren/testen. Neue Dateien in Asset-/Serve-Allowlist aufnehmen; Offlinespeicherung/Löschung darf nichts sofort neu erzeugen |
| Fingerprints | Bestehender Consumer berechnet seinen eigenen Katalog-/Core-/UI-Fingerprint | Nach tatsächlicher Owner-Integration **dessen** Generator laufen lassen und vollständige WebKit/Chromium-Regressionsmatrix erneut ausführen. Die neue Preview generiert nur ihren eigenen Fingerprint; niemals Work As Snapshot oder Work Bs Cacheversion hier überschreiben |
| Release-Gate | `consumer-launch-preflight-wave6/preflight.py` und Source-Lock | Nicht deaktivieren/automatisch aktualisieren. Änderungen verlangen erneuten Quellenreview; Legalnavigation ist ein technischer Nachweis, Betreiber/Privacy/Rechte/Hosting bleiben eigenständige P0 |

## Modul-Schnittstelle

```js
import {mountLegalNavigation} from './consumer-legal-navigation-wave7/navigation.mjs';
import {eraseLocal} from './consumer-legal-navigation-wave7/deletion.mjs';

// navHost/contentHost sind separate persistente DOM-Elemente.
const legal = mountLegalNavigation({
  document, window, navHost, contentHost,
  mode: 'free-readonly',
  onErase: () => eraseLocal({
    policy: 'consumer', scope: consumerScope,
    storage, cacheStorage: caches, serviceWorkers: navigator.serviceWorker,
    beforeErase: ownerPauseResetAndQuiesce,
    afterErase: ownerRenderWithoutPersistence
  })
});
// legal.setMode(...), legal.readiness(), legal.destroy()
```

`ownerPauseResetAndQuiesce`, `ownerRenderWithoutPersistence` und `consumerScope` sind **explizit noch zu implementierende Integrationshooks**, keine hier vorhandenen Produktionsfunktionen. Nicht als lauffähigen Produktpatch copy-pasten. `quiescePreviewWorkers()` ist nur für den eigenen `sw.mjs` der isolierten Preview geeignet; nicht auf den unveränderten Legacy-Worker anwenden und Erfolg behaupten. Jede fehlende Fähigkeit/Bestätigung muss sichtbar PARTIAL/UNKNOWN bleiben. Kein SDK/Adminclient, keine Auth- oder Serverdatenlöschung über diesen Adapter.

## Öffentliche Texte: separate menschliche Abnahme

Die neutralen P0-Panels dürfen nur privat gezeigt werden. Sie sind **keine Vorlage für ein öffentliches Impressum**. In einem später separat autorisierten Produkt-PR: echte verifizierte Operator-/Privacytexte aus dem vom Owner bestimmten geschützten Prozess übernehmen, fachkundig prüfen lassen, passende Kontaktroute verdrahten und die reale Datenflussbeschreibung aktualisieren. Nicht nur „P0“ entfernen oder `launchApproved` auf true ändern. Dieser PoC bietet keine automatische Freigabeschnittstelle oder öffentliche Placeholderkonfiguration.

Erst danach echte Navigationsziele in allen Schritten/Deep Links/Offline/Keyboard/Dark Mode und physischem iPhone/Safari nachweisen. Neue Provider-/Tracking-/B2B-Funktion verändert Scope und öffnet eigene Gates wieder. Eigener Checkout ist nicht Teil dieses Auftrags.
