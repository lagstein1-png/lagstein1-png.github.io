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
E jordan|g|נהר הירדן|نهر الأردن (اليردين)|река Иордан|the Jordan River
E west|d|מערב|الغرب|запад|west
E east|d|מזרח|الشرق|восток|east
E north|d|צפון|الشمال|север|north
E south|d|דרום|الجنوب|юг|south
E indep|h|יום העצמאות|يوم الاستقلال|День независимости|Independence Day
E memor|h|יום הזיכרון|يوم الذكرى|День памяти|Memorial Day
E purim|h|פורים|بوريم|Пурим|Purim
E pesach|h|פסח|عيد الفصح|праздник Песах|Passover
E sukkot|h|סוכות|عيد العُرُش|праздник Суккот|Sukkot
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
Q איך קוראים לכיתה או לשכונה, שבהן אנשים עושים דברים יחד ועוזרים זה לזה?|ماذا نسمّي الصفّ أو الحي، حيث يفعل الناس الأشياء معًا ويساعدون بعضهم؟|Как называется класс или район, где люди делают дела вместе и помогают друг другу?|What do we call a class or a neighborhood, where people do things together and help each other?|e_comm|e_fam,gov,e_country
Y קהילה היא קבוצת אנשים שעושים דברים יחד ועוזרים זה לזה, כמו בכיתה ובשכונה.|المجتمع مجموعة أشخاص يفعلون الأشياء معًا ويساعدون بعضهم، مثل الصف والحي.|Сообщество - это люди, которые делают дела вместе и помогают друг другу, как в классе и в районе.|A community is a group of people who do things together and help each other, like a class or a neighborhood.
Q איזה מקום גדול יותר מהעיר?|أي مكان أكبر من المدينة؟|Какое место больше города?|Which place is bigger than a city?|e_country|e_nbh,e_class,e_street
Y מדינה בנויה מהרבה ערים ויישובים, ולכן היא גדולה יותר מעיר אחת.|الدولة تتكوّن من مدن وبلدات كثيرة، لذلك هي أكبر من مدينة واحدة.|Страна состоит из многих городов и посёлков, поэтому она больше одного города.|A country is made of many cities and towns, so it is bigger than one city.
Q כמה שכונות יחד הן...|عدة أحياء معًا هي...|Несколько районов вместе - это...|Several neighborhoods together are...|e_town|e_country,e_street,e_class
Y עיר גדולה יותר משכונה, ובתוכה יש הרבה שכונות יחד.|المدينة أكبر من الحي، وفيها أحياء كثيرة معًا.|Город больше района, и в нём много районов вместе.|A city is bigger than a neighborhood, and it holds many neighborhoods together.
Q כמה ערים ויישובים יחד הם...|عدة مدن وبلدات معًا هي...|Несколько городов и посёлков вместе - это...|Several cities and towns together are...|e_country|e_town,e_nbh,e_fam
Y מדינה היא המקום הגדול שמחבר הרבה ערים ויישובים תחת אותם חוקים.|الدولة هي المكان الكبير الذي يجمع مدنًا وبلدات كثيرة تحت القوانين نفسها.|Страна - это большое место, где много городов и посёлков живут по одним законам.|A country is the big place that joins many cities and towns under the same laws.
Q איך עושים בקהילה טובה כל דבר?|كيف نفعل الأشياء في مجتمع جيد؟|Как делают дела в хорошем сообществе?|How do we do things in a good community?|e_together|e_alone,e_byforce,e_byshout
Y כשעושים ביחד, כל אחד מוסיף משהו, וכולם מרגישים שייכים.|عندما نعمل معًا، يضيف كل واحد شيئًا، ويشعر الجميع أنهم ينتمون.|Когда делаем вместе, каждый что-то добавляет, и все чувствуют себя своими.|When we do things together, everyone adds something and everyone feels they belong.
Q מה עושים השכנים הטובים?|ماذا يفعل الجيران الطيبون؟|Что делают хорошие соседи?|What do good neighbors do?|e_help|e_quarrel,e_noisenight,e_nohello
Y שכנים גרים קרוב, ולכן עזרה קטנה ביניהם עושה את החיים בשכונה נעימים.|الجيران يسكنون قريبًا، لذلك المساعدة الصغيرة بينهم تجعل الحياة في الحي لطيفة.|Соседи живут рядом, поэтому небольшая помощь делает жизнь в районе приятнее.|Neighbors live close by, so a little help between them makes life in the neighborhood nicer.
Q מה עושים כשיש בעיה שקשה לפתור לבד?|ماذا نفعل عندما تكون هناك مشكلة يصعب حلّها وحدنا؟|Что делать, если проблему трудно решить одному?|What do we do when a problem is hard to solve alone?|e_askadult|e_tryalone,e_secretprob,e_giveup
Y מבוגר שסומכים עליו יודע איך לעזור, וכך לא נשארים עם הבעיה לבד.|الشخص البالغ الذي نثق به يعرف كيف يساعد، فلا نبقى وحدنا مع المشكلة.|Взрослый, которому доверяем, знает, как помочь, и мы не остаёмся с проблемой одни.|A grown-up we trust knows how to help, so we are not left alone with the problem.
E e_comm|t|קהילה|مجتمع|сообщество|a community
E e_askadult|t|מבקשים עזרה ממבוגר מהימן|نطلب المساعدة من شخص بالغ موثوق|просим помощи у надёжного взрослого|we ask a trusted grown-up for help
E e_small|t|קטנה|صغير|маленькое|small
E xv_care|t|דואגים זה לזה|يهتمّون ببعضهم|заботятся друг о друге|they take care of each other
E xv_fight|t|רבים כל הזמן|يتشاجرون طوال الوقت|всё время ссорятся|they argue all the time
E xv_silent|t|לא מדברים זה עם זה|لا يتكلّمون مع بعضهم|не разговаривают друг с другом|they do not talk to each other
E xv_selfonly|t|כל אחד דואג רק לעצמו|كل واحد يهتمّ بنفسه فقط|каждый думает только о себе|each one cares only for himself
Q מה עושים אנשים במשפחה?|ماذا يفعل الناس في العائلة؟|Что делают люди в семье?|What do people in a family do?|xv_care|xv_fight,xv_silent,xv_selfonly
Y משפחה היא האנשים הכי קרובים אלינו, ולכן הם שומרים ותומכים זה בזה.|العائلة هم أقرب الناس إلينا، لذلك يحمون ويدعمون بعضهم.|Семья - это самые близкие люди, поэтому они берегут и поддерживают друг друга.|Family are the people closest to us, so they look after and support each other.
E xv_kidsteach|t|הילדים והמורה|الأولاد والمعلّم|дети и учитель|the children and the teacher
E xv_onlyteach|t|רק המורים, בלי ילדים|المعلّمون فقط، بلا أولاد|только учителя, без детей|only the teachers, without children
E xv_onlypar|t|רק ההורים|الأهل فقط|только родители|only the parents
E xv_onlyneigh|t|רק השכנים|الجيران فقط|только соседи|only the neighbors
Q מי לומד יחד בכיתה?|من يتعلّم معًا في الصف؟|Кто учится вместе в классе?|Who learns together in the class?|xv_kidsteach|xv_onlyteach,xv_onlypar,xv_onlyneigh
Y בכיתה המורה מסביר והילדים שואלים, וכך כולם לומדים יחד.|في الصف يشرح المعلّم ويسأل الأولاد، وهكذا يتعلّم الجميع معًا.|В классе учитель объясняет, а дети спрашивают, и так все учатся вместе.|In class the teacher explains and the children ask, so everyone learns together.
E xv_eachhelps|t|כל אחד עוזר, ומחליטים יחד|كل واحد يساعد، ونقرّر معًا|каждый помогает, и решают вместе|everyone helps, and we decide together
E xv_eachwants|t|כל אחד עושה מה שהוא רוצה|كل واحد يفعل ما يريد|каждый делает, что хочет|everyone does whatever they want
E xv_onedec|t|רק אדם אחד מחליט על הכול|شخص واحد فقط يقرّر كل شيء|только один человек решает всё|only one person decides everything
E xv_notalk|t|אף אחד לא מדבר עם אף אחד|لا أحد يتكلّم مع أحد|никто ни с кем не разговаривает|nobody talks to anybody
Q מה קורה בקהילה טובה?|ماذا يحدث في جماعة جيدة؟|Что происходит в хорошей общине?|What happens in a good community?|xv_eachhelps|xv_eachwants,xv_onedec,xv_notalk
Y כשכולם עוזרים ומחליטים יחד, כל אחד מרגיש שגם הדעה שלו חשובה.|عندما يساعد الجميع ويقرّرون معًا، يشعر كل واحد أن رأيه مهم أيضًا.|Когда все помогают и решают вместе, каждый чувствует, что его мнение тоже важно.|When everyone helps and decides together, each person feels their opinion matters too.
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
Y בלי כללים כל אחד עושה מה שבא לו, ומישהו עלול להיפגע.|من دون قواعد يفعل كل واحد ما يريد، وقد يتأذّى أحد.|Без правил каждый делает что хочет, и кто-то может пострадать.|Without rules everyone does what they like, and someone could get hurt.
Q איך קוראים לכללים שכל המדינה צריכה לשמור עליהם?|ماذا نسمّي القواعد التي يجب على الدولة كلها الالتزام بها؟|Как называются правила, которые должна соблюдать вся страна?|What are the rules that the whole country must follow called?|laws|rules,e_customs,e_advice
Y חוק הוא כלל שחל על כל האנשים במדינה, ולא רק בבית או בכיתה.|القانون قاعدة تسري على كل الناس في الدولة، وليس فقط في البيت أو الصف.|Закон - это правило для всех людей в стране, а не только дома или в классе.|A law is a rule for everyone in the country, not just at home or in class.
Q מי כותב את החוקים?|من يكتب القوانين؟|Кто пишет законы?|Who writes the laws?|knesset|policeb,court,city
Y בכנסת יושבים חברי הכנסת שהעם בחר, ותפקידם לכתוב חוקים.|في الكنيست أعضاء انتخبهم الشعب، ودورهم كتابة القوانين.|В Кнессете сидят депутаты, которых выбрал народ, и их задача - писать законы.|The Knesset has members the people chose, and their job is to write laws.
Q מי עוזר לשמור על החוקים?|من يساعد في الحفاظ على القوانين؟|Кто помогает соблюдать законы?|Who helps to keep the laws?|police|teacher,fireman,medic
Y תפקיד השוטר הוא לשמור עלינו ולדאוג שאנשים לא יעברו על החוק.|دور الشرطي أن يحمينا وأن يهتم بألّا يخالف الناس القانون.|Работа полицейского - охранять нас и следить, чтобы люди не нарушали закон.|A police officer's job is to protect us and make sure people do not break the law.
Q מה עושים כשהרבה ילדים רוצים לעלות על המגלשה?|ماذا نفعل عندما يريد أولاد كثيرون الصعود إلى الزحليقة؟|Что мы делаем, когда много детей хотят залезть на горку?|What do we do when many children want to go on the slide?|e_wait|e_push,e_cut,e_quarrel2
Y בתור כל אחד מקבל את הזמן שלו, ואף אחד לא נדחף או נפגע.|في الدور يأخذ كل واحد وقته، ولا أحد يُدفع أو يتأذّى.|В очереди каждый получает своё время, и никого не толкают и не обижают.|In a line everyone gets a turn, and nobody gets pushed or hurt.
Q מה עושים כשמישהו מכה אותנו?|ماذا نفعل عندما يضربنا أحد؟|Что делать, когда кто-то нас бьёт?|What do we do when someone hits us?|e_tell|e_hit,e_keepquiet,e_pushback
Y מכה בחזרה רק מגדילה את הריב, ומבוגר יכול לעצור אותו ולעזור.|الضربة المقابلة تكبّر الشجار، والشخص البالغ يستطيع أن يوقفه ويساعد.|Ответный удар только усиливает ссору, а взрослый может её остановить и помочь.|Hitting back only makes the fight bigger, and a grown-up can stop it and help.
E xv_everywhere|t|בכל מקום: בבית, בכיתה ובמגרש|في كل مكان: في البيت والصف والملعب|везде: дома, в классе и на площадке|everywhere: at home, in class and on the playground
E xv_onlyschool|t|רק בבית הספר, ולא בבית|في المدرسة فقط، وليس في البيت|только в школе, а не дома|only at school, not at home
E xv_onlyroad|t|רק בכביש, ולא בשום מקום אחר|في الشارع فقط، ولا في أي مكان آخر|только на дороге, и больше нигде|only on the road, and in no other place
E xv_onlyarmy|t|רק בצבא, ולא אצל ילדים|في الجيش فقط، وليس عند الأولاد|только в армии, а не у детей|only in the army, not for children
Q איפה יש כללים?|أين توجد قواعد؟|Где есть правила?|Where are there rules?|xv_everywhere|xv_onlyschool,xv_onlyroad,xv_onlyarmy
Y בכל מקום שבו אנשים נמצאים יחד צריך כללים, כדי שיהיה בטוח והוגן.|في كل مكان يجتمع فيه الناس نحتاج إلى قواعد، لكي يكون آمنًا وعادلًا.|Везде, где люди вместе, нужны правила, чтобы было безопасно и честно.|Wherever people are together, rules are needed to keep things safe and fair.
E xv_listen|t|מקשיבים כשמישהו אחר מדבר|نصغي عندما يتكلّم شخص آخر|слушаем, когда говорит другой|we listen when someone else is talking
E xv_shout|t|צועקים כדי שישמעו אותנו|نصرخ لكي يسمعونا|кричим, чтобы нас услышали|we shout so that people hear us
E xv_take|t|לוקחים דברים בלי לשאול|نأخذ أشياء بدون أن نسأل|берём вещи без спроса|we take things without asking
E xv_runclass|t|רצים בין השולחנות|نركض بين الطاولات|бегаем между партами|we run between the desks
Q איזה מהם הוא כלל טוב לכיתה?|أيّ منها قاعدة جيدة للصف؟|Какое из этого — хорошее правило для класса?|Which of these is a good class rule?|xv_listen|xv_shout,xv_take,xv_runclass
Y כשמקשיבים זה לזה, כל אחד יכול לדבר ולהישמע, ולומדים טוב יותר.|عندما نصغي لبعضنا، يستطيع كل واحد أن يتكلّم ويُسمع، ونتعلّم بشكل أفضل.|Когда слушаем друг друга, каждый может говорить и быть услышанным, и учиться легче.|When we listen to each other, everyone can speak and be heard, and we learn better.
E xv_redlight|t|עוצרים כשהרמזור אדום|نتوقّف عندما تكون الإشارة حمراء|останавливаемся на красный свет|we stop at a red light
E xv_breakfast|t|אוכלים ארוחת בוקר בשבע|نتناول الفطور في السابعة|завтракаем в семь часов|we eat breakfast at seven
E xv_bed9|t|הולכים לישון בתשע|ننام في التاسعة|ложимся спать в девять|we go to bed at nine
E xv_football|t|משחקים כדורגל בהפסקה|نلعب كرة القدم في الاستراحة|играем в футбол на перемене|we play football at recess
Q איזה מהם הוא חוק שכל המדינה שומרת עליו?|أيّ منها قانون تلتزم به الدولة كلّها؟|Что из этого — закон, который соблюдает вся страна?|Which of these is a law that the whole country keeps?|xv_redlight|xv_breakfast,xv_bed9,xv_football
Y רמזור אדום הוא חוק לכל המדינה, כי הוא שומר על החיים של כל מי שבכביש.|الإشارة الحمراء قانون للدولة كلها، لأنها تحمي حياة كل من في الشارع.|Красный свет - закон для всей страны, потому что он бережёт жизнь всех на дороге.|Stopping at a red light is a law for the whole country, because it keeps everyone on the road safe.
E xv_everyturn|t|כל אחד מקבל את התור שלו|كل واحد يحصل على دوره|каждый получает свою очередь|everyone gets their turn
E xv_strongfirst|t|החזק ביותר מגיע ראשון|الأقوى يصل أوّلًا|самый сильный приходит первым|the strongest gets there first
E xv_nobodygets|t|אף אחד לא מגיע למגלשה|لا أحد يصل إلى الزحليقة|никто не попадает на горку|nobody gets to the slide
E xv_tallfirst|t|הגבוה ביותר עולה ראשון|الأطول يصعد أوّلًا|самый высокий идёт первым|the tallest goes first
Q מחכים בתור ולא דוחפים. מה קורה?|ننتظر في الدور ولا ندفع. ماذا يحدث؟|Ждём в очереди и не толкаемся. Что происходит?|We wait in line and do not push. What happens?|xv_everyturn|xv_strongfirst,xv_nobodygets,xv_tallfirst
Y כשאף אחד לא דוחף, התור מתקדם לפי הסדר, וכל אחד מגיע בזמן שלו.|عندما لا يدفع أحد، يتقدّم الدور بالترتيب، ويصل كل واحد في وقته.|Когда никто не толкается, очередь идёт по порядку, и каждый дожидается своего времени.|When nobody pushes, the line moves in order, and everyone gets there in their turn.
S rights|⚖️|#29853c|זכויות וחובות|الحقوق والواجبات|права и обязанности|Rights and Duties
L לכל ילד יש זכויות. זכות היא דבר שמגיע לנו.|لكل طفل حقوق. الحق هو شيء يحق لنا الحصول عليه.|У каждого ребёнка есть права. Право - это то, что нам положено.|Every child has rights. A right is something we are entitled to.
L יש לנו זכות ללמוד, לשחק, לקבל טיפול רפואי ולהיות מוגנים.|لدينا الحق في أن نتعلّم ونلعب ونتلقّى علاجًا طبيًا ونكون محميّين.|У нас есть право учиться, играть, получать медицинскую помощь и быть в безопасности.|We have the right to learn, to play, to get medical care and to be protected.
L יש לנו גם זכות להגיד מה אנחנו חושבים, ולהקשיב לנו.|ولدينا أيضًا الحق في أن نقول ما نفكّر فيه، وأن يُصغى إلينا.|У нас также есть право говорить, что мы думаем, и чтобы нас слушали.|We also have the right to say what we think, and to be listened to.
L לכל אחד יש גם חובות. חובה היא דבר שאנחנו צריכים לעשות.|ولكل واحد أيضًا واجبات. الواجب هو شيء يجب أن نفعله.|У каждого есть и обязанности. Обязанность - это то, что мы должны делать.|Everyone also has duties. A duty is something we have to do.
L חובה שלנו: לכבד אחרים, לשמור על החוקים ולשמור על הניקיון.|من واجباتنا: أن نحترم الآخرين، وأن نلتزم بالقوانين، وأن نحافظ على النظافة.|Наши обязанности: уважать других, соблюдать законы и поддерживать чистоту.|Our duties: to respect others, to follow the laws and to keep things clean.
L הזכויות והחובות שלנו שייכות לכולם, בלי קשר לצבע, לדת או לשפה.|حقوقنا وواجباتنا هي للجميع، بغضّ النظر عن اللون أو الدين أو اللغة.|Наши права и обязанности одинаковы для всех, независимо от цвета кожи, религии или языка.|Our rights and duties belong to everyone, no matter their color, religion or language.
Q איך קוראים לדבר שמגיע לנו, כמו ללמוד ולשחק?|ماذا نسمّي الشيء الذي يحق لنا، مثل التعلّم واللعب؟|Как называется то, что нам положено, например учиться и играть?|What do we call something we are entitled to, like learning and playing?|e_right|e_duty,laws,rules
Y זכות היא דבר שמגיע לכל ילד, וללמוד ולשחק הם דברים כאלה.|الحق شيء يحق لكل طفل، والتعلّم واللعب من هذه الأشياء.|Право - это то, что положено каждому ребёнку, а учиться и играть как раз такие вещи.|A right is something every child is entitled to, and learning and playing are such things.
Q איך קוראים לדבר שאנחנו צריכים לעשות?|ماذا نسمّي الشيء الذي يجب أن نفعله؟|Как называется то, что мы должны делать?|What do we call something we have to do?|e_duty|e_right,laws,e_hobby
Y חובה היא דבר שצריך לעשות גם כשלא בא לנו, כמו לכבד אחרים.|الواجب شيء يجب أن نفعله حتى لو لم نرغب، مثل احترام الآخرين.|Обязанность - это то, что надо делать, даже если не хочется, например уважать других.|A duty is something we must do even when we do not feel like it, like respecting others.
Q איזו זכות יש לכל ילד?|أي حق يملكه كل طفل؟|Какое право есть у каждого ребёнка?|Which right does every child have?|rlearn|urespect,urules,uclean
Y ללמוד הוא דבר שמגיע לכל ילד, ושאר האפשרויות הן חובות שלנו.|التعلّم شيء يحق لكل طفل، أمّا باقي الخيارات فهي واجبات علينا.|Учиться положено каждому ребёнку, а остальные варианты - это наши обязанности.|Learning is something every child is entitled to, and the other choices are our duties.
Q איזו מהאפשרויות היא חובה?|أي خيار من هذه واجب؟|Что из этого - обязанность?|Which of these is a duty?|urules|rplay,rheal,rsafe
Y את החוקים צריך לשמור גם כשלא בא לנו, ולכן זו חובה ולא זכות.|علينا أن نلتزم بالقوانين حتى لو لم نرغب، لذلك هذا واجب وليس حقًا.|Законы нужно соблюдать, даже если не хочется, поэтому это обязанность, а не право.|We must follow the laws even when we do not want to, so it is a duty, not a right.
Q מה נכון לגבי הזכויות והחובות?|ما الصحيح بشأن الحقوق والواجبات؟|Что верно о правах и обязанностях?|What is true about rights and duties?|equal|e_onlyboys,e_onlystrong,e_onlyadults
Y זכויות שייכות לכל אדם, בלי קשר לצבע, לדת, לשפה או לגיל.|الحقوق لكل إنسان، بغضّ النظر عن اللون أو الدين أو اللغة أو العمر.|Права есть у каждого человека, независимо от цвета кожи, религии, языка или возраста.|Rights belong to every person, no matter their color, religion, language or age.
Q איזו זכות מאפשרת לנו להגיד מה אנחנו חושבים?|أي حق يتيح لنا أن نقول ما نفكّر فيه؟|Какое право позволяет нам говорить, что мы думаем?|Which right lets us say what we think?|rsay|rplay,rheal,rlearn
Y הזכות הזאת נותנת לכל ילד מקום לדבר, ומבקשת מאחרים להקשיב לו.|هذا الحق يعطي كل طفل مكانًا ليتكلّم، ويطلب من الآخرين أن يصغوا إليه.|Это право даёт каждому ребёнку возможность говорить и просит других его слушать.|This right gives every child room to speak, and asks others to listen.
E e_right|t|זכות|حق|право|a right
E e_duty|t|חובה|واجب|обязанность|a duty
E e_hobby|t|תחביב|هواية|увлечение|a hobby
Q ילד חולה הולך לרופא. איזו זכות יש לו?|ولد مريض يذهب إلى الطبيب. أيّ حقّ له؟|Больной ребёнок идёт к врачу. Какое у него право?|A sick child goes to the doctor. Which right does he have?|rheal|rsay,rplay,urules
Y ילד חולה צריך רופא כדי להבריא, ולכן מגיע לו טיפול רפואי.|الطفل المريض يحتاج إلى طبيب كي يُشفى، لذلك يحق له العلاج الطبي.|Больному ребёнку нужен врач, чтобы выздороветь, поэтому ему положена медицинская помощь.|A sick child needs a doctor to get well, so medical care is their right.
Q שומרים על הניקיון בכיתה. איך קוראים לזה?|نحافظ على النظافة في الصف. ماذا نسمّي ذلك؟|Мы следим за чистотой в классе. Как это называется?|We keep the classroom clean. What is this called?|e_duty|e_right,laws,e_hobby
Y שמירה על הניקיון היא דבר שכולנו צריכים לעשות, ולכן זו חובה.|الحفاظ على النظافة شيء علينا جميعًا أن نفعله، لذلك هو واجب.|Поддерживать чистоту должны все мы, поэтому это обязанность.|Keeping things clean is something we all have to do, so it is a duty.
Q ילדים משחקים בהפסקה. איך קוראים לזה?|الأولاد يلعبون في الاستراحة. ماذا نسمّي ذلك؟|Дети играют на перемене. Как это называется?|Children play at recess. What is this called?|e_right|e_duty,laws,rules
Y משחק הוא דבר שמגיע לכל ילד ועושה לו טוב, ולכן הוא זכות.|اللعب شيء يحق لكل طفل ويفيده، لذلك هو حق.|Игра положена каждому ребёнку и полезна ему, поэтому это право.|Play is something every child is entitled to and is good for them, so it is a right.
E xv_sayhear|t|אפשר להגיד מה אני חושב, ומקשיבים לי|يمكنني أن أقول ما أفكّر فيه، ويصغون إليّ|я могу сказать, что думаю, и меня слушают|I can say what I think, and people listen to me
E xv_shoutall|t|אפשר לצעוק על כולם מתי שאני רוצה|يمكنني أن أصرخ على الجميع متى أردت|я могу кричать на всех, когда хочу|I can shout at everyone whenever I want
E xv_onlyme|t|רק אני מדבר, ואחרים שותקים|أنا فقط أتكلّم، والآخرون يسكتون|говорю только я, а другие молчат|only I talk, and others stay quiet
E xv_nodiff|t|אסור לאחרים לחשוב אחרת ממני|ممنوع على الآخرين أن يفكّروا بشكل مختلف عنّي|другим нельзя думать иначе, чем я|others may not think differently from me
Q יש לי זכות להגיד את דעתי. מה זה אומר?|لي حقّ أن أعبّر عن رأيي. ماذا يعني ذلك؟|У меня есть право высказывать своё мнение. Что это значит?|I have the right to say what I think. What does this mean?|xv_sayhear|xv_shoutall,xv_onlyme,xv_nodiff
Y הזכות שלי היא לדבר ולהישמע, אבל היא לא לוקחת מאחרים את הזכות שלהם.|حقي هو أن أتكلّم وأن يُصغى إليّ، لكنه لا يأخذ من الآخرين حقهم.|Моё право - говорить и быть услышанным, но оно не отнимает права у других.|My right is to speak and be heard, but it does not take away other people's rights.
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
Y הצבעים כחול ולבן נלקחו מהטלית, בגד תפילה יהודי מסורתי.|اللونان الأزرق والأبيض مأخوذان من الطاليت، وهو شال صلاة يهودي تقليدي.|Синий и белый цвета взяты от таллита, традиционного еврейского молитвенного покрывала.|The blue and white colors come from the tallit, a traditional Jewish prayer shawl.
Q איזה סמל נמצא באמצע הדגל?|أي رمز يوجد في وسط العلم؟|Какой символ находится в середине флага?|Which symbol is in the middle of the flag?|star|menorah,olive,emblem
Y מגן דוד הוא סמל יהודי עתיק, ולכן שמו אותו באמצע הדגל.|نجمة داود رمز يهودي قديم، لذلك وضعوها في وسط العلم.|Звезда Давида - древний еврейский символ, поэтому её поместили в середину флага.|The Star of David is an old Jewish symbol, so it was put in the middle of the flag.
Q איזה דבר מצויר בסמל המדינה?|ما الذي يظهر في شعار الدولة؟|Что изображено на гербе государства?|What is drawn in the state emblem?|menorah|star,flag,anthem
Y המנורה עמדה לפני הרבה שנים בבית המקדש בירושלים, ולכן נבחרה לסמל.|الشمعدان كان قبل سنوات كثيرة في الهيكل في القدس، لذلك اختير شعارًا.|Менора много лет назад стояла в Храме в Иерусалиме, поэтому её выбрали для герба.|The menorah stood in the Temple in Jerusalem long ago, so it was chosen for the emblem.
Q מה מצויר משני צדי המנורה בסמל?|ما الذي يظهر على جانبي الشمعدان في الشعار؟|Что нарисовано по бокам от меноры на гербе?|What is drawn on both sides of the menorah in the emblem?|olive|star,e_wheat,e_palm
Y ענף זית הוא סמל של שלום, ולכן הוא מופיע משני צדי המנורה.|غصن الزيتون رمز للسلام، لذلك يظهر على جانبي الشمعدان.|Оливковая ветвь - символ мира, поэтому она есть по обе стороны меноры.|An olive branch is a sign of peace, so olive branches appear on both sides of the menorah.
Q איך קוראים להמנון של ישראל?|ما اسم النشيد الوطني لإسرائيل؟|Как называется гимн Израиля?|What is Israel's anthem called?|hatikva|e_jerugold,e_youandi,e_hallel
Y השיר מדבר על התקווה להיות עם חופשי בארץ שלו, ומכאן השם.|النشيد يتحدّث عن الأمل في أن يكون الشعب حرًا في أرضه، ومن هنا اسمه هتكفا (الأمل).|Гимн говорит о надежде народа быть свободным на своей земле, отсюда название «Ха-Тиква», то есть надежда.|The song is about the hope of being a free people in its own land, so it is called Hatikvah, meaning hope.
Q מה עושים כששרים את ההמנון?|ماذا نفعل عندما نغنّي النشيد الوطني؟|Что делают, когда поют гимн?|What do we do when the anthem is sung?|e_stand|e_sitdown,e_run2,e_play
Y עומדים בזמן ההמנון כדי להראות כבוד למדינה ולאנשים שבה.|نقف أثناء النشيد لكي نُظهر الاحترام للدولة ولناسها.|Во время гимна стоят, чтобы показать уважение к стране и её людям.|We stand during the anthem to show respect for the country and its people.
Q מהי בירת ישראל?|ما هي عاصمة إسرائيل؟|Какая столица Израиля?|What is the capital of Israel?|jlm|tlv,haifa,eilat
Y בירה היא העיר של מוסדות המדינה, ובירושלים נמצאים הכנסת והממשלה.|العاصمة هي مدينة مؤسسات الدولة، وفي القدس الكنيست والحكومة.|Столица - город главных органов страны, а в Иерусалиме находятся Кнессет и правительство.|A capital is where the country's leaders work, and the Knesset and the government are in Jerusalem.
Q איזה יום חוגגים שהמדינה קמה?|في أي يوم نحتفل بقيام الدولة؟|В какой день мы празднуем создание государства?|On which day do we celebrate the founding of the state?|indep|memor,purim,pesach
Y בתאריך הזה הוכרז על הקמת המדינה, ולכן חוגגים בו כל שנה.|في هذا التاريخ أُعلن قيام الدولة، لذلك نحتفل به كل سنة.|В этот день объявили о создании государства, поэтому его празднуют каждый год.|The founding of the state was announced on this date, so it is celebrated every year.
E e_stand|t|עומדים|نقف|стоим|we stand
E e_sitdown|t|יושבים ואוכלים|نجلس ونأكل|сидим и едим|we sit and eat
E e_run2|t|רצים|نركض|бежим|we run
E e_play|t|משחקים|نلعب|играем|we play
E xv_israelw|t|ישראל|إسرائيل|Израиль|Israel
E xv_shalomw|t|שלום|سلام|мир|peace
E xv_jlmw|t|ירושלים|القدس|Иерусалим|Jerusalem
E xv_hatikvaw|t|התקווה|الأمل (هتكفا)|надежда|Hatikvah
Q איזו מילה כתובה למטה בסמל המדינה?|أيّ كلمة مكتوبة في أسفل شعار الدولة؟|Какое слово написано внизу на гербе государства?|Which word is written at the bottom of the state emblem?|xv_israelw|xv_shalomw,xv_jlmw,xv_hatikvaw
Y זה הסמל של מדינת ישראל, ולכן כתוב בו השם שלה.|هذا شعار دولة إسرائيل، لذلك كُتب عليه اسمها.|Это герб государства Израиль, поэтому на нём написано его название.|This is the emblem of the State of Israel, so its name is written on it.
E xv_belong|t|שאנחנו שייכים יחד|أنّنا ننتمي معًا|что мы вместе|that we belong together
E xv_richest|t|מי העשיר ביותר במדינה|من الأغنى في الدولة|кто самый богатый в стране|who is the richest in the country
E xv_weather|t|מה מזג האוויר מחר|كيف سيكون الطقس غدًا|какая завтра погода|what the weather is tomorrow
E xv_whowins|t|מי ינצח במשחק|من سيفوز في المباراة|кто выиграет в игре|who will win the game
Q מה הסמלים של המדינה מראים לנו?|ماذا ترينا رموز الدولة؟|Что нам показывают символы государства?|What do the symbols of the country show us?|xv_belong|xv_richest,xv_weather,xv_whowins
Y סמל משותף כמו דגל או המנון מחבר אנשים רבים לקבוצה אחת.|رمز مشترك مثل العلم أو النشيد يجمع أناسًا كثيرين في مجموعة واحدة.|Общий символ, например флаг или гимн, объединяет много людей в одну группу.|A shared symbol like a flag or an anthem joins many people into one group.
S indep|🕯️|#c92a2a|יום העצמאות ויום הזיכרון|يوم الاستقلال ويوم الذكرى|День независимости и День памяти|Independence Day and Memorial Day
L בשנת 1948 הוקמה מדינת ישראל.|في عام 1948 قامت دولة إسرائيل.|В 1948 году было создано государство Израиль.|In 1948 the State of Israel was founded.
L דוד בן־גוריון קרא את מגילת העצמאות בתל אביב. הוא היה ראש הממשלה הראשון.|قرأ دافيد بن غوريون وثيقة الاستقلال في تل أبيب. وكان أول رئيس للحكومة.|Давид Бен-Гурион прочитал Декларацию независимости в Тель-Авиве. Он был первым премьер-министром.|David Ben-Gurion read the Declaration of Independence in Tel Aviv. He was the first Prime Minister.
L יום העצמאות הוא יום שמח. עושים מנגל, מניפים דגלים ורואים זיקוקים.|يوم الاستقلال يوم فرح. نشوي اللحم ونرفع الأعلام ونرى الألعاب النارية.|День независимости - радостный день. Жарят мясо, поднимают флаги и смотрят фейерверки.|Independence Day is a happy day. People have barbecues, wave flags and watch fireworks.
L יום אחד לפני יום העצמאות הוא יום הזיכרון. זוכרים בו חיילים ואנשים שנהרגו.|اليوم الذي يسبق يوم الاستقلال هو يوم الذكرى. نتذكّر فيه جنودًا وأشخاصًا قُتلوا.|За день до Дня независимости - День памяти. В этот день вспоминают солдат и людей, которые погибли.|The day before Independence Day is Memorial Day. We remember soldiers and people who were killed.
L ביום הזיכרון נשמעת צפירה. כולם עומדים בדממה ונזכרים.|في يوم الذكرى يُسمع صفّارة الإنذار. يقف الجميع بصمت ويتذكّرون.|В День памяти звучит сирена. Все стоят в тишине и вспоминают.|On Memorial Day a siren sounds. Everyone stands in silence and remembers.
Q באיזו שנה הוקמה מדינת ישראל?|في أي سنة قامت دولة إسرائيل؟|В каком году было создано государство Израиль?|In which year was the State of Israel founded?|y1948|y1938,y1958,y1968
Y בשנת 1948 בן־גוריון קרא את מגילת העצמאות, וכך קמה המדינה.|في عام 1948 قرأ بن غوريون وثيقة الاستقلال، وهكذا قامت الدولة.|В 1948 году Бен-Гурион прочитал Декларацию независимости, и так появилось государство.|In 1948 Ben-Gurion read the Declaration of Independence, and so the state began.
Q מי קרא את מגילת העצמאות?|من قرأ وثيقة الاستقلال؟|Кто прочитал Декларацию независимости?|Who read the Declaration of Independence?|bengurion|soldier,e_herzl,president
Y בן־גוריון הוביל את הקמת המדינה, ולכן הוא קרא את המגילה בקול.|بن غوريون قاد إقامة الدولة، لذلك هو من قرأ الوثيقة بصوت عالٍ.|Бен-Гурион руководил созданием государства, поэтому именно он прочитал Декларацию вслух.|Ben-Gurion led the founding of the state, so he was the one who read the Declaration aloud.
Q באיזו עיר קראו את מגילת העצמאות?|في أي مدينة قُرئت وثيقة الاستقلال؟|В каком городе прочитали Декларацию независимости?|In which city was the Declaration of Independence read?|tlv|jlm,haifa,eilat
Y ירושלים הייתה במצור במלחמה, ולכן הטקס נערך בתל אביב.|القدس كانت محاصرة في الحرب، لذلك أُقيم الاحتفال في تل أبيب.|Иерусалим тогда был в осаде из-за войны, поэтому церемонию провели в Тель-Авиве.|Jerusalem was under siege in the war, so the ceremony was held in Tel Aviv.
Q איזה יום הוא היום שמח, עם דגלים וזיקוקים?|أي يوم هو اليوم السعيد، مع الأعلام والألعاب النارية؟|Какой день весёлый, с флагами и фейерверками?|Which day is happy, with flags and fireworks?|indep|memor,purim,sukkot
Y ביום הזה שמחים שהמדינה קמה, ולכן מניפים דגלים ורואים זיקוקים.|في هذا اليوم نفرح بقيام الدولة، لذلك نرفع الأعلام ونرى الألعاب النارية.|В этот день радуются созданию государства, поэтому поднимают флаги и смотрят фейерверки.|On this day people are happy that the state was founded, so they wave flags and watch fireworks.
Q איזה יום זוכרים בו חיילים ואנשים שנהרגו?|في أي يوم نتذكّر الجنود والأشخاص الذين قُتلوا؟|В какой день вспоминают солдат и людей, которые погибли?|On which day do we remember soldiers and people who were killed?|memor|indep,purim,pesach
Y יום הזיכרון נועד לזכור את מי שנהרגו, ולכן הוא יום שקט ועצוב.|يوم الذكرى مخصّص لتذكّر من قُتلوا، لذلك هو يوم هادئ وحزين.|День памяти посвящён тем, кто погиб, поэтому это тихий и грустный день.|Memorial Day is for remembering those who were killed, so it is a quiet and sad day.
Q מה עושים כשנשמעת צפירה ביום הזיכרון?|ماذا نفعل عندما تُسمع الصفّارة في يوم الذكرى؟|Что делают, когда в День памяти звучит сирена?|What do we do when the siren sounds on Memorial Day?|siren|run,e_sirentalk,e_sirensit
Y העמידה בשקט מראה כבוד לאנשים שנהרגו, וכולם זוכרים אותם יחד.|الوقوف بصمت يُظهر الاحترام لمن قُتلوا، ويتذكّرهم الجميع معًا.|Молчание стоя показывает уважение к погибшим, и все вспоминают их вместе.|Standing in silence shows respect for those who were killed, and everyone remembers them together.
Q מי היה ראש הממשלה הראשון של ישראל?|من كان أول رئيس حكومة في إسرائيل؟|Кто был первым премьер-министром Израиля?|Who was the first Prime Minister of Israel?|bengurion|mayor,president,e_weizmann
Y בן־גוריון עמד בראש המדינה מהיום שבו קמה, ולכן היה הראשון בתפקיד.|بن غوريون قاد الدولة منذ يوم قيامها، لذلك كان أول من شغل هذا المنصب.|Бен-Гурион возглавлял страну с первого дня, поэтому он был первым на этой должности.|Ben-Gurion led the country from the day it was founded, so he was the first in this job.
E xv_daybefore|t|יום אחד לפני יום העצמאות|يومًا واحدًا قبل يوم الاستقلال|за один день до Дня независимости|one day before Independence Day
E xv_dayafter|t|יום אחד אחרי יום העצמאות|يومًا واحدًا بعد يوم الاستقلال|через один день после Дня независимости|one day after Independence Day
E xv_inhanuk|t|באמצע חנוכה|في منتصف حانوكا|в середине Хануки|in the middle of Hanukkah
E xv_inrosh|t|בראש השנה|في رأس السنة العبرية|на Рош а-Шана|on Rosh Hashanah
Q מתי חל יום הזיכרון?|متى يحلّ يوم الذكرى؟|Когда бывает День памяти?|When is Memorial Day?|xv_daybefore|xv_dayafter,xv_inhanuk,xv_inrosh
Y קודם זוכרים את מי שנהרגו בשביל המדינה, ורק אחר כך חוגגים אותה.|أولًا نتذكّر من قُتلوا من أجل الدولة، وبعد ذلك فقط نحتفل بها.|Сначала вспоминают тех, кто погиб ради страны, и только потом её празднуют.|First we remember those who died for the country, and only then do we celebrate it.
E xv_fireworks|t|זיקוקים|ألعاب نارية|салют|fireworks
E xv_rainbow|t|קשת בענן|قوس قزح|радугу|a rainbow
E xv_snowfall|t|שלג יורד|ثلجًا يتساقط|падающий снег|falling snow
E xv_northlight|t|זוהר צפוני|الشفق القطبي|северное сияние|the northern lights
Q מה רואים בשמיים בערב יום העצמאות?|ماذا نرى في السماء مساء يوم الاستقلال؟|Что видно в небе вечером в День независимости?|What can you see in the sky on the evening of Independence Day?|xv_fireworks|xv_rainbow,xv_snowfall,xv_northlight
Y בערב יום העצמאות חוגגים, וזיקוקים צבעוניים הם חלק מהשמחה.|في مساء يوم الاستقلال نحتفل، والألعاب النارية الملوّنة جزء من الفرح.|Вечером в День независимости празднуют, и цветные фейерверки - часть праздника.|On the evening of Independence Day people celebrate, and colorful fireworks are part of the fun.
E xv_bbq|t|עושים מנגל עם המשפחה|نشوي اللحم مع العائلة|устраиваем пикник с мангалом всей семьёй|we have a barbecue with the family
E xv_fastday|t|צמים כל היום|نصوم طوال اليوم|постимся весь день|we fast all day
E xv_buildsuk|t|בונים סוכה בחצר עם המשפחה|نبني سُكّا في الساحة مع العائلة|строим сукку во дворе всей семьёй|we build a sukkah in the yard with the family
E xv_lighthan|t|מדליקים חנוכייה|نُشعل شمعدان حانوكا|зажигаем ханукию|we light a hanukkiah
Q מה עושים הרבה משפחות ביום העצמאות?|ماذا تفعل عائلات كثيرة في يوم الاستقلال؟|Что делают многие семьи в День независимости?|What do many families do on Independence Day?|xv_bbq|xv_fastday,xv_buildsuk,xv_lighthan
Y ביום העצמאות הרבה משפחות יוצאות לפארק, ומנגל הוא מנהג נפוץ בחג הזה.|في يوم الاستقلال تخرج عائلات كثيرة إلى الحديقة، والشواء عادة منتشرة في هذا العيد.|В День независимости многие семьи едут в парк, и жарить мясо - частый обычай этого праздника.|On Independence Day many families go to the park, and a barbecue is a common custom on this holiday.
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
Y כל החוף המערבי של ישראל פונה אל הים התיכון, ושם השמש שוקעת בערב.|الساحل الغربي لإسرائيل كله يطلّ على البحر المتوسط، وهناك تغيب الشمس في المساء.|Весь западный берег Израиля выходит к Средиземному морю, и там вечером садится солнце.|Israel's whole west coast faces the Mediterranean Sea, and that is where the sun sets.
Q איזה אגם מים מתוקים גדול יש בצפון?|أي بحيرة مياه عذبة كبيرة توجد في الشمال؟|Какое большое пресноводное озеро есть на севере?|Which large freshwater lake is in the north?|kinneret|dead,med,jordan
Y הכנרת היא אגם של מים מתוקים, וים המלח מלוח מאוד.|بحيرة طبريا (الكنيرت) بحيرة مياه عذبة، أمّا البحر الميت فمالح جدًا.|Кинерет - озеро с пресной водой, а Мёртвое море очень солёное.|The Sea of Galilee holds fresh water, while the Dead Sea is very salty.
Q איזה מדבר גדול יש בדרום ישראל?|أي صحراء كبيرة توجد في جنوب إسرائيل؟|Какая большая пустыня есть на юге Израиля?|Which big desert is in the south of Israel?|negev|galilee,med,kinneret
Y בנגב יורד מעט מאוד גשם, ולכן רוב השטח שלו מדבר.|في النقب ينزل مطر قليل جدًا، لذلك معظم أرضه صحراء.|В Негеве очень мало дождей, поэтому большая его часть - пустыня.|Very little rain falls in the Negev, so most of it is desert.
Q באיזה אזור בישראל נמצא הגליל?|في أي منطقة من إسرائيل يقع الجليل؟|В какой части Израиля находится Галилея?|In which part of Israel is the Galilee?|north|south,east,west
Y הגליל נמצא ליד הכנרת, והכנרת נמצאת בצפון הארץ.|الجليل قريب من بحيرة طبريا، وبحيرة طبريا في شمال البلاد.|Галилея находится рядом с Кинеретом, а Кинерет - на севере страны.|The Galilee is near the Sea of Galilee, which is in the north of the country.
Q על איזה ים נמצאת העיר אילת?|على أي بحر تقع مدينة إيلات؟|На каком море находится город Эйлат?|On which sea is the city of Eilat?|redsea|med,dead,kinneret
Y אילת נמצאת בקצה הדרומי של ישראל, ושם הארץ נוגעת בים האדום.|إيلات في الطرف الجنوبي لإسرائيل، وهناك تلمس البلاد البحر الأحمر.|Эйлат на самом юге Израиля, где страна выходит к Красному морю.|Eilat is at the southern tip of Israel, where the land meets the Red Sea.
Q מהו המקום הנמוך ביותר בעולם?|ما هو أخفض مكان في العالم؟|Какое место самое низкое в мире?|What is the lowest place in the world?|dead|kinneret,med,negev
Y פני ים המלח נמוכים יותר מכל מקום אחר על היבשה בעולם.|سطح البحر الميت أخفض من أي مكان آخر على اليابسة في العالم.|Поверхность Мёртвого моря ниже любого другого места на суше в мире.|The surface of the Dead Sea is lower than any other place on land in the world.
Q איפה אפשר לצוף בלי לשחות?|أين يمكن الطفو من دون سباحة؟|Где можно лежать на воде, не плавая?|Where can you float without swimming?|dead|kinneret,med,redsea
Y במים של ים המלח יש הרבה מאוד מלח, והמלח מחזיק את הגוף למעלה.|في مياه البحر الميت ملح كثير جدًا، والملح يرفع الجسم إلى الأعلى.|В воде Мёртвого моря очень много соли, и соль держит тело на поверхности.|The Dead Sea water has a lot of salt, and the salt holds the body up.
Q איפה נמצאת העיר אילת בישראל?|أين تقع مدينة إيلات في إسرائيل؟|Где в Израиле находится город Эйлат?|Where in Israel is the city of Eilat?|south|north,east,west
Y אילת נמצאת בקצה של הנגב, והנגב נמצא בדרום הארץ.|إيلات في طرف النقب، والنقب في جنوب البلاد.|Эйлат находится на краю Негева, а Негев - на юге страны.|Eilat is at the end of the Negev, and the Negev is in the south of the country.
Q באיזה אזור בישראל נמצאת הכנרת?|في أيّ منطقة في إسرائيل تقع بحيرة طبريا؟|В какой части Израиля находится Кинерет?|In which part of Israel is the Sea of Galilee?|north|south,east,west
Y הכנרת נמצאת ליד הגליל, אזור בצפון הארץ עם הרבה ירוק ומים.|بحيرة طبريا قرب الجليل، وهو منطقة في شمال البلاد فيها خضرة ومياه كثيرة.|Кинерет находится рядом с Галилеей, в зелёном районе на севере страны.|The Sea of Galilee is next to the Galilee, a green area with lots of water in the north.
E xv_fish|t|דגים צבעוניים|أسماكًا ملوّنة|разноцветных рыб|colorful fish
E xv_polar|t|דובי קוטב|دببة قطبية|белых медведей|polar bears
E xv_icebergs|t|הרים של קרח|جبالًا جليدية|ледяные горы|icebergs
E xv_penguins|t|פינגווינים|بطاريق|пингвинов|penguins
Q מה אפשר לראות כששוחים בים האדום ליד אילת?|ماذا يمكن أن نرى عندما نسبح في البحر الأحمر قرب إيلات؟|Что можно увидеть, когда плаваешь в Красном море у Эйлата?|What can you see when you swim in the Red Sea near Eilat?|xv_fish|xv_polar,xv_icebergs,xv_penguins
Y המים בים האדום חמים, ויש בהם שוניות אלמוגים שבהן חיים דגים צבעוניים.|مياه البحر الأحمر دافئة، وفيها شعاب مرجانية تعيش فيها أسماك ملوّنة.|Вода в Красном море тёплая, и в ней есть кораллы, где живут разноцветные рыбы.|The Red Sea is warm, and it has coral reefs where colorful fish live.
S town|🏙️|#7048e8|העיר שלי והעירייה|مدينتي والبلدية|мой город и муниципалитет|My City and the Municipality
L כל עיר או יישוב מנוהלים על ידי העירייה או המועצה.|كل مدينة أو بلدة تُدار من قِبل البلدية أو المجلس.|Каждым городом или посёлком управляет муниципалитет или совет.|Every city or town is run by a municipality or a council.
L בראש העירייה עומד ראש העיר. התושבים בוחרים אותו בבחירות.|يرأس البلدية رئيس البلدية. والسكان ينتخبونه في الانتخابات.|Во главе муниципалитета стоит мэр. Жители выбирают его на выборах.|The mayor is the head of the municipality. The residents choose him or her in an election.
L העירייה דואגת לגינות, לרחובות, לאשפה ולבתי הספר.|تهتم البلدية بالحدائق والشوارع والنفايات والمدارس.|Муниципалитет заботится о парках, улицах, мусоре и школах.|The municipality takes care of parks, streets, garbage and schools.
L העירייה גם מדליקה פנסים ברחובות ומנקה אותם.|والبلدية تُضيء الشوارع بالمصابيح وتنظّفها.|Муниципалитет также включает уличные фонари и убирает улицы.|The municipality also lights the street lamps and cleans the streets.
L כדי שהעירייה תעבוד, התושבים משלמים לה מיסים.|لكي تعمل البلدية، يدفع السكان لها الضرائب.|Чтобы муниципалитет работал, жители платят ему налоги.|So that the municipality can work, the residents pay it taxes.
L גם לנו יש תפקיד: לא לזרוק זבל, ולשמור על הגינה והמגרש.|ولنا نحن أيضًا دور: ألا نرمي القمامة، وأن نحافظ على الحديقة والملعب.|У нас тоже есть своя роль: не бросать мусор и беречь парк и площадку.|We also have a role: not to throw trash, and to take care of the park and the playground.
Q מי עומד בראש העירייה?|من يرأس البلدية؟|Кто возглавляет муниципалитет?|Who is the head of the municipality?|mayor|pm,president,judge
Y התושבים בוחרים את ראש העיר כדי שינהל את העירייה בשבילם.|السكان ينتخبون رئيس البلدية لكي يدير البلدية من أجلهم.|Жители выбирают мэра, чтобы он руководил муниципалитетом для них.|The residents choose the mayor to run the municipality for them.
Q מי בוחר את ראש העיר?|من ينتخب رئيس البلدية؟|Кто выбирает мэра?|Who chooses the mayor?|e_residents|e_teachers,e_soldiers,e_kids
Y ראש העיר עובד בשביל האנשים שגרים בעיר, ולכן הם אלה שבוחרים אותו.|رئيس البلدية يعمل من أجل سكان المدينة، لذلك هم الذين ينتخبونه.|Мэр работает для жителей города, поэтому именно они его выбирают.|The mayor works for the people who live in the city, so they are the ones who choose the mayor.
Q איזה גוף דואג לגינות ולרחובות בעיר?|أي جهة تهتم بالحدائق والشوارع في المدينة؟|Какой орган заботится о парках и улицах города?|Which body takes care of the parks and streets in the city?|city|knesset,court,mda
Y העירייה אחראית על העיר שלה, והכנסת אחראית על חוקים לכל המדינה.|البلدية مسؤولة عن مدينتها، والكنيست مسؤول عن قوانين الدولة كلها.|Муниципалитет отвечает за свой город, а Кнессет пишет законы для всей страны.|The municipality is in charge of its own city, while the Knesset makes laws for the whole country.
Q מה עושה העירייה?|ماذا تفعل البلدية؟|Что делает муниципалитет?|What does the municipality do?|e_gardens|e_laws2,e_judge2,e_army
Y העירייה מטפלת בדברים שקרובים לבית שלנו, כמו הגינה והרחוב.|البلدية تهتم بالأشياء القريبة من بيتنا، مثل الحديقة والشارع.|Муниципалитет заботится о том, что рядом с нашим домом, например о парке и улице.|The municipality looks after things close to our home, like the park and the street.
Q כדי שהעירייה תעבוד, מה משלמים התושבים?|لكي تعمل البلدية، ماذا يدفع السكان؟|Чтобы муниципалитет работал, что платят жители?|So that the municipality can work, what do the residents pay?|e_taxes|e_payfines,e_payfree,e_paywater
Y בכסף של המיסים העירייה מנקה רחובות, מטפחת גינות ומתקנת בתי ספר.|بمال الضرائب تنظّف البلدية الشوارع وتعتني بالحدائق وتصلح المدارس.|На деньги от налогов муниципалитет убирает улицы, ухаживает за парками и ремонтирует школы.|With the tax money the municipality cleans streets, cares for parks and fixes schools.
Q מה עוד אנחנו יכולים לעשות למען העיר?|ماذا يمكننا أن نفعل أيضًا من أجل المدينة؟|Что ещё мы можем сделать для города?|What else can we do for the city?|uclean|e_cityothers,e_cityhome,e_citycomplain
Y העיר שייכת לכל התושבים, ולכן כל אחד יכול לעזור לשמור עליה נקייה.|المدينة لكل السكان، لذلك يستطيع كل واحد أن يساعد في إبقائها نظيفة.|Город принадлежит всем жителям, поэтому каждый может помочь сохранить его чистым.|The city belongs to all its residents, so everyone can help keep it clean.
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
E xv_lamps|t|פנסים ברחובות|مصابيح الشوارع|фонари на улицах|street lights
E xv_candlesh|t|נרות בכל הבתים|شموعًا في كل البيوت|свечи во всех домах|candles in every home
E xv_bonfires|t|מדורות בגינות|نيرانًا في الحدائق|костры в парках|bonfires in the parks
E xv_nightfw|t|זיקוקים בכל ערב|ألعابًا نارية كل مساء|салют каждый вечер|fireworks every evening
Q מה העירייה מדליקה בערב?|ماذا تُضيء البلدية في المساء؟|Что зажигает муниципалитет вечером?|What does the city council light up in the evening?|xv_lamps|xv_candlesh,xv_bonfires,xv_nightfw
Y פנסים מאירים את הרחוב בחושך, וכך אפשר ללכת בבטחה גם בערב.|المصابيح تُضيء الشارع في الظلام، فنستطيع المشي بأمان في المساء أيضًا.|Фонари освещают улицу в темноте, и вечером можно спокойно ходить.|Street lamps light the street in the dark, so people can walk safely in the evening.
E xv_schtrash|t|דואגת לבתי הספר ולאשפה|تهتمّ بالمدارس وبالنفايات|заботится о школах и мусоре|takes care of schools and garbage
Q לאיזה דבר עוד דואגת העירייה?|بماذا تهتمّ البلدية أيضًا؟|О чём ещё заботится муниципалитет?|What else does the city council take care of?|xv_schtrash|e_laws2,e_judge2,e_army
Y העירייה דואגת למה שכל התושבים צריכים בכל יום, כמו בית ספר ופינוי אשפה.|البلدية تهتم بما يحتاجه السكان كل يوم، مثل المدرسة وجمع النفايات.|Муниципалитет заботится о том, что нужно жителям каждый день, например о школах и вывозе мусора.|The municipality takes care of what residents need every day, like schools and garbage collection.
E xv_elections|t|בבחירות|بالانتخابات|на выборах|in elections
E xv_lottery|t|בהגרלה|بالقرعة|жеребьёвкой|by lottery
E xv_byage|t|לפי הגיל|حسب العمر|по возрасту|by age
E xv_byking|t|המלך ממנה אותו|الملك يعيّنه|его назначает царь|the king appoints him
Q איך בוחרים את ראש העיר?|كيف يُختار رئيس البلدية؟|Как выбирают мэра?|How is the mayor chosen?|xv_elections|xv_lottery,xv_byage,xv_byking
Y בבחירות כל תושב נותן קול, וכך העיר בוחרת את מי שרוב האנשים רוצים.|في الانتخابات يعطي كل ساكن صوته، فتختار المدينة من يريده أغلب الناس.|На выборах каждый житель отдаёт голос, и город выбирает того, кого хочет большинство.|In an election each resident gives a vote, so the city picks the person most people want.
E xv_council|b|המועצה|المجلس المحلي|местный совет|the local council
Q מי מנהל יישוב קטן, כמו כפר?|من يدير بلدة صغيرة مثل القرية؟|Кто управляет маленьким населённым пунктом, например деревней?|Who runs a small community, like a village?|xv_council|knesset,court,pm
Y ליישוב קטן אין עירייה, ולכן המועצה מנהלת אותו.|البلدة الصغيرة ليس لها بلدية، لذلك يديرها المجلس.|У маленького посёлка нет муниципалитета, поэтому им управляет совет.|A small town has no municipality, so a council runs it.
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
Y בדמוקרטיה הכוח להחליט שייך לאנשים, ולא לאדם אחד.|في الديمقراطية القرار بيد الناس، وليس بيد شخص واحد.|В демократии право решать принадлежит людям, а не одному человеку.|In a democracy the power to decide belongs to the people, not to one person.
Q מה עושים בבחירות?|ماذا يفعل الناس في الانتخابات؟|Что делают на выборах?|What do people do in an election?|vote|e_elecwatch,e_elecwait,e_elecdecide
Y בבחירות כל אחד מצביע, וכך הוא אומר את מי הוא רוצה.|في الانتخابات يصوّت كل واحد، وهكذا يقول من يريد.|На выборах каждый голосует и так говорит, кого он хочет выбрать.|In an election everyone votes, and that is how they say who they want.
Q כל כמה שנים בדרך כלל יש בחירות לכנסת?|كل كم سنة تُجرى عادةً انتخابات الكنيست؟|Через сколько лет обычно проходят выборы в Кнессет?|How often are Knesset elections usually held (in years)?|n4|n1,n10,n40
Y החוק קובע שהכנסת עובדת כ־4 שנים, ואחר כך בוחרים מחדש.|القانون يحدّد أن الكنيست يعمل نحو 4 سنوات، وبعدها ننتخب من جديد.|По закону Кнессет работает около 4 лет, а потом его выбирают заново.|By law the Knesset serves for about 4 years, and then people vote again.
Q מגיל כמה מצביעים לכנסת?|من أي عمر يصوّت المواطن للكنيست؟|С какого возраста голосуют в Кнессет?|From what age can a citizen vote for the Knesset?|n18|n10,n12,n8
Y בגיל 18 אדם נחשב מבוגר, ולכן מאז הוא יכול להצביע לכנסת.|في عمر 18 يُعتبر الإنسان بالغًا، لذلك يستطيع منذ ذلك الحين التصويت للكنيست.|В 18 лет человек считается взрослым, поэтому с этого возраста он может голосовать.|At 18 a person counts as an adult, so from then on they can vote for the Knesset.
Q איך מצביעים בבחירות לכנסת?|كيف نصوّت في انتخابات الكنيست؟|Как голосуют на выборах в Кнессет?|How do we vote in the Knesset elections?|secret|open,e_alone2,e_byphone
Y מצביעים מאחורי פרגוד, ולכן אף אחד לא רואה במי בחרנו.|نصوّت خلف ستارة، لذلك لا يرى أحد من اخترنا.|Голосуют за ширмой, поэтому никто не видит, кого мы выбрали.|We vote behind a screen, so nobody sees who we chose.
Q למה ההצבעה סודית?|لماذا التصويت سرّي؟|Почему голосование тайное?|Why is the vote secret?|e_nofear|e_secretfast,e_secretsame,e_secretshow
Y כשאף אחד לא יודע במי בחרנו, אף אחד לא יכול לכעוס עלינו בגלל זה.|عندما لا يعرف أحد من اخترنا، لا يستطيع أحد أن يغضب منّا بسبب ذلك.|Когда никто не знает, за кого мы голосовали, никто не может за это на нас злиться.|When nobody knows who we voted for, nobody can be angry at us because of it.
Q איך מחליטים כשיש בחירות בכיתה?|كيف نقرّر عندما تكون هناك انتخابات في الصف؟|Как принимают решение на выборах в классе?|How do we decide in a class election?|e_majority|e_teacherwins,e_loudest,e_oldest
Y כשסופרים קולות, ההחלטה היא מה שרוב הילדים רצו, וזה הוגן לכולם.|عندما نعدّ الأصوات، يكون القرار ما أراده أغلب الأولاد، وهذا عادل للجميع.|Когда считают голоса, решение - то, чего хотело большинство детей, и это честно.|When the votes are counted, the choice is what most children wanted, and that is fair.
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
E xv_cannot|t|כי אי אפשר שכולם יחליטו על כל דבר|لأنه لا يمكن أن يقرّر الجميع في كل شيء|потому что все не могут решать всё сами|because everyone cannot decide everything
E xv_dontwant|t|כי האזרחים לא רוצים להחליט אף פעם|لأن المواطنين لا يريدون أن يقرّروا أبدًا|потому что граждане никогда не хотят решать|because citizens never want to decide
E xv_kingsaid|t|כי כך המלך החליט לפני הרבה שנים|لأن الملك قرّر ذلك قبل سنوات كثيرة|потому что так решил царь много лет назад|because a king decided so many years ago
E xv_nofair|t|כי ככה הבחירות נגמרות מהר יותר|لأن الانتخابات تنتهي هكذا بسرعة أكبر|потому что так выборы заканчиваются быстрее|because then elections end faster
Q למה בוחרים אנשים שיחליטו בשבילנו?|لماذا ننتخب أشخاصًا يقرّرون بدلًا منّا؟|Почему мы выбираем людей, которые решают за нас?|Why do we choose people to decide for us?|xv_cannot|xv_dontwant,xv_kingsaid,xv_nofair
Y במדינה יש מיליוני אזרחים, ולא כולם יכולים לשבת יחד ולהחליט על כל דבר.|في الدولة ملايين المواطنين، ولا يمكنهم كلهم أن يجلسوا معًا ويقرّروا كل شيء.|В стране миллионы граждан, и они не могут все вместе собраться и решать каждый вопрос.|A country has millions of citizens, and they cannot all sit together and decide everything.
E xv_kalpi|l|בקלפי|في صندوق الاقتراع|на избирательном участке|at the ballot box
E xv_incourt|l|בבית המשפט|في المحكمة|в суде|at the court
E xv_inhosp|l|בבית החולים|في المستشفى|в больнице|at the hospital
E xv_inpolice|l|בתחנת המשטרה|في مركز الشرطة|в полицейском участке|at the police station
Q איפה מצביעים בבחירות?|أين نصوّت في الانتخابات؟|Где голосуют на выборах?|Where do people vote in elections?|xv_kalpi|xv_incourt,xv_inhosp,xv_inpolice
Y הקלפי היא המקום שבו מכניסים את פתק ההצבעה, ושם סופרים את הקולות.|صندوق الاقتراع هو المكان الذي نضع فيه ورقة التصويت، وهناك تُعدّ الأصوات.|На избирательном участке опускают бюллетень в урну, и там считают голоса.|The polling station is where we put in our voting slip, and the votes are counted there.
E xv_accept|t|מכבדים את ההחלטה|نحترم القرار|уважаем решение|we respect the decision
E xv_argueall|t|רבים עם כל מי שבחר אחרת|نتشاجر مع كل من اختار غير ذلك|ссоримся со всеми, кто выбрал иначе|we argue with everyone who chose differently
E xv_leave|t|עוזבים את הכיתה בכעס|نترك الصف بغضب|сердито уходим из класса|we leave the class angrily
E xv_revote|t|מצביעים שוב עד שננצח|نصوّت من جديد حتى نفوز|голосуем снова, пока не победим|we vote again until we win
Q הרוב החליט אחרת ממה שרצינו. מה עושים?|الأغلبية قرّرت غير ما أردنا. ماذا نفعل؟|Большинство решило не так, как мы хотели. Что делать?|The majority decided differently from what we wanted. What do we do?|xv_accept|xv_argueall,xv_leave,xv_revote
Y בדמוקרטיה הרוב מחליט, וכבוד להחלטה שומר על השקט גם כשלא ניצחנו.|في الديمقراطية تقرّر الأغلبية، واحترام القرار يحفظ الهدوء حتى عندما لا نفوز.|В демократии решает большинство, и уважение к решению сохраняет мир, даже если мы проиграли.|In a democracy the majority decides, and respecting the result keeps the peace even when we lose.
S gov|🏛️|#5f3dc4|רשויות המדינה|سلطات الدولة|органы государства|The Branches of the State
L במדינה יש שלושה חלקים חשובים, ולכל אחד תפקיד אחר.|في الدولة ثلاثة أجزاء مهمة، ولكل واحد منها دور مختلف.|В государстве три важные части, и у каждой своя задача.|The state has three important parts, and each has a different job.
L הכנסת כותבת חוקים. בכנסת יושבים 120 חברי כנסת שהעם בחר.|الكنيست يكتب القوانين. في الكنيست 120 عضوًا انتخبهم الشعب.|Кнессет пишет законы. В Кнессете 120 депутатов, которых выбрал народ.|The Knesset writes laws. In the Knesset there are 120 members that the people chose.
L הממשלה דואגת שהחוקים יתקיימו ושהמדינה תתנהל. בראשה עומד ראש הממשלה.|الحكومة تهتم بتنفيذ القوانين وبإدارة الدولة. ويرأسها رئيس الحكومة.|Правительство следит за выполнением законов и управляет страной. Его возглавляет премьер-министр.|The government makes sure the laws are carried out and the country is run. The Prime Minister is its head.
L בתי המשפט שופטים. השופטים בודקים מה קרה ומחליטים מה הוגן לפי החוק.|المحاكم تحكم. القضاة يفحصون ما حدث ويقرّرون ما هو عادل بحسب القانون.|Суды судят. Судьи выясняют, что произошло, и решают, что справедливо по закону.|The courts judge. Judges check what happened and decide what is fair by law.
L בית המשפט העליון נמצא בירושלים. הוא מקום המשפט הגבוה ביותר.|المحكمة العليا في القدس. وهي أعلى جهة قضائية.|Верховный суд находится в Иерусалиме. Это самый высокий суд.|The Supreme Court is in Jerusalem. It is the highest court.
L נשיא המדינה הוא לא ראש הממשלה. הוא מייצג את כל אזרחי המדינה.|رئيس الدولة ليس رئيس الحكومة. وهو يمثّل جميع مواطني الدولة.|Президент государства - не премьер-министр. Он представляет всех граждан страны.|The President of the State is not the Prime Minister. He or she represents all the citizens.
Q מי מחליט אילו חוקים יהיו במדינה?|من يقرّر ما هي قوانين الدولة؟|Кто решает, какие законы будут в стране?|Who decides what the laws of the country will be?|knesset|gov,court,city
Y הכנסת היא החלק במדינה שתפקידו לכתוב חוקים ולשנות אותם.|الكنيست هو الجزء في الدولة الذي دوره كتابة القوانين وتغييرها.|Кнессет - это часть государства, задача которой писать и менять законы.|The Knesset is the part of the state whose job is to write and change laws.
Q כמה חברי כנסת יש בכנסת?|كم عضوًا في الكنيست؟|Сколько депутатов в Кнессете?|How many members are there in the Knesset?|n120|n100,n110,n130
Y המספר 120 נלקח מהכנסת הגדולה, מועצה של 120 חכמים מלפני יותר מ־2000 שנה.|العدد 120 مأخوذ من الكنيست الكبير، وهو مجلس من 120 حكيمًا قبل أكثر من 2000 سنة.|Число 120 взято от Великого собрания, совета из 120 мудрецов, который был более 2000 лет назад.|The number 120 comes from the Great Assembly, a council of 120 wise men more than 2000 years ago.
Q מי עומד בראש הממשלה?|من يرأس الحكومة؟|Кто возглавляет правительство?|Who is the head of the government?|pm|president,mayor,judge
Y כמו שבעירייה יש ראש עיר, בממשלה יש ראש ממשלה שמוביל את השרים.|كما أن للبلدية رئيسًا، للحكومة رئيس حكومة يقود الوزراء.|Как у муниципалитета есть мэр, так у правительства есть премьер-министр, который ведёт министров.|Just as a city has a mayor, the government has a Prime Minister who leads the ministers.
Q מי דואג שהחוקים יתקיימו ושהמדינה תתנהל?|من يهتم بتنفيذ القوانين وبإدارة الدولة؟|Кто следит за выполнением законов и управляет страной?|Who makes sure the laws are carried out and the country is run?|gov|knesset,court,city
Y הכנסת כותבת את החוקים, והממשלה היא זו שמבצעת אותם בכל יום.|الكنيست يكتب القوانين، والحكومة هي التي تنفّذها كل يوم.|Кнессет пишет законы, а правительство выполняет их каждый день.|The Knesset writes the laws, and the government carries them out every day.
Q איזה גוף שופט ומחליט מה הוגן לפי החוק?|أي جهة تحكم وتقرّر ما هو عادل بحسب القانون؟|Какой орган судит и решает, что справедливо по закону?|Which body judges and decides what is fair by law?|court|knesset,gov,city
Y בבית המשפט יושבים שופטים, ותפקידם להחליט מה הוגן לפי החוק.|في المحكمة يجلس القضاة، ودورهم أن يقرّروا ما هو عادل بحسب القانون.|В суде работают судьи, и их задача - решать, что справедливо по закону.|Judges sit in the court, and their job is to decide what is fair by law.
Q איפה נמצא בית המשפט העליון?|أين تقع المحكمة العليا؟|Где находится Верховный суд?|Where is the Supreme Court?|jlm|tlv,bsheva,tiberias
Y ירושלים היא הבירה, ושם נמצאים המוסדות החשובים של המדינה.|القدس هي العاصمة، وفيها مؤسسات الدولة المهمة.|Иерусалим - столица, и там находятся главные учреждения страны.|Jerusalem is the capital, and the state's important institutions are there.
Q מי מייצג את כל אזרחי המדינה?|من يمثّل جميع مواطني الدولة؟|Кто представляет всех граждан страны?|Who represents all the citizens of the country?|president|pm,mayor,judge
Y הנשיא אינו שייך למפלגה אחת, ולכן הוא מייצג את כל האזרחים.|الرئيس لا يتبع حزبًا واحدًا، لذلك يمثّل جميع المواطنين.|Президент не представляет одну партию, поэтому он представляет всех граждан.|The President does not belong to one party, so he or she represents all the citizens.
Q כמה חלקים חשובים יש במדינה, ולכל אחד תפקיד אחר?|كم قسمًا مهمًّا في الدولة، ولكل منها دور مختلف؟|Сколько важных частей в государстве, у каждой из которых своя роль?|How many important parts does the country have, each with a different job?|n3|n4,n5,n7
Y הכוח מחולק בין 3 חלקים, כדי שאף חלק לא יחליט לבד על הכול.|السلطة مقسّمة بين 3 أجزاء، لكي لا يقرّر جزء واحد كل شيء وحده.|Власть разделена на 3 части, чтобы ни одна часть не решала всё сама.|Power is split into 3 parts, so that no single part decides everything alone.
E xv_judges|t|בודקים מה קרה ומחליטים מה הוגן|يفحصون ما حدث ويقرّرون ما هو عادل|выясняют, что случилось, и решают, что справедливо|they check what happened and decide what is fair
E xv_writelaw|t|כותבים חוקים חדשים למדינה|يكتبون قوانين جديدة للدولة|пишут новые законы для всей страны|they write new laws for the country
E xv_cleanst|t|מנקים את הרחובות בעיר|ينظّفون شوارع المدينة|убирают улицы в городе|they clean the streets in the city
E xv_putfire|t|מכבים שריפות בבתים|يطفئون الحرائق في البيوت|тушат пожары в домах|they put out fires in houses
Q מה עושים השופטים?|ماذا يفعل القضاة؟|Что делают судьи?|What do judges do?|xv_judges|xv_writelaw,xv_cleanst,xv_putfire
Y השופט צריך להבין מה קרה באמת, ורק אז הוא יכול להחליט בהגינות.|القاضي يحتاج أن يفهم ما حدث فعلًا، وعندها فقط يستطيع أن يحكم بعدل.|Судья должен понять, что было на самом деле, и только тогда может решить справедливо.|A judge must understand what really happened, and only then can decide fairly.
E xv_thepeople|t|העם, בבחירות|الشعب، في الانتخابات|народ, на выборах|the people, in elections
E xv_bypm|t|ראש הממשלה, לבד|رئيس الحكومة وحده|премьер-министр, сам|the prime minister, alone
E xv_byjudges|t|השופטים, בבית המשפט|القضاة، في المحكمة|судьи, в суде|the judges, in court
E xv_bypres|t|נשיא המדינה, במכתב|رئيس الدولة، برسالة|президент, письмом|the president, by letter
Q מי בוחר את חברי הכנסת?|من ينتخب أعضاء الكنيست؟|Кто выбирает членов Кнессета?|Who chooses the members of the Knesset?|xv_thepeople|xv_bypm,xv_byjudges,xv_bypres
Y בדמוקרטיה האנשים מחליטים, ולכן העם בוחר את חברי הכנסת בבחירות.|في الديمقراطية الناس يقرّرون، لذلك ينتخب الشعب أعضاء الكنيست.|В демократии решают люди, поэтому народ выбирает депутатов Кнессета на выборах.|In a democracy the people decide, so the people choose the Knesset members in elections.
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
Y לישראל הגיעו אנשים מהרבה מדינות, וכל קהילה הביאה איתה את השפה שלה.|إلى إسرائيل جاء أناس من دول كثيرة، وكل مجتمع أحضر معه لغته.|В Израиль приехали люди из многих стран, и каждая община привезла свой язык.|People came to Israel from many countries, and each community brought its own language.
Q איך מתייחסים לאדם שמדבר אחרת מאיתנו?|كيف نتعامل مع شخص يتحدّث بشكل مختلف عنّا؟|Как относиться к человеку, который говорит иначе, чем мы?|How do we treat a person who speaks differently from us?|e_respect|e_laugh,e_avoid,e_hit
Y כל אדם ראוי לכבוד, ומי שמדבר אחרת יכול ללמד אותנו משהו חדש.|كل إنسان يستحق الاحترام، ومن يتكلّم بشكل مختلف يمكنه أن يعلّمنا شيئًا جديدًا.|Каждый человек достоин уважения, а тот, кто говорит иначе, может научить нас новому.|Every person deserves respect, and someone who speaks differently can teach us something new.
Q איזה חג חוגגים בדרך כלל בקהילה המוסלמית?|أي عيد يحتفل به المسلمون عادةً؟|Какой праздник обычно отмечает мусульманская община?|Which holiday does the Muslim community usually celebrate?|e_eid|e_hanu,purim,e_xmas
Y עיד אל־פיטר נחגג בסוף חודש הרמדאן, חודש הצום של המוסלמים.|عيد الفطر يأتي في نهاية شهر رمضان، شهر الصيام عند المسلمين.|Ид аль-Фитр празднуют в конце Рамадана, месяца поста у мусульман.|Eid al-Fitr is celebrated at the end of Ramadan, the Muslim month of fasting.
Q איזה חג חוגגים בדרך כלל בקהילה הנוצרית?|أي عيد يحتفل به المسيحيون عادةً؟|Какой праздник обычно отмечает христианская община?|Which holiday does the Christian community usually celebrate?|e_xmas|e_eid,purim,e_hanu
Y בחג המולד נוצרים חוגגים את הולדתו של ישו.|في عيد الميلاد يحتفل المسيحيون بميلاد يسوع المسيح.|В Рождество христиане празднуют рождение Иисуса.|At Christmas, Christians celebrate the birth of Jesus.
Q איזה חג חוגגים בדרך כלל בקהילה היהודית?|أي عيد يحتفل به اليهود عادةً؟|Какой праздник обычно отмечает еврейская община?|Which holiday does the Jewish community usually celebrate?|e_rosh|e_eid,e_xmas,e_easter
Y ראש השנה פותח את השנה בלוח העברי, ובחג הזה נוהגים לשמוע שופר.|رأس السنة العبرية يفتتح السنة في التقويم العبري، وفي هذا العيد يستمعون عادةً إلى الشوفار (البوق).|Рош а-Шана открывает год по еврейскому календарю, и в этот праздник принято слушать шофар.|Rosh Hashanah starts the year in the Hebrew calendar, and on this holiday people listen to the shofar.
Q מה אפשר ללמוד כשאנחנו שונים זה מזה?|ماذا يمكننا أن نتعلّم عندما نكون مختلفين؟|Чему мы можем научиться, когда мы разные?|What can we learn when we are different from each other?|e_newthings|e_nothing2,e_samefood,e_samehol
Y לכל קהילה יש אוכל, חגים ושפה משלה, וכך כל אחד יכול ללמוד מהשני.|لكل مجتمع طعامه وأعياده ولغته، وهكذا يستطيع كل واحد أن يتعلّم من الآخر.|У каждой общины своя еда, праздники и язык, и так каждый может учиться у другого.|Each community has its own food, holidays and language, so everyone can learn from each other.
E e_newthings|t|דברים חדשים, כמו אוכל, חגים ושפות|أشياء جديدة، مثل الطعام والأعياد واللغات|новому: еде, праздникам и языкам|new things, like food, holidays and languages
E e_nothing2|t|שום דבר, כי כולנו יודעים את אותם דברים|لا شيء، لأنّنا جميعًا نعرف الأشياء نفسها|ничему, ведь мы все знаем одно и то же|nothing at all, because we all know the same things
E e_hate|t|לריב יותר|أن نتشاجر أكثر|ссориться больше|to quarrel more
E e_mean|t|להציק|أن نزعج الآخرين|обижать|to bother others
E xv_groups|t|יהודים, ערבים, דרוזים, בדואים, צ׳רקסים ועוד|يهود وعرب ودروز وبدو وشركس وغيرهم|евреи, арабы, друзы, бедуины, черкесы и другие|Jews, Arabs, Druze, Bedouins, Circassians and others
E xv_jewsonly|t|רק יהודים, ואף קבוצה אחרת|يهود فقط، ولا أي مجموعة أخرى|только евреи, и больше никто|only Jews, and no other group
E xv_arabsonly|t|רק ערבים ודרוזים, ואף קבוצה אחרת|عرب ودروز فقط، ولا أي مجموعة أخرى|только арабы и друзы, и больше никто|only Arabs and Druze, and no other group
E xv_touronly|t|רק תיירים שבאו לחופשה קצרה|سيّاح فقط جاؤوا لعطلة قصيرة|только туристы, приехавшие ненадолго|only tourists on a short holiday
Q מי גר בישראל?|من يسكن في إسرائيل؟|Кто живёт в Израиле?|Who lives in Israel?|xv_groups|xv_jewsonly,xv_arabsonly,xv_touronly
Y בישראל חיות יחד הרבה קהילות שונות, וכולן חלק מהמדינה.|في إسرائيل تعيش معًا مجتمعات كثيرة ومختلفة، وكلها جزء من الدولة.|В Израиле вместе живут много разных общин, и все они часть страны.|Many different communities live together in Israel, and all of them are part of the country.
E xv_manyc|t|מהרבה מדינות, כמו אתיופיה, רוסיה ומרוקו|من دول كثيرة، مثل إثيوبيا وروسيا والمغرب|из многих стран, например из Эфиопии, России и Марокко|from many countries, like Ethiopia, Russia and Morocco
E xv_onlyeth|t|רק מאתיופיה, ולא מאף מקום אחר|من إثيوبيا فقط، ولا من أي مكان آخر|только из Эфиопии, и ни из какого другого места|only from Ethiopia, and from no other place
E xv_onlyrus|t|רק מרוסיה, ולא ממקום אחר|من روسيا فقط، ولا من مكان آخر|только из России, и ниоткуда больше|only from Russia, and from nowhere else
E xv_nobodyc|t|אף אחד לא הגיע ממדינה אחרת|لم يأتِ أحد من دولة أخرى|никто не приехал из другой страны|nobody came from another country
Q מאיפה הגיעו אנשים שגרים היום בישראל?|من أين جاء الناس الذين يسكنون اليوم في إسرائيل؟|Откуда приехали люди, которые живут сегодня в Израиле?|Where did people who live in Israel today come from?|xv_manyc|xv_onlyeth,xv_onlyrus,xv_nobodyc
Y במשך השנים עלו לישראל אנשים מכל העולם, ולכן יש כאן מנהגים רבים.|على مرّ السنين جاء إلى إسرائيل أناس من كل العالم، لذلك هنا عادات كثيرة.|За многие годы в Израиль приехали люди со всего мира, поэтому здесь много обычаев.|Over the years people came to Israel from all over the world, so there are many customs here.
E xv_welcome|t|מקבלים אותו ולומדים ממנו מילים|نستقبله ونتعلّم منه كلمات|принимаем его и учим у него слова|we welcome him and learn words from him
E xv_mockacc|t|צוחקים על המבטא שלו|نضحك على لهجته|смеёмся над его акцентом|we laugh at his accent
E xv_noplay|t|לא משחקים איתו בהפסקה|لا نلعب معه في الاستراحة|не играем с ним на перемене|we do not play with him at recess
E xv_moveclass|t|מבקשים שיעבור לכיתה אחרת|نطلب أن ينتقل إلى صف آخر|просим перевести его в другой класс|we ask for him to move to another class
Q ילד חדש בכיתה מדבר אמהרית. מה עושים?|ولد جديد في الصف يتكلّم الأمهرية. ماذا نفعل؟|Новый мальчик в классе говорит по-амхарски. Что делать?|A new boy in class speaks Amharic. What do we do?|xv_welcome|xv_mockacc,xv_noplay,xv_moveclass
Y ילד חדש צריך חברים, ומילים בשפה שלו הן דרך טובה להתקרב אליו.|الولد الجديد يحتاج إلى أصدقاء، وكلمات بلغته طريقة جيدة للتقرّب منه.|Новому ребёнку нужны друзья, а слова на его языке - хороший способ подружиться.|A new child needs friends, and words in their language are a good way to get close.
E xv_amharic|t|אמהרית|الأمهرية|амхарский|Amharic
E xv_japanese|t|יפנית|اليابانية|японский|Japanese
E xv_swedish|t|שוודית|السويدية|шведский|Swedish
E xv_portug|t|פורטוגזית|البرتغالية|португальский|Portuguese
Q איזו שפה מדברים בישראל הרבה עולים מאתיופיה?|أيّ لغة يتكلّمها في إسرائيل كثير من القادمين من إثيوبيا؟|На каком языке говорят в Израиле многие репатрианты из Эфиопии?|Which language do many immigrants from Ethiopia speak in Israel?|xv_amharic|xv_japanese,xv_swedish,xv_portug
Y אמהרית היא שפה נפוצה באתיופיה, ולכן עולים רבים משם מדברים בה.|الأمهرية لغة منتشرة في إثيوبيا، لذلك يتحدّث بها كثير من القادمين من هناك.|Амхарский - один из главных языков Эфиопии, поэтому многие репатрианты оттуда говорят на нём.|Amharic is a main language of Ethiopia, so many immigrants from there speak it.
S env|🌳|#278539|שומרים על הסביבה|نحافظ على البيئة|бережём окружающую среду|Taking Care of Nature
L הארץ שלנו יפה, ואנחנו צריכים לשמור עליה: על הים, על הגינות ועל היערות.|بلدنا جميل، وعلينا أن نحافظ عليه: على البحر والحدائق والغابات.|Наша страна красива, и мы должны её беречь: море, парки и леса.|Our country is beautiful, and we need to take care of it: the sea, the parks and the forests.
L לא זורקים זבל על הרצפה, בחוף או בטבע. זורקים לפח.|لا نرمي القمامة على الأرض أو على الشاطئ أو في الطبيعة. نرميها في الحاوية.|Мы не бросаем мусор на землю, на пляже или в природе. Мы бросаем его в контейнер.|We do not throw trash on the ground, on the beach or in nature. We put it in a bin.
L מיחזור: בקבוקי פלסטיק ואריזות זורקים לפח הכתום. נייר וקרטון זורקים לפח הכחול.|إعادة التدوير: نرمي زجاجات البلاستيك والعبوات في الحاوية البرتقالية. والورق والكرتون في الحاوية الزرقاء.|Переработка: пластиковые бутылки и упаковки бросаем в оранжевый контейнер. Бумагу и картон - в синий.|Recycling: plastic bottles and packaging go in the orange bin. Paper and cardboard go in the blue bin.
L מים הם דבר יקר, במיוחד בארץ שלנו. סוגרים את הברז כשלא צריך.|الماء ثمين، خصوصًا في بلدنا. نغلق الصنبور عندما لا نحتاجه.|Вода очень ценна, особенно в нашей стране. Закрываем кран, когда вода не нужна.|Water is precious, especially in our country. We close the tap when we do not need it.
L בט״ו בשבט, ראש השנה לאילנות, נוטעים עצים. עצים נותנים צל ואוויר נקי.|في عيد الأشجار نزرع الأشجار. الأشجار تعطي الظلّ وهواءً نظيفًا.|В Ту би-Шват, Новый год деревьев, сажают деревья. Деревья дают тень и чистый воздух.|On Tu BiShvat, the New Year of the Trees, we plant trees. Trees give shade and clean air.
L אפשר לשמור על הסביבה גם בבית: לכבות אור, לא לבזבז אוכל ולהשתמש שוב בדברים.|يمكننا الحفاظ على البيئة في البيت أيضًا: نطفئ الضوء، ولا نهدر الطعام، ونعيد استخدام الأشياء.|Беречь природу можно и дома: выключать свет, не выбрасывать еду и использовать вещи повторно.|We can take care of nature at home too: turn off lights, not waste food and reuse things.
Q לאיזה פח זורקים בקבוק פלסטיק?|في أي حاوية نرمي زجاجة البلاستيك؟|В какой контейнер бросают пластиковую бутылку?|Which bin do we put a plastic bottle in?|binO|binB,binG,binK
Y בפח הכתום אוספים אריזות ובקבוקי פלסטיק, כדי להפוך אותם לדברים חדשים.|في الحاوية البرتقالية نجمع العبوات وزجاجات البلاستيك، لكي نحوّلها إلى أشياء جديدة.|В оранжевый контейнер собирают упаковки и пластиковые бутылки, чтобы сделать из них новые вещи.|The orange bin collects packaging and plastic bottles so they can be made into new things.
Q לאיזה פח זורקים נייר וקרטון?|في أي حاوية نرمي الورق والكرتون؟|В какой контейнер бросают бумагу и картон?|Which bin do we put paper and cardboard in?|binB|binO,binG,binK
Y הפח הכחול אוסף נייר וקרטון, ומהם מייצרים נייר חדש.|الحاوية الزرقاء تجمع الورق والكرتون، ومنهما يُصنع ورق جديد.|Синий контейнер собирает бумагу и картон, и из них делают новую бумагу.|The blue bin collects paper and cardboard, and new paper is made from them.
Q מה עושים כשלא צריך מים?|ماذا نفعل عندما لا نحتاج الماء؟|Что делают, когда вода не нужна?|What do we do when we do not need water?|e_closetap|e_leavetap,e_wasteall,e_hidew
Y ברז פתוח מבזבז מים, ומים הם דבר יקר בארץ שלנו.|الصنبور المفتوح يهدر الماء، والماء ثمين في بلدنا.|Открытый кран тратит воду зря, а вода в нашей стране очень ценна.|An open tap wastes water, and water is precious in our country.
Q מה עושים בט״ו בשבט?|ماذا نفعل في عيد الأشجار؟|Что делают в Ту би-Шват?|What do we do on Tu BiShvat?|tree|water,e_tubicut,e_tubipick
Y ט״ו בשבט הוא ראש השנה לאילנות, ולכן בחג הזה נוהגים לנטוע עצים.|عيد الأشجار هو رأس السنة للأشجار، لذلك من العادة في هذا العيد أن نزرع الأشجار.|Ту би-Шват - Новый год деревьев, поэтому в этот праздник принято сажать деревья.|Tu BiShvat is the New Year of the Trees, so on this holiday people plant trees.
Q איפה זורקים זבל?|أين نرمي القمامة؟|Куда бросают мусор?|Where do we throw trash?|e_inbin|e_ongr,e_inbeach,e_innature
Y זבל בטבע פוגע בבעלי חיים ובמים, ובפח הוא לא מזיק לאף אחד.|القمامة في الطبيعة تؤذي الحيوانات والمياه، وفي الحاوية لا تضرّ أحدًا.|Мусор в природе вредит животным и воде, а в контейнере он никому не мешает.|Trash in nature hurts animals and water, but in a bin it harms no one.
Q למה חשוב לחסוך במים?|لماذا من المهم توفير الماء؟|Почему важно экономить воду?|Why is it important to save water?|e_precious|e_waterrain,e_watersalt,e_waterpool
Y בארץ שלנו יורד מעט גשם, ולכן כל טיפת מים חשובה.|في بلدنا ينزل مطر قليل، لذلك كل قطرة ماء مهمة.|В нашей стране мало дождей, поэтому важна каждая капля воды.|Little rain falls in our country, so every drop of water matters.
E e_closetap|t|סוגרים את הברז|نغلق الصنبور|закрываем кран|we close the tap
E e_leavetap|t|משאירים את הברז פתוח|نترك الصنبور مفتوحًا|оставляем кран открытым|we leave the tap open
E e_wasteall|t|שופכים מים על הרצפה|نسكب الماء على الأرض|выливаем воду на пол|we pour water on the floor
E e_hidew|t|מסתירים את המים|نخفي الماء|прячем воду|we hide the water
E e_inbin|t|בפח, גם אם צריך ללכת קצת עד אליו|في الحاوية، حتى لو كان علينا أن نمشي قليلًا إليها|в контейнер, даже если до него надо пройти|in a bin, even if we have to walk a bit to reach it
E e_ongr|t|על הרצפה, כי מישהו ינקה את זה אחר כך|على الأرض، لأنّ أحدًا سينظّفها لاحقًا|на землю, ведь кто-нибудь потом уберёт|on the ground, because someone will clean it up later
E e_inbeach|t|בחול בחוף, כי הגלים ייקחו את זה לים|في رمل الشاطئ، لأنّ الأمواج ستأخذها إلى البحر|в песок на пляже, ведь волны унесут его в море|in the sand at the beach, because the waves will take it to the sea
E e_innature|t|בטבע, ביער, כי שם זה לא מפריע לאף אחד|في الطبيعة، في الغابة، لأنّها هناك لا تزعج أحدًا|в природу, в лес, ведь там он никому не мешает|in nature, in the forest, because it bothers nobody there
E e_precious|t|כי מים הם דבר יקר|لأن الماء ثمين|потому что вода очень ценна|because water is precious
E xv_shade|t|צל ואוויר נקי|ظلًّا وهواءً نقيًّا|тень и чистый воздух|shade and clean air
E xv_saltw|t|מים מלוחים|ماءً مالحًا|солёную воду|salty water
E xv_noise|t|רעש חזק|ضجيجًا قويًّا|сильный шум|loud noise
E xv_electric|t|חשמל לבית|كهرباء للبيت|электричество для дома|electricity for the house
Q מה העצים נותנים לנו?|ماذا تعطينا الأشجار؟|Что нам дают деревья?|What do trees give us?|xv_shade|xv_saltw,xv_noise,xv_electric
Y העלים של העץ מסתירים את השמש ומנקים את האוויר שאנחנו נושמים.|أوراق الشجرة تحجب الشمس وتنظّف الهواء الذي نتنفّسه.|Листья дерева закрывают от солнца и очищают воздух, которым мы дышим.|A tree's leaves block the sun and clean the air we breathe.
E xv_lightoff|t|מכבים את האור כשיוצאים מהחדר|نطفئ الضوء عندما نخرج من الغرفة|выключаем свет, когда выходим из комнаты|we turn off the light when we leave the room
E xv_tvon|t|משאירים את הטלוויזיה דולקת כל היום|نترك التلفاز يعمل طوال اليوم|оставляем телевизор включённым весь день|we leave the TV on all day
E xv_wastefood|t|זורקים את כל האוכל שנשאר|نرمي كل الطعام الذي بقي|выбрасываем всю оставшуюся еду|we throw away all the leftover food
E xv_fridge|t|פותחים את המקרר שוב ושוב|نفتح الثلاجة مرة بعد مرة|открываем холодильник снова и снова|we open the fridge again and again
Q איך שומרים על הסביבה גם בבית?|كيف نحافظ على البيئة في البيت أيضًا؟|Как беречь природу и дома?|How do we take care of the environment at home too?|xv_lightoff|xv_tvon,xv_wastefood,xv_fridge
Y אור דולק בחדר ריק מבזבז חשמל, וחיסכון בחשמל שומר על הסביבה.|الضوء المضاء في غرفة فارغة يهدر الكهرباء، والتوفير في الكهرباء يحمي البيئة.|Свет в пустой комнате тратит электричество зря, а экономия электричества бережёт природу.|A light on in an empty room wastes power, and saving power protects nature.
E xv_reuse|t|משתמשים בה שוב, למשל לצעצועים|نستعمله من جديد، مثلًا للألعاب|используем её снова, например для игрушек|we use it again, for example for toys
E xv_street|t|זורקים אותה ברחוב|نرميه في الشارع|выбрасываем её на улице|we throw it in the street
E xv_burn|t|שורפים אותה במדורה|نحرقه في النار|сжигаем её в костре|we burn it in a bonfire
E xv_bury|t|קוברים אותה בחול בחוף|ندفنه في الرمل على شاطئ البحر|закапываем её в песок на пляже|we bury it in the sand on the beach
Q נשארה קופסה ריקה וחזקה. מה כדאי לעשות?|بقي صندوق فارغ ومتين. ماذا يُستحسن أن نفعل؟|Осталась пустая крепкая коробка. Что лучше сделать?|There is a strong empty box left. What is best to do?|xv_reuse|xv_street,xv_burn,xv_bury
Y כשמשתמשים שוב בקופסה, היא לא הופכת לזבל ולא צריך לייצר חדשה.|عندما نعيد استخدام العلبة، لا تصبح قمامة ولا نحتاج إلى صنع علبة جديدة.|Если использовать коробку снова, она не станет мусором, и не нужно делать новую.|When we reuse a box, it does not become trash and a new one does not need to be made.
E xv_allnature|t|על הים, על הגינות ועל היערות|على البحر والحدائق والغابات|о море, о садах и о лесах|the sea, the gardens and the forests
E xv_onlyhome|t|רק על הבית שלנו|على بيتنا فقط|только о нашем доме|only our own home
E xv_onlymall|t|רק על הקניונים והחנויות|على المجمّعات التجارية والمحلّات فقط|только о торговых центрах и магазинах|only the malls and the shops
E xv_onlycars|t|רק על המכוניות שלנו|على سياراتنا فقط|только о наших машинах|only our cars
Q על מה צריך לשמור בארץ שלנו?|على ماذا يجب أن نحافظ في بلادنا؟|О чём нужно заботиться в нашей стране?|What should we take care of in our country?|xv_allnature|xv_onlyhome,xv_onlymall,xv_onlycars
Y הטבע שייך לכולנו, ולכן צריך לשמור על כל המקומות שלו, ולא רק על הבית.|الطبيعة لنا جميعًا، لذلك علينا أن نحافظ على كل أماكنها، وليس على البيت فقط.|Природа принадлежит всем нам, поэтому нужно беречь все её места, а не только дом.|Nature belongs to all of us, so we need to protect all of it, not just our home.
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
Y באור ירוק המכוניות עוצרות, ובדיקה לשני הצדדים מוודאת שבאמת עצרו.|في الضوء الأخضر تتوقّف السيارات، والنظر إلى الجانبين يؤكّد أنها توقّفت فعلًا.|При зелёном свете машины останавливаются, а взгляд в обе стороны проверяет, что они правда стоят.|At a green light cars stop, and looking both ways makes sure they really stopped.
Q מה עושים בכל נסיעה ברכב?|ماذا نفعل في كل رحلة بالسيارة؟|Что делают в каждой поездке на машине?|What do we do in every car ride?|e_belt|e_carstand,e_carhead,e_carnoseat
Y חגורה מחזיקה את הגוף במקום, ושומרת עלינו אם הרכב עוצר פתאום.|الحزام يُثبّت الجسم في مكانه، ويحمينا إذا توقّفت السيارة فجأة.|Ремень держит тело на месте и защищает нас, если машина резко остановится.|A seat belt holds the body in place and protects us if the car stops suddenly.
Q לאיזה מספר מתקשרים כדי להזעיק משטרה?|بأي رقم نتّصل لاستدعاء الشرطة؟|По какому номеру звонят, чтобы вызвать полицию?|Which number do we call for the police?|n100|n101,n102,n104
Y מספרי החירום מתחילים ב־100, והראשון שבהם שייך למשטרה.|أرقام الطوارئ تبدأ من 100، وأوّلها للشرطة.|Номера экстренных служб начинаются со 100, и первый из них - полиция.|Emergency numbers start at 100, and the first one is for the police.
Q לאיזה מספר מתקשרים כדי להזעיק מגן דוד אדום?|بأي رقم نتّصل لاستدعاء نجمة داود الحمراء؟|По какому номеру звонят, чтобы вызвать «Маген Давид Адом»?|Which number do we call for Magen David Adom?|n101|n100,n102,n104
Y אחרי המשטרה ב־100 בא מגן דוד אדום, ולכן המספר שלו הוא 101.|بعد الشرطة 100 تأتي نجمة داود الحمراء، لذلك رقمها 101.|После полиции, 100, идёт «Маген Давид Адом», поэтому его номер 101.|After the police at 100 comes Magen David Adom, so its number is 101.
Q לאיזה מספר מתקשרים כדי להזעיק כבאות והצלה?|بأي رقم نتّصل لاستدعاء الإطفاء والإنقاذ؟|По какому номеру звонят, чтобы вызвать пожарную службу?|Which number do we call for fire and rescue?|n102|n100,n101,n104
Y המספרים הולכים לפי הסדר: משטרה 100, מגן דוד אדום 101, ואז כבאות והצלה 102.|الأرقام بالترتيب: الشرطة 100، نجمة داود الحمراء 101، ثم الإطفاء والإنقاذ 102.|Номера идут по порядку: полиция 100, «Маген Давид Адом» 101, затем пожарная служба 102.|The numbers go in order: police 100, Magen David Adom 101, then fire and rescue 102.
Q מי מכבה אש?|من يطفئ النار؟|Кто тушит огонь?|Who puts out fires?|fireman|medic,police,mayor
Y הכבאי יודע לכבות אש, ויש לו מים, צינורות וציוד מיוחד.|رجل الإطفاء يعرف كيف يطفئ النار، ولديه ماء وخراطيم ومعدّات خاصة.|Пожарный умеет тушить огонь, и у него есть вода, шланги и особое снаряжение.|A firefighter knows how to put out fires and has water, hoses and special gear.
Q מי עוזר כשמישהו חולה או נפצע?|من يساعد عندما يمرض أحد أو يُصاب؟|Кто помогает, когда кто-то заболел или ранен?|Who helps when someone is sick or hurt?|medic|fireman,police,teacher
Y חובש למד לתת עזרה ראשונה, ולכן הוא יודע לטפל במי שנפצע.|المسعف تعلّم الإسعاف الأولي، لذلك يعرف كيف يعالج المصاب.|Фельдшер учился оказывать первую помощь, поэтому умеет помогать раненым.|A paramedic has learned first aid, so they know how to care for someone who is hurt.
Q מה עושים כשנשמעת אזעקה?|ماذا نفعل عندما تُسمع صفّارة الإنذار؟|Что делают, когда звучит сигнал тревоги?|What do we do when an alarm sounds?|e_shelter|e_window,e_ignoreSiren,e_alarmcall
Y מקום מוגן בנוי מקירות חזקים, ולכן הוא שומר עלינו בזמן אזעקה.|المكان المحمي مبني من جدران قوية، لذلك يحمينا وقت صفّارة الإنذار.|Защищённое место построено из прочных стен, поэтому оно бережёт нас, когда звучит сирена.|A protected room has strong walls, so it keeps us safe during an alarm.
E xv_waitred|t|עומדים ומחכים לאור ירוק|نقف وننتظر الضوء الأخضر|стоим и ждём зелёного света|we stand and wait for the green light
E xv_runfast|t|רצים מהר לצד השני|نركض بسرعة إلى الجهة الأخرى|быстро бежим на другую сторону|we run fast to the other side
E xv_crosscare|t|עוברים לאט ובזהירות|نعبر ببطء وبحذر|переходим медленно и осторожно|we cross slowly and carefully
E xv_nocars|t|עוברים אם לא רואים מכוניות|نعبر إذا لم نرَ سيارات|переходим, если не видно машин|we cross if we do not see any cars
Q הרמזור להולכי רגל אדום. מה עושים?|إشارة المشاة حمراء. ماذا نفعل؟|На светофоре для пешеходов красный свет. Что делать?|The pedestrian light is red. What do we do?|xv_waitred|xv_runfast,xv_crosscare,xv_nocars
Y באור אדום המכוניות נוסעות, וגם מכונית שלא רואים יכולה להגיע מהר.|في الضوء الأحمر تسير السيارات، وحتى سيارة لا نراها قد تصل بسرعة.|На красный свет машины едут, и даже машина, которую не видно, может быстро подъехать.|At a red light cars are moving, and even a car you cannot see can arrive fast.
E xv_beltalways|t|כן, חוגרים בכל נסיעה|نعم، نربط الحزام في كل رحلة|да, пристёгиваемся в любой поездке|yes, we buckle up on every ride
E xv_beltlong|t|לא, רק בנסיעה ארוכה|لا، فقط في رحلة طويلة|нет, только в долгой поездке|no, only on a long ride
E xv_beltfront|t|רק מי שיושב מקדימה|فقط من يجلس في المقعد الأمامي|только тот, кто сидит впереди|only whoever sits in front
E xv_beltrain|t|רק כשיורד גשם|فقط عندما تمطر|только когда идёт дождь|only when it rains
Q נוסעים ברכב רק לחנות ליד הבית. חוגרים חגורה?|نسافر بالسيارة فقط إلى المتجر قرب البيت. هل نربط الحزام؟|Едем на машине только до магазина рядом с домом. Пристёгиваемся?|We drive only to the shop near home. Do we buckle up?|xv_beltalways|xv_beltlong,xv_beltfront,xv_beltrain
Y תאונה יכולה לקרות גם קרוב לבית, ולכן החגורה חשובה בכל נסיעה.|الحادث قد يقع قريبًا من البيت أيضًا، لذلك الحزام مهم في كل رحلة.|Авария может случиться и рядом с домом, поэтому ремень важен в каждой поездке.|An accident can happen close to home too, so the seat belt matters on every ride.
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
