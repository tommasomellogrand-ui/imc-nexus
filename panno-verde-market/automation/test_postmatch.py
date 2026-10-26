import unittest,copy
from postmatch import evidence,interview,FIXED
from generate import manager_record
class PostMatchTests(unittest.TestCase):
 def setUp(self):
  self.m={'sm_action':'league','result_status':'COMPLETED','home_sm_club_id':1,'away_sm_club_id':2,'home_score':1,'away_score':0,'players_json':[{'team_side':s,'starter':1,'player_name':'Player '+str(i),'sm_player_id':i+(0 if s=='home' else 20),'rating':7,'goals':int(s=='home' and i==1)} for s in ['home','away'] for i in range(1,12)],'events_json':[],'team_stats_json':{'home':{'sm_team_id':1,'possession':50,'total_shots':10,'shots_on_target':4,'corners':3,'red_cards':0},'away':{'sm_team_id':2,'possession':50,'total_shots':9,'shots_on_target':2,'corners':2,'red_cards':0},'scorers':[{'minute':86,'team_side':'home','player_name':'Player One','sm_player_id':1}]}}
 def test_two_distinct_perspectives_and_five_answers(self):
  home=interview(self.m,'home');away=interview(self.m,'away')
  for qa in [home,away]:self.assertEqual(len(qa),5);self.assertEqual([q['question'] for q in qa[:2]],FIXED)
  self.assertIn('vittoria',home[2]['answer']);self.assertIn('sconfitta',away[2]['answer']);self.assertNotEqual(home,away)
 def test_incomplete_report_is_held(self):
  self.m['team_stats_json']['scorers']=[]
  with self.assertRaises(ValueError):evidence(self.m)
 def test_corrected_report_changes_answers(self):
  before=interview(self.m,'home');self.m['team_stats_json']['home']['shots_on_target']=7
  self.assertNotEqual(before[4],interview(self.m,'home')[4])
 def test_historical_assignment(self):
  snap={'managers':[{'team_id':1,'manager_id':'MNG001','full_name':'Old','start_date':'2026-01-01','end_date':'2026-10-25'},{'team_id':1,'manager_id':'MNG002','full_name':'New','start_date':'2026-10-26','end_date':None}]}
  self.assertEqual(manager_record(snap,'1','2026-10-25')['manager_id'],'MNG001')
  snap['managers'][1]['start_date']='2026-10-25'
  with self.assertRaises(ValueError):manager_record(snap,'1','2026-10-25')
if __name__=='__main__':unittest.main()
