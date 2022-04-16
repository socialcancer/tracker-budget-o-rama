const CACHE_NAME = "budget-cache";
const DATA_CACHE_NAME = "budget-data-cache";
const APP_PREIX = 'Budget Tracker-O-rama';
const VERSION = 'version_01';



const FILES_TO_CACHE = [
  "./index.html",
  "/css/styles.css",
  "/js/idb.js",
  "/js/index.js"
];

// Install the service worker
self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Your files were pre-cached successfully!' + CACHE_NAME);
      return cache.addAll(FILES_TO_CACHE);
    })
  );

  self.skipWaiting();
});

// Activate the service worker and remove old data from the cache
self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(
        keyList.map(key => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            console.log('Removing old cache data', key);
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});

// Intercept fetch requests
self.addEventListener('fetch', function (e) {
  if (e.request.url.includes('/api/')) {
    e.respondWith(
      caches
        .open(DATA_CACHE_NAME)
        .then(cache => {
          return fetch(e.request)
            .then(response => {
              // If the response was good, clone it and store it in the cache.
              if (response.status === 200) {
                cache.put(e.request.url, response.clone());
              }

              return response;
            })
            .catch(err => {
              // Network request failed, try to get it from the cache.
              return cache.match(e.request);
            });
        })
        .catch(err => console.log(err))
    );

    return;
  }

  e.respondWith(
    fetch(e.request).catch(function () {
      return caches.match(e.request).then(function (response) {
        if (response) {
          return response;
        } else if (e.request.headers.get('accept').includes('text/html')) {
          // return the cached home page for all requests for html pages
          return caches.match('/');
        }
      });
    })
  );
});


