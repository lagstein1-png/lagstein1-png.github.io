export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: Object.fromEntries(
        ("window document navigator location history localStorage sessionStorage screen console "+
         "setTimeout clearTimeout setInterval clearInterval requestAnimationFrame cancelAnimationFrame "+
         "fetch alert confirm prompt URL URLSearchParams Blob File FileReader FormData Headers Request Response "+
         "AbortController TextEncoder TextDecoder crypto btoa atob SpeechSynthesisUtterance speechSynthesis "+
         "Audio Image Intl matchMedia getComputedStyle MutationObserver IntersectionObserver ResizeObserver "+
         "CustomEvent Event KeyboardEvent MouseEvent Node Element HTMLElement DocumentFragment DOMParser "+
         "XMLHttpRequest WebSocket Worker indexedDB caches performance structuredClone queueMicrotask "+
         "AudioContext webkitAudioContext MediaRecorder Notification BroadcastChannel getSelection "+
         "requestIdleCallback self top parent frames devicePixelRatio innerWidth innerHeight scrollTo open close print "+
         "addEventListener removeEventListener dispatchEvent CSS ClipboardItem MathMLElement HTMLCanvasElement "+
         "OffscreenCanvas SVGElement CanvasRenderingContext2D ServiceWorker ServiceWorkerRegistration"
        ).split(/\s+/).map(k=>[k,"readonly"])
      )
    },
    linterOptions: { reportUnusedDisableDirectives: false },
    rules: {
      "no-undef": "error",
      "no-dupe-keys": "error",
      "no-dupe-args": "error",
      "no-dupe-else-if": "error",
      "no-duplicate-case": "error",
      "no-func-assign": "error",
      "no-unsafe-negation": "error",
      "no-unreachable": "error",
      "no-self-compare": "error",
      "no-constant-condition": "error",
      "no-cond-assign": ["error","always"],
      "no-sparse-arrays": "error",
      "use-isnan": "error",
      "valid-typeof": "error",
      "no-fallthrough": "error",
      "no-redeclare": "error",
      "no-empty": ["error",{"allowEmptyCatch":true}],
      "no-implicit-globals": "off"
    }
  }
];
