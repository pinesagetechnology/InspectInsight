// src/service-worker-template.js - Updated for full offline precaching

import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { StaleWhileRevalidate, NetworkFirst, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { clientsClaim } from 'workbox-core';
import { warmStrategyCache } from 'workbox-recipes';

// Claim control immediately
self.skipWaiting();
clientsClaim();

// Define cache names for better organization and cache cleanup
const CACHE_NAMES = {
  runtime: 'runtime-cache',
  js: 'js-chunks-cache-v1',
  static: 'static-resources-v1',
  images: 'images-cache-v1',
  wasm: 'wasm-files-v1',
  fonts: 'google-fonts-v1',
  app: 'app-shell-v1'
};

// Cache name allowlist to protect during cleanup
const RUNTIME_CACHE_WHITELIST = Object.values(CACHE_NAMES);

// Listen for SKIP_WAITING message
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Clean up outdated caches
cleanupOutdatedCaches();

// Routes to precache explicitly - these are the main routes of your app
// This array will be merged with manifest entries from webpack
const ADDITIONAL_ROUTES_TO_CACHE = [
  '/',
  '/Home',
  '/inspectionDetail',
  '/conditionRating',
  '/ifcViewer',
  '/inspectorComments',
  '/inspectionReview',
  '/previousInspection',
  '/previousInspectionDetal'
];

// Get the precache manifest from workbox-webpack-plugin
// This includes all assets processed by webpack
const manifestEntries = self.__WB_MANIFEST || [];

// Add all routes to the precache list
ADDITIONAL_ROUTES_TO_CACHE.forEach(route => {
  // Only add if not already in manifest
  if (!manifestEntries.some(entry => entry.url === route)) {
    manifestEntries.push({ url: route, revision: null });
  }
});

// Precache all assets and routes
precacheAndRoute(manifestEntries);

// *** NAVIGATION HANDLING ***
// Handle navigation requests with a special strategy
// This ensures your SPA works properly in offline mode
const handler = createHandlerBoundToURL('/index.html');
const navigationRoute = new NavigationRoute(handler, {
  // Exclude specific URLs from being handled by this route
  // For example, API calls shouldn't serve the index.html
  denylist: [
    /^\/_/,
    /\/api\//,
    /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
    /\.(?:js|css|wasm|json|webmanifest)$/
  ]
});
registerRoute(navigationRoute);

// *** STRATEGIC CACHING ***

// WASM files - critical for WASM-dependent applications
registerRoute(
  ({ url }) => url.pathname.endsWith('.wasm'),
  new NetworkFirst({
    cacheName: CACHE_NAMES.wasm,
    networkTimeoutSeconds: 10,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);

// JavaScript chunks - critical for app functionality
registerRoute(
  ({ request }) => request.destination === 'script' || request.url.includes('.chunk.js'),
  new NetworkFirst({
    cacheName: CACHE_NAMES.js,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
      }),
    ],
  })
);

// Google Fonts stylesheets
registerRoute(
  ({ url }) => url.origin === 'https://fonts.googleapis.com',
  new NetworkFirst({
    cacheName: CACHE_NAMES.fonts,
  })
);

// Google Fonts files
registerRoute(
  ({ url }) => url.origin === 'https://fonts.gstatic.com',
  new CacheFirst({
    cacheName: CACHE_NAMES.fonts,
    plugins: [
      new ExpirationPlugin({
        maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
        maxEntries: 30,
      }),
    ],
  })
);

// Images
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: CACHE_NAMES.images,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);

// Captured images from camera
registerRoute(
  ({ request, url }) => request.destination === 'image' && url.pathname.includes('camera_'),
  new CacheFirst({
    cacheName: CACHE_NAMES.images,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
      }),
    ],
  })
);

// Static assets (CSS, other)
registerRoute(
  ({ request }) =>
    request.destination === 'style' ||
    request.destination === 'font' ||
    request.url.endsWith('.css'),
  new StaleWhileRevalidate({
    cacheName: CACHE_NAMES.static,
  })
);

// IFC models
registerRoute(
  ({ request }) => request.url.endsWith('.ifc'),
  new CacheFirst({
    cacheName: CACHE_NAMES.static,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
      }),
    ],
  })
);

// API requests - for offline support with fallback data
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-responses',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 24 * 60 * 60, // 1 day
      }),
    ],
  })
);

// Health check endpoint - never cache
registerRoute(
  ({ url }) => url.pathname.endsWith('/health'),
  new NetworkFirst({
    plugins: [
      {
        fetchDidFail: async () => console.log('Health check failed - network unavailable'),
      },
    ],
  })
);

// *** WARMUP STRATEGY ***
// This pre-fetches URLs to ensure they're in the cache
// We define routes we want to explicitly warm up

// Create a list of URLs to warm up
const urlsToWarm = [
  '/',
  '/index.html',
  '/Home',
  '/inspectionDetail',
  '/conditionRating',
  '/ifcViewer',
  '/inspectorComments',
  '/inspectionReview',
  '/previousInspection',
  // Add all your critical JS chunks here
  '/main.js',
  '/runtime.js',
  // Add your WASM files
  '/web-ifc.wasm',
  '/web-ifc-mt.wasm'
];

// Create a warm-up strategy for the cache
const warmupStrategy = new CacheFirst({
  cacheName: CACHE_NAMES.app,
  plugins: [
    new ExpirationPlugin({
      maxEntries: 100,
      maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
    }),
  ],
});

// Warm the strategy cache with these URLs
warmStrategyCache({
  urls: urlsToWarm,
  strategy: warmupStrategy,
});

// *** INSTALLATION EVENTS ***
// Add an offline fallback page during installation
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      // Cache offline fallback
      caches.open('offline-fallbacks').then((cache) => {
        return cache.add('/offline.html');
      }),

      // Pre-cache critical assets (if not already handled by precacheAndRoute)
      caches.open(CACHE_NAMES.app).then((cache) => {
        return cache.addAll(urlsToWarm);
      })
    ])
  );
});

// *** ACTIVATION EVENTS ***
// Handle cache cleanup on activate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!RUNTIME_CACHE_WHITELIST.includes(cacheName)) {
            console.log('Deleting out of date cache:', cacheName);
            return caches.delete(cacheName);
          }
          return Promise.resolve();
        })
      );
    })
  );
});

// Special fetch handler for offline navigation fallback
self.addEventListener('fetch', (event) => {
  // Handle navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // Try to get from cache first
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) {
            return cachedResponse;
          }

          // Try network if not in cache
          try {
            const networkResponse = await fetch(event.request);
            return networkResponse;
          } catch (networkError) {
            // If network fails and it's a navigation request, serve the app shell
            const cache = await caches.open(CACHE_NAMES.app);

            // First try to get the exact URL from cache
            let response = await cache.match(event.request);
            if (response) return response;

            // If not found, try to get index.html (app shell)
            response = await cache.match('/index.html');
            if (response) return response;

            // As a last resort, try the offline page
            const offlineCache = await caches.open('offline-fallbacks');
            response = await offlineCache.match('/offline.html');
            return response || Response.error();
          }
        } catch (error) {
          console.error('Navigation request failed:', error);
          // Return a custom offline response
          return new Response('You are offline and this page is not cached.', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain',
            }),
          });
        }
      })()
    );
  }
});