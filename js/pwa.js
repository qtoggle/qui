/**
 * @namespace qui.pwa
 */

import Logger from '$qui/lib/logger.module.js'

import Signal            from '$qui/base/signal.js'
import Config            from '$qui/config.js'
import {appendBuildHash} from '$qui/utils/misc.js'
import URL               from '$qui/utils/url.js'
import * as Window       from '$qui/window.js'
import {AssertionError}  from '$qui/base/errors.js'


const SERVICE_WORKER_SCRIPT = 'service-worker.js'
const SERVICE_WORKER_MESSAGE_PROVISION = 'qui-provision'

const MANIFEST_FILE = 'manifest.json'

const logger = Logger.get('qui.pwa')

let manifestURL /* undefined, by default */
let serviceWorker = null
let pendingServiceWorker = null

/**
 * Emitted when a service worker controlling this client becomes ready. Handlers are called with the following
 * parameters:
 *  * `serviceWorker`, the controlling service worker
 *  * `oldServiceWorker`, the previously controlling service worker, which can be `null`, if the client has just
 *  installed the first service worker for this app's scope
 * @type {qui.base.Signal}
 */
export const serviceWorkerReadySignal = new Signal()

/**
 * Emitted whenever a message is received from the controlling service worker. Handlers are called with the following
 * parameters:
 *  * `serviceWorker`, the new controlling service worker
 *  * `message`, the incoming message
 * @type {qui.base.Signal}
 */
export const serviceWorkerMessageSignal = new Signal()


function handleServiceWorkerReady(sw) {
    /* We need to protect against double call, since handleServiceWorkerReady() may have two calling sources */
    if (sw === serviceWorker) {
        return
    }

    logger.info('service worker ready')
    serviceWorkerReadySignal.emit(sw, serviceWorker)
    serviceWorker = sw
}

function handleServiceWorkerUpdate(sw) {
    /* We need to protect against double call, since handleServiceWorkerUpdate() may have two calling sources */
    if (sw === pendingServiceWorker) {
        return
    }

    pendingServiceWorker = sw

    logger.info('service worker updated')
    provisionServiceWorker(sw)

    if (sw.state === 'activated') {
        if (serviceWorker !== sw) {
            handleServiceWorkerReady(sw)
        }
    }
    else {
        sw.addEventListener('statechange', function () {
            if (sw.state === 'activated') {
                if (serviceWorker !== sw) {
                    handleServiceWorkerReady(sw)
                }
            }
        })
    }
}

function provisionServiceWorker(sw) {
    logger.info('provisioning service worker')
    let message = {
        type: SERVICE_WORKER_MESSAGE_PROVISION,
        config: Config.dump()
    }

    sw.postMessage(message)
}

function handleServiceWorkerMessage(message) {
    logger.debug(`received service worker message: ${message.data}`)
    serviceWorkerMessageSignal.emit(serviceWorker, message.data)
}


/**
 * Enable the service worker functionality.
 * @param {String} [url] URL at which the service worker lives; {@link qui.config.navigationBasePrefix} +
 * `"/service-worker.js"` will be used by default
 * @alias qui.pwa.enableServiceWorker
 */
export function enableServiceWorker(url = null) {
    if (!('serviceWorker' in navigator)) {
        throw new Error('service workers not supported')
    }

    if (!url) {
        url = `${Config.navigationBasePrefix}/${SERVICE_WORKER_SCRIPT}`
    }

    navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage)

    navigator.serviceWorker.addEventListener('controllerchange', function (event) {
        if (event.target && event.target.controller) {
            handleServiceWorkerUpdate(event.target.controller)
        }
    })

    navigator.serviceWorker.ready.then(function (registration) {
        handleServiceWorkerReady(registration.active)
    })

    navigator.serviceWorker.register(url).then(function (registration) {
        logger.info(`service worker registered with scope "${registration.scope}"`)
        registration.update() /* Manually trigger an update on each refresh */
        registration.addEventListener('updatefound', function () {
            let sw = registration.installing || registration.waiting || registration.active
            if (sw) {
                handleServiceWorkerUpdate(sw)
            }
        })
    }).catch(function (e) {
        logger.error(`service worker registration failed: ${e}`)
    })

    logger.debug(`service worker setup with URL = "${url}"`)
}

/**
 * Return the service worker that currently controls the client.
 * @returns {?ServiceWorker}
 */
export function getServiceWorker() {
    return serviceWorker
}

/**
 * Send a message to the controlling service worker.
 * @param {*} message the message to send
 */
export function sendServiceWorkerMessage(message) {
    if (!serviceWorker) {
        throw new AssertionError('Attempt to send service worker message from uncontrolled client')
    }

    serviceWorker.postMessage(message)
}

function setManifestURL(url = null, prettyName = null, description = null) {
    let manifest = Window.$document.find('link[rel=manifest]')
    if (!manifest.length) {
        throw new Error('Manifest link element not found')
    }

    if (!url) {
        url = window.location.pathname
        if (!url.endsWith('/')) {
            url += '/'
        }

        url += MANIFEST_FILE
        url = appendBuildHash(url)
    }

    if (prettyName != null || description != null) {
        url = URL.parse(url)
        if (prettyName != null) {
            url.query['pretty_name'] = prettyName
        }
        if (description != null) {
            url.query['description'] = description
        }
        url = url.toString()
    }

    manifest.attr('href', url)

    logger.debug(`manifest setup with URL = "${url}"`)
}

/**
 * Setup the web app manifest. When called without arguments, enables the automatic manifest updating mechanism. That
 * is, {@link qui.pwa.updateManifest} will be automatically called each time the navigation state changes.
 * @alias qui.pwa.setupManifest
 * @param {String} [url] the URL where the manifest file lives; the current browser location path + `"/manifest.json"`
 * will be used if not specified
 * @param {String} [prettyName] an optional pretty name to append to the URL as a query argument (must be handled by the
 * template rendering engine on the server side)
 * @param {String} [description] an optional description to append to the URL as a query argument (must be handled by
 * the template rendering engine on the server side)
 */
export function setupManifest(url = null, prettyName = null, description = null) {
    manifestURL = url

    setManifestURL(url, prettyName, description)
}

/**
 * Update the web app manifest to reflect the current page location path. This function has no effect if
 * {@link qui.pwa.setupManifest} has been previously called with a non-`null` URL parameter or it hasn't been called at
 * all.
 * @alias qui.pwa.updateManifest
 */
export function updateManifest() {
    if (manifestURL !== null) {
        return
    }

    let prettyName = document.title

    setManifestURL(/* url = */ null, /* prettyName = */ prettyName)
}
