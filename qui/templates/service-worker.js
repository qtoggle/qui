/*
 * This JS file is run in a service worker context.
 */

/* eslint-disable no-undef */

const MESSAGE_ACTIVATE = 'qui-activate'
const DEF_APP_NAME = 'qui-app'
const DEF_APP_VERSION = 'default-version'
const DEF_BUILD_HASH = 'default-hash'
const DEF_CACHE_URL_REGEX = '.*\\.(svg|png|gif|jpg|jpe?g|ico|woff|html|json|js|css)$'


let cacheName
let debug = false
let appName = '__app_name_placeholder__'
let appVersion = '__app_version_placeholder__'
let buildHash = '__build_hash_placeholder__'
let cacheURLRegex = '__cache_url_regex_placeholder__'
let queryArguments = null


function getQueryArgument(name, def = null) {
    if (queryArguments == null) {
        let queryString = self.location.search.substring(1)
        queryArguments = new Map(queryString.split('&').map(function (keyValuePair) {
            let splits = keyValuePair.split('=');
            let key = decodeURIComponent(splits[0]);
            let value = decodeURIComponent(splits[1]);
            if (value.indexOf(',') >= 0) {
                value = value.split(',');
            }

            return [key, value];
        }))
    }

    let value = queryArguments.get(name)
    if (value == null) {
        value = def
    }

    return value
}

function setup() {
    /* If webpack did not replace the placeholder... */
    if (appName.startsWith('__app_name_')) {
        appName = DEF_APP_NAME
    }
    if (appVersion.startsWith('__app_version_')) {
        appVersion = DEF_APP_VERSION
    }
    if (buildHash.startsWith('__build_hash_')) {
        buildHash = getQueryArgument('h', DEF_BUILD_HASH)
    }
    if (cacheURLRegex.startsWith('__cache_url_regex_')) {
        cacheURLRegex = DEF_CACHE_URL_REGEX
    }
    if (getQueryArgument('debug') === 'true') {
        debug = true
    }

    /* Transform into RegExp instance */
    cacheURLRegex = new RegExp(cacheURLRegex, 'i')

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
    return request.url.match(cacheURLRegex) && (request.method === 'GET')
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
    if (debug) { /* Don't use cache in debug mode */
        return
    }
    if (!shouldCacheRequest(event.request)) {
        return
    }

    let url = event.request.url
    /* Ensure URL has build hash */
    if (!url.includes('?h=') && !url.includes('&h=')) {
        if (url.includes('?')) {
            url += `&h=${buildHash}`
        }
        else {
            url += `?h=${buildHash}`
        }
    }

    let request = new Request(url, event.request)

    event.respondWith(
        caches.match(request, {ignoreSearch: false}).then(function (response) {
            if (response) {
                return response
            }

            return fetch(request.clone()).then(function (response) {
                if (!shouldCacheResponse(response)) {
                    return response
                }

                let responseToCache = response.clone()
                caches.open(cacheName).then(function (cache) {
                    cache.put(request.clone(), responseToCache)
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
