/*
 * This JS file is run in a service worker context.
 */

/* eslint-disable no-undef */

const CACHE_NAME = '__app_name__placeholder__-cache-__build_hash_placeholder__'
const MESSAGE_PROVISION = 'qui-provision'

let config = null


function formatLogMessage(message) {
    return 'Service Worker: ' + message
}

function logDebug(message) {
    console.debug(formatLogMessage(message))
}

function logInfo(message) {
    console.info(formatLogMessage(message))
}

function logWarn(message) {
    console.warn(formatLogMessage(message))
}

function logError(message) {
    console.error(formatLogMessage(message))
}


function sendClientMessage(message, uncontrolled = false) {
    self.clients.matchAll({includeUncontrolled: uncontrolled}).then(function (clients) {
        clients.forEach(function (client) {
            client.postMessage(message)
        })
    })
}

function shouldCacheRequest(request) {
    if (!config) {
        return false /* Configuration not received yet */
    }

    return (request.url.startsWith(config.appStaticURL) ||
            request.url.startsWith(config.quiStaticURL))
}

function shouldCacheResponse(response) {
    return (response &&
            response.status === 200 &&
            response.type === 'basic')
}

self.addEventListener('activate', function (event) {
    /* Become available to all pages */
    self.clients.claim().then(function () {
        caches.keys().then(function (cacheNames) {
            return Promise.all(cacheNames
                               .filter(cacheName => cacheName !== CACHE_NAME)
                               .map(cacheName => caches.delete(cacheName)))
        })
    })
})

self.addEventListener('fetch', function (event) {
    if (!shouldCacheRequest(event.request)) {
        return
    }

    event.respondWith(
        caches.match(event.request, {ignoreSearch: false}).then(function (response) {
            if (response) {
                return response
            }

            return fetch(event.request.clone()).then(function (response) {
                if (!shouldCacheResponse(response)) {
                    return response
                }

                let responseToCache = response.clone()

                caches.open(CACHE_NAME).then(function (cache) {
                    cache.put(event.request.clone(), responseToCache)
                })

                return response.clone()
            })
        })
    )
})

self.addEventListener('message', function (message) {
    switch (message.data.type) {
        case MESSAGE_PROVISION:
            logInfo('received provisioning data')
            config = message.data.config

            logInfo('clearing cache')
            caches.delete(CACHE_NAME)

            logInfo('skipping waiting')
            self.skipWaiting()
            break

        default:
            logWarn(`unexpected service worker message ${message.data.type}`)
    }
})
