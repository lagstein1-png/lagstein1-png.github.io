// webllm-gemma.js — Gemma בדפדפן דרך WebGPU + WebLLM.
// שימוש:
//   const llm = await createWebLLMGemma({ variant: "E2B", onProgress: (p, text) => bar.value = p });
//   for await (const chunk of llm.ask("שלום")) out.textContent += chunk;
import * as webllm from "https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm/+esm";

// מזהי המודל אינם מומצאים כאן: הם נבדקים מול רשימת WebLLM בזמן ריצה (ראו resolveModelId).
// אם Gemma 4 עוד לא ברשימה — הפונקציה נופלת עם הודעה ברורה, לא בשקט.
const CANDIDATES = {
  E2B: [/gemma-?4.*e2b/i],
  E4B: [/gemma-?4.*e4b/i],
};

export class LLMUnavailableError extends Error {
  constructor(reason, message, options) { super(message, options); this.name = "LLMUnavailableError"; this.reason = reason; }
}

/** 1. בדיקת WebGPU — מחזירה {ok, reason, info}. לא זורקת. */
export async function checkWebGPU() {
  if (!("gpu" in navigator)) return { ok: false, reason: "no-webgpu-api" };
  try {
    const adapter = await navigator.gpu.requestAdapter({ powerPreference: "high-performance" });
    if (!adapter) return { ok: false, reason: "no-adapter" };
    const maxBuf = adapter.limits.maxStorageBufferBindingSize;
    return {
      ok: true,
      info: { shaderF16: adapter.features.has("shader-f16"), maxStorageBufferBindingSize: maxBuf },
    };
  } catch (e) {
    return { ok: false, reason: "adapter-error", error: e };
  }
}

function resolveModelId(variant, explicitId) {
  const list = webllm.prebuiltAppConfig.model_list.map((m) => m.model_id);
  if (explicitId) {
    if (!list.includes(explicitId)) throw new LLMUnavailableError("unknown-model", `המודל ${explicitId} אינו ברשימת WebLLM`);
    return explicitId;
  }
  const patterns = CANDIDATES[variant] || [];
  const hit = list.find((id) => patterns.some((re) => re.test(id)));
  if (!hit) throw new LLMUnavailableError("model-not-in-webllm", `אין ב-WebLLM מודל Gemma 4 ${variant}. מודלים זמינים: ${list.filter((id) => /gemma/i.test(id)).join(", ") || "אין"}`);
  return hit;
}

/**
 * 2. אתחול. onProgress(fraction 0..1, text).
 * 4. fallback: אם אין WebGPU / אין מודל / ההורדה נכשלה — קוראים ל-fallback(prompt) אם סופק,
 *    אחרת זורקים LLMUnavailableError.
 */
export async function createWebLLMGemma({
  variant = "E2B",
  modelId,
  onProgress = () => {},
  systemPrompt = "",
  fallback = null, // async function* (messages) => yields strings
  workerUrl = new URL("./webllm-worker.js", import.meta.url),
} = {}) {
  const gpu = await checkWebGPU();
  if (!gpu.ok) return makeFallback(gpu.reason, fallback);

  let engine;
  try {
    const id = resolveModelId(variant, modelId);
    const worker = new Worker(workerUrl, { type: "module" });
    engine = await webllm.CreateWebWorkerMLCEngine(worker, id, {
      initProgressCallback: (r) => onProgress(r.progress ?? 0, r.text ?? ""),
    });
  } catch (e) {
    const reason = e instanceof LLMUnavailableError ? e.reason : "load-failed";
    console.warn("[gemma] טעינה נכשלה:", e);
    return makeFallback(reason, fallback, e);
  }

  const history = systemPrompt ? [{ role: "system", content: systemPrompt }] : [];
  let busy = false;

  /** 3. קלט טקסט → AsyncIterable של מחרוזות (streaming). */
  async function* ask(text, { temperature = 0.7, maxTokens = 512, signal } = {}) {
    if (busy) throw new Error("בקשה קודמת עדיין רצה");
    busy = true;
    history.push({ role: "user", content: text });
    let full = "";
    try {
      const stream = await engine.chat.completions.create({
        messages: history, stream: true, temperature, max_tokens: maxTokens,
      });
      for await (const part of stream) {
        if (signal?.aborted) { engine.interruptGenerate(); break; }
        const delta = part.choices[0]?.delta?.content || "";
        if (delta) { full += delta; yield delta; }
      }
      history.push({ role: "assistant", content: full });
    } catch (e) {
      history.pop(); // השאלה שנכשלה לא נשארת בהיסטוריה
      throw e;
    } finally {
      busy = false;
    }
  }

  return {
    mode: "webgpu",
    ask,
    askVoice: (opts) => listenOnce(opts).then((t) => ({ transcript: t, stream: ask(t, opts) })),
    reset: () => { history.length = systemPrompt ? 1 : 0; engine.resetChat(); },
    unload: () => engine.unload(),
  };
}

function makeFallback(reason, fallback, error) {
  if (!fallback) throw new LLMUnavailableError(reason, `אין הרצה מקומית (${reason})`, { cause: error });
  const history = [];
  return {
    mode: "fallback",
    reason,
    async *ask(text) {
      history.push({ role: "user", content: text });
      let full = "";
      for await (const c of fallback(history)) { full += c; yield c; }
      history.push({ role: "assistant", content: full });
    },
    askVoice(opts) { return listenOnce(opts).then((t) => ({ transcript: t, stream: this.ask(t) })); },
    reset: () => { history.length = 0; },
    unload: async () => {},
  };
}

/**
 * קלט קולי → טקסט, דרך Web Speech API.
 * שימו לב: בכרום הזיהוי נשלח לשרתי Google — הוא אינו On-Device.
 */
export function listenOnce({ lang = "he-IL" } = {}) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return Promise.reject(new LLMUnavailableError("no-speech-recognition", "הדפדפן אינו תומך בזיהוי דיבור"));
  return new Promise((resolve, reject) => {
    const rec = new SR();
    rec.lang = lang;
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e) => resolve(e.results[0][0].transcript);
    rec.onerror = (e) => reject(new Error(`זיהוי דיבור נכשל: ${e.error}`));
    rec.onnomatch = () => reject(new Error("לא זוהה דיבור"));
    rec.start();
  });
}
