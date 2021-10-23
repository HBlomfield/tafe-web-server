
// var CACHE_NAME = 'draw_v1';
// var urlsToCache = [
// 	// "/",
// 	"/public/style.css",
// 	"/public/main.js",
// 	"/public/index.html",
// 	"/public/favicon.ico",
// 	"/public/bi/bootstrap-icons.css",
// 	"/public/bi/fonts/bootstrap-icons.woff",
// 	"/public/bi/fonts/bootstrap-icons.woff2",
// 	"/public/manifest.json",
// 	"/public/home-icons/32x32.png",
// 	"/public/home-icons/48x48.png",
// 	"/public/home-icons/64x64.png",
// 	"/public/home-icons/80x80.png",
// 	"/public/home-icons/96x96.png",
// 	"/public/home-icons/144x144.png",


// ];

// self.addEventListener('install', function (event) {
// 	// Perform install steps
// 	// console.log('test');
// 	event.waitUntil(
// 		caches.open(CACHE_NAME)
// 		.then(function (cache) {
// 			// console.log('Opened cache');
// 			return cache.addAll(urlsToCache);
// 		})
// 	);
// });

// self.addEventListener('fetch', function (event) {
// 	event.respondWith(
// 		caches.match(event.request)
// 		.then(function (response) {
// 			// console.log(event.request.url)
// 			// console.log(event.request);
// 			// console.log(response);
// 			// Cache hit - return response
// 			if (response) {
// 				return response;
// 			}
// 			// console.log("not returned");

// 			return fetch(event.request).then(
// 				function (response) {
// 					// Check if we received a valid response
// 					if (event.request.method != "GET") return response;
// 					if (/api\//g.test(event.request.url)) return response; // dont cache if its an api request, dont cache if it is a post request.
			
// 					if (!response || response.status !== 200 || response.type !== 'basic') {
// 						return response;
// 					}


// 					// IMPORTANT: Clone the response. A response is a stream
// 					// and because we want the browser to consume the response
// 					// as well as the cache consuming the response, we need
// 					// to clone it so we have two streams.
// 					var responseToCache = response.clone();
// 					// console.log("response cloned");

// 					caches.open(CACHE_NAME)
// 						.then(function (cache) {
// 							cache.put(event.request, responseToCache);
// 							// console.log("adding to cache");

// 						});

// 					// console.log("working???");

// 					return response;
// 				}
// 			);
// 		})
// 	);
// });
