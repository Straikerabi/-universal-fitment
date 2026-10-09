"""Offline evidence-intake validation, deliberately not a compatibility engine."""
import hashlib
import json
import re
from pathlib import Path
from source_audit import ROOT, trusted

BASELINE = '71f7826ba936a1f3830c8b2a67e8085a9cfe234e'
BRANCH = 'work/verified-repair-cases-wave4'


def load():
    return (json.loads((ROOT / 'cases.json').read_text()),
            json.loads((ROOT / 'sources.json').read_text()),
            json.loads((ROOT / 'observations.json').read_text()))


def require(value, message):
    if not value:
        raise ValueError(message)


def unique(items, label):
    require(len(items) == len(set(items)), f'duplicate {label}')


def shape(value, names):
    require(set(value) == set(names.split()), 'unsupported or missing schema field')


def validate(dataset, audit, observations):
    lock = json.loads((ROOT / 'audit-lock.json').read_text())
    for name, value in [('sources', audit), ('observations', observations)]:
        digest = hashlib.sha256(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()
        require(digest == lock[name], 'audited provenance changed; replay and manual review required')
    require(dataset['schemaVersion'] == 'repair-case-evidence/1.0.0', 'unsupported schema')
    require(dataset['baselineCommit'] == BASELINE and dataset['branch'] == BRANCH, 'wrong work baseline')
    cases = dataset['cases']
    require(len(cases) == 10, 'exactly ten cases required')
    require(len({c['brand'] for c in cases}) >= 3, 'insufficient brands')
    unique([c['id'] for c in cases], 'case')
    unique([c['catalogId'] for c in cases], 'catalog device')
    unique([(c['brand'], c['scope']) for c in cases], 'device scope')
    sources = {s['id']: s for s in audit['sources']}
    require(len(sources) == len(audit['sources']), 'duplicate source')
    for source in sources.values():
        require(trusted(source), 'untrusted manufacturer source')
        require(source['httpStatus'] == 200 and source['authority'] == 'manufacturer', 'invalid authority/status')
        require(source['reusePermission'] == 'unknown', 'no reviewed reuse grant in this wave')
        require(re.fullmatch(r'[a-f0-9]{64}', source['sha256']), 'invalid source hash')
        require(source['checkedAt'].startswith(audit['checkedDate']), 'undated source')
        require(Path(source['file']).name == source['file'], 'unsafe cache filename')
    proofs = {o['id']: o for o in observations}
    require(len(proofs) == len(observations), 'duplicate observation')
    for proof in proofs.values():
        require(proof['source'] in sources, 'missing observation source')
        recipe, observed = proof['recipe'], proof['observed']
        if 'scope' in recipe:
            require(observed.get('scope') == recipe['scope'], 'extraction scope altered')
        if recipe['kind'] in {'visible', 'pdf-page'}:
            require(observed['assertions'] == recipe['requires'], 'source assertions altered')
        if recipe['kind'] == 'pdf-page':
            require(observed['page'] == recipe['page'] and recipe['page'] > 0, 'wrong PDF page')

    def proof_for(id, brand):
        require(id in proofs, 'unknown proof')
        proof = proofs[id]
        require(sources[proof['source']]['brand'] == brand, 'wrong proof manufacturer')
        return proof

    assemblies_count = edges_count = negatives_count = unknowns_count = 0
    for case in cases:
        shape(case, 'id brand name market scope identifiers catalogId identityProof selection ambiguities observedDevice assemblies edges conditions negativeCases unknownCases')
        brand, scope = case['brand'], case['scope']
        identity = proof_for(case['identityProof'], brand)
        if brand != 'Vorwerk':
            require(identity['observed'].get('scope') == scope, 'wrong device identity proof')
        else:
            require(scope == 'VK7' and 'VK7' in identity['observed']['assertions'], 'wrong VK7 identity')
        require(case['market'] == 'DE', 'region transfer prohibited')
        require(case['observedDevice'] == {'serial': None, 'revision': None, 'connectorInspection': None},
                'no real unit inspection in this document-only wave')
        identifiers = case['identifiers']
        if brand == 'AEG':
            require(identifiers['pnc'] == scope and re.fullmatch(r'\d{11}', scope), 'full PNC required')
        elif brand == 'Siemens':
            require(identifiers['eNr'] == scope and re.fullmatch(r'.+/\d{2}', scope), 'full E-Nr required')
        elif brand == 'Samsung':
            require(identifiers['modelCode'] == scope and scope.endswith('/WD'), 'full Samsung regional code required')
        elif brand == 'Dyson':
            require(identifiers['productSku'] == scope, 'Dyson product SKU required')
        elif brand == 'Miele':
            require(identifiers['material'] == scope and identifiers['type'] in identity['recipe']['requires'], 'Miele material/type mismatch')
        elif brand == 'Bosch':
            require(identifiers['model'] == scope and identifiers['eNrIndex'] is None, 'unobserved Bosch index')
        assemblies = {a['id']: a for a in case['assemblies']}
        require(len(assemblies) == len(case['assemblies']) and len(assemblies) >= 3, 'assembly identities missing/duplicate')
        for assembly in assemblies.values():
            shape(assembly, 'id name completeness unknowns')
            require(assembly['completeness'] == 'partial' and len(assembly['unknowns']) > 0, 'unreviewed assembly completion')
        assemblies_count += len(assemblies)
        edge_ids = []
        for edge in case['edges']:
            shape(edge, 'assembly part scope status listingProof identityProof position connection deviceInspection reusePermission release')
            part = edge['part']
            shape(part, 'issuer namespace code name aliases')
            require(edge['assembly'] in assemblies and edge['scope'] == scope, 'edge scope/assembly mismatch')
            require(edge['status'] == 'manufacturer_listing' and edge['release'] == 'unconfirmed', 'positive release prohibited')
            require(all(edge[k] == 'unknown' for k in ['connection', 'deviceInspection', 'reusePermission']), 'unverified technical/rights approval')
            require(part['issuer'] == brand and isinstance(part['code'], str) and part['code'], 'OEM identity missing')
            require(part['namespace'] == ('material' if brand == 'Miele' else 'designation' if brand in {'Samsung', 'Vorwerk'} else 'article'), 'incorrect OEM namespace')
            if part['namespace'] in {'material', 'article'} and brand not in {'AEG', 'Dyson'}:
                require(re.fullmatch(r'\d{8}', part['code']), 'eight-digit manufacturer code including leading zeros required')
            if brand == 'AEG':
                require(re.fullmatch(r'\d{10}', part['code']), 'AEG article is not a device PNC')
            if brand == 'Dyson':
                require(re.fullmatch(r'\d{6}-\d{2}', part['code']), 'Dyson article is not a device SKU')
            listing = proof_for(edge['listingProof'], brand)
            evidence = listing['observed']
            if brand == 'Vorwerk':
                require(scope in evidence['assertions'] and part['code'] in evidence['assertions'], 'missing exact Vorwerk designation statement')
            else:
                require(evidence.get('scope') == scope, 'family/variant listing transfer')
                articles = evidence.get('articles', [])
                if listing['recipe']['kind'] == 'bsh-bom':
                    require({'code': part['code'], 'position': edge['position']} in articles, 'wrong exact BOM article/position')
                else:
                    require(part['code'] in articles and edge['position'] is None, 'article not in scoped manufacturer listing')
            identity_part = proof_for(edge['identityProof'], brand)
            if identity_part != listing:
                assertions = identity_part['recipe'].get('requires', [])
                canonical = identity_part['recipe'].get('canonical', '')
                require(any(part['code'] == token for token in assertions) or canonical.endswith('/' + part['code']), 'wrong OEM identity proof')
            for alias in part['aliases']:
                require(alias in identity_part['recipe'].get('requires', []), 'unverified alias normalization')
            edge_ids.append((edge['assembly'], part['namespace'], part['code']))
        unique(edge_ids, 'OEM edge')
        edges_count += len(case['edges'])
        for condition in case['conditions']:
            shape(condition, 'id assembly text proof')
            require(condition['assembly'] in assemblies, 'unknown condition assembly')
            proof_for(condition['proof'], brand)
        for negative in case['negativeCases']:
            shape(negative, 'id assembly target when status text proof')
            require(negative['assembly'] in assemblies and negative['status'] == 'excluded' and negative['when'], 'unscoped exclusion')
            proof_for(negative['proof'], brand)
            # These manually reviewed exclusions are deliberately narrow. Different
            # numbers, an absent listing or HTTP 404 never establish incompatibility.
            expected = {
                'bosch-vs08': ('bag', 'bosch-exclusion', '00577549', 'Gerät gehört zur VS08... oder VS01... Serie'),
                'v8-yh5-exclusion': ('battery', 'v8-yh5', '967834-07', 'Serienpräfix YH5'),
                'v11-screw-exclusion': ('battery', 'v11-click-condition', '970938-01', 'Schraubakku-Ausführung ohne große rote Entriegelungstaste'),
                'vk7-mains-exclusion': ('attachment', 'vk7-exclusion', 'Elektrisch betriebene Vorsätze von Vorwerk Netzstaubsaugern', 'Kreuzverbindung VK7-Akkusystem ↔ Netzstaubsauger-System'),
            }
            require(expected.get(negative['id']) == (negative['assembly'], negative['proof'], negative['target'], negative['when']), 'unsupported or broadened exclusion')
        for unknown in case['unknownCases']:
            shape(unknown, 'id assembly target status text')
            require(unknown['assembly'] in assemblies and unknown['status'] == 'unknown' and unknown['text'], 'unknown promoted to an answer')
        require(case['unknownCases'], 'missing evidence gaps')
        negatives_count += len(case['negativeCases'])
        unknowns_count += len(case['unknownCases'])
    return {'models': len(cases), 'brands': len({c['brand'] for c in cases}),
            'reviewedAssemblies': assemblies_count, 'manufacturerListedOemEdges': edges_count,
            'sourceBackedConditionalNegatives': negatives_count, 'explicitUnknownCases': unknowns_count,
            'variantAmbiguousCases': sum(bool(c['ambiguities']) for c in cases),
            'fullyV1EligibleRealFitments': 0}


if __name__ == '__main__':
    print(json.dumps(validate(*load()), sort_keys=True))
