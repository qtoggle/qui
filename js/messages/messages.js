/**
 * @namespace qui.messages
 */

import * as Toast from './toast.js'


/**
 * Wrap a text into label markup.
 * @alias qui.messages.wrapLabel
 * @param {String} text the text to wrap
 * @returns {String} the label
 */
export function wrapLabel(text) {
    return `<span class="qui-message-label">${text}</span>`
}


export function init() {
    Toast.init()
}
