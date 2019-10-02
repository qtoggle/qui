/**
 * @namespace qui.utils.html
 */

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
