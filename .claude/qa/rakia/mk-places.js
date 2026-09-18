/* =====================================================================
   mk-places.js — מחולל rakia/data/places.js מנתוני GeoNames

     node .claude/qa/rakia/mk-places.js <all-the-cities> <tz-lookup>   כותב את הקובץ
     node .claude/qa/rakia/mk-places.js --check                        לא נערך ביד

   המקור: חבילת npm ‎all-the-cities (MIT) — כל 135,233 היישובים של
   GeoNames (CC BY 4.0) שאוכלוסייתם 1,000 ומעלה — ו-tz-lookup (MIT)
   שממפה נקודת ציון לאזור זמן IANA. שתיהן זמן־בנייה בלבד; האפליקציה
   טוענת קובץ נתונים סטטי אחד.

   מי נכנס: כל היישובים בישראל; ביהודה, שומרון ועזה מ-20,000 תושבים;
   בעולם מ-150,000 תושבים או עיר בירה. השמות בעברית מגיעים מהמילון
   שבקובץ הזה (GeoNames מספק שמות חלופיים רק בקובץ נפרד שאינו נגיש
   מכאן); יישוב שאין לו שם עברי מוצג בשמו הלועזי, והחיפוש מוצא את
   שניהם.

   רשומה: [שם עברי, שם לועזי, מדינה, רוחב, אורך, אזור זמן, אוכלוסייה]
   ===================================================================== */
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const ROOT = path.resolve(__dirname, '..', '..', '..');
const OUT = path.join(ROOT, 'rakia', 'data', 'places.js');
const MARK = '/* SIG:';
const sig = b => crypto.createHash('sha256').update(b).digest('hex').slice(0, 16);

if (process.argv.includes('--check')) {
  if (!fs.existsSync(OUT)) { console.log('✗ rakia/data/places.js אינו קיים'); process.exit(1); }
  const src = fs.readFileSync(OUT, 'utf8');
  const i = src.indexOf(MARK), want = src.slice(i + MARK.length, src.indexOf('*/', i)).trim();
  const body = src.slice(src.indexOf('*/', i) + 3);
  if (sig(body) !== want) { console.log(`✗ places.js: חתימה ${want} מול תוכן ${sig(body)} — נערך ביד`); process.exit(1); }
  const n = (body.match(/\],\[/g) || []).length + 1;
  console.log(`✓ places.js: חתימה ${want}, ${n} יישובים, ${(src.length / 1024).toFixed(0)}KB`);
  process.exit(0);
}
const [citiesDir, tzDir] = process.argv.slice(2);
if (!citiesDir || !tzDir) { console.error('שימוש: mk-places.js <all-the-cities> <tz-lookup> | --check'); process.exit(2); }
const cities = require(path.resolve(citiesDir));
const tz = require(path.resolve(tzDir));

/* שמות עבריים. ישראל — כל מי שברשימה; העולם — ערים שעולים ומטיילים
   מחפשים בעברית. הלועזי נשאר לחיפוש. */
const HE = {
  'Jerusalem': 'ירושלים', 'Tel Aviv': 'תל אביב', 'Haifa': 'חיפה', 'Ashdod': 'אשדוד', 'Rishon LeẔiyyon': 'ראשון לציון',
  'Petaẖ Tiqwa': 'פתח תקווה', 'Beersheba': 'באר שבע', 'Netanya': 'נתניה', 'H̱olon': 'חולון', 'Bnei Brak': 'בני ברק',
  'Reẖovot': 'רחובות', 'Bat Yam': 'בת ים', 'Ramat Gan': 'רמת גן', 'Ashkelon': 'אשקלון', 'Jaffa': 'יפו',
  'Modi‘in Makkabbim Re‘ut': 'מודיעין', 'Herzliya': 'הרצליה', 'Kfar Saba': 'כפר סבא', "Ra'anana": 'רעננה', 'Hadera': 'חדרה',
  'Bet Shemesh': 'בית שמש', 'Lod': 'לוד', 'Nazareth': 'נצרת', 'Modiin Ilit': 'מודיעין עילית', 'Ramla': 'רמלה',
  'Nahariyya': 'נהריה', 'Qiryat Ata': 'קריית אתא', 'Givatayim': 'גבעתיים', 'Kiryat Gat': 'קריית גת', 'Acre': 'עכו',
  'Eilat': 'אילת', 'Afula': 'עפולה', 'Karmi’el': 'כרמיאל', 'Hod HaSharon': 'הוד השרון', 'Umm el Faḥm': 'אום אל־פחם',
  'Nof HaGalil': 'נוף הגליל', 'Tiberias': 'טבריה', 'Qiryat Moẕqin': 'קריית מוצקין', 'Qiryat Yam': 'קריית ים',
  'Rosh Ha‘Ayin': 'ראש העין', 'Ness Ziona': 'נס ציונה', 'Qiryat Bialik': 'קריית ביאליק', 'Ramat HaSharon': 'רמת השרון',
  'Dimona': 'דימונה', 'Eṭ Ṭaiyiba': 'טייבה', 'Yavné': 'יבנה', 'Or Yehuda': 'אור יהודה', 'Yehud-Monosson': 'יהוד־מונוסון',
  'Safed': 'צפת', 'Gedera': 'גדרה', 'Tamra': 'טמרה', 'Yehud': 'יהוד', 'Daliyat al Karmel': 'דאלית אל־כרמל',
  'Migdal Ha‘Emeq': 'מגדל העמק', 'Sakhnīn': 'סח׳נין', 'Netivot': 'נתיבות', 'Mevasseret Ẕiyyon': 'מבשרת ציון', 'Ofaqim': 'אופקים',
  'Arad': 'ערד', 'Gan Yavne': 'גן יבנה', 'Qiryat Shemona': 'קריית שמונה', 'Kefar Yona': 'כפר יונה', 'maalot Tarshīhā': 'מעלות־תרשיחא',
  'Nesher': 'נשר', 'Tirah': 'טירה', 'Shoham': 'שוהם', 'Sederot': 'שדרות', 'Rahat': 'רהט', 'Tirat Karmel': 'טירת כרמל',
  'Maghār': 'מע׳אר', "Giv'at Shmuel": 'גבעת שמואל', 'Ariel': 'אריאל', 'Kafr Kannā': 'כפר כנא', 'Judeida Makr': 'ג׳דיידה־מכר',
  'Kafr Qāsim': 'כפר קאסם', 'Qalansuwa': 'קלנסווה', 'Bet She’an': 'בית שאן', 'Azor': 'אזור', 'Ganei Tikva': 'גני תקווה',
  'Er Reina': 'ריינה', 'Even Yehuda': 'אבן יהודה', 'Kafr Mandā': 'כפר מנדא', 'Iksāl': 'אכסאל', 'Rekhasim': 'רכסים',
  'Naḥf': 'נחף', 'Beit Jann': 'בית ג׳ן', 'Herzliya Pituah': 'הרצליה פיתוח', 'El Fureidīs': 'פוריידיס', 'Kfar Yasif': 'כפר יאסיף',
  'Kābūl': 'כאבול', 'Tel Mond': 'תל מונד', 'Yeroẖam': 'ירוחם', 'Deir Ḥannā': 'דיר חנא', 'Dabbūrīya': 'דבוריה',
  'Mazkeret Batya': 'מזכרת בתיה', 'Bnei Ayish': 'בני עי״ש', 'Bu‘eina': 'בועיינה', 'Jaljūlya': 'ג׳לג׳וליה', 'Bīr el Maksūr': 'ביר אל־מכסור',
  'Bet Dagan': 'בית דגן', 'Basmat Ṭab‘ūn': 'בסמת טבעון', 'Pardesiyya': 'פרדסיה', 'Lehavim': 'להבים', 'Abū Ghaush': 'אבו גוש',
  'Shelomi': 'שלומי', 'Kefar Weradim': 'כפר ורדים', 'Ramat Yishay': 'רמת ישי', 'Ḥurfeish': 'חורפיש', 'Buqei‘a': 'פקיעין',
  'Nof Ayalon': 'נוף איילון', 'Shibli': 'שיבלי', 'Kefar H̱abad': 'כפר חב״ד', 'Mitzpe Ramon': 'מצפה רמון', 'Ẕur Hadassa': 'צור הדסה',
  'Atlit': 'עתלית', 'Caesarea': 'קיסריה', '‘Eilabun': 'עיילבון', 'El Mazra‘a': 'מזרעה', 'Sājūr': 'סאג׳ור', 'Savyon': 'סביון',
  'Har Adar': 'הר אדר', 'Kafr Kammā': 'כפר כמא', 'Pasuta': 'פסוטה', 'Yavne’el': 'יבנאל', 'Kaukab Abū el Hījā': 'כאוכב אבו אל־היג׳א',
  'Talmon': 'טלמון', 'Elyakhin': 'אליכין', 'Mi‘ilyā': 'מעיליא', 'Jīsh': 'גוש חלב', 'Hashmonaim': 'חשמונאים', '‘Uzeir': 'עוזייר',
  'Kfar NaOranim': 'כפר האורנים', 'Lapid': 'לפיד', 'Rosh Pinna': 'ראש פינה', 'Sūlam': 'סולם', 'Ẕur Moshe': 'צור משה',
  'Kafr Miṣr': 'כפר מצר', 'Kefar Tavor': 'כפר תבור', 'Esh Sheikh Dannūn': 'שייח׳ דנון', 'Nordiyya': 'נורדיה', 'Neẖalim': 'נחלים',
  'Ibṭīn': 'אבטין', 'Sallama': 'סלמה', 'Timrat': 'תמרת', 'Kefar Shemaryahu': 'כפר שמריהו', 'Mevo horon': 'מבוא חורון',
  'Bet Yiẕẖaq': 'בית יצחק', 'Nein': 'ניין', 'Rumat Heib': 'רומת הייב', 'Metulla': 'מטולה', '‘En Boqeq': 'עין בוקק', 'Revava': 'רבבה',
  'Dolev': 'דולב', 'Kefar Rosh HaNiqra': 'כפר ראש הנקרה', 'Nirit': 'נירית', 'Beit Horon': 'בית חורון', 'Midreshet Ben-Gurion': 'מדרשת בן־גוריון',
  "Giv'on HaHadasha": 'גבעון החדשה', "Na'ale": 'נעלה', 'Fīq': 'פיק',
  /* יהודה, שומרון ועזה */
  'East Jerusalem': 'מזרח ירושלים', 'Gaza': 'עזה', 'Khān Yūnis': 'ח׳אן יונס', 'Jabālyā': 'ג׳באליה', 'Hebron': 'חברון', 'Nablus': 'שכם',
  'Rafaḩ': 'רפיח', 'Ţūlkarm': 'טולכרם', 'Qalqīlyah': 'קלקיליה', 'Janīn': 'ג׳נין', 'Bethlehem': 'בית לחם', 'Ramallah': 'רמאללה', 'Al Bīrah': 'אל־בירה',
  /* העולם */
  'New York City': 'ניו יורק', 'Los Angeles': 'לוס אנג׳לס', 'Chicago': 'שיקגו', 'Miami': 'מיאמי', 'Boston': 'בוסטון', 'Washington': 'וושינגטון',
  'San Francisco': 'סן פרנסיסקו', 'Philadelphia': 'פילדלפיה', 'Houston': 'יוסטון', 'Toronto': 'טורונטו', 'Montréal': 'מונטריאול', 'Vancouver': 'ונקובר',
  'Mexico City': 'מקסיקו סיטי', 'Buenos Aires': 'בואנוס איירס', 'São Paulo': 'סאו פאולו', 'Rio de Janeiro': 'ריו דה ז׳ניירו', 'Santiago': 'סנטיאגו', 'Lima': 'לימה', 'Bogotá': 'בוגוטה',
  'London': 'לונדון', 'Manchester': 'מנצ׳סטר', 'Paris': 'פריז', 'Marseille': 'מרסיי', 'Lyon': 'ליון', 'Berlin': 'ברלין', 'Munich': 'מינכן', 'Frankfurt am Main': 'פרנקפורט', 'Hamburg': 'המבורג',
  'Amsterdam': 'אמסטרדם', 'Brussels': 'בריסל', 'Antwerpen': 'אנטוורפן', 'Zürich': 'ציריך', 'Geneva': 'ז׳נבה', 'Vienna': 'וינה', 'Prague': 'פראג', 'Budapest': 'בודפשט', 'Warsaw': 'ורשה',
  'Kraków': 'קרקוב', 'Rome': 'רומא', 'Milan': 'מילאנו', 'Madrid': 'מדריד', 'Barcelona': 'ברצלונה', 'Lisbon': 'ליסבון', 'Athens': 'אתונה', 'Thessaloníki': 'סלוניקי',
  'Istanbul': 'איסטנבול', 'Ankara': 'אנקרה', 'Bucharest': 'בוקרשט', 'Sofia': 'סופיה', 'Belgrade': 'בלגרד', 'Zagreb': 'זאגרב', 'Stockholm': 'שטוקהולם', 'Oslo': 'אוסלו',
  'Copenhagen': 'קופנהגן', 'Helsinki': 'הלסינקי', 'Dublin': 'דבלין', 'Edinburgh': 'אדינבורו', 'Moscow': 'מוסקבה', 'Saint Petersburg': 'סנקט פטרבורג', 'Novosibirsk': 'נובוסיבירסק',
  'Yekaterinburg': 'יקטרינבורג', 'Kazan': 'קאזאן', 'Nizhniy Novgorod': 'ניז׳ני נובגורוד', 'Samara': 'סמרה', 'Rostov-na-Donu': 'רוסטוב על הדון', 'Kyiv': 'קייב', 'Kharkiv': 'חרקוב',
  'Odesa': 'אודסה', 'Dnipro': 'דניפרו', 'Lviv': 'לבוב', 'Minsk': 'מינסק', 'Chișinău': 'קישינב', 'Tbilisi': 'טביליסי', 'Baku': 'באקו', 'Yerevan': 'ירוואן',
  'Tashkent': 'טשקנט', 'Almaty': 'אלמטי', 'Astana': 'אסטנה', 'Bishkek': 'בישקק', 'Tehran': 'טהרן', 'Baghdad': 'בגדד', 'Damascus': 'דמשק', 'Beirut': 'ביירות', 'Amman': 'עמאן',
  'Cairo': 'קהיר', 'Alexandria': 'אלכסנדריה', 'Riyadh': 'ריאד', 'Dubai': 'דובאי', 'Abu Dhabi': 'אבו דאבי', 'Doha': 'דוחה', 'Manama': 'מנאמה', 'Muscat': 'מסקט',
  'Casablanca': 'קזבלנקה', 'Rabat': 'רבאט', 'Marrakesh': 'מרקש', 'Fès': 'פאס', 'Tunis': 'תוניס', 'Algiers': 'אלג׳יר', 'Tripoli': 'טריפולי', 'Addis Ababa': 'אדיס אבבה',
  'Nairobi': 'ניירובי', 'Johannesburg': 'יוהנסבורג', 'Cape Town': 'קייפטאון', 'Lagos': 'לאגוס', 'Mumbai': 'מומבאי', 'Delhi': 'דלהי', 'New Delhi': 'ניו דלהי', 'Bangalore': 'בנגלור',
  'Kolkata': 'קולקטה', 'Chennai': 'צ׳נאי', 'Karachi': 'קראצ׳י', 'Lahore': 'לאהור', 'Islamabad': 'איסלמאבאד', 'Kabul': 'קאבול', 'Dhaka': 'דאקה', 'Kathmandu': 'קטמנדו', 'Colombo': 'קולומבו',
  'Bangkok': 'בנגקוק', 'Hanoi': 'האנוי', 'Ho Chi Minh City': 'הו צ׳י מין', 'Singapore': 'סינגפור', 'Kuala Lumpur': 'קואלה לומפור', 'Jakarta': 'ג׳קרטה', 'Manila': 'מנילה',
  'Beijing': 'בייג׳ינג', 'Shanghai': 'שנחאי', 'Hong Kong': 'הונג קונג', 'Guangzhou': 'גואנגג׳ואו', 'Shenzhen': 'שנג׳ן', 'Taipei': 'טאיפיי', 'Seoul': 'סיאול', 'Busan': 'בוסאן',
  'Tokyo': 'טוקיו', 'Osaka': 'אוסקה', 'Kyoto': 'קיוטו', 'Sydney': 'סידני', 'Melbourne': 'מלבורן', 'Brisbane': 'בריסביין', 'Perth': 'פרת׳', 'Auckland': 'אוקלנד', 'Wellington': 'ולינגטון',
  'Havana': 'הוואנה', 'Caracas': 'קראקס', 'Montevideo': 'מונטווידאו', 'Panama City': 'פנמה סיטי', 'San José': 'סן חוסה', 'Ulan Bator': 'אולן בטור', 'Vilnius': 'וילנה', 'Riga': 'ריגה', 'Tallinn': 'טאלין',
  'Odessa': 'אודסה', 'Chernivtsi': 'צ׳רנוביץ', 'Vinnytsia': 'ויניצה', 'Zaporizhzhya': 'זפוריז׳יה', 'Kishinev': 'קישינב', 'Gomel': 'גומל', 'Ashgabat': 'אשגבאט', 'Dushanbe': 'דושנבה',
  'Bern': 'ברן', 'Luxembourg': 'לוקסמבורג', 'Monaco': 'מונקו', 'Valletta': 'ולטה', 'Nicosia': 'ניקוסיה', 'Reykjavík': 'רייקיאוויק', 'Ottawa': 'אוטווה', 'Canberra': 'קנברה',
};

const pick = cities.filter(c => c.country === 'IL' ||
  (c.country === 'PS' && c.population >= 20000) ||
  c.population >= 150000 || c.featureCode === 'PPLC');
pick.sort((a, b) => b.population - a.population);
const seen = new Set();
const rows = [];
for (const c of pick) {
  const [lon, lat] = c.loc.coordinates;
  const key = c.name + '|' + c.country;
  if (seen.has(key)) continue; seen.add(key);
  let z; try { z = tz(lat, lon); } catch (e) { z = 'Etc/UTC'; }
  rows.push([HE[c.name] || '', c.name, c.country, +lat.toFixed(3), +lon.toFixed(3), z, c.population]);
}
const body = 'var PLACES=' + JSON.stringify(rows) + ';\n';
const withHe = rows.filter(r => r[0]).length;
const head = `/* =====================================================================
   רקיע — יישובים. קובץ נתונים שנוצר ב-.claude/qa/rakia/mk-places.js
   מ-GeoNames (CC BY 4.0, geonames.org) דרך all-the-cities, ואזורי
   הזמן מ-tz-lookup. אינו נערך ביד (\`--check\` משווה חתימה).
   ${rows.length} יישובים, ${withHe} עם שם עברי. רשומה:
   [שם עברי, שם לועזי, מדינה, רוחב, אורך, אזור זמן IANA, אוכלוסייה]
   ===================================================================== */
${MARK} ${sig(body)} */
`;
fs.writeFileSync(OUT, head + body);
console.log(`✓ נכתב places.js: ${rows.length} יישובים (${withHe} בעברית), ${((head.length + body.length) / 1024) | 0}KB, חתימה ${sig(body)}`);
