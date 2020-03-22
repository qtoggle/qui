/**
 * @namespace qui.messages.toast
 */

import $ from '$qui/lib/jquery.module.js'

import StockIcon   from '$qui/icons/stock-icon.js'
import * as Theme  from '$qui/theme.js'
import {asap}      from '$qui/utils/misc.js'
import * as Window from '$qui/window.js'


const TOAST_MESSAGE_TIMEOUT = 5000 /* 5 seconds */

let toastMessageTimeoutHandle = null
let toastMessageContainer = null
let toastMessageShowingTimeoutHandle = null


/**
 * Show a toast message for a limited period of time.
 * @alias qui.messages.toast.show
 * @param {?String|jQuery} message the message to show
 * @param {?String} type message type (`"info"`, `"warning"` or `"error"`)
 * @param {Number} [timeout] the message display timeout, in milliseconds (defaults to 5 seconds)
 * @param {Boolean} [closeable] whether the message can be closed by the user (defaults to `true`)
 */
export function show({message, type, timeout = TOAST_MESSAGE_TIMEOUT, closeable = true}) {
    let messageSpan = toastMessageContainer.find('span.qui-toast-message')

    if (toastMessageTimeoutHandle) {
        clearTimeout(toastMessageTimeoutHandle)
        toastMessageTimeoutHandle = null
    }

    if (message) {
        Window.$body.addClass('toast-message-visible')
        toastMessageContainer.removeClass('info warning error multiline closeable')

        messageSpan.html(message)
        if (type) {
            toastMessageContainer.addClass(type)
        }

        /* Test if the message wraps */
        let normalHeight = messageSpan.height()
        toastMessageContainer.find('div.qui-toast-message').css('white-space', 'normal')
        let wrappedHeight = messageSpan.height()
        toastMessageContainer.find('div.qui-toast-message').css('white-space', '')

        if (normalHeight < wrappedHeight) {
            toastMessageContainer.addClass('multiline')
        }

        if (timeout !== 0) {
            toastMessageTimeoutHandle = setTimeout(function () {
                show({message: null, type: 'info'})
            }, timeout)
        }

        if (closeable !== false) {
            toastMessageContainer.addClass('closeable')
        }

        /* Showing flag timeout */
        if (toastMessageShowingTimeoutHandle) {
            clearTimeout(toastMessageShowingTimeoutHandle)
        }

        toastMessageShowingTimeoutHandle = asap(function () {
            toastMessageShowingTimeoutHandle = null
        })
    }
    else if (Window.$body.hasClass('toast-message-visible')) { /* Hide */
        Window.$body.removeClass('toast-message-visible')
        Theme.afterTransition(function () {
            if (Window.$body.hasClass('toast-message-visible')) {
                return /* Reshown in the meantime */
            }

            messageSpan.html('')
            toastMessageContainer.removeClass('info warning error multiline')
        })
    }
}

/**
 * Hide a currently displayed toast message.
 * @alias qui.messages.toast.hide
 */
export function hide() {
    show({message: null, type: 'info'})
}

/**
 * Convenience function for {@link qui.messages.toast.show} with default timeout and type `"info"`.
 * @alias qui.messages.toast.info
 * @param {String|jQuery} message the message to show
 */
export function info(message) {
    show({message: message, type: 'info'})
}

/**
 * Convenience function for {@link qui.messages.toast.show} with default timeout and type `"warning"`.
 * @alias qui.messages.toast.warning
 * @param {String|jQuery} message the message to show
 */
export function warning(message) {
    show({message: message, type: 'warning'})
}

/**
 * Convenience function for {@link qui.messages.toast.show} with default timeout and type `"error"`.
 * @alias qui.messages.toast.error
 * @param {String|jQuery} message the message to show
 */
export function error(message) {
    show({message: message, type: 'error'})
}


export function init() {
    toastMessageContainer = $('<div></div>', {class: 'qui-toast-message-container'})
    toastMessageContainer.append($('<div></div>', {class: 'qui-toast-message-icon'}))

    let messageDiv = $('<div></div>', {class: 'qui-toast-message'})
    messageDiv.append($('<span></span>', {class: 'qui-toast-message'}))
    messageDiv.append($('<div></div>', {class: 'qui-base-button qui-toast-message-close-button'}))
    toastMessageContainer.append(messageDiv)

    Window.$body.append(toastMessageContainer)

    /* Close button */
    let closeButton = toastMessageContainer.find('div.qui-toast-message-close-button')
    new StockIcon({
        name: 'close', variant: 'interactive', activeVariant: 'interactive-active'
    }).alter({scale: 0.75}).applyTo(closeButton)

    closeButton.on('click', function () {
        show({message: null, type: null})
    })

    /* Close when clicked anywhere */
    Window.$body.on('click', function (e) {
        if (toastMessageShowingTimeoutHandle) {
            return /* Showing is in progress */
        }

        if (!Window.$body.hasClass('toast-message-visible')) {
            return /* Message not visible */
        }

        if (!toastMessageContainer.hasClass('closeable')) {
            return /* Message not closeable */
        }

        if (toastMessageContainer.has(e.target).length) {
            return /* Clicked on the message container itself */
        }

        show({message: null, type: null})
    })
}
