/**
 * @namespace qui.mainui.topbar
 */

import $ from '$qui/lib/jquery.module.js'

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

export function init() {
    barHTML = $('<div></div>', {class: 'qui-top-bar'})

    let menuButton = $('<div></div>', {class: 'qui-base-button qui-top-button qui-menu-button'})
    menuButton.append($('<div></div>', {class: 'qui-icon'}))
    barHTML.append(menuButton)

    barHTML.append($('<div></div>', {class: 'qui-breadcrumbs-container'}))
    barHTML.append($('<div></div>', {class: 'qui-top-bar-title-container'}))

    let optionsButton = $('<div></div>', {class: 'qui-base-button qui-top-button qui-options-button hidden'})
    optionsButton.append($('<div></div>', {class: 'qui-icon'}))
    barHTML.append(optionsButton)

    let statusIndicator = $('<div></div>', {class: 'qui-base-button qui-top-button qui-status-indicator'})
    statusIndicator.append($('<div></div>', {class: 'qui-icon'}))
    barHTML.append(statusIndicator)

    Window.$body.append(barHTML)
}
