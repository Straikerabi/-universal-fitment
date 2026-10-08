# Infrastruktur-Migration vor kommerzieller Freigabe

**Kein Deployment durch diesen Entwurfs-PR.** GitHub bleibt Quellverwaltung; GitHub Pages ist kein zugesicherter Host für kommerzielles SaaS/Commerce. Der jetzige Pages-URL kann allenfalls als getrennte Entwicklungsumgebung behandelt werden (kein Live-Login, keine Affiliate-Produktion).

## Technischer Istzustand
- Statisches Frontend wird durch `integrations/restore-source-checkpoint.py --target site` aus v1.29.0 aufgebaut und mit `integrations/build-app.mjs` gebündelt.
- Bisheriger GitHub Actions Workflow `.github/workflows/pages.yml` deployed `site/` ausschließlich bei `main`-Push.
- Supabase Auth/Edge für die Pilot-Marketplace-Suche ist vorbereitet, Live-Provider sind deaktiviert. Backend-CORS ist derzeit auf `https://straikerabi.github.io` beschränkt (laut `integrations/edge/README.md`).
- App besitzt eine Offline-PWA und Marke-Pakete, die zur Laufzeit geladen werden. Basepaths und Service-Worker-Scope dürfen beim Domainwechsel nicht ungeprüft geändert werden.

## Migrationsanforderungen

1. **Hoster-Vertrag wählen:** vertragsgemäß kommerziell zulässig, korrekter AV-Vertrag und Subprozessor-Informationen, nachvollziehbare Access-Log-Fristen, TLS, Custom Domain, statische Assets, Content Security Policy / Security Header, ausreichende Speicher-/Traffic-Kapazität.
2. **Eigene Domain/Support-E-Mail** getrennt registrieren und für Impressum bestätigen. DNS/CAA/TLS/HTTPS-Weiterleitung, Mail-SPF/DKIM/DMARC prüfen.
3. **Auf neuem Host Preview/Staging bauen:** identische `site/`-Builds und SHA-kontrollierte Quellarchive; keine Tokens oder `service_role` im öffentlichen Build. Deployment erst mit erlaubtem Host, nicht durch diesen PR.
4. **Basepath/PWA testen:** Direktaufruf /, Anker-Routing, markenspezifische Lazy-Imports, Bildfehler, Offline-SW/Cache, Installationsmanifest, Backups und Browser-Storage nach Origin-Wechsel.
5. **Externe Verbindungen:** Supabase API-/Edge-CORS-Origin-Allowlist auf **verifizierte** neue HTTPS-Domain eingrenzen; Auth-Redirect-URLs, SMTP, Spam-Schutz, Rate Limits und Accountlöschprozess überprüfen. Kein pauschales CORS `*` für authentifizierte Requests. Nur ausdrücklich erlaubte Produktionsschlüssel serverseitig konfigurieren.
6. **Rechtstexte und Fußzeile:** Echtes Impressum und echte Datenschutzerklärung von jeder Route mit max. wenigen Klicks erreichbar, auch mobil und im Service Worker. Bei Hosting-, Tracking-, Login- oder Affiliate-Änderungen Datenschutzerklärung aktualisieren.
7. **Berechtigungen:** Projektverwaltung und Deployment-Workflow auf genehmigte Reviewer, Branch-Protection/Ruleset und Environment-Schutz mit manueller Approval-Policy umstellen. Zurzeit war `main` als ungeschützt dokumentiert.
8. **Browser-QA** mit Network-Panel und Playwright: Geräte-/Such-/Filter-Routen, Kamera-Rechte nur nach Interaktion, Login/Logout/Passwort-Reset, externe Foto- und Angebotslinks, keine unbestätigten Cookie- oder Analytics-Aufrufe, Lade-/Offlinefehler.
9. **Produktivfreigabe** erst nach eigenständiger Risiko-/Datenschutz-/Bildrechteabnahme und erfolgreichem Release-Gate; Affiliate- und Live-Provider-Flags bleiben bis zur Freigabe `false`.

Diese Datei ist eine ausführbare technische Migrationscheckliste, **kein Auftrag zum Kauf**, keine behauptete AV-Zusage und keine Migration ohne Domain/Hoster.
