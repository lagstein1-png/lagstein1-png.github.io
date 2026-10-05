// app.js — הממשק של דף הניסוי. שני מנועים, אותו ממשק: ask() מחזיר זרם של מחרוזות.
import { createWebLLMGemma, LLMUnavailableError } from "./webllm-gemma.js";
import { createMediaPipeGemma, saveModelToOPFS, recordAudio } from "./mediapipe-gemma.js";

const $ = (id) => document.getElementById(id);
const SYSTEM = "את עוזרת לימודית באתר בקול. עני בעברית פשוטה, במשפטים קצרים. " +
  "הסבירי את הדרך ולא רק את התשובה. אל תבקשי פרטים אישיים.";

let engine = "web";      // "web" | "mp"
let llm = null;
let abort = null;

window.gemmaReady = true;

function pick(which) {
  engine = which;
  $("engWeb").setAttribute("aria-pressed", String(which === "web"));
  $("engMp").setAttribute("aria-pressed", String(which === "mp"));
  $("webOpts").hidden = which !== "web";
  $("mpOpts").hidden = which !== "mp";
}
$("engWeb").addEventListener("click", () => pick("web"));
$("engMp").addEventListener("click", () => pick("mp"));
pick("web");

function progress(fraction, text) {
  const pct = Math.round(fraction * 100);
  $("bar").hidden = false;
  $("bar").value = pct;
  $("barText").textContent = `${pct}%` + (text ? ` — ${text}` : "");
}

$("load").addEventListener("click", async () => {
  $("load").disabled = true;
  try {
    if (llm) { await (llm.unload?.() ?? llm.close?.()); llm = null; }
    if (engine === "web") {
      llm = await createWebLLMGemma({ variant: $("variant").value, systemPrompt: SYSTEM, onProgress: progress });
      $("micNote").textContent = "הדיבור מזוהה בדפדפן, וברוב הדפדפנים ההקלטה נשלחת ליצרן הדפדפן.";
    } else {
      const file = $("file").files[0];
      if (!file) { $("barText").textContent = "צריך לבחור קובץ מודל."; return; }
      if ($("keep").checked) await saveModelToOPFS(file);
      llm = await createMediaPipeGemma({ file, systemPrompt: SYSTEM, onProgress: (f) => progress(f, "קוראים את הקובץ") });
      $("micNote").textContent = "ההקלטה נמשכת חמש שניות ונשארת במכשיר.";
    }
    $("barText").textContent = "המודל מוכן.";
    $("askCard").hidden = false;
    $("q").focus();
  } catch (e) {
    console.error(e);
    $("barText").textContent = e instanceof LLMUnavailableError && e.reason === "model-not-in-webllm"
      ? "המודל הזה עדיין לא זמין בהורדה מהרשת. אפשר לנסות לטעון קובץ מהמכשיר."
      : "הטעינה נכשלה: " + e.message;
  } finally {
    $("load").disabled = false;
  }
});

async function run(stream) {
  $("out").textContent = "";
  $("done").textContent = "";
  $("out").setAttribute("aria-busy", "true");
  $("send").disabled = $("mic").disabled = true;
  $("stop").disabled = false;
  try {
    for await (const chunk of stream) $("out").textContent += chunk;
    $("done").textContent = "התשובה מוכנה.";
  } catch (e) {
    console.error(e);
    $("done").textContent = "משהו השתבש: " + e.message;
  } finally {
    $("out").removeAttribute("aria-busy");
    $("send").disabled = $("mic").disabled = false;
    $("stop").disabled = true;
    abort = null;
  }
}

$("send").addEventListener("click", () => {
  const text = $("q").value.trim();
  if (!text || !llm) return;
  abort = new AbortController();
  run(llm.ask(text, { signal: abort.signal }));
});

$("mic").addEventListener("click", async () => {
  if (!llm) return;
  try {
    if (engine === "web") {
      $("done").textContent = "מקשיבים…";
      const { transcript, stream } = await llm.askVoice({ lang: "he-IL" });
      $("q").value = transcript;
      run(stream);
    } else {
      $("done").textContent = "מקליטים חמש שניות…";
      const audio = await recordAudio(5000);
      run(llm.ask(["ענו על מה שנאמר בהקלטה:", { audioSource: URL.createObjectURL(audio) }]));
    }
  } catch (e) {
    $("done").textContent = e.message;
  }
});

$("stop").addEventListener("click", () => {
  abort?.abort();
  llm?.cancel?.();
});

$("reset").addEventListener("click", () => {
  llm?.reset();
  $("out").textContent = "";
  $("done").textContent = "התחלנו שיחה חדשה.";
});
