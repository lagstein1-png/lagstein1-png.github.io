#!/bin/sh
# שער שלפני commit — מריץ את הבדיקות שאינן דורשות דפדפן, ועוצר commit שנופל בהן.
#
# למה הוא קיים
# ------------
# ‏qa.yml מריץ את כל החבילה על כל דחיפה, ולכן כישלון נראה — אבל רק אחרי
# שהוא כבר ב-GitHub, ואחרי שהבעלים קיבל מייל "Run failed". ב-8–9.9.2026
# נמדדו 68 ריצות ו-11 מהן אדומות; c90d805 נפל ב-naming בלבד — שם שהיה
# נתפס כאן בשלוש שניות, לפני שהוא יצא מהמכונה.
#
# מה הוא מריץ: node .claude/qa/all.js --gate — שש־עשרה בדיקות דטרמיניסטיות
# בלי דפדפן ובלי שרת. הריצה נמדדה ב-3.2 שניות על main (b1e175e).
# הוא **אינו** מחליף את הריצה המלאה: smoke, say, exam, entropy ו-options
# עדיין רצות ב-CI ובריצה הידנית.
#
# איך הוא עוצר: יציאה 2 היא חסימה, וה-stderr חוזר אל הסוכן כדי שיתקן.
# כל יציאה אחרת מרשה את הפקודה.

command=$(jq -r '.tool_input.command // empty' 2>/dev/null)

# לא commit — לא ענייננו. גם `git commit` בתוך פקודה מורכבת נתפס.
case "$command" in
  *"git commit"*) ;;
  *) exit 0 ;;
esac

cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0

out=$(node .claude/qa/all.js --gate 2>&1) && exit 0

{
  printf '%s\n' "$out" | tail -n 25
  printf '\n%s\n' "השער חסם את ה-commit: בדיקה נפלה. הרץ node .claude/qa/all.js --gate כדי לראות הכול."
} >&2
exit 2
