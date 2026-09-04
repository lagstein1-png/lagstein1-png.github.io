#!/bin/bash
# =====================================================================
# מריץ סשן של Claude Code, ובסופו מבקש מ-Claude להסביר בשפה פשוטה
# מה קרה בו.
#
#   .claude/spy.sh                 סשן חדש, ואחריו סיכום
#   .claude/spy.sh "תקן את X"      אותו דבר עם פרומפט פתיחה
#   .claude/spy.sh --last          רק סכם את הסשן האחרון, בלי להריץ חדש
#   .claude/spy.sh --show          רק הדפס את התמליל הקריא, בלי לסכם
#
# למה זה לא `claude | tee`
# ------------------------
# צינור על stdout מסלק את ה-TTY, והממשק האינטראקטיבי לא עולה כמו
# שצריך. וגם אילו עלה — מה שנכתב למסך הוא ציור: רצפי ANSI, מסגרות
# וציור־מחדש של אותן שורות. הקובץ שהיה נשמר אינו תמליל אלא צילום
# של האנימציה.
#
# התמליל האמיתי כבר נכתב על הדיסק בידי Claude Code עצמו, ולכן כאן
# רק מקבעים מראש מזהה סשן (--session-id), מריצים בלי צינור, ואז
# קוראים את הקובץ שנוצר דרך .claude/spy.js.
# =====================================================================
set -u

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SPY="$HERE/spy.js"

PROMPT='אתה מרגל שצפה בסשן פיתוח. לפניך תמליל שלו.
תסביר בעברית פשוטה, בלי מושגים טכניים, ובלי להמציא שום פרט שאינו בתמליל:
1. מה ניסינו לעשות?
2. מה הסוכן עשה צעד אחר צעד?
3. אילו קבצים הוא שינה?
4. האם היו בעיות ואיך נפתרו?
5. מה התוצאה הסופית?
אם משהו מהם לא מופיע בתמליל — כתוב "לא מופיע בתמליל" ואל תשלים בניחוש.'

summarize() {                      # $1 = מזהה סשן, או ריק ל"אחרון"
  local digest
  digest="$(mktemp "${TMPDIR:-/tmp}/claude-spy-XXXXXX.txt")" || return 1
  if ! node "$SPY" ${1:+"$1"} > "$digest"; then
    rm -f "$digest"
    return 1
  fi
  if [ "${SHOW_ONLY:-0}" = 1 ]; then
    cat "$digest"
    echo >&2
    echo "spy: התמליל הקריא נשמר ב-$digest" >&2
    return 0
  fi
  echo
  echo "=== מסכם את הסשן ==="
  claude -p --output-format text "$PROMPT" < "$digest"
  local rc=$?
  echo >&2
  echo "spy: התמליל הקריא נשמר ב-$digest" >&2
  return $rc
}

case "${1:-}" in
  --last)  shift; summarize ""; exit $? ;;
  --show)  shift; SHOW_ONLY=1; summarize ""; exit $? ;;
esac

# מזהה סשן מקובע מראש, כדי לדעת אחר כך איזה קובץ תמליל לקרוא
SID="$(node -e 'console.log(require("crypto").randomUUID())')" || exit 1

# בלי צינור ובלי tee: ה-TTY נשאר של Claude, והתמליל נכתב בצד
claude --session-id "$SID" "$@"
RC=$?

summarize "$SID"
exit $RC
