"""שרת HTTP קטן — http.server מהספרייה הסטנדרטית, בלי תלות חיצונית.

הוא מגיש את הממשק מתוך web/ ומספק API קטן ב-JSON:

  GET  /api/health           מצב המערכת — תמיד simulation
  GET  /api/tasks            רשימת משימות
  POST /api/tasks            יצירת משימה  {title, description}
  GET  /api/tasks/<id>       משימה + צעדים + יומן
  POST /api/tasks/<id>/run   הרצת התהליך
  DELETE /api/tasks/<id>     מחיקת משימה

השרת מאזין ב-127.0.0.1 בלבד. אין אימות, אין משתמשים, ואין לחשוף
אותו לרשת.
"""

import json
import os
import re
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

from . import MODE, MODE_LABEL_HE, VERSION
from . import db, pipeline, providers

WEB_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "web")

_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
}

MAX_BODY = 256 * 1024


class Handler(BaseHTTPRequestHandler):
    server_version = "AgentLab/" + VERSION
    conn = None            # מוזרק ב-make_server
    lock = None            # נעילת כתיבה אחת לכל השרת

    # ------------------------------------------------------------- עזר

    def _send(self, code, body, ctype="application/json; charset=utf-8"):
        if isinstance(body, (dict, list)):
            body = json.dumps(body, ensure_ascii=False).encode("utf-8")
        elif isinstance(body, str):
            body = body.encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(body)

    def _err(self, code, message):
        self._send(code, {"ok": False, "error": message})

    def _body(self):
        n = int(self.headers.get("Content-Length") or 0)
        if n <= 0:
            return {}
        if n > MAX_BODY:
            raise ValueError("הבקשה גדולה מדי")
        raw = self.rfile.read(n)
        try:
            data = json.loads(raw.decode("utf-8"))
        except (ValueError, UnicodeDecodeError):
            raise ValueError("גוף הבקשה אינו JSON תקין")
        if not isinstance(data, dict):
            raise ValueError("גוף הבקשה חייב להיות אובייקט")
        return data

    def log_message(self, fmt, *args):
        # שורה אחת קצרה, ולא שתיים לכל בקשה.
        print("  %s %s" % (self.command, self.path))

    # ------------------------------------------------------------ ניתוב

    def do_GET(self):
        path = self.path.split("?", 1)[0]
        if path.startswith("/api/"):
            return self._api_get(path)
        return self._static(path)

    do_HEAD = do_GET

    def do_POST(self):
        path = self.path.split("?", 1)[0]
        if not path.startswith("/api/"):
            return self._err(404, "אין נתיב כזה")
        try:
            return self._api_post(path)
        except ValueError as e:
            return self._err(400, str(e))

    def do_DELETE(self):
        path = self.path.split("?", 1)[0]
        m = re.fullmatch(r"/api/tasks/(\d+)", path)
        if not m:
            return self._err(404, "אין נתיב כזה")
        with self.lock:
            if not db.get_task(self.conn, int(m.group(1))):
                return self._err(404, "אין משימה כזאת")
            db.delete_task(self.conn, int(m.group(1)))
        return self._send(200, {"ok": True})

    # -------------------------------------------------------------- API

    def _health(self):
        return {
            "ok": True,
            "mode": MODE,
            "simulation": True,
            "notice": MODE_LABEL_HE,
            "version": VERSION,
            "providers": providers.available(),
        }

    def _task_payload(self, task_id):
        task = db.get_task(self.conn, task_id)
        if not task:
            return None
        task["status_label"] = db.STATUS_LABELS.get(task["status"], task["status"])
        steps = db.list_steps(self.conn, task_id)
        for s in steps:
            s["phase_label"] = db.PHASE_LABELS.get(s["phase"], s["phase"])
            s["status_label"] = pipeline.STEP_LABELS.get(s["status"], s["status"])
        return {
            "ok": True,
            "simulation": True,
            "task": task,
            "steps": steps,
            "events": db.list_events(self.conn, task_id),
        }

    def _api_get(self, path):
        if path == "/api/health":
            return self._send(200, self._health())
        if path == "/api/tasks":
            rows = db.list_tasks(self.conn)
            for r in rows:
                r["status_label"] = db.STATUS_LABELS.get(r["status"], r["status"])
            return self._send(200, {"ok": True, "simulation": True, "tasks": rows})
        m = re.fullmatch(r"/api/tasks/(\d+)", path)
        if m:
            payload = self._task_payload(int(m.group(1)))
            if payload is None:
                return self._err(404, "אין משימה כזאת")
            return self._send(200, payload)
        return self._err(404, "אין נתיב כזה")

    def _api_post(self, path):
        if path == "/api/tasks":
            data = self._body()
            with self.lock:
                try:
                    task = db.create_task(self.conn, data.get("title", ""),
                                          data.get("description", ""))
                except ValueError as e:
                    return self._err(400, str(e))
            task["status_label"] = db.STATUS_LABELS[task["status"]]
            return self._send(201, {"ok": True, "simulation": True, "task": task})

        m = re.fullmatch(r"/api/tasks/(\d+)/run", path)
        if m:
            task_id = int(m.group(1))
            with self.lock:
                if not db.get_task(self.conn, task_id):
                    return self._err(404, "אין משימה כזאת")
                try:
                    summary = pipeline.run_task(self.conn, task_id)
                except ValueError as e:
                    return self._err(400, str(e))
                payload = self._task_payload(task_id)
            payload["summary"] = summary
            return self._send(200, payload)

        return self._err(404, "אין נתיב כזה")

    # ------------------------------------------------------ קבצים סטטיים

    def _static(self, path):
        if path == "/":
            path = "/index.html"
        rel = path.lstrip("/")
        full = os.path.normpath(os.path.join(WEB_DIR, rel))
        # מחוץ ל-web/ לא מגישים דבר.
        if not full.startswith(WEB_DIR + os.sep) or not os.path.isfile(full):
            return self._err(404, "לא נמצא")
        ext = os.path.splitext(full)[1].lower()
        with open(full, "rb") as fh:
            body = fh.read()
        return self._send(200, body, _TYPES.get(ext, "application/octet-stream"))


def make_server(conn, host="127.0.0.1", port=8123):
    handler = type("BoundHandler", (Handler,),
                   {"conn": conn, "lock": threading.Lock()})
    return ThreadingHTTPServer((host, port), handler)
