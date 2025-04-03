const CACHE_NAME = 'my-pwa-cache-v1';
const urlsToCache = [
    '/index.html',    
    '/styles.css',        
    '/script.js',    
    '/assets/logo.png',  
    '/manifest.json',

    '/students/students.html',
    '/students/students.css',
    '/students/students.js',

    '/tasks/tasks.html',
    '/tasks/tasks.css',
    '/tasks/tasks.js',

    '/dashboard/dashboard.html',
    '/dashboard/dashboard.css',
    '/dashboard/dashboard.js',

    '/assets/user-avatar.png',
    '/assets/avatar.png',
    '/assets/remove-icon.png',
    '/assets/edit-icon.png',
    '/assets/user-avatar.png'

];

// Install the service worker and cache essential files
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Adding URLs to cache:', urlsToCache);
                return Promise.all(urlsToCache.map(url => {
                    console.log('Caching:', url);  
                    return cache.add(url).catch(err => {
                        console.error('Failed to cache:', url, err);
                    });
                }));
            })
            .catch((err) => {
                console.error('Cache opening failed:', err);
            })
    );
});



// Serve cached files from the cache
self.addEventListener('fetch', (event) => {
    console.log('Fetching:', event.request.url);
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                console.log('Serving from cache:', event.request.url);
                return cachedResponse;
            }
            console.log('Fetching from network:', event.request.url);
            return fetch(event.request).then((networkResponse) => {
                return caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
            });
        }).catch((err) => {
            console.error('Failed to fetch:', event.request.url, err);
            throw err;
        })
    );
});


// Activate the service worker and clean up old caches
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

