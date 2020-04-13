/*
 * This JS file is run in a service worker context.
 */

/* eslint-disable no-undef */

const MESSAGE_ACTIVATE = 'qui-activate'
const DEF_APP_NAME = 'qui-app'
const DEF_APP_VERSION = 'unknown-version'
const DEF_BUILD_HASH = 'dev'
const DEF_CACHE_URL_REGEX = '.*\\.(svg|png|gif|jpg|jpe?g|ico|woff|html|json|js|css)$'
const DEF_NO_CACHE_URL_REGEX = ('(\\?h=dev)|(&h=dev)')


let cacheName
let devMode = false
let appName = '__app_name_placeholder__'
let appVersion = '__app_version_placeholder__'
let buildHash = '__build_hash_placeholder__'
let cacheURLRegex = '__cache_url_regex_placeholder__'
let noCacheURLRegex = '__no_cache_url_regex_placeholder__'


function setup() {
    /* If webpack did not replace the placeholder... */
    if (appName.startsWith('__app_name_')) {
        appName = DEF_APP_NAME
    }
    if (appName.startsWith('__app_version_')) {
        appVersion = DEF_APP_VERSION
    }
    if (buildHash.startsWith('__build_hash_')) {
        buildHash = DEF_BUILD_HASH
        devMode = true
    }
    if (cacheURLRegex.startsWith('__cache_url_regex_')) {
        cacheURLRegex = DEF_CACHE_URL_REGEX
    }
    if (noCacheURLRegex.startsWith('__no_cache_url_regex_')) {
        noCacheURLRegex = DEF_NO_CACHE_URL_REGEX
    }

    /* Transform into RegExp instance */
    cacheURLRegex = new RegExp(cacheURLRegex, 'i')
    noCacheURLRegex = new RegExp(noCacheURLRegex, 'i')

    cacheName = `${appName}-cache-${buildHash}`
    logDebug(`using cache name ${cacheName}`)
}


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
    return request.url.match(cacheURLRegex) && !request.url.match(noCacheURLRegex)
}

function shouldCacheResponse(response) {
    return (response &&
            response.status === 200 &&
            response.type === 'basic')
}


self.addEventListener('activate', function (event) {

    function deleteCache(name) {
        logDebug(`deleting cache ${name}`)
        caches.delete(name)
    }

    event.waitUntil(
        /* Become available to all pages */
        self.clients.claim().then(function () {
            /* Clear all caches starting with our app name */
            caches.keys().then(function (cacheNames) {
                return Promise.all(cacheNames
                                   .filter(name => name.startsWith(`${appName}-`))
                                   .map(name => deleteCache(name)))
            })
        })
    )
})

self.addEventListener('fetch', function (event) {
    if (devMode) { /* Don't use cache in development mode */
        return
    }
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
                caches.open(cacheName).then(function (cache) {
                    cache.put(event.request.clone(), responseToCache)
                })

                return response.clone()
            })
        })
    )
})

self.addEventListener('message', function (message) {
    switch (message.data.type) {
        case MESSAGE_ACTIVATE:
            logInfo('received activation message')
            self.skipWaiting()
            break

        default:
            logWarn(`unexpected service worker message ${message.data.type}`)
    }
})


setup()
