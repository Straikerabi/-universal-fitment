# Händlergespräche — Wave-4-Plan, kein behauptetes Ergebnis

Status 09.10.2026: **0 Gespräche**, keine Kontakte ausgewählt/angeschrieben, keine Zusagen oder Verträge. 5–8 Gespräche vorbereiten; Durchführung nur nach separater Zustimmung und Datenerhebungs-/Teilnehmerfreigabe. Keine personenbezogenen Antworten im öffentlichen Repo speichern.

Issue #64 konkretisiert die Vorlage aus #50. Nur synthetische Testfälle in der lokalen Demo; keine automatisierte Rekrutierung, echten Datenimporte oder Verträge. Produktive Grenzen: [PILOT-READINESS.md](PILOT-READINESS.md).

## Explorative Stichprobe

| Geplante anonyme Slots | Profil | Warum |
| --- | --- | --- |
| D01–D02 | spezialisierte Staubsauger-Teilehändler | Variantenanfragen, SKU-/OEM-Mapping |
| D03–D04 | unabhängige Reparaturbetriebe | Identifikation am realen Gerät, fehlende Anschlussdaten |
| D05 | regionaler Werkstatt-/Teilebetrieb | kleiner Integrations- und Supportetat |
| D06 (optional) | Händler mit eigener Shopentwicklung | API/Embed-Aufwand und Sicherheitsanforderungen |
| D07–D08 (optional) | andere Größen/Prozesse im selben Segment | Gegenbeispiele und negative Nachfrage |

Keine Namen, Unternehmenslisten, künstlichen Zitate oder „Pilotkunden“. Auswahl-/Recruitingplan durch Owner freigeben. Fachprofile statt persönlicher Kontaktdaten speichern; Zustimmung zur Teilnahme und getrennt zur Aufzeichnung einholen, ohne Aufzeichnung ebenfalls teilnehmen lassen. Fragen nicht als Verkaufsgespräch oder OEM-/Partnerkooperation darstellen.

## Ablauf — etwa 35 Minuten

1. **0–3 min:** Zweck erklären: unverbindliche Problemforschung, synthetischer Prototyp, keine Angebote. Teilnahme freiwillig, Fragen überspringbar, Abbruch möglich. Einverständnis und Umgang mit Notizen klären.
2. **3–13 min: bisheriger Prozess**, noch keine Demo: „Erzähl vom letzten schwierigen Teilefall.“ „Welche Gerätekennung war da?“ „Welche Quelle hat entschieden?“ „Wie viele Rückfragen?“ „Wie oft passiert das; aus welchem Zeitraum stammt die Zahl?“ „Welche falschen Bestellungen sind wirklich wegen einer Variante entstanden?“ Keine pauschale Retourenquote als Fitmentfehler zählen.
3. **13–20 min: Reibung und Grenzen:** „Welche Arbeit ist manuell?“ „Was ist unbekannt geblieben?“ „Was funktioniert heute gut?“ „Welche Daten darfst du teilen?“ „Was würde eine Lösung sofort disqualifizieren?“ Originalkunden-/Seriennummern, Rechnungen und Bilder nicht sammeln. Echte Problemsituation erst nach Zustimmung vor Ort anonymisiert paraphrasieren, nicht in den Demobestand importieren.
4. **20–28 min: synthetische Aufgaben:** Erst Revision-unbekannt-Fall; fragen „Dürftest du jetzt ein Teil auswählen? Was fehlt?“ Dann Ausschluss und exakter Testbeleg. Händler-SKU/OEM-Fall und Mandantenherkunft zeigen. Neutral beobachten, keine richtige Antwort vorsagen. Verständnis/Fehlinterpretationen notieren. Testantwort ist keine echte Teilempfehlung.
5. **28–33 min: Integration/Preis:** „Wer könnte ein Embed einbauen, wie viel Zeit/Budget ist realistisch?“ „Wer entscheidet?“ „Was müsste ein begrenzter bezahlter Pilot beweisen?“ Erst offen nach Budget/Alternativen fragen; Paket-/Kontingent-/Snapshotoptionen danach vergleichen. Hypothetisches Interesse ≠ Zahlungszusage oder Vertrag.
6. **33–35 min:** Zusammenfassen und Gegenprüfung: „Was habe ich falsch verstanden?“ Keine Zusage erfinden; nächste Schritte nur mit Zustimmung. Keine Nutzung als Werbereferenz ohne gesonderte Erlaubnis.

## Protokollvorlage — leer lassen, bis Gespräche stattgefunden haben

| Feld | Wert / Erhebungsgrenze |
| --- | --- |
| Slot, Profil, freiwillige Teilnahme | ausstehend; separate Zustimmung geschützt dokumentieren |
| Falltyp, Zeitraum, genutzte Quelle | ausstehend; nur anonymisierte Prozessangaben |
| Häufigkeit/Falschbestellungen | ausstehend; gemessen / erinnert / unbekannt kennzeichnen |
| Zeit bis korrekter Identifikation | ausstehend; Start/Ende/korrektes Referenzteil vorab festlegen |
| Supportaufwand | ausstehend; Rückfragen und aktive Minuten, getrennt von Wartezeit |
| Demo: Revision/Ausschluss/SKU richtig verstanden | ausstehend; Fehlinterpretation sichtbar protokollieren |
| Integrationsaufwand, Entscheidungsträgerrolle | ausstehend; keine Personenklardaten |
| Zahlungsbereitschaft / Bedingungen | ausstehend; Budget, hypothetisches Interesse, Pilotwunsch und echte Zusage unterscheiden |
| Gegenargumente / Datenrechte / offene Fragen | ausstehend |

## Pilot-KPI-Design, keine Ergebnisse

Später gleiche freigegebene Fälle in aktuellem Prozess und Prototyp vergleichen, Reihenfolge variieren. Richtige Identifikation unabhängig durch Fachreview und autorisierten Beleg prüfen; Unknown ist besser als eine falsche positive Bestätigung. Kleine Stichprobe nicht als repräsentative Marktvalidierung verkaufen.

- **Zeit:** Median und Spannweite aktiver Minuten bis fachlich korrekter, belegter Identifikation; Abbruch/unbekannt separat zählen.
- **Falschbestellungen:** tatsächlich variante-/passungsbedingte Fehler / vergleichbare Bestellungen; Nenner, Zeitraum und Attribution angeben. Keine Demo-Klicks als gesparte Retouren.
- **Support:** Rückfragen und aktive Minuten je Fall, plus Pflege-/Integrationsaufwand.
- **Integration:** reale Stunden, einmalige/monatliche Kosten und wartbare Abhängigkeiten; kleines Team muss Kosten tragen können.
- **Zahlungsbereitschaft:** konkrete freiwillige Pilotbereitschaft und Bedingungen; keine Umsatzbuchung für verbale Zustimmung.
- **Sicherheit:** bekannte falsch-positive Passungsbestätigungen, falsch freigegebene Daten und Verständlichkeitsfehler; Rechts-/Datenfreigaben als harte Gates.

## Bedarfsauswertung nach Gesprächen

Noch nicht durchgeführt. Für jeden Slot Evidenzstärke und Gegenbeispiele angeben, gemeinsame Probleme clustern, keine erfundenen Mittelwerte. Ergebnisvorlage: `Problem / betroffene Profile / Anzahl bestätigender Gespräche / gegenläufige Befunde / Messqualität / Kostenhypothese / Rechtebedarf / nächste Entscheidung`.

**Heutige Entscheidung: kein Go für einen echten Pilot; Discovery ausstehend.** Engineering-Demo fertig bedeutet keine Marktvalidierung. Vorab vereinbarte explorative Richtwerte (keine statistischen Beweise): mindestens drei voneinander unabhängige Gespräche mit demselben konkreten Problem, glaubwürdig messbarer Aufwand, verständliche Unknown-/Negativanzeige, bezahlbare Integration und mindestens ein konkretes Interesse an einem begrenzten Test. Falls Probleme fehlen, Datenrechte nicht beschaffbar sind, Fitment falsch bestätigt wird oder Kosten/Nutzen nicht tragfähig sind: No-Go/Pivot, nicht mehr Geräte erfinden. Pilot-Go erst nach Owner-Entscheidung, Gewerbe-/Rechts-/Datenfreigabe, Teilnehmerzustimmung und gemeinsamem #48-Vertrag; kein Vertrag wird hier erstellt oder abgeschlossen.

## Messplan und Nutzenhypothesen — noch ohne Messwerte

Vor späteren realen Pilotfällen unabhängige Fachperson und autorisierte Quelle legen die korrekte Antwort fest. UI-Klick oder grüne Testantwort ist kein Nachweis einer korrekten Identifikation. Für jeden freigegebenen Fall beide Wege in wechselnder Reihenfolge testen: aktueller Händlerprozess und Demo-/Pilotprozess; Wiedererkennung/Training als Störfaktor festhalten. Synthetische Demo testet Verständnis, nicht real gesparte Bestellungen.

| Nutzenfrage | Messdefinition | Mindestprotokoll / Fehlinterpretation |
| --- | --- | --- |
| Identifikation schneller? | aktive Minuten von vollständiger Fallaufgabe bis fachlich korrekter Antwort; Median und Spannweite beider Wege | Wartezeit/Abbruch/Unknown extra; schneller falscher Treffer ist kein Erfolg |
| Weniger Support? | Rückfragen + aktive Supportminuten je vergleichbarem Fall | Telefonwartezeit und Review-/Datenpflegezeit nicht verstecken |
| Weniger Fehlbestellungen? | belegte variant-/anschlussbedingte Fehlbestellungen geteilt durch vergleichbare Bestellungen im gleichen Zeitraum | Nur rechtmäßig bereitgestellte aggregierte Daten, keine Kundennamen/Bestell-IDs |
| Weniger Retouren? | fachlich passungsbedingte Retouren getrennt von Defekt, Widerruf und Nichtgefallen | Zu kurzer Beobachtungszeitraum zeigt keine echte Retourenverbesserung |
| Anschlussprüfung nützlich? | Zahl erkannter Konflikte/Unknowns und fachlich bestätigter Entscheidungen | Unbekannt nicht als negatives Fitment interpretieren |
| Wartung bezahlbar? | Integrations-, Pflege-, Review- und Supportstunden plus legitime Betriebskosten | Einmalige Einrichtung und laufende Kosten getrennt |

Berechnung später: `Delta_Minuten = Baseline_Minuten - Pilot_Minuten`; als Paardifferenz pro korrektem Fall, nicht mit unterschiedlichen Fällen oder Null für fehlende Daten. `Nettonutzen = bestätigte Zeitwirkung + separat belegte vermiedene Fehlerkosten - Integrations/Pflege/Betriebskosten`; keine Doppelzählung von Retouren und Fehlbestellungen. Fehlende Messwerte bleiben **unbekannt**, nicht Null. Keine künstlichen ROI-Prozente oder KI-Ersparnisse. Berichtsvorlage: Zeitraum, Fallanzahl, erlaubte Datenbasis, korrekte/unklare/falsche Fälle, Störfaktoren, Delta, Unsicherheit, Gegenbefunde, Entscheidung — alle Ergebnisfelder derzeit leer.

## Kosten- und Preisexperimente — keine echten Preise

| Hypothetischer Tier | Testinhalt / Kostenbegrenzung | Experiment und Stoppsignal |
| --- | --- | --- |
| Embed-Basis | ein begrenzter Scope, technische Antworten; fixe Einrichtung + begrenztes monatliches Kontingent | kleine Händler offen nach tragbarem Integrations-/Monatsbudget fragen, danach Paketform vergleichen; Stop wenn Wartung/Nutzen nicht tragfähig |
| Team-Review | mehrere Rollen, eigene erlaubte Quellen, Audit und Variantenklärungen | nach wirklichem Mehrwert gegenüber Basis fragen, nicht Anzahl Rollen als Wert erfinden; Stop ohne belastbaren Rechte-/Reviewprozess |
| Private API | gemeinsamer Vertrag, strikt begrenzte Calls/Parallelität und Kostenobergrenze | Integrationsverantwortliche nach Aufwand, Messbedarf und Budgetvorhersehbarkeit fragen; Stop bei fehlender Engineering-/Securityfreigabe |

Keine Eurobeträge, konkreten Kontingente, Marktpreise, zahlenden Kunden oder Umsatzbehauptungen in diesen Tiers. Die acht Laborzugriffe pro Minute sind ein **Testwert**, kein Preis-/Serviceangebot. Reihenfolge der Tierbeschreibungen rotieren, offene Zahlungs-/Budgetfrage zuerst, keine Ankerzahl vorsagen. Hypothetische Zustimmung, unverbindliches Testinteresse und echte bezahlte Zusage getrennt dokumentieren; hier keine Zusage vorhanden.

Leeres Kostenblatt: monatliche Infrastruktur / lizenzierte Daten / Pflege und Fachreview / Support / rechtliche und steuerliche Einrichtung / Integrationsstunden / Volumen und Spitzenlast / Sicherheitsbetrieb / Reserve. Kosten aus autorisierten Messungen übernehmen, Unsicherheitsband und Sensitivität bei doppeltem Volumen/Support ausweisen. Preisform erst wählen, wenn reale Vollkosten und geäußerte Zahlungsbereitschaft zusammenpassen. Keine wiederkehrenden kostenpflichtigen Services für dieses Experiment anschaffen. B2C bleibt kostenlos; kommerzielle Tiers ändern keine Passungsentscheidung.
