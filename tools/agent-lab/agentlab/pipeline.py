"""התהליך: מתכנן → מבצע → מבקר.

שלושה תפקידים, ריצה אחת:

  1. **מתכנן** קורא את המשימה ומפרק אותה לשלושה עד חמישה צעדים.
  2. **מבצע** מבצע כל צעד ומחזיר פלט.
  3. **מבקר** קורא כל פלט ומחליט: אושר, או חוזר לביצוע.

צעד שנדחה חוזר למבצע **פעם אחת** (סבב תיקון), ואז המבקר מכריע
סופית. משימה שכל צעדיה אושרו — הושלמה; אחרת נכשלה.

הכול נגזר מהזרע של המשימה, ולכן ריצה חוזרת על אותה משימה נותנת
בדיוק אותה תוצאה. אין כאן קריאת רשת ואין ספק אמיתי.
"""

from . import db
from .providers import ROLE_EXECUTOR, ROLE_PLANNER, ROLE_REVIEWER, get_provider

# --- סטטוסים של צעד ---
STEP_PLANNED = "planned"
STEP_DONE = "done"
STEP_PARTIAL = "partial"
STEP_APPROVED = "approved"
STEP_REWORK = "rework"
STEP_REJECTED = "rejected"

STEP_LABELS = {
    STEP_PLANNED: "מתוכנן",
    STEP_DONE: "בוצע",
    STEP_PARTIAL: "בוצע חלקית",
    STEP_APPROVED: "אושר",
    STEP_REWORK: "חזר לתיקון",
    STEP_REJECTED: "נדחה",
}

_PARTIAL_MARK = "חלקית"
_REVIEW_FAIL = "אינו מכסה"

# היסט הזרע של סבב התיקון. מספר קבוע, כדי שגם הסבב השני יהיה דטרמיניסטי.
REWORK_OFFSET = 1000


def _prompt_of(task):
    d = (task.get("description") or "").strip()
    return task["title"] if not d else task["title"] + "\n" + d


def plan(provider, task):
    """מחזיר רשימת צעדים מתוכננים. אינו נוגע בבסיס הנתונים."""
    prompt = _prompt_of(task)
    seed = int(task["seed"])
    n = provider.plan_size(prompt, seed)
    steps = []
    for i in range(n):
        verb = provider.complete(ROLE_PLANNER, "%s#%d" % (prompt, i), seed + i)
        steps.append({
            "ordinal": i + 1,
            "title": "%s: %s" % (verb, task["title"]),
            "content": "צעד %d מתוך %d, נגזר מתיאור המשימה." % (i + 1, n),
        })
    return steps


def execute_one(provider, task, step, seed_offset=0):
    """מבצע צעד אחד ומחזיר (פלט, סטטוס)."""
    seed = int(task["seed"]) + step["ordinal"] + seed_offset
    note = provider.complete(ROLE_EXECUTOR, step["title"], seed)
    status = STEP_PARTIAL if _PARTIAL_MARK in note else STEP_DONE
    text = "%s\nפלט הביצוע לצעד %d: %s" % (note, step["ordinal"], step["title"])
    return text, status


def review_one(provider, task, step, exec_text, exec_status, seed_offset=0):
    """מבקר פלט אחד ומחזיר (חוות דעת, סטטוס).

    שתי עילות לדחייה, ושתיהן נבדקות: חוות דעת שלילית של המבקר,
    וביצוע שהוכרז חלקי. ביצוע חלקי שאושר בעין הוא בדיוק מה שסבב
    התיקון נועד לתפוס.
    """
    seed = int(task["seed"]) + step["ordinal"] + seed_offset
    note = provider.complete(ROLE_REVIEWER, exec_text, seed)
    ok = (_REVIEW_FAIL not in note) and exec_status == STEP_DONE
    if exec_status == STEP_PARTIAL and _REVIEW_FAIL not in note:
        note = note + " הביצוע הוכרז חלקי, ולכן הצעד אינו מאושר."
    return note, (STEP_APPROVED if ok else STEP_REWORK)


def run_task(conn, task_id, provider_name="mock"):
    """מריץ את שלושת השלבים ורושם הכול ל-SQLite. מחזיר סיכום."""
    task = db.get_task(conn, task_id)
    if not task:
        raise LookupError("אין משימה במספר %s" % task_id)

    provider = get_provider(provider_name, seed=int(task["seed"]))
    db.clear_steps(conn, task_id)
    db.set_status(conn, task_id, db.STATUS_RUNNING)
    db.add_event(conn, task_id, "start",
                 "התחלת ריצה במצב הדמיה, ספק: %s, זרע: %s"
                 % (provider.name, task["seed"]))

    # ------------------------------------------------------- 1. מתכנן
    planned = plan(provider, task)
    for s in planned:
        s["id"] = db.add_step(conn, task_id, db.PHASE_PLANNER, s["ordinal"],
                              s["title"], s["content"], STEP_PLANNED)
    db.add_event(conn, task_id, "plan",
                 "המתכנן פירק את המשימה ל-%d צעדים." % len(planned))

    # ------------------------------------------------------- 2. מבצע
    for s in planned:
        text, status = execute_one(provider, task, s)
        s["exec_text"], s["exec_status"] = text, status
        s["exec_id"] = db.add_step(conn, task_id, db.PHASE_EXECUTOR, s["ordinal"],
                                   s["title"], text, status)
    db.add_event(conn, task_id, "execute",
                 "המבצע סיים %d צעדים." % len(planned))

    # ------------------------------------------------------- 3. מבקר
    for s in planned:
        note, status = review_one(provider, task, s, s["exec_text"], s["exec_status"])
        s["review_text"], s["review_status"] = note, status
        s["review_id"] = db.add_step(conn, task_id, db.PHASE_REVIEWER, s["ordinal"],
                                     s["title"], note, status)
    rework = [s for s in planned if s["review_status"] == STEP_REWORK]
    db.add_event(conn, task_id, "review",
                 "המבקר אישר %d מתוך %d צעדים."
                 % (len(planned) - len(rework), len(planned)))

    # --------------------------------------------- סבב תיקון אחד בלבד
    fixed = 0
    if rework:
        db.add_event(conn, task_id, "rework",
                     "סבב תיקון על %d צעדים: %s"
                     % (len(rework), ", ".join(str(s["ordinal"]) for s in rework)))
        for s in rework:
            text, status = execute_one(provider, task, s, REWORK_OFFSET)
            text = "סבב תיקון.\n" + text
            db.update_step(conn, s["exec_id"], content=text, status=status)
            note, rstatus = review_one(provider, task, s, text, status, REWORK_OFFSET)
            if rstatus != STEP_APPROVED:
                rstatus = STEP_REJECTED
                note = note + " גם אחרי סבב התיקון."
            else:
                fixed += 1
                note = "אחרי סבב התיקון: " + note
            db.update_step(conn, s["review_id"], content=note, status=rstatus)
            s["review_status"] = rstatus
        db.add_event(conn, task_id, "rework",
                     "סבב התיקון הציל %d מתוך %d צעדים." % (fixed, len(rework)))

    approved = [s for s in planned if s["review_status"] == STEP_APPROVED]
    ok = len(approved) == len(planned)
    db.set_status(conn, task_id, db.STATUS_DONE if ok else db.STATUS_FAILED)
    db.add_event(conn, task_id, "end",
                 "סיום: %d מתוך %d צעדים אושרו. המשימה %s."
                 % (len(approved), len(planned),
                    "הושלמה" if ok else "נכשלה"))

    return {
        "task_id": task_id,
        "status": db.STATUS_DONE if ok else db.STATUS_FAILED,
        "planned": len(planned),
        "approved": len(approved),
        "rework": len(rework),
        "fixed": fixed,
        "provider": provider.name,
        "simulation": True,
    }
