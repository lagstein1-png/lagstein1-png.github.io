"""בדיקות ה-API. שרת אמיתי על פורט מקומי, בקשות HTTP אמיתיות."""

import json
import os
import sys
import threading
import unittest
import urllib.error
import urllib.request

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from agentlab import db, server  # noqa: E402


class TestApi(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.conn = db.connect(":memory:")
        cls.httpd = server.make_server(cls.conn, "127.0.0.1", 0)
        cls.base = "http://127.0.0.1:%d" % cls.httpd.server_address[1]
        cls.thread = threading.Thread(target=cls.httpd.serve_forever, daemon=True)
        cls.thread.start()

    @classmethod
    def tearDownClass(cls):
        cls.httpd.shutdown()
        cls.httpd.server_close()
        cls.thread.join(timeout=5)
        cls.conn.close()

    def call(self, method, path, body=None):
        data = json.dumps(body).encode("utf-8") if body is not None else None
        req = urllib.request.Request(self.base + path, data=data, method=method)
        if data:
            req.add_header("Content-Type", "application/json")
        try:
            with urllib.request.urlopen(req, timeout=10) as r:
                return r.status, json.loads(r.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            raw = e.read().decode("utf-8")
            try:
                return e.code, json.loads(raw)
            except ValueError:
                return e.code, {"raw": raw}

    # ------------------------------------------------------------ בריאות

    def test_health_declares_simulation(self):
        code, j = self.call("GET", "/api/health")
        self.assertEqual(code, 200)
        self.assertEqual(j["mode"], "simulation")
        self.assertTrue(j["simulation"])
        self.assertEqual(j["providers"], ["mock"])
        self.assertIn("הדמיה", j["notice"])

    # -------------------------------------------------------------- CRUD

    def test_create_then_read_then_run(self):
        code, j = self.call("POST", "/api/tasks",
                            {"title": "משימת בדיקה", "description": "תיאור"})
        self.assertEqual(code, 201)
        tid = j["task"]["id"]
        self.assertEqual(j["task"]["status"], "new")
        self.assertEqual(j["task"]["status_label"], "חדשה")

        code, j = self.call("GET", "/api/tasks/%d" % tid)
        self.assertEqual(code, 200)
        self.assertEqual(j["steps"], [])

        code, j = self.call("POST", "/api/tasks/%d/run" % tid)
        self.assertEqual(code, 200)
        self.assertIn(j["task"]["status"], ("done", "failed"))
        self.assertTrue(j["steps"])
        self.assertTrue(j["summary"]["simulation"])
        phases = {s["phase"] for s in j["steps"]}
        self.assertEqual(phases, {"planner", "executor", "reviewer"})
        # התוויות בעברית מגיעות מהשרת, ולא מהדפדפן.
        self.assertTrue(all(s["phase_label"] in ("מתכנן", "מבצע", "מבקר")
                            for s in j["steps"]))

    def test_list_contains_what_was_created(self):
        code, j = self.call("POST", "/api/tasks", {"title": "ברשימה"})
        tid = j["task"]["id"]
        code, j = self.call("GET", "/api/tasks")
        self.assertEqual(code, 200)
        self.assertIn(tid, [t["id"] for t in j["tasks"]])

    def test_delete_removes_it(self):
        _, j = self.call("POST", "/api/tasks", {"title": "למחיקה"})
        tid = j["task"]["id"]
        code, _ = self.call("DELETE", "/api/tasks/%d" % tid)
        self.assertEqual(code, 200)
        code, _ = self.call("GET", "/api/tasks/%d" % tid)
        self.assertEqual(code, 404)

    # ------------------------------------------------------------ שגיאות

    def test_empty_title_is_400_in_hebrew(self):
        code, j = self.call("POST", "/api/tasks", {"title": "  "})
        self.assertEqual(code, 400)
        self.assertFalse(j["ok"])
        self.assertIn("כותרת", j["error"])

    def test_missing_task_is_404(self):
        code, _ = self.call("GET", "/api/tasks/999999")
        self.assertEqual(code, 404)
        code, _ = self.call("POST", "/api/tasks/999999/run")
        self.assertEqual(code, 404)

    def test_unknown_api_path_is_404(self):
        code, _ = self.call("GET", "/api/nope")
        self.assertEqual(code, 404)

    def test_broken_json_is_400(self):
        req = urllib.request.Request(self.base + "/api/tasks", data=b"{nope",
                                     method="POST")
        req.add_header("Content-Type", "application/json")
        try:
            urllib.request.urlopen(req, timeout=10)
            self.fail("היה צריך להיכשל")
        except urllib.error.HTTPError as e:
            self.assertEqual(e.code, 400)

    # ------------------------------------------------------- קבצים ובטיחות

    def test_root_serves_the_rtl_page_with_the_simulation_banner(self):
        with urllib.request.urlopen(self.base + "/", timeout=10) as r:
            html = r.read().decode("utf-8")
            self.assertIn("text/html", r.headers["Content-Type"])
        self.assertIn('dir="rtl"', html)
        self.assertIn('lang="he"', html)
        self.assertIn("מצב הדמיה — ללא חיבור אמיתי למודלים", html)

    def test_no_escape_from_the_web_directory(self):
        for path in ("/../run.py", "/..%2frun.py", "/../agentlab/db.py"):
            req = urllib.request.Request(self.base + path)
            try:
                with urllib.request.urlopen(req, timeout=10) as r:
                    body = r.read().decode("utf-8", "replace")
                    self.assertNotIn("import sqlite3", body)
            except urllib.error.HTTPError as e:
                self.assertIn(e.code, (400, 404))


if __name__ == "__main__":
    unittest.main()
