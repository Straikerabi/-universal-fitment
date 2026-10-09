"""Deterministic report and ten case sheets. Does not mutate catalog/engine."""
import argparse
import json
from validate import ROOT, load, validate


def render(dataset, audit, observations):
    counts = validate(dataset, audit, observations)
    sources = {s['id']: s for s in audit['sources']}
    proofs = {o['id']: o for o in observations}

    def cite(id):
        proof = proofs[id]
        source = sources[proof['source']]
        page = proof['recipe'].get('page')
        return f"[{id}]({source['url']})" + (f" (PDF/gedruckte Seite {page})" if page else '')

    artifacts = {'coverage.json': json.dumps(counts, ensure_ascii=False, indent=2) + '\n'}
    lines = ['# Verified repair cases – Wave 4 / Issue #62', '',
             'Herstellerrecherche vom 2026-10-09. Zehn bestehende Katalogprofile, sieben Marken. Keine physischen Geräte untersucht, keine Montage- oder elektrische Sicherheitsprüfung durchgeführt.', '',
             f"**{counts['reviewedAssemblies']} untersuchte Baugruppen, {counts['manufacturerListedOemEdges']} exakt gelistete Hersteller-Artikelkanten, {counts['fullyV1EligibleRealFitments']} vollständig v1-freigabefähige reale Passungen.**", '',
             '„Gelistet“ belegt nur die im Herstellerkontext dokumentierte Beziehung. Es ist weder eine vollständige Reparaturanleitung noch eine uneingeschränkte Engine-Freigabe. Alle Baugruppen bleiben teilweise beschrieben, alle Artikelkanten unconfirmed.', '',
             '| Fall | Exakte recherchierte Referenz | Baugruppen | Artikelkanten | Negativfälle |',
             '| --- | --- | ---: | ---: | ---: |']
    for c in dataset['cases']:
        lines.append(f"| [{c['name']}](cases/{c['id']}.md) | `{c['scope']}` | {len(c['assemblies'])} | {len(c['edges'])} | {len(c['negativeCases'])} |")
        detail = [f"# {c['brand']} {c['name']}", '', f"Katalogprofil: `{c['catalogId']}`. Recherchebereich: DE, `{c['scope']}`.", '',
                  f"Identifikatoren: `{json.dumps(c['identifiers'], ensure_ascii=False, sort_keys=True)}`.", '',
                  'Auswahl: ' + c['selection'], '', 'Geräteidentität: ' + cite(c['identityProof']), '',
                  '## Varianten- und Revisionsgrenzen', '', *['- ' + a for a in c['ambiguities']], '',
                  'Seriennummer, beobachtete Revision und Anschlussinspektion: unbekannt.', '',
                  '## Baugruppen und Originalartikel', '', '| Baugruppe | Originalartikel / Namespace | Beleg | Anschluss / Lücke |', '| --- | --- | --- | --- |']
        for assembly in c['assemblies']:
            edges = [e for e in c['edges'] if e['assembly'] == assembly['id']]
            if not edges:
                detail.append(f"| {assembly['name']} | nicht bestimmt | keine Artikel-Freigabe | {' '.join(assembly['unknowns'])} |")
            for e in edges:
                p=e['part'];aliases=', '.join(p['aliases']) or 'keine bestätigten Aliasse'
                detail.append(f"| {assembly['name']} | `{p['code']}` ({p['namespace']}): {p['name']}; {aliases} | {cite(e['listingProof'])}; {cite(e['identityProof'])}" + (f"; BOM-Position `{e['position']}`" if e['position'] else '') + f" | {' '.join(assembly['unknowns'])} |")
        detail += ['', '## Belegte Bedingungen', '']
        detail += ['- ' + x['text'] + ' ' + cite(x['proof']) for x in c['conditions']] or ['Keine weitere konkrete Hersteller-Montagebedingung im geprüften Quellenumfang; nicht als bedingungsfrei behandeln.']
        detail += ['', '## Negativ- und unbekannte Fälle', '']
        detail += [f"- **Bedingt ausgeschlossen:** `{x['target']}` bei {x['when']}. {x['text']} {cite(x['proof'])}" for x in c['negativeCases']]
        detail += [f"- **Unbekannt:** `{x['target']}`. {x['text']}" for x in c['unknownCases']]
        detail += ['', '## Freigabe und Provenienz', '',
                   'Keine positive Reparaturfreigabe. Originalnummer/Herstellerbezeichnung, Bauteillistung, Anschluss und vollständige Geräteausführung sind getrennte Nachweisfelder. Montagezustand, Baugruppen-Vollständigkeit und kommerzielle Wiederverwendungsrechte bleiben offen.', '',
                   'Abrufdatum, URLs, HTTP-Status und SHA-256 stehen in `../sources.json`; Selektoren und normalisierte Beobachtungen in `../observations.json`. Nur eigene Tatsachenzusammenfassungen werden versioniert; keine Herstellerzeichnungen oder Dokumentkopien.', '']
        artifacts[f"cases/{c['id']}.md"] = '\n'.join(detail)
    lines += ['', '## Messgrenzen', '',
              f"{counts['sourceBackedConditionalNegatives']} bedingte, quellengestützte Negativfälle; {counts['explicitUnknownCases']} explizite unbekannte Transfer-/Aliasfälle. Die Negativzahl ist keine Zahl geprüfter physischer Fehlmontagen.", '',
              'Alle zehn Profile enthalten offene Variantenfragen; darunter E-Nr.-Index, vollständige PNC, Dyson-Akkumontage und regionale Samsung-/Farbartikel. Motor-/Elektronikartikel bleiben bewusst unbestimmt. Ein fehlender Artikel, eine andere Artikelnummer oder ein HTTP-404 wird nie zur belegten Unpassung.', '',
              'Auswahl deckt ältere Supportprofile, die explizite Dyson-Generation 2019, neue Samsung-2025- und aktuelle modulare VK7-Systeme sowie Boden- und Akku-Hand-/Stielgeräte ab. „Premium“ bezeichnet Herstellerpositionierung, keinen aktuellen Preisvergleich. Der Umfang von zehn Profilen ist keine Vollabdeckung des Staubsaugermarkts.', '',
              'Originalartikelnummern bleiben herstellerspezifisch, einschließlich führender Nullen. Vorwerk FP7/MF7 sind belegte Herstellerbezeichnungen; numerische Artikelnummern werden nicht erfunden. BSH-Suffix `(00)` wird ohne Aliasnachweis nicht entfernt. Eine Baugruppenposition ist keine Bestellnummer.', '',
              '## Nutzung und Übergabe', '',
              'Öffentliche Herstellerseiten erteilen keine automatische Lizenz für Bilder, PDFs, Zeichnungen oder kommerzielle Datenweitergabe. Rechte sind pro Quelle **unknown**. Diese konservative Dokumentationswelle enthält daher **0** vollständige v1-Kandidaten und keinen Engine-Adapter. Fehlende Gerätebeobachtungen und technische Nachweise verhindern die Freigabe auch unabhängig von der Rechtefrage.', '',
              'Die bestehende Engine, Consumer-/Business-UI, main-Katalog und Deployment sind nicht beteiligt. Gemeinsame Integration benötigt gesonderte, geprüfte Nachweise; Issue #62 liefert nur isolierte Evidenz.']
    artifacts['REPORT.md'] = '\n'.join(lines) + '\n'
    audit_lines = ['# Quellen-Audit / 2026-10-09', '',
                   '36 erfolgreiche offizielle Herstellerantworten, 37 reproduzierbare Beobachtungen. Alle 36 Originalantworten wurden privat gespeichert und gegen ihre SHA-256-Pins geprüft. Nicht jede Kontextquelle enthält selbst eine Artikelkante.', '',
                   'Nutzungsrecht pro Quelle: **unknown**. Öffentliche Zugänglichkeit belegt keine Lizenz. Dieser PR enthält nur eigene Faktenzusammenfassungen und technische Beobachtungen, keine Originaldokumente, Fotos oder Explosionszeichnungen.', '',
                   '| Quelle | Hersteller | HTTP / Abrufdatum | Methode / Beobachtungen | SHA-256 |',
                   '| --- | --- | --- | --- | --- |']
    for source in audit['sources']:
        related = [o for o in observations if o['source'] == source['id']]
        methods = ', '.join(o['id'] + (f" / PDF S.{o['recipe']['page']}" if 'page' in o['recipe'] else '') for o in related) or 'Kontext-/Identitätsquelle; keine eigene Freigabe'
        audit_lines.append(f"| [{source['id']}]({source['url']}) | {source['brand']} | {source['httpStatus']} / {source['checkedAt'][:10]} | {methods} | `{source['sha256']}` |")
    audit_lines += ['', '## Ungeeignete / fehlgeschlagene Nachschlageversuche', '']
    for attempt in audit['rejectedLookups']:
        audit_lines.append(f"- [{attempt['id']}]({attempt['url']}): {attempt['error']}. Keine OEM-Kante und kein Negativnachweis daraus. Später wurde die tatsächliche Hersteller-URL separat erfolgreich geprüft.")
    audit_lines += ['', '## Dokumentseiten und Revisionsstand', '',
                    'Vorwerk-Handbuch: DE AT CH Benelux, Ausgabe 26302-04 / 0824. PDF-/Druckseiten 14 (elektrische Systemgrenze), 39 (Filtertütenwechsel), 42 (Motorschutzfilter). Miele-Boost-Anleitung PDF-/Druckseite 17 (Feinstaubfilter/Matte), C3-Anleitung Seite 25 (Filterarten und Gitter). Diese Seiten wurden gerendert und visuell geprüft; die Anleitungshashes bleiben dokumentgenau, eine allgemeine Anleitung ersetzt keine Artikelrevision.', '',
                    'Offen bleiben insbesondere tatsächliche Serien-/Montagebeobachtungen, vollständige Baugruppen, Stecker-/Dichtungs-/Elektrodaten, Bosch-/xx, BSH-(00)-Alias und genaue kommerzielle Nutzungsrechte. Ungeprüfte oder fehlende Quellen werden weder mit Ersatzmaßen noch mit Familienfreigaben ergänzt.', '']
    artifacts['AUDIT.md'] = '\n'.join(audit_lines)
    return artifacts


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    artifacts = render(*load())
    for name, content in artifacts.items():
        target = ROOT / name
        if args.check:
            if not target.exists() or target.read_text() != content:
                raise SystemExit(f'stale generated report: {name}')
        else:
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(content)
    print(f'{len(artifacts)} deterministic artifacts verified' if args.check else f'{len(artifacts)} artifacts written')
