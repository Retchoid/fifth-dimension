import unittest,tempfile,struct,sqlite3
from pathlib import Path
from unittest.mock import patch
import inventory as inv

class InventoryTests(unittest.TestCase):
 def test_unknown_cached_and_changed_features_invalidated(self):
  with tempfile.TemporaryDirectory() as td:
   root=Path(td); p=root/'x.mp3';p.write_bytes(b'first');c=inv.connect(':memory:')
   with patch.object(inv,'duration_of',return_value=(None,None)) as duration:
    inv.scan(c,[root],log=lambda *a:None);inv.scan(c,[root],log=lambda *a:None)
    self.assertEqual(1,duration.call_count)
   self.assertEqual('unknown_duration',c.execute('SELECT status FROM tracks').fetchone()[0])
   c.execute("INSERT INTO features VALUES(1,'centroid_hz',100,'measured','test',1)")
   p.write_bytes(b'changed-longer')
   inv.scan(c,[root],log=lambda *a:None)
   self.assertEqual(0,c.execute('SELECT COUNT(*) FROM features').fetchone()[0])
 def test_malformed_crate_and_external_paths(self):
  with self.assertRaises(ValueError):list(inv._chunks(b'otrk'+struct.pack('>I',99)+b'x'))
  with self.assertRaises(ValueError):list(inv._chunks(b'abc'))
  self.assertEqual(Path('/Volumes/23/Music/x.mp3'),inv.crate_track_path('/Volumes/23','/Music/x.mp3'))
  with self.assertRaises(ValueError):inv.crate_track_path('/Volumes/23','../x.mp3')
 def test_tied_scores_midpoint_and_missing_excluded(self):
  c=inv.connect(':memory:')
  for tid in range(1,22):
   c.execute('INSERT INTO tracks(id,path,status,missing) VALUES(?,?,?,?)',(tid,str(tid),'eligible',int(tid==21)))
   for feature,_ in inv.PROXY.values():c.execute('INSERT INTO features VALUES(?,?,?,?,?,?)',(tid,feature,1,'measured','test',1))
  scores=inv.library_scores(c)
  self.assertEqual(20,len(scores));self.assertTrue(all(v==5 for sc in scores.values() for v in sc.values()))
 def test_failed_walk_preserves_missing_flags(self):
  with tempfile.TemporaryDirectory() as td:
   c=inv.connect(':memory:');c.execute("INSERT INTO tracks(path,status,last_seen) VALUES(?,'eligible',0)",(td+'/hidden/x.mp3',))
   def walk(*args,**kwargs):kwargs['onerror'](PermissionError('denied'));return iter([])
   with patch.object(inv.os,'walk',side_effect=walk):inv.scan(c,[td],log=lambda *a:None)
   self.assertEqual(0,c.execute('SELECT missing FROM tracks').fetchone()[0])
 def test_future_schema_rejected(self):
  with tempfile.TemporaryDirectory() as td:
   path=Path(td)/'future.db'
   with sqlite3.connect(path) as c:c.execute('PRAGMA user_version=999')
   with self.assertRaises(ValueError):inv.connect(path)

if __name__=='__main__':unittest.main()
