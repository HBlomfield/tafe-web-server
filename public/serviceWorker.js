// console.log(caches);
// self.addEventListener("install", function(event) {
// 	event.waitUntil(caches.open("DrawSite-V1").then(function (cache) {
// 		console.log('opened cache');

// 		return cache.addAll([
// 			"/",
// 			"/index.html",
// 			"/main.js",
// 			"/style.css"
// 		]);
// 	}))
// })
// self.addEventListener("fetch", function(event) {
// 	console.log("received fetched");
// 	event.respondWith(
// 		caches.match(event.request).then(function(response) {
// 			console.log("responding to event");
// 			// if (response) return response;
// 			 fetch(event.request).then(function(response) {
// 				console.log("fetching new file")
// 				// if (!response || response.status !== 200 || response.type != basic) { // I forgopt that ! fuck no wonder it was messing up
// 				// 	return response;
// 				// }
// 				// console.log("now its ok?")
// 				// let responseToCache = response.clone();
// 				// caches.open("DrawSite-V1").then(function(cache) {
// 				// 	cache.put(event.request, responseToCache);
// 				// })
// 				// return fetch (event.request).catch ()
// 				return response;
// 			})
// 		})

// 	)
// })


// // var CACHE_NAME = 'my-site-cache-v1';
// // var urlsToCache = [
// //   '/',
// //   '/main.css',
// //   '/public/main.js'
// // ];

// // self.addEventListener('install', function(event) {
// //   // Perform install steps
// //   event.waitUntil(
// //     caches.open(CACHE_NAME)
// //       .then(function(cache) {
// //         console.log('Opened cache');
// //         return cache.addAll(urlsToCache);
// //       })
// //   );
// // });

var CACHE_NAME = 'draw_v1';
var urlsToCache = [
	// "/",
	"/public/style.css",
	"/public/main.js",
	"/public/index.html",
	"/public/favicon.ico",
	"/public/bi/bootstrap-icons.css",
	"/public/bi/fonts/bootstrap-icons.woff",
	"/public/bi/fonts/bootstrap-icons.woff2",
	"/public/manifest.json",
	"/public/home-icons/32x32.png",
	"/public/home-icons/48x48.png",
	"/public/home-icons/64x64.png",
	"/public/home-icons/80x80.png",
	"/public/home-icons/96x96.png",
	"/public/home-icons/144x144.png",


];

self.addEventListener('install', function (event) {
	// Perform install steps
	// console.log('test');
	event.waitUntil(
		caches.open(CACHE_NAME)
		.then(function (cache) {
			// console.log('Opened cache');
			return cache.addAll(urlsToCache);
		})
	);
});

self.addEventListener('fetch', function (event) {
	event.respondWith(
		caches.match(event.request)
		.then(function (response) {
			// console.log(event.request.url)
			// console.log(event.request);
			// console.log(response);
			// Cache hit - return response
			if (response) {
				return response;
			}
			// console.log("not returned");

			return fetch(event.request).then(
				function (response) {
					// Check if we received a valid response
					if (event.request.method != "GET") return response;
					if (/api\//g.test(event.request.url)) return response; // dont cache if its an api request, dont cache if it is a post request.
			
					if (!response || response.status !== 200 || response.type !== 'basic') {
						return response;
					}


					// IMPORTANT: Clone the response. A response is a stream
					// and because we want the browser to consume the response
					// as well as the cache consuming the response, we need
					// to clone it so we have two streams.
					var responseToCache = response.clone();
					// console.log("response cloned");

					caches.open(CACHE_NAME)
						.then(function (cache) {
							cache.put(event.request, responseToCache);
							// console.log("adding to cache");

						});

					// console.log("working???");

					return response;
				}
			);
		})
	);
});

// var cacheVersion = 1;
// var currentCache = {
// 	offline: 'offline-cache' + cacheVersion
// };
// const offlineUrl = '/index.html';

// this.addEventListener('install', event => {
// 	event.waitUntil(
// 		caches.open(currentCache.offline).then(function (cache) {
// 			return cache.addAll([
// 				'./img/offline.svg',
// 				offlineUrl
// 			]);
// 		})
// 	);
// });

// this.addEventListener('fetch', event => {
// 	// request.mode = navigate isn't supported in all browsers
// 	// so include a check for Accept: text/html header.
// 	if (event.request.mode === 'navigate' || (event.request.method === 'GET' && event.request.headers.get('accept').includes('text/html'))) {
// 		event.respondWith(
// 			fetch(event.request.url).catch(error => {
// 				// Return the offline page
// 				return caches.match(offlineUrl);
// 			})
// 		);
// 	} else {
// 		// Respond with everything else if we can
// 		event.respondWith(caches.match(event.request)
// 			.then(function (response) {
// 				return response || fetch(event.request);
// 			})
// 		);
// 	}
// })