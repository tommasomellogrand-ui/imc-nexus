import unittest,copy
from unittest.mock import patch
from generate import eligible,fingerprint,news,cash
class GenerateTests(unittest.TestCase):
 def setUp(self):
  self.r={'player_id':1,'player_name':'Test Player','club_from':'Away','club_to':'Home','from_sm_world_club_id':10,'to_sm_world_club_id':20,'normalization_status':'CERTIFIED','normalized_transfer_date':'2026-10-25','imported_at':'2026-10-25 08:00:00','amount_text':'10M','player_rating':89,'normalized_exchange_players':[]}
  self.s={'players':{},'clubs':[{'club_id':10,'name':'Away'},{'club_id':20,'name':'Home'}],'managers':[{'team_id':10,'full_name':'Manager A','start_date':'2026-01-01','end_date':None},{'team_id':20,'full_name':'Manager B','start_date':'2026-01-01','end_date':None}]}
  self.reporters={'10':{'name':'Reporter A'},'20':{'name':'Reporter B'}}
 def make(self):return news(self.r,self.s,self.reporters,'2026-10-25T10:00:00+01:00',False)
 def test_missing_image_does_not_block(self):
  with patch('generate.asset',side_effect=ValueError('unavailable')):
   items,_=news(self.r,self.s,self.reporters,'2026-10-25T10:00:00+01:00',True)
  self.assertEqual(len(items),1);self.assertNotIn('image',items[0]);self.assertEqual([t['name'] for t in items[0]['teams']],['Home','Away'])
 def test_boundaries(self):
  self.assertEqual(len(self.make()[0]),1)
  self.r['amount_text']='10.001M';self.assertEqual(len(self.make()[0]),2)
  self.r['amount_text']='1M';self.r['player_rating']=90;self.assertEqual(len(self.make()[0]),2)
 def test_two_sides_exchange(self):
  self.r.update(amount_text='2M + Other Player',normalized_exchange_players=[{'player_id':2,'player_name':'Other Player'}]);self.s['players']['2']={'rating':91}
  items,_=self.make();self.assertEqual(len(items),2);t=items[1]['text'];self.assertIn('Reporter A',t);self.assertIn('Reporter B',t);self.assertIn('Manager A',t);self.assertIn('Manager B',t);self.assertEqual(t.count('Ricostruzione narrativa'),1);self.assertEqual(items[0]['club_ids'],['20','10'])
 def test_no_invented_manager(self):
  self.r['player_rating']=90;self.s['managers']=[];items,pending=self.make();self.assertEqual(len(items),1);self.assertTrue(pending)
 def test_only_active_clubs(self):
  self.s['clubs']=self.s['clubs'][:1];self.assertEqual(self.make()[0][0]['club_ids'],['10'])
 def test_waits_for_certification_and_ignores_history(self):
  cfg={'baseline_imported_at':'2026-10-22 08:06:30','baseline_transfer_date':'2026-10-21'}
  self.assertTrue(eligible(self.r,cfg));self.r['normalization_status']='PENDING';self.assertFalse(eligible(self.r,cfg));self.r['normalization_status']='CERTIFIED';self.r['normalized_transfer_date']='2026-09-20';self.assertFalse(eligible(self.r,cfg))
 def test_identity_survives_reimport_and_renumbering(self):
  k=fingerprint(self.r);self.r.update(imported_at='2026-10-26',imc_transfer_number=999);self.assertEqual(k,fingerprint(self.r))
 def test_cash_only_not_guessed_exchange_value(self):
  self.assertEqual(cash('7,529M'),7529000);self.assertEqual(cash('2M + Other Player'),2000000);self.assertIsNone(cash('Scambio'))
if __name__=='__main__':unittest.main()
