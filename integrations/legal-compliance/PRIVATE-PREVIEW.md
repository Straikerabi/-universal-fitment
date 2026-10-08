# Universal Fitment: private Testvorschau (PC & Handy)

Die aktuelle GitHub-Pages-Vorschau ist **öffentlich** und sollte vor der kommerziellen Nutzung rechtlich geklärt werden. Diese eigenständige Alternative ermöglicht echten Browser-Test ohne öffentliche Preview-URL. Sie nutzt einen persönlichen **GitHub Codespace** (GitHub-Anmeldung notwendig). Private Forward-Ports sind per GitHub-Standard nur nach Login für den Besitzer erreichbar. Achtung: Der GitHub-Account kann Codespaces-Kontingente und Kostenlimits haben.

## Start in ca. 5 Klicks

1. [Repository auf dem geprüften Vorschau-Branch öffnen](https://github.com/Straikerabi/-universal-fitment/tree/audit/legal-hardening-v1290) (nicht auf `main` arbeiten).
2. Auf **Code** → **Codespaces** → **Create codespace on audit/legal-hardening-v1290** klicken. Ggf. im Branch-Dropdown den Vorschau-Branch ausdrücklich wählen. Der Codespace benötigt initial Zeit für Restore/Build/Tests.
3. Wenn der Build abgeschlossen ist, unten **PORTS** öffnen. **Port 4173** wird angeboten. Im Kontextmenü **Port Visibility → Private** überprüfen, niemals Public auswählen.
4. **Open in Browser** / Globus-Symbol bei Port 4173 anklicken – die tatsächlich gebaute, vollständige App öffnet sich unter `https://...-4173.app.github.dev`.
5. Für iPhone/Android denselben Link öffnen, mit **deinem GitHub-Konto anmelden**. Bei Ablauf der Private-Port-Authentifizierung erneut anmelden. Tests von Suche, Filtern, Warenkorb, Verbindungen und mobiler Darstellung sind möglich.

### Änderungen / Testfehler
- Ein Codespace auf diesem Branch testet den Stand des Branches (derzeit v1.29.0 inkl. rechtlicher Vorschau). Neue Worker-Änderungen werden erst sichtbar, nachdem sie **bewusst** in den gewählten Quellstand übernommen wurden – nicht automatisch aus fremden Branches.
- Um die Vorschau aus dem Codespaces-Terminal erneut zu bauen:
  ```bash
  bash integrations/legal-compliance/private-preview-build.sh
  ```
  Dann Browser neu laden. Bei PWA-Caches gegebenenfalls DevTools → Application → Service Workers → Unregister und Site Data löschen. Keine Live-Veröffentlichung nötig.
- **Keine** Anmeldepasswörter eingeben: Die Pilot-Supabase-Anmeldung ist auf `.app.github.dev` im Vorschau-Build gesperrt. Die private Vorschau ist ein Funktionstest, kein produktives Kundenportal. Tests von echtem Login erfordern später einen gesondert geprüften Staging-Host.
- Bei Bugs: genaue Gerätekennung, Klickpfad, Fehlermeldung und Screenshot ohne persönliche Daten notieren. Im Browser F12 → Console / Network für reproduzierbare Fehler nutzen.

### Wichtig: Altseite separat abschalten
**Dieses Setup stellt die bestehende GitHub-Pages-Website NICHT automatisch offline.** Wenn die private Vorschau funktioniert, GitHub-Repo → **Settings → Pages → ... → Unpublish site** wählen. Das Repository bleibt bestehen. **Achtung:** Der bestehende `.github/workflows/pages.yml` deployed bei `main`-Pushs erneut; deshalb Deployment-Workflow vor weiteren `main`-Pushs deaktivieren oder in einem gesonderten kontrollierten PR entfernen/mit Freigabe sichern. Keine unkontrollierten Merges auf `main`.

### Sicherheitscheck
- Codespaces → PORTS → 4173 → **Private**, nicht Public.
- Keine echten Betreiber-/Kundendaten oder Service-Rolle in GitHub, Build-Ausgabe, Browser oder Konsole.
- Falls du den Link anderen ohne GitHub-Zugang schicken möchtest, NICHT den Port öffentlich umstellen. Stattdessen später rollenbasierte Staging-Authentifizierung mit geeigneter Domain/Hoster.
- Codespace nach Benutzung unter GitHub → Codespaces **Stop**; sonst können Nutzungskosten weiterlaufen.
- Die Vorschau ersetzt kein Impressum/keine DSGVO-Prüfung für eine öffentliche, gewerblich betriebene Website.

### Originalquellen
- https://docs.github.com/en/codespaces/reference/security-in-github-codespaces
- https://docs.github.com/en/codespaces/developing-in-a-codespace/forwarding-ports-in-your-codespace
- https://docs.github.com/en/pages/getting-started-with-github-pages/unpublishing-a-github-pages-site
