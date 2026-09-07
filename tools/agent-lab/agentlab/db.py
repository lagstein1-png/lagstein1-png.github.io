"""שכבת ה-SQLite. ספרייה סטנדרטית בלבד — sqlite3 שמגיע עם פייתון.

שלוש טבלאות:
  tasks  — המשימה שהמשתמש יצר, והסטטוס שלה
  steps  — צעד אחד של שלב אחד (מתכנן / מבצע / מבקר)
  events — יומן קריא בעברית: מה קרה ומתי

הזמנים נשמרים כמחרוזת ISO ב-UTC, כדי שהמיון יהיה לקסיקוגרפי
וכדי שלא נסמוך על אזור הזמן של מחשב המשתמש.
"""

import os
import sqlite3
from datetime import datetime, timezone

# --- סטטוסים של משימה. המפתח נשמר באנגלית, התווית מוצגת בעברית. ---
STATUS_NEW = "new"
STATUS_RUNNING = "running"
STATUS_DONE = "done"
STATUS_FAILED = "failed"

STATUS_LABELS = {
    STATUS_NEW: "חדשה",
    STATUS_RUNNING: "בריצה",
    STATUS_DONE: "הושלמה",
    STATUS_FAILED: "נכשלה",
}

# --- שלבי התהליך ---
PHASE_PLANNER = "planner"
PHASE_EXECUTOR = "executor"
PHASE_REVIEWER = "reviewer"

PHASE_LABELS = {
    PHASE_PLANNER: "מתכנן",
    PHASE_EXECUTOR: "מבצע",
    PHASE_REVIEWER: "מבקר",
}

SCHEMA = """
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS tasks (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT    NOT NULL,
  description TEXT    NOT NULL DEFAULT '',
  status      TEXT    NOT NULL DEFAULT 'new',
  seed        INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT    NOT NULL,
  updated_at  TEXT    NOT NULL
);

CREATE TABLE IF NOT EXISTS steps (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id    INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  phase      TEXT    NOT NULL,
  ordinal    INTEGER NOT NULL,
  title      TEXT    NOT NULL,
  content    TEXT    NOT NULL DEFAULT '',
  status     TEXT    NOT NULL DEFAULT 'pending',
  created_at TEXT    NOT NULL
);

CREATE INDEX IF NOT EXISTS steps_task ON steps(task_id, phase, ordinal);

CREATE TABLE IF NOT EXISTS events (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id    INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  kind       TEXT    NOT NULL,
  message    TEXT    NOT NULL,
  created_at TEXT    NOT NULL
);

CREATE INDEX IF NOT EXISTS events_task ON events(task_id, id);
"""


def now_iso():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def connect(path):
    """פותח חיבור ומוודא שהסכימה קיימת.

    check_same_thread=False מפני שהשרת הוא ThreadingHTTPServer; כל
    הכתיבות עוברות דרך נעילה אחת ב-server.py.
    """
    if path != ":memory:":
        parent = os.path.dirname(os.path.abspath(path))
        if parent:
            os.makedirs(parent, exist_ok=True)
    conn = sqlite3.connect(path, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    conn.executescript(SCHEMA)
    conn.commit()
    return conn


# --------------------------------------------------------------- משימות

def create_task(conn, title, description="", seed=None):
    """יוצר משימה חדשה ומחזיר אותה כמילון.

    כותרת ריקה נדחית כאן ולא רק בממשק — הממשק אינו הגנה.
    """
    title = (title or "").strip()
    if not title:
        raise ValueError("כותרת המשימה אינה יכולה להיות ריקה")
    description = (description or "").strip()
    ts = now_iso()
    if seed is None:
        # זרע יציב שנגזר מהתוכן, כדי שאותה משימה תיתן אותה הדמיה.
        seed = stable_seed(title + "\n" + description)
    cur = conn.execute(
        "INSERT INTO tasks (title, description, status, seed, created_at, updated_at)"
        " VALUES (?,?,?,?,?,?)",
        (title, description, STATUS_NEW, int(seed), ts, ts),
    )
    conn.commit()
    return get_task(conn, cur.lastrowid)


def stable_seed(text):
    """זרע דטרמיניסטי מתוך טקסט. לא hash() — הוא מומלח בין ריצות."""
    import hashlib
    return int(hashlib.sha256(text.encode("utf-8")).hexdigest()[:8], 16)


def get_task(conn, task_id):
    row = conn.execute("SELECT * FROM tasks WHERE id = ?", (task_id,)).fetchone()
    return dict(row) if row else None


def list_tasks(conn, limit=200):
    rows = conn.execute(
        "SELECT * FROM tasks ORDER BY id DESC LIMIT ?", (limit,)
    ).fetchall()
    return [dict(r) for r in rows]


def set_status(conn, task_id, status):
    if status not in STATUS_LABELS:
        raise ValueError("סטטוס לא מוכר: %s" % status)
    conn.execute(
        "UPDATE tasks SET status = ?, updated_at = ? WHERE id = ?",
        (status, now_iso(), task_id),
    )
    conn.commit()


def delete_task(conn, task_id):
    conn.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
    conn.commit()


# ----------------------------------------------------------------- צעדים

def add_step(conn, task_id, phase, ordinal, title, content="", status="pending"):
    if phase not in PHASE_LABELS:
        raise ValueError("שלב לא מוכר: %s" % phase)
    cur = conn.execute(
        "INSERT INTO steps (task_id, phase, ordinal, title, content, status, created_at)"
        " VALUES (?,?,?,?,?,?,?)",
        (task_id, phase, int(ordinal), title, content, status, now_iso()),
    )
    conn.commit()
    return cur.lastrowid


def update_step(conn, step_id, content=None, status=None):
    sets, args = [], []
    if content is not None:
        sets.append("content = ?")
        args.append(content)
    if status is not None:
        sets.append("status = ?")
        args.append(status)
    if not sets:
        return
    args.append(step_id)
    conn.execute("UPDATE steps SET %s WHERE id = ?" % ", ".join(sets), args)
    conn.commit()


def list_steps(conn, task_id, phase=None):
    if phase:
        rows = conn.execute(
            "SELECT * FROM steps WHERE task_id = ? AND phase = ? ORDER BY ordinal, id",
            (task_id, phase),
        ).fetchall()
    else:
        rows = conn.execute(
            "SELECT * FROM steps WHERE task_id = ? ORDER BY id", (task_id,)
        ).fetchall()
    return [dict(r) for r in rows]


def clear_steps(conn, task_id):
    """ריצה חוזרת מתחילה מדף חלק, אחרת הצעדים מצטברים כפול."""
    conn.execute("DELETE FROM steps WHERE task_id = ?", (task_id,))
    conn.execute("DELETE FROM events WHERE task_id = ?", (task_id,))
    conn.commit()


# ------------------------------------------------------------------ יומן

def add_event(conn, task_id, kind, message):
    conn.execute(
        "INSERT INTO events (task_id, kind, message, created_at) VALUES (?,?,?,?)",
        (task_id, kind, message, now_iso()),
    )
    conn.commit()


def list_events(conn, task_id):
    rows = conn.execute(
        "SELECT * FROM events WHERE task_id = ? ORDER BY id", (task_id,)
    ).fetchall()
    return [dict(r) for r in rows]
