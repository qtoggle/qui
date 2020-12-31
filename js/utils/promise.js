/**
 * @namespace qui.utils.promise
 */

import {TimeoutError}     from '$qui/base/errors.js'
import {asap as asapFunc} from '$qui/utils/misc.js'


/**
 * Return a promise that resolves as soon as possible, in the next main loop iteration.
 * @alias qui.utils.promise.asap
 * @returns {Promise}
 */
export function asap() {
    return new Promise(function (resolve) {
        asapFunc(resolve)
    })
}

/**
 * Return a promise that resolves later, after a specified number of seconds.
 * @alias qui.utils.promise.later
 * @param {Number} timeout the timeout, in milliseconds
 * @param {*} [arg] an optional argument to pass along the promise chain
 * @returns {Promise}
 */
export function later(timeout, arg) {
    return new Promise(function (resolve) {
        setTimeout(function () {
            resolve(arg)
        }, timeout)
    })
}

/**
 * Run a promise with a timeout. If the promise is not fulfilled within the given timeout, the returned promise will be
 * rejected with {@link qui.base.errors.TimeoutError}
 * @alias qui.utils.promise.withTimeout
 * @param {Promise} promise the promise to run
 * @param {Number} timeout the timeout, in milliseconds
 * @returns {Promise} the promise with timeout
 */
export function withTimeout(promise, timeout) {
    let timeoutPromise = later(timeout).then(function () {
        throw new TimeoutError(`Operation timed out after ${timeout} milliseconds`)
    })

    return Promise.race([promise, timeoutPromise])
}
