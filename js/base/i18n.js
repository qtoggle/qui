/**
 * @namespace qui.base.i18n
 */

/**
 * Translate a message.
 * @alias qui.base.i18n.gettext
 * @param {String} msg the message to translate
 * @returns {String} the translated message or the original message, if no translation found
 */
export function gettext(msg) {
    if (window._jsTranslations) {
        let transMsg = window._jsTranslations[msg]
        if (transMsg != null) {
            return transMsg
        }
    }

    return msg
}
