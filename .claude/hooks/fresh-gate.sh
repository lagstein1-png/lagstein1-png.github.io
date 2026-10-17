#!/bin/bash
# =====================================================================
# השער שחסר בין המיזוג לדחיפה.
#
# `fresh.js` הפיל את `main` תשע פעמים — ריצות 439, 440, 443, 446,
# 458, 462, 463, 464 ו-467 — וזה אינו חוסר משמעת אלא חור בתזמון.
# הרצף היה זהה בכולן:
#
#   1. הסשן סורק תוכן   → הדוח טרי, `all.js --static` ירוק
#   2. `git merge origin/main`  ← **מבצע commit בעצמו**, ולכן
#      `main-drift-commit.sh` (שמסונן על `git commit`) אינו רץ
#   3. המיזוג מביא שינוי תוכן של סשן אחר → החתימה זזה → הדוח מיושן
#   4. `git push`  ← עד היום לא היה עליו שום שער
#   5. `main` אדום — **וכל commit של כל סשן אחר נולד אדום אחריו**,
#      עד שמישהו שם לב. ריצות 463 ו-464 נפלו על תקלה של 462.
#
# למה דווקא `push` ולא `merge`: הוק PreToolUse רץ **לפני** הפקודה,
# ולכן על `git merge` הוא עדיין רואה את העץ שלפני המיזוג ואינו
# יכול לראות את ההיישנות שהמיזוג עצמו יוצר. הדחיפה היא הרגע
# האחרון שבו הנזק עוד פרטי.
#
# למה זה חוסם, בניגוד ל-`main-drift.sh` שאינו חוסם: סחיפה היא
# מידע שהסשן שוקל, ודוח מיושן הוא כשל ידוע שנדחף. `qa-gate.sh`
# כבר קבע את התקדים — בדיקה סטטית אדומה חוסמת.
#
# למה זה זול: `fresh.js` אינו מריץ דפדפן ואינו קורא תוכן — הוא
# מגבב קבצים ומשווה. נמדד, חמש הרצות: 163, 173, 174, 204, 206
# מילישניות.
#
# עקיפה מכוונת: QA_GATE=0 — אותה מילה בדיוק כמו ב-qa-gate.sh. בסביבה,
# **או כתחילית בתוך הפקודה עצמה** (`QA_GATE=0 git push …`) — ראו למטה.
#
# **מה נבדק: הקומיט שנדחף, לא עץ העבודה — O-235, 17.10.2026.**
# עד כאן השער הריץ `fresh.js` על עץ העבודה תמיד. נמדד: `git push
# origin 377e35f4:main` נחסם בגלל קבצים שעוד לא נכנסו לקומיט (עבודה
# של סוכנים אחרים), אף ש-`fresh.js` על worktree של 377e35f4 נתן
# ״35 דוחות, כולם על התוכן שבעץ״. הכיוון ההפוך מסוכן יותר: עץ נקי
# ו-`git push origin ענף-אחר:main` אישר לפי תוכן שאינו נדחף.
# עכשיו: ה-ref נגזר מהפקודה. הוא HEAD והעץ נקי — בודקים את העץ, כמו
# קודם (זהה לקומיט). אחרת — worktree זמני של הקומיט, ונמחק ביציאה.
# =====================================================================
set -uo pipefail

# הודעה שמגיעה למשתמש גם כשהשער מאשר (exit 0 אינו מציג stderr).
note() { jq -cn --arg m "$1" '{systemMessage:$m}' 2>/dev/null || echo "$1"; }

if [[ "${QA_GATE:-1}" == "0" ]]; then
  note "שער הדחיפה (fresh-gate) נעקף: QA_GATE=0 בסביבה."; exit 0
fi

input=$(cat)
cmd=$(printf '%s' "$input" | jq -r '.tool_input.command // ""' 2>/dev/null) || exit 0
[[ "$cmd" == *"git push"* ]] || exit 0

# המקטע של הפקודה שבו יושב `git push`: מה שלפניו עד המפריד הקודם
# (שם יושבות תחיליות סביבה), ומה שאחריו עד המפריד הבא.
pre="${cmd%%git push*}"
pre="${pre##*[;&|$'\n']}"
post="${cmd#*git push}"
post="${post%%[;&|$'\n']*}"

# **QA_GATE=0 בתוך הפקודה — O-235.** ההוק מקבל את הפקודה כ-JSON ולא
# את הסביבה שלה, ולכן `QA_GATE=0 git push` לא הגיע אליו מעולם.
if [[ " $pre " =~ [[:space:]]QA_GATE=0[[:space:]] ]]; then
  note "שער הדחיפה (fresh-gate) נעקף בכוונה, פעם אחת: QA_GATE=0 בתחילת הפקודה. דוחות התוכן לא נבדקו."
  exit 0
fi

# **הריפו נגזר מהמיקום של הקובץ הזה, ולא מ-CLAUDE_PROJECT_DIR בלבד —
# 18.9.2026.** נמדד: בסביבת הענן המשתנה ריק, ותיקיית העבודה חוזרת
# ל-`/home/user` בין פקודות. `cd ""` נכשל בשקט, `exit 0`, והשער
# **אישר** דחיפה של דוח תוכן מיושן — שלוש פעמים בשבוע (687–689,
# 715). שער שמשחרר כשאינו מוצא את הריפו אינו שער.
ROOT="${CLAUDE_PROJECT_DIR:-}"
[[ -n "$ROOT" && -d "$ROOT/.git" ]] || ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT" || exit 0
[[ -f .claude/qa/fresh.js ]] || exit 0

# ---- מה נדחף: המקורות של ה-refspecs -------------------------------
# `git push`, `git push origin`, `git push -u origin ענף`,
# `git push origin HEAD:main`, `git push origin 377e35f4:main`.
# הארגומנט הראשון שאינו דגל הוא ה-remote; כל השאר refspecs.
srcs=() legacy=0 pos=0 skipnext=0
read -ra words <<< "$post"
for w in "${words[@]}"; do
  w="${w//[\"\']/}"
  if (( skipnext )); then skipnext=0; continue; fi
  case "$w" in
    ''|*'>'*|*'<'*) continue ;;                       # הפניות כמו 2>&1
    -o|--push-option|--repo|--receive-pack|--exec) skipnext=1; continue ;;
    --all|--mirror|--tags|--branches) legacy=1; continue ;;
    -d|--delete) exit 0 ;;                            # מחיקה אינה דוחפת תוכן
    -*) continue ;;
  esac
  pos=$((pos + 1))
  (( pos == 1 )) && continue                          # ה-remote
  w="${w#+}"
  src="${w%%:*}"
  [[ -n "$src" ]] && srcs+=("$src")                   # `:ענף` = מחיקה
done
(( pos <= 1 )) && srcs=("HEAD")
(( ${#srcs[@]} == 0 && ! legacy )) && exit 0

dirty=$(git status --porcelain 2>/dev/null | head -1)
headc=$(git rev-parse -q --verify 'HEAD^{commit}' 2>/dev/null)

# כל קומיט שיש לבדוק, פעם אחת. "" = עץ העבודה (ההתנהגות הישנה).
targets=()
(( legacy )) && targets+=("")
for s in "${srcs[@]}"; do
  c=$(git rev-parse -q --verify "${s}^{commit}" 2>/dev/null) || { targets+=(""); continue; }
  if [[ "$c" == "$headc" && -z "$dirty" ]]; then targets+=(""); else targets+=("$c"); fi
done

tmp=""
cleanup() {
  [[ -n "$tmp" ]] || return 0
  git -C "$ROOT" worktree remove --force "$tmp" >/dev/null 2>&1
  rm -rf "$tmp"
  git -C "$ROOT" worktree prune >/dev/null 2>&1
}
trap cleanup EXIT
trap 'exit 2' INT TERM HUP   # כדי שה-EXIT ינקה גם כשההוק נקטע

seen=" "
for t in "${targets[@]}"; do
  key="${t:-WORKTREE}"
  [[ "$seen" == *" $key "* ]] && continue
  seen+="$key "

  if [[ -z "$t" ]]; then
    where="עץ העבודה"
    out=$(node .claude/qa/fresh.js 2>&1); rc=$?
  else
    where="הקומיט ${t:0:8} (worktree זמני)"
    cleanup
    tmp=$(mktemp -d "${TMPDIR:-/tmp}/fresh-gate.XXXXXX") || exit 0
    # בלי קובצי המדיה: `sig.js` קורא רק .js ו-.html, ו-24 אלף קובצי
    # mp3 הם ההבדל בין 9 שניות לחצי שנייה (נמדד, 17.10.2026). אם
    # `sig.js` יתחיל לקרוא קובץ מדיה, `fresh.js` ייפול על ״אין קובצי
    # תוכן בעץ״ — כלומר יחסום, ולא יאשר בשקט.
    if ! { git worktree add -q --no-checkout --detach "$tmp" "$t" >/dev/null 2>&1 &&
           git -C "$tmp" checkout -q "$t" -- . ':!*.mp3' ':!*.mp4' ':!*.png' ':!*.jpg' ':!*.woff2' >/dev/null 2>&1; }; then
      echo "שער הדחיפה חוסם: לא הצלחתי לפתוח worktree של ${t:0:8} כדי לבדוק אותו." >&2
      echo "לעקוף פעם אחת בכוונה:  QA_GATE=0 git push …" >&2
      exit 2
    fi
    out=$(node .claude/qa/fresh.js "$tmp" 2>&1); rc=$?
  fi

  (( rc == 0 )) && continue
  {
    echo "שער הדחיפה חוסם: יש דוח תוכן שמתאר עץ שכבר אינו קיים."
    echo "נבדק: $where"
    echo
    printf '%s\n' "$out" | grep '^✗' || printf '%s\n' "$out"
    echo
    echo "זה קורה כמעט תמיד אחרי מיזוג: git merge מבצע commit בעצמו"
    echo "ולכן אינו עובר בשער ה-commit, והמיזוג הביא שינוי תוכן של"
    echo "סשן אחר. הרץ את הסורק שכל שורה מציינת — **על העץ הממוזג**,"
    echo "לא לפניו — והוסף את הדוח לאותו commit."
    echo
    echo "דורש שרת:  node .claude/qa/serve.js &"
    echo "ואז מה שכתוב למעלה, ולבסוף:  node .claude/qa/fresh.js"
    echo
    echo "לעקוף פעם אחת בכוונה:  QA_GATE=0 git push …"
  } >&2
  exit 2
done
exit 0
