# מדעים לכיתות א-ב

Internal introduction, not a complete replacement for the grades 1-2 science curriculum.
Six topics, four short lesson lines and six original questions per topic (36 total).
Topics: senses, animals, plants, seasons in Israel, water and day/night.
All content and UI are available in Hebrew, Arabic, Russian and English.

## Preview

Serve the repository root, then open:
`/science-12/?internal=shlav-internal-science-12`

The gate persists in a science-12-specific localStorage key. It is a publication
stage gate, not a security boundary. Direct access shows the unpublished screen.
Homepage, sitemap and app count are unchanged.

## Learning and accessibility

No scores, points, rankings or timed performance demands. Four answer choices,
a speaker beside each answer, large play/stop/slow controls, yellow word tracking,
short lesson lines, translated settings, dark mode and device-local completion.
Hints are broad prompts. Limor's full-screen panel uses topic-specific examples
and asks the child to think; it does not name the answer. An explicit separate
green solution button can show an answer. Errors do not trigger an automatic reveal.
Vector topic icons work even without an emoji font. Reduced motion is respected.

## Audio and tutor limitations

The shared RECORDED hook is wired for Hebrew only: in js/speech.js the recorded
layer runs under `lang==="he"`, and Arabic, Russian and English go straight to the
device voice. science-12 is registered in the recording source list.
audio/manifest.json is intentionally empty. No audio was generated or purchased
for this build. An available Hebrew recording takes precedence over the device
voice. Voice choice drops device voices with known male names and prefers a known
female name in the matching language. When neither is available the text is still
read aloud, using the device default voice at a raised pitch, and a translated
notice says exactly that (noVoice). Only a device with no speech engine at all
gets the notice that asks the learner to read or try another device (noSpeech).
Device audio has gesture unlock, short segments, keep-alive, a retained
utterance and a watchdog. Timer word tracking is approximate when the device
omits boundary events. Actual audio quality needs
listening on Hebrew/Arabic/Russian/English devices.

Limor here is the template's authored local support panel, not live AI chat.
Current shared tutor API has no science-12 role. Do not mount it using an unrelated
role. Shared tutor scripts are available for a later correctly scoped integration.
Translations have not received native-speaker review. The app states that clearly.

## Ministry of Education topic reference

https://pop.education.gov.il/tchumey_daat/mada-tehnologia/yesodi/technology-science-pedagogy/online-broadcasts/

Reviewed October 3, 2026: grade 1 lists senses, light/sound, plant structure and
animal diversity; grade 2 lists life needs, materials/states, living environments
and day/night/year. Seasons and water are introductory connections to these
strands. The app does not claim Ministry endorsement or full curriculum coverage.
All lessons/questions were written fresh, not copied from the linked lessons.
