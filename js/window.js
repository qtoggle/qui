/**
 * @namespace qui.window
 */

import $      from '$qui/lib/jquery.module.js'
import Logger from '$qui/lib/logger.module.js'

import Signal     from '$qui/base/signal.js'
import Icon       from '$qui/icons/icon.js'
import StockIcon  from '$qui/icons/stock-icon.js'
import * as Theme from '$qui/theme.js'
import * as AJAX  from '$qui/utils/ajax.js'
import {asap}     from '$qui/utils/misc.js'


const SMALL_SCREEN_THRESHOLD = 800 /* Logical pixels */

const logger = Logger.get('qui.window')

let unloading = false
let reloading = false


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
 *  * `width`, the new window width: `Number`
 *  * `height`, the new window height: `Number`
 * @alias qui.window.resizeSignal
 */
export let resizeSignal = new Signal()

/**
 * Emitted whenever the screen layout changes. Handlers are called with the following parameters:
 *  * `smallScreen`, telling if the screen is small, as defined by {@link qui.window.isSmallScreen}: `Boolean`
 *  * `landscape`, telling if the screen orientation is landscape: `Boolean`
 * @alias qui.window.screenLayoutChangeSignal
 */
export let screenLayoutChangeSignal = new Signal()


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
    let element = document.documentElement
    let requestFullScreen = (
        element.requestFullscreen ||
        element.requestFullScreen ||
        element.webkitRequestFullscreen ||
        element.webkitRequestFullScreen ||
        element.mozRequestFullscreen ||
        element.mozRequestFullScreen ||
        element.msRequestFullscreen ||
        element.msRequestFullScreen
    )

    if (requestFullScreen) {
        requestFullScreen.call(element)
    }
}

/**
 * Tell whether the browser window is in full-screen mode or not.
 * @alias qui.window.isFullScreen
 * @returns {Boolean}
 */
export function isFullScreen() {
    return (document.fullScreen ||
            document.webkitIsFullScreen ||
            document.mozFullScreen ||
            document.msFullscreenElement != null)
}


/* Screen layout */

function alterTopIcon(element, variant) {
    let icon = Icon.getFromElement(element)
    if (!icon) {
        return
    }

    if (icon instanceof StockIcon) {
        icon = icon.alter({variant: variant})
    }

    icon.applyTo(element)
}

function handleSmallScreen() {
    logger.debug('small screen mode')

    /* On small screens, we always want white icons on top bar buttons */
    $('div.qui-top-bar > div.qui-top-button > div.qui-icon').each(function () {
        alterTopIcon($(this), 'white')
    })
}

function handleLargeScreen() {
    logger.debug('large screen mode')

    /* On large screens, we want interactive icons on top bar buttons */
    $('div.qui-top-bar > div.qui-top-button > div.qui-icon').each(function () {
        alterTopIcon($(this), 'interactive')
    })
}

function handleLandscape() {
    logger.debug('landscape mode')
}

function handlePortrait() {
    logger.debug('portrait mode')
}

/**
 * Tell whether the screen is small or not. A screen is considered small if its width is below a *small* threshold.
 * @alias qui.window.isSmallScreen
 * @param {Number} [width] the screen width; if not supplied, the current screen width is considered
 * @param {Number} [height] the screen height; if not supplied, the current screen height is considered
 * @returns {Boolean}
 */
export function isSmallScreen(width = null, height = null) {
    if (width == null) {
        width = $window.width()
    }

    return width <= SMALL_SCREEN_THRESHOLD
}

/**
 * Tell if the screen orientation is landscape (`true`) or portrait (`false`).
 * @alias qui.window.isLandscape
 * @returns {Boolean}
 */
export function isLandscape() {
    return $window.width() >= $window.height()
}


/* Various window functions */

/**
 * Reload the window.
 * @alias qui.window.reload
 * @param {String} [path] optional path to navigate
 */
export function reload(path) {
    reloading = true

    logger.debug('reloading')

    asap(function () {
        if (path) { // TODO if path is (almost) identical to the current path, no reload will occur
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
    /* Wrap main objects in jQuery */
    $document = $(document)
    $window = $(window)
    $body = $(document.body)

    /* Window resize handling */
    let initialResize = true
    $window.resize(function () {
        let width = $window.width()
        let height = $window.height()
        let smallScreen = isSmallScreen(width, height)
        let landscape = width >= height
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
        else if (initialResize) {
            handleLargeScreen()
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
        else if (initialResize) {
            handlePortrait()
        }

        if (changed) {
            screenLayoutChangeSignal.emit(smallScreen, landscape)
        }

        initialResize = false

        resizeSignal.emit(width, height)
    })

    /* Window unload handling */
    $window.on('beforeunload', function (e) {
        if (unloading) { /* Already called */
            return
        }

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
                                   .filter(r => ['POST', 'PUT', 'PATCH', 'DELETE'].indexOf(r.details.method) >= 0)

        if (writePendingRequests.length > 0) {
            logger.warn(`application unload: there are ${writePendingRequests.length} write pending ajax requests`)
            canUnload = false
        }

        if (!canUnload) {
            e.preventDefault()
            return false
        }
    })

    /* Full screen */
    $document.on('fullscreenchange webkitfullscreenchange mozfullscreenchange msfullscreenchange', function () {
        if (isFullScreen()) {
            handleEnterFullScreen()
        }
        else {
            handleExitFullScreen()
        }
    })

    $body.addClass('disable-transitions')

    asap(function () {
        /* Reset the scroll position of the body */
        $body.scrollLeft(0)
        $body.scrollTop(0)

        /* Trigger an initial resize */
        $window.resize()

        Theme.afterTransition(function () {
            $body.css('opacity', '1')
            $body.removeClass('disable-transitions')
        })
    })
}
