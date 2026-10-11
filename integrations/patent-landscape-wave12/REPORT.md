# Vorläufige Patentlandschaft / FTO-Triage – 11.10.2026

**Keine Patentfreiheit / keine Launch-Freigabe.** Die fünf Publikationen sind eine priorisierte Stichprobe. Statusangaben sind Anzeigen von Google Patents, keine amtlich verifizierten Rechtsstände. Schutz in Deutschland muss anhand nationaler EP-Validierungen, Gebühren, Einsprüchen, Einschränkungen und DPMAregister/EPO Register geprüft werden. Unveröffentlichte Anmeldungen sind nicht suchbar.

| Schrift / Land | Unabhängiger Anspruch – Kernelemente | Vergleich zur vorhandenen Technik | vorläufiger Prüfbedarf |
|---|---|---|---|
| [EP4446907A1](https://patents.google.com/patent/EP4446907A1/en) EP, pending angezeigt | Anspruch 1: Bild eines Teils, Erkennungsmodell, räumlich abgegrenzte Region, Teileinformation | Typenschildhilfe ist **manuell**, `camera:none`, `ocr:none`, kein Bilderkennungsmodell | Vor jeder OCR/Computer-Vision-Roadmap prüfen; Anspruch kann sich im Prüfungsverfahren ändern |
| [EP2042379B1](https://patents.google.com/patent/EP2042379B1/en) EP, active angezeigt | Fahrzeugsteuergerät, Lesegerät, mehrere Subsysteme, nicht zerstörungsfrei entfernbare Kennzeichnung | Keine Fahrzeugsteuergeräte-Integration, keine physischen Teile-Tags | EP/DE-Schutz und Anspruchsfassung amtlich verifizieren |
| [US11017351B2](https://patents.google.com/patent/US11017351B2/en) US, active angezeigt | VIN + OBD-Fehlercode + Betriebszustand + adaptive gewichtete Aftermarket-Empfehlung | Keine OBD-Diagnose oder lernende Empfehlungsgewichte | Bei US-Markteintritt, B2B-Diagnose/Bestellung und adaptive Rules neu prüfen |
| [US20150112842A1](https://patents.google.com/patent/US20150112842A1/en) US, abandoned angezeigt | VIN/Teile-Interchange über interpretierte Deskriptoren und Logikbaum | Keine VIN-zu-Teilen-Logik implementiert | Fortsetzungen/Familie prüfen; Anmeldung ist nicht automatisch geltendes Recht |
| [CN102930000A](https://patents.google.com/patent/CN102930000A/en) CN, pending angezeigt | VIN-Zerlegung + Fahrzeug-Matching + unscharfe Teiletextsuche | Keine produktive VIN-Zerlegung; derzeit nur Saugerkatalog | CNIPA-Rechtsstand und Familienmitglieder prüfen |

## Code-zu-Anspruch-Abgrenzung

Read-only geprüft: `integrations/consumer-repair-mission-poc/app.mjs` importiert `catalog-snapshot.mjs`, `mission-state.mjs`, `parts-view.mjs` und UI-Helfer; `integrations/consumer-typeplate-assist-wave9/typeplate.mjs` definiert `transport:none`, `persistence:none`, `camera:none`, `ocr:none`, `realFitmentsConfirmed:0` und rein textuelle Suche. Diese Befunde betreffen **nur die gelesenen Dateien/den Owner-Branch**, nicht sämtliche zukünftigen Branches oder externe APIs. B2B-Commerce und HSN/TSN/VIN-Fitment sind Planungen, nicht nachgewiesene produktive Implementierung. Exakte Claim-Elemente können auch bei anderer technischer Realisierung relevant werden.

## Getrennte Risikodimensionen

**A FTO:** kein abschließendes Verletzungsurteil; derzeit fehlen mehrere charakteristische Anspruchsmerkmale in der geprüften Implementierung, aber EP-Länderstand, weitere Patentfamilien und künftige Features sind ungeklärt. Vor Launch und insbesondere Bild/OCR, VIN/OBD oder B2B-Procurement: professionelle Claim-Charts für DE/EP und geplante Zielländer.

**B Eigene Erfindungen:** Die Kombination aus Modell-Discriminator, Unsicherheits-/Quellengates und nachvollziehbarer Variantenprüfung könnte auf technische Wirkung untersucht werden; reine Geschäftslogik/Datenanzeige reicht nicht als Patentfähigkeitsbeleg. Vor öffentlicher Offenbarung mit Patentanwalt prüfen; kein Neuheitsurteil.

**C Separat:** Urheberrecht, Open-Source-Lizenzen, Marken/Designs, Datenbankherstellerrechte, OEM-API-Nutzungsbedingungen und DSGVO sind keine Patente. Marken-Issue #108 wartet auf Marketing #107.

## Recherchegrenzen / Folgeaufgaben

Amtliche Register und Rechtsstand **nicht** unabhängig live geprüft; keine vollständigen Familien-/Länder-/Anspruchsänderungen, keine Amtsakten, keine Anspruchsauslegung nach deutschem Recht, keine HSN/TSN-spezifische Volltextsuche, keine vollständige B2B-API-Patentlandschaft. Suchabdeckung daher begrenzt. Vor jeder verbindlichen FTO: EPO Register, DPMAregister, Espacenet, WIPO Patentscope, USPTO und relevante nationale Register nachrecherchieren; Rechtsstand und Claim-Fassung mit Datum dokumentieren, Patentanwalt beauftragen.
