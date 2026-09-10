#!/bin/bash
# החצי השני של הכלל: "ושוב לפני ה-commit — כי בדיקה בהתחלה אינה
# מספיקה". ב-2.9 סשן שכן בדק בהתחלה נזרק בכל זאת, כי הסשן המקביל
# דחף שלושים וחמש דקות אחרי שהוא התחיל. חלון הבנייה הוא החלון
# המסוכן, ולא הרגע שלפניו.
#
# רץ רק על פקודת commit, ואינו חוסם דבר.
set -uo pipefail
input=$(cat)
cmd=$(printf '%s' "$input" | jq -r '.tool_input.command // ""' 2>/dev/null)
[[ "$cmd" == *"git commit"* ]] || exit 0
exec "$(dirname "$0")/main-drift.sh"
