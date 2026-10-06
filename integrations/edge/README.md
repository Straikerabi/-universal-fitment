# Marketplace-Server: erster bereitgestellter Schritt in Phase 4

Stand: 2026-10-06. Die öffentliche App bleibt v1.13 mit Suchlinks und einer Pilotanmeldung. Supabase-Projekt `universal-fitment`, Region Frankfurt; keine Tarifänderung vorgenommen.

Ein separater [Entwurf für befristete Pilotfreigaben](../pilot-access.md) bereitet Server Version 3 vor. Er ist noch nicht installiert; die automatische Datenbankfreigabe wurde blockiert. Die folgenden Angaben beschreiben Version 2 im laufenden Projekt.

## Bereitgestellt

Edge Function `marketplace-search`, Version 2. Der öffentliche Bereitschaftstest ist erreichbar:

https://riorfdgoovydfyzjwdvf.supabase.co/functions/v1/marketplace-search/health

Er meldet `status: ready`, `partCount: 167`, `liveOffersEnabled: false` und `quotaBackendVerifiedAtStartup: true`. Das bestätigt Server, Katalogindex und die echte Verbindung zur Kontingent-Funktion, keine Händleranbindung.

## Suchvertrag

`POST https://riorfdgoovydfyzjwdvf.supabase.co/functions/v1/marketplace-search`

```json
{
  "provider": "ebay",
  "partKey": "<partSearchIdentity(part).partKey aus dem Katalog>",
  "condition": "used"
}
```

Provider: `ebay` oder `amazon`. Zustand: `used`, `new` oder `all`. Der Server akzeptiert ausschließlich seine aus dem Katalog erzeugten Teile-Identitäten. Freie Suchtexte, URLs, zusätzliche Felder und Gerät-Materialnummern sind kein Ersatz für diesen Schlüssel. Die Zahl von 167 und eindeutige Identitäten werden beim Paketbau getestet.

Ein gültiger Supabase-Benutzer-Token gehört in `Authorization: Bearer <user JWT>`. Die Funktion prüft ihn beim Auth-Server des eigenen Projekts (`GET /auth/v1/user`); weder dekodierte Claims noch `user_metadata` erteilen Zugriff. Anonyme Nutzer, API-Schlüssel und Service-Rollen erhalten keinen Nutzerzugang. Zusätzlich muss die bestätigte Benutzer-ID in `MARKETPLACE_USER_IDS` stehen. Die momentan leere Liste verweigert allen Nutzern Suchzugriff.

`verify_jwt` ist für diese Funktion **false**, weil der harmlose GET-Bereitschaftstest und CORS-Preflight öffentlich sind. Das ist keine anonyme Suchfreigabe: Jeder Such-POST durchläuft die eigene serverseitige Auth-Prüfung und die Pilotliste. Änderungen an Supabase Auth oder dem Projekt-Schlüsselsystem wurden nicht vorgenommen. Neue Publishable-Keys werden bevorzugt; der automatisch bereitgestellte Legacy-Anon-Key bleibt nur ein serverseitiger Kompatibilitäts-Fallback.

## Antworten und Grenzen

| HTTP | Status | Bedeutung |
| --- | --- | --- |
| 200 | `ready` | GET auf `/health`; keine Angebote |
| 200 | `access_required` | Gültige Pilot-Anfrage, Anbieterzugang/Live-Nutzung bleibt gesperrt |
| 401 | `auth_required` | Kein bestätigter, regulärer Supabase-Nutzer |
| 403 | `pilot_access_required` / `origin_denied` | Kein Pilotzugang oder fremder Browser-Ursprung |
| 400 / 413 / 415 / 408 | `invalid_request` / `json_required` | Ungültige Daten, über 4096 Byte, falsches Format oder Zeitlimit |
| 429 | `quota_exceeded` | Kontingent erschöpft; `Retry-After` nennt Sekunden bis zum nächsten Fenster |
| 503 | `auth_unavailable` / `quota_unavailable` | Auth- oder Kontingent-Prüfung nicht verfügbar; keine Händlerabfrage |
| 502 / 504 | `unavailable` / `timeout` | Anbieterfehler oder Zehn-Sekunden-Frist erreicht |

Browser-CORS ist auf `https://straikerabi.github.io` begrenzt. Antworten sind `no-store`. Das Lesen des Anfragekörpers und Auth-Aufrufe haben jeweils ein Fünf-Sekunden-Limit. Fehler geben keine internen Details, Tokens oder Kontaktdaten aus.

`MARKETPLACE_LIVE_ENABLED` bleibt false; es wurden keine Provider-Secrets eingerichtet. Erst ein bestätigter Pilotnutzer, ein ausdrücklich aktivierter Anbieter und eine erfolgreiche Datenbank-Reservierung erlauben eine Händlerabfrage. Dann läuft das Ergebnis durch den bestehenden Angebotsvalidator. Vor Live-Freigabe fehlen weiterhin geprüfte Händlerberechtigungen, ein echter positiver Nutzer-Test. Die angemeldete Client-Anbindung ist in v1.13 implementiert und mit synthetischen Auth-/API-Verträgen getestet; siehe [Pilotanmeldung](../auth-sdk/README.md).

## Dauerhafte Kontingente

Die Zähler liegen in `fitment_private.marketplace_quota`: fünf Angebotssuchen je Nutzer und Minute über beide Anbieter, zwanzig insgesamt je Minute und hundert je Anbieter und UTC-Tag. Das sind unsere Pilotgrenzen, keine Aussage über Vertragslimits von eBay oder Amazon. Eine Reservierung zählt einen Suchversuch; zusätzliche OAuth-Aufrufe zählen nicht als weitere Suchreservierungen. Fehler geben reservierte Plätze nicht zurück.

`marketplace_reserve_quota` prüft und erhöht die drei Zähler unter einer Transaktionssperre. Abgewiesene Anfragen belasten keine anderen Fenster. Die Zeit stammt aus der Datenbank. Ein Datenbankfehler verhindert die Händlerabfrage. Beim Start prüft der Server die RPC-Berechtigung mit ungültigen Argumenten, ohne Kontingent zu verbrauchen oder Nutzer anzulegen.

Nur die Serverrolle darf die Funktion ausführen und die private Tabelle bearbeiten. RLS und ausdrückliche Ablehnungspolicies schützen die Tabelle zusätzlich. Gespeichert werden Zählerscope, Zeitfenster und Anzahl. Fenster älter als zwei Tage werden bei der nächsten Reservierung bereinigt; bei ausbleibenden Reservierungen kann die letzte Historie länger bestehen bleiben.

Das Ersteinrichtungs-SQL steht in `integrations/quota-schema.sql`. Es wurde über Supabase ausgeführt und mit zurückgerollten Testdaten geprüft; es ist kein CLI-Migrationsstand. Der Sicherheitsberater meldet keine Befunde. Ein echter angemeldeter Pilotnutzer und produktive Händlerangebote sind weiterhin nicht geprüft.

## Paket und Prüfungen

`node integrations/build-edge.mjs <Ausgabeordner>` erzeugt das Deployment-Paket aus den bestehenden Provider-Modulen, Adaptern und Katalogdaten. Die relativen Importe werden für das Paket angepasst; es gibt keinen zweiten manuell gepflegten Teilekatalog. `deploy.json` enthält Dateien für das Supabase-Deployment mit `entrypoint_path: index.ts`; diese generierten Dateien bleiben außerhalb der veröffentlichten Website.

```sh
node integrations/marketplace-providers.test.mjs
node integrations/marketplace-handler.test.mjs
node integrations/marketplace-quota.test.mjs
node integrations/build-edge.mjs
node integrations/edge-smoke.test.mjs
```

Die lokalen Auth- und Provider-Szenarien benutzen synthetische Antworten. Der Pakettest startet den unveränderten Einstiegspunkt mit einem lokalen Deno-Stub und prüft Importe, Katalog und Zugriffssperre. Am tatsächlich bereitgestellten Server werden GET-Bereitschaft, POST ohne Anmeldung, ungültiger Bearer, erlaubter Preflight und fremder Ursprung geprüft. Ein echter angemeldeter Pilotnutzer und produktive eBay-/Amazon-Angebote sind noch nicht geprüft.

## Aktuelle Primärquellen

- [Supabase: JWT-Verifikation beim Auth-Server](https://supabase.com/docs/guides/auth/jwts)
- [Supabase: Edge-Authorization und verify_jwt](https://supabase.com/docs/guides/functions/auth-headers)
- [Supabase: automatische Edge-Schlüssel und Migration](https://supabase.com/docs/guides/getting-started/migrating-to-new-api-keys)
