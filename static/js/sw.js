const CACHE_VERSION = "zmart-radio-v3";

const CACHE_BYPASS_PATTERNS = [
  "spotify.com",
  "fonts.googleapis.com",
  "fonts.gstatic.com",
  "caster.fm",
  "sentry.io",
  "quillbot",
  "locize.com",
];

const APP_SHELL_ASSETS = [
  "/",
  "/static/css/style.css",
  "/manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(APP_SHELL_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((k) => k !== CACHE_VERSION)
          .map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  // Só intercepta GET
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Bypass: domínios externos, streams, extensões de browser
  const isBypass = CACHE_BYPASS_PATTERNS.some((p) => url.hostname.includes(p));
  if (isBypass) return; // deixa o browser tratar diretamente

  // Bypass: extensões de browser (chrome-extension, moz-extension, etc)
  if (!url.protocol.startsWith("http")) return;

  // Bypass: streams de áudio
  const isAudio =
    url.pathname.endsWith(".mp3") ||
    url.pathname.endsWith(".m3u8") ||
    url.pathname.includes("/o8QS8") ||
    url.pathname.includes("/listen/") ||
    url.pathname.includes("/stream");
  if (isAudio) return;

  // App shell: cache-first com clone correto
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request).then((response) => {
        // Só cacheia respostas válidas e do mesmo origin
        if (
          !response ||
          response.status !== 200 ||
          response.type !== "basic"
        ) {
          return response;
        }

        // Clona ANTES de usar
        const toCache = response.clone();
        caches.open(CACHE_VERSION).then((cache) => {
          cache.put(event.request, toCache);
        });

        return response;
      }).catch(() => caches.match("/"));
    })
  );
});
