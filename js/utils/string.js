/**
 * @namespace qui.utils.string
 */

import * as ObjectUtils from '$qui/utils/object.js'


const REGEX_ESCAPE_CHARS = '.\\+*?[^]$(){}=!<>|:-'


/**
 * Replace all occurrences of `oldStr` in `s` with `newStr`.
 * @alias qui.utils.string.replaceAll
 * @param {String} s
 * @param {String} oldStr
 * @param {String} newStr
 * @returns {String}
 */
export function replaceAll(s, oldStr, newStr) {
    let p
    while ((p = s.indexOf(oldStr)) >= 0) {
        s = s.substring(0, p) + newStr + s.substring(p + oldStr.length, s.length)
    }

    return s.toString()
}

/**
 * Replace percent-formatted placeholders in a string with given values.
 *
 * Placeholders can be given as `"%s"`, `"%d"` or `"%f"`, in which case `args` will be used, in order, to replace
 * them.
 *
 * Placeholders can also be given as `"%(name)s"`, in which case the first argument in `args` will be used as an object
 * that maps names to replacement values.
 *
 * @alias qui.utils.string.formatPercent
 * @param {String} text
 * @param {...*} args values used to replace the placeholders
 * @returns {String}
 */
export function formatPercent(text, ...args) {
    let rex = new RegExp('%[sdf]')
    let match, i = 0
    while ((match = text.match(rex))) {
        text = text.substring(0, match.index) + args[i] + text.substring(match.index + 2)
        i++
    }

    if (i) { /* %s format used */
        text = text.replace(new RegExp('%%', 'g'), '%')

        return text
    }

    let keywords = args[0]

    ObjectUtils.forEach(keywords, function (key, value) {
        text = text.replace(new RegExp(`%\\(${key}\\)s`, 'g'), value.toString())
        text = text.replace(new RegExp(`%\\(${key}\\)d`, 'g'), value.toString())
        text = text.replace(new RegExp(`%\\(${key}\\)f`, 'g'), value.toString())
    })

    text = text.replace('%%', '%')

    return text
}

/**
 * Transform a regular text to its camel-case representation.
 * @alias qui.utils.string.camelize
 * @param {String} s
 * @returns {String}
 */
export function camelize(s) {
    s = s.replace(/(?:^|[-_])(\w)/g, function (_, c) {
        return c ? c.toUpperCase() : ''
    })

    return s.substr(0, 1).toLowerCase() + s.substr(1)
}

/**
 * Transform a camel-case string into its dash-separated representation.
 * @alias qui.utils.string.uncamelize
 * @param {String} s
 * @param {String} [chr] separator character (defaults to dash `"-"`)
 * @returns {String}
 */
export function uncamelize(s, chr = '-') {
    return s.replace(/([A-Z])/g, function ($1) {
        return chr + $1.toLowerCase()
    }).replace(new RegExp(`^${chr}`), '')
}

/**
 * Transform the starting letter of each word of a text to uppercase.
 * @alias qui.utils.string.title
 * @param {String} s
 * @returns {String}
 */
export function title(s) {
    s = s.replace(/\s(\w)/g, function (_, c) {
        return c ? ` ${c.toUpperCase()}` : ' '
    })

    return s.substr(0, 1).toUpperCase() + s.substr(1)
}

/**
 * Encode a string to UTF8.
 * @alias qui.utils.string.toUTF8
 * @param {String} s
 * @returns {String}
 */
export function toUTF8(s) {
    s = s.replace(new RegExp('\\r\\n'), '\n')
    let utf = ''

    for (let n = 0; n < s.length; n++) {
        let c = s.charCodeAt(n)

        if (c < 128) {
            utf += String.fromCharCode(c)
        }
        else if ((c > 127) && (c < 2048)) {
            utf += String.fromCharCode((c >> 6) | 192)
            utf += String.fromCharCode((c & 63) | 128)
        }
        else {
            utf += String.fromCharCode((c >> 12) | 224)
            utf += String.fromCharCode(((c >> 6) & 63) | 128)
            utf += String.fromCharCode((c & 63) | 128)
        }
    }

    return utf
}

/**
 * Decode a string from UTF8.
 * @alias qui.utils.string.fromUTF8
 * @param {String} s
 * @returns {String}
 */
export function fromUTF8(s) {
    let result = ''
    let i = 0
    let c1 = 0
    let c2 = 0
    let c3 = 0

    while (i < s.length) {
        c1 = s.charCodeAt(i)

        if (c1 < 128) {
            result += String.fromCharCode(c1)
            i++
        }
        else if ((c1 > 191) && (c1 < 224)) {
            c2 = s.charCodeAt(i + 1)
            result += String.fromCharCode(((c1 & 31) << 6) | (c2 & 63))
            i += 2
        }
        else {
            c2 = s.charCodeAt(i + 1)
            c3 = s.charCodeAt(i + 2)
            result += String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63))
            i += 3
        }
    }

    return result
}

/**
 * Intelligently search for an input sequence in a string. All characters in the input sequence must be present in the
 * searched string, in the respective order.
 * @alias qui.utils.string.intelliSearch
 * @param {String} s string to search into
 * @param {String} search string to search for
 * @returns {?RegExpMatchArray}
 */
export function intelliSearch(s, search) {
    let rexStr = Array.prototype.map.call(search, function (c) {
        return `${(REGEX_ESCAPE_CHARS.indexOf(c) >= 0 ? '\\' : '')}${c}.*`
    }).join('')

    let rex = new RegExp(rexStr, 'i')

    return s.match(rex)
}
