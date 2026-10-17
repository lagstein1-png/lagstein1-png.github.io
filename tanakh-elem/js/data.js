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
E t_gardenpalms|l|גן התמרים|جنة النخيل|Сад пальм|the Palm Garden
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
S s1|🌍|#c64c0a|בריאת העולם|خلق العالم|Сотворение мира|The Creation of the World
L בהתחלה לא היה כלום. אלוהים ברא את העולם.|في البداية لم يكن شيء. خلق الله العالم.|Сначала ничего не было. Бог создал мир.|At first there was nothing. God made the world.
L ביום הראשון אלוהים אמר: "יהי אור". והאור בא.|في اليوم الأول قال الله: «ليكن نور». فجاء النور.|В первый день Бог сказал: «Да будет свет». И пришёл свет.|On the first day God said, "Let there be light." And light came.
L ביום השני הוא עשה את השמיים. ביום השלישי הופיעו היבשה, הים והעצים.|في اليوم الثاني صنع السماء. في اليوم الثالث ظهرت اليابسة والبحر والأشجار.|На второй день Он создал небо. На третий день появились суша, море и деревья.|On the second day He made the sky. On the third day the land, the sea and the trees appeared.
L ביום הרביעי נבראו השמש, הירח והכוכבים.|في اليوم الرابع خُلقت الشمس والقمر والنجوم.|На четвёртый день появились солнце, луна и звёзды.|On the fourth day the sun, the moon and the stars were made.
L ביום החמישי נבראו דגים בים ועופות בשמיים.|في اليوم الخامس خُلقت الأسماك في البحر والطيور في السماء.|На пятый день появились рыбы в море и птицы в небе.|On the fifth day fish filled the sea and birds filled the sky.
L ביום השישי נבראו החיות, ובסוף נברא האדם הראשון.|في اليوم السادس خُلقت الحيوانات، وفي النهاية خُلق الإنسان الأول.|На шестой день появились животные, а в конце — первый человек.|On the sixth day the animals were made, and at the end the first person.
L ביום השביעי אלוהים נח. זה יום השבת.|في اليوم السابع استراح الله. هذا هو يوم السبت.|На седьмой день Бог отдыхал. Это день субботы.|On the seventh day God rested. This is Shabbat.
Q מי ברא את העולם?|من خلق العالم؟|Кто создал мир?|Who made the world?|god|adam,noah,moses
Y לפי הסיפור בתורה, בהתחלה לא היה כלום, ואלוהים ברא את כל העולם.|بحسب القصة في التوراة، في البداية لم يكن شيء، وخلق الله العالم كله.|По рассказу Торы, сначала ничего не было, и Бог создал весь мир.|In the Torah story, at first there was nothing, and God made the whole world.
Q מה נברא ביום הראשון?|ماذا خُلق في اليوم الأول؟|Что появилось в первый день?|What was made on the first day?|d_light
Y לפי הסיפור בתורה, ביום הראשון אלוהים אמר שיהיה אור, והאור בא.|بحسب القصة في التوراة، قال الله في اليوم الأول ليكن نور، فجاء النور.|По рассказу Торы, в первый день Бог сказал, чтобы был свет, и свет появился.|In the Torah story, on the first day God said there should be light, and light came.
Q מה נברא ביום השני?|ماذا خُلق في اليوم الثاني؟|Что появилось во второй день?|What was made on the second day?|d_sky
Y לפי הסיפור בתורה, האור נברא ביום הראשון, ואחריו, ביום השני, נעשו השמיים.|بحسب القصة في التوراة، خُلق النور في اليوم الأول، وبعده صُنعت السماء في اليوم الثاني.|По рассказу Торы, свет появился в первый день, а после него, на второй день, появилось небо.|In the Torah story, light came on the first day, and after it, on the second day, the sky was made.
Q מה נברא ביום השלישי?|ماذا خُلق في اليوم الثالث؟|Что появилось в третий день?|What was made on the third day?|d_landtrees
Y לפי הסיפור בתורה, ביום השלישי המים נאספו לים, הופיעה יבשה, ועליה גדלו עצים.|بحسب القصة في التوراة، في اليوم الثالث تجمّعت المياه في البحر، فظهرت اليابسة ونمت عليها الأشجار.|По рассказу Торы, на третий день воды собрались в море, появилась суша, и на ней выросли деревья.|In the Torah story, on day three the waters gathered into the sea, land appeared, and trees grew on it.
Q מה נברא ביום הרביעי?|ماذا خُلق في اليوم الرابع؟|Что появилось в четвёртый день?|What was made on the fourth day?|d_sunmoon
Y לפי הסיפור בתורה, ביום הרביעי נבראו השמש, הירח והכוכבים, שמאירים ביום ובלילה.|بحسب القصة في التوراة، في اليوم الرابع خُلقت الشمس والقمر والنجوم لتضيء في النهار والليل.|По рассказу Торы, на четвёртый день появились солнце, луна и звёзды, чтобы светить днём и ночью.|In the Torah story, on day four the sun, moon and stars were made to light the day and the night.
Q מה נברא ביום החמישי?|ماذا خُلق في اليوم الخامس؟|Что появилось в пятый день?|What was made on the fifth day?|d_fishbirds
Y לפי הסיפור בתורה, ביום החמישי נבראו מי שחיים במים ובאוויר, הדגים והעופות.|بحسب القصة في التوراة، في اليوم الخامس خُلق من يعيش في الماء والهواء، الأسماك والطيور.|По рассказу Торы, на пятый день появились жители воды и воздуха, рыбы и птицы.|In the Torah story, on day five came the creatures of the water and the air, fish and birds.
Q מה נברא ביום השישי?|ماذا خُلق في اليوم السادس؟|Что появилось в шестой день?|What was made on the sixth day?|d_animals
Y לפי הסיפור בתורה, ביום השישי נבראו החיות, ובסוף היום נברא גם האדם הראשון.|بحسب القصة في التوراة، في اليوم السادس خُلقت الحيوانات، وفي آخر اليوم خُلق الإنسان الأول.|По рассказу Торы, на шестой день появились животные, а в конце дня и первый человек.|In the Torah story, on day six the animals were made, and at the end of the day the first person.
Q באיזה יום אלוהים נח?|في أي يوم استراح الله؟|В какой по счёту день Бог отдыхал?|On which day did God rest?|n7|n6,n5,n3
Y לפי הסיפור בתורה, אחרי 6 ימים של עבודה אלוהים נח ביום השביעי.|بحسب القصة في التوراة، بعد 6 أيام من العمل استراح الله في اليوم السابع.|По рассказу Торы, после 6 дней работы Бог отдыхал на седьмой день.|In the Torah story, after 6 days of work God rested on the seventh day.
Q ביום מספר כמה נברא האור?|في اليوم رقم كم خُلق النور؟|В какой по счёту день появился свет?|On which day was the light made?|n1|n2,n3,n4
Y לפי הסיפור בתורה, האור היה הדבר הראשון שנברא, ולכן הוא נברא ביום 1.|بحسب القصة في التوراة، كان النور أول شيء خُلق، لذلك خُلق في اليوم 1.|По рассказу Торы, свет был создан самым первым, поэтому он появился в день 1.|In the Torah story, light was the very first thing made, so it came on day 1.
Q איך קוראים ליום שבו אלוהים נח?|ماذا نسمّي اليوم الذي استراح فيه الله؟|Как называется день, когда Бог отдыхал?|What is the day called when God rested?|shabbat
Y היום השביעי נקרא שבת, כי בעברית לשבות פירושו להפסיק לעבוד ולנוח.|اليوم السابع اسمه السبت، لأن كلمة شبات بالعبرية مرتبطة بالتوقف عن العمل والراحة.|Седьмой день называется субботой, ведь еврейское слово шабат связано с отдыхом от работы.|The seventh day is called Shabbat, because in Hebrew this word is linked to stopping work and resting.
Q איפה חיו הדגים שנבראו?|أين عاشت الأسماك التي خُلقت؟|Где жили созданные рыбы?|Where did the fish that were made live?|sea|sky,land,d_light
Y לפי הסיפור בתורה, הדגים נבראו בתוך הים, כי דגים חיים רק במים.|بحسب القصة في التوراة، خُلقت الأسماك في البحر، لأن الأسماك تعيش في الماء فقط.|По рассказу Торы, рыбы появились в море, ведь рыбы живут только в воде.|In the Torah story, the fish were made in the sea, because fish can live only in water.
Q איפה עפו העופות?|أين طارت الطيور؟|Где летали птицы?|Where did the birds fly?|sky|sea,land,d_light
Y לפי הסיפור בתורה, ביום החמישי נבראו עופות בשמיים, כי יש להם כנפיים לעוף.|بحسب القصة في التوراة، خُلقت الطيور في السماء في اليوم الخامس، لأن لها أجنحة تطير بها.|По рассказу Торы, птицы появились в небе на пятый день, ведь у них есть крылья.|In the Torah story, birds were made in the sky on day five, because they have wings to fly.
Q כמה ימים אלוהים עבד ואז נח ביום השביעי?|كم يومًا عمل الله ثم استراح في اليوم السابع؟|Сколько дней Бог работал, а на седьмой отдыхал?|For how many days did God work, before resting on the seventh?|n6|n7,n5,n3
Y לפי הסיפור בתורה, אלוהים עבד מהיום הראשון עד היום השישי, וזה 6 ימים.|بحسب القصة في التوراة، عمل الله من اليوم الأول حتى اليوم السادس، وهذه 6 أيام.|По рассказу Торы, Бог работал с первого по шестой день, а это 6 дней.|In the Torah story, God worked from day one to day six, which is 6 days.
S s2|🌳|#29853c|גן עדן|جنة عدن|Эдемский сад|The Garden of Eden
L אלוהים עשה גן יפה וקרא לו גן עדן.|صنع الله جنة جميلة وسماها جنة عدن.|Бог создал красивый сад и назвал его Эдем.|God made a beautiful garden and called it Eden.
L הוא שם בגן את אדם הראשון. אחר כך נבראה גם חוה.|وضع فيها آدم، الإنسان الأول. وبعد ذلك خُلقت أيضًا حواء.|Он поселил там первого человека, Адама. Потом появилась и Ева.|He put the first person, Adam, there. Later Eve was made too.
L בגן גדלו עצים עם פירות טעימים. מכל העצים אפשר היה לאכול, חוץ מעץ אחד: עץ הדעת.|نمت في الجنة أشجار ذات ثمار لذيذة. كان يمكنهما الأكل من كل الأشجار، إلا شجرة واحدة: شجرة المعرفة.|В саду росли деревья со вкусными плодами. Можно было есть с любого дерева, кроме одного: дерева познания.|Trees with tasty fruit grew in the garden. They could eat from every tree except one: the Tree of Knowledge.
L נחש דיבר אל חוה ואמר: "תאכלי מהעץ הזה". היא אכלה, וגם אדם אכל.|تكلم ثعبان مع حواء وقال: «كلي من هذه الشجرة». فأكلت، وأكل آدم أيضًا.|Змей заговорил с Евой: «Съешь плод с этого дерева». Она съела, и Адам тоже.|A snake spoke to Eve: "Eat from this tree." She ate, and Adam ate too.
L אלוהים ידע מה קרה. אדם וחוה יצאו מהגן.|عرف الله ما حدث. خرج آدم وحواء من الجنة.|Бог узнал, что случилось. Адам и Ева вышли из сада.|God knew what happened. Adam and Eve left the garden.
L הסיפור מלמד: חשוב לשמור על ההוראות ולהגיד את האמת.|تعلّمنا القصة: من المهم أن نلتزم بالتعليمات وأن نقول الحقيقة.|История учит: важно соблюдать правила и говорить правду.|The story teaches: it is important to follow instructions and tell the truth.
Q איך קוראים לגן שאלוהים עשה?|ماذا اسم الجنة التي صنعها الله؟|Как называется сад, который создал Бог?|What was the garden that God made called?|eden|t_gardenpalms,t_gardenwater,t_gardenflowers
Y לפי הסיפור בתורה, אלוהים עשה גן יפה ונתן לו את השם גן עדן.|بحسب القصة في التوراة، صنع الله جنة جميلة وسمّاها جنة عدن.|По рассказу Торы, Бог создал красивый сад и сам назвал его Эдемом.|In the Torah story, God made a beautiful garden and gave it the name Eden.
Q איך קראו לאיש הראשון?|ماذا كان اسم الإنسان الأول؟|Как звали первого человека?|What was the first person called?|t_adam_n2|t_noah_n2,t_abraham_n2,t_moses_n2
Y לפי הסיפור בתורה, אדם היה האדם הראשון בעולם, והוא גר ראשון בגן עדן.|بحسب القصة في التوراة، كان آدم أول إنسان في العالم، وكان أول من سكن جنة عدن.|По рассказу Торы, Адам был самым первым человеком и первым поселился в Эдемском саду.|In the Torah story, Adam was the very first person, and he was the first to live in the Garden of Eden.
Q איך קראו לאישה הראשונה?|ماذا كان اسم المرأة الأولى؟|Как звали первую женщину?|What was the first woman called?|eve|sarah,rebecca,rachel
Y לפי הסיפור בתורה, חוה נבראה אחרי אדם, והיא הייתה האישה הראשונה.|بحسب القصة في التوراة، خُلقت حواء بعد آدم، وكانت أول امرأة.|По рассказу Торы, Ева появилась после Адама и стала первой женщиной.|In the Torah story, Eve was made after Adam, and she was the first woman.
Q איזה בעל חיים דיבר אל חוה?|أي حيوان تكلم مع حواء؟|Какое животное говорило с Евой?|Which animal spoke to Eve?|snake|dove,lion,camel
Y לפי הסיפור בתורה, נחש דיבר אל חוה ושכנע אותה לאכול מהעץ.|بحسب القصة في التوراة، تكلّم ثعبان مع حواء وأقنعها أن تأكل من الشجرة.|По рассказу Торы, змей заговорил с Евой и уговорил её съесть плод с дерева.|In the Torah story, a snake spoke to Eve and talked her into eating from the tree.
Q מאיזה עץ אסור היה לאכול?|من أي شجرة لم يكن مسموحًا الأكل؟|С какого дерева нельзя было есть?|Which tree were they not allowed to eat from?|knowledge|fig,olive,palm
Y לפי הסיפור בתורה, מכל העצים מותר היה לאכול, ורק עץ הדעת היה אסור.|بحسب القصة في التوراة، كان الأكل مسموحًا من كل الأشجار، إلا شجرة المعرفة.|По рассказу Торы, есть можно было со всех деревьев, кроме дерева познания.|In the Torah story, they could eat from every tree, and only the Tree of Knowledge was not allowed.
Q מכמה עצים אסור היה לאכול?|من كم شجرة لم يكن مسموحًا الأكل؟|Со скольких деревьев нельзя было есть?|From how many trees were they not allowed to eat?|n1|n2,n3,n4
Y לפי הסיפור בתורה, היה רק עץ אחד שאסור לאכול ממנו, עץ הדעת.|بحسب القصة في التوراة، كانت هناك شجرة واحدة فقط ممنوع الأكل منها، شجرة المعرفة.|По рассказу Торы, запрещено было есть только с одного дерева, с дерева познания.|In the Torah story, there was only one tree they could not eat from, the Tree of Knowledge.
Q מי ידע מה קרה בגן?|من عرف ما حدث في الجنة؟|Кто узнал, что случилось в саду?|Who knew what happened in the garden?|god|noah,benjamin,pharaoh
Y לפי הסיפור בתורה, אלוהים ידע מה קרה, ולכן אדם וחוה יצאו מהגן.|بحسب القصة في التوراة، عرف الله ما حدث، لذلك خرج آدم وحواء من الجنة.|По рассказу Торы, Бог узнал, что случилось, поэтому Адам и Ева покинули сад.|In the Torah story, God knew what had happened, so Adam and Eve left the garden.
Q מי אכל מהעץ אחרי חוה?|من أكل من الشجرة بعد حواء؟|Кто съел плод после Евы?|Who ate from the tree after Eve?|t_adam_n2|t_noah_n2,t_moses_n2,t_jacob_n2
Y לפי הסיפור בתורה, חוה אכלה ראשונה מהעץ, ואחריה אכל גם אדם.|بحسب القصة في التوراة، أكلت حواء من الشجرة أولًا، وبعدها أكل آدم أيضًا.|По рассказу Торы, Ева съела плод первой, а после неё съел и Адам.|In the Torah story, Eve ate from the tree first, and after her Adam ate too.
Q מה מלמד הסיפור? חשוב לשמור על...|ماذا تعلّمنا القصة؟ من المهم أن نلتزم...|Чему учит история? Важно соблюдать...|What does the story teach? It is important to keep...|t_rules|t_games,t_sleep,t_quietclass
Y אדם וחוה לא שמרו על ההוראה של עץ הדעת, ולכן הסיפור מלמד לשמור על הוראות.|لم يلتزم آدم وحواء بالتعليمات عن شجرة المعرفة، لذلك تعلّمنا القصة أن نلتزم بالتعليمات.|Адам и Ева не соблюли правило о дереве познания, поэтому история учит соблюдать правила.|Adam and Eve did not follow the rule about the Tree of Knowledge, so the story teaches us to follow instructions.
E t_rules|t|ההוראות|التعليمات|правила|the instructions
E t_games|t|המשחקים בחצר|الألعاب في الساحة|игры во дворе|the games in the yard
E t_sleep|t|השינה בצהריים|النوم في الظهيرة|дневной сон|sleeping in the afternoon
E t_toys|t|הצעצועים|الدمى|игрушки|the toys
E t_quietclass|t|השקט בכיתה|الهدوء في الصف|тишину в классе|quiet in class
Q מה אמר הנחש לחוה לעשות?|ماذا قال الثعبان لحواء أن تفعل؟|Что змей сказал Еве сделать?|What did the snake tell Eve to do?|t_eattree|t_pickflower,t_leavegarden,t_sleepgarden
Y לפי הסיפור בתורה, הנחש אמר לחוה לאכול מהעץ היחיד שהיה אסור לאכול ממנו.|بحسب القصة في التوراة، قال الثعبان لحواء أن تأكل من الشجرة الوحيدة الممنوعة.|По рассказу Торы, змей сказал Еве съесть плод с единственного запретного дерева.|In the Torah story, the snake told Eve to eat from the one tree that was not allowed.
Q מי יצא מהגן?|من خرج من الجنة؟|Кто вышел из сада?|Who left the garden?|t_adameve|t_abrahamsarah,t_noahwife,t_isaacrebecca
Y לפי הסיפור בתורה, גם חוה וגם אדם אכלו מעץ הדעת, ולכן שניהם יצאו מהגן.|بحسب القصة في التوراة، أكل آدم وحواء كلاهما من شجرة المعرفة، لذلك خرج الاثنان من الجنة.|По рассказу Торы, и Ева, и Адам съели плод с дерева познания, поэтому оба покинули сад.|In the Torah story, Eve and Adam both ate from the Tree of Knowledge, so both of them left the garden.
E t_eattree|t|לאכול מהעץ|أن تأكل من الشجرة|съесть плод с дерева|to eat fruit from the tree
E t_sleepgarden|t|לישון בגן עד הבוקר|أن تنام في الجنة حتى الصباح|спать в саду до самого утра|to sleep in the garden until morning
E t_pickflower|t|לקטוף פרחים בגן|أن تقطف أزهارًا في الجنة|сорвать цветы в саду|to pick garden flowers
E t_leavegarden|t|לצאת מהגן אל הנהר|أن تخرج من الجنة إلى النهر|выйти из сада к реке|to go out of the garden to the river
E t_water|t|מים|مياه|вода|water
E t_snow|t|שלג|ثلج|снег|snow
E t_sand|t|חול|رمل|песок|sand
E t_cows|t|פרות|بقرات|коровы|cows
E t_dogs|t|כלבים|كلاب|собаки|dogs
E t_birds_n|t|ציפורים|طيور|птицы|birds
E t_camels|t|גמלים|جمال|верблюды|camels
S s3|🚢|#1a76c9|נוח והתיבה|نوح والفلك|Ной и ковчег|Noah and the Ark
L נוח היה איש טוב. אלוהים אמר לו: "בנה תיבה גדולה".|كان نوح رجلًا صالحًا. قال له الله: «ابنِ فلكًا كبيرًا».|Ной был хорошим человеком. Бог сказал ему: «Построй большой ковчег».|Noah was a good man. God told him, "Build a big ark."
L נוח לקח לתיבה את המשפחה שלו ובעלי חיים מכל סוג: זכר ונקבה.|أخذ نوح إلى الفلك عائلته وحيوانات من كل نوع، ذكرًا وأنثى.|Ной взял в ковчег свою семью и животных, самца и самку каждого вида.|Noah took his family into the ark, and animals, a male and a female of each kind.
L ירד גשם גדול ארבעים יום וארבעים לילה. המים כיסו את כל העולם.|نزل مطر غزير أربعين يومًا وأربعين ليلة. غطّت المياه العالم كله.|Сорок дней и сорок ночей шёл сильный дождь. Вода покрыла весь мир.|A great rain fell for forty days and forty nights. Water covered the whole world.
L התיבה צפה על המים. אחרי זמן היא נחה על הרי אררט.|طفا الفلك على الماء. وبعد مدة استقر على جبال أرارات.|Ковчег плавал по воде. Потом он остановился на горах Арарат.|The ark floated on the water. After a while it rested on the mountains of Ararat.
L נוח שלח עורב ואחר כך יונה לבדוק אם יש יבשה. היונה חזרה עם עלה של זית.|أرسل نوح غرابًا ثم حمامة ليرى إن كانت هناك يابسة. عادت الحمامة بورقة زيتون.|Ной выпустил ворона, а потом голубя, чтобы узнать, есть ли суша. Голубь вернулся с оливковым листом.|Noah sent out a raven and then a dove to see if there was dry land. The dove came back with an olive leaf.
L נוח ומשפחתו יצאו מהתיבה. בשמיים הופיעה קשת, סימן של שלום.|خرج نوح وعائلته من الفلك. ظهرت في السماء قوس قزح، علامة سلام.|Ной и его семья вышли из ковчега. В небе появилась радуга — знак мира.|Noah and his family left the ark. A rainbow appeared in the sky, a sign of peace.
Q מה אלוהים ביקש מנוח לבנות?|ماذا طلب الله من نوح أن يبني؟|Что Бог попросил Ноя построить?|What did God ask Noah to build?|t_ark|t_tower,t_house,t_wall
Y לפי הסיפור בתורה, אלוהים ביקש מנוח לבנות תיבה גדולה שתצוף על המים בזמן הגשם הגדול.|بحسب القصة في التوراة، طلب الله من نوح أن يبني فلكًا كبيرًا يطفو على الماء وقت المطر الغزير.|По рассказу Торы, Бог велел Ною построить большой ковчег, чтобы плыть по воде во время дождя.|In the Torah story, God asked Noah to build a big ark that could float on the water during the great rain.
Q כמה ימים ירד גשם גדול?|كم يومًا نزل المطر الغزير؟|Сколько дней шёл сильный дождь?|For how many days did the great rain fall?|n40|n7,n10,n12
Y לפי הסיפור בתורה, הגשם הגדול ירד 40 ימים ו-40 לילות בלי הפסקה.|بحسب القصة في التوراة، نزل المطر الغزير 40 يومًا و40 ليلة دون توقّف.|По рассказу Торы, сильный дождь шёл 40 дней и 40 ночей без перерыва.|In the Torah story, the great rain fell for 40 days and 40 nights without stopping.
Q על איזה הרים נחה התיבה?|على أي جبال استقر الفلك؟|На каких горах остановился ковчег?|On which mountains did the ark rest?|ararat|sinai,t_mtcarmel,t_mttabor
Y לפי הסיפור בתורה, כשהמים ירדו התיבה נחה על הרי אררט, כי ההרים הגבוהים יצאו מהמים ראשונים.|بحسب القصة في التوراة، عندما انخفضت المياه استقر الفلك على جبال أرارات، لأن الجبال العالية ظهرت أولًا.|По рассказу Торы, когда вода спала, ковчег остановился на горах Арарат, ведь высокие горы показались первыми.|In the Torah story, as the water went down the ark rested on Ararat, because high mountains came out first.
Q איזו ציפור חזרה עם עלה של זית?|أي طائر عاد بورقة زيتون؟|Какая птица вернулась с оливковым листом?|Which bird came back with an olive leaf?|dove|raven,lion,camel
Y לפי הסיפור בתורה, היונה חזרה עם עלה של זית, וכך נוח ידע שיש שוב עצים ויבשה.|بحسب القصة في التوراة، عادت الحمامة بورقة زيتون، فعرف نوح أن هناك أشجارًا ويابسة من جديد.|По рассказу Торы, голубь вернулся с оливковым листом, и Ной понял, что снова есть деревья и суша.|In the Torah story, the dove came back with an olive leaf, so Noah knew there were trees and land again.
Q איזו ציפור נוח שלח ראשונה?|أي طائر أرسله نوح أولًا؟|Какую птицу Ной выпустил первой?|Which bird did Noah send out first?|raven|dove,snake,ram
Y לפי הסיפור בתורה, נוח שלח קודם עורב, ורק אחר כך שלח יונה.|بحسب القصة في التوراة، أرسل نوح الغراب أولًا، وبعده فقط أرسل الحمامة.|По рассказу Торы, Ной сначала выпустил ворона, и только потом голубя.|In the Torah story, Noah sent out the raven first, and only after that the dove.
Q מי בנה תיבה?|من بنى الفلك؟|Кто построил ковчег?|Who built an ark?|noah|abraham,moses,david
Y לפי הסיפור בתורה, נוח היה איש טוב, ולכן אלוהים בחר בו לבנות את התיבה.|بحسب القصة في التوراة، كان نوح رجلًا صالحًا، لذلك اختاره الله ليبني الفلك.|По рассказу Торы, Ной был хорошим человеком, поэтому Бог выбрал его построить ковчег.|In the Torah story, Noah was a good man, so God chose him to build the ark.
Q מה הופיע בשמיים אחרי הגשם?|ماذا ظهر في السماء بعد المطر؟|Что появилось в небе после дождя?|What appeared in the sky after the rain?|t_rainbow|t_ark,t_tower,t_sunset
Y לפי הסיפור בתורה, כשנוח יצא מהתיבה הופיעה בשמיים קשת, וגם היום רואים קשת אחרי גשם.|بحسب القصة في التوراة، ظهر قوس قزح في السماء عند خروج نوح، واليوم أيضًا نراه بعد المطر.|По рассказу Торы, когда Ной вышел, в небе появилась радуга, и сегодня мы видим её после дождя.|In the Torah story, a rainbow appeared when Noah came out, and we still see rainbows after rain today.
Q כמה בעלי חיים מכל סוג נכנסו לתיבה?|كم حيوانًا من كل نوع دخل الفلك؟|Сколько животных каждого вида вошло в ковчег?|How many animals of each kind went into the ark?|n2|n1,n3,n4
Y לפי הסיפור בתורה, מכל סוג נכנסו זכר ונקבה, כלומר 2 בעלי חיים.|بحسب القصة في التوراة، دخل من كل نوع ذكر وأنثى، أي 2 من الحيوانات.|По рассказу Торы, от каждого вида вошли самец и самка, то есть 2 животных.|In the Torah story, a male and a female of each kind went in, so that is 2 animals.
Q מי נכנס לתיבה עם נוח?|من دخل الفلك مع نوح؟|Кто вошёл в ковчег вместе с Ноем?|Who went into the ark with Noah?|t_family|t_pharaoh,t_goliath,t_army
Y לפי הסיפור בתורה, נוח לקח איתו לתיבה את המשפחה שלו, כדי שכולם יינצלו יחד.|بحسب القصة في التوراة، أخذ نوح عائلته معه إلى الفلك لكي ينجوا جميعًا معًا.|По рассказу Торы, Ной взял в ковчег свою семью, чтобы все спаслись вместе.|In the Torah story, Noah took his family into the ark so they would all be saved together.
Q מאיזה עץ היה העלה שהיונה הביאה?|من أي شجرة كانت الورقة التي أحضرتها الحمامة؟|С какого дерева был лист, который принесла голубка?|Which tree did the dove's leaf come from?|olive|fig,palm,knowledge
Y לפי הסיפור בתורה, היונה הביאה עלה של זית, ועלה כזה גדל על עץ זית.|بحسب القصة في التوراة، أحضرت الحمامة ورقة زيتون، وورقة الزيتون تنمو على شجرة الزيتون.|По рассказу Торы, голубь принёс оливковый лист, а такой лист растёт на оливковом дереве.|In the Torah story, the dove brought an olive leaf, and an olive leaf grows on an olive tree.
Q מה היה הסימן לשלום?|ما كانت علامة السلام؟|Что было знаком мира?|What was the sign of peace?|t_rainbow|dove,olive,t_sunset
Y לפי הסיפור בתורה, הקשת הופיעה כשהגשם הגדול נגמר, והיא הייתה סימן של שלום.|بحسب القصة في التوراة، ظهر قوس قزح عندما انتهى المطر الغزير، وكان علامة سلام.|По рассказу Торы, радуга появилась, когда сильный дождь кончился, и стала знаком мира.|In the Torah story, the rainbow appeared when the great rain ended, as a sign of peace.
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
Y לפי הסיפור בתורה, הגשם ירד כל כך הרבה זמן עד שהמים כיסו את כל העולם.|بحسب القصة في التوراة، نزل المطر مدة طويلة جدًا حتى غطّت المياه العالم كله.|По рассказу Торы, дождь шёл так долго, что вода покрыла весь мир.|In the Torah story, the rain fell for so long that water covered the whole world.
Q כמה לילות ירד גשם גדול?|كم ليلة نزل المطر الغزير؟|Сколько ночей шёл сильный дождь?|For how many nights did the great rain fall?|n40|n4,n7,n14
Y לפי הסיפור בתורה, הגשם ירד גם ביום וגם בלילה, 40 ימים ו-40 לילות.|بحسب القصة في التوراة، نزل المطر في النهار وفي الليل، 40 يومًا و40 ليلة.|По рассказу Торы, дождь шёл и днём, и ночью, 40 дней и 40 ночей.|In the Torah story, the rain fell by day and by night, for 40 days and 40 nights.
S s4|⭐|#9c36b5|אברהם ושרה|إبراهيم وسارة|Авраам и Сара|Abraham and Sarah
L אברהם ושרה גרו בחרן. אלוהים אמר לאברהם: "לך לארץ חדשה, ואני אברך אותך".|عاش إبراهيم وسارة في حاران. قال الله لإبراهيم: «اذهب إلى أرض جديدة، وأنا أباركك».|Авраам и Сара жили в Харане. Бог сказал Аврааму: «Иди в новую землю, и Я благословлю тебя».|Abraham and Sarah lived in Haran. God said to Abraham, "Go to a new land, and I will bless you."
L אברהם יצא לדרך עם שרה, עם הצאן ועם הגמלים. הם הגיעו לארץ כנען.|انطلق إبراهيم مع سارة ومعهما الغنم والجمال. وصلوا إلى أرض كنعان.|Авраам отправился в путь с Сарой, со стадами и верблюдами. Они пришли в землю Ханаан.|Abraham set out with Sarah, his sheep and his camels. They reached the land of Canaan.
L אברהם ישב בפתח האוהל. שלושה אורחים הגיעו, והוא רץ לקבל אותם.|جلس إبراهيم عند باب الخيمة. جاء ثلاثة ضيوف، فركض لاستقبالهم.|Авраам сидел у входа в шатёр. Пришли трое гостей, и он побежал им навстречу.|Abraham sat at the door of his tent. Three guests came, and he ran to welcome them.
L הוא הביא להם מים, לחם ואוכל. כך מקבלים אורחים.|أحضر لهم ماءً وخبزًا وطعامًا. هكذا نستقبل الضيوف.|Он принёс им воды, хлеба и еды. Так принимают гостей.|He brought them water, bread and food. This is how we welcome guests.
L אלוהים הבטיח לאברהם ולשרה בן. כשאברהם היה בן מאה, נולד להם יצחק.|وعد الله إبراهيم وسارة بابن. وعندما كان إبراهيم ابن مئة سنة وُلد لهما إسحاق.|Бог пообещал Аврааму и Саре сына. Когда Аврааму было сто лет, у них родился Исаак.|God promised Abraham and Sarah a son. When Abraham was a hundred years old, Isaac was born.
L שרה צחקה משמחה. לכן קראו לבן יצחק.|ضحكت سارة من الفرح. لذلك سُمّي الابن إسحاق.|Сара засмеялась от радости. Поэтому сына назвали Исаак.|Sarah laughed with joy. That is why the boy was called Isaac.
Q מאיפה יצא אברהם לדרך?|من أين انطلق إبراهيم؟|Откуда отправился Авраам?|Where did Abraham set out from?|haran|egypt,jericho,bethlehem
Y לפי הסיפור בתורה, אברהם ושרה גרו בחרן, ומשם אברהם יצא לדרך לארץ חדשה.|بحسب القصة في التوراة، عاش إبراهيم وسارة في حاران، ومن هناك انطلق إبراهيم إلى أرض جديدة.|По рассказу Торы, Авраам и Сара жили в Харане, и оттуда Авраам отправился в новую землю.|In the Torah story, Abraham and Sarah lived in Haran, and from there Abraham set out for a new land.
Q לאיזו ארץ הגיעו אברהם ושרה?|إلى أي أرض وصل إبراهيم وسارة؟|В какую землю пришли Авраам и Сара?|To which land did Abraham and Sarah come?|canaan|egypt,midian,haran
Y לפי הסיפור בתורה, אלוהים אמר לאברהם ללכת לארץ חדשה, והארץ הזאת הייתה כנען.|بحسب القصة في التوراة، قال الله لإبراهيم أن يذهب إلى أرض جديدة، وكانت هذه الأرض كنعان.|По рассказу Торы, Бог велел Аврааму идти в новую землю, и этой землёй был Ханаан.|In the Torah story, God told Abraham to go to a new land, and that land was Canaan.
Q מי הייתה אשתו של אברהם?|من كانت زوجة إبراهيم؟|Кто была женой Авраама?|Who was Abraham's wife?|sarah|rebecca,rachel,miriam
Y לפי הסיפור בתורה, שרה הייתה אשתו של אברהם, יצאה איתו לדרך ונהייתה אמא של יצחק.|بحسب القصة في التوراة، كانت سارة زوجة إبراهيم، خرجت معه في الطريق وصارت أم إسحاق.|По рассказу Торы, Сара была женой Авраама, пошла с ним в путь и стала матерью Исаака.|In the Torah story, Sarah was Abraham's wife, set out with him, and became Isaac's mother.
Q כמה אורחים הגיעו לאוהל של אברהם?|كم ضيفًا جاء إلى خيمة إبراهيم؟|Сколько гостей пришло к шатру Авраама?|How many guests came to Abraham's tent?|n3|n1,n2,n4
Y לפי הסיפור בתורה, 3 אורחים הגיעו לאוהל של אברהם, והוא רץ לקבל את כולם.|بحسب القصة في التوراة، جاء 3 ضيوف إلى خيمة إبراهيم، فركض لاستقبالهم جميعًا.|По рассказу Торы, к шатру Авраама пришли 3 гостя, и он побежал встречать их всех.|In the Torah story, 3 guests came to Abraham's tent, and he ran to welcome all of them.
Q איפה ישב אברהם כשהאורחים הגיעו?|أين جلس إبراهيم عندما جاء الضيوف؟|Где сидел Авраам, когда пришли гости?|Where was Abraham sitting when the guests came?|t_tent|t_ark,t_tower,t_wall
Y לפי הסיפור בתורה, אברהם ישב בפתח האוהל, ולכן ראה את האורחים כשהגיעו.|بحسب القصة في التوراة، جلس إبراهيم عند باب الخيمة، لذلك رأى الضيوف عندما وصلوا.|По рассказу Торы, Авраам сидел у входа в шатёр, поэтому сразу увидел гостей.|In the Torah story, Abraham sat at the door of his tent, so he saw the guests as they arrived.
Q מה אברהם נתן לאורחים? מים, לחם ו...|ماذا أعطى إبراهيم للضيوف؟ ماءً وخبزًا و...|Что Авраам дал гостям? Воду, хлеб и...|What did Abraham give the guests? Water, bread and...|t_food|t_swords,t_books,t_newclothes
Y לפי הסיפור בתורה, אברהם הביא לאורחים מים, לחם ואוכל, כי אורחים צריכים לאכול ולשתות.|بحسب القصة في التوراة، أحضر إبراهيم للضيوف ماءً وخبزًا وطعامًا، لأن الضيف يحتاج أن يأكل ويشرب.|По рассказу Торы, Авраам принёс гостям воду, хлеб и еду, ведь гостям нужно поесть и попить.|In the Torah story, Abraham brought the guests water, bread and food, because guests need to eat and drink.
Q איזה בן נולד לאברהם ולשרה?|أي ابن وُلد لإبراهيم وسارة؟|Какой сын родился у Авраама и Сары?|Which son was born to Abraham and Sarah?|isaac|jacob,esau,joseph
Y לפי הסיפור בתורה, אלוהים הבטיח לאברהם ולשרה בן, וכשנולד קראו לו יצחק.|بحسب القصة في التوراة، وعد الله إبراهيم وسارة بابن، وعندما وُلد سمّياه إسحاق.|По рассказу Торы, Бог пообещал Аврааму и Саре сына, и когда он родился, его назвали Исаак.|In the Torah story, God promised Abraham and Sarah a son, and when he was born they named him Isaac.
Q בן כמה היה אברהם כשנולד יצחק?|كم كان عمر إبراهيم عندما وُلد إسحاق؟|Сколько лет было Аврааму, когда родился Исаак?|How old was Abraham when Isaac was born?|n100|n120,n90,n40
Y לפי הסיפור בתורה, אברהם היה זקן מאוד כשנולד יצחק, בן 100 שנה.|بحسب القصة في التوراة، كان إبراهيم كبيرًا جدًا في السن عندما وُلد إسحاق، ابن 100 سنة.|По рассказу Торы, Авраам был очень старым, когда родился Исаак, ему было 100 лет.|In the Torah story, Abraham was very old when Isaac was born, 100 years old.
Q מה עשתה שרה כשקיבלה את הבשורה?|ماذا فعلت سارة عندما سمعت الخبر؟|Что сделала Сара, когда услышала новость?|What did Sarah do when she heard the news?|t_laugh|t_cry,t_run,t_sleptf
Y לפי הסיפור בתורה, שרה צחקה משמחה, ולכן קראו לבן יצחק, מהמילה צחוק.|بحسب القصة في التوراة، ضحكت سارة من الفرح، لذلك سُمّي الابن إسحاق، واسمه بالعبرية قريب من كلمة ضحك.|По рассказу Торы, Сара засмеялась от радости, и сына назвали Исаак, что на иврите связано со смехом.|In the Torah story, Sarah laughed with joy, so the boy was named Isaac, a Hebrew name linked to laughter.
Q מה אלוהים הבטיח לאברהם?|ماذا وعد الله إبراهيم؟|Что Бог обещал Аврааму?|What did God promise Abraham?|t_son|t_boat,t_castle,t_gold
Y לפי הסיפור בתורה, לאברהם ולשרה לא היו ילדים, ואלוהים הבטיח להם בן.|بحسب القصة في التوراة، لم يكن لإبراهيم وسارة أولاد، فوعدهما الله بابن.|По рассказу Торы, у Авраама и Сары не было детей, и Бог пообещал им сына.|In the Torah story, Abraham and Sarah had no children, and God promised them a son.
Q איזו מצווה קיים אברהם כששלושת האנשים באו לאוהל?|أي وصية طبّق إبراهيم عندما جاء الرجال الثلاثة إلى الخيمة؟|Какую заповедь исполнил Авраам, когда трое пришли к шатру?|Which good deed did Abraham do when the three men came to his tent?|t_guests|t_wars,t_trade,t_hunt
Y לפי הסיפור בתורה, אברהם רץ לקבל את האורחים והגיש להם אוכל, וזו הכנסת אורחים.|بحسب القصة في التوراة، ركض إبراهيم لاستقبال الضيوف وقدّم لهم الطعام، وهذا هو استقبال الضيوف.|По рассказу Торы, Авраам побежал встречать гостей и накормил их, а это и есть гостеприимство.|In the Torah story, Abraham ran to greet the guests and gave them food, and that is welcoming guests.
Q איזו חיה הלכה עם אברהם בדרך?|أي حيوان سار مع إبراهيم في الطريق؟|Какое животное шло с Авраамом в пути?|Which animal walked with Abraham on the journey?|camel|whale,frogs,lion
Y לפי הסיפור בתורה, אברהם יצא לדרך עם הצאן ועם הגמלים, ולכן גמל הלך איתו.|بحسب القصة في التوراة، انطلق إبراهيم مع الغنم والجمال، لذلك مشى معه جمل.|По рассказу Торы, Авраам отправился в путь со стадами и верблюдами, поэтому с ним шёл верблюд.|In the Torah story, Abraham set out with his sheep and his camels, so a camel walked with him.
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
Y לפי הסיפור בתורה, יצחק ורבקה היו זוג, ולהם נולדו התאומים עשיו ויעקב.|بحسب القصة في التوراة، كان إسحاق ورفقة زوجين، ووُلد لهما التوأمان عيسو ويعقوب.|По рассказу Торы, Исаак и Ревекка были мужем и женой, и у них родились близнецы Исав и Иаков.|In the Torah story, Isaac and Rebecca were husband and wife, and their twins were Esau and Jacob.
Q מי אהב לצוד?|من أحب الصيد؟|Кто любил охотиться?|Who loved to hunt?|esau|jacob,isaac,laban
Y לפי הסיפור בתורה, עשיו אהב לצאת לשדה ולצוד, ויעקב אהב לשבת באוהל.|بحسب القصة في التوراة، أحبّ عيسو الخروج إلى الحقل والصيد، وأحبّ يعقوب الجلوس في الخيمة.|По рассказу Торы, Исав любил ходить в поле и охотиться, а Иаков любил сидеть в шатре.|In the Torah story, Esau loved going out to the fields to hunt, while Jacob liked to stay in the tent.
Q מה יעקב בישל לעשיו?|ماذا طبخ يعقوب لعيسو؟|Что Иаков сварил Исаву?|What did Jacob cook for Esau?|t_lentils|t_fish,t_eggs,t_cake
Y לפי הסיפור בתורה, עשיו חזר רעב, ויעקב בישל מרק עדשים שעשיו אכל.|بحسب القصة في التوراة، عاد عيسو جائعًا، فطبخ يعقوب شوربة عدس أكلها عيسو.|По рассказу Торы, Исав вернулся голодным, и Иаков сварил чечевичную похлёбку, которую Исав съел.|In the Torah story, Esau came home hungry, and Jacob cooked lentil soup that Esau ate.
Q לאן יעקב הלך?|إلى أين ذهب يعقوب؟|Куда пошёл Иаков?|Where did Jacob go?|haran|egypt,jericho,midian
Y לפי הסיפור בתורה, עשיו כעס, ויעקב הלך רחוק לחרן, למקום שבו גר הדוד שלו לבן.|بحسب القصة في التوراة، غضب عيسو، فذهب يعقوب بعيدًا إلى حاران حيث كان يسكن خاله لابان.|По рассказу Торы, Исав рассердился, и Иаков ушёл далеко в Харан, где жил его дядя Лаван.|In the Torah story, Esau was angry, so Jacob went far away to Haran, where his uncle Laban lived.
Q אצל מי יעקב עבד בחרן?|عند من عمل يعقوب في حاران؟|У кого Иаков работал в Харане?|Whom did Jacob work for in Haran?|laban|esau,pharaoh,jethro
Y לפי הסיפור בתורה, בחרן גר הדוד של יעקב, לבן, ויעקב עבד אצלו שנים רבות.|بحسب القصة في التوراة، كان لابان خال يعقوب يسكن في حاران، فعمل يعقوب عنده سنوات كثيرة.|По рассказу Торы, в Харане жил дядя Иакова Лаван, и Иаков много лет работал у него.|In the Torah story, Jacob's uncle Laban lived in Haran, and Jacob worked for him for many years.
Q על מה יעקב ישן בדרך?|على ماذا نام يعقوب في الطريق؟|На чём спал Иаков по дороге?|What did Jacob sleep on during the journey?|t_stone|t_bed,t_boat,t_grass
Y לפי הסיפור בתורה, יעקב היה בדרך ולא היה לו בית, ולכן נרדם על אבן.|بحسب القصة في التوراة، كان يعقوب في الطريق بلا بيت، لذلك نام على حجر.|По рассказу Торы, Иаков был в дороге без дома, поэтому уснул прямо на камне.|In the Torah story, Jacob was on the road with no house, so he fell asleep on a stone.
Q מה יעקב חלם?|ماذا حلم يعقوب؟|Что приснилось Иакову?|What did Jacob dream about?|t_ladder|t_boat,t_bigbird,t_castle
Y לפי הסיפור בתורה, כשיעקב ישן על האבן, הוא חלם על סולם שמגיע עד השמיים.|بحسب القصة في التوراة، عندما نام يعقوب على الحجر حلم بسُلّم يصل إلى السماء.|По рассказу Торы, когда Иаков спал на камне, ему приснилась лестница до самого неба.|In the Torah story, while Jacob slept on the stone, he dreamed of a ladder reaching the sky.
Q מי עלה וירד בסולם?|من صعد ونزل على السُّلّم؟|Кто поднимался и спускался по лестнице?|Who went up and down the ladder?|t_angels|t_camels,t_soldiers,t_children
Y לפי הסיפור בתורה, בחלום של יעקב מלאכים עלו וירדו בסולם בין הארץ לשמיים.|بحسب القصة في التوراة، في حلم يعقوب كانت الملائكة تصعد وتنزل على السُّلّم بين الأرض والسماء.|По рассказу Торы, во сне Иакова ангелы поднимались и спускались по лестнице между землёй и небом.|In the Torah story, in Jacob's dream angels went up and down the ladder between earth and sky.
Q איך יעקב קרא למקום שבו חלם?|ماذا سمّى يعقوب المكان الذي حلم فيه؟|Как Иаков назвал место, где ему приснился сон?|What did Jacob call the place where he dreamed?|bethel|jericho,sinai,eden
Y לפי הסיפור בתורה, יעקב קרא למקום בית אל, שפירושו בית של אלוהים, כי שם חלם את החלום.|بحسب القصة في التوراة، سمّى يعقوب المكان بيت إيل، ومعناه بيت الله، لأنه رأى الحلم هناك.|По рассказу Торы, Иаков назвал место Вефиль, что значит дом Бога, ведь там ему приснился сон.|In the Torah story, Jacob named the place Bethel, which means house of God, because he had his dream there.
Q איזו אישה אהב יעקב ועבד בשבילה?|أي امرأة أحبها يعقوب وعمل من أجلها؟|Какую женщину любил Иаков и работал ради неё?|Which woman did Jacob love and work for?|rachel|sarah,rebecca,eve
Y לפי הסיפור בתורה, יעקב אהב את רחל, ולכן עבד אצל אבא שלה לבן כדי להתחתן איתה.|بحسب القصة في التوراة، أحبّ يعقوب راحيل، لذلك عمل عند أبيها لابان ليتزوّجها.|По рассказу Торы, Иаков любил Рахиль, поэтому работал у её отца Лавана, чтобы жениться на ней.|In the Torah story, Jacob loved Rachel, so he worked for her father Laban to marry her.
Q מה קרה בסוף בין יעקב לעשיו?|ماذا حدث في النهاية بين يعقوب وعيسو؟|Что случилось в конце между Иаковом и Исавом?|What happened in the end between Jacob and Esau?|t_peace|t_war,t_race,t_game
Y לפי הסיפור בתורה, אחרי שנים רבות יעקב חזר הביתה, והוא ועשיו התפייסו ועשו שלום.|بحسب القصة في التوراة، بعد سنوات كثيرة عاد يعقوب إلى البيت، وتصالح هو وعيسو.|По рассказу Торы, через много лет Иаков вернулся домой, и они с Исавом помирились.|In the Torah story, after many years Jacob came home, and he and Esau made peace.
Q כמה אחים תאומים נולדו ליצחק ורבקה?|كم ابنًا توأمًا وُلد لإسحاق ورفقة؟|Сколько близнецов родилось у Исаака и Ревекки?|How many twin sons were born to Isaac and Rebecca?|n2|n1,n3,n4
Y לפי הסיפור בתורה, עשיו ויעקב נולדו יחד, תאומים, ולכן היו 2 אחים.|بحسب القصة في التوراة، وُلد عيسو ويعقوب معًا توأمين، لذلك كان عددهما 2.|По рассказу Торы, Исав и Иаков родились вместе, близнецами, поэтому братьев было 2.|In the Torah story, Esau and Jacob were born together as twins, so there were 2 brothers.
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
S s6|🌈|#0b7f92|יוסף ואחיו|يوسف وإخوته|Иосиф и его братья|Joseph and His Brothers
L ליעקב היו שנים עשר בנים. הוא אהב במיוחד את יוסף ונתן לו כתונת צבעונית.|كان ليعقوب اثنا عشر ابنًا. أحبّ يوسف كثيرًا وأعطاه قميصًا ملوّنًا.|У Иакова было двенадцать сыновей. Особенно он любил Иосифа и подарил ему разноцветную рубашку.|Jacob had twelve sons. He loved Joseph most and gave him a colorful coat.
L יוסף חלם חלומות, והאחים כעסו עליו. יום אחד הם לקחו אותו ומכרו אותו לסוחרים.|حلم يوسف أحلامًا، فغضب إخوته منه. وفي يوم أخذوه وباعوه لتجار.|Иосиф видел сны, и братья на него рассердились. Однажды они схватили его и продали торговцам.|Joseph had dreams, and his brothers got angry. One day they took him and sold him to traders.
L הסוחרים לקחו את יוסף למצרים. שם הוא עבד בבית של איש גדול, ואחר כך נכנס לבית הסוהר.|أخذ التجار يوسف إلى مصر. هناك عمل في بيت رجل كبير، ثم دخل السجن.|Торговцы увезли Иосифа в Египет. Там он работал в доме важного человека, а потом попал в тюрьму.|The traders took Joseph to Egypt. There he worked in a great man's house, and later went to prison.
L בבית הסוהר יוסף פתר חלומות. פרעה חלם על שבע פרות שמנות ושבע פרות רזות.|في السجن فسّر يوسف الأحلام. حلم فرعون بسبع بقرات سمينة وسبع بقرات هزيلة.|В тюрьме Иосиф разгадывал сны. Фараону приснились семь тучных коров и семь тощих.|In prison Joseph explained dreams. Pharaoh dreamed of seven fat cows and seven thin cows.
L יוסף אמר: "יהיו שבע שנים טובות ואחריהן שבע שנים של רעב". פרעה עשה אותו לשליט.|قال يوسف: «ستأتي سبع سنوات جيدة تتبعها سبع سنوات جوع». فجعله فرعون حاكمًا.|Иосиф сказал: «Будет семь хороших лет, а за ними семь лет голода». Фараон сделал его правителем.|Joseph said, "There will be seven good years, then seven years of hunger." Pharaoh made him a ruler.
L יוסף אסף אוכל בשנים הטובות. כשבא הרעב, אנשים רבים באו אליו לקנות אוכל.|جمع يوسف الطعام في السنوات الجيدة. وعندما جاء الجوع، جاء ناس كثيرون ليشتروا منه الطعام.|Иосиф запасал еду в хорошие годы. Когда пришёл голод, много людей пришло к нему за едой.|Joseph stored food in the good years. When the hunger came, many people came to him to buy food.
L גם האחים של יוסף באו ממדינה אחרת. הם לא הכירו אותו, אבל הוא הכיר אותם.|جاء إخوة يوسف أيضًا من بلد آخر. لم يعرفوه، لكنه عرفهم.|Братья Иосифа тоже пришли из другой страны. Они его не узнали, а он узнал их.|Joseph's brothers also came from another land. They did not recognize him, but he recognized them.
L יוסף סלח להם. הוא אמר: "אל תפחדו". כל המשפחה עברה לגור במצרים.|سامحهم يوسف. قال: «لا تخافوا». وانتقلت العائلة كلها لتسكن في مصر.|Иосиф простил их. Он сказал: «Не бойтесь». Вся семья переехала жить в Египет.|Joseph forgave them. He said, "Do not be afraid." The whole family moved to live in Egypt.
Q כמה בנים היו ליעקב?|كم ابنًا كان ليعقوب؟|Сколько сыновей было у Иакова?|How many sons did Jacob have?|n12|n7,n10,n40
Y לפי הסיפור בתורה, ליעקב היו 12 בנים, ומכל בן יצא שבט אחד של בני ישראל.|بحسب القصة في التوراة، كان ليعقوب 12 ابنًا، ومن كل ابن جاء سبط واحد من بني إسرائيل.|По рассказу Торы, у Иакова было 12 сыновей, и от каждого пошло одно из колен Израиля.|In the Torah story, Jacob had 12 sons, and each son became the father of one tribe of Israel.
Q מה יעקב נתן ליוסף?|ماذا أعطى يعقوب ليوسف؟|Что Иаков подарил Иосифу?|What did Jacob give Joseph?|t_coat|t_ring,t_sword,t_crown
Y לפי הסיפור בתורה, יעקב אהב במיוחד את יוסף, ולכן נתן לו כתונת צבעונית.|بحسب القصة في التوراة، أحبّ يعقوب يوسف كثيرًا، لذلك أعطاه قميصًا ملوّنًا.|По рассказу Торы, Иаков особенно любил Иосифа, поэтому подарил ему разноцветную рубашку.|In the Torah story, Jacob loved Joseph most, so he gave him a colorful coat.
Q מי קנה את יוסף מהאחים?|من اشترى يوسف من إخوته؟|Кто купил Иосифа у братьев?|Who bought Joseph from his brothers?|t_traders|t_soldiers,t_angels,t_children
Y לפי הסיפור בתורה, האחים מכרו את יוסף לסוחרים שעברו בדרך, והם לקחו אותו למצרים.|بحسب القصة في التوراة، باع الإخوة يوسف لتجار مرّوا في الطريق، فأخذوه إلى مصر.|По рассказу Торы, братья продали Иосифа проезжим торговцам, и те увезли его в Египет.|In the Torah story, the brothers sold Joseph to traders passing by, and they took him to Egypt.
Q לאיזו מדינה הובא יוסף?|إلى أي بلد أُحضر يوسف؟|В какую страну привезли Иосифа?|Which country was Joseph taken to?|egypt|canaan,midian,haran
Y לפי הסיפור בתורה, הסוחרים היו בדרך למצרים, ולכן לקחו את יוסף לשם.|بحسب القصة في التوراة، كان التجار في طريقهم إلى مصر، لذلك أخذوا يوسف إلى هناك.|По рассказу Торы, торговцы шли в Египет, поэтому туда они и увезли Иосифа.|In the Torah story, the traders were on their way to Egypt, so that is where they took Joseph.
Q איפה יוסף היה אחרי שעבד בבית?|أين كان يوسف بعد أن عمل في البيت؟|Где оказался Иосиф после работы в доме?|Where was Joseph after he worked in the house?|t_prison|t_garden,t_school,t_ship
Y לפי הסיפור בתורה, יוסף עבד בבית של איש גדול במצרים, ואחר כך הכניסו אותו לבית הסוהר.|بحسب القصة في التوراة، عمل يوسف في بيت رجل كبير في مصر، ثم أُدخل السجن.|По рассказу Торы, Иосиф работал в доме важного человека в Египте, а потом попал в тюрьму.|In the Torah story, Joseph worked in an important man's house in Egypt, and later he was put in prison.
Q מי חלם על פרות?|من حلم ببقرات؟|Кому приснились коровы?|Who dreamed about cows?|pharaoh|jacob,saul,moses
Y לפי הסיפור בתורה, פרעה, מלך מצרים, חלם על פרות שמנות ופרות רזות.|بحسب القصة في التوراة، حلم فرعون، ملك مصر، ببقرات سمينة وبقرات هزيلة.|По рассказу Торы, фараону, царю Египта, приснились тучные и тощие коровы.|In the Torah story, Pharaoh, the king of Egypt, dreamed of fat cows and thin cows.
Q כמה פרות שמנות היו בחלום?|كم بقرة سمينة كانت في الحلم؟|Сколько тучных коров было во сне?|How many fat cows were in the dream?|n7|n3,n12,n40
Y לפי הסיפור בתורה, בחלום היו 7 פרות שמנות, והן היו סימן ל-7 שנים טובות.|بحسب القصة في التوراة، كانت في الحلم 7 بقرات سمينة، وكانت علامة على 7 سنوات جيدة.|По рассказу Торы, во сне было 7 тучных коров, и они означали 7 хороших лет.|In the Torah story, the dream had 7 fat cows, and they stood for 7 good years.
Q מה היו שבע הפרות הרזות?|ماذا كانت البقرات السبع الهزيلة؟|Что означали семь тощих коров?|What did the seven thin cows mean?|t_hunger|t_party,t_war,t_rain
Y לפי הסיפור בתורה, פרה רזה היא פרה שלא אכלה מספיק, ולכן יוסף אמר שהן שנים של רעב.|بحسب القصة في التوراة، البقرة الهزيلة لم تأكل كفاية، لذلك قال يوسف إنها سنوات جوع.|По рассказу Торы, тощая корова мало ела, поэтому Иосиф сказал, что это годы голода.|In the Torah story, a thin cow has not eaten enough, so Joseph said they meant years of hunger.
Q מי פתר את החלום של פרעה?|من فسّر حلم فرعون؟|Кто разгадал сон фараона?|Who explained Pharaoh's dream?|joseph|benjamin,judah,aaron
Y לפי הסיפור בתורה, יוסף פתר חלומות כבר בבית הסוהר, ולכן הביאו אותו לפרעה.|بحسب القصة في التوراة، كان يوسف يفسّر الأحلام وهو في السجن، لذلك أحضروه إلى فرعون.|По рассказу Торы, Иосиф разгадывал сны ещё в тюрьме, поэтому его привели к фараону.|In the Torah story, Joseph already explained dreams in prison, so he was brought to Pharaoh.
Q מה יוסף עשה בשנים הטובות?|ماذا فعل يوسف في السنوات الجيدة؟|Что Иосиф делал в хорошие годы?|What did Joseph do in the good years?|t_storefood|t_trade2,t_travel,t_playgames
Y לפי הסיפור בתורה, יוסף ידע שיבוא רעב, ולכן אסף אוכל כשהיה הרבה.|بحسب القصة في التوراة، عرف يوسف أن الجوع سيأتي، لذلك جمع الطعام عندما كان كثيرًا.|По рассказу Торы, Иосиф знал, что придёт голод, поэтому запасал еду, когда её было много.|In the Torah story, Joseph knew hunger was coming, so he stored food while there was plenty.
Q מי קיבל את יוסף למשרה גדולה?|من عيّن يوسف في منصب كبير؟|Кто назначил Иосифа на высокую должность?|Who gave Joseph a big job?|pharaoh|esau,laban,jethro
Y לפי הסיפור בתורה, הפתרון של יוסף מצא חן בעיני פרעה, ולכן פרעה עשה אותו לשליט.|بحسب القصة في التوراة، أعجب فرعون بتفسير يوسف، لذلك جعله حاكمًا.|По рассказу Торы, фараону понравилось толкование Иосифа, поэтому он сделал его правителем.|In the Torah story, Pharaoh liked how Joseph explained his dream, so he made him a ruler.
Q כשבאו האחים, מי הכיר את מי?|عندما جاء الإخوة، من عرف من؟|Когда пришли братья, кто кого узнал?|When the brothers came, who recognized whom?|t_joseph_knew|t_brothers_knew,t_nobody,t_pharaoh_knew
Y לפי הסיפור בתורה, יוסף גדל והשתנה במצרים, ולכן האחים לא הכירו אותו, אבל הוא הכיר אותם.|بحسب القصة في التوراة، كبر يوسف وتغيّر في مصر، لذلك لم يعرفه إخوته، لكنه عرفهم.|По рассказу Торы, Иосиф вырос и изменился, поэтому братья его не узнали, а он их узнал.|In the Torah story, Joseph had grown up and changed, so his brothers did not know him, but he knew them.
Q מה יוסף עשה לאחים בסוף?|ماذا فعل يوسف بإخوته في النهاية؟|Что Иосиф сделал с братьями в конце?|What did Joseph do for his brothers in the end?|t_forgave|t_punished,t_ignored,t_sold
Y לפי הסיפור בתורה, יוסף לא נקם באחים, אלא אמר להם לא לפחד וסלח להם.|بحسب القصة في التوراة، لم ينتقم يوسف من إخوته، بل قال لهم لا تخافوا وسامحهم.|По рассказу Торы, Иосиф не стал мстить братьям, а сказал им не бояться и простил их.|In the Torah story, Joseph did not take revenge, he told his brothers not to be afraid and forgave them.
Q לאן עברה המשפחה לגור?|إلى أين انتقلت العائلة لتسكن؟|Куда переехала жить семья?|Where did the family move to live?|egypt|jericho,sinai,bethel
Y לפי הסיפור בתורה, יוסף שלט במצרים והיה שם אוכל, ולכן כל המשפחה עברה לגור שם.|بحسب القصة في التوراة، كان يوسف حاكمًا في مصر وكان فيها طعام، لذلك انتقلت العائلة كلها إليها.|По рассказу Торы, Иосиф правил в Египте и там была еда, поэтому вся семья переехала туда.|In the Torah story, Joseph ruled in Egypt and there was food there, so the whole family moved there.
Q מי כעס על יוסף בגלל החלומות?|من غضب على يوسف بسبب الأحلام؟|Кто рассердился на Иосифа из-за снов?|Who was angry with Joseph because of his dreams?|t_brothers|t_pharaoh,t_traders,t_angels
Y לפי הסיפור בתורה, יוסף סיפר את החלומות שלו לאחים, והם כעסו עליו.|بحسب القصة في التوراة، حكى يوسف أحلامه لإخوته، فغضبوا منه.|По рассказу Торы, Иосиф рассказывал свои сны братьям, и они на него сердились.|In the Torah story, Joseph told his dreams to his brothers, and they got angry with him.
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
Y לפי הסיפור בתורה, פרעה חלם על פרות, 7 שמנות ו-7 רזות.|بحسب القصة في التوراة، حلم فرعون بالبقرات، 7 سمينة و7 هزيلة.|По рассказу Торы, фараону приснились коровы, 7 тучных и 7 тощих.|In the Torah story, Pharaoh dreamed of cows, 7 fat ones and 7 thin ones.
S s7|🔥|#c64c0a|משה והסנה|موسى والعليقة|Моисей и куст|Moses and the Burning Bush
L במצרים נולדו הרבה ילדים בני ישראל. פרעה פחד, והוא קבע חוקים קשים.|وُلد في مصر أولاد كثيرون من بني إسرائيل. خاف فرعون ووضع قوانين قاسية.|В Египте родилось много детей Израиля. Фараон испугался и издал суровые законы.|Many Israelite children were born in Egypt. Pharaoh was afraid, and he made harsh laws.
L אמא של משה שמה אותו בתיבה קטנה על נהר היאור. אחותו מרים שמרה עליו מרחוק.|وضعت أم موسى ابنها في سلة صغيرة على نهر النيل. وراقبته أخته مريم من بعيد.|Мать Моисея положила его в маленькую корзину на реке Нил. Его сестра Мариам смотрела издалека.|Moses' mother put him in a small basket on the Nile. His sister Miriam watched from far away.
L בת של פרעה מצאה את התינוק ולקחה אותו לארמון. משה גדל במצרים.|وجدت ابنة فرعون الطفل وأخذته إلى القصر. كبر موسى في مصر.|Дочь фараона нашла малыша и взяла его во дворец. Моисей вырос в Египте.|Pharaoh's daughter found the baby and took him to the palace. Moses grew up in Egypt.
L כשהתבגר, משה ברח למדין. שם הוא התחתן ועבד כרועה צאן אצל יתרו.|عندما كبر، هرب موسى إلى مديان. هناك تزوج وعمل راعيَ غنم عند يثرون.|Когда Моисей вырос, он убежал в Мадиам. Там он женился и пас овец у Иофора.|When Moses grew up he ran away to Midian. There he married and worked as a shepherd for Jethro.
L יום אחד משה ראה סנה בוער, אבל הסנה לא נשרף. הוא התקרב לראות.|في يوم رأى موسى عليقة تشتعل لكنها لا تحترق. اقترب ليرى.|Однажды Моисей увидел горящий куст, который не сгорал. Он подошёл поближе.|One day Moses saw a bush that burned but was not burned up. He came closer to look.
L אלוהים קרא לו מתוך הסנה: "משה, לך אל פרעה. שחרר את עמי". משה פחד, ואלוהים אמר: "אהרן אחיך יעזור לך".|ناداه الله من العليقة: «موسى، اذهب إلى فرعون. أطلق شعبي». خاف موسى، فقال الله: «أخوك هارون سيساعدك».|Бог позвал его из куста: «Моисей, иди к фараону. Отпусти Мой народ». Моисей испугался, и Бог сказал: «Твой брат Аарон поможет тебе».|God called to him from the bush: "Moses, go to Pharaoh. Let my people go." Moses was afraid, and God said, "Your brother Aaron will help you."
Q איפה פרעה שלט?|أين حكم فرعون؟|Где правил фараон?|Where did Pharaoh rule?|egypt|canaan,midian,jericho
Y פרעה הוא התואר של מלך מצרים, ולכן הוא שלט במצרים.|فرعون هو لقب ملك مصر، لذلك حكم مصر.|Фараоном называли царя Египта, поэтому он правил именно Египтом.|Pharaoh was the title of the king of Egypt, so Egypt is where he ruled.
Q באיזה נהר צפה התינוק משה?|على أي نهر طفا الطفل موسى؟|На какой реке плыл маленький Моисей?|On which river did baby Moses float?|nile|jordan,sea,redsea
Y לפי הסיפור בתורה, משה נולד במצרים, והנהר הגדול של מצרים הוא נהר היאור.|بحسب القصة في التوراة، وُلد موسى في مصر، والنهر الكبير في مصر هو نهر النيل.|По рассказу Торы, Моисей родился в Египте, а главная река Египта называется Нил.|In the Torah story, Moses was born in Egypt, and the big river of Egypt is the Nile.
Q במה שמה אמא את משה?|ماذا وضعت أم موسى فيه ابنها؟|Во что мать положила Моисея?|What did Moses' mother put him in?|t_basket|t_bed,t_boat,t_castle
Y לפי הסיפור בתורה, אמא של משה שמה אותו בתיבה קטנה, כדי שיצוף בשלום על המים.|بحسب القصة في التوراة، وضعت أم موسى ابنها في سلة صغيرة لكي يطفو بأمان على الماء.|По рассказу Торы, мать положила Моисея в маленькую корзину, чтобы он спокойно плыл по воде.|In the Torah story, Moses' mother put him in a small basket so he could float safely on the water.
Q מי שמרה על משה מרחוק?|من راقبت موسى من بعيد؟|Кто издалека смотрел за Моисеем?|Who watched Moses from far away?|miriam|sarah,rachel,rebecca
Y לפי הסיפור בתורה, מרים הייתה אחותו של משה, והיא שמרה עליו מרחוק כשצף על הנהר.|بحسب القصة في التوراة، كانت مريم أخت موسى، وراقبته من بعيد وهو يطفو على النهر.|По рассказу Торы, Мариам была сестрой Моисея и смотрела за ним издалека, пока он плыл по реке.|In the Torah story, Miriam was Moses' sister, and she watched him from far away as he floated on the river.
Q מי מצאה את התינוק?|من وجدت الطفل؟|Кто нашёл малыша?|Who found the baby?|t_pharaohdaughter|t_rachel_n,t_sarah_n,t_eve_n
Y לפי הסיפור בתורה, בת פרעה מצאה את התינוק בנהר, ולכן משה גדל בארמון.|بحسب القصة في التوراة، وجدت ابنة فرعون الطفل في النهر، لذلك كبر موسى في القصر.|По рассказу Торы, дочь фараона нашла малыша в реке, поэтому Моисей вырос во дворце.|In the Torah story, Pharaoh's daughter found the baby in the river, which is why Moses grew up in the palace.
Q לאן משה ברח כשהתבגר?|إلى أين هرب موسى عندما كبر؟|Куда убежал Моисей, когда вырос?|Where did Moses run to when he grew up?|midian|egypt,canaan,jericho
Y לפי הסיפור בתורה, כשמשה התבגר הוא ברח ממצרים למדין, ושם התחתן.|بحسب القصة في التوراة، عندما كبر موسى هرب من مصر إلى مديان، وهناك تزوّج.|По рассказу Торы, когда Моисей вырос, он убежал из Египта в Мадиам и там женился.|In the Torah story, when Moses grew up he ran away from Egypt to Midian, and married there.
Q איזו עבודה עשה משה במדין?|أي عمل عمل موسى في مديان؟|Какую работу делал Моисей в Мадиаме?|What job did Moses do in Midian?|t_shepherd|t_baker,t_soldier,t_king
Y לפי הסיפור בתורה, במדין משה שמר על הצאן של יתרו, וזו העבודה של רועה צאן.|بحسب القصة في التوراة، رعى موسى في مديان غنم يثرون، وهذا هو عمل راعي الغنم.|По рассказу Торы, в Мадиаме Моисей пас овец Иофора, а это работа пастуха.|In the Torah story, in Midian Moses looked after Jethro's sheep, which is a shepherd's job.
Q אצל מי עבד משה?|عند من عمل موسى؟|У кого работал Моисей?|Who did Moses work for?|jethro|laban,pharaoh,jacob
Y לפי הסיפור בתורה, משה התחתן במדין ועבד אצל יתרו, ושמר על הצאן שלו.|بحسب القصة في التوراة، تزوّج موسى في مديان وعمل عند يثرون يرعى غنمه.|По рассказу Торы, Моисей женился в Мадиаме и работал у Иофора, пас его овец.|In the Torah story, Moses married in Midian and worked for Jethro, looking after his sheep.
Q מה בער ולא נשרף?|ما الذي اشتعل ولم يحترق؟|Что горело и не сгорало?|What burned but was not burned up?|t_bush|t_tree_n,t_house,t_ark
Y לפי הסיפור בתורה, משה ראה סנה, שהוא שיח קוצים, בוער באש אבל לא נשרף.|بحسب القصة في التوراة، رأى موسى عليقة، وهي شجيرة شوك، تشتعل بالنار لكنها لا تحترق.|По рассказу Торы, Моисей увидел колючий куст, который горел огнём, но не сгорал.|In the Torah story, Moses saw a thorn bush that burned with fire but was not burned up.
Q מי קרא למשה מתוך הסנה?|من نادى موسى من العليقة؟|Кто позвал Моисея из куста?|Who called Moses from the bush?|god|aaron,david,joshua
Y לפי הסיפור בתורה, אלוהים קרא למשה מתוך הסנה ושלח אותו אל פרעה.|بحسب القصة في التوراة، نادى الله موسى من العليقة وأرسله إلى فرعون.|По рассказу Торы, Бог позвал Моисея из куста и послал его к фараону.|In the Torah story, God called to Moses from the bush and sent him to Pharaoh.
Q את מי ביקש משה מפרעה לשחרר?|من طلب موسى من فرعون أن يطلق سراحهم؟|Кого Моисей просил фараона отпустить?|Whom did Moses ask Pharaoh to set free?|t_israelites|t_pharaoh,t_animals_n,t_soldiers
Y לפי הסיפור בתורה, בני ישראל סבלו מחוקים קשים במצרים, ומשה ביקש מפרעה לשחרר אותם.|بحسب القصة في التوراة، عانى بنو إسرائيل من قوانين قاسية في مصر، فطلب موسى من فرعون أن يطلقهم.|По рассказу Торы, народ Израиля страдал от суровых законов в Египте, и Моисей просил его отпустить.|In the Torah story, the Israelites suffered under harsh laws in Egypt, so Moses asked Pharaoh to let them go.
Q מי עזר למשה?|من ساعد موسى؟|Кто помогал Моисею?|Who helped Moses?|aaron|esau,saul,laban
Y לפי הסיפור בתורה, משה פחד ללכת לבד, ואלוהים אמר שאהרן אחיו יעזור לו.|بحسب القصة في التوراة، خاف موسى أن يذهب وحده، فقال الله إن أخاه هارون سيساعده.|По рассказу Торы, Моисей боялся идти один, и Бог сказал, что брат Аарон ему поможет.|In the Torah story, Moses was afraid to go alone, and God said his brother Aaron would help him.
Q מה היה השם של אחות משה?|ما اسم أخت موسى؟|Как звали сестру Моисея?|What was Moses' sister's name?|miriam|sarah,rachel,eve
Y לפי הסיפור בתורה, מרים הייתה האחות ששמרה על משה התינוק כשצף על הנהר.|بحسب القصة في التوراة، كانت مريم الأخت التي حرست موسى الرضيع وهو يطفو على النهر.|По рассказу Торы, Мариам была той сестрой, что охраняла малыша Моисея на реке.|In the Torah story, Miriam was the sister who watched over baby Moses on the river.
E t_basket|t|תיבה|سلة|корзину|a basket
E t_pharaohdaughter|t|בת פרעה|ابنة فرعون|дочь фараона|Pharaoh's daughter
E t_rachel_n|t|רחל אשת יעקב|راحيل زوجة يعقوب|Рахиль, жена Иакова|Rachel, Jacob's wife
E t_sarah_n|t|שרה אשת אברהם|سارة زوجة إبراهيم|Сара, жена Авраама|Sarah, Abraham's wife
E t_eve_n|t|חוה מגן עדן|حواء من جنة عدن|Ева из Эдемского сада|Eve from the Garden of Eden
E t_adam_n2|t|אדם הראשון|آدم|Адам|Adam from the garden
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
S s8|🌊|#1a76c9|יציאת מצרים|الخروج من مصر|Исход из Египта|Leaving Egypt
L פרעה לא רצה לשחרר את בני ישראל. אלוהים שלח עשר מכות, ואחת מהן הייתה צפרדעים.|لم يرد فرعون أن يطلق بني إسرائيل. أرسل الله عشر ضربات، وكانت إحداها الضفادع.|Фараон не хотел отпускать Израиль. Бог послал десять казней, одной из них были лягушки.|Pharaoh did not want to let the Israelites go. God sent ten plagues, and one of them was frogs.
L בסוף פרעה אמר: "לכו!". בני ישראל אפו לחם בלי זמן להתפח. זה המצה.|في النهاية قال فرعون: «اذهبوا!». خبز بنو إسرائيل خبزًا دون وقت لينتفخ. هذه هي المصّة.|В конце фараон сказал: «Идите!». Израиль испёк хлеб, не дожидаясь, пока он поднимется. Это маца.|At last Pharaoh said, "Go!" The Israelites baked bread with no time to rise. This is matzah.
L משה והעם יצאו ממצרים. אהרן ומרים הלכו איתם.|خرج موسى والشعب من مصر. وذهب معهم هارون ومريم.|Моисей и народ вышли из Египта. С ними шли Аарон и Мариам.|Moses and the people left Egypt. Aaron and Miriam went with them.
L פרעה התחרט ורדף אחריהם עם צבא. בני ישראל הגיעו לים סוף ולא היה להם לאן ללכת.|ندم فرعون وطاردهم بجيش. وصل بنو إسرائيل إلى بحر القلزم ولم يكن لهم مكان يذهبون إليه.|Фараон передумал и погнался за ними с армией. Израиль дошёл до Красного моря, и идти было некуда.|Pharaoh changed his mind and chased them with an army. The Israelites reached the Red Sea with nowhere to go.
L משה הרים את המטה שלו. הים נפתח, ובני ישראל עברו ביבשה בין שני קירות מים.|رفع موسى عصاه. انفتح البحر، وعبر بنو إسرائيل على اليابسة بين جدارين من الماء.|Моисей поднял свой посох. Море расступилось, и Израиль прошёл по суше между двумя стенами воды.|Moses raised his staff. The sea opened, and the Israelites walked on dry land between two walls of water.
L אחר כך המים חזרו, והצבא של פרעה לא הגיע אליהם. מרים שרה ורקדה בתוף.|ثم عادت المياه، ولم يصل جيش فرعون إليهم. غنّت مريم ورقصت بالدف.|Потом вода сомкнулась, и армия фараона не смогла дойти до них. Мариам пела и танцевала с бубном.|Then the water came back, and Pharaoh's army could not reach them. Miriam sang and danced with a drum.
L בכל שנה אנחנו זוכרים את היציאה ממצרים בחג פסח.|كل سنة نتذكّر الخروج من مصر في عيد الفصح.|Каждый год мы вспоминаем исход из Египта в праздник Песах.|Every year we remember leaving Egypt on the holiday of Passover.
Q כמה מכות שלח אלוהים למצרים?|كم ضربة أرسل الله إلى مصر؟|Сколько казней Бог послал Египту?|How many plagues did God send to Egypt?|n10|n3,n7,n12
Y לפי הסיפור בתורה, פרעה סירב שוב ושוב, ולכן נשלחו 10 מכות, אחת אחרי השנייה.|بحسب القصة في التوراة، رفض فرعون مرة بعد مرة، لذلك أُرسلت 10 ضربات، واحدة بعد الأخرى.|По рассказу Торы, фараон снова и снова отказывал, поэтому пришли 10 казней, одна за другой.|In the Torah story, Pharaoh said no again and again, so 10 plagues came, one after another.
Q איזה בעלי חיים היו באחת המכות?|أي حيوانات كانت في إحدى الضربات؟|Какие животные были в одной из казней?|Which animals were in one of the plagues?|frogs|sheep,t_camels,t_birds_n
Y לפי הסיפור בתורה, באחת מעשר המכות צפרדעים מילאו את כל מצרים.|بحسب القصة في التوراة، في إحدى الضربات العشر ملأت الضفادع مصر كلها.|По рассказу Торы, в одной из десяти казней лягушки заполнили весь Египет.|In the Torah story, in one of the ten plagues frogs filled all of Egypt.
Q איזה לחם בני ישראל אפו כשיצאו?|أي خبز خبز بنو إسرائيل عندما خرجوا؟|Какой хлеб испёк Израиль, когда уходил?|What bread did the Israelites bake when they left?|t_matzah|t_cake_n,t_pita,t_bagel
Y לפי הסיפור בתורה, בני ישראל מיהרו לצאת, והבצק לא הספיק לתפוח, וכך נוצרה מצה.|بحسب القصة في التوراة، استعجل بنو إسرائيل الخروج ولم يلحق العجين أن ينتفخ، فصار فطيرًا.|По рассказу Торы, народ Израиля спешил, и тесто не успело подняться, так получилась маца.|In the Torah story, the Israelites were in a hurry and the dough had no time to rise, so it became matzah.
Q מי הוביל את בני ישראל ממצרים?|من قاد بني إسرائيل من مصر؟|Кто вёл Израиль из Египта?|Who led the Israelites out of Egypt?|moses|joshua,david,abraham
Y לפי הסיפור בתורה, אלוהים שלח את משה אל פרעה, ומשה הוא שהוביל את העם החוצה ממצרים.|بحسب القصة في التوراة، أرسل الله موسى إلى فرعون، وموسى هو الذي قاد الشعب خارج مصر.|По рассказу Торы, Бог послал Моисея к фараону, и именно Моисей вывел народ из Египта.|In the Torah story, God sent Moses to Pharaoh, and Moses was the one who led the people out of Egypt.
Q איזה ים עמד לפני בני ישראל?|أي بحر وقف أمام بني إسرائيل؟|Какое море оказалось перед Израилем?|Which sea stood in front of the Israelites?|redsea|nile,jordan,t_seagalilee
Y לפי הסיפור בתורה, בני ישראל ברחו מצבא פרעה והגיעו לים סוף, ושם נעצרו.|بحسب القصة في التوراة، هرب بنو إسرائيل من جيش فرعون ووصلوا إلى بحر القلزم، وهناك توقّفوا.|По рассказу Торы, народ Израиля бежал от армии фараона и остановился у Красного моря.|In the Torah story, the Israelites ran from Pharaoh's army and came to the Red Sea, where they had to stop.
Q מי רדף אחרי בני ישראל?|من طارد بني إسرائيل؟|Кто гнался за Израилем?|Who chased the Israelites?|pharaoh|laban,saul,esau
Y לפי הסיפור בתורה, פרעה התחרט ששחרר את בני ישראל, ולכן רדף אחריהם עם צבא.|بحسب القصة في التوراة، ندم فرعون على إطلاق بني إسرائيل، لذلك طاردهم بجيش.|По рассказу Торы, фараон пожалел, что отпустил народ Израиля, и погнался за ним с армией.|In the Torah story, Pharaoh was sorry he let the Israelites go, so he chased them with an army.
Q מה משה הרים כדי שהים ייפתח?|ماذا رفع موسى ليفتح البحر؟|Что поднял Моисей, чтобы море расступилось?|What did Moses raise so the sea would open?|t_staff|t_sword,t_torch,t_flag
Y לפי הסיפור בתורה, משה הרים את המטה שלו מעל הים, ואז הים נפתח.|بحسب القصة في التوراة، رفع موسى عصاه فوق البحر، وعندها انفتح البحر.|По рассказу Торы, Моисей поднял свой посох над морем, и тогда море расступилось.|In the Torah story, Moses raised his staff over the sea, and then the sea opened.
Q איך בני ישראל עברו בים?|كيف عبر بنو إسرائيل البحر؟|Как Израиль прошёл по морю?|How did the Israelites cross the sea?|t_dryland|t_ship_n,t_swimming,t_bridge
Y לפי הסיפור בתורה, המים נפתחו לשני הצדדים, ולכן נשארה באמצע דרך יבשה.|بحسب القصة في التوراة، انشقّت المياه إلى الجانبين، فبقي في الوسط طريق يابس.|По рассказу Торы, вода разошлась в две стороны, и посередине осталась сухая дорога.|In the Torah story, the water split to both sides, so a dry path was left in the middle.
Q מי ניגנה בתוף ורקדה?|من قرعت الدف ورقصت؟|Кто играла на бубне и танцевала?|Who played the drum and danced?|miriam|sarah,rebecca,rahab
Y לפי הסיפור בתורה, אחרי שעברו את הים, מרים שמחה, שרה ורקדה עם תוף.|بحسب القصة في التوراة، بعد عبور البحر فرحت مريم، فغنّت ورقصت بالدف.|По рассказу Торы, после перехода через море Мариам радовалась, пела и танцевала с бубном.|In the Torah story, after they crossed the sea, Miriam was happy and sang and danced with a drum.
Q באיזה חג אנחנו זוכרים את יציאת מצרים?|في أي عيد نتذكّر الخروج من مصر؟|В какой праздник мы вспоминаем исход из Египта?|On which holiday do we remember leaving Egypt?|pesach|purim,sukkot,shabbat
Y בפסח אוכלים מצה ומספרים את סיפור היציאה ממצרים, ולכן זה החג שבו זוכרים אותה.|في عيد الفصح يأكلون الفطير ويروون قصة الخروج من مصر، لذلك هو العيد الذي نتذكّرها فيه.|На Песах едят мацу и рассказывают об исходе из Египта, поэтому это праздник памяти исхода.|On Passover people eat matzah and retell the story of leaving Egypt, so it is the holiday that remembers it.
Q מי הלך עם משה? אהרן ו...|من ذهب مع موسى؟ هارون و...|Кто шёл с Моисеем? Аарон и...|Who went with Moses? Aaron and...|miriam|sarah,rachel,eve
Y לפי הסיפור בתורה, אהרן ומרים היו האחים של משה, ושניהם יצאו איתו ממצרים.|بحسب القصة في التوراة، كان هارون ومريم أخوي موسى، وخرج الاثنان معه من مصر.|По рассказу Торы, Аарон и Мариам были братом и сестрой Моисея и оба вышли с ним из Египта.|In the Torah story, Aaron and Miriam were Moses' brother and sister, and both left Egypt with him.
Q מה קרה לצבא פרעה?|ماذا حدث لجيش فرعون؟|Что случилось с армией фараона?|What happened to Pharaoh's army?|t_didntreach|t_won,t_crossed,t_wentback
Y לפי הסיפור בתורה, אחרי שבני ישראל עברו, המים חזרו למקומם והצבא לא הגיע אליהם.|بحسب القصة في التوراة، بعد أن عبر بنو إسرائيل عادت المياه إلى مكانها، فلم يصل الجيش إليهم.|По рассказу Торы, когда народ Израиля прошёл, вода вернулась, и армия не смогла до него дойти.|In the Torah story, after the Israelites crossed the water came back, so the army could not reach them.
Q למה בני ישראל לא הספיקו לחכות לבצק?|لماذا لم يستطع بنو إسرائيل انتظار العجين؟|Почему Израиль не мог ждать, пока тесто поднимется?|Why couldn't the Israelites wait for the dough to rise?|t_hurry|t_sleepy,t_hungry,t_cold
Y לפי הסיפור בתורה, פרעה אמר פתאום לכו, ובני ישראל יצאו מהר לפני שישנה את דעתו.|بحسب القصة في التوراة، قال فرعون فجأة اذهبوا، فخرج بنو إسرائيل بسرعة قبل أن يغيّر رأيه.|По рассказу Торы, фараон вдруг велел уходить, и народ Израиля спешил, пока он не передумал.|In the Torah story, Pharaoh suddenly told them to go, so the Israelites left fast before he changed his mind.
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
Y לפי הסיפור בתורה, אחרי המכות פרעה הבין שאין ברירה, ובסוף אמר לבני ישראל לכו.|بحسب القصة في التوراة، بعد الضربات فهم فرعون أنه لا خيار له، وفي النهاية قال لبني إسرائيل اذهبوا.|По рассказу Торы, после казней фараон понял, что выбора нет, и в конце велел народу уходить.|In the Torah story, after the plagues Pharaoh saw he had no choice, and at last told the Israelites to go.
S s9|📜|#9c36b5|עשרת הדיברות|الوصايا العشر|Десять заповедей|The Ten Commandments
L אחרי שלושה חודשים בני ישראל הגיעו למדבר ולהר סיני. העם חנה למרגלות ההר.|بعد ثلاثة أشهر وصل بنو إسرائيل إلى الصحراء وإلى جبل سيناء. أقام الشعب عند سفح الجبل.|Через три месяца Израиль пришёл в пустыню к горе Синай. Народ встал лагерем у подножия горы.|After three months the Israelites reached the desert and Mount Sinai. The people camped at the foot of the mountain.
L משה עלה אל ההר, ואלוהים נתן לו עשרת הדיברות על שני לוחות אבן.|صعد موسى إلى الجبل، وأعطاه الله الوصايا العشر على لوحين من الحجر.|Моисей поднялся на гору, и Бог дал ему десять заповедей на двух каменных скрижалях.|Moses went up the mountain, and God gave him the Ten Commandments on two stone tablets.
L הדיברות אומרים: כבד את אבא ואמא, אל תגנוב, אל תשקר, ושמור על יום השבת.|تقول الوصايا: أكرم أباك وأمك، لا تسرق، لا تكذب، واحفظ يوم السبت.|Заповеди говорят: почитай отца и мать, не кради, не лги и соблюдай субботу.|The commandments say: honor your father and mother, do not steal, do not lie, and keep Shabbat.
L משה היה על ההר ארבעים יום. העם חיכה למטה, ובני ישראל חגגו את קבלת התורה.|بقي موسى على الجبل أربعين يومًا. انتظر الشعب في الأسفل، واحتفل بنو إسرائيل بتلقّي التوراة.|Моисей был на горе сорок дней. Народ ждал внизу, и Израиль праздновал получение Торы.|Moses was on the mountain for forty days. The people waited below, and the Israelites celebrated receiving the Torah.
L אחר כך בני ישראל הלכו במדבר ארבעים שנה. אלוהים נתן להם מים, ואוכל שנקרא מן.|بعد ذلك مشى بنو إسرائيل في الصحراء أربعين سنة. أعطاهم الله ماءً وطعامًا اسمه المنّ.|Потом Израиль сорок лет шёл по пустыне. Бог дал им воду и еду, которая называлась манна.|Then the Israelites walked in the desert for forty years. God gave them water and food called manna.
L בחג שבועות אנחנו זוכרים את מתן תורה.|في عيد الأسابيع نتذكّر إعطاء التوراة.|В праздник Шавуот мы вспоминаем дарование Торы.|On the holiday of Shavuot we remember the giving of the Torah.
Q לאיזה הר הגיעו בני ישראל?|إلى أي جبل وصل بنو إسرائيل؟|К какой горе пришёл Израиль?|Which mountain did the Israelites reach?|sinai|ararat,jericho,bethel
Y לפי הסיפור בתורה, 3 חודשים אחרי היציאה ממצרים, בני ישראל הגיעו למדבר ולהר סיני.|بحسب القصة في التوراة، بعد 3 أشهر من الخروج من مصر وصل بنو إسرائيل إلى الصحراء وجبل سيناء.|По рассказу Торы, через 3 месяца после исхода из Египта народ Израиля пришёл к горе Синай.|In the Torah story, 3 months after leaving Egypt, the Israelites reached the desert and Mount Sinai.
Q מי עלה אל ההר?|من صعد إلى الجبل؟|Кто поднялся на гору?|Who went up the mountain?|moses|aaron,joshua,david
Y לפי הסיפור בתורה, העם חיכה למרגלות ההר, ורק משה עלה למעלה.|بحسب القصة في التوراة، انتظر الشعب عند سفح الجبل، وموسى وحده صعد إلى الأعلى.|По рассказу Торы, народ ждал у подножия горы, и только Моисей поднялся наверх.|In the Torah story, the people waited at the foot of the mountain, and only Moses went up.
Q על מה נכתבו עשרת הדיברות?|على ماذا كُتبت الوصايا العشر؟|На чём были написаны десять заповедей?|What were the Ten Commandments written on?|t_tablets|t_paper,t_wall_n,t_clothes
Y לפי הסיפור בתורה, אלוהים נתן למשה את הדיברות כתובים על 2 לוחות אבן, ומשה הוריד אותם מההר.|بحسب القصة في التوراة، أعطى الله موسى الوصايا مكتوبة على لوحين من الحجر، فأنزلهما من الجبل.|По рассказу Торы, Бог дал Моисею заповеди на 2 каменных скрижалях, и тот спустил их с горы.|In the Torah story, God gave Moses the commandments written on 2 stone tablets, which he carried down.
Q כמה לוחות נתן אלוהים למשה?|كم لوحًا أعطى الله لموسى؟|Сколько скрижалей Бог дал Моисею?|How many tablets did God give Moses?|n2|n1,n3,n4
Y לפי הסיפור בתורה, משה ירד מההר כשבידיו זוג לוחות אבן, כלומר 2 לוחות.|بحسب القصة في التوراة، نزل موسى من الجبل وفي يديه زوج من الألواح الحجرية، أي 2 من الألواح.|По рассказу Торы, Моисей спустился с горы с парой каменных скрижалей, то есть с 2 скрижалями.|In the Torah story, Moses came down the mountain holding a pair of stone tablets, that is 2 tablets.
Q כמה דיברות יש?|كم وصية هناك؟|Сколько заповедей?|How many commandments are there?|n10|n3,n7,n12
Y השם עשרת הדיברות כבר אומר את המספר, יש 10 דיברות.|الاسم الوصايا العشر يقول العدد بنفسه، فهناك 10 وصايا.|Само название десять заповедей уже говорит число, их 10.|The name Ten Commandments already tells the number, there are 10 of them.
Q כמה ימים משה היה על ההר?|كم يومًا بقي موسى على الجبل؟|Сколько дней Моисей был на горе?|How many days was Moses on the mountain?|n40|n7,n10,n12
Y לפי הסיפור בתורה, משה נשאר על ההר 40 ימים, והעם חיכה לו למטה כל הזמן הזה.|بحسب القصة في التوراة، بقي موسى على الجبل 40 يومًا، وانتظره الشعب في الأسفل طوال هذا الوقت.|По рассказу Торы, Моисей пробыл на горе 40 дней, и всё это время народ ждал его внизу.|In the Torah story, Moses stayed on the mountain for 40 days, and the people waited below all that time.
Q כמה שנים הלכו בני ישראל במדבר?|كم سنة مشى بنو إسرائيل في الصحراء؟|Сколько лет Израиль шёл по пустыне?|How many years did the Israelites walk in the desert?|n40|n10,n70,n100
Y לפי הסיפור בתורה, אחרי הר סיני בני ישראל הלכו במדבר 40 שנה עד שהגיעו לארץ.|بحسب القصة في التوراة، بعد جبل سيناء مشى بنو إسرائيل في الصحراء 40 سنة حتى وصلوا إلى البلاد.|По рассказу Торы, после горы Синай народ Израиля шёл по пустыне 40 лет, пока не дошёл до своей земли.|In the Torah story, after Mount Sinai the Israelites walked in the desert for 40 years before reaching the land.
Q איך קראו לאוכל שאלוהים נתן במדבר?|ماذا سُمّي الطعام الذي أعطاه الله في الصحراء؟|Как называлась еда, которую Бог дал в пустыне?|What was the food God gave in the desert called?|t_manna|t_pizza,t_soup,t_cake_n
Y לפי הסיפור בתורה, במדבר לא היה מה לאכול, ואלוהים נתן לבני ישראל אוכל שנקרא מן.|بحسب القصة في التوراة، لم يكن في الصحراء طعام، فأعطى الله بني إسرائيل طعامًا اسمه المنّ.|По рассказу Торы, в пустыне не было еды, и Бог дал народу Израиля пищу под названием манна.|In the Torah story, there was no food in the desert, so God gave the Israelites food called manna.
Q מה אומרת מצווה אחת מהעשרת הדיברות?|ماذا تقول إحدى الوصايا العشر؟|Что говорит одна из десяти заповедей?|What does one of the Ten Commandments say?|t_honorparents|t_cmd_early,t_cmd_water,t_cmd_gift
Y לפי הסיפור בתורה, כבד את אבא ואמא הוא אחד מעשרת הדיברות, יחד עם לא לגנוב ולא לשקר.|بحسب القصة في التوراة، أكرم أباك وأمك واحدة من الوصايا العشر، مع لا تسرق ولا تكذب.|По рассказу Торы, почитать отца и мать велит одна из десяти заповедей, как и не красть и не лгать.|In the Torah story, honoring your father and mother is one of the Ten Commandments, with do not steal and do not lie.
Q איזה יום מיוחד הדיברות מזכירים?|أي يوم مميز تذكّره الوصايا؟|Какой особый день упоминают заповеди?|Which special day do the commandments mention?|shabbat|purim,pesach,sukkot
Y לפי הסיפור בתורה, אחת מעשרת הדיברות אומרת לשמור על יום השבת, היום השביעי של המנוחה.|بحسب القصة في التوراة، إحدى الوصايا العشر تقول احفظ يوم السبت، اليوم السابع للراحة.|По рассказу Торы, одна из десяти заповедей велит соблюдать субботу, седьмой день отдыха.|In the Torah story, one of the Ten Commandments says to keep Shabbat, the seventh day of rest.
Q באיזה חג אנחנו זוכרים את מתן תורה?|في أي عيد نتذكّر إعطاء التوراة؟|В какой праздник мы вспоминаем дарование Торы?|On which holiday do we remember the giving of the Torah?|shavuot|purim,pesach,sukkot
Y בחג שבועות זוכרים את היום שבו בני ישראל קיבלו את התורה בהר סיני.|في عيد الأسابيع يتذكّر اليهود اليوم الذي تلقّى فيه بنو إسرائيل التوراة عند جبل سيناء.|В праздник Шавуот вспоминают день, когда народ Израиля получил Тору у горы Синай.|On Shavuot people remember the day the Israelites received the Torah at Mount Sinai.
Q איפה העם חיכה כשמשה היה על ההר?|أين انتظر الشعب بينما كان موسى على الجبل؟|Где ждал народ, пока Моисей был на горе?|Where did the people wait while Moses was on the mountain?|t_foot|t_top,t_egypt_n,t_sea_n
Y לפי הסיפור בתורה, רק משה עלה להר, ולכן כל העם נשאר למטה, למרגלות ההר.|بحسب القصة في التوراة، صعد موسى وحده إلى الجبل، لذلك بقي كل الشعب في الأسفل عند سفح الجبل.|По рассказу Торы, на гору поднялся только Моисей, поэтому весь народ остался внизу, у подножия.|In the Torah story, only Moses went up the mountain, so all the people stayed below, at its foot.
Q מי נתן את הדיברות למשה?|من أعطى الوصايا لموسى؟|Кто дал Моисею заповеди?|Who gave the commandments to Moses?|god|abraham,jethro,aaron
Y לפי הסיפור בתורה, משה עלה להר סיני, ושם אלוהים נתן לו את עשרת הדיברות.|بحسب القصة في التوراة، صعد موسى إلى جبل سيناء، وهناك أعطاه الله الوصايا العشر.|По рассказу Торы, Моисей поднялся на гору Синай, и там Бог дал ему десять заповедей.|In the Torah story, Moses went up Mount Sinai, and there God gave him the Ten Commandments.
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
S s10|🏺|#29853c|יהושע וחומת יריחו|يشوع وسور أريحا|Иисус Навин и стены Иерихона|Joshua and the Walls of Jericho
L אחרי משה, יהושע הוביל את בני ישראל. הם עברו את נהר הירדן ונכנסו לארץ כנען.|بعد موسى قاد يشوع بني إسرائيل. عبروا نهر الأردن ودخلوا أرض كنعان.|После Моисея Израиль вёл Иисус Навин. Они перешли реку Иордан и вошли в землю Ханаан.|After Moses, Joshua led the Israelites. They crossed the Jordan River and entered the land of Canaan.
L יהושע שלח שני אנשים לבדוק את העיר יריחו. רחב עזרה להם והחביאה אותם.|أرسل يشوع رجلين ليستطلعا مدينة أريحا. ساعدتهما راحاب وأخفتهما.|Иисус Навин послал двух человек осмотреть город Иерихон. Раав помогла им и спрятала их.|Joshua sent two men to look at the city of Jericho. Rahab helped them and hid them.
L לעיר יריחו הייתה חומה גבוהה. אלוהים אמר ליהושע מה לעשות.|كان لمدينة أريحا سور عالٍ. قال الله ليشوع ماذا يفعل.|У города Иерихон была высокая стена. Бог сказал Иисусу Навину, что делать.|The city of Jericho had a high wall. God told Joshua what to do.
L שישה ימים הלכו סביב העיר פעם אחת בכל יום, עם שופרות. ביום השביעי הלכו שבע פעמים.|لمدة ستة أيام داروا حول المدينة مرة واحدة كل يوم، ومعهم أبواق. وفي اليوم السابع داروا سبع مرات.|Шесть дней они обходили город по разу в день, с шофарами. На седьмой день они обошли его семь раз.|For six days they walked around the city once each day, with shofars. On the seventh day they walked around it seven times.
L אז כולם צעקו ותקעו בשופרות, והחומה נפלה.|ثم صرخ الجميع ونفخوا في الأبواق، فسقط السور.|Тогда все закричали и затрубили в шофары, и стена упала.|Then everyone shouted and blew the shofars, and the wall fell.
L רחב ומשפחתה נשארו בשלום, כי היא עזרה לשני האנשים.|بقيت راحاب وعائلتها بسلام، لأنها ساعدت الرجلين.|Раав и её семья остались целы, потому что она помогла двум людям.|Rahab and her family stayed safe, because she helped the two men.
Q מי הוביל את בני ישראל אחרי משה?|من قاد بني إسرائيل بعد موسى؟|Кто вёл Израиль после Моисея?|Who led the Israelites after Moses?|joshua|aaron,benjamin,samuel
Y המקרא מספר שאחרי מות משה, יהושע היה המנהיג החדש של בני ישראל.|يروي التناخ أن يشوع صار القائد الجديد لبني إسرائيل بعد موت موسى.|В Танахе рассказывается, что после смерти Моисея народ Израиля повёл Иисус Навин.|The Tanakh tells that after Moses died, Joshua became the new leader of the Israelites.
Q איזה נהר עברו בני ישראל?|أي نهر عبر بنو إسرائيل؟|Какую реку перешёл Израиль?|Which river did the Israelites cross?|jordan|nile,redsea,sea
Y המקרא מספר שבני ישראל עברו את נהר הירדן, כי הוא היה בדרך שלהם לארץ כנען.|يروي التناخ أن بني إسرائيل عبروا نهر الأردن، لأنه كان في طريقهم إلى أرض كنعان.|В Танахе рассказывается, что народ Израиля перешёл Иордан, ведь река была на пути в Ханаан.|The Tanakh tells that the Israelites crossed the Jordan River, because it lay on their way into Canaan.
Q לאיזו ארץ נכנסו בני ישראל?|إلى أي أرض دخل بنو إسرائيل؟|В какую землю вошёл Израиль?|Which land did the Israelites enter?|canaan|egypt,midian,haran
Y המקרא מספר שאחרי שעברו את הירדן, בני ישראל נכנסו לכנען, הארץ שאליה הגיע אברהם הרבה שנים קודם.|يروي التناخ أن بني إسرائيل دخلوا كنعان بعد عبور الأردن، وهي الأرض التي وصل إليها إبراهيم قبل سنوات كثيرة.|В Танахе рассказывается, что за Иорданом народ Израиля вошёл в Ханаан, куда давно пришёл Авраам.|The Tanakh tells that after the Jordan the Israelites entered Canaan, the land Abraham had come to long before.
Q איזו עיר הייתה לה חומה גבוהה?|أي مدينة كان لها سور عالٍ؟|У какого города была высокая стена?|Which city had a high wall?|jericho|bethlehem,jerusalem,haran
Y המקרא מספר שלעיר יריחו הייתה חומה גבוהה, ובני ישראל הקיפו אותה 7 ימים.|يروي التناخ أن مدينة أريحا كان لها سور عالٍ، ودار حولها بنو إسرائيل 7 أيام.|В Танахе рассказывается, что у Иерихона была высокая стена, и 7 дней народ Израиля ходил вокруг.|The Tanakh tells that Jericho had a high wall, and the Israelites walked around it for 7 days.
Q מי עזרה לשני האנשים והחביאה אותם?|من ساعدت الرجلين وأخفتهما؟|Кто помогла двум мужчинам и спрятала их?|Who helped the two men and hid them?|rahab|rachel,sarah,miriam
Y המקרא מספר שרחב גרה ביריחו, והחביאה בבית שלה את שני האנשים של יהושע.|يروي التناخ أن راحاب كانت تسكن في أريحا، وأخفت في بيتها رجلَي يشوع.|В Танахе рассказывается, что Раав жила в Иерихоне и спрятала у себя двух посланцев Иисуса Навина.|The Tanakh tells that Rahab lived in Jericho and hid Joshua's two men in her house.
Q כמה אנשים יהושע שלח לבדוק את העיר?|كم رجلًا أرسل يشوع ليستطلع المدينة؟|Сколько людей Иисус Навин послал осмотреть город?|How many men did Joshua send to look at the city?|n2|n1,n3,n4
Y המקרא מספר שיהושע שלח 2 אנשים בשקט, כדי לבדוק את העיר לפני שנכנסים אליה.|يروي التناخ أن يشوع أرسل 2 من الرجال بهدوء ليستطلعا المدينة قبل دخولها.|В Танахе рассказывается, что Иисус Навин тихо послал 2 человек осмотреть город заранее.|The Tanakh tells that Joshua quietly sent 2 men to look at the city before going in.
Q כמה ימים הלכו סביב העיר פעם אחת בכל יום?|كم يومًا داروا حول المدينة مرة واحدة كل يوم؟|Сколько дней они обходили город по разу в день?|For how many days did they walk around the city once a day?|n6|n3,n7,n10
Y המקרא מספר שהקיפו את העיר פעם אחת ביום במשך 6 ימים, וביום השביעי 7 פעמים.|يروي التناخ أنهم داروا حول المدينة مرة كل يوم مدة 6 أيام، ثم 7 مرات في اليوم السابع.|В Танахе рассказывается, что 6 дней город обходили по разу в день, а на седьмой день 7 раз.|The Tanakh tells that they walked around the city once a day for 6 days, and 7 times on day seven.
Q כמה פעמים הלכו סביב העיר ביום השביעי?|كم مرة داروا حول المدينة في اليوم السابع؟|Сколько раз они обошли город на седьмой день?|How many times did they walk around the city on the seventh day?|n7|n3,n6,n10
Y המקרא מספר שביום השביעי הקיפו את העיר 7 פעמים, ורק אחרי הפעם האחרונה החומה נפלה.|يروي التناخ أنهم في اليوم السابع داروا حول المدينة 7 مرات، وبعد آخر مرة سقط السور.|В Танахе рассказывается, что на седьмой день город обошли 7 раз, и после последнего круга стена упала.|The Tanakh tells that on day seven they went around the city 7 times, and after the last time the wall fell.
Q במה תקעו סביב העיר?|بماذا نفخوا حول المدينة؟|Во что они трубили вокруг города?|What did they blow around the city?|t_shofar|t_flute,t_bell,t_horn_car
Y המקרא מספר שהלכו סביב העיר עם שופרות, ותקעו בהם עד שהחומה נפלה.|يروي التناخ أنهم داروا حول المدينة ومعهم الأبواق، ونفخوا فيها حتى سقط السور.|В Танахе рассказывается, что вокруг города ходили с шофарами и трубили в них, пока стена не упала.|The Tanakh tells that they walked around the city with shofars and blew them until the wall fell.
Q מה קרה לחומה בסוף?|ماذا حدث للسور في النهاية؟|Что случилось со стеной в конце?|What happened to the wall in the end?|t_fell|t_grew,t_flew_n,t_moved
Y המקרא מספר שכולם צעקו ותקעו בשופרות יחד, ואז החומה של יריחו נפלה.|يروي التناخ أن الجميع صرخوا ونفخوا في الأبواق معًا، وعندها سقط سور أريحا.|В Танахе рассказывается, что все вместе закричали и затрубили в шофары, и тогда стена Иерихона упала.|The Tanakh tells that everyone shouted and blew the shofars together, and then the wall of Jericho fell.
Q מי אמר ליהושע מה לעשות?|من قال ليشوع ماذا يفعل؟|Кто сказал Иисусу Навину, что делать?|Who told Joshua what to do?|god|pharaoh,saul,samuel
Y המקרא מספר שיהושע לא המציא את התוכנית בעצמו, אלא אלוהים אמר לו מה לעשות.|يروي التناخ أن يشوع لم يخترع الخطة بنفسه، بل قال له الله ماذا يفعل.|В Танахе рассказывается, что Иисус Навин не сам придумал план, а Бог сказал ему, что делать.|The Tanakh tells that Joshua did not make up the plan himself, but God told him what to do.
Q למה רחב נשארה בשלום?|لماذا بقيت راحاب بسلام؟|Почему Раав осталась цела?|Why did Rahab stay safe?|t_helped|t_ran,t_hid_n,t_fought
Y המקרא מספר שרחב החביאה את שני האנשים, ולכן הם שמרו עליה ועל המשפחה שלה.|يروي التناخ أن راحاب أخفت الرجلين، لذلك حافظا عليها وعلى عائلتها.|В Танахе рассказывается, что Раав спрятала двух людей, поэтому они сберегли её и её семью.|The Tanakh tells that Rahab hid the two men, so they kept her and her family safe.
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
Y המקרא מספר ששמואל בא לבית לחם, כי שם גר ישי עם הבנים שלו.|يروي التناخ أن صموئيل جاء إلى بيت لحم، لأن يسّى كان يسكن هناك مع أبنائه.|В Танахе рассказывается, что Самуил пришёл в Вифлеем, потому что там жил Иессей с сыновьями.|The Tanakh tells that Samuel came to Bethlehem, because Jesse lived there with his sons.
Q מי היה אבא של דוד?|من كان والد داود؟|Кто был отцом Давида?|Who was David's father?|jesse|saul,jacob,noah
Y המקרא מספר ששמואל בא לבית של ישי, ובחר בדוד, הבן הקטן של ישי.|يروي التناخ أن صموئيل جاء إلى بيت يسّى، واختار داود، الابن الأصغر ليسّى.|В Танахе рассказывается, что Самуил пришёл в дом Иессея и выбрал Давида, его младшего сына.|The Tanakh tells that Samuel came to Jesse's house and chose David, Jesse's youngest son.
Q איזה בן היה דוד?|أي ابن كان داود؟|Каким по возрасту сыном был Давид?|Which son was David?|t_youngest|t_oldest,t_middle,t_only
Y המקרא מספר ששמואל ראה את כל הבנים של ישי, ובסוף בחר דווקא בקטן מכולם, דוד.|يروي التناخ أن صموئيل رأى كل أبناء يسّى، وفي النهاية اختار أصغرهم، داود.|В Танахе рассказывается, что Самуил посмотрел всех сыновей Иессея и выбрал самого младшего, Давида.|The Tanakh tells that Samuel saw all of Jesse's sons and in the end chose the youngest, David.
Q איזו עבודה עשה דוד?|أي عمل عمل داود؟|Какую работу делал Давид?|What job did David have?|t_shepherd2|t_baker2,t_soldier2,t_king2
Y המקרא מספר שדוד שמר על הכבשים של המשפחה, וזו העבודה של רועה צאן.|يروي التناخ أن داود كان يحرس خراف العائلة، وهذا هو عمل راعي الغنم.|В Танахе рассказывается, что Давид охранял овец своей семьи, а это работа пастуха.|The Tanakh tells that David guarded his family's sheep, which is a shepherd's job.
Q ממה דוד הציל את הכבשים? מאריה ומ...|ممن أنقذ داود الخراف؟ من أسد ومن...|От кого Давид спас овец? От льва и от...|What did David save the sheep from? A lion and a...|t_bear|t_dog,t_rabbit,t_snake_n
Y המקרא מספר שדוד שמר על הכבשים, ופעם הציל אותן מאריה ומדוב שבאו לטרוף.|يروي التناخ أن داود كان يحرس الخراف، وأنقذها مرة من أسد ومن دب جاءا ليفترساها.|В Танахе рассказывается, что Давид, охраняя овец, однажды спас их от льва и медведя.|The Tanakh tells that David, while guarding the sheep, once saved them from a lion and a bear.
Q באיזה כלי נגינה דוד ניגן?|على أي آلة عزف داود؟|На каком инструменте играл Давид?|Which instrument did David play?|t_harp|t_drum,t_piano,t_guitar
Y המקרא מספר שדוד ניגן יפה בכינור, ולכן המלך שאול אהב לשמוע אותו.|يروي التناخ أن داود عزف بشكل جميل على القيثارة، لذلك أحبّ الملك شاول أن يسمعه.|В Танахе рассказывается, что Давид красиво играл на арфе, поэтому царь Саул любил его слушать.|The Tanakh tells that David played the harp beautifully, so King Saul loved to hear him.
Q מי היה המלך שאהב לשמוע את דוד מנגן?|من كان الملك الذي أحب أن يسمع داود يعزف؟|Какой царь любил слушать игру Давида?|Which king loved to hear David play?|saul|solomon,pharaoh,joshua
Y המקרא מספר ששאול היה המלך לפני דוד, והוא אהב לשמוע את דוד מנגן.|يروي التناخ أن شاول كان الملك قبل داود، وكان يحبّ أن يسمع داود يعزف.|В Танахе рассказывается, что Саул был царём до Давида и любил слушать, как тот играет.|The Tanakh tells that Saul was king before David, and he loved to hear David play.
Q מי היה החבר הטוב של דוד?|من كان صديق داود الجيد؟|Кто был хорошим другом Давида?|Who was David's good friend?|jonathan|goliath,abraham,jesse
Y המקרא מספר שיהונתן, הבן של המלך שאול, היה חבר טוב של דוד.|يروي التناخ أن يوناثان، ابن الملك شاول، كان صديقًا جيدًا لداود.|В Танахе рассказывается, что Ионафан, сын царя Саула, был хорошим другом Давида.|The Tanakh tells that Jonathan, King Saul's son, was David's good friend.
Q איך קראו ללוחם הענק?|ماذا كان اسم المحارب العملاق؟|Как звали великана-воина?|What was the giant warrior called?|goliath|saul,jesse,laban
Y המקרא מספר שגלית היה לוחם ענק בצבא שעמד בעמק האלה, וכולם פחדו ממנו.|يروي التناخ أن جليات كان محاربًا عملاقًا في الجيش الذي وقف في وادي البطم، وخاف منه الجميع.|В Танахе рассказывается, что Голиаф был воином-великаном в армии в долине Эла, и все его боялись.|The Tanakh tells that Goliath was a giant warrior in the army in the Valley of Elah, and everyone feared him.
Q באיזה עמק עמד צבא גדול?|في أي وادٍ وقف جيش كبير؟|В какой долине стояла большая армия?|In which valley did a big army stand?|elah|jordan,sinai,jericho
Y המקרא מספר שהצבא של גלית עמד בעמק האלה, ושם דוד נלחם בו.|يروي التناخ أن جيش جليات وقف في وادي البطم، وهناك حاربه داود.|В Танахе рассказывается, что армия Голиафа стояла в долине Эла, и там Давид с ним сразился.|The Tanakh tells that Goliath's army stood in the Valley of Elah, and that is where David fought him.
Q באיזה נשק דוד זרק את האבן?|بأي سلاح رمى داود الحجر؟|Чем Давид бросил камень?|What did David throw the stone with?|t_sling|t_bow,t_spear,t_catapult
Y המקרא מספר שדוד לא לבש שריון, ובמקום חרב הוא זרק אבן בקלע.|يروي التناخ أن داود لم يلبس درعًا، وبدل السيف رمى حجرًا بالمقلاع.|В Танахе рассказывается, что Давид не надел доспехи и вместо меча метнул камень из пращи.|The Tanakh tells that David wore no armor, and instead of a sword he threw a stone with a sling.
Q מה דוד לקח כדי להילחם בגלית? מקל, שק ו...|ماذا أخذ داود ليحارب جليات؟ عصا وكيسًا و...|Что Давид взял, чтобы сражаться с Голиафом? Палку, мешок и...|What did David take to fight Goliath? A stick, a bag and...|t_stones|t_sticks,t_books_n,t_shoes
Y המקרא מספר שדוד לקח אבנים חלקות, ואחת מהן היא שפגעה בגלית.|يروي التناخ أن داود أخذ حجارة ملساء، وواحد منها هو الذي أصاب جليات.|В Танахе рассказывается, что Давид взял гладкие камни, и один из них попал в Голиафа.|The Tanakh tells that David took smooth stones, and one of them is what hit Goliath.
Q מה קרה לגלית בסוף?|ماذا حدث لجليات في النهاية؟|Что случилось с Голиафом в конце?|What happened to Goliath in the end?|t_fell2|t_ran2,t_won2,t_slept
Y המקרא מספר שהאבן מהקלע של דוד פגעה בגלית, ולכן הוא נפל.|يروي التناخ أن الحجر من مقلاع داود أصاب جليات، لذلك سقط.|В Танахе рассказывается, что камень из пращи Давида попал в Голиафа, и поэтому тот упал.|The Tanakh tells that the stone from David's sling hit Goliath, and so he fell.
Q באיזו עיר דוד נהיה מלך?|في أي مدينة أصبح داود ملكًا؟|В каком городе Давид стал царём?|In which city did David become king?|jerusalem|jericho,bethel,haran
Y המקרא מספר שאחרי שנים דוד נהיה מלך, והעיר שלו הייתה ירושלים.|يروي التناخ أن داود صار ملكًا بعد سنوات، وكانت مدينته أورشليم.|В Танахе рассказывается, что через годы Давид стал царём, и его городом был Иерусалим.|The Tanakh tells that years later David became king, and his city was Jerusalem.
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
S s12|👑|#0b7f92|שלמה המלך החכם|سليمان الملك الحكيم|Соломон, мудрый царь|King Solomon the Wise
L אחרי דוד, בנו שלמה נהיה מלך. הוא היה צעיר וביקש מאלוהים לב חכם.|بعد داود أصبح ابنه سليمان ملكًا. كان شابًا وطلب من الله قلبًا حكيمًا.|После Давида царём стал его сын Соломон. Он был молод и попросил у Бога мудрое сердце.|After David, his son Solomon became king. He was young and asked God for a wise heart.
L אלוהים שמח. הוא נתן לשלמה חכמה, והבטיח לו גם עושר וכבוד.|فرح الله. أعطى سليمان الحكمة ووعده أيضًا بالغنى والكرامة.|Бог обрадовался. Он дал Соломону мудрость и пообещал ему ещё богатство и почёт.|God was pleased. He gave Solomon wisdom and promised him riches and honor too.
L יום אחד באו שתי נשים למלך. כל אחת אמרה: "התינוק הזה שלי".|في يوم جاءت امرأتان إلى الملك. قالت كل واحدة: «هذا الطفل لي».|Однажды к царю пришли две женщины. Каждая говорила: «Этот малыш мой».|One day two women came to the king. Each one said, "This baby is mine."
L שלמה אמר: "נחלק את התינוק לשניים". אחת צעקה: "לא! תנו לה אותו!". הוא הבין שהיא האמא האמיתית.|قال سليمان: «نقسم الطفل إلى نصفين». صرخت إحداهما: «لا! أعطوها إياه!». فهم أنها الأم الحقيقية.|Соломон сказал: «Разделим малыша надвое». Одна закричала: «Нет! Отдайте его ей!». Он понял, что она настоящая мать.|Solomon said, "Let us divide the baby in two." One cried, "No! Give him to her!" He understood that she was the real mother.
L שלמה בנה בית גדול ויפה לאלוהים בירושלים, בית המקדש.|بنى سليمان بيتًا كبيرًا وجميلًا لله في أورشليم، وهو الهيكل.|Соломон построил большой красивый дом для Бога в Иерусалиме, Храм.|Solomon built a big, beautiful house for God in Jerusalem, the Temple.
L אנשים מכל העולם באו לשמוע את החכמה של שלמה. הוא כתב גם משלים, כמו "משלי".|جاء ناس من كل العالم ليسمعوا حكمة سليمان. وكتب أيضًا أمثالًا، مثل «سفر الأمثال».|Люди со всего мира приходили слушать мудрость Соломона. Он также писал притчи, например «Притчи Соломона».|People came from all over the world to hear Solomon's wisdom. He also wrote proverbs, like the Book of Proverbs.
Q מי היה אבא של שלמה?|من كان والد سليمان؟|Кто был отцом Соломона?|Who was Solomon's father?|david|saul,jacob,jesse
Y המקרא מספר ששלמה היה הבן של דוד, ולכן נהיה מלך אחריו.|يروي التناخ أن سليمان كان ابن داود، لذلك صار ملكًا بعده.|В Танахе рассказывается, что Соломон был сыном Давида, поэтому стал царём после него.|The Tanakh tells that Solomon was David's son, so he became king after him.
Q מה שלמה ביקש מאלוהים?|ماذا طلب سليمان من الله؟|Что Соломон попросил у Бога?|What did Solomon ask God for?|t_wiseheart|t_gold2,t_horse,t_army2
Y המקרא מספר ששלמה היה מלך צעיר, ולכן ביקש לב חכם כדי לשפוט נכון את העם.|يروي التناخ أن سليمان كان ملكًا شابًا، لذلك طلب قلبًا حكيمًا ليحكم بين الناس بالعدل.|В Танахе рассказывается, что молодой царь Соломон попросил мудрое сердце, чтобы судить справедливо.|The Tanakh tells that Solomon was a young king, so he asked for a wise heart to judge the people fairly.
Q מה אלוהים נתן לשלמה?|ماذا أعطى الله لسليمان؟|Что Бог дал Соломону?|What did God give Solomon?|t_wisdom|t_gift_palace,t_gift_fields,t_gift_land
Y המקרא מספר שאלוהים שמח מהבקשה של שלמה, ולכן נתן לו חכמה וגם עושר וכבוד.|يروي التناخ أن الله فرح بطلب سليمان، لذلك أعطاه الحكمة والغنى والكرامة أيضًا.|В Танахе рассказывается, что Бог обрадовался просьбе Соломона и дал ему мудрость, богатство и почёт.|The Tanakh tells that God was pleased with Solomon's request, so He gave him wisdom, riches and honor.
Q כמה נשים באו למלך?|كم امرأة جاءت إلى الملك؟|Сколько женщин пришло к царю?|How many women came to the king?|n2|n1,n3,n4
Y המקרא מספר ש-2 נשים באו למלך, וכל אחת אמרה שהתינוק שלה.|يروي التناخ أن امرأتين جاءتا إلى الملك، وكل واحدة قالت إن الطفل لها.|В Танахе рассказывается, что к царю пришли 2 женщины, и каждая говорила, что малыш её.|The Tanakh tells that 2 women came to the king, and each one said the baby was hers.
Q על מה הן רבו?|على ماذا تخاصمتا؟|Из-за чего они спорили?|What were they arguing about?|t_baby|t_house2,t_cake2,t_dress
Y המקרא מספר שכל אחת מהנשים אמרה שהתינוק שלה, ולכן הן רבו על התינוק.|يروي التناخ أن كل امرأة قالت إن الطفل لها، لذلك تخاصمتا على الطفل.|В Танахе рассказывается, что каждая женщина говорила, что малыш её, поэтому они спорили из-за него.|The Tanakh tells that each woman said the baby was hers, so they argued about the baby.
Q מה שלמה הציע לעשות?|ماذا اقترح سليمان أن يفعل؟|Что предложил Соломон?|What did Solomon suggest?|t_divide|t_sol_ask,t_sol_give,t_wait
Y המקרא מספר ששלמה הציע לחלק את התינוק, כדי לראות איזו אמא תוותר כדי להציל אותו.|يروي التناخ أن سليمان اقترح تقسيم الطفل، ليرى أي أم ستتنازل عنه لتنقذه.|В Танахе рассказывается, что Соломон предложил разделить малыша, чтобы увидеть, какая мать уступит.|The Tanakh tells that Solomon offered to divide the baby, to see which mother would give up to save him.
Q מי צעקה "תנו לה אותו"?|من صرخت «أعطوها إياه»؟|Кто закричала «Отдайте его ей»?|Who cried "Give him to her"?|t_realmother|t_otherwoman,t_judge,t_queen
Y המקרא מספר שהאמא האמיתית הסכימה לוותר על התינוק, רק כדי שיישאר בחיים.|يروي التناخ أن الأم الحقيقية قبلت أن تتنازل عن الطفل، فقط لكي يبقى حيًّا.|В Танахе рассказывается, что настоящая мать согласилась отдать малыша, только бы он остался жив.|The Tanakh tells that the real mother agreed to give up the baby, just so he would stay alive.
Q איך שלמה ידע מי האמא האמיתית?|كيف عرف سليمان من هي الأم الحقيقية؟|Как Соломон узнал, кто настоящая мать?|How did Solomon know who the real mother was?|t_loved|t_guessed,t_lot,t_asked_king
Y המקרא מספר ששלמה הבין שרק אמא שאוהבת את התינוק תוותר עליו כדי שיחיה.|يروي التناخ أن سليمان فهم أن الأم التي تحبّ الطفل وحدها تتنازل عنه لكي يعيش.|В Танахе рассказывается, что Соломон понял, что только любящая мать откажется от малыша, чтобы он жил.|The Tanakh tells that Solomon understood only a mother who loves the baby would give him up so he could live.
Q מה שלמה בנה בירושלים?|ماذا بنى سليمان في أورشليم؟|Что Соломон построил в Иерусалиме?|What did Solomon build in Jerusalem?|t_temple|t_pyramid,t_ark2,t_tower2
Y המקרא מספר ששלמה בנה בירושלים בית גדול ויפה לאלוהים, ולבית הזה קוראים בית המקדש.|يروي التناخ أن سليمان بنى في أورشليم بيتًا كبيرًا وجميلًا لله، وهذا البيت اسمه الهيكل.|В Танахе рассказывается, что Соломон построил в Иерусалиме дом для Бога, который называют Храмом.|The Tanakh tells that Solomon built a big, beautiful house for God in Jerusalem, and it is called the Temple.
Q באיזו עיר שלמה בנה את בית המקדש?|في أي مدينة بنى سليمان الهيكل؟|В каком городе Соломон построил Храм?|In which city did Solomon build the Temple?|jerusalem|jericho,bethel,haran
Y המקרא מספר שירושלים הייתה העיר של דוד ושלמה, ולכן שם נבנה בית המקדש.|يروي التناخ أن أورشليم كانت مدينة داود وسليمان، لذلك بُني الهيكل هناك.|В Танахе рассказывается, что Иерусалим был городом Давида и Соломона, поэтому Храм построили там.|The Tanakh tells that Jerusalem was the city of David and Solomon, so the Temple was built there.
Q איזה ספר כתב שלמה?|أي كتاب كتب سليمان؟|Какую книгу написал Соломон?|Which book did Solomon write?|t_proverbs|t_atlas,t_cookbook,t_diary
Y המקרא מספר ששלמה כתב משלים, ולכן הספר שלו נקרא משלי.|يروي التناخ أن سليمان كتب أمثالًا، لذلك يُسمّى كتابه سفر الأمثال.|В Танахе рассказывается, что Соломон писал притчи, поэтому его книга называется Притчи.|The Tanakh tells that Solomon wrote proverbs, so his book is called Proverbs.
Q מי בא לשמוע את החכמה של שלמה?|من جاء ليسمع حكمة سليمان؟|Кто приходил слушать мудрость Соломона?|Who came to hear Solomon's wisdom?|t_people|t_sol_jerusalem,t_sol_family,t_sol_palace
Y המקרא מספר שהחכמה של שלמה הייתה מפורסמת, ולכן אנשים מכל העולם באו לשמוע אותה.|يروي التناخ أن حكمة سليمان كانت مشهورة، لذلك جاء ناس من كل العالم ليسمعوها.|В Танахе рассказывается, что мудрость Соломона была знаменита, и люди со всего мира приходили её слушать.|The Tanakh tells that Solomon's wisdom was famous, so people from all over the world came to hear it.
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
