/* History for kids (היסטוריה לילדים, grades 1-6) - content written fresh for bekol, in simple eye-level language.
   Line formats (fields split by |):
   E key|type|he|ar|ru|en        entity (answer / distractor). types: p person/role, b body/institution, s symbol, c colors, l city, g geographic feature, d direction, h day, y year, r right, u duty, k bin, t other
   S id|emoji|color|he|ar|ru|en   topic title
   L he|ar|ru|en                  one lesson sentence of the current topic
   Q he|ar|ru|en|answerKey[|d1,d2,d3]   question; answerKey nNN = a number; optional 3 explicit distractors */
var RAW="";
RAW+=String.raw`
E past|t|העבר|الماضي|прошлое|the past
E now|t|ההווה|الحاضر|настоящее|the present
E future|t|העתיד|المستقبل|будущее|the future
E s_horse|t|בעגלה עם סוס|بعربة يجرّها حصان|в повозке с лошадью|in a cart pulled by a horse
E s_car|t|במכונית|بالسيارة|на машине|by car
E s_plane|t|במטוס|بالطائرة|на самолёте|by plane
E s_train|t|ברכבת|بالقطار|на поезде|by train
E s_letter|t|במכתב שהגיע בדואר|برسالة تصل بالبريد|письмом по почте|with a letter sent by mail
E s_video|t|בשיחת וידאו|بمكالمة فيديو|по видеосвязи|with a video call
E s_text|t|בהודעה בטלפון|برسالة على الهاتف|сообщением в телефоне|with a phone message
E s_email|t|במייל|بالبريد الإلكتروني|по электронной почте|by email
E old_photo|t|תמונה ישנה|صورة قديمة|старая фотография|an old photo
E new_phone|t|הודעה שנשלחה עכשיו|رسالة أُرسلت الآن|сообщение, отправленное сейчас|a message sent right now
E ad_ticket|t|כרטיס לסרט שנקנה מחר|تذكرة فيلم تُشترى غدًا|билет в кино, который купят завтра|a movie ticket to be bought tomorrow
E ad_toy|t|צעצוע שעוד לא נוצר|لعبة لم تُصنع بعد|игрушка, которой ещё нет|a toy that has not been made yet
E h_why|t|מה קרה, ולמה זה קרה|ماذا حدث ولماذا حدث|что случилось и почему|what happened and why
E h_weather|t|איזה יום יהיה מחר|كيف سيكون الطقس غدًا|какая будет погода завтра|what tomorrow's weather will be
E h_cook|t|איך מבשלים אורז|كيف نطبخ الأرز|как варить рис|how to cook rice
E h_count|t|כמה זה שלוש ועוד ארבע|كم يساوي ثلاثة زائد أربعة|сколько будет три плюс четыре|how much is three plus four
E archaeologist|p|ארכאולוג|عالم آثار|археолог|an archaeologist
E baker|p|אופה|خبّاز|пекарь|a baker
E driver|p|נהג אוטובוס|سائق حافلة|водитель автобуса|a bus driver
E dentist|p|רופא שיניים|طبيب أسنان|стоматолог|a dentist
E museum|b|מוזיאון|متحف|музей|a museum
E bank|b|בנק|مصرف|банк|a bank
E cinema|b|קולנוע|سينما|кинотеатр|a cinema
E market|b|שוק|سوق|рынок|a market
E k_digs|t|חופרים באדמה בזהירות|يحفرون في الأرض بحذر|осторожно копают землю|they dig carefully in the ground
E k_sleep|t|ישנים כל היום|ينامون طوال النهار|спят весь день|they sleep all day
E k_cars|t|מוכרים מכוניות|يبيعون السيارات|продают машины|they sell cars
E k_swim|t|שחייה בלבד|السباحة فقط|только плавание|only swimming
E k_pot|t|סיר חרס עתיק|قدر فخّاري قديم|древний глиняный горшок|an ancient clay pot
E k_phone|t|טלפון חדש|هاتف جديد|новый телефон|a new phone
E k_toy|t|בובה מפלסטיק מהחנות|دمية بلاستيكية من المتجر|пластиковая кукла из магазина|a plastic doll from the store
E k_bag|t|תיק בית ספר חדש|حقيبة مدرسية جديدة|новый школьный рюкзак|a new school bag
E k_clothes|t|איך התלבשו אנשים פעם|كيف كان الناس يلبسون في الماضي|как одевались люди раньше|how people dressed long ago
E k_game|t|מי ינצח במשחק מחר|من سيفوز باللعبة غدًا|кто выиграет завтра в игре|who will win the game tomorrow
E k_lunch|t|מה יהיה לארוחת צהריים מחר|ماذا سيكون غداء الغد|что будет на обед завтра|what tomorrow's lunch will be
E k_sky|t|כמה כוכבים יש בשמיים|كم عدد النجوم في السماء|сколько звёзд на небе|how many stars are in the sky
E w_writing|t|כתב|الكتابة|письменность|writing
E w_pyr|t|פירמידות|أهرامات|пирамиды|pyramids
E w_sing|t|שירים|أغانٍ|песни|songs
E w_color|t|צבעים|ألوان|краски|colors
E w_kite|t|עפיפונים|طائرات ورقية|воздушные змеи|kites
E always|t|תמיד|دائمًا|всегда|always
E w_great|t|החומה הסינית|سور الصين العظيم|Великая Китайская стена|the Great Wall of China
E w_jericho|t|חומות יריחו|أسوار أريحا|стены Иерихона|the walls of Jericho
E w_berlin|t|חומת ברלין|جدار برلين|Берлинская стена|the Berlin Wall
E kotel|t|הכותל המערבי|حائط البراق (الحائط الغربي)|Западная стена|the Western Wall
E king_david|p|המלך דוד|الملك داود|царь Давид|King David
E king_solomon|p|המלך שלמה|الملك سليمان|царь Соломон|King Solomon
E ben_gurion|p|דוד בן־גוריון|دافيد بن غوريون|Давид Бен-Гурион|David Ben-Gurion
E herzl|p|בנימין זאב הרצל|بنيامين زئيف هرتسل|Биньямин Зеэв Герцль|Binyamin Ze'ev Herzl
E judah|p|יהודה המכבי|يهوذا المكابي|Иуда Маккавей|Judah Maccabee
E weizmann|p|חיים ויצמן|حاييم وايزمان|Хаим Вейцман|Chaim Weizmann
E golda|p|גולדה מאיר|غولدا مائير|Голда Меир|Golda Meir
E esther|p|המלכה אסתר|الملكة أستير|царица Эстер|Queen Esther
E miriam|p|מרים הנביאה|مريم النبيّة|пророчица Мирьям|Miriam the prophetess
E sarah|p|שרה אמנו|سارة أمّنا|праматерь Сара|Sarah our matriarch
E ramon|p|אילן רמון|إيلان رامون|Илан Рамон|Ilan Ramon
E ben_yehuda|p|אליעזר בן־יהודה|إليعيزر بن يهودا|Элиэзер Бен-Йехуда|Eliezer Ben-Yehuda
E herod|p|המלך הורדוס|الملك هيرودس|царь Ирод|King Herod
E a500|t|לפני כחמש מאות שנה|قبل نحو خمسمئة سنة|около пятисот лет назад|about five hundred years ago
E a5|t|לפני כחמש שנים|قبل نحو خمس سنوات|около пяти лет назад|about five years ago
E a50|t|לפני כחמישים שנה|قبل نحو خمسين سنة|около пятидесяти лет назад|about fifty years ago
E a20|t|לפני כעשרים שנה|قبل نحو عشرين سنة|около двадцати лет назад|about twenty years ago
E v_all|t|אנשים מכל העולם|أناس من كل العالم|люди со всего мира|people from all over the world
E v_none|t|אף אחד|لا أحد|никто|nobody
E v_birds|t|רק ציפורים|الطيور فقط|только птицы|only birds
E v_kings|t|רק מלכים|الملوك فقط|только цари|only kings
E hanukkah|h|חנוכה|الحانوكا|Ханука|Hanukkah
E purim|h|פורים|بوريم|Пурим|Purim
E sukkot|h|סוכות|عيد العُرُش|Суккот|Sukkot
E tubishvat|h|ט״ו בשבט|رأس السنة للأشجار (ט״ו בשבט)|Ту би-Шват|Tu BiShvat
E indep|h|יום העצמאות|يوم الاستقلال|День независимости|Independence Day
E m_clean|t|ניקו את בית המקדש וחנכו אותו מחדש|نظّفوا الهيكل وافتتحوه من جديد|очистили Храм и заново освятили его|they cleaned the Temple and dedicated it again
E m_leave|t|עזבו את העיר ולא חזרו|تركوا المدينة ولم يعودوا|ушли из города и не вернулись|they left the city and never came back
E m_sell|t|מכרו את בית המקדש|باعوا الهيكل|продали Храм|they sold the Temple
E m_hide|t|הסתתרו בבית|اختبأوا في البيت|спрятались дома|they hid at home
E d8|t|שמונה ימים|ثمانية أيام|восемь дней|eight days
E d3|t|שלושה ימים|ثلاثة أيام|три дня|three days
E d5|t|חמישה ימים|خمسة أيام|пять дней|five days
E d10|t|עשרה ימים|عشرة أيام|десять дней|ten days
E candles|t|נרות|شموع|свечи|candles
E fireworks|t|זיקוקים|ألعابًا نارية|фейерверки|fireworks
E bonfire|t|מדורה|موقدة نار|костёр|a bonfire
E flashlights|t|פנסים|مصابيح يدوية|фонарики|flashlights
E sufg|t|סופגניות ולביבות|سوفغانيوت وفطائر مقلية|пончики и оладьи|doughnuts and latkes
E matza|t|מצה|فطير|маца|matzah
E hamantash|t|אוזני המן|آذان هامان|уши Амана|hamantaschen
E figs|t|תאנים וחרובים|تين وخروب|инжир и рожковое дерево|figs and carob
E pharaoh|t|פרעה|فرعون|фараон|a pharaoh
E emperor|t|קיסר|إمبراطور|император|an emperor
E sultan|t|סולטן|سلطان|султан|a sultan
E president|t|נשיא|رئيس|президент|a president
E w_towers|t|מגדלי זכוכית|أبراجًا زجاجية|стеклянные башни|glass towers
E w_boats|t|ספינות חלל|سفن فضاء|космические корабли|spaceships
E w_tents|t|אוהלי קמפינג|خيام تخييم|палатки для кемпинга|camping tents
E nile|g|הנילוס|النيل|Нил|the Nile
E jordan|g|הירדן|الأردن|Иордан|the Jordan
E tiber|g|הטיבר|التيبر|Тибр|the Tiber
E thames|g|התמזה|التايمز|Темза|the Thames
E greece|g|יוון|اليونان|Греция|Greece
E egypt_c|g|מצרים|مصر|Египет|Egypt
E rome_c|g|רומא|روما|Рим|Rome
E china_c|g|סין|الصين|Китай|China
E romans|t|הרומאים|الرومان|римляне|the Romans
E aliens|t|חייזרים|كائنات فضائية|инопланетяне|aliens
E pirates|t|שודדי ים|قراصنة|пираты|pirates
E vikings|t|הוויקינגים|الفايكنغ|викинги|the Vikings
E greeks_p|t|היוונים|اليونانيون|греки|the Greeks
E egyptians_p|t|המצרים|المصريون|египтяне|the Egyptians
E caesarea|l|קיסריה|قيسارية|Кесария|Caesarea
E eilat|l|אילת|إيلات|Эйлат|Eilat
E safed|l|צפת|صفد|Цфат|Safed
E haifa_x|l|חיפה|حيفا|Хайфа|Haifa
E galut|t|גלות|شتات (غالوت)|изгнание (галут)|exile
E aliya_w|t|ארוחת בוקר|وجبة فطور|завтрак|breakfast
E holiday_w|t|חופשה|إجازة|каникулы|a vacation
E picnic_w|t|פיקניק|نزهة|пикник|a picnic
E jlm|l|ירושלים|القدس|Иерусалим|Jerusalem
E tlv|l|תל אביב|تل أبيب|Тель-Авив|Tel Aviv
E haifa|l|חיפה|حيفا|Хайфа|Haifa
E k_holidays|t|את החגים, התפילות והשפה|الأعياد والصلوات واللغة|праздники, молитвы и язык|the holidays, the prayers and the language
E k_nothing|t|שום דבר|لا شيء|ничего|nothing
E k_bags|t|רק את התיקים|الحقائب فقط|только чемоданы|only their suitcases
E moscow|l|מוסקבה|موسكو|Москва|Moscow
E paris|l|פריז|باريس|Париж|Paris
E cairo|l|קהיר|القاهرة|Каир|Cairo
E zionism|t|ציונות|الصهيونية|сионизм|Zionism
E geo_c|t|גאוגרפיה|الجغرافيا|география|geography
E arch_c|t|ארכאולוגיה|علم الآثار|археология|archaeology
E democ_c|t|דמוקרטיה|الديمقراطية|демократия|democracy
E basel|l|בזל|بازل|Базель|Basel
E y1897|y|1897|1897|1897|1897
E y1997|y|1997|1997|1997|1997
E y1797|y|1797|1797|1797|1797
E y1947|y|1947|1947|1947|1947
E y1948|y|1948|1948|1948|1948
E y1938|y|1938|1938|1938|1938
E y1958|y|1958|1958|1958|1958
E y1968|y|1968|1968|1968|1968
E degania|l|דגניה|دجانيا|Дгания|Degania
E m_plant|t|נטעו עצים ויבשו ביצות|زرعوا الأشجار وجفّفوا المستنقعات|сажали деревья и осушали болота|they planted trees and drained swamps
E m_sleep|t|ישנו כל היום|ناموا طوال النهار|спали весь день|they slept all day
E dictionary|t|מילון|قاموسًا|словарь|a dictionary
E cookbook|t|ספר בישול|كتاب طبخ|книгу рецептов|a cookbook
E map_b|t|מפה של העולם|خريطة للعالم|карту мира|a map of the world
E song_b|t|שיר ילדים|أغنية أطفال|детскую песню|a children's song
E home_all|t|בכל מקום, גם בבית|في كل مكان، حتى في البيت|везде, даже дома|everywhere, even at home
E only_syn|t|רק בבית הכנסת|في الكنيس فقط|только в синагоге|only in the synagogue
E only_book|t|רק בספרים|في الكتب فقط|только в книгах|only in books
E only_army|t|רק בצבא|في الجيش فقط|только в армии|only in the army
E hebrew_l|t|עברית|العبرية|иврит|Hebrew
E french_l|t|צרפתית|الفرنسية|французский|French
E japanese_l|t|יפנית|اليابانية|японский|Japanese
E swahili_l|t|סוואהילית|السواحيلية|суахили|Swahili
E invent|t|המציא מילים חדשות|اخترع كلمات جديدة|придумывал новые слова|he invented new words
E stopped|t|ויתר והפסיק לדבר|استسلم وتوقّف عن الكلام|сдался и замолчал|he gave up and stopped speaking
E cried_b|t|קנה מילים בחנות|اشترى كلمات من المتجر|купил слова в магазине|he bought words at a store
E hide_b|t|הלך לישון|ذهب لينام|пошёл спать|he went to sleep
E hatikva|s|התקווה|هتكفا (الأمل)|«Ха-Тиква»|Hatikvah
E hava|s|הבה נגילה|هفا ناغيلا|«Хава нагила»|Hava Nagila
E shalom_song|s|שיר ערש|ترنيمة نوم|колыбельная|a lullaby
E lullaby|s|שיר יום הולדת|أغنية عيد ميلاد|песня на день рождения|a birthday song
E olah|t|עולה חדש|مهاجر جديد (عوليه)|новый репатриант|a new immigrant
E tourist|t|תייר|سائح|турист|a tourist
E guest_b|t|שכן|جار|сосед|a neighbor
E visitor_b|t|נהג|سائق|водитель|a driver
E yemen|g|תימן|اليمن|Йемен|Yemen
E japan|g|יפן|اليابان|Япония|Japan
E brazil|g|ברזיל|البرازيل|Бразилия|Brazil
E canada|g|קנדה|كندا|Канада|Canada
E food_music|t|אוכל, מוזיקה ומנהגים|طعامًا وموسيقى وعادات|еду, музыку и обычаи|food, music and customs
E nothing_b|t|כלום|لا شيء|ничего|nothing
E snow_b|t|בתים מוכנים|بيوتًا جاهزة|готовые дома|ready-made houses
E sand_b|t|הרבה זהב|كثيرًا من الذهب|много золота|a lot of gold
E ussr|g|ברית המועצות לשעבר|الاتحاد السوفييتي السابق|бывший Советский Союз|the former Soviet Union
E peru|g|פרו|بيرو|Перу|Peru
E ethiopia|g|אתיופיה|إثيوبيا|Эфиопия|Ethiopia
E kenya|g|קניה|كينيا|Кения|Kenya
E nigeria|g|ניגריה|نيجيريا|Нигерия|Nigeria
E ghana|g|גאנה|غانا|Гана|Ghana
E siren_stand|t|עומדים בשקט כשהסירנה מצפצפת|نقف بصمت عندما تُطلق الصفّارة|молча стоят, когда звучит сирена|we stand in silence when the siren sounds
E party|t|עושים מסיבה|نقيم حفلة|устраивают вечеринку|we have a party
E race|t|עושים מירוץ|نُجري سباقًا|устраивают гонку|we run a race
E shopping|t|הולכים לקניות|نذهب للتسوّق|ходят за покупками|we go shopping
E two_min|t|שתי דקות|دقيقتان|две минуты|two minutes
E ten_sec|t|עשר שניות|عشر ثوانٍ|десять секунд|ten seconds
E an_hour|t|שעה שלמה|ساعة كاملة|целый час|a whole hour
E all_day|t|כל היום|طوال النهار|весь день|all day
E righteous|t|חסידי אומות העולם|الصالحون بين الأمم|Праведники народов мира|Righteous Among the Nations
E villains|t|המורים|المعلّمون|учителя|teachers
E bakers_c|t|אופים|خبّازون|пекари|bakers
E yadvashem|b|יד ושם|ياد فاشيم|Яд ва-Шем|Yad Vashem
E israelmuseum|b|מוזיאון הילדים|متحف الأطفال|детский музей|the children's museum
E zoo_c|b|גן החיות|حديقة الحيوان|зоопарк|the zoo
E science_m|b|מוזיאון המדע|متحف العلوم|музей науки|the science museum
E remember_why|t|כדי ללמוד ולשמור שזה לא יקרה שוב|لنتعلّم ونحرص ألا يتكرّر ذلك|чтобы учиться и беречь, чтобы такое не повторилось|so we learn and care that it never happens again
E forget_why|t|כדי לשכוח מהר|لننسى بسرعة|чтобы быстро забыть|so we can forget quickly
E nobody_why|t|כי אין מה לספר|لأنه لا يوجد ما نرويه|потому что рассказывать нечего|because there is nothing to tell
E dont_why|t|כי זה לא חשוב|لأنه غير مهم|потому что это неважно|because it is not important
E space|t|לחלל|إلى الفضاء|в космос|into space
E bottom_sea|t|לקרקעית הים|إلى قاع البحر|на дно моря|to the bottom of the sea
E mountain|t|לפסגת הר|إلى قمة جبل|на вершину горы|to a mountaintop
E cave|t|למערה|إلى كهف|в пещеру|to a cave
E masada|l|מצדה|مسعدة|Масада|Masada
E beit_shean|l|בית שאן|بيسان|Бейт-Шеан|Beit She'an
E scrolls|t|מגילות עתיקות|لفائف قديمة|древние свитки|ancient scrolls
E gold_coins_b|t|מטבעות זהב|عملات ذهبية|золотые монеты|gold coins
E dinosaur_b|t|שלד דינוזאור|هيكل ديناصور|скелет динозавра|a dinosaur skeleton
E old_car|t|מכונית ישנה|سيارة قديمة|старую машину|an old car
E shrine|b|היכל הספר במוזיאון ישראל|هيخال هاسيفر في متحف إسرائيل|«Храм книги» в Музее Израиля|the Shrine of the Book at the Israel Museum
E careful|t|מסתכלים ושומרים על המקום|ننظر ونحافظ على المكان|смотрим и бережём место|we look and take care of the place
E climb_walls|t|מטפסים על הקירות העתיקים|نتسلّق الجدران القديمة|лазаем по древним стенам|we climb the old walls
E take_stones|t|לוקחים אבנים הביתה|نأخذ حجارة إلى البيت|берём камни домой|we take stones home
E scribble|t|מציירים על הקירות|نرسم على الجدران|рисуем на стенах|we draw on the walls
S now|⏳|#e8590c|עבר, הווה ועתיד|الماضي والحاضر والمستقبل|прошлое, настоящее и будущее|Past, Present and Future
L היום אנחנו בהווה. מה שכבר קרה נקרא עבר. מה שעוד יקרה נקרא עתיד.|اليوم نحن في الحاضر. ما حدث من قبل اسمه الماضي. وما سيحدث بعد ذلك اسمه المستقبل.|Сегодня мы в настоящем. То, что уже случилось, называется прошлым. То, что ещё случится, называется будущим.|Today we are in the present. What already happened is the past. What will happen later is the future.
L ההיסטוריה היא סיפור של העבר: מה קרה, ולמה זה קרה.|التاريخ هو قصة الماضي: ماذا حدث ولماذا حدث.|История - это рассказ о прошлом: что случилось и почему.|History is the story of the past: what happened and why it happened.
L פעם לא היו מכוניות. אנשים נסעו ברגל או בעגלה עם סוס.|في الماضي لم تكن هناك سيارات. كان الناس يسافرون سيرًا على الأقدام أو بعربة يجرّها حصان.|Раньше не было машин. Люди ходили пешком или ездили в повозке с лошадью.|Long ago there were no cars. People walked or rode in a cart pulled by a horse.
L פעם שלחו מכתב בדואר, וחיכו ימים רבים לתשובה. היום שולחים הודעה, והיא מגיעה בשנייה.|في الماضي كانوا يرسلون رسالة بالبريد وينتظرون الجواب أيامًا كثيرة. اليوم نرسل رسالة وتصل خلال ثانية.|Раньше письмо отправляли по почте и много дней ждали ответа. Сегодня мы отправляем сообщение, и оно приходит за секунду.|Long ago people sent a letter by mail and waited many days for an answer. Today we send a message and it arrives in a second.
L גם למשפחה שלכם יש היסטוריה. אפשר לשאול את סבא וסבתא איך היו החיים כשהם היו ילדים.|وللعائلة أيضًا تاريخ. يمكنك أن تسأل جدّك وجدّتك كيف كانت الحياة عندما كانا طفلين.|У вашей семьи тоже есть история. Можно спросить бабушку и дедушку, какой была жизнь, когда они были детьми.|Your family has a history too. You can ask your grandparents what life was like when they were children.
Q מה קרה אתמול?|ماذا نسمّي ما حدث أمس؟|Как называется то, что случилось вчера?|What do we call what happened yesterday?|past|now,future,always
Q איך נקרא הזמן שעוד לא הגיע?|ماذا نسمّي الزمن الذي لم يأتِ بعد؟|Как называется время, которое ещё не наступило?|What do we call the time that has not come yet?|future|past,now,always
Q איך נסעו אנשים לפני הרבה שנים, כשלא היו מכוניות?|كيف كان الناس يسافرون قبل سنوات كثيرة عندما لم تكن هناك سيارات؟|Как ездили люди много лет назад, когда не было машин?|How did people travel many years ago, when there were no cars?|s_horse|s_car,s_plane,s_train
Q איך שלחו הודעה למישהו רחוק לפני הרבה שנים?|كيف كانوا يرسلون رسالة إلى شخص بعيد قبل سنوات كثيرة؟|Как отправляли весточку далёкому человеку много лет назад?|How did people send a message to someone far away many years ago?|s_letter|s_video,s_text,s_email
Q על מה ההיסטוריה מספרת?|عمّ يحدّثنا التاريخ؟|О чём рассказывает история?|What does history tell us about?|h_why|h_weather,h_cook,h_count
Q איזה דבר מהרשימה הוא מהעבר?|أي شيء من هذه القائمة هو من الماضي؟|Что из этого относится к прошлому?|Which of these is from the past?|old_photo|ad_ticket,ad_toy,new_phone
S know|🏺|#a0522d|איך יודעים מה היה פעם?|كيف نعرف ماذا كان في الماضي؟|как мы узнаём, что было раньше?|How Do We Know What Happened Long Ago?
L לא היינו שם, ובכל זאת אנחנו יודעים מה קרה לפני אלפי שנים. איך?|لم نكن هناك، ومع ذلك نعرف ماذا حدث قبل آلاف السنين. كيف؟|Нас там не было, но мы знаем, что случилось тысячи лет назад. Как?|We were not there, yet we know what happened thousands of years ago. How?
L ארכאולוגים חופרים באדמה בזהירות ומוצאים חפצים עתיקים: כלים, מטבעות ובתים שנקברו.|يحفر علماء الآثار في الأرض بحذر ويجدون أشياء قديمة: أدوات وعملات وبيوتًا دُفنت.|Археологи осторожно копают землю и находят древние вещи: посуду, монеты и дома, засыпанные землёй.|Archaeologists dig carefully in the ground and find ancient things: tools, coins and buried houses.
L את החפצים שומרים ומציגים במוזיאון, כדי שכולנו נוכל לראות אותם.|تُحفظ الأشياء وتُعرض في المتحف ليتمكّن الجميع من رؤيتها.|Находки хранят и показывают в музее, чтобы все могли их увидеть.|The finds are kept and shown in a museum, so everyone can see them.
L גם כתב מלמד אותנו. כשאדם כתב משהו לפני הרבה שנים, אנחנו יכולים לקרוא מה הוא חשב.|والكتابة أيضًا تعلّمنا. عندما كتب إنسان شيئًا قبل سنوات كثيرة، نستطيع أن نقرأ ماذا كان يفكّر.|Письменность тоже учит нас. Если человек написал что-то много лет назад, мы можем прочитать, о чём он думал.|Writing teaches us too. When a person wrote something long ago, we can read what they thought.
L תמונות ישנות וסיפורים של סבא וסבתא הם גם מקור לעבר. היסטוריון שואל שאלות ובודק מה נכון.|الصور القديمة وحكايات الجدّ والجدّة أيضًا مصدر عن الماضي. المؤرّخ يطرح الأسئلة ويتحقّق مما هو صحيح.|Старые фотографии и рассказы бабушек и дедушек тоже рассказывают о прошлом. Историк задаёт вопросы и проверяет, что правда.|Old photos and grandparents' stories are also sources about the past. A historian asks questions and checks what is true.
Q מי חופר באדמה כדי למצוא חפצים עתיקים?|من يحفر في الأرض ليجد أشياء قديمة؟|Кто копает землю, чтобы найти древние вещи?|Who digs in the ground to find ancient things?|archaeologist|baker,driver,dentist
Q איפה מציגים חפצים עתיקים שנמצאו?|أين تُعرض الأشياء القديمة التي وُجدت؟|Где показывают найденные древние вещи?|Where are the ancient things that were found shown?|museum|bank,cinema,market
Q מה עושים ארכאולוגים?|ماذا يفعل علماء الآثار؟|Что делают археологи?|What do archaeologists do?|k_digs|k_sleep,k_cars,k_swim
Q איזה חפץ יכול להיות מתקופה עתיקה?|أي شيء يمكن أن يكون من زمن قديم؟|Какая вещь может быть из древних времён?|Which object can be from an ancient time?|k_pot|k_phone,k_toy,k_bag
Q מה אפשר ללמוד מתמונה ישנה של סבתא?|ماذا نتعلّم من صورة قديمة لجدّتي؟|Что можно узнать из старой фотографии бабушки?|What can we learn from an old photo of grandma?|k_clothes|k_game,k_lunch,k_sky
Q מה עוזר לנו לדעת מה אנשים חשבו לפני הרבה שנים?|ما الذي يساعدنا على معرفة ما فكّر فيه الناس قبل سنوات كثيرة؟|Что помогает нам узнать, о чём думали люди много лет назад?|What helps us know what people thought many years ago?|w_writing|w_sing,w_color,w_kite
S jlm|🕍|#7048e8|ירושלים של פעם|القدس في الماضي|Иерусалим в давние времена|Jerusalem Long Ago
L ירושלים היא עיר עתיקה מאוד. אנשים גרים בה כבר יותר מאלפיים שנה.|القدس مدينة قديمة جدًّا. يعيش الناس فيها منذ أكثر من ألفي سنة.|Иерусалим - очень древний город. Люди живут в нём уже больше двух тысяч лет.|Jerusalem is a very old city. People have lived in it for more than two thousand years.
L לפני כשלושת אלפים שנה המלך דוד עשה את ירושלים לבירה של עם ישראל.|قبل نحو ثلاثة آلاف سنة جعل الملك داود القدس عاصمة لشعب إسرائيل.|Около трёх тысяч лет назад царь Давид сделал Иерусалим столицей народа Израиля.|About three thousand years ago King David made Jerusalem the capital of the people of Israel.
L בנו של דוד, המלך שלמה, בנה בירושלים את בית המקדש הראשון. זה היה בית גדול ויפה לתפילה.|ابن داود، الملك سليمان، بنى في القدس الهيكل الأول. كان بيتًا كبيرًا وجميلًا للصلاة.|Сын Давида, царь Соломон, построил в Иерусалиме Первый Храм. Это был большой и красивый дом для молитвы.|David's son, King Solomon, built the First Temple in Jerusalem. It was a big, beautiful house of prayer.
L אחר כך נבנה בית מקדש שני. מהבית הזה נשארה חומה אחת, הכותל המערבי.|بعد ذلك بُني هيكل ثانٍ. ومن ذلك البيت بقي جدار واحد، هو حائط البراق (الحائط الغربي).|Потом построили Второй Храм. От него осталась одна стена - Западная стена.|Later a Second Temple was built. One wall of that place is still standing: the Western Wall.
L החומה שמקיפה את העיר העתיקה נבנתה לפני כחמש מאות שנה. עד היום מטיילים בה.|السور الذي يحيط بالبلدة القديمة بُني قبل نحو خمسمئة سنة. وما زال الناس يتجوّلون فيه حتى اليوم.|Стена вокруг Старого города построена около пятисот лет назад. По ней гуляют и сегодня.|The wall around the Old City was built about five hundred years ago. People still walk along it today.
L בירושלים יש מקומות קדושים ליהודים, למוסלמים ולנוצרים. אנשים מכל העולם באים לבקר בה.|في القدس أماكن مقدّسة لليهود وللمسلمين وللمسيحيين. ويأتي الناس من كل العالم لزيارتها.|В Иерусалиме есть места, святые для евреев, мусульман и христиан. Люди со всего мира приезжают сюда.|Jerusalem has places holy to Jews, Muslims and Christians. People from all over the world come to visit.
Q איזה מלך עשה את ירושלים לבירה לפני כשלושת אלפים שנה?|أي ملك جعل القدس عاصمة قبل نحو ثلاثة آلاف سنة؟|Какой царь сделал Иерусалим столицей около трёх тысяч лет назад?|Which king made Jerusalem the capital about three thousand years ago?|king_david|king_solomon,ben_gurion,herzl
Q מי בנה את בית המקדש הראשון?|من بنى الهيكل الأول؟|Кто построил Первый Храм?|Who built the First Temple?|king_solomon|king_david,ben_gurion,herzl
Q איזו חומה נשארה מבית המקדש?|أي جدار بقي من الهيكل؟|Какая стена осталась от Храма?|Which wall is left from the Temple?|kotel|w_great,w_jericho,w_berlin
Q לפני כמה זמן נבנתה החומה של העיר העתיקה?|قبل كم من الزمن بُني سور البلدة القديمة؟|Когда построили стену Старого города?|How long ago was the wall of the Old City built?|a500|a5,a50,a20
Q מי מבקר בירושלים?|من يزور القدس؟|Кто приезжает в Иерусалим?|Who visits Jerusalem?|v_all|v_none,v_birds,v_kings
S macc|🕎|#c92a2a|המכבים וחנוכה|المكابيون وعيد الحانوكا|Маккавеи и Ханука|The Maccabees and Hanukkah
L לפני יותר משני אלפים שנה שלטו בארץ מלכים יוונים. הם אסרו על היהודים לקיים את המנהגים שלהם.|قبل أكثر من ألفي سنة حكم الأرضَ ملوك يونانيون. منعوا اليهود من ممارسة عاداتهم.|Больше двух тысяч лет назад страной правили греческие цари. Они запретили евреям соблюдать их обычаи.|More than two thousand years ago Greek kings ruled the land. They did not let the Jews keep their customs.
L יהודה המכבי ואחיו לא הסכימו. הם יצאו להילחם, והיו מעטים מול צבא גדול.|لم يوافق يهوذا المكابي وإخوته. خرجوا للقتال، وكانوا قلّة أمام جيش كبير.|Иуда Маккавей и его братья не согласились. Они вышли на бой, хотя их было мало, а армия была большая.|Judah Maccabee and his brothers refused. They went out to fight, a few against a big army.
L המכבים ניצחו וחזרו לירושלים. בית המקדש היה מלוכלך, והם ניקו אותו וחנכו אותו מחדש.|انتصر المكابيون وعادوا إلى القدس. كان الهيكل متّسخًا، فنظّفوه وافتتحوه من جديد.|Маккавеи победили и вернулись в Иерусалим. Храм был осквернён, и они очистили его и освятили заново.|The Maccabees won and came back to Jerusalem. The Temple was dirty, so they cleaned it and dedicated it again.
L מספרים שמצאו רק כד אחד קטן של שמן, אבל הוא דלק שמונה ימים.|يُحكى أنهم وجدوا جرّة صغيرة واحدة فقط من الزيت، لكنها بقيت مشتعلة ثمانية أيام.|Рассказывают, что нашли только один маленький кувшин масла, но он горел восемь дней.|The story says they found only one small jar of oil, but it burned for eight days.
L לכן בחנוכה מדליקים נרות במשך שמונה ימים, ואוכלים סופגניות ולביבות מטוגנות בשמן.|لذلك نُشعل في الحانوكا الشموع ثمانية أيام، ونأكل كعك السوفغانيوت والفطائر المقلية بالزيت.|Поэтому на Хануку восемь дней зажигают свечи и едят пончики и оладьи, жаренные в масле.|So on Hanukkah we light candles for eight days, and eat doughnuts and latkes fried in oil.
Q איזה חג מספר על המכבים?|أي عيد يحكي عن المكابيين؟|Какой праздник рассказывает о Маккавеях?|Which holiday tells about the Maccabees?|hanukkah|purim,sukkot,tubishvat
Q מי היה המנהיג של המכבים?|من كان قائد المكابيين؟|Кто был вождём Маккавеев?|Who was the leader of the Maccabees?|judah|king_david,herzl,ben_gurion
Q מה המכבים עשו כשחזרו לירושלים?|ماذا فعل المكابيون عندما عادوا إلى القدس؟|Что сделали Маккавеи, вернувшись в Иерусалим?|What did the Maccabees do when they came back to Jerusalem?|m_clean|m_leave,m_sell,m_hide
Q כמה ימים הדליק השמן, לפי הסיפור?|كم يومًا اشتعل الزيت حسب القصة؟|Сколько дней горело масло, по рассказу?|How many days did the oil burn, according to the story?|d8|d3,d5,d10
Q מה מדליקים בחנוכה במשך שמונה ימים?|ماذا نُشعل في الحانوكا طوال ثمانية أيام؟|Что зажигают на Хануку восемь дней?|What do we light for eight days on Hanukkah?|candles|fireworks,bonfire,flashlights
Q מה אוכלים בחנוכה?|ماذا نأكل في الحانوكا؟|Что едят на Хануку?|What do we eat on Hanukkah?|sufg|matza,hamantash,figs
S anc|🏛️|#b08900|עמים בעולם העתיק|شعوب العالم القديم|народы древнего мира|Peoples of the Ancient World
L במצרים העתיקה חיו מלכים שנקראו פרעוֹנים. הם בנו פירמידות גדולות, ושם קברו אותם.|في مصر القديمة عاش ملوك اسمهم الفراعنة. بنوا أهرامات كبيرة ودُفنوا فيها.|В Древнем Египте жили цари, которых называли фараонами. Они строили большие пирамиды, и там их хоронили.|In ancient Egypt lived kings called pharaohs. They built big pyramids, and were buried in them.
L המצרים גרו ליד נהר גדול, הנילוס. המים עזרו להם לגדל אוכל.|سكن المصريون قرب نهر كبير هو النيل. وساعدتهم مياهه على زراعة الطعام.|Египтяне жили у большой реки - Нила. Вода помогала им выращивать еду.|The Egyptians lived by a big river, the Nile. Its water helped them grow food.
L ביוון העתיקה התחילו את המשחקים האולימפיים. רצו ותחרו שם, ואחר כך זה הפך למשחקים שיש גם היום.|في اليونان القديمة بدأت الألعاب الأولمبية. كانوا يركضون ويتنافسون، وصارت بعد ذلك الألعاب التي نراها اليوم.|В Древней Греции начались Олимпийские игры. Там бегали и соревновались, а потом из этого получились игры, которые проводят и сегодня.|The Olympic Games began in ancient Greece. People ran and competed there, and it became the games we still have today.
L הרומאים בנו כבישים ארוכים וגם תעלות מים גבוהות שנקראות אמות מים. אחת מהן עומדת בקיסריה בארץ ישראל.|بنى الرومان طرقًا طويلة وقنوات مياه عالية تُسمّى قنوات الري (الأقنية). واحدة منها ما زالت قائمة في قيسارية.|Римляне строили длинные дороги и высокие каналы для воды - акведуки. Один из них стоит в Кесарии в Израиле.|The Romans built long roads and tall water channels called aqueducts. One of them still stands in Caesarea in Israel.
L מכל העמים האלה למדנו דברים: כתב, ספורט, בנייה ועוד. גם היום אנחנו משתמשים בהם.|تعلّمنا من كل هذه الشعوب أشياء: الكتابة والرياضة والبناء وغيرها. ونحن نستخدمها حتى اليوم.|От всех этих народов мы многому научились: письму, спорту, строительству и другому. Мы пользуемся этим и сегодня.|From all these peoples we learned things: writing, sports, building and more. We still use them today.
Q איך קראו למלכים של מצרים העתיקה?|ماذا كانوا يسمّون ملوك مصر القديمة؟|Как называли царей Древнего Египта?|What were the kings of ancient Egypt called?|pharaoh|emperor,sultan,president
Q מה בנו המצרים כדי לקבור את המלכים?|ماذا بنى المصريون ليدفنوا الملوك؟|Что строили египтяне, чтобы хоронить царей?|What did the Egyptians build to bury their kings?|w_pyr|w_towers,w_boats,w_tents
Q ליד איזה נהר גרו המצרים?|قرب أي نهر سكن المصريون؟|У какой реки жили египтяне?|By which river did the Egyptians live?|nile|jordan,tiber,thames
Q באיזה מקום התחילו המשחקים האולימפיים?|أين بدأت الألعاب الأولمبية؟|Где начались Олимпийские игры?|Where did the Olympic Games begin?|greece|egypt_c,rome_c,china_c
Q מי בנה אמות מים וכבישים ארוכים?|من بنى قنوات المياه والطرق الطويلة؟|Кто строил акведуки и длинные дороги?|Who built aqueducts and long roads?|romans|aliens,pirates,vikings
Q באיזה מקום בארץ ישראל עומדת אמת מים רומית?|أين تقف قناة مياه رومانية في أرض إسرائيل؟|В каком месте в Израиле стоит римский акведук?|Where in Israel does a Roman aqueduct stand?|caesarea|eilat,safed,haifa_x
S exile|🧳|#1971c2|גלות ושיבה|الشتات والعودة|изгнание и возвращение|Exile and Return
L לפני כאלפיים שנה הרומאים החריבו את בית המקדש בירושלים. הרבה יהודים נאלצו לעזוב את הארץ.|قبل نحو ألفي سنة دمّر الرومان الهيكل في القدس. واضطرّ كثير من اليهود إلى ترك البلاد.|Около двух тысяч лет назад римляне разрушили Храм в Иерусалиме. Многим евреям пришлось покинуть страну.|About two thousand years ago the Romans destroyed the Temple in Jerusalem. Many Jews had to leave the land.
L יהודים התפזרו בארצות רבות: בספרד, בבבל, בתימן, באתיופיה, בפולין ועוד. את זה קוראים גלות.|تفرّق اليهود في بلاد كثيرة: في إسبانيا وبابل واليمن وإثيوبيا وبولندا وغيرها. وهذا يُسمّى الشتات.|Евреи рассеялись по многим странам: Испания, Вавилон, Йемен, Эфиопия, Польша и другие. Это называют изгнанием.|Jews spread to many countries: Spain, Babylon, Yemen, Ethiopia, Poland and more. This is called exile.
L בכל מקום היהודים שמרו על החגים, על התפילות ועל השפה העברית. הם התפללו לכיוון ירושלים.|في كل مكان حافظ اليهود على الأعياد والصلوات واللغة العبرية. وصلّوا باتجاه القدس.|Везде евреи сохраняли праздники, молитвы и иврит. Они молились, обратившись лицом к Иерусалиму.|Everywhere Jews kept the holidays, the prayers and the Hebrew language. They prayed facing Jerusalem.
L גם בארץ ישראל נשארו יהודים לאורך כל השנים, בערים כמו צפת, טבריה וירושלים.|وبقي يهود في أرض إسرائيل على مرّ السنين، في مدن مثل صفد وطبريا والقدس.|И в Земле Израиля евреи жили все эти годы, в таких городах, как Цфат, Тверия и Иерусалим.|Jews also stayed in the Land of Israel all through the years, in cities like Safed, Tiberias and Jerusalem.
L במשך שנים רבות היהודים חלמו לחזור לארץ. בסוף החלום הזה התחיל להתגשם.|حلم اليهود سنوات طويلة بالعودة إلى البلاد. وفي النهاية بدأ هذا الحلم يتحقّق.|Много лет евреи мечтали вернуться в страну. В конце концов эта мечта начала сбываться.|For many years Jews dreamed of coming back to the land. In the end the dream began to come true.
Q מי החריב את בית המקדש לפני כאלפיים שנה?|من دمّر الهيكل قبل نحو ألفي سنة؟|Кто разрушил Храм около двух тысяч лет назад?|Who destroyed the Temple about two thousand years ago?|romans|greeks_p,egyptians_p,vikings
Q איך קוראים לזמן שבו יהודים חיו הרחק מארץ ישראל?|ماذا نسمّي الزمن الذي عاش فيه اليهود بعيدًا عن أرض إسرائيل؟|Как называют время, когда евреи жили далеко от Земли Израиля?|What do we call the time Jews lived far from the Land of Israel?|galut|aliya_w,holiday_w,picnic_w
Q לאיזה כיוון התפללו היהודים בכל העולם?|إلى أي اتجاه صلّى اليهود في كل العالم؟|В какую сторону молились евреи по всему миру?|Toward which place did Jews all over the world pray?|jlm|tlv,haifa,eilat
Q מה היהודים שמרו עליו בכל מקום שחיו בו?|على ماذا حافظ اليهود في كل مكان عاشوا فيه؟|Что евреи сохраняли везде, где жили?|What did Jews keep wherever they lived?|k_holidays|k_nothing,k_bags,k_swim
Q באיזו עיר נשארו יהודים בארץ במשך השנים?|في أي مدينة بقي يهود في البلاد على مرّ السنين؟|В каком городе жили евреи в стране все эти годы?|In which city did Jews stay in the land through the years?|safed|moscow,paris,cairo
S zion|🌅|#e8590c|הרצל והחלום לשוב לארץ|هرتسل وحلم العودة إلى البلاد|Герцль и мечта вернуться в страну|Herzl and the Dream of Returning
L לפני יותר ממאה שנה חי עיתונאי בשם בנימין זאב הרצל. הוא ראה שיהודים רבים סובלים באירופה.|قبل أكثر من مئة سنة عاش صحفي اسمه بنيامين زئيف هرتسل. رأى أن كثيرًا من اليهود يعانون في أوروبا.|Больше ста лет назад жил журналист по имени Биньямин Зеэв Герцль. Он видел, что многим евреям в Европе тяжело.|More than a hundred years ago there lived a journalist named Binyamin Ze'ev Herzl. He saw that many Jews suffered in Europe.
L הרצל חשב שליהודים צריך להיות בית משלהם, בארץ ישראל. הרעיון הזה נקרא ציונות.|رأى هرتسل أنه يجب أن يكون لليهود بيت خاص بهم في أرض إسرائيل. وهذه الفكرة تُسمّى الصهيونية.|Герцль считал, что у евреев должен быть свой дом в Земле Израиля. Эта идея называется сионизмом.|Herzl thought the Jews needed a home of their own in the Land of Israel. This idea is called Zionism.
L בשנת 1897 הוא כינס אנשים מכל העולם לקונגרס בעיר בזל שבשווייץ. זה היה הקונגרס הציוני הראשון.|في سنة 1897 جمع الناس من كل العالم في مؤتمر في مدينة بازل في سويسرا. كان هذا المؤتمر الصهيوني الأول.|В 1897 году он собрал людей со всего мира на конгресс в городе Базель в Швейцарии. Это был первый сионистский конгресс.|In 1897 he gathered people from all over the world at a congress in the city of Basel in Switzerland. It was the first Zionist Congress.
L הרצל אמר משפט מפורסם: ״אם תרצו, אין זו אגדה״. הוא התכוון שחלום אפשר להגשים אם עובדים בשבילו.|قال هرتسل جملة مشهورة: «إن شئتم فلا تكون هذه أسطورة». قصد أن الحلم يمكن أن يتحقّق إذا عملنا من أجله.|Герцль сказал известную фразу: «Если вы захотите, это не сказка». Он имел в виду, что мечта может сбыться, если над ней работать.|Herzl said a famous sentence: "If you will it, it is no dream." He meant that a dream can come true if we work for it.
L אנשים התחילו לעלות לארץ. הם יבשו ביצות, נטעו עצים והקימו יישובים חדשים, כמו דגניה, הקיבוץ הראשון.|بدأ الناس يهاجرون إلى البلاد. جفّفوا المستنقعات وزرعوا الأشجار وأقاموا بلدات جديدة، مثل دجانيا، أول كيبوتس.|Люди стали приезжать в страну. Они осушали болота, сажали деревья и строили новые поселения, например Дгания - первый кибуц.|People began to come to the land. They drained swamps, planted trees and built new communities, like Degania, the first kibbutz.
Q מי היה העיתונאי שחלם על בית ליהודים בארץ ישראל?|من كان الصحفي الذي حلم ببيت لليهود في أرض إسرائيل؟|Какой журналист мечтал о доме для евреев в Земле Израиля?|Which journalist dreamed of a home for the Jews in the Land of Israel?|herzl|king_david,judah,ben_gurion
Q איך קוראים לרעיון שליהודים יש בית בארץ ישראל?|ماذا نسمّي فكرة أن يكون لليهود بيت في أرض إسرائيل؟|Как называется идея, что у евреев должен быть дом в Земле Израиля?|What is the idea of a Jewish home in the Land of Israel called?|zionism|geo_c,arch_c,democ_c
Q באיזו עיר נערך הקונגרס הציוני הראשון?|في أي مدينة عُقد المؤتمر الصهيوني الأول؟|В каком городе прошёл первый сионистский конгресс?|In which city was the first Zionist Congress held?|basel|rome_c,cairo,tlv
Q באיזו שנה נערך הקונגרס הציוני הראשון?|في أي سنة عُقد المؤتمر الصهيوني الأول؟|В каком году прошёл первый сионистский конгресс?|In which year was the first Zionist Congress held?|y1897|y1997,y1797,y1947
Q מה הקיבוץ הראשון, שהוקם ליד הכנרת?|ما اسم أول كيبوتس أُقيم قرب بحيرة طبريا؟|Как называется первый кибуц, основанный у озера Кинерет?|What is the first kibbutz, which was built near the Sea of Galilee?|degania|eilat,haifa,safed
Q מה עשו העולים החדשים באדמה?|ماذا فعل المهاجرون الجدد في الأرض؟|Что делали новые репатрианты на земле?|What did the new immigrants do on the land?|m_plant|m_sleep,m_sell,m_hide
S hebrew|🗣️|#0b7285|העברית חוזרת לדבר|العبرية تعود إلى الكلام|иврит снова становится разговорным|Hebrew Comes Back to Speech
L במשך שנים רבות כתבו וקראו בעברית, אבל כמעט לא דיברו בה בבית ובשוק. דיברו רוסית, ערבית, אידיש, לדינו ושפות אחרות.|لسنوات طويلة كانوا يكتبون ويقرؤون بالعبرية، لكنهم لم يتحدّثوا بها تقريبًا في البيت والسوق. تحدّثوا الروسية والعربية والييدية واللادينو ولغات أخرى.|Много лет на иврите писали и читали, но почти не говорили в доме и на рынке. Говорили по-русски, по-арабски, на идиш, на ладино и на других языках.|For many years people wrote and read in Hebrew, but hardly spoke it at home or in the market. They spoke Russian, Arabic, Yiddish, Ladino and other languages.
L אליעזר בן־יהודה חשב שעם צריך לדבר בשפה אחת משלו. הוא החליט לדבר עברית כל יום, גם בבית.|رأى إليعيزر بن يهودا أن الشعب يجب أن يتكلّم بلغة واحدة خاصة به. وقرّر أن يتكلّم العبرية كل يوم، حتى في البيت.|Элиэзер Бен-Йехуда считал, что народу нужен один общий язык. Он решил говорить на иврите каждый день, даже дома.|Eliezer Ben-Yehuda thought a people needed one language of its own. He decided to speak Hebrew every day, even at home.
L חסרו מילים לדברים חדשים, כמו ״מחברת״ או ״גלידה״. בן־יהודה המציא מילים חדשות וכתב מילון.|كانت تنقص كلمات لأشياء جديدة، مثل «دفتر» أو «بوظة». اخترع بن يهودا كلمات جديدة وكتب قاموسًا.|Не хватало слов для новых вещей. Бен-Йехуда придумывал новые слова и написал словарь.|There were no words for new things. Ben-Yehuda invented new words and wrote a dictionary.
L ילדים בבתי ספר התחילו ללמוד בעברית, ואט אט כולם דיברו אותה ברחוב ובחנות.|بدأ الأطفال في المدارس يتعلّمون بالعبرية، وشيئًا فشيئًا صار الجميع يتحدّثون بها في الشارع والمتجر.|Дети в школах начали учиться на иврите, и постепенно все стали говорить на нём на улице и в магазине.|Children in schools began to learn in Hebrew, and little by little everyone spoke it in the street and the shop.
L היום מדברים עברית מיליוני אנשים. זו שפה עתיקה שחזרה לחיים.|اليوم يتحدّث العبرية ملايين الناس. إنها لغة قديمة عادت إلى الحياة.|Сегодня на иврите говорят миллионы людей. Это древний язык, который вернулся к жизни.|Today millions of people speak Hebrew. It is an ancient language that came back to life.
Q מי עזר להחזיר את העברית לשפה מדוברת?|من ساعد في إعادة العبرية لغةً محكيّة؟|Кто помог вернуть иврит как разговорный язык?|Who helped bring Hebrew back as a spoken language?|ben_yehuda|king_solomon,pharaoh,judah
Q מה כתב אליעזר בן־יהודה?|ماذا كتب إليعيزر بن يهودا؟|Что написал Элиэзер Бен-Йехуда?|What did Eliezer Ben-Yehuda write?|dictionary|cookbook,map_b,song_b
Q איפה בן־יהודה החליט לדבר עברית?|أين قرّر بن يهودا أن يتكلّم العبرية؟|Где Бен-Йехуда решил говорить на иврите?|Where did Ben-Yehuda decide to speak Hebrew?|home_all|only_syn,only_book,only_army
Q איזו שפה עתיקה של העם היהודי כמעט לא דיברו ביום-יום לפני בן־יהודה?|أي لغة قديمة للشعب اليهودي لم يكونوا يتحدّثون بها تقريبًا في الحياة اليومية قبل بن يهودا؟|Какой древний язык еврейского народа почти не использовали в быту до Бен-Йехуды?|Which ancient language of the Jewish people was hardly spoken in daily life before Ben-Yehuda?|hebrew_l|french_l,japanese_l,swahili_l
Q מה בן־יהודה עשה כשחסרו מילים?|ماذا فعل بن يهودا عندما نقصت الكلمات؟|Что делал Бен-Йехуда, когда не хватало слов?|What did Ben-Yehuda do when words were missing?|invent|stopped,cried_b,hide_b
S state|🇮🇱|#1c7ed6|הקמת מדינת ישראל|قيام دولة إسرائيل|создание государства Израиль|The Founding of the State of Israel
L אחרי שנים רבות של עלייה ובנייה, יהודים רבים רצו מדינה משלהם. ב־29 בנובמבר 1947 האו״ם החליט לחלק את הארץ לשתי מדינות, יהודית וערבית.|بعد سنوات طويلة من الهجرة والبناء، أراد كثير من اليهود دولة خاصة بهم. في 29 تشرين الثاني 1947 قرّرت الأمم المتحدة تقسيم البلاد إلى دولتين، يهودية وعربية.|После многих лет репатриации и строительства многие евреи захотели иметь своё государство. 29 ноября 1947 года ООН решила разделить страну на два государства - еврейское и арабское.|After many years of immigration and building, many Jews wanted a country of their own. On November 29, 1947 the United Nations decided to divide the land into two states, one Jewish and one Arab.
L ב־5 באייר תש״ח, 14 במאי 1948, עמד דוד בן־גוריון במוזיאון בתל אביב והכריז על הקמת מדינת ישראל.|في 5 أيار العبري (14 أيار 1948) وقف دافيد بن غوريون في متحف في تل أبيب وأعلن قيام دولة إسرائيل.|5 ияра 5708 года (14 мая 1948) Давид Бен-Гурион стоял в музее в Тель-Авиве и объявил о создании государства Израиль.|On the 5th of Iyar (May 14, 1948) David Ben-Gurion stood in a museum in Tel Aviv and announced the founding of the State of Israel.
L את ההכרזה קראו בקול רם, ואנשים ברחוב שמעו אותה ברדיו ושמחו. זה היה היום הראשון של המדינה.|قُرئ الإعلان بصوت عالٍ، وسمعه الناس في الشارع في الراديو وفرحوا. كان هذا اليوم الأول للدولة.|Декларацию прочитали вслух, и люди на улицах слушали её по радио и радовались. Это был первый день государства.|The declaration was read out loud, and people in the street heard it on the radio and were happy. It was the first day of the state.
L דוד בן־גוריון היה ראש הממשלה הראשון, וחיים ויצמן היה הנשיא הראשון.|كان دافيد بن غوريون أول رئيس للحكومة، وكان حاييم وايزمان أول رئيس للدولة.|Давид Бен-Гурион был первым премьер-министром, а Хаим Вейцман - первым президентом.|David Ben-Gurion was the first Prime Minister, and Chaim Weizmann was the first President.
L ההמנון של ישראל הוא ״התקווה״. כל שנה חוגגים את יום העצמאות ושרים אותו.|نشيد إسرائيل هو «هتكفا». وكل سنة نحتفل بيوم الاستقلال ونغنّيه.|Гимн Израиля - «Ха-Тиква». Каждый год мы празднуем День независимости и поём его.|Israel's anthem is "Hatikvah". Every year we celebrate Independence Day and sing it.
Q מי הכריז על הקמת המדינה?|من أعلن قيام الدولة؟|Кто объявил о создании государства?|Who announced the founding of the State?|ben_gurion|herzl,king_david,golda
Q באיזו שנה הוקמה מדינת ישראל?|في أي سنة قامت دولة إسرائيل؟|В каком году было создано государство Израиль?|In which year was the State of Israel founded?|y1948|y1938,y1958,y1968
Q באיזו עיר הוכרזה הקמת המדינה?|في أي مدينة أُعلن قيام الدولة؟|В каком городе объявили о создании государства?|In which city was the founding of the State announced?|tlv|jlm,haifa,eilat
Q מי היה ראש הממשלה הראשון?|من كان أول رئيس حكومة؟|Кто был первым премьер-министром?|Who was the first Prime Minister?|ben_gurion|weizmann,herzl,golda
Q איך קוראים להמנון של ישראל?|ماذا يُسمّى نشيد إسرائيل؟|Как называется гимн Израиля?|What is Israel's anthem called?|hatikva|hava,shalom_song,lullaby
Q איזה חג חוגגים על הקמת המדינה?|أي عيد نحتفل به بمناسبة قيام الدولة؟|Какой праздник отмечают в честь создания государства?|Which holiday do we celebrate for the founding of the State?|indep|purim,sukkot,hanukkah
S aliyah|✈️|#2b8a3e|עולים חדשים מכל העולם|مهاجرون جدد من كل العالم|новые репатрианты со всего мира|New Immigrants from All Over the World
L אחרי הקמת המדינה הגיעו אליה יהודים רבים מארצות שונות. מי שמגיע לגור בישראל נקרא עולה חדש.|بعد قيام الدولة وصل إليها كثير من اليهود من بلاد مختلفة. ومن يأتي ليسكن في إسرائيل يُسمّى مهاجرًا جديدًا (عوليه).|После создания государства в него приехали многие евреи из разных стран. Тот, кто приезжает жить в Израиль, называется новым репатриантом.|After the State was founded, many Jews came to it from different countries. Someone who comes to live in Israel is called a new immigrant.
L בשנים 1949 ו־1950 מטוסים הביאו כמעט כל יהודי תימן לישראל. המבצע נקרא ״על כנפי נשרים״, ובפי כולם ״מרבד הקסמים״.|في عامي 1949 و1950 نقلت الطائرات تقريبًا كل يهود اليمن إلى إسرائيل. اسم العملية «على أجنحة النسور»، ويقول عنها الناس «بساط الريح».|В 1949 и 1950 годах самолёты привезли в Израиль почти всех евреев Йемена. Операция называлась «На крыльях орлов», а в народе - «Ковёр-самолёт».|In 1949 and 1950 planes brought almost all the Jews of Yemen to Israel. The operation was called "On Eagles' Wings", and many call it "Magic Carpet".
L יהודים הגיעו גם ממרוקו, מעיראק, מפולין, מרומניה ועוד. כל קבוצה הביאה אוכל, מוזיקה ומנהגים משלה.|ووصل يهود أيضًا من المغرب والعراق وبولندا ورومانيا وغيرها. وجاءت كل مجموعة بطعامها وموسيقاها وعاداتها.|Евреи приехали и из Марокко, Ирака, Польши, Румынии и других стран. Каждая группа привезла свою еду, музыку и обычаи.|Jews also came from Morocco, Iraq, Poland, Romania and more. Each group brought its own food, music and customs.
L בשנות התשעים הגיעו מאות אלפי עולים מברית המועצות לשעבר, ובהם רופאים, מוזיקאים ומדענים.|في التسعينيات وصل مئات الآلاف من المهاجرين من الاتحاد السوفييتي السابق، منهم أطباء وموسيقيون وعلماء.|В девяностые годы приехали сотни тысяч репатриантов из бывшего Советского Союза, среди них врачи, музыканты и учёные.|In the 1990s hundreds of thousands of immigrants came from the former Soviet Union, among them doctors, musicians and scientists.
L גם מאתיופיה הגיעו עולים, במבצעים גדולים בשנים 1984 ו־1991. היום ישראל היא בית לאנשים מהרבה תרבויות.|وجاء مهاجرون أيضًا من إثيوبيا في عمليات كبيرة في سنتي 1984 و1991. واليوم إسرائيل بيت لأناس من ثقافات كثيرة.|Репатрианты приезжали и из Эфиопии, в больших операциях 1984 и 1991 годов. Сегодня Израиль - дом для людей из многих культур.|Immigrants also came from Ethiopia, in big operations in 1984 and 1991. Today Israel is home to people from many cultures.
Q איך קוראים למי שמגיע לגור בישראל?|ماذا نسمّي من يأتي ليسكن في إسرائيل؟|Как называют того, кто приезжает жить в Израиль?|What do we call someone who comes to live in Israel?|olah|tourist,guest_b,visitor_b
Q מאיזו מדינה הביאו המטוסים כמעט את כל היהודים ב״מרבד הקסמים״?|من أي بلد نقلت الطائرات تقريبًا كل اليهود في «بساط الريح»؟|Из какой страны самолёты привезли почти всех евреев в операции «Ковёр-самолёт»?|From which country did planes bring almost all the Jews in "Magic Carpet"?|yemen|japan,brazil,canada
Q מה כל קבוצת עולים הביאה איתה?|ماذا أحضرت معها كل مجموعة مهاجرين؟|Что привезла с собой каждая группа репатриантов?|What did each group of immigrants bring with them?|food_music|nothing_b,snow_b,sand_b
Q מאיזו מדינה בא גל גדול של עולים בשנות התשעים?|من أي دولة جاءت موجة كبيرة من المهاجرين في التسعينيات؟|Из какой страны приехала большая волна репатриантов в девяностые годы?|From which country did a big wave of immigrants come in the 1990s?|ussr|china_c,egypt_c,peru
Q מאיזו מדינה באפריקה הגיעו עולים בשנים 1984 ו־1991?|من أي بلد في أفريقيا جاء مهاجرون في سنتي 1984 و1991؟|Из какой страны Африки приехали репатрианты в 1984 и 1991 годах?|From which African country did immigrants come in 1984 and 1991?|ethiopia|kenya,nigeria,ghana
S shoah|🕯️|#495057|יום הזיכרון לשואה|يوم ذكرى الكارثة (الشواه)|День памяти Холокоста|Holocaust Remembrance Day
L זה נושא עצוב וחשוב. כדאי ללמוד עליו בעדינות, ואפשר לדבר עליו עם מבוגר.|هذا موضوع حزين ومهم. من الجيّد أن نتعلّم عنه بلطف، ويمكن أن نتحدّث عنه مع شخص بالغ.|Это грустная и важная тема. Лучше узнавать о ней бережно, и можно поговорить об этом со взрослым.|This is a sad and important subject. It is good to learn about it gently, and you can talk about it with a grown-up.
L לפני יותר משמונים שנה, במלחמת העולם השנייה, הנאצים רצחו שישה מיליון יהודים. את זה מכנים השואה.|قبل أكثر من ثمانين سنة، في الحرب العالمية الثانية، قتل النازيون ستة ملايين يهودي. وهذا ما نسمّيه الكارثة (الشواه).|Больше восьмидесяти лет назад, во время Второй мировой войны, нацисты убили шесть миллионов евреев. Это называют Холокостом.|More than eighty years ago, in the Second World War, the Nazis murdered six million Jews. This is called the Holocaust.
L היו גם אנשים טובים שהסתירו יהודים וסיכנו את חייהם. אותם קוראים חסידי אומות העולם.|وكان هناك أيضًا أناس طيّبون أخفوا يهودًا وخاطروا بحياتهم. يُسمّون «حسيدي أومّوت هعولام» (الصالحين بين الأمم).|Были и добрые люди, которые прятали евреев и рисковали жизнью. Их называют Праведниками народов мира.|There were also good people who hid Jews and risked their lives. They are called Righteous Among the Nations.
L בכל שנה יש בישראל יום זיכרון לשואה. מצפצפת סירנה במשך שתי דקות, וכולם עומדים בשקט.|في كل سنة هناك يوم ذكرى للكارثة في إسرائيل. تُطلق صفّارة الإنذار دقيقتين، ويقف الجميع بصمت.|Каждый год в Израиле отмечают День памяти Холокоста. Две минуты звучит сирена, и все стоят молча.|Every year Israel has a Holocaust Remembrance Day. A siren sounds for two minutes, and everyone stands in silence.
L בירושלים יש מוזיאון לזכר השואה, יד ושם. שם שומרים את שמות הנספים ואת הסיפורים שלהם.|في القدس متحف لذكرى الكارثة اسمه «ياد فاشيم». هناك تُحفظ أسماء الضحايا وقصصهم.|В Иерусалиме есть музей памяти Холокоста - Яд ва-Шем. Там хранят имена погибших и их истории.|In Jerusalem there is a museum in memory of the Holocaust, Yad Vashem. It keeps the names and stories of those who were killed.
Q איך מכבדים את הזיכרון ביום השואה?|كيف نُكرم الذكرى في يوم الكارثة؟|Как чтят память в День Холокоста?|How do we honor the memory on Holocaust Remembrance Day?|siren_stand|party,race,shopping
Q כמה זמן מצפצפת הסירנה ביום השואה?|كم تدوم صفّارة الإنذار في يوم الكارثة؟|Сколько длится сирена в День Холокоста?|How long does the siren sound on Holocaust Remembrance Day?|two_min|ten_sec,an_hour,all_day
Q איך קוראים לאנשים שהסתירו יהודים וסיכנו את חייהם?|ماذا نسمّي الناس الذين أخفوا يهودًا وخاطروا بحياتهم؟|Как называют людей, которые прятали евреев и рисковали жизнью?|What are the people who hid Jews and risked their lives called?|righteous|villains,pirates,bakers_c
Q איך קוראים למוזיאון לזכר השואה בירושלים?|ماذا يُسمّى متحف ذكرى الكارثة في القدس؟|Как называется музей памяти Холокоста в Иерусалиме?|What is the Holocaust museum in Jerusalem called?|yadvashem|israelmuseum,zoo_c,science_m
Q למה חשוב לזכור?|لماذا من المهم أن نتذكّر؟|Почему важно помнить?|Why is it important to remember?|remember_why|forget_why,nobody_why,dont_why
S people|🌟|#e64980|אנשים שעשו היסטוריה|أشخاص صنعوا التاريخ|люди, которые творили историю|People Who Made History
L היסטוריה לא עושים רק מלכים. גם אנשים רגילים עם רעיון טוב ועם סבלנות יכולים לשנות דברים.|التاريخ لا يصنعه الملوك فقط. فالناس العاديون أيضًا، بفكرة جيدة وصبر، يمكنهم أن يغيّروا الأشياء.|Историю делают не только цари. Обычные люди с хорошей идеей и терпением тоже могут многое изменить.|History is not made only by kings. Ordinary people with a good idea and patience can also change things.
L בנימין זאב הרצל חלם על בית ליהודים, ואליעזר בן־יהודה החזיר את העברית לדיבור.|حلم بنيامين زئيف هرتسل ببيت لليهود، وأعاد إليعيزر بن يهودا العبرية إلى الكلام.|Биньямин Зеэв Герцль мечтал о доме для евреев, а Элиэзер Бен-Йехуда вернул иврит в разговорную речь.|Binyamin Ze'ev Herzl dreamed of a home for the Jews, and Eliezer Ben-Yehuda brought Hebrew back to speech.
L גולדה מאיר הייתה ראש הממשלה של ישראל משנת 1969 עד 1974. היא האישה היחידה עד היום שהייתה ראש הממשלה.|كانت غولدا مائير رئيسة حكومة إسرائيل من سنة 1969 إلى 1974. وهي المرأة الوحيدة حتى اليوم التي تولّت رئاسة الحكومة.|Голда Меир была премьер-министром Израиля с 1969 по 1974 год. Она единственная женщина, которая занимала этот пост.|Golda Meir was Israel's Prime Minister from 1969 to 1974. She is the only woman so far who was Prime Minister.
L אילן רמון היה האסטרונאוט הישראלי הראשון. הוא טס לחלל בשנת 2003.|كان إيلان رامون أول رائد فضاء إسرائيلي. سافر إلى الفضاء في سنة 2003.|Илан Рамон был первым израильским астронавтом. Он полетел в космос в 2003 году.|Ilan Ramon was the first Israeli astronaut. He flew into space in 2003.
L לכל אחד מאיתנו יש סיפור. אפשר לשאול את המשפחה: מי עשה משהו חשוב, ואיך?|لكل واحد منا قصة. يمكنك أن تسأل العائلة: من فعل شيئًا مهمًّا، وكيف؟|У каждого из нас есть своя история. Можно спросить у семьи: кто сделал что-то важное и как?|Each of us has a story. You can ask your family: who did something important, and how?
Q מי הייתה האישה היחידה שהייתה ראש ממשלה בישראל?|من هي المرأة الوحيدة التي ترأّست الحكومة في إسرائيل؟|Какая женщина была премьер-министром Израиля?|Which woman was Prime Minister of Israel?|golda|esther,miriam,sarah
Q מי היה האסטרונאוט הישראלי הראשון?|من كان أول رائد فضاء إسرائيلي؟|Кто был первым израильским астронавтом?|Who was the first Israeli astronaut?|ramon|herzl,ben_yehuda,ben_gurion
Q מי חלם על בית ליהודים וכינס את הקונגרס הציוני הראשון?|من حلم ببيت لليهود وجمع المؤتمر الصهيوني الأول؟|Кто мечтал о доме для евреев и собрал первый сионистский конгресс?|Who dreamed of a home for the Jews and called the first Zionist Congress?|herzl|ramon,golda,judah
Q מי החזיר את העברית לדיבור?|من أعاد العبرية إلى الكلام؟|Кто вернул иврит в разговорную речь?|Who brought Hebrew back to speech?|ben_yehuda|ramon,golda,weizmann
Q מי היה הנשיא הראשון של ישראל?|من كان أول رئيس للدولة في إسرائيل؟|Кто был первым президентом Израиля?|Who was Israel's first President?|weizmann|ben_gurion,herzl,golda
Q לאן טס אילן רמון?|إلى أين سافر إيلان رامون؟|Куда летал Илан Рамон?|Where did Ilan Ramon fly?|space|bottom_sea,mountain,cave
S treasure|🏛️|#0b7285|אוצרות מהעבר בארץ|كنوز من الماضي في البلاد|сокровища прошлого в нашей стране|Treasures from the Past in Our Land
L בארץ יש הרבה מקומות עתיקים שאפשר לבקר בהם. כל מקום מספר סיפור.|في البلاد أماكن قديمة كثيرة يمكن زيارتها. وكل مكان يحكي قصة.|В нашей стране много древних мест, которые можно посетить. Каждое место рассказывает свою историю.|The land has many ancient places you can visit. Every place tells a story.
L מצדה היא מצודה על הר גבוה ליד ים המלח. המלך הורדוס בנה שם ארמונות לפני יותר מאלפיים שנה.|مسعدة قلعة على جبل عالٍ قرب البحر الميت. بنى الملك هيرودس هناك قصورًا قبل أكثر من ألفي سنة.|Масада - это крепость на высокой горе у Мёртвого моря. Царь Ирод построил там дворцы больше двух тысяч лет назад.|Masada is a fortress on a high mountain near the Dead Sea. King Herod built palaces there more than two thousand years ago.
L בקיסריה יש תיאטרון רומי, נמל עתיק ואמת מים. אפשר לטייל בין הקירות העתיקים.|في قيسارية مسرح روماني وميناء قديم وقناة مياه. يمكنك التجوّل بين الجدران القديمة.|В Кесарии есть римский театр, древний порт и акведук. Можно гулять среди древних стен.|Caesarea has a Roman theater, an ancient port and an aqueduct. You can walk among the old walls.
L בבית שאן חפרו ומצאו עיר רומית שלמה, עם רחוב עם עמודים ותיאטרון גדול.|في بيسان حفروا ووجدوا مدينة رومانية كاملة، فيها شارع بأعمدة ومسرح كبير.|В Бейт-Шеане раскопали целый римский город с улицей с колоннами и большим театром.|In Beit She'an people dug and found a whole Roman city, with a street of columns and a big theater.
L בשנת 1947 ילד רועה מצא במערות ליד ים המלח כדי חרס עם מגילות עתיקות. אלה מגילות ים המלח.|في سنة 1947 وجد راعٍ شاب في كهوف قرب البحر الميت جرارًا فخّارية فيها لفائف قديمة. هذه هي مخطوطات البحر الميت.|В 1947 году молодой пастух нашёл в пещерах у Мёртвого моря глиняные кувшины с древними свитками. Это Кумранские свитки.|In 1947 a young shepherd found clay jars with ancient scrolls in caves near the Dead Sea. These are the Dead Sea Scrolls.
L חלק מהמגילות מוצגות בירושלים, בהיכל הספר במוזיאון ישראל.|يُعرض جزء من المخطوطات في القدس، في «هيخال هاسيفر» في متحف إسرائيل.|Часть свитков выставлена в Иерусалиме, в «Храме книги» в Музее Израиля.|Some of the scrolls are shown in Jerusalem, in the Shrine of the Book at the Israel Museum.
Q איזה מקום הוא מצודה על הר ליד ים המלח?|أي مكان هو قلعة على جبل قرب البحر الميت؟|Какое место - крепость на горе у Мёртвого моря?|Which place is a fortress on a mountain near the Dead Sea?|masada|caesarea,beit_shean,eilat
Q מי בנה ארמונות במצדה?|من بنى قصورًا في مسعدة؟|Кто построил дворцы в Масаде?|Who built palaces at Masada?|herod|ben_gurion,herzl,golda
Q באיזה מקום יש תיאטרון רומי, נמל עתיק ואמת מים?|أين يوجد مسرح روماني وميناء قديم وقناة مياه؟|Где есть римский театр, древний порт и акведук?|Where is there a Roman theater, an ancient port and an aqueduct?|caesarea|masada,eilat,safed
Q מה מצא הרועה במערות ליד ים המלח?|ماذا وجد الراعي في الكهوف قرب البحر الميت؟|Что нашёл пастух в пещерах у Мёртвого моря?|What did the shepherd find in the caves near the Dead Sea?|scrolls|gold_coins_b,dinosaur_b,old_car
Q איפה מציגים חלק ממגילות ים המלח?|أين تُعرض بعض مخطوطات البحر الميت؟|Где выставлена часть Кумранских свитков?|Where are some of the Dead Sea Scrolls shown?|shrine|zoo_c,cinema,market
Q מה עושים כשמבקרים באתר עתיק?|ماذا نفعل عندما نزور موقعًا قديمًا؟|Что делают, когда приходят в древнее место?|What do we do when we visit an ancient site?|careful|climb_walls,take_stones,scribble
`;
