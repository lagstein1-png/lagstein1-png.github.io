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
E s_car|t|במכונית שנוסעת בכביש|بسيارة تسير على الطريق|на машине, едущей по дороге|in a car driving along a road
E s_plane|t|במטוס גדול|بطائرة كبيرة|на большом самолёте|on a big plane
E s_train|t|ברכבת מהירה|بقطار سريع|на быстром поезде|on a fast train
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
E bank|b|סניף הדואר|فرع البريد|почтовое отделение|the post office
E cinema|b|בית הקולנוע|دار السينما|кинотеатр в городе|the cinema in town
E market|b|השוק העירוני|السوق البلدي|городской рынок|the town market
E k_digs|t|חופרים באדמה בזהירות|يحفرون في الأرض بحذر|осторожно копают землю|they dig carefully in the ground
E k_sleep|t|מוכרים את החפצים שמצאו|يبيعون الأشياء التي وجدوها|продают найденные вещи|they sell the things they found
E k_cars|t|בונים בתים חדשים מאבן|يبنون بيوتًا جديدة من الحجر|строят новые дома из камня|they build new houses of stone
E k_swim|t|מציירים ציורים של בתים ישנים|يرسمون لوحات لبيوت قديمة|рисуют картины старых домов|they paint pictures of old houses
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
E w_great|t|החומה הסינית|السور العظيم في الصين|Великая Китайская стена|the Great Wall of China
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
E v_none|t|רק תושבי העיר ירושלים|سكّان مدينة القدس فقط|только жители города Иерусалима|only the people who live in Jerusalem
E v_birds|t|רק אנשים שגרים בישראל|الناس الذين يعيشون في إسرائيل فقط|только люди, живущие в Израиле|only people who live in Israel
E v_kings|t|רק מלכים ונשיאים|الملوك والرؤساء فقط|только цари и президенты|only kings and presidents
E hanukkah|h|חנוכה|الحانوكا|Ханука|Hanukkah
E purim|h|פורים|بوريم|Пурим|Purim
E sukkot|h|סוכות|عيد العُرُش|Суккот|Sukkot
E tubishvat|h|ט״ו בשבט|رأس السنة للأشجار (طو بشباط)|Ту би-Шват|Tu BiShvat
E indep|h|יום העצמאות|يوم الاستقلال|День независимости|Independence Day
E yom_hazikaron|h|יום הזיכרון|يوم الذكرى|День памяти павших|Memorial Day for the Fallen
E yom_yerushalayim|h|יום ירושלים|يوم القدس|День Иерусалима|Jerusalem Day
E m_clean|t|ניקו את בית המקדש וחנכו אותו מחדש|نظّفوا الهيكل وافتتحوه من جديد|очистили Храм и заново освятили его|they cleaned the Temple and dedicated it again
E m_leave|t|עזבו את העיר והלכו לגור במדבר|تركوا المدينة وذهبوا للعيش في الصحراء|покинули город и ушли жить в пустыню|they left the city and went to live in the desert
E m_sell|t|מכרו את בית המקדש לסוחרים שבאו מיוון|باعوا الهيكل لتجّار قدموا من اليونان|продали Храм торговцам, приехавшим из Греции|they sold the Temple to merchants who came from Greece
E m_hide|t|בנו בית מקדש חדש בעיר אחרת|بنوا هيكلًا جديدًا في مدينة أخرى|построили новый Храм в другом городе|they built a new Temple in another city
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
E figs|t|תאנים וחרובים|ثمار التين والخرّوب|инжир и рожковое дерево|figs and carob
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
E canaanites_p|t|הכנענים|الكنعانيون|ханаанеи|the Canaanites
E babylonians_p|t|הבבלים|البابليون|вавилоняне|the Babylonians
E vikings|t|הוויקינגים|الفايكنغ|викинги|the Vikings
E greeks_p|t|היוונים|اليونانيون|греки|the Greeks
E egyptians_p|t|המצרים|المصريون|египтяне|the Egyptians
E caesarea|l|קיסריה|قيسارية|Кесария|Caesarea
E eilat|l|אילת|إيلات|Эйлат|Eilat
E safed|l|צפת|صفد|Цфат|Safed
E haifa_x|l|חיפה|حيفا|Хайфа|Haifa
E galut|t|גלות|شتات (غالوت)|изгнание (галут)|exile
E aliya_w|t|עלייה|الهجرة إلى البلاد (عالياه)|алия|aliyah
E holiday_w|t|שיבת ציון|العودة إلى صهيون|возвращение в Сион|the return to Zion
E picnic_w|t|הגירה|هجرة|миграция|migration
E jlm|l|ירושלים|القدس|Иерусалим|Jerusalem
E tlv|l|תל אביב|تل أبيب|Тель-Авив|Tel Aviv
E haifa|l|חיפה|حيفا|Хайфа|Haifa
E k_holidays|t|את החגים, התפילות והשפה|الأعياد والصلوات واللغة|праздники, молитвы и язык|the holidays, the prayers and the language
E k_nothing|t|רק את הבגדים שלבשו בדרך|فقط الملابس التي لبسوها في الطريق|только одежду, в которой шли|only the clothes they wore on the way
E k_names_e|t|רק את שמות הערים שעזבו|فقط أسماء المدن التي تركوها|только названия городов, которые покинули|only the names of the towns they left
E k_bags|t|רק את התיקים והבגדים שהביאו|فقط الحقائب والملابس التي أحضروها|только чемоданы и одежду, что привезли|only the suitcases and clothes they brought
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
E kinneret_k|l|כנרת|كينيرت|Киннерет|Kinneret
E ein_harod|l|עין חרוד|عين حارود|Эйн-Харод|Ein Harod
E nahalal_k|l|נהלל|نهلال|Нахалаль|Nahalal
E m_plant|t|נטעו עצים ויבשו ביצות|زرعوا الأشجار وجفّفوا المستنقعات|сажали деревья и осушали болота|they planted trees and drained swamps
E m_wait|t|חיכו שהממשלה תבנה להם הכול|انتظروا أن تبني لهم الحكومة كل شيء|ждали, что правительство всё им построит|they waited for the government to build everything for them
E m_mine|t|חפרו מכרות זהב בהרי הגליל|حفروا مناجم ذهب في جبال الجليل|копали золотые шахты в горах Галилеи|they dug gold mines in the hills of the Galilee
E m_sleep|t|קנו בתים מוכנים מהתושבים|اشتروا بيوتًا جاهزة من السكان|купили у жителей готовые дома|they bought ready-made houses from the residents
E dictionary|t|מילון|قاموسًا|словарь|a dictionary
E cookbook|t|ספר בישול|كتاب طبخ|книгу рецептов|a cookbook
E map_b|t|מפה של העולם|خريطة للعالم|карту мира|a map of the world
E song_b|t|שיר ילדים|أغنية أطفال|детскую песню|a children's song
E home_all|t|בכל מקום, גם בבית|في كل مكان، حتى في البيت|везде, даже дома|everywhere, even at home
E only_syn|t|רק בבית הכנסת ובתפילה|في الكنيس وفي الصلاة فقط|только в синагоге и в молитве|only in the synagogue and in prayer
E only_book|t|רק בספרים ובמכתבים|في الكتب والرسائل فقط|только в книгах и письмах|only in books and letters
E only_army|t|רק בבית הספר ולא בבית|في المدرسة فقط وليس في البيت|только в школе, но не дома|only at school and not at home
E hebrew_l|t|עברית|العبرية|иврит|Hebrew
E french_l|t|צרפתית|الفرنسية|французский|French
E japanese_l|t|יפנית|اليابانية|японский|Japanese
E swahili_l|t|סוואהילית|السواحيلية|суахили|Swahili
E invent|t|המציא מילים חדשות|اخترع كلمات جديدة|придумывал новые слова|he invented new words
E stopped|t|ויתר והפסיק לדבר עברית בבית|استسلم وتوقّف عن التحدّث بالعبرية في البيت|сдался и перестал говорить на иврите дома|he gave up and stopped speaking Hebrew at home
E cried_b|t|השתמש במילים מרוסית ומאידיש|استعمل كلمات من الروسية واليديشية|использовал слова из русского и идиша|he used words from Russian and Yiddish
E hide_b|t|חיכה שמישהו אחר ימציא מילה|انتظر أن يخترع شخص آخر كلمة|ждал, что слово придумает кто-то другой|he waited for someone else to invent a word
E hatikva|s|התקווה|هتكفا (الأمل)|«Ха-Тиква»|Hatikvah
E hava|s|הבה נגילה|هفا ناغيلا|«Хава нагила»|Hava Nagila
E shalom_song|s|שיר ערש|ترنيمة نوم|колыбельная|a lullaby
E lullaby|s|שיר יום הולדת|أغنية عيد ميلاد|песня на день рождения|a birthday song
E olah|t|עולה חדש|مهاجر جديد (عوليه)|новый репатриант|a new immigrant
E tourist|t|תייר שמבקר לשבוע|سائح يزور لمدة أسبوع|турист, приехавший на неделю|a tourist visiting for a week
E guest_b|t|אורח שבא לביקור|ضيف جاء للزيارة|гость, приехавший в гости|a guest who came to visit
E visitor_b|t|תושב ותיק|مقيم قديم|старожил|a long-time resident
E yemen|g|תימן|اليمن|Йемен|Yemen
E japan|g|יפן|اليابان|Япония|Japan
E brazil|g|ברזיל|البرازيل|Бразилия|Brazil
E canada|g|קנדה|كندا|Канада|Canada
E food_music|t|אוכל, מוזיקה ומנהגים|طعامًا وموسيقى وعادات|еду, музыку и обычаи|food, music and customs
E nothing_b|t|רק מזוודה אחת לכל משפחה|حقيبة واحدة فقط لكل عائلة|только один чемодан на семью|only one suitcase per family
E snow_b|t|בתים מוכנים שחיכו להם|بيوتًا جاهزة كانت بانتظارهم|готовые дома, которые их ждали|ready-made houses that waited for them
E sand_b|t|הרבה זהב ואבנים יקרות|كثيرًا من الذهب والأحجار الكريمة|много золота и драгоценных камней|a lot of gold and precious stones
E ussr|g|ברית המועצות לשעבר|الاتحاد السوفييتي السابق|бывший Советский Союз|the former Soviet Union
E peru|g|פרו|بيرو|Перу|Peru
E usa_c|g|ארצות הברית של אמריקה|الولايات المتحدة الأمريكية|Соединённые Штаты Америки|the United States of America
E france_c|g|צרפת|فرنسا|Франция|France
E argentina_c|g|ארגנטינה|الأرجنتين|Аргентина|Argentina
E ethiopia|g|אתיופיה|إثيوبيا|Эфиопия|Ethiopia
E kenya|g|קניה|كينيا|Кения|Kenya
E nigeria|g|ניגריה|نيجيريا|Нигерия|Nigeria
E ghana|g|גאנה|غانا|Гана|Ghana
E siren_stand|t|עומדים בשקט כשהסירנה מצפצפת|نقف بصمت عندما تُطلق الصفّارة|молча стоят, когда звучит сирена|we stand in silence when the siren sounds
E party|t|עושים מסיבה עם מוזיקה, ריקודים ועוגה|نقيم حفلة مع موسيقى ورقص وكعكة|устраивают вечеринку с музыкой, танцами и тортом|we have a party with music, dancing and cake
E race|t|עורכים מירוץ ריצה גדול בעיר|نُجري سباق جري كبير في المدينة|устраивают большой забег по городу|we hold a big running race in town
E shopping|t|הולכים לקניות בקניון הגדול|نذهب للتسوّق في المركز التجاري الكبير|идут за покупками в большой торговый центр|we go shopping at the big mall
E two_min|t|שתי דקות|دقيقتان|две минуты|two minutes
E ten_sec|t|עשר שניות|عشر ثوانٍ|десять секунд|ten seconds
E an_hour|t|שעה שלמה|ساعة كاملة|целый час|a whole hour
E all_day|t|כל היום|طوال النهار|весь день|all day
E righteous|t|חסידי אומות העולם|الصالحون بين الأمم|Праведники народов мира|Righteous Among the Nations
E survivors_c|t|ניצולי השואה|الناجون من الكارثة (الشواه)|пережившие Холокост|Holocaust survivors
E partisans_c|t|הפרטיזנים|الأنصار (البارتيزان)|партизаны|the partisans
E olim_c|t|העולים החדשים|المهاجرون الجدد (عوليم)|новые репатрианты|the new immigrants
E villains|t|המורים|المعلّمون|учителя|teachers
E bakers_c|t|אופים|خبّازون|пекари|bakers
E yadvashem|b|יד ושם|ياد فاشيم|Яд ва-Шем|Yad Vashem
E israelmuseum|b|מוזיאון ישראל|متحف إسرائيل|Музей Израиля|the Israel Museum
E zoo_c|b|גן החיות|حديقة الحيوان|зоопарк|the zoo
E science_m|b|מוזיאון המדע|متحف العلوم|музей науки|the science museum
E biblelands_m|b|מוזיאון ארצות המקרא בירושלים|متحف بلاد التوراة في القدس|Музей библейских стран в Иерусалиме|the Bible Lands Museum in Jerusalem
E natlib_m|b|הספרייה הלאומית בגבעת רם|المكتبة الوطنية في جفعات رام|Национальная библиотека в Гиват-Раме|the National Library of Israel in Givat Ram
E remember_why|t|כדי ללמוד ולשמור שזה לא יקרה שוב|لنتعلّم ونحرص ألا يتكرّر ذلك|чтобы учиться и беречь, чтобы такое не повторилось|so we learn and care that it never happens again
E forget_why|t|כדי לשכוח מהר ולהמשיך הלאה|لننسى بسرعة ونمضي قدمًا|чтобы быстро забыть и жить дальше|so we can forget quickly and move on
E nobody_why|t|כי זה קרה מזמן ואין לזה קשר אלינו|لأنه حدث منذ زمن بعيد ولا علاقة له بنا|потому что это было давно и нас не касается|because it happened long ago and has nothing to do with us
E dont_why|t|כי רק המבוגרים צריכים לדעת על זה|لأن الكبار وحدهم عليهم أن يعرفوا ذلك|потому что об этом должны знать только взрослые|because only grown-ups need to know about it
E space|t|לחלל|إلى الفضاء|в космос|into space
E bottom_sea|t|לקרקעית הים|إلى قاع البحر|на дно моря|to the bottom of the sea
E mountain|t|לפסגת הר|إلى قمة جبل|на вершину горы|to a mountaintop
E cave|t|למערה|إلى كهف|в пещеру|to a cave
E masada|l|מצדה|مسعدة|Масада|Masada
E beit_shean|l|בית שאן|بيسان (بيت شآن)|Бейт-Шеан|Beit She'an
E scrolls|t|מגילות עתיקות|لفائف قديمة|древние свитки|ancient scrolls
E gold_coins_b|t|מטבעות זהב|عملات ذهبية|золотые монеты|gold coins
E dinosaur_b|t|שלד דינוזאור|هيكل ديناصور|скелет динозавра|a dinosaur skeleton
E old_car|t|מכונית ישנה|سيارة قديمة|старую машину|an old car
E shrine|b|היכל הספר במוזיאון ישראל|هيخال هاسيفر في متحف إسرائيل|«Храм книги» в Музее Израиля|the Shrine of the Book at the Israel Museum
E careful|t|מסתכלים ושומרים על המקום|ننظر ونحافظ على المكان|смотрим и бережём место|we look and take care of the place
E climb_walls|t|מטפסים על הקירות העתיקים|نتسلّق الجدران القديمة|лазаем по древним стенам|we climb on the ancient walls
E take_stones|t|לוקחים אבנים הביתה|نأخذ حجارة إلى البيت|берём камни домой|we take stones home
E scribble|t|מציירים על הקירות|نرسم على الجدران|рисуем на стенах|we draw on the walls
S now|⏳|#c64c0a|עבר, הווה ועתיד|الماضي والحاضر والمستقبل|прошлое, настоящее и будущее|Past, Present and Future
L היום אנחנו בהווה. מה שכבר קרה נקרא עבר. מה שעוד יקרה נקרא עתיד.|اليوم نحن في الحاضر. ما حدث من قبل اسمه الماضي. وما سيحدث بعد ذلك اسمه المستقبل.|Сегодня мы в настоящем. То, что уже случилось, называется прошлым. То, что ещё случится, называется будущим.|Today we are in the present. What already happened is the past. What will happen later is the future.
L ההיסטוריה היא סיפור של העבר: מה קרה, ולמה זה קרה.|التاريخ هو قصة الماضي: ماذا حدث ولماذا حدث.|История - это рассказ о прошлом: что случилось и почему.|History is the story of the past: what happened and why it happened.
L פעם לא היו מכוניות. אנשים נסעו ברגל או בעגלה עם סוס.|في الماضي لم تكن هناك سيارات. كان الناس يسافرون سيرًا على الأقدام أو بعربة يجرّها حصان.|Раньше не было машин. Люди ходили пешком или ездили в повозке с лошадью.|Long ago there were no cars. People walked or rode in a cart pulled by a horse.
L פעם שלחו מכתב בדואר, וחיכו ימים רבים לתשובה. היום שולחים הודעה, והיא מגיעה בשנייה.|في الماضي كانوا يرسلون رسالة بالبريد وينتظرون الجواب أيامًا كثيرة. اليوم نرسل رسالة وتصل خلال ثانية.|Раньше письмо отправляли по почте и много дней ждали ответа. Сегодня мы отправляем сообщение, и оно приходит за секунду.|Long ago people sent a letter by mail and waited many days for an answer. Today we send a message and it arrives in a second.
L גם למשפחה שלכם יש היסטוריה. אפשר לשאול את סבא וסבתא איך היו החיים כשהם היו ילדים.|وللعائلة أيضًا تاريخ. يمكنك أن تسأل جدّك وجدّتك كيف كانت الحياة عندما كانا طفلين.|У вашей семьи тоже есть история. Можно спросить бабушку и дедушку, какой была жизнь, когда они были детьми.|Your family has a history too. You can ask your grandparents what life was like when they were children.
Q איך קוראים למה שקרה אתמול?|ماذا نسمّي ما حدث أمس؟|Как называется то, что случилось вчера?|What do we call what happened yesterday?|past|now,future,always
Y אתמול כבר נגמר, ומה שכבר קרה נקרא עבר.|الأمس انتهى، وما حدث من قبل اسمه الماضي.|Вчерашний день уже прошёл, а то, что уже случилось, называется прошлым.|Yesterday is already over, and what already happened is called the past.
Q איך נקרא הזמן שעוד לא הגיע?|ماذا نسمّي الزمن الذي لم يأتِ بعد؟|Как называется время, которое ещё не наступило?|What do we call the time that has not come yet?|future|past,now,always
Y מה שעוד לא קרה ויקרה אחר כך נקרא עתיד, כמו מחר או השנה הבאה.|ما لم يحدث بعد وسيحدث لاحقًا اسمه المستقبل، مثل الغد أو السنة القادمة.|То, что ещё не случилось и случится потом, называется будущим, например завтрашний день.|What has not happened yet and will come later is the future, like tomorrow or next year.
Q איך נסעו אנשים לפני הרבה שנים, כשלא היו מכוניות?|كيف كان الناس يسافرون قبل سنوات كثيرة عندما لم تكن هناك سيارات؟|Как ездили люди много лет назад, когда не было машин?|How did people travel many years ago, when there were no cars?|s_horse|s_car,s_plane,s_train
Y לפני שהמציאו מכוניות, סוס היה החיה החזקה שמשכה עגלה עם אנשים.|قبل اختراع السيارات كان الحصان هو الحيوان القوي الذي يجرّ العربة بالناس.|До изобретения машин именно лошадь была сильным животным, которое тянуло повозку с людьми.|Before cars were invented, a horse was the strong animal that pulled a cart with people.
Q איך שלחו הודעה למישהו רחוק לפני הרבה שנים?|كيف كانوا يرسلون رسالة إلى شخص بعيد قبل سنوات كثيرة؟|Как отправляли весточку далёкому человеку много лет назад?|How did people send a message to someone far away many years ago?|s_letter|s_video,s_text,s_email
Y לפני הרבה שנים לא היו טלפונים ניידים, ולכן כתבו מכתב ושלחו אותו בדואר.|قبل سنوات كثيرة لم تكن هناك هواتف محمولة، لذلك كتبوا رسالة وأرسلوها بالبريد.|Много лет назад не было мобильных телефонов, поэтому писали письмо и отправляли его по почте.|Long ago there were no mobile phones, so people wrote a letter and sent it by mail.
Q על מה ההיסטוריה מספרת?|عمّ يحدّثنا التاريخ؟|О чём рассказывает история?|What does history tell us about?|h_why|h_weather,h_cook,h_count
Y היסטוריה היא סיפור העבר, והיא לא רק מספרת מה קרה, אלא גם מסבירה למה.|التاريخ قصة الماضي، وهو لا يحكي ماذا حدث فقط، بل يشرح أيضًا لماذا حدث.|История рассказывает о прошлом, и она не только говорит, что случилось, но и объясняет почему.|History is the story of the past, and it tells not only what happened but also why.
Q איזה דבר מהרשימה הוא מהעבר?|أي شيء من هذه القائمة هو من الماضي؟|Что из этого относится к прошлому?|Which of these is from the past?|old_photo|ad_ticket,ad_toy,new_phone
Y תמונה ישנה צולמה לפני הרבה זמן, ולכן היא מראה לנו משהו מהעבר.|الصورة القديمة التُقطت قبل وقت طويل، لذلك تُرينا شيئًا من الماضي.|Старую фотографию сделали давно, поэтому она показывает нам что-то из прошлого.|An old photo was taken a long time ago, so it shows us something from the past.
Q איך קוראים לזמן שבו אנחנו נמצאים עכשיו?|ما اسم الزمن الذي نعيش فيه الآن؟|Как называется время, в котором мы находимся сейчас?|What do we call the time we are in right now?|now|past,future,always
Y הזמן של עכשיו, הרגע שבו אנחנו חיים, נקרא הווה.|الوقت الذي نعيش فيه الآن اسمه الحاضر.|Время, в котором мы живём прямо сейчас, называется настоящим.|The time we are living in right now is called the present.
E xh_pigeon|t|ביונת דואר|بحمامة زاجلة|с почтовым голубем|with a carrier pigeon
E xh_drum|t|בתופים מגבעה לגבעה|بالطبول من تلّة إلى تلّة|барабанами с холма на холм|with drums from hill to hill
Q איך שולחים היום הודעה מהירה לחבר שגר רחוק?|كيف نرسل اليوم رسالة سريعة لصديق يسكن بعيدًا؟|Как сегодня быстро отправить сообщение другу, который живёт далеко?|How do we send a quick message today to a friend who lives far away?|s_text|s_letter,xh_pigeon,xh_drum
Y היום יש לנו טלפון, והודעה בטלפון מגיעה לחבר רחוק בשנייה אחת.|اليوم لدينا هاتف، والرسالة على الهاتف تصل إلى صديق بعيد خلال ثانية.|Сегодня у нас есть телефон, и сообщение в нём доходит до далёкого друга за секунду.|Today we have phones, and a phone message reaches a faraway friend in a second.
E xh_days|t|ימים רבים|أيامًا كثيرة|много дней|many days
E xh_sec|t|שנייה אחת|ثانية واحدة|одну секунду|one second
E xh_min|t|דקה אחת|دقيقة واحدة|одну минуту|one minute
E xh_hour|t|שעה אחת|ساعة واحدة|один час|one hour
Q פעם שלחו מכתב בדואר. כמה זמן חיכו לתשובה?|في الماضي أرسلوا رسالة بالبريد. كم انتظروا الردّ؟|Раньше письма отправляли по почте. Сколько ждали ответа?|Long ago people sent letters by mail. How long did they wait for an answer?|xh_days|xh_sec,xh_min,xh_hour
Y מכתב עבר דרך ארוכה ברכבת או באונייה, ולכן חיכו ימים רבים לתשובה.|كانت الرسالة تقطع طريقًا طويلًا بالقطار أو بالسفينة، لذلك انتظروا الجواب أيامًا كثيرة.|Письмо долго ехало поездом или плыло кораблём, поэтому ответа ждали много дней.|A letter traveled a long way by train or ship, so people waited many days for an answer.
E xh_grand|p|את סבא וסבתא|الجدّ والجدّة|бабушку и дедушку|Grandpa and Grandma
E xh_baby|p|את התינוק של השכנים|طفل الجيران الرضيع|соседского малыша|the neighbors' baby
E xh_brother|p|את אחי הקטן|أخي الصغير|моего младшего брата|my little brother
E xh_doll|p|את הבובה שלי|دميتي|мою куклу|my doll
Q את מי אפשר לשאול איך היו החיים לפני הרבה שנים?|من يمكن أن نسأل كيف كانت الحياة قبل سنوات كثيرة؟|Кого можно спросить, какой была жизнь много лет назад?|Who can we ask what life was like many years ago?|xh_grand|xh_baby,xh_brother,xh_doll
Y סבא וסבתא היו ילדים לפני הרבה שנים, ולכן הם זוכרים איך היו החיים אז.|كان الجدّ والجدّة طفلين قبل سنوات كثيرة، لذلك يتذكّران كيف كانت الحياة آنذاك.|Бабушка и дедушка были детьми много лет назад, поэтому помнят, какой тогда была жизнь.|Grandpa and Grandma were children many years ago, so they remember what life was like then.
S know|🏺|#a0522d|איך יודעים מה היה פעם?|كيف نعرف ماذا كان في الماضي؟|как мы узнаём, что было раньше?|How Do We Know What Happened Long Ago?
L לא היינו שם, ובכל זאת אנחנו יודעים מה קרה לפני אלפי שנים. איך?|لم نكن هناك، ومع ذلك نعرف ماذا حدث قبل آلاف السنين. كيف؟|Нас там не было, но мы знаем, что случилось тысячи лет назад. Как?|We were not there, yet we know what happened thousands of years ago. How?
L ארכאולוגים חופרים באדמה בזהירות ומוצאים חפצים עתיקים: כלים, מטבעות ובתים שנקברו.|يحفر علماء الآثار في الأرض بحذر ويجدون أشياء قديمة: أدوات وعملات وبيوتًا دُفنت.|Археологи осторожно копают землю и находят древние вещи: посуду, монеты и дома, засыпанные землёй.|Archaeologists dig carefully in the ground and find ancient things: tools, coins and buried houses.
L את החפצים שומרים ומציגים במוזיאון, כדי שכולנו נוכל לראות אותם.|تُحفظ الأشياء وتُعرض في المتحف ليتمكّن الجميع من رؤيتها.|Находки хранят и показывают в музее, чтобы все могли их увидеть.|The finds are kept and shown in a museum, so everyone can see them.
L גם כתב מלמד אותנו. כשאדם כתב משהו לפני הרבה שנים, אנחנו יכולים לקרוא מה הוא חשב.|والكتابة أيضًا تعلّمنا. عندما كتب إنسان شيئًا قبل سنوات كثيرة، نستطيع أن نقرأ ماذا كان يفكّر.|Письменность тоже учит нас. Если человек написал что-то много лет назад, мы можем прочитать, о чём он думал.|Writing teaches us too. When a person wrote something long ago, we can read what they thought.
L תמונות ישנות וסיפורים של סבא וסבתא הם גם מקור לעבר. היסטוריון שואל שאלות ובודק מה נכון.|الصور القديمة وحكايات الجدّ والجدّة أيضًا مصدر عن الماضي. المؤرّخ يطرح الأسئلة ويتحقّق مما هو صحيح.|Старые фотографии и рассказы бабушек и дедушек тоже рассказывают о прошлом. Историк задаёт вопросы и проверяет, что правда.|Old photos and grandparents' stories are also sources about the past. A historian asks questions and checks what is true.
Q מי חופר באדמה כדי למצוא חפצים עתיקים?|من يحفر في الأرض ليجد أشياء قديمة؟|Кто копает землю, чтобы найти древние вещи?|Who digs in the ground to find ancient things?|archaeologist|baker,driver,dentist
Y ארכאולוג הוא חוקר שהעבודה שלו היא לחפור באדמה ולמצוא חפצים עתיקים.|عالم الآثار باحث عمله أن يحفر في الأرض ويجد أشياء قديمة.|Работа археолога в том, чтобы копать землю и находить древние вещи.|An archaeologist is a researcher whose job is to dig in the ground and find ancient things.
Q איפה מציגים חפצים עתיקים שנמצאו?|أين تُعرض الأشياء القديمة التي وُجدت؟|Где показывают найденные древние вещи?|Where are the ancient things that were found shown?|museum|bank,cinema,market
Y מוזיאון הוא מקום שבו שומרים חפצים חשובים ומציגים אותם לכולם.|المتحف مكان تُحفظ فيه الأشياء المهمة وتُعرض للجميع.|В музее хранят важные вещи и показывают их всем.|A museum is a place where important things are kept and shown to everyone.
Q מה עושים ארכאולוגים?|ماذا يفعل علماء الآثار؟|Что делают археологи?|What do archaeologists do?|k_digs|k_sleep,k_cars,k_swim
Y ארכאולוגים חופרים לאט ובזהירות, כי חפץ עתיק יכול להישבר בקלות.|يحفر علماء الآثار ببطء وبحذر، لأن الشيء القديم قد ينكسر بسهولة.|Археологи копают медленно и осторожно, ведь древняя вещь может легко сломаться.|Archaeologists dig slowly and carefully, because an ancient object can break easily.
Q איזה חפץ יכול להיות מתקופה עתיקה?|أي شيء يمكن أن يكون من زمن قديم؟|Какая вещь может быть из древних времён?|Which object can be from an ancient time?|k_pot|k_phone,k_toy,k_bag
Y אנשים בעבר עשו כלים מחרס, ולכן סיר חרס יכול להיות חפץ עתיק מאוד.|صنع الناس قديمًا أواني من الفخّار، لذلك قد يكون القدر الفخّاري شيئًا قديمًا جدًا.|В древности люди делали посуду из глины, поэтому глиняный горшок может быть очень старым.|Long ago people made pots from clay, so a clay pot can be a very old object.
Q מה אפשר ללמוד מתמונה ישנה של סבתא?|ماذا نتعلّم من صورة قديمة لجدّتي؟|Что можно узнать из старой фотографии бабушки?|What can we learn from an old photo of grandma?|k_clothes|k_game,k_lunch,k_sky
Y בתמונה רואים את הבגדים של האנשים, ולכן אפשר ללמוד ממנה איך התלבשו פעם.|في الصورة نرى ملابس الناس، لذلك نتعلّم منها كيف كانوا يلبسون في الماضي.|На фотографии видна одежда людей, поэтому по ней можно узнать, как одевались раньше.|A photo shows the clothes people wore, so we can learn from it how people dressed long ago.
Q מה עוזר לנו לדעת מה אנשים חשבו לפני הרבה שנים?|ما الذي يساعدنا على معرفة ما فكّر فيه الناس قبل سنوات كثيرة؟|Что помогает нам узнать, о чём думали люди много лет назад?|What helps us know what people thought many years ago?|w_writing|w_sing,w_color,w_kite
Y מה שאדם כתב נשאר גם אחרי שנים, ולכן אפשר לקרוא היום מה הוא חשב.|ما كتبه الإنسان يبقى بعد سنوات، لذلك نستطيع اليوم أن نقرأ ماذا كان يفكّر.|Написанное человеком сохраняется на годы, поэтому сегодня мы можем прочитать, о чём он думал.|What a person wrote stays for years, so today we can read what they were thinking.
E xh_finds|t|כלים, מטבעות ובתים עתיקים|أواني وعملات وبيوت قديمة|посуду, монеты и древние дома|tools, coins and ancient houses
E xh_phones|t|טלפונים, מחשבים ומכוניות|هواتف وحواسيب وسيارات|телефоны, компьютеры и машины|phones, computers and cars
E xh_newtoys|t|צעצועים חדשים מהחנות|ألعاب جديدة من المتجر|новые игрушки из магазина|new toys from the shop
E xh_bottles|t|בקבוקי מיץ מהשבוע שעבר|زجاجات عصير من الأسبوع الماضي|бутылки сока с прошлой недели|juice bottles from last week
Q מה מוצאים ארכאולוגים באדמה?|ماذا يجد علماء الآثار في الأرض؟|Что археологи находят в земле?|What do archaeologists find in the ground?|xh_finds|xh_phones,xh_newtoys,xh_bottles
Y עם השנים כלים, מטבעות ואפילו בתים נקברו באדמה, ולכן ארכאולוגים מוצאים אותם שם.|مع مرور السنين دُفنت الأدوات والعملات وحتى البيوت في الأرض، لذلك يجدها علماء الآثار هناك.|С годами посуда, монеты и даже дома оказались под землёй, поэтому археологи находят их там.|Over the years tools, coins and even houses got buried, so archaeologists find them in the ground.
E xh_see|t|כדי שכולם יוכלו לראות אותם|لكي يستطيع الجميع رؤيتها|чтобы все могли их увидеть|so that everyone can see them
E xh_sell|t|כדי למכור אותם בזול|لكي يبيعوها بسعر رخيص|чтобы дёшево их продать|so they can sell them cheaply
E xh_hidem|t|כדי להסתיר אותם מכולם|لكي يخفوها عن الجميع|чтобы спрятать их от всех|so they can hide them from everyone
E xh_throw|t|כדי לזרוק אותם בסוף|لكي يرموها في النهاية|чтобы потом их выбросить|so they can throw them away later
Q למה מציגים חפצים עתיקים במוזיאון?|لماذا تُعرض الأشياء القديمة في المتحف؟|Зачем древние вещи выставляют в музее?|Why are ancient objects shown in a museum?|xh_see|xh_sell,xh_hidem,xh_throw
Y חפץ עתיק נמצא רק פעם אחת, ובמוזיאון כל אחד יכול לבוא ולראות אותו.|الشيء القديم يُعثر عليه مرة واحدة، وفي المتحف يستطيع كل واحد أن يأتي ويراه.|Древнюю вещь находят лишь однажды, а в музее каждый может прийти и увидеть её.|An ancient object is found only once, and in a museum anyone can come and see it.
E xh_hist|t|שואל שאלות ובודק מה נכון|يسأل أسئلة ويفحص ما هو صحيح|задаёт вопросы и проверяет, что правда|asks questions and checks what is true
E xh_guess|t|מנחש מה יקרה מחר, בלי לבדוק|يخمّن ماذا سيحدث غدًا دون أن يفحص|угадывает, что будет завтра, и не проверяет|guesses what will happen tomorrow without checking
E xh_builder|t|בונה בתים חדשים|يبني بيوتًا جديدة|строит новые дома|builds new houses
E xh_grow|t|מגדל ירקות בשדה|يزرع الخضار في الحقل|выращивает овощи в поле|grows vegetables in a field
Q מה עושה היסטוריון?|ماذا يفعل المؤرّخ؟|Что делает историк?|What does a historian do?|xh_hist|xh_guess,xh_builder,xh_grow
Y היסטוריון חוקר את העבר, ולכן הוא שואל שאלות ובודק אם מה שמספרים באמת נכון.|المؤرّخ يبحث في الماضي، لذلك يسأل أسئلة ويتحقّق إن كان ما يُحكى صحيحًا فعلًا.|Историк изучает прошлое, поэтому задаёт вопросы и проверяет, правда ли то, что рассказывают.|A historian studies the past, so they ask questions and check whether what people say is really true.
E xh_oldstory|t|סיפור של סבתא על הילדות שלה|قصة الجدّة عن طفولتها|рассказ бабушки о её детстве|Grandma's story about her childhood
E xh_forecast|t|תחזית מזג האוויר למחר|نشرة الطقس لِغد|прогноз погоды на завтра|the weather forecast for tomorrow
E xh_advert|t|פרסומת לטלפון חדש|إعلان عن هاتف جديد|реклама нового телефона|an ad for a new phone
E xh_trip|t|תוכנית לטיול בשבוע הבא|خطة لرحلة في الأسبوع القادم|план поездки на следующей неделе|a plan for a trip next week
Q מה מהדברים האלה מלמד אותנו על העבר?|أيّ من هذه الأشياء يعلّمنا عن الماضي؟|Что из этого рассказывает нам о прошлом?|Which of these teaches us about the past?|xh_oldstory|xh_forecast,xh_advert,xh_trip
Y סבתא מספרת על הילדות שלה, כלומר על דברים שקרו לפני הרבה שנים.|الجدّة تحكي عن طفولتها، أي عن أشياء حدثت قبل سنوات كثيرة.|Бабушка рассказывает о своём детстве, то есть о том, что было много лет назад.|Grandma is telling about her childhood, which means things that happened many years ago.
S jlm|🕍|#7048e8|ירושלים של פעם|القدس في الماضي|Иерусалим в давние времена|Jerusalem Long Ago
L ירושלים היא עיר עתיקה מאוד. אנשים גרים בה כבר יותר מאלפיים שנה.|القدس مدينة قديمة جدًّا. يعيش الناس فيها منذ أكثر من ألفي سنة.|Иерусалим - очень древний город. Люди живут в нём уже больше двух тысяч лет.|Jerusalem is a very old city. People have lived in it for more than two thousand years.
L לפני כשלושת אלפים שנה המלך דוד עשה את ירושלים לבירה של עם ישראל.|قبل نحو ثلاثة آلاف سنة جعل الملك داود القدس عاصمة لشعب إسرائيل.|Около трёх тысяч лет назад царь Давид сделал Иерусалим столицей народа Израиля.|About three thousand years ago King David made Jerusalem the capital of the people of Israel.
L בנו של דוד, המלך שלמה, בנה בירושלים את בית המקדש הראשון. זה היה בית גדול ויפה לתפילה.|ابن داود، الملك سليمان، بنى في القدس الهيكل الأول. كان بيتًا كبيرًا وجميلًا للصلاة.|Сын Давида, царь Соломон, построил в Иерусалиме Первый Храм. Это был большой и красивый дом для молитвы.|David's son, King Solomon, built the First Temple in Jerusalem. It was a big, beautiful house of prayer.
L אחר כך נבנה בית מקדש שני. מהבית הזה נשארה חומה אחת, הכותל המערבי.|بعد ذلك بُني هيكل ثانٍ. ومن ذلك البيت بقي جدار واحد، هو حائط البراق (الحائط الغربي).|Потом построили Второй Храм. От него осталась одна стена - Западная стена.|Later a Second Temple was built. One wall of that place is still standing: the Western Wall.
L החומה שמקיפה את העיר העתיקה נבנתה לפני כחמש מאות שנה. עד היום מטיילים בה.|السور الذي يحيط بالبلدة القديمة بُني قبل نحو خمسمئة سنة. وما زال الناس يتجوّلون فيه حتى اليوم.|Стена вокруг Старого города построена около пятисот лет назад. По ней гуляют и сегодня.|The wall around the Old City was built about five hundred years ago. People still walk along it today.
L בירושלים יש מקומות קדושים ליהודים, למוסלמים ולנוצרים. אנשים מכל העולם באים לבקר בה.|في القدس أماكن مقدّسة لليهود وللمسلمين وللمسيحيين. ويأتي الناس من كل العالم لزيارتها.|В Иерусалиме есть места, святые для евреев, мусульман и христиан. Люди со всего мира приезжают сюда.|Jerusalem has places holy to Jews, Muslims and Christians. People from all over the world come to visit.
Q איזה מלך עשה את ירושלים לבירה לפני כשלושת אלפים שנה?|أي ملك جعل القدس عاصمة قبل نحو ثلاثة آلاف سنة؟|Какой царь сделал Иерусалим столицей около трёх тысяч лет назад?|Which king made Jerusalem the capital about three thousand years ago?|king_david|king_solomon,herod,pharaoh
Y המלך דוד עשה את ירושלים לבירה, ורק אחריו בנו שלמה בנה בה את בית המקדש.|الملك داود هو من جعل القدس عاصمة، وبعده فقط بنى ابنه سليمان الهيكل فيها.|Именно царь Давид сделал Иерусалим столицей, а уже после него его сын Соломон построил там Храм.|King David made Jerusalem the capital, and only after him did his son Solomon build the Temple there.
Q מי בנה את בית המקדש הראשון?|من بنى الهيكل الأول؟|Кто построил Первый Храм?|Who built the First Temple?|king_solomon|king_david,herod,judah
Y דוד עשה את ירושלים לבירה, ובנו המלך שלמה בנה בה את בית המקדש הראשון.|جعل داود القدس عاصمة، ثم بنى ابنه الملك سليمان فيها الهيكل الأول.|Давид сделал Иерусалим столицей, а его сын царь Соломон построил там Первый Храм.|David made Jerusalem the capital, and his son King Solomon built the First Temple there.
Q איזו חומה נשארה מבית המקדש?|أي جدار بقي من الهيكل؟|Какая стена осталась от Храма?|Which wall is left from the Temple?|kotel|w_great,w_jericho,w_berlin
Y מכל מה שבנו סביב בית המקדש השני, נשארה עומדת חומה אחת, הכותל המערבי.|من كل ما بُني حول الهيكل الثاني بقي جدار واحد قائمًا، هو حائط البراق (الحائط الغربي).|Из всего, что построили вокруг Второго Храма, до сих пор стоит одна стена, Западная.|Of everything built around the Second Temple, one wall is still standing, the Western Wall.
Q לפני כמה זמן נבנתה החומה של העיר העתיקה?|قبل كم من الزمن بُني سور البلدة القديمة؟|Как давно построили стену Старого города?|How long ago was the wall of the Old City built?|a500|a5,a50,a20
Y החומה של העיר העתיקה נבנתה לפני כ-500 שנה, הרבה אחרי ימי דוד ושלמה.|بُني سور البلدة القديمة قبل نحو 500 سنة، بعد زمن داود وسليمان بكثير.|Стену Старого города построили около 500 лет назад, намного позже времён Давида и Соломона.|The Old City wall was built about 500 years ago, long after the time of David and Solomon.
Q מי מבקר בירושלים?|من يزور القدس؟|Кто приезжает в Иерусалим?|Who visits Jerusalem?|v_all|v_none,v_birds,v_kings
Y בירושלים יש מקומות קדושים ליהודים, למוסלמים ולנוצרים, ולכן מגיעים אליה אנשים מכל העולם.|في القدس أماكن مقدّسة لليهود والمسلمين والمسيحيين، لذلك يأتي إليها الناس من كل العالم.|В Иерусалиме есть святые места для евреев, мусульман и христиан, поэтому туда едут люди со всего мира.|Jerusalem has places holy to Jews, Muslims and Christians, so people come to it from all over the world.
Q מי היה הבן של המלך דוד?|من كان ابن الملك داود؟|Кто был сыном царя Давида?|Who was King David's son?|king_solomon|judah,herod,pharaoh
Y שלמה היה הבן של המלך דוד, ואחרי דוד הוא נהיה המלך.|كان سليمان ابن الملك داود، وصار هو الملك بعد داود.|Соломон был сыном царя Давида и стал царём после него.|Solomon was King David's son, and he became king after David.
E xh_temple1|t|את בית המקדש הראשון|الهيكل الأول|Первый Храм|the First Temple
E xh_oldwall|t|את החומה של העיר העתיקה|سور البلدة القديمة|стену Старого города|the wall of the Old City
E xh_kotelb|t|את הכותל המערבי|الحائط الغربي|Западную стену|the Western Wall
E xh_knesset|t|את בניין הכנסת|مبنى الكنيست|здание Кнессета|the Knesset building
Q מה בנה המלך שלמה בירושלים?|ماذا بنى الملك سليمان في القدس؟|Что построил царь Соломон в Иерусалиме?|What did King Solomon build in Jerusalem?|xh_temple1|xh_oldwall,xh_kotelb,xh_knesset
Y שלמה בנה את בית המקדש הראשון, והשני נבנה רק הרבה שנים אחריו.|بنى سليمان الهيكل الأول، أما الهيكل الثاني فبُني بعده بسنوات كثيرة.|Соломон построил Первый Храм, а Второй построили лишь много лет спустя.|Solomon built the First Temple, and the Second one was built only many years later.
E xh_2000y|t|יותר מאלפיים שנה|أكثر من ألفي سنة|больше двух тысяч лет|more than two thousand years
E xh_100y|t|בערך מאה שנה|نحو مئة سنة|около ста лет|about a hundred years
E xh_20y|t|בערך עשרים שנה|نحو عشرين سنة|около двадцати лет|about twenty years
E xh_10y|t|בערך עשר שנים|نحو عشر سنوات|около десяти лет|about ten years
Q כמה זמן גרים אנשים בירושלים?|منذ كم من الزمن يسكن الناس في القدس؟|Сколько времени люди живут в Иерусалиме?|For how long have people lived in Jerusalem?|xh_2000y|xh_100y,xh_20y,xh_10y
Y ירושלים היא עיר עתיקה מאוד, ואנשים גרים בה כבר יותר מ-2000 שנה, עוד מימי המלך דוד.|القدس مدينة قديمة جدًا، والناس يسكنون فيها منذ أكثر من 2000 سنة، منذ زمن الملك داود.|Иерусалим очень древний город, люди живут в нём больше 2000 лет, ещё со времён царя Давида.|Jerusalem is a very old city, and people have lived there for more than 2000 years, since King David's time.
E xh_t2|t|מבית המקדש השני|من الهيكل الثاني|от Второго Храма|from the Second Temple
E xh_t1|t|מבית המקדש הראשון|من الهيكل الأول|от Первого Храма|from the First Temple
E xh_davpal|t|מהארמון של המלך דוד|من قصر الملك داود|от дворца царя Давида|from King David's palace
E xh_solpal|t|מהארמון של המלך שלמה|من قصر الملك سليمان|от дворца царя Соломона|from King Solomon's palace
Q ממה נשאר הכותל המערבי?|من أيّ بناء بقي الحائط الغربي؟|От чего осталась Западная стена?|What is the Western Wall left over from?|xh_t2|xh_t1,xh_davpal,xh_solpal
Y הכותל המערבי היה חלק מהבנייה סביב בית המקדש השני, ולא סביב הראשון.|حائط البراق (الحائط الغربي) كان جزءًا من البناء حول الهيكل الثاني، وليس الأول.|Западная стена была частью построек вокруг Второго Храма, а не Первого.|The Western Wall was part of the building around the Second Temple, not the First.
E xh_walkw|t|לטייל עליה|أن نتجوّل عليه|гулять по ней|walk along it
E xh_swimw|t|לשחות בה|أن نسبح فيه|плавать в ней|swim in it
E xh_drivew|t|לנסוע עליה במכונית|أن نقود عليه سيارة|ездить по ней на машине|drive a car on it
E xh_sleepw|t|לישון בה בלילה|أن ننام فيه ليلًا|спать в ней ночью|sleep in it at night
Q מה אפשר לעשות היום בחומה של העיר העתיקה?|ماذا يمكن أن نفعل اليوم على سور البلدة القديمة؟|Что можно делать сегодня на стене Старого города?|What can you do today on the wall of the Old City?|xh_walkw|xh_swimw,xh_drivew,xh_sleepw
Y על החומה של העיר העתיקה יש שביל, ולכן אפשר לטייל עליה גם היום.|على سور البلدة القديمة ممرّ للمشي، لذلك يمكن التجوّل عليه حتى اليوم.|По верху стены Старого города проходит дорожка, поэтому по ней можно гулять и сегодня.|There is a path along the top of the Old City wall, so people can still walk along it today.
S macc|🕎|#c92a2a|המכבים וחנוכה|المكابيون وعيد الحانوكا|Маккавеи и Ханука|The Maccabees and Hanukkah
L לפני יותר משני אלפים שנה שלטו בארץ מלכים יוונים. הם אסרו על היהודים לקיים את המנהגים שלהם.|قبل أكثر من ألفي سنة حكم الأرضَ ملوك يونانيون. منعوا اليهود من ممارسة عاداتهم.|Больше двух тысяч лет назад страной правили греческие цари. Они запретили евреям соблюдать их обычаи.|More than two thousand years ago Greek kings ruled the land. They did not let the Jews keep their customs.
L יהודה המכבי ואחיו לא הסכימו. הם יצאו להילחם, והיו מעטים מול צבא גדול.|لم يوافق يهوذا المكابي وإخوته. خرجوا للقتال، وكانوا قلّة أمام جيش كبير.|Иуда Маккавей и его братья не согласились. Они вышли на бой, хотя их было мало, а армия была большая.|Judah Maccabee and his brothers refused. They went out to fight, a few against a big army.
L המכבים ניצחו וחזרו לירושלים. בית המקדש היה מלוכלך, והם ניקו אותו וחנכו אותו מחדש.|انتصر المكابيون وعادوا إلى القدس. كان الهيكل متّسخًا، فنظّفوه وافتتحوه من جديد.|Маккавеи победили и вернулись в Иерусалим. Храм был осквернён, и они очистили его и освятили заново.|The Maccabees won and came back to Jerusalem. The Temple was dirty, so they cleaned it and dedicated it again.
L מספרים שמצאו רק כד אחד קטן של שמן, אבל הוא דלק שמונה ימים.|يُحكى أنهم وجدوا جرّة صغيرة واحدة فقط من الزيت، لكنها بقيت مشتعلة ثمانية أيام.|Рассказывают, что нашли только один маленький кувшин масла, но он горел восемь дней.|The story says they found only one small jar of oil, but it burned for eight days.
L לכן בחנוכה מדליקים נרות במשך שמונה ימים, ואוכלים סופגניות ולביבות מטוגנות בשמן.|لذلك نُشعل في الحانوكا الشموع ثمانية أيام، ونأكل كعك السوفغانيوت والفطائر المقلية بالزيت.|Поэтому на Хануку восемь дней зажигают свечи и едят пончики и оладьи, жаренные в масле.|So on Hanukkah we light candles for eight days, and eat doughnuts and latkes fried in oil.
Q איזה חג מספר על המכבים?|أي عيد يحكي عن المكابيين؟|Какой праздник рассказывает о Маккавеях?|Which holiday tells about the Maccabees?|hanukkah|purim,sukkot,tubishvat
Y המילה חנוכה באה מחנוכת בית המקדש, כלומר הפתיחה המחודשת שעשו המכבים.|كلمة حانوكا تعني التدشين، أي افتتاح الهيكل من جديد على يد المكابيين.|Слово Ханука значит освящение, ведь Маккавеи заново освятили Храм.|Hanukkah means dedication, because the Maccabees dedicated the Temple again.
Q מי היה המנהיג של המכבים?|من كان قائد المكابيين؟|Кто был вождём Маккавеев?|Who was the leader of the Maccabees?|judah|king_david,king_solomon,herod
Y יהודה המכבי הוביל את אחיו במלחמה, ועל שמו כל הקבוצה נקראה המכבים.|قاد يهوذا المكابي إخوته في القتال، وعلى اسمه سُمّيت المجموعة كلها المكابيين.|Иуда Маккавей вёл своих братьев в бой, и по его прозвищу их всех назвали Маккавеями.|Judah Maccabee led his brothers in battle, and the whole group was called the Maccabees after him.
Q מה המכבים עשו כשחזרו לירושלים?|ماذا فعل المكابيون عندما عادوا إلى القدس؟|Что сделали Маккавеи, вернувшись в Иерусалим?|What did the Maccabees do when they came back to Jerusalem?|m_clean|m_leave,m_sell,m_hide
Y המכבים מצאו את בית המקדש מלוכלך, ולכן ניקו אותו לפני שחנכו אותו מחדש.|وجد المكابيون الهيكل متّسخًا، لذلك نظّفوه قبل أن يفتتحوه من جديد.|Маккавеи нашли Храм осквернённым, поэтому очистили его, а потом освятили заново.|The Maccabees found the Temple dirty, so they cleaned it before dedicating it again.
Q כמה ימים דלק השמן, לפי הסיפור?|كم يومًا اشتعل الزيت حسب القصة؟|Сколько дней горело масло, по рассказу?|How many days did the oil burn, according to the story?|d8|d3,d5,d10
Y לפי הסיפור, השמן דלק 8 ימים, ולכן חנוכה נמשך 8 ימים.|بحسب القصة، بقي الزيت مشتعلًا 8 أيام، لذلك تستمر الحانوكا 8 أيام.|По преданию, масло горело 8 дней, поэтому Ханука длится 8 дней.|The story says the oil burned for 8 days, which is why Hanukkah lasts 8 days.
Q מה מדליקים בחנוכה במשך שמונה ימים?|ماذا نُشعل في الحانوكا طوال ثمانية أيام؟|Что зажигают на Хануку восемь дней?|What do we light for eight days on Hanukkah?|candles|fireworks,bonfire,flashlights
Y מדליקים נרות בחנוכה כדי לזכור את השמן שדלק בבית המקדש.|نُشعل الشموع في الحانوكا لكي نتذكّر الزيت الذي اشتعل في الهيكل.|На Хануку зажигают свечи в память о масле, которое горело в Храме.|Candles are lit on Hanukkah to remember the oil that burned in the Temple.
Q מה אוכלים בחנוכה?|ماذا نأكل في الحانوكا؟|Что едят на Хануку?|What do we eat on Hanukkah?|sufg|matza,hamantash,figs
Y סופגניות ולביבות מטוגנות בשמן, וזה מזכיר את סיפור כד השמן של חנוכה.|السوفغانيوت والفطائر تُقلى بالزيت، وهذا يذكّر بقصة جرّة الزيت في الحانوكا.|Пончики и оладьи жарят в масле, и это напоминает историю о кувшине масла на Хануку.|Doughnuts and latkes are fried in oil, which reminds us of the Hanukkah story of the jar of oil.
Q מי שלטו בארץ בזמן סיפור המכבים?|من حكم البلاد في زمن قصة المكابيين؟|Кто правил страной во времена истории Маккавеев?|Who ruled the land in the time of the Maccabees story?|greeks_p|romans,egyptians_p,babylonians_p
Y בזמן המכבים מלכים יוונים שלטו בארץ, והמכבים נלחמו בצבא שלהם.|في زمن المكابيين حكم البلاد ملوك يونانيون، وحارب المكابيون جيشهم.|Во времена Маккавеев страной правили греческие цари, и Маккавеи воевали с их армией.|In the time of the Maccabees Greek kings ruled the land, and the Maccabees fought their army.
E xh_custom|t|לקיים את המנהגים שלהם|أن يمارسوا عاداتهم|соблюдать свои обычаи|keep their customs
E xh_ballp|t|לשחק בכדור ברחוב|أن يلعبوا بالكرة في الشارع|играть в мяч на улице|play ball in the street
E xh_shoes|t|ללבוש נעליים בבית|أن يلبسوا الأحذية في البيت|носить обувь дома|wear shoes at home
E xh_singw|t|לשיר בחתונות|أن يغنّوا في الأعراس|петь на свадьбах|sing at weddings
Q על מה אסרו המלכים היוונים על היהודים?|ماذا منع الملوك اليونانيون اليهود أن يفعلوا؟|Что греческие цари запретили евреям?|What did the Greek kings forbid the Jews to do?|xh_custom|xh_ballp,xh_shoes,xh_singw
Y המלכים היוונים אסרו על היהודים לקיים את המנהגים שלהם, ולכן המכבים יצאו להילחם.|منع الملوك اليونانيون اليهود من ممارسة عاداتهم، لذلك خرج المكابيون للقتال.|Греческие цари запретили евреям соблюдать свои обычаи, и поэтому Маккавеи вышли на бой.|The Greek kings did not let the Jews keep their customs, and that is why the Maccabees went to fight.
E xh_jar1|t|כד אחד קטן|جرّة واحدة صغيرة|один маленький кувшин|one small jar
E xh_jar2|t|שני כדים גדולים|جرّتان كبيرتان|два больших кувшина|two big jars
E xh_jar10|t|עשרה כדים מלאים|عشر جرار ممتلئة|десять полных кувшинов|ten full jars
E xh_jar100|t|מאה כדים של שמן|مئة جرّة من الزيت|сто кувшинов масла|a hundred jars of oil
Q כמה שמן מצאו המכבים בבית המקדש, לפי הסיפור?|كم زيتًا وجد المكابيون في الهيكل، بحسب القصة؟|Сколько масла нашли Маккавеи в Храме, по рассказу?|According to the story, how much oil did the Maccabees find in the Temple?|xh_jar1|xh_jar2,xh_jar10,xh_jar100
Y לפי הסיפור, מצאו רק כד שמן אחד קטן, ולכן היה מפתיע שהוא דלק כל כך הרבה זמן.|بحسب القصة، وجدوا جرّة زيت صغيرة واحدة فقط، لذلك كان عجيبًا أنها اشتعلت كل هذا الوقت.|По преданию, нашли только один маленький кувшин масла, поэтому было удивительно, что он горел так долго.|The story says they found just one small jar of oil, so it was amazing that it burned for so long.
E xh_few|t|הם היו מעטים מול צבא גדול|كانوا قلّة أمام جيش كبير|их было мало против большой армии|they were few against a big army
E xh_manyv|t|הם היו רבים מול צבא קטן|كانوا كثيرين أمام جيش صغير|их было много против маленькой армии|they were many against a small army
E xh_nofight|t|הם לא נלחמו בכלל|لم يحاربوا أبدًا|они совсем не воевали|they did not fight at all
E xh_hired|t|הם שכרו צבא מארץ אחרת|استأجروا جيشًا من بلد آخر|они наняли армию из другой страны|they hired an army from another country
Q מה מיוחד בניצחון של המכבים?|ما المميّز في انتصار المكابيين؟|Чем особенна победа Маккавеев?|What was special about the Maccabees' victory?|xh_few|xh_manyv,xh_nofight,xh_hired
Y למכבים היו מעט לוחמים מול צבא גדול, ולכן הניצחון שלהם הפתיע.|كان عند المكابيين محاربون قليلون أمام جيش كبير، لذلك كان انتصارهم مفاجئًا.|У Маккавеев было мало воинов против большой армии, поэтому их победа удивила.|The Maccabees had few fighters against a big army, so their victory was a surprise.
S anc|🏛️|#907000|עמים בעולם העתיק|شعوب العالم القديم|народы древнего мира|Peoples of the Ancient World
L במצרים העתיקה חיו מלכים שנקראו פרעוֹנים. הם בנו פירמידות גדולות, ושם קברו אותם.|في مصر القديمة عاش ملوك اسمهم الفراعنة. بنوا أهرامات كبيرة ودُفنوا فيها.|В Древнем Египте жили цари, которых называли фараонами. Они строили большие пирамиды, и там их хоронили.|In ancient Egypt lived kings called pharaohs. They built big pyramids, and were buried in them.
L המצרים גרו ליד נהר גדול, הנילוס. המים עזרו להם לגדל אוכל.|سكن المصريون قرب نهر كبير هو النيل. وساعدتهم مياهه على زراعة الطعام.|Египтяне жили у большой реки - Нила. Вода помогала им выращивать еду.|The Egyptians lived by a big river, the Nile. Its water helped them grow food.
L ביוון העתיקה התחילו את המשחקים האולימפיים. רצו ותחרו שם, ואחר כך זה הפך למשחקים שיש גם היום.|في اليونان القديمة بدأت الألعاب الأولمبية. كانوا يركضون ويتنافسون، وصارت بعد ذلك الألعاب التي نراها اليوم.|В Древней Греции начались Олимпийские игры. Там бегали и соревновались, а потом из этого получились игры, которые проводят и сегодня.|The Olympic Games began in ancient Greece. People ran and competed there, and it became the games we still have today.
L הרומאים בנו כבישים ארוכים וגם תעלות מים גבוהות שנקראות אמות מים. אחת מהן עומדת בקיסריה בארץ ישראל.|بنى الرومان طرقًا طويلة وقنوات مياه عالية تُسمّى قنوات الري (الأقنية). واحدة منها ما زالت قائمة في قيسارية.|Римляне строили длинные дороги и высокие каналы для воды - акведуки. Один из них стоит в Кесарии в Израиле.|The Romans built long roads and tall water channels called aqueducts. One of them still stands in Caesarea in Israel.
L מכל העמים האלה למדנו דברים: כתב, ספורט, בנייה ועוד. גם היום אנחנו משתמשים בהם.|تعلّمنا من كل هذه الشعوب أشياء: الكتابة والرياضة والبناء وغيرها. ونحن نستخدمها حتى اليوم.|От всех этих народов мы многому научились: письму, спорту, строительству и другому. Мы пользуемся этим и сегодня.|From all these peoples we learned things: writing, sports, building and more. We still use them today.
Q איך קראו למלכים של מצרים העתיקה?|ماذا كانوا يسمّون ملوك مصر القديمة؟|Как называли царей Древнего Египта?|What were the kings of ancient Egypt called?|pharaoh|emperor,sultan,president
Y במצרים העתיקה קראו לכל מלך פרעה, ולכן פרעה הוא שם של תפקיד ולא של אדם אחד.|في مصر القديمة كان كل ملك يُسمّى فرعون، لذلك فرعون لقب وليس اسم شخص واحد.|В Древнем Египте так звали каждого царя, поэтому фараон был титулом, а не именем одного человека.|In ancient Egypt every king was called pharaoh, so it was a title and not the name of one person.
Q מה בנו המצרים כדי לקבור את המלכים?|ماذا بنى المصريون ليدفنوا الملوك؟|Что строили египтяне, чтобы хоронить царей?|What did the Egyptians build to bury their kings?|w_pyr|w_towers,w_boats,w_tents
Y הפרעונים רצו קבר גדול וחזק, ולכן בנו פירמידות שעומדות עד היום.|أراد الفراعنة قبرًا كبيرًا وقويًا، لذلك بنوا أهرامات ما زالت قائمة حتى اليوم.|Фараоны хотели большую и прочную гробницу, поэтому строили пирамиды, которые стоят до сих пор.|The pharaohs wanted a big, strong tomb, so they built pyramids that still stand today.
Q ליד איזה נהר גרו המצרים?|قرب أي نهر سكن المصريون؟|У какой реки жили египтяне?|By which river did the Egyptians live?|nile|jordan,tiber,thames
Y הנילוס הוא הנהר הגדול שעובר במצרים, והמים שלו עזרו לגדל אוכל.|النيل هو النهر الكبير الذي يمرّ في مصر، ومياهه ساعدت على زراعة الطعام.|Через Египет течёт большая река Нил, и её вода помогала выращивать еду.|The Nile is the big river that flows through Egypt, and its water helped grow food.
Q באיזה מקום התחילו המשחקים האולימפיים?|أين بدأت الألعاب الأولمبية؟|Где начались Олимпийские игры?|Where did the Olympic Games begin?|greece|egypt_c,rome_c,china_c
Y המשחקים האולימפיים התחילו ביוון העתיקה, ונקראים על שם המקום אולימפיה שביוון.|بدأت الألعاب الأولمبية في اليونان القديمة، وسُمّيت على اسم مكان أولمبيا في اليونان.|Олимпийские игры начались в Древней Греции и названы по месту Олимпия в Греции.|The Olympic Games began in ancient Greece and are named after Olympia, a place in Greece.
Q מי בנה אמות מים וכבישים ארוכים?|من بنى قنوات المياه والطرق الطويلة؟|Кто строил акведуки и длинные дороги?|Who built aqueducts and long roads?|romans|canaanites_p,babylonians_p,vikings
Y הרומאים שלטו בארצות רבות, ובנו בהן כבישים ואמות מים כדי לחבר ערים ולהביא מים.|حكم الرومان بلادًا كثيرة، وبنوا فيها طرقًا وقنوات مياه ليصلوا بين المدن ويجلبوا الماء.|Римляне правили многими странами и строили там дороги и акведуки, чтобы связать города и подать воду.|The Romans ruled many lands and built roads and aqueducts there to link cities and bring water.
Q באיזה מקום בארץ ישראל עומדת אמת מים רומית?|أين تقف قناة مياه رومانية في أرض إسرائيل؟|В каком месте в Израиле стоит римский акведук?|Where in Israel does a Roman aqueduct stand?|caesarea|beit_shean,masada,haifa_x
Y קיסריה הייתה עיר נמל רומית חשובה, ואמת המים שהביאה אליה מים עומדת עד היום.|كانت قيسارية مدينة ميناء رومانية مهمة، وقناة المياه التي جلبت إليها الماء ما زالت قائمة.|Кесария была важным римским портом, и её акведук, который подавал воду, стоит до сих пор.|Caesarea was an important Roman port city, and its aqueduct that brought water still stands today.
E xh_nilefood|t|המים שלו עזרו לגדל אוכל|ماؤه ساعد على زراعة الطعام|его вода помогала выращивать еду|its water helped them grow food
E xh_gold|t|בתוכו החביאו את הזהב|خبّأوا الذهب في داخله|в нём прятали золото|they hid their gold in it
E xh_snow|t|הוא שמר עליהם מפני שלג|حماهم من الثلج|он защищал их от снега|it protected them from snow
E xh_boatrace|t|בו ערכו מרוצי סירות|أقاموا فيه سباقات قوارب|на нём устраивали гонки лодок|they held boat races on it
Q איך הנילוס עזר למצרים?|كيف ساعد النيل المصريين؟|Как Нил помогал египтянам?|How did the Nile help the Egyptians?|xh_nilefood|xh_gold,xh_snow,xh_boatrace
Y במצרים חם ויבש, ולכן המים של הנילוס עזרו להשקות שדות ולגדל אוכל.|مصر بلاد حارّة وجافّة، لذلك ساعدت مياه النيل على سقي الحقول وزراعة الطعام.|В Египте жарко и сухо, поэтому вода Нила помогала поливать поля и выращивать еду.|Egypt is hot and dry, so the water of the Nile helped water the fields and grow food.
E xh_wsb|t|כתב, ספורט ובנייה|الكتابة والرياضة والبناء|письменность, спорт и строительство|writing, sport and building
E xh_tech|t|טלפונים ומחשבים|الهواتف والحواسيب|телефоны и компьютеры|phones and computers
E xh_planes|t|מטוסים ורכבות|الطائرات والقطارات|самолёты и поезда|planes and trains
E xh_tvradio|t|טלוויזיה ורדיו|التلفاز والراديو|телевизоры и радиоприёмники|television and radio
Q מה למדנו מהעמים של העולם העתיק?|ماذا تعلّمنا من شعوب العالم القديم؟|Чему мы научились у народов древнего мира?|What did we learn from the peoples of the ancient world?|xh_wsb|xh_tech,xh_planes,xh_tvradio
Y כתב, ספורט ובנייה הגיעו אלינו מהעמים העתיקים, ואנחנו משתמשים בהם עד היום.|الكتابة والرياضة والبناء وصلت إلينا من الشعوب القديمة، ونحن نستخدمها حتى اليوم.|Письменность, спорт и строительство пришли к нам от древних народов, и мы пользуемся ими до сих пор.|Writing, sport and building came to us from ancient peoples, and we still use them today.
E xh_aqd|t|תעלות גבוהות שמובילות מים|قنوات عالية تنقل الماء|высокие каналы, по которым течёт вода|high channels that carry water
E xh_pools|t|בריכות שחייה גדולות|برك سباحة كبيرة|большие бассейны|big swimming pools
E xh_cups|t|כלים לשתיית מים|أوانٍ لشرب الماء|посуда для питья воды|cups for drinking water
E xh_rboats|t|סירות ששטות על נהר|قوارب تبحر في نهر|лодки, которые плывут по реке|boats that sail on a river
Q מה הן אמות מים?|ما هي قنوات المياه الرومانية؟|Что такое акведуки?|What are aqueducts?|xh_aqd|xh_pools,xh_cups,xh_rboats
Y אמת מים היא תעלה גבוהה שמובילה מים ממקום רחוק לעיר, כמו צינור גדול מאבן.|قناة المياه قناة عالية تنقل الماء من مكان بعيد إلى المدينة، مثل أنبوب كبير من الحجر.|По акведуку, высокому каналу, вода шла издалека в город, как по большой каменной трубе.|An aqueduct is a high channel that carries water from far away to a city, like a big stone pipe.
E xh_ran|t|רצו והתחרו|ركضوا وتنافسوا|бегали и соревновались|they ran and competed
E xh_pyrb|t|בנו פירמידות|بنوا الأهرامات|строили пирамиды|they built pyramids
E xh_fished|t|דגו בנילוס|اصطادوا السمك في النيل|ловили рыбу в Ниле|they fished in the Nile
E xh_dict|t|כתבו מילון|كتبوا قاموسًا|писали словарь|they wrote a dictionary
Q מה עשו במשחקים האולימפיים ביוון העתיקה?|ماذا فعلوا في الألعاب الأولمبية في اليونان القديمة؟|Что делали на Олимпийских играх в Древней Греции?|What did people do at the Olympic Games in ancient Greece?|xh_ran|xh_pyrb,xh_fished,xh_dict
Y המשחקים האולימפיים הם תחרויות ספורט, וכבר ביוון העתיקה רצו בהם והתחרו.|الألعاب الأولمبية مسابقات رياضية، وفي اليونان القديمة كانوا يركضون فيها ويتنافسون.|Олимпийские игры были спортивными соревнованиями, и уже в Древней Греции там бегали и состязались.|The Olympic Games are sports contests, and already in ancient Greece people ran and competed in them.
S exile|🧳|#1971c2|גלות ושיבה|الشتات والعودة|изгнание и возвращение|Exile and Return
L לפני כאלפיים שנה הרומאים החריבו את בית המקדש בירושלים. הרבה יהודים נאלצו לעזוב את הארץ.|قبل نحو ألفي سنة دمّر الرومان الهيكل في القدس. واضطرّ كثير من اليهود إلى ترك البلاد.|Около двух тысяч лет назад римляне разрушили Храм в Иерусалиме. Многим евреям пришлось покинуть страну.|About two thousand years ago the Romans destroyed the Temple in Jerusalem. Many Jews had to leave the land.
L יהודים התפזרו בארצות רבות: בספרד, בבבל, בתימן, באתיופיה, בפולין ועוד. את זה קוראים גלות.|تفرّق اليهود في بلاد كثيرة: في إسبانيا وبابل واليمن وإثيوبيا وبولندا وغيرها. وهذا يُسمّى الشتات.|Евреи рассеялись по многим странам: Испания, Вавилон, Йемен, Эфиопия, Польша и другие. Это называют изгнанием.|Jews spread to many countries: Spain, Babylon, Yemen, Ethiopia, Poland and more. This is called exile.
L בכל מקום היהודים שמרו על החגים, על התפילות ועל השפה העברית. הם התפללו לכיוון ירושלים.|في كل مكان حافظ اليهود على الأعياد والصلوات واللغة العبرية. وصلّوا باتجاه القدس.|Везде евреи сохраняли праздники, молитвы и иврит. Они молились, обратившись лицом к Иерусалиму.|Everywhere Jews kept the holidays, the prayers and the Hebrew language. They prayed facing Jerusalem.
L גם בארץ ישראל נשארו יהודים לאורך כל השנים, בערים כמו צפת, טבריה וירושלים.|وبقي يهود في أرض إسرائيل على مرّ السنين، في مدن مثل صفد وطبريا والقدس.|И в Земле Израиля евреи жили все эти годы, в таких городах, как Цфат, Тверия и Иерусалим.|Jews also stayed in the Land of Israel all through the years, in cities like Safed, Tiberias and Jerusalem.
L במשך שנים רבות היהודים חלמו לחזור לארץ. בסוף החלום הזה התחיל להתגשם.|حلم اليهود سنوات طويلة بالعودة إلى البلاد. وفي النهاية بدأ هذا الحلم يتحقّق.|Много лет евреи мечтали вернуться в страну. В конце концов эта мечта начала сбываться.|For many years Jews dreamed of coming back to the land. In the end the dream began to come true.
Q מי החריב את בית המקדש לפני כאלפיים שנה?|من دمّر الهيكل قبل نحو ألفي سنة؟|Кто разрушил Храм около двух тысяч лет назад?|Who destroyed the Temple about two thousand years ago?|romans|greeks_p,egyptians_p,vikings
Y לפני כ-2000 שנה הרומאים שלטו בארץ, והצבא שלהם החריב את בית המקדש.|قبل نحو 2000 سنة حكم الرومان البلاد، ودمّر جيشهم الهيكل.|Около 2000 лет назад страной правили римляне, и их армия разрушила Храм.|About 2000 years ago the Romans ruled the land, and their army destroyed the Temple.
Q איך קוראים לזמן שבו יהודים חיו הרחק מארץ ישראל?|ماذا نسمّي الزمن الذي عاش فيه اليهود بعيدًا عن أرض إسرائيل؟|Как называют время, когда евреи жили далеко от Земли Израиля?|What do we call the time Jews lived far from the Land of Israel?|galut|aliya_w,holiday_w,picnic_w
Y גלות היא המילה לזמן שבו עם חי רחוק מהארץ שלו.|الشتات (غالوت) هو اسم الزمن الذي يعيش فيه شعب بعيدًا عن بلاده.|Изгнанием, или галутом, называют время, когда народ живёт далеко от своей земли.|Exile is the word for a time when a people lives far away from its own land.
Q לאיזה כיוון התפללו היהודים בכל העולם?|إلى أي اتجاه صلّى اليهود في كل العالم؟|В какую сторону молились евреи по всему миру?|Toward which place did Jews all over the world pray?|jlm|tlv,haifa,eilat
Y בירושלים עמד בית המקדש, ולכן יהודים בכל העולם התפללו לכיוון ירושלים.|في القدس كان الهيكل، لذلك صلّى اليهود في كل العالم باتجاه القدس.|В Иерусалиме стоял Храм, поэтому евреи во всём мире молились, обратившись к Иерусалиму.|The Temple had stood in Jerusalem, so Jews all over the world prayed facing Jerusalem.
Q מה היהודים שמרו עליו בכל מקום שחיו בו?|على ماذا حافظ اليهود في كل مكان عاشوا فيه؟|Что евреи сохраняли везде, где жили?|What did Jews keep wherever they lived?|k_holidays|k_nothing,k_bags,k_names_e
Y היהודים בגלות שמרו על החגים, התפילות והעברית, וכך נשארו עם אחד גם כשגרו רחוק.|حافظ اليهود في الشتات على الأعياد والصلوات والعبرية، وهكذا بقوا شعبًا واحدًا رغم البعد.|В изгнании евреи сохраняли праздники, молитвы и иврит и так оставались одним народом.|In exile Jews kept their holidays, prayers and Hebrew, and so stayed one people even far apart.
Q באיזו עיר נשארו יהודים בארץ במשך השנים?|في أي مدينة بقي يهود في البلاد على مرّ السنين؟|В каком городе жили евреи в стране все эти годы?|In which city did Jews stay in the land through the years?|safed|moscow,paris,cairo
Y צפת היא עיר בגליל, ויהודים גרו בה לאורך כל השנים, גם בזמן הגלות.|صفد مدينة في الجليل، وسكن فيها يهود على مرّ السنين، حتى في زمن الشتات.|Цфат, город в Галилее, был одним из мест, где евреи жили все эти годы, даже во времена изгнания.|Safed is a city in the Galilee where Jews lived all through the years, even in the time of exile.
E xh_lands|t|בספרד, בבבל, בתימן, בפולין ועוד|في إسبانيا وبابل واليمن وبولندا وغيرها|в Испании, Вавилоне, Йемене, Польше и других|in Spain, Babylon, Yemen, Poland and more
E xh_onlysp|t|רק בספרד, ולא בשום מקום אחר|في إسبانيا فقط، ولا في أي مكان آخر|только в Испании, и больше нигде|only in Spain, and nowhere else
E xh_onlybab|t|רק בבבל, ולא בשום מקום אחר|في بابل فقط، ولا في أي مكان آخر|только в Вавилоне, и больше нигде|only in Babylon, and nowhere else
E xh_onlypol|t|רק בפולין, ולא בשום מקום אחר|في بولندا فقط، ولا في أي مكان آخر|только в Польше, и больше нигде|only in Poland, and nowhere else
Q איפה חיו יהודים בזמן הגלות?|أين عاش اليهود في زمن الشتات؟|Где жили евреи во времена изгнания?|Where did Jews live during the exile?|xh_lands|xh_onlysp,xh_onlybab,xh_onlypol
Y אחרי שעזבו את הארץ, יהודים התפזרו בארצות רבות, כמו ספרד, בבל, תימן ופולין.|بعد أن تركوا البلاد تفرّق اليهود في بلاد كثيرة، مثل إسبانيا وبابل واليمن وبولندا.|Покинув страну, евреи рассеялись по многим землям, например по Испании, Вавилону, Йемену и Польше.|After leaving the land, Jews spread to many countries, such as Spain, Babylon, Yemen and Poland.
E xh_return|t|לחזור לארץ ישראל|أن يعودوا إلى أرض إسرائيل|вернуться в Страну Израиля|to return to the Land of Israel
E xh_stay|t|להישאר תמיד רחוק|أن يبقوا بعيدين دائمًا|всегда оставаться далеко|to always stay far away
E xh_forgeth|t|לשכוח את השפה העברית|أن ينسوا اللغة العبرية|забыть иврит|to forget the Hebrew language
E xh_island|t|לגור באי בודד|أن يسكنوا في جزيرة نائية|жить на необитаемом острове|to live on a lonely island
Q על מה חלמו היהודים בגלות במשך שנים רבות?|بماذا حلم اليهود في الشتات سنوات طويلة؟|О чём евреи в изгнании мечтали много лет?|What did Jews in exile dream of for many years?|xh_return|xh_stay,xh_forgeth,xh_island
Y היהודים בגלות זכרו את ירושלים בתפילות כל יום, ולכן חלמו לחזור לארץ ישראל.|تذكّر اليهود في الشتات القدس في صلواتهم كل يوم، لذلك حلموا بالعودة إلى أرض إسرائيل.|Евреи в изгнании каждый день вспоминали Иерусалим в молитвах и мечтали вернуться в Землю Израиля.|Jews in exile remembered Jerusalem in their prayers every day, so they dreamed of returning to the Land of Israel.
E xh_tiberias|l|טבריה|طبريا|Тверия|Tiberias
Q באיזו עיר על שפת הכנרת נשארו יהודים לאורך השנים?|في أي مدينة على شاطئ بحيرة طبريا بقي اليهود عبر السنين؟|В каком городе на берегу Кинерета евреи жили все эти годы?|In which city on the shore of the Sea of Galilee did Jews stay over the years?|xh_tiberias|moscow,paris,cairo
Y טבריה נמצאת על שפת הכנרת, ויהודים גרו בה לאורך כל השנים.|تقع طبريا على شاطئ بحيرة طبريا، وسكن فيها يهود على مرّ السنين.|Тверия стоит на берегу озера Кинерет, и евреи жили в ней все эти годы.|Tiberias is on the shore of the Sea of Galilee, and Jews lived there all through the years.
Q איזו שפה שמרו היהודים בגלות?|أيّ لغة حافظ عليها اليهود في الشتات؟|Какой язык евреи сохранили в изгнании?|Which language did Jews keep in exile?|hebrew_l|french_l,japanese_l,swahili_l
Y עברית היא שפת התפילות והספרים של היהודים, ולכן שמרו עליה גם בגלות.|العبرية لغة صلوات اليهود وكتبهم، لذلك حافظوا عليها في الشتات.|На иврите евреи молились и читали книги, поэтому сохраняли его и в изгнании.|Hebrew was the language of Jewish prayers and books, so Jews kept it even in exile.
E xh_destr|t|הרומאים החריבו את בית המקדש|الرومان دمّروا الهيكل|римляне разрушили Храм|the Romans destroyed the Temple
E xh_flood|t|שיטפון גדול כיסה את הארץ|فيضان كبير غطّى البلاد|большое наводнение залило страну|a big flood covered the land
E xh_quake|t|רעידת אדמה הרסה את הבתים|زلزال هدم البيوت|землетрясение разрушило дома|an earthquake destroyed the houses
E xh_cold|t|חורף קר מאוד הקפיא את השדות|شتاء بارد جدًّا جمّد الحقول|очень холодная зима заморозила поля|a very cold winter froze the fields
Q למה יהודים רבים עזבו את הארץ לפני כאלפיים שנה?|لماذا غادر يهود كثيرون البلاد قبل نحو ألفي سنة؟|Почему многие евреи покинули страну около двух тысяч лет назад?|Why did many Jews leave the land about two thousand years ago?|xh_destr|xh_flood,xh_quake,xh_cold
Y כשהרומאים החריבו את בית המקדש, יהודים רבים נאלצו לעזוב את הארץ.|عندما دمّر الرومان الهيكل اضطرّ كثير من اليهود إلى ترك البلاد.|Когда римляне разрушили Храм, многим евреям пришлось покинуть страну.|When the Romans destroyed the Temple, many Jews had to leave the land.
S zion|🌅|#c64c0a|הרצל והחלום לשוב לארץ|هرتسل وحلم العودة إلى البلاد|Герцль и мечта вернуться в страну|Herzl and the Dream of Returning
L לפני יותר ממאה שנה חי עיתונאי בשם בנימין זאב הרצל. הוא ראה שיהודים רבים סובלים באירופה.|قبل أكثر من مئة سنة عاش صحفي اسمه بنيامين زئيف هرتسل. رأى أن كثيرًا من اليهود يعانون في أوروبا.|Больше ста лет назад жил журналист по имени Биньямин Зеэв Герцль. Он видел, что многим евреям в Европе тяжело.|More than a hundred years ago there lived a journalist named Binyamin Ze'ev Herzl. He saw that many Jews suffered in Europe.
L הרצל חשב שליהודים צריך להיות בית משלהם, בארץ ישראל. הרעיון הזה נקרא ציונות.|رأى هرتسل أنه يجب أن يكون لليهود بيت خاص بهم في أرض إسرائيل. وهذه الفكرة تُسمّى الصهيونية.|Герцль считал, что у евреев должен быть свой дом в Земле Израиля. Эта идея называется сионизмом.|Herzl thought the Jews needed a home of their own in the Land of Israel. This idea is called Zionism.
L בשנת 1897 הוא כינס אנשים מכל העולם לקונגרס בעיר בזל שבשווייץ. זה היה הקונגרס הציוני הראשון.|في سنة 1897 جمع الناس من كل العالم في مؤتمر في مدينة بازل في سويسرا. كان هذا المؤتمر الصهيوني الأول.|В 1897 году он собрал людей со всего мира на конгресс в городе Базель в Швейцарии. Это был первый сионистский конгресс.|In 1897 he gathered people from all over the world at a congress in the city of Basel in Switzerland. It was the first Zionist Congress.
L הרצל אמר משפט מפורסם: ״אם תרצו, אין זו אגדה״. הוא התכוון שחלום אפשר להגשים אם עובדים בשבילו.|قال هرتسل جملة مشهورة: «إن شئتم فلا تكون هذه أسطورة». قصد أن الحلم يمكن أن يتحقّق إذا عملنا من أجله.|Герцль сказал известную фразу: «Если вы захотите, это не сказка». Он имел в виду, что мечта может сбыться, если над ней работать.|Herzl said a famous sentence: "If you will it, it is no dream." He meant that a dream can come true if we work for it.
L אנשים התחילו לעלות לארץ. הם יבשו ביצות, נטעו עצים והקימו יישובים חדשים, כמו דגניה, הקיבוץ הראשון.|بدأ الناس يهاجرون إلى البلاد. جفّفوا المستنقعات وزرعوا الأشجار وأقاموا بلدات جديدة، مثل دجانيا، أول كيبوتس.|Люди стали приезжать в страну. Они осушали болота, сажали деревья и строили новые поселения, например Дгания - первый кибуц.|People began to come to the land. They drained swamps, planted trees and built new communities, like Degania, the first kibbutz.
Q מי היה העיתונאי שחלם על בית ליהודים בארץ ישראל?|من كان الصحفي الذي حلم ببيت لليهود في أرض إسرائيل؟|Какой журналист мечтал о доме для евреев в Земле Израиля?|Which journalist dreamed of a home for the Jews in the Land of Israel?|herzl|ben_gurion,weizmann,golda
Y הרצל עבד כעיתונאי באירופה, ראה שם יהודים סובלים, וחלם על בית ליהודים.|عمل هرتسل صحفيًا في أوروبا، ورأى هناك يهودًا يعانون، فحلم ببيت لليهود.|Герцль работал журналистом в Европе, видел, как там тяжело евреям, и мечтал о доме для них.|Herzl worked as a journalist in Europe, saw Jews suffering there, and dreamed of a home for them.
Q איך קוראים לרעיון שליהודים יש בית בארץ ישראל?|ماذا نسمّي فكرة أن يكون لليهود بيت في أرض إسرائيل؟|Как называется идея, что у евреев должен быть дом в Земле Израиля?|What is the idea of a Jewish home in the Land of Israel called?|zionism|geo_c,arch_c,democ_c
Y ציון הוא שם עתיק לירושלים, ולכן הרעיון לחזור לארץ ישראל נקרא ציונות.|صهيون اسم قديم للقدس، لذلك سُمّيت فكرة العودة إلى أرض إسرائيل الصهيونية.|Сионом в древности называли Иерусалим, поэтому идею возвращения в Землю Израиля назвали сионизмом.|Zion is an old name for Jerusalem, so the idea of returning to the Land of Israel is called Zionism.
Q באיזו עיר נערך הקונגרס הציוני הראשון?|في أي مدينة عُقد المؤتمر الصهيوني الأول؟|В каком городе прошёл первый сионистский конгресс?|In which city was the first Zionist Congress held?|basel|rome_c,cairo,tlv
Y הרצל כינס את הקונגרס הציוני הראשון בבזל שבשווייץ, ושם נפגשו אנשים מכל העולם.|جمع هرتسل المؤتمر الصهيوني الأول في بازل في سويسرا، وهناك التقى أناس من كل العالم.|Герцль собрал первый сионистский конгресс в Базеле в Швейцарии, и туда приехали люди со всего мира.|Herzl held the first Zionist Congress in Basel in Switzerland, where people from all over the world met.
Q באיזו שנה נערך הקונגרס הציוני הראשון?|في أي سنة عُقد المؤتمر الصهيوني الأول؟|В каком году прошёл первый сионистский конгресс?|In which year was the first Zionist Congress held?|y1897|y1997,y1797,y1947
Y הקונגרס הציוני הראשון נערך בשנת 1897, כ-50 שנה לפני שקמה מדינת ישראל.|عُقد المؤتمر الصهيوني الأول سنة 1897، قبل نحو 50 سنة من قيام دولة إسرائيل.|Первый сионистский конгресс прошёл в 1897 году, примерно за 50 лет до создания государства Израиль.|The first Zionist Congress met in 1897, about 50 years before the State of Israel was founded.
Q מה שמו של הקיבוץ הראשון, שהוקם ליד הכנרת?|ما اسم أول كيبوتس أُقيم قرب بحيرة طبريا؟|Как называется первый кибуц, основанный у озера Кинерет?|What is the name of the first kibbutz, which was built near the Sea of Galilee?|degania|kinneret_k,ein_harod,nahalal_k
Y דגניה הוקמה ליד הכנרת בשנת 1910, והיא הייתה הקיבוץ הראשון.|أُقيمت دجانيا قرب بحيرة طبريا سنة 1910، وكانت أول كيبوتس.|Дгания была основана у озера Кинерет в 1910 году и стала первым кибуцем.|Degania was founded by the Sea of Galilee in 1910, and it was the first kibbutz.
Q מה עשו העולים החדשים באדמה?|ماذا فعل المهاجرون الجدد في الأرض؟|Что делали новые репатрианты на земле?|What did the new immigrants do on the land?|m_plant|m_sleep,m_wait,m_mine
Y בביצות היה קשה לגור ולגדל אוכל, ולכן העולים יבשו אותן ונטעו עצים.|كان من الصعب السكن والزراعة قرب المستنقعات، لذلك جفّفها المهاجرون وزرعوا الأشجار.|У болот было трудно жить и выращивать еду, поэтому переселенцы осушали их и сажали деревья.|It was hard to live and grow food near swamps, so the newcomers drained them and planted trees.
E xh_journal|p|עיתונאי|صحفي|журналист|a journalist
Q מה הייתה העבודה של הרצל?|ماذا كان عمل هرتسل؟|Кем работал Герцль?|What was Herzl's job?|xh_journal|baker,dentist,driver
Y הרצל כתב בעיתון, ועיתונאי הוא מי שכותב בעיתון על מה שקורה בעולם.|كتب هرتسل في جريدة، والصحفي هو من يكتب في الجريدة عمّا يحدث في العالم.|Герцль писал в газету, а журналист и есть тот, кто пишет в газету о событиях в мире.|Herzl wrote for a newspaper, and a journalist is someone who writes in the news about what happens.
E xh_quote|t|אם תרצו, אין זו אגדה|إذا أردتم، فليست هذه أسطورة|Если захотите, это не будет сказкой|If you will it, it is no legend
E xh_q2|t|אני ואתה נשנה את העולם|أنا وأنت سنغيّر العالم|Ты и я изменим мир|You and I will change the world
E xh_q3|t|כל העולם כולו גשר צר מאוד|العالم كلّه جسر ضيّق جدًّا|Весь мир — очень узкий мост|The whole world is a very narrow bridge
E xh_q4|t|הבה נגילה ונשמחה|هيّا نفرح ونبتهج|Давайте радоваться и веселиться|Come, let us rejoice and be glad
Q איזה משפט מפורסם אמר הרצל?|أيّ جملة مشهورة قالها هرتسل؟|Какую знаменитую фразу сказал Герцль?|Which famous sentence did Herzl say?|xh_quote|xh_q2,xh_q3,xh_q4
Y הרצל רצה להראות שחלום יכול להתגשם אם עובדים בשבילו, ולכן אמר את המשפט הזה.|أراد هرتسل أن يُظهر أن الحلم يتحقّق إذا عملنا من أجله، لذلك قال هذه الجملة.|Герцль хотел показать, что мечта сбывается, если над ней работать, поэтому и сказал эти слова.|Herzl wanted to show that a dream comes true if we work for it, so he said these words.
E xh_suffer|t|שיהודים רבים סובלים|أن يهودًا كثيرين يعانون|что многие евреи страдают|that many Jews were suffering
E xh_richj|t|שכל היהודים עשירים ומאושרים|أن كل اليهود أغنياء وسعداء|что все евреи богаты и счастливы|that all Jews were rich and happy
E xh_noj|t|שאין שם יהודים בכלל|أنه لا يوجد يهود هناك أبدًا|что там совсем нет евреев|that there were no Jews there at all
E xh_wantst|t|שכל היהודים רוצים להישאר שם|أن كل اليهود يريدون البقاء هناك|что все евреи хотят остаться там|that all Jews wanted to stay there
Q מה ראה הרצל באירופה?|ماذا رأى هرتسل في أوروبا؟|Что Герцль увидел в Европе?|What did Herzl see in Europe?|xh_suffer|xh_richj,xh_noj,xh_wantst
Y הרצל גר באירופה וכתב על מה שקרה בה, ולכן ראה שיהודים רבים סובלים שם.|عاش هرتسل في أوروبا وكتب عمّا يحدث فيها، لذلك رأى أن يهودًا كثيرين يعانون هناك.|Герцль жил в Европе и писал о событиях там, поэтому видел, что многим евреям тяжело.|Herzl lived in Europe and wrote about what happened there, so he saw that many Jews were suffering.
E xh_swiss|g|שווייץ|سويسرا|Швейцария|Switzerland
Q באיזו מדינה נמצאת העיר בזל?|في أي دولة تقع مدينة بازل؟|В какой стране находится город Базель?|In which country is the city of Basel?|xh_swiss|france_c,greece,argentina_c
Y בזל היא עיר בשווייץ, על הגבול עם גרמניה וצרפת.|بازل مدينة في سويسرا، على الحدود مع ألمانيا وفرنسا.|Базель находится в Швейцарии, у границы с Германией и Францией.|Basel is a city in Switzerland, on the border with Germany and France.
S hebrew|🗣️|#0b7285|העברית חוזרת לדבר|العبرية تعود إلى الكلام|иврит снова становится разговорным|Hebrew Comes Back to Speech
L במשך שנים רבות כתבו וקראו בעברית, אבל כמעט לא דיברו בה בבית ובשוק. דיברו רוסית, ערבית, אידיש, לדינו ושפות אחרות.|لسنوات طويلة كانوا يكتبون ويقرؤون بالعبرية، لكنهم لم يتحدّثوا بها تقريبًا في البيت والسوق. تحدّثوا الروسية والعربية والييدية واللادينو ولغات أخرى.|Много лет на иврите писали и читали, но почти не говорили в доме и на рынке. Говорили по-русски, по-арабски, на идиш, на ладино и на других языках.|For many years people wrote and read in Hebrew, but hardly spoke it at home or in the market. They spoke Russian, Arabic, Yiddish, Ladino and other languages.
L אליעזר בן־יהודה חשב שעם צריך לדבר בשפה אחת משלו. הוא החליט לדבר עברית כל יום, גם בבית.|رأى إليعيزر بن يهودا أن الشعب يجب أن يتكلّم بلغة واحدة خاصة به. وقرّر أن يتكلّم العبرية كل يوم، حتى في البيت.|Элиэзер Бен-Йехуда считал, что народу нужен один общий язык. Он решил говорить на иврите каждый день, даже дома.|Eliezer Ben-Yehuda thought a people needed one language of its own. He decided to speak Hebrew every day, even at home.
L חסרו מילים לדברים חדשים, כמו ״מחברת״ או ״גלידה״. בן־יהודה המציא מילים חדשות וכתב מילון.|كانت تنقص كلمات لأشياء جديدة، مثل «دفتر» أو «بوظة». اخترع بن يهودا كلمات جديدة وكتب قاموسًا.|Не хватало слов для новых вещей. Бен-Йехуда придумывал новые слова и написал словарь.|There were no words for new things. Ben-Yehuda invented new words and wrote a dictionary.
L ילדים בבתי ספר התחילו ללמוד בעברית, ואט אט כולם דיברו אותה ברחוב ובחנות.|بدأ الأطفال في المدارس يتعلّمون بالعبرية، وشيئًا فشيئًا صار الجميع يتحدّثون بها في الشارع والمتجر.|Дети в школах начали учиться на иврите, и постепенно все стали говорить на нём на улице и в магазине.|Children in schools began to learn in Hebrew, and little by little everyone spoke it in the street and the shop.
L היום מדברים עברית מיליוני אנשים. זו שפה עתיקה שחזרה לחיים.|اليوم يتحدّث العبرية ملايين الناس. إنها لغة قديمة عادت إلى الحياة.|Сегодня на иврите говорят миллионы людей. Это древний язык, который вернулся к жизни.|Today millions of people speak Hebrew. It is an ancient language that came back to life.
Q מי עזר להחזיר את העברית לשפה מדוברת?|من ساعد في إعادة العبرية لغةً محكيّة؟|Кто помог вернуть иврит как разговорный язык?|Who helped bring Hebrew back as a spoken language?|ben_yehuda|herzl,weizmann,golda
Y אליעזר בן־יהודה החליט לדבר רק עברית, גם בבית, והמציא מילים חדשות.|قرّر إليعيزر بن يهودا أن يتكلّم العبرية فقط، حتى في البيت، واخترع كلمات جديدة.|Элиэзер Бен-Йехуда решил говорить только на иврите, даже дома, и придумывал новые слова.|Eliezer Ben-Yehuda decided to speak only Hebrew, even at home, and invented new words.
Q מה כתב אליעזר בן־יהודה?|ماذا كتب إليعيزر بن يهودا؟|Что написал Элиэзер Бен-Йехуда?|What did Eliezer Ben-Yehuda write?|dictionary|cookbook,map_b,song_b
Y בן־יהודה המציא הרבה מילים חדשות, ולכן כתב מילון שבו כולם יכולים למצוא אותן.|اخترع بن يهودا كلمات جديدة كثيرة، لذلك كتب قاموسًا يجدها فيه الجميع.|Бен-Йехуда придумал много новых слов, поэтому написал словарь, где их может найти каждый.|Ben-Yehuda invented many new words, so he wrote a dictionary where everyone could find them.
Q איפה בן־יהודה החליט לדבר עברית?|أين قرّر بن يهودا أن يتكلّم العبرية؟|Где Бен-Йехуда решил говорить на иврите?|Where did Ben-Yehuda decide to speak Hebrew?|home_all|only_syn,only_book,only_army
Y בן־יהודה רצה שהעברית תהיה שפה של כל יום, ולכן דיבר בה בכל מקום, גם בבית.|أراد بن يهودا أن تكون العبرية لغة كل يوم، لذلك تكلّم بها في كل مكان، حتى في البيت.|Бен-Йехуда хотел, чтобы иврит стал языком на каждый день, поэтому говорил на нём везде, даже дома.|Ben-Yehuda wanted Hebrew to be an everyday language, so he spoke it everywhere, even at home.
Q איזו שפה עתיקה של העם היהודי כמעט לא דיברו ביום-יום לפני בן־יהודה?|أي لغة قديمة للشعب اليهودي لم يكونوا يتحدّثون بها تقريبًا في الحياة اليومية قبل بن يهودا؟|Какой древний язык еврейского народа почти не использовали в быту до Бен-Йехуды?|Which ancient language of the Jewish people was hardly spoken in daily life before Ben-Yehuda?|hebrew_l|french_l,japanese_l,swahili_l
Y לפני בן־יהודה קראו וכתבו בעברית, אבל כמעט לא דיברו בה ביום-יום.|قبل بن يهودا كانوا يقرؤون ويكتبون بالعبرية، لكنهم لم يتحدّثوا بها تقريبًا في الحياة اليومية.|До Бен-Йехуды на иврите читали и писали, но почти не говорили в обычной жизни.|Before Ben-Yehuda people read and wrote in Hebrew, but hardly spoke it in daily life.
Q מה בן־יהודה עשה כשחסרו מילים?|ماذا فعل بن يهودا عندما نقصت الكلمات؟|Что делал Бен-Йехуда, когда не хватало слов?|What did Ben-Yehuda do when words were missing?|invent|stopped,cried_b,hide_b
Y לדברים חדשים לא היו מילים בעברית העתיקה, ולכן בן־יהודה המציא מילים חדשות.|لم تكن في العبرية القديمة كلمات للأشياء الجديدة، لذلك اخترع بن يهودا كلمات جديدة.|В древнем иврите не было слов для новых вещей, поэтому Бен-Йехуда придумывал новые слова.|Old Hebrew had no words for new things, so Ben-Yehuda invented new words.
E xh_manyl|t|רוסית, ערבית, אידיש, לדינו ועוד|الروسية والعربية واليديشية واللادينو وغيرها|русский, арабский, идиш, ладино и другие|Russian, Arabic, Yiddish, Ladino and more
E xh_onlyheb|t|רק עברית, בכל בית ובכל שוק|العبرية فقط، في كل بيت وكل سوق|только иврит, в каждом доме и на каждом рынке|only Hebrew, in every home and market
E xh_onlyen|t|רק אנגלית, בכל בית ובכל שוק|الإنجليزية فقط، في كل بيت وكل سوق|только английский, в каждом доме и на каждом рынке|only English, in every home and market
E xh_onlyjp|t|רק יפנית וסינית, בכל מקום|اليابانية والصينية فقط، في كل مكان|только японский и китайский, везде|only Japanese and Chinese, everywhere
Q באילו שפות דיברו יהודים בבית ובשוק, לפני בן־יהודה?|بأيّ لغات تكلّم اليهود في البيت والسوق قبل بن يهودا؟|На каких языках евреи говорили дома и на рынке до Бен-Йегуды?|Which languages did Jews speak at home and in the market before Ben-Yehuda?|xh_manyl|xh_onlyheb,xh_onlyen,xh_onlyjp
Y יהודים הגיעו מארצות שונות, ולכן כל אחד דיבר בשפה של המקום שממנו בא.|جاء اليهود من بلاد مختلفة، لذلك تكلّم كل واحد لغة المكان الذي جاء منه.|Евреи приехали из разных стран, поэтому каждый говорил на языке того места, откуда пришёл.|Jews came from different countries, so each one spoke the language of the place they came from.
E xh_glida|t|גלידה|غليدا (بوظة)|глида (мороженое)|glida (ice cream)
E xh_ima|t|אמא|إيما (أمّ)|има (мама)|ima (mom)
E xh_lechem|t|לחם|ليحِم (خبز)|лехем (хлеб)|lechem (bread)
E xh_mayim|t|מים|مايِم (ماء)|маим (вода)|mayim (water)
E xh_shulchan|t|שולחן|شولحان (طاولة)|шулхан (стол)|shulchan (table)
Q איזו מילה חסרה בעברית בזמן של בן־יהודה?|أيّ كلمة كانت ناقصة في العبرية في زمن بن يهودا؟|Какого слова не было в иврите во времена Бен-Йегуды?|Which word was missing from Hebrew in Ben-Yehuda's time?|xh_glida|xh_ima,xh_lechem,xh_shulchan
Y גלידה לא הייתה בימי קדם, ולכן לא הייתה לה מילה בעברית העתיקה.|البوظة لم تكن موجودة في الزمن القديم، لذلك لم تكن لها كلمة في العبرية القديمة.|Мороженого не было в древние времена, поэтому для него не было слова в древнем иврите.|Ice cream did not exist in ancient times, so old Hebrew had no word for it.
E xh_schools|t|בבתי הספר|في المدارس|в школах|in schools
E xh_cinemas|t|בבתי הקולנוע|في دور السينما|в кинотеатрах|in cinemas
E xh_port|t|בנמל|في الميناء|в порту|at the port
E xh_onbus|t|באוטובוס|في الحافلة|в автобусе|on the bus
Q איפה ילדים התחילו ללמוד בעברית?|أين بدأ الأولاد يتعلّمون بالعبرية؟|Где дети начали учиться на иврите?|Where did children start learning in Hebrew?|xh_schools|xh_cinemas,xh_port,xh_onbus
Y ילדים לומדים בבית הספר, ולכן שם התחילו ללמוד בעברית, ואחר כך דיברו בה גם בבית.|الأطفال يتعلّمون في المدرسة، لذلك بدأوا هناك يتعلّمون بالعبرية، ثم تكلّموا بها في البيت.|Дети учатся в школе, поэтому учить на иврите начали там, а потом на нём заговорили и дома.|Children study at school, so that is where learning in Hebrew began, and then they spoke it at home too.
E xh_millions|t|מיליוני אנשים|ملايين الناس|миллионы людей|millions of people
E xh_tens|t|רק כמה עשרות אנשים|بضع عشرات من الناس فقط|только несколько десятков человек|only a few dozen people
E xh_byfam|t|רק משפחת בן־יהודה|عائلة بن يهودا فقط|только семья Бен-Йегуды|only the Ben-Yehuda family
E xh_nobody|t|אף אחד, רק כותבים בה|لا أحد، يكتبون بها فقط|никто, на нём только пишут|nobody, it is only written
Q כמה אנשים מדברים עברית היום?|كم شخصًا يتكلّم العبرية اليوم؟|Сколько людей говорят на иврите сегодня?|How many people speak Hebrew today?|xh_millions|xh_tens,xh_byfam,xh_nobody
Y העברית חזרה לחיים, והיום מדברים בה מיליוני אנשים בישראל ובעולם.|عادت العبرية إلى الحياة، واليوم يتحدّث بها ملايين الناس في إسرائيل والعالم.|Иврит вернулся к жизни, и сегодня на нём говорят миллионы людей в Израиле и в мире.|Hebrew came back to life, and today millions of people speak it in Israel and around the world.
E xh_onelang|t|כי לעם צריכה להיות שפה משלו|لأنه يجب أن تكون للشعب لغة خاصة به|потому что у народа должен быть свой язык|because a people should have its own language
E xh_easy|t|כי עברית קלה יותר מכל שפה|لأن العبرية أسهل من كل اللغات|потому что иврит легче всех языков|because Hebrew is easier than any language
E xh_noother|t|כי הוא לא ידע שפות אחרות|لأنه لم يعرف لغات أخرى|потому что он не знал других языков|because he did not know other languages
E xh_ordered|t|כי הממשלה ביקשה ממנו|لأن الحكومة طلبت منه|потому что его попросило правительство|because the government asked him to
Q למה בן־יהודה רצה שכולם ידברו עברית?|لماذا أراد بن يهودا أن يتكلّم الجميع العبرية؟|Почему Бен-Йегуда хотел, чтобы все говорили на иврите?|Why did Ben-Yehuda want everyone to speak Hebrew?|xh_onelang|xh_easy,xh_noother,xh_ordered
Y יהודים הגיעו עם שפות רבות, ובן־יהודה רצה שפה אחת שתחבר את כולם.|جاء اليهود بلغات كثيرة، وأراد بن يهودا لغة واحدة تجمعهم كلهم.|Евреи приехали со многими языками, и Бен-Йехуда хотел один язык, который объединит всех.|Jews came with many languages, and Ben-Yehuda wanted one language to bring them all together.
S state|🇮🇱|#1a76c9|הקמת מדינת ישראל|قيام دولة إسرائيل|создание государства Израиль|The Founding of the State of Israel
L אחרי שנים רבות של עלייה ובנייה, יהודים רבים רצו מדינה משלהם. ב־29 בנובמבר 1947 האו״ם החליט לחלק את הארץ לשתי מדינות, יהודית וערבית.|بعد سنوات طويلة من الهجرة والبناء، أراد كثير من اليهود دولة خاصة بهم. في 29 تشرين الثاني 1947 قرّرت الأمم المتحدة تقسيم البلاد إلى دولتين، يهودية وعربية.|После многих лет репатриации и строительства многие евреи захотели иметь своё государство. 29 ноября 1947 года ООН решила разделить страну на два государства - еврейское и арабское.|After many years of immigration and building, many Jews wanted a country of their own. On November 29, 1947 the United Nations decided to divide the land into two states, one Jewish and one Arab.
L ב־5 באייר תש״ח, 14 במאי 1948, עמד דוד בן־גוריון במוזיאון בתל אביב והכריז על הקמת מדינת ישראל.|في 5 أيار العبري (14 أيار 1948) وقف دافيد بن غوريون في متحف في تل أبيب وأعلن قيام دولة إسرائيل.|5 ияра 5708 года (14 мая 1948) Давид Бен-Гурион стоял в музее в Тель-Авиве и объявил о создании государства Израиль.|On the 5th of Iyar (May 14, 1948) David Ben-Gurion stood in a museum in Tel Aviv and announced the founding of the State of Israel.
L את ההכרזה קראו בקול רם, ואנשים ברחוב שמעו אותה ברדיו ושמחו. זה היה היום הראשון של המדינה.|قُرئ الإعلان بصوت عالٍ، وسمعه الناس في الشارع في الراديو وفرحوا. كان هذا اليوم الأول للدولة.|Декларацию прочитали вслух, и люди на улицах слушали её по радио и радовались. Это был первый день государства.|The declaration was read out loud, and people in the street heard it on the radio and were happy. It was the first day of the state.
L דוד בן־גוריון היה ראש הממשלה הראשון, וחיים ויצמן היה הנשיא הראשון.|كان دافيد بن غوريون أول رئيس للحكومة، وكان حاييم وايزمان أول رئيس للدولة.|Давид Бен-Гурион был первым премьер-министром, а Хаим Вейцман - первым президентом.|David Ben-Gurion was the first Prime Minister, and Chaim Weizmann was the first President.
L ההמנון של ישראל הוא ״התקווה״. כל שנה חוגגים את יום העצמאות ושרים אותו.|نشيد إسرائيل هو «هتكفا». وكل سنة نحتفل بيوم الاستقلال ونغنّيه.|Гимн Израиля - «Ха-Тиква». Каждый год мы празднуем День независимости и поём его.|Israel's anthem is "Hatikvah". Every year we celebrate Independence Day and sing it.
Q מי הכריז על הקמת המדינה?|من أعلن قيام الدولة؟|Кто объявил о создании государства?|Who announced the founding of the State?|ben_gurion|herzl,king_david,golda
Y דוד בן־גוריון עמד בראש היהודים בארץ, ולכן הוא קרא בקול את ההכרזה על המדינה.|كان دافيد بن غوريون على رأس اليهود في البلاد، لذلك قرأ إعلان الدولة بصوت عالٍ.|Давид Бен-Гурион возглавлял евреев в стране, поэтому именно он вслух прочитал декларацию.|David Ben-Gurion led the Jews in the land, so he was the one who read out the declaration.
Q באיזו שנה הוקמה מדינת ישראל?|في أي سنة قامت دولة إسرائيل؟|В каком году было создано государство Израиль?|In which year was the State of Israel founded?|y1948|y1938,y1958,y1968
Y מדינת ישראל הוכרזה ב-14 במאי 1948, כחצי שנה אחרי החלטת האו״ם.|أُعلن قيام دولة إسرائيل في 14 أيار 1948، بعد نحو نصف سنة من قرار الأمم المتحدة.|Государство Израиль провозгласили 14 мая 1948 года, примерно через полгода после решения ООН.|The State of Israel was declared on May 14, 1948, about half a year after the UN decision.
Q באיזו עיר הוכרזה הקמת המדינה?|في أي مدينة أُعلن قيام الدولة؟|В каком городе объявили о создании государства?|In which city was the founding of the State announced?|tlv|jlm,haifa,eilat
Y בן־גוריון קרא את ההכרזה במוזיאון שנמצא בתל אביב, ולכן המדינה הוכרזה שם.|قرأ بن غوريون الإعلان في متحف موجود في تل أبيب، لذلك أُعلنت الدولة هناك.|Бен-Гурион читал декларацию в музее в Тель-Авиве, поэтому государство провозгласили именно там.|Ben-Gurion read the declaration in a museum in Tel Aviv, so that is where the state was declared.
Q מי היה ראש הממשלה הראשון?|من كان أول رئيس حكومة؟|Кто был первым премьер-министром?|Who was the first Prime Minister?|ben_gurion|weizmann,herzl,golda
Y בן־גוריון הכריז על המדינה, ואחר כך היה ראש הממשלה הראשון שלה.|أعلن بن غوريون قيام الدولة، وبعد ذلك كان أول رئيس لحكومتها.|Бен-Гурион провозгласил государство, а потом стал его первым премьер-министром.|Ben-Gurion declared the state, and then he became its first Prime Minister.
Q איך קוראים להמנון של ישראל?|ماذا يُسمّى نشيد إسرائيل؟|Как называется гимн Израиля?|What is Israel's anthem called?|hatikva|hava,shalom_song,lullaby
Y ההמנון נקרא התקווה, כי הוא מדבר על התקווה לחיות כעם חופשי בארץ.|النشيد اسمه هتكفا، أي الأمل، لأنه يتحدّث عن الأمل في العيش كشعب حر في البلاد.|Гимн называется Ха-Тиква, то есть надежда, ведь он о надежде жить свободным народом в своей стране.|The anthem is called Hatikvah, meaning the hope, because it sings of the hope to be a free people in the land.
Q איזה חג חוגגים על הקמת המדינה?|أي عيد نحتفل به بمناسبة قيام الدولة؟|Какой праздник отмечают в честь создания государства?|Which holiday do we celebrate for the founding of the State?|indep|yom_hazikaron,yom_yerushalayim,hanukkah
Y ביום העצמאות חוגגים את היום שבו הוכרזה המדינה, ה׳ באייר.|في يوم الاستقلال يُحتفل باليوم الذي أُعلن فيه قيام الدولة.|В День независимости отмечают день, когда было провозглашено государство.|On Independence Day people celebrate the day the state was declared.
E xh_partition|t|לחלק את הארץ לשתי מדינות|تقسيم البلاد إلى دولتين|разделить страну на два государства|to divide the land into two states
E xh_closel|t|לסגור את הארץ לכל העולים|إغلاق البلاد أمام كل المهاجرين|закрыть страну для всех репатриантов|to close the land to all immigrants
E xh_negevc|t|להקים עיר חדשה בנגב|إقامة مدينة جديدة في النقب|построить новый город в Негеве|to build a new city in the Negev
E xh_buildk|t|לבנות את בניין הכנסת|بناء مبنى الكنيست|построить здание Кнессета|to build the Knesset building
Q מה החליט האו״ם ב־29 בנובמבר 1947?|ماذا قرّرت الأمم المتحدة في 29 تشرين الثاني (نوفمبر) 1947؟|Что решила ООН 29 ноября 1947 года?|What did the UN decide on 29 November 1947?|xh_partition|xh_closel,xh_negevc,xh_buildk
Y ב-29 בנובמבר 1947 האו״ם הצביע, והחליט לחלק את הארץ למדינה יהודית ולמדינה ערבית.|في 29 تشرين الثاني 1947 صوّتت الأمم المتحدة وقرّرت تقسيم البلاد إلى دولة يهودية ودولة عربية.|29 ноября 1947 года ООН проголосовала и решила разделить страну на еврейское и арабское государства.|On November 29, 1947 the UN voted to divide the land into a Jewish state and an Arab state.
E xh_radio|t|ברדיו|في الراديو|по радио|on the radio
E xh_tv|t|בטלוויזיה|في التلفاز|по телевизору|on television
E xh_inet|t|באינטרנט|في الإنترنت|в интернете|on the internet
E xh_mobile|t|בטלפון נייד|في الهاتف المحمول|по мобильному телефону|on a mobile phone
Q איך שמעו אנשים ברחוב את ההכרזה על הקמת המדינה?|كيف سمع الناس في الشارع إعلان قيام الدولة؟|Как люди на улице услышали провозглашение государства?|How did people in the street hear the declaration of the state?|xh_radio|xh_tv,xh_inet,xh_mobile
Y ב-1948 לא היו טלוויזיה ואינטרנט בבתים, ולכן אנשים שמעו את ההכרזה ברדיו.|سنة 1948 لم يكن في البيوت تلفزيون ولا إنترنت، لذلك سمع الناس الإعلان في الراديو.|В 1948 году дома не было телевизора и интернета, поэтому люди слушали декларацию по радио.|In 1948 homes had no TV or internet, so people heard the declaration on the radio.
E xh_5iyar|t|ה׳ באייר|الخامس من شهر إيّار العبري|5 ияра|5 Iyar
E xh_15shvat|t|ט״ו בשבט|الخامس عشر من شهر شفاط العبري|15 швата|15 Shevat
E xh_14adar|t|י״ד באדר|الرابع عشر من شهر أدار العبري|14 адара|14 Adar
E xh_1tishrei|t|א׳ בתשרי|الأول من شهر تشري العبري|1 тишрея|1 Tishrei
Q באיזה תאריך עברי קמה מדינת ישראל?|في أيّ تاريخ عبري قامت دولة إسرائيل؟|В какой день по еврейскому календарю было создано Государство Израиль?|On which Hebrew date was the State of Israel founded?|xh_5iyar|xh_15shvat,xh_14adar,xh_1tishrei
Y 14 במאי 1948 היה בלוח העברי ה׳ באייר, ולכן חוגגים את יום העצמאות בתאריך הזה.|يوم 14 أيار 1948 وافق في التقويم العبري الخامس من إيّار، لذلك يُحتفل بيوم الاستقلال في هذا التاريخ.|14 мая 1948 года по еврейскому календарю было 5 ияра, поэтому День независимости отмечают в эту дату.|May 14, 1948 was 5 Iyar in the Hebrew calendar, so Independence Day is celebrated on that date.
E xh_inmuseum|l|במוזיאון|في متحف|в музее|in a museum
E xh_onbeach|l|על חוף הים|على شاطئ البحر|на пляже|on the beach
E xh_inschool|l|בבית ספר|في مدرسة|в школе|in a school
E xh_inmarket|l|בשוק|في السوق|на рынке|in the market
Q באיזה מקום בתל אביב הכריז בן־גוריון על הקמת המדינה?|في أيّ مكان في تل أبيب أعلن بن غوريون قيام الدولة؟|Где в Тель-Авиве Бен-Гурион провозгласил создание государства?|Where in Tel Aviv did Ben-Gurion declare the state?|xh_inmuseum|xh_onbeach,xh_inschool,xh_inmarket
Y ההכרזה נערכה במוזיאון בתל אביב, באולם שהיום נקרא היכל העצמאות.|جرى الإعلان في متحف في تل أبيب، في قاعة اسمها اليوم قاعة الاستقلال.|Декларацию прочитали в музее в Тель-Авиве, в зале, который сегодня называют Залом независимости.|The declaration took place in a museum in Tel Aviv, in a hall now called Independence Hall.
S aliyah|✈️|#29853c|עולים חדשים מכל העולם|مهاجرون جدد من كل العالم|новые репатрианты со всего мира|New Immigrants from All Over the World
L אחרי הקמת המדינה הגיעו אליה יהודים רבים מארצות שונות. מי שמגיע לגור בישראל נקרא עולה חדש.|بعد قيام الدولة وصل إليها كثير من اليهود من بلاد مختلفة. ومن يأتي ليسكن في إسرائيل يُسمّى مهاجرًا جديدًا (عوليه).|После создания государства в него приехали многие евреи из разных стран. Тот, кто приезжает жить в Израиль, называется новым репатриантом.|After the State was founded, many Jews came to it from different countries. Someone who comes to live in Israel is called a new immigrant.
L בשנים 1949 ו־1950 מטוסים הביאו כמעט כל יהודי תימן לישראל. המבצע נקרא ״על כנפי נשרים״, ובפי כולם ״מרבד הקסמים״.|في عامي 1949 و1950 نقلت الطائرات تقريبًا كل يهود اليمن إلى إسرائيل. اسم العملية «على أجنحة النسور»، ويقول عنها الناس «بساط الريح».|В 1949 и 1950 годах самолёты привезли в Израиль почти всех евреев Йемена. Операция называлась «На крыльях орлов», а в народе - «Ковёр-самолёт».|In 1949 and 1950 planes brought almost all the Jews of Yemen to Israel. The operation was called "On Eagles' Wings", and many call it "Magic Carpet".
L יהודים הגיעו גם ממרוקו, מעיראק, מפולין, מרומניה ועוד. כל קבוצה הביאה אוכל, מוזיקה ומנהגים משלה.|ووصل يهود أيضًا من المغرب والعراق وبولندا ورومانيا وغيرها. وجاءت كل مجموعة بطعامها وموسيقاها وعاداتها.|Евреи приехали и из Марокко, Ирака, Польши, Румынии и других стран. Каждая группа привезла свою еду, музыку и обычаи.|Jews also came from Morocco, Iraq, Poland, Romania and more. Each group brought its own food, music and customs.
L בשנות התשעים הגיעו מאות אלפי עולים מברית המועצות לשעבר, ובהם רופאים, מוזיקאים ומדענים.|في التسعينيات وصل مئات الآلاف من المهاجرين من الاتحاد السوفييتي السابق، منهم أطباء وموسيقيون وعلماء.|В девяностые годы приехали сотни тысяч репатриантов из бывшего Советского Союза, среди них врачи, музыканты и учёные.|In the 1990s hundreds of thousands of immigrants came from the former Soviet Union, among them doctors, musicians and scientists.
L גם מאתיופיה הגיעו עולים, במבצעים גדולים בשנים 1984 ו־1991. היום ישראל היא בית לאנשים מהרבה תרבויות.|وجاء مهاجرون أيضًا من إثيوبيا في عمليات كبيرة في سنتي 1984 و1991. واليوم إسرائيل بيت لأناس من ثقافات كثيرة.|Репатрианты приезжали и из Эфиопии, в больших операциях 1984 и 1991 годов. Сегодня Израиль - дом для людей из многих культур.|Immigrants also came from Ethiopia, in big operations in 1984 and 1991. Today Israel is home to people from many cultures.
Q איך קוראים למי שמגיע לגור בישראל?|ماذا نسمّي من يأتي ليسكن في إسرائيل؟|Как называют того, кто приезжает жить в Израиль?|What do we call someone who comes to live in Israel?|olah|tourist,guest_b,visitor_b
Y מעבר לגור בישראל נקרא עלייה, ולכן מי שמגיע נקרא עולה חדש.|الانتقال للعيش في إسرائيل يُسمّى بالعبرية عاليا، لذلك من يأتي يُسمّى مهاجرًا جديدًا (عوليه).|Переезд жить в Израиль на иврите называют алия, поэтому приехавший называется новым репатриантом.|Moving to live in Israel is called aliyah in Hebrew, so someone who comes is called a new immigrant.
Q מאיזו מדינה הביאו המטוסים כמעט את כל היהודים ב״מרבד הקסמים״?|من أي بلد نقلت الطائرات تقريبًا كل اليهود في «بساط الريح»؟|Из какой страны самолёты привезли почти всех евреев в операции «Ковёр-самолёт»?|From which country did planes bring almost all the Jews in "Magic Carpet"?|yemen|japan,brazil,canada
Y מטוסים הביאו את יהודי תימן, ולכן קראו למבצע מרבד הקסמים, כמו שטיח מעופף מהאגדות.|نقلت الطائرات يهود اليمن جوًّا، لذلك سُمّيت العملية بساط الريح، مثل البساط الطائر في الحكايات.|Евреев Йемена везли по воздуху, поэтому операцию назвали Ковёр-самолёт, как в сказках.|The Jews of Yemen were flown in by plane, so the operation was named Magic Carpet, like the flying carpet in tales.
Q מה כל קבוצת עולים הביאה איתה?|ماذا أحضرت معها كل مجموعة مهاجرين؟|Что привезла с собой каждая группа репатриантов?|What did each group of immigrants bring with them?|food_music|nothing_b,snow_b,sand_b
Y כל קהילה חיה שנים רבות בארץ אחרת, ולכן הביאה איתה אוכל, מוזיקה ומנהגים משלה.|عاشت كل جماعة سنوات طويلة في بلد آخر، لذلك جاءت بطعامها وموسيقاها وعاداتها.|Каждая община долго жила в другой стране, поэтому привезла свою еду, музыку и обычаи.|Each community had lived for many years in another country, so it brought its own food, music and customs.
Q מאיזו מדינה בא גל גדול של עולים בשנות התשעים?|من أي دولة جاءت موجة كبيرة من المهاجرين في التسعينيات؟|Из какой страны приехала большая волна репатриантов в девяностые годы?|From which country did a big wave of immigrants come in the 1990s?|ussr|usa_c,france_c,argentina_c
Y בשנות התשעים ברית המועצות התפרקה, ויהודים רבים יכלו לצאת ממנה ולעלות לישראל.|في التسعينيات تفكّك الاتحاد السوفييتي، فاستطاع يهود كثيرون الخروج منه والهجرة إلى إسرائيل.|В девяностые годы Советский Союз распался, и многие евреи смогли уехать в Израиль.|In the 1990s the Soviet Union broke apart, and many Jews were able to leave and move to Israel.
Q מאיזו מדינה באפריקה הגיעו עולים בשנים 1984 ו־1991?|من أي بلد في أفريقيا جاء مهاجرون في سنتي 1984 و1991؟|Из какой страны Африки приехали репатрианты в 1984 и 1991 годах?|From which African country did immigrants come in 1984 and 1991?|ethiopia|kenya,nigeria,ghana
Y אתיופיה היא מדינה באפריקה, וממנה הגיעו עולים במבצעים גדולים בשנים 1984 ו-1991.|إثيوبيا دولة في أفريقيا، ومنها جاء مهاجرون في عمليات كبيرة سنتي 1984 و1991.|Из Эфиопии, страны в Африке, репатрианты приехали в больших операциях 1984 и 1991 годов.|Ethiopia is a country in Africa, and immigrants came from it in big operations in 1984 and 1991.
E xh_byplane|t|במטוסים|بالطائرات|на самолётах|by plane
E xh_byship|t|באוניות|بالسفن|на кораблях|by ship
E xh_bytrain|t|ברכבות|بالقطارات|на поездах|by train
E xh_onfoot|t|ברגל|سيرًا على الأقدام|пешком|on foot
Q איך הגיעו יהודי תימן לישראל ב״מרבד הקסמים״?|كيف وصل يهود اليمن إلى إسرائيل في عملية "البساط السحري"؟|Как йеменские евреи прибыли в Израиль во время операции «Волшебный ковёр»?|How did the Jews of Yemen reach Israel in "Magic Carpet"?|xh_byplane|xh_byship,xh_bytrain,xh_onfoot
Y תימן רחוקה מישראל, ולכן הטיסו את היהודים במטוסים ולא בדרך ארוכה ביבשה.|اليمن بعيدة عن إسرائيل، لذلك نُقل اليهود بالطائرات وليس في طريق طويل برًّا.|Йемен далеко от Израиля, поэтому евреев везли на самолётах, а не долгой дорогой по суше.|Yemen is far from Israel, so the Jews were flown by plane and not on a long trip over land.
E xh_4950|y|1949 ו־1950|1949 و1950|1949 и 1950|1949 and 1950
E xh_8491|y|1984 ו־1991|1984 و1991|1984 и 1991|1984 and 1991
E xh_9798|y|1897 ו־1898|1897 و1898|1897 и 1898|1897 and 1898
E xh_0304|y|2003 ו־2004|2003 و2004|2003 и 2004|2003 and 2004
Q באילו שנים הביאו המטוסים את יהודי תימן?|في أيّ سنوات أحضرت الطائرات يهود اليمن؟|В каких годах самолёты привезли евреев Йемена?|In which years did the planes bring the Jews of Yemen?|xh_4950|xh_8491,xh_9798,xh_0304
Y מבצע מרבד הקסמים התחיל ב-1949, אחרי שהמדינה קמה, ונגמר ב-1950.|بدأت عملية بساط الريح سنة 1949 بعد قيام الدولة، وانتهت سنة 1950.|Операция Ковёр-самолёт началась в 1949 году, после создания государства, и закончилась в 1950.|Operation Magic Carpet began in 1949, after the state was founded, and ended in 1950.
E xh_docs|t|רופאים, מוזיקאים ומדענים|أطبّاء وموسيقيون وعلماء|врачи, музыканты и учёные|doctors, musicians and scientists
E xh_onlykids|t|רק ילדים קטנים, בלי הורים|أولاد صغار فقط، بلا أهل|только маленькие дети, без родителей|only small children, without parents
E xh_onlysold|t|רק חיילים וקצינים|جنود وضبّاط فقط|только солдаты и офицеры|only soldiers and officers
E xh_onlyfarm|t|רק חקלאים ורועי צאן|مزارعون ورعاة غنم فقط|только крестьяне и пастухи|only farmers and shepherds
Q מי היו בין העולים מברית המועצות לשעבר?|من كان بين القادمين من الاتحاد السوفييتي السابق؟|Кто был среди репатриантов из бывшего СССР?|Who was among the immigrants from the former Soviet Union?|xh_docs|xh_onlykids,xh_onlysold,xh_onlyfarm
Y בברית המועצות יהודים רבים למדו מקצועות, ולכן הגיעו משם רופאים, מוזיקאים ומדענים.|في الاتحاد السوفييتي تعلّم يهود كثيرون مهنًا، لذلك وصل من هناك أطباء وموسيقيون وعلماء.|В Советском Союзе многие евреи получили профессию, поэтому оттуда приехали врачи, музыканты и учёные.|Many Jews in the Soviet Union had studied professions, so doctors, musicians and scientists arrived.
E xh_90s|t|בשנות התשעים|في التسعينيات|в девяностые годы|in the 1990s
E xh_50s|t|בשנות החמישים|في الخمسينيات|в пятидесятые годы|in the 1950s
E xh_100ago|t|לפני מאה שנה|قبل مئة سنة|сто лет назад|a hundred years ago
E xh_y48|t|בשנת 1948|في سنة 1948|в 1948 году|in 1948
Q מתי הגיע הגל הגדול של העולים מברית המועצות לשעבר?|متى وصلت الموجة الكبيرة من القادمين من الاتحاد السوفييتي السابق؟|Когда приехала большая волна репатриантов из бывшего СССР?|When did the big wave of immigrants from the former Soviet Union arrive?|xh_90s|xh_50s,xh_100ago,xh_y48
Y ברית המועצות התפרקה בתחילת שנות התשעים, ואז הגיע הגל הגדול של העולים.|تفكّك الاتحاد السوفييتي في بداية التسعينيات، وعندها وصلت الموجة الكبيرة من المهاجرين.|Советский Союз распался в начале девяностых, и тогда приехала большая волна репатриантов.|The Soviet Union broke apart in the early 1990s, and that is when the big wave of immigrants came.
E xh_manycult|t|בית לאנשים מהרבה תרבויות|بيت لأناس من ثقافات كثيرة|дом для людей из многих культур|a home for people from many cultures
E xh_onecult|t|מקום של תרבות אחת בלבד|مكان لثقافة واحدة فقط|место только одной культуры|a place of only one culture
E xh_noolim|t|מקום שלא הגיעו אליו עולים|مكان لم يصل إليه مهاجرون|место, куда не приезжали репатрианты|a place where no immigrants came
E xh_bornonly|t|בית רק למי שנולד בו|بيت فقط لمن وُلد فيه|дом только для тех, кто там родился|a home only for people born there
Q מה ישראל היום, אחרי כל גלי העלייה?|ماذا أصبحت إسرائيل اليوم بعد كل موجات الهجرة؟|Чем стал Израиль сегодня, после всех волн репатриации?|After all the waves of immigration, what is Israel today?|xh_manycult|xh_onecult,xh_noolim,xh_bornonly
Y עולים הגיעו מארצות רבות, וכל קבוצה הביאה תרבות משלה, ולכן יש בישראל תרבויות רבות.|جاء مهاجرون من بلاد كثيرة، وكل مجموعة جاءت بثقافتها، لذلك في إسرائيل ثقافات كثيرة.|Репатрианты приехали из многих стран, каждая группа со своей культурой, поэтому в Израиле много культур.|Immigrants came from many countries, each group with its own culture, so Israel has many cultures.
S shoah|🕯️|#495057|יום הזיכרון לשואה|يوم ذكرى الكارثة (الشواه)|День памяти Холокоста|Holocaust Remembrance Day
L זה נושא עצוב וחשוב. כדאי ללמוד עליו בעדינות, ואפשר לדבר עליו עם מבוגר.|هذا موضوع حزين ومهم. من الجيّد أن نتعلّم عنه بلطف، ويمكن أن نتحدّث عنه مع شخص بالغ.|Это грустная и важная тема. Лучше узнавать о ней бережно, и можно поговорить об этом со взрослым.|This is a sad and important subject. It is good to learn about it gently, and you can talk about it with a grown-up.
L לפני יותר משמונים שנה, במלחמת העולם השנייה, הנאצים רצחו שישה מיליון יהודים. את זה מכנים השואה.|قبل أكثر من ثمانين سنة، في الحرب العالمية الثانية، قتل النازيون ستة ملايين يهودي. وهذا ما نسمّيه الكارثة (الشواه).|Больше восьмидесяти лет назад, во время Второй мировой войны, нацисты убили шесть миллионов евреев. Это называют Холокостом.|More than eighty years ago, in the Second World War, the Nazis murdered six million Jews. This is called the Holocaust.
L היו גם אנשים טובים שהסתירו יהודים וסיכנו את חייהם. אותם קוראים חסידי אומות העולם.|وكان هناك أيضًا أناس طيّبون أخفوا يهودًا وخاطروا بحياتهم. يُسمّون «حسيدي أومّوت هعولام» (الصالحين بين الأمم).|Были и добрые люди, которые прятали евреев и рисковали жизнью. Их называют Праведниками народов мира.|There were also good people who hid Jews and risked their lives. They are called Righteous Among the Nations.
L בכל שנה יש בישראל יום זיכרון לשואה. מצפצפת סירנה במשך שתי דקות, וכולם עומדים בשקט.|في كل سنة هناك يوم ذكرى للكارثة في إسرائيل. تُطلق صفّارة الإنذار دقيقتين، ويقف الجميع بصمت.|Каждый год в Израиле отмечают День памяти Холокоста. Две минуты звучит сирена, и все стоят молча.|Every year Israel has a Holocaust Remembrance Day. A siren sounds for two minutes, and everyone stands in silence.
L בירושלים יש מוזיאון לזכר השואה, יד ושם. שם שומרים את שמות הנספים ואת הסיפורים שלהם.|في القدس متحف لذكرى الكارثة اسمه «ياد فاشيم». هناك تُحفظ أسماء الضحايا وقصصهم.|В Иерусалиме есть музей памяти Холокоста - Яд ва-Шем. Там хранят имена погибших и их истории.|In Jerusalem there is a museum in memory of the Holocaust, Yad Vashem. It keeps the names and stories of those who were killed.
Q איך מכבדים את הזיכרון ביום השואה?|كيف نُكرم الذكرى في يوم الكارثة؟|Как чтят память в День Холокоста?|How do we honor the memory on Holocaust Remembrance Day?|siren_stand|party,race,shopping
Y בזמן הסירנה כולם עוצרים ועומדים בשקט, כדי לזכור יחד את מי שנרצחו.|عندما تُطلق الصفّارة يتوقّف الجميع ويقفون بصمت، ليتذكّروا معًا من قُتلوا.|Когда звучит сирена, все останавливаются и молча стоят, чтобы вместе вспомнить погибших.|When the siren sounds, everyone stops and stands in silence to remember together those who were killed.
Q כמה זמן מצפצפת הסירנה ביום השואה?|كم تدوم صفّارة الإنذار في يوم الكارثة؟|Сколько длится сирена в День Холокоста?|How long does the siren sound on Holocaust Remembrance Day?|two_min|ten_sec,an_hour,all_day
Y ביום הזיכרון לשואה הסירנה נשמעת 2 דקות, וכל הזמן הזה עומדים בשקט.|في يوم ذكرى الكارثة تُسمع الصفّارة دقيقتين، ويقف الناس بصمت طوال هذا الوقت.|В День памяти Холокоста сирена звучит 2 минуты, и всё это время люди стоят молча.|On Holocaust Remembrance Day the siren sounds for 2 minutes, and people stand silently the whole time.
Q איך קוראים לאנשים שהסתירו יהודים וסיכנו את חייהם?|ماذا نسمّي الناس الذين أخفوا يهودًا وخاطروا بحياتهم؟|Как называют людей, которые прятали евреев и рисковали жизнью?|What are the people who hid Jews and risked their lives called?|righteous|survivors_c,partisans_c,olim_c
Y אנשים שלא היו יהודים וסיכנו את חייהם כדי להציל יהודים נקראים חסידי אומות העולם.|الناس من غير اليهود الذين خاطروا بحياتهم لإنقاذ يهود يُسمّون الصالحين بين الأمم.|Неевреев, которые рисковали жизнью, чтобы спасти евреев, называют Праведниками народов мира.|People who were not Jewish and risked their lives to save Jews are called Righteous Among the Nations.
Q איך קוראים למוזיאון לזכר השואה בירושלים?|ماذا يُسمّى متحف ذكرى الكارثة في القدس؟|Как называется музей памяти Холокоста в Иерусалиме?|What is the Holocaust museum in Jerusalem called?|yadvashem|israelmuseum,biblelands_m,science_m
Y יד ושם הוא המוזיאון לזכר השואה בירושלים, והשם שלו פירושו זיכרון ושם לכל אחד.|ياد فاشيم هو متحف ذكرى الكارثة في القدس، ومعنى اسمه ذكرى واسم لكل واحد.|Музей памяти Холокоста в Иерусалиме называется Яд ва-Шем, что значит память и имя.|The Holocaust memorial museum in Jerusalem is Yad Vashem, a name that means a memorial and a name.
Q למה חשוב לזכור?|لماذا من المهم أن نتذكّر؟|Почему важно помнить?|Why is it important to remember?|remember_why|forget_why,nobody_why,dont_why
Y מי שזוכר מה קרה יכול ללמוד ממנו, ולכן הזיכרון עוזר שדבר כזה לא יקרה שוב.|من يتذكّر ما حدث يستطيع أن يتعلّم منه، لذلك تساعد الذكرى ألا يتكرّر مثل هذا الأمر.|Тот, кто помнит, что случилось, может извлечь урок, поэтому память помогает, чтобы такое не повторилось.|People who remember what happened can learn from it, so remembering helps keep it from happening again.
E xh_ww2|t|במלחמת העולם השנייה|في الحرب العالمية الثانية|во Второй мировой войне|in the Second World War
E xh_ww1|t|במלחמת העולם הראשונה|في الحرب العالمية الأولى|в Первой мировой войне|in the First World War
E xh_indepw|t|במלחמת העצמאות|في حرب الاستقلال|в Войне за независимость|in the War of Independence
E xh_6day|t|במלחמת ששת הימים|في حرب الأيام الستة|в Шестидневной войне|in the Six-Day War
Q באיזו מלחמה הייתה השואה?|في أيّ حرب وقعت المحرقة (الشواه)؟|Во время какой войны была Катастрофа (Холокост)?|During which war did the Holocaust happen?|xh_ww2|xh_ww1,xh_indepw,xh_6day
Y השואה קרתה בזמן מלחמת העולם השנייה, שנמשכה מ-1939 עד 1945.|حدثت الكارثة في زمن الحرب العالمية الثانية، التي استمرت من 1939 إلى 1945.|Холокост был во время Второй мировой войны, которая шла с 1939 по 1945 год.|The Holocaust happened during the Second World War, which lasted from 1939 to 1945.
E xh_names|t|את השמות והסיפורים של הנספים|أسماء الضحايا وقصصهم|имена и истории погибших|the names and stories of those who died
E xh_tripph|t|תמונות של מקומות לטיול|صور لأماكن للرحلات|фотографии мест для поездок|photos of places to visit
E xh_kidart|t|ציורים של ילדים על הטבע|رسومات أطفال عن الطبيعة|детские рисунки о природе|children's drawings of nature
E xh_cookb|t|ספרי בישול ישנים|كتب طبخ قديمة|старые кулинарные книги|old cookbooks
Q מה שומרים ביד ושם?|ماذا يحفظون في "ياد فاشيم"؟|Что хранят в «Яд ва-Шем»?|What is kept at Yad Vashem?|xh_names|xh_tripph,xh_kidart,xh_cookb
Y ביד ושם שומרים את השמות והסיפורים של הנספים, כדי שאף אחד מהם לא יישכח.|في ياد فاشيم تُحفظ أسماء الضحايا وقصصهم، لكي لا يُنسى أحد منهم.|В Яд ва-Шем хранят имена и истории погибших, чтобы никого из них не забыли.|Yad Vashem keeps the names and stories of those who died, so that none of them is forgotten.
E xh_hid|t|הסתירו יהודים וסיכנו את חייהם|خبّأوا يهودًا وعرّضوا حياتهم للخطر|прятали евреев и рисковали жизнью|they hid Jews and risked their lives
E xh_wrote|t|כתבו ספרים על הטבע|كتبوا كتبًا عن الطبيعة|писали книги о природе|they wrote books about nature
E xh_builtil|t|בנו בתים חדשים בישראל|بنوا بيوتًا جديدة في إسرائيل|строили новые дома в Израиле|they built new houses in Israel
E xh_sang|t|שרו שירים ברדיו|غنّوا أغاني في الراديو|пели песни по радио|they sang songs on the radio
Q מה עשו חסידי אומות העולם?|ماذا فعل الصالحون بين الأمم؟|Что сделали Праведники народов мира?|What did the Righteous Among the Nations do?|xh_hid|xh_wrote,xh_builtil,xh_sang
Y חסידי אומות העולם הסתירו יהודים מהנאצים, למרות שידעו שזה מסוכן גם להם.|خبّأ الصالحون بين الأمم يهودًا من النازيين، مع أنهم عرفوا أن ذلك خطر عليهم أيضًا.|Праведники народов мира прятали евреев от нацистов, хотя знали, что это опасно и для них.|The Righteous Among the Nations hid Jews from the Nazis, even though they knew it was dangerous for them too.
E xh_80y|t|לפני יותר משמונים שנה|قبل أكثر من ثمانين سنة|больше восьмидесяти лет назад|more than eighty years ago
E xh_10ya|t|לפני עשר שנים|قبل عشر سنوات|десять лет назад|ten years ago
E xh_1000y|t|לפני יותר מאלף שנה|قبل أكثر من ألف سنة|больше тысячи лет назад|more than a thousand years ago
E xh_lastyr|t|בשנה שעברה|في السنة الماضية|в прошлом году|last year
Q מתי הייתה השואה?|متى وقعت المحرقة (الشواه)؟|Когда была Катастрофа?|When did the Holocaust happen?|xh_80y|xh_10ya,xh_1000y,xh_lastyr
Y השואה הייתה בשנות הארבעים, ומאז עברו יותר מ-80 שנה.|كانت الكارثة في الأربعينيات، ومنذ ذلك الوقت مرّت أكثر من 80 سنة.|Холокост был в сороковые годы, и с тех пор прошло больше 80 лет.|The Holocaust was in the 1940s, and more than 80 years have passed since then.
E xh_trusted|t|עם מבוגר שאנחנו סומכים עליו|مع شخص بالغ نثق به|со взрослым, которому мы доверяем|with an adult we trust
E xh_noone|t|עם אף אחד, שומרים בלב|مع لا أحد، نكتمه في القلب|ни с кем, держим в себе|with no one, we keep it inside
E xh_youngkid|t|רק עם ילד קטן ממני|فقط مع ولد أصغر منّي|только с ребёнком младше меня|only with a child younger than me
E xh_stranger|t|עם אדם זר ברחוב|مع شخص غريب في الشارع|с незнакомцем на улице|with a stranger in the street
Q עם מי טוב לדבר על נושא עצוב כמו השואה?|مع من يحسن أن نتكلّم عن موضوع حزين مثل المحرقة؟|С кем стоит поговорить о такой грустной теме, как Катастрофа?|Who is good to talk to about a sad subject like the Holocaust?|xh_trusted|xh_noone,xh_youngkid,xh_stranger
Y זה נושא עצוב, ומבוגר שסומכים עליו יכול להקשיב, להסביר ולעזור להרגיש טוב יותר.|هذا موضوع حزين، والشخص البالغ الذي نثق به يستطيع أن يستمع ويشرح ويساعدنا لنشعر بتحسّن.|Это грустная тема, и взрослый, которому мы доверяем, может выслушать, объяснить и поддержать.|This is a sad subject, and an adult we trust can listen, explain and help us feel better.
S people|🌟|#ca4071|אנשים שעשו היסטוריה|أشخاص صنعوا التاريخ|люди, которые творили историю|People Who Made History
L היסטוריה לא עושים רק מלכים. גם אנשים רגילים עם רעיון טוב ועם סבלנות יכולים לשנות דברים.|التاريخ لا يصنعه الملوك فقط. فالناس العاديون أيضًا، بفكرة جيدة وصبر، يمكنهم أن يغيّروا الأشياء.|Историю делают не только цари. Обычные люди с хорошей идеей и терпением тоже могут многое изменить.|History is not made only by kings. Ordinary people with a good idea and patience can also change things.
L בנימין זאב הרצל חלם על בית ליהודים, ואליעזר בן־יהודה החזיר את העברית לדיבור.|حلم بنيامين زئيف هرتسل ببيت لليهود، وأعاد إليعيزر بن يهودا العبرية إلى الكلام.|Биньямин Зеэв Герцль мечтал о доме для евреев, а Элиэзер Бен-Йехуда вернул иврит в разговорную речь.|Binyamin Ze'ev Herzl dreamed of a home for the Jews, and Eliezer Ben-Yehuda brought Hebrew back to speech.
L חיים ויצמן היה מדען, והוא היה הנשיא הראשון של ישראל.|كان حاييم وايزمان عالِمًا، وكان أول رئيس لدولة إسرائيل.|Хаим Вейцман был учёным, и он стал первым президентом Израиля.|Chaim Weizmann was a scientist, and he was the first President of Israel.
L גולדה מאיר הייתה ראש הממשלה של ישראל משנת 1969 עד 1974. היא האישה היחידה עד היום שהייתה ראש הממשלה.|كانت غولدا مائير رئيسة حكومة إسرائيل من سنة 1969 إلى 1974. وهي المرأة الوحيدة حتى اليوم التي تولّت رئاسة الحكومة.|Голда Меир была премьер-министром Израиля с 1969 по 1974 год. Она единственная женщина, которая занимала этот пост.|Golda Meir was Israel's Prime Minister from 1969 to 1974. She is the only woman so far who was Prime Minister.
L אילן רמון היה האסטרונאוט הישראלי הראשון. הוא טס לחלל בשנת 2003.|كان إيلان رامون أول رائد فضاء إسرائيلي. سافر إلى الفضاء في سنة 2003.|Илан Рамон был первым израильским астронавтом. Он полетел в космос в 2003 году.|Ilan Ramon was the first Israeli astronaut. He flew into space in 2003.
L לכל אחד מאיתנו יש סיפור. אפשר לשאול את המשפחה: מי עשה משהו חשוב, ואיך?|لكل واحد منا قصة. يمكنك أن تسأل العائلة: من فعل شيئًا مهمًّا، وكيف؟|У каждого из нас есть своя история. Можно спросить у семьи: кто сделал что-то важное и как?|Each of us has a story. You can ask your family: who did something important, and how?
Q מי הייתה האישה היחידה שהייתה ראש ממשלה בישראל?|من هي المرأة الوحيدة التي ترأّست الحكومة في إسرائيل؟|Кто была единственной женщиной — премьер-министром Израиля?|Who was the only woman Prime Minister of Israel?|golda|esther,miriam,sarah
Y גולדה מאיר הייתה ראש הממשלה בשנים 1969 עד 1974, ועד היום אף אישה אחרת לא הייתה בתפקיד.|كانت غولدا مائير رئيسة الحكومة من 1969 إلى 1974، وحتى اليوم لم تتولّ امرأة أخرى هذا المنصب.|Голда Меир была премьер-министром с 1969 по 1974 год, и до сих пор другой женщины на этом посту не было.|Golda Meir was Prime Minister from 1969 to 1974, and no other woman has held the job since.
Q מי היה האסטרונאוט הישראלי הראשון?|من كان أول رائد فضاء إسرائيلي؟|Кто был первым израильским астронавтом?|Who was the first Israeli astronaut?|ramon|herzl,ben_yehuda,ben_gurion
Y אילן רמון היה טייס, ובשנת 2003 הוא נהיה הישראלי הראשון שטס לחלל.|كان إيلان رامون طيّارًا، وفي سنة 2003 صار أول إسرائيلي يسافر إلى الفضاء.|Илан Рамон был лётчиком и в 2003 году стал первым израильтянином, полетевшим в космос.|Ilan Ramon was a pilot, and in 2003 he became the first Israeli to fly into space.
Q מי חלם על בית ליהודים וכינס את הקונגרס הציוני הראשון?|من حلم ببيت لليهود وجمع المؤتمر الصهيوني الأول؟|Кто мечтал о доме для евреев и собрал первый сионистский конгресс?|Who dreamed of a home for the Jews and called the first Zionist Congress?|herzl|ben_yehuda,golda,weizmann
Y הרצל חלם על בית ליהודים, ולכן כינס בבזל את הקונגרס הציוני הראשון.|حلم هرتسل ببيت لليهود، لذلك جمع المؤتمر الصهيوني الأول في بازل.|Герцль мечтал о доме для евреев, поэтому собрал в Базеле первый сионистский конгресс.|Herzl dreamed of a home for the Jews, so he gathered the first Zionist Congress in Basel.
Q מי החזיר את העברית לדיבור?|من أعاد العبرية إلى الكلام؟|Кто вернул иврит в разговорную речь?|Who brought Hebrew back to speech?|ben_yehuda|ramon,herzl,weizmann
Y בן־יהודה דיבר עברית כל יום, המציא מילים וכתב מילון, וכך החזיר אותה לדיבור.|تكلّم بن يهودا العبرية كل يوم، واخترع كلمات وكتب قاموسًا، وهكذا أعادها إلى الكلام.|Бен-Йехуда говорил на иврите каждый день, придумывал слова и написал словарь и так вернул иврит в речь.|Ben-Yehuda spoke Hebrew every day, invented words and wrote a dictionary, and so brought it back to speech.
Q מי היה הנשיא הראשון של ישראל?|من كان أول رئيس للدولة في إسرائيل؟|Кто был первым президентом Израиля?|Who was Israel's first President?|weizmann|ben_gurion,herzl,golda
Y חיים ויצמן היה מדען ומנהיג ציוני ידוע, ולכן נבחר להיות הנשיא הראשון של ישראל.|كان حاييم وايزمان عالِمًا وقائدًا صهيونيًا معروفًا، لذلك اختير ليكون أول رئيس لإسرائيل.|Хаим Вейцман был учёным и известным сионистским лидером, поэтому его выбрали первым президентом.|Chaim Weizmann was a scientist and a well known Zionist leader, so he was chosen as Israel's first President.
Q לאן טס אילן רמון?|إلى أين سافر إيلان رامون؟|Куда летал Илан Рамон?|Where did Ilan Ramon fly?|space|bottom_sea,mountain,cave
Y אילן רמון היה אסטרונאוט, ואסטרונאוט הוא מי שטס בחללית לחלל.|كان إيلان رامون رائد فضاء، ورائد الفضاء هو من يطير بمركبة إلى الفضاء.|Илан Рамон был астронавтом, а астронавт летает на космическом корабле в космос.|Ilan Ramon was an astronaut, and an astronaut is someone who flies a spacecraft into space.
E xh_scientist|p|מדען|عالِم|учёный|a scientist
E xh_astro|p|אסטרונאוט|رائد فضاء|астронавт|an astronaut
E xh_king|p|מלך|ملك|царь|a king
Q מה היה המקצוע של חיים ויצמן?|ماذا كانت مهنة حاييم وايزمان؟|Кем по профессии был Хаим Вейцман?|What was Chaim Weizmann's profession?|xh_scientist|xh_astro,xh_journal,xh_king
Y חיים ויצמן היה כימאי, כלומר מדען שחוקר חומרים.|كان حاييم وايزمان كيميائيًا، أي عالِمًا يبحث في المواد.|Хаим Вейцман был химиком, то есть учёным, который изучает вещества.|Chaim Weizmann was a chemist, which means a scientist who studies materials.
E xh_y2003|y|2003|2003|2003|2003
Q באיזו שנה טס אילן רמון לחלל?|في أيّ سنة طار إيلان رامون إلى الفضاء؟|В каком году Илан Рамон полетел в космос?|In which year did Ilan Ramon fly to space?|xh_y2003|y1997,y1968,y1948
Y אילן רמון טס לחלל במעבורת חלל אמריקנית בשנת 2003.|سافر إيلان رامون إلى الفضاء بمكّوك فضاء أمريكي سنة 2003.|Илан Рамон полетел в космос на американском космическом челноке в 2003 году.|Ilan Ramon flew into space on an American space shuttle in 2003.
E xh_anyone|t|גם אנשים רגילים עם רעיון טוב|أيضًا أناس عاديون لديهم فكرة جيدة|и обычные люди с хорошей идеей|ordinary people with a good idea too
E xh_kingsonly|t|רק מלכים ומלכות|الملوك والملكات فقط|только цари и царицы|only kings and queens
E xh_richonly|t|רק אנשים עשירים מאוד|الأشخاص الأغنياء جدًّا فقط|только очень богатые люди|only people who are very rich
E xh_oldonly|t|רק אנשים זקנים מאוד|كبار السنّ جدًّا فقط|только очень старые люди|only very old people
Q מי יכול לשנות דברים ולעשות היסטוריה?|من يستطيع أن يغيّر الأشياء ويصنع التاريخ؟|Кто может что-то изменить и войти в историю?|Who can change things and make history?|xh_anyone|xh_kingsonly,xh_richonly,xh_oldonly
Y הרצל ובן־יהודה לא היו מלכים, אבל עם רעיון טוב וסבלנות הם שינו את ההיסטוריה.|لم يكن هرتسل ولا بن يهودا ملكين، لكنهما غيّرا التاريخ بفكرة جيدة وصبر.|Ни Герцль, ни Бен-Йехуда не были царями, но с хорошей идеей и терпением они изменили историю.|Herzl and Ben-Yehuda were not kings, but with a good idea and patience they changed history.
E xh_6974|y|1969 עד 1974|1969 حتى 1974|с 1969 по 1974|1969 to 1974
E xh_4853|y|1948 עד 1953|1948 حتى 1953|с 1948 по 1953|1948 to 1953
E xh_9704|y|1897 עד 1904|1897 حتى 1904|с 1897 по 1904|1897 to 1904
E xh_0308|y|2003 עד 2008|2003 حتى 2008|с 2003 по 2008|2003 to 2008
Q באילו שנים הייתה גולדה מאיר ראש הממשלה?|في أيّ سنوات كانت غولدا مئير رئيسة الحكومة؟|В какие годы Голда Меир была премьер-министром?|In which years was Golda Meir prime minister?|xh_6974|xh_4853,xh_9704,xh_0308
Y גולדה מאיר נכנסה לתפקיד ראש הממשלה בשנת 1969, ועזבה אותו בשנת 1974.|تولّت غولدا مائير رئاسة الحكومة سنة 1969، وتركتها سنة 1974.|Голда Меир заняла пост премьер-министра в 1969 году и оставила его в 1974 году.|Golda Meir became Prime Minister in 1969 and left the job in 1974.
S treasure|🏛️|#0b7285|אוצרות מהעבר בארץ|كنوز من الماضي في البلاد|сокровища прошлого в нашей стране|Treasures from the Past in Our Land
L בארץ יש הרבה מקומות עתיקים שאפשר לבקר בהם. כל מקום מספר סיפור.|في البلاد أماكن قديمة كثيرة يمكن زيارتها. وكل مكان يحكي قصة.|В нашей стране много древних мест, которые можно посетить. Каждое место рассказывает свою историю.|The land has many ancient places you can visit. Every place tells a story.
L מצדה היא מצודה על הר גבוה ליד ים המלח. המלך הורדוס בנה שם ארמונות לפני יותר מאלפיים שנה.|مسعدة قلعة على جبل عالٍ قرب البحر الميت. بنى الملك هيرودس هناك قصورًا قبل أكثر من ألفي سنة.|Масада - это крепость на высокой горе у Мёртвого моря. Царь Ирод построил там дворцы больше двух тысяч лет назад.|Masada is a fortress on a high mountain near the Dead Sea. King Herod built palaces there more than two thousand years ago.
L בקיסריה יש תיאטרון רומי, נמל עתיק ואמת מים. אפשר לטייל בין הקירות העתיקים.|في قيسارية مسرح روماني وميناء قديم وقناة مياه. يمكنك التجوّل بين الجدران القديمة.|В Кесарии есть римский театр, древний порт и акведук. Можно гулять среди древних стен.|Caesarea has a Roman theater, an ancient port and an aqueduct. You can walk among the old walls.
L בבית שאן חפרו ומצאו עיר רומית שלמה, עם רחוב עם עמודים ותיאטרון גדול.|في بيسان حفروا ووجدوا مدينة رومانية كاملة، فيها شارع بأعمدة ومسرح كبير.|В Бейт-Шеане раскопали целый римский город с улицей с колоннами и большим театром.|In Beit She'an people dug and found a whole Roman city, with a street of columns and a big theater.
L בשנת 1947 ילד רועה מצא במערות ליד ים המלח כדי חרס עם מגילות עתיקות. אלה מגילות ים המלח.|في سنة 1947 وجد راعٍ شاب في كهوف قرب البحر الميت جرارًا فخّارية فيها لفائف قديمة. هذه هي مخطوطات البحر الميت.|В 1947 году молодой пастух нашёл в пещерах у Мёртвого моря глиняные кувшины с древними свитками. Это Кумранские свитки.|In 1947 a young shepherd found clay jars with ancient scrolls in caves near the Dead Sea. These are the Dead Sea Scrolls.
L חלק מהמגילות מוצגות בירושלים, בהיכל הספר במוזיאון ישראל.|يُعرض جزء من المخطوطات في القدس، في «هيخال هاسيفر» في متحف إسرائيل.|Часть свитков выставлена в Иерусалиме, в «Храме книги» в Музее Израиля.|Some of the scrolls are shown in Jerusalem, in the Shrine of the Book at the Israel Museum.
L כשמבקרים באתר עתיק מסתכלים ושומרים על המקום: לא מטפסים על הקירות ולא לוקחים אבנים הביתה.|عندما نزور موقعًا أثريًا ننظر ونحافظ على المكان: لا نتسلّق الجدران ولا نأخذ حجارة إلى البيت.|Когда мы приходим на древнее место, мы смотрим и бережём его: не лазаем по стенам и не берём камни домой.|When we visit an ancient site we look and take care of the place: we do not climb the walls and we do not take stones home.
Q איזה מקום הוא מצודה על הר ליד ים המלח?|أي مكان هو قلعة على جبل قرب البحر الميت؟|Какое место — крепость на горе у Мёртвого моря?|Which place is a fortress on a mountain near the Dead Sea?|masada|caesarea,beit_shean,eilat
Y מצדה בנויה על הר גבוה ליד ים המלח, ולכן היא הייתה מצודה שקשה להגיע אליה.|مسعدة مبنيّة على جبل عالٍ قرب البحر الميت، لذلك كانت قلعة يصعب الوصول إليها.|Масада стоит на высокой горе у Мёртвого моря, поэтому до этой крепости было трудно добраться.|Masada stands on a high mountain by the Dead Sea, so it was a fortress that was hard to reach.
Q מי בנה ארמונות במצדה?|من بنى قصورًا في مسعدة؟|Кто построил дворцы в Масаде?|Who built palaces at Masada?|herod|king_david,king_solomon,judah
Y המלך הורדוס אהב לבנות, והוא בנה במצדה ארמונות לפני יותר מ-2000 שנה.|أحبّ الملك هيرودس البناء، وبنى في مسعدة قصورًا قبل أكثر من 2000 سنة.|Царь Ирод любил строить и возвёл в Масаде дворцы больше 2000 лет назад.|King Herod loved to build, and he built palaces at Masada more than 2000 years ago.
Q באיזה מקום יש תיאטרון רומי, נמל עתיק ואמת מים?|أين يوجد مسرح روماني وميناء قديم وقناة مياه؟|Где есть римский театр, древний порт и акведук?|Where is there a Roman theater, an ancient port and an aqueduct?|caesarea|masada,beit_shean,eilat
Y קיסריה הייתה עיר נמל רומית, ולכן נשארו בה תיאטרון רומי, נמל עתיק ואמת מים.|كانت قيسارية مدينة ميناء رومانية، لذلك بقي فيها مسرح روماني وميناء قديم وقناة مياه.|Кесария была римским портовым городом, поэтому в ней остались римский театр, древний порт и акведук.|Caesarea was a Roman port city, so a Roman theater, an old port and an aqueduct are still there.
Q מה מצא הרועה במערות ליד ים המלח?|ماذا وجد الراعي في الكهوف قرب البحر الميت؟|Что нашёл пастух в пещерах у Мёртвого моря?|What did the shepherd find in the caves near the Dead Sea?|scrolls|gold_coins_b,dinosaur_b,old_car
Y הרועה מצא כדי חרס במערות, ובתוכם היו מגילות עתיקות שנשמרו כ-2000 שנה.|وجد الراعي جرارًا فخّارية في الكهوف، وفي داخلها لفائف قديمة حُفظت نحو 2000 سنة.|Пастух нашёл в пещерах глиняные кувшины, а в них древние свитки, которые сохранились около 2000 лет.|The shepherd found clay jars in the caves, and inside were ancient scrolls kept for about 2000 years.
Q איפה מציגים חלק ממגילות ים המלח?|أين تُعرض بعض مخطوطات البحر الميت؟|Где выставлена часть Кумранских свитков?|Where are some of the Dead Sea Scrolls shown?|shrine|biblelands_m,natlib_m,science_m
Y היכל הספר נבנה במוזיאון ישראל במיוחד כדי להציג את מגילות ים המלח.|بُني هيخال هاسيفر في متحف إسرائيل خصيصًا لعرض مخطوطات البحر الميت.|Храм книги в Музее Израиля построили специально, чтобы показывать Кумранские свитки.|The Shrine of the Book at the Israel Museum was built especially to show the Dead Sea Scrolls.
Q מה עושים כשמבקרים באתר עתיק?|ماذا نفعل عندما نزور موقعًا قديمًا؟|Что делают, когда приходят в древнее место?|What do we do when we visit an ancient site?|careful|climb_walls,take_stones,scribble
Y אתר עתיק נשמר אלפי שנים, ואם כל מבקר ייקח אבן או יטפס, הוא ייהרס.|الموقع الأثري بقي آلاف السنين، وإذا أخذ كل زائر حجرًا أو تسلّق الجدران فسيتهدّم.|Древнее место сохранилось за тысячи лет, но если каждый будет брать камни или лазить, оно разрушится.|An ancient site has lasted thousands of years, but if every visitor takes a stone or climbs, it will be ruined.
E xh_romcity|t|עיר רומית שלמה|مدينة رومانية كاملة|целый римский город|a whole Roman city
E xh_pyramid|t|פירמידה מצרית גדולה|هرم مصري كبير|большую египетскую пирамиду|a big Egyptian pyramid
E xh_jarscr|t|מגילות עתיקות בתוך מערה|مخطوطات قديمة داخل مغارة|древние свитки в пещере|ancient scrolls inside a cave
E xh_viking|t|ספינה של ויקינגים|سفينة للفايكنغ|корабль викингов|a Viking ship
Q מה מצאו בחפירות בבית שאן?|ماذا وجدوا في حفريات بيت شان؟|Что нашли при раскопках в Бейт-Шеане?|What did they find in the digs at Beit She'an?|xh_romcity|xh_pyramid,xh_jarscr,xh_viking
Y בבית שאן חפרו ומצאו רחוב עם עמודים ותיאטרון גדול, כלומר עיר רומית שלמה.|في بيسان حفروا ووجدوا شارعًا بأعمدة ومسرحًا كبيرًا، أي مدينة رومانية كاملة.|В Бейт-Шеане раскопали улицу с колоннами и большой театр, то есть целый римский город.|In Beit She'an diggers found a street of columns and a big theater, a whole Roman city.
Q באיזו שנה נמצאו מגילות ים המלח?|في أيّ سنة وُجدت مخطوطات البحر الميت؟|В каком году нашли свитки Мёртвого моря?|In which year were the Dead Sea Scrolls found?|y1947|y1897,y1968,y1997
Y הרועה מצא את המגילות בשנת 1947, אחרי שהן חיכו במערות כ-2000 שנה.|وجد الراعي المخطوطات سنة 1947، بعد أن بقيت في الكهوف نحو 2000 سنة.|Пастух нашёл свитки в 1947 году, после того как они пролежали в пещерах около 2000 лет.|The shepherd found the scrolls in 1947, after they had lain in the caves for about 2000 years.
E xh_shepherd|p|ילד רועה צאן|ولد راعي غنم|мальчик-пастух|a shepherd boy
E xh_romsold|p|חייל רומי|جندي روماني|римский солдат|a Roman soldier
Q מי מצא את מגילות ים המלח?|من وجد مخطوطات البحر الميت؟|Кто нашёл свитки Мёртвого моря?|Who found the Dead Sea Scrolls?|xh_shepherd|archaeologist,xh_romsold,herod
Y מספרים שילד רועה חיפש עז שהלכה לאיבוד, ונכנס למערה שבה היו המגילות.|يُحكى أن ولدًا راعيًا كان يبحث عن عنزة ضائعة، فدخل الكهف الذي كانت فيه المخطوطات.|Рассказывают, что мальчик-пастух искал потерявшуюся козу и зашёл в пещеру со свитками.|The story goes that a shepherd boy was looking for a lost goat and went into the cave with the scrolls.
E xh_clayjars|t|בכדי חרס|في جرار فخّارية|в глиняных кувшинах|in clay jars
E xh_ironbox|t|בקופסאות ברזל|في صناديق حديد|в железных ящиках|in iron boxes
E xh_plastic|t|בשקיות ניילון|في أكياس نايلون|в полиэтиленовых пакетах|in plastic bags
E xh_woodbox|t|בארגזי עץ חדשים|في صناديق خشب جديدة|в новых деревянных ящиках|in new wooden crates
Q במה היו מגילות ים המלח כשמצאו אותן?|في ماذا كانت مخطوطات البحر الميت عندما وُجدت؟|В чём лежали свитки Мёртвого моря, когда их нашли?|What were the Dead Sea Scrolls kept in when they were found?|xh_clayjars|xh_ironbox,xh_plastic,xh_woodbox
Y המגילות היו בתוך כדי חרס סגורים, וזה שמר עליהן מפני מים ואוויר.|كانت المخطوطات داخل جرار فخّارية مغلقة، وهذا حماها من الماء والهواء.|Свитки лежали в закрытых глиняных кувшинах, и это защитило их от воды и воздуха.|The scrolls were inside closed clay jars, which protected them from water and air.
`;
