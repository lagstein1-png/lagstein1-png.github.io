// mediapipe-gemma.js — Gemma On-Device דרך MediaPipe LLM Inference (@mediapipe/tasks-genai).
// שימוש:
//   const llm = await createMediaPipeGemma({ file: input.files[0], onProgress });
//   for await (const chunk of llm.ask(["מה נאמר בהקלטה?", { audioSource: URL.createObjectURL(blob) }])) out.textContent += chunk;
import { FilesetResolver, LlmInference } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-genai/+esm";

const WASM_ROOT = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-genai/wasm";

/**
 * 1. טעינת המשקולות מזיכרון המכשיר: File (מ-<input type=file>), FileSystemFileHandle,
 *    או קובץ ששמור ב-OPFS. הקובץ נקרא כזרם — מודל של כמה GB לא נטען כולו ל-ArrayBuffer.
 */
async function openModelStream(source, onProgress) {
  let file;
  if (source instanceof File) file = source;
  else if (source?.getFile) file = await source.getFile(); // FileSystemFileHandle
  else if (typeof source === "string") {                   // שם קובץ ב-OPFS
    const root = await navigator.storage.getDirectory();
    file = await (await root.getFileHandle(source)).getFile();
  } else throw new TypeError("source חייב להיות File, FileSystemFileHandle או שם קובץ ב-OPFS");

  if (!/\.(task|bin|litertlm)$/i.test(file.name)) console.warn(`[gemma] סיומת לא צפויה: ${file.name}`);

  let read = 0;
  const counted = file.stream().pipeThrough(new TransformStream({
    transform(chunk, ctl) { read += chunk.byteLength; onProgress(read / file.size); ctl.enqueue(chunk); },
  }));
  return counted.getReader();
}

/** שמירת קובץ שנבחר ב-OPFS, כדי שבפעם הבאה לא יצטרכו לבחור שוב. */
export async function saveModelToOPFS(file, name = file.name) {
  const root = await navigator.storage.getDirectory();
  const handle = await root.getFileHandle(name, { create: true });
  const w = await handle.createWritable();
  await file.stream().pipeTo(w);
  return name;
}

export async function createMediaPipeGemma({
  file,                 // File | FileSystemFileHandle | שם ב-OPFS
  maxTokens = 2048,     // 2. חלון ההקשר: קלט + פלט יחד
  topK = 40,
  temperature = 0.7,
  supportAudio = true,  // דורש מודל רב־מודלי (למשל גרסת E2B/E4B שתומכת בשמע)
  maxNumImages = 0,
  systemPrompt = "",
  reserveForAnswer = 512,
  onProgress = () => {},
} = {}) {
  if (!("gpu" in navigator) || !(await navigator.gpu.requestAdapter())) {
    throw Object.assign(new Error("אין WebGPU — MediaPipe LLM Inference לא ירוץ במכשיר הזה"), { reason: "no-webgpu" });
  }

  const genai = await FilesetResolver.forGenAiTasks(WASM_ROOT);
  const reader = await openModelStream(file, onProgress);
  const llm = await LlmInference.createFromOptions(genai, {
    baseOptions: { modelAssetBuffer: reader },
    maxTokens, topK, temperature, randomSeed: 1,
    supportAudio, maxNumImages,
  });

  // 2. ניהול חלון ההקשר — היסטוריה בתורות, וחיתוך מהישן לחדש כשהיא לא נכנסת.
  const turns = []; // {role: "user"|"model", parts: Array<string|{audioSource}|{imageSource}>}
  const budget = maxTokens - reserveForAnswer;

  const textOf = (parts) => parts.filter((p) => typeof p === "string").join("");
  const tokens = (s) => llm.sizeInTokens(s);
  const AUDIO_TOKEN_ESTIMATE = 200; // הערכה בלבד; sizeInTokens סופר טקסט, לא שמע

  function cost(turn) {
    const media = turn.parts.filter((p) => typeof p !== "string").length;
    return tokens(textOf(turn.parts)) + media * AUDIO_TOKEN_ESTIMATE + 8;
  }

  function buildPrompt() {
    let used = systemPrompt ? tokens(systemPrompt) : 0;
    const kept = [];
    for (let i = turns.length - 1; i >= 0; i--) {  // מהחדש לישן
      const c = cost(turns[i]);
      if (used + c > budget && kept.length) break; // התור האחרון נשמר תמיד
      used += c;
      kept.unshift(turns[i]);
    }
    // תבנית השיחה של Gemma
    const prompt = [];
    kept.forEach((t, i) => {
      const sys = i === 0 && systemPrompt && t.role === "user" ? systemPrompt + "\n\n" : "";
      prompt.push(`<start_of_turn>${t.role}\n${sys}`, ...t.parts, "<end_of_turn>\n");
    });
    prompt.push("<start_of_turn>model\n");
    return prompt;
  }

  // 3. תור — MediaPipe מריץ בקשה אחת בכל פעם; בקשות נוספות ממתינות ולא נזרקות.
  let queue = Promise.resolve();

  /**
   * 4. Streaming. input: מחרוזת, או מערך של מחרוזות ו-{audioSource: כתובת (blob: או https:)}.
   */
  function ask(input) {
    const parts = Array.isArray(input) ? input : [input];
    const chunks = [];
    let wake = null, done = false, failure = null;
    const notify = () => { wake?.(); wake = null; };

    queue = queue.then(async () => {
      turns.push({ role: "user", parts });
      let full = "";
      try {
        // generateResponse היא אסינכרונית: העבודה על ה-GPU, וה-callback מחזיר כל חלק כשהוא מוכן.
        await llm.generateResponse(buildPrompt(), (partial, isDone) => {
          if (partial) { full += partial; chunks.push(partial); }
          if (isDone) done = true;
          notify();
        });
        turns.push({ role: "model", parts: [full] });
      } catch (e) {
        turns.pop();
        failure = e;
      } finally {
        done = true;
        notify();
      }
    });

    return (async function* () {
      while (true) {
        if (chunks.length) { yield chunks.shift(); continue; }
        if (failure) throw failure;
        if (done) return;
        await new Promise((r) => (wake = r));
      }
    })();
  }

  return {
    ask,
    cancel: () => llm.cancelProcessing?.(),
    reset: () => { turns.length = 0; },
    contextUsage: () => ({ budget, turns: turns.length }),
    close: () => llm.close(),
  };
}

/** הקלטת שמע מהמיקרופון ל-Blob — לשליחה כ-{audioSource}. השמע לא יוצא מהמכשיר. */
export async function recordAudio(ms = 5000) {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const rec = new MediaRecorder(stream);
  const parts = [];
  rec.ondataavailable = (e) => parts.push(e.data);
  const stopped = new Promise((r) => (rec.onstop = r));
  rec.start();
  setTimeout(() => rec.stop(), ms);
  await stopped;
  stream.getTracks().forEach((t) => t.stop());
  return new Blob(parts, { type: rec.mimeType });
}
