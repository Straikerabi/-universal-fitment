# Gemessene Fehler / Blocker · keine Produktfixes auf diesem Branch

**Historischer #75-Bericht.** #81 erlaubt nachträglich die minimalen Produktfixes. Aktuelle Ursachen, Fixes und CI-Abnahme: [ISSUE-81-VALIDATION.md](ISSUE-81-VALIDATION.md). Die folgenden Originalmessungen werden nicht rückwirkend als grün ausgegeben.

## W6-B1 · Label läuft bei 375 px / 200 % Schrift in die Nachbarspalte

Status: **reproduziert, offen, Produktänderung nicht angewendet**. Lokales Chromium 153.0.8010.0, Linux, 375×812 CSS px, `document.documentElement.style.fontSize='200%'`. Dies ist keine Aussage über physisches iOS Safari oder jedes andere Font-/Betriebssystem.

Reproduktion:

1. Unveränderte Consumer-Vorschau lokal starten bzw. den neuen Runner benutzen.
2. Den ersten Schritt bei 375×812 öffnen; Root-Schrift auf 200 % setzen.
3. Das erste `.search-row label` („Modell oder Gerätekennung“) messen.
4. Ist: `clientWidth=213`, `scrollWidth=223`; „Gerätekennung“ ragt 10 CSS px aus dem Label in Richtung Marke. Das Gesamtdokument bleibt 375 px breit, deshalb reicht eine reine `document.scrollWidth`-Prüfung nicht.

Automatischer Regressionstest: `text-200-375`. Screenshot: [unveränderte fehlerhafte Ansicht](evidence/local/chromium-text-200-375-failure.png). [Detailmessung des Vorschlags](evidence/local/label-proposal.json) enthält Browserversion, Schriftfamilie, Schriftgewicht 650, Schriftgröße 25,6 px und Vorher-/Nachhermaße.

Minimaler **Vorschlag für den Owner**, nicht hier implementiert:

```css
.search-row .field-label {
  overflow-wrap: anywhere;
}
```

Eine kurzlebige Diagnose setzt ausschließlich diese Eigenschaft im Browser. Danach sind `clientWidth=213` und `scrollWidth=213`; alle 3.719 geschützten Ausgangsdateien bleiben bytegleich. Das beweist nur die lokale Geometriewirkung des Vorschlags, nicht dessen produktive Integration oder komplette Cross-Browser-Abnahme. Nach einer Owner-Änderung müssen insbesondere beide Engines, alle vier Breiten und normale/200-%-Schrift erneut geprüft werden. Der Baseline-Test wird nicht als „expected failure“ aus dem Gate herausgenommen.

## W6-E1 · lokales WebKit durch Systembibliotheken blockiert

Status: **blockiert, 0 lokal ausgeführte WebKit-Fälle**. Das offizielle Playwright-WebKit-26.5-Bundle (Revision 2336) wurde heruntergeladen, kann aber in der Work-Umgebung nicht starten. Unter anderem fehlen `libgtk-4.so.1`, `libgstreamer-1.0.so.0`, `libevent-2.1.so.7`, `libGLESv2.so.2` und weitere Bibliotheken. Der vollständige Originalfehler steht im Ergebnis-JSON. Keine lokale Systempaket-/Berechtigungsänderung wurde vorgenommen.

Alle 33 WebKit-Pflichtfälle werden als blockiert, nicht bestanden geführt. Der isolierte CI-Workflow installiert die benötigten Runtime-Pakete in seiner Ubuntu-24.04-Maschine und versucht dieselbe vollständige Matrix. CI-Ergebnisse werden nur nach einem tatsächlichen Lauf dokumentiert; ein vorhandener Workflow allein ist kein WebKit-Testnachweis.

## W6-H1 · echte Apple-/Nutzer-Abnahme nicht verfügbar

Status: **nicht durchgeführt**. Kein macOS/Safari, physisches iPhone, VoiceOver-Hardwaretest, Homescreen-Installationsnachweis oder externer Nutzerpilot. Das Hardwareprotokoll ist vorbereitet; Teilnehmer-/Erfolgs-/Conversion-Felder bleiben leer. Selbst vollständig bestandene Linux-WebKit-/Chromium-Tests würden diese Abnahme nicht ersetzen.

Keiner dieser Punkte wird durch Änderungen am parallelen Katalog, am Snapshot oder am Fitment-Core kaschiert. Kein Merge nach main und kein Deployment.
