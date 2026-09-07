"""בדיקות התהליך מתכנן → מבצע → מבקר, ובדיקות הספק המדומה."""

import os
import socket
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from agentlab import db, pipeline, providers  # noqa: E402


def run(conn, title, desc="", seed=None):
    t = db.create_task(conn, title, desc, seed=seed)
    return t, pipeline.run_task(conn, t["id"])


class TestProvider(unittest.TestCase):

    def test_only_mock_exists(self):
        self.assertEqual(providers.available(), ["mock"])

    def test_any_other_provider_is_refused_loudly(self):
        for name in ("openai", "anthropic", "real", ""):
            with self.assertRaises(ValueError):
                providers.get_provider(name)

    def test_same_input_same_output(self):
        a = providers.get_provider("mock", seed=7)
        b = providers.get_provider("mock", seed=7)
        for role in (providers.ROLE_PLANNER, providers.ROLE_EXECUTOR,
                     providers.ROLE_REVIEWER):
            self.assertEqual(a.complete(role, "שאלה"), b.complete(role, "שאלה"))

    def test_seed_changes_the_output_somewhere(self):
        p = providers.get_provider("mock")
        outs = {p.complete(providers.ROLE_PLANNER, "אותה בקשה", s) for s in range(30)}
        self.assertGreater(len(outs), 1)

    def test_unknown_role_is_refused(self):
        with self.assertRaises(ValueError):
            providers.get_provider("mock").complete("manager", "x")


class TestPipeline(unittest.TestCase):

    def setUp(self):
        self.conn = db.connect(":memory:")

    def tearDown(self):
        self.conn.close()

    def test_three_phases_with_equal_step_counts(self):
        t, s = run(self.conn, "לארגן את החומר")
        counts = {}
        for ph in (db.PHASE_PLANNER, db.PHASE_EXECUTOR, db.PHASE_REVIEWER):
            counts[ph] = len(db.list_steps(self.conn, t["id"], ph))
        self.assertEqual(counts[db.PHASE_PLANNER], counts[db.PHASE_EXECUTOR])
        self.assertEqual(counts[db.PHASE_PLANNER], counts[db.PHASE_REVIEWER])
        self.assertEqual(counts[db.PHASE_PLANNER], s["planned"])

    def test_plan_size_stays_in_range(self):
        for i in range(40):
            t, s = run(self.conn, "משימה %d" % i)
            self.assertGreaterEqual(s["planned"], 3)
            self.assertLessEqual(s["planned"], 5)

    def test_final_status_matches_the_review(self):
        for i in range(40):
            t, s = run(self.conn, "משימה %d" % i)
            expect = db.STATUS_DONE if s["approved"] == s["planned"] else db.STATUS_FAILED
            self.assertEqual(s["status"], expect)
            self.assertEqual(db.get_task(self.conn, t["id"])["status"], expect)

    def test_same_seed_gives_the_same_run(self):
        def texts(seed):
            t, _ = run(self.conn, "משימה קבועה", "תיאור", seed=seed)
            return [(s["phase"], s["ordinal"], s["title"], s["content"], s["status"])
                    for s in db.list_steps(self.conn, t["id"])]
        self.assertEqual(texts(4242), texts(4242))

    def test_rework_round_happens_and_is_marked(self):
        """סבב התיקון חייב לקרות באמת, אחרת המבקר אינו מבקר דבר."""
        found = None
        for i in range(60):
            t, s = run(self.conn, "משימה %d" % i)
            if s["rework"]:
                found = (t, s)
                break
        self.assertIsNotNone(found, "לא נמצא ולו סבב תיקון אחד ב-60 משימות")
        t, s = found
        execs = db.list_steps(self.conn, t["id"], db.PHASE_EXECUTOR)
        marked = [e for e in execs if e["content"].startswith("סבב תיקון")]
        self.assertEqual(len(marked), s["rework"])
        kinds = [e["kind"] for e in db.list_events(self.conn, t["id"])]
        self.assertIn("rework", kinds)

    def test_rejected_step_survives_the_second_review(self):
        """צעד שנדחה גם בסבב השני מסומן rejected, והמשימה נכשלת."""
        seen = False
        for i in range(80):
            t, s = run(self.conn, "בדיקה %d" % i)
            revs = db.list_steps(self.conn, t["id"], db.PHASE_REVIEWER)
            bad = [r for r in revs if r["status"] == pipeline.STEP_REJECTED]
            if bad:
                seen = True
                self.assertEqual(s["status"], db.STATUS_FAILED)
                self.assertTrue(all("סבב התיקון" in r["content"] for r in bad))
                break
        self.assertTrue(seen, "לא נמצא צעד שנדחה פעמיים ב-80 משימות")

    def test_partial_execution_is_never_approved(self):
        for i in range(60):
            t, _ = run(self.conn, "חלקי %d" % i)
            execs = {e["ordinal"]: e for e in db.list_steps(self.conn, t["id"], db.PHASE_EXECUTOR)}
            for r in db.list_steps(self.conn, t["id"], db.PHASE_REVIEWER):
                if execs[r["ordinal"]]["status"] == pipeline.STEP_PARTIAL:
                    self.assertNotEqual(r["status"], pipeline.STEP_APPROVED)

    def test_rerun_does_not_duplicate_steps(self):
        t, s1 = run(self.conn, "משימה חוזרת")
        n1 = len(db.list_steps(self.conn, t["id"]))
        s2 = pipeline.run_task(self.conn, t["id"])
        n2 = len(db.list_steps(self.conn, t["id"]))
        self.assertEqual(n1, n2)
        self.assertEqual(s1, s2)

    def test_missing_task_is_refused(self):
        with self.assertRaises(LookupError):
            pipeline.run_task(self.conn, 9999)

    def test_events_tell_the_whole_story(self):
        t, _ = run(self.conn, "יומן")
        kinds = [e["kind"] for e in db.list_events(self.conn, t["id"])]
        for k in ("start", "plan", "execute", "review", "end"):
            self.assertIn(k, kinds)

    def test_runs_with_the_network_switched_off(self):
        """הוכחה שאין קריאת רשת: כל פתיחת socket מתפוצצת, והריצה עוברת."""
        real = socket.socket

        def boom(*a, **k):
            raise AssertionError("התהליך ניסה לפתוח socket — זה אמור להיות מצב הדמיה")

        socket.socket = boom
        try:
            t, s = run(self.conn, "בלי רשת בכלל", "אין אינטרנט")
            self.assertIn(s["status"], (db.STATUS_DONE, db.STATUS_FAILED))
            self.assertTrue(s["simulation"])
        finally:
            socket.socket = real


if __name__ == "__main__":
    unittest.main()
