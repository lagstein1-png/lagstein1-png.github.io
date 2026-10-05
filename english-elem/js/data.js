/* Content for the elementary English app. Line format, fields split by "|":
   S id|icon|color|he|ar|ru|en|grade|kind     unit (kind: abc | vocab | phrase)
   L he|ar|ru|en                               intro sentence of the current unit (interface language)
   T letter|word|emoji|he|ar|ru                letter card (abc unit): example word and its translation
   W word|emoji|he|ar|ru                       word card (vocab unit); the English word is the same in all languages
   X english|he|ar|ru                          phrase or sentence card (phrase unit)
   Q stim|he|ar|ru|en|correct|d1;d2;d3         written question: English stim (optional; "@" = hear it, hidden), prompt in 4 languages, English options
   Content written fresh; the Arabic, Russian and English interface text is machine-quality, for teacher review. */
var RAW=String.raw`
S abc|🔤|#1c7ed6|האותיות באנגלית|الحروف الإنجليزية|Английский алфавит|The English alphabet|g12|abc
L בואו נכיר את האותיות. לכל אות יש מילה אחת שמתחילה בה.|لنتعرّف على الحروف. لكل حرف كلمة تبدأ به.|Давайте познакомимся с буквами. У каждой буквы есть слово, которое с неё начинается.|Let's meet the letters. Each letter has a word that starts with it.
T A|apple|🍎|תפוח|تفاحة|яблоко
T B|ball|⚽|כדור|كرة|мяч
T C|cat|🐱|חתול|قطة|кошка
T D|dog|🐶|כלב|كلب|собака
T E|egg|🥚|ביצה|بيضة|яйцо
T F|fish|🐟|דג|سمكة|рыба
T G|grapes|🍇|ענבים|عنب|виноград
T H|hat|🎩|כובע|قبعة|шляпа
T I|ice cream|🍦|גלידה|بوظة|мороженое
T J|juice|🧃|מיץ|عصير|сок
T K|key|🔑|מפתח|مفتاح|ключ
T L|lion|🦁|אריה|أسد|лев
T M|moon|🌙|ירח|قمر|луна
T N|nose|👃|אף|أنف|нос
T O|orange|🍊|תפוז|برتقالة|апельсин
T P|pizza|🍕|פיצה|بيتزا|пицца
T Q|queen|👑|מלכה|ملكة|королева
T R|rabbit|🐰|ארנב|أرنب|кролик
T S|sun|☀️|שמש|شمس|солнце
T T|tree|🌳|עץ|شجرة|дерево
T U|umbrella|☂️|מטרייה|مظلة|зонт
T V|violin|🎻|כינור|كمان|скрипка
T W|watch|⌚|שעון יד|ساعة يد|наручные часы
T X|xylophone|🎶|קסילופון|إكسيليفون|ксилофон
T Y|yellow|🟡|צהוב|أصفر|жёлтый
T Z|zebra|🦓|זברה|حمار وحشي|зебра
S colors|🎨|#e8590c|צבעים|الألوان|Цвета|Colors|g12|vocab
L בואו נלמד צבעים באנגלית. לחצו על כל כרטיס ושמעו.|لنتعلّم الألوان بالإنجليزية. اضغط على كل بطاقة واستمع.|Давайте выучим цвета по-английски. Нажимай на карточки и слушай.|Let's learn colors in English. Tap each card and listen.
W red|🔴|אדום|أحمر|красный
W blue|🔵|כחול|أزرق|синий
W green|🟢|ירוק|أخضر|зелёный
W yellow|🟡|צהוב|أصفر|жёлтый
W orange|🟠|כתום|برتقالي|оранжевый
W purple|🟣|סגול|بنفسجي|фиолетовый
W black|⚫|שחור|أسود|чёрный
W white|⚪|לבן|أبيض|белый
W brown|🟤|חום|بني|коричневый
S numbers|🔢|#2f9e44|מספרים 1 עד 10|الأعداد من 1 إلى 10|Числа от 1 до 10|Numbers 1 to 10|g12|vocab
L בואו נספור באנגלית מאחד עד עשר. הקשיבו לכל מספר.|لنعدّ بالإنجليزية من واحد إلى عشرة. استمع إلى كل عدد.|Давайте посчитаем по-английски от одного до десяти. Слушай каждое число.|Let's count in English from one to ten. Listen to each number.
W one|1️⃣|אחד|واحد|один
W two|2️⃣|שניים|اثنان|два
W three|3️⃣|שלושה|ثلاثة|три
W four|4️⃣|ארבעה|أربعة|четыре
W five|5️⃣|חמישה|خمسة|пять
W six|6️⃣|שישה|ستة|шесть
W seven|7️⃣|שבעה|سبعة|семь
W eight|8️⃣|שמונה|ثمانية|восемь
W nine|9️⃣|תשעה|تسعة|девять
W ten|🔟|עשרה|عشرة|десять
S animals|🐶|#c2255c|חיות|الحيوانات|Животные|Animals|g12|vocab
L בואו נכיר חיות באנגלית. לחצו על כרטיס ושמעו את השם.|لنتعرّف على الحيوانات بالإنجليزية. اضغط على بطاقة واستمع إلى الاسم.|Давайте познакомимся с животными по-английски. Нажми на карточку и послушай название.|Let's meet the animals in English. Tap a card and hear the name.
W dog|🐶|כלב|كلب|собака
W cat|🐱|חתול|قطة|кошка
W bird|🐦|ציפור|عصفور|птица
W fish|🐟|דג|سمكة|рыба
W cow|🐄|פרה|بقرة|корова
W horse|🐴|סוס|حصان|лошадь
W duck|🦆|ברווז|بطة|утка
W rabbit|🐰|ארנב|أرنب|кролик
W lion|🦁|אריה|أسد|лев
W monkey|🐵|קוף|قرد|обезьяна
W elephant|🐘|פיל|فيل|слон
W frog|🐸|צפרדע|ضفدع|лягушка
S family|👪|#7048e8|המשפחה|العائلة|Семья|Family|g12|vocab
L בואו נלמד מי נמצא במשפחה, באנגלית.|لنتعلّم من في العائلة بالإنجليزية.|Давайте выучим, кто есть в семье, по-английски.|Let's learn who is in the family, in English.
W mother|👩|אמא|أم|мама
W father|👨|אבא|أب|папа
W baby|👶|תינוק|رضيع|малыш
W boy|👦|ילד|ولد|мальчик
W girl|👧|ילדה|بنت|девочка
W grandmother|👵|סבתא|جدّة|бабушка
W grandfather|👴|סבא|جدّ|дедушка
W family|👪|משפחה|عائلة|семья
S food|🍎|#e03131|אוכל ושתייה|الطعام والشراب|Еда и напитки|Food and drink|g34|vocab
L בואו נלמד שמות של אוכל ושתייה באנגלית.|لنتعلّم أسماء الطعام والشراب بالإنجليزية.|Давайте выучим названия еды и напитков по-английски.|Let's learn the names of food and drink in English.
W apple|🍎|תפוח|تفاحة|яблоко
W banana|🍌|בננה|موزة|банан
W bread|🍞|לחם|خبز|хлеб
W milk|🥛|חלב|حليب|молоко
W egg|🥚|ביצה|بيضة|яйцо
W cheese|🧀|גבינה|جبنة|сыр
W water|💧|מים|ماء|вода
W pizza|🍕|פיצה|بيتزا|пицца
W cake|🍰|עוגה|كعكة|торт
W orange|🍊|תפוז|برتقالة|апельсин
W grapes|🍇|ענבים|عنب|виноград
W tomato|🍅|עגבנייה|طماطم|помидор
S school|🎒|#0c8599|בבית הספר|في المدرسة|В школе|At school|g34|vocab
L בואו נלמד שמות של דברים בכיתה ובבית הספר.|لنتعلّم أسماء الأشياء في الصف والمدرسة.|Давайте выучим названия предметов в классе и в школе.|Let's learn the names of things in class and at school.
W book|📖|ספר|كتاب|книга
W pencil|✏️|עיפרון|قلم رصاص|карандаш
W bag|🎒|תיק|حقيبة|рюкзак
W teacher|🧑‍🏫|מורה|معلّم|учитель
W scissors|✂️|מספריים|مقص|ножницы
W computer|💻|מחשב|حاسوب|компьютер
W clock|⏰|שעון|ساعة|часы
W school|🏫|בית ספר|مدرسة|школа
W ruler|📏|סרגל|مسطرة|линейка
W chair|🪑|כיסא|كرسي|стул
S body|👂|#f08c00|הגוף|الجسم|Тело|My body|g34|vocab
L בואו נלמד את חלקי הגוף באנגלית. הקשיבו וחזרו אחריי.|لنتعلّم أجزاء الجسم بالإنجليزية. استمع وكرّر.|Давайте выучим части тела по-английски. Слушай и повторяй.|Let's learn the parts of the body in English. Listen and repeat.
W eye|👁️|עין|عين|глаз
W ear|👂|אוזן|أذن|ухо
W nose|👃|אף|أنف|нос
W mouth|👄|פה|فم|рот
W hand|✋|יד|يد|рука
W foot|🦶|כף רגל|قدم|ступня
W leg|🦵|רגל|ساق|нога
W tooth|🦷|שן|سن|зуб
W heart|❤️|לב|قلب|сердце
W brain|🧠|מוח|دماغ|мозг
S nature|🌈|#1098ad|מזג אוויר וטבע|الطقس والطبيعة|Погода и природа|Weather and nature|g34|vocab
L בואו נדבר על מזג האוויר ועל הטבע, באנגלית.|لنتحدّث عن الطقس والطبيعة بالإنجليزية.|Давайте поговорим о погоде и природе по-английски.|Let's talk about the weather and nature, in English.
W sun|☀️|שמש|شمس|солнце
W rain|🌧️|גשם|مطر|дождь
W cloud|☁️|ענן|غيمة|облако
W snow|❄️|שלג|ثلج|снег
W wind|💨|רוח|ريح|ветер
W moon|🌙|ירח|قمر|луна
W star|⭐|כוכב|نجمة|звезда
W tree|🌳|עץ|شجرة|дерево
W flower|🌸|פרח|زهرة|цветок
W rainbow|🌈|קשת|قوس قزح|радуга
S transport|🚌|#5c940d|תחבורה ובית|المواصلات والبيت|Транспорт и дом|Transport and home|g34|vocab
L בואו נלמד באיזה כלי רכב נוסעים, ואיפה גרים.|لنتعلّم بأيّ مركبة نسافر وأين نسكن.|Давайте выучим, на чём ездят и где живут.|Let's learn how we travel and where we live.
W car|🚗|מכונית|سيارة|машина
W bus|🚌|אוטובוס|حافلة|автобус
W train|🚆|רכבת|قطار|поезд
W plane|✈️|מטוס|طائرة|самолёт
W bike|🚲|אופניים|دراجة|велосипед
W boat|⛵|סירה|قارب|лодка
W house|🏠|בית|بيت|дом
S hello|👋|#d6336c|שלום ונימוסים|التحية والآداب|Приветствия и вежливость|Hello and please|g34|phrase
L בואו נלמד מה אומרים כשנפגשים, כשנפרדים וכשרוצים להיות מנומסים.|لنتعلّم ماذا نقول عند اللقاء وعند الوداع وعندما نريد أن نكون مهذّبين.|Давайте выучим, что говорят при встрече, при прощании и когда хотят быть вежливыми.|Let's learn what we say when we meet, when we leave and when we want to be polite.
X Hello!|שלום!|مرحبًا!|Привет!
X Good morning!|בוקר טוב!|صباح الخير!|Доброе утро!
X Good night!|לילה טוב!|تصبح على خير!|Спокойной ночи!
X Goodbye!|להתראות!|مع السلامة!|До свидания!
X Thank you.|תודה.|شكرًا.|Спасибо.
X Please.|בבקשה.|من فضلك.|Пожалуйста.
X Sorry.|סליחה.|عذرًا.|Извините.
X What is your name?|איך קוראים לך?|ما اسمك؟|Как тебя зовут?
X My name is Dana.|קוראים לי דנה.|اسمي دانة.|Меня зовут Дана.
X How are you?|מה שלומך?|كيف حالك؟|Как дела?
X I am fine, thank you.|אני בסדר, תודה.|أنا بخير، شكرًا.|У меня всё хорошо, спасибо.
Q |אתם פוגשים חבר בבוקר. מה אומרים?|تقابل صديقًا في الصباح. ماذا تقول؟|Ты встретил друга утром. Что скажешь?|You meet a friend in the morning. What do you say?|Good morning!|Good night!;Goodbye!;What is your name?
Q |אתם הולכים לישון. מה אומרים?|أنت ذاهب إلى النوم. ماذا تقول؟|Ты идёшь спать. Что скажешь?|You are going to sleep. What do you say?|Good night!|Good morning!;Hello!;Thank you.
Q |מישהו נתן לכם מתנה. מה אומרים?|أعطاك أحدهم هدية. ماذا تقول؟|Тебе подарили подарок. Что скажешь?|Someone gave you a gift. What do you say?|Thank you.|Please.;Goodbye!;My name is Dana.
Q |אתם עוזבים את הכיתה. מה אומרים?|أنت تغادر الصف. ماذا تقول؟|Ты уходишь из класса. Что скажешь?|You are leaving the classroom. What do you say?|Goodbye!|Hello!;Good morning!;Thank you.
Q |בטעות דרכתם למישהו על הרגל. מה אומרים?|دُست على قدم أحدهم بالخطأ. ماذا تقول؟|Ты случайно наступил кому-то на ногу. Что скажешь?|You stepped on someone's foot by mistake. What do you say?|Sorry.|Please.;Hello!;Good night!
Q What is your name?|בחרו תשובה מתאימה.|اختر إجابة مناسبة.|Выбери подходящий ответ.|Choose a fitting answer.|My name is Dana.|I am fine, thank you.;Goodbye!;Thank you.
Q How are you?|בחרו תשובה מתאימה.|اختر إجابة مناسبة.|Выбери подходящий ответ.|Choose a fitting answer.|I am fine, thank you.|My name is Dana.;Good night!;What is your name, please?
Q @Good morning!|הקשיבו. איזה משפט נשמע?|استمع. أيّ جملة سمعت؟|Послушай. Какое предложение ты услышал?|Listen. Which sentence did you hear?|Good morning!|Good night!;Goodbye!;Good morning, Dana!
Q @Thank you.|הקשיבו. איזה משפט נשמע?|استمع. أيّ جملة سمعت؟|Послушай. Какое предложение ты услышал?|Listen. Which sentence did you hear?|Thank you.|Please.;Sorry.;I am fine, thank you.
Q @My name is Dana.|הקשיבו. איזה משפט נשמע?|استمع. أيّ جملة سمعت؟|Послушай. Какое предложение ты услышал?|Listen. Which sentence did you hear?|My name is Dana.|What is your name?;How are you?;I am fine.
S sentences|✍️|#364fc7|משפטים פשוטים|جمل بسيطة|Простые предложения|Simple sentences|g56|phrase
L בואו נקרא ונשמע משפטים קצרים באנגלית. אחר כך נבחר את המילה הנכונה.|لنقرأ ونسمع جملًا قصيرة بالإنجليزية. ثم نختار الكلمة الصحيحة.|Давайте прочитаем и послушаем короткие предложения по-английски. Потом выберем правильное слово.|Let's read and hear short sentences in English. Then we choose the right word.
X I am happy.|אני שמח/ה.|أنا سعيد.|Я рад.
X She is a teacher.|היא מורה.|هي معلّمة.|Она учительница.
X He is my brother.|הוא אחי.|هو أخي.|Он мой брат.
X This is my book.|זה הספר שלי.|هذا كتابي.|Это моя книга.
X I have a dog.|יש לי כלב.|عندي كلب.|У меня есть собака.
X I like pizza.|אני אוהב/ת פיצה.|أحب البيتزا.|Я люблю пиццу.
X We are friends.|אנחנו חברים.|نحن أصدقاء.|Мы друзья.
X They are happy.|הם שמחים.|هم سعداء.|Они счастливы.
X It is a red ball.|זה כדור אדום.|إنها كرة حمراء.|Это красный мяч.
Q I ___ a student.|בחרו את המילה שמתאימה למשפט.|اختر الكلمة المناسبة للجملة.|Выбери слово, которое подходит к предложению.|Choose the word that fits the sentence.|am|is;are;be
Q She ___ a teacher.|בחרו את המילה שמתאימה למשפט.|اختر الكلمة المناسبة للجملة.|Выбери слово, которое подходит к предложению.|Choose the word that fits the sentence.|is|am;are;have
Q They ___ happy.|בחרו את המילה שמתאימה למשפט.|اختر الكلمة المناسبة للجملة.|Выбери слово, которое подходит к предложению.|Choose the word that fits the sentence.|are|is;am;has
Q This ___ my book.|בחרו את המילה שמתאימה למשפט.|اختر الكلمة المناسبة للجملة.|Выбери слово, которое подходит к предложению.|Choose the word that fits the sentence.|is|are;am;have
Q I ___ a dog.|בחרו את המילה שמתאימה למשפט.|اختر الكلمة المناسبة للجملة.|Выбери слово, которое подходит к предложению.|Choose the word that fits the sentence.|have|has;is;are
Q He ___ a cat.|בחרו את המילה שמתאימה למשפט.|اختر الكلمة المناسبة للجملة.|Выбери слово, которое подходит к предложению.|Choose the word that fits the sentence.|has|have;am;are
Q We ___ friends.|בחרו את המילה שמתאימה למשפט.|اختر الكلمة المناسبة للجملة.|Выбери слово, которое подходит к предложению.|Choose the word that fits the sentence.|are|is;am;has
Q This is ___ apple.|בחרו את המילה שמתאימה למשפט.|اختر الكلمة المناسبة للجملة.|Выбери слово, которое подходит к предложению.|Choose the word that fits the sentence.|an|a;is;are
Q This is ___ dog.|בחרו את המילה שמתאימה למשפט.|اختر الكلمة المناسبة للجملة.|Выбери слово, которое подходит к предложению.|Choose the word that fits the sentence.|a|an;is;are
Q one cat, two ___|בחרו את המילה שמתאימה.|اختر الكلمة المناسبة.|Выбери подходящее слово.|Choose the word that fits.|cats|cat;cates;cat's
Q one book, two ___|בחרו את המילה שמתאימה.|اختر الكلمة المناسبة.|Выбери подходящее слово.|Choose the word that fits.|books|book;bookes;book's
Q |איזה משפט כתוב נכון?|أيّ جملة مكتوبة بشكل صحيح؟|Какое предложение написано правильно?|Which sentence is written correctly?|I like cats.|Like I cats.;Cats like I.;I cats like.
Q |איזה משפט כתוב נכון?|أيّ جملة مكتوبة بشكل صحيح؟|Какое предложение написано правильно?|Which sentence is written correctly?|She is a teacher.|Is she teacher a.;Teacher she is a.;A she is teacher.
Q @I have a dog.|הקשיבו. איזה משפט נשמע?|استمع. أيّ جملة سمعت؟|Послушай. Какое предложение ты услышал?|Listen. Which sentence did you hear?|I have a dog.|I like a dog.;I am a dog.;He has a dog.
Q @They are happy.|הקשיבו. איזה משפט נשמע?|استمع. أيّ جملة سمعت؟|Послушай. Какое предложение ты услышал?|Listen. Which sentence did you hear?|They are happy.|We are happy.;They are here.;She is happy.
S opposites|↔️|#087f5b|ההפכים|الأضداد|Противоположности|Opposites|g56|phrase
L בואו נלמד מילים שהן ההפך אחת מהשנייה.|لنتعلّم كلمات كل واحدة منها عكس الأخرى.|Давайте выучим слова, которые означают противоположное.|Let's learn words that mean the opposite of each other.
X big - small|גדול - קטן|كبير - صغير|большой - маленький
X hot - cold|חם - קר|حار - بارد|горячий - холодный
X up - down|למעלה - למטה|فوق - تحت|вверх - вниз
X happy - sad|שמח - עצוב|سعيد - حزين|весёлый - грустный
X fast - slow|מהיר - איטי|سريع - بطيء|быстрый - медленный
X day - night|יום - לילה|نهار - ليل|день - ночь
X long - short|ארוך - קצר|طويل - قصير|длинный - короткий
X yes - no|כן - לא|نعم - لا|да - нет
Q big ↔ ___|מה ההפך?|ما عكس الكلمة؟|Какое слово противоположное?|What is the opposite?|small|hot;fast;night
Q cold ↔ ___|מה ההפך?|ما عكس الكلمة؟|Какое слово противоположное?|What is the opposite?|hot|small;slow;down
Q up ↔ ___|מה ההפך?|ما عكس الكلمة؟|Какое слово противоположное?|What is the opposite?|down|day;sad;long
Q sad ↔ ___|מה ההפך?|ما عكس الكلمة؟|Какое слово противоположное?|What is the opposite?|happy|cold;short;no
Q slow ↔ ___|מה ההפך?|ما عكس الكلمة؟|Какое слово противоположное?|What is the opposite?|fast|big;night;yes
Q night ↔ ___|מה ההפך?|ما عكس الكلمة؟|Какое слово противоположное?|What is the opposite?|day|up;hot;long
Q short ↔ ___|מה ההפך?|ما عكس الكلمة؟|Какое слово противоположное?|What is the opposite?|long|small;sad;no
Q yes ↔ ___|מה ההפך?|ما عكس الكلمة؟|Какое слово противоположное?|What is the opposite?|no|up;fast;day
Q @hot|הקשיבו. מה ההפך מהמילה שנשמעה?|استمع. ما عكس الكلمة التي سمعتها؟|Послушай. Какое слово противоположно услышанному?|Listen. What is the opposite of the word you hear?|cold|small;slow;up
Q @happy|הקשיבו. מה ההפך מהמילה שנשמעה?|استمع. ما عكس الكلمة التي سمعتها؟|Послушай. Какое слово противоположно услышанному?|Listen. What is the opposite of the word you hear?|sad|big;night;short
`;
