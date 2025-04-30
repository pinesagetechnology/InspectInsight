import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, NetworkFirst, CacheFirst, NetworkOnly } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { clientsClaim } from 'workbox-core';

const RUNTIME_CACHE_WHITELIST = [
  'wasm-files',
  'google-fonts-stylesheets',
  'google-fonts-webfonts',
  'images',
  'static-resources',
  'offline-fallbacks',
  'js-chunks',
  'js-files'
];

self.skipWaiting();
clientsClaim();

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
  ({ url }) => url.pathname.endsWith('.wasm'),
  new NetworkFirst({ cacheName: 'wasm-files', networkTimeoutSeconds: 10 })
);

registerRoute(
  ({ url }) => url.origin === 'https://fonts.googleapis.com',
  new StaleWhileRevalidate({ cacheName: 'google-fonts-stylesheets' })
);

registerRoute(
  ({ url }) => url.origin === 'https://fonts.gstatic.com',
  new CacheFirst({
    cacheName: 'google-fonts-webfonts',
    plugins: [
      new ExpirationPlugin({ maxAgeSeconds: 60 * 60 * 24 * 365, maxEntries: 30 })
    ]
  })
);

// 🔧 New JS Caching Rules
registerRoute(
  ({ url }) => url.pathname.endsWith('.js'),
  new CacheFirst({
    cacheName: 'js-chunks',
    plugins: [
      new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 7 * 24 * 60 * 60 })
    ]
  })
);

registerRoute(
  ({ request }) => request.destination === 'script',
  new StaleWhileRevalidate({ cacheName: 'js-files' })
);

registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 })
    ]
  })
);

registerRoute(
  ({ request, url }) => request.destination === 'image' && url.pathname.includes('camera_'),
  new CacheFirst({
    cacheName: 'captured-images',
    plugins: [
      new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 7 * 24 * 60 * 60 })
    ]
  })
);

registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkOnly({
    cacheName: 'api-responses',
    plugins: [
      new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 24 * 60 * 60 })
    ]
  })
);

registerRoute(
  ({ url }) => url.pathname.endsWith('/health'),
  new NetworkOnly({
    plugins: [{ fetchDidFail: async () => console.log('Health check failed - network unavailable') }]
  })
);

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.pathname.endsWith('.wasm')) {
    console.log('[SW] Bypassing .wasm fetch for:', url.pathname);
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const preloadResponse = await event.preloadResponse;
          if (preloadResponse) return preloadResponse;

          return await fetch(event.request);
        } catch (error) {
          const cache = await caches.open('offline-fallbacks');
          return await cache.match('/offline.html') || Response.error();
        }
      })()
    );
  }
});

registerRoute(
  ({ request }) => request.destination === 'style' || request.destination === 'font',
  new StaleWhileRevalidate({ cacheName: 'static-resources' })
);

registerRoute(
  ({ request }) => request.url.endsWith('.ifc'),
  new CacheFirst({
    cacheName: 'ifc-models',
    plugins: [
      new ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 7 * 24 * 60 * 60 })
    ]
  })
);

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('offline-fallbacks').then((cache) => {
      return cache.add('/offline.html');
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(cacheName => {
          if (!RUNTIME_CACHE_WHITELIST.includes(cacheName)) {
            return caches.delete(cacheName);
          }
          return Promise.resolve();
        })
      )
    )
  );
});
