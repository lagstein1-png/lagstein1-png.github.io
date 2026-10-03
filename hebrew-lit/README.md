# קריאה ושפה (hebrew-lit) - local build v0

Static app, no build step. Proposed path: bekol.co.il/hebrew-lit/ (hidden behind an internal link until published).
Files: index.html, app.css, manifest.json, sw.js, js/{i18n,data,engine,speech,app}.js
- i18n.js: every UI string as S(key, he, ar, ru, en). he is the source; ar/ru/en are machine quality, need a native check.
- data.js: all Hebrew content (words with nikud and syllables, rhyme groups, cloze sentences, 6 short texts). Written fresh.
- engine.js: question generators; correct answers come from the data tables. UNITS lists the 11 units.
- speech.js: read-aloud. Female voice only (male names excluded, raised pitch if only male exists), per-language voice, yellow word highlight.
- Shared tutor: TUTOR.mount / BARAK.register at the end of app.js, active only where /tutor/*.js exists (live site). Offline fallback Limor panel built in.
Not yet done: icons/og image, recorded-audio hookup (speech/recorded.js), grades 3-6, FINDINGS/NAMING entries, homepage card.
