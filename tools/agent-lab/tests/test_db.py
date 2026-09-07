"""בדיקות שכבת ה-SQLite."""

import os
import sys
import tempfile
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from agentlab import db  # noqa: E402


class TestDb(unittest.TestCase):

    def setUp(self):
        self.conn = db.connect(":memory:")

    def tearDown(self):
        self.conn.close()

    def test_schema_creates_three_tables(self):
        rows = self.conn.execute(
            "SELECT name FROM sqlite_master WHERE type='table'").fetchall()
        names = {r["name"] for r in rows}
        self.assertTrue({"tasks", "steps", "events"} <= names, names)

    def test_create_and_read_back(self):
        t = db.create_task(self.conn, "לבדוק שמירה", "תיאור קצר")
        self.assertEqual(t["status"], db.STATUS_NEW)
        again = db.get_task(self.conn, t["id"])
        self.assertEqual(again["title"], "לבדוק שמירה")
        self.assertEqual(again["description"], "תיאור קצר")

    def test_empty_title_rejected(self):
        with self.assertRaises(ValueError):
            db.create_task(self.conn, "   ")

    def test_seed_is_stable_across_processes(self):
        # לא hash() — הוא מומלח מחדש בכל ריצת פייתון.
        self.assertEqual(db.stable_seed("אבג"), db.stable_seed("אבג"))
        self.assertNotEqual(db.stable_seed("אבג"), db.stable_seed("אבד"))

    def test_status_labels_are_hebrew(self):
        t = db.create_task(self.conn, "משימה")
        db.set_status(self.conn, t["id"], db.STATUS_DONE)
        self.assertEqual(db.get_task(self.conn, t["id"])["status"], "done")
        self.assertEqual(db.STATUS_LABELS["done"], "הושלמה")

    def test_unknown_status_rejected(self):
        t = db.create_task(self.conn, "משימה")
        with self.assertRaises(ValueError):
            db.set_status(self.conn, t["id"], "בערך")

    def test_steps_and_events_cascade_on_delete(self):
        t = db.create_task(self.conn, "משימה")
        db.add_step(self.conn, t["id"], db.PHASE_PLANNER, 1, "צעד")
        db.add_event(self.conn, t["id"], "start", "התחלה")
        db.delete_task(self.conn, t["id"])
        self.assertEqual(db.list_steps(self.conn, t["id"]), [])
        self.assertEqual(db.list_events(self.conn, t["id"]), [])

    def test_list_is_newest_first(self):
        a = db.create_task(self.conn, "ראשונה")
        b = db.create_task(self.conn, "שנייה")
        ids = [t["id"] for t in db.list_tasks(self.conn)]
        self.assertEqual(ids[:2], [b["id"], a["id"]])

    def test_survives_a_real_file(self):
        # SQLite על הדיסק, ולא רק בזיכרון — זה מה שהמשתמש יריץ.
        with tempfile.TemporaryDirectory() as d:
            path = os.path.join(d, "sub", "lab.db")
            c1 = db.connect(path)
            t = db.create_task(c1, "נשמר לדיסק")
            c1.close()
            c2 = db.connect(path)
            self.assertEqual(db.get_task(c2, t["id"])["title"], "נשמר לדיסק")
            c2.close()


if __name__ == "__main__":
    unittest.main()
