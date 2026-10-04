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
E e_work|t|עובדים בקדחתנות|نعمل بجدّ كبير|усиленно работаем|we work as hard as we can
E e_alone2|t|נשארים לבד בחדר|نبقى وحدنا في الغرفة|остаёмся одни в комнате|we stay alone in a room
E e_rush|t|ממהרים לכל מקום|نسرع إلى كل مكان|спешим повсюду|we rush everywhere
E f_chal|f|חלה|خبز الحلّة|хала|challah
E f_sufg|f|סופגנייה|سوفغانيا (كعكة محشوة)|пончик-суфгания|a sufganiyah (jelly doughnut)
E f_hamen|f|אוזן המן|أذن هامان|ухо Амана|a hamantash
E f_matz|f|מצה|فطير (ماتساه)|маца|matzah
E f_cheese|f|עוגת גבינה|كعكة الجبن|чизкейк|cheesecake
E f_apple|f|תפוח בדבש|تفاحة بالعسل|яблоко с мёдом|an apple in honey
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
Q מה עושים בשבת?|ماذا نفعل يوم السبت؟|Что делают в Шаббат?|What do people do on Shabbat?|e_rest|e_work,e_alone2,e_rush
Q מה מדליקים לפני שבת?|ماذا يُشعلون قبل السبت؟|Что зажигают перед Шаббатом?|What do people light before Shabbat?|o_candl|o_sukk,o_megil,o_shofar
Q איזה לחם יש על שולחן השבת?|أي خبز يكون على مائدة السبت؟|Какой хлеб лежит на субботнем столе?|Which bread is on the Shabbat table?|f_chal|f_matz,f_hamen,f_sufg
Q באיזה יום מתפללים המוסלמים תפילה גדולה?|في أي يوم يؤدّي المسلمون الصلاة الكبيرة؟|В какой день мусульмане совершают большую молитву?|On which day do Muslims have the big prayer?|e_fri|e_wed,e_mon,e_tue
E e_fri|t|ביום שישי|يوم الجمعة|в пятницу|on Friday
E e_wed|t|ביום רביעי|يوم الأربعاء|в среду|on Wednesday
E e_mon|t|ביום שני|يوم الاثنين|в понедельник|on Monday
E e_tue|t|ביום שלישי|يوم الثلاثاء|во вторник|on Tuesday
Q באיזה יום נחים הנוצרים ומתפללים?|في أي يوم يرتاح المسيحيون ويصلّون؟|В какой день христиане отдыхают и молятся?|On which day do Christians rest and pray?|e_sun|e_wed,e_mon,e_tue
E e_sun|t|ביום ראשון|يوم الأحد|в воскресенье|on Sunday
S rosh|🍎|#e8590c|ראש השנה ויום כיפור|رأس السنة العبرية ويوم الغفران|Рош а-Шана и Йом-Кипур|Rosh Hashanah and Yom Kippur
L ראש השנה הוא ראש השנה היהודית. הוא חל בסתיו.|رأس السنة العبرية هو بداية السنة اليهودية. ويأتي في الخريف.|Рош а-Шана - это еврейский Новый год. Он бывает осенью.|Rosh Hashanah is the Jewish New Year. It comes in the autumn.
L בבית הכנסת תוקעים בשופר. השופר עשוי מקרן של איל.|في الكنيس ينفخون في الشوفار. وهو مصنوع من قرن كبش.|В синагоге трубят в шофар. Он сделан из рога барана.|In the synagogue people blow the shofar. It is made from a ram's horn.
L אוכלים תפוח בדבש ואומרים: שתהיה לנו שנה מתוקה.|يأكلون تفاحة بالعسل ويقولون: لتكن لنا سنة حلوة.|Едят яблоко с мёдом и говорят: пусть у нас будет сладкий год.|People eat an apple in honey and say: may we have a sweet year.
L יום כיפור חל כעשרה ימים אחרי ראש השנה.|يأتي يوم الغفران بعد رأس السنة بنحو عشرة أيام.|Йом-Кипур наступает примерно через десять дней после Рош а-Шана.|Yom Kippur comes about ten days after Rosh Hashanah.
L ביום כיפור צמים, מבקשים סליחה ומשתדלים להיות טובים יותר.|في يوم الغفران يصومون ويطلبون المسامحة ويحاولون أن يكونوا أفضل.|В Йом-Кипур постятся, просят прощения и стараются стать лучше.|On Yom Kippur people fast, ask for forgiveness and try to be better.
L ביום כיפור אין מכוניות בכבישים, והילדים רוכבים על אופניים.|في يوم الغفران لا توجد سيارات في الشوارع والأولاد يركبون الدراجات.|В Йом-Кипур на дорогах нет машин, и дети катаются на велосипедах.|On Yom Kippur there are no cars on the roads, and children ride bikes.
Q איזה חג הוא ראש השנה היהודית?|أي عيد هو رأس السنة اليهودية؟|Какой праздник - еврейский Новый год?|Which holiday is the Jewish New Year?|h_rosh|h_pur,h_han,h_pes
Q איזה כלי תוקעים בו בראש השנה?|في أي آلة ينفخون في رأس السنة؟|Во что трубят на Рош а-Шана?|What do people blow on Rosh Hashanah?|o_shofar|o_ragn,o_lulav,o_dreid
Q מה אוכלים בראש השנה כדי לברך על שנה מתוקה?|ماذا يأكلون في رأس السنة لسنة حلوة؟|Что едят на Рош а-Шана ради сладкого года?|What do people eat on Rosh Hashanah for a sweet year?|f_apple|f_hamen,f_matz,f_cheese
Q בערך כמה ימים עוברים מראש השנה עד יום כיפור?|تقريبًا كم يومًا بين رأس السنة ويوم الغفران؟|Примерно сколько дней между Рош а-Шана и Йом-Кипур?|About how many days are there from Rosh Hashanah to Yom Kippur?|n10|n3,n5,n40
Q מה עושים ביום כיפור?|ماذا يفعلون في يوم الغفران؟|Что делают в Йом-Кипур?|What do people do on Yom Kippur?|e_fast|e_party,e_swim,e_shop
E e_fast|t|צמים ומבקשים סליחה|يصومون ويطلبون المسامحة|постятся и просят прощения|they fast and ask for forgiveness
E e_party|t|עושים מסיבה גדולה|يقيمون حفلة كبيرة|устраивают большую вечеринку|they have a big party
E e_swim|t|הולכים לשחות בים|يذهبون للسباحة في البحر|идут купаться в море|they go swimming in the sea
E e_shop|t|יוצאים לקניות|يخرجون للتسوّق|идут за покупками|they go shopping
Q איך נראים הכבישים ביום כיפור?|كيف تبدو الشوارع في يوم الغفران؟|Как выглядят дороги в Йом-Кипур?|What do the roads look like on Yom Kippur?|e_empty|e_jam,e_race,e_flood
E e_empty|t|ריקים ממכוניות|خالية من السيارات|пустые, без машин|empty of cars
E e_jam|t|מלאים בפקקים|مليئة بالازدحام|полные пробок|full of traffic jams
E e_race|t|יש בהם מרוצי מכוניות|فيها سباقات سيارات|там гонки машин|there are car races
E e_flood|t|מכוסים במים|مغطّاة بالماء|залиты водой|covered with water
S sukkot|🌿|#2b8a3e|סוכות ושמחת תורה|سوكوت وفرحة التوراة|Суккот и Симхат-Тора|Sukkot and Simchat Torah
L בסוכות בונים סוכה: בית קטן עם גג של ענפים.|في سوكوت يبنون سُكّا: بيتًا صغيرًا سقفه من الأغصان.|На Суккот строят сукку: маленький домик с крышей из веток.|On Sukkot people build a sukkah: a small hut with a roof of branches.
L דרך הענפים רואים את הכוכבים. אוכלים בסוכה ואפילו ישנים בה.|من بين الأغصان نرى النجوم. يأكلون في السُّكّا وحتى ينامون فيها.|Сквозь ветки видно звёзды. В сукке едят, а иногда и спят.|Through the branches you can see the stars. People eat in the sukkah and sometimes even sleep there.
L הסוכה מזכירה את הימים שבהם עם ישראל הלך במדבר.|السُّكّا تذكّرنا بالأيام التي مشى فيها بنو إسرائيل في الصحراء.|Сукка напоминает о днях, когда народ Израиля шёл по пустыне.|The sukkah reminds us of the days when the people of Israel walked in the desert.
L בסוכות לוקחים ארבעה מינים מיוחדים: לולב, אתרוג, הדס וערבה.|في سوكوت يأخذون أربعة أنواع خاصة: لولاف وإترُج وآسًا وصفصافًا.|На Суккот берут четыре особых растения: лулав, этрог, гадас и арава.|On Sukkot people take four special plants: a lulav, an etrog, myrtle and willow.
L החג נמשך שבעה ימים. אחריו חוגגים את שמחת תורה.|يستمرّ العيد سبعة أيام. وبعده يحتفلون بفرحة التوراة.|Праздник длится семь дней. После него отмечают Симхат-Тору.|The holiday lasts seven days. After it comes Simchat Torah.
L בשמחת תורה מסיימים לקרוא את ספר התורה ומתחילים אותו מחדש. רוקדים עם ספרי תורה ושרים.|في فرحة التوراة ينتهون من قراءة سفر التوراة ويبدؤونه من جديد. يرقصون مع لفائف التوراة ويغنّون.|На Симхат-Тору заканчивают читать свиток Торы и начинают заново. Танцуют со свитками и поют.|On Simchat Torah people finish reading the Torah scroll and start it again. They dance with the scrolls and sing.
Q איזה חג בונים בו סוכה?|في أي عيد يبنون سُكّا؟|В какой праздник строят сукку?|In which holiday do people build a sukkah?|h_suk|h_pur,h_han,h_tub
Q ממה עשוי גג הסוכה?|مِمَّ يُصنع سقف السُّكّا؟|Из чего сделана крыша сукки?|What is the roof of a sukkah made of?|e_branch|e_concr,e_glass,e_tiles
E e_branch|t|מענפים|من الأغصان|из веток|branches
E e_concr|t|מבטון|من الإسمنت|из бетона|concrete
E e_glass|t|מזכוכית|من الزجاج|из стекла|glass
E e_tiles|t|מרעפים|من القرميد|из черепицы|roof tiles
Q כמה מינים מיוחדים לוקחים בסוכות?|كم نوعًا خاصًّا يأخذون في سوكوت؟|Сколько особых растений берут на Суккот?|How many special plants do people take on Sukkot?|n4|n3,n7,n10
Q איזה מהדברים האלה הוא אחד מארבעת המינים?|أي من هذه الأشياء هو أحد الأنواع الأربعة؟|Что из этого - одно из четырёх растений?|Which of these is one of the four plants?|o_lulav|o_dreid,o_ragn,o_shofar
Q כמה ימים נמשך חג סוכות?|كم يومًا يستمرّ عيد سوكوت؟|Сколько дней длится Суккот?|How many days does Sukkot last?|n7|n3,n10,n40
Q מה עושים בשמחת תורה?|ماذا يفعلون في فرحة التوراة؟|Что делают на Симхат-Тору?|What do people do on Simchat Torah?|e_dance|e_fastt,e_sleepb,e_nothing
E e_dance|t|רוקדים עם ספרי תורה|يرقصون مع لفائف التوراة|танцуют со свитками Торы|they dance with Torah scrolls
E e_fastt|t|צמים כל היום|يصومون طوال اليوم|постятся весь день|they fast all day
E e_sleepb|t|ישנים בבית הספר|ينامون في المدرسة|спят в школе|they sleep at school
E e_nothing|t|לא עושים כלום|لا يفعلون شيئًا|ничего не делают|they do nothing
S hanuka|🕎|#e67700|חנוכה: חג האורים|حانوكا: عيد الأنوار|Ханука: праздник огней|Hanukkah: The Festival of Lights
L לפני הרבה שנים המקדש בירושלים היה מלוכלך. המכבים ניצחו והחזירו אותו לעם.|قبل سنوات كثيرة كان الهيكل في القدس متّسخًا. انتصر المكابيون وأعادوه للشعب.|Много лет назад Храм в Иерусалиме был осквернён. Маккавеи победили и вернули его народу.|Many years ago the Temple in Jerusalem was dirty. The Maccabees won and gave it back to the people.
L במקדש היה רק קצת שמן, אבל הוא דלק שמונה ימים. זה היה נס.|لم يكن في الهيكل إلا القليل من الزيت، لكنه اشتعل ثمانية أيام. كانت تلك معجزة.|В Храме было совсем мало масла, но оно горело восемь дней. Это было чудо.|There was only a little oil in the Temple, but it burned for eight days. It was a miracle.
L בחנוכה מדליקים חנוכייה. בכל לילה מדליקים נר אחד יותר.|في حانوكا يُشعلون شمعدان حانوكا. كل ليلة يُشعلون شمعة إضافية.|На Хануку зажигают ханукию. Каждую ночь зажигают на одну свечу больше.|On Hanukkah people light a hanukkiah. Every night they light one more candle.
L יש בחנוכייה תשעה קנים. אחד מהם הוא השמש, הנר שמדליקים בו את האחרים.|في الشمعدان تسعة فروع. أحدها هو الشمّاش، الشمعة التي نُشعل بها الباقي.|У ханукии девять рожков. Один из них - шамаш, свеча, от которой зажигают остальные.|The hanukkiah has nine branches. One is the shamash, the candle that lights the others.
L אוכלים סופגניות ולביבות, כי הן מטוגנות בשמן. משחקים בסביבון.|يأكلون السوفغانيا واللَّبيبوت لأنها تُقلى بالزيت. ويلعبون بالسفيفون.|Едят суфгании и латкес: их жарят в масле. Играют в волчок-севивон.|People eat sufganiyot and latkes, because they are fried in oil. They play with a dreidel.
Q איזה חג נמשך שמונה ימים ומדליקים בו נרות כל לילה?|أي عيد يستمرّ ثمانية أيام ويُشعلون فيه الشموع كل ليلة؟|Какой праздник длится восемь дней, и в нём каждую ночь зажигают свечи?|Which holiday lasts eight days, with candles lit every night?|h_han|h_pur,h_suk,h_shav
Q על איזה נס מספרים בחנוכה?|عن أي معجزة نحكي في حانوكا؟|О каком чуде рассказывают на Хануку?|Which miracle do we tell about on Hanukkah?|e_oil|e_rain,e_sea,e_bread
E e_oil|t|מעט שמן דלק שמונה ימים|القليل من الزيت اشتعل ثمانية أيام|немного масла горело восемь дней|a little oil burned for eight days
E e_rain|t|גשם ירד ארבעים יום|نزل المطر أربعين يومًا|дождь шёл сорок дней|rain fell for forty days
E e_sea|t|הים נהיה מתוק|صار البحر حلوًا|море стало сладким|the sea became sweet
E e_bread|t|הלחם גדל מעצמו|كبر الخبز من تلقاء نفسه|хлеб вырос сам|the bread grew by itself
Q איך קוראים לנר שמדליקים בו את שאר הנרות?|ماذا نسمّي الشمعة التي نُشعل بها باقي الشموع؟|Как называется свеча, от которой зажигают остальные?|What is the candle that lights the others called?|e_shamash|e_hamash,e_hall,e_goal
E e_shamash|t|השמש|الشمّاش|шамаш|the shamash
E e_hamash|t|הסביבון|السفيفون|севивон|the dreidel
E e_hall|t|המגילה|الميغيلا|мегила|the megillah
E e_goal|t|השופר|الشوفار|шофар|the shofar
Q כמה קנים יש בחנוכייה, כולל השמש?|كم فرعًا في شمعدان حانوكا مع الشمّاش؟|Сколько рожков у ханукии вместе с шамашем?|How many branches does a hanukkiah have, with the shamash?|n9|n7,n8,n10
Q איזה מאכל אוכלים בחנוכה?|أي طعام يأكلون في حانوكا؟|Какое блюдо едят на Хануку?|Which food do people eat on Hanukkah?|f_sufg|f_matz,f_hamen,f_chal
Q באיזה משחק משחקים בחנוכה?|أي لعبة يلعبون في حانوكا؟|Во что играют на Хануку?|Which game do people play on Hanukkah?|o_dreid|o_ragn,o_lulav,o_hagg
S tubi|🌳|#5c940d|ט״ו בשבט: ראש השנה לאילנות|طو بشفاط: رأس السنة للأشجار|Ту би-Шват: Новый год деревьев|Tu BiShvat: New Year of the Trees
L ט״ו בשבט הוא ראש השנה לאילנות. הוא חל בסוף החורף.|طو بشفاط هو رأس السنة للأشجار. ويأتي في نهاية الشتاء.|Ту би-Шват - Новый год деревьев. Он бывает в конце зимы.|Tu BiShvat is the New Year of the Trees. It comes at the end of winter.
L אז הגשמים כבר מרווים את האדמה, והעצים מתחילים להתעורר.|في هذا الوقت تروي الأمطار الأرض وتبدأ الأشجار بالاستيقاظ.|К этому времени дожди уже напоили землю, и деревья начинают просыпаться.|By then the rains have watered the ground, and the trees begin to wake up.
L ילדים בכל הארץ נוטעים שתילים. עץ קטן יכול לגדול ולתת צל ופירות.|يزرع الأولاد في كل البلاد شتلات. شجرة صغيرة تكبر وتعطي ظلًّا وثمارًا.|Дети по всей стране сажают саженцы. Маленькое деревце вырастает и даёт тень и плоды.|Children all over the country plant saplings. A small tree can grow and give shade and fruit.
L אוכלים פירות. יש שבעה מינים שמיוחדים לארץ ישראל: חיטה, שעורה, גפן, תאנה, רימון, זית ותמר.|يأكلون الفواكه. هناك سبعة أنواع مميزة لأرض إسرائيل: القمح والشعير والعنب والتين والرمّان والزيتون والتمر.|Едят фрукты. Есть семь видов, особенных для земли Израиля: пшеница, ячмень, виноград, инжир, гранат, оливки и финики.|People eat fruit. There are seven kinds special to the Land of Israel: wheat, barley, grapes, figs, pomegranates, olives and dates.
L חשוב לשמור על העצים ולא לקטוף ענפים. העצים נותנים לנו אוויר נקי.|من المهمّ أن نحافظ على الأشجار وألّا نقطف الأغصان. الأشجار تعطينا هواءً نظيفًا.|Важно беречь деревья и не ломать ветки. Деревья дают нам чистый воздух.|It is important to take care of trees and not to break branches. Trees give us clean air.
Q איזה חג הוא ראש השנה לאילנות?|أي عيد هو رأس السنة للأشجار؟|Какой праздник - Новый год деревьев?|Which holiday is the New Year of the Trees?|h_tub|h_rosh,h_pes,h_sigd
Q מה עושים בט״ו בשבט?|ماذا يفعلون في طو بشفاط؟|Что делают на Ту би-Шват?|What do people do on Tu BiShvat?|e_plant|e_fastb,e_costum,e_matzah
E e_plant|t|נוטעים שתילים ואוכלים פירות|يزرعون الشتلات ويأكلون الفواكه|сажают саженцы и едят фрукты|they plant saplings and eat fruit
E e_fastb|t|צמים עד הערב|يصومون حتى المساء|постятся до вечера|they fast until evening
E e_costum|t|מתחפשים ומחלקים משלוחי מנות|يتنكّرون ويوزّعون هدايا الطعام|надевают костюмы и дарят угощения|they wear costumes and give food gifts
E e_matzah|t|אוכלים רק מצות|يأكلون الفطير فقط|едят только мацу|they eat only matzah
Q כמה מינים מיוחדים לארץ ישראל יש ברשימה?|كم نوعًا مميزًا لأرض إسرائيل في القائمة؟|Сколько особых видов для земли Израиля в списке?|How many special kinds are on the list of the Land of Israel?|n7|n3,n4,n12
Q איזה מהדברים האלה הוא אחד משבעת המינים?|أي من هذه أحد الأنواع السبعة؟|Что из этого - один из семи видов?|Which of these is one of the seven kinds?|f_olive|f_orang,f_banan,f_water
E f_olive|f|זית|زيتون|оливки|olives
E f_choc|f|שוקולד|شوكولاتة|шоколад|chocolate
E f_pizza|f|פיצה|بيتزا|пицца|pizza
E f_candy|f|סוכריות גומי|حلوى مطّاطية|жевательные конфеты|gummy candy
E f_orang|f|תפוז|برتقال|апельсин|an orange
E f_banan|f|בננה|موز|банан|a banana
E f_water|f|אבטיח|بطّيخ|арбуз|a watermelon
Q באיזו עונה חל ט״ו בשבט?|في أي فصل يأتي طو بشفاط؟|В какое время года бывает Ту би-Шват?|In which season does Tu BiShvat come?|e_winter|e_summer,e_aut,e_spring
E e_winter|t|בסוף החורף|في نهاية الشتاء|в конце зимы|at the end of winter
E e_summer|t|באמצע הקיץ|في منتصف الصيف|в середине лета|in the middle of summer
E e_aut|t|בתחילת הסתיו|في بداية الخريف|в начале осени|at the start of autumn
E e_spring|t|בסוף האביב|في نهاية الربيع|в конце весны|at the end of spring
Q למה חשוב לשמור על העצים?|لماذا من المهمّ الحفاظ على الأشجار؟|Почему важно беречь деревья?|Why is it important to take care of trees?|e_air|e_noise,e_dirt,e_cold
E e_air|t|הם נותנים צל, פירות ואוויר נקי|تعطينا ظلًّا وثمارًا وهواءً نظيفًا|они дают тень, плоды и чистый воздух|they give shade, fruit and clean air
E e_noise|t|הם עושים רעש|إنها تُحدث ضجيجًا|они шумят|they make noise
E e_dirt|t|הם מלכלכים את הרחוב|إنها تُوسّخ الشارع|они пачкают улицу|they make the street dirty
E e_cold|t|הם מקררים את הים|إنها تبرّد البحر|они охлаждают море|they cool the sea
S purim|🎭|#862e9c|פורים: חג התחפושות|بوريم: عيد التنكّر|Пурим: праздник костюмов|Purim: The Costume Holiday
L בפורים קוראים את סיפור אסתר ומרדכי. הסיפור כתוב במגילה.|في بوريم يقرؤون قصة إستير ومردخاي. والقصة مكتوبة في المغيلا.|На Пурим читают историю Эстер и Мордехая. Она записана в свитке-мегиле.|On Purim people read the story of Esther and Mordechai. The story is written in the megillah.
L המן הרע רצה לפגוע ביהודים, אבל אסתר המלכה עזרה להציל אותם.|أراد هامان الشرّير أن يؤذي اليهود، لكن الملكة إستير ساعدت في إنقاذهم.|Злой Аман хотел навредить евреям, но царица Эстер помогла их спасти.|Wicked Haman wanted to hurt the Jewish people, but Queen Esther helped to save them.
L כששומעים את השם המן, מרעישים ברעשנים.|عندما نسمع اسم هامان نصدر ضجيجًا بالمِقرعات.|Когда слышат имя Аман, шумят трещотками.|When people hear the name Haman, they make noise with noisemakers.
L ילדים ומבוגרים מתחפשים. אפשר להתחפש לכל דמות שאוהבים.|يتنكّر الأولاد والكبار. يمكن أن تتنكّر بأي شخصية تحبّها.|Дети и взрослые надевают костюмы. Можно нарядиться кем угодно.|Children and adults wear costumes. You can dress up as any character you like.
L שולחים משלוחי מנות לחברים ולשכנים, ונותנים מתנות לאנשים שצריכים עזרה.|يرسلون هدايا طعام للأصدقاء والجيران، ويعطون هدايا لمن يحتاج إلى مساعدة.|Отправляют друзьям и соседям угощения и дарят подарки тем, кому нужна помощь.|People send food gifts to friends and neighbors, and give gifts to people who need help.
L אוכלים אוזני המן, עוגיות עם מילוי.|يأكلون آذان هامان، وهي كعكات محشوّة.|Едят уши Амана - печенье с начинкой.|People eat hamantashen, cookies with a filling.
Q איזה חג הוא חג התחפושות?|أي عيد هو عيد التنكّر؟|Какой праздник - праздник костюмов?|Which holiday is the costume holiday?|h_pur|h_suk,h_shab,h_tub
Q איפה כתוב סיפור פורים?|أين كُتبت قصة بوريم؟|Где записана история Пурима?|Where is the story of Purim written?|o_megil|o_dreid,o_shofar,o_lulav
Q איך קוראים לדמות הטובה והאמיצה בסיפור?|ماذا اسم الشخصية الطيبة والشجاعة في القصة؟|Как зовут добрую и смелую героиню истории?|Who is the kind and brave character in the story?|e_esther|e_haman,e_moses,e_noah
E e_esther|p|המלכה אסתר|الملكة إستير|царица Эстер|Queen Esther
E e_haman|p|המן|هامان|Аман|Haman
E e_moses|p|משה|موسى|Моисей|Moses
E e_noah|p|נח|نوح|Ной|Noah
Q במה מרעישים כששומעים את השם המן?|بماذا نُحدث الضجيج عندما نسمع اسم هامان؟|Чем шумят, услышав имя Аман?|What do people make noise with when they hear the name Haman?|o_ragn|o_shofar,o_chanu,o_sukk
Q מה שולחים לחברים בפורים?|ماذا يرسلون للأصدقاء في بوريم؟|Что отправляют друзьям на Пурим?|What do people send to friends on Purim?|e_mish|e_homew,e_sand,e_ring
E e_mish|t|משלוח מנות|هدية طعام (مشلوح مانوت)|угощение (мишлоах манот)|a food gift (mishloach manot)
E e_homew|t|שיעורי בית|واجبات بيتية|домашние задания|homework
E e_sand|t|חול מהים|رملًا من البحر|песок с моря|sand from the sea
E e_ring|t|טבעות ברזל|خواتم حديدية|железные кольца|iron rings
Q איזה מאכל אוכלים בפורים?|أي طعام يأكلون في بوريم؟|Какое блюдо едят на Пурим?|Which food do people eat on Purim?|f_hamen|f_matz,f_apple,f_chal
S pesach|🍷|#a61e4d|פסח: חג החירות|بيساح: عيد الحرية|Песах: праздник свободы|Pesach: The Holiday of Freedom
L לפני הרבה שנים בני ישראל היו עבדים במצרים. משה הוביל אותם לחופש.|قبل سنوات كثيرة كان بنو إسرائيل عبيدًا في مصر. قادهم موسى إلى الحرية.|Много лет назад сыны Израиля были рабами в Египте. Моисей вывел их на свободу.|Many years ago the people of Israel were slaves in Egypt. Moses led them to freedom.
L פסח חל באביב. בערב הראשון עורכים סעודה מיוחדת שקוראים לה ליל סדר.|يأتي بيساح في الربيع. في المساء الأول يُقيمون وجبة خاصة اسمها ليلة السيدر.|Песах бывает весной. В первый вечер устраивают особый ужин - седер.|Pesach comes in the spring. On the first evening the family has a special meal called the seder.
L בליל הסדר קוראים בהגדה את סיפור יציאת מצרים.|في ليلة السيدر يقرؤون في الهغاداه قصة الخروج من مصر.|На седере читают в Аггаде историю исхода из Египта.|At the seder people read the story of leaving Egypt from the Haggadah.
L הילד הקטן ביותר שואל ארבע קושיות. הראשונה היא: מה נשתנה הלילה הזה?|يسأل أصغر طفل أربعة أسئلة. الأول هو: ما الذي تغيّر في هذه الليلة؟|Самый младший ребёнок задаёт четыре вопроса. Первый: чем эта ночь отличается от других?|The youngest child asks four questions. The first is: why is this night different?
L בפסח אוכלים מצה במקום לחם. הבצק של בני ישראל לא הספיק לתפוח כשהם יצאו מהר ממצרים.|في بيساح يأكلون الفطير بدل الخبز. لم يكن لدى بني إسرائيل وقت لينتفخ العجين لأنهم خرجوا بسرعة من مصر.|На Песах едят мацу вместо хлеба. У сынов Израиля не было времени, чтобы тесто поднялось, - они спешно уходили из Египта.|On Pesach people eat matzah instead of bread. The people of Israel had no time for their dough to rise when they left Egypt in a hurry.
L אחרי פסח, משפחות רבות ממרוקו חוגגות את המימונה, ופותחות את הבית לאורחים.|بعد بيساح تحتفل عائلات كثيرة من المغرب بالميمونة وتفتح بيوتها للضيوف.|После Песаха многие семьи из Марокко отмечают Мимуну и открывают дом для гостей.|After Pesach, many families from Morocco celebrate the Mimouna and open their homes to guests.
Q מאיפה יצאו בני ישראל לחופש?|من أين خرج بنو إسرائيل إلى الحرية؟|Откуда сыны Израиля вышли на свободу?|Where did the people of Israel leave to find freedom?|e_egypt|e_italy,e_china,e_peru
E e_egypt|l|ממצרים|من مصر|из Египта|from Egypt
E e_italy|l|מאיטליה|من إيطاليا|из Италии|from Italy
E e_china|l|מסין|من الصين|из Китая|from China
E e_peru|l|מפרו|من بيرو|из Перу|from Peru
Q איך קוראים לארוחה המיוחדת בערב הראשון של פסח?|ماذا نسمّي الوجبة الخاصة في المساء الأول من بيساح؟|Как называется особый ужин в первый вечер Песаха?|What is the special meal on the first evening of Pesach called?|e_seder|e_kidd,e_brit,e_shav
E e_seder|t|ליל סדר|ليلة السيدر|седер|the seder
E e_kidd|t|קידוש|كيدّوش|кидуш|Kiddush
E e_brit|t|בר מצווה|بار ميتسفا|бар-мицва|a bar mitzvah
E e_shav|t|שבועון|مجلة أسبوعية|еженедельник|a weekly magazine
Q איזה ספר קוראים בליל הסדר?|أي كتاب يقرؤون في ليلة السيدر؟|Какую книгу читают на седере?|Which book do people read at the seder?|o_hagg|o_megil,o_chanu,o_ragn
Q מי שואל את ארבע הקושיות?|من يسأل الأسئلة الأربعة؟|Кто задаёт четыре вопроса?|Who asks the four questions?|e_youngest|e_oldest,e_dog,e_judgex
E e_youngest|p|הילד הקטן ביותר|أصغر طفل|самый младший ребёнок|the youngest child
E e_oldest|p|הסבא|الجدّ|дедушка|the grandfather
E e_dog|p|השכן מהקומה למעלה|الجار من الطابق الأعلى|сосед сверху|the neighbor from upstairs
E e_judgex|p|המורה בכיתה|المعلّم في الصف|учитель в классе|the teacher in class
Q מה אוכלים בפסח במקום לחם?|ماذا يأكلون في بيساح بدل الخبز؟|Что едят на Песах вместо хлеба?|What do people eat on Pesach instead of bread?|f_matz|f_chal,f_sufg,f_hamen
Q כמה קושיות שואלים בליל הסדר?|كم سؤالًا يسألون في ليلة السيدر؟|Сколько вопросов задают на седере?|How many questions are asked at the seder?|n4|n3,n5,n7
S shavuot|🌾|#e67700|שבועות: חג הביכורים והתורה|شفوعوت: عيد الباكورة والتوراة|Шавуот: праздник первых плодов и Торы|Shavuot: The Holiday of First Fruits and the Torah
L שבועות חל שבעה שבועות אחרי פסח. מכאן בא השם שלו.|يأتي شفوعوت بعد بيساح بسبعة أسابيع. ومن هنا جاء اسمه.|Шавуот бывает через семь недель после Песаха. Отсюда его название.|Shavuot comes seven weeks after Pesach. That is where its name comes from.
L בשבועות מספרים על הר סיני, שם קיבל עם ישראל את עשרת הדיברות.|في شفوعوت نحكي عن جبل سيناء حيث تلقّى بنو إسرائيل الوصايا العشر.|На Шавуот вспоминают гору Синай, где народ Израиля получил десять заповедей.|On Shavuot people remember Mount Sinai, where the people of Israel received the Ten Commandments.
L זה גם חג הביכורים: חג הפירות הראשונים של השנה. פעם החקלאים הביאו אותם לירושלים.|وهو أيضًا عيد الباكورة: عيد أول ثمار السنة. وكان المزارعون قديمًا يحضرونها إلى القدس.|Это и праздник первых плодов года. Раньше земледельцы приносили их в Иерусалим.|It is also the holiday of the first fruits of the year. In the past farmers brought them to Jerusalem.
L בשבועות אוכלים מאכלי חלב: גבינה, עוגת גבינה ובלינצ׳ס.|في شفوعوت يأكلون الأطعمة الحليبية: الجبن وكعكة الجبن والفطائر.|На Шавуот едят молочные блюда: сыр, чизкейк, блины.|On Shavuot people eat dairy foods: cheese, cheesecake and blintzes.
L מקשטים את הבית ואת הגן בפרחים ובעלים ירוקים.|يزيّنون البيت والروضة بالأزهار والأوراق الخضراء.|Украшают дом и детский сад цветами и зелёными листьями.|People decorate the home and the kindergarten with flowers and green leaves.
Q אחרי כמה שבועות מפסח חל שבועות?|بعد كم أسبوعًا من بيساح يأتي شفوعوت؟|Через сколько недель после Песаха бывает Шавуот?|How many weeks after Pesach does Shavuot come?|n7|n3,n4,n10
Q מה קיבל עם ישראל בהר סיני?|ماذا تلقّى بنو إسرائيل في جبل سيناء؟|Что получил народ Израиля на горе Синай?|What did the people of Israel receive at Mount Sinai?|e_ten|e_crown,e_boat,e_map
E e_ten|t|את עשרת הדיברות|الوصايا العشر|десять заповедей|the Ten Commandments
E e_crown|t|כתר זהב|تاجًا من ذهب|золотую корону|a golden crown
E e_boat|t|ספינה גדולה|سفينة كبيرة|большой корабль|a big ship
E e_map|t|מפה של העולם|خريطة للعالم|карту мира|a map of the world
Q איזה חג הוא חג הביכורים, חג הפירות הראשונים?|أي عيد هو عيد الباكورة، عيد أول الثمار؟|Какой праздник - праздник первых плодов?|Which holiday is the holiday of first fruits?|h_shav|h_han,h_pur,h_rosh
Q איזה מאכל אוכלים בשבועות?|أي طعام يأكلون في شفوعوت؟|Какое блюдо едят на Шавуот?|Which food do people eat on Shavuot?|f_cheese|f_matz,f_hamen,f_sufg
Q במה מקשטים את הבית בשבועות?|بماذا يزيّنون البيت في شفوعوت؟|Чем украшают дом на Шавуот?|What do people decorate the home with on Shavuot?|e_flow|e_snow,e_balloon,e_lamp
E e_flow|t|בפרחים ובעלים ירוקים|بالأزهار والأوراق الخضراء|цветами и зелёными листьями|flowers and green leaves
E e_snow|t|בשלג|بالثلج|снегом|snow
E e_balloon|t|בפנסים מהקרח|بفوانيس من الجليد|ледяными фонарями|ice lanterns
E e_lamp|t|בשרשראות של שוקולד|بسلاسل من الشوكولاتة|цепочками из шоколада|chocolate chains
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
Q איזה חג חוגגים יוצאי מרוקו אחרי פסח?|أي عيد يحتفل به اليهود من المغرب بعد بيساح؟|Какой праздник отмечают евреи из Марокко после Песаха?|Which holiday do Jews from Morocco celebrate after Pesach?|h_mim|h_sigd,h_tub,h_suk
Q מה עושים במימונה?|ماذا يفعلون في الميمونة؟|Что делают на Мимуне?|What do people do at the Mimouna?|e_open|e_lock,e_hide2,e_class
E e_open|t|פותחים את הבית לאורחים ואוכלים מתוקים|يفتحون البيت للضيوف ويأكلون الحلويات|открывают дом для гостей и едят сладости|they open the home to guests and eat sweets
E e_lock|t|נועלים את הדלת ונשארים לבד|يُقفلون الباب ويبقون وحدهم|запирают дверь и остаются одни|they lock the door and stay alone
E e_hide2|t|מסתירים את האוכל|يخبّئون الطعام|прячут еду|they hide the food
E e_class|t|הולכים לבית הספר|يذهبون إلى المدرسة|идут в школу|they go to school
Q איזה מאכל אוכלים יוצאי תימן בשבת בבוקר?|أي طعام يأكله اليهود من اليمن صباح السبت؟|Что едят евреи из Йемена в субботу утром?|What do Jews from Yemen eat on Shabbat morning?|f_jach|f_cous,f_gefi,f_kubb
Q למה טוב שיש בישראל הרבה קהילות?|لماذا من الجيّد وجود جماعات كثيرة في إسرائيل؟|Почему хорошо, что в Израиле много общин?|Why is it good that Israel has many communities?|e_rich|e_boringc,e_same,e_less
E e_rich|t|כי כל קהילה מוסיפה שירים, מאכלים ומנהגים|لأن كل جماعة تضيف أغاني وأطعمة وعادات|потому что каждая община добавляет песни, блюда и обычаи|because each community adds songs, foods and customs
E e_boringc|t|כי כולם צריכים לעשות אותו דבר|لأن الجميع يجب أن يفعلوا الشيء نفسه|потому что все должны делать одно и то же|because everyone has to do the same thing
E e_same|t|כי אין הבדל בין אנשים|لأنه لا فرق بين الناس|потому что люди ничем не отличаются|because there is no difference between people
E e_less|t|כי כך יש פחות חגים|لأن هذا يقلّل الأعياد|потому что так меньше праздников|because this means fewer holidays
S faiths|🌙|#5f3dc4|חגים של כולם בישראל|أعياد الجميع في إسرائيل|праздники всех в Израиле|Holidays of Everyone in Israel
L בישראל חיים יהודים, מוסלמים, נוצרים, דרוזים ועוד. לכל קבוצה יש חגים משלה.|في إسرائيل يعيش يهود ومسلمون ومسيحيون ودروز وغيرهم. ولكل مجموعة أعيادها.|В Израиле живут евреи, мусульмане, христиане, друзы и другие. У каждой группы свои праздники.|In Israel live Jews, Muslims, Christians, Druze and others. Every group has its own holidays.
L רמדאן הוא חודש שבו המוסלמים צמים מעלות השחר, לפני הזריחה, ועד השקיעה. בסופו חוגגים את עיד אל־פיטר.|رمضان شهر يصوم فيه المسلمون من الفجر حتى الغروب. وفي نهايته يحتفلون بعيد الفطر.|Рамадан - месяц, когда мусульмане постятся от рассвета до заката. В конце отмечают Ид аль-Фитр.|Ramadan is a month when Muslims fast from dawn, before sunrise, until sunset. At its end they celebrate Eid al-Fitr.
L בעיד לובשים בגדים חדשים, מבקרים את המשפחה ואוכלים מתוקים. הילדים מקבלים מתנות.|في العيد يلبسون ملابس جديدة ويزورون العائلة ويأكلون الحلويات. ويحصل الأولاد على هدايا.|В праздник надевают новую одежду, навещают семью и едят сладости. Дети получают подарки.|At the Eid people wear new clothes, visit family and eat sweets. Children get gifts.
L עיד אל־אדחא הוא חג הקורבן. מחלקים בשר למשפחה ולאנשים שצריכים עזרה.|عيد الأضحى هو عيد الأضحية. يوزّعون اللحم على العائلة وعلى المحتاجين.|Ид аль-Адха - праздник жертвоприношения. Мясо раздают семье и нуждающимся.|Eid al-Adha is the feast of sacrifice. People share meat with family and with people who need help.
L הנוצרים חוגגים את חג המולד בסוף דצמבר, ואת חג הפסחא באביב. הדרוזים מבקרים בקבר נבי שועייב שבגליל.|يحتفل المسيحيون بعيد الميلاد في نهاية كانون الأول وبعيد الفصح في الربيع. ويزور الدروز مقام النبي شعيب في الجليل.|Христиане отмечают Рождество в конце декабря, а Пасху - весной. Друзы посещают гробницу Наби-Шуайб в Галилее.|Christians celebrate Christmas at the end of December, and Easter in the spring. The Druze visit the tomb of Nabi Shu'ayb in the Galilee.
L כשחוגגים חבר, מברכים אותו: חג שמח, עיד מובארכ או מרי כריסטמס. זה מראה כבוד.|عندما يحتفل صديق نقول له: عيد مبارك أو ميلاد مجيد أو حَغ سَميَح. هذا يُظهر الاحترام.|Когда друг празднует, мы поздравляем его: «Хаг самеах», «Ид мубарак» или «С Рождеством». Так мы показываем уважение.|When a friend celebrates, we greet them: Chag Sameach, Eid Mubarak or Merry Christmas. This shows respect.
Q מה עושים המוסלמים בחודש רמדאן?|ماذا يفعل المسلمون في شهر رمضان؟|Что делают мусульмане в месяц Рамадан?|What do Muslims do during the month of Ramadan?|e_ramad|e_hanuk,e_plant2,e_sailx
E e_ramad|t|צמים מעלות השחר עד השקיעה|يصومون من الفجر حتى الغروب|постятся от рассвета до заката|they fast from dawn to sunset
E e_hanuk|t|מדליקים תשעה נרות|يُشعلون تسع شموع|зажигают девять свечей|they light nine candles
E e_plant2|t|נוטעים עצים בגן|يزرعون الأشجار في الحديقة|сажают деревья в саду|they plant trees in the garden
E e_sailx|t|בונים סוכה|يبنون سُكّا|строят сукку|they build a sukkah
Q איזה חג חוגגים בסוף חודש רמדאן?|أي عيد يحتفلون به في نهاية رمضان؟|Какой праздник отмечают в конце Рамадана?|Which holiday is celebrated at the end of Ramadan?|h_eidf|h_xmas,h_pur,h_han
Q איזה חג הוא חג הקורבן?|أي عيد هو عيد الأضحية؟|Какой праздник - праздник жертвоприношения?|Which holiday is the feast of sacrifice?|h_eida|h_east,h_tub,h_eidf
Q איזה חג חוגגים הנוצרים בסוף דצמבר?|أي عيد يحتفل به المسيحيون في نهاية كانون الأول؟|Какой праздник христиане отмечают в конце декабря?|Which holiday do Christians celebrate at the end of December?|h_xmas|h_eida,h_pes,h_sigd
Q איזה מקום מבקרים הדרוזים בחג שלהם?|أي مكان يزوره الدروز في عيدهم؟|Какое место друзы посещают в свой праздник?|Which place do the Druze visit on their holiday?|e_tomb|e_zoo,e_beach,e_mall
E e_tomb|t|את קבר נבי שועייב בגליל|مقام النبي شعيب في الجليل|гробницу Наби-Шуайб в Галилее|the tomb of Nabi Shu'ayb in the Galilee
E e_zoo|t|את גן החיות|حديقة الحيوان|зоопарк|the zoo
E e_beach|t|את החוף בתל אביב|شاطئ تل أبيب|пляж в Тель-Авиве|the beach in Tel Aviv
E e_mall|t|את הקניון|المركز التجاري|торговый центр|the mall
Q מה עושים כשחבר חוגג חג שאנחנו לא חוגגים?|ماذا نفعل عندما يحتفل صديق بعيد لا نحتفل به؟|Что делать, когда друг празднует праздник, который мы не отмечаем?|What do we do when a friend celebrates a holiday that we do not celebrate?|e_greet|e_laugh,e_ignore2,e_forbid
E e_greet|t|מברכים אותו בכבוד ושמחים איתו|نهنّئه باحترام ونفرح معه|поздравляем его с уважением и радуемся вместе|we greet him with respect and are happy with him
E e_laugh|t|צוחקים על המנהגים שלו|نضحك على عاداته|смеёмся над его обычаями|we laugh at his customs
E e_ignore2|t|לא מדברים איתו כל היום|لا نكلّمه طوال اليوم|не разговариваем с ним весь день|we do not talk to him all day
E e_forbid|t|אומרים לו לא לחגוג|نقول له ألّا يحتفل|говорим ему не праздновать|we tell him not to celebrate
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
E pl_bahai|l|גני הבהאים|حدائق البهائيين|сады бахаи|the Bahá'í Gardens
E pl_eiffel|l|מגדל אייפל|برج إيفل|Эйфелева башня|the Eiffel Tower
E pl_pyram|l|הפירמידות|الأهرامات|пирамиды|the pyramids
E pl_eilat|l|חוף אילת|شاطئ إيلات|пляж Эйлата|the Eilat beach
Q איפה יהודים מתפללים ומכניסים פתקים בין האבנים?|أين يصلّي اليهود ويضعون رسائل بين الحجارة؟|Где евреи молятся и кладут записки между камней?|Where do Jewish people pray and put notes between the stones?|pl_kotel|pl_aqsa,pl_sepul,pl_bahai
Q איזה מקום בירושלים קדוש למוסלמים?|أي مكان في القدس مقدّس للمسلمين؟|Какое место в Иерусалиме священно для мусульман?|Which place in Jerusalem is holy to Muslims?|pl_aqsa|pl_kotel,pl_sepul,pl_bahai
Q איזה מקום בירושלים קדוש לנוצרים?|أي مكان في القدس مقدّس للمسيحيين؟|Какое место в Иерусалиме священно для христиан?|Which place in Jerusalem is holy to Christians?|pl_sepul|pl_kotel,pl_aqsa,pl_bahai
Q איפה נמצאים גני הבהאים?|أين توجد حدائق البهائيين؟|Где находятся сады бахаи?|Where are the Bahá'í Gardens?|e_haifa2|e_eilat2,e_safed2,e_arad2
E e_haifa2|l|בחיפה|في حيفا|в Хайфе|in Haifa
E e_eilat2|l|באילת|في إيلات|в Эйлате|in Eilat
E e_safed2|l|בבאר שבע|في بئر السبع|в Беэр-Шеве|in Beersheba
E e_arad2|l|ברמת גן|في رمات غان|в Рамат-Гане|in Ramat Gan
Q איך מתנהגים כשמבקרים במקום קדוש?|كيف نتصرّف عند زيارة مكان مقدّس؟|Как себя ведут в священном месте?|How do we behave when we visit a holy place?|e_respect|e_loud,e_selfie,e_run3
E e_respect|t|בשקט ובכבוד, בבגדים צנועים|بهدوء واحترام وبملابس محتشمة|тихо и с уважением, в скромной одежде|quietly and with respect, in modest clothes
E e_loud|t|בצעקות ובמשחקים|بالصراخ واللعب|с криками и играми|with shouting and games
E e_selfie|t|מפריעים למתפללים לצלם|نزعج المصلّين للتصوير|мешаем молящимся фотографироваться|we bother people who pray to take photos
E e_run3|t|רצים ונוגעים בכל דבר|نركض ونلمس كل شيء|бегаем и трогаем всё подряд|we run and touch everything
S calend|📅|#862e9c|הלוח העברי והשפה העברית|التقويم العبري واللغة العبرية|еврейский календарь и иврит|The Hebrew Calendar and the Hebrew Language
L חגי ישראל נקבעים לפי הלוח העברי. הוא מתבסס על הירח ועל השמש.|تُحدَّد أعياد إسرائيل حسب التقويم العبري. وهو مبني على القمر والشمس.|Праздники Израиля определяются по еврейскому календарю. Он основан на Луне и Солнце.|Israel's holidays are set by the Hebrew calendar. It is based on the moon and the sun.
L חודש עברי מתחיל כשהירח חדש. יש בו עשרים ותשעה או שלושים ימים.|يبدأ الشهر العبري عندما يكون القمر جديدًا. وفيه تسعة وعشرون أو ثلاثون يومًا.|Еврейский месяц начинается с новолуния. В нём двадцать девять или тридцать дней.|A Hebrew month begins when the moon is new. It has twenty-nine or thirty days.
L שמות החודשים הם: תשרי, חשוון, כסלו, טבת, שבט, אדר, ניסן, אייר, סיוון, תמוז, אב ואלול.|أسماء الأشهر هي: تشري، حشفان، كسلاو، طيفت، شباط، أدار، نيسان، أيار، سيفان، تموز، آف وإيلول.|Месяцы называются: тишрей, хешван, кислев, тевет, шват, адар, нисан, ияр, сиван, тамуз, ав и элул.|The months are: Tishrei, Cheshvan, Kislev, Tevet, Shevat, Adar, Nisan, Iyar, Sivan, Tammuz, Av and Elul.
L בשבוע יש שבעה ימים: יום ראשון, יום שני, שלישי, רביעי, חמישי, שישי ושבת.|في الأسبوع سبعة أيام: يوم أول، ثانٍ، ثالث، رابع، خامس، جمعة وسبت.|В неделе семь дней: первый день, второй, третий, четвёртый, пятый, пятница и суббота.|A week has seven days: first day, second day, third, fourth, fifth, Friday and Shabbat.
L המוסלמים סופרים לפי לוח הירח שלהם, והנוצרים לפי הלוח הכללי. לכן החגים שלהם בתאריכים אחרים.|يحسب المسلمون حسب تقويمهم القمري، ويحسب المسيحيون حسب التقويم العام. لذلك تقع أعيادهم في تواريخ أخرى.|Мусульмане считают по своему лунному календарю, а христиане - по общему. Поэтому их праздники приходятся на другие даты.|Muslims count by their own moon calendar, and Christians by the general calendar. That is why their holidays fall on other dates.
L העברית היא שפה עתיקה. היא חזרה לדיבור ביום־יום, ואליעזר בן־יהודה עזר לכך. בישראל מדברים גם ערבית, רוסית, אמהרית, אנגלית ועוד.|العبرية لغة قديمة. عادت للكلام اليومي وساعد في ذلك إليعيزر بن يهودا. وفي إسرائيل يتكلّمون أيضًا العربية والروسية والأمهرية والإنجليزية وغيرها.|Иврит - древний язык. Он вернулся в повседневную речь, и в этом помог Элиэзер Бен-Йегуда. В Израиле говорят также на арабском, русском, амхарском, английском и других языках.|Hebrew is an ancient language. It came back into everyday speech, and Eliezer Ben-Yehuda helped with that. In Israel people also speak Arabic, Russian, Amharic, English and more.
Q לפי מה נקבעים חגי ישראל?|حسب ماذا تُحدَّد أعياد إسرائيل؟|По какому календарю определяются праздники Израиля?|By what are Israel's holidays set?|e_hcal|e_shoes,e_menu,e_map2
E e_hcal|t|לפי הלוח העברי|حسب التقويم العبري|по еврейскому календарю|by the Hebrew calendar
E e_shoes|t|לפי מספר הנעליים|حسب عدد الأحذية|по числу ботинок|by the number of shoes
E e_menu|t|לפי התפריט בבית הספר|حسب قائمة الطعام في المدرسة|по меню в школе|by the school menu
E e_map2|t|לפי צבע השמיים|حسب لون السماء|по цвету неба|by the color of the sky
Q כמה ימים יש בשבוע?|كم يومًا في الأسبوع؟|Сколько дней в неделе?|How many days are in a week?|n7|n5,n10,n12
Q כמה ימים יש בחודש עברי?|كم يومًا في الشهر العبري؟|Сколько дней в еврейском месяце?|How many days are in a Hebrew month?|e_29|e_8d,e_100d,e_14d
E e_29|t|עשרים ותשעה או שלושים|تسعة وعشرون أو ثلاثون|двадцать девять или тридцать|twenty-nine or thirty
E e_8d|t|שבעה או שמונה|سبعة أو ثمانية|семь или восемь|seven or eight
E e_100d|t|מאה או מאתיים|مئة أو مئتان|сто или двести|one hundred or two hundred
E e_14d|t|ארבעה עשר או חמישה עשר|أربعة عشر أو خمسة عشر|четырнадцать или пятнадцать|fourteen or fifteen
Q באיזה חודש עברי חל ראש השנה?|أي شهر عبري يبدأ فيه رأس السنة العبرية؟|В каком еврейском месяце бывает Рош а-Шана?|In which Hebrew month does Rosh Hashanah fall?|e_tishrei|e_nisan,e_adar,e_sivan
E e_tishrei|t|תשרי|تشري|тишрей|Tishrei
E e_nisan|t|ניסן|نيسان|нисан|Nisan
E e_adar|t|אדר|أدار|адар|Adar
E e_sivan|t|סיוון|سيفان|сиван|Sivan
Q מי עזר להחזיר את העברית לדיבור ביום־יום?|من ساعد في إعادة العبرية إلى الكلام اليومي؟|Кто помог вернуть иврит в повседневную речь?|Who helped to bring Hebrew back into everyday speech?|e_benyeh|e_haman,e_esther,e_noah
E e_benyeh|p|אליעזר בן־יהודה|إليعيزر بن يهودا|Элиэзер Бен-Йегуда|Eliezer Ben-Yehuda
Q אילו שפות מדברים בישראל?|أي لغات يتكلّمون في إسرائيل؟|На каких языках говорят в Израиле?|Which languages do people speak in Israel?|e_langs|e_onlyh,e_latin,e_none
E e_langs|t|עברית, ערבית, רוסית, אמהרית, אנגלית ועוד|العبرية والعربية والروسية والأمهرية والإنجليزية وغيرها|иврит, арабский, русский, амхарский, английский и другие|Hebrew, Arabic, Russian, Amharic, English and more
E e_onlyh|t|רק יפנית|اليابانية فقط|только японский|only Japanese
E e_latin|t|רק לטינית|اللاتينية فقط|только латынь|only Latin
E e_none|t|אף שפה|لا لغة|никакого языка|no language
`;
