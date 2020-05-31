/**
 * @namespace qui.utils.html
 */

import $ from '$qui/lib/jquery.module.js'


const HTML_ENTITIES = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
}

const HTML_CHARS_TO_ESCAPE_RE = new RegExp('[&<>"\'`=/]', 'g')


/**
 * Remove any HTML tags from a string, keeping only plain text.
 * @alias qui.utils.html.plainText
 * @param {String} s
 * @returns {String}
 */
export function plainText(s) {
    let span = document.createElement('span')
    span.innerHTML = s

    return span.innerText
}

/**
 * Escape HTML content, using HTML entities.
 * @alias qui.utils.html.escape
 * @param {String} s
 * @returns {String}
 */
export function escape(s) {
    return s.replace(HTML_CHARS_TO_ESCAPE_RE, function (s) {
        return HTML_ENTITIES[s]
    })
}

/**
 * Replace percent-formatted placeholders in a string with given values. Compared to
 * {@link qui.utils.string.formatPercent}, this function works with `jQuery` elements instead of primitive values.
 * @alias qui.utils.html.formatPercent
 * @param {String} text the text template with placeholders given as `"%(name)s"`
 * @param {String} wrapElement the HTML element type to use to wrap the result (e.g. `"span"`)
 * @param {Object<String,jQuery>} values the values used to replace the placeholders
 * @returns {jQuery}
 */
export function formatPercent(text, wrapElement, values) {
    let result = $(`<${wrapElement}></${wrapElement}>`)

    let re = /%\(([a-zA-Z0-9_-]+)\)s/
    let match
    while ((match = re.exec(text))) {
        let firstPart = text.substring(0, match.index)
        text = text.substring(match.index + match[0].length)
        let name = match[1]
        let value = values[name]

        result.append(firstPart)
        result.append(value || match[0])
    }

    if (text.length) {
        result.append(text)
    }

    return result
}
