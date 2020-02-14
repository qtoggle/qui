/**
 * @namespace qui.mainui.topbar
 */

import $ from '$qui/lib/jquery.module.js'

import Icon        from '$qui/icons/icon.js'
import StockIcon   from '$qui/icons/stock-icon.js'
import * as Window from '$qui/window.js'


let barHTML = null


/**
 * Return the top bar HTML element.
 * @returns {jQuery}
 */
export function getHTML() {
    return barHTML
}

/**
 * Add a button to the top bar.
 * @alias qui.mainui.topbar.addButton
 * @param {jQuery} button the button to add
 */
export function addButton(button) {
    button.addClass('qui-top-button')
    $('div.qui-status-indicator').before(button)
}

/**
 * Set or clear the top bar title.
 * @alias qui.mainui.topbar.setTitle
 * @param {?String} title
 */
export function setTitle(title) {
    barHTML.children('div.qui-top-bar-title-container').html(title || '')
}

// TODO jsdoc
export function alterTopIcon(element, variant) {
    let icon = Icon.getFromElement(element)
    if (!icon) {
        return
    }

    if (!(icon instanceof StockIcon)) {
        return;
    }

    icon = icon.alter({variant: variant})
    icon.applyTo(element)
}

export function init() {
    barHTML = $('<div class="qui-top-bar">' +
                    '<div class="qui-base-button qui-top-button qui-menu-button">' +
                        '<div class="qui-icon"></div>' +
                    '</div>' +
                    '<div class="qui-breadcrumbs-container"></div>' +
                    '<div class="qui-top-bar-title-container"></div>' +
                    '<div class="qui-base-button qui-top-button qui-options-button hidden">' +
                        '<div class="qui-icon"></div>' +
                    '</div>' +
                    '<div class="qui-base-button qui-top-button qui-status-indicator">' +
                        '<div class="qui-icon"></div>' +
                    '</div>' +
                '</div>')

    Window.$body.append(barHTML)
}
