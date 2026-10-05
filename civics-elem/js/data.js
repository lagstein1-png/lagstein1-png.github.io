/* Homeland and civics for kids (מולדת ואזרחות לילדים) - content written fresh for bekol, in simple eye-level language.
   Line formats (fields split by |):
   E key|type|he|ar|ru|en        entity (answer / distractor). types: p person/role, b body/institution, s symbol, c colors, l city, g geographic feature, d direction, h day, y year, r right, u duty, k bin, t other
   S id|emoji|color|he|ar|ru|en   topic title
   L he|ar|ru|en                  one lesson sentence of the current topic
   Q he|ar|ru|en|answerKey[|d1,d2,d3]   question; answerKey nNN = a number; optional 3 explicit distractors */
var RAW="";
RAW+=String.raw`
E mayor|p|ראש העיר|رئيس البلدية|мэр города|the mayor
E pm|p|ראש הממשלה|رئيس الحكومة|премьер-министр|the Prime Minister
E president|p|נשיא המדינה|رئيس الدولة|президент государства|the President of the State
E judge|p|השופט|القاضي|судья|the judge
E police|p|שוטר|شرطي|полицейский|a police officer
E fireman|p|כבאי|رجل إطفاء|пожарный|a firefighter
E medic|p|חובש|مسعف|фельдшер|a paramedic
E teacher|p|מורה|معلّم|учитель|a teacher
E soldier|p|חייל|جندي|солдат|a soldier
E bengurion|p|דוד בן־גוריון|دافيد بن غوريون|Давид Бен-Гурион|David Ben-Gurion
E knesset|b|הכנסת|الكنيست|Кнессет|the Knesset
E gov|b|הממשלה|الحكومة|правительство|the government
E court|b|בית המשפט|المحكمة|суд|the court
E city|b|העירייה|البلدية|муниципалитет|the municipality
E policeb|b|המשטרה|الشرطة|полиция|the police
E mda|b|מגן דוד אדום|نجمة داود الحمراء|«Маген Давид Адом»|Magen David Adom
E fireb|b|כבאות והצלה|الإطفاء والإنقاذ|пожарная служба|the fire and rescue service
E supreme|b|בית המשפט העליון|المحكمة العليا|Верховный суд|the Supreme Court
E flag|s|הדגל|العلم|флаг|the flag
E emblem|s|סמל המדינה|شعار الدولة|герб государства|the state emblem
E anthem|s|ההמנון|النشيد الوطني|гимн|the anthem
E hatikva|s|התקווה|هتكفا (الأمل)|«Ха-Тиква»|Hatikvah
E menorah|s|מנורה|شمعدان|менора|a menorah
E star|s|מגן דוד|نجمة داود|звезда Давида|the Star of David
E olive|s|ענפי זית|أغصان الزيتون|оливковые ветви|olive branches
E bw|c|כחול ולבן|أزرق وأبيض|синий и белый|blue and white
E rw|c|אדום ולבן|أحمر وأبيض|красный и белый|red and white
E gw|c|ירוק ולבן|أخضر وأبيض|зелёный и белый|green and white
E by|c|כחול וצהוב|أزرق وأصفر|синий и жёлтый|blue and yellow
E jlm|l|ירושלים|القدس|Иерусалим|Jerusalem
E tlv|l|תל אביב|تل أبيب|Тель-Авив|Tel Aviv
E haifa|l|חיפה|حيفا|Хайфа|Haifa
E eilat|l|אילת|إيلات|Эйлат|Eilat
E bsheva|l|באר שבע|بئر السبع|Беэр-Шева|Beersheba
E tiberias|l|טבריה|طبريا|Тверия|Tiberias
E med|g|הים התיכון|البحر المتوسط|Средиземное море|the Mediterranean Sea
E dead|g|ים המלח|البحر الميت|Мёртвое море|the Dead Sea
E kinneret|g|הכנרת|بحيرة طبريا (الكنيرت)|озеро Кинерет|the Sea of Galilee
E negev|g|הנגב|النقب|Негев|the Negev
E galilee|g|הגליל|الجليل|Галилея|the Galilee
E redsea|g|הים האדום|البحر الأحمر|Красное море|the Red Sea
E west|d|מערב|الغرب|запад|west
E east|d|מזרח|الشرق|восток|east
E north|d|צפון|الشمال|север|north
E south|d|דרום|الجنوب|юг|south
E indep|h|יום העצמאות|يوم الاستقلال|День независимости|Independence Day
E memor|h|יום הזיכרון|يوم الذكرى|День памяти|Memorial Day
E purim|h|פורים|بوريم|Пурим|Purim
E pesach|h|פסח|عيد الفصح|Песах|Passover
E sukkot|h|סוכות|عيد العُرُش|Суккот|Sukkot
E y1948|y|1948|1948|1948|1948
E y1938|y|1938|1938|1938|1938
E y1958|y|1958|1958|1958|1958
E y1968|y|1968|1968|1968|1968
E rlearn|r|ללמוד|أن أتعلّم|учиться|to learn
E rplay|r|לשחק|أن ألعب|играть|to play
E rheal|r|לקבל טיפול רפואי|أن أتلقّى علاجًا طبيًا|получать медицинскую помощь|to get medical care
E rsafe|r|להיות מוגן|أن أكون محميًّا|быть в безопасности|to be protected
E rsay|r|להגיד את דעתי|أن أعبّر عن رأيي|высказывать своё мнение|to say what I think
E urespect|u|לכבד אחרים|أن أحترم الآخرين|уважать других|to respect others
E urules|u|לשמור על החוקים|أن ألتزم بالقوانين|соблюдать законы|to follow the laws
E uclean|u|לשמור על הניקיון|أن أحافظ على النظافة|поддерживать чистоту|to keep things clean
E uhelp|u|לעזור לחבר שצריך עזרה|أن أساعد صديقًا يحتاج إلى مساعدة|помогать другу, которому нужна помощь|to help a friend who needs help
E binO|k|הפח הכתום|الحاوية البرتقالية|оранжевый контейнер|the orange bin
E binB|k|הפח הכחול|الحاوية الزرقاء|синий контейнер|the blue bin
E binG|k|הפח הירוק|الحاوية الخضراء|зелёный контейнер|the green bin
E binK|k|הפח השחור|الحاوية السوداء|чёрный контейнер|the black bin
E vote|t|להצביע|أن يصوّتوا|голосовать|to vote
E laws|t|חוקים|قوانين|законы|laws
E rules|t|כללים|قواعد|правила|rules
E secret|t|בסתר|بسرّية|тайно|in secret
E open|t|בקול רם|بصوت عالٍ|вслух|out loud
E tree|t|לנטוע עצים|أن نزرع أشجارًا|сажать деревья|to plant trees
E water|t|לחסוך במים|أن نوفّر الماء|экономить воду|to save water
E siren|t|עומדים בדממה|نقف بصمت|стоим в тишине|we stand in silence
E run|t|ממשיכים לשחק|نواصل اللعب|продолжаем играть|we keep playing
E hebar|t|עברית וערבית|العبرية والعربية|иврит и арабский|Hebrew and Arabic
E equal|t|לכולם יש אותן זכויות|للجميع الحقوق نفسها|у всех одинаковые права|everyone has the same rights
E green|t|ירוק|أخضر|зелёный|green
E red|t|אדום|أحمر|красный|red
E yellow|t|צהוב|أصفر|жёлтый|yellow
`;
RAW+=String.raw`
E e_fam|t|המשפחה|العائلة|семья|the family
E e_class|t|הכיתה|الصف|класс|the class
E e_nbh|t|השכונה|الحي|район|the neighborhood
E e_town|t|העיר|المدينة|город|the city
E e_country|t|המדינה|الدولة|страна|the country
E e_together|t|ביחד|معًا|вместе|together
E e_alone|t|לבד|وحدنا|в одиночку|alone
E e_help|t|לעזור זה לזה|أن نساعد بعضنا|помогать друг другу|to help each other
E e_ignore|t|לא לשים לב לאחרים|ألا ننتبه للآخرين|не замечать других|not to notice others
E e_quarrel|t|רק לריב|أن نتشاجر فقط|только ссориться|only to quarrel
E e_lead|t|מחליטים יחד|نقرّر معًا|решаем вместе|we decide together
S fam|👨‍👩‍👧|#c64c0a|המשפחה והקהילה שלי|عائلتي ومجتمعي|моя семья и моё сообщество|My Family and My Community
L אני חלק ממשפחה. במשפחה אנשים דואגים זה לזה.|أنا جزء من عائلة. في العائلة يهتم الناس ببعضهم.|Я часть семьи. В семье люди заботятся друг о друге.|I am part of a family. In a family, people take care of each other.
L הכיתה שלי היא קהילה קטנה. הילדים והמורה לומדים יחד.|صفّي مجتمع صغير. الأولاد والمعلّم يتعلّمون معًا.|Мой класс - это маленькое сообщество. Дети и учитель учатся вместе.|My class is a small community. The children and the teacher learn together.
L גם השכונה היא קהילה. השכנים אומרים שלום ועוזרים זה לזה.|والحي أيضًا مجتمع. الجيران يلقون التحية ويساعدون بعضهم.|Район тоже сообщество. Соседи здороваются и помогают друг другу.|The neighborhood is a community too. Neighbors say hello and help each other.
L כמה שכונות יחד הן עיר. כמה ערים ויישובים יחד הם מדינה.|عدة أحياء معًا تكوّن مدينة. وعدة مدن وبلدات معًا تكوّن دولة.|Несколько районов вместе - это город. Несколько городов и посёлков вместе - это страна.|Several neighborhoods together make a city. Several cities and towns together make a country.
L בקהילה טובה כל אחד עוזר, ומחליטים דברים ביחד.|في المجتمع الجيد يساعد كل واحد، ونقرّر الأمور معًا.|В хорошем сообществе каждый помогает, и важные вещи решают вместе.|In a good community everyone helps, and we decide things together.
L כשיש בעיה, לא נשארים לבד. מבקשים עזרה ממבוגר שאפשר לסמוך עליו.|عندما تكون هناك مشكلة، لا نبقى وحدنا. نطلب المساعدة من شخص بالغ نثق به.|Если есть проблема, не остаёмся одни. Просим помощи у взрослого, которому доверяем.|When there is a problem, we are not alone. We ask a grown-up we trust for help.
Q איך קוראים לכיתה או לשכונה, שבהן אנשים עושים דברים יחד ועוזרים זה לזה?|ماذا نسمّي الصفّ أو الحي، حيث يفعل الناس الأشياء معًا ويساعدون بعضهم؟|Как называется класс или район, где люди делают дела вместе и помогают друг другу?|What do we call a class or a neighborhood, where people do things together and help each other?|e_comm|e_fam,e_town,e_country
Q איזה מקום גדול יותר מהעיר?|أي مكان أكبر من المدينة؟|Какое место больше города?|Which place is bigger than a city?|e_country|e_nbh,e_class,e_street
Q כמה שכונות יחד הן...|عدة أحياء معًا هي...|Несколько районов вместе - это...|Several neighborhoods together are...|e_town|e_country,e_street,e_class
Q כמה ערים ויישובים יחד הם...|عدة مدن وبلدات معًا هي...|Несколько городов и посёлков вместе - это...|Several cities and towns together are...|e_country|e_town,e_nbh,e_fam
Q איך עושים בקהילה טובה כל דבר?|كيف نفعل الأشياء في مجتمع جيد؟|Как делают дела в хорошем сообществе?|How do we do things in a good community?|e_together|e_alone,e_byforce,e_byshout
Q מה עושים השכנים הטובים?|ماذا يفعل الجيران الطيبون؟|Что делают хорошие соседи?|What do good neighbors do?|e_help|e_quarrel,e_noisenight,e_nohello
Q מה עושים כשיש בעיה שקשה לפתור לבד?|ماذا نفعل عندما تكون هناك مشكلة يصعب حلّها وحدنا؟|Что делать, если проблему трудно решить одному?|What do we do when a problem is hard to solve alone?|e_askadult|e_tryalone,e_secretprob,e_giveup
E e_comm|t|קהילה|مجتمع|сообщество|a community
E e_askadult|t|מבקשים עזרה ממבוגר מהימן|نطلب المساعدة من شخص بالغ موثوق|просим помощи у надёжного взрослого|we ask a trusted grown-up for help
E e_small|t|קטנה|صغير|маленькое|small
`;
RAW+=String.raw`
E e_safe2|t|כדי שיהיה בטוח והוגן לכולם|لكي يكون الجميع بأمان ومعاملين بعدل|чтобы всем было безопасно и справедливо|so that it is safe and fair for everyone
E e_boring|t|כדי שיהיה משעמם|لكي يكون الأمر مملًا|чтобы было скучно|to make it boring
E e_strong|t|כדי שהחזק ינצח תמיד|لكي يفوز القوي دائمًا|чтобы сильный всегда побеждал|so the strong always win
E e_nobody|t|אין סיבה|لا يوجد سبب|нет причины|there is no reason
E e_tell|t|מספרים למבוגר|نخبر شخصًا بالغًا|рассказываем взрослому|we tell a grown-up
E e_hit|t|מחזירים מכה|نردّ الضربة|бьём в ответ|we hit back
E e_hide|t|מסתירים|نخفي الأمر|скрываем|we hide it
E e_wait|t|מחכים בתור|ننتظر في الدور|ждём своей очереди|we wait in line
E e_push|t|דוחפים|ندفع الآخرين|толкаемся|we push
E e_cut|t|עוקפים את כולם|نتجاوز الجميع|обгоняем всех|we jump ahead of everyone
E e_quarrel2|t|רבים על התור|نتشاجر على الدور|ссоримся из-за очереди|we quarrel over the turn
S rules|📏|#1971c2|כללים וחוקים|القواعد والقوانين|правила и законы|Rules and Laws
L בכל מקום יש כללים: בבית, בכיתה ובמגרש המשחקים.|في كل مكان توجد قواعد: في البيت وفي الصف وفي الملعب.|Везде есть правила: дома, в классе и на площадке.|Every place has rules: at home, in class and on the playground.
L כללים עוזרים לכולם להרגיש בטוחים ולשחק בהוגנות.|القواعد تساعد الجميع على الشعور بالأمان واللعب بعدل.|Правила помогают всем чувствовать себя в безопасности и играть честно.|Rules help everyone feel safe and play fairly.
L לכללים שכל המדינה צריכה לשמור עליהם קוראים חוקים.|القواعد التي يجب على الدولة كلها أن تلتزم بها تسمّى قوانين.|Правила, которые должна соблюдать вся страна, называются законами.|The rules that the whole country must follow are called laws.
L את החוקים כותבת הכנסת. השוטרים עוזרים לשמור עליהם.|القوانين يكتبها الكنيست. والشرطة تساعد على الالتزام بها.|Законы пишет Кнессет. Полицейские помогают их соблюдать.|The Knesset writes the laws. Police officers help to keep them.
L כשמחכים בתור, לא דוחפים. כך כולם מקבלים את הזמן שלהם.|عندما ننتظر في الدور، لا ندفع. هكذا يأخذ الجميع وقتهم.|Когда стоим в очереди, не толкаемся. Так каждый получает своё время.|When we wait in line, we do not push. That way everyone gets a turn.
L כשמישהו מציק או מכה, לא מחזירים מכה. מספרים למבוגר.|عندما يزعجنا أحد أو يضربنا، لا نردّ الضربة. نخبر شخصًا بالغًا.|Когда кто-то обижает или бьёт, мы не бьём в ответ. Мы рассказываем взрослому.|When someone bothers or hits us, we do not hit back. We tell a grown-up.
Q למה יש כללים?|لماذا توجد قواعد؟|Зачем нужны правила?|Why do we have rules?|e_safe2|e_rulesteacher,e_rulesfast,e_strong
Q איך קוראים לכללים שכל המדינה צריכה לשמור עליהם?|ماذا نسمّي القواعد التي يجب على الدولة كلها الالتزام بها؟|Как называются правила, которые должна соблюдать вся страна?|What are the rules that the whole country must follow called?|laws|rules,e_customs,e_advice
Q מי כותב את החוקים?|من يكتب القوانين؟|Кто пишет законы?|Who writes the laws?|knesset|policeb,court,city
Q מי עוזר לשמור על החוקים?|من يساعد في الحفاظ على القوانين؟|Кто помогает соблюдать законы?|Who helps to keep the laws?|police|teacher,fireman,medic
Q מה עושים כשהרבה ילדים רוצים לעלות על המגלשה?|ماذا نفعل عندما يريد أولاد كثيرون الصعود إلى الزحليقة؟|Что мы делаем, когда много детей хотят залезть на горку?|What do we do when many children want to go on the slide?|e_wait|e_push,e_cut,e_quarrel2
Q מה עושים כשמישהו מכה אותנו?|ماذا نفعل عندما يضربنا أحد؟|Что делать, когда кто-то нас бьёт?|What do we do when someone hits us?|e_tell|e_hit,e_keepquiet,e_pushback
S rights|⚖️|#29853c|זכויות וחובות|الحقوق والواجبات|права и обязанности|Rights and Duties
L לכל ילד יש זכויות. זכות היא דבר שמגיע לנו.|لكل طفل حقوق. الحق هو شيء يحق لنا الحصول عليه.|У каждого ребёнка есть права. Право - это то, что нам положено.|Every child has rights. A right is something we are entitled to.
L יש לנו זכות ללמוד, לשחק, לקבל טיפול רפואי ולהיות מוגנים.|لدينا الحق في أن نتعلّم ونلعب ونتلقّى علاجًا طبيًا ونكون محميّين.|У нас есть право учиться, играть, получать медицинскую помощь и быть в безопасности.|We have the right to learn, to play, to get medical care and to be protected.
L יש לנו גם זכות להגיד מה אנחנו חושבים, ולהקשיב לנו.|ولدينا أيضًا الحق في أن نقول ما نفكّر فيه، وأن يُصغى إلينا.|У нас также есть право говорить, что мы думаем, и чтобы нас слушали.|We also have the right to say what we think, and to be listened to.
L לכל אחד יש גם חובות. חובה היא דבר שאנחנו צריכים לעשות.|ولكل واحد أيضًا واجبات. الواجب هو شيء يجب أن نفعله.|У каждого есть и обязанности. Обязанность - это то, что мы должны делать.|Everyone also has duties. A duty is something we have to do.
L חובה שלנו: לכבד אחרים, לשמור על החוקים ולשמור על הניקיון.|من واجباتنا: أن نحترم الآخرين، وأن نلتزم بالقوانين، وأن نحافظ على النظافة.|Наши обязанности: уважать других, соблюдать законы и поддерживать чистоту.|Our duties: to respect others, to follow the laws and to keep things clean.
L הזכויות והחובות שלנו שייכות לכולם, בלי קשר לצבע, לדת או לשפה.|حقوقنا وواجباتنا هي للجميع، بغضّ النظر عن اللون أو الدين أو اللغة.|Наши права и обязанности одинаковы для всех, независимо от цвета кожи, религии или языка.|Our rights and duties belong to everyone, no matter their color, religion or language.
Q איך קוראים לדבר שמגיע לנו, כמו ללמוד ולשחק?|ماذا نسمّي الشيء الذي يحق لنا، مثل التعلّم واللعب؟|Как называется то, что нам положено, например учиться и играть?|What do we call something we are entitled to, like learning and playing?|e_right|e_duty,laws,rules
Q איך קוראים לדבר שאנחנו צריכים לעשות?|ماذا نسمّي الشيء الذي يجب أن نفعله؟|Как называется то, что мы должны делать?|What do we call something we have to do?|e_duty|e_right,laws,rules
Q איזו זכות יש לכל ילד?|أي حق يملكه كل طفل؟|Какое право есть у каждого ребёнка?|Which right does every child have?|rlearn|urespect,urules,uclean
Q איזו מהאפשרויות היא חובה?|أي خيار من هذه واجب؟|Что из этого - обязанность?|Which of these is a duty?|urules|rplay,rheal,rsafe
Q מה נכון לגבי הזכויות והחובות?|ما الصحيح بشأن الحقوق والواجبات؟|Что верно о правах и обязанностях?|What is true about rights and duties?|equal|e_onlyboys,e_onlystrong,e_onlyadults
Q איזו זכות מאפשרת לנו להגיד מה אנחנו חושבים?|أي حق يتيح لنا أن نقول ما نفكّر فيه؟|Какое право позволяет нам говорить, что мы думаем?|Which right lets us say what we think?|rsay|rplay,rheal,rlearn
E e_right|t|זכות|حق|право|a right
E e_duty|t|חובה|واجب|обязанность|a duty
`;

RAW+=String.raw`
E e_onlyboys|t|רק לבנים יש זכויות|الحقوق للأولاد فقط|права есть только у мальчиков|only boys have rights
E e_onlystrong|t|רק לחזקים יש זכויות|الحقوق للأقوياء فقط|права есть только у сильных|only strong people have rights
E e_onlyadults|t|רק למבוגרים יש זכויות|الحقوق للكبار فقط|права есть только у взрослых|only adults have rights
`;
RAW+=String.raw`
S sym|⭐|#1a76c9|סמלי המדינה|رموز الدولة|символы государства|The Symbols of the State
L לכל מדינה יש סמלים. הם מראים לנו שאנחנו שייכים יחד.|لكل دولة رموز. وهي تُظهر لنا أننا ننتمي معًا.|У каждой страны есть символы. Они показывают, что мы принадлежим друг другу.|Every country has symbols. They show that we belong together.
L דגל ישראל כחול ולבן. באמצע הדגל יש מגן דוד כחול.|علم إسرائيل أزرق وأبيض. وفي وسطه نجمة داود زرقاء.|Флаг Израиля сине-белый. В середине флага синяя звезда Давида.|The flag of Israel is blue and white. In the middle of the flag there is a blue Star of David.
L סמל המדינה הוא מנורה, ומשני צדיה ענפי זית. למטה כתוב: ישראל.|شعار الدولة هو شمعدان، وعلى جانبيه أغصان زيتون. وفي الأسفل مكتوب: إسرائيل.|Герб государства - менора, а по бокам оливковые ветви. Внизу написано: Исраэль.|The state emblem is a menorah with olive branches on both sides. Below it is written: Israel.
L ההמנון של ישראל נקרא התקווה. כששרים אותו עומדים.|النشيد الوطني لإسرائيل اسمه هتكفا. وعندما نغنّيه نقف.|Гимн Израиля называется «Ха-Тиква». Когда его поют, стоят.|Israel's anthem is called Hatikvah. When it is sung, we stand.
L בירת ישראל היא ירושלים. שם נמצאים הכנסת והממשלה.|عاصمة إسرائيل هي القدس. وهناك الكنيست والحكومة.|Столица Израиля - Иерусалим. Там находятся Кнессет и правительство.|The capital of Israel is Jerusalem. The Knesset and the government are there.
L ביום העצמאות חוגגים שהמדינה קמה. מניפים דגלים, שרים ושמחים.|في يوم الاستقلال نحتفل بقيام الدولة. نرفع الأعلام ونغنّي ونفرح.|В День независимости мы празднуем создание государства. Поднимаем флаги, поём и радуемся.|On Independence Day we celebrate that the state was founded. We wave flags, sing and have fun.
Q באילו צבעים הדגל של ישראל?|ما ألوان علم إسرائيل؟|Какие цвета у флага Израиля?|What colors is the flag of Israel?|bw|rw,gw,by
Q איזה סמל נמצא באמצע הדגל?|أي رمز يوجد في وسط العلم؟|Какой символ находится в середине флага?|Which symbol is in the middle of the flag?|star|menorah,olive,emblem
Q איזה דבר מצויר בסמל המדינה?|ما الذي يظهر في شعار الدولة؟|Что изображено на гербе государства?|What is drawn in the state emblem?|menorah|star,flag,anthem
Q מה מצויר משני צדי המנורה בסמל?|ما الذي يظهر على جانبي الشمعدان في الشعار؟|Что нарисовано по бокам от меноры на гербе?|What is drawn on both sides of the menorah in the emblem?|olive|star,e_wheat,e_palm
Q איך קוראים להמנון של ישראל?|ما اسم النشيد الوطني لإسرائيل؟|Как называется гимн Израиля?|What is Israel's anthem called?|hatikva|e_jerugold,e_youandi,e_hallel
Q מה עושים כששרים את ההמנון?|ماذا نفعل عندما نغنّي النشيد الوطني؟|Что делают, когда поют гимн?|What do we do when the anthem is sung?|e_stand|e_sitdown,e_run2,e_play
Q מהי בירת ישראל?|ما هي عاصمة إسرائيل؟|Какая столица Израиля?|What is the capital of Israel?|jlm|tlv,haifa,eilat
Q איזה יום חוגגים שהמדינה קמה?|في أي يوم نحتفل بقيام الدولة؟|В какой день мы празднуем создание государства?|On which day do we celebrate the founding of the state?|indep|memor,purim,pesach
E e_stand|t|עומדים|نقف|стоим|we stand
E e_sitdown|t|יושבים ואוכלים|نجلس ونأكل|сидим и едим|we sit and eat
E e_run2|t|רצים|نركض|бежим|we run
E e_play|t|משחקים|نلعب|играем|we play
S indep|🕯️|#c92a2a|יום העצמאות ויום הזיכרון|يوم الاستقلال ويوم الذكرى|День независимости и День памяти|Independence Day and Memorial Day
L בשנת 1948 הוקמה מדינת ישראל.|في عام 1948 قامت دولة إسرائيل.|В 1948 году было создано государство Израиль.|In 1948 the State of Israel was founded.
L דוד בן־גוריון קרא את מגילת העצמאות בתל אביב. הוא היה ראש הממשלה הראשון.|قرأ دافيد بن غوريون وثيقة الاستقلال في تل أبيب. وكان أول رئيس للحكومة.|Давид Бен-Гурион прочитал Декларацию независимости в Тель-Авиве. Он был первым премьер-министром.|David Ben-Gurion read the Declaration of Independence in Tel Aviv. He was the first Prime Minister.
L יום העצמאות הוא יום שמח. עושים מנגל, מניפים דגלים ורואים זיקוקים.|يوم الاستقلال يوم فرح. نشوي اللحم ونرفع الأعلام ونرى الألعاب النارية.|День независимости - радостный день. Жарят мясо, поднимают флаги и смотрят фейерверки.|Independence Day is a happy day. People have barbecues, wave flags and watch fireworks.
L יום אחד לפני יום העצמאות הוא יום הזיכרון. זוכרים בו חיילים ואנשים שנהרגו.|اليوم الذي يسبق يوم الاستقلال هو يوم الذكرى. نتذكّر فيه جنودًا وأشخاصًا قُتلوا.|За день до Дня независимости - День памяти. В этот день вспоминают солдат и людей, которые погибли.|The day before Independence Day is Memorial Day. We remember soldiers and people who were killed.
L ביום הזיכרון נשמעת צפירה. כולם עומדים בדממה ונזכרים.|في يوم الذكرى يُسمع صفّارة الإنذار. يقف الجميع بصمت ويتذكّرون.|В День памяти звучит сирена. Все стоят в тишине и вспоминают.|On Memorial Day a siren sounds. Everyone stands in silence and remembers.
Q באיזו שנה הוקמה מדינת ישראל?|في أي سنة قامت دولة إسرائيل؟|В каком году было создано государство Израиль?|In which year was the State of Israel founded?|y1948|y1938,y1958,y1968
Q מי קרא את מגילת העצמאות?|من قرأ وثيقة الاستقلال؟|Кто прочитал Декларацию независимости?|Who read the Declaration of Independence?|bengurion|soldier,e_herzl,president
Q באיזו עיר קראו את מגילת העצמאות?|في أي مدينة قُرئت وثيقة الاستقلال؟|В каком городе прочитали Декларацию независимости?|In which city was the Declaration of Independence read?|tlv|jlm,haifa,eilat
Q איזה יום הוא היום שמח, עם דגלים וזיקוקים?|أي يوم هو اليوم السعيد، مع الأعلام والألعاب النارية؟|Какой день весёлый, с флагами и фейерверками?|Which day is happy, with flags and fireworks?|indep|memor,purim,sukkot
Q איזה יום זוכרים בו חיילים ואנשים שנהרגו?|في أي يوم نتذكّر الجنود والأشخاص الذين قُتلوا؟|В какой день вспоминают солдат и людей, которые погибли?|On which day do we remember soldiers and people who were killed?|memor|indep,purim,pesach
Q מה עושים כשנשמעת צפירה ביום הזיכרון?|ماذا نفعل عندما تُسمع الصفّارة في يوم الذكرى؟|Что делают, когда в День памяти звучит сирена?|What do we do when the siren sounds on Memorial Day?|siren|run,e_sirentalk,e_sirensit
Q מי היה ראש הממשלה הראשון של ישראל?|من كان أول رئيس حكومة في إسرائيل؟|Кто был первым премьер-министром Израиля?|Who was the first Prime Minister of Israel?|bengurion|mayor,president,e_weizmann
`;
RAW+=String.raw`
S map|🗺️|#0b7285|ישראל על המפה|إسرائيل على الخريطة|Израиль на карте|Israel on the Map
L ישראל היא מדינה קטנה במזרח הים התיכון.|إسرائيل دولة صغيرة في شرق البحر المتوسط.|Израиль - небольшая страна на востоке Средиземного моря.|Israel is a small country in the east of the Mediterranean Sea.
L הים התיכון נמצא במערב ישראל. שם יש חופים יפים.|البحر المتوسط في غرب إسرائيل. وهناك شواطئ جميلة.|Средиземное море находится на западе Израиля. Там красивые пляжи.|The Mediterranean Sea is in the west of Israel. There are beautiful beaches there.
L בצפון יש את הגליל והכנרת. הכנרת היא אגם המים המתוקים הגדול בישראל.|في الشمال الجليل وبحيرة طبريا (الكنيرت). الكنيرت هي أكبر بحيرة مياه عذبة في إسرائيل.|На севере находятся Галилея и Кинерет. Кинерет - самое большое пресноводное озеро в Израиле.|In the north there are the Galilee and the Sea of Galilee. It is the largest freshwater lake in Israel.
L בדרום יש את הנגב. הנגב הוא מדבר גדול, ובקצה שלו העיר אילת.|في الجنوب النقب. النقب صحراء كبيرة، وفي طرفه مدينة إيلات.|На юге находится Негев. Это большая пустыня, а на её краю - город Эйлат.|In the south there is the Negev. It is a big desert, and at its end is the city of Eilat.
L אילת נמצאת על הים האדום. אפשר לשחות שם בין דגים צבעוניים.|إيلات على البحر الأحمر. يمكن السباحة هناك بين أسماك ملوّنة.|Эйлат находится на Красном море. Там можно плавать среди разноцветных рыб.|Eilat is on the Red Sea. You can swim there among colorful fish.
L ים המלח הוא המקום הנמוך ביותר בעולם. אפשר לצוף בו בלי לשחות.|البحر الميت هو أخفض مكان في العالم. يمكن الطفو فيه من دون سباحة.|Мёртвое море - самое низкое место на Земле. В нём можно лежать на воде, не плавая.|The Dead Sea is the lowest place in the world. You can float in it without swimming.
Q איזה ים נמצא במערב ישראל?|أي بحر يقع في غرب إسرائيل؟|Какое море находится на западе Израиля?|Which sea is in the west of Israel?|med|redsea,dead,kinneret
Q איזה אגם מים מתוקים גדול יש בצפון?|أي بحيرة مياه عذبة كبيرة توجد في الشمال؟|Какое большое пресноводное озеро есть на севере?|Which large freshwater lake is in the north?|kinneret|dead,med,redsea
Q איזה מדבר גדול יש בדרום ישראל?|أي صحراء كبيرة توجد في جنوب إسرائيل؟|Какая большая пустыня есть на юге Израиля?|Which big desert is in the south of Israel?|negev|galilee,med,kinneret
Q באיזה אזור בישראל נמצא הגליל?|في أي منطقة من إسرائيل يقع الجليل؟|В какой части Израиля находится Галилея?|In which part of Israel is the Galilee?|north|south,east,west
Q על איזה ים נמצאת העיר אילת?|على أي بحر تقع مدينة إيلات؟|На каком море находится город Эйлат?|On which sea is the city of Eilat?|redsea|med,dead,kinneret
Q מהו המקום הנמוך ביותר בעולם?|ما هو أخفض مكان في العالم؟|Какое место самое низкое в мире?|What is the lowest place in the world?|dead|kinneret,med,negev
Q איפה אפשר לצוף בלי לשחות?|أين يمكن الطفو من دون سباحة؟|Где можно лежать на воде, не плавая?|Where can you float without swimming?|dead|kinneret,med,redsea
Q איפה נמצאת העיר אילת בישראל?|أين تقع مدينة إيلات في إسرائيل؟|Где в Израиле находится город Эйлат?|Where in Israel is the city of Eilat?|south|north,east,west
S town|🏙️|#7048e8|העיר שלי והעירייה|مدينتي والبلدية|мой город и муниципалитет|My City and the Municipality
L כל עיר או יישוב מנוהלים על ידי העירייה או המועצה.|كل مدينة أو بلدة تُدار من قِبل البلدية أو المجلس.|Каждым городом или посёлком управляет муниципалитет или совет.|Every city or town is run by a municipality or a council.
L בראש העירייה עומד ראש העיר. התושבים בוחרים אותו בבחירות.|يرأس البلدية رئيس البلدية. والسكان ينتخبونه في الانتخابات.|Во главе муниципалитета стоит мэр. Жители выбирают его на выборах.|The mayor is the head of the municipality. The residents choose him or her in an election.
L העירייה דואגת לגינות, לרחובות, לאשפה ולבתי הספר.|تهتم البلدية بالحدائق والشوارع والنفايات والمدارس.|Муниципалитет заботится о парках, улицах, мусоре и школах.|The municipality takes care of parks, streets, garbage and schools.
L העירייה גם מדליקה פנסים ברחובות ומנקה אותם.|والبلدية تُضيء الشوارع بالمصابيح وتنظّفها.|Муниципалитет также включает уличные фонари и убирает улицы.|The municipality also lights the street lamps and cleans the streets.
L כדי שהעירייה תעבוד, התושבים משלמים לה מיסים.|لكي تعمل البلدية، يدفع السكان لها الضرائب.|Чтобы муниципалитет работал, жители платят ему налоги.|So that the municipality can work, the residents pay it taxes.
L גם לנו יש תפקיד: לא לזרוק זבל, ולשמור על הגינה והמגרש.|ولنا نحن أيضًا دور: ألا نرمي القمامة، وأن نحافظ على الحديقة والملعب.|У нас тоже есть своя роль: не бросать мусор и беречь парк и площадку.|We also have a role: not to throw trash, and to take care of the park and the playground.
Q מי עומד בראש העירייה?|من يرأس البلدية؟|Кто возглавляет муниципалитет?|Who is the head of the municipality?|mayor|pm,president,judge
Q מי בוחר את ראש העיר?|من ينتخب رئيس البلدية؟|Кто выбирает мэра?|Who chooses the mayor?|e_residents|e_teachers,e_soldiers,e_kids
Q איזה גוף דואג לגינות ולרחובות בעיר?|أي جهة تهتم بالحدائق والشوارع في المدينة؟|Какой орган заботится о парках и улицах города?|Which body takes care of the parks and streets in the city?|city|knesset,court,mda
Q מה עושה העירייה?|ماذا تفعل البلدية؟|Что делает муниципалитет?|What does the municipality do?|e_gardens|e_laws2,e_judge2,e_army
Q כדי שהעירייה תעבוד, מה משלמים התושבים?|لكي تعمل البلدية، ماذا يدفع السكان؟|Чтобы муниципалитет работал, что платят жители?|So that the municipality can work, what do the residents pay?|e_taxes|e_payfines,e_payfree,e_paywater
Q מה עוד אנחנו יכולים לעשות למען העיר?|ماذا يمكننا أن نفعل أيضًا من أجل المدينة؟|Что ещё мы можем сделать для города?|What else can we do for the city?|uclean|e_cityothers,e_cityhome,e_citycomplain
E e_residents|t|התושבים|السكان|жители|the residents
E e_teachers|t|המורים בלבד|المعلّمون فقط|только учителя|only the teachers
E e_soldiers|t|החיילים|الجنود|солдаты|the soldiers
E e_kids|t|הילדים בלבד|الأولاد فقط|только дети|only the children
E e_gardens|t|דואגת לגינות ולרחובות|تهتم بالحدائق والشوارع|заботится о парках и улицах|takes care of parks and streets
E e_laws2|t|כותבת חוקים לכל המדינה|تكتب قوانين للدولة كلها|пишет законы для всей страны|writes laws for the whole country
E e_judge2|t|מחליטה במשפטים|تحكم في المحاكمات|решает в судах|decides in trials
E e_army|t|מגינה על הגבולות|تحمي الحدود|охраняет границы|guards the borders
E e_taxes|t|מיסים, כמו ארנונה|ضرائب، مثل الأرنونا|налоги, например арнону|taxes, such as arnona
E e_games|t|משחקים|ألعابًا|игрушки|toys
E e_flags|t|דגלים|أعلامًا|флажки|flags
E e_candy|t|סוכריות|حلوى|конфеты|candy
E e_trashthrow|t|לזרוק זבל בגינה|أن نرمي القمامة في الحديقة|бросать мусор в парке|to throw trash in the park
E e_breakbench|t|לשבור ספסלים|أن نكسر المقاعد|ломать скамейки|to break benches
E e_hidehere|t|להתעלם מהלכלוך|أن نتجاهل الأوساخ|не замечать грязь|to ignore the mess
`;
RAW+=String.raw`
S democ|🗳️|#d9480f|דמוקרטיה ובחירות|الديمقراطية والانتخابات|демократия и выборы|Democracy and Elections
L ישראל היא מדינה דמוקרטית. דמוקרטיה אומרת שהאנשים מחליטים.|إسرائيل دولة ديمقراطية. الديمقراطية تعني أن الناس هم الذين يقرّرون.|Израиль - демократическая страна. Демократия означает, что решают люди.|Israel is a democratic country. Democracy means that the people decide.
L אי אפשר שכל האזרחים יחליטו על כל דבר. לכן בוחרים אנשים שיחליטו בשבילנו.|لا يمكن أن يقرّر كل المواطنين كل شيء. لذلك ننتخب أشخاصًا يقرّرون من أجلنا.|Все граждане не могут решать каждый вопрос. Поэтому мы выбираем людей, которые решают за нас.|All the citizens cannot decide everything. So we choose people to decide for us.
L הבחירות לכנסת מתקיימות בדרך כלל כל ארבע שנים.|تُجرى انتخابات الكنيست عادةً كل أربع سنوات.|Выборы в Кнессет проходят обычно раз в четыре года.|Elections for the Knesset are usually held every four years.
L מי שגדול מגיל 18 ואזרח ישראלי יכול להצביע. מצביעים בקלפי, בסתר.|كل مواطن إسرائيلي عمره 18 عامًا فما فوق يمكنه التصويت. ونصوّت في صندوق الاقتراع، بسرّية.|Гражданин Израиля старше 18 лет может голосовать. Голосуют на избирательном участке, тайно.|An Israeli citizen aged 18 or over can vote. We vote at a polling station, in secret.
L ההצבעה סודית, כדי שכל אחד יבחר מה שהוא רוצה, בלי פחד.|التصويت سرّي، لكي يختار كل واحد ما يريد، من دون خوف.|Голосование тайное, чтобы каждый выбирал то, что хочет, без страха.|The vote is secret so that everyone can choose what they want, without fear.
L גם בכיתה אפשר לעשות בחירות, למשל כדי לבחור נציג כיתה.|وفي الصف أيضًا يمكن إجراء انتخابات، مثلًا لاختيار ممثّل الصف.|В классе тоже можно проводить выборы, например, чтобы выбрать старосту.|In class we can also hold an election, for example to choose a class representative.
L ברוב הקולות מחליטים, אבל מכבדים גם את מי שחשב אחרת.|نقرّر بحسب أغلبية الأصوات، لكننا نحترم أيضًا من فكّر بشكل مختلف.|Решение принимается большинством голосов, но мы уважаем и тех, кто думал иначе.|We decide by the most votes, but we also respect people who thought differently.
Q מה המשמעות של דמוקרטיה?|ما معنى الديمقراطية؟|Что означает демократия?|What does democracy mean?|e_peopledecide|e_onedecides,e_nolaws2,e_nochange
Q מה עושים בבחירות?|ماذا يفعل الناس في الانتخابات؟|Что делают на выборах?|What do people do in an election?|vote|e_elecwatch,e_elecwait,e_elecdecide
Q כל כמה שנים בדרך כלל יש בחירות לכנסת?|كل كم سنة تُجرى عادةً انتخابات الكنيست؟|Через сколько лет обычно проходят выборы в Кнессет?|How often are Knesset elections usually held (in years)?|n4|n1,n10,n40
Q מגיל כמה מצביעים לכנסת?|من أي عمر يصوّت المواطن للكنيست؟|С какого возраста голосуют в Кнессет?|From what age can a citizen vote for the Knesset?|n18|n10,n12,n8
Q איך מצביעים בבחירות לכנסת?|كيف نصوّت في انتخابات الكنيست؟|Как голосуют на выборах в Кнессет?|How do we vote in the Knesset elections?|secret|open,e_alone2,e_byphone
Q למה ההצבעה סודית?|لماذا التصويت سرّي؟|Почему голосование тайное?|Why is the vote secret?|e_nofear|e_secretfast,e_secretsame,e_secretshow
Q איך מחליטים כשיש בחירות בכיתה?|كيف نقرّر عندما تكون هناك انتخابات في الصف؟|Как принимают решение на выборах в классе?|How do we decide in a class election?|e_majority|e_teacherwins,e_loudest,e_oldest
E e_democracy|t|דמוקרטיה|ديمقراطية|демократия|a democracy
E e_monarchy|t|מדינה שבה אדם אחד מחליט על הכול|دولة يقرّر فيها شخص واحد كل شيء|страна, где всё решает один человек|a country where one person decides everything
E e_nolaws|t|מדינה בלי חוקים|دولة بلا قوانين|страна без законов|a country with no laws
E e_island|t|אי קטן|جزيرة صغيرة|маленький остров|a small island
E e_alone2|t|כולם רואים מה בחרת|يرى الجميع ما اخترته|все видят, что ты выбрал|everyone sees what you chose
E e_byphone|t|בטלפון מהבית|بالهاتف من البيت|по телефону из дома|by phone from home
E e_nofear|t|כדי שאפשר לבחור בלי פחד|لكي نختار من دون خوف|чтобы можно было выбирать без страха|so we can choose without fear
E e_majority|t|ברוב הקולות|بحسب أغلبية الأصوات|большинством голосов|by the most votes
E e_teacherwins|t|המורה מחליט לבד|المعلّم يقرّر وحده|учитель решает один|the teacher decides alone
E e_loudest|t|מי שצועק הכי חזק|من يصرخ أعلى|тот, кто кричит громче всех|whoever shouts the loudest
E e_oldest|t|הילד הכי גדול|الولد الأكبر|самый старший ребёнок|the oldest child
S gov|🏛️|#5f3dc4|רשויות המדינה|سلطات الدولة|органы государства|The Branches of the State
L במדינה יש שלושה חלקים חשובים, ולכל אחד תפקיד אחר.|في الدولة ثلاثة أجزاء مهمة، ولكل واحد منها دور مختلف.|В государстве три важные части, и у каждой своя задача.|The state has three important parts, and each has a different job.
L הכנסת כותבת חוקים. בכנסת יושבים 120 חברי כנסת שהעם בחר.|الكنيست يكتب القوانين. في الكنيست 120 عضوًا انتخبهم الشعب.|Кнессет пишет законы. В Кнессете 120 депутатов, которых выбрал народ.|The Knesset writes laws. In the Knesset there are 120 members that the people chose.
L הממשלה דואגת שהחוקים יתקיימו ושהמדינה תתנהל. בראשה עומד ראש הממשלה.|الحكومة تهتم بتنفيذ القوانين وبإدارة الدولة. ويرأسها رئيس الحكومة.|Правительство следит за выполнением законов и управляет страной. Его возглавляет премьер-министр.|The government makes sure the laws are carried out and the country is run. The Prime Minister is its head.
L בתי המשפט שופטים. השופטים בודקים מה קרה ומחליטים מה הוגן לפי החוק.|المحاكم تحكم. القضاة يفحصون ما حدث ويقرّرون ما هو عادل بحسب القانون.|Суды судят. Судьи выясняют, что произошло, и решают, что справедливо по закону.|The courts judge. Judges check what happened and decide what is fair by law.
L בית המשפט העליון נמצא בירושלים. הוא מקום המשפט הגבוה ביותר.|المحكمة العليا في القدس. وهي أعلى جهة قضائية.|Верховный суд находится в Иерусалиме. Это самый высокий суд.|The Supreme Court is in Jerusalem. It is the highest court.
L נשיא המדינה הוא לא ראש הממשלה. הוא מייצג את כל אזרחי המדינה.|رئيس الدولة ليس رئيس الحكومة. وهو يمثّل جميع مواطني الدولة.|Президент государства - не премьер-министр. Он представляет всех граждан страны.|The President of the State is not the Prime Minister. He or she represents all the citizens.
Q מי מחליט אילו חוקים יהיו במדינה?|من يقرّر ما هي قوانين الدولة؟|Кто решает, какие законы будут в стране?|Who decides what the laws of the country will be?|knesset|gov,court,city
Q כמה חברי כנסת יש בכנסת?|كم عضوًا في الكنيست؟|Сколько депутатов в Кнессете?|How many members are there in the Knesset?|n120|n100,n110,n130
Q מי עומד בראש הממשלה?|من يرأس الحكومة؟|Кто возглавляет правительство?|Who is the head of the government?|pm|president,mayor,judge
Q מי דואג שהחוקים יתקיימו ושהמדינה תתנהל?|من يهتم بتنفيذ القوانين وبإدارة الدولة؟|Кто следит за выполнением законов и управляет страной?|Who makes sure the laws are carried out and the country is run?|gov|knesset,court,city
Q איזה גוף שופט ומחליט מה הוגן לפי החוק?|أي جهة تحكم وتقرّر ما هو عادل بحسب القانون؟|Какой орган судит и решает, что справедливо по закону?|Which body judges and decides what is fair by law?|court|knesset,gov,city
Q איפה נמצא בית המשפט העליון?|أين تقع المحكمة العليا؟|Где находится Верховный суд?|Where is the Supreme Court?|jlm|tlv,bsheva,tiberias
Q מי מייצג את כל אזרחי המדינה?|من يمثّل جميع مواطني الدولة؟|Кто представляет всех граждан страны?|Who represents all the citizens of the country?|president|pm,mayor,judge
`;
RAW+=String.raw`
E e_respect|t|מכבדים ולומדים זה מזה|نحترم ونتعلّم من بعضنا|уважаем и учимся друг у друга|we respect and learn from each other
E e_laugh|t|צוחקים על מי ששונה|نسخر ممّن هو مختلف|смеёмся над тем, кто другой|we laugh at someone who is different
E e_avoid|t|מתרחקים ממי שמדבר אחרת|نبتعد عمّن يتكلّم بشكل مختلف|избегаем тех, кто говорит иначе|we stay away from people who speak differently
E e_eid|t|עיד אל־פיטר|عيد الفطر|Ид аль-Фитр|Eid al-Fitr
E e_xmas|t|חג המולד|عيد الميلاد|Рождество|Christmas
E e_rosh|t|ראש השנה|رأس السنة العبرية|Рош а-Шана|Rosh Hashanah
E e_pizza|t|יום פיצה|يوم البيتزا|день пиццы|Pizza Day
E e_langs|t|הרבה שפות|لغات كثيرة|много языков|many languages
E e_one|t|שפה אחת בלבד|لغة واحدة فقط|только один язык|only one language
E e_none|t|אף שפה|ولا لغة|никаких языков|no languages at all
S people|🤝|#ca4071|אנשים שונים, מדינה אחת|أناس مختلفون، دولة واحدة|разные люди, одна страна|Different People, One Country
L בישראל גרים אנשים רבים ושונים: יהודים, ערבים, דרוזים, בדואים, צ׳רקסים ועוד.|في إسرائيل يعيش أناس كثيرون ومختلفون: يهود وعرب ودروز وبدو وشركس وغيرهم.|В Израиле живут разные люди: евреи, арабы, друзы, бедуины, черкесы и другие.|Many different people live in Israel: Jews, Arabs, Druze, Bedouin, Circassians and more.
L חלקם נולדו כאן, וחלקם הגיעו ממדינות רבות, כמו אתיופיה, רוסיה ומרוקו.|بعضهم وُلد هنا، وبعضهم جاء من دول كثيرة، مثل إثيوبيا وروسيا والمغرب.|Одни родились здесь, а другие приехали из многих стран, например из Эфиопии, России и Марокко.|Some were born here, and some came from many countries, like Ethiopia, Russia and Morocco.
L בישראל מדברים הרבה שפות: עברית, ערבית, רוסית, אמהרית, אנגלית ועוד.|في إسرائيل يتحدّثون لغات كثيرة: العبرية والعربية والروسية والأمهرية والإنجليزية وغيرها.|В Израиле говорят на многих языках: иврит, арабский, русский, амхарский, английский и другие.|In Israel people speak many languages: Hebrew, Arabic, Russian, Amharic, English and more.
L לכל קהילה יש חגים ומנהגים משלה. למשל ראש השנה, עיד אל־פיטר וחג המולד.|لكل مجتمع أعياده وعاداته. مثلًا رأس السنة العبرية وعيد الفطر وعيد الميلاد.|У каждой общины свои праздники и обычаи. Например, Рош а-Шана, Ид аль-Фитр и Рождество.|Each community has its own holidays and customs. For example Rosh Hashanah, Eid al-Fitr and Christmas.
L כשאנחנו שונים זה מזה, אפשר ללמוד דברים חדשים וטעימים.|عندما نكون مختلفين عن بعضنا، يمكننا أن نتعلّم أشياء جديدة وطيّبة.|Когда мы разные, можно узнать много нового и вкусного.|When we are different from each other, we can learn new and tasty things.
L לא צוחקים על מי שמדבר אחרת או שונה מאיתנו. מכבדים כל אדם.|لا نسخر ممّن يتكلّم بشكل مختلف أو يختلف عنّا. نحترم كل إنسان.|Мы не смеёмся над теми, кто говорит иначе или отличается от нас. Мы уважаем каждого человека.|We do not laugh at someone who speaks differently or is different from us. We respect every person.
Q באילו שפות מדברים בישראל?|بأي لغات يتحدّث الناس في إسرائيل؟|На каких языках говорят в Израиле?|What languages do people speak in Israel?|e_langs|e_one,e_none,e_two
Q איך מתייחסים לאדם שמדבר אחרת מאיתנו?|كيف نتعامل مع شخص يتحدّث بشكل مختلف عنّا؟|Как относиться к человеку, который говорит иначе, чем мы?|How do we treat a person who speaks differently from us?|e_respect|e_laugh,e_avoid,e_hit
Q איזה חג חוגגים בדרך כלל בקהילה המוסלמית?|أي عيد يحتفل به المسلمون عادةً؟|Какой праздник обычно отмечает мусульманская община?|Which holiday does the Muslim community usually celebrate?|e_eid|e_hanu,purim,e_xmas
Q איזה חג חוגגים בדרך כלל בקהילה הנוצרית?|أي عيد يحتفل به المسيحيون عادةً؟|Какой праздник обычно отмечает христианская община?|Which holiday does the Christian community usually celebrate?|e_xmas|e_eid,purim,e_hanu
Q איזה חג חוגגים בדרך כלל בקהילה היהודית?|أي عيد يحتفل به اليهود عادةً؟|Какой праздник обычно отмечает еврейская община?|Which holiday does the Jewish community usually celebrate?|e_rosh|e_eid,e_xmas,e_easter
Q מה אפשר ללמוד כשאנחנו שונים זה מזה?|ماذا يمكننا أن نتعلّم عندما نكون مختلفين؟|Чему мы можем научиться, когда мы разные?|What can we learn when we are different from each other?|e_newthings|e_nothing2,e_samefood,e_samehol
E e_newthings|t|דברים חדשים, כמו אוכל, חגים ושפות|أشياء جديدة، مثل الطعام والأعياد واللغات|новому: еде, праздникам и языкам|new things, like food, holidays and languages
E e_nothing2|t|שום דבר, כי כולנו יודעים את אותם דברים|لا شيء، لأنّنا جميعًا نعرف الأشياء نفسها|ничему, ведь мы все знаем одно и то же|nothing at all, because we all know the same things
E e_hate|t|לריב יותר|أن نتشاجر أكثر|ссориться больше|to quarrel more
E e_mean|t|להציק|أن نزعج الآخرين|обижать|to bother others
S env|🌳|#278539|שומרים על הסביבה|نحافظ على البيئة|бережём окружающую среду|Taking Care of Nature
L הארץ שלנו יפה, ואנחנו צריכים לשמור עליה: על הים, על הגינות ועל היערות.|بلدنا جميل، وعلينا أن نحافظ عليه: على البحر والحدائق والغابات.|Наша страна красива, и мы должны её беречь: море, парки и леса.|Our country is beautiful, and we need to take care of it: the sea, the parks and the forests.
L לא זורקים זבל על הרצפה, בחוף או בטבע. זורקים לפח.|لا نرمي القمامة على الأرض أو على الشاطئ أو في الطبيعة. نرميها في الحاوية.|Мы не бросаем мусор на землю, на пляже или в природе. Мы бросаем его в контейнер.|We do not throw trash on the ground, on the beach or in nature. We put it in a bin.
L מיחזור: בקבוקי פלסטיק ואריזות זורקים לפח הכתום. נייר וקרטון זורקים לפח הכחול.|إعادة التدوير: نرمي زجاجات البلاستيك والعبوات في الحاوية البرتقالية. والورق والكرتون في الحاوية الزرقاء.|Переработка: пластиковые бутылки и упаковки бросаем в оранжевый контейнер. Бумагу и картон - в синий.|Recycling: plastic bottles and packaging go in the orange bin. Paper and cardboard go in the blue bin.
L מים הם דבר יקר, במיוחד בארץ שלנו. סוגרים את הברז כשלא צריך.|الماء ثمين، خصوصًا في بلدنا. نغلق الصنبور عندما لا نحتاجه.|Вода очень ценна, особенно в нашей стране. Закрываем кран, когда вода не нужна.|Water is precious, especially in our country. We close the tap when we do not need it.
L בט״ו בשבט, ראש השנה לאילנות, נוטעים עצים. עצים נותנים צל ואוויר נקי.|في عيد الأشجار نزرع الأشجار. الأشجار تعطي الظلّ وهواءً نظيفًا.|В Ту би-Шват, Новый год деревьев, сажают деревья. Деревья дают тень и чистый воздух.|On Tu BiShvat, the New Year of the Trees, we plant trees. Trees give shade and clean air.
L אפשר לשמור על הסביבה גם בבית: לכבות אור, לא לבזבז אוכל ולהשתמש שוב בדברים.|يمكننا الحفاظ على البيئة في البيت أيضًا: نطفئ الضوء، ولا نهدر الطعام، ونعيد استخدام الأشياء.|Беречь природу можно и дома: выключать свет, не выбрасывать еду и использовать вещи повторно.|We can take care of nature at home too: turn off lights, not waste food and reuse things.
Q לאיזה פח זורקים בקבוק פלסטיק?|في أي حاوية نرمي زجاجة البلاستيك؟|В какой контейнер бросают пластиковую бутылку?|Which bin do we put a plastic bottle in?|binO|binB,binG,binK
Q לאיזה פח זורקים נייר וקרטון?|في أي حاوية نرمي الورق والكرتون؟|В какой контейнер бросают бумагу и картон?|Which bin do we put paper and cardboard in?|binB|binO,binG,binK
Q מה עושים כשלא צריך מים?|ماذا نفعل عندما لا نحتاج الماء؟|Что делают, когда вода не нужна?|What do we do when we do not need water?|e_closetap|e_leavetap,e_wasteall,e_hidew
Q מה עושים בט״ו בשבט?|ماذا نفعل في عيد الأشجار؟|Что делают в Ту би-Шват?|What do we do on Tu BiShvat?|tree|water,e_tubicut,e_tubipick
Q איפה זורקים זבל?|أين نرمي القمامة؟|Куда бросают мусор?|Where do we throw trash?|e_inbin|e_ongr,e_inbeach,e_innature
Q למה חשוב לחסוך במים?|لماذا من المهم توفير الماء؟|Почему важно экономить воду?|Why is it important to save water?|e_precious|e_waterrain,e_watersalt,e_waterpool
E e_closetap|t|סוגרים את הברז|نغلق الصنبور|закрываем кран|we close the tap
E e_leavetap|t|משאירים את הברז פתוח|نترك الصنبور مفتوحًا|оставляем кран открытым|we leave the tap open
E e_wasteall|t|שופכים מים על הרצפה|نسكب الماء على الأرض|выливаем воду на пол|we pour water on the floor
E e_hidew|t|מסתירים את המים|نخفي الماء|прячем воду|we hide the water
E e_inbin|t|בפח, גם אם צריך ללכת קצת עד אליו|في الحاوية، حتى لو كان علينا أن نمشي قليلًا إليها|в контейнер, даже если до него надо пройти|in a bin, even if we have to walk a bit to reach it
E e_ongr|t|על הרצפה, כי מישהו ינקה את זה אחר כך|على الأرض، لأنّ أحدًا سينظّفها لاحقًا|на землю, ведь кто-нибудь потом уберёт|on the ground, because someone will clean it up later
E e_inbeach|t|בחול בחוף, כי הגלים ייקחו את זה לים|في رمل الشاطئ، لأنّ الأمواج ستأخذها إلى البحر|в песок на пляже, ведь волны унесут его в море|in the sand at the beach, because the waves will take it to the sea
E e_innature|t|בטבע, ביער, כי שם זה לא מפריע לאף אחד|في الطبيعة، في الغابة، لأنّها هناك لا تزعج أحدًا|в природу, в лес, ведь там он никому не мешает|in nature, in the forest, because it bothers nobody there
E e_precious|t|כי מים הם דבר יקר|لأن الماء ثمين|потому что вода очень ценна|because water is precious
`;

RAW+=String.raw`
E e_two|t|שתי שפות בלבד|لغتان فقط|только два языка|only two languages
E e_show|t|מראים לכולם מה בחרנו|نُري الجميع ما اخترناه|показываем всем, что выбрали|we show everyone what we chose
`;
RAW+=String.raw`
E e_cross|t|ממתינים לאור ירוק ובודקים לשני הצדדים|ننتظر الضوء الأخضر وننظر إلى الجهتين|ждём зелёный свет и смотрим в обе стороны|we wait for the green light and look both ways
E e_crossred|t|רצים כשהאור אדום|نركض عندما يكون الضوء أحمر|бежим на красный свет|we run when the light is red
E e_phone|t|מסתכלים בטלפון ועוברים|ننظر إلى الهاتف ونعبر|смотрим в телефон и переходим|we look at the phone and cross
E e_close|t|עוצמים עיניים ועוברים|نغمض أعيننا ونعبر|закрываем глаза и переходим|we close our eyes and cross
E e_belt|t|חוגרים חגורת בטיחות|نربط حزام الأمان|пристёгиваем ремень безопасности|we fasten the seat belt
E e_shelter|t|נכנסים למקום מוגן|ندخل إلى مكان محمي|идём в защищённое место|we go to a protected room
E e_window|t|עומדים ליד החלון|نقف بجانب النافذة|стоим у окна|we stand by the window
E e_ignoreSiren|t|ממשיכים לשחק בחוץ|نواصل اللعب في الخارج|продолжаем играть на улице|we keep playing outside
S safe|🚦|#aa6300|בטיחות ועזרה בחירום|السلامة والمساعدة في الطوارئ|безопасность и помощь в экстренной ситуации|Safety and Help in an Emergency
L כשחוצים כביש, מחכים לאור ירוק ומסתכלים לימין ולשמאל.|عندما نعبر الشارع، ننتظر الضوء الأخضر وننظر يمينًا ويسارًا.|Когда переходим дорогу, ждём зелёный свет и смотрим направо и налево.|When we cross the road, we wait for a green light and look right and left.
L ברכב תמיד חוגרים חגורה, גם בנסיעה קצרה.|في السيارة نربط الحزام دائمًا، حتى في رحلة قصيرة.|В машине всегда пристёгиваем ремень, даже в короткой поездке.|In a car we always wear a seat belt, even on a short ride.
L כשצריך עזרה דחופה מתקשרים למספרי חירום. מספרי החירום בחינם.|عندما نحتاج إلى مساعدة عاجلة نتّصل بأرقام الطوارئ. وأرقام الطوارئ مجانية.|Когда нужна срочная помощь, звоним по номерам экстренных служб. Звонок бесплатный.|When we need urgent help we call the emergency numbers. The calls are free.
L משטרה: 100. מגן דוד אדום: 101. כבאות והצלה: 102.|الشرطة: 100. نجمة داود الحمراء: 101. الإطفاء والإنقاذ: 102.|Полиция: 100. «Маген Давид Адом»: 101. Пожарная служба: 102.|Police: 100. Magen David Adom: 101. Fire and rescue: 102.
L חובש עוזר כשמישהו חולה או נפצע. כבאי מכבה אש. שוטר שומר עלינו.|يساعد المسعف عندما يمرض أحد أو يُصاب. ورجل الإطفاء يطفئ النار. والشرطي يحمينا.|Фельдшер помогает, когда кто-то заболел или ранен. Пожарный тушит огонь. Полицейский охраняет нас.|A paramedic helps when someone is sick or hurt. A firefighter puts out fires. A police officer protects us.
L כשנשמעת אזעקה, נכנסים למקום מוגן ושומעים הוראות מהמבוגרים.|عندما تُسمع صفّارة الإنذار، ندخل إلى مكان محمي ونصغي لتعليمات الكبار.|Когда звучит сирена, мы идём в защищённое место и слушаем указания взрослых.|When an alarm sounds, we go to a protected room and listen to the grown-ups' instructions.
Q מה עושים לפני שחוצים כביש?|ماذا نفعل قبل أن نعبر الشارع؟|Что делают перед тем, как переходить дорогу?|What do we do before we cross the road?|e_cross|e_crossrun,e_crossone,e_crossfollow
Q מה עושים בכל נסיעה ברכב?|ماذا نفعل في كل رحلة بالسيارة؟|Что делают в каждой поездке на машине?|What do we do in every car ride?|e_belt|e_carstand,e_carhead,e_carnoseat
Q לאיזה מספר מתקשרים כדי להזעיק משטרה?|بأي رقم نتّصل لاستدعاء الشرطة؟|По какому номеру звонят, чтобы вызвать полицию?|Which number do we call for the police?|n100|n101,n102,n104
Q לאיזה מספר מתקשרים כדי להזעיק מגן דוד אדום?|بأي رقم نتّصل لاستدعاء نجمة داود الحمراء؟|По какому номеру звонят, чтобы вызвать «Маген Давид Адом»?|Which number do we call for Magen David Adom?|n101|n100,n102,n104
Q לאיזה מספר מתקשרים כדי להזעיק כבאות והצלה?|بأي رقم نتّصل لاستدعاء الإطفاء والإنقاذ؟|По какому номеру звонят, чтобы вызвать пожарную службу?|Which number do we call for fire and rescue?|n102|n100,n101,n104
Q מי מכבה אש?|من يطفئ النار؟|Кто тушит огонь?|Who puts out fires?|fireman|medic,police,teacher
Q מי עוזר כשמישהו חולה או נפצע?|من يساعد عندما يمرض أحد أو يُصاب؟|Кто помогает, когда кто-то заболел или ранен?|Who helps when someone is sick or hurt?|medic|fireman,police,teacher
Q מה עושים כשנשמעת אזעקה?|ماذا نفعل عندما تُسمع صفّارة الإنذار؟|Что делают, когда звучит сигнал тревоги?|What do we do when an alarm sounds?|e_shelter|e_window,e_ignoreSiren,e_alarmcall
`;

RAW+=String.raw`
/* מסיחים שנכתבו בסבב התוכן: כל אחד טענה שלמה שילד יכול להאמין בה.
   מה שהוחלף נשאר למעלה בקובץ, כפי שהוא. */
E e_street|t|הרחוב|الشارع|улица|the street
E e_byforce|t|בכוח|بالقوّة|силой|by force
E e_byshout|t|בצעקות|بالصراخ|криком|by shouting
E e_noisenight|t|להרעיש בלילה|أن نزعج الجيران في الليل|шуметь по ночам|to make noise at night
E e_nohello|t|לא להגיד שלום|ألّا نُلقي التحية|не здороваться|not to say hello
E e_tryalone|t|ממשיכים לנסות לבד בלי לספר לאף אחד|نواصل المحاولة وحدنا دون أن نخبر أحدًا|продолжаем пробовать сами и никому не говорим|we keep trying alone and tell nobody
E e_secretprob|t|שומרים את הבעיה בסוד|نُبقي المشكلة سرًّا|держим проблему в секрете|we keep the problem a secret
E e_giveup|t|מוותרים ולא מנסים יותר|نستسلم ولا نحاول مرة أخرى|сдаёмся и больше не пытаемся|we give up and stop trying
E e_rulesteacher|t|כדי שרק המורה יחליט מה מותר ומה אסור|لكي يقرّر المعلّم وحده ما هو مسموح وما هو ممنوع|чтобы только учитель решал, что можно и что нельзя|so that only the teacher decides what is allowed and what is not
E e_rulesfast|t|כדי שהמשחק ייגמר מהר יותר|لكي تنتهي اللعبة أسرع|чтобы игра заканчивалась быстрее|so that the game ends faster
E e_customs|t|מנהגים|عادات|обычаи|customs
E e_advice|t|עצות|نصائح|советы|advice
E e_keepquiet|t|לא מספרים לאף אחד|لا نخبر أحدًا|никому не рассказываем|we tell nobody
E e_pushback|t|דוחפים חזק בחזרה|ندفع بقوة في المقابل|толкаем сильно в ответ|we push back hard
E e_wheat|t|שיבולים|سنابل قمح|колосья пшеницы|ears of wheat
E e_palm|t|עלי דקל|أوراق نخيل|пальмовые листья|palm leaves
E e_herzl|p|תיאודור הרצל|تيودور هرتسل|Теодор Герцль|Theodor Herzl
E e_weizmann|p|חיים ויצמן|حاييم وايزمان|Хаим Вейцман|Chaim Weizmann
E e_sirentalk|t|ממשיכים לדבר עם חברים|نواصل الحديث مع الأصدقاء|продолжаем разговаривать с друзьями|we keep talking with friends
E e_sirensit|t|יושבים וממשיכים לאכול|نجلس ونواصل الأكل|садимся и продолжаем есть|we sit and keep eating
E e_payfines|t|רק קנסות על חניה|غرامات وقوف السيارات فقط|только штрафы за парковку|only parking fines
E e_payfree|t|כלום, הכול בחינם|لا شيء، كل شيء مجاني|ничего, всё бесплатно|nothing, everything is free
E e_paywater|t|רק את חשבון המים|فاتورة الماء فقط|только счёт за воду|only the water bill
E e_cityothers|t|לחכות שמישהו אחר ינקה|أن أنتظر شخصًا آخر لينظّف|ждать, пока уберёт кто-то другой|to wait for someone else to clean
E e_cityhome|t|לשמור רק על הבית ולא על הרחוב|أن أحافظ على البيت فقط لا على الشارع|беречь только дом, а не улицу|to look after only the house, not the street
E e_citycomplain|t|רק להתלונן בעירייה|أن أشتكي للبلدية فقط|только жаловаться в муниципалитет|only to complain to the municipality
E e_elecwatch|t|להסתכל בלבד|أن ينظروا فقط|только смотреть|to only watch
E e_elecwait|t|לחכות בבית|أن ينتظروا في البيت|ждать дома|to wait at home
E e_elecdecide|t|להחליט במקום כולם|أن يقرّروا بدل الجميع|решать за всех|to decide for everyone
E e_secretfast|t|כדי שהספירה תיגמר מהר יותר|لكي ينتهي العدّ أسرع|чтобы подсчёт закончился быстрее|so that the counting ends sooner
E e_secretsame|t|כדי שכולם יבחרו אותו דבר|لكي يختار الجميع الشيء نفسه|чтобы все выбрали одно и то же|so that everyone chooses the same thing
E e_secretshow|t|כדי שאפשר יהיה להראות לחברים|لكي نتمكّن من أن نُري الأصدقاء|чтобы можно было показать друзьям|so that we can show it to our friends
E e_hanu|t|חנוכה|حانوكا|Ханука|Hanukkah
E e_easter|t|חג הפסחא הנוצרי|عيد القيامة المسيحي|христианская Пасха|Easter, the Christian holiday
E e_waterrain|t|כי בחורף יורד הרבה גשם|لأن في الشتاء يهطل مطر كثير|потому что зимой идёт много дождя|because a lot of rain falls in winter
E e_watersalt|t|כי המים בים מלוחים|لأن ماء البحر مالح|потому что вода в море солёная|because the water in the sea is salty
E e_waterpool|t|כי בבריכה יש הרבה מים|لأن في المسبح ماء كثيرًا|потому что в бассейне много воды|because there is a lot of water in the pool
E e_tubicut|t|לכרות עצים ביער|أن نقطع أشجارًا في الغابة|рубить деревья в лесу|to cut down trees in the forest
E e_tubipick|t|לקטוף פרחי בר בטבע|أن نقطف أزهارًا برّية في الطبيعة|рвать дикие цветы в природе|to pick wild flowers in nature
E e_crossrun|t|רצים מהר כדי להספיק לפני המכוניות|نركض بسرعة لنسبق السيارات|бежим быстро, чтобы успеть перед машинами|we run fast to get across before the cars
E e_crossone|t|מסתכלים רק לצד אחד ועוברים|ننظر إلى جهة واحدة فقط ونعبر|смотрим только в одну сторону и переходим|we look only one way and cross
E e_crossfollow|t|הולכים אחרי מישהו אחר בלי להסתכל לצדדים|نمشي خلف شخص آخر ونعبر من دون أن ننظر إلى الجهتين|идём за кем-то другим и не смотрим по сторонам|we follow someone else across without looking either way
E e_carstand|t|עומדים בין המושבים|نقف بين المقاعد|стоим между сиденьями|we stand between the seats
E e_carhead|t|מוציאים את הראש מהחלון|نُخرج رؤوسنا من نافذة السيارة|высовываем голову в открытое окно|we put our head out of the window
E e_carnoseat|t|יושבים בלי מושב בטיחות|نجلس من دون مقعد أمان|сидим без детского кресла|we sit without a car seat
E e_alarmcall|t|מתקשרים לחברים לשאול|نتّصل بالأصدقاء لنسأل|звоним друзьям, чтобы спросить|we call friends to ask
E e_samefood|t|שכל המשפחות אוכלות בדיוק אותו אוכל|أنّ كل العائلات تأكل الطعام نفسه تمامًا|тому, что все семьи едят одно и то же|that all families eat exactly the same food
E e_samehol|t|שכל הקהילות חוגגות בדיוק אותם חגים|أنّ كل الطوائف تحتفل بالأعياد نفسها|тому, что все общины празднуют одни и те же праздники|that all communities celebrate the same holidays
E e_peopledecide|t|שהאנשים במדינה מחליטים|أنّ الناس في الدولة هم من يقرّرون|что в стране решают люди|that the people in the country decide
E e_onedecides|t|שאדם אחד מחליט על הכול|أنّ شخصًا واحدًا يقرّر كل شيء|что всё решает один человек|that one person decides everything
E e_nolaws2|t|שאין במדינה חוקים בכלל|أنّه لا توجد في الدولة قوانين أبدًا|что в стране совсем нет законов|that the country has no laws at all
E e_nochange|t|שהחוקים לא משתנים לעולם|أنّ القوانين لا تتغيّر أبدًا|что законы никогда не меняются|that the laws never change
E e_jerugold|t|ירושלים של זהב|القدس الذهبية|«Золотой Иерусалим»|Jerusalem of Gold
E e_youandi|t|אני ואתה|أنا وأنت|«Ты и я»|You and I
E e_hallel|t|הללויה|هللويا|«Аллилуйя»|Hallelujah
`;
