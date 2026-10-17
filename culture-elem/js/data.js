/* Jewish-Israeli culture and tradition for kids (תרבות ומסורת יהודית-ישראלית), grades 1-6 - content written fresh for bekol, in simple eye-level language.
   Line formats (fields split by |):
   E key|type|he|ar|ru|en        entity (answer / distractor). types: h holiday, f food, o object, p person, l place, t other
   S id|emoji|color|he|ar|ru|en   topic title
   L he|ar|ru|en                  one lesson sentence of the current topic
   Q he|ar|ru|en|answerKey[|d1,d2,d3]   question; answerKey nNN = a number; 3 explicit distractors */
var RAW="";
RAW+=String.raw`
E h_shab|h|שבת|السبت|Шаббат|Shabbat
E h_rosh|h|ראש השנה|رأس السنة العبرية|Рош а-Шана|Rosh Hashanah
E h_yk|h|יום כיפור|يوم الغفران (يوم كيبور)|Йом-Кипур|Yom Kippur
E h_suk|h|סוכות|عيد المظال (سوكوت)|Суккот|Sukkot
E h_simh|h|שמחת תורה|فرحة التوراة|Симхат-Тора|Simchat Torah
E h_han|h|חנוכה|حانوكا (عيد الأنوار)|Ханука|Hanukkah
E h_tub|h|ט״ו בשבט|طو بشفاط (رأس السنة للأشجار)|Ту би-Шват|Tu BiShvat
E h_pur|h|פורים|بوريم|Пурим|Purim
E h_pes|h|פסח|بيساح (الفصح العبري)|Песах|Pesach
E h_shav|h|שבועות|شفوعوت (عيد الأسابيع)|Шавуот|Shavuot
E h_sigd|h|הסיגד|السيغد|Сигд|the Sigd
E h_mim|h|המימונה|الميمونة|Мимуна|the Mimouna
E h_eidf|h|עיד אל־פיטר|عيد الفطر|Ид аль-Фитр|Eid al-Fitr
E h_eida|h|עיד אל־אדחא|عيد الأضحى|Ид аль-Адха|Eid al-Adha
E h_xmas|h|חג המולד|عيد الميلاد المجيد|Рождество|Christmas
E h_east|h|חג הפסחא|عيد الفصح المسيحي|Пасха|Easter
E h_nabi|h|נבי שועייב|النبي شعيب|Наби-Шуайб|Nabi Shu'ayb
S shabbat|🕯️|#1971c2|שבת: יום מנוחה|السبت: يوم راحة|Шаббат: день отдыха|Shabbat: A Day of Rest
L שבת מתחילה בערב שישי ונגמרת במוצאי שבת.|يبدأ السبت مساء الجمعة وينتهي مساء السبت.|Шаббат начинается в пятницу вечером и заканчивается в субботу вечером.|Shabbat begins on Friday evening and ends on Saturday evening.
L ביום הזה יהודים נחים מהעבודה ומתכנסים עם המשפחה.|في هذا اليوم يرتاح اليهود من العمل ويجتمعون مع العائلة.|В этот день евреи отдыхают от работы и собираются всей семьёй.|On this day Jewish people rest from work and gather with the family.
L לפני השבת מדליקים נרות ומברכים על יין.|قبل السبت يُشعلون الشموع ويباركون على النبيذ.|Перед Шаббатом зажигают свечи и произносят благословение над вином.|Before Shabbat, people light candles and say a blessing over wine.
L על השולחן יש חלות, והמשפחה אוכלת ארוחה חגיגית.|على المائدة خبز الحلّة وتتناول العائلة وجبة احتفالية.|На столе лежат халы, и семья ужинает вместе.|On the table there are challah breads, and the family eats a festive meal.
L גם לדתות אחרות יש יום מיוחד בשבוע. למוסלמים זה יום שישי, ולנוצרים זה יום ראשון.|للديانات الأخرى أيضًا يوم مميز في الأسبوع. عند المسلمين هو يوم الجمعة وعند المسيحيين يوم الأحد.|У других религий тоже есть особый день недели. У мусульман это пятница, у христиан воскресенье.|Other religions also have a special day in the week. For Muslims it is Friday, and for Christians it is Sunday.
E e_friev|t|בערב שישי|مساء الجمعة|в пятницу вечером|on Friday evening
E e_wedmo|t|ביום רביעי בבוקר|صباح يوم الأربعاء|в среду утром|on Wednesday morning
E e_sunno|t|ביום ראשון בצהריים|ظهر يوم الأحد|в воскресенье в обед|on Sunday at noon
E e_montu|t|בליל שני|ليلة الاثنين|в ночь на понедельник|on Monday night
E e_rest|t|נחים ומבלים עם המשפחה|نرتاح ونقضي الوقت مع العائلة|отдыхаем и проводим время с семьёй|we rest and spend time with the family
E e_work|t|ממשיכים לעבוד ולסדר את הבית כרגיל|نواصل العمل وترتيب البيت كالمعتاد|продолжаем работать и убирать дом, как обычно|we keep working and tidying the house as usual
E e_alone2|t|נוסעים לבית הספר כרגיל|نذهب إلى المدرسة كالمعتاد|едем в школу, как обычно|we go to school as usual
E e_rush|t|ממהרים לקניות בעיר|نسرع للتسوّق في المدينة|спешим за покупками в городе|we rush out shopping in town
E f_chal|f|חלה|خبز الحلّة|хала|challah (braided bread)
E f_sufg|f|סופגנייה|سوفغانيا (كعكة محشوة)|пончик-суфгания|a sufganiyah (jelly doughnut)
E f_hamen|f|אוזן המן|أذن هامان|ухо Амана|a hamantash (a filled cookie)
E f_matz|f|מצה|فطير (ماتساه)|маца|matzah (flat, unleavened bread)
E f_cheese|f|עוגת גבינה|كعكة الجبن|чизкейк|cheesecake (a cake of soft cheese)
E f_apple|f|תפוח בדבש|تفاحة بالعسل|яблоко с мёдом|an apple dipped in honey
E f_bbq|f|בשר על האש|لحم مشويّ على النار|шашлык на мангале|meat grilled on a barbecue
E o_candl|o|נרות|شموع|свечи|candles
E o_shofar|o|שופר|بوق الشوفار|шофар|a shofar
E o_sukk|o|סוכה|سُكّا (كوخ)|сукка|a sukkah
E o_lulav|o|לולב|لولاف (سعف النخيل)|лулав|a lulav
E o_etrog|o|אתרוג|إترُج|этрог|an etrog
E o_chanu|o|חנוכייה|شمعدان حانوكا|ханукия|a hanukkiah
E o_dreid|o|סביבון|سفيفون (دويدل)|волчок-севивон|a dreidel
E o_megil|o|מגילה|مجلّة إستير (ميغيلا)|свиток-мегила|a megillah
E o_ragn|o|רעשן|مِقرعة (راعشان)|трещотка|a noisemaker
E o_hagg|o|הגדה|هغاداه (كتاب الفصح)|Аггада|a Haggadah
E o_kettl|o|כוס מים|كأس ماء|стакан воды|a glass of water
Q מתי מתחילה שבת?|متى يبدأ السبت؟|Когда начинается Шаббат?|When does Shabbat begin?|e_friev|e_wedmo,e_sunno,e_montu
Y בלוח העברי יום מתחיל בערב, ולכן גם שבת מתחילה כבר בערב שישי.|في التقويم العبري يبدأ اليوم في المساء، لذلك يبدأ السبت منذ مساء الجمعة.|По еврейскому календарю день начинается вечером, поэтому Шаббат начинается уже в пятницу вечером.|In the Hebrew calendar a day starts in the evening, so Shabbat already begins on Friday evening.
Q מה עושים בשבת?|ماذا نفعل يوم السبت؟|Что делают в Шаббат?|What do people do on Shabbat?|e_rest|e_work,e_alone2,e_rush
Y שבת היא יום מנוחה, ולכן בשבת נוהגים לעצור את העבודה ולהיות עם המשפחה.|السبت يوم راحة، لذلك من العادة فيه أن يتوقّفوا عن العمل ويكونوا مع العائلة.|Шаббат - день отдыха, поэтому в этот день принято не работать и быть с семьёй.|Shabbat is a day of rest, so on this day people usually stop working and spend time with family.
Q מה מדליקים לפני שבת?|ماذا يُشعلون قبل السبت؟|Что зажигают перед Шаббатом?|What do people light before Shabbat?|o_candl|o_sukk,o_megil,o_shofar
Y הדלקת נרות מסמנת שהשבת מתחילה, והאור מביא אווירה של חג לבית.|إشعال الشموع يعلن بداية السبت، والنور يجلب جو العيد إلى البيت.|Зажжённые свечи показывают, что Шаббат начался, а их свет приносит в дом праздничное настроение.|Lighting candles marks the start of Shabbat, and the light brings a festive feeling to the home.
Q איזה לחם יש על שולחן השבת?|أي خبز يكون على مائدة السبت؟|Какой хлеб лежит на субботнем столе?|Which bread is on the Shabbat table?|f_chal|f_matz,f_hamen,f_sufg
Y חלה היא לחם קלוע ומיוחד, ונוהגים לאפות אותה לכבוד השבת.|الحلّة خبز مجدول ومميّز، ومن العادة خبزه احتفاءً بالسبت.|Хала - особый плетёный хлеб, его принято печь в честь Шаббата.|Challah is a special braided bread that people usually bake in honor of Shabbat.
Q באיזה יום מתפללים המוסלמים תפילה גדולה?|في أي يوم يؤدّي المسلمون الصلاة الكبيرة؟|В какой день мусульмане совершают большую молитву?|On which day do Muslims have the big prayer?|e_fri|e_wed,e_mon,e_tue
Y יום שישי הוא היום המיוחד של המוסלמים בשבוע, ובצהריים נוהגים להתפלל יחד במסגד.|يوم الجمعة هو اليوم المميّز عند المسلمين في الأسبوع، وفي الظهر يصلّون معًا عادةً في المسجد.|Пятница - особый день недели у мусульман, и в полдень принято молиться вместе в мечети.|Friday is the special day of the week for Muslims, and at midday they usually pray together at the mosque.
E e_fri|t|ביום שישי|يوم الجمعة|в пятницу|on Friday
E e_wed|t|ביום רביעי|يوم الأربعاء|в среду|on Wednesday
E e_mon|t|ביום שני|يوم الاثنين|в понедельник|on Monday
E e_tue|t|ביום שלישי|يوم الثلاثاء|во вторник|on Tuesday
Q באיזה יום נחים הנוצרים ומתפללים?|في أي يوم يرتاح المسيحيون ويصلّون؟|В какой день христиане отдыхают и молятся?|On which day do Christians rest and pray?|e_sun|e_wed,e_mon,e_tue
Y יום ראשון הוא היום המיוחד של הנוצרים, ובו נוהגים ללכת לכנסייה.|يوم الأحد هو اليوم المميّز عند المسيحيين، وفيه يذهبون عادةً إلى الكنيسة.|Воскресенье - особый день у христиан, и в этот день принято ходить в церковь.|Sunday is the special day for Christians, and on this day they usually go to church.
E e_sun|t|ביום ראשון|يوم الأحد|в воскресенье|on Sunday
E xc_satev|t|במוצאי שבת|مساء السبت|в субботу вечером|on Saturday evening
E xc_frinoon|t|ביום שישי בצהריים|ظهر يوم الجمعة|в пятницу днём|on Friday at noon
E xc_sunev|t|ביום ראשון בערב|مساء يوم الأحد|в воскресенье вечером|on Sunday evening
E xc_thumo|t|ביום חמישי בבוקר|صباح يوم الخميس|в четверг утром|on Thursday morning
Q מתי נגמרת שבת?|متى ينتهي السبت؟|Когда заканчивается Шаббат?|When does Shabbat end?|xc_satev|xc_frinoon,xc_sunev,xc_thumo
Y שבת נמשכת יום שלם, מערב שישי עד הערב של שבת, ואז היא נגמרת.|السبت يستمرّ يومًا كاملًا، من مساء الجمعة حتى مساء السبت، ثم ينتهي.|Шаббат длится целые сутки, с вечера пятницы до вечера субботы, и тогда заканчивается.|Shabbat lasts a whole day, from Friday evening to Saturday evening, and then it ends.
E xc_wine|f|יין|نبيذ|вино|wine
E xc_milk|f|חלב|حليب|молоко|milk
E xc_coffee|f|קפה|قهوة|кофе|coffee
E xc_tea|f|תה|شاي|чай|tea
Q על איזה משקה מברכים לפני השבת?|على أي مشروب يباركون قبل السبت؟|Над каким напитком произносят благословение перед Шаббатом?|Which drink do people bless before Shabbat?|xc_wine|xc_milk,xc_coffee,xc_tea
Y ברכה על יין נקראת קידוש, והיא פותחת את ארוחת השבת.|البركة على النبيذ تُسمّى القِدّوش (التقديس)، وهي تفتتح وجبة السبت.|Благословение над вином называется кидуш, и с него начинается ужин Шаббата.|The blessing over wine is called Kiddush, and it opens the Shabbat meal.
E xc_family|t|עם המשפחה|مع العائلة|с семьёй|with the family
E xc_teachers|t|עם המורים בבית הספר|مع المعلّمين في المدرسة|с учителями в школе|with the teachers at school
E xc_doctor|t|עם הרופא במרפאה|مع الطبيب في العيادة|с врачом в поликлинике|with the doctor at the clinic
E xc_work2|t|עם החברים מהעבודה|مع زملاء العمل|с коллегами по работе|with people from work
Q עם מי מתכנסים בשבת?|مع من يجتمعون يوم السبت؟|С кем собираются в Шаббат?|Who do people get together with on Shabbat?|xc_family|xc_teachers,xc_doctor,xc_work2
Y בשבת לא עובדים ולא לומדים, ולכן יש זמן לשבת יחד עם המשפחה.|في السبت لا يعملون ولا يدرسون، لذلك يوجد وقت للجلوس مع العائلة.|В Шаббат не работают и не учатся, поэтому есть время побыть с семьёй.|On Shabbat there is no work or school, so there is time to be together with family.
E xc_festm|t|ארוחה חגיגית עם המשפחה|وجبة احتفالية مع العائلة|праздничный ужин с семьёй|a festive meal with the family
E xc_quickm|t|ארוחה מהירה לבד במטבח|وجبة سريعة وحدهم في المطبخ|быстрый перекус в одиночку на кухне|a quick meal alone in the kitchen
E xc_standm|t|ארוחה קטנה בעמידה ליד הדלת|وجبة صغيرة وقوفًا عند الباب|маленький перекус стоя у двери|a small snack standing by the door
E xc_nomeal|t|רק כוס מים ופרוסת לחם|كأس ماء وقطعة خبز فقط|только стакан воды и кусок хлеба|just a glass of water and a slice of bread
Q איזו ארוחה אוכלים בערב שבת?|أي وجبة يتناولون مساء الجمعة، عند بداية السبت؟|Какую трапезу едят вечером в пятницу, когда начинается Шаббат?|What meal do people eat on Friday evening, when Shabbat begins?|xc_festm|xc_quickm,xc_standm,xc_nomeal
Y שבת היא יום חגיגי, ולכן נוהגים לאכול בערב ארוחה מיוחדת עם כל המשפחה.|السبت يوم احتفالي، لذلك من العادة تناول وجبة خاصة مع كل العائلة في المساء.|Шаббат - праздничный день, поэтому вечером принято есть особый ужин всей семьёй.|Shabbat is a festive day, so people usually eat a special dinner with the whole family.
S rosh|🍎|#c64c0a|ראש השנה ויום כיפור|رأس السنة العبرية ويوم الغفران|Рош а-Шана и Йом-Кипур|Rosh Hashanah and Yom Kippur
L ראש השנה הוא ראש השנה היהודית. הוא חל בסתיו.|رأس السنة العبرية هو بداية السنة اليهودية. ويأتي في الخريف.|Рош а-Шана - это еврейский Новый год. Он бывает осенью.|Rosh Hashanah is the Jewish New Year. It comes in the autumn.
L בבית הכנסת תוקעים בשופר. השופר עשוי מקרן של איל.|في الكنيس ينفخون في الشوفار. وهو مصنوع من قرن كبش.|В синагоге трубят в шофар. Он сделан из рога барана.|In the synagogue people blow the shofar. It is made from a ram's horn.
L אוכלים תפוח בדבש ואומרים: שתהיה לנו שנה מתוקה.|يأكلون تفاحة بالعسل ويقولون: لتكن لنا سنة حلوة.|Едят яблоко с мёдом и говорят: пусть у нас будет сладкий год.|People eat an apple in honey and say: may we have a sweet year.
L יום כיפור חל כעשרה ימים אחרי ראש השנה.|يأتي يوم الغفران بعد رأس السنة بنحو عشرة أيام.|Йом-Кипур наступает примерно через десять дней после Рош а-Шана.|Yom Kippur comes about ten days after Rosh Hashanah.
L ביום כיפור צמים, מבקשים סליחה ומשתדלים להיות טובים יותר.|في يوم الغفران يصومون ويطلبون المسامحة ويحاولون أن يكونوا أفضل.|В Йом-Кипур постятся, просят прощения и стараются стать лучше.|On Yom Kippur people fast, ask for forgiveness and try to be better.
L ביום כיפור אין מכוניות בכבישים, והילדים רוכבים על אופניים.|في يوم الغفران لا توجد سيارات في الشوارع والأولاد يركبون الدراجات.|В Йом-Кипур на дорогах нет машин, и дети катаются на велосипедах.|On Yom Kippur there are no cars on the roads, and children ride bikes.
Q איזה חג יהודי חוגגים בסתיו, וכעשרה ימים אחריו בא יום כיפור?|أي عيد يهودي يُحتفل به في الخريف، ويأتي بعده بنحو عشرة أيام يوم الغفران؟|Какой еврейский праздник отмечают осенью, а примерно через десять дней после него наступает Йом-Кипур?|Which Jewish holiday is celebrated in autumn, with Yom Kippur about ten days later?|h_rosh|h_pur,h_han,h_tub
Y השנה היהודית מתחילה בסתיו, ולכן גם ראש השנה חל בעונה הזאת.|السنة اليهودية تبدأ في الخريف، لذلك يأتي رأس السنة العبرية في هذا الفصل.|Еврейский год начинается осенью, поэтому и Рош а-Шана бывает в это время года.|The Jewish year begins in autumn, so Rosh Hashanah falls in this season.
Q איזה כלי תוקעים בו בראש השנה?|في أي آلة ينفخون في رأس السنة؟|Во что трубят на Рош а-Шана?|What do people blow on Rosh Hashanah?|o_shofar|o_ragn,o_lulav,o_dreid
Y קול השופר חזק ומעורר, ובראש השנה הוא קורא לאנשים לחשוב על השנה החדשה.|صوت الشوفار قوي ويوقظ، وفي رأس السنة العبرية يدعو الناس إلى التفكير في السنة الجديدة.|Звук шофара громкий и будит, и на Рош а-Шана он зовёт людей подумать о новом годе.|The shofar's sound is loud and stirring, and on Rosh Hashanah it calls people to think about the new year.
Q מה אוכלים בראש השנה כדי לברך על שנה מתוקה?|ماذا يأكلون في رأس السنة لسنة حلوة؟|Что едят на Рош а-Шана ради сладкого года?|What do people eat on Rosh Hashanah for a sweet year?|f_apple|f_hamen,f_sufg,f_cheese
Y הדבש מתוק, ולכן אוכלים אותו עם תפוח כדי לאחל שנה מתוקה.|العسل حلو، لذلك يأكلونه مع التفاح ليتمنّوا سنة حلوة.|Мёд сладкий, поэтому его едят с яблоком, чтобы пожелать сладкого года.|Honey is sweet, so people eat it with an apple to wish for a sweet year.
Q בערך כמה ימים עוברים מראש השנה עד יום כיפור?|تقريبًا كم يومًا بين رأس السنة ويوم الغفران؟|Примерно сколько дней между Рош а-Шана и Йом-Кипур?|About how many days are there from Rosh Hashanah to Yom Kippur?|n10|n3,n5,n40
Y ראש השנה חל ב־1 בתשרי, ויום כיפור חל ב־10 באותו חודש.|رأس السنة العبرية يقع في 1 تشري، ويوم الغفران في 10 من الشهر نفسه.|Рош а-Шана приходится на 1 тишрея, а Йом-Кипур на 10 число того же месяца.|Rosh Hashanah falls on the 1st of Tishrei, and Yom Kippur on the 10th of the same month.
Q מה עושים ביום כיפור?|ماذا يفعلون في يوم الغفران؟|Что делают в Йом-Кипур?|What do people do on Yom Kippur?|e_fast|e_party,e_swim,e_shop
Y יום כיפור הוא יום לחשוב על מה שעשינו, ולכן נוהגים בו לצום ולבקש סליחה.|يوم الغفران يوم للتفكير فيما فعلناه، لذلك من العادة فيه الصوم وطلب المسامحة.|Йом-Кипур - день, чтобы подумать о своих поступках, поэтому в этот день принято поститься и просить прощения.|Yom Kippur is a day to think about what we did, so people usually fast and ask for forgiveness.
E e_fast|t|צמים ומבקשים סליחה|يصومون ويطلبون المسامحة|постятся и просят прощения|they fast and ask for forgiveness
E e_party|t|עורכים מסיבה גדולה עם אוכל ומוזיקה|يقيمون حفلة كبيرة فيها طعام وموسيقى|устраивают большую вечеринку с едой и музыкой|they hold a big party with food and music
E e_swim|t|הולכים לשחות בים|يذهبون للسباحة في البحر|идут купаться в море|they go swimming in the sea
E e_shop|t|יוצאים לקניות|يخرجون للتسوّق|идут за покупками|they go shopping
Q איך נראים הכבישים ביום כיפור?|كيف تبدو الشوارع في يوم الغفران؟|Как выглядят дороги в Йом-Кипур?|What do the roads look like on Yom Kippur?|e_empty|e_jam,e_race,e_flood
Y ביום כיפור רוב האנשים לא נוסעים, ולכן הכבישים שקטים וריקים.|في يوم الغفران لا يسافر معظم الناس، لذلك تكون الشوارع هادئة وفارغة.|В Йом-Кипур большинство людей не ездит, поэтому дороги тихие и пустые.|On Yom Kippur most people do not drive, so the roads are quiet and empty.
E e_empty|t|ריקים ממכוניות|خالية من السيارات|пустые, без машин|empty of cars
E e_jam|t|מלאים בפקקים|مليئة بالازدحام|полные пробок|full of traffic jams
E e_race|t|יש בהם מרוצי מכוניות|فيها سباقات سيارات|там гонки машин|there are car races
E e_flood|t|מכוסים במים|مغطّاة بالماء|залиты водой|covered with water
E xc_ram|t|מקרן של איל|من قرن كبش|из рога барана|from a ram's horn
E xc_pine|t|מעץ של אורן|من خشب الصنوبر|из соснового дерева|from pine wood
E xc_copper|t|מנחושת מבריקה|من نحاس لامع|из блестящей меди|from shiny copper
E xc_plast|t|מפלסטיק צבעוני|من بلاستيك ملوّن|из цветного пластика|from colorful plastic
Q ממה עשוי השופר?|مِمّ يُصنع الشوفار؟|Из чего сделан шофар?|What is a shofar made from?|xc_ram|xc_pine,xc_copper,xc_plast
Y השופר נעשה מקרן חלולה של איל, ולכן כשנושפים בו יוצא קול חזק.|الشوفار يُصنع من قرن كبش مجوّف، لذلك عندما ننفخ فيه يخرج صوت قوي.|Шофар делают из полого рога барана, поэтому, когда в него дуют, звук получается громким.|The shofar is made from a ram's hollow horn, so blowing into it makes a loud sound.
E xc_syn|l|בבית הכנסת|في الكنيس|в синагоге|in the synagogue
E xc_school|l|בבית הספר|في المدرسة|в школе|at school
E xc_market|l|בשוק|في السوق|на рынке|at the market
E xc_beach|l|בחוף הים|على شاطئ البحر|на пляже|at the beach
Q איפה תוקעים בשופר בראש השנה?|أين ينفخون في الشوفار في رأس السنة العبرية؟|Где трубят в шофар на Рош а-Шана?|Where do people blow the shofar on Rosh Hashanah?|xc_syn|xc_school,xc_market,xc_beach
Y בראש השנה מתפללים בבית הכנסת, ושם שומעים יחד את קול השופר.|في رأس السنة العبرية يصلّون في الكنيس، وهناك يسمعون معًا صوت الشوفار.|На Рош а-Шана молятся в синагоге, и там вместе слушают звук шофара.|On Rosh Hashanah people pray in the synagogue, and there they hear the shofar together.
E xc_bike|t|על אופניים|على الدرّاجات|на велосипедах|on bicycles
E xc_horse|t|על סוסים|على الخيول|на лошадях|on horses
E xc_camel|t|על גמלים|على الجمال|на верблюдах|on camels
E xc_donkey|t|על חמורים|على الحمير|на ослах|on donkeys
Q על מה רוכבים ילדים בכבישים ביום כיפור?|على ماذا يركب الأولاد في الشوارع يوم الغفران؟|На чём катаются дети по дорогам в Йом-Кипур?|What do children ride on the roads on Yom Kippur?|xc_bike|xc_horse,xc_camel,xc_donkey
Y ביום כיפור אין מכוניות בכבישים, ולכן ילדים יכולים לרכוב שם על אופניים בבטחה.|في يوم الغفران لا توجد سيارات في الشوارع، لذلك يستطيع الأولاد ركوب الدراجات فيها بأمان.|В Йом-Кипур на дорогах нет машин, поэтому дети могут спокойно кататься там на велосипедах.|On Yom Kippur there are no cars on the roads, so children can ride bikes there safely.
E xc_better|t|טובים יותר|أفضل وألطف|добрее и лучше|kinder and better
E xc_faster|t|מהירים יותר|أسرع من قبل|быстрее, чем раньше|faster than before
E xc_stronger|t|חזקים יותר|أقوى من قبل|сильнее, чем раньше|stronger than before
E xc_richer|t|עשירים יותר|أغنى من قبل|богаче, чем раньше|richer than before
Q ביום כיפור משתדלים להיות...|في يوم الغفران نحاول أن نكون...|В Йом-Кипур стараются стать...|On Yom Kippur, people try to be...|xc_better|xc_faster,xc_stronger,xc_richer
Y ביום כיפור מבקשים סליחה על מה שעשינו, ומחליטים לנהוג טוב יותר בשנה החדשה.|في يوم الغفران يطلبون المسامحة على ما فعلوه، ويقرّرون أن يتصرّفوا أفضل في السنة الجديدة.|В Йом-Кипур просят прощения за свои поступки и решают вести себя лучше в новом году.|On Yom Kippur people ask forgiveness for what they did and decide to act better in the new year.
S sukkot|🌿|#29853c|סוכות ושמחת תורה|سوكوت وفرحة التوراة|Суккот и Симхат-Тора|Sukkot and Simchat Torah
L בסוכות בונים סוכה: בית קטן עם גג של ענפים.|في سوكوت يبنون سُكّا: بيتًا صغيرًا سقفه من الأغصان.|На Суккот строят сукку: маленький домик с крышей из веток.|On Sukkot people build a sukkah: a small hut with a roof of branches.
L דרך הענפים רואים את הכוכבים. אוכלים בסוכה ואפילו ישנים בה.|من بين الأغصان نرى النجوم. يأكلون في السُّكّا وحتى ينامون فيها.|Сквозь ветки видно звёзды. В сукке едят, а иногда и спят.|Through the branches you can see the stars. People eat in the sukkah and sometimes even sleep there.
L הסוכה מזכירה את הימים שבהם עם ישראל הלך במדבר.|السُّكّا تذكّرنا بالأيام التي مشى فيها بنو إسرائيل في الصحراء.|Сукка напоминает о днях, когда народ Израиля шёл по пустыне.|The sukkah reminds us of the days when the people of Israel walked in the desert.
L בסוכות לוקחים ארבעה מינים מיוחדים: לולב, אתרוג, הדס וערבה.|في سوكوت يأخذون أربعة أنواع خاصة: لولاف وإترُج وآسًا وصفصافًا.|На Суккот берут четыре особых растения: лулав, этрог, гадас и арава.|On Sukkot people take four special plants: a lulav, an etrog, myrtle and willow.
L החג נמשך שבעה ימים. אחריו חוגגים את שמחת תורה.|يستمرّ العيد سبعة أيام. وبعده يحتفلون بفرحة التوراة.|Праздник длится семь дней. После него отмечают Симхат-Тору.|The holiday lasts seven days. After it comes Simchat Torah.
L בשמחת תורה מסיימים לקרוא את ספר התורה ומתחילים אותו מחדש. רוקדים עם ספרי תורה ושרים.|في فرحة التوراة ينتهون من قراءة سفر التوراة ويبدؤونه من جديد. يرقصون مع لفائف التوراة ويغنّون.|На Симхат-Тору заканчивают читать свиток Торы и начинают заново. Танцуют со свитками и поют.|On Simchat Torah people finish reading the Torah scroll and start it again. They dance with the scrolls and sing.
Q איזה חג בונים בו סוכה?|في أي عيد يبنون سُكّا؟|В какой праздник строят сукку?|In which holiday do people build a sukkah?|h_suk|h_pur,h_han,h_tub
Y השם של החג בא מהסוכה, הבית הקטן שבונים בחג הזה.|اسم العيد سوكوت جاء من السُّكّا، البيت الصغير الذي يبنونه في هذا العيد.|Название праздника Суккот происходит от сукки, маленького домика, который строят в этот праздник.|The name Sukkot comes from the sukkah, the small hut people build on this holiday.
Q ממה עשוי גג הסוכה?|مِمَّ يُصنع سقف السُّكّا؟|Из чего сделана крыша сукки?|What is the roof of a sukkah made of?|e_branch|e_concr,e_glass,e_tiles
Y גג של ענפים מזכיר בית זמני במדבר, ודרכו אפשר לראות את השמיים.|سقف الأغصان يذكّر ببيت مؤقّت في الصحراء، ومن خلاله نرى السماء.|Крыша из веток напоминает временный дом в пустыне, и сквозь неё видно небо.|A roof of branches recalls a temporary home in the desert, and you can see the sky through it.
E e_branch|t|מענפים|من الأغصان|из веток|branches
E e_concr|t|מבטון|من الإسمنت|из бетона|concrete
E e_glass|t|מזכוכית|من الزجاج|из стекла|glass
E e_tiles|t|מרעפים|من القرميد|из черепицы|roof tiles
Q כמה מינים מיוחדים לוקחים בסוכות?|كم نوعًا خاصًّا يأخذون في سوكوت؟|Сколько особых растений берут на Суккот?|How many special plants do people take on Sukkot?|n4|n3,n7,n10
Y בחג לוקחים יחד לולב, אתרוג, הדס וערבה, וכך יוצאים 4 מינים.|في العيد يأخذون معًا لولاف وإترُج وآسًا وصفصافًا، فيصبح العدد 4 أنواع.|В праздник берут вместе лулав, этрог, гадас и араву, и получается 4 растения.|On the holiday people hold a lulav, an etrog, myrtle and willow together, which makes 4 kinds.
Q איזה מהדברים האלה הוא אחד מארבעת המינים?|أي من هذه الأشياء هو أحد الأنواع الأربعة؟|Что из этого - одно из четырёх растений?|Which of these is one of the four plants?|o_lulav|o_dreid,o_ragn,o_shofar
Y הלולב הוא ענף ארוך של עץ תמר, והוא המין הגבוה מבין ארבעת המינים.|اللولاف سعفة طويلة من شجرة النخيل، وهو الأطول بين الأنواع الأربعة.|Лулав - длинная ветвь финиковой пальмы, самое высокое из четырёх растений.|A lulav is a long palm branch, the tallest of the four kinds.
Q כמה ימים נמשך חג סוכות?|كم يومًا يستمرّ عيد سوكوت؟|Сколько дней длится Суккот?|How many days does Sukkot last?|n7|n3,n10,n40
Y בתורה כתוב לשבת בסוכה 7 ימים, ולכן החג נמשך שבוע.|مكتوب في التوراة الجلوس في السُّكّا 7 أيام، لذلك يستمرّ العيد أسبوعًا.|В Торе написано жить в сукке 7 дней, поэтому праздник длится неделю.|The Torah says to stay in the sukkah for 7 days, so the holiday lasts a week.
Q מה עושים בשמחת תורה?|ماذا يفعلون في فرحة التوراة؟|Что делают на Симхат-Тору?|What do people do on Simchat Torah?|e_dance|e_fastt,e_sleepb,e_nothing
Y בשמחת תורה מסיימים לקרוא את כל התורה, ולכן שמחים ורוקדים איתה.|في فرحة التوراة ينتهون من قراءة التوراة كلها، لذلك يفرحون ويرقصون معها.|На Симхат-Тору заканчивают читать всю Тору, поэтому радуются и танцуют с ней.|On Simchat Torah people finish reading the whole Torah, so they celebrate and dance with it.
E e_dance|t|רוקדים עם ספרי תורה|يرقصون مع لفائف التوراة|танцуют со свитками Торы|they dance with Torah scrolls
E e_fastt|t|צמים כל היום ולא קוראים ספר תורה|يصومون طوال اليوم ولا يقرؤون التوراة|постятся весь день и не читают Тору|they fast all day and do not read the Torah
E e_sleepb|t|ישנים בסוכה|ينامون في السُّكّا|спят в сукке|they sleep in the sukkah
E e_nothing|t|מחזירים את ספר התורה לארון עד השנה הבאה|يعيدون لفيفة التوراة إلى الخزانة حتى السنة القادمة|убирают свиток Торы в шкаф до следующего года|they put the Torah scroll away in the ark until next year
E xc_desert|t|את ההליכה של עם ישראל במדבר|مسيرة شعب إسرائيل في الصحراء|странствие народа Израиля по пустыне|the people of Israel walking in the desert
E xc_oilmir|t|את הנס של השמן במקדש|معجزة الزيت في الهيكل|чудо с маслом в Храме|the miracle of the oil in the Temple
E xc_megread|t|את הסיפור של אסתר ומרדכי|قصة إستير ومردخاي|историю про Эстер и Мордехая|the story of Esther and Mordecai
E xc_treepl|t|את הנטיעה של עצים בחורף|غرس الأشجار في الشتاء|посадку деревьев зимой|planting trees in winter
Q מה הסוכה מזכירה לנו?|بماذا تذكّرنا السُّكّا؟|О чём напоминает нам сукка?|What does the sukkah remind us of?|xc_desert|xc_oilmir,xc_megread,xc_treepl
Y במדבר עם ישראל גר בבתים זמניים, והסוכה דומה לבית כזה.|في الصحراء سكن بنو إسرائيل في بيوت مؤقّتة، والسُّكّا تشبه بيتًا كهذا.|В пустыне народ Израиля жил во временных домах, и сукка похожа на такой дом.|In the desert the people of Israel lived in temporary homes, and the sukkah is like one.
E xc_stars|t|את הכוכבים|النجوم|звёзды|the stars
E xc_rainbow|t|את הקשת בענן|قوس قزح|радугу|a rainbow
E xc_ceiling|t|את התקרה הלבנה|السقف الأبيض|белый потолок|the white ceiling
E xc_sunhot|t|את השמש החמה|الشمس الحارّة|жаркое солнце|the hot sun
Q מה רואים בלילה דרך הענפים של גג הסוכה?|ماذا نرى في الليل من خلال أغصان سقف السُّكّا؟|Что видно ночью сквозь ветки на крыше сукки?|At night, what can you see through the branches of the sukkah roof?|xc_stars|xc_rainbow,xc_ceiling,xc_sunhot
Y גג הסוכה עשוי מענפים עם רווחים, ולכן בלילה רואים דרכו את הכוכבים.|سقف السُّكّا من أغصان بينها فراغات، لذلك نرى منه النجوم في الليل.|Крыша сукки из веток с просветами, поэтому ночью сквозь неё видно звёзды.|The sukkah roof is made of branches with gaps, so at night you can see the stars through it.
E xc_eatsl|t|אוכלים בה ואפילו ישנים בה|يأكلون فيها وحتى ينامون فيها|едят в ней и даже спят|they eat in it and even sleep in it
E xc_haggr|t|קוראים בה את ההגדה|يقرأون فيها الهغاداه|читают в ней Аггаду|they read the Haggadah in it
E xc_costu|t|מתחפשים בה ומרעישים ברעשן|يتنكّرون فيها ويُحدثون ضجيجًا بالمِقرعة|наряжаются в ней и шумят трещоткой|they dress up in it and shake noisemakers
E xc_fastin|t|צמים בה ומבקשים סליחה|يصومون فيها ويطلبون السماح|постятся в ней и просят прощения|they fast in it and ask for forgiveness
Q מה עושים בסוכה?|ماذا يفعلون في السُّكّا؟|Что делают в сукке?|What do people do in the sukkah?|xc_eatsl|xc_haggr,xc_costu,xc_fastin
Y בחג הזה הסוכה היא כמו בית, ולכן נוהגים לאכול בה ואפילו לישון בה.|في هذا العيد تكون السُّكّا مثل البيت، لذلك من العادة الأكل فيها وحتى النوم.|В этот праздник сукка как дом, поэтому в ней принято есть и даже спать.|On this holiday the sukkah is like a home, so people eat in it and even sleep there.
Q איזה חג חוגגים מיד אחרי סוכות?|أي عيد يحتفلون به مباشرة بعد سوكوت؟|Какой праздник отмечают сразу после Суккота?|Which holiday comes right after Sukkot?|h_simh|h_han,h_rosh,h_shav
Y שמחת תורה הוא היום שסוגר את חגי הסתיו, ולכן הוא בא מיד אחרי סוכות.|فرحة التوراة هو اليوم الذي يختم أعياد الخريف، لذلك يأتي مباشرة بعد سوكوت.|Симхат-Тора завершает осенние праздники, поэтому она идёт сразу после Суккота.|Simchat Torah closes the autumn holidays, so it comes right after Sukkot.
S hanuka|🕎|#b35d00|חנוכה: חג האורים|حانوكا: عيد الأنوار|Ханука: праздник огней|Hanukkah: The Festival of Lights
L לפני הרבה שנים המקדש בירושלים היה מלוכלך. המכבים ניצחו והחזירו אותו לעם.|قبل سنوات كثيرة كان الهيكل في القدس متّسخًا. انتصر المكابيون وأعادوه للشعب.|Много лет назад Храм в Иерусалиме был осквернён. Маккавеи победили и вернули его народу.|Many years ago the Temple in Jerusalem was dirty. The Maccabees won and gave it back to the people.
L במקדש היה רק קצת שמן, אבל הוא דלק שמונה ימים. זה היה נס.|لم يكن في الهيكل إلا القليل من الزيت، لكنه اشتعل ثمانية أيام. كانت تلك معجزة.|В Храме было совсем мало масла, но оно горело восемь дней. Это было чудо.|There was only a little oil in the Temple, but it burned for eight days. It was a miracle.
L בחנוכה מדליקים חנוכייה. בכל לילה מדליקים נר אחד יותר.|في حانوكا يُشعلون شمعدان حانوكا. كل ليلة يُشعلون شمعة إضافية.|На Хануку зажигают ханукию. Каждую ночь зажигают на одну свечу больше.|On Hanukkah people light a hanukkiah. Every night they light one more candle.
L יש בחנוכייה תשעה קנים. אחד מהם הוא השמש, הנר שמדליקים בו את האחרים.|في الشمعدان تسعة فروع. أحدها هو الشمّاش، الشمعة التي نُشعل بها الباقي.|У ханукии девять рожков. Один из них - шамаш, свеча, от которой зажигают остальные.|The hanukkiah has nine branches. One is the shamash, the candle that lights the others.
L אוכלים סופגניות ולביבות, כי הן מטוגנות בשמן. משחקים בסביבון.|يأكلون السوفغانيا واللَّبيبوت لأنها تُقلى بالزيت. ويلعبون بالسفيفون.|Едят суфгании и латкес: их жарят в масле. Играют в волчок-севивон.|People eat sufganiyot and latkes, because they are fried in oil. They play with a dreidel.
Q איזה חג נמשך שמונה ימים ומדליקים בו נרות כל לילה?|أي عيد يستمرّ ثمانية أيام ويُشعلون فيه الشموع كل ليلة؟|Какой праздник длится восемь дней, и в нём каждую ночь зажигают свечи?|Which holiday lasts eight days, with candles lit every night?|h_han|h_pur,h_suk,h_shav
Y בחנוכה זוכרים שמן שדלק 8 ימים, ולכן מדליקים נרות 8 לילות.|في حانوكا نتذكّر زيتًا اشتعل 8 أيام، لذلك نُشعل الشموع 8 ليالٍ.|На Хануку вспоминают масло, которое горело 8 дней, поэтому свечи зажигают 8 ночей.|Hanukkah recalls oil that burned for 8 days, so candles are lit for 8 nights.
Q על איזה נס מספרים בחנוכה?|عن أي معجزة نحكي في حانوكا؟|О каком чуде рассказывают на Хануку?|Which miracle do we tell about on Hanukkah?|e_oil|e_rain,e_sea,e_bread
Y היה שמן רק ליום אחד, אבל הוא דלק 8 ימים, ולכן קוראים לזה נס.|كان الزيت يكفي ليوم واحد فقط، لكنه اشتعل 8 أيام، لذلك نسمّي ذلك معجزة.|Масла было всего на один день, но оно горело 8 дней, поэтому это называют чудом.|There was oil for only one day, but it burned for 8 days, so it is called a miracle.
E e_oil|t|מעט שמן דלק שמונה ימים|القليل من الزيت اشتعل ثمانية أيام|немного масла горело восемь дней|a little oil burned for eight days
E e_rain|t|גשם ירד ארבעים יום וכיסה את כל הארץ|نزل المطر أربعين يومًا وغطّى كل البلاد|дождь шёл сорок дней и покрыл всю страну|rain fell for forty days and covered the whole land
E e_sea|t|הנרות נדלקו בלי גפרור|اشتعلت الشموع بلا عود ثقاب|свечи зажглись без спички|the candles lit without a match
E e_bread|t|המקדש נבנה ביום אחד|بُني الهيكل في يوم واحد|Храм построили за один день|the Temple was built in one day
Q איך קוראים לנר שמדליקים בו את שאר הנרות?|ماذا نسمّي الشمعة التي نُشعل بها باقي الشموع؟|Как называется свеча, от которой зажигают остальные?|What is the candle that lights the others called?|e_shamash|e_hamash,e_hall,e_goal
Y המילה שמש כאן פירושה עוזר, כי הנר הזה עוזר להדליק את כל האחרים.|كلمة الشمّاش تعني الخادم أو المساعد، لأن هذه الشمعة تساعد في إشعال كل الشموع الأخرى.|Шамаш значит помощник, ведь эта свеча помогает зажечь все остальные.|Shamash means helper, because this candle helps light all the others.
E e_shamash|t|השמש|الشمّاش|шамаш|the shamash
E e_hamash|t|הסביבון|السفيفون|севивон|the dreidel
E e_hall|t|המגילה|الميغيلا|мегила|the megillah
E e_goal|t|השופר|الشوفار|шофар|the shofar
Q כמה קנים יש בחנוכייה, כולל השמש?|كم فرعًا في شمعدان حانوكا مع الشمّاش؟|Сколько рожков у ханукии вместе с шамашем?|How many branches does a hanukkiah have, with the shamash?|n9|n7,n8,n10
Y בחנוכה מדליקים עד 8 נרות, ועוד קנה אחד מחזיק את השמש, וביחד הם 9.|في حانوكا نُشعل حتى 8 شموع، وفرع آخر يحمل الشمّاش، فيصبح المجموع 9.|На Хануку зажигают до 8 свечей, и ещё один рожок держит шамаш, всего 9.|Up to 8 candles are lit on Hanukkah, and one more branch holds the shamash, so there are 9.
Q איזה מאכל אוכלים בחנוכה?|أي طعام يأكلون في حانوكا؟|Какое блюдо едят на Хануку?|Which food do people eat on Hanukkah?|f_sufg|f_matz,f_hamen,f_bbq
Y סופגנייה מטוגנת בשמן, והשמן מזכיר את נס השמן במקדש.|السوفغانيا تُقلى بالزيت، والزيت يذكّر بمعجزة الزيت في الهيكل.|Суфганию жарят в масле, а масло напоминает о чуде с маслом в Храме.|A sufganiyah is fried in oil, and the oil recalls the miracle of the oil in the Temple.
Q באיזה משחק משחקים בחנוכה?|أي لعبة يلعبون في حانوكا؟|Во что играют на Хануку?|Which game do people play on Hanukkah?|o_dreid|o_ragn,o_lulav,o_megil
Y על הסביבון כתובות אותיות שמזכירות את הנס, ולכן משחקים בו בחנוכה.|على السفيفون حروف تذكّر بالمعجزة، لذلك يلعبون به في حانوكا.|На севивоне написаны буквы, которые напоминают о чуде, поэтому в него играют на Хануку.|A dreidel has letters that recall the miracle, so children play with it on Hanukkah.
E xc_macc|p|המכבים|المكابيون|Маккавеи|the Maccabees
Q מי ניצחו והחזירו את המקדש לעם?|من انتصر وأعاد الهيكل إلى الشعب؟|Кто победил и вернул Храм народу?|Who won and gave the Temple back to the people?|xc_macc|e_moses,e_noah,e_esther
Y המכבים נלחמו וניצחו, ואז ניקו את המקדש והחזירו אותו לעם.|حارب المكابيون وانتصروا، ثم نظّفوا الهيكل وأعادوه للشعب.|Маккавеи сражались и победили, а потом очистили Храм и вернули его народу.|The Maccabees fought and won, then they cleaned the Temple and gave it back to the people.
E xc_jlm|l|בירושלים|في القدس|в Иерусалиме|in Jerusalem
Q באיזו עיר היה המקדש?|في أي مدينة كان الهيكل؟|В каком городе был Храм?|In which city was the Temple?|xc_jlm|e_haifa2,e_eilat2,e_safed2
Y ירושלים הייתה העיר החשובה ביותר לעם, ולכן שם נבנה המקדש.|كانت القدس أهمّ مدينة للشعب، لذلك بُني فيها الهيكل.|Иерусалим был самым важным городом для народа, поэтому Храм построили там.|Jerusalem was the most important city for the people, so the Temple was built there.
E xc_onemore|t|נר אחד יותר מאתמול|شمعة واحدة أكثر من أمس|на одну свечу больше, чем вчера|one more candle than the night before
E xc_oneless|t|נר אחד פחות מאתמול|شمعة واحدة أقل من أمس|на одну свечу меньше, чем вчера|one less candle than the night before
E xc_allnine|t|את כל הנרות כבר בלילה הראשון|كل الشموع منذ الليلة الأولى|все свечи уже в первый вечер|all the candles on the very first night
E xc_onlysh|t|רק את השמש, בלי נרות נוספים|الشمّاش فقط، بلا شموع أخرى|только шамаш, без других свечей|only the shamash, with no other candles
Q כמה נרות מדליקים בכל לילה של חנוכה?|كم شمعة يُشعلون في كل ليلة من حانوكا؟|Сколько свечей зажигают каждый вечер Хануки?|How many candles do people light each night of Hanukkah?|xc_onemore|xc_oneless,xc_allnine,xc_onlysh
Y כל לילה מוסיפים נר, וכך האור גדל עד שבלילה האחרון דולקים כל הנרות.|كل ليلة نضيف شمعة، فيكبر النور حتى تشتعل كل الشموع في الليلة الأخيرة.|Каждую ночь добавляют свечу, и свет растёт, пока в последнюю ночь не горят все свечи.|Each night one candle is added, so the light grows until all the candles burn on the last night.
E xc_fried|t|הן מטוגנות בשמן|مقليّة بالزيت|их жарят в масле|they are fried in oil
E xc_baked|t|הן אפויות בתנור|مخبوزة في الفرن|их пекут в духовке|they are baked in the oven
E xc_boiled|t|הן מבושלות במים|مسلوقة في الماء|их варят в воде|they are boiled in water
E xc_frozen|t|הן מוגשות קפואות|تُقدَّم مجمّدة|их подают замороженными|they are served frozen
Q מה משותף לסופגניות וללביבות?|ما المشترك بين السوفغانيا وفطائر البطاطا (لفيفوت)؟|Что общего у пончиков-суфганиёт и оладий-латкес?|What do sufganiyot and latkes have in common?|xc_fried|xc_baked,xc_boiled,xc_frozen
Y את שתיהן מכינים במחבת עם שמן, כדי לזכור את נס השמן.|كلاهما يُحضَّر في مقلاة مع زيت، لكي نتذكّر معجزة الزيت.|И то и другое готовят на сковороде с маслом, чтобы вспомнить чудо с маслом.|Both are cooked in a pan with oil, to remember the miracle of the oil.
S tubi|🌳|#50810b|ט״ו בשבט: ראש השנה לאילנות|طو بشفاط: رأس السنة للأشجار|Ту би-Шват: Новый год деревьев|Tu BiShvat: New Year of the Trees
L ט״ו בשבט הוא ראש השנה לאילנות. הוא חל בסוף החורף.|طو بشفاط هو رأس السنة للأشجار. ويأتي في نهاية الشتاء.|Ту би-Шват - Новый год деревьев. Он бывает в конце зимы.|Tu BiShvat is the New Year of the Trees. It comes at the end of winter.
L אז הגשמים כבר מרווים את האדמה, והעצים מתחילים להתעורר.|في هذا الوقت تروي الأمطار الأرض وتبدأ الأشجار بالاستيقاظ.|К этому времени дожди уже напоили землю, и деревья начинают просыпаться.|By then the rains have watered the ground, and the trees begin to wake up.
L ילדים בכל הארץ נוטעים שתילים. עץ קטן יכול לגדול ולתת צל ופירות.|يزرع الأولاد في كل البلاد شتلات. شجرة صغيرة تكبر وتعطي ظلًّا وثمارًا.|Дети по всей стране сажают саженцы. Маленькое деревце вырастает и даёт тень и плоды.|Children all over the country plant saplings. A small tree can grow and give shade and fruit.
L אוכלים פירות. יש שבעה מינים שמיוחדים לארץ ישראל: חיטה, שעורה, גפן, תאנה, רימון, זית ותמר.|يأكلون الفواكه. هناك سبعة أنواع مميزة لأرض إسرائيل: القمح والشعير والعنب والتين والرمّان والزيتون والتمر.|Едят фрукты. Есть семь видов, особенных для земли Израиля: пшеница, ячмень, виноград, инжир, гранат, оливки и финики.|People eat fruit. There are seven kinds special to the Land of Israel: wheat, barley, grapes, figs, pomegranates, olives and dates.
L חשוב לשמור על העצים ולא לקטוף ענפים. העצים נותנים לנו אוויר נקי.|من المهمّ أن نحافظ على الأشجار وألّا نقطف الأغصان. الأشجار تعطينا هواءً نظيفًا.|Важно беречь деревья и не ломать ветки. Деревья дают нам чистый воздух.|It is important to take care of trees and not to break branches. Trees give us clean air.
Q איזה חג הוא ראש השנה לאילנות?|أي عيد هو رأس السنة للأشجار؟|Какой праздник - Новый год деревьев?|Which holiday is the New Year of the Trees?|h_tub|h_rosh,h_pes,h_sigd
Y בט״ו בשבט העצים מתחילים להתעורר אחרי החורף, ולכן זה החג שלהם.|في طو بشفاط تبدأ الأشجار بالاستيقاظ بعد الشتاء، لذلك هذا عيدها.|В Ту би-Шват деревья начинают просыпаться после зимы, поэтому это их праздник.|On Tu BiShvat the trees start to wake up after winter, so it is their holiday.
Q מה עושים בט״ו בשבט?|ماذا يفعلون في طو بشفاط؟|Что делают на Ту би-Шват?|What do people do on Tu BiShvat?|e_plant|e_fastb,e_costum,e_matzah
Y זה החג של העצים, ולכן בחג הזה נוהגים לשתול עצים ולאכול מהפירות שלהם.|هذا عيد الأشجار، لذلك من العادة فيه زرع الأشجار وأكل ثمارها.|Это праздник деревьев, поэтому в этот день принято сажать деревья и есть их плоды.|This is the holiday of the trees, so people usually plant trees and eat their fruit.
E e_plant|t|נוטעים שתילים ואוכלים פירות|يزرعون الشتلات ويأكلون الفواكه|сажают саженцы и едят фрукты|they plant saplings and eat fruit
E e_fastb|t|צמים עד הערב|يصومون حتى المساء|постятся до вечера|they fast until evening
E e_costum|t|מתחפשים ומחלקים משלוחי מנות|يتنكّرون ويوزّعون هدايا الطعام|надевают костюмы и дарят угощения|they wear costumes and give food gifts
E e_matzah|t|אוכלים רק מצות|يأكلون الفطير فقط|едят только мацу|they eat only matzah
Q כמה מינים מיוחדים לארץ ישראל יש ברשימה?|كم نوعًا مميزًا لأرض إسرائيل في القائمة؟|Сколько особых видов для земли Израиля в списке?|How many special kinds are on the list of the Land of Israel?|n7|n3,n4,n12
Y ברשימה יש חיטה, שעורה, גפן, תאנה, רימון, זית ותמר, ואם סופרים אותם יוצא 7.|في القائمة القمح والشعير والعنب والتين والرمّان والزيتون والتمر، وعددها 7.|В списке пшеница, ячмень, виноград, инжир, гранат, оливки и финики, всего 7.|The list has wheat, barley, grapes, figs, pomegranates, olives and dates, which makes 7.
Q איזה מהדברים האלה הוא אחד משבעת המינים?|أي من هذه أحد الأنواع السبعة؟|Что из этого - один из семи видов?|Which of these is one of the seven kinds?|f_olive|f_orang,f_banan,f_water
Y עץ הזית גדל בארץ ישראל כבר אלפי שנים, ולכן הוא אחד משבעת המינים.|شجرة الزيتون تنمو في أرض إسرائيل منذ آلاف السنين، لذلك هي من الأنواع السبعة.|Оливковое дерево растёт в земле Израиля тысячи лет, поэтому оно одно из семи видов.|The olive tree has grown in the Land of Israel for thousands of years, so it is one of the seven kinds.
E f_olive|f|זית|زيتون|оливки|olives
E f_choc|f|שוקולד|شوكولاتة|шоколад|chocolate
E f_pizza|f|פיצה|بيتزا|пицца|pizza
E f_candy|f|סוכריות גומי|حلوى مطّاطية|жевательные конфеты|gummy candy
E f_orang|f|תפוז|برتقال|апельсин|an orange
E f_banan|f|בננה|موز|банан|a banana
E f_water|f|אבטיח|بطّيخ|арбуз|a watermelon
Q באיזו עונה חל ט״ו בשבט?|في أي فصل يأتي طو بشفاط؟|В какое время года бывает Ту би-Шват?|In which season does Tu BiShvat come?|e_winter|e_summer,e_aut,e_spring
Y בסוף החורף כבר ירד הרבה גשם, והעצים מוכנים להתחיל לפרוח.|في نهاية الشتاء يكون قد نزل مطر كثير، والأشجار جاهزة لتبدأ بالإزهار.|К концу зимы уже выпало много дождей, и деревья готовы зацвести.|By the end of winter a lot of rain has fallen, and the trees are ready to bloom.
E e_winter|t|בסוף החורף|في نهاية الشتاء|в конце зимы|at the end of winter
E e_summer|t|באמצע הקיץ|في منتصف الصيف|в середине лета|in the middle of summer
E e_aut|t|בתחילת הסתיו|في بداية الخريف|в начале осени|at the start of autumn
E e_spring|t|בסוף האביב|في نهاية الربيع|в конце весны|at the end of spring
Q למה חשוב לשמור על העצים?|لماذا من المهمّ الحفاظ على الأشجار؟|Почему важно беречь деревья?|Why is it important to take care of trees?|e_air|e_noise,e_dirt,e_cold
Y בלי עצים לא היו לנו צל, פירות טעימים ואוויר נקי לנשימה.|من دون الأشجار لن يكون لنا ظلّ ولا ثمار لذيذة ولا هواء نظيف نتنفّسه.|Без деревьев у нас не было бы тени, вкусных плодов и чистого воздуха.|Without trees we would have no shade, no tasty fruit and no clean air to breathe.
E e_air|t|הם נותנים צל, פירות ואוויר נקי|تعطينا ظلًّا وثمارًا وهواءً نظيفًا|они дают тень, плоды и чистый воздух|they give shade, fruit and clean air
E e_noise|t|הם מסתירים את השמש מהגינה בכל שעות היום|إنها تحجب الشمس عن الحديقة طوال ساعات النهار|они целый день закрывают от сада солнце|they keep the sun off the garden all day long
E e_dirt|t|הם מפילים עלים ומלכלכים את הרחוב|إنها تُسقط الأوراق وتوسّخ الشارع|они роняют листья и пачкают улицу|they drop leaves and make the street dirty
E e_cold|t|הם מקררים את מי הים|إنها تبرّد مياه البحر|они охлаждают морскую воду|they cool the sea water
E xc_wake|t|הם מתחילים להתעורר|تبدأ بالاستيقاظ|они начинают просыпаться|they start to wake up
E xc_lose|t|הם מאבדים את כל העלים|تفقد كل أوراقها|они теряют все листья|they lose all their leaves
E xc_dry|t|הם מתייבשים בשמש החמה|تجفّ في الشمس الحارّة|они сохнут на жарком солнце|they dry out in the hot sun
E xc_snowc|t|הם מתכסים בשלג לבן|تُغطّى بالثلج الأبيض|их покрывает белый снег|they get covered in white snow
Q מה קורה לעצים בזמן ט״ו בשבט?|ماذا يحدث للأشجار في وقت طو بشفاط؟|Что происходит с деревьями в Ту би-Шват?|What happens to the trees around Tu BiShvat?|xc_wake|xc_lose,xc_dry,xc_snowc
Y אחרי גשמי החורף יש לעצים מים, ולכן הם מתחילים לצמוח שוב.|بعد أمطار الشتاء يكون للأشجار ماء، لذلك تبدأ بالنمو من جديد.|После зимних дождей у деревьев есть вода, поэтому они снова начинают расти.|After the winter rains the trees have water, so they start to grow again.
E xc_rains|t|הגשמים|الأمطار|дожди|the rains
E xc_winds|t|הרוחות|الرياح|ветры|the winds
E xc_sunray|t|קרני השמש|أشعة الشمس|солнечные лучи|the sun's rays
E xc_sand|t|החול החם|الرمل الحارّ|горячий песок|the hot sand
Q מה מרווה את האדמה לפני ט״ו בשבט?|ما الذي يروي الأرض قبل طو بشفاط؟|Что напитывает землю водой перед Ту би-Шват?|What waters the soil before Tu BiShvat?|xc_rains|xc_winds,xc_sunray,xc_sand
Y בחורף יורדים הרבה גשמים, והמים נכנסים לאדמה ומשקים אותה.|في الشتاء تنزل أمطار كثيرة، والماء يدخل التربة ويسقيها.|Зимой идёт много дождей, вода уходит в землю и поит её.|In winter a lot of rain falls, and the water soaks into the ground.
E xc_7min|t|הם משבעת המינים|إنها من الأنواع السبعة|они из семи видов|they are among the Seven Species
E xc_europe|t|הם גדלים רק באירופה|تنمو في أوروبا فقط|они растут только в Европе|they grow only in Europe
E xc_veg|t|הם ירקות ולא פירות|إنها خضار وليست فواكه|это овощи, а не фрукты|they are vegetables, not fruits
E xc_hanfood|t|הם מאכלים של חנוכה|إنها أكلات حانوكا|это блюда Хануки|they are Hanukkah foods
Q מה משותף לרימון, לתאנה ולתמר?|ما المشترك بين الرمّان والتين والتمر؟|Что общего у граната, инжира и финика?|What do pomegranates, figs and dates have in common?|xc_7min|xc_europe,xc_veg,xc_hanfood
Y רימון, תאנה ותמר כתובים כולם ברשימת 7 המינים של ארץ ישראל.|الرمّان والتين والتمر كلها مذكورة في قائمة الأنواع السبعة لأرض إسرائيل.|Гранат, инжир и финики входят в список семи видов земли Израиля.|Pomegranates, figs and dates are all on the list of the seven kinds of the Land of Israel.
E xc_nopick|t|לא קוטפים מהם ענפים|لا نقطف أغصانها|не ломаем у них ветки|we do not pick their branches
E xc_carve|t|חורטים שמות על הגזע|نحفر أسماء على الجذع|вырезаем имена на стволе|we carve names on the trunk
E xc_climb|t|מטפסים ושוברים ענפים|نتسلّق ونكسر الأغصان|лазаем и ломаем ветки|we climb and break branches
E xc_fire|t|מדליקים מדורה ליד הגזע|نُشعل نارًا بجانب الجذع|разводим костёр у ствола|we light a fire next to the trunk
Q איך שומרים על העצים?|كيف نحافظ على الأشجار؟|Как беречь деревья?|How do we take care of trees?|xc_nopick|xc_carve,xc_climb,xc_fire
Y ענף שנשבר כבר לא יגדל, ולכן העץ נשאר חזק כשלא קוטפים ממנו.|الغصن المكسور لا ينمو بعد ذلك، لذلك تبقى الشجرة قوية عندما لا نقطف منها.|Сломанная ветка больше не вырастет, поэтому дерево остаётся сильным, если ветки не ломать.|A broken branch will not grow again, so the tree stays strong when we leave its branches alone.
S purim|🎭|#862e9c|פורים: חג התחפושות|بوريم: عيد التنكّر|Пурим: праздник костюмов|Purim: The Costume Holiday
L בפורים קוראים את סיפור אסתר ומרדכי. הסיפור כתוב במגילה.|في بوريم يقرؤون قصة إستير ومردخاي. والقصة مكتوبة في المغيلا.|На Пурим читают историю Эстер и Мордехая. Она записана в свитке-мегиле.|On Purim people read the story of Esther and Mordechai. The story is written in the megillah.
L המן הרע רצה לפגוע ביהודים, אבל אסתר המלכה עזרה להציל אותם.|أراد هامان الشرّير أن يؤذي اليهود، لكن الملكة إستير ساعدت في إنقاذهم.|Злой Аман хотел навредить евреям, но царица Эстер помогла их спасти.|Wicked Haman wanted to hurt the Jewish people, but Queen Esther helped to save them.
L כששומעים את השם המן, מרעישים ברעשנים.|عندما نسمع اسم هامان نصدر ضجيجًا بالمِقرعات.|Когда слышат имя Аман, шумят трещотками.|When people hear the name Haman, they make noise with noisemakers.
L ילדים ומבוגרים מתחפשים. אפשר להתחפש לכל דמות שאוהבים.|يتنكّر الأولاد والكبار. يمكن أن تتنكّر بأي شخصية تحبّها.|Дети и взрослые надевают костюмы. Можно нарядиться кем угодно.|Children and adults wear costumes. You can dress up as any character you like.
L שולחים משלוחי מנות לחברים ולשכנים, ונותנים מתנות לאנשים שצריכים עזרה.|يرسلون هدايا طعام للأصدقاء والجيران، ويعطون هدايا لمن يحتاج إلى مساعدة.|Отправляют друзьям и соседям угощения и дарят подарки тем, кому нужна помощь.|People send food gifts to friends and neighbors, and give gifts to people who need help.
L אוכלים אוזני המן, עוגיות עם מילוי.|يأكلون آذان هامان، وهي كعكات محشوّة.|Едят уши Амана - печенье с начинкой.|People eat hamantashen, cookies with a filling.
Q איזה חג הוא חג התחפושות?|أي عيد هو عيد التنكّر؟|Какой праздник - праздник костюмов?|Which holiday is the costume holiday?|h_pur|h_suk,h_shab,h_tub
Y בסיפור אסתר הסתירה בהתחלה מי היא, ולכן בחג הזה נוהגים להתחפש.|في القصة أخفت إستير في البداية من هي، لذلك من العادة في هذا العيد أن نتنكّر.|В истории Эстер сначала скрывала, кто она, поэтому в этот праздник принято надевать костюмы.|In the story Esther first hid who she was, so on this holiday people dress up in costumes.
Q איפה כתוב סיפור פורים?|أين كُتبت قصة بوريم؟|Где записана история Пурима?|Where is the story of Purim written?|o_megil|o_dreid,o_shofar,o_lulav
Y סיפור אסתר נכתב על קלף ארוך שמגלגלים, וקלף כזה נקרא מגילה.|قصة إستير مكتوبة على رقّ طويل يُلفّ، وهذا الرقّ يُسمّى المغيلا (اللفافة).|История Эстер записана на длинном свёрнутом пергаменте, и такой свиток называется мегила.|Esther's story is written on a long rolled scroll, and such a scroll is called a megillah.
Q איך קוראים לדמות הטובה והאמיצה בסיפור?|ما اسم الشخصية الطيبة والشجاعة في القصة؟|Как зовут добрую и смелую героиню истории?|Who is the kind and brave character in the story?|e_esther|e_haman,e_moses,e_king
Y אסתר הסתכנה כשביקשה מהמלך להציל את היהודים, ולכן היא אמיצה.|خاطرت إستير عندما طلبت من الملك إنقاذ اليهود، لذلك هي شجاعة.|Эстер рисковала, когда просила царя спасти евреев, поэтому она смелая.|Esther took a risk when she asked the king to save the Jewish people, so she is brave.
E e_esther|p|המלכה אסתר|الملكة إستير|царица Эстер|Queen Esther
E e_haman|p|המן|هامان|Аман|Haman
E e_king|p|המלך אחשוורוש|الملك أحشويروش|царь Ахашверош|King Ahasuerus
E e_moses|p|משה|موسى|Моисей|Moses
E e_noah|p|נח|نوح|Ной|Noah
Q במה מרעישים כששומעים את השם המן?|بماذا نُحدث الضجيج عندما نسمع اسم هامان؟|Чем шумят, услышав имя Аман?|What do people make noise with when they hear the name Haman?|o_ragn|o_shofar,o_chanu,o_sukk
Y המן היה הרע בסיפור, ולכן מרעישים כדי שלא ישמעו את שמו.|هامان كان الشرير في القصة، لذلك نصدر ضجيجًا كي لا يُسمع اسمه.|Аман был злодеем в истории, поэтому шумят, чтобы не было слышно его имени.|Haman was the bad one in the story, so people make noise so his name is not heard.
Q מה שולחים לחברים בפורים?|ماذا يرسلون للأصدقاء في بوريم؟|Что отправляют друзьям на Пурим?|What do people send to friends on Purim?|e_mish|e_homew,e_sand,e_ring
Y בחג הזה נוהגים לשלוח אוכל לחברים, כדי להרבות שמחה וחברות.|في هذا العيد من العادة إرسال طعام للأصدقاء، لكي تزيد الفرحة والصداقة.|В этот праздник принято посылать друзьям угощения, чтобы стало больше радости и дружбы.|On this holiday people send food to friends, to spread joy and friendship.
E e_mish|t|משלוח מנות|هدية طعام (مشلوح مانوت)|угощение (мишлоах манот)|a food gift (mishloach manot)
E e_homew|t|כרטיסי ברכה|بطاقات تهنئة|открытки|greeting cards
E e_sand|t|סופגניות|سوفغانيا|суфгании|doughnuts
E e_ring|t|זרי פרחים ועלים ירוקים לקישוט הבית|أكاليل من الأزهار والأوراق الخضراء لتزيين البيت|венки из цветов и зелёных листьев для украшения дома|wreaths of flowers and green leaves to decorate the home
Q איזה מאכל אוכלים בפורים?|أي طعام يأكلون في بوريم؟|Какое блюдо едят на Пурим?|Which food do people eat on Purim?|f_hamen|f_matz,f_apple,f_chal
Y העוגיה נקראת על שם המן, הרע בסיפור פורים, ולכן אוכלים אותה בחג הזה.|الكعكة تحمل اسم هامان، الشرير في قصة بوريم، لذلك يأكلونها في هذا العيد.|Печенье названо по имени Амана, злодея из истории Пурима, поэтому его едят в этот праздник.|The cookie is named after Haman, the bad one in the Purim story, so people eat it on this holiday.
Q מי רצה לפגוע ביהודים בסיפור פורים?|من أراد أن يؤذي اليهود في قصة بوريم؟|Кто хотел навредить евреям в истории Пурима?|Who wanted to harm the Jews in the Purim story?|e_haman|e_moses,e_noah,xc_macc
Y המן היה שר אצל המלך, והוא כעס על מרדכי ורצה לפגוע בכל היהודים.|كان هامان وزيرًا عند الملك، وغضب من مردخاي وأراد أن يؤذي كل اليهود.|Аман был министром у царя, он злился на Мордехая и хотел навредить всем евреям.|Haman was a minister of the king, and he was angry at Mordechai and wanted to hurt all the Jewish people.
E xc_friends|t|לחברים ולשכנים|للأصدقاء والجيران|друзьям и соседям|to friends and neighbors
E xc_teach|t|רק למורה בכיתה|للمعلّمة في الصف فقط|только учителю в классе|only to the teacher in class
E xc_self|t|רק לעצמנו|لأنفسنا فقط|только себе|only to ourselves
E xc_abroad|t|לאנשים בארץ אחרת|لأناس في بلد آخر|людям в другой стране|to people in another country
Q למי שולחים משלוחי מנות?|لمن يرسلون هدايا الطعام (مشلوح مانوت)؟|Кому отправляют угощение (мишлоах манот)?|Who do people send food gifts (mishloach manot) to?|xc_friends|xc_teach,xc_self,xc_abroad
Y משלוח מנות נועד לחזק את הקשר עם האנשים שקרובים אלינו.|هدايا الطعام هدفها تقوية العلاقة مع الناس القريبين منّا.|Угощения посылают, чтобы укрепить связь с близкими людьми.|Food gifts are meant to strengthen the bond with the people close to us.
E xc_dress|t|מתחפשים לדמות שאוהבים|يتنكّرون بشخصية يحبّونها|наряжаются любимым героем|they dress up as a character they like
E xc_light|t|מדליקים נר בכל לילה|يُشعلون شمعة كل ليلة|зажигают свечу каждый вечер|they light a candle every night
Q מה עושים ילדים ומבוגרים בפורים?|ماذا يفعل الأولاد والكبار في بوريم؟|Что делают дети и взрослые в Пурим?|What do children and adults do on Purim?|xc_dress|e_fastb,e_sleepb,xc_light
Y פורים הוא חג שמח ומלא הפתעות, ולכן נוהגים בו להתחפש.|بوريم عيد فرح مليء بالمفاجآت، لذلك من العادة فيه التنكّر.|Пурим - весёлый праздник, полный сюрпризов, поэтому в него принято наряжаться.|Purim is a happy holiday full of surprises, so people usually dress up.
E xc_needy|t|לאנשים שצריכים עזרה|للناس الذين يحتاجون إلى مساعدة|людям, которым нужна помощь|to people who need help
E xc_costkid|t|רק לילדים שהתחפשו|للأولاد المتنكّرين فقط|только детям в костюмах|only to children in costumes
E xc_gaveus|t|רק למי שנתן לנו מתנה|فقط لمن أعطانا هدية|только тем, кто подарил нам подарок|only to someone who gave us a gift
E xc_faraway|t|לאנשים שגרים רחוק מאוד|لأناس يسكنون بعيدًا جدًّا|людям, которые живут очень далеко|to people who live very far away
Q למי נותנים מתנות בפורים, חוץ מחברים?|لمن يعطون هدايا في بوريم، غير الأصدقاء؟|Кому дарят подарки на Пурим, кроме друзей?|Besides friends, who gets gifts on Purim?|xc_needy|xc_costkid,xc_gaveus,xc_faraway
Y בפורים רוצים שכולם ישמחו, גם מי שאין לו מספיק.|في بوريم نريد أن يفرح الجميع، حتى من لا يملك ما يكفي.|На Пурим хотят, чтобы радовались все, даже те, у кого мало.|On Purim we want everyone to be happy, even people who do not have enough.
S pesach|🍷|#a61e4d|פסח: חג החירות|بيساح: عيد الحرية|Песах: праздник свободы|Pesach: The Holiday of Freedom
L לפני הרבה שנים בני ישראל היו עבדים במצרים. משה הוביל אותם לחופש.|قبل سنوات كثيرة كان بنو إسرائيل عبيدًا في مصر. قادهم موسى إلى الحرية.|Много лет назад сыны Израиля были рабами в Египте. Моисей вывел их на свободу.|Many years ago the people of Israel were slaves in Egypt. Moses led them to freedom.
L פסח חל באביב. בערב הראשון עורכים סעודה מיוחדת שקוראים לה ליל סדר.|يأتي بيساح في الربيع. في المساء الأول يُقيمون وجبة خاصة اسمها ليلة السيدر.|Песах бывает весной. В первый вечер устраивают особый ужин - седер.|Pesach comes in the spring. On the first evening the family has a special meal called the seder.
L בליל הסדר קוראים בהגדה את סיפור יציאת מצרים.|في ليلة السيدر يقرؤون في الهغاداه قصة الخروج من مصر.|На седере читают в Аггаде историю исхода из Египта.|At the seder people read the story of leaving Egypt from the Haggadah.
L הילד הקטן ביותר שואל ארבע קושיות. הראשונה היא: מה נשתנה הלילה הזה?|يسأل أصغر طفل أربعة أسئلة. الأول هو: ما الذي تغيّر في هذه الليلة؟|Самый младший ребёнок задаёт четыре вопроса. Первый: чем эта ночь отличается от других?|The youngest child asks four questions. The first is: why is this night different?
L בפסח אוכלים מצה במקום לחם. הבצק של בני ישראל לא הספיק לתפוח כשהם יצאו מהר ממצרים.|في بيساح يأكلون الفطير بدل الخبز. لم يكن لدى بني إسرائيل وقت لينتفخ العجين لأنهم خرجوا بسرعة من مصر.|На Песах едят мацу вместо хлеба. У сынов Израиля не было времени, чтобы тесто поднялось, - они спешно уходили из Египта.|On Pesach people eat matzah instead of bread. The people of Israel had no time for their dough to rise when they left Egypt in a hurry.
L אחרי פסח, משפחות רבות ממרוקו חוגגות את המימונה, ופותחות את הבית לאורחים.|بعد بيساح تحتفل عائلات كثيرة من المغرب بالميمونة وتفتح بيوتها للضيوف.|После Песаха многие семьи из Марокко отмечают Мимуну и открывают дом для гостей.|After Pesach, many families from Morocco celebrate the Mimouna and open their homes to guests.
Q מאיפה יצאו בני ישראל לחופש?|من أين خرج بنو إسرائيل إلى الحرية؟|Откуда сыны Израиля вышли на свободу?|Where did the people of Israel leave to find freedom?|e_egypt|e_italy,e_china,e_peru
Y בני ישראל היו עבדים במצרים, ומשה הוציא אותם משם לחופש.|كان بنو إسرائيل عبيدًا في مصر، وموسى أخرجهم من هناك إلى الحرية.|Сыны Израиля были рабами в Египте, и Моисей вывел их оттуда на свободу.|The people of Israel were slaves in Egypt, and Moses led them out of there to freedom.
E e_egypt|l|ממצרים|من مصر|из Египта|from Egypt
E e_italy|l|מאיטליה|من إيطاليا|из Италии|from Italy
E e_china|l|מסין|من الصين|из Китая|from China
E e_peru|l|מפרו|من بيرو|из Перу|from Peru
Q איך קוראים לארוחה המיוחדת בערב הראשון של פסח?|ماذا نسمّي الوجبة الخاصة في المساء الأول من بيساح؟|Как называется особый ужин в первый вечер Песаха?|What is the special meal on the first evening of Pesach called?|e_seder|e_kidd,e_brit,e_shav
Y בארוחה הזאת עושים הכול לפי סדר קבוע, ולכן קוראים לה ליל סדר.|في هذه الوجبة يفعلون كل شيء بترتيب ثابت، لذلك اسمها ليلة السيدر (الترتيب).|На этом ужине всё делают в определённом порядке, поэтому он называется седер, то есть порядок.|At this meal everything is done in a set order, so it is called the seder, meaning order.
E e_seder|t|ליל סדר|ليلة السيدر|седер|the seder
E e_kidd|t|קידוש|كيدّوش|кидуш|Kiddush
E e_brit|t|בר מצווה|بار ميتسفا|бар-мицва|a bar mitzvah
E e_shav|t|ארוחת ליל שבת|وجبة ليلة السبت|субботний ужин|the Friday night meal
Q איזה ספר קוראים בליל הסדר?|أي كتاب يقرؤون في ليلة السيدر؟|Какую книгу читают на седере?|Which book do people read at the seder?|o_hagg|o_megil,o_chanu,o_ragn
Y ההגדה מספרת את סיפור יציאת מצרים, ולכן קוראים בה בליל הסדר.|الهغاداه تحكي قصة الخروج من مصر، لذلك يقرؤونها في ليلة السيدر.|Аггада рассказывает историю исхода из Египта, поэтому её читают на седере.|The Haggadah tells the story of leaving Egypt, so it is read at the seder.
Q מי שואל את ארבע הקושיות?|من يسأل الأسئلة الأربعة؟|Кто задаёт четыре вопроса?|Who asks the four questions?|e_youngest|e_oldest,e_dog,e_judgex
Y השאלות עוזרות לילדים להבין את הסיפור, ולכן הקטן ביותר שואל אותן.|الأسئلة تساعد الأطفال على فهم القصة، لذلك يسألها أصغر طفل.|Вопросы помогают детям понять историю, поэтому их задаёт самый младший.|The questions help children understand the story, so the youngest one asks them.
E e_youngest|p|הילד הקטן ביותר|أصغر طفل|самый младший ребёнок|the youngest child
E e_oldest|p|הסבא|الجدّ|дедушка|the grandfather
E e_dog|p|הילד הגדול ביותר|أكبر طفل|самый старший ребёнок|the oldest child
E e_judgex|p|המורה בכיתה|المعلّم في الصف|учитель в классе|the teacher in class
Q מה אוכלים בפסח במקום לחם?|ماذا يأكلون في بيساح بدل الخبز؟|Что едят на Песах вместо хлеба?|What do people eat on Pesach instead of bread?|f_matz|f_chal,f_sufg,f_hamen
Y מצה היא בצק שלא תפח, כמו הלחם שבני ישראל אפו כשיצאו ממצרים.|الفطير عجين لم ينتفخ، مثل الخبز الذي خبزه بنو إسرائيل عندما خرجوا من مصر.|Маца - это тесто, которое не поднялось, как хлеб сынов Израиля при выходе из Египта.|Matzah is dough that did not rise, like the bread the people of Israel baked when they left Egypt.
Q כמה קושיות שואלים בליל הסדר?|كم سؤالًا يسألون في ليلة السيدر؟|Сколько вопросов задают на седере?|How many questions are asked at the seder?|n4|n3,n5,n7
Y הילד שואל 4 שאלות על מה ששונה בלילה הזה, וכל אחת מהן נקראת קושיה.|يسأل الطفل 4 أسئلة عمّا هو مختلف في هذه الليلة، وكل سؤال منها يُسمّى كوشيا (سؤال).|Ребёнок задаёт 4 вопроса о том, чем отличается эта ночь, и каждый из них называется кушия.|The child asks 4 questions about what is different on this night, and each one is called a kushiya.
Q מי הוביל את בני ישראל לחופש?|من قاد بني إسرائيل إلى الحرية؟|Кто вывел сынов Израиля на свободу?|Who led the Israelites to freedom?|e_moses|e_noah,xc_macc,e_benyeh
Y משה דיבר עם פרעה וביקש לשחרר את העם, ואז הוביל אותם החוצה.|تكلّم موسى مع فرعون وطلب منه أن يحرّر الشعب، ثم قادهم إلى الخارج.|Моисей говорил с фараоном и просил отпустить народ, а потом вывел его.|Moses spoke with Pharaoh and asked him to free the people, and then he led them out.
E xc_spr|t|באביב|في الربيع|весной|in spring
E xc_sumr|t|בקיץ|في الصيف|летом|in summer
E xc_autm|t|בסתיו|في الخريف|осенью|in autumn
E xc_wint|t|בחורף|في الشتاء|зимой|in winter
Q באיזו עונה חל פסח?|في أي فصل يحلّ بيساح؟|В какое время года бывает Песах?|In which season is Pesach?|xc_spr|xc_sumr,xc_autm,xc_wint
Y פסח נקרא גם חג האביב, כי הוא תמיד חל בעונה הזאת.|يُسمّى بيساح أيضًا عيد الربيع، لأنه يأتي دائمًا في هذا الفصل.|Песах называют также праздником весны, потому что он всегда бывает в это время года.|Pesach is also called the spring holiday, because it always falls in this season.
E xc_slaves|t|עבדים|عبيدًا|рабами|slaves
E xc_kings|t|מלכים|ملوكًا|царями|kings
E xc_soldiers|t|חיילים|جنودًا|солдатами|soldiers
E xc_tourists|t|תיירים|سيّاحًا|туристами|tourists
Q מה היו בני ישראל לפני שיצאו לחופש?|ماذا كان بنو إسرائيل قبل أن يخرجوا إلى الحرية؟|Кем были сыны Израиля до того, как вышли на свободу?|What were the Israelites before they went free?|xc_slaves|xc_kings,xc_soldiers,xc_tourists
Y בני ישראל עבדו בכוח אצל פרעה, ולכן היציאה ממצרים היא חג החירות.|عمل بنو إسرائيل بالقوّة عند فرعون، لذلك الخروج من مصر هو عيد الحرية.|Сыны Израиля работали на фараона по принуждению, поэтому исход - это праздник свободы.|The people of Israel were forced to work for Pharaoh, so leaving Egypt is the holiday of freedom.
E xc_dough|t|כי הבצק לא הספיק לתפוח|لأن العجين لم يلحق أن ينتفخ|потому что тесто не успело подняться|because the dough had no time to rise
E xc_sweeter|t|כי המצה מתוקה יותר מלחם|لأن الماتساه أحلى من الخبز|потому что маца слаще хлеба|because matzah is sweeter than bread
E xc_noflour|t|כי באביב אין קמח בחנויות|لأنه لا يوجد طحين في المتاجر في الربيع|потому что весной в магазинах нет муки|because there is no flour in shops in spring
E xc_keeps|t|כי מצה נשמרת שנה שלמה|لأن الماتساه تبقى صالحة سنة كاملة|потому что маца хранится целый год|because matzah keeps for a whole year
Q למה אוכלים מצה בפסח?|لماذا يأكلون الماتساه في بيساح؟|Почему в Песах едят мацу?|Why do people eat matzah on Pesach?|xc_dough|xc_sweeter,xc_noflour,xc_keeps
Y בני ישראל מיהרו לצאת ממצרים, ולא היה זמן לחכות שהבצק יתפח.|استعجل بنو إسرائيل الخروج من مصر، ولم يكن هناك وقت لانتظار انتفاخ العجين.|Сыны Израиля спешили уйти из Египта, и не было времени ждать, пока тесто поднимется.|The people of Israel hurried out of Egypt, and there was no time to wait for the dough to rise.
S shavuot|🌾|#b35d00|שבועות: חג הביכורים והתורה|شفوعوت: عيد الباكورة والتوراة|Шавуот: праздник первых плодов и Торы|Shavuot: The Holiday of First Fruits and the Torah
L שבועות חל שבעה שבועות אחרי פסח. מכאן בא השם שלו.|يأتي شفوعوت بعد بيساح بسبعة أسابيع. ومن هنا جاء اسمه.|Шавуот бывает через семь недель после Песаха. Отсюда его название.|Shavuot comes seven weeks after Pesach. That is where its name comes from.
L בשבועות מספרים על הר סיני, שם קיבל עם ישראל את עשרת הדיברות.|في شفوعوت نحكي عن جبل سيناء حيث تلقّى بنو إسرائيل الوصايا العشر.|На Шавуот вспоминают гору Синай, где народ Израиля получил десять заповедей.|On Shavuot people remember Mount Sinai, where the people of Israel received the Ten Commandments.
L זה גם חג הביכורים: חג הפירות הראשונים של השנה. פעם החקלאים הביאו אותם לירושלים.|وهو أيضًا عيد الباكورة: عيد أول ثمار السنة. وكان المزارعون قديمًا يحضرونها إلى القدس.|Это и праздник первых плодов года. Раньше земледельцы приносили их в Иерусалим.|It is also the holiday of the first fruits of the year. In the past farmers brought them to Jerusalem.
L בשבועות אוכלים מאכלי חלב: גבינה, עוגת גבינה ובלינצ׳ס.|في شفوعوت يأكلون الأطعمة الحليبية: الجبن وكعكة الجبن والفطائر.|На Шавуот едят молочные блюда: сыр, чизкейк, блины.|On Shavuot people eat dairy foods: cheese, cheesecake and blintzes.
L מקשטים את הבית ואת הגן בפרחים ובעלים ירוקים.|يزيّنون البيت والروضة بالأزهار والأوراق الخضراء.|Украшают дом и детский сад цветами и зелёными листьями.|People decorate the home and the kindergarten with flowers and green leaves.
Q אחרי כמה שבועות מפסח חל שבועות?|بعد كم أسبوعًا من بيساح يأتي شفوعوت؟|Через сколько недель после Песаха бывает Шавуот?|How many weeks after Pesach does Shavuot come?|n7|n3,n4,n10
Y סופרים 7 שבועות מפסח, ולכן החג נקרא שבועות.|يعدّون 7 أسابيع من بيساح، لذلك اسم العيد شفوعوت (الأسابيع).|От Песаха отсчитывают 7 недель, поэтому праздник называется Шавуот, то есть недели.|People count 7 weeks from Pesach, so the holiday is called Shavuot, meaning weeks.
Q מה קיבל עם ישראל בהר סיני?|ماذا تلقّى بنو إسرائيل في جبل سيناء؟|Что получил народ Израиля на горе Синай?|What did the people of Israel receive at Mount Sinai?|e_ten|e_crown,e_boat,e_map
Y לפי המסורת משה עלה להר סיני וירד ממנו עם לוחות עשרת הדיברות.|بحسب التقليد صعد موسى إلى جبل سيناء ونزل منه مع لوحي الوصايا العشر.|По преданию Моисей поднялся на гору Синай и спустился с неё со скрижалями десяти заповедей.|According to tradition, Moses went up Mount Sinai and came down with the tablets of the Ten Commandments.
E e_ten|t|את עשרת הדיברות|الوصايا العشر|десять заповедей|the Ten Commandments
E e_crown|t|את ארבעת המינים: לולב, אתרוג, הדס וערבה|الأنواع الأربعة: لولاف وإترج وآس وصفصاف|четыре растения: лулав, этрог, мирт и ива|the four plants: lulav, etrog, myrtle and willow
E e_boat|t|את עשר המכות|الضربات العشر|десять казней|the ten plagues
E e_map|t|את מגילת אסתר|مجلّة إستير|свиток Эстер|the scroll of Esther
Q איזה חג הוא חג הביכורים, חג הפירות הראשונים?|أي عيد هو عيد الباكورة، عيد أول الثمار؟|Какой праздник - праздник первых плодов?|Which holiday is the holiday of first fruits?|h_shav|h_han,h_pur,h_rosh
Y שבועות חל בזמן הקציר, כשהפירות הראשונים של השנה מבשילים.|يأتي شفوعوت في وقت الحصاد، عندما تنضج أول ثمار السنة.|Шавуот приходится на время урожая, когда созревают первые плоды года.|Shavuot comes at harvest time, when the first fruits of the year ripen.
Q איזה מאכל אוכלים בשבועות?|أي طعام يأكلون في شفوعوت؟|Какое блюдо едят на Шавуот?|Which food do people eat on Shavuot?|f_cheese|f_matz,f_hamen,f_sufg
Y בשבועות נוהגים לאכול מאכלי חלב, ועוגת גבינה עשויה מגבינה.|في شفوعوت من العادة أكل أطعمة الحليب، وكعكة الجبن مصنوعة من الجبن.|На Шавуот принято есть молочное, а чизкейк делают из сыра.|On Shavuot people usually eat dairy foods, and cheesecake is made from cheese.
Q במה מקשטים את הבית בשבועות?|بماذا يزيّنون البيت في شفوعوت؟|Чем украшают дом на Шавуот?|What do people decorate the home with on Shavuot?|e_flow|e_snow,e_balloon,e_lamp
Y שבועות הוא חג של קציר ופירות ראשונים, ולכן מקשטים בצמחים ירוקים.|شفوعوت عيد الحصاد والباكورة، لذلك يزيّنون بالنباتات الخضراء.|Шавуот - праздник урожая и первых плодов, поэтому украшают зеленью.|Shavuot is a holiday of harvest and first fruits, so people decorate with green plants.
E e_flow|t|בפרחים ובעלים ירוקים|بالأزهار والأوراق الخضراء|цветами и зелёными листьями|flowers and green leaves
E e_snow|t|בנרות ובשרשרת של שמונה אורות|بالشموع وسلسلة من ثمانية أضواء|свечами и гирляндой из восьми огней|candles and a chain of eight lights
E e_balloon|t|בסוכה של ענפים בחצר|بسُكّا من الأغصان في الساحة|суккой из веток во дворе|a sukkah of branches in the yard
E e_lamp|t|בבלונים ובתחפושות|ببالونات وأزياء تنكّرية|шарами и костюмами|balloons and costumes
E xc_tojlm|l|לירושלים|إلى القدس|в Иерусалим|to Jerusalem
E xc_tohaifa|l|לחיפה|إلى حيفا|в Хайфу|to Haifa
E xc_toeilat|l|לאילת|إلى إيلات|в Эйлат|to Eilat
E xc_tobs|l|לבאר שבע|إلى بئر السبع|в Беэр-Шеву|to Beersheba
Q לאיזו עיר הביאו החקלאים את הביכורים?|إلى أي مدينة أحضر المزارعون الباكورة؟|В какой город крестьяне приносили первые плоды?|To which city did farmers bring the first fruits?|xc_tojlm|xc_tohaifa,xc_toeilat,xc_tobs
Y בירושלים עמד המקדש, ולכן החקלאים הביאו לשם את הפירות הראשונים.|في القدس كان الهيكل، لذلك أحضر المزارعون إليها أول الثمار.|В Иерусалиме стоял Храм, поэтому земледельцы приносили туда первые плоды.|The Temple stood in Jerusalem, so farmers brought their first fruits there.
E xc_name7|t|הוא חל שבעה שבועות אחרי פסח|يحلّ بعد سبعة أسابيع من بيساح|он наступает через семь недель после Песаха|it comes seven weeks after Pesach
E xc_namew|t|הוא נמשך שבוע שלם|يستمرّ أسبوعًا كاملًا|он длится целую неделю|it lasts a whole week
E xc_names|t|בו נותנים שבועה גדולה|فيه يُقسمون قسمًا كبيرًا|в этот день дают большую клятву|on it people make a big vow
E xc_namef|t|בו אוכלים שבע ארוחות|فيه يأكلون سبع وجبات|в этот день едят семь раз|on it people eat seven meals
Q למה החג נקרא שבועות?|لماذا يُسمّى العيد شفوعوت (الأسابيع)؟|Почему праздник называется Шавуот («недели»)?|Why is the holiday called Shavuot ("weeks")?|xc_name7|xc_namew,xc_names,xc_namef
Y המילה שבועות היא הרבים של שבוע, ובין פסח לחג עוברים 7 שבועות.|كلمة شفوعوت تعني الأسابيع، وبين بيساح والعيد تمرّ 7 أسابيع.|Слово Шавуот значит недели, и между Песахом и этим праздником проходит 7 недель.|The word Shavuot means weeks, and 7 weeks pass between Pesach and this holiday.
E xc_blintz|f|בלינצ׳ס|بلينتشس (فطائر محشوّة بالجبن)|блинчики с творогом|blintzes (cheese-filled pancakes)
Q איזה מאכל חלבי אוכלים בשבועות?|أي طعام من الحليب يأكلون في شفوعوت؟|Какое молочное блюдо едят на Шавуот?|Which dairy dish do people eat on Shavuot?|xc_blintz|f_sufg,f_hamen,f_matz
Y בלינצ׳ס הם חביתיות ממולאות בגבינה, ולכן הם מאכל חלבי.|الفطائر (البلينتشس) رقائق محشوّة بالجبن، لذلك هي طعام حليبي.|Блины с начинкой из творога, поэтому это молочное блюдо.|Blintzes are thin pancakes filled with cheese, so they are a dairy food.
Q באיזו עונה חל שבועות?|في أي فصل يحلّ شفوعوت؟|В какое время года бывает Шавуот?|In which season is Shavuot?|e_spring|e_winter,e_aut,e_summer
Y פסח חל באביב, ושבועות בא 7 שבועות אחריו, כשהאביב כמעט נגמר.|يأتي بيساح في الربيع، وشفوعوت بعده بـ7 أسابيع، عندما يقترب الربيع من نهايته.|Песах бывает весной, а Шавуот через 7 недель, когда весна почти кончилась.|Pesach is in spring, and Shavuot comes 7 weeks later, when spring is almost over.
E xc_sinai|l|בהר סיני|على جبل سيناء|на горе Синай|at Mount Sinai
E xc_carmel|l|בהר הכרמל|على جبل الكرمل|на горе Кармель|at Mount Carmel
E xc_hermon|l|בהר החרמון|على جبل الشيخ (حرمون)|на горе Хермон|at Mount Hermon
E xc_tavor|l|בהר תבור|على جبل الطور (تابور)|на горе Фавор|at Mount Tabor
Q איפה קיבל עם ישראל את עשרת הדיברות?|أين تلقّى شعب إسرائيل الوصايا العشر؟|Где народ Израиля получил десять заповедей?|Where did the people of Israel receive the Ten Commandments?|xc_sinai|xc_carmel,xc_hermon,xc_tavor
Y לפי המסורת עם ישראל חנה ליד הר סיני במדבר, ושם קיבל את הדיברות.|بحسب التقليد نزل بنو إسرائيل قرب جبل سيناء في الصحراء، وهناك تلقّوا الوصايا.|По преданию народ Израиля стоял у горы Синай в пустыне и там получил заповеди.|According to tradition, the people of Israel camped by Mount Sinai and received the commandments there.
S comm|🍲|#0b7285|הרבה קהילות, הרבה מנהגים|جماعات كثيرة وعادات كثيرة|много общин, много обычаев|Many Communities, Many Customs
L יהודים הגיעו לישראל ממקומות רבים: פולין, תימן, מרוקו, עיראק, רוסיה, אתיופיה ועוד.|جاء اليهود إلى إسرائيل من أماكن كثيرة: بولندا واليمن والمغرب والعراق وروسيا وإثيوبيا وغيرها.|Евреи приехали в Израиль из многих мест: Польши, Йемена, Марокко, Ирака, России, Эфиопии и других.|Jewish people came to Israel from many places: Poland, Yemen, Morocco, Iraq, Russia, Ethiopia and more.
L כל קהילה הביאה איתה שירים, בגדים ומאכלים. כך התרבות שלנו נעשית עשירה יותר.|أحضرت كل جماعة معها أغاني وملابس وأطعمة. وهكذا تصبح ثقافتنا أغنى.|Каждая община привезла свои песни, одежду и блюда. Так наша культура становится богаче.|Each community brought songs, clothes and foods. That makes our culture richer.
L יוצאי תימן אוכלים ג׳חנון בשבת בבוקר. יוצאי צפון אפריקה אוכלים קוסקוס.|يأكل اليهود من اليمن الجَحنون صباح السبت. ويأكل اليهود من شمال أفريقيا الكسكس.|Евреи из Йемена едят джахнун в субботу утром. Евреи из Северной Африки едят кускус.|Jews from Yemen eat jachnun on Shabbat morning. Jews from North Africa eat couscous.
L יוצאי אתיופיה חוגגים את הסיגד. מתפללים, צמים ומתפללים לחזור לירושלים.|يحتفل اليهود من إثيوبيا بالسيغد. يصلّون ويصومون ويتمنّون العودة إلى القدس.|Евреи из Эфиопии отмечают Сигд. Они молятся, постятся и мечтают вернуться в Иерусалим.|Jews from Ethiopia celebrate the Sigd. They pray, fast and hope to return to Jerusalem.
L המימונה היא חג של יוצאי מרוקו. אחרי פסח הבתים פתוחים והשולחנות מלאים במתוקים.|الميمونة عيد اليهود من المغرب. بعد بيساح تكون البيوت مفتوحة والموائد مليئة بالحلويات.|Мимуна - праздник евреев из Марокко. После Песаха двери домов открыты, а столы полны сладостей.|The Mimouna is a holiday of Jews from Morocco. After Pesach the homes are open and the tables are full of sweets.
L גם לך יש מנהגים במשפחה. אפשר לספר עליהם לחברים ולשמוע על המנהגים שלהם.|ولك أيضًا عادات في عائلتك. يمكنك أن تحكي عنها لأصدقائك وتسمع عن عاداتهم.|У вашей семьи тоже есть свои обычаи. Можно рассказать о них друзьям и послушать об их обычаях.|Your family has customs too. You can tell your friends about them and hear about theirs.
E f_jach|f|ג׳חנון|جَحنون|джахнун|jachnun
E f_cous|f|קוסקוס|كسكس|кускус|couscous
E f_gefi|f|גפילטע פיש|سمك غيفيلته|гефилте фиш|gefilte fish
E f_kubb|f|קובה|كبّة|кубба|kubbeh
Q איזה חג חוגגים יוצאי אתיופיה?|أي عيد يحتفل به اليهود من إثيوبيا؟|Какой праздник отмечают евреи из Эфиопии?|Which holiday do Jews from Ethiopia celebrate?|h_sigd|h_mim,h_pur,h_han
Y הסיגד הוא חג שנולד בקהילה היהודית באתיופיה, ובו מתפללים לירושלים.|السيغد عيد نشأ في الجماعة اليهودية في إثيوبيا، وفيه يصلّون من أجل القدس.|Сигд - праздник, который появился у евреев Эфиопии, и в нём молятся об Иерусалиме.|The Sigd is a holiday that began in the Jewish community of Ethiopia, and in it people pray for Jerusalem.
Q איזה חג חוגגים יוצאי מרוקו אחרי פסח?|أي عيد يحتفل به اليهود من المغرب بعد بيساح؟|Какой праздник отмечают евреи из Марокко после Песаха?|Which holiday do Jews from Morocco celebrate after Pesach?|h_mim|h_sigd,h_tub,h_suk
Y המימונה היא מנהג של יהודי מרוקו, והיא חלה ממש בסוף פסח.|الميمونة عادة يهود المغرب، وتأتي في نهاية بيساح تمامًا.|Мимуна - обычай евреев Марокко, и её отмечают сразу в конце Песаха.|The Mimouna is a custom of Moroccan Jews, and it comes right at the end of Pesach.
Q מה עושים במימונה?|ماذا يفعلون في الميمونة؟|Что делают на Мимуне?|What do people do at the Mimouna?|e_open|e_lock,e_hide2,e_class
Y המימונה היא חג של שכנות ושמחה, ולכן הבתים פתוחים לכל מי שבא.|الميمونة عيد جيرة وفرح، لذلك تكون البيوت مفتوحة لكل من يأتي.|Мимуна - праздник добрососедства и радости, поэтому дома открыты для всех, кто придёт.|The Mimouna is a holiday of friendship and joy, so homes are open to anyone who comes.
E e_open|t|פותחים את הבית לאורחים ואוכלים מתוקים|يفتحون البيت للضيوف ويأكلون الحلويات|открывают дом для гостей и едят сладости|they open the home to guests and eat sweets
E e_lock|t|נועלים את הדלת ונשארים לבד עד סוף החג|يُقفلون الباب ويبقون وحدهم حتى نهاية العيد|запирают дверь и остаются одни до конца праздника|they lock the door and stay alone until the holiday ends
E e_hide2|t|מסתירים את האוכל ואוכלים רק מצות|يخبّئون الطعام ولا يأكلون إلا الفطير|прячут еду и едят только мацу|they hide the food and eat only matzah
E e_class|t|הולכים לבית הספר ולומדים כרגיל|يذهبون إلى المدرسة ويتعلّمون كالمعتاد|идут в школу и учатся как обычно|they go to school and study as usual
Q איזה מאכל אוכלים יוצאי תימן בשבת בבוקר?|أي طعام يأكله اليهود من اليمن صباح السبت؟|Что едят евреи из Йемена в субботу утром?|What do Jews from Yemen eat on Shabbat morning?|f_jach|f_cous,f_gefi,f_kubb
Y ג׳חנון נאפה לאט כל הלילה, ולכן הוא מוכן וחם בשבת בבוקר.|الجَحنون يُخبز ببطء طوال الليل، لذلك يكون جاهزًا وساخنًا صباح السبت.|Джахнун медленно печётся всю ночь, поэтому утром в субботу он готовый и горячий.|Jachnun bakes slowly all night, so it is ready and warm on Shabbat morning.
Q למה טוב שיש בישראל הרבה קהילות?|لماذا من الجيّد وجود جماعات كثيرة في إسرائيل؟|Почему хорошо, что в Израиле много общин?|Why is it good that Israel has many communities?|e_rich|e_boringc,e_same,e_less
Y כשכל קהילה מביאה משהו משלה, התרבות של כולנו נעשית עשירה יותר.|عندما تُحضر كل جماعة شيئًا خاصًا بها، تصبح ثقافتنا جميعًا أغنى.|Когда каждая община приносит что-то своё, общая культура становится богаче.|When each community brings something of its own, the culture of all of us gets richer.
E e_rich|t|כי כל קהילה מוסיפה שירים, מאכלים ומנהגים|لأن كل جماعة تضيف أغاني وأطعمة وعادات|потому что каждая община добавляет песни, блюда и обычаи|because each community adds songs, foods and customs
E e_boringc|t|כי כך כל המשפחות לובשות ואוכלות בדיוק אותו דבר|لأن كل العائلات تلبس وتأكل الشيء نفسه تمامًا في كل مكان|потому что так все семьи одеваются и едят совершенно одинаково|because this way every family dresses and eats exactly the same
E e_same|t|כי אין הבדל בין האנשים בכל הארץ|لأنه لا فرق بين الناس في كل البلاد|потому что между людьми по всей стране нет разницы|because there is no difference between people anywhere
E e_less|t|כי כך יש פחות חגים ופחות ימי לימוד|لأن هذا يقلّل الأعياد وأيام الدراسة|потому что так меньше праздников и учебных дней|because this means fewer holidays and school days
Q מה אוכלים יהודים מצפון אפריקה?|ماذا يأكل اليهود من شمال أفريقيا؟|Что едят евреи из Северной Африки?|What do Jews from North Africa eat?|f_cous|f_jach,f_gefi,f_kubb
Y קוסקוס הוא מאכל מסורתי בארצות צפון אפריקה, והיהודים משם הביאו אותו איתם.|الكسكس طعام تقليدي في بلدان شمال أفريقيا، واليهود من هناك أحضروه معهم.|Кускус - традиционное блюдо стран Северной Африки, и евреи оттуда привезли его с собой.|Couscous is a traditional dish in North Africa, and Jews from there brought it with them.
E xc_songs|t|שירים, בגדים ומאכלים|أغاني وملابس وأطعمة|песни, одежду и блюда|songs, clothes and foods
E xc_cars|t|מכוניות, מטוסים ורכבות|سيارات وطائرات وقطارات|машины, самолёты и поезда|cars, planes and trains
E xc_houses|t|בתים, כבישים וגשרים|بيوتًا وشوارع وجسورًا|дома, дороги и мосты|houses, roads and bridges
E xc_watch|t|שעונים, טלפונים ומחשבים|ساعات وهواتف وحواسيب|часы, телефоны и компьютеры|watches, phones and computers
Q מה כל קהילה הביאה איתה לישראל?|ماذا أحضرت كل جماعة معها إلى إسرائيل؟|Что каждая община привезла с собой в Израиль?|What did each community bring with it to Israel?|xc_songs|xc_cars,xc_houses,xc_watch
Y אנשים לוקחים איתם את מה שהם אוהבים וזוכרים, כמו שיר, בגד או מתכון.|يأخذ الناس معهم ما يحبّونه ويتذكّرونه، مثل أغنية أو ثوب أو وصفة طعام.|Люди берут с собой то, что любят и помнят, например песню, одежду или рецепт.|People take with them what they love and remember, like a song, a piece of clothing or a recipe.
E xc_many|t|ממקומות רבים בעולם|من أماكن كثيرة في العالم|из многих мест мира|from many places in the world
E xc_onlypl|t|רק מפולין|من بولندا فقط|только из Польши|only from Poland
E xc_onlyye|t|רק מתימן|من اليمن فقط|только из Йемена|only from Yemen
E xc_onlyam|t|רק מאמריקה, ולא ממקום אחר|من أمريكا فقط، ولا من مكان آخر|только из Америки, и больше ниоткуда|only from America, and nowhere else
Q מאיפה הגיעו יהודים לישראל?|من أين جاء اليهود إلى إسرائيل؟|Откуда евреи приехали в Израиль?|Where did Jews come to Israel from?|xc_many|xc_onlypl,xc_onlyye,xc_onlyam
Y במשך מאות שנים יהודים חיו בהרבה ארצות, ומכולן הם עלו לישראל.|على مدى مئات السنين عاش اليهود في بلدان كثيرة، ومنها كلها جاؤوا إلى إسرائيل.|Сотни лет евреи жили во многих странах, и из всех них они приехали в Израиль.|For hundreds of years Jewish people lived in many countries, and they came to Israel from all of them.
Q לאיזו עיר מתפללים לחזור בחג הסיגד?|إلى أي مدينة يصلّون للعودة في عيد السيغد؟|В какой город молятся вернуться в праздник Сигд?|On the Sigd, people pray to return to which city?|xc_tojlm|xc_tohaifa,xc_toeilat,xc_tobs
Y ירושלים היא העיר הקדושה ליהודים, ויהודי אתיופיה חלמו עליה שנים רבות.|القدس هي المدينة المقدّسة لليهود، ويهود إثيوبيا حلموا بها سنوات طويلة.|Иерусалим - святой город для евреев, и евреи Эфиопии много лет мечтали о нём.|Jerusalem is the holy city for Jewish people, and the Jews of Ethiopia dreamed of it for many years.
E xc_share|t|לספר עליהם לחברים|أن نحكي عنها للأصدقاء|рассказать о них друзьям|tell our friends about them
E xc_hide|t|להסתיר אותם מכולם|أن نخفيها عن الجميع|скрывать их от всех|hide them from everyone
E xc_forget|t|לשכוח אותם מהר|أن ننساها بسرعة|поскорее их забыть|forget them quickly
E xc_mockf|t|לצחוק על מנהגים של חברים|أن نضحك على عادات الأصدقاء|смеяться над обычаями друзей|laugh at our friends' customs
Q מה אפשר לעשות עם המנהגים של המשפחה שלכם?|ماذا يمكن أن نفعل بعادات عائلتنا؟|Что можно делать с обычаями своей семьи?|What can you do with your family's customs?|xc_share|xc_hide,xc_forget,xc_mockf
Y כשמספרים על המנהגים שלנו, החברים מכירים אותנו טוב יותר ולומדים משהו חדש.|عندما نحكي عن عاداتنا، يتعرّف علينا الأصدقاء أكثر ويتعلّمون شيئًا جديدًا.|Когда мы рассказываем о своих обычаях, друзья лучше узнают нас и узнают новое.|When we share our customs, our friends get to know us better and learn something new.
S faiths|🌙|#5f3dc4|חגים של כולם בישראל|أعياد الجميع في إسرائيل|праздники всех в Израиле|Holidays of Everyone in Israel
L בישראל חיים יהודים, מוסלמים, נוצרים, דרוזים ועוד. לכל קבוצה יש חגים משלה.|في إسرائيل يعيش يهود ومسلمون ومسيحيون ودروز وغيرهم. ولكل مجموعة أعيادها.|В Израиле живут евреи, мусульмане, христиане, друзы и другие. У каждой группы свои праздники.|In Israel live Jews, Muslims, Christians, Druze and others. Every group has its own holidays.
L רמדאן הוא חודש שבו המוסלמים צמים מעלות השחר, לפני הזריחה, ועד השקיעה. בסופו חוגגים את עיד אל־פיטר.|رمضان شهر يصوم فيه المسلمون من الفجر حتى الغروب. وفي نهايته يحتفلون بعيد الفطر.|Рамадан - месяц, когда мусульмане постятся от рассвета до заката. В конце отмечают Ид аль-Фитр.|Ramadan is a month when Muslims fast from dawn, before sunrise, until sunset. At its end they celebrate Eid al-Fitr.
L בעיד לובשים בגדים חדשים, מבקרים את המשפחה ואוכלים מתוקים. הילדים מקבלים מתנות.|في العيد يلبسون ملابس جديدة ويزورون العائلة ويأكلون الحلويات. ويحصل الأولاد على هدايا.|В праздник надевают новую одежду, навещают семью и едят сладости. Дети получают подарки.|At the Eid people wear new clothes, visit family and eat sweets. Children get gifts.
L עיד אל־אדחא הוא חג הקורבן. מחלקים בשר למשפחה ולאנשים שצריכים עזרה.|عيد الأضحى هو عيد الأضحية. يوزّعون اللحم على العائلة وعلى المحتاجين.|Ид аль-Адха - праздник жертвоприношения. Мясо раздают семье и нуждающимся.|Eid al-Adha is the feast of sacrifice. People share meat with family and with people who need help.
L הנוצרים חוגגים את חג המולד בסוף דצמבר, ואת חג הפסחא באביב. הדרוזים מבקרים בקבר נבי שועייב שבגליל.|يحتفل المسيحيون بعيد الميلاد في نهاية كانون الأول وبعيد الفصح في الربيع. ويزور الدروز مقام النبي شعيب في الجليل.|Христиане отмечают Рождество в конце декабря, а Пасху - весной. Друзы посещают гробницу Наби-Шуайб в Галилее.|Christians celebrate Christmas at the end of December, and Easter in the spring. The Druze visit the tomb of Nabi Shu'ayb in the Galilee.
L כשחוגגים חבר, מברכים אותו: חג שמח, עיד מובארכ או מרי כריסטמס. זה מראה כבוד.|عندما يحتفل صديق نقول له: عيد مبارك أو ميلاد مجيد أو حَغ سَميَح. هذا يُظهر الاحترام.|Когда друг празднует, мы поздравляем его: «Хаг самеах», «Ид мубарак» или «С Рождеством». Так мы показываем уважение.|When a friend celebrates, we greet them: Chag Sameach, Eid Mubarak or Merry Christmas. This shows respect.
Q מה עושים המוסלמים בחודש רמדאן?|ماذا يفعل المسلمون في شهر رمضان؟|Что делают мусульмане в месяц Рамадан?|What do Muslims do during the month of Ramadan?|e_ramad|e_hanuk,e_plant2,e_sailx
Y רמדאן הוא חודש הצום של המוסלמים, ונוהגים בו לצום כל עוד השמש בשמיים.|رمضان شهر الصيام عند المسلمين، ويصومون فيه ما دامت الشمس في السماء.|Рамадан - месяц поста у мусульман, и в этот месяц постятся, пока солнце на небе.|Ramadan is the Muslim month of fasting, and people fast while the sun is in the sky.
E e_ramad|t|צמים מעלות השחר עד השקיעה|يصومون من الفجر حتى الغروب|постятся от рассвета до заката|they fast from dawn to sunset
E e_hanuk|t|מדליקים תשעה נרות בכל לילה בחלון|يُشعلون تسع شموع كل ليلة في النافذة|каждую ночь зажигают девять свечей в окне|they light nine candles in the window every night
E e_plant2|t|נוטעים עצים בגן|يزرعون الأشجار في الحديقة|сажают деревья в саду|they plant trees in the garden
E e_sailx|t|בונים סוכה|يبنون سُكّا|строят сукку|they build a sukkah
Q איזה חג חוגגים בסוף חודש רמדאן?|أي عيد يحتفلون به في نهاية رمضان؟|Какой праздник отмечают в конце Рамадана?|Which holiday is celebrated at the end of Ramadan?|h_eidf|h_xmas,h_pur,h_han
Y עיד אל־פיטר פירושו חג סיום הצום, ולכן חוגגים אותו כשרמדאן נגמר.|عيد الفطر معناه عيد الإفطار بعد الصوم، لذلك يحتفلون به عندما ينتهي رمضان.|Ид аль-Фитр значит праздник окончания поста, поэтому его отмечают, когда кончается Рамадан.|Eid al-Fitr means the feast of breaking the fast, so it is celebrated when Ramadan ends.
Q באיזה חג מחלקים בשר למשפחה ולאנשים שצריכים עזרה?|في أي عيد يوزّعون اللحم على العائلة وعلى المحتاجين؟|В какой праздник раздают мясо семье и тем, кто нуждается в помощи?|In which holiday do people share meat with family and with people who need help?|h_eida|h_east,h_tub,h_eidf
Y עיד אל־אדחא הוא חג הקורבן, ובחג הזה נוהגים לחלק בשר ולשתף אחרים.|عيد الأضحى هو عيد الأضحية، ومن العادة فيه توزيع اللحم ومشاركة الآخرين.|Ид аль-Адха - праздник жертвоприношения, и в этот праздник принято раздавать мясо и делиться.|Eid al-Adha is the feast of sacrifice, and on this holiday people share meat with others.
Q איזה חג חוגגים הנוצרים בסוף דצמבר?|أي عيد يحتفل به المسيحيون في نهاية كانون الأول؟|Какой праздник христиане отмечают в конце декабря?|Which holiday do Christians celebrate at the end of December?|h_xmas|h_eida,h_pes,h_sigd
Y רוב הכנסיות חוגגות ב־25 בדצמבר את הולדתו של ישו.|معظم الكنائس تحتفل في 25 كانون الأول بميلاد يسوع.|Большинство церквей празднует рождение Иисуса 25 декабря.|Most churches celebrate the birth of Jesus on December 25.
Q איזה מקום מבקרים הדרוזים בחג שלהם?|أي مكان يزوره الدروز في عيدهم؟|Какое место друзы посещают в свой праздник?|Which place do the Druze visit on their holiday?|e_tomb|e_zoo,e_beach,e_mall
Y הדרוזים מכבדים את הנביא שועייב, וקברו נמצא בגליל ליד טבריה.|الدروز يُجلّون النبي شعيب، ومقامه في الجليل قرب طبريا.|Друзы почитают пророка Шуайба, а его гробница находится в Галилее около Тверии.|The Druze honor the prophet Shu'ayb, and his tomb is in the Galilee near Tiberias.
E e_tomb|t|את קבר נבי שועייב בגליל|مقام النبي شعيب في الجليل|гробницу Наби-Шуайб в Галилее|the tomb of Nabi Shu'ayb in the Galilee
E e_zoo|t|את מסגד אל־אקצא בירושלים|المسجد الأقصى في القدس|мечеть Аль-Акса в Иерусалиме|the Al-Aqsa Mosque in Jerusalem
E e_beach|t|את גני הבהאים בחיפה|حدائق البهائيين في حيفا|сады бахаи в Хайфе|the Baha'i Gardens in Haifa
E e_mall|t|את כנסיית הקבר בעיר העתיקה בירושלים|كنيسة القيامة في البلدة القديمة في القدس|храм Гроба Господня в Старом городе Иерусалима|the Church of the Holy Sepulchre in the Old City of Jerusalem
Q מה עושים כשחבר חוגג חג שאנחנו לא חוגגים?|ماذا نفعل عندما يحتفل صديق بعيد لا نحتفل به؟|Что делать, когда друг празднует праздник, который мы не отмечаем?|What do we do when a friend celebrates a holiday that we do not celebrate?|e_greet|e_laugh,e_ignore2,e_forbid
Y ברכה קטנה מראה לחבר שאכפת לנו ממנו, גם כשהחג שלו שונה משלנו.|تهنئة صغيرة تُظهر لصديقنا أننا نهتمّ به، حتى عندما يكون عيده مختلفًا عن عيدنا.|Маленькое поздравление показывает другу, что он нам дорог, даже если его праздник не наш.|A small greeting shows a friend that we care, even when their holiday is different from ours.
E e_greet|t|מברכים אותו בכבוד ושמחים איתו|نهنّئه باحترام ونفرح معه|поздравляем его с уважением и радуемся вместе|we greet him with respect and are happy with him
E e_laugh|t|צוחקים על המנהגים שלו ומספרים לכל הכיתה|نضحك على عاداته ونحكي ذلك لكل الصف|смеёмся над его обычаями и рассказываем всему классу|we laugh at his customs and tell it to the whole class
E e_ignore2|t|לא מדברים איתו כל היום|لا نكلّمه طوال اليوم|не разговариваем с ним весь день|we do not talk to him all day
E e_forbid|t|אומרים לו לא לחגוג|نقول له ألّا يحتفل|говорим ему не праздновать|we tell him not to celebrate
E xc_newcl|t|לובשים בגדים חדשים|يلبسون ملابس جديدة|надевают новую одежду|they wear new clothes
E xc_sukb|t|בונים סוכה וישנים בה|يبنون سُكّا وينامون فيها|строят сукку и спят в ней|they build a sukkah and sleep in it
E xc_matzeat|t|אוכלים מצה במקום לחם|يأكلون الماتساه بدل الخبز|едят мацу вместо хлеба|they eat matzah instead of bread
Q מה עושים בעיד אל־פיטר?|ماذا يفعل الناس في عيد الفطر؟|Что делают в Ид аль-Фитр?|What do people do on Eid al-Fitr?|xc_newcl|xc_sukb,xc_light,xc_matzeat
Y עיד אל־פיטר הוא חג שמח אחרי חודש של צום, ולכן נוהגים ללבוש בו בגדים חדשים.|عيد الفطر عيد فرح بعد شهر من الصيام، لذلك من العادة لبس ملابس جديدة فيه.|Ид аль-Фитр - радостный праздник после месяца поста, поэтому в него принято надевать новую одежду.|Eid al-Fitr is a happy holiday after a month of fasting, so people usually wear new clothes.
Q מתי חוגגים הנוצרים את חג הפסחא?|متى يحتفل المسيحيون بعيد الفصح؟|Когда христиане празднуют Пасху?|When do Christians celebrate Easter?|xc_spr|xc_sumr,xc_autm,xc_wint
Y חג הפסחא חל סמוך לפסח, ולכן גם הוא חל באביב.|عيد الفصح المسيحي يأتي قريبًا من بيساح، لذلك هو أيضًا في الربيع.|Христианская Пасха бывает недалеко от еврейского Песаха, поэтому она тоже весной.|Easter falls close to Pesach, so it is also in the spring.
E xc_eidm|t|עיד מובארכ|عيد مبارك|Ид мубарак|Eid Mubarak
E xc_merry|t|מרי כריסטמס|ميري كريسماس|С Рождеством|Merry Christmas
E xc_shanat|t|שנה טובה|شانا توفا (سنة طيبة)|Шана това|Shana Tova
E xc_shabsh|t|שבת שלום|شابات شالوم (سبت سلام)|Шабат шалом|Shabbat Shalom
Q איך מברכים חבר מוסלמי בחג שלו?|كيف نهنّئ صديقًا مسلمًا في عيده؟|Как поздравить друга-мусульманина с его праздником?|How do we greet a Muslim friend on his holiday?|xc_eidm|xc_merry,xc_shanat,xc_shabsh
Y עיד מובארכ פירושו בערבית חג מבורך, וזו הברכה שנוהגים לומר בחגים של המוסלמים.|عيد مبارك تحية يقولها المسلمون عادةً في أعيادهم، ومعناها عيد فيه بركة.|«Ид мубарак» по-арабски значит благословенный праздник, так принято поздравлять мусульман.|Eid Mubarak means a blessed holiday in Arabic, and it is the usual greeting on Muslim holidays.
E xc_allp|t|יהודים, מוסלמים, נוצרים, דרוזים ועוד|يهود ومسلمون ومسيحيون ودروز وغيرهم|евреи, мусульмане, христиане, друзы и другие|Jews, Muslims, Christians, Druze and others
E xc_jonly|t|יהודים בלבד, בלי אף קבוצה אחרת|يهود فقط، بلا أي مجموعة أخرى|только евреи, и ни одной другой группы|only Jews, and no other group
E xc_monly|t|מוסלמים ונוצרים בלבד|مسلمون ومسيحيون فقط|только мусульмане и христиане|only Muslims and Christians
E xc_donly|t|דרוזים ויהודים בלבד|دروز ويهود فقط|только друзы и евреи|only Druze and Jews
Q מי חיים בישראל?|من يعيش في إسرائيل؟|Кто живёт в Израиле?|Who lives in Israel?|xc_allp|xc_jonly,xc_monly,xc_donly
Y בישראל חיות יחד הרבה קבוצות, ולכל אחת מהן יש חגים משלה.|في إسرائيل تعيش معًا مجموعات كثيرة، ولكل واحدة منها أعيادها.|В Израиле вместе живут многие группы, и у каждой из них свои праздники.|Many groups live together in Israel, and each of them has its own holidays.
S holy|🕌|#c92a2a|מקומות מיוחדים בירושלים ובחיפה|أماكن مميّزة في القدس وحيفا|особые места в Иерусалиме и Хайфе|Special Places in Jerusalem and Haifa
L ירושלים היא עיר מיוחדת. היא קדושה ליהודים, למוסלמים ולנוצרים.|القدس مدينة مميّزة. وهي مقدّسة لدى اليهود والمسلمين والمسيحيين.|Иерусалим - особенный город. Он священен для евреев, мусульман и христиан.|Jerusalem is a special city. It is holy to Jews, Muslims and Christians.
L הכותל המערבי הוא קיר עתיק. יהודים באים להתפלל שם ומכניסים פתקים בין האבנים.|الحائط الغربي (الكوتل) جدار قديم. يأتي اليهود للصلاة هناك ويضعون رسائل بين الحجارة.|Западная стена - древняя стена. Евреи приходят туда молиться и кладут записки между камней.|The Western Wall is an ancient wall. Jewish people come to pray there and put notes between the stones.
L בעיר העתיקה יש גם מסגד אל־אקצא וכיפת הסלע. אלה מקומות קדושים למוסלמים.|وفي البلدة القديمة أيضًا المسجد الأقصى وقبّة الصخرة. وهذه أماكن مقدّسة للمسلمين.|В Старом городе есть также мечеть Аль-Акса и Купол скалы. Это священные места для мусульман.|In the Old City there are also the Al-Aqsa Mosque and the Dome of the Rock. These are holy places for Muslims.
L כנסיית הקבר היא מקום קדוש לנוצרים. מאמינים ששם קברו את ישו.|كنيسة القيامة مكان مقدّس للمسيحيين. يؤمنون أنه دُفن فيها يسوع.|Храм Гроба Господня - священное место для христиан. Верующие считают, что там был похоронен Иисус.|The Church of the Holy Sepulchre is a holy place for Christians. Believers say Jesus was buried there.
L בחיפה יש גנים יפים של הדת הבהאית, והם אתר מורשת עולמית.|في حيفا حدائق جميلة للديانة البهائية، وهي موقع تراث عالمي.|В Хайфе есть красивые сады бахаи, они входят в список Всемирного наследия.|In Haifa there are beautiful gardens of the Bahá'í faith, and they are a World Heritage site.
L כשמבקרים במקום קדוש, מתלבשים בצניעות, מדברים בשקט ומכבדים את המתפללים.|عند زيارة مكان مقدّس نلبس بتواضع ونتكلّم بهدوء ونحترم المصلّين.|Когда мы посещаем священное место, мы скромно одеваемся, говорим тихо и уважаем молящихся.|When we visit a holy place we dress modestly, talk quietly and respect the people who pray.
E pl_kotel|l|הכותל המערבי|الحائط الغربي (الكوتل)|Западная стена|the Western Wall
E pl_aqsa|l|מסגד אל־אקצא|المسجد الأقصى|мечеть Аль-Акса|the Al-Aqsa Mosque
E pl_sepul|l|כנסיית הקבר|كنيسة القيامة|Храм Гроба Господня|the Church of the Holy Sepulchre
E pl_bahai|l|גני הבהאים|حدائق البهائيين|сады бахаи|the gardens of the Bahá'í faith
E pl_eiffel|l|מגדל אייפל|برج إيفل|Эйфелева башня|the Eiffel Tower
E pl_pyram|l|הפירמידות|الأهرامات|пирамиды|the pyramids
E pl_eilat|l|חוף אילת|شاطئ إيلات|пляж Эйлата|the Eilat beach
Q איפה יהודים מתפללים ומכניסים פתקים בין האבנים?|أين يصلّي اليهود ويضعون رسائل بين الحجارة؟|Где евреи молятся и кладут записки между камней?|Where do Jewish people pray and put notes between the stones?|pl_kotel|pl_aqsa,pl_sepul,pl_bahai
Y הכותל הוא חלק מהקיר שהקיף את המקדש, ולכן יהודים מתפללים בו.|الحائط الغربي (الكوتل) جزء من السور الذي أحاط بالهيكل، لذلك يصلّي عنده اليهود.|Западная стена - часть стены, которая окружала Храм, поэтому евреи молятся у неё.|The Western Wall is part of the wall that surrounded the Temple, so Jewish people pray there.
Q איזה מקום בירושלים קדוש למוסלמים?|أي مكان في القدس مقدّس للمسلمين؟|Какое место в Иерусалиме священно для мусульман?|Which place in Jerusalem is holy to Muslims?|pl_aqsa|pl_kotel,pl_sepul,pl_bahai
Y מסגד אל־אקצא הוא אחד המסגדים החשובים ביותר באסלאם, והוא בעיר העתיקה.|المسجد الأقصى من أهمّ المساجد في الإسلام، وهو في البلدة القديمة.|Мечеть Аль-Акса - одна из самых важных мечетей в исламе, она в Старом городе.|The Al-Aqsa Mosque is one of the most important mosques in Islam, and it is in the Old City.
Q איזה מקום בירושלים קדוש לנוצרים?|أي مكان في القدس مقدّس للمسيحيين؟|Какое место в Иерусалиме священно для христиан?|Which place in Jerusalem is sacred to Christians?|pl_sepul|pl_kotel,pl_aqsa,pl_bahai
Y הנוצרים מאמינים שבמקום הזה ישו נקבר, ולכן הכנסייה קדושה להם.|يؤمن المسيحيون أن يسوع دُفن في هذا المكان، لذلك الكنيسة مقدّسة لهم.|Христиане верят, что на этом месте был похоронен Иисус, поэтому храм для них святой.|Christians believe Jesus was buried in this place, so the church is holy to them.
Q איפה נמצאים גני הבהאים?|أين توجد حدائق البهائيين؟|Где находятся сады бахаи?|Where are the Bahá'í Gardens?|e_haifa2|e_eilat2,e_safed2,e_arad2
Y המרכז העולמי של הדת הבהאית נמצא על הר הכרמל בחיפה, ושם נטעו את הגנים.|المركز العالمي للديانة البهائية على جبل الكرمل في حيفا، وهناك زُرعت الحدائق.|Всемирный центр веры бахаи находится на горе Кармель в Хайфе, и там разбили сады.|The world center of the Bahá'í faith is on Mount Carmel in Haifa, and the gardens were planted there.
E e_haifa2|l|בחיפה|في حيفا|в Хайфе|in Haifa
E e_eilat2|l|באילת|في إيلات|в Эйлате|in Eilat
E e_safed2|l|בבאר שבע|في بئر السبع|в Беэр-Шеве|in Beersheba
E e_arad2|l|ברמת גן|في رمات غان|в Рамат-Гане|in Ramat Gan
Q איך מתנהגים כשמבקרים במקום קדוש?|كيف نتصرّف عند زيارة مكان مقدّس؟|Как себя ведут в священном месте?|How do we behave when we visit a holy place?|e_respect|e_loud,e_selfie,e_run3
Y אנשים באים למקום קדוש כדי להתפלל, ושקט וכבוד עוזרים להם להתרכז.|يأتي الناس إلى المكان المقدّس ليصلّوا، والهدوء والاحترام يساعدانهم على التركيز.|Люди приходят в священное место молиться, а тишина и уважение помогают им сосредоточиться.|People come to a holy place to pray, and quiet and respect help them focus.
E e_respect|t|בשקט ובכבוד, בבגדים צנועים|بهدوء واحترام وبملابس محتشمة|тихо и с уважением, в скромной одежде|quietly and with respect, in modest clothes
E e_loud|t|בצעקות ובמשחקים רועשים בין המתפללים|بالصراخ والألعاب الصاخبة بين المصلّين|с криками и шумными играми среди молящихся|with shouting and noisy games among the worshippers
E e_selfie|t|מצלמים בפלאש ומפריעים למתפללים|نصوّر بالفلاش ونزعج المصلّين|снимаем со вспышкой и мешаем молящимся|we take flash photos and disturb the worshippers
E e_run3|t|רצים ונוגעים בכל דבר|نركض ونلمس كل شيء|бегаем и трогаем всё подряд|we run and touch everything
E xc_3rel|t|ליהודים, למוסלמים ולנוצרים|لليهود والمسلمين والمسيحيين|для евреев, мусульман и христиан|to Jews, Muslims and Christians
E xc_jbah|t|ליהודים ולבהאים בלבד|لليهود والبهائيين فقط|только для евреев и бахаи|only to Jews and Baha'is
E xc_mdru|t|למוסלמים ולדרוזים בלבד|للمسلمين والدروز فقط|только для мусульман и друзов|only to Muslims and Druze
E xc_conly|t|לנוצרים בלבד|للمسيحيين فقط|только для христиан|only to Christians
Q למי ירושלים קדושה?|لمن القدس مقدّسة؟|Для кого Иерусалим — святой город?|To whom is Jerusalem holy?|xc_3rel|xc_jbah,xc_mdru,xc_conly
Y בירושלים יש מקומות קדושים לכל שלוש הדתות, כמו הכותל, אל־אקצא וכנסיית הקבר.|في القدس أماكن مقدّسة للديانات الثلاث، مثل الحائط الغربي والمسجد الأقصى وكنيسة القيامة.|В Иерусалиме есть святыни трёх религий: Западная стена, Аль-Акса и Храм Гроба Господня.|Jerusalem has holy places of all three religions, like the Western Wall, Al-Aqsa and the Holy Sepulchre.
E xc_wall|t|קיר עתיק של אבנים|جدار حجري قديم|древняя каменная стена|an ancient stone wall
E xc_tower|t|מגדל חדש של זכוכית|برج زجاجي جديد|новая стеклянная башня|a new glass tower
E xc_bridge|t|גשר ארוך מעל נהר|جسر طويل فوق نهر|длинный мост через реку|a long bridge over a river
E xc_gate|t|שער ברזל של גן|بوابة حديد لحديقة|железные ворота сада|an iron garden gate
Q מהו הכותל המערבי?|ما هو الحائط الغربي (الكوتل)؟|Что такое Западная стена?|What is the Western Wall?|xc_wall|xc_tower,xc_bridge,xc_gate
Y הכותל נבנה לפני כ־2000 שנה מאבנים גדולות, והוא עומד עד היום.|بُني الحائط الغربي قبل نحو 2000 سنة من حجارة كبيرة، وما زال قائمًا حتى اليوم.|Стену построили около 2000 лет назад из больших камней, и она стоит до сих пор.|The Wall was built about 2000 years ago from large stones, and it still stands today.
E xc_oldc|l|בעיר העתיקה בירושלים|في البلدة القديمة في القدس|в Старом городе Иерусалима|in the Old City of Jerusalem
E xc_haifap|l|בנמל של חיפה|في ميناء حيفا|в порту Хайфы|in the port of Haifa
E xc_tlv|l|במרכז תל אביב|في وسط تل أبيب|в центре Тель-Авива|in the center of Tel Aviv
E xc_eilb|l|על חוף הים באילת|على شاطئ البحر في إيلات|на пляже в Эйлате|on the beach in Eilat
Q איפה נמצאת כיפת הסלע?|أين تقع قبة الصخرة؟|Где находится Купол Скалы?|Where is the Dome of the Rock?|xc_oldc|xc_haifap,xc_tlv,xc_eilb
Y כיפת הסלע עומדת על הר הבית, שנקרא גם אל־חרם אל־שריף, בתוך העיר העתיקה.|قبّة الصخرة قائمة على الحرم الشريف، الذي يُسمّى أيضًا جبل الهيكل، داخل البلدة القديمة.|Купол скалы стоит на Храмовой горе, её также называют Харам аш-Шариф, в Старом городе.|The Dome of the Rock stands on the Temple Mount, also called Haram al-Sharif, inside the Old City.
E xc_jesus|p|ישו|يسوع|Иисус|Jesus
Q לפי אמונת הנוצרים, מי נקבר במקום שבו עומדת כנסיית הקבר?|بحسب إيمان المسيحيين، مَن دُفن في المكان الذي تقوم فيه كنيسة القيامة؟|По вере христиан, кто был похоронен там, где стоит храм Гроба Господня?|According to Christian belief, who was buried where the Church of the Holy Sepulchre stands?|xc_jesus|e_moses,e_noah,e_benyeh
Y לפי האמונה הנוצרית ישו נקבר שם, ולכן הכנסייה נקראת כנסיית הקבר.|بحسب الإيمان المسيحي دُفن يسوع هناك ثم قام، لذلك تُسمّى كنيسة القيامة.|По христианской вере там был похоронен Иисус, поэтому храм называется Храмом Гроба Господня.|According to Christian belief Jesus was buried there, so it is called the Church of the Holy Sepulchre.
E xc_herit|t|הם אתר מורשת עולמית|إنها موقع تراث عالمي|это объект всемирного наследия|they are a World Heritage Site
E xc_highest|t|הם ההר הגבוה בארץ|إنها أعلى جبل في البلاد|это самая высокая гора в стране|they are the highest mountain in the country
E xc_mkt|t|הם שוק גדול של פירות|إنها سوق كبير للفواكه|это большой фруктовый рынок|they are a big fruit market
E xc_zoo|t|הם גן החיות של העיר|إنها حديقة حيوانات المدينة|это городской зоопарк|they are the city zoo
Q מה מיוחד בגני הבהאים?|ما المميّز في حدائق البهائيين؟|Чем особенны Бахайские сады?|What is special about the Baha'i Gardens?|xc_herit|xc_highest,xc_mkt,xc_zoo
Y הגנים יפים וחשובים לכל העולם, ולכן אונסק״ו הכריז עליהם כאתר מורשת עולמית.|الحدائق جميلة ومهمّة للعالم كله، لذلك أعلنتها اليونسكو موقع تراث عالمي.|Сады красивы и важны для всего мира, поэтому ЮНЕСКО внесла их в список Всемирного наследия.|The gardens are beautiful and important to the whole world, so UNESCO named them a World Heritage site.
S calend|📅|#862e9c|הלוח העברי והשפה העברית|التقويم العبري واللغة العبرية|еврейский календарь и иврит|The Hebrew Calendar and the Hebrew Language
L חגי ישראל נקבעים לפי הלוח העברי. הוא מתבסס על הירח ועל השמש.|تُحدَّد أعياد إسرائيل حسب التقويم العبري. وهو مبني على القمر والشمس.|Праздники Израиля определяются по еврейскому календарю. Он основан на Луне и Солнце.|Israel's holidays are set by the Hebrew calendar. It is based on the moon and the sun.
L חודש עברי מתחיל כשהירח חדש. יש בו עשרים ותשעה או שלושים ימים.|يبدأ الشهر العبري عندما يكون القمر جديدًا. وفيه تسعة وعشرون أو ثلاثون يومًا.|Еврейский месяц начинается с новолуния. В нём двадцать девять или тридцать дней.|A Hebrew month begins when the moon is new. It has twenty-nine or thirty days.
L שמות החודשים הם: תשרי, חשוון, כסלו, טבת, שבט, אדר, ניסן, אייר, סיוון, תמוז, אב ואלול.|أسماء الأشهر هي: تشري، حشفان، كسلاو، طيفت، شباط، أدار، نيسان، أيار، سيفان، تموز، آف وإيلول.|Месяцы называются: тишрей, хешван, кислев, тевет, шват, адар, нисан, ияр, сиван, тамуз, ав и элул.|The months are: Tishrei, Cheshvan, Kislev, Tevet, Shevat, Adar, Nisan, Iyar, Sivan, Tammuz, Av and Elul.
L בשבוע יש שבעה ימים: יום ראשון, יום שני, שלישי, רביעי, חמישי, שישי ושבת.|في الأسبوع سبعة أيام: يوم أول، ثانٍ، ثالث، رابع، خامس، جمعة وسبت.|В неделе семь дней: первый день, второй, третий, четвёртый, пятый, пятница и суббота.|A week has seven days: first day, second day, third, fourth, fifth, Friday and Shabbat.
L המוסלמים סופרים לפי לוח הירח שלהם, והנוצרים לפי הלוח הכללי. לכן החגים שלהם בתאריכים אחרים.|يحسب المسلمون حسب تقويمهم القمري، ويحسب المسيحيون حسب التقويم العام. لذلك تقع أعيادهم في تواريخ أخرى.|Мусульмане считают по своему лунному календарю, а христиане - по общему. Поэтому их праздники приходятся на другие даты.|Muslims count by their own moon calendar, and Christians by the general calendar. That is why their holidays fall on other dates.
L העברית היא שפה עתיקה. היא חזרה לדיבור ביום־יום, ואליעזר בן־יהודה עזר לכך. בישראל מדברים גם ערבית, רוסית, אמהרית, אנגלית ועוד.|العبرية لغة قديمة. عادت للكلام اليومي وساعد في ذلك إليعيزر بن يهودا. وفي إسرائيل يتكلّمون أيضًا العربية والروسية والأمهرية والإنجليزية وغيرها.|Иврит - древний язык. Он вернулся в повседневную речь, и в этом помог Элиэзер Бен-Йегуда. В Израиле говорят также на арабском, русском, амхарском, английском и других языках.|Hebrew is an ancient language. It came back into everyday speech, and Eliezer Ben-Yehuda helped with that. In Israel people also speak Arabic, Russian, Amharic, English and more.
Q לפי מה נקבעים חגי ישראל?|حسب ماذا تُحدَّد أعياد إسرائيل؟|Как определяются праздники Израиля?|By what are Israel's holidays set?|e_hcal|e_shoes,e_menu,e_map2
Y חגי ישראל קשורים לירח ולעונות של הארץ, ולכן הם נקבעים בלוח העברי.|أعياد إسرائيل مرتبطة بالقمر وبفصول البلاد، لذلك تُحدَّد حسب التقويم العبري.|Праздники Израиля связаны с Луной и временами года, поэтому их определяют по еврейскому календарю.|Israel's holidays follow the moon and the seasons, so they are set by the Hebrew calendar.
E e_hcal|t|לפי הלוח העברי|حسب التقويم العبري|по еврейскому календарю|by the Hebrew calendar
E e_shoes|t|לפי הלוח הכללי|حسب التقويم العام|по общему календарю|by the general calendar
E e_menu|t|לפי לוח הירח של המוסלמים|حسب التقويم القمري عند المسلمين|по лунному календарю мусульман|by the Muslim moon calendar
E e_map2|t|לפי עונות השנה בלבד|حسب فصول السنة فقط|только по временам года|by the seasons only
Q כמה ימים יש בשבוע?|كم يومًا في الأسبوع؟|Сколько дней в неделе?|How many days are in a week?|n7|n5,n10,n12
Y השבוע נגמר בשבת, שהיא היום ה־7, ואז מתחיל שבוע חדש.|الأسبوع ينتهي يوم السبت، وهو اليوم 7، ثم يبدأ أسبوع جديد.|Неделя заканчивается Шаббатом, 7-м днём, и потом начинается новая неделя.|The week ends with Shabbat, the 7th day, and then a new week begins.
Q כמה ימים יש בחודש עברי?|كم يومًا في الشهر العبري؟|Сколько дней в еврейском месяце?|How many days are in a Hebrew month?|e_29|e_8d,e_100d,e_14d
Y מירח חדש אחד עד הבא עוברים בערך 29 ימים וחצי, ולכן החודש הוא 29 או 30 ימים.|من قمر جديد إلى القمر الجديد التالي تمرّ نحو 29 يومًا ونصف، لذلك الشهر 29 أو 30 يومًا.|От одного новолуния до следующего проходит около 29 с половиной дней, поэтому в месяце 29 или 30 дней.|From one new moon to the next takes about 29 and a half days, so a month has 29 or 30 days.
E e_29|t|עשרים ותשעה או שלושים|تسعة وعشرون أو ثلاثون|двадцать девять или тридцать|twenty-nine or thirty
E e_8d|t|שבעה או שמונה|سبعة أو ثمانية|семь или восемь|seven or eight
E e_100d|t|שלושים או שלושים ואחד|ثلاثون أو واحد وثلاثون|тридцать или тридцать один|thirty or thirty-one
E e_14d|t|ארבעה עשר או עשרים ושמונה|أربعة عشر أو ثمانية وعشرون|четырнадцать или двадцать восемь|fourteen or twenty-eight
Q באיזה חודש עברי חל ראש השנה?|أي شهر عبري يبدأ فيه رأس السنة العبرية؟|В каком еврейском месяце бывает Рош а-Шана?|In which Hebrew month does Rosh Hashanah fall?|e_tishrei|e_nisan,e_adar,e_sivan
Y ראש השנה פותח את השנה העברית, והוא חל ב־1 בחודש תשרי.|رأس السنة العبرية يفتتح السنة العبرية، ويقع في 1 من شهر تشري.|Рош а-Шана открывает еврейский год и приходится на 1 тишрея.|Rosh Hashanah opens the Hebrew year, and it falls on the 1st of Tishrei.
E e_tishrei|t|תשרי|تشري|тишрей|Tishrei
E e_nisan|t|ניסן|نيسان|нисан|Nisan
E e_adar|t|אדר|أدار|адар|Adar
E e_sivan|t|סיוון|سيفان|сиван|Sivan
Q מי עזר להחזיר את העברית לדיבור ביום־יום?|من ساعد في إعادة العبرية إلى الكلام اليومي؟|Кто помог вернуть иврит в повседневную речь?|Who helped to bring Hebrew back into everyday speech?|e_benyeh|e_haman,e_esther,e_herzl
Y אליעזר בן־יהודה דיבר רק עברית בבית, וכתב מילון עם מילים חדשות.|كان إليعيزر بن يهودا يتكلّم العبرية فقط في بيته، وكتب قاموسًا فيه كلمات جديدة.|Элиэзер Бен-Йегуда говорил дома только на иврите и написал словарь с новыми словами.|Eliezer Ben-Yehuda spoke only Hebrew at home and wrote a dictionary with new words.
E e_benyeh|p|אליעזר בן־יהודה|إليعيزر بن يهودا|Элиэзер Бен-Йегуда|Eliezer Ben-Yehuda
E e_herzl|p|תיאודור הרצל|تيودور هرتسل|Теодор Герцль|Theodor Herzl
Q אילו שפות מדברים בישראל?|أي لغات يتكلّمون في إسرائيل؟|На каких языках говорят в Израиле?|Which languages do people speak in Israel?|e_langs|e_onlyh,e_latin,e_none
Y אנשים הגיעו לישראל מהרבה ארצות, וכל אחד הביא איתו את השפה שלו.|جاء الناس إلى إسرائيل من بلدان كثيرة، وكل واحد أحضر معه لغته.|Люди приехали в Израиль из многих стран, и каждый привёз свой язык.|People came to Israel from many countries, and each one brought their own language.
E e_langs|t|עברית, ערבית, רוסית, אמהרית, אנגלית ועוד|العبرية والعربية والروسية والأمهرية والإنجليزية وغيرها|иврит, арабский, русский, амхарский, английский и другие|Hebrew, Arabic, Russian, Amharic, English and more
E e_onlyh|t|ערבית, רוסית ואמהרית בלבד, בלי עברית כלל|العربية والروسية والأمهرية فقط، بدون العبرية إطلاقًا|только арабский, русский и амхарский, без иврита|only Arabic, Russian and Amharic, with no Hebrew at all
E e_latin|t|עברית, לטינית ויוונית עתיקה בלבד|العبرية واللاتينية واليونانية القديمة فقط|только иврит, латынь и древнегреческий|only Hebrew, Latin and ancient Greek
E e_none|t|עברית, יפנית, סינית, קוריאנית, הינדית ותאילנדית|العبرية واليابانية والصينية والكورية والهندية والتايلاندية|иврит, японский, китайский, корейский, хинди и тайский язык|Hebrew, Japanese, Chinese, Korean, Hindi and Thai too
E xc_moonsun|t|על הירח ועל השמש|على القمر والشمس|на Луне и Солнце|on the moon and the sun
E xc_sunonly|t|על השמש בלבד|على الشمس فقط|только на Солнце|on the sun only
E xc_starsonly|t|על הכוכבים בלבד|على النجوم فقط|только на звёздах|on the stars only
E xc_rainwind|t|על הגשם ועל הרוח|على المطر والريح|на дожде и ветре|on rain and wind
Q על מה מתבסס הלוח העברי?|على ماذا يعتمد التقويم العبري؟|На чём основан еврейский календарь?|What is the Hebrew calendar based on?|xc_moonsun|xc_sunonly,xc_starsonly,xc_rainwind
Y החודשים נקבעים לפי הירח, והעונות לפי השמש, והלוח העברי משתמש בשניהם.|الأشهر تُحدَّد حسب القمر، والفصول حسب الشمس، والتقويم العبري يستخدم الاثنين.|Месяцы считают по Луне, а времена года по Солнцу, и еврейский календарь использует и то и другое.|Months follow the moon and seasons follow the sun, and the Hebrew calendar uses both.
E xc_newmoon|t|כשהירח חדש|عندما يكون القمر جديدًا|когда луна новая|when the moon is new
E xc_fullmoon|t|כשהירח מלא|عندما يكون القمر بدرًا|когда луна полная|when the moon is full
E xc_firstrain|t|כשיורד הגשם הראשון|عندما ينزل المطر الأول|когда идёт первый дождь|when the first rain falls
E xc_sunday|t|בכל יום ראשון בשבוע|في كل يوم أحد|каждое воскресенье|every Sunday
Q מתי מתחיל חודש עברי?|متى يبدأ الشهر العبري؟|Когда начинается еврейский месяц?|When does a Hebrew month begin?|xc_newmoon|xc_fullmoon,xc_firstrain,xc_sunday
Y הלוח העברי סופר לפי הירח, ולכן חודש חדש מתחיל כשהירח מתחיל לגדול שוב.|التقويم العبري يحسب حسب القمر، لذلك يبدأ الشهر الجديد عندما يبدأ القمر بالظهور من جديد.|Еврейский календарь считает по Луне, поэтому новый месяц начинается, когда Луна снова начинает расти.|The Hebrew calendar follows the moon, so a new month starts when the moon begins to grow again.
Q כמה חודשים יש בשנה עברית רגילה?|كم شهرًا في السنة العبرية العادية؟|Сколько месяцев в обычном еврейском году?|How many months are in a regular Hebrew year?|n12|n7,n10,n14
Y בשנה רגילה יש 12 חודשים, מתשרי ועד אלול, ובשנה מעוברת נוסף עוד חודש.|في السنة العادية 12 شهرًا، من تشري حتى إيلول، وفي السنة الكبيسة يُضاف شهر آخر.|В обычном году 12 месяцев, от тишрея до элула, а в високосном добавляют ещё один.|A regular year has 12 months, from Tishrei to Elul, and a leap year adds one more.
Q באיזה חודש עברי חל פסח?|في أي شهر عبري يحلّ بيساح؟|В каком еврейском месяце бывает Песах?|In which Hebrew month is Pesach?|e_nisan|e_tishrei,e_adar,e_sivan
Y פסח הוא חג האביב, וחודש ניסן הוא חודש האביב בלוח העברי.|بيساح عيد الربيع، وشهر نيسان هو شهر الربيع في التقويم العبري.|Песах - праздник весны, а нисан - весенний месяц еврейского календаря.|Pesach is the spring holiday, and Nisan is the spring month in the Hebrew calendar.
Q באיזה חודש עברי חל פורים?|في أي شهر عبري يحلّ بوريم؟|В каком еврейском месяце бывает Пурим?|In which Hebrew month is Purim?|e_adar|e_tishrei,e_nisan,e_sivan
Y במגילה כתוב שהנס של פורים קרה בחודש אדר, ולכן חוגגים בו.|مكتوب في المغيلا أن معجزة بوريم حدثت في شهر أدار، لذلك يحتفلون فيه.|В мегиле написано, что чудо Пурима случилось в месяце адар, поэтому праздник в этом месяце.|The megillah says the Purim miracle happened in the month of Adar, so it is celebrated then.
`;
