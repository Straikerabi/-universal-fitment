"""Read-only operator/commercial readiness inventory. Not a legal approval.

Intentionally prints no private values, only missing field paths.
Do not commit an operator-private.json or run with real data in public CI.
"""
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path


def valid_text(value: object, *, min_length: int = 2) -> bool:
    return isinstance(value, str) and len(value.strip()) >= min_length and not any(
        s in value.lower() for s in ('<placeholder>', 'todo', 'tbd', 'beispiel', 'example.com')
    )


def get(obj: object, path: str) -> object:
    for key in path.split('.'):
        if not isinstance(obj, dict):
            return None
        obj = obj.get(key)
    return obj


def assess(config: dict, site: Path) -> dict:
    """Produces conservative status; never certifies actual legal correctness."""
    missing = []
    warnings = []
    required_text = (
        'operator.legal_name',
        'operator.business_address.street',
        'operator.business_address.house_number',
        'operator.business_address.postal_code',
        'operator.business_address.city',
        'operator.business_address.country',
        'operator.public_email',
        'operator.additional_immediate_contact',
        'hosting.production_domain',
        'hosting.provider',
    )
    for key in required_text:
        if not valid_text(get(config,key),min_length=1 if key.endswith('house_number') else 2):
            missing.append(key)

    legal_form=get(config,'operator.legal_form')
    if legal_form not in ('individual','gbr','ug','gmbh','other_confirmed'):
        missing.append('operator.legal_form')

    postal=get(config,'operator.business_address.postal_code')
    if not isinstance(postal,str) or not re.fullmatch(r'[0-9]{5}',postal):
        missing.append('operator.business_address.postal_code:format')

    email=get(config,'operator.public_email')
    if not isinstance(email,str) or not re.fullmatch(r'[^\s@]+@[^\s@]+\.[^\s@]+',email):
        missing.append('operator.public_email:format')

    reg=get(config,'operator.commercial_register.registered')
    if reg is True:
        for key in ('operator.commercial_register.court','operator.commercial_register.number'):
            if not valid_text(get(config,key)):missing.append(key)
    elif reg is not False:
        missing.append('operator.commercial_register.registered')

    if get(config,'operator.regulated_profession') is True:
        if not valid_text(get(config,'operator.professional_regulator')):
            missing.append('operator.professional_regulator')

    domain=get(config,'hosting.production_domain')
    if isinstance(domain,str):
        normalized=domain.lower().strip().removeprefix('https://').removeprefix('http://').split('/')[0]
        if normalized.endswith('.github.io') or normalized in ('github.io','localhost','127.0.0.1') or '.' not in normalized:
            missing.append('hosting.production_domain:not-commercial-github-pages')

    status_keys = (
        'business.gewerbe_registration_confirmed',
        'hosting.terms_approved','hosting.av_contract_checked',
        'privacy.actual_data_flows_documented',
        'privacy.privacy_notice_approved','privacy.processor_contracts_reviewed',
        'privacy.log_retention_verified','privacy.international_transfers_assessed',
        'privacy.data_subject_requests_process','privacy.account_deletion_process_verified',
        'privacy.terminal_storage_reviewed','marketplace.partner_contracts_approved',
        'marketplace.affiliate_disclosure_reviewed','marketplace.offers_and_price_rules_verified',
        'content.image_rights_cleared_or_disabled','content.third_party_licenses_reviewed',
        'content.fitment_sources_verified','launch.human_legal_review_approved',
        'launch.operator_publication_approved'
    )
    for key in status_keys:
        if get(config,key) is not True: missing.append(key)

    if get(config,'business.mode') != 'affiliate-referral-only':
        warnings.append('Business model requires a new legal scope check')
        missing.append('business.mode:review')
    if get(config,'business.own_checkout_enabled') is not False:
        missing.append('business.own_checkout_enabled:must-be-false-for-this-scope')

    for page in ('impressum.html','datenschutz.html'):
        p=site/page
        if not p.is_file():
            missing.append('site/'+page)
        else:
            text=p.read_text(encoding='utf-8',errors='replace')
            if len(text)<450 or re.search(r'\b(?:TODO|PLACEHOLDER|MUSTER|Lorem ipsum)\b',text,re.I):
                missing.append('site/'+page+':needs-manual-content-review')
    index=site/'index.html'
    if not index.is_file():
        missing.append('site/index.html')
    else:
        html=index.read_text(encoding='utf-8',errors='replace').lower()
        for page in ('impressum.html','datenschutz.html'):
            if page not in html: missing.append('site/index.html:link:'+page)
    warnings.append('All positive flags require documentary evidence; this script is not legal validation.')
    return {
        'ready_for_manual_release_review': len(missing)==0,
        'automatic_production_approval':False,
        'missing':sorted(set(missing)),
        'warnings':warnings,
    }


def main() -> int:
    ap=argparse.ArgumentParser()
    ap.add_argument('--config',required=True)
    ap.add_argument('--site',required=True)
    args=ap.parse_args()
    config_path=Path(args.config)
    if not config_path.is_file():
        print(json.dumps({'ready_for_manual_release_review':False,'missing':['operator_config_file']},sort_keys=True))
        return 2
    try:
        cfg=json.loads(config_path.read_text(encoding='utf-8'))
        if not isinstance(cfg,dict): raise ValueError('configuration must be an object')
        result=assess(cfg,Path(args.site))
    except (ValueError, OSError, UnicodeError) as exc:
        print(json.dumps({'ready_for_manual_release_review':False,'missing':['invalid_config_or_site'],'error_type':type(exc).__name__},sort_keys=True))
        return 2
    print(json.dumps(result,ensure_ascii=False,sort_keys=True))
    return 0 if result['ready_for_manual_release_review'] else 2

if __name__=='__main__':
    raise SystemExit(main())
