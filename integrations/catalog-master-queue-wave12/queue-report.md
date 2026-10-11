# Wave12 Kategorien-Masterliste und Forschungsqueue

Registry v0.4.0: 13 Gruppen, 200 vollständige Leaf-Kategorien, 199 geplant; private Pilotkategorie(n): vacuum-cleaner.
Operative Work-Statuswerte: {"ready":200,"in_progress":0,"completed":0,"blocked":0}. Belegreferenzen: 0 (unbestätigt). Regulierter Owner-Scope: 18.

## Nächste Research-Chargen

| Reihenfolge | Kategorie-ID | Batch-ID | Priorität |
|---:|---|---|---:|
| 1 | vacuum-cleaner | vacuum-cleaner::research-0001 | 10 |
| 2 | washing-machine | washing-machine::research-0001 | 20 |
| 3 | car | car::research-0001 | 30 |
| 4 | dishwasher | dishwasher::research-0001 | 40 |
| 5 | tumble-dryer | tumble-dryer::research-0001 | 50 |
| 6 | coffee-machine | coffee-machine::research-0001 | 60 |
| 7 | cordless-drill | cordless-drill::research-0001 | 70 |
| 8 | electric-saw | electric-saw::research-0001 | 71 |
| 9 | angle-grinder | angle-grinder::research-0001 | 72 |
| 10 | rotary-hammer | rotary-hammer::research-0001 | 73 |
| 11 | sander | sander::research-0001 | 74 |
| 12 | pressure-washer | pressure-washer::research-0001 | 75 |

## Grenzen

Die Arbeits-Queue ist append-only. Complete benötigt internen Work-Receipt, aber niemals daraus eine Geräte-/Passungsfreigabe.
Nach complete keine automatische Wiederholung. Neue Batch nur nach explizitem next-batch-Event mit Research-Auftragsreferenz.
Eigener Belegindex getrennt von Arbeitsstatus, keine automatische Anhebung von Raw-Audit, Lizenz, Fitment oder Publikation.
KFZ/PKW benötigt spezialisierte HSN/TSN/FIN/KBA-Quellen und Fachprüfung. Regulierte Kategorien nur mit Owner-Scope.
Keine frei erfundenen Taxonomie-IDs und keine Änderungen an Registry, Consumer, Offline oder Source-Lock.

## CLI
node integrations/catalog-master-queue-wave12/cli.mjs --check
node integrations/catalog-master-queue-wave12/cli.mjs --next 12
node integrations/catalog-master-queue-wave12/cli.mjs --append-event EVENT.json
node --test integrations/catalog-master-queue-wave12/master.test.mjs
