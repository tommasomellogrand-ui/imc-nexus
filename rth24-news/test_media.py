import io,tempfile,unittest,json
from pathlib import Path
from unittest.mock import patch
from PIL import Image
import media
class MediaTests(unittest.TestCase):
 def test_crest_uses_nexus_cache_without_external_download(self):
  buf=io.BytesIO();Image.new('RGB',(4,4)).save(buf,format='PNG');data=buf.getvalue()
  with patch.object(media,'download',return_value=data) as fetch:
   self.assertEqual(media.source_image({'source_url':'https://cdn.soccerwiki.org/images/logos/clubs/128.png'},'torino-v1.png','news-id'),data)
   fetch.assert_called_once_with(media.PUBLIC+'crest-cache-v1.php?id=128')
 def test_errors_identify_news_and_filename(self):
  with patch.object(media,'download',side_effect=ValueError('HTTP 503')):
   with self.assertRaisesRegex(ValueError,'news-id; image torino-v1.png'):
    media.source_image({'source_url':'https://cdn.soccerwiki.org/images/logos/clubs/128.png'},'torino-v1.png','news-id')
 def test_upload_waits_then_preserves_original(self):
  buf=io.BytesIO();Image.new('RGB',(4,4)).save(buf,format='JPEG');data=buf.getvalue()
  with tempfile.TemporaryDirectory() as d,patch.object(media,'ROOT',Path(d)):
   item={'image':{'file':'upload-v1.jpg','alt':'Test','upload_name':'IMG_1234 (1).jpeg'}}
   self.assertTrue(media.pending_upload(item))
   (Path(d)/'uploads').mkdir();(Path(d)/'uploads/IMG_1234 (1).jpeg').write_bytes(data)
   self.assertFalse(media.pending_upload(item))
   media.prepare([item])
   self.assertNotIn('upload_name',item['image'])
   self.assertEqual((Path(d)/'assets/upload-v1.jpg').read_bytes(),data)
 def test_upload_rejects_path_traversal(self):
  with self.assertRaises(ValueError):media.pending_upload({'image':{'upload_name':'../secret'}})
 def test_hosts(self):
  for url in ['http://localhost/a.jpg','https://127.0.0.1/a','https://example.com/a','https://cdn.soccerwiki.org.evil.test/a']:
   with self.assertRaises(ValueError):media.checked_url(url)
 def test_original_bytes_retained_and_expiry_independent(self):
  buf=io.BytesIO();Image.new('RGB',(4,4)).save(buf,format='JPEG');data=buf.getvalue()
  with tempfile.TemporaryDirectory() as d,patch.object(media,'ROOT',Path(d)):
   item={'image':{'file':'test-v1.jpg','alt':'Test','source_url':'https://cdn.soccerwiki.org/test.jpg'}}
   with patch.object(media,'download',side_effect=[b'{"items":[]}',data]):media.prepare([item])
   self.assertNotIn('source_url',item['image']);self.assertEqual((Path(d)/'assets/test-v1.jpg').read_bytes(),data)
   (Path(d)/'assets/test-v1.jpg').unlink()
   with patch.object(media,'download',side_effect=[json.dumps({'items':[item]}).encode(),data]) as fetch:
    media.prepare([item]);self.assertEqual(fetch.call_args.args[0],media.PUBLIC+'test-v1.jpg')
 def test_reject_html(self):
  with self.assertRaises(Exception):media.inspect(b'<html>error</html>','a.jpg')
if __name__=='__main__':unittest.main()

class PublicDownloadTest(unittest.TestCase):
 @unittest.skipUnless(__import__('os').environ.get('GITHUB_ACTIONS')=='true','Real network check runs on deployment runner')
 def test_real_download(self):
  data=media.download(media.PUBLIC+'riccardo-re-genoa-v1.jpg')
  self.assertEqual(data,(media.ROOT/'assets/riccardo-re-genoa-v1.jpg').read_bytes())
  media.inspect(data,'riccardo-re-genoa-v1.jpg')
