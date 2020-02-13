/**
 * @namespace qui.utils.misc
 */

import Config           from '$qui/config.js'
import * as ObjectUtils from '$qui/utils/object.js'

import URL from './url.js'


/**
 * Run a function as soon as possible, in the next main loop iteration.
 * @alias qui.utils.misc.asap
 * @param {Function} func function to run
 * @returns {Number} a timeout handle
 */
export function asap(func) {
    return setTimeout(function () {
        func()
    }, 20)
}

/**
 * Ensure that a URL has a query argument named `h`, representing the build hash.
 * @alias qui.utils.misc.appendBuildHash
 * @param {String} strURL
 * @returns {String}
 */
export function appendBuildHash(strURL) {
    let url = URL.parse(strURL)
    if (!Config.buildHash) {
        return url.toString()
    }

    url = url.alter({query: ObjectUtils.combine(url.query, {h: Config.buildHash})})
    return url.toString()
}
