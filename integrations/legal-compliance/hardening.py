"""Reproducible, non-publishing legal transparency layer for a prototype.

This is deliberately NOT a substitute for genuine operator/privacy notices.
No PII, credentials, affiliate IDs or third-party images are embedded.
"""
from __future__ import annotations
import argparse
import json
import re
from collections import Counter
from pathlib import Path

MARK_START = '<!-- UF LEGAL PREVIEW START -->'
MARK_END = '<!-- UF LEGAL PREVIEW END -->'
NOTICE_FILE = 'projekt-hinweise.html'

STYLE = '''<!-- UF LEGAL PREVIEW STYLE -->
<style id="uf-legal-preview-style">
.uf-legal-notice{box-sizing:border-box;max-width:100%;padding:.6rem 1rem;border-top:1px solid #a3a3a3;background:#f8fafc;color:#111827;font:400 14px/1.5 system-ui,sans-serif}
.uf-legal-notice a{color:#174ea6;text-decoration:underline}
.uf-legal-notice a:focus-visible{outline:3px solid #174ea6;outline-offset:3px}
@media(prefers-color-scheme:dark){.uf-legal-notice{background:#171b22;color:#f7fafc}.uf-legal-notice a{color:#aaccff}}
</style>
'''
NOTICE = '''<!-- UF LEGAL PREVIEW START -->
<footer class="uf-legal-notice" aria-label="Projekt- und Rechtshinweise">
  <strong>Produktrecherche / Prototyp:</strong> Keine Bestellung oder Zahlung auf dieser Website. Preise, Verfügbarkeit und Passung bitte beim jeweiligen Anbieter und anhand der vollständigen Gerätekennung prüfen. Keine offizielle Verbindung zu den genannten Herstellern. Die Pilot-Anmeldung ist auf GitHub Pages deaktiviert.
  <a href="./projekt-hinweise.html">Projekt- und Rechtshinweise</a>
</footer>
<!-- UF LEGAL PREVIEW END -->'''

DETAILS = '''<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,follow"><title>Projekt- und Rechtshinweise – Universal Fitment</title>
<style>body{max-width:64rem;margin:0 auto;padding:1.2rem;font:1rem/1.65 system-ui,sans-serif;color:#111827;background:white}h1,h2{line-height:1.3}a{color:#174ea6}a:focus-visible{outline:3px solid #174ea6}aside{border:2px solid #b45309;padding:1rem;background:#fff8eb}</style></head><body>
<main>
<h1>Projekt- und Rechtshinweise</h1>
<aside><strong>Entwicklungsstand:</strong> Diese Seite ersetzt ausdrücklich weder ein vollständiges Impressum noch die Datenschutzerklärung. Die gesetzlichen Betreiber- und Datenschutzinformationen müssen vor geschäftsmäßigem öffentlichem Betrieb vollständig und dauerhaft erreichbar sein. Die Veröffentlichung wird bis dahin nicht als rechtlich freigegeben betrachtet.</aside>
<h2>Was der Dienst derzeit ist</h2>
<p>Universal Fitment ist ein recherchierbarer Katalog von Staubsaugern, Zubehör und Ersatzteilen. Es werden hier keine Waren verkauft, keine Zahlungen angenommen und keine Bestellungen abgewickelt. Externe Links können zu fremden Herstellern oder Handelsplattformen führen; deren Inhalte und Bedingungen gelten jeweils dort.</p>
<h2>Keine Herstellerpartnerschaft</h2>
<p>Die genannten Marken dienen ausschließlich der Geräte- und Ersatzteilidentifikation. Diese unabhängige Anwendung ist weder offizieller Herstellerdienst noch ein Ersatz für eine Prüfung anhand des vollständigen Modell-, Typen-, Produktions- und Ländercodes.</p>
<h2>Passung, Angebote und Sicherheit</h2>
<p>Ein Katalogeintrag, eine Gerätfamilie oder eine Artikelsuche garantiert keine Passung. Prüfen Sie Originalteilenummer, Ausführung, Stecker, Spannung, Akkutyp und gegebenenfalls Serienbereich vor Kauf und Einbau. Angezeigte ältere Quellenpreise sind keine Live-Angebote; Versandkosten, Verfügbarkeit und Händlerpreis können abweichen. Sicherheitsrelevante Reparaturen gehören in fachkundige Hände.</p>
<h2>Fotos und externe Inhalte</h2>
<p>Extern verlinkte Produktseiten und auf ausdrücklichen Abruf geladene Bilder können Verbindungen zum jeweiligen Anbieter herstellen. Bilder dürfen nur mit dokumentierter Nutzungserlaubnis in die Anwendung übernommen werden. Eine öffentliche Bildadresse allein ist keine Lizenz.</p>
<h2>Datenspeicherung</h2>
<p>Gespeicherte Geräte und Einkaufsnotizen können lokal im Browser vorliegen. Eine optionale Anmeldung und serverbasierte Pilotfunktionen sind technisch vorbereitet. Ihre konkrete Verarbeitung, Aufbewahrungsfristen, Hosting-Zugriffsprotokolle und Rechte der betroffenen Personen müssen in einer vollständigen Datenschutzerklärung vom tatsächlichen Betreiber offengelegt werden.</p>
<p><a href="./index.html">Zurück zum Katalog</a></p>
</main></body></html>
'''

def inventory(site: Path) -> dict:
    hits = Counter()
    samples = {}
    patterns = {
        'login': re.compile(r'signInWithPassword|type=["\']password|auth/v1/', re.I),
        'external_network': re.compile(r'https?://|fetch\s*\(|XMLHttpRequest', re.I),
        'browser_storage': re.compile(r'localStorage|sessionStorage|indexedDB|caches\.open|document\.cookie', re.I),
        'image': re.compile(r'<img\b|imageUrl|photoUrl|picture|<picture\b', re.I),
        'affiliate': re.compile(r'affiliate|partnerTag|amazon-adsystem|clickref|utm_medium=affiliate', re.I),
        'tracking': re.compile(r'google.analytics|googletagmanager|gtag\s*\(|facebook\.net/.*pixel|hotjar', re.I),
        'imprint_privacy': re.compile(r'impressum|datenschutz|privacy|cookie', re.I),
        'old_odr': re.compile(r'ec\.europa\.eu/consumers/odr|consumer-redress\.ec\.europa\.eu', re.I),
    }
    for path in sorted(site.rglob('*')):
        if not path.is_file() or path.suffix not in {'.js','.mjs','.html','.css','.json','.txt','.md'}: continue
        if path.name.startswith(('app-v','catalog-','services-v')): continue
        text = path.read_text(encoding='utf-8',errors='replace')
        for kind, pattern in patterns.items():
            matches = list(pattern.finditer(text))
            if matches:
                hits[kind] += len(matches)
                if len(samples.setdefault(kind, [])) < 8:
                    samples[kind].append(str(path.relative_to(site)))
    return {'source_file_count':sum(1 for p in site.rglob('*') if p.is_file()),'counts':dict(hits),'sample_paths':samples}

def insert_once(text: str, *, marker: str, payload: str, anchor: str, label: str) -> str:
    if marker in text: return text
    positions = list(re.finditer(anchor,text,re.I))
    if len(positions) != 1: raise ValueError(f'{label} must appear exactly once')
    p=positions[0].start()
    return text[:p]+payload+'\n'+text[p:]

def apply(site: Path) -> dict:
    index=site/'index.html'
    if not index.is_file(): raise ValueError('index.html missing; no changes made')
    original=index.read_text(encoding='utf-8')
    new=insert_once(original,marker='id="uf-legal-preview-style"',payload=STYLE,anchor=r'</head\s*>',label='HTML head closing tag')
    new=insert_once(new,marker=MARK_START,payload=NOTICE,anchor=r'</body\s*>',label='HTML body closing tag')
    details=site/NOTICE_FILE
    if details.exists() and details.read_text(encoding='utf-8')!=DETAILS:
        raise ValueError('Existing notices page differs; refusing replacement')
    # Prevent email/password submission in the GitHub Pages preview.
    # The commercial release must move to an appropriate host with real notices.
    pilot_path=site/'src/core/pilot-client.js'
    pilot_before=pilot_path.read_text(encoding='utf-8') if pilot_path.is_file() else None
    pilot_after=pilot_before
    guard_marker='UF_GITHUB_PAGES_LOGIN_DISABLED'
    needle='const signed=await auth.signInWithPassword({email,password});'
    if pilot_before is not None and guard_marker not in pilot_before:
        if pilot_before.count(needle)!=1:
            raise ValueError('Pilot login shape changed; refusing partial modifications')
        replacement=("// UF_GITHUB_PAGES_LOGIN_DISABLED: no passwords in Pages preview.\\n"
                     "          if(typeof window!=='undefined' && window.location.hostname.toLowerCase().endsWith('.github.io'))return {status:'access_required'};\\n"
                     "          "+needle)
        pilot_after=pilot_before.replace(needle,replacement,1)
    if new != original: index.write_text(new,encoding='utf-8')
    if pilot_after is not None and pilot_after != pilot_before: pilot_path.write_text(pilot_after,encoding='utf-8')
    if not details.exists(): details.write_text(DETAILS,encoding='utf-8')
    return {'modified_index':new!=original,'login_guard_added':pilot_after is not None and pilot_after!=pilot_before,'legal_disclosure_present':details.is_file()}

def release_check(site: Path) -> dict:
    # Deliberate fail-closed release gate, independent of preview notices.
    required = ('impressum.html','datenschutz.html')
    missing=[f for f in required if not (site/f).is_file()]
    if missing:
        return {'ready':False,'blocking':'operator and full DSGVO disclosure not reviewed','missing':missing}
    # Presence never proves accuracy, so a human-approved release marker is additionally necessary.
    return {'ready':False,'blocking':'manual operator/privacy, hosting and rights approval required','missing':[]}

if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('command',choices=['inventory','apply','release-check'])
    parser.add_argument('--site',default='site')
    a=parser.parse_args()
    site=Path(a.site).resolve()
    if not site.is_dir():parser.error('Site directory not found')
    out={'inventory':inventory,'apply':apply,'release-check':release_check}[a.command](site)
    print(json.dumps(out,ensure_ascii=False,sort_keys=True))
    if a.command=='release-check' and not out['ready']:raise SystemExit(2)
