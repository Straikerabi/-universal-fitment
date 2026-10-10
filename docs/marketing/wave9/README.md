# Wave9 – private Marketing-/PR-Startpakete
**Status: DRAFT ONLY / RELEASE NO-GO.** Stand 10.10.2026, ausschließlich für Review der Projektleitung. Zuordnung: [Issue #99](https://github.com/Straikerabi/-universal-fitment/issues/99); Scope exklusiv **nur neue Dateien in `docs/marketing/wave9/**`**. Ausgangsbranch `work/marketing-playbook-wave9`, Owner-Basis bei Start `be7afa00ff2f69b9071d4d85da4c1f7c7e1a9b38`. Keinerlei Social-Media-Accounts, Beiträge, Anzeigen, Datenerhebung, Landingpage oder Pressekontakte angelegt.

## Was hier konkret liegt
| Datei | Inhalt | Schutzgrenze |
| --- | --- | --- |
| [B2C-STARTPAKET.md](B2C-STARTPAKET.md) | Acht konkrete Formate mit vollständiger Copy, Szenen und Produktionshinweisen: Instagram Reels/Karussell, TikTok, YouTube Tutorial/Short, Facebook, Reddit, SEO | echte Gerätespezifika und Medienrechte noch nicht freigegeben |
| [B2B-STARTPAKET.md](B2B-STARTPAKET.md) | Zwei LinkedIn-Formate, Datenqualitäts-Onepager und sechs Fragen für spätere freiwillige Discovery | **kein** B2B-Angebot, Partner, Outreach, SLA oder gemessener Geschäftsnutzen |
| [LANDING-PRESS.md](LANDING-PRESS.md) | Private Landing-Textbausteine, Presse-Faktenbogen, Presse-Q&A und nicht versandfähiger E-Mail-Entwurf | kein öffentlicher Start, Kontakt, Download oder Registrierungsformular |
| [COMMUNITY-PLAYBOOK.md](COMMUNITY-PLAYBOOK.md) | sieben Antwortfälle, fachliche Eskalation, Plattformregeln und Datenschutz-/Safety-Gates | keine aktive Community, keine gespeicherten DMs/Personendaten |
| [campaign-manifest.json](campaign-manifest.json) | 14 strukturierte Entwürfe, neun Kanäle, Datums-/Owner-Snapshot und harte Sperrflags | jedes Asset `draft_internal`, `published:false`, `mediaUsed:false` |
| [validate.mjs](validate.mjs), [validate.test.mjs](validate.test.mjs) | ausführbarer, read-only Manifest-Validator und 27 Negativtests + 1 Basisfall | ein grüner Copy-Test bedeutet **weder** Medien-/Rechts-GO **noch** tatsächliches QA-Produkt-GO |
| [TEST-REPORT.md](TEST-REPORT.md) | tatsächlich durchgeführte JavaScript-Checks, Review-Befunde und reproduzierbare Befehle | keine erfundenen GitHub-Workflow-/Node-CLI-Tests |

Die vollständige Wave8-Grundstrategie bleibt bei [../STRATEGY.md](../STRATEGY.md), [../CHANNELS-AND-CALENDAR.md](../CHANNELS-AND-CALENDAR.md) und [../COPY-GUARDRAILS.md](../COPY-GUARDRAILS.md). Diese Dateien bleiben **unverändert**.

## Faktenanker und erlaubte Aussage-Ebene
- Gemeinsamer privater Owner-Consumer (Stand beim Branch-Abzweig): **11 Staubsauger-Varianten, 5 Marken, 11 OEM-Teilidentitäten, 0 reale positiv bestätigte Passungen**.
- Getrenntes OEM-Draft #84: **29** Geräte, **nicht als Consumer integriert/angeboten**. Strengere Quellenprüfungen aus späterem Work A nicht still als Marketing-Claim übernehmen.
- **200 Kategorien sind nicht verfügbar:** 199 als planned markiert, eine private Staubsauger-Pilotdomäne.
- Keine echten öffentlichen Consumer-Nutzerzahlen, Partnerschaften, unabhängigen Marktwirkungsnachweise, Verkäufe, rechtlichen Bildfreigaben oder verbindlichen Launchtermine.
- Eine künftig kostenlose **B2C**-App ist die Vision. **B2B** nur Forschungs-/Geschäftshypothese mit eigenem Sicherheits-, Vertrags- und Datenrechtspfad.
- Kein öffentliches Marketing, bevor Owner + QA/Recht Produkt, Operator, Tracking/Datenschutz, Assetrechte, Sicherheitsinformationen und Aussagen einzeln freigeben.

## Arbeitsschritte bei einer späteren freigegebenen Produktionsrunde
1. Snapshot-Claims und Produktumfang gegen den **dann aktuellen** Owner-HEAD erneut abgleichen.
2. Pro Asset Thema und Zielgruppe prüfen; eigenes rechtsgeprüftes Bild-/Audiomaterial produzieren, Variantenbeispiele nur als fiktiv kennzeichnen oder konkret belegen.
3. Sichere Aussagen und Regulierungsrahmen durch Katalog-/QA-/Legal-/Owner-Reviewer mit Datum freigeben.
4. Barrierefreiheit: captions/Alt-Text, Kontrast und Lesbarkeit bei kleinen Geräten.
5. Plattformregeln und Betreiberpflichten prüfen; erst danach Veröffentlichung einzeln freigeben.
6. Post-Ergebnisse nur bei erlaubter Verarbeitung messen; keine Erfolge vorab simulieren.

## Reproduzierbare Offline-Prüfung
Aus Repo-Root mit Node.js:
```bash
node --test docs/marketing/wave9/validate.test.mjs
node --input-type=module -e "import {readFileSync} from 'node:fs';import {validateManifest} from './docs/marketing/wave9/validate.mjs';const m=JSON.parse(readFileSync('./docs/marketing/wave9/campaign-manifest.json','utf8'));const errors=validateManifest(m);console.log({assets:m.assets.length,errors});if(errors.length)process.exitCode=1;"
```
Keine externen Abhängigkeiten, kein Netz, keine Ausgaben und keine Schreibaktionen. Tests **verifizieren nur manifestierte Claim-/Sperrregeln**. Genauere Ausführung und Einschränkungen in [TEST-REPORT.md](TEST-REPORT.md).

## Projektleitungs-Entscheidung
- [ ] Inhaltliche Positionierung gegen Produktstand und Wettbewerb revalidieren
- [ ] Neue Asset-Medien-/Musik-/Bildrechte bestätigen
- [ ] Fachliche Sicherheit und Datenschutz-/Plattform-/Werbekennzeichnungs-/Markenfragen separat reviewen
- [ ] Vor öffentlicher Kommunikation genaue Freigabe für jeden Kanal, Post und CTA erteilen
- [ ] B2B erst nach separatem Problem- und Datenrechtepilot als Angebot formulieren

**Aktueller Beschluss dieser Abteilung: nichts veröffentlichen; kein Merge nach main, kein Deployment.**
