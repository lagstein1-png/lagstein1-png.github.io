#!/bin/bash
# שער סיום עבודה. רץ כ-Stop hook ומונע סגירת סשן על קוד שבור.
#
#   קוד יציאה 0  — לסיים בשקט
#   קוד יציאה 2  — לחסום, וה-stderr חוזר אל Claude כהנחיה
#
# למה דווקא --static: שש־עשרה בדיקות שקוראות קוד בלבד, בערך שתי
# שניות. שער שלוקח דקות מכבים אחרי יומיים, ושער שכבוי אינו שער.
# הבדיקות שדורשות דפדפן — smoke, exam, entropy, options — נשארות
# ל-/qa ולשלב 3 של נוהל השחרור.
#
# מה הוא לא עושה: אינו מתקן, אינו מקמט, ואינו נוגע בקובץ. הוא
# קורא, ואומר.

set -uo pipefail

input=$(cat)

# מניעת רקורסיה. בלי זה החסימה מפעילה את עצמה שוב בכל סיבוב.
if [[ "$(printf '%s' "$input" | jq -r '.stop_hook_active // false' 2>/dev/null)" == "true" ]]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR" 2>/dev/null || exit 0
[[ -f .claude/qa/all.js ]] || exit 0

# כיבוי ידני, למי שצריך לצאת באמצע בכוונה.
[[ "${QA_GATE:-1}" == "0" ]] && exit 0

# אין שינוי בקוד — אין מה לשמור עליו. קבצי תיעוד ודוחות אינם
# מפעילים את השער: הם אינם יכולים לשבור אפליקציה.
changed=$(git status --porcelain 2>/dev/null | awk '{print $NF}' \
          | grep -Ev '\.(md|json|txt)$|^\.claude/qa/reports/' || true)
[[ -z "$changed" ]] && exit 0

out=$(node .claude/qa/all.js --static 2>&1)
code=$?

if [[ $code -ne 0 ]]; then
  {
    echo "שער ה-QA חוסם את הסיום: יש בדיקה שנכשלה."
    echo
    echo "$out" | sed -n '/^═/,$p'
    echo
    echo "קו הבסיס של החבילה הוא אפס, ולכן כישלון כאן הוא ממצא"
    echo "אמיתי ולא רעש. תקן אותו, או — אם הוא באמת שפיר — רשום"
    echo "אותו בקו הבסיס שב-.claude/qa/README.md עם הנימוק."
    echo
    echo "הפלט המלא:  node .claude/qa/all.js --static"
    echo "לעקוף פעם אחת בכוונה:  QA_GATE=0"
  } >&2
  exit 2
fi

exit 0
