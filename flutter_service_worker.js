'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "favicon.png": "d41d8cd98f00b204e9800998ecf8427e",
"index.html": "d41d8cd98f00b204e9800998ecf8427e",
"/": "d41d8cd98f00b204e9800998ecf8427e",
"canvaskit/profiling/canvaskit.js": "38164e5a72bdad0faa4ce740c9b8e564",
"canvaskit/profiling/canvaskit.wasm": "95a45378b69e77af5ed2bc72b2209b94",
"canvaskit/canvaskit.js": "2bc454a691c631b07a9307ac4ca47797",
"canvaskit/canvaskit.wasm": "bf50631470eb967688cca13ee181af62",
"main.dart.js": "1ebb640eba79507410d9750182a4ea29",
"icons/Icon-512.png": "d41d8cd98f00b204e9800998ecf8427e",
"icons/Icon-192.png": "d41d8cd98f00b204e9800998ecf8427e",
"icons/Icon-maskable-512.png": "d41d8cd98f00b204e9800998ecf8427e",
"icons/Icon-maskable-192.png": "d41d8cd98f00b204e9800998ecf8427e",
"flutter.js": "f85e6fb278b0fd20c349186fb46ae36d",
"manifest.json": "d41d8cd98f00b204e9800998ecf8427e",
"assets/FontManifest.json": "f7316caf1a9203d9c72481468f1bd4fc",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"assets/AssetManifest.json": "242d3b95e5136a6991122c664315b9f5",
"assets/NOTICES": "daf009a5409a5710d60f82b5ef0b26d4",
"assets/fonts/MaterialIcons-Regular.otf": "95db9098c58fd6db106f1116bae85a0b",
"assets/assets/images/sessions.png": "bf9ad64ecb4cb2d1a862a657a1b95ea8",
"assets/assets/images/student.png": "4db914685ef2f496cbff45991b326e0c",
"assets/assets/images/m.png": "4d77941cb56b4035449efdff05417cab",
"assets/assets/images/students.png": "3ca8ae554f3933630e5957275d9f2dc4",
"assets/assets/images/final.png": "1c81b858e407b1e3079732a3d64142af",
"assets/assets/images/app_logo.png": "1f7ada13bcd879d2f1c9c426bdc88f72",
"assets/assets/images/person.png": "8ee5ef3fb594efbf18995011e857682c",
"assets/assets/fonts/ArbFONTS-Tajawal-Medium.ttf": "1472d65abf09fa765956fd3d32dadf48",
"assets/assets/fonts/ArbFONTS-Tajawal-Regular-2.ttf": "6b10b55e4df612910047b7e5d596a9d5",
"assets/assets/fonts/ArbFONTS-Tajawal-Light.ttf": "5c8f739351e568ec0c9fc0dc8a6994b4",
"assets/assets/fonts/ArbFONTS-Tajawal-Regular-1.ttf": "d8304accb48d86d9361ad30569823a0d",
"assets/assets/fonts/ArbFONTS-Tajawal-ExtraLight.ttf": "4dba176f2d532f19d9c4c61502bca07b",
"assets/assets/fonts/ArbFONTS-Tajawal-Bold.ttf": "73222b42f57d11db8ed71c1752e121c0",
"assets/assets/fonts/ArbFONTS-Tajawal-ExtraBold.ttf": "87a0f0773f0cdc28fd8dd3603bf34837",
"assets/assets/fonts/ArbFONTS-Tajawal-Regular.ttf": "d8304accb48d86d9361ad30569823a0d",
"assets/assets/fonts/ArbFONTS-Tajawal-Bold-1.ttf": "73222b42f57d11db8ed71c1752e121c0",
"assets/assets/fonts/ArbFONTS-Tajawal-Bold-2.ttf": "79bb19e04937c19974260fcb4128270e",
"assets/assets/fonts/ArbFONTS-Tajawal-Black.ttf": "d8e4db47417985783913a2d64ca6e8cf",
"assets/shaders/ink_sparkle.frag": "90cca40aba352029ee77c6209d41d05d",
"version.json": "e301e4fe554a79baa007fef4ce2b88e5"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "main.dart.js",
"index.html",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
