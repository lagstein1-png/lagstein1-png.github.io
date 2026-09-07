"""ספקי מודל. **במצב הדמיה קיים ספק אחד בלבד: mock.**

הספק המדומה אינו פונה לרשת, אינו קורא מפתח API ואינו עולה כסף.
כל התשובות נגזרות מ-sha256 של (תפקיד, בקשה, זרע) — ולכן אותה
בקשה עם אותו זרע תיתן בדיוק את אותה תשובה, בכל מחשב ובכל ריצה.
הדטרמיניזם הזה הוא מה שמאפשר לבדיקות להשוות פלט מלא.

get_provider() דוחה במפורש כל שם אחר. ספק אמיתי ייכנס כאן
בהמשך, ולא באבן הדרך הזאת.
"""

import hashlib

from . import MODE

SIMULATION_ONLY = True

ROLE_PLANNER = "planner"
ROLE_EXECUTOR = "executor"
ROLE_REVIEWER = "reviewer"


def _digest(role, prompt, seed):
    raw = "%s|%s|%s" % (role, prompt, seed)
    return hashlib.sha256(raw.encode("utf-8")).digest()


def _pick(items, digest, offset):
    return items[digest[offset % len(digest)] % len(items)]


class MockProvider:
    """ספק מדומה. אין בו רשת ואין בו אקראיות אמיתית."""

    name = "mock"
    is_simulation = True

    def __init__(self, seed=0):
        self.seed = int(seed)
        self.calls = []          # יומן קריאות, לבדיקות

    # תשובה אחת. role קובע את הצורה, prompt ו-seed קובעים את התוכן.
    def complete(self, role, prompt, seed=None):
        s = self.seed if seed is None else int(seed)
        d = _digest(role, prompt, s)
        self.calls.append({"role": role, "prompt": prompt, "seed": s})
        if role == ROLE_PLANNER:
            return self._plan_text(d)
        if role == ROLE_EXECUTOR:
            return self._exec_text(d)
        if role == ROLE_REVIEWER:
            return self._review_text(d)
        raise ValueError("תפקיד לא מוכר: %s" % role)

    # --- ניסוחים. עברית בלבד, קצרה וקריאה. ---

    _PLAN_VERBS = [
        "לאסוף את הדרישות של",
        "לפרק לשלבים את",
        "לנסח טיוטה ראשונה של",
        "לבדוק מה כבר קיים בנוגע ל",
        "לסכם ולהגיש את",
    ]

    _EXEC_NOTES = [
        "הצעד בוצע במלואו.",
        "הצעד בוצע, ונרשמה הערה להמשך.",
        "הצעד בוצע חלקית — חסר מידע.",
    ]

    _REVIEW_NOTES = [
        "הפלט עונה על הצעד.",
        "הפלט עונה על הצעד, עם הסתייגות קלה.",
        "הפלט אינו מכסה את הצעד.",
    ]

    def _plan_text(self, d):
        return _pick(self._PLAN_VERBS, d, 0)

    def _exec_text(self, d):
        return _pick(self._EXEC_NOTES, d, 1)

    def _review_text(self, d):
        return _pick(self._REVIEW_NOTES, d, 2)

    # כמה צעדים יתכנן המתכנן. שלושה עד חמישה — טווח קריא למסך אחד.
    def plan_size(self, prompt, seed=None):
        s = self.seed if seed is None else int(seed)
        d = _digest(ROLE_PLANNER + ":size", prompt, s)
        return 3 + (d[0] % 3)


_REGISTRY = {"mock": MockProvider}


def available():
    return sorted(_REGISTRY)


def get_provider(name="mock", seed=0):
    """מחזיר ספק. כל שם שאינו mock נדחה בקול, ולא בשקט."""
    if name not in _REGISTRY:
        raise ValueError(
            "הספק '%s' אינו זמין. המערכת רצה ב-%s, והספק היחיד הוא: %s"
            % (name, MODE, ", ".join(available()))
        )
    return _REGISTRY[name](seed=seed)
