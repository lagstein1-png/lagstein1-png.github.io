/* Tanakh for kids - content written fresh for bekol (stories retold in simple language).
   Line formats (fields split by |):
   E key|type|he|ar|ru|en        entity (answer / distractor). types: p person, l place, t thing, a animal, d day-of-creation item, tr tree, h holiday, g group/people
   S id|emoji|color|he|ar|ru|en   story title
   L he|ar|ru|en                  one lesson sentence of the current story
   Q he|ar|ru|en|answerKey[|d1,d2,d3]   question; answerKey nNN = a number; optional 3 explicit distractors */
var RAW="";
RAW+=String.raw`
E god|p|אלוהים|الله|Бог|God
E adam|p|אדם הראשון|آدم|Адам|Adam
E eve|p|חוה|حواء|Ева|Eve
E noah|p|נוח|نوح|Ной|Noah
E abraham|p|אברהם|إبراهيم|Авраам|Abraham
E sarah|p|שרה|سارة|Сара|Sarah
E isaac|p|יצחק|إسحاق|Исаак|Isaac
E rebecca|p|רבקה|رفقة|Ревекка|Rebecca
E jacob|p|יעקב|يعقوب|Иаков|Jacob
E esau|p|עשיו|عيسو|Исав|Esau
E laban|p|לבן|لابان|Лаван|Laban
E rachel|p|רחל|راحيل|Рахиль|Rachel
E joseph|p|יוסף|يوسف|Иосиф|Joseph
E benjamin|p|בנימין|بنيامين|Вениамин|Benjamin
E judah|p|יהודה|يهوذا|Иуда|Judah
E pharaoh|p|פרעה|فرعون|Фараон|Pharaoh
E moses|p|משה|موسى|Моисей|Moses
E aaron|p|אהרן|هارون|Аарон|Aaron
E miriam|p|מרים|مريم|Мариам|Miriam
E jethro|p|יתרו|يثرون|Иофор|Jethro
E joshua|p|יהושע|يشوع|Иисус Навин|Joshua
E rahab|p|רחב|راحاب|Раав|Rahab
E samuel|p|שמואל|صموئيل|Самуил|Samuel
E saul|p|שאול|شاول|Саул|Saul
E david|p|דוד|داود|Давид|David
E goliath|p|גלית|جليات|Голиаф|Goliath
E jesse|p|ישי|يسّى|Иессей|Jesse
E jonathan|p|יהונתן|يوناثان|Ионафан|Jonathan
E solomon|p|שלמה|سليمان|Соломон|Solomon
E eden|l|גן עדן|جنة عدن|Эдемский сад|the Garden of Eden
E ararat|l|הרי אררט|جبال أرارات|горы Арарат|the mountains of Ararat
E t_mtcarmel|l|הרי הכרמל|جبال الكرمل|горы Кармель|the mountains of Carmel
E t_mttabor|l|הרי תבור|جبال طابور|горы Фавор|the mountains of Tabor
E t_gardenpalms|l|גן התמרים|جنة النخيل|Сад пальм|the Garden of Palms
E t_gardenwater|l|גן המים|جنة المياه|Сад воды|the Garden of Water
E t_gardenflowers|l|גן הפרחים|جنة الأزهار|Сад цветов|the Garden of Flowers
E egypt|l|מצרים|مصر|Египет|Egypt
E canaan|l|כנען|كنعان|Ханаан|Canaan
E haran|l|חרן|حاران|Харан|Haran
E bethel|l|בית אל|بيت إيل|Вефиль|Bethel
E sinai|l|הר סיני|جبل سيناء|гора Синай|Mount Sinai
E jericho|l|יריחו|أريحا|Иерихон|Jericho
E jerusalem|l|ירושלים|أورشليم|Иерусалим|Jerusalem
E jordan|l|נהר הירדן|نهر الأردن|река Иордан|the Jordan River
E nile|l|נהר היאור|نهر النيل|река Нил|the Nile River
E redsea|l|ים סוף|بحر القلزم|Красное море|the Red Sea
E midian|l|מדין|مديان|Мадиам|Midian
E elah|l|עמק האלה|وادي البطم|долина Эла|the Valley of Elah
E bethlehem|l|בית לחם|بيت لحم|Вифлеем|Bethlehem
E sea|t|הים|البحر|море|the sea
E sky|t|השמיים|السماء|небо|the sky
E land|t|היבשה|اليابسة|суша|the land
E shabbat|h|שבת|السبت|суббота|Shabbat
E pesach|h|פסח|الفصح|Песах|Passover
E shavuot|h|שבועות|الأسابيع (شافوعوت)|Шавуот|Shavuot
E sukkot|h|סוכות|العُرُش (سوكوت)|Суккот|Sukkot
E purim|h|פורים|بوريم|Пурим|Purim
E d_light|d|אור|النور|свет|light
E d_sky|d|השמיים|السماء|небо|the sky
E d_landtrees|d|היבשה, הים והעצים|اليابسة والبحر والأشجار|суша, море и деревья|land, sea and trees
E d_sunmoon|d|השמש, הירח והכוכבים|الشمس والقمر والنجوم|солнце, луна и звёзды|the sun, moon and stars
E d_fishbirds|d|דגים ועופות|أسماك وطيور|рыбы и птицы|fish and birds
E d_animals|d|חיות והאדם|الحيوانات والإنسان|животные и человек|animals and the first person
E snake|a|נחש|ثعبان|змей|a snake
E dove|a|יונה|حمامة|голубь|a dove
E raven|a|עורב|غراب|ворон|a raven
E ram|a|איל|كبش|баран|a ram
E camel|a|גמל|جمل|верблюд|a camel
E lion|a|אריה|أسد|лев|a lion
E whale|a|דג גדול|سمكة كبيرة|большая рыба|a big fish
E frogs|a|צפרדעים|ضفادع|лягушки|frogs
E sheep|a|כבשים|خراف|овцы|sheep
E knowledge|tr|עץ הדעת|شجرة المعرفة|дерево познания|the Tree of Knowledge
E fig|tr|עץ תאנה גדול|شجرة تين كبيرة|большая смоковница|a big fig tree
E olive|tr|עץ זית|شجرة زيتون|оливковое дерево|an olive tree
E palm|tr|עץ תמר גבוה|شجرة نخيل عالية|высокая финиковая пальма|a tall date palm tree
S s1|🌍|#e8590c|בריאת העולם|خلق العالم|Сотворение мира|The Creation of the World
L בהתחלה לא היה כלום. אלוהים ברא את העולם.|في البداية لم يكن شيء. خلق الله العالم.|Сначала ничего не было. Бог создал мир.|At first there was nothing. God made the world.
L ביום הראשון אלוהים אמר: "יהי אור". והאור בא.|في اليوم الأول قال الله: «ليكن نور». فجاء النور.|В первый день Бог сказал: «Да будет свет». И пришёл свет.|On the first day God said, "Let there be light." And light came.
L ביום השני הוא עשה את השמיים. ביום השלישי הופיעו היבשה, הים והעצים.|في اليوم الثاني صنع السماء. في اليوم الثالث ظهرت اليابسة والبحر والأشجار.|На второй день Он создал небо. На третий день появились суша, море и деревья.|On the second day He made the sky. On the third day the land, the sea and the trees appeared.
L ביום הרביעי נבראו השמש, הירח והכוכבים.|في اليوم الرابع خُلقت الشمس والقمر والنجوم.|На четвёртый день появились солнце, луна и звёзды.|On the fourth day the sun, the moon and the stars were made.
L ביום החמישי נבראו דגים בים ועופות בשמיים.|في اليوم الخامس خُلقت الأسماك في البحر والطيور في السماء.|На пятый день появились рыбы в море и птицы в небе.|On the fifth day fish filled the sea and birds filled the sky.
L ביום השישי נבראו החיות, ובסוף נברא האדם הראשון.|في اليوم السادس خُلقت الحيوانات، وفي النهاية خُلق الإنسان الأول.|На шестой день появились животные, а в конце — первый человек.|On the sixth day the animals were made, and at the end the first person.
L ביום השביעי אלוהים נח. זה יום השבת.|في اليوم السابع استراح الله. هذا هو يوم السبت.|На седьмой день Бог отдыхал. Это день субботы.|On the seventh day God rested. This is Shabbat.
Q מי ברא את העולם?|من خلق العالم؟|Кто создал мир?|Who made the world?|god|adam,noah,moses
Q מה נברא ביום הראשון?|ماذا خُلق في اليوم الأول؟|Что появилось в первый день?|What was made on the first day?|d_light
Q מה נברא ביום השני?|ماذا خُلق في اليوم الثاني؟|Что появилось во второй день?|What was made on the second day?|d_sky
Q מה נברא ביום השלישי?|ماذا خُلق في اليوم الثالث؟|Что появилось в третий день?|What was made on the third day?|d_landtrees
Q מה נברא ביום הרביעי?|ماذا خُلق في اليوم الرابع؟|Что появилось в четвёртый день?|What was made on the fourth day?|d_sunmoon
Q מה נברא ביום החמישי?|ماذا خُلق في اليوم الخامس؟|Что появилось в пятый день?|What was made on the fifth day?|d_fishbirds
Q מה נברא ביום השישי?|ماذا خُلق في اليوم السادس؟|Что появилось в шестой день?|What was made on the sixth day?|d_animals
Q באיזה יום אלוהים נח?|في أي يوم استراح الله؟|В какой по счёту день Бог отдыхал?|On which day did God rest?|n7|n6,n5,n3
Q ביום מספר כמה נברא האור?|في اليوم رقم كم خُلق النور؟|В какой по счёту день появился свет?|On which day was the light made?|n1|n2,n3,n4
Q איך קוראים ליום שבו אלוהים נח?|ماذا نسمّي اليوم الذي استراح فيه الله؟|Как называется день, когда Бог отдыхал?|What is the day called when God rested?|shabbat
Q איפה חיו הדגים שנבראו?|أين عاشت الأسماك التي خُلقت؟|Где жили созданные рыбы?|Where did the fish that were made live?|sea|sky,land,d_light
Q איפה עפו העופות?|أين طارت الطيور؟|Где летали птицы?|Where did the birds fly?|sky|sea,land,d_light
Q כמה ימים אלוהים עבד ואז נח ביום השביעי?|كم يومًا عمل الله ثم استراح في اليوم السابع؟|Сколько дней Бог работал, а на седьмой отдыхал?|For how many days did God work, before resting on the seventh?|n6|n7,n5,n3
S s2|🌳|#2b8a3e|גן עדן|جنة عدن|Эдемский сад|The Garden of Eden
L אלוהים עשה גן יפה וקרא לו גן עדן.|صنع الله جنة جميلة وسماها جنة عدن.|Бог создал красивый сад и назвал его Эдем.|God made a beautiful garden and called it Eden.
L הוא שם בגן את אדם הראשון. אחר כך נבראה גם חוה.|وضع فيها آدم، الإنسان الأول. وبعد ذلك خُلقت أيضًا حواء.|Он поселил там первого человека, Адама. Потом появилась и Ева.|He put the first person, Adam, there. Later Eve was made too.
L בגן גדלו עצים עם פירות טעימים. מכל העצים אפשר היה לאכול, חוץ מעץ אחד: עץ הדעת.|نمت في الجنة أشجار ذات ثمار لذيذة. كان يمكنهما الأكل من كل الأشجار، إلا شجرة واحدة: شجرة المعرفة.|В саду росли деревья со вкусными плодами. Можно было есть с любого дерева, кроме одного: дерева познания.|Trees with tasty fruit grew in the garden. They could eat from every tree except one: the Tree of Knowledge.
L נחש דיבר אל חוה ואמר: "תאכלי מהעץ הזה". היא אכלה, וגם אדם אכל.|تكلم ثعبان مع حواء وقال: «كلي من هذه الشجرة». فأكلت، وأكل آدم أيضًا.|Змей заговорил с Евой: «Съешь плод с этого дерева». Она съела, и Адам тоже.|A snake spoke to Eve: "Eat from this tree." She ate, and Adam ate too.
L אלוהים ידע מה קרה. אדם וחוה יצאו מהגן.|عرف الله ما حدث. خرج آدم وحواء من الجنة.|Бог узнал, что случилось. Адам и Ева вышли из сада.|God knew what happened. Adam and Eve left the garden.
L הסיפור מלמד: חשוב לשמור על ההוראות ולהגיד את האמת.|تعلّمنا القصة: من المهم أن نلتزم بالتعليمات وأن نقول الحقيقة.|История учит: важно соблюдать правила и говорить правду.|The story teaches: it is important to follow instructions and tell the truth.
Q איך קוראים לגן שאלוהים עשה?|ماذا اسم الجنة التي صنعها الله؟|Как называется сад, который создал Бог?|What was the garden that God made called?|eden|t_gardenpalms,t_gardenwater,t_gardenflowers
Q איך קראו לאיש הראשון?|ماذا كان اسم الإنسان الأول؟|Как звали первого человека?|What was the first person called?|adam|t_noah_n2,t_abraham_n2,t_moses_n2
Q איך קראו לאישה הראשונה?|ماذا كان اسم المرأة الأولى؟|Как звали первую женщину?|What was the first woman called?|eve|sarah,rebecca,rachel
Q איזה בעל חיים דיבר אל חוה?|أي حيوان تكلم مع حواء؟|Какое животное говорило с Евой?|Which animal spoke to Eve?|snake|dove,lion,camel
Q מאיזה עץ אסור היה לאכול?|من أي شجرة لم يكن مسموحًا الأكل؟|С какого дерева нельзя было есть?|Which tree were they not allowed to eat from?|knowledge|fig,olive,palm
Q מכמה עצים אסור היה לאכול?|من كم شجرة لم يكن مسموحًا الأكل؟|Со скольких деревьев нельзя было есть?|From how many trees were they not allowed to eat?|n1|n2,n3,n4
Q מי ידע מה קרה בגן?|من عرف ما حدث في الجنة؟|Кто узнал, что случилось в саду?|Who knew what happened in the garden?|god|noah,david,pharaoh
Q מי אכל מהעץ אחרי חוה?|من أكل من الشجرة بعد حواء؟|Кто съел плод после Евы?|Who ate from the tree after Eve?|adam|t_noah_n2,t_moses_n2,t_jacob_n2
Q מה מלמד הסיפור? חשוב לשמור על...|ماذا تعلّمنا القصة؟ من المهم أن نلتزم...|Чему учит история? Важно соблюдать...|What does the story teach? It is important to keep...|t_rules|t_games,t_sleep,t_quietclass
E t_rules|t|ההוראות|التعليمات|правила|the instructions
E t_games|t|המשחקים בחצר|الألعاب في الساحة|игры во дворе|the games in the yard
E t_sleep|t|השינה בצהריים|النوم في الظهيرة|дневной сон|sleeping in the afternoon
E t_toys|t|הצעצועים|الدمى|игрушки|the toys
E t_quietclass|t|השקט בכיתה|الهدوء في الصف|тишину в классе|quiet in the classroom
Q מה אמר הנחש לחוה לעשות?|ماذا قال الثعبان لحواء أن تفعل؟|Что змей сказал Еве сделать?|What did the snake tell Eve to do?|t_eattree|t_pickflower,t_leavegarden,t_sleepgarden
Q מי יצא מהגן?|من خرج من الجنة؟|Кто вышел из сада?|Who left the garden?|t_adameve|t_abrahamsarah,t_noahwife,t_isaacrebecca
E t_eattree|t|לאכול מהעץ|أن تأكل من الشجرة|съесть плод с дерева|to eat from the tree
E t_sleepgarden|t|לישון בגן עד הבוקר|أن تنام في الجنة حتى الصباح|спать в саду до самого утра|to sleep in the garden until morning
E t_pickflower|t|לקטוף פרחים בגן|أن تقطف أزهارًا في الجنة|сорвать цветы в саду|to pick flowers in the garden
E t_leavegarden|t|לצאת מהגן אל הנהר|أن تخرج من الجنة إلى النهر|выйти из сада к реке|to go out of the garden to the river
E t_water|t|מים|مياه|вода|water
E t_snow|t|שלג|ثلج|снег|snow
E t_sand|t|חול|رمل|песок|sand
E t_cows|t|פרות|بقرات|коровы|cows
E t_dogs|t|כלבים|كلاب|собаки|dogs
E t_birds_n|t|ציפורים|طيور|птицы|birds
E t_camels|t|גמלים|جمال|верблюды|camels
S s3|🚢|#1c7ed6|נוח והתיבה|نوح والفلك|Ной и ковчег|Noah and the Ark
L נוח היה איש טוב. אלוהים אמר לו: "בנה תיבה גדולה".|كان نوح رجلًا صالحًا. قال له الله: «ابنِ فلكًا كبيرًا».|Ной был хорошим человеком. Бог сказал ему: «Построй большой ковчег».|Noah was a good man. God told him, "Build a big ark."
L נוח לקח לתיבה את המשפחה שלו ובעלי חיים מכל סוג: זכר ונקבה.|أخذ نوح إلى الفلك عائلته وحيوانات من كل نوع، ذكرًا وأنثى.|Ной взял в ковчег свою семью и животных, самца и самку каждого вида.|Noah took his family into the ark, and animals, a male and a female of each kind.
L ירד גשם גדול ארבעים יום וארבעים לילה. המים כיסו את כל העולם.|نزل مطر غزير أربعين يومًا وأربعين ليلة. غطّت المياه العالم كله.|Сорок дней и сорок ночей шёл сильный дождь. Вода покрыла весь мир.|A great rain fell for forty days and forty nights. Water covered the whole world.
L התיבה צפה על המים. אחרי זמן היא נחה על הרי אררט.|طفا الفلك على الماء. وبعد مدة استقر على جبال أرارات.|Ковчег плавал по воде. Потом он остановился на горах Арарат.|The ark floated on the water. After a while it rested on the mountains of Ararat.
L נוח שלח עורב ואחר כך יונה לבדוק אם יש יבשה. היונה חזרה עם עלה של זית.|أرسل نوح غرابًا ثم حمامة ليرى إن كانت هناك يابسة. عادت الحمامة بورقة زيتون.|Ной выпустил ворона, а потом голубя, чтобы узнать, есть ли суша. Голубь вернулся с оливковым листом.|Noah sent out a raven and then a dove to see if there was dry land. The dove came back with an olive leaf.
L נוח ומשפחתו יצאו מהתיבה. בשמיים הופיעה קשת, סימן של שלום.|خرج نوح وعائلته من الفلك. ظهرت في السماء قوس قزح، علامة سلام.|Ной и его семья вышли из ковчега. В небе появилась радуга — знак мира.|Noah and his family left the ark. A rainbow appeared in the sky, a sign of peace.
Q מה אלוהים ביקש מנוח לבנות?|ماذا طلب الله من نوح أن يبني؟|Что Бог попросил Ноя построить?|What did God ask Noah to build?|t_ark|t_tower,t_house,t_wall
Q כמה ימים ירד גשם גדול?|كم يومًا نزل المطر الغزير؟|Сколько дней шёл сильный дождь?|For how many days did the great rain fall?|n40|n7,n10,n12
Q על איזה הרים נחה התיבה?|على أي جبال استقر الفلك؟|На каких горах остановился ковчег?|On which mountains did the ark rest?|ararat|sinai,t_mtcarmel,t_mttabor
Q איזו ציפור חזרה עם עלה של זית?|أي طائر عاد بورقة زيتون؟|Какая птица вернулась с оливковым листом?|Which bird came back with an olive leaf?|dove|raven,lion,camel
Q איזו ציפור נוח שלח ראשונה?|أي طائر أرسله نوح أولًا؟|Какую птицу Ной выпустил первой?|Which bird did Noah send out first?|raven|dove,snake,ram
Q מי בנה תיבה?|من بنى الفلك؟|Кто построил ковчег?|Who built an ark?|noah|abraham,moses,david
Q מה הופיע בשמיים אחרי הגשם?|ماذا ظهر في السماء بعد المطر؟|Что появилось в небе после дождя?|What appeared in the sky after the rain?|t_rainbow|t_ark,t_tower,t_sunset
Q כמה בעלי חיים מכל סוג נכנסו לתיבה?|كم حيوانًا من كل نوع دخل الفلك؟|Сколько животных каждого вида вошло в ковчег?|How many animals of each kind went into the ark?|n2|n1,n3,n4
Q מי נכנס לתיבה עם נוח?|من دخل الفلك مع نوح؟|Кто вошёл в ковчег вместе с Ноем?|Who went into the ark with Noah?|t_family|t_pharaoh,t_goliath,t_army
Q מאיזה עץ היה העלה שהיונה הביאה?|من أي شجرة كانت الورقة التي أحضرتها الحمامة؟|С какого дерева был лист, который принесла голубка?|Which tree did the dove's leaf come from?|olive|fig,palm,knowledge
Q מה היה הסימן לשלום?|ما كانت علامة السلام؟|Что было знаком мира?|What was the sign of peace?|t_rainbow|dove,olive,t_sunset
E t_ark|t|תיבה|فلكًا|ковчег|an ark
E t_tower|t|מגדל|برجًا|башню|a tower
E t_house|t|בית|بيتًا|дом|a house
E t_wall|t|חומה|سورًا|стену|a wall
E t_rainbow|t|קשת|قوس قزح|радуга|a rainbow
E t_sunset|t|שקיעה|غروب|закат|a sunset
E t_family|t|המשפחה שלו|عائلته|его семья|his family
E t_pharaoh|t|פרעה|فرعون|фараон|Pharaoh
E t_goliath|t|גלית והחיילים שלו|جليات وجنوده|Голиаф и его солдаты|Goliath and his soldiers
E t_army|t|צבא גדול של מלך|جيش كبير لملك|большое войско царя|a king's big army
Q מה כיסה את כל העולם בימי נוח?|ماذا غطّى العالم كله في أيام نوح؟|Что покрыло весь мир во времена Ноя?|What covered the whole world in Noah's days?|t_water|t_snow,t_sand,t_fire
Q כמה לילות ירד גשם גדול?|كم ليلة نزل المطر الغزير؟|Сколько ночей шёл сильный дождь?|For how many nights did the great rain fall?|n40|n4,n7,n14
S s4|⭐|#9c36b5|אברהם ושרה|إبراهيم وسارة|Авраам и Сара|Abraham and Sarah
L אברהם ושרה גרו בחרן. אלוהים אמר לאברהם: "לך לארץ חדשה, ואני אברך אותך".|عاش إبراهيم وسارة في حاران. قال الله لإبراهيم: «اذهب إلى أرض جديدة، وأنا أباركك».|Авраам и Сара жили в Харане. Бог сказал Аврааму: «Иди в новую землю, и Я благословлю тебя».|Abraham and Sarah lived in Haran. God said to Abraham, "Go to a new land, and I will bless you."
L אברהם יצא לדרך עם שרה, עם הצאן ועם הגמלים. הם הגיעו לארץ כנען.|انطلق إبراهيم مع سارة ومعهما الغنم والجمال. وصلوا إلى أرض كنعان.|Авраам отправился в путь с Сарой, со стадами и верблюдами. Они пришли в землю Ханаан.|Abraham set out with Sarah, his sheep and his camels. They reached the land of Canaan.
L אברהם ישב בפתח האוהל. שלושה אורחים הגיעו, והוא רץ לקבל אותם.|جلس إبراهيم عند باب الخيمة. جاء ثلاثة ضيوف، فركض لاستقبالهم.|Авраам сидел у входа в шатёр. Пришли трое гостей, и он побежал им навстречу.|Abraham sat at the door of his tent. Three guests came, and he ran to welcome them.
L הוא הביא להם מים, לחם ואוכל. כך מקבלים אורחים.|أحضر لهم ماءً وخبزًا وطعامًا. هكذا نستقبل الضيوف.|Он принёс им воды, хлеба и еды. Так принимают гостей.|He brought them water, bread and food. This is how we welcome guests.
L אלוהים הבטיח לאברהם ולשרה בן. כשאברהם היה בן מאה, נולד להם יצחק.|وعد الله إبراهيم وسارة بابن. وعندما كان إبراهيم ابن مئة سنة وُلد لهما إسحاق.|Бог пообещал Аврааму и Саре сына. Когда Аврааму было сто лет, у них родился Исаак.|God promised Abraham and Sarah a son. When Abraham was a hundred years old, Isaac was born.
L שרה צחקה משמחה. לכן קראו לבן יצחק.|ضحكت سارة من الفرح. لذلك سُمّي الابن إسحاق.|Сара засмеялась от радости. Поэтому сына назвали Исаак.|Sarah laughed with joy. That is why the boy was called Isaac.
Q מאיפה יצא אברהם לדרך?|من أين انطلق إبراهيم؟|Откуда отправился Авраам?|Where did Abraham set out from?|haran|egypt,jericho,bethlehem
Q לאיזו ארץ הגיעו אברהם ושרה?|إلى أي أرض وصل إبراهيم وسارة؟|В какую землю пришли Авраам и Сара?|To which land did Abraham and Sarah come?|canaan|egypt,midian,haran
Q מי הייתה אשתו של אברהם?|من كانت زوجة إبراهيم؟|Кто была женой Авраама?|Who was Abraham's wife?|sarah|rebecca,rachel,miriam
Q כמה אורחים הגיעו לאוהל של אברהם?|كم ضيفًا جاء إلى خيمة إبراهيم؟|Сколько гостей пришло к шатру Авраама?|How many guests came to Abraham's tent?|n3|n1,n2,n4
Q איפה ישב אברהם כשהאורחים הגיעו?|أين جلس إبراهيم عندما جاء الضيوف؟|Где сидел Авраам, когда пришли гости?|Where was Abraham sitting when the guests came?|t_tent|t_ark,t_tower,t_wall
Q מה אברהם נתן לאורחים? מים, לחם ו...|ماذا أعطى إبراهيم للضيوف؟ ماءً وخبزًا و...|Что Авраам дал гостям? Воду, хлеб и...|What did Abraham give the guests? Water, bread and...|t_food|t_swords,t_books,t_newclothes
Q איזה בן נולד לאברהם ולשרה?|أي ابن وُلد لإبراهيم وسارة؟|Какой сын родился у Авраама и Сары?|Which son was born to Abraham and Sarah?|isaac|jacob,esau,joseph
Q בן כמה היה אברהם כשנולד יצחק?|كم كان عمر إبراهيم عندما وُلد إسحاق؟|Сколько лет было Аврааму, когда родился Исаак?|How old was Abraham when Isaac was born?|n100|n120,n90,n40
Q מה עשתה שרה כשקיבלה את הבשורה?|ماذا فعلت سارة عندما سمعت الخبر؟|Что сделала Сара, когда услышала новость?|What did Sarah do when she heard the news?|t_laugh|t_cry,t_run,t_sleptf
Q מה אלוהים הבטיח לאברהם?|ماذا وعد الله إبراهيم؟|Что Бог обещал Аврааму?|What did God promise Abraham?|t_son|t_boat,t_castle,t_gold
Q איזו מצווה קיים אברהם כששלושת האנשים באו לאוהל?|أي وصية طبّق إبراهيم عندما جاء الرجال الثلاثة إلى الخيمة؟|Какую заповедь исполнил Авраам, когда трое пришли к шатру?|Which good deed did Abraham do when the three men came to his tent?|t_guests|t_wars,t_trade,t_hunt
Q איזו חיה הלכה עם אברהם בדרך?|أي حيوان سار مع إبراهيم في الطريق؟|Какое животное шло с Авраамом в пути?|Which animal walked with Abraham on the journey?|camel|whale,frogs,lion
E t_tent|t|האוהל|الخيمة|шатёр|the tent
E t_food|t|אוכל|طعامًا|еду|food
E t_swords|t|חרבות|سيوفًا|мечи|swords
E t_books|t|ספרים|كتبًا|книги|books
E t_newclothes|t|בגדים חדשים|ثيابًا جديدة|новую одежду|new clothes
E t_laugh|t|צחקה|ضحكت|засмеялась|she laughed
E t_cry|t|בכתה|بكت|заплакала|she cried
E t_run|t|ברחה|هربت|убежала|she ran away
E t_sleptf|t|נרדמה|نامت|уснула|she fell asleep
E t_son|t|בן|ابنًا|сына|a son
E t_boat|t|סירה|قاربًا|лодку|a boat
E t_castle|t|טירה|قلعة|замок|a castle
E t_bigbird|t|ציפור ענקית בשמיים|طائرًا ضخمًا في السماء|огромную птицу в небе|a huge bird in the sky
E t_gold|t|זהב|ذهبًا|золото|gold
E t_guests|t|לקבל אורחים|استقبال الضيوف|принимать гостей|welcoming guests
E t_wars|t|להילחם באנשים זרים|قتال الغرباء من الناس|воевать с чужими людьми|fighting with strangers
E t_trade|t|לסחור איתם בצאן|التجارة معهم بالغنم|торговать с ними овцами|trading sheep with them
E t_hunt|t|לצוד חיות במדבר|صيد الحيوانات في البرية|охотиться на зверей в пустыне|hunting animals in the desert
S s5|🪜|#c2255c|יעקב ועשיו|يعقوب وعيسو|Иаков и Исав|Jacob and Esau
L ליצחק ורבקה נולדו שני בנים, תאומים: עשיו ויעקב. עשיו אהב לצוד ויעקב אהב לשבת באוהל.|وُلد لإسحاق ورفقة ابنان توأمان: عيسو ويعقوب. أحب عيسو الصيد وأحب يعقوب الجلوس في الخيمة.|У Исаака и Ревекки родились два сына-близнеца: Исав и Иаков. Исав любил охотиться, а Иаков любил сидеть в шатре.|Isaac and Rebecca had twin sons: Esau and Jacob. Esau loved to hunt and Jacob loved to stay in the tent.
L יום אחד עשיו חזר רעב. יעקב בישל מרק עדשים, ועשיו אכל אותו.|في يوم عاد عيسو جائعًا. طبخ يعقوب شوربة عدس، وأكلها عيسو.|Однажды Исав вернулся голодным. Иаков сварил чечевичную похлёбку, и Исав её съел.|One day Esau came home hungry. Jacob cooked lentil soup, and Esau ate it.
L אחר כך עשיו כעס על יעקב. יעקב הלך רחוק, אל חרן, לדוד שלו לבן.|بعد ذلك غضب عيسو من يعقوب. ذهب يعقوب بعيدًا إلى حاران، إلى خاله لابان.|Потом Исав рассердился на Иакова. Иаков ушёл далеко, в Харан, к своему дяде Лавану.|Later Esau was angry with Jacob. Jacob went far away to Haran, to his uncle Laban.
L בדרך יעקב נרדם על אבן. הוא חלם על סולם שמגיע עד השמיים, ומלאכים עולים ויורדים בו.|في الطريق نام يعقوب على حجر. حلم بسُلّم يصل إلى السماء وملائكة تصعد وتنزل عليه.|По дороге Иаков уснул на камне. Ему приснилась лестница до неба, по ней поднимались и спускались ангелы.|On the way Jacob fell asleep on a stone. He dreamed of a ladder reaching the sky, with angels going up and down.
L יעקב קרא למקום בית אל. בחרן הוא עבד אצל לבן והתחתן עם לאה ועם רחל.|سمّى يعقوب المكان بيت إيل. في حاران عمل عند لابان وتزوج ليئة وراحيل.|Иаков назвал это место Вефиль. В Харане он работал у Лавана и женился на Лие и Рахили.|Jacob called the place Bethel. In Haran he worked for Laban and married Leah and Rachel.
L אחרי שנים רבות יעקב חזר הביתה. הוא והאח שלו עשיו התפייסו.|بعد سنوات كثيرة عاد يعقوب إلى البيت. وتصالح هو وأخوه عيسو.|Спустя много лет Иаков вернулся домой. Он и его брат Исав помирились.|After many years Jacob went back home. He and his brother Esau made peace.
Q מי היו ההורים של יעקב ועשיו?|من كان والدا يعقوب وعيسو؟|Кто были родители Иакова и Исава?|Who were the parents of Jacob and Esau?|t_isaacrebecca|t_adameve,t_abrahamsarah,t_noahwife
Q מי אהב לצוד?|من أحب الصيد؟|Кто любил охотиться?|Who loved to hunt?|esau|jacob,isaac,laban
Q מה יעקב בישל לעשיו?|ماذا طبخ يعقوب لعيسو؟|Что Иаков сварил Исаву?|What did Jacob cook for Esau?|t_lentils|t_fish,t_eggs,t_cake
Q לאן יעקב הלך?|إلى أين ذهب يعقوب؟|Куда пошёл Иаков?|Where did Jacob go?|haran|egypt,jericho,midian
Q אצל מי יעקב עבד בחרן?|عند من عمل يعقوب في حاران؟|У кого Иаков работал в Харане?|Whom did Jacob work for in Haran?|laban|esau,pharaoh,jethro
Q על מה יעקב ישן בדרך?|على ماذا نام يعقوب في الطريق؟|На чём спал Иаков по дороге?|What did Jacob sleep on during the journey?|t_stone|t_bed,t_boat,t_grass
Q מה יעקב חלם?|ماذا حلم يعقوب؟|Что приснилось Иакову?|What did Jacob dream about?|t_ladder|t_boat,t_bigbird,t_castle
Q מי עלה וירד בסולם?|من صعد ونزل على السُّلّم؟|Кто поднимался и спускался по лестнице?|Who went up and down the ladder?|t_angels|t_camels,t_soldiers,t_children
Q איך יעקב קרא למקום שבו חלם?|ماذا سمّى يعقوب المكان الذي حلم فيه؟|Как Иаков назвал место, где ему приснился сон?|What did Jacob call the place where he dreamed?|bethel|jericho,sinai,eden
Q איזו אישה אהב יעקב ועבד בשבילה?|أي امرأة أحبها يعقوب وعمل من أجلها؟|Какую женщину любил Иаков и работал ради неё?|Which woman did Jacob love and work for?|rachel|sarah,rebecca,eve
Q מה קרה בסוף בין יעקב לעשיו?|ماذا حدث في النهاية بين يعقوب وعيسو؟|Что случилось в конце между Иаковом и Исавом?|What happened in the end between Jacob and Esau?|t_peace|t_war,t_race,t_game
Q כמה אחים תאומים נולדו ליצחק ורבקה?|كم ابنًا توأمًا وُلد لإسحاق ورفقة؟|Сколько близнецов родилось у Исаака и Ревекки?|How many twin sons were born to Isaac and Rebecca?|n2|n1,n3,n4
E t_isaacrebecca|t|יצחק ורבקה|إسحاق ورفقة|Исаак и Ревекка|Isaac and Rebecca
E t_adameve|t|אדם וחוה|آدم وحواء|Адам и Ева|Adam and Eve
E t_abrahamsarah|t|אברהם ושרה|إبراهيم وسارة|Авраам и Сара|Abraham and Sarah
E t_noahwife|t|נוח ובנו|نوح وابنه|Ной и его сын|Noah and his son
E t_lentils|t|מרק עדשים|شوربة عدس|чечевичная похлёбка|lentil soup
E t_fish|t|דג|سمكة|рыбу|fish
E t_fishes|t|דגים|أسماك|рыбы|fish
E t_eggs|t|ביצים קשות|بيضًا مسلوقًا|варёные яйца|boiled eggs
E t_cake|t|עוגה עם דבש ואגוזים|كعكة بالعسل والجوز|пирог с мёдом и орехами|honey and nut cake
E t_stone|t|אבן|حجر|камне|a stone
E t_bed|t|מיטה|سرير|кровати|a bed
E t_grass|t|עשב|عشب|траве|grass
E t_ladder|t|סולם עד השמיים|سُلّمًا يصل إلى السماء|лестницу до неба|a ladder to the sky
E t_fire|t|אש|نارًا|огонь|a fire
E t_angels|t|מלאכים|ملائكة|ангелы|angels
E t_camels|t|גמלים|جمال|верблюды|camels
E t_soldiers|t|חיילים|جنود|солдаты|soldiers
E t_children|t|ילדים|أولاد|дети|children
E t_peace|t|שלום|سلام|мир|peace
E t_war|t|מלחמה|حرب|война|war
E t_race|t|מרוץ|سباق|гонка|a race
E t_game|t|משחק|لعبة|игра|a game
S s6|🌈|#0c8599|יוסף ואחיו|يوسف وإخوته|Иосиф и его братья|Joseph and His Brothers
L ליעקב היו שנים עשר בנים. הוא אהב במיוחד את יוסף ונתן לו כתונת צבעונית.|كان ليعقوب اثنا عشر ابنًا. أحبّ يوسف كثيرًا وأعطاه قميصًا ملوّنًا.|У Иакова было двенадцать сыновей. Особенно он любил Иосифа и подарил ему разноцветную рубашку.|Jacob had twelve sons. He loved Joseph most and gave him a colorful coat.
L יוסף חלם חלומות, והאחים כעסו עליו. יום אחד הם לקחו אותו ומכרו אותו לסוחרים.|حلم يوسف أحلامًا، فغضب إخوته منه. وفي يوم أخذوه وباعوه لتجار.|Иосиф видел сны, и братья на него рассердились. Однажды они схватили его и продали торговцам.|Joseph had dreams, and his brothers got angry. One day they took him and sold him to traders.
L הסוחרים לקחו את יוסף למצרים. שם הוא עבד בבית של איש גדול, ואחר כך נכנס לבית הסוהר.|أخذ التجار يوسف إلى مصر. هناك عمل في بيت رجل كبير، ثم دخل السجن.|Торговцы увезли Иосифа в Египет. Там он работал в доме важного человека, а потом попал в тюрьму.|The traders took Joseph to Egypt. There he worked in a great man's house, and later went to prison.
L בבית הסוהר יוסף פתר חלומות. פרעה חלם על שבע פרות שמנות ושבע פרות רזות.|في السجن فسّر يوسف الأحلام. حلم فرعون بسبع بقرات سمينة وسبع بقرات هزيلة.|В тюрьме Иосиф разгадывал сны. Фараону приснились семь тучных коров и семь тощих.|In prison Joseph explained dreams. Pharaoh dreamed of seven fat cows and seven thin cows.
L יוסף אמר: "יהיו שבע שנים טובות ואחריהן שבע שנים של רעב". פרעה עשה אותו לשליט.|قال يوسف: «ستأتي سبع سنوات جيدة تتبعها سبع سنوات جوع». فجعله فرعون حاكمًا.|Иосиф сказал: «Будет семь хороших лет, а за ними семь лет голода». Фараон сделал его правителем.|Joseph said, "There will be seven good years, then seven years of hunger." Pharaoh made him a ruler.
L יוסף אסף אוכל בשנים הטובות. כשבא הרעב, אנשים רבים באו אליו לקנות אוכל.|جمع يوسف الطعام في السنوات الجيدة. وعندما جاء الجوع، جاء ناس كثيرون ليشتروا منه الطعام.|Иосиф запасал еду в хорошие годы. Когда пришёл голод, много людей пришло к нему за едой.|Joseph stored food in the good years. When the hunger came, many people came to him to buy food.
L גם האחים של יוסף באו ממדינה אחרת. הם לא הכירו אותו, אבל הוא הכיר אותם.|جاء إخوة يوسف أيضًا من بلد آخر. لم يعرفوه، لكنه عرفهم.|Братья Иосифа тоже пришли из другой страны. Они его не узнали, а он узнал их.|Joseph's brothers also came from another land. They did not recognize him, but he recognized them.
L יוסף סלח להם. הוא אמר: "אל תפחדו". כל המשפחה עברה לגור במצרים.|سامحهم يوسف. قال: «لا تخافوا». وانتقلت العائلة كلها لتسكن في مصر.|Иосиф простил их. Он сказал: «Не бойтесь». Вся семья переехала жить в Египет.|Joseph forgave them. He said, "Do not be afraid." The whole family moved to live in Egypt.
Q כמה בנים היו ליעקב?|كم ابنًا كان ليعقوب؟|Сколько сыновей было у Иакова?|How many sons did Jacob have?|n12|n7,n10,n40
Q מה יעקב נתן ליוסף?|ماذا أعطى يعقوب ليوسف؟|Что Иаков подарил Иосифу?|What did Jacob give Joseph?|t_coat|t_ring,t_sword,t_crown
Q מי קנה את יוסף מהאחים?|من اشترى يوسف من إخوته؟|Кто купил Иосифа у братьев?|Who bought Joseph from his brothers?|t_traders|t_soldiers,t_angels,t_children
Q לאיזו מדינה הובא יוסף?|إلى أي بلد أُحضر يوسف؟|В какую страну привезли Иосифа?|Which country was Joseph taken to?|egypt|canaan,midian,haran
Q איפה יוסף היה אחרי שעבד בבית?|أين كان يوسف بعد أن عمل في البيت؟|Где оказался Иосиф после работы в доме?|Where was Joseph after he worked in the house?|t_prison|t_garden,t_school,t_ship
Q מי חלם על פרות?|من حلم ببقرات؟|Кому приснились коровы?|Who dreamed about cows?|pharaoh|jacob,saul,moses
Q כמה פרות שמנות היו בחלום?|كم بقرة سمينة كانت في الحلم؟|Сколько тучных коров было во сне?|How many fat cows were in the dream?|n7|n3,n12,n40
Q מה היו שבע הפרות הרזות?|ماذا كانت البقرات السبع الهزيلة؟|Что означали семь тощих коров?|What did the seven thin cows mean?|t_hunger|t_party,t_war,t_rain
Q מי פתר את החלום של פרעה?|من فسّر حلم فرعون؟|Кто разгадал сон фараона?|Who explained Pharaoh's dream?|joseph|benjamin,judah,aaron
Q מה יוסף עשה בשנים הטובות?|ماذا فعل يوسف في السنوات الجيدة؟|Что Иосиф делал в хорошие годы?|What did Joseph do in the good years?|t_storefood|t_trade2,t_travel,t_playgames
Q מי קיבל את יוסף למשרה גדולה?|من عيّن يوسف في منصب كبير؟|Кто назначил Иосифа на высокую должность?|Who gave Joseph a big job?|pharaoh|esau,laban,jethro
Q כשבאו האחים, מי הכיר את מי?|عندما جاء الإخوة، من عرف من؟|Когда пришли братья, кто кого узнал?|When the brothers came, who recognized whom?|t_joseph_knew|t_brothers_knew,t_nobody,t_pharaoh_knew
Q מה יוסף עשה לאחים בסוף?|ماذا فعل يوسف بإخوته في النهاية؟|Что Иосиф сделал с братьями в конце?|What did Joseph do for his brothers in the end?|t_forgave|t_punished,t_ignored,t_sold
Q לאן עברה המשפחה לגור?|إلى أين انتقلت العائلة لتسكن؟|Куда переехала жить семья?|Where did the family move to live?|egypt|jericho,sinai,bethel
Q מי כעס על יוסף בגלל החלומות?|من غضب على يوسف بسبب الأحلام؟|Кто рассердился на Иосифа из-за снов?|Who was angry with Joseph because of his dreams?|t_brothers|t_pharaoh,t_traders,t_angels
E t_coat|t|כתונת צבעונית|قميصًا ملوّنًا|разноцветную рубашку|a colorful coat
E t_ring|t|טבעת זהב גדולה|خاتمًا ذهبيًا كبيرًا|большое золотое кольцо|a big gold ring
E t_sword|t|חרב|سيفًا|меч|a sword
E t_crown|t|כתר עם אבנים יפות|تاجًا بأحجار جميلة|корону с красивыми камнями|a crown with pretty stones
E t_traders|t|הסוחרים|التجار|торговцы|the traders
E t_prison|t|בבית הסוהר|في السجن|в тюрьме|in prison
E t_garden|t|בגן|في حديقة|в саду|in a garden
E t_school|t|בבית ספר|في مدرسة|в школе|in a school
E t_ship|t|על ספינה|على سفينة|на корабле|on a ship
E t_hunger|t|שנים של רעב|سنوات جوع|годы голода|years of hunger
E t_party|t|שנים של מסיבות|سنوات حفلات|годы праздников|years of parties
E t_rain|t|שנים של גשם|سنوات مطر|годы дождей|years of rain
E t_storefood|t|אסף אוכל|جمع الطعام|запасал еду|He stored food
E t_trade2|t|שיחק בכדור|لعب بالكرة|играл в мяч|He played ball
E t_travel|t|טייל בהרים|تنزّه في الجبال|гулял в горах|He hiked in the hills
E t_playgames|t|בנה בית|بنى بيتًا|строил дом|He built a house
E t_joseph_knew|t|יוסף הכיר את האחים|عرف يوسف إخوته|Иосиф узнал братьев|Joseph recognized his brothers
E t_brothers_knew|t|האחים הכירו את יוסף|عرف الإخوة يوسف|Братья узнали Иосифа|The brothers recognized Joseph
E t_nobody|t|אף אחד לא הכיר|لم يعرف أحد أحدًا|Никто никого не узнал|Nobody recognized anyone
E t_pharaoh_knew|t|פרעה הכיר את כולם|عرف فرعون الجميع|Фараон узнал всех|Pharaoh recognized everyone
E t_forgave|t|סלח להם|سامحهم|простил их|He forgave them
E t_punished|t|העניש אותם|عاقبهم|наказал их|He punished them
E t_ignored|t|התעלם מהם|تجاهلهم|не обратил на них внимания|He ignored them
E t_sold|t|מכר אותם|باعهم|продал их|He sold them
E t_brothers|t|האחים שלו|إخوته|его братья|his brothers
Q על מה חלם פרעה?|عن ماذا حلم فرعون؟|Что приснилось фараону?|What did Pharaoh dream about?|t_cows|t_dogs,t_birds_n,t_fishes
S s7|🔥|#e8590c|משה והסנה|موسى والعليقة|Моисей и куст|Moses and the Burning Bush
L במצרים נולדו הרבה ילדים בני ישראל. פרעה פחד, והוא קבע חוקים קשים.|وُلد في مصر أولاد كثيرون من بني إسرائيل. خاف فرعون ووضع قوانين قاسية.|В Египте родилось много детей Израиля. Фараон испугался и издал суровые законы.|Many Israelite children were born in Egypt. Pharaoh was afraid, and he made harsh laws.
L אמא של משה שמה אותו בתיבה קטנה על נהר היאור. אחותו מרים שמרה עליו מרחוק.|وضعت أم موسى ابنها في سلة صغيرة على نهر النيل. وراقبته أخته مريم من بعيد.|Мать Моисея положила его в маленькую корзину на реке Нил. Его сестра Мариам смотрела издалека.|Moses' mother put him in a small basket on the Nile. His sister Miriam watched from far away.
L בת של פרעה מצאה את התינוק ולקחה אותו לארמון. משה גדל במצרים.|وجدت ابنة فرعون الطفل وأخذته إلى القصر. كبر موسى في مصر.|Дочь фараона нашла малыша и взяла его во дворец. Моисей вырос в Египте.|Pharaoh's daughter found the baby and took him to the palace. Moses grew up in Egypt.
L כשהתבגר, משה ברח למדין. שם הוא התחתן ועבד כרועה צאן אצל יתרו.|عندما كبر، هرب موسى إلى مديان. هناك تزوج وعمل راعيَ غنم عند يثرون.|Когда Моисей вырос, он убежал в Мадиам. Там он женился и пас овец у Иофора.|When Moses grew up he ran away to Midian. There he married and worked as a shepherd for Jethro.
L יום אחד משה ראה סנה בוער, אבל הסנה לא נשרף. הוא התקרב לראות.|في يوم رأى موسى عليقة تشتعل لكنها لا تحترق. اقترب ليرى.|Однажды Моисей увидел горящий куст, который не сгорал. Он подошёл поближе.|One day Moses saw a bush that burned but was not burned up. He came closer to look.
L אלוהים קרא לו מתוך הסנה: "משה, לך אל פרעה. שחרר את עמי". משה פחד, ואלוהים אמר: "אהרן אחיך יעזור לך".|ناداه الله من العليقة: «موسى، اذهب إلى فرعون. أطلق شعبي». خاف موسى، فقال الله: «أخوك هارون سيساعدك».|Бог позвал его из куста: «Моисей, иди к фараону. Отпусти Мой народ». Моисей испугался, и Бог сказал: «Твой брат Аарон поможет тебе».|God called to him from the bush: "Moses, go to Pharaoh. Let my people go." Moses was afraid, and God said, "Your brother Aaron will help you."
Q איפה פרעה שלט?|أين حكم فرعون؟|Где правил фараон?|Where did Pharaoh rule?|egypt|canaan,midian,jericho
Q באיזה נהר צפה התינוק משה?|على أي نهر طفا الطفل موسى؟|На какой реке плыл маленький Моисей?|On which river did baby Moses float?|nile|jordan,sea,redsea
Q במה שמה אמא את משה?|ماذا وضعت أم موسى فيه ابنها؟|Во что мать положила Моисея?|What did Moses' mother put him in?|t_basket|t_bed,t_boat,t_castle
Q מי שמרה על משה מרחוק?|من راقبت موسى من بعيد؟|Кто издалека смотрел за Моисеем?|Who watched Moses from far away?|miriam|sarah,rachel,rebecca
Q מי מצאה את התינוק?|من وجدت الطفل؟|Кто нашёл малыша?|Who found the baby?|t_pharaohdaughter|t_rachel_n,t_sarah_n,t_eve_n
Q לאן משה ברח כשהתבגר?|إلى أين هرب موسى عندما كبر؟|Куда убежал Моисей, когда вырос?|Where did Moses run to when he grew up?|midian|egypt,canaan,jericho
Q איזו עבודה עשה משה במדין?|أي عمل عمل موسى في مديان؟|Какую работу делал Моисей в Мадиаме?|What job did Moses do in Midian?|t_shepherd|t_baker,t_soldier,t_king
Q אצל מי עבד משה?|عند من عمل موسى؟|У кого работал Моисей?|Who did Moses work for?|jethro|laban,pharaoh,jacob
Q מה בער ולא נשרף?|ما الذي اشتعل ولم يحترق؟|Что горело и не сгорало?|What burned but was not burned up?|t_bush|t_tree_n,t_house,t_ark
Q מי קרא למשה מתוך הסנה?|من نادى موسى من العليقة؟|Кто позвал Моисея из куста?|Who called Moses from the bush?|god|aaron,david,joshua
Q את מי ביקש משה מפרעה לשחרר?|من طلب موسى من فرعون أن يطلق سراحهم؟|Кого Моисей просил фараона отпустить?|Whom did Moses ask Pharaoh to set free?|t_israelites|t_pharaoh,t_animals_n,t_soldiers
Q מי עזר למשה?|من ساعد موسى؟|Кто помогал Моисею?|Who helped Moses?|aaron|esau,saul,laban
Q מה היה השם של אחות משה?|ما اسم أخت موسى؟|Как звали сестру Моисея?|What was Moses' sister's name?|miriam|sarah,rachel,eve
E t_basket|t|תיבה|سلة|корзину|a basket
E t_pharaohdaughter|t|בת פרעה|ابنة فرعون|дочь фараона|Pharaoh's daughter
E t_rachel_n|t|רחל אשת יעקב|راحيل زوجة يعقوب|Рахиль, жена Иакова|Rachel, Jacob's wife
E t_sarah_n|t|שרה אשת אברהם|سارة زوجة إبراهيم|Сара, жена Авраама|Sarah, Abraham's wife
E t_eve_n|t|חוה מגן עדן|حواء من جنة عدن|Ева из Эдемского сада|Eve from the Garden of Eden
E t_noah_n2|t|נוח מהתיבה|نوح من الفلك|Ной из ковчега|Noah from the ark
E t_abraham_n2|t|אברהם מהאוהל|إبراهيم من الخيمة|Авраам из шатра|Abraham from the tent
E t_moses_n2|t|משה מהר סיני|موسى من جبل سيناء|Моисей с горы Синай|Moses from Mount Sinai
E t_jacob_n2|t|יעקב מהסולם|يعقوب من السُّلّم|Иаков с лестницы|Jacob from the ladder
E t_shepherd|t|רועה צאן|راعي غنم|пастух|a shepherd
E t_baker|t|אופה בשוק|خبّاز في السوق|пекарь на рынке|a baker in the market
E t_soldier|t|חייל בצבא|جندي في الجيش|солдат в войске|a soldier in the army
E t_king|t|מלך על העיר|ملك على المدينة|царь города|a king over the city
E t_bush|t|סנה|عليقة|куст|a bush
E t_tree_n|t|עץ גבוה|شجرة عالية|высокое дерево|a tall tree
E t_israelites|t|בני ישראל|بني إسرائيل|народ Израиля|the Israelites
E t_animals_n|t|החיות של מצרים|حيوانات مصر|животных Египта|the animals of Egypt
S s8|🌊|#1c7ed6|יציאת מצרים|الخروج من مصر|Исход из Египта|Leaving Egypt
L פרעה לא רצה לשחרר את בני ישראל. אלוהים שלח עשר מכות, ואחת מהן הייתה צפרדעים.|لم يرد فرعون أن يطلق بني إسرائيل. أرسل الله عشر ضربات، وكانت إحداها الضفادع.|Фараон не хотел отпускать Израиль. Бог послал десять казней, одной из них были лягушки.|Pharaoh did not want to let the Israelites go. God sent ten plagues, and one of them was frogs.
L בסוף פרעה אמר: "לכו!". בני ישראל אפו לחם בלי זמן להתפח. זה המצה.|في النهاية قال فرعون: «اذهبوا!». خبز بنو إسرائيل خبزًا دون وقت لينتفخ. هذه هي المصّة.|В конце фараон сказал: «Идите!». Израиль испёк хлеб, не дожидаясь, пока он поднимется. Это маца.|At last Pharaoh said, "Go!" The Israelites baked bread with no time to rise. This is matzah.
L משה והעם יצאו ממצרים. אהרן ומרים הלכו איתם.|خرج موسى والشعب من مصر. وذهب معهم هارون ومريم.|Моисей и народ вышли из Египта. С ними шли Аарон и Мариам.|Moses and the people left Egypt. Aaron and Miriam went with them.
L פרעה התחרט ורדף אחריהם עם צבא. בני ישראל הגיעו לים סוף ולא היה להם לאן ללכת.|ندم فرعون وطاردهم بجيش. وصل بنو إسرائيل إلى بحر القلزم ولم يكن لهم مكان يذهبون إليه.|Фараон передумал и погнался за ними с армией. Израиль дошёл до Красного моря, и идти было некуда.|Pharaoh changed his mind and chased them with an army. The Israelites reached the Red Sea with nowhere to go.
L משה הרים את המטה שלו. הים נפתח, ובני ישראל עברו ביבשה בין שני קירות מים.|رفع موسى عصاه. انفتح البحر، وعبر بنو إسرائيل على اليابسة بين جدارين من الماء.|Моисей поднял свой посох. Море расступилось, и Израиль прошёл по суше между двумя стенами воды.|Moses raised his staff. The sea opened, and the Israelites walked on dry land between two walls of water.
L אחר כך המים חזרו, והצבא של פרעה לא הגיע אליהם. מרים שרה ורקדה בתוף.|ثم عادت المياه، ولم يصل جيش فرعون إليهم. غنّت مريم ورقصت بالدف.|Потом вода сомкнулась, и армия фараона не смогла дойти до них. Мариам пела и танцевала с бубном.|Then the water came back, and Pharaoh's army could not reach them. Miriam sang and danced with a drum.
L בכל שנה אנחנו זוכרים את היציאה ממצרים בחג פסח.|كل سنة نتذكّر الخروج من مصر في عيد الفصح.|Каждый год мы вспоминаем исход из Египта в праздник Песах.|Every year we remember leaving Egypt on the holiday of Passover.
Q כמה מכות שלח אלוהים למצרים?|كم ضربة أرسل الله إلى مصر؟|Сколько казней Бог послал Египту?|How many plagues did God send to Egypt?|n10|n3,n7,n12
Q איזה בעלי חיים היו באחת המכות?|أي حيوانات كانت في إحدى الضربات؟|Какие животные были в одной из казней?|Which animals were in one of the plagues?|frogs|sheep,t_camels,t_birds_n
Q איזה לחם בני ישראל אפו כשיצאו?|أي خبز خبز بنو إسرائيل عندما خرجوا؟|Какой хлеб испёк Израиль, когда уходил?|What bread did the Israelites bake when they left?|t_matzah|t_cake_n,t_pita,t_bagel
Q מי הוביל את בני ישראל ממצרים?|من قاد بني إسرائيل من مصر؟|Кто вёл Израиль из Египта?|Who led the Israelites out of Egypt?|moses|joshua,david,abraham
Q איזה ים עמד לפני בני ישראל?|أي بحر وقف أمام بني إسرائيل؟|Какое море оказалось перед Израилем?|Which sea stood in front of the Israelites?|redsea|nile,jordan,t_seagalilee
Q מי רדף אחרי בני ישראל?|من طارد بني إسرائيل؟|Кто гнался за Израилем?|Who chased the Israelites?|pharaoh|laban,saul,esau
Q מה משה הרים כדי שהים ייפתח?|ماذا رفع موسى ليفتح البحر؟|Что поднял Моисей, чтобы море расступилось?|What did Moses raise so the sea would open?|t_staff|t_sword,t_torch,t_flag
Q איך בני ישראל עברו בים?|كيف عبر بنو إسرائيل البحر؟|Как Израиль прошёл по морю?|How did the Israelites cross the sea?|t_dryland|t_ship_n,t_swimming,t_bridge
Q מי ניגנה בתוף ורקדה?|من قرعت الدف ورقصت؟|Кто играла на бубне и танцевала?|Who played the drum and danced?|miriam|sarah,rebecca,rahab
Q באיזה חג אנחנו זוכרים את יציאת מצרים?|في أي عيد نتذكّر الخروج من مصر؟|В какой праздник мы вспоминаем исход из Египта?|On which holiday do we remember leaving Egypt?|pesach|purim,sukkot,shabbat
Q מי הלך עם משה? אהרן ו...|من ذهب مع موسى؟ هارون و...|Кто шёл с Моисеем? Аарон и...|Who went with Moses? Aaron and...|miriam|sarah,rachel,eve
Q מה קרה לצבא פרעה?|ماذا حدث لجيش فرعون؟|Что случилось с армией фараона?|What happened to Pharaoh's army?|t_didntreach|t_won,t_crossed,t_wentback
Q למה בני ישראל לא הספיקו לחכות לבצק?|لماذا لم يستطع بنو إسرائيل انتظار العجين؟|Почему Израиль не мог ждать, пока тесто поднимется?|Why couldn't the Israelites wait for the dough to rise?|t_hurry|t_sleepy,t_hungry,t_cold
E t_matzah|t|מצה|فطير (متسة)|маца|matzah
E t_cake_n|t|עוגת שוקולד|كعكة شوكولاتة|шоколадный торт|chocolate cake
E t_pita|t|פיתה|خبز عربي|пита|pita
E t_bagel|t|בייגל|كعكة سمسم|бублик|a bagel
E t_seagalilee|t|הכנרת|بحيرة طبريا|Галилейское море|the Sea of Galilee
E t_staff|t|מטה|عصاه|посох|his staff
E t_torch|t|לפיד|مشعلًا|факел|a torch
E t_flag|t|דגל|علمًا|флаг|a flag
E t_dryland|t|ביבשה, בין קירות מים|على اليابسة بين جدارين من الماء|по суше между стенами воды|on dry land between walls of water
E t_ship_n|t|בספינות גדולות של מצרים|بسفن كبيرة من مصر|на больших кораблях из Египта|in big ships from Egypt
E t_swimming|t|בשחייה, אחד אחרי השני|بالسباحة، واحدًا تلو الآخر|вплавь, один за другим|by swimming, one after another
E t_bridge|t|על גשר עץ שמשה בנה|على جسر خشبي كبير بناه موسى لهم|по деревянному мосту, который построил Моисей|over a wooden bridge that Moses built
E t_didntreach|t|לא הגיע אליהם|لم يصل إليهم|не дошла до них|It could not reach them
E t_won|t|ניצח את כולם|انتصر على الجميع|победила всех|It won the battle
E t_crossed|t|עבר בים בשקט|عبر البحر بهدوء|спокойно прошла море|It crossed the sea quietly
E t_flew|t|עף באוויר|طار في الهواء|улетела по воздуху|It flew away
E t_wentback|t|חזר למצרים בלי להילחם|عاد إلى مصر دون قتال|вернулась в Египет без боя|It went back to Egypt without fighting
E t_hurry|t|מיהרו לצאת|كانوا مستعجلين للخروج|спешили уйти|They were in a hurry to leave
E t_sleepy|t|היו עייפים מהדרך|كانوا متعبين من الطريق|устали от дороги|They were tired from the road
E t_hungry|t|לא היה להם קמח בבתים|لم يكن لديهم طحين في البيوت|у них не было муки в домах|They had no flour in their houses
E t_cold|t|היה קר מדי בחוץ|كان الجو باردًا جدًا في الخارج|на улице было слишком холодно|It was far too cold outside
Q מי אמר לבני ישראל "לכו"?|من قال لبني إسرائيل «اذهبوا»؟|Кто сказал Израилю «Идите»?|Who said to the Israelites, "Go"?|pharaoh|aaron,joshua,jethro
S s9|📜|#9c36b5|עשרת הדיברות|الوصايا العشر|Десять заповедей|The Ten Commandments
L אחרי שלושה חודשים בני ישראל הגיעו למדבר ולהר סיני. העם חנה למרגלות ההר.|بعد ثلاثة أشهر وصل بنو إسرائيل إلى الصحراء وإلى جبل سيناء. أقام الشعب عند سفح الجبل.|Через три месяца Израиль пришёл в пустыню к горе Синай. Народ встал лагерем у подножия горы.|After three months the Israelites reached the desert and Mount Sinai. The people camped at the foot of the mountain.
L משה עלה אל ההר, ואלוהים נתן לו עשרת הדיברות על שני לוחות אבן.|صعد موسى إلى الجبل، وأعطاه الله الوصايا العشر على لوحين من الحجر.|Моисей поднялся на гору, и Бог дал ему десять заповедей на двух каменных скрижалях.|Moses went up the mountain, and God gave him the Ten Commandments on two stone tablets.
L הדיברות אומרים: כבד את אבא ואמא, אל תגנוב, אל תשקר, ושמור על יום השבת.|تقول الوصايا: أكرم أباك وأمك، لا تسرق، لا تكذب، واحفظ يوم السبت.|Заповеди говорят: почитай отца и мать, не кради, не лги и соблюдай субботу.|The commandments say: honor your father and mother, do not steal, do not lie, and keep Shabbat.
L משה היה על ההר ארבעים יום. העם חיכה למטה, ובני ישראל חגגו את קבלת התורה.|بقي موسى على الجبل أربعين يومًا. انتظر الشعب في الأسفل، واحتفل بنو إسرائيل بتلقّي التوراة.|Моисей был на горе сорок дней. Народ ждал внизу, и Израиль праздновал получение Торы.|Moses was on the mountain for forty days. The people waited below, and the Israelites celebrated receiving the Torah.
L אחר כך בני ישראל הלכו במדבר ארבעים שנה. אלוהים נתן להם מים, ואוכל שנקרא מן.|بعد ذلك مشى بنو إسرائيل في الصحراء أربعين سنة. أعطاهم الله ماءً وطعامًا اسمه المنّ.|Потом Израиль сорок лет шёл по пустыне. Бог дал им воду и еду, которая называлась манна.|Then the Israelites walked in the desert for forty years. God gave them water and food called manna.
L בחג שבועות אנחנו זוכרים את מתן תורה.|في عيد الأسابيع نتذكّر إعطاء التوراة.|В праздник Шавуот мы вспоминаем дарование Торы.|On the holiday of Shavuot we remember the giving of the Torah.
Q לאיזה הר הגיעו בני ישראל?|إلى أي جبل وصل بنو إسرائيل؟|К какой горе пришёл Израиль?|Which mountain did the Israelites reach?|sinai|ararat,jericho,bethel
Q מי עלה אל ההר?|من صعد إلى الجبل؟|Кто поднялся на гору?|Who went up the mountain?|moses|aaron,joshua,david
Q על מה נכתבו עשרת הדיברות?|على ماذا كُتبت الوصايا العشر؟|На чём были написаны десять заповедей?|What were the Ten Commandments written on?|t_tablets|t_paper,t_wall_n,t_clothes
Q כמה לוחות נתן אלוהים למשה?|كم لوحًا أعطى الله لموسى؟|Сколько скрижалей Бог дал Моисею?|How many tablets did God give Moses?|n2|n1,n3,n4
Q כמה דיברות יש?|كم وصية هناك؟|Сколько заповедей?|How many commandments are there?|n10|n3,n7,n12
Q כמה ימים משה היה על ההר?|كم يومًا بقي موسى على الجبل؟|Сколько дней Моисей был на горе?|How many days was Moses on the mountain?|n40|n7,n10,n12
Q כמה שנים הלכו בני ישראל במדבר?|كم سنة مشى بنو إسرائيل في الصحراء؟|Сколько лет Израиль шёл по пустыне?|How many years did the Israelites walk in the desert?|n40|n10,n70,n100
Q איך קראו לאוכל שאלוהים נתן במדבר?|ماذا سُمّي الطعام الذي أعطاه الله في الصحراء؟|Как называлась еда, которую Бог дал в пустыне?|What was the food God gave in the desert called?|t_manna|t_pizza,t_soup,t_cake_n
Q מה אומרת מצווה אחת מהעשרת הדיברות?|ماذا تقول إحدى الوصايا العشر؟|Что говорит одна из десяти заповедей?|What does one of the Ten Commandments say?|t_honorparents|t_cmd_early,t_cmd_water,t_cmd_gift
Q איזה יום מיוחד הדיברות מזכירים?|أي يوم مميز تذكّره الوصايا؟|Какой особый день упоминают заповеди?|Which special day do the commandments mention?|shabbat|purim,pesach,sukkot
Q באיזה חג אנחנו זוכרים את מתן תורה?|في أي عيد نتذكّر إعطاء التوراة؟|В какой праздник мы вспоминаем дарование Торы?|On which holiday do we remember the giving of the Torah?|shavuot|purim,pesach,sukkot
Q איפה העם חיכה כשמשה היה על ההר?|أين انتظر الشعب بينما كان موسى على الجبل؟|Где ждал народ, пока Моисей был на горе?|Where did the people wait while Moses was on the mountain?|t_foot|t_top,t_egypt_n,t_sea_n
Q מי נתן את הדיברות למשה?|من أعطى الوصايا لموسى؟|Кто дал Моисею заповеди?|Who gave the commandments to Moses?|god|pharaoh,jethro,aaron
E t_tablets|t|על שני לוחות אבן|على لوحين من الحجر|на двух каменных скрижалях|on two stone tablets
E t_paper|t|על נייר גדול וחלק|على ورقة كبيرة وملساء|на большом гладком листе бумаги|on a big smooth sheet of paper
E t_wall_n|t|על קיר האוהל של משה|على جدار خيمة موسى|на стене шатра Моисея|on the wall of Moses' tent
E t_clothes|t|על הבגדים של הכוהן|على ثياب الكاهن|на одежде священника|on the priest's clothes
E t_manna|t|מן|منّ|манна|manna
E t_pizza|t|פיצה|بيتزا|пицца|pizza
E t_soup|t|מרק ירקות|شوربة خضار|овощной суп|vegetable soup
E t_honorparents|t|כבד את אבא ואמא|أكرم أباك وأمك|почитай отца и мать|Honor your father and mother
E t_beloud|t|תצעק חזק|اصرخ بصوت عالٍ|кричи громко|Shout loudly
E t_runfast|t|תרוץ מהר|اركض بسرعة|беги быстро|Run fast
E t_jumphigh|t|תקפוץ גבוה|اقفز عاليًا|прыгай высоко|Jump high
E t_cmd_early|t|קום מוקדם בכל בוקר|قم باكرًا كل صباح|вставай рано каждое утро|Get up early every morning
E t_cmd_water|t|שתה הרבה מים כל יום|اشرب ماءً كثيرًا كل يوم|пей много воды каждый день|Drink a lot of water every day
E t_cmd_gift|t|תן מתנה לכל שכן|أعطِ هدية لكل جار|дари подарок каждому соседу|Give a present to every neighbour
E t_foot|t|למטה, למרגלות ההר|في الأسفل عند سفح الجبل|внизу, у подножия горы|below, at the foot of the mountain
E t_top|t|למעלה, על ראש ההר|في الأعلى على قمة الجبل|наверху, на вершине горы|up on top of the mountain
E t_egypt_n|t|במצרים, בבתים שלהם|في مصر، في بيوتهم|в Египте, в своих домах|in Egypt, in their houses
E t_sea_n|t|בים, על שפת המים|في البحر، على حافة الماء|в море, у самой воды|in the sea, at the water's edge
S s10|🏺|#2b8a3e|יהושע וחומת יריחו|يشوع وسور أريحا|Иисус Навин и стены Иерихона|Joshua and the Walls of Jericho
L אחרי משה, יהושע הוביל את בני ישראל. הם עברו את נהר הירדן ונכנסו לארץ כנען.|بعد موسى قاد يشوع بني إسرائيل. عبروا نهر الأردن ودخلوا أرض كنعان.|После Моисея Израиль вёл Иисус Навин. Они перешли реку Иордан и вошли в землю Ханаан.|After Moses, Joshua led the Israelites. They crossed the Jordan River and entered the land of Canaan.
L יהושע שלח שני אנשים לבדוק את העיר יריחו. רחב עזרה להם והחביאה אותם.|أرسل يشوع رجلين ليستطلعا مدينة أريحا. ساعدتهما راحاب وأخفتهما.|Иисус Навин послал двух человек осмотреть город Иерихон. Раав помогла им и спрятала их.|Joshua sent two men to look at the city of Jericho. Rahab helped them and hid them.
L לעיר יריחו הייתה חומה גבוהה. אלוהים אמר ליהושע מה לעשות.|كان لمدينة أريحا سور عالٍ. قال الله ليشوع ماذا يفعل.|У города Иерихон была высокая стена. Бог сказал Иисусу Навину, что делать.|The city of Jericho had a high wall. God told Joshua what to do.
L שישה ימים הלכו סביב העיר פעם אחת בכל יום, עם שופרות. ביום השביעי הלכו שבע פעמים.|لمدة ستة أيام داروا حول المدينة مرة واحدة كل يوم، ومعهم أبواق. وفي اليوم السابع داروا سبع مرات.|Шесть дней они обходили город по разу в день, с шофарами. На седьмой день они обошли его семь раз.|For six days they walked around the city once each day, with shofars. On the seventh day they walked around it seven times.
L אז כולם צעקו ותקעו בשופרות, והחומה נפלה.|ثم صرخ الجميع ونفخوا في الأبواق، فسقط السور.|Тогда все закричали и затрубили в шофары, и стена упала.|Then everyone shouted and blew the shofars, and the wall fell.
L רחב ומשפחתה נשארו בשלום, כי היא עזרה לשני האנשים.|بقيت راحاب وعائلتها بسلام، لأنها ساعدت الرجلين.|Раав и её семья остались целы, потому что она помогла двум людям.|Rahab and her family stayed safe, because she helped the two men.
Q מי הוביל את בני ישראל אחרי משה?|من قاد بني إسرائيل بعد موسى؟|Кто вёл Израиль после Моисея?|Who led the Israelites after Moses?|joshua|aaron,david,samuel
Q איזה נהר עברו בני ישראל?|أي نهر عبر بنو إسرائيل؟|Какую реку перешёл Израиль?|Which river did the Israelites cross?|jordan|nile,redsea,sea
Q לאיזו ארץ נכנסו בני ישראל?|إلى أي أرض دخل بنو إسرائيل؟|В какую землю вошёл Израиль?|Which land did the Israelites enter?|canaan|egypt,midian,haran
Q איזו עיר הייתה לה חומה גבוהה?|أي مدينة كان لها سور عالٍ؟|У какого города была высокая стена?|Which city had a high wall?|jericho|bethlehem,jerusalem,haran
Q מי עזרה לשני האנשים והחביאה אותם?|من ساعدت الرجلين وأخفتهما؟|Кто помогла двум мужчинам и спрятала их?|Who helped the two men and hid them?|rahab|rachel,sarah,miriam
Q כמה אנשים יהושע שלח לבדוק את העיר?|كم رجلًا أرسل يشوع ليستطلع المدينة؟|Сколько людей Иисус Навин послал осмотреть город?|How many men did Joshua send to look at the city?|n2|n1,n3,n4
Q כמה ימים הלכו סביב העיר פעם אחת בכל יום?|كم يومًا داروا حول المدينة مرة واحدة كل يوم؟|Сколько дней они обходили город по разу в день?|For how many days did they walk around the city once a day?|n6|n3,n7,n10
Q כמה פעמים הלכו סביב העיר ביום השביעי?|كم مرة داروا حول المدينة في اليوم السابع؟|Сколько раз они обошли город на седьмой день?|How many times did they walk around the city on the seventh day?|n7|n3,n6,n10
Q במה תקעו סביב העיר?|بماذا نفخوا حول المدينة؟|Во что они трубили вокруг города?|What did they blow around the city?|t_shofar|t_flute,t_bell,t_horn_car
Q מה קרה לחומה בסוף?|ماذا حدث للسور في النهاية؟|Что случилось со стеной в конце?|What happened to the wall in the end?|t_fell|t_grew,t_flew_n,t_moved
Q מי אמר ליהושע מה לעשות?|من قال ليشوع ماذا يفعل؟|Кто сказал Иисусу Навину, что делать?|Who told Joshua what to do?|god|pharaoh,saul,esau
Q למה רחב נשארה בשלום?|لماذا بقيت راحاب بسلام؟|Почему Раав осталась цела?|Why did Rahab stay safe?|t_helped|t_ran,t_hid_n,t_fought
E t_shofar|t|בשופרות|بالأبواق|в шофары|shofars
E t_flute|t|בחלילים|بالمزامير|во флейты|flutes
E t_bell|t|בפעמונים|بالأجراس|в колокольчики|bells
E t_horn_car|t|בצופרים של מכוניות|ببوقات السيارات|в автомобильные гудки|car horns
E t_fell|t|נפלה|سقط|упала|It fell
E t_grew|t|גדלה|كبر|выросла|It grew
E t_flew_n|t|עפה|طار|улетела|It flew away
E t_moved|t|זזה למקום אחר|تحرك إلى مكان آخر|переехала в другое место|It moved somewhere else
E t_helped|t|עזרה לאנשים|ساعدت الرجلين|помогла людям|She helped the men
E t_ran|t|ברחה מהעיר בלילה|هربت من المدينة ليلًا|убежала из города ночью|She ran away from the city at night
E t_hid_n|t|התחבאה מתחת לגג|اختبأت تحت السطح|спряталась под крышей|She hid under the roof
E t_fought|t|נלחמה בחיילים|حاربت الجنود|сражалась с солдатами|She fought the soldiers
S s11|🪨|#c2255c|דוד וגלית|داود وجليات|Давид и Голиаф|David and Goliath
L שמואל הנביא בא לבית לחם, לבית של ישי. הוא בחר בדוד, הבן הקטן, להיות מלך.|جاء النبي صموئيل إلى بيت لحم، إلى بيت يسّى. اختار داود، الابن الأصغر، ليكون ملكًا.|Пророк Самуил пришёл в Вифлеем, в дом Иессея. Он выбрал Давида, младшего сына, чтобы тот стал царём.|The prophet Samuel came to Bethlehem, to the house of Jesse. He chose David, the youngest son, to be a king.
L דוד היה רועה צאן. הוא שמר על הכבשים, ופעם הציל אותם מאריה ומדוב.|كان داود راعي غنم. حرس الخراف، وأنقذها مرة من أسد ومن دب.|Давид был пастухом. Он охранял овец и однажды спас их от льва и медведя.|David was a shepherd. He guarded the sheep and once saved them from a lion and a bear.
L דוד ניגן בכינור יפה. המלך שאול אהב לשמוע אותו, ובנו של שאול, יהונתן, היה חבר טוב של דוד.|عزف داود على القيثارة بشكل جميل. أحب الملك شاول أن يسمعه، وكان يوناثان، ابن شاول، صديقًا جيدًا لداود.|Давид красиво играл на арфе. Царь Саул любил его слушать, а сын Саула Ионафан был хорошим другом Давида.|David played the harp beautifully. King Saul loved to hear him, and Saul's son Jonathan was David's good friend.
L בעמק האלה עמד צבא גדול, ובו לוחם ענק בשם גלית. הוא צעק ופחדו ממנו.|في وادي البطم وقف جيش كبير، وفيه محارب عملاق اسمه جليات. صرخ فخافوا منه.|В долине Эла стояла большая армия, а в ней великан-воин по имени Голиаф. Он кричал, и все его боялись.|In the Valley of Elah a big army stood, and in it a giant warrior named Goliath. He shouted and everyone was afraid of him.
L דוד אמר: "אני אילחם בו". הוא לא לבש שריון. הוא לקח מקל, שק ואבנים חלקות.|قال داود: «أنا أحاربه». لم يلبس درعًا. أخذ عصا وكيسًا وحجارة ملساء.|Давид сказал: «Я буду с ним сражаться». Он не надел доспехи. Он взял палку, мешок и гладкие камни.|David said, "I will fight him." He did not wear armor. He took a stick, a bag and smooth stones.
L דוד שם אבן בקלע וזרק. האבן פגעה בגלית, והוא נפל.|وضع داود حجرًا في المقلاع ورماه. أصاب الحجر جليات فسقط.|Давид положил камень в пращу и бросил. Камень попал в Голиафа, и тот упал.|David put a stone in his sling and threw it. The stone hit Goliath, and he fell.
L אחרי שנים, דוד נהיה מלך בירושלים. הוא כתב שירים ותפילות שנקראים תהילים.|بعد سنوات أصبح داود ملكًا في أورشليم. كتب أشعارًا وصلوات اسمها المزامير.|Через несколько лет Давид стал царём в Иерусалиме. Он писал песни и молитвы, которые называются Псалмы.|Years later David became king in Jerusalem. He wrote songs and prayers called Psalms.
Q לאיזו עיר בא שמואל הנביא?|إلى أي مدينة جاء النبي صموئيل؟|В какой город пришёл пророк Самуил?|To which city did the prophet Samuel come?|bethlehem|jericho,haran,egypt
Q מי היה אבא של דוד?|من كان والد داود؟|Кто был отцом Давида?|Who was David's father?|jesse|saul,jacob,noah
Q איזה בן היה דוד?|أي ابن كان داود؟|Каким по возрасту сыном был Давид?|Which son was David?|t_youngest|t_oldest,t_middle,t_only
Q איזו עבודה עשה דוד?|أي عمل عمل داود؟|Какую работу делал Давид?|What job did David have?|t_shepherd2|t_baker2,t_soldier2,t_king2
Q ממה דוד הציל את הכבשים? מאריה ומ...|ممن أنقذ داود الخراف؟ من أسد ومن...|От кого Давид спас овец? От льва и от...|What did David save the sheep from? A lion and a...|t_bear|t_dog,t_rabbit,t_snake_n
Q באיזה כלי נגינה דוד ניגן?|على أي آلة عزف داود؟|На каком инструменте играл Давид?|Which instrument did David play?|t_harp|t_drum,t_piano,t_guitar
Q מי היה המלך שאהב לשמוע את דוד מנגן?|من كان الملك الذي أحب أن يسمع داود يعزف؟|Какой царь любил слушать игру Давида?|Which king loved to hear David play?|saul|solomon,pharaoh,joshua
Q מי היה החבר הטוב של דוד?|من كان صديق داود الجيد؟|Кто был хорошим другом Давида?|Who was David's good friend?|jonathan|goliath,esau,jesse
Q איך קראו ללוחם הענק?|ماذا كان اسم المحارب العملاق؟|Как звали великана-воина?|What was the giant warrior called?|goliath|saul,jesse,laban
Q באיזה עמק עמד צבא גדול?|في أي وادٍ وقف جيش كبير؟|В какой долине стояла большая армия?|In which valley did a big army stand?|elah|jordan,sinai,jericho
Q באיזה נשק דוד זרק את האבן?|بأي سلاح رمى داود الحجر؟|Чем Давид бросил камень?|What did David throw the stone with?|t_sling|t_bow,t_spear,t_catapult
Q מה דוד לקח כדי להילחם בגלית? מקל, שק ו...|ماذا أخذ داود ليحارب جليات؟ عصا وكيسًا و...|Что Давид взял, чтобы сражаться с Голиафом? Палку, мешок и...|What did David take to fight Goliath? A stick, a bag and...|t_stones|t_sticks,t_books_n,t_shoes
Q מה קרה לגלית בסוף?|ماذا حدث لجليات في النهاية؟|Что случилось с Голиафом в конце?|What happened to Goliath in the end?|t_fell2|t_ran2,t_won2,t_slept
Q באיזו עיר דוד נהיה מלך?|في أي مدينة أصبح داود ملكًا؟|В каком городе Давид стал царём?|In which city did David become king?|jerusalem|jericho,bethel,haran
E t_youngest|t|הבן הקטן|الابن الأصغر|младший|the youngest
E t_oldest|t|הבן הגדול|الابن الأكبر|старший|the oldest
E t_middle|t|הבן האמצעי|الابن الأوسط|средний|the middle one
E t_only|t|בן יחיד|ابن وحيد|единственный|an only son
E t_shepherd2|t|רועה צאן|راعي غنم|пастух|shepherd
E t_baker2|t|אופה בשוק|خبّاز في السوق|пекарь на рынке|a baker in the market
E t_soldier2|t|חייל בצבא|جندي في الجيش|солдат в войске|a soldier in the army
E t_king2|t|מלך על העיר|ملك على المدينة|царь города|a king over the city
E t_bear|t|דוב|دب|медведя|bear
E t_dog|t|כלב|كلب|собаки|dog
E t_rabbit|t|ארנב|أرنب|кролика|rabbit
E t_snake_n|t|נחש|ثعبان|змея|snake
E t_harp|t|כינור|قيثارة|арфа|the harp
E t_drum|t|תוף|طبل|барабан|the drum
E t_piano|t|פסנתר|بيانو|пианино|the piano
E t_guitar|t|גיטרה|غيتار|гитара|the guitar
E t_sling|t|בקלע|بالمقلاع|пращой|a sling
E t_bow|t|בקשת|بالقوس|луком|a bow
E t_spear|t|ברומח|بالرمح|копьём|a spear
E t_catapult|t|בקטפולטה|بمنجنيق|катапультой|a catapult
E t_stones|t|אבנים|حجارة|камни|stones
E t_sticks|t|מקלות|عصي|палки|sticks
E t_books_n|t|ספרים|كتب|книги|books
E t_shoes|t|נעליים|أحذية|туфли|shoes
E t_fell2|t|נפל|سقط|упал|He fell
E t_ran2|t|ברח|هرب|убежал|He ran away
E t_won2|t|ניצח|انتصر|победил|He won
E t_slept|t|הלך לישון|ذهب لينام|лёг спать|He went to sleep
S s12|👑|#0c8599|שלמה המלך החכם|سليمان الملك الحكيم|Соломон, мудрый царь|King Solomon the Wise
L אחרי דוד, בנו שלמה נהיה מלך. הוא היה צעיר וביקש מאלוהים לב חכם.|بعد داود أصبح ابنه سليمان ملكًا. كان شابًا وطلب من الله قلبًا حكيمًا.|После Давида царём стал его сын Соломон. Он был молод и попросил у Бога мудрое сердце.|After David, his son Solomon became king. He was young and asked God for a wise heart.
L אלוהים שמח. הוא נתן לשלמה חכמה, והבטיח לו גם עושר וכבוד.|فرح الله. أعطى سليمان الحكمة ووعده أيضًا بالغنى والكرامة.|Бог обрадовался. Он дал Соломону мудрость и пообещал ему ещё богатство и почёт.|God was pleased. He gave Solomon wisdom and promised him riches and honor too.
L יום אחד באו שתי נשים למלך. כל אחת אמרה: "התינוק הזה שלי".|في يوم جاءت امرأتان إلى الملك. قالت كل واحدة: «هذا الطفل لي».|Однажды к царю пришли две женщины. Каждая говорила: «Этот малыш мой».|One day two women came to the king. Each one said, "This baby is mine."
L שלמה אמר: "נחלק את התינוק לשניים". אחת צעקה: "לא! תנו לה אותו!". הוא הבין שהיא האמא האמיתית.|قال سليمان: «نقسم الطفل إلى نصفين». صرخت إحداهما: «لا! أعطوها إياه!». فهم أنها الأم الحقيقية.|Соломон сказал: «Разделим малыша надвое». Одна закричала: «Нет! Отдайте его ей!». Он понял, что она настоящая мать.|Solomon said, "Let us divide the baby in two." One cried, "No! Give him to her!" He understood that she was the real mother.
L שלמה בנה בית גדול ויפה לאלוהים בירושלים, בית המקדש.|بنى سليمان بيتًا كبيرًا وجميلًا لله في أورشليم، وهو الهيكل.|Соломон построил большой красивый дом для Бога в Иерусалиме, Храм.|Solomon built a big, beautiful house for God in Jerusalem, the Temple.
L אנשים מכל העולם באו לשמוע את החכמה של שלמה. הוא כתב גם משלים, כמו "משלי".|جاء ناس من كل العالم ليسمعوا حكمة سليمان. وكتب أيضًا أمثالًا، مثل «سفر الأمثال».|Люди со всего мира приходили слушать мудрость Соломона. Он также писал притчи, например «Притчи Соломона».|People came from all over the world to hear Solomon's wisdom. He also wrote proverbs, like the Book of Proverbs.
Q מי היה אבא של שלמה?|من كان والد سليمان؟|Кто был отцом Соломона?|Who was Solomon's father?|david|saul,jacob,jesse
Q מה שלמה ביקש מאלוהים?|ماذا طلب سليمان من الله؟|Что Соломон попросил у Бога?|What did Solomon ask God for?|t_wiseheart|t_gold2,t_horse,t_army2
Q מה אלוהים נתן לשלמה?|ماذا أعطى الله لسليمان؟|Что Бог дал Соломону?|What did God give Solomon?|t_wisdom|t_gift_palace,t_gift_fields,t_gift_land
Q כמה נשים באו למלך?|كم امرأة جاءت إلى الملك؟|Сколько женщин пришло к царю?|How many women came to the king?|n2|n1,n3,n4
Q על מה הן רבו?|على ماذا تخاصمتا؟|Из-за чего они спорили?|What were they arguing about?|t_baby|t_house2,t_cake2,t_dress
Q מה שלמה הציע לעשות?|ماذا اقترح سليمان أن يفعل؟|Что предложил Соломон?|What did Solomon suggest?|t_divide|t_sol_ask,t_sol_give,t_wait
Q מי צעקה "תנו לה אותו"?|من صرخت «أعطوها إياه»؟|Кто закричала «Отдайте его ей»?|Who cried "Give him to her"?|t_realmother|t_otherwoman,t_judge,t_queen
Q איך שלמה ידע מי האמא האמיתית?|كيف عرف سليمان من هي الأم الحقيقية؟|Как Соломон узнал, кто настоящая мать?|How did Solomon know who the real mother was?|t_loved|t_guessed,t_lot,t_asked_king
Q מה שלמה בנה בירושלים?|ماذا بنى سليمان في أورشليم؟|Что Соломон построил в Иерусалиме?|What did Solomon build in Jerusalem?|t_temple|t_pyramid,t_ark2,t_tower2
Q באיזו עיר שלמה בנה את בית המקדש?|في أي مدينة بنى سليمان الهيكل؟|В каком городе Соломон построил Храм?|In which city did Solomon build the Temple?|jerusalem|jericho,bethel,haran
Q איזה ספר כתב שלמה?|أي كتاب كتب سليمان؟|Какую книгу написал Соломон?|Which book did Solomon write?|t_proverbs|t_atlas,t_cookbook,t_diary
Q מי בא לשמוע את החכמה של שלמה?|من جاء ليسمع حكمة سليمان؟|Кто приходил слушать мудрость Соломона?|Who came to hear Solomon's wisdom?|t_people|t_sol_jerusalem,t_sol_family,t_sol_palace
E t_wiseheart|t|לב חכם|قلبًا حكيمًا|мудрое сердце|a wise heart
E t_gold2|t|הרבה זהב|ذهبًا كثيرًا|много золота|a lot of gold
E t_horse|t|סוס מהיר|حصانًا سريعًا|быстрого коня|a fast horse
E t_army2|t|צבא גדול|جيشًا كبيرًا|большую армию|a big army
E t_wisdom|t|חכמה, עושר וכבוד|حكمة وغنى وكرامة|мудрость, богатство и почёт|wisdom, riches and honor
E t_boat2|t|סירה קטנה|قاربًا صغيرًا|маленькую лодку|a small boat
E t_tent2|t|אוהל|خيمة|шатёр|a tent
E t_ship_n2|t|ספינה|سفينة|корабль|a ship
E t_gift_palace|t|ארמון גדול ויפה|قصرًا كبيرًا وجميلًا|большой красивый дворец|a big beautiful palace
E t_gift_fields|t|שדות וכרמים רבים|حقولًا وكرومًا كثيرة|много полей и виноградников|many fields and vineyards
E t_gift_land|t|ארץ חדשה ורחוקה|أرضًا جديدة بعيدة|новую далёкую землю|a new faraway land
E t_baby|t|על תינוק|على طفل|из-за малыша|a baby
E t_house2|t|על בית|على بيت|из-за дома|a house
E t_cake2|t|על עוגה|على كعكة|из-за пирога|a cake
E t_dress|t|על שמלה|على فستان|из-за платья|a dress
E t_divide|t|לחלק את התינוק לשניים|أن يقسم الطفل إلى نصفين|разделить малыша надвое|to divide the baby in two
E t_sing|t|לשיר שיר|أن يغنّي أغنية|спеть песню|to sing a song
E t_run2|t|לרוץ מהר|أن يركض بسرعة|быстро бежать|to run fast
E t_wait|t|לחכות שנה ואז להחליט|أن ينتظر سنة ثم يقرر|подождать год и потом решить|to wait a year and then decide
E t_sol_ask|t|לשאול את שתי הנשים שאלות|أن يسأل المرأتين أسئلة|задать двум женщинам вопросы|to ask the two women questions
E t_sol_give|t|לתת את התינוק לאישה אחרת|أن يعطي الطفل لامرأة أخرى|отдать ребёнка другой женщине|to give the baby to another woman
E t_realmother|t|האמא האמיתית|الأم الحقيقية|настоящая мать|the real mother
E t_otherwoman|t|האישה השנייה|المرأة الأخرى|другая женщина|the other woman
E t_judge|t|השופט|القاضي|судья|the judge
E t_queen|t|המלכה|الملكة|царица|the queen
E t_loved|t|היא אהבה את התינוק ורצתה שיחיה|أحبّت الطفل وأرادته أن يعيش|она любила малыша и хотела, чтобы он жил|She loved the baby and wanted him to live
E t_guessed|t|הוא ניחש לפי הבגדים של שתי הנשים|خمّن من ملابس المرأتين الاثنتين|он угадал по одежде двух этих женщин|He guessed from the two women's clothes
E t_lot|t|הוא הגריל בין שתי הנשים עם אבנים|أجرى قرعة بين المرأتين بالحجارة|он бросил жребий между двумя женщинами|He drew lots between the two women
E t_asked_king|t|הוא שאל את המלך השכן מה לעשות|سأل الملك المجاور ماذا عليه أن يفعل|он спросил соседнего царя, что надо делать|He asked the neighboring king what to do
E t_temple|t|בית המקדש|الهيكل|Храм|the Temple
E t_pyramid|t|פירמידה|هرمًا|пирамиду|a pyramid
E t_ark2|t|תיבה|فلكًا|ковчег|an ark
E t_tower2|t|מגדל|برجًا|башню|a tower
E t_proverbs|t|משלי|سفر الأمثال|Притчи|Proverbs
E t_atlas|t|אטלס|أطلس|атлас|an atlas
E t_cookbook|t|ספר בישול|كتاب طبخ|кулинарную книгу|a cookbook
E t_diary|t|יומן|مذكرات|дневник|a diary
E t_people|t|אנשים מכל העולם|ناس من كل العالم|люди со всего мира|people from all over the world
E t_nobody2|t|אף אחד לא בא אליו|لم يأتِ إليه أحد|к нему никто не приходил|nobody came to him
E t_animals_n2|t|רק החיות של השדה|حيوانات الحقل فقط|только животные с поля|only the animals of the field
E t_sol_jerusalem|t|אנשים מירושלים בלבד|أناس من أورشليم فقط|люди только из Иерусалима|people from Jerusalem only
E t_sol_family|t|רק המשפחה של המלך|عائلة الملك فقط|только семья царя|only the king's family
E t_sol_palace|t|רק האנשים שגרו בארמון|فقط من سكنوا في القصر|только те, кто жил во дворце|only the people who lived in the palace
`;
