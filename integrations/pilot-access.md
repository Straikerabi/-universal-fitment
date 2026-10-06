# Pilotfreigabe – installiert und an den Server angeschlossen

Stand 2026-10-06. Nach ausdrücklicher Zustimmung wurden Tabelle, RLS und Serverberechtigungen im bestehenden Projekt installiert. Die öffentliche App bleibt v1.14; der Marketplace-Server verwendet Version 3. Die Tabelle beginnt leer: Es wurde kein Konto erstellt oder Nutzer freigeschaltet.

## Installierte Änderung

`pilot-access-schema.sql` ergänzt im vorhandenen Projekt `universal-fitment`:

- Private Tabelle `fitment_private.marketplace_pilots`: Benutzer-ID, Freigabezeit, Ablaufzeit, Widerrufszeit. Eine Freigabe darf höchstens 90 Tage dauern. Die ID muss zu einem vorhandenen Auth-Nutzer gehören; dessen Löschung entfernt auch die Freigabe.
- RLS mit ausdrücklicher Sperre für Gäste und angemeldete App-Nutzer. Beide erhalten weder Tabellen- noch Funktionsrechte. Ein App-Nutzer kann sich keine Pilotfreigabe geben.
- Read-only RPC `public.marketplace_check_pilot(uuid)`, `SECURITY INVOKER`, leerer Suchpfad. Nur die bestehende Serverrolle erhält Ausführungsrecht und Leserecht auf die neue Tabelle. Änderungen an Freigaben bleiben dem Datenbankadministrator vorbehalten.
- Der Server ersetzt die bisherige Umgebungsvariable `MARKETPLACE_USER_IDS` durch die Datenbankprüfung. Fehlende, künftige, abgelaufene oder widerrufene Freigaben erlauben keine neue Suche. Ein Datenbankfehler sperrt die Händlerabfrage.

Es werden keine Konten, Zugangsdaten, Bestellungen oder Händlerfreigaben angelegt. Der Free-Tarif bleibt bestehen; es wird kein kostenpflichtiges Upgrade gebucht. Die neue Tabelle beginnt leer. Eine Zustimmung zur Schema-Installation aktiviert daher noch keinen Nutzer oder Anbieter.

## Geprüft / noch offen

Lokal bestanden: autorisiert/nicht autorisiert, fehlerhafte RPC-Antwort, Serverfehler, fehlender Schlüssel, Herkunftssperre, Anmeldung, alle 167 Katalogteile, Kontingent-Sperre, Zeitlimits und Boot des erzeugten Edge-Pakets. Die neuen Auth-/RPC-Antworten sind synthetisch. Die Prüfung beweist keine positive Freigabe im echten Projekt.

Im echten Projekt geprüft: RLS aktiv; anon/authenticated ohne Schema-, Tabellen- und Ausführungsrecht; service_role mit Leserecht und Ausführungsrecht, ohne INSERT/UPDATE/DELETE/TRUNCATE auf der neuen Tabelle. SECURITY INVOKER und leerer Suchpfad sind bestätigt. Die Serverrolle erhält bei null/unbekannter UUID allowed:false; die Tabelle enthält 0 Freigaben. Der Sicherheitsberater meldet keine Befunde. Version 3 ist bereitgestellt; ein echter positiver Nutzer-Test bleibt offen.

## Erstes tatsächliches Pilotkonto

Der laufende Bereitschaftstest bestätigt `backendVersion:3`, `pilotBackendVerifiedAtStartup:true` und `quotaBackendVerifiedAtStartup:true`, bei `liveOffersEnabled:false` und 167 Katalogteilen. POST ohne Anmeldung und mit ungültigem Token liefern 401; erlaubter CORS-Preflight 204, fremder Ursprung 403. Dabei wurden keine Händlerangebote abgefragt.

Ein echtes Pilotkonto muss über die sichere Benutzerverwaltung von Supabase erstellt und bestätigt werden. Ein neues Passwort legt der Nutzer selbst im sicheren Kontoformular fest; nicht in Chat oder Git. Es wurde noch kein solches Konto angelegt.

Nach der Kontoerstellung: bestätigten Nutzer und UUID prüfen, eine zeitlich begrenzte Freigabe durch den Administrator eintragen, danach den echten Login in der App, geschützte Abfrage, Token-Erneuerung und Abmeldung prüfen. Geräte und Warenkorb bleiben lokal. eBay/Amazon und der Live-Schalter bleiben abhängig von ihren gesonderten Zugängen.

Ein Administrator kann nach der Installation für eine **vorher geprüfte** Nutzer-ID z. B. 30 Tage freigeben. Das folgende Muster darf nur für einen ausdrücklich freizugebenden Nutzer mit zuvor geprüfter echter ID ausgeführt werden:

```sql
insert into fitment_private.marketplace_pilots (user_id, granted_at, expires_at)
values ('<bestätigte Auth-UUID>'::uuid, now(), now() + interval '30 days')
on conflict (user_id) do update
set granted_at = excluded.granted_at, expires_at = excluded.expires_at, revoked_at = null;
```

Widerruf (ebenfalls nur mit echter, geprüfter ID):

```sql
update fitment_private.marketplace_pilots
set revoked_at = now()
where user_id = '<bestätigte Auth-UUID>'::uuid;
```

Bereits laufende Anfragen können zu Ende laufen; der Widerruf wird bei der nächsten serverseitigen Freigabeprüfung berücksichtigt. Ein Neustart oder eine Schlüsselrotation ist für die Änderung einer Freigabe nicht nötig.
