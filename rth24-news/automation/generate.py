"""Deterministic news from certified GW001 transfers. No invented transfer facts."""
import json,hashlib,re,sys,os,io
from pathlib import Path
from datetime import datetime,date
from zoneinfo import ZoneInfo
from decimal import Decimal,InvalidOperation
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from media import download,inspect
from PIL import Image
R=Path(__file__).resolve().parents[1];A=R/'automation'

def jlist(v):
 if isinstance(v,str):v=json.loads(v or '[]')
 if v is None:return []
 if not isinstance(v,list):raise ValueError('Invalid exchange list')
 return v

def cash(text):
 # Only explicit cash; player Codex valuations are not transaction prices.
 s=str(text or '').split('+')[0].strip().replace('€','').strip()
 m=re.fullmatch(r'(\d+(?:[.,]\d+)?)\s*([kKmM]?)',s)
 if not m:return None
 return Decimal(m[1].replace(',','.'))*{'':1,'k':1000,'m':1000000}[m[2].lower()]

def fingerprint(row):
 parts=[str(row.get(k) or '').strip() for k in ['player_id','from_sm_world_club_id','to_sm_world_club_id','normalized_transfer_date']]
 if not parts[0] or not parts[3]:raise ValueError('Missing transfer identity/date')
 parts[1]=parts[1] or str(row.get('club_from','')).strip().casefold()
 parts[2]=parts[2] or str(row.get('club_to','')).strip().casefold()
 if not all(parts):raise ValueError('Incomplete club identity')
 return hashlib.sha256(json.dumps(['GW001',*parts]).encode()).hexdigest()[:24]

def eligible(row,cfg):
 return row.get('normalization_status')=='CERTIFIED' and str(row.get('imported_at') or '')>cfg['baseline_imported_at'] and str(row.get('normalized_transfer_date') or '')>cfg['baseline_transfer_date']

def participants(row,clubs):
 return list(dict.fromkeys(str(row.get(k)) for k in ['to_sm_world_club_id','from_sm_world_club_id'] if str(row.get(k)) in clubs))

def manager(snapshot,club_id,day):
 rows=[m for m in snapshot['managers'] if str(m['team_id'])==club_id and str(m.get('start_date') or '')<=day and (not m.get('end_date') or str(m['end_date'])>=day)]
 names={m['full_name'] for m in rows if m.get('full_name')}
 if len(names)!=1:raise ValueError('Missing or ambiguous manager for '+club_id)
 return next(iter(names))

def asset(url,prefix):
 cached=sorted((R/'assets').glob(prefix+'-*'))
 if cached:
  inspect(cached[-1].read_bytes(),cached[-1].name);return cached[-1].name
 if not url:raise ValueError('Missing verified image URL')
 if url.startswith('//'):url='https:'+url
 if url.startswith('/nexus/'):url='https://www.italianmastersclub.it'+url
 data=download(url)
 with Image.open(io.BytesIO(data)) as img:
  ext={'JPEG':'jpg','PNG':'png','WEBP':'webp'}.get(img.format)
 if not ext:raise ValueError('Unsupported original image format')
 digest=hashlib.sha256(data).hexdigest();name=prefix+'-'+digest[:16]+'.'+ext
 inspect(data,name);p=R/'assets'/name
 if p.exists() and p.read_bytes()!=data:raise ValueError('Asset collision')
 p.write_bytes(data)
 return name

def display_name(value):
 # Preserve mixed-case spelling; remove only the database's all-caps style.
 return ' '.join(word.title() if word.isupper() else word for word in str(value).split())

def money_label(amount):
 value=cash(amount)
 if value is None:return str(amount)
 if value>=1000000:
  return format((value/1000000).normalize(),'f').replace('.',',')+' milioni di euro'
 return f'{value:,.0f}'.replace(',','.')+' euro'

def editorial(name,fr,to,amount,day,names,loan):
 formula='Prestito' if loan else 'Scambio con contropartite' if names else 'Trasferimento definitivo'
 cost=money_label(amount)
 if names:cost+=' + '+', '.join(names)
 title=f'{name}, ufficiale: '+('prestito a ' if loan else '')+to
 if not loan:title=f'{to}: ufficiale l’arrivo di {name}'
 if fr.casefold() in ('svincolato','free agent'):
  text=f'{to} annuncia l’arrivo di {name}, proveniente dalla lista degli svincolati. Operazione da {cost}.'
 elif names:
  text=f'{to} e {fr} chiudono l’accordo per {name}. Operazione da {money_label(amount)}, con '+', '.join(names)+f' nel percorso inverso verso {fr}.'
 else:
  text=f'{to} annuncia l’arrivo di {name}'+(' in prestito' if loan else '')+f'. Il giocatore lascia {fr}: operazione da {cost}.'
 return title,text,{'from':fr,'to':to,'formula':formula,'amount':cost,'date':day}

def news(row,snapshot,reporters,now,media=True):
 clubs={str(x['club_id']):x for x in snapshot['clubs']};players=snapshot['players'];pid=str(row['player_id']);p=players.get(pid,{})
 name=display_name(p.get('full_name') or row.get('player_name') or '')
 fr=str(row.get('club_from') or '').strip();to=str(row.get('club_to') or '').strip();amount=str(row.get('amount_text') or '').strip()
 if not all([name,fr,to,amount]):raise ValueError('Incomplete transfer facts')
 day=str(row['normalized_transfer_date']);date.fromisoformat(day)
 if day>now[:10]:raise ValueError('Future transfer date')
 exchange=jlist(row.get('normalized_exchange_players') or row.get('exchange_players'))
 if '+' in amount and not exchange:raise ValueError('Missing normalized exchange players')
 names=[]
 for x in exchange:
  xp=players.get(str(x.get('player_id')),{})
  n=xp.get('full_name') or x.get('player_name') or x.get('name')
  if not n:raise ValueError('Exchange player without identity')
  names.append(display_name(n))
 ids=participants(row,clubs);key=fingerprint(row);nid='gw001-market-'+key
 status=str(row.get('status') or '').casefold()
 if status and status not in ('completed','complete','concluso','conclusa','official','ufficiale','transfer','trasferimento','loan','prestito'):raise ValueError('Unsupported transfer status '+status)
 loan=status in ('loan','prestito') or 'prestito' in amount.casefold() or 'loan' in amount.casefold()
 title,text,transfer=editorial(name,fr,to,amount,day,names,loan)
 item={'id':nid,'published_at':now,'title':title,'text':text,'category':'market','club_ids':ids,'teams':[], 'transfer':transfer,'editorial_version':2}
 if media:
  def optional_asset(url,prefix):
   try:return asset(url,prefix)
   except Exception as e:
    print('MEDIA RETRY',prefix,type(e).__name__);return None
  url=p.get('image_url') or row.get('player_image') or ('https://cdn.soccerwiki.org/images/player/'+p['image_file'] if p.get('image_file') else None)
  photo=optional_asset(url,'market-player-'+pid)
  if photo:item['image']={'file':photo,'alt':name}
  for cid in ids:
   c=clubs[cid];url=c.get('image_url') or ('https://www.italianmastersclub.it/nexus/assets/clubs/'+c['image_file'] if c.get('image_file') else None)
   logo=optional_asset(url,'market-club-'+cid)
   item['teams'].append({'name':c['name'],**({'logo':logo} if logo else {})})
 rating=p.get('rating') if p.get('rating') is not None else row.get('player_rating')
 rating=int(rating) if rating is not None else None
 money=cash(amount)
 exchange_ratings=[int(players.get(str(x.get('player_id')),{}).get('rating') or 0) for x in exchange]
 qualifies=(rating is not None and rating>=90) or any(r>=90 for r in exchange_ratings) or (money is not None and money>10000000)
 result=[item];pending=None
 if qualifies and ids:
  try:
   disclosure='Ricostruzione narrativa: i dialoghi non sono dichiarazioni reali.'
   paragraphs=[disclosure,text];coverage=[]
   for cid in ids:
    reporter=reporters[cid]['name'];boss=manager(snapshot,cid,day);buy=cid==str(row.get('to_sm_world_club_id'))
    role=p.get('position') or row.get('player_position')
    profile=(f' Nel Codex il ruolo è {role}.' if role else '')+(f' Il rating è {rating}.' if rating is not None else '')
    if exchange:
     incoming=name if buy else ', '.join(names);outgoing=', '.join(names) if buy else name
     question=f'Per {clubs[cid]["name"]} arrivano {incoming} e partono {outgoing}. Mister, come accompagniamo questo cambiamento?'
     answer=f'Il lavoro comprende entrambe le direzioni: inserire chi arriva e riorganizzarci dopo le partenze. Le scelte sul campo andranno valutate con il gruppo.'
    elif buy:
     question=f'È ufficiale l’arrivo di {name} da {fr}.'+profile+' Mister, come comincia il suo inserimento?'
     if money is not None and money>10000000:question=f'L’accordo per {name} è da {money_label(amount)}.'+profile+' Mister, come accompagnerà il suo ingresso nel gruppo?'
     answer=f'Con {name} cominciamo dal lavoro quotidiano: conoscenza dei compagni e dei nostri meccanismi. Sarà il campo a indicarci come inserirlo; oggi non assegniamo una maglia da titolare.'
    else:
     question=f'{name} proseguirà con {to}.'+profile+' Mister, come affrontate il lavoro dopo questa partenza?'
     answer=f'Salutiamo {name} e torniamo a concentrarci sul gruppo. Le soluzioni per le prossime partite vanno costruite in allenamento, valutando i giocatori a disposizione.'
    coverage.append({'club':clubs[cid]['name'],'reporter':reporter,'manager':boss,'question':question,'answer':answer})
    paragraphs += [f'{reporter} · Inviato {clubs[cid]["name"]}\n«{question}»',f'{boss} · Manager {clubs[cid]["name"]}\n«{answer}»']
   club={**item,'id':nid+'-club','category':'club','title':f'{name}: il punto dai due club' if len(ids)==2 else f'{name}: il punto con {coverage[0]["reporter"]} e {coverage[0]["manager"]}','text':'\n\n'.join(paragraphs),'coverage':coverage}
   result.append(club)
  except (ValueError,KeyError) as e:pending='Club News: '+str(e)
 elif not qualifies and (rating is None or money is None or exchange):
  pending='Club News threshold unresolved: rating or total transaction value not fully verified'
 return result,pending

def main():
 snap=json.loads((A/'runtime/snapshot.json').read_text());cfg=json.loads((A/'config.json').read_text());reporters=json.loads((A/'reporters.json').read_text())
 assert snap['world']=='GW001' and len({str(x['club_id']) for x in snap['clubs']})==40
 ledger_path=A/'ledger.json';ledger=json.loads(ledger_path.read_text()) if ledger_path.exists() else {}
 now=datetime.now(ZoneInfo('Europe/Rome')).isoformat(timespec='seconds');pending=[];created=[];seen={};conflicts=set()
 for row in snap['rows']:
  if not eligible(row,cfg):continue
  try:key=fingerprint(row)
  except ValueError as e:pending.append({'transfer':row.get('imc_transfer_number'),'reason':str(e)});continue
  # Reimported copies of the same operation cannot generate multiple posts.
  sig=json.dumps([row.get('amount_text'),row.get('normalized_exchange_players')],sort_keys=True)
  if key in seen and seen[key][0]!=sig:conflicts.add(key)
  seen[key]=(sig,row)
 for key,(_,row) in sorted(seen.items()):
  if key in conflicts:pending.append({'event':key,'reason':'Conflicting certified duplicates'});continue
  base=R/'items'/('gw001-market-'+key+'.json');club=R/'items'/('gw001-market-'+key+'-club.json')
  if base.exists() and ledger.get(key,{}).get('complete') and ledger.get(key,{}).get('media_complete') and ledger.get(key,{}).get('editorial_version')==2:continue
  try:
   items,reason=news(row,snap,reporters,now,media=True)
   ledger[key]={'editorial_version':2,'complete':not bool(reason),'media_complete':bool(items[0].get('image')) and all(t.get('logo') for t in items[0]['teams']),'transfer_number':row.get('imc_transfer_number'),'normalized_date':row['normalized_transfer_date']}
   if reason:pending.append({'event':key,'reason':reason})
   for item in items:
    path=R/'items'/(item['id']+'.json')
    if path.exists():
     previous=json.loads(path.read_text())
     if previous.get('editorial_version',1)<2:
      for field in ['title','text','transfer','coverage','editorial_version']:
       if field in item:previous[field]=item[field]
     if item.get('image'):previous['image']=item['image']
     for i,t in enumerate(item.get('teams',[])):
      if t.get('logo') and i<len(previous.get('teams',[])):previous['teams'][i]['logo']=t['logo']
     item=previous
     if json.loads(path.read_text())==item:continue
    path.write_text(json.dumps(item,ensure_ascii=False,indent=2)+'\n');created.append(item['id'])
  except Exception as e:pending.append({'event':key,'reason':str(e)[:250]})
 ledger_path.write_text(json.dumps(ledger,ensure_ascii=False,indent=2)+'\n')
 report={'checked_at':now,'source':snap['summary'],'eligible_operations':len(seen),'created':created,'pending':pending,'active_club_count':40}
 (A/'runtime/report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
 print(json.dumps(report,ensure_ascii=False))
 if os.environ.get('GITHUB_STEP_SUMMARY'):
  with open(os.environ['GITHUB_STEP_SUMMARY'],'a') as f:f.write('\n### RTH24 automatic market\n```json\n'+json.dumps(report,ensure_ascii=False,indent=2)+'\n```\n')
if __name__=='__main__':main()
