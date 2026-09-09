#!/bin/bash
# כמה main זז מתחתיך. רץ בפתיחת סשן ולפני כל commit.
#
# `CLAUDE.md` קובע: "לפני שמתחילים משהו גדול: git fetch origin main
# ולהסתכל ב-log", ו"שוב לפני ה-commit — כי בדיקה בהתחלה אינה
# מספיקה". שני הכללים האלה נכתבו אחרי ששני סשנים בנו במקביל אותה
# רמה רביעית ואחת נזרקה, ואחרי שזה קרה שוב חמישה ימים אחר כך.
#
# כלל שכתוב ואיש אינו מריץ הוא כלל שלא קיים. זה מריץ אותו.
#
# **הוא אינו חוסם דבר.** קוד יציאה 0 תמיד. הוא מביא את המידע אל
# המסך ברגע שבו הוא משנה החלטה, ואת ההחלטה משאיר לך — נעילה
# חוסמת על עריכה היא בדיוק הכלי שמסוגל לתקוע את העבודה כשהוא
# טועה, ולכן היא לא נבנתה.

set -uo pipefail
cd "$CLAUDE_PROJECT_DIR" 2>/dev/null || exit 0
git rev-parse --git-dir >/dev/null 2>&1 || exit 0
[[ -n "$(git remote 2>/dev/null)" ]] || exit 0

git fetch origin main --quiet 2>/dev/null || exit 0

behind=$(git rev-list --count HEAD..origin/main 2>/dev/null || echo 0)
[[ "$behind" -eq 0 ]] && exit 0

echo "◆ origin/main מקדים אותך ב-${behind} commits."
echo
git log --oneline HEAD..origin/main 2>/dev/null | head -8 | sed 's/^/    /'
[[ "$behind" -gt 8 ]] && echo "    … ועוד $((behind - 8))"
echo
echo "  לפני שמתחילים משהו גדול, ושוב לפני ה-commit: git merge origin/main"
echo "  מה שכבר נחת שם מנצח. מהבנייה שנזרקת לוקחים רק מה שאין בו."

# קובצי גרסה שזזו שם הם ההתנגשות היקרה: שתי גרסאות עם אותו מפתח
# קאש פירושן שמי שקיבל אחת לא יקבל את השנייה לעולם.
vers=$(git diff HEAD..origin/main --name-only 2>/dev/null \
       | grep -E '(^|/)(index\.html|app\.js)$' | head -6 || true)
if [[ -n "$vers" ]]; then
  echo
  echo "  ושם זזו קבצים שמחזיקים BUILD ומפתח קאש:"
  echo "$vers" | sed 's/^/    /'
  echo "  מספר הגרסה מוקצה במיזוג, לא בבנייה. בדוק שהמספר שלך פנוי."
fi

exit 0
