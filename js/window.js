/**
 * @namespace qui.window
 */

import $      from '$qui/lib/jquery.module.js'
import Logger from '$qui/lib/logger.module.js'

import Signal    from '$qui/base/signal.js'
import Config    from '$qui/config.js'
import * as AJAX from '$qui/utils/ajax.js'
import {asap}    from '$qui/utils/misc.js'


const logger = Logger.get('qui.window')

let unloading = false
let reloading = false
let smallScreenThreshold = null
let scalingFactor = null
let appActive = false
let appFocused = false


/**
 * jQuery-wrapped document object.
 * @alias qui.window.$document
 * @type {jQuery}
 */
export let $document = null

/**
 * jQuery-wrapped window object.
 * @alias qui.window.$window
 * @type {jQuery}
 */
export let $window = null

/**
 * jQuery-wrapped document body object.
 * @alias qui.window.$body
 * @type {jQuery}
 */
export let $body = null

/**
 * Emitted whenever the window is resized. Handlers are called with the following parameters:
 *  * `width: Number`, the new window width
 *  * `height: Number`, the new window height
 * @alias qui.window.resizeSignal
 */
export const resizeSignal = new Signal()

/**
 * Emitted whenever the screen layout changes. Handlers are called with the following parameters:
 *  * `smallScreen: Boolean`, telling if the screen is small, as defined by {@link qui.window.isSmallScreen}
 *  * `landscape: Boolean`, telling if the screen orientation is landscape
 * @alias qui.window.screenLayoutChangeSignal
 */
export const screenLayoutChangeSignal = new Signal()

/**
 * Emitted whenever the application enters or leaves full-screen mode. Handlers are called with the following
 * parameters:
 *  * `fullScreen`, telling if the application is currently in full-screen mode, nor not: `Boolean`
 * @alias qui.window.fullScreenChangeSignal
 */
export const fullScreenChangeSignal = new Signal()

/**
 * Emitted whenever the application window becomes focused or is no longer focused. Handlers are called with the
 * following parameters:
 *  * `focused: Boolean`, telling if the application is focused or not
 * @alias qui.window.focusChangeSignal
 */
export const focusChangeSignal = new Signal()

/**
 * Emitted whenever the application window becomes active or is no longer active. Handlers are called with the
 * following parameters:
 *  * `active: Boolean`, telling if the application is active or not
 * @alias qui.window.activeChangeSignal
 */
export const activeChangeSignal = new Signal()

/**
 * Emitted when the application window is about to be closed. Handlers are called with no parameters. If any of the
 * handlers returns `false`, window closing will be prevented, if possible.
 * @alias qui.window.closeSignal
 */
export const closeSignal = new Signal()


/* Full screen */

function handleEnterFullScreen() {
    $body.addClass('full-screen')
    logger.debug('entering full screen')
}

function handleExitFullScreen() {
    $body.removeClass('full-screen')
    logger.debug('full screen exited')
}

/**
 * Put the window full-screen mode.
 * @alias qui.window.enterFullScreen
 */
export function enterFullScreen() {
    document.documentElement.requestFullscreen()
}

/**
 * Tell whether the browser window is in full-screen mode or not.
 * @alias qui.window.isFullScreen
 * @returns {Boolean}
 */
export function isFullScreen() {
    return document.fullscreenEnabled != null
}


/* Screen size & layout */

function handleSmallScreen() {
    logger.debug('small screen mode')
}

function handleLargeScreen() {
    logger.debug('large screen mode')
}

function handleLandscape() {
    logger.debug('landscape mode')
}

function handlePortrait() {
    logger.debug('portrait mode')
}

/**
 * @private
 * @returns {Boolean}
 */
function evaluateScreenLayout() {
    let smallScreen = isSmallScreen()
    let landscape = isLandscape()
    let changed = false

    if (smallScreen && !$body.hasClass('small-screen')) {
        $body.addClass('small-screen')
        handleSmallScreen()
        changed = true
    }
    else if (!smallScreen && $body.hasClass('small-screen')) {
        $body.removeClass('small-screen')
        handleLargeScreen()
        changed = true
    }

    if (landscape && !$body.hasClass('landscape')) {
        $body.addClass('landscape')
        handleLandscape()
        changed = true
    }
    else if (!landscape && $body.hasClass('landscape')) {
        $body.removeClass('landscape')
        handlePortrait()
        changed = true
    }

    if (changed) {
        screenLayoutChangeSignal.emit(smallScreen, landscape)
    }

    return changed
}

/**
 * Tell whether the screen is small or not. A screen is considered small if its width is below a *small*
 * threshold.
 * @alias qui.window.isSmallScreen
 * @returns {Boolean}
 */
export function isSmallScreen() {
    return document.documentElement.clientWidth <= smallScreenThreshold * scalingFactor
}

/**
 * Tell the current small screen threshold.
 * @alias qui.window.getSmallScreenThreshold
 * @returns {Number}
 */
export function getSmallScreenThreshold() {
    return smallScreenThreshold
}

/**
 * Set the small screen threshold. Defaults to `700` logical pixels.
 *
 * You can set the threshold to `0` to disable small screen mode; setting it to a large number (e.g. `1e6`) ensures that
 * small screen mode is always active.
 *
 * This function may force-close current pages and re-navigate to the current path, if screen layout is changed.
 *
 * @alias qui.window.setSmallScreenThreshold
 * @param {?Number} threshold small screen threshold, in logical pixels; passing `null` will reset to default
 */
export function setSmallScreenThreshold(threshold) {
    logger.debug(`setting small screen threshold to ${threshold} pixels`)
    smallScreenThreshold = threshold
    if (smallScreenThreshold == null) {
        smallScreenThreshold = Config.defaultSmallScreenThreshold
    }

    if ($body != null) {
        evaluateScreenLayout()
    }
}

/**
 * Tell if the screen orientation is landscape (`true`) or portrait (`false`).
 * @alias qui.window.isLandscape
 * @returns {Boolean}
 */
export function isLandscape() {
    let width = document.documentElement.clientWidth
    let height = document.documentElement.clientHeight

    return width >= height
}

/**
 * Tell the current scaling factor.
 * @alias qui.window.getScalingFactor
 * @returns {Number}
 */
export function getScalingFactor() {
    return scalingFactor
}

/**
 * Set the root scaling factor. Use `1` to disable scaling.
 *
 * This function may force-close current pages and re-navigate to the current path, if screen layout is changed.
 *
 * @alias qui.window.setScalingFactor
 * @param {Number} factor
 */
export function setScalingFactor(factor) {
    logger.debug(`setting scaling factor to ${factor}`)
    scalingFactor = factor

    if ($body != null) {
        if (scalingFactor === 1) {
            $body.css('zoom', '')
        }
        else {
            $body.css('zoom', `${factor * 100}%`)
        }

        /* Changing scaling factor will effectively change the perceived size of the window */
        $window.trigger('resize')
    }
}

/**
 * Tell the current application window width.
 * @alias qui.window.getWidth
 * @returns {Number}
 */
export function getWidth() {
    return document.documentElement.clientWidth / scalingFactor
}

/**
 * Tell the current application window height.
 * @alias qui.window.getHeight
 * @returns {Number}
 */
export function getHeight() {
    return document.documentElement.clientHeight / scalingFactor
}


/* Focus */

function handleBecomeFocused() {
    if (appFocused) {
        return
    }

    appFocused = true

    $body.addClass('focused')
    logger.info('application is focused')
    focusChangeSignal.emit(true)
}

function handleBecomeUnfocused() {
    if (!appFocused) {
        return
    }

    appFocused = false

    $body.removeClass('focused')
    logger.info('application is unfocused')
    focusChangeSignal.emit(false)
}

/**
 * Tell whether the application is focused or not.
 * @alias qui.window.isFocused
 * @returns {Boolean}
 */
export function isFocused() {
    return appFocused
}


/* Active */

function handleBecomeActive() {
    if (appActive) {
        return
    }

    appActive = true

    $body.addClass('active')
    logger.info('application is active')
    activeChangeSignal.emit(true)
}

function handleBecomeInactive() {
    if (!appActive) {
        return
    }

    /* An inactive app can't be focused */
    if (appFocused) {
        handleBecomeUnfocused()
    }

    appActive = false

    $body.removeClass('active')
    logger.info('application is inactive')
    activeChangeSignal.emit(false)
}

/**
 * Tell whether the application is active or not.
 * @alias qui.window.isActive
 * @returns {Boolean}
 */
export function isActive() {
    return appActive
}


/* Reloading & closing */

/**
 * Reload the window.
 * @alias qui.window.reload
 * @param {String} [path] optional path to navigate
 */
export function reload(path) {
    reloading = true

    logger.debug('reloading')

    asap(function () {
        if (path) {
            if (window.location.href === path) {
                path = ''
            }

            window.location.href = path
        }
        else {
            window.location.reload()
        }
    })
}

/**
 * Tell if the window is currently closing.
 * @alias qui.window.isClosing
 * @returns {Boolean}
 */
export function isClosing() {
    return unloading || reloading
}

export function init() {
    /* Initialize some settings with default values from configuration, but only if they haven't been initialized yet */
    if (smallScreenThreshold == null) {
        smallScreenThreshold = Config.defaultSmallScreenThreshold
    }
    if (scalingFactor == null) {
        scalingFactor = Config.defaultScalingFactor
    }

    /* Wrap main objects in jQuery */
    $document = $(document)
    $window = $(window)
    $body = $(document.body)

    if (scalingFactor !== 1) {
        $body.css('zoom', `${scalingFactor * 100}%`)
    }

    /* Window resize handling */
    $window.on('resize', function () {
        let width = getWidth()
        let height = getHeight()

        resizeSignal.emit(width, height)
        evaluateScreenLayout()
    })

    /* Window unload handling */
    $window.on('beforeunload', function (e) {
        unloading = true

        logger.info('application unload requested')

        /* These nested asap() calls allow us to detect if unloading has been cancelled */
        asap(function () {
            asap(function () {
                logger.info('application unload cancelled')
            })
        })

        let canUnload = true

        /* Give a chance to any pending requests to complete */
        let writePendingRequests = AJAX.getPendingRequests()
                                   .filter(r => ['POST', 'PUT', 'PATCH', 'DELETE'].includes(r.details.method))

        if (writePendingRequests.length > 0) {
            logger.warn(`application unload: there are ${writePendingRequests.length} write pending ajax requests`)
            canUnload = false
        }

        let closeSignalResult = closeSignal.emit()
        if (closeSignalResult === false) {
            logger.warn('application unload prevented by close signal handler')
            canUnload = false
        }

        if (!canUnload) {
            e.preventDefault()
            unloading = false
            return false
        }
    })

    /* Full screen handling */
    $document.on('fullscreenchange', function () {
        if (isFullScreen()) {
            handleEnterFullScreen()
        }
        else {
            handleExitFullScreen()
        }

        fullScreenChangeSignal.emit(isFullScreen())
    })

    /* Active handling */
    $document.on('visibilitychange', function () {
        if (this.visibilityState === 'visible') {
            handleBecomeActive()
        }
        else {
            handleBecomeInactive()
        }
    })

    $window.on('pageshow', () => handleBecomeActive())
    $window.on('pagehide', () => handleBecomeInactive())

    $document.on('resume', () => handleBecomeActive())
    $document.on('freeze', () => handleBecomeInactive())

    /* Initial active state */
    if (document.visibilityState === 'visible') {
        handleBecomeActive()
    }
    else {
        handleBecomeInactive()
    }

    /* Focus handling */
    $window.on('focus', () => handleBecomeFocused())
    $window.on('blur', () => handleBecomeUnfocused())

    /* Initial focus */
    if (document.hasFocus()) {
        handleBecomeFocused()
    }
    else {
        handleBecomeUnfocused()
    }

    /* Check every second to ensure the active and focus states are correctly set. This shouldn't normally be
     * necessary, but PWAs running on Chrome sometimes don't fire some events wen waking up (unfreezing/resuming) */
    setTimeout(function () {

        if (document.visibilityState === 'visible' && !appActive) {
            logger.warn('surprised to detect application active')
            handleBecomeActive()
        }
        else if (document.visibilityState !== 'visible' && appActive) {
            logger.warn('surprised to detect application inactive')
            handleBecomeInactive()
        }

        if (document.hasFocus() && !appFocused) {
            logger.warn('surprised to detect application focused')
            handleBecomeFocused()
        }
        else if (!document.hasFocus() && appFocused) {
            logger.warn('surprised to detect application unfocused')
            handleBecomeUnfocused()
        }

    }, 1000)

    asap(function () {
        /* Reset the scroll position of the body */
        $body.scrollLeft(0)
        $body.scrollTop(0)

        /* Trigger an initial resize */
        $window.resize()
    })
}
