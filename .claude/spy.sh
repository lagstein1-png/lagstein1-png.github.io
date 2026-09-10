#!/bin/bash
# =====================================================================
# מריץ סשן של Claude Code, ובסופו מבקש מ-Claude להסביר בשפה פשוטה
# מה קרה בו.
#
#   .claude/spy.sh                 סשן חדש, ואחריו סיכום
#   .claude/spy.sh "תקן את X"      אותו דבר עם פרומפט פתיחה
#   .claude/spy.sh --last          רק סכם את הסשן האחרון, בלי להריץ חדש
#   .claude/spy.sh --show          רק הדפס את התמליל הקריא, בלי לסכם
#   .claude/spy.sh --live          סשן חדש עם פרשנות תוך כדי ריצה
#
# פרשנות חיה
# ----------
# --live מריץ ברקע את .claude/spy-live.js, שקורא את התמליל תוך כדי
# כתיבתו ומסביר מדי כמה אירועים מה קורה. ההסבר אינו מודפס לטרמינל
# של הסשן — הממשק של Claude Code מצייר את המסך מחדש והיה דורס אותו —
# אלא נכתב לקובץ. פותחים טרמינל שני ומריצים tail -f עליו.
# כל הסבר הוא קריאה נוספת ל-claude, ולכן הוא עולה כסף.
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

# הסימון בפרומפט יושב בשורה הראשונה של התמליל שקריאת הסיכום מייצרת,
# אם היא מייצרת אחד, ו-spy.js מדלג על תמליל כזה. בלעדיו --last היה
# מסכם את הסיכום הקודם במקום את הסשן.
PROMPT='אתה מרגל שצפה בסשן פיתוח (SPY-TRANSCRIPT-IGNORE). לפניך תמליל שלו.
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

LIVE=0
case "${1:-}" in
  --last)  shift; summarize ""; exit $? ;;
  --show)  shift; SHOW_ONLY=1; summarize ""; exit $? ;;
  --live)  shift; LIVE=1 ;;
esac

# מזהה סשן מקובע מראש, כדי לדעת אחר כך איזה קובץ תמליל לקרוא
SID="$(node -e 'console.log(require("crypto").randomUUID())')" || exit 1

WATCHER=""
if [ "$LIVE" = 1 ]; then
  # שם קבוע ולא מקרי, כדי שאפשר יהיה לפתוח את ה-tail עוד לפני שהסשן עולה
  LOG="${SPY_LOG:-${TMPDIR:-/tmp}/claude-spy-live.txt}"
  : > "$LOG" || exit 1
  node "$HERE/spy-live.js" "$SID" >> "$LOG" 2>&1 &
  WATCHER=$!
  echo "spy: פרשנות חיה נכתבת אל $LOG"
  echo "spy: בטרמינל שני הריצו:  tail -f $LOG"
fi

# בלי צינור ובלי tee: ה-TTY נשאר של Claude, והתמליל נכתב בצד
claude --session-id "$SID" "$@"
RC=$?

if [ -n "$WATCHER" ]; then
  kill -TERM "$WATCHER" 2>/dev/null   # הוא מסכם את מה שנשאר ואז יוצא
  wait "$WATCHER" 2>/dev/null
fi

summarize "$SID"
exit $RC
