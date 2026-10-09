/**
 * Skill2Job.ai Production Progressive Web App Service Worker
 * Version: 1.0.0
 * Features: Offline precaching, stale-while-revalidate for assets, network-first with offline fallback for navigation, push notification handler
 */

const CACHE_NAME = 'skill2job-cache-v1';
const PRECACHE_ASSETS = [
    '/offline',
    '/manifest.json',
    '/favicon.ico',
    '/icon-192.png',
    '/icon-512.png',
    '/icon-maskable-192.png',
    '/icon.svg',
    '/logo-app-icon.png'
];

// Install: Precache shell & offline fallback
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(PRECACHE_ASSETS).catch((err) => {
                console.warn('[SW] Precache asset fetch failure:', err);
            });
        }).then(() => self.skipWaiting())
    );
});

// Activate: Prune stale caches and claim clients immediately
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((name) => {
                    if (name !== CACHE_NAME) {
                        return caches.delete(name);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch: Strategy depending on request type
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Bypass non-GET requests and cross-origin analytics
    if (request.method !== 'GET') return;
    if (url.origin !== self.location.origin) return;

    // 1. Navigation Requests (HTML Pages): Network-First with Offline Fallback
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    if (response && response.status === 200) {
                        const copy = response.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
                    }
                    return response;
                })
                .catch(async () => {
                    // Try returning cached version of this route first
                    const cachedResponse = await caches.match(request);
                    if (cachedResponse) return cachedResponse;

                    // Fallback to offline page
                    const offlinePage = await caches.match('/offline');
                    if (offlinePage) return offlinePage;

                    return new Response(
                        '<html><body><h1>Offline</h1><p>Please check your internet connection.</p></body></html>',
                        { headers: { 'Content-Type': 'text/html' } }
                    );
                })
        );
        return;
    }

    // 2. Static Assets (CSS, JS, Images, Fonts): Stale-While-Revalidate
    if (
        request.destination === 'style' ||
        request.destination === 'script' ||
        request.destination === 'image' ||
        request.destination === 'font' ||
        url.pathname.startsWith('/_next/static/')
    ) {
        event.respondWith(
            caches.match(request).then((cachedResponse) => {
                const fetchPromise = fetch(request)
                    .then((networkResponse) => {
                        if (networkResponse && networkResponse.status === 200) {
                            caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse.clone()));
                        }
                        return networkResponse;
                    })
                    .catch(() => cachedResponse);

                return cachedResponse || fetchPromise;
            })
        );
        return;
    }

    // 3. API Requests: Network-first
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(request).catch(() => {
                return new Response(
                    JSON.stringify({ offline: true, error: 'Offline mode: Network request unavailable' }),
                    { status: 503, headers: { 'Content-Type': 'application/json' } }
                );
            })
        );
        return;
    }
});

// Push Notifications
self.addEventListener('push', (event) => {
    let data = { title: 'Skill2Job.ai Alert', body: 'New opportunity or assessment available!' };
    try {
        if (event.data) data = event.data.json();
    } catch (e) {
        if (event.data) data.body = event.data.text();
    }

    const options = {
        body: data.body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        data: { url: data.url || '/' },
        vibrate: [100, 50, 100]
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
});

// Notification Click: Focus existing client or open new window
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const targetUrl = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            for (const client of windowClients) {
                if (client.url === targetUrl && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
