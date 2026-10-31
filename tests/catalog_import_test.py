"""Protect import identity checks and the existing catalog against partial feeds."""
import importlib.util
import json
from pathlib import Path
import unittest

MODULE = Path(__file__).resolve().parents[1] / "tools" / "import_catalog.py"


class CatalogImportTest(unittest.TestCase):
    def setUp(self):
        self.assertTrue(MODULE.exists(), "The public-widget importer is not implemented")
        spec = importlib.util.spec_from_file_location("catalog_import", MODULE)
        self.module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(self.module)

    def html(self, videos, handle="impressionking30"):
        state = {"source": {"data": {"/embed/@impressionking30": {
            "userInfo": {"uniqueId": handle, "privateAccount": False, "code": 200},
            "videoList": videos,
        }}}}
        return '<script id="__FRONTITY_CONNECT_STATE__">' + json.dumps(state) + '</script>'

    def test_partial_feed_adds_once_and_preserves_curated_records(self):
        # Dropping the existing merge or overwriting duplicates must break this.
        old = {"id": "7701609818364169502", "title": "Curated title", "categories": ["Music"]}
        feed = self.module.parse_widget(self.html([
            {"id": old["id"], "authorUniqueId": "impressionking30", "desc": "Changed"},
            {"id": "7700323765304954142", "authorUniqueId": "impressionking30", "desc": "DetroitBeatmaker #ChiptuneBeats"},
            {"id": "7700323765304954142", "authorUniqueId": "impressionking30", "desc": "Duplicate"},
        ]), "impressionking30")
        result, added = self.module.merge_catalog({"videos": [old]}, feed, "impressionking30", "2026-10-30")
        self.assertEqual(added, 1)
        self.assertEqual(result["videos"][0], old)
        self.assertEqual(result["videos"][1]["description"], "DetroitBeatmaker #ChiptuneBeats")
        self.assertEqual(result["videos"][1]["media_kind"], "music")
        self.assertFalse(result["complete_repertoire"])

    def test_rejects_another_author_in_the_feed(self):
        with self.assertRaises(ValueError):
            self.module.parse_widget(self.html([{"id": "7700323765304954142", "authorUniqueId": "someoneelse", "desc": "test"}]), "impressionking30")

    def test_empty_or_changed_source_cannot_replace_catalog(self):
        for html in ["<html>Verify to continue</html>", self.html([]), self.html([], "someoneelse")]:
            with self.subTest(html=html), self.assertRaises(ValueError):
                self.module.parse_widget(html, "impressionking30")

    def test_ambiguous_caption_stays_unclassified(self):
        result, _ = self.module.merge_catalog({"videos": []}, [{"id": "7699144307340561695", "desc": "AlbertWesker #ResidentEvil #Scream", "authorUniqueId": "impressionking30"}], "impressionking30", "2026-10-30")
        record = result["videos"][0]
        self.assertEqual(record["character"], "")
        self.assertEqual(record["franchise"], "")
        self.assertEqual(record["categories"], ["Uncategorized"])
        self.assertEqual(record["media_kind"], "unknown")
        self.assertEqual(record["title"], "AlbertWesker")


if __name__ == "__main__":
    unittest.main()
