/**
 * @namespace qui.mainui.menubar
 */

import $      from '$qui/lib/jquery.module.js'
import Logger from '$qui/lib/logger.module.js'

import {gettext}     from '$qui/base/i18n.js'
import StockIcon     from '$qui/icons/stock-icon.js'
import * as Gestures from '$qui/utils/gestures.js'
import * as Window   from '$qui/window.js'

import * as MainUI     from './main-ui.js'
import * as OptionsBar from './options-bar.js'
import * as TopBar     from './top-bar.js'


const logger = Logger.get('qui.mainui.menubar')


let barHTML = null
let menuButton = null
let opened = false
let transitionPromise = Promise.resolve()


/**
 * Return the menu bar HTML element.
 * @returns {jQuery}
 */
export function getHTML() {
    return barHTML
}

/**
 * Tell if the menu bar is opened or not.
 * @alias qui.mainui.menubar.isOpened
 * @returns {Boolean}
 */
export function isOpened() {
    return opened
}

/**
 * Open the menu bar.
 * @alias qui.mainui.menubar.open
 */
export function open() {
    if (opened) {
        return
    }
    if (OptionsBar.isOpened()) {
        OptionsBar.close()
    }

    MainUI.showMainContainerGlass()

    opened = true
    logger.debug('menu bar opened')

    transitionPromise = transitionPromise.then(function () {
        menuButton.addClass('selected')
        Window.$body.addClass('menu-bar-open')
    })
}

/**
 * Close the menu bar.
 * @alias qui.mainui.menubar.close
 */
export function close() {
    if (!opened) {
        return
    }

    MainUI.hideMainContainerGlass()

    opened = false
    logger.debug('menu bar closed')

    transitionPromise = transitionPromise.then(function () {
        menuButton.removeClass('selected')
        Window.$body.removeClass('menu-bar-open')
    })
}

/**
 * Add a button to the menu bar.
 * @alias qui.mainui.menubar.addButton
 * @param {jQuery} button the button to add
 */
export function addButton(button) {
    button.addClass('qui-menu-bar-button')
    barHTML.append(button)
}

export function init() {
    barHTML = $('<div></div>', {class: 'qui-menu-bar'})
    menuButton = TopBar.getHTML().find('div.qui-menu-button')
    let variant = Window.isSmallScreen() ? 'white' : 'interactive'
    new StockIcon({name: 'menu', variant: variant}).applyTo(menuButton.find('.qui-icon'))

    menuButton.attr('title', gettext('Menu'))
    menuButton.on('click', function () {
        if (opened) {
            close()
        }
        else {
            open()
        }
    })

    Gestures.enableDragging(
        barHTML,
        /* onMove = */ function (elemX, elemY, deltaX, deltaY, pageX, pageY) {
            if (deltaX > 0) {
                return
            }
            barHTML.css('transition', 'none')
            barHTML.css('left', elemX)
        },
        /* onBegin = */ function () {
            /* Allow closing the menu bar with touch drag, but only on small screens */
            if (!Window.isSmallScreen()) {
                return false
            }
        },
        /* onEnd = */ function (elemX, elemY, deltaX, deltaY, pageX, pageY) {
            barHTML.css('transition', '')
            barHTML.css('left', '')

            if (deltaX < 0 && Math.abs(deltaX) > barHTML.width() / 2) {
                close()
            }
        }
    )

    /* Automatically update menu icon according to small screen state */
    Window.screenLayoutChangeSignal.connect(function (smallScreen, landscape) {
        StockIcon.alterElement(menuButton.find('div.qui-icon'), {variant: smallScreen ? 'white' : 'interactive'})
    })

    Window.$body.append(barHTML)
}
