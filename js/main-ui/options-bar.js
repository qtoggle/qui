/**
 * @namespace qui.mainui.optionsbar
 */

import $      from '$qui/lib/jquery.module.js'
import Logger from '$qui/lib/logger.module.js'

import {gettext}         from '$qui/base/i18n.js'
import Signal            from '$qui/base/signal.js'
import StockIcon         from '$qui/icons/stock-icon.js'
import * as Theme        from '$qui/theme.js'
import * as Gestures     from '$qui/utils/gestures.js'
import {asap}            from '$qui/utils/misc.js'
import * as PromiseUtils from '$qui/utils/promise.js'
import * as Window       from '$qui/window.js'

import * as MainUI  from './main-ui.js'
import * as MenuBar from './menu-bar.js'
import * as TopBar  from './top-bar.js'


const logger = Logger.get('qui.mainui.optionsbar')


let barHTML = null
let barContainer = null
let optionsButton = null
let updateHandle = null
let opened = false
let transitionPromise = Promise.resolve()

/**
 * Emitted whenever the options bar is opened or closed. Handlers are called with the following parameters:
 *  * `opened: Boolean`, the opened status
 * @alias qui.mainui.optionsbar.openCloseSignal
 */
export const openCloseSignal = new Signal(barHTML)


/**
 * Tell if the options bar is opened or not.
 * @alias qui.mainui.optionsbar.isOpened
 * @returns {Boolean}
 */
export function isOpened() {
    return opened
}

/**
 * Open the options bar.
 * @alias qui.mainui.optionsbar.open
 */
export function open() {
    if (opened) {
        return
    }
    if (MenuBar.isOpened()) {
        MenuBar.close()
    }

    MainUI.showMainContainerGlass()

    opened = true
    logger.debug('options bar opened')
    openCloseSignal.emit(true)

    transitionPromise = transitionPromise.then(function () {
        barHTML.css('display', '')
        optionsButton.addClass('selected')
        return PromiseUtils.asap().then(function () {
            Window.$body.addClass('options-bar-open')
        })
    })
}

/**
 * Close the options bar.
 * @alias qui.mainui.optionsbar.close
 */
export function close() {
    if (!opened) {
        return
    }

    MainUI.hideMainContainerGlass()

    opened = false
    logger.debug('options bar closed')
    openCloseSignal.emit(false)

    transitionPromise = transitionPromise.then(function () {
        Window.$body.removeClass('options-bar-open')
        optionsButton.removeClass('selected')

        return PromiseUtils.later(Theme.getTransitionDuration()).then(function () {
            barHTML.css('display', 'none')
        })
    })
}

/**
 * Set the content of the options bar.
 * @alias qui.mainui.optionsbar.setContent
 * @param {?jQuery} content the new options bar content; `null` closes/disables the options bar
 */
export function setContent(content) {
    if (updateHandle) {
        clearTimeout(updateHandle)
    }

    barHTML.addClass('updating')
    updateHandle = asap(function () {
        updateHandle = null

        barContainer.children().detach()

        if (content) {
            /* Using detach + append prevents triggering remove/destroy on widgets */
            barContainer.append(content)
            optionsButton.removeClass('hidden')
        }
        else {
            optionsButton.addClass('hidden')
            close()
        }

        barHTML.removeClass('updating')
    })
}

export function init() {
    barHTML = $('<div></div>', {class: 'qui-options-bar'})
    barHTML.append($('<div></div>', {class: 'qui-options-bar-container'}))

    barContainer = barHTML.find('div.qui-options-bar-container')
    optionsButton = TopBar.getHTML().find('div.qui-options-button')
    let variant = Window.isSmallScreen() ? 'white' : 'interactive'
    new StockIcon({name: 'options', variant: variant}).applyTo(optionsButton.find('.qui-icon'))

    optionsButton.attr('title', gettext('Options'))
    optionsButton.on('click', function () {
        if (isOpened()) {
            close()
        }
        else {
            open()
        }
    })

    Gestures.enableDragging(
        barHTML,
        /* onMove = */ function (elemX, elemY, deltaX, deltaY, pageX, pageY) {
            if (deltaX < 0) {
                return
            }
            barHTML.css('transition', 'none')
            barHTML.css('right', -deltaX)
        },
        /* onBegin = */ function () {
            /* Allow closing the options bar with touch drag, but only on small screens */
            if (!Window.isSmallScreen()) {
                return false
            }
        },
        /* onEnd = */ function (elemX, elemY, deltaX, deltaY, pageX, pageY) {
            barHTML.css('transition', '')
            barHTML.css('right', '')

            if (deltaX > 0 && deltaX > barHTML.width() / 2) {
                close()
            }
        }
    )

    /* Automatically update options icon according to small screen state */
    Window.screenLayoutChangeSignal.connect(function (smallScreen, landscape) {
        StockIcon.alterElement(optionsButton.find('div.qui-icon'), {variant: smallScreen ? 'white' : 'interactive'})
    })

    Window.$body.append(barHTML)
}
