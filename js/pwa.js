/**
 * @namespace qui.pwa
 */

import Logger from '$qui/lib/logger.module.js'

import ConditionVariable from '$qui/base/condition-variable.js'
import {AssertionError}  from '$qui/base/errors.js'
import Signal            from '$qui/base/signal.js'
import Config            from '$qui/config.js'
import * as QUI          from '$qui/index.js'
import * as Navigation   from '$qui/navigation.js'
import * as Theme        from '$qui/theme.js'
import {appendBuildHash} from '$qui/utils/misc.js'
import * as PromiseUtils from '$qui/utils/promise.js'
import URL               from '$qui/utils/url.js'
import * as Window       from '$qui/window.js'


const SERVICE_WORKER_SCRIPT = 'service-worker.js'
const SERVICE_WORKER_MESSAGE_ACTIVATE = 'qui-activate'

const MANIFEST_FILE = 'manifest.json'

const logger = Logger.get('qui.pwa')

let manifestParams = {}
let serviceWorker = null
let serviceWorkerUpdateCalled = false /* duplicate call protection */
let installElementHandler = null
let installResponseHandler = null
let installPrompted = false

/**
 * A condition that is fulfilled as soon as this client becomes controlled by a service worker.
 * The condition is passed the service worker as parameter.
 * @type {qui.base.ConditionVariable}
 */
export let whenServiceWorkerReady = new ConditionVariable()

/**
 * Emitted whenever a message is received from the controlling service worker. Handlers are called with the following
 * parameters:
 *  * `serviceWorker`, the new controlling service worker
 *  * `message`, the incoming message
 * @type {qui.base.Signal}
 */
export const serviceWorkerMessageSignal = new Signal()


function handleServiceWorkerUpdate(sw, updateHandler) {
    if (serviceWorkerUpdateCalled) {
        return
    }

    serviceWorkerUpdateCalled = true

    logger.info('service worker updated')

    if (updateHandler) {
        let result = updateHandler(sw)
        if (result) {
            if (result.then) { /* A promise */
                result.then(function () {
                    provisionServiceWorker(sw)
                }).catch(() => {})
            }
            else { /* Assuming a true value */
                provisionServiceWorker(sw)
            }
        }
    }
    else {
        provisionServiceWorker(sw)
    }
}

function handleServiceWorkerReady(sw) {
    logger.info('service worker is ready')
    serviceWorker = sw
    whenServiceWorkerReady.fulfill(serviceWorker)
}

function provisionServiceWorker(sw) {
    logger.info('provisioning service worker')
    let message = {
        type: SERVICE_WORKER_MESSAGE_ACTIVATE,
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
 *
 * @param {String} [url] URL at which the service worker lives; {@link qui.config.navigationBasePrefix} +
 * `"/service-worker.js"` will be used by default
 * @param {Function} [updateHandler] a function to be called when the service worker is updated; should return a promise
 * that will be used to control the activation of the new service worker
 * @alias qui.pwa.enableServiceWorker
 */
export function enableServiceWorker(url = null, updateHandler = null) {
    if (!('serviceWorker' in navigator)) {
        throw new Error('service workers not supported')
    }

    if (!url) {
        url = `${Config.navigationBasePrefix}/${SERVICE_WORKER_SCRIPT}`
    }

    url = appendBuildHash(url)
    if (Config.debug) {
        url += '&debug=true'
    }

    navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage)

    let refreshing = false
    navigator.serviceWorker.addEventListener('controllerchange', function () {
        if (refreshing) {
            return
        }

        refreshing = true
        Window.reload()
    })

    navigator.serviceWorker.ready.then(function (registration) {
        handleServiceWorkerReady(registration.active)
    })

    navigator.serviceWorker.register(url).then(function (registration) {
        logger.info(`service worker registered with scope "${registration.scope}"`)
        registration.update() /* Manually trigger an update on each refresh */

        function awaitStateChange() {
            registration.installing.addEventListener('statechange', function () {
                if (this.state === 'installed') {
                    handleServiceWorkerUpdate(this, updateHandler)
                }
            })
        }

        if (registration.waiting) {
            return handleServiceWorkerUpdate(registration.waiting, updateHandler)
        }

        if (registration.installing) {
            awaitStateChange()
        }

        registration.addEventListener('updatefound', awaitStateChange)

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

/**
 * A handler function responsible for providing a clickable element that prompts user for app installation.
 * @callback qui.pwa.InstallElementHandler
 * @returns {Promise<jQuery>} a promise that resolves to a clickable element that prompts for app installation upon
 * click
 */

/**
 * A handler function called after the user responds to installation prompt.
 * @callback qui.pwa.InstallResponseHandler
 * @param {Boolean} accepted indicates whether user accepted installation or not
 */

/**
 * Configures the handler functions for the app installation.
 *
 * This must be called before {@link qui.init}.
 *
 * @alias qui.pwa.setInstallHandlers
 * @param {qui.pwa.InstallElementHandler} elementHandler
 * @param {?qui.pwa.InstallResponseHandler} [responseHandler]
 */
export function setInstallHandlers(elementHandler, responseHandler = null) {
    installElementHandler = elementHandler
    installResponseHandler = responseHandler
}

/**
 * Setup the web app manifest.
 * @alias qui.pwa.setupManifest
 * @param {String} [url] the URL where the manifest file lives; {@link qui.config.navigationBasePrefix} +
 * `"/manifest.json"` will be used if not specified
 * @param {String} [displayName] an optional display name to append to the URL as a query argument (must be handled by
 * the template rendering engine on the server side); defaults to {@link qui.config.appDisplayName}
 * @param {String} [displayShortName] an optional short display name to append to the URL as a query argument (must be
 * handled by the template rendering engine on the server side)
 * @param {String} [description] an optional description to append to the URL as a query argument (must be handled by
 * the template rendering engine on the server side)
 * @param {String} [version] an optional version to append to the URL as a query argument (must be handled by the
 * template rendering engine on the server side)
 * @param {String} [themeColor] an optional theme color to append to the URL as a query argument (must be handled by the
 * template rendering engine on the server side); defaults to `@interactive-color`
 * @param {String} [backgroundColor] an optional background color to append to the URL as a query argument (must be
 * handled by the template rendering engine on the server side); defaults to `@background-color`
 */
export function setupManifest({
    url = `${Config.navigationBasePrefix}/${MANIFEST_FILE}`,
    displayName = Config.appDisplayName,
    displayShortName = null,
    description = null,
    version = null,
    themeColor = Theme.getColor('@interactive-color'),
    backgroundColor = Theme.getColor('@background-color')
} = {}) {
    manifestParams = {
        url,
        displayName,
        displayShortName,
        description,
        version,
        themeColor,
        backgroundColor
    }

    let manifest = Window.$document.find('link[rel=manifest]')
    if (!manifest.length) {
        throw new Error('Manifest link element not found')
    }

    url = appendBuildHash(url)

    let parsedURL = URL.parse(url)
    if (displayName != null) {
        parsedURL.query['display_name'] = displayName
    }
    if (displayShortName != null) {
        parsedURL.query['display_short_name'] = displayShortName
    }
    if (description != null) {
        parsedURL.query['description'] = description
    }
    if (version != null) {
        parsedURL.query['version'] = version
    }
    if (themeColor != null) {
        parsedURL.query['theme_color'] = themeColor
    }
    if (backgroundColor != null) {
        parsedURL.query['background_color'] = backgroundColor
    }
    url = parsedURL.toString()

    manifest.attr('href', url)

    logger.debug(`manifest setup with URL = "${url}"`)
}

export function init() {
    Window.$window.on('beforeinstallprompt', function (e) {
        logger.debug('received install prompt event')
        if (installElementHandler) {
            let promptEvent = e.originalEvent
            promptEvent.preventDefault()

            if (installPrompted) {
                logger.debug('ignoring subsequent install prompt event')
                return
            }

            installPrompted = true

            /* Don't call the install handler before QUI & initial navigation are ready, as it will probably use UI
             * elements that need to be initialized first; add an extra delay to allow the UI animations to settle */
            Promise.all([QUI.whenReady, Navigation.whenInitialNavigationReady]).then(function () {
                return PromiseUtils.later(1000)
            }).then(function () {
                logger.debug('calling install handler')
                installElementHandler().then(function (element) {
                    element.on('click', function clickHandler() {
                        element.off('click', clickHandler) /* Don't prompt again */

                        promptEvent.prompt()
                        promptEvent.userChoice.then(function (choiceResult) {
                            if (choiceResult.outcome === 'accepted') {
                                logger.info('user accepted installation')
                                if (installResponseHandler) {
                                    installResponseHandler(true)
                                }
                            }
                            else {
                                logger.info('user rejected installation')
                                if (installResponseHandler) {
                                    installResponseHandler(false)
                                }
                            }
                        })
                    })
                }).catch(() => {})
            })
        }
    })
}
