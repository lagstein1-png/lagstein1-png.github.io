/* =====================================================================
   רקיע — המנוע האסטרונומי. Vanilla JS, אפס תלות, קובץ אחד.

   מה הוא מחשב, ומאיפה:
   · זמן: JD מ-UT; ΔT לפי הפולינומים של Espenak & Meeus (NASA);
     זמן כוכבים לפי Meeus 12.4; נטיית המילקה לפי Meeus 22.2;
     נוטציה לפי טבלה 22.A (IAU 1980) — הטבלה ב-ephem-data.js.
   · פלנטות: VSOP87D מקוצר (הליוצנטרי, מילקת התאריך), ואז
     גיאוצנטרי עם תיקון זמן־אור (Meeus 33), אברציה (23.2)
     ונוטציה — כלומר מקום נראה, כמו ב-Swiss Ephemeris.
   · שמש: מהמקום ההליוצנטרי של כדור הארץ (Meeus 25).
   · ירח: Meeus 47 (טבלאות 47.A/47.B), ועוד נוטציה.
   · פלוטו: Meeus 37 (תוקף 1885–2099), מקדים ל-J2000 → תאריך
     (Meeus 21.7). מחוץ לתוקף — `lowPrecision`, וראו O-3.
   · ראש הדרקון: ממוצע (47.7) ואמיתי (התיקון בעמ׳ 343).
   · בתים: Placidus (איטרטיבי), Whole Sign, Equal. Placidus אינו
     מוגדר מעל 66° רוחב — אז נופלים ל-Whole Sign ומדווחים.
   · המרה מקומי→UT: Intl.DateTimeFormat עם אזור הזמן של המקום,
     ובדיקה עצמית (selfTest) — O-2.

   כל מספר שהמנוע מחזיר נמדד ב-.claude/qa/galileo.js מול
   Swiss Ephemeris. אין כאן טענת דיוק שלא נמדדה שם.
   ===================================================================== */
var ASTRO = (function () {
  "use strict";
  var D2R = Math.PI / 180, R2D = 180 / Math.PI;
  var J2000 = 2451545.0;
  function norm(d) { d = d % 360; return d < 0 ? d + 360 : d; }
  function norm180(d) { d = norm(d); return d > 180 ? d - 360 : d; }
  function horner(t, c) { var r = 0; for (var i = c.length - 1; i >= 0; i--) r = r * t + c[i]; return r; }

  /* ---------- זמן ---------- */
  /* לוח גרגוריאני, UT בשעות עשרוניות. Meeus 7.1 */
  function jdUT(y, m, d, hours) {
    if (m <= 2) { y -= 1; m += 12; }
    var A = Math.floor(y / 100), B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + (hours || 0) / 24 + B - 1524.5;
  }
  function jdFromMs(ms) { return ms / 86400000 + 2440587.5; }
  function msFromJd(jd) { return (jd - 2440587.5) * 86400000; }
  /* ΔT בשניות — Espenak & Meeus, NASA Eclipse Web Site (Five Millennium Canon) */
  function deltaT(year) {
    var t, u;
    if (year < 1600) { t = year - 1000; u = t / 100; return horner(u, [1574.2, -556.01, 71.23472, 0.319781, -0.8503463, -0.005050998, 0.0083572073]); }
    if (year < 1700) { t = year - 1600; return 120 - 0.9808 * t - 0.01532 * t * t + t * t * t / 7129; }
    if (year < 1800) { t = year - 1700; return 8.83 + 0.1603 * t - 0.0059285 * t * t + 0.00013336 * t * t * t - Math.pow(t, 4) / 1174000; }
    if (year < 1860) { t = year - 1800; return horner(t, [13.72, -0.332447, 0.0068612, 0.0041116, -0.00037436, 0.0000121272, -0.0000001699, 0.000000000875]); }
    if (year < 1900) { t = year - 1860; return horner(t, [7.62, 0.5737, -0.251754, 0.01680668, -0.0004473624, 1 / 233174]); }
    if (year < 1920) { t = year - 1900; return horner(t, [-2.79, 1.494119, -0.0598939, 0.0061966, -0.000197]); }
    if (year < 1941) { t = year - 1920; return horner(t, [21.20, 0.84493, -0.076100, 0.0020936]); }
    if (year < 1961) { t = year - 1950; return 29.07 + 0.407 * t - t * t / 233 + t * t * t / 2547; }
    if (year < 1986) { t = year - 1975; return 45.45 + 1.067 * t - t * t / 260 - t * t * t / 718; }
    if (year < 2005) { t = year - 2000; return horner(t, [63.86, 0.3345, -0.060374, 0.0017275, 0.000651814, 0.00002373599]); }
    if (year < 2050) { t = year - 2000; return 62.92 + 0.32217 * t + 0.005589 * t * t; }
    if (year < 2150) { u = (year - 1820) / 100; return -20 + 32 * u * u - 0.5628 * (2150 - year); }
    u = (year - 1820) / 100; return -20 + 32 * u * u;
  }
  function yearOfJd(jd) { return 2000 + (jd - J2000) / 365.25; }
  /* dt (שניות) — דריסה של ΔT; גלילאו משתמש בה כדי למדוד את האפמריס בנפרד ממדיניות ΔT */
  function jdeOf(jdUt, dt) { return jdUt + (dt == null ? deltaT(yearOfJd(jdUt)) : dt) / 86400; }

  /* ---------- נוטציה ונטייה ---------- */
  function nutation(jde) {
    var T = (jde - J2000) / 36525;
    var D = horner(T, [297.85036, 445267.11148, -0.0019142, 1 / 189474]) * D2R;
    var M = horner(T, [357.52772, 35999.050340, -0.0001603, -1 / 300000]) * D2R;
    var N = horner(T, [134.96298, 477198.867398, 0.0086972, 1 / 56250]) * D2R;
    var F = horner(T, [93.27191, 483202.017538, -0.0036825, 1 / 327270]) * D2R;
    var O = horner(T, [125.04452, -1934.136261, 0.0020708, 1 / 450000]) * D2R;
    var dp = 0, de = 0, tab = EPHEM.nut;
    for (var i = tab.length - 1; i >= 0; i--) {
      var r = tab[i], a = r[0] * D + r[1] * M + r[2] * N + r[3] * F + r[4] * O;
      dp += Math.sin(a) * (r[5] + r[6] * T);
      de += Math.cos(a) * (r[7] + r[8] * T);
    }
    return { dpsi: dp * 0.0001 / 3600, deps: de * 0.0001 / 3600 };   /* מעלות */
  }
  function meanObliquity(jde) {
    var T = (jde - J2000) / 36525;
    return 23 + 26 / 60 + (21.448 - 46.8150 * T - 0.00059 * T * T + 0.001813 * T * T * T) / 3600;
  }
  /* זמן כוכבים בגריניץ׳, מעלות. Meeus 12.4, ואז נראה עם הנוטציה */
  function siderealApparent(jdUt, nut, eps) {
    var T = (jdUt - J2000) / 36525;
    var th = 280.46061837 + 360.98564736629 * (jdUt - J2000) + 0.000387933 * T * T - T * T * T / 38710000;
    return norm(th + nut.dpsi * Math.cos(eps * D2R));
  }

  /* ---------- VSOP87D ---------- */
  function vsop(series, t) {
    var sum = 0, tp = 1;
    for (var k = 0; k < series.length; k++) {
      var s = series[k], acc = 0;
      for (var i = s.length - 1; i >= 0; i--) acc += s[i][0] * Math.cos(s[i][1] + s[i][2] * t);
      sum += acc * tp; tp *= t;
    }
    return sum;
  }
  /* הליוצנטרי: L, B ברדיאנים → מעלות; R ב-AU */
  function helio(planet, jde) {
    var t = (jde - J2000) / 365250, p = EPHEM.vsop[planet];
    return { L: norm(vsop(p.L, t) * R2D), B: vsop(p.B, t) * R2D, R: vsop(p.R, t) };
  }
  function rect(h) {
    var L = h.L * D2R, B = h.B * D2R;
    return [h.R * Math.cos(B) * Math.cos(L), h.R * Math.cos(B) * Math.sin(L), h.R * Math.sin(B)];
  }

  /* ---------- פלוטו, Meeus 37 → מילקת התאריך ---------- */
  function plutoHelioJ2000(jde) {
    var T = (jde - J2000) / 36525;
    var J = 34.35 + 3034.9057 * T, S = 50.08 + 1222.1138 * T, P = 238.96 + 144.96 * T;
    var l = 0, b = 0, r = 0, tab = EPHEM.pluto;
    for (var i = 0; i < tab.length; i++) {
      var q = tab[i], a = (q[0] * J + q[1] * S + q[2] * P) * D2R, sa = Math.sin(a), ca = Math.cos(a);
      l += q[3] * sa + q[4] * ca; b += q[5] * sa + q[6] * ca; r += q[7] * sa + q[8] * ca;
    }
    return { L: norm(l + 238.958116 + 144.96 * T), B: b - 3.908239, R: r + 40.7241346 };
  }
  /* קואורדינטות מילקתיות מ-J2000 למילקת התאריך. Meeus 21.5–21.7 */
  function precessEcl(lon, lat, jde) {
    var t = (jde - J2000) / 36525;
    var eta = (47.0029 * t - 0.03302 * t * t + 0.000060 * t * t * t) / 3600 * D2R;
    var Pi = (174.876384 - (869.8089 * t - 0.03536 * t * t) / 3600) * D2R;
    var p = (5029.0966 * t + 1.11113 * t * t - 0.000006 * t * t * t) / 3600 * D2R;
    var l0 = lon * D2R, b0 = lat * D2R;
    var A = Math.cos(eta) * Math.cos(b0) * Math.sin(Pi - l0) - Math.sin(eta) * Math.sin(b0);
    var Bq = Math.cos(b0) * Math.cos(Pi - l0);
    var C = Math.cos(eta) * Math.sin(b0) + Math.sin(eta) * Math.cos(b0) * Math.sin(Pi - l0);
    return { L: norm((p + Pi - Math.atan2(A, Bq)) * R2D), B: Math.asin(C) * R2D };
  }
  function plutoHelio(jde) {
    var h = plutoHelioJ2000(jde), q = precessEcl(h.L, h.B, jde);
    return { L: q.L, B: q.B, R: h.R };
  }

  /* ---------- גיאוצנטרי נראה ---------- */
  var KAPPA = 20.49552 / 3600;   /* קבוע האברציה, מעלות */
  function sunGeometric(earth) { return { lon: norm(earth.L + 180), lat: -earth.B, R: earth.R }; }
  /* מקום גיאוצנטרי נראה של פלנטה: זמן־אור (Meeus 33.1 בשלוש איטרציות), אברציה (23.2), נוטציה */
  function planetApparent(id, jde, earth, nut) {
    var hfn = id === "pluto" ? plutoHelio : function (j) { return helio(id, j); };
    var E = rect(earth), tau = 0, g, i, x, y, z, dist;
    for (i = 0; i < 3; i++) {
      var P = rect(hfn(jde - tau));
      x = P[0] - E[0]; y = P[1] - E[1]; z = P[2] - E[2];
      dist = Math.sqrt(x * x + y * y + z * z);
      tau = 0.0057755183 * dist;
    }
    var lon = norm(Math.atan2(y, x) * R2D), lat = Math.atan2(z, Math.sqrt(x * x + y * y)) * R2D;
    var ab = aberration(lon, lat, jde, earth);
    return { lon: norm(lon + ab.dl + nut.dpsi), lat: lat + ab.db, dist: dist };
  }
  /* אברציה של פלנטה, Meeus 23.2, במעלות */
  function aberration(lon, lat, jde, earth) {
    var T = (jde - J2000) / 36525;
    var e = 0.016708634 - 0.000042037 * T - 0.0000001267 * T * T;
    var pi = (102.93735 + 1.71946 * T + 0.00046 * T * T) * D2R;
    var sun = sunGeometric(earth).lon * D2R, l = lon * D2R, b = lat * D2R;
    var dl = (-KAPPA * Math.cos(sun - l) + e * KAPPA * Math.cos(pi - l)) / Math.cos(b);
    var db = -KAPPA * Math.sin(b) * (Math.sin(sun - l) - e * Math.sin(pi - l));
    return { dl: dl, db: db };
  }
  function sunApparent(jde, earth, nut) {
    var s = sunGeometric(earth);
    return { lon: norm(s.lon - 20.4898 / 3600 / s.R + nut.dpsi), lat: s.lat, dist: s.R };
  }

  /* ---------- ירח, Meeus 47 ---------- */
  function moonApparent(jde, nut) {
    var T = (jde - J2000) / 36525;
    var Lp = norm(horner(T, [218.3164477, 481267.88123421, -0.0015786, 1 / 538841, -1 / 65194000]));
    var D = norm(horner(T, [297.8501921, 445267.1114034, -0.0018819, 1 / 545868, -1 / 113065000]));
    var M = norm(horner(T, [357.5291092, 35999.0502909, -0.0001536, 1 / 24490000]));
    var Mp = norm(horner(T, [134.9633964, 477198.8675055, 0.0087414, 1 / 69699, -1 / 14712000]));
    var F = norm(horner(T, [93.2720950, 483202.0175233, -0.0036539, -1 / 3526000, 1 / 863310000]));
    var A1 = norm(119.75 + 131.849 * T), A2 = norm(53.09 + 479264.290 * T), A3 = norm(313.45 + 481266.484 * T);
    var E = 1 - 0.002516 * T - 0.0000074 * T * T, E2 = E * E;
    var sl = 0, sr = 0, sb = 0, i, r, a, ef;
    var ta = EPHEM.moon.ta, tb = EPHEM.moon.tb;
    for (i = 0; i < ta.length; i++) {
      r = ta[i]; a = (r[0] * D + r[1] * M + r[2] * Mp + r[3] * F) * D2R;
      ef = Math.abs(r[1]) === 1 ? E : Math.abs(r[1]) === 2 ? E2 : 1;
      sl += r[4] * Math.sin(a) * ef; sr += r[5] * Math.cos(a) * ef;
    }
    for (i = 0; i < tb.length; i++) {
      r = tb[i]; a = (r[0] * D + r[1] * M + r[2] * Mp + r[3] * F) * D2R;
      ef = Math.abs(r[1]) === 1 ? E : Math.abs(r[1]) === 2 ? E2 : 1;
      sb += r[4] * Math.sin(a) * ef;
    }
    sl += 3958 * Math.sin(A1 * D2R) + 1962 * Math.sin((Lp - F) * D2R) + 318 * Math.sin(A2 * D2R);
    sb += -2235 * Math.sin(Lp * D2R) + 382 * Math.sin(A3 * D2R) + 175 * Math.sin((A1 - F) * D2R) +
          175 * Math.sin((A1 + F) * D2R) + 127 * Math.sin((Lp - Mp) * D2R) - 115 * Math.sin((Lp + Mp) * D2R);
    var lon = norm(Lp + sl / 1e6 + nut.dpsi), lat = sb / 1e6, dist = 385000.56 + sr / 1000;
    /* ראש הדרקון הממוצע: Meeus 47.7 */
    var omega = norm(horner(T, [125.0445479, -1934.1362891, 0.0020754, 1 / 467441, -1 / 60616000]));
    return { lon: lon, lat: lat, dist: dist / 149597870.7, meanNode: norm(omega + nut.dpsi), _geo: { lon: norm(Lp + sl / 1e6), lat: lat, r: dist } };
  }
  /* ראש הדרקון האמיתי = הצומת של מסלול הירח הרגעי (האוסקולטורי):
     h = r × v, והצומת העולה הוא ẑ × h. r מהסדרה, v מהפרש סימטרי.
     נוסחת התיקון של Meeus (עמ׳ 343) נוסתה קודם ונמדדה עד 10′ סטייה. */
  function trueNodeOf(jde, nut) {
    var h = 0.02, a = moonApparent(jde - h, nut)._geo, b = moonApparent(jde + h, nut)._geo, c = moonApparent(jde, nut)._geo;
    function xyz(g) { var l = g.lon * D2R, bb = g.lat * D2R; return [g.r * Math.cos(bb) * Math.cos(l), g.r * Math.cos(bb) * Math.sin(l), g.r * Math.sin(bb)]; }
    var r = xyz(c), ra = xyz(a), rb = xyz(b);
    var v = [(rb[0] - ra[0]) / (2 * h), (rb[1] - ra[1]) / (2 * h), (rb[2] - ra[2]) / (2 * h)];
    var hx = r[1] * v[2] - r[2] * v[1], hy = r[2] * v[0] - r[0] * v[2];
    return norm(Math.atan2(hx, -hy) * R2D + nut.dpsi);
  }

  /* ---------- כל הגופים ברגע אחד ---------- */
  var PLANETS = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"];
  var PLUTO_OK = [1885, 2099];   /* תוקף הסדרה של Meeus */
  function positions(jdUt, dt) {
    var jde = jdeOf(jdUt, dt), nut = nutation(jde), earth = helio("earth", jde), out = {}, id, i;
    for (i = 0; i < PLANETS.length; i++) {
      id = PLANETS[i];
      if (id === "sun") out.sun = sunApparent(jde, earth, nut);
      else if (id === "moon") { var mo = moonApparent(jde, nut); out.moon = mo; out.meanNode = { lon: mo.meanNode, lat: 0 }; out.trueNode = { lon: trueNodeOf(jde, nut), lat: 0 }; }
      else out[id] = planetApparent(id, jde, earth, nut);
    }
    var yr = yearOfJd(jdUt);
    out.pluto.lowPrecision = yr < PLUTO_OK[0] || yr > PLUTO_OK[1];
    out._nut = nut; out._eps = meanObliquity(jde) + nut.deps; out._jde = jde;
    return out;
  }
  /* מהירות במעלות ליום, מהפרש סימטרי של 12 שעות; retro = שלילית */
  function withSpeeds(jdUt, dt) {
    var a = positions(jdUt - 0.25, dt), b = positions(jdUt + 0.25, dt), c = positions(jdUt, dt), id;
    var keys = PLANETS.concat(["meanNode", "trueNode"]);
    for (var i = 0; i < keys.length; i++) {
      id = keys[i];
      c[id].speed = norm180(b[id].lon - a[id].lon) / 0.5;
      c[id].retro = c[id].speed < 0;
    }
    return c;
  }

  /* ---------- בתים ---------- */
  function ascMc(lstDeg, latDeg, epsDeg) {
    var th = lstDeg * D2R, phi = latDeg * D2R, eps = epsDeg * D2R;
    var mc = norm(Math.atan2(Math.sin(th), Math.cos(th) * Math.cos(eps)) * R2D);
    var asc = norm(Math.atan2(Math.cos(th), -(Math.sin(th) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps))) * R2D);
    return { asc: asc, mc: mc };
  }
  /* קו אורך מילקתי של נקודה על המילקה לפי עלייה ישרה */
  function eclOfRa(raDeg, epsDeg) {
    var ra = raDeg * D2R, eps = epsDeg * D2R;
    return norm(Math.atan2(Math.sin(ra), Math.cos(ra) * Math.cos(eps)) * R2D);
  }
  function placidus(ramc, latDeg, epsDeg) {
    var phi = latDeg * D2R, eps = epsDeg * D2R;
    function cusp(offset, F, night) {
      var ra = ramc + offset, i;
      for (i = 0; i < 30; i++) {
        /* הנטייה של נקודת המילקה שעלייתה הישרה ra: sin δ = sin ε · sin λ —
           לפי קו האורך, לא לפי העלייה הישרה. הגרסה הראשונה השתמשה ב-ra
           ישירות, וגלילאו מדד עד 2.9° בבתים 2/3/11/12. */
        var lam = eclOfRa(ra, epsDeg) * D2R;
        var D = Math.asin(Math.sin(lam) * Math.sin(eps));
        var x = Math.tan(phi) * Math.tan(D);
        if (x > 1 || x < -1) return null;        /* לא קיים ברוחב הזה */
        var arc = Math.acos(night ? x : -x) * R2D;
        var next = night ? ramc + 180 - arc * F : ramc + arc * F;
        if (Math.abs(norm180(next - ra)) < 1e-7) { ra = next; break; }
        ra = next;
      }
      return eclOfRa(ra, epsDeg);
    }
    var c11 = cusp(30, 1 / 3, false), c12 = cusp(60, 2 / 3, false), c2 = cusp(120, 2 / 3, true), c3 = cusp(150, 1 / 3, true);
    if (c11 === null || c12 === null || c2 === null || c3 === null) return null;
    return { c11: c11, c12: c12, c2: c2, c3: c3 };
  }
  function houses(system, lstDeg, latDeg, epsDeg) {
    var am = ascMc(lstDeg, latDeg, epsDeg), c = new Array(13), i, fallback = null;
    if (system === "placidus") {
      var p = placidus(lstDeg, latDeg, epsDeg);
      if (!p) { fallback = "whole"; system = "whole"; }
      else {
        c[1] = am.asc; c[10] = am.mc; c[11] = p.c11; c[12] = p.c12; c[2] = p.c2; c[3] = p.c3;
        c[4] = norm(c[10] + 180); c[5] = norm(c[11] + 180); c[6] = norm(c[12] + 180);
        c[7] = norm(c[1] + 180); c[8] = norm(c[2] + 180); c[9] = norm(c[3] + 180);
      }
    }
    if (system === "equal") for (i = 1; i <= 12; i++) c[i] = norm(am.asc + 30 * (i - 1));
    if (system === "whole") { var s0 = Math.floor(am.asc / 30) * 30; for (i = 1; i <= 12; i++) c[i] = norm(s0 + 30 * (i - 1)); }
    return { asc: am.asc, mc: am.mc, cusps: c, system: system, fallback: fallback };
  }
  function houseOf(lon, cusps) {
    for (var i = 1; i <= 12; i++) {
      var a = cusps[i], b = cusps[i === 12 ? 1 : i + 1];
      var span = norm(b - a), d = norm(lon - a);
      if (d < span) return i;
    }
    return 12;
  }

  /* ---------- אספקטים ---------- */
  var ASPECTS = [["conjunction", 0, 8], ["opposition", 180, 8], ["trine", 120, 7], ["square", 90, 7], ["sextile", 60, 5]];
  function aspects(bodies, ids) {
    var out = [], i, j, k;
    for (i = 0; i < ids.length; i++) for (j = i + 1; j < ids.length; j++) {
      var a = bodies[ids[i]], b = bodies[ids[j]];
      if (!a || !b) continue;
      var sep = Math.abs(norm180(a.lon - b.lon));
      for (k = 0; k < ASPECTS.length; k++) {
        var orb = ASPECTS[k][2] + ((ids[i] === "sun" || ids[i] === "moon" || ids[j] === "sun" || ids[j] === "moon") ? 1 : 0);
        var diff = Math.abs(sep - ASPECTS[k][1]);
        if (diff <= orb) { out.push({ a: ids[i], b: ids[j], type: ASPECTS[k][0], angle: ASPECTS[k][1], orb: diff }); break; }
      }
    }
    out.sort(function (x, y) { return x.orb - y.orb; });
    return out;
  }

  /* ---------- המפה כולה ---------- */
  /* opts: {jdUt, lat, lon, houseSystem:"placidus"|"whole"|"equal", timeKnown:true} */
  function chart(opts) {
    var pos = withSpeeds(opts.jdUt, opts.deltaT);
    var eps = pos._eps, gst = siderealApparent(opts.jdUt, pos._nut, eps);
    var lst = norm(gst + opts.lon);
    var H = opts.timeKnown === false ? null : houses(opts.houseSystem || "placidus", lst, opts.lat, eps);
    var ids = PLANETS.concat(["trueNode"]), bodies = [], i;
    for (i = 0; i < ids.length; i++) {
      var p = pos[ids[i]];
      bodies.push({ id: ids[i], lon: p.lon, lat: p.lat || 0, speed: p.speed, retro: !!p.retro,
                    sign: Math.floor(p.lon / 30), deg: p.lon % 30,
                    house: H ? houseOf(p.lon, H.cusps) : 0, lowPrecision: !!p.lowPrecision });
    }
    return { jdUt: opts.jdUt, jde: pos._jde, deltaT: (pos._jde - opts.jdUt) * 86400, obliquity: eps, gst: gst, lst: lst,
             bodies: bodies, houses: H, aspects: aspects(pos, PLANETS), meanNode: pos.meanNode.lon };
  }

  /* ---------- זמן מקומי → UT דרך Intl ---------- */
  function tzOffsetMinutes(tz, utcMs) {
    var f = new Intl.DateTimeFormat("en-US", { timeZone: tz, hour12: false, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" });
    var p = {}, parts = f.formatToParts(new Date(utcMs));
    for (var i = 0; i < parts.length; i++) p[parts[i].type] = parts[i].value;
    var h = +p.hour; if (h === 24) h = 0;   /* Chrome ישן מחזיר "24" בחצות */
    var asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, h, +p.minute, +p.second);
    return Math.round((asUtc - utcMs) / 60000);
  }
  /* מחזיר {utcMs, offsetMinutes}. שני סיבובים: הקיזוז תלוי ברגע, והרגע תלוי בקיזוז */
  function localToUtc(y, m, d, hh, mi, tz) {
    var guess = Date.UTC(y, m - 1, d, hh, mi);
    if (y < 100) { var dt = new Date(guess); dt.setUTCFullYear(y); guess = dt.getTime(); }
    var off = tzOffsetMinutes(tz, guess), utc = guess - off * 60000;
    var off2 = tzOffsetMinutes(tz, utc);
    if (off2 !== off) { utc = guess - off2 * 60000; off = off2; }
    return { utcMs: utc, offsetMinutes: off };
  }
  /* O-2: האם ה-Intl של המכשיר הזה יודע אזורי זמן והיסטוריית שעון קיץ.
     שלוש עובדות ידועות; כישלון באחת — המכשיר לא אמין, והממשק מציע קיזוז ידני. */
  function selfTest() {
    try {
      var ok = tzOffsetMinutes("Asia/Jerusalem", Date.UTC(2000, 0, 15)) === 120 &&
               tzOffsetMinutes("Asia/Jerusalem", Date.UTC(2000, 6, 15)) === 180 &&
               tzOffsetMinutes("America/New_York", Date.UTC(1990, 0, 15)) === -300 &&
               tzOffsetMinutes("Europe/Moscow", Date.UTC(1985, 6, 15)) === 240;
      return { ok: ok, why: ok ? "" : "offset" };
    } catch (e) { return { ok: false, why: e && e.message || "throw" }; }
  }

  return {
    jdUT: jdUT, jdFromMs: jdFromMs, msFromJd: msFromJd, deltaT: deltaT, jdeOf: jdeOf,
    nutation: nutation, meanObliquity: meanObliquity, siderealApparent: siderealApparent,
    helio: helio, positions: positions, withSpeeds: withSpeeds, houses: houses, houseOf: houseOf,
    aspects: aspects, chart: chart, localToUtc: localToUtc, tzOffsetMinutes: tzOffsetMinutes,
    selfTest: selfTest, norm: norm, norm180: norm180, PLANETS: PLANETS, PLUTO_OK: PLUTO_OK, ASPECTS: ASPECTS
  };
})();
