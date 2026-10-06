# Marketplace-Server: erster bereitgestellter Schritt in Phase 4

Stand: 2026-10-06. Die öffentliche App bleibt v1.12 im Suchlink-Modus. Supabase-Projekt `universal-fitment`, Region Frankfurt; keine Tarifänderung vorgenommen.

## Bereitgestellt

Edge Function `marketplace-search`, Version 1. Der öffentliche Bereitschaftstest ist erreichbar:

https://riorfdgoovydfyzjwdvf.supabase.co/functions/v1/marketplace-search/health

Er meldet `status: ready`, `partCount: 167` und `liveOffersEnabled: false`. Das bestätigt die Serverbereitstellung und den geladenen Katalogindex, keine Händleranbindung.

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
| 503 | `auth_unavailable` / `activation_required` | Auth-Prüfung nicht verfügbar oder Live-Schalter vorzeitig gesetzt |

Browser-CORS ist auf `https://straikerabi.github.io` begrenzt. Antworten sind `no-store`. Das Lesen des Anfragekörpers und Auth-Aufrufe haben jeweils ein Fünf-Sekunden-Limit. Fehler geben keine internen Details, Tokens oder Kontaktdaten aus.

Auch mit gesetztem `MARKETPLACE_LIVE_ENABLED=true` und vorhandenen Provider-Secrets ruft diese Version keine Anbieter-API auf. Vor Live-Freigabe sind noch erforderlich: geprüfte Händlerberechtigungen, ein echter positiver Nutzer-Test, dauerhafte globale Anfrage-/Quotengrenzen, Angebotsvalidierung über den bestehenden gemeinsamen Vertrag und angemeldete Client-Anbindung. Es existiert noch kein globaler Rate-Limiter. Preise, Versand und Passform werden nicht aus Suchergebnissen erfunden.

## Paket und Prüfungen

`node integrations/build-edge.mjs <Ausgabeordner>` erzeugt das Deployment-Paket aus den bestehenden Provider-Modulen, Adaptern und Katalogdaten. Die relativen Importe werden für das Paket angepasst; es gibt keinen zweiten manuell gepflegten Teilekatalog. `deploy.json` enthält Dateien für das Supabase-Deployment mit `entrypoint_path: index.ts`; diese generierten Dateien bleiben außerhalb der veröffentlichten Website.

```sh
node integrations/marketplace-providers.test.mjs
node integrations/marketplace-handler.test.mjs
node integrations/build-edge.mjs
node integrations/edge-smoke.test.mjs
```

Die lokalen Auth- und Provider-Szenarien benutzen synthetische Antworten. Der Pakettest startet den unveränderten Einstiegspunkt mit einem lokalen Deno-Stub und prüft Importe, Katalog und Zugriffssperre. Am tatsächlich bereitgestellten Server werden GET-Bereitschaft, POST ohne Anmeldung, ungültiger Bearer, erlaubter Preflight und fremder Ursprung geprüft. Ein echter angemeldeter Pilotnutzer und produktive eBay-/Amazon-Angebote sind noch nicht geprüft.

## Aktuelle Primärquellen

- [Supabase: JWT-Verifikation beim Auth-Server](https://supabase.com/docs/guides/auth/jwts)
- [Supabase: Edge-Authorization und verify_jwt](https://supabase.com/docs/guides/functions/auth-headers)
- [Supabase: automatische Edge-Schlüssel und Migration](https://supabase.com/docs/guides/getting-started/migrating-to-new-api-keys)
