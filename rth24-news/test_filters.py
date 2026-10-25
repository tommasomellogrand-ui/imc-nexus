import unittest,json,tempfile
from pathlib import Path
from unittest.mock import patch
import build
class FilterTests(unittest.TestCase):
 def test_manual_aliases_and_both_sides(self):
  with tempfile.TemporaryDirectory() as tmp:
   root=Path(tmp);(root/'automation').mkdir();(root/'items').mkdir()
   clubs=[{'id':str(i),'name':'Club '+str(i),'logo':'club-'+str(i)+'.png','aliases':['Alias '+str(i)]} for i in range(1,41)]
   (root/'automation/clubs.json').write_text(json.dumps(clubs))
   items=[{'id':'manual-news','published_at':'2026-10-25T09:00:00+01:00','title':'Manual','text':'Unchanged','teams':[{'name':'Alias 1'}]}, {'id':'two-clubs','published_at':'2026-10-25T10:00:00+01:00','title':'Transfer','text':'Unchanged','club_ids':['1','2']}]
   for item in items:(root/'items'/(item['id']+'.json')).write_text(json.dumps(item))
   with patch.object(build,'R',root),patch.object(build,'prepare'):
    build.build()
    feed=json.loads((root/'dist/flash-news.json').read_text());self.assertEqual(len(feed['clubs']),40)
    self.assertEqual(feed['items'][0]['club_ids'],['1','2']);self.assertEqual(feed['items'][1]['club_ids'],['1']);self.assertEqual(feed['items'][1]['text'],'Unchanged')
    items[0]['club_ids']=['999'];(root/'items/manual-news.json').write_text(json.dumps(items[0]))
    with self.assertRaisesRegex(AssertionError,'Unknown active club ID'):build.build()
if __name__=='__main__':unittest.main()
