/**
 * @namespace qui.widgets
 */

import $ from '$qui/lib/jquery.module.js'

import StockIcon   from '$qui/icons/stock-icon.js'
import * as Window from '$qui/window.js'

import './common-widgets/common-widgets.js' /* Needed so that jQueryUI-based widgets are not left out of the bundle */


function initButtons() {
    /* Toggle "active" class when pressed/released */
    Window.$document.on('pointerdown pointerup pointercancel pointerleave', '.qui-base-button', function (e) {

        let active = e.type === 'pointerdown'
        let $this = $(this)

        if (!$this.hasClass('active') && active) {
            $this.addClass('active')
            $this.trigger('pressed')
        }
        else if ($this.hasClass('active') && !active) {
            $this.removeClass('active')
            $this.trigger('released')
        }

    })
}

function initLongPress() {
    /* A touch press held long enough to become a long press ends without a click, so the release looked like a
     * tap that did nothing. Treat that release as a click, except in text fields, which use long press for editing. */
    let longPressTarget = null

    document.addEventListener('contextmenu', function (e) {
        let editable = e.target.closest('input, textarea, select, [contenteditable]')
        longPressTarget = (e.pointerType === 'touch' && !editable) ? e.target : null
    }, {capture: true, passive: true})

    document.addEventListener('pointerup', function (e) {
        let target = longPressTarget
        longPressTarget = null
        if (!target || e.pointerType !== 'touch') {
            return
        }

        /* Touch pointers stay captured by the pressed element, so check where the finger actually left */
        if (!target.contains(document.elementFromPoint(e.clientX, e.clientY))) {
            return
        }

        /* Let the release finish first, like a real click does */
        setTimeout(() => target.click())
    }, {capture: true, passive: true})

    document.addEventListener('pointercancel', function () {
        longPressTarget = null
    }, {capture: true, passive: true})
}

/**
 * Create a caption made of an icon and a text.
 * @alias qui.widgets.makeIconTextCaption
 * @param {qui.icons.Icon} icon
 * @param {String} text
 * @returns {jQuery}
 */
export function makeIconTextCaption(icon, text) {
    let containerDiv = $('<div></div>', {class: 'qui-icon-text-caption-container'})
    let iconDiv = $('<div></div>', {class: 'qui-icon-text-caption-icon'})
    let textSpan = $('<span></span>', {class: 'qui-icon-text-caption-text'})

    if (icon instanceof StockIcon) {
        icon = icon.alterDefault({variant: 'white', scale: 0.75})
    }

    containerDiv.append(iconDiv).append(textSpan)
    icon.applyTo(iconDiv)
    textSpan.text(text)

    return containerDiv
}

export function init() {
    initButtons()
    initLongPress()
}
