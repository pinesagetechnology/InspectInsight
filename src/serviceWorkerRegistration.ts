// src/serviceWorkerRegistration.ts - Updated for more reliable registration and precaching

type Config = {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onOffline?: () => void;
  onFailed?: (error: Error) => void;
};

// Define whether the current environment is localhost
const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

// Register the service worker
export function register(config?: Config): void {
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    console.log('Service Worker registration starting...');

    // The URL constructor is available in all browsers that support SW
    const publicUrl = new URL(process.env.PUBLIC_URL || '', window.location.href);

    // Our service worker won't work if PUBLIC_URL is on a different origin
    // from what our page is served on. This might happen if a CDN is used to
    // serve assets; see https://github.com/facebook/create-react-app/issues/2374
    if (publicUrl.origin !== window.location.origin) {
      console.log('Service Worker skipped - different origin');
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      if (isLocalhost) {
        // This is running on localhost. Let's check if a service worker still exists or not.
        checkValidServiceWorker(swUrl, config);

        // Add some additional logging to localhost
        navigator.serviceWorker.ready.then(() => {
          console.log('Service Worker ready on localhost');
        });
      } else {
        // Is not localhost. Just register service worker
        registerValidSW(swUrl, config);
      }
    });

    // Add offline/online event listeners to manage offline state
    window.addEventListener('offline', () => {
      console.log('App is offline');
      if (config?.onOffline) config.onOffline();
    });

    window.addEventListener('online', () => {
      console.log('App is back online - checking for updates');
      navigator.serviceWorker.ready.then(registration => {
        // When coming back online, check for updates
        registration.update().catch(err => {
          console.error('SW update after reconnection failed:', err);
        });
      });
    });
  } else {
    console.log('Service Worker registration skipped - not in production or not supported');
  }
}

// Register a valid service worker with enhanced error handling and logging
function registerValidSW(swUrl: string, config?: Config) {
  navigator.serviceWorker
    .register(swUrl, { scope: '/' })
    .then((registration) => {
      console.log('Service Worker registered successfully');

      // Enable periodic background sync if supported
      if ('periodicSync' in registration) {
        const enablePeriodicBackgroundSync = async () => {
          try {
            // @ts-ignore - TS doesn't know about periodicSync yet
            const status = await navigator.permissions.query({
              name: 'periodic-background-sync' as PermissionName,
            });

            if (status.state === 'granted') {
              try {
                // @ts-ignore
                await registration.periodicSync.register('content-sync', {
                  minInterval: 24 * 60 * 60 * 1000, // 24 hours
                });
                console.log('Periodic background sync registered');
              } catch (e) {
                console.error('Error registering periodic background sync', e);
              }
            }
          } catch (e) {
            console.log('Periodic background sync not supported');
          }
        };

        enablePeriodicBackgroundSync();
      }

      // Check for updates immediately
      registration.update().catch(err => {
        console.error('Initial SW update failed:', err);
      });

      // Set up a periodic check for SW updates (every hour)
      const updateInterval = setInterval(() => {
        try {
          if (navigator.onLine) {
            registration.update();
            console.log('Checking for Service Worker updates');
          }
        } catch (error) {
          console.error('Error checking for SW updates:', error);
          // If there's a persistent error, stop trying
          if (error instanceof Error &&
            (error.message.includes('Failed to update') ||
              error.message.includes('connection is closing'))) {
            clearInterval(updateInterval);
            console.log('Stopped SW update checks due to persistent errors');
          }
        }
      }, 1000 * 60 * 60); // Check every hour

      // Handle waiting worker - update available
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }

        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // At this point, the updated content has been fetched
              console.log('New content is available and will be used when all tabs are closed');

              // Execute callback
              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              // At this point, everything has been precached
              console.log('Content is cached for offline use');

              // Execute callback
              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('Error during service worker registration:', error);
      if (config?.onFailed) config.onFailed(error);
    });
}

// Check if the service worker can be found. If it can't, reload the page.
function checkValidServiceWorker(swUrl: string, config?: Config) {
  // Check if the service worker can be found
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then((response) => {
      // Ensure service worker exists, and that we really are getting a JS file.
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        // No service worker found. Probably a different app. Reload the page.
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        // Service worker found. Proceed as normal.
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log('No internet connection found. App is running in offline mode.');
      if (config?.onOffline) config.onOffline();
    });
}

// Send message to the service worker to skip waiting
export function sendSkipWaitingMessage(registration: ServiceWorkerRegistration) {
  if (registration && registration.waiting) {
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }
}

// Force update - can be called when user manually requests refresh
export function forceUpdate(): Promise<void> {
  if ('serviceWorker' in navigator) {
    return navigator.serviceWorker.ready
      .then(registration => {
        return registration.update()
          .then(() => {
            console.log('Service worker updated successfully');
          });
      })
      .catch(err => {
        console.error('Failed to update service worker', err);
        throw err;
      });
  }
  return Promise.resolve();
}

// Get the current registration - useful for components that need to work with the SW
export function getRegistration(): Promise<ServiceWorkerRegistration | null> {
  if ('serviceWorker' in navigator) {
    return navigator.serviceWorker.ready
      .then(registration => registration)
      .catch(() => null);
  }
  return Promise.resolve(null);
}

// Unregister the service worker
export function unregister(): void {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}