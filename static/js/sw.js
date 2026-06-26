const CACHE_VERSION = "zmart-radio-v1";

// Domínios que nunca devem ser cacheados (streams ao vivo e players externos)
const CACHE_BYPASS_PATTERNS = [
  "spotify.com",
  "fonts.googleapis.com",
  "fonts.gstatic.com",
  "streaming.caster.fm",
  "caster.fm",
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
  const url = new URL(event.request.url);

  const isBypass = CACHE_BYPASS_PATTERNS.some((p) => url.hostname.includes(p));
  if (isBypass || event.request.method !== "GET") {
    event.respondWith(fetch(event.request));
    return;
  }

  // Streams de áudio: sempre network-first, sem cache
  const isAudioStream =
    event.request.headers.get("Accept")?.includes("audio") ||
    url.pathname.endsWith(".mp3") ||
    url.pathname.endsWith(".m3u8") ||
    url.pathname.includes("/listen/") ||
    url.pathname.includes("/stream");

  if (isAudioStream) {
    event.respondWith(fetch(event.request));
    return;
  }

  // App shell: cache-first
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type === "opaque") {
          return response;
        }
        caches.open(CACHE_VERSION).then((cache) => {
          cache.put(event.request, response.clone());
        });
        return response;
      });
    }).catch(() => caches.match("/"))
  );
});
