# mk-reference.py — קובץ הייחוס של גלילאו, מ-Swiss Ephemeris (pyswisseph, Moshier).
#   <venv>/bin/python .claude/qa/rakia/mk-reference.py > .claude/qa/rakia/reference.json
# רץ פעם אחת; הפלט נשמר בריפו כדי ש-galileo.js ירוץ בלי פייתון ובלי רשת.
import json, random, swisseph as swe
FL = swe.FLG_MOSEPH | swe.FLG_SPEED
BODIES = [("sun", swe.SUN), ("moon", swe.MOON), ("mercury", swe.MERCURY), ("venus", swe.VENUS), ("mars", swe.MARS),
          ("jupiter", swe.JUPITER), ("saturn", swe.SATURN), ("uranus", swe.URANUS), ("neptune", swe.NEPTUNE),
          ("pluto", swe.PLUTO), ("meanNode", swe.MEAN_NODE), ("trueNode", swe.TRUE_NODE)]
PLACES = [("Tel Aviv", 32.0853, 34.7818), ("Jerusalem", 31.7683, 35.2137), ("New York", 40.7128, -74.0060),
          ("Moscow", 55.7558, 37.6173), ("Buenos Aires", -34.6037, -58.3816), ("Reykjavik", 64.1466, -21.9426)]
random.seed(20260918)
cases = []
def add(tag, y, m, d, ut, place):
    jd = swe.julday(y, m, d, ut)
    row = {"tag": tag, "y": y, "m": m, "d": d, "ut": ut, "jd": jd, "place": place[0], "lat": place[1], "lon": place[2], "bodies": {}}
    for name, b in BODIES:
        x, _ = swe.calc_ut(jd, b, FL)
        row["bodies"][name] = {"lon": x[0], "lat": x[1], "speed": x[3]}
    cusps, ascmc = swe.houses(jd, place[1], place[2], b'P')
    row["placidus"] = list(cusps); row["asc"] = ascmc[0]; row["mc"] = ascmc[1]
    cw, aw = swe.houses(jd, place[1], place[2], b'W'); row["whole"] = list(cw)
    row["deltaT"] = swe.deltat(jd) * 86400
    cases.append(row)
# שלוש מפות הבדיקה (שעה מקומית → UT ידוע): 1 תל אביב 1.7.1990 12:00 שעון קיץ = 09:00 UT
add("test1-telaviv", 1990, 7, 1, 9.0, PLACES[0])
# 2 ירושלים 22.11.1965 06:30 חורף = 04:30 UT
add("test2-jerusalem", 1965, 11, 22, 4.5, PLACES[1])
# 3 ניו יורק 14.3.2010 23:45 EDT (שעון קיץ נכנס באותו יום) = 03:45 UT ב-15.3
add("test3-newyork", 2010, 3, 15, 3.75, PLACES[2])
# רשת 1900–2100: כל 4 שנים, יום ושעה אקראיים, מקום מחזורי
for i, y in enumerate(range(1900, 2101, 4)):
    m = random.randint(1, 12); d = random.randint(1, 28); ut = round(random.random() * 24, 3)
    add("grid", y, m, d, ut, PLACES[i % len(PLACES)])
# O-3: פלוטו אחרי 2099
for y in (2100, 2110, 2125, 2150):
    add("pluto-late", y, 6, 15, 12.0, PLACES[0])
# לפני 1885
for y in (1850, 1870):
    add("pluto-early", y, 6, 15, 12.0, PLACES[1])
print(json.dumps({"source": "pyswisseph " + swe.version + " (Moshier), flags MOSEPH|SPEED, houses P/W", "cases": cases}, indent=0))
