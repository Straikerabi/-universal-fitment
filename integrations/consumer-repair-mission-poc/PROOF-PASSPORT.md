# Repair Evidence Passport · Wave 5 Owner-Prototyp

## Warum wir ihn gebaut haben

Ein grüner Haken bei einer Modellnummer allein ist kein langfristiger Vorsprung: iFixit prüft bereits Modelle und Varianten; FixPart bietet eine Passgarantie und Reparaturprüfung. Unsere mögliche Differenzierung ist eine **portable, überprüfbare Arbeitsgrundlage** für die konkrete Geräteausführung, mit Belegen, offenen Fragen und später gemeinsamer Verwendung zwischen Verbraucher und Händler. Diese Eigenschaft ist derzeit eine Produkt-Hypothese, **kein bewiesener Wettbewerbsgraben**.

## Was tatsächlich funktioniert (privater Consumer-Pilot)

Am Ende der bestehenden fünfstufigen Reparaturmission gibt es **„Prüfpass (JSON)“**. Der lokale Browser erzeugt ohne API, Tracking oder Datenübertragung:

- Geräte-/Herstellerkennung, Quellenmarkt, Original-Identitätsquelle und Beobachtungsdatum
- eigene, **ungeprüfte** Gerätekennungen, Modell- und Checkpoint-Version, Daten-Fingerprint
- ausgewählte Originalteil-Identitäten und deren vorhandene Originalquellen
- konkrete noch zu prüfende Angaben, abgehakte Notizen und Gründe
- explizite `unconfirmed`-Entscheidung für reale Geräte, `physicalFitApproved: false`, `purchaseAllowed: false`, `completeRepairKit: false`
- dauerhaft sichtbare Trennung der synthetischen Testfälle von Herstellerdaten
- SHA-256-Prüfsumme gegen versehentliches Verändern des JSON. **Keine digitale Signatur und kein OEM-Zertifikat!**

Der Prüffall kann in einer Reparaturberatung geteilt oder in einer späteren Händlerlösung eingelesen werden. **Eine produktive B2B-Übernahme oder vertragliche Anerkennung existiert noch nicht.** Nur der Nutzer startet den Export. Das lokale Browserprofil speichert keine neue Cloud-Kopie.

## Tests

```sh
npm test --prefix integrations/consumer-repair-mission-poc
npm run offline:check --prefix integrations/consumer-repair-mission-poc
node --check integrations/consumer-repair-mission-poc/app.mjs
```

Zusätzlich prüft der isolierte read-only Workflow `consumer-proof-passport-qa.yml` mit echtem lokalem Chromium die Download-Funktion bei 320, 375, 390 und 430 px. Ergebnisse nur als erfolgreich markieren, wenn GitHub Actions tatsächlich grün ist.

## Fünf messbare Entwicklungsgates

1. **Echtheit:** 0 aus Katalognamen abgeleitete reale positive Passungen. Ziel für zukünftige echte Fälle: jeder grüne Einbaustatus hat eine konkrete Quelle, exakt gebundene Revision/Anschluss und dokumentierte Negativtests.
2. **Nutzbarkeit:** Versuch mit mindestens 20 unterschiedlichen realen Reparaturfällen. Messgröße: Anteil, bei dem der Nutzer die benötigte nächste Prüfangabe ohne Rückfrage findet.
3. **Retoure vermeiden:** Erst bei Partnerdaten messen: Verhältnis falscher bzw. unpassender Bestellungen vor/nach Verwendung; Zielwert vor Pilotbeginn vereinbaren, nicht erfinden.
4. **B2C ↔ B2B:** Dieselbe versionierte Datenquelle, gemeinsamer Fitment-Vertrag und ein importierbares Arbeitsprotokoll; keine separate Entscheidungsengine. Vor Live-Nutzung serverseitige Tenant-/Rechteprüfung ergänzen.
5. **Datennetz:** Jeder gemeldete Fehlfit löst einen überprüften Evidenzfall aus (Modell, Revision, Teil, Quelle, Grund, Behebungsdatum). Keine automatische Aufwertung von nutzergenerierten Hinweisen zu offiziellen Passungen.

## Noch fehlend

Keine produktive Echtpassung, keine realen Preise, Lieferdaten, Reparaturkits, tatsächliche iPhone-/Safari-Hardwareprüfung oder externe Kundentests. Mobile Vorschau verwendet weiterhin **11 Geräte/11 Teilidentitäten** aus dem alten Consumer-Snapshot; Wave3-Migration wird separat in #69 geprüft. Releaseblocker für Recht, Foto-/Katalogrechte, Händlerdaten, echte Identitäts- und Anschlussprüfung bleiben bestehen.

Branch bleibt isoliert; nicht nach `main` mergen oder veröffentlichen.
