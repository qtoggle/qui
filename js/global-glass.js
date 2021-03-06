/**
 * @namespace qui.globalglass
 */

import $ from '$qui/lib/jquery.module.js'

import * as Theme  from '$qui/theme.js'
import {asap}      from '$qui/utils/misc.js'
import * as Window from '$qui/window.js'


let mainContainer
let globalGlass
let glassContainer

let globalGlassTimeoutHandle = null


function show() {
    if (globalGlassTimeoutHandle) {
        clearTimeout(globalGlassTimeoutHandle)
        globalGlassTimeoutHandle = null
    }

    /* Glass itself */
    globalGlass.removeClass('hidden')
    globalGlassTimeoutHandle = asap(function () {
        globalGlassTimeoutHandle = null
        Window.$body.addClass('global-glass-visible')
    })

    glassContainer.addClass('visible').removeClass('hidden')
}

function hide() {
    if (globalGlassTimeoutHandle) {
        clearTimeout(globalGlassTimeoutHandle)
        globalGlassTimeoutHandle = null
    }

    glassContainer.removeClass('visible')
    Window.$body.removeClass('global-glass-visible')
    globalGlassTimeoutHandle = Theme.afterTransition(function () {

        globalGlassTimeoutHandle = null
        globalGlass.addClass('hidden')

    })
}

/**
 * Automatically show or hide the global glass, depending on its current content.
 * @alias qui.globalglass.updateVisibility
 */
export function updateVisibility() {
    let hasVisiblePages = glassContainer.children('div.qui-page.visible').length > 0
    let hasOtherContent = glassContainer.children().not('div.qui-page').length > 0

    let isVisible = glassContainer.hasClass('visible')
    let shouldBeVisible = hasVisiblePages || hasOtherContent

    if (isVisible && !shouldBeVisible) {
        hide()
    }
    else if (!isVisible && shouldBeVisible) {
        show()
    }
}

/**
 * Add HTML content to the glass container.
 * @alias qui.globalglass.addContent
 * @param {jQuery} content
 */
export function addContent(content) {
    glassContainer.append(content)

    /* Ensure sticky pages are at the end */
    let children = glassContainer.children('.sticky')
    glassContainer.append(children)
}

/**
 * Configure glass modal state. A modal glass will prevent any access to top/menu/option bars.
 * @alias qui.globalglass.setModal
 * @param {Boolean} modal
 */
export function setModal(modal) {
    globalGlass.toggleClass('modal', modal)
}

export function init() {
    globalGlass = $('<div></div>', {class: 'qui-global-glass hidden modal'})
    globalGlass.append($('<div></div>', {class: 'qui-global-glass-container'}))

    Window.$body.append(globalGlass)

    mainContainer = $('div.qui-main-container')
    glassContainer = globalGlass.children('div.qui-global-glass-container')
}
