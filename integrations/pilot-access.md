# Pilotfreigabe – geprüfter Entwurf, noch nicht installiert

Stand 2026-10-06. Die öffentliche App ist v1.13, der bereitgestellte Marketplace-Server bleibt Version 2. Der hier vorbereitete Server Version 3 und sein Datenbank-Schema sind **nicht bereitgestellt**. Die automatische Freigabeprüfung lehnte die Einrichtung der neuen Tabelle, RLS und Serverberechtigungen mangels ausdrücklich bestätigter Datenbankänderung ab. Eine anschließende reine Leseprüfung bestätigt, dass weder Tabelle noch RPC installiert sind.

## Konkrete Änderung zur Freigabe

`pilot-access-schema.sql` ergänzt im vorhandenen Projekt `universal-fitment`:

- Private Tabelle `fitment_private.marketplace_pilots`: Benutzer-ID, Freigabezeit, Ablaufzeit, Widerrufszeit. Eine Freigabe darf höchstens 90 Tage dauern. Die ID muss zu einem vorhandenen Auth-Nutzer gehören; dessen Löschung entfernt auch die Freigabe.
- RLS mit ausdrücklicher Sperre für Gäste und angemeldete App-Nutzer. Beide erhalten weder Tabellen- noch Funktionsrechte. Ein App-Nutzer kann sich keine Pilotfreigabe geben.
- Read-only RPC `public.marketplace_check_pilot(uuid)`, `SECURITY INVOKER`, leerer Suchpfad. Nur die bestehende Serverrolle erhält Ausführungsrecht und Leserecht auf die neue Tabelle. Änderungen an Freigaben bleiben dem Datenbankadministrator vorbehalten.
- Der Server ersetzt die bisherige Umgebungsvariable `MARKETPLACE_USER_IDS` durch die Datenbankprüfung. Fehlende, künftige, abgelaufene oder widerrufene Freigaben erlauben keine neue Suche. Ein Datenbankfehler sperrt die Händlerabfrage.

Es werden keine Konten, Zugangsdaten, Bestellungen oder Händlerfreigaben angelegt. Der Free-Tarif bleibt bestehen; es wird kein kostenpflichtiges Upgrade gebucht. Die neue Tabelle beginnt leer. Eine Zustimmung zur Schema-Installation aktiviert daher noch keinen Nutzer oder Anbieter.

## Geprüft / noch offen

Lokal bestanden: autorisiert/nicht autorisiert, fehlerhafte RPC-Antwort, Serverfehler, fehlender Schlüssel, Herkunftssperre, Anmeldung, alle 167 Katalogteile, Kontingent-Sperre, Zeitlimits und Boot des erzeugten Edge-Pakets. Die neuen Auth-/RPC-Antworten sind synthetisch. Die Prüfung beweist keine positive Freigabe im echten Projekt.

Nach ausdrücklicher Zustimmung: Schema installieren; Rollenrechte und echte RPC-Antwort prüfen; Sicherheitsberater prüfen; Version 3 bereitstellen; die öffentliche Bereitschaftsantwort und anonyme Sperre prüfen. Erst danach den Entwurf übernehmen.

## Erstes tatsächliches Pilotkonto

Die Benutzerverwaltung unter https://supabase.com/dashboard/project/riorfdgoovydfyzjwdvf/auth/users benötigt in dieser Browser-Sitzung eine Anmeldung. Der verbundene Supabase-Zugang stellt keine Auth-Nutzerverwaltung bereit. Ein neues Passwort muss der Nutzer selbst im sicheren Kontoformular festlegen; nicht in Chat oder Git.

Nach der Kontoerstellung: bestätigten Nutzer und UUID prüfen, eine zeitlich begrenzte Freigabe durch den Administrator eintragen, danach den echten Login in der App, geschützte Abfrage, Token-Erneuerung und Abmeldung prüfen. Geräte und Warenkorb bleiben lokal. eBay/Amazon und der Live-Schalter bleiben abhängig von ihren gesonderten Zugängen.

Ein Administrator kann nach der Installation für eine **vorher geprüfte** Nutzer-ID z. B. 30 Tage freigeben. Der folgende Entwurf darf erst mit einer echten ID ausgeführt werden:

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
