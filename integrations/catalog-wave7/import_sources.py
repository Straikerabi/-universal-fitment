"""Fresh source release: factual extraction only; never evaluates a fitment.

Reuse the existing HTML/BOM parser, NOT its Wave-4 data or historical pins.
Every accepted fact is recomputed from the separate 33-response fresh cache.
"""
import argparse
import hashlib
import importlib.util
import json
import re
import subprocess
import urllib.request
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('oem_parser', ROOT.parent / 'verified-repair-cases-wave4/source_audit.py')
parser = importlib.util.module_from_spec(spec)
spec.loader.exec_module(parser)
Document, norm, flight_objects = parser.Document, parser.norm, parser.flight_objects
HOSTS = {'AEG':'shop.aeg.de','Bosch':'www.bosch-home.com','Dyson':'www.dyson.de',
         'Miele':'www.miele.de','Samsung':'www.samsung.com','Siemens':'www.siemens-home.bsh-group.com','Vorwerk':'www.vorwerk.com'}
RELEASE = 'wave7-de-2026-10-10-v1'


def need(condition, message):
    if not condition:
        raise ValueError(message)


def extract(cache, sources):
    docs, texts, htmls = {}, {}, {}
    for s in sources:
        need(re.fullmatch(r'[a-z0-9-]+', s['id']), 'unsafe cache identity')
        for key in ['url','finalUrl']:
            u = urlparse(s[key]);need(u.scheme == 'https' and u.hostname == HOSTS[s['brand']], 'non-manufacturer URL/redirect')
        data = (cache / (s['id']+'.html')).read_bytes()
        need(len(data)==s['bytes'] and hashlib.sha256(data).hexdigest()==s['sha256'], 'source digest mismatch: '+s['id'])
        htmls[s['id']] = data.decode('utf-8')
        docs[s['id']] = list(Document(htmls[s['id']]).root.walk())
        texts[s['id']] = norm(Document(htmls[s['id']]).root.text())
    by = {s['id']:s for s in sources}
    def head(key, tag):
        return next(norm(n.text()) for n in docs[key] if n.tag==tag)
    def evidence(key, locator):
        s=by[key];return {'sourceId':key,'url':s['url'],'retrievedAt':s['retrievedAt'],'sha256':s['sha256'],'locator':locator}
    devices,parts,listings,excluded = [],[],[],[]
    def add(key, reference, model, typ, namespace, locator, extra=None):
        brand=by[key]['brand'];d={'id':'vac-wave7-'+key,'brand':brand,'reference':reference,'model':model,
         'identifiers':[{'type':namespace,'issuer':brand,'value':reference}]+(extra or []),'type':typ,'market':'DE',
         'productCode':None,'identityEvidence':evidence(key,locator),'candidatePartIds':[],
         'variantHint':'Vollständige Quellenkennung vom Typenschild abgleichen; Seriennummer, Revision und Anschlüsse bleiben ungeprüft.',
         'unresolved':['serial-range','revision','physical-connector','commercial-rights']};devices.append(d);return d
    for code,typ in [('12031660','bagged'),('12560300','bagged'),('11602450','bagless'),('11602420','bagless')]:
        key='miele-'+code;t=texts[key]
        m=re.search(r'Modellbezeichnung (.*?) Materialnummer Hersteller (\d+)',t);need(m and m[2]==code,'Miele material/model context')
        typecode=re.search(r'Produkttyp (\S+)',t)[1];need(m[1] in head(key,'h1'),'Miele own heading')
        add(key,code,m[1],typ,'material-number','Product data: Modellbezeichnung + Materialnummer Hersteller + Produkttyp',
            [{'type':'product-type','issuer':'Miele','value':typecode}])
    for key,reference in [('siemens-vs06a110-03','VS06A110/03'),('siemens-vs06a110-12','VS06A110/12'),
                          ('siemens-vsz4g1400-01','VSZ4G1400/01'),('bosch-bgl35mon1-01','BGL35MON1/01'),('bosch-bgl35mon4-01','BGL35MON4/01')]:
        matches=[o for o in flight_objects(htmls[key]) if o.get('variantId')==reference and o.get('productName',{}).get('description')==head(key,'h3')]
        need(len(matches)==1 and reference in head(key,'h1'),'exact indexed BSH service variant')
        add(key,reference,reference.split('/')[0],'bagged','e-number','h1 indexed service device + Flight variantId/productName.description')
    for code in ['90025863800','90025855700','90025856400','90025855400']:
        key='aeg-'+code;need(''.join(re.findall(r'\d',head(key,'h1')))==code,'complete PNC header')
        model=re.search(r'Modell-ID: (\S+)',texts[key])[1]
        desc=next(n.attrs['content'] for n in docs[key] if n.tag=='meta' and n.attrs.get('name')=='description')
        need(model in desc and code in desc,'PNC/model metadata')
        if code!='90025863800':
            excluded.append({'candidatePnc':code,'actualOfficialModel':model,'evidence':evidence(key,'PNC header + model ID + description'),
                'reason':'Historical AL61 candidate differs from fresh LX82 result; manufacturer/model context unresolved; excluded.'});continue
        need(model=='AB61C3GG','reviewed AEG model changed')
        add(key,code,model,'bagged','pnc','h1 full 11-digit PNC + Modell-ID + meta description',[{'type':'manufacturer-model','issuer':'AEG','value':model}])
    for ref in ['227312-01','268700-01','226397-01']:
        key='dyson-'+ref;model=head(key,'title').split(' | ')[0]
        if ref=='268700-01':
            need('Dyson V11 Absolute (Generation 2019)' in texts[key],'V11 generation heading');model='Dyson V11 Absolute (Generation 2019)'
        need(any(n.tag=='a' and re.search(r'/(?:spare-details\.|replacement-parts/)\d{6}-\d{2}\.'+re.escape(ref)+r'(?:$|[/?])',n.attrs.get('href','')) for n in docs[key]),'SKU-bound spares page')
        add(key,ref,model,'cordless','sku','device title + exact SKU-scoped original part-card links')
    for ref,key,label in [('VK7','vorwerk-vk7','Gebrauchsanleitung Kobold VK7'),('VK200','vorwerk-vk200','Kobold VK200')]:
        links=[n for n in docs[key] if n.tag=='a' and norm(n.text())==label and n.attrs.get('href','').startswith('/de/de/c/dam-home/downloads/user-manuals/')]
        need(len(links)==1 and ref.lower() in links[0].attrs['href'],'own DE manual, not an English or bundle variant')
        add(key,ref,'Kobold '+ref,'cordless' if ref=='VK7' else 'bagged','manufacturer-model','DE manual anchor '+label+' -> '+links[0].attrs['href'])
    for ref in ['VS20C85G4PB/WD','VS20C85G4TB/WD','VS20C85G2TW/WD']:
        key='samsung-'+ref.lower().replace('/','-')
        for field,value in [('modelCode',ref),('siteCode','de')]:
            need(any(n.attrs.get('data-sdf-prop')==field and norm(n.text())==value for n in docs[key]),'Samsung full model/market metadata')
        add(key,ref,head(key,'h1'),'cordless','manufacturer-model','h1 + li[data-sdf-prop=modelCode] full /WD + siteCode=de')
    selected=[('miele-part-12785390','12785390','SF-HA 50-1','filter','material-number'),
     ('miele-part-11639210','11639210','SF-HA 60','filter','material-number'),('miele-part-11639250','11639250','CX FSF','filter','material-number'),
     ('siemens-part-00027606','00027606','Laufrolle vorne','mechanical','manufacturer-article'),
     ('aeg-part-9001677690','9001677690','AFS1W Allergy Plus s-filter waschbar','filter','manufacturer-article'),
     ('aeg-part-9001684746','9001684746','GR201S s-bag Classic Long Performance','bag','manufacturer-article'),
     ('dyson-part-967834-07','967834-07','Dyson V8 Akku E','battery','manufacturer-article'),
     ('dyson-part-970145-06','970145-06','Dyson V11 Akku','battery','manufacturer-article'),
     ('dyson-part-969082-01','969082-01','Dyson Staubsaugerfilter','filter','manufacturer-article'),
     ('vorwerk-fp7','FP7','Kobold FP7 Premium Filtertüten Set (12 Stk.)','bag','manufacturer-part-designation'),
     ('vorwerk-mf7','MF7','Kobold MF7 Motorschutzfilter','filter','manufacturer-part-designation')]
    for key,code,name,assembly,namespace in selected:
        brand=by[key]['brand'];locator='own product heading + exact article identity'
        if brand=='Miele':need('Modellbezeichnung '+name+' Materialnummer Hersteller '+code in texts[key],'own Miele part material')
        elif brand=='Dyson':
            canonical=next(n.attrs['content'] for n in docs[key] if n.tag=='meta' and n.attrs.get('property')=='og:url')
            need(re.search(r'(?<![\w-])'+re.escape(code)+r'(?![\w-])',canonical.split('/')[-1]),'own Dyson article canonical');locator+='; og:url='+canonical
        elif brand=='AEG':need(code in head(key,'title') and urlparse(by[key]['url']).path.endswith('/'+code),'own AEG article title/path')
        elif brand=='Siemens':need(code in head(key,'h1') and name in head(key,'h1') and 'Durchmesser: 67 mm.' in texts[key],'own original wheel, not cable reel')
        else:need(code in head(key,'h1').split() and name==head(key,'h1'),'own Vorwerk part designation')
        parts.append({'id':'wave7-'+brand.lower()+'-part-'+code.lower(),'brand':brand,'code':code,'name':name,'assembly':assembly,
         'identifiers':[{'type':namespace,'issuer':brand,'value':code}],'identityEvidence':evidence(key,locator),
         'unresolved':['assembly-revision','connector-or-seat','installation-conditions','commercial-rights']})
    def listed(devicekey,code,sourcekey,locator,position=None):
        d=next(d for d in devices if d['identityEvidence']['sourceId']==devicekey);p=next(p for p in parts if p['code']==code)
        d['candidatePartIds'].append(p['id']);listings.append({'deviceId':d['id'],'partId':p['id'],'deviceReference':d['reference'],'partCode':code,
         'assembly':p['assembly'],'evidence':evidence(sourcekey,locator),'status':'unconfirmed','purchaseAllowed':False,'physicalFitApproved':False,
         'bomPosition':position,'missing':['exact-device-revision','connector-or-seat','installation-conditions','b2c-commercial-rights']})
    for key,codes in [('miele-12031660',['12785390']),('miele-12560300',['12785390']),('miele-11602450',['11639210','11639250']),('miele-11602420',['11639210','11639250'])]:
        for code in codes:
            need(any('hls-accessories-wrapper-item' in n.attrs.get('class','').split() and any(a.tag=='a' and re.match('/product/'+code+'/',a.attrs.get('href','')) for a in n.walk()) for n in docs[key]),'scoped Miele accessory card')
            listed(key,code,key,'Own device accessory card .hls-accessories-wrapper-item /product/'+code+'/')
    key='siemens-bom-vs06a110-03';matches=[o for o in flight_objects(htmls[key]) if o.get('variantId')=='VS06A110/03' and 'bomRelations' in o]
    need(len(matches)==1 and any(r['productId']=='00027606' and r['positionNumber']=='0109' for r in matches[0]['bomRelations']),'exact indexed BOM position')
    listed('siemens-vs06a110-03','00027606',key,'Flight variantId=VS06A110/03 bomRelations: productId=00027606, positionNumber=0109','0109')
    for code in ['9001677690','9001684746']:
        key='aeg-90025863800';need(any(n.attrs.get('data-component-name')=='ProductCard' and n.attrs.get('data-product-code')==code for n in docs[key]),'PNC-scoped article card')
        listed(key,code,key,'PNC 90025863800 results: ProductCard[data-product-code='+code+']')
    for ref,code in [('227312-01','967834-07'),('268700-01','970145-06'),('226397-01','969082-01')]:
        key='dyson-'+ref
        need(any('plp-spare-card__item' in n.attrs.get('class','').split() and 'Teil Nr. '+code in norm(n.text()) and any(a.tag=='a' and re.search(r'/(?:spare-details\.|replacement-parts/)'+re.escape(code+'.'+ref)+r'(?:$|[/?])',a.attrs.get('href','')) for a in n.walk()) for n in docs[key]),'exact SKU/article card')
        listed(key,code,key,'Own .plp-spare-card__item: Teil Nr. '+code+'; exact link article.'+ref)
    for code,key in [('FP7','vorwerk-fp7'),('MF7','vorwerk-mf7')]:
        need('Kompatibel zu VK7 Lieferumfang' in texts[key],'own compatibility block, not a recommendation')
        listed('vorwerk-vk7',code,key,'Own named part h1 + Kompatibel zu VK7 immediately before Lieferumfang')
    return {'schema':'uf.fresh-oem-pilot/1','release':RELEASE,'branchBase':'620a4ae8bf49f5c0c212da4acddad249b8b8764b',
     'sources':sources,'devices':sorted(devices,key=lambda x:x['id']),'parts':sorted(parts,key=lambda x:x['id']),
     'listings':sorted(listings,key=lambda x:(x['deviceId'],x['partId'])),'excludedCandidates':excluded}


def dump(value):
    return json.dumps(value,ensure_ascii=False,indent=2)+'\n'


if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--cache',required=True,type=Path);p.add_argument('--write',action='store_true');p.add_argument('--fetch',action='store_true');args=p.parse_args()
    need(not args.cache.resolve().is_relative_to(ROOT.parent.parent),'audit cache must be outside git repository')
    sources=json.loads((ROOT/'sources.json').read_text())
    if args.fetch:
        args.cache.mkdir(parents=True,exist_ok=True)
        for s in sources:
            target=args.cache/(s['id']+'.html')
            if target.exists():continue
            with urllib.request.urlopen(urllib.request.Request(s['url'],headers={'User-Agent':'Mozilla/5.0'}),timeout=55) as r:
                data=r.read();need(r.url==s['finalUrl'] and hashlib.sha256(data).hexdigest()==s['sha256'],'live response changed; new review required, never overwrite pin')
            target.write_bytes(data)
    result=dump(extract(args.cache,sources));target=ROOT/'pilot.json'
    if args.write:
        need(subprocess.check_output(['git','branch','--show-current'],cwd=ROOT,text=True).strip()=='work/wave7-fresh-oem-consumer-pilot','wrong branch');target.write_text(result)
    else:need(target.read_text()==result,'fresh extraction differs from pinned pilot')
    print(json.dumps({'sourcesVerified':len(sources),'devicesVerified':18,'partIdentitiesVerified':11,'scopedListingsVerified':14,'manifestSha256':hashlib.sha256(result.encode()).hexdigest(),'state':'generated' if args.write else 'byte-identical'}))
