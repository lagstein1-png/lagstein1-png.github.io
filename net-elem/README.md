# Internet Safety for Kids (net-elem)
Internal rebuild: ns1, 7 topics, 35 original scenario questions, 4 options per question.
Open locally with ?internal=shlav-internal-net-elem-k. Not a security boundary.
No homepage or sitemap entry. No scores, ranking, payments, or new network services.
Recorded voice layer only; audio/manifest.json is empty. Missing audio produces a visible notice and silence, never a different voice. Estimated word highlighting follows audio position, not actual word timestamps.
The current record.js pipeline extracts Hebrew only, including fixed UI, lessons, questions, options and local tutor text. Other language audio awaits a recording pipeline supporting those languages.
Local Limor works without API calls. The shared teacher additionally requires the worker ROLE and a tutor worker redeploy after merge. No tutor API call was made during testing.
Translations are machine-quality and await a speaker review. This foundation is not a certified or complete curriculum.
Sources read during rebuild:
- http://www.gov.il/he/pages/summer160726
- https://me.health.gov.il/parenting/learn-more/growth-and-development/online-violence/
No endorsement by either source. Children can always seek a trusted adult, including after sharing something. The 105 reference is explicitly for Israel.

QA on main 77307267:
- all.js --static: 68/68 passed (includes the read-only sitemap --check invoked by that aggregate; sitemap regeneration was not run and sitemap.xml was not changed).
- content.js net-elem: 35 questions, PASS, 0 FAIL, 0 REVIEW. Automated checks only.
- barak-browser.js net-elem: PASS for read_aloud, show_hint, next_question.
- tests/net-elem-browser.cjs: 1,158 assertions covering all topics and mixed practice in all four languages, 390px mobile, gate, retry, local Limor, persistence and accessibility; no page errors.
- tests/net-elem-audio.cjs: mocked recorded playback checks all four language arguments, question/answer word highlighting, stop and end. This does not verify sound quality or actual recordings.
- Mobile screenshots visually inspected: home, practice, full-screen Limor, dark settings, and OG image. Missing emoji glyphs and scrolling overlay were fixed and rechecked.

Recording plan: 150 unique Hebrew strings, 5,730 characters, 0 clips recorded. Plan-only estimate $0.21 Gemini; no recording dispatched and no new spend. The repository's historical spend ledger reports $41.52. Supply the production Gacrux voice explicitly when recording, because the current recorder default is Kore.
