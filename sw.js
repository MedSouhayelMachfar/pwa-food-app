const staticCacheName = "site-static-v1";
const dynamicCacheName = "site-dynamic-v1";
const OFFLINE_URL = "/pages/fallback.html";

const assets = [
  "/",
  "/index.html",
  "/pages/fallback.html",
  "/js/app.js",
  "/js/ui.js",
  "/js/materialize.min.js",
  "/css/styles.css",
  "/css/materialize.min.css",
  "/img/dish.png",
  "https://fonts.googleapis.com/icon?family=Material+Icons",
  "https://fonts.gstatic.com/s/materialicons/v121/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2",
];

// cache size limit function
const limitCacheSize = (name, size) => {
  caches.open(name).then((cache) => {
    cache.keys().then((keys) => {
      console.log(keys);
      if (keys.length > size) {
        cache.delete(keys[0]).then(() => {
          limitCacheSize(name, size);
        });
      }
    });
  });
};

// install Event
self.addEventListener("install", (event) => {
  //console.log("Service worker has been installed");
  event.waitUntil(
    caches.open(staticCacheName).then((cache) => {
      // caching shell assets
      cache.addAll(assets);
      console.log(
        "static cache for ",
        staticCacheName,
        "has been successfully  cached"
      );
    })
  );
});

// active Event
self.addEventListener("activate", (event) => {
  //console.log("Service worker has been activated");
  event.waitUntil(
    caches.keys().then((keys) => {
      // caches.delete return a promise that's why we used Promise.all to resolve them
      return Promise.all(
        keys
          .filter((key) => key !== staticCacheName && key !== dynamicCacheName)
          .map((key) => caches.delete(key))
      );
    })
  );
});

// fetch Event
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((cacheRes) => {
        return (
          cacheRes ||
          fetch(event.request).then((fetchRes) => {
            return caches.open(dynamicCacheName).then((cache) => {
              cache.put(event.request.url, fetchRes.clone());
              limitCacheSize(dynamicCacheName, 15);
              return fetchRes;
            });
          })
        );
      })
      .catch((err) => {
        if (event.request.url.indexOf(".html") > -1)
          return caches.match(OFFLINE_URL);
      })
  );
});
