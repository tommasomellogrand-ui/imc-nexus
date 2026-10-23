"""Capture verified Nexus schedules and generate future league calendar editions."""
import json, subprocess, concurrent.futures, datetime, copy
from pathlib import Path
ROOT = Path(__file__).parent
BASE = 'https://www.italianmastersclub.it/nexus/'
old = json.loads((ROOT/'evidence/2026-10-22-coffee.json').read_text())
assign = {r['club_id']:r for r in old['assignments']['items']}
confirmations = json.loads((ROOT/'reporter-confirmations.json').read_text())
assert confirmations['world'] == old['world']
def assignments_on(date):
    assignments = copy.deepcopy(old['assignments'])
    if date >= confirmations['effective_from']:
        by_club = {r['club_id']: r for r in assignments['items']}
        for item in confirmations['items']:
            reporter = by_club[item['club_id']]
            assert reporter['name'] == item['name'], 'Reporter assignment changed'
            reporter.update(status='confirmed', label='Assegnazione confermata')
        assignments['effective_from'] = confirmations['effective_from']
    return assignments
def fetch(url):
    return json.loads(subprocess.check_output(['curl','--retry','2','--max-time','45','-fsSL',url]))
def club(cid):
    d=fetch(BASE+f'teams/matches.php?world=GW001&sm_club={cid}')
    assert d['ok']
    return cid,d
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    schedules=dict(pool.map(club, assign))
(ROOT/'evidence/schedules.json').write_text(json.dumps(schedules,ensure_ascii=False))
days=fetch(BASE+'matchday/data.php?world=GW001&season=2&day=9')['days']
days=[d for d in days if d['date']>'2026-10-22']
manifest=[]
for day in days:
    url=BASE+f"matchday/data.php?world=GW001&season=2&day={day['number']}"
    raw=fetch(url)
    assert raw['ok'] and raw['date']==day['date'] and len(raw['divisions'])==4
    edition={k:old[k] for k in ['world','season','cast','portraits','assignments','reporter_portraits']}
    edition['assignments'] = assignments_on(raw['date'])
    edition_assign = {r['club_id']: r for r in edition['assignments']['items']}
    edition.update(date=raw['date'],day=raw['day'],title='Coffee Time · Il prossimo turno',mode='schedule-preview',source=url,
        checked_at=datetime.datetime.now(datetime.timezone.utc).isoformat(),
        opening=[f"Benvenuti a Coffee Time. Prepariamo la giornata {raw['day']}: venti partite nelle quattro divisioni di GW001. Questo è il programma del {raw['date']}, ricavato dalle Schedule Nexus.",
        'Partiamo dagli abbinamenti, con le squadre di casa e quelle in trasferta. L’analisi tecnica del turno richiede dati aggiornati: non anticipiamo classifiche, formazioni o risultati futuri.',
        'Seguiamo ogni incontro con gli inviati già assegnati ai club. Qui trovate l’agenda del turno; eventuali variazioni successive del calendario richiederanno un aggiornamento.'],divisions=[])
    for division in raw['divisions']:
        out={'name':division['name'],'fixtures':[]}
        for f in division['fixtures']:
            assert f['match_date']==raw['date'] and '|DOMESTIC|league|' in f['competition_key']
            cid=f['home_sm_club_id']; aid=f['away_sm_club_id']
            matches=[m for m in schedules[cid]['schedule'] if m['sm_fixture_id']==f['sm_fixture_id']]
            assert len(matches)==1
            m=matches[0]
            assert m['match_date']==raw['date'] and m['home_sm_team_id']==cid and m['away_sm_team_id']==aid and m['imc_season']==2
            away=[x for x in schedules[aid]['schedule'] if x['sm_fixture_id']==f['sm_fixture_id']]
            assert len(away)==1 and away[0]['match_date']==m['match_date'] and away[0]['match_time']==m['match_time']
            item={'id':f['sm_fixture_id'],'competition_key':f['competition_key'],'date':raw['date'],
                'time':(m.get('match_time') or '')[:5] or 'Da confermare',
                'source':BASE+f'teams/matches.php?world=GW001&sm_club={cid}', 'reporters':[]}
            for side,clubid in [('home',cid),('away',aid)]:
                item[side]=f[side+'_name'];item[side+'_logo']=f[side+'_logo_url']
                item[side+'_table']={'id':clubid,'name':f[side+'_name']}
                item['reporters'].append(dict(edition_assign[clubid],side=side))
            out['fixtures'].append(item)
        assert len(out['fixtures'])==5
        edition['divisions'].append(out)
    for key in ['opening','portraits','cast','reporter_portraits']: edition.pop(key,None)
    name=raw['date']+'-coffee.json'
    (ROOT/name).write_text(json.dumps(edition,ensure_ascii=False,indent=2)+'\n')
    manifest.append({'date':raw['date'],'day':raw['day'],'file':name,'matches':20})
    print(raw['date'],raw['day'],'20 fixtures verified on both club schedules',flush=True)
(ROOT/'coffee-editions.json').write_text(json.dumps({'world':'GW001','editions':manifest},indent=2)+'\n')
