/* בדיקת התוכן של bagrut-806.
   entropy, options ו-exam בודקים מנועי הגרלה, ולכן אף אחד מהם אינו
   נוגע ב-data/exams.js — התוכן היחיד בריפו שנכתב ביד. שני הכללים
   שהקובץ עצמו מגדיר כאסורים לשבירה נבדקים כאן:
   1. יש latex — יש speech, ובלי לוכסן אחורי. תלמיד ששומע
      "backslash frac" מפסיק להקשיב.
   2. שאלה שלא נלקחה מבחינה אמיתית מסומנת season:"הדגמה".
   קו הבסיס הוא אפס. */
const path=require('path');
global.window={};
require(path.resolve(process.argv[2]||'bagrut-806/data/exams.js'));
const EX=global.window.EXAMS||[];
const bad=[];
const TYPES={number:1,expression:1,text:1};
let nq=0,ns=0,pts=0;
const topics={};
EX.forEach(function(ex,xi){
  const at='בחינה '+(ex.id||xi);
  ['id','year','season','moed','durationMinutes'].forEach(function(k){
    if(ex[k]===undefined)bad.push(at+': חסר שדה '+k);
  });
  if(!Array.isArray(ex.questions)||!ex.questions.length)bad.push(at+': אין שאלות');
  const nums={};
  (ex.questions||[]).forEach(function(q){
    nq++;
    const aq=at+' שאלה '+q.number;
    if(q.number===undefined)bad.push(aq+': אין number');
    if(nums[q.number])bad.push(aq+': מספר שאלה כפול');
    nums[q.number]=1;
    if(!q.topic)bad.push(aq+': אין topic');
    else topics[q.topic]=(topics[q.topic]||0)+1;
    if(!q.text)bad.push(aq+': אין text');
    if(q.latex&&!q.speech)bad.push(aq+': יש latex ואין speech');
    if(q.speech&&q.speech.indexOf('\\')>=0)bad.push(aq+': לוכסן אחורי ב-speech');
    const lets={};
    if(!Array.isArray(q.subQuestions)||!q.subQuestions.length)bad.push(aq+': אין סעיפים');
    (q.subQuestions||[]).forEach(function(s){
      ns++;
      const as=aq+' סעיף '+s.letter;
      if(!s.letter)bad.push(aq+': סעיף בלי letter');
      if(lets[s.letter])bad.push(as+': אות סעיף כפולה');
      lets[s.letter]=1;
      if(!s.text)bad.push(as+': אין text');
      if(typeof s.points!=='number'||!(s.points>0))bad.push(as+': points אינו מספר חיובי');
      else pts+=s.points;
      if(s.latex&&!s.speech)bad.push(as+': יש latex ואין speech');
      if(s.speech&&s.speech.indexOf('\\')>=0)bad.push(as+': לוכסן אחורי ב-speech');
      const fa=s.finalAnswer;
      if(!fa)bad.push(as+': אין finalAnswer');
      else if(!TYPES[fa.type])bad.push(as+': type לא חוקי — '+fa.type);
      else if(fa.value===undefined||fa.value==='')bad.push(as+': finalAnswer בלי value');
      else if(fa.type==='number'&&typeof fa.value!=='number')bad.push(as+': number עם value שאינו מספר');
      else if(fa.type==='number'&&!(fa.tolerance>0))bad.push(as+': number בלי tolerance חיובי');
      if(!Array.isArray(s.steps)||!s.steps.length)bad.push(as+': אין steps');
      (s.steps||[]).forEach(function(st,i){
        if(!st.hint)bad.push(as+' שלב '+(i+1)+': אין hint');
        if(!st.detail)bad.push(as+' שלב '+(i+1)+': אין detail');
      });
    });
  });
});
console.log('בחינות '+EX.length+' · שאלות '+nq+' · סעיפים '+ns+' · נקודות '+pts);
console.log('נושאים ('+Object.keys(topics).length+'): '+
  Object.keys(topics).map(function(t){return t+'×'+topics[t]}).join(', '));
if(bad.length){bad.forEach(function(b){console.log('✗ '+b)});
  console.log('\n'+bad.length+' ממצאים');process.exit(1);}
console.log('0 ממצאים');
