
import {AssertionError} from '$qui/base/errors.js'


const __FIX_JSDOC = null /* without this, JSDoc considers following symbol undocumented */


/**
 * An asynchronous implementation of condition variables based on promises. Due to the fact that promises cannot be
 * easily extended, this class actually wraps a promise.
 * @alias qui.base.ConditionVariable
 */
class ConditionVariable {

    /**
     * @constructs
     */
    constructor() {
        this._resolve = null
        this._reject = null

        this._promise = new Promise(function (resolve, reject) {

            this._resolve = resolve
            this._reject = reject

        }.bind(this))

        this._fulfilled = false
        this._cancelled = false
    }

    /**
     * Fulfill the condition, notifying everybody that waits on this condition.
     * @param {*} [arg] an optional fulfill argument
     */
    fulfill(arg) {
        if (this._fulfilled || this._cancelled) {
            throw new AssertionError('Condition variable already settled')
        }

        this._fulfilled = true
        this._resolve(arg)
    }

    /**
     * Cancel the condition, notifying everybody that waits on this condition.
     * @param {*} [error] an optional error argument
     */
    cancel(error) {
        if (this._fulfilled || this._cancelled) {
            throw new AssertionError('Condition variable already settled')
        }

        this._cancelled = true
        this._reject(error)
    }

    /**
     * Tell if the condition is fulfilled or not.
     * @returns {Boolean}
     */
    isFulfilled() {
        return this._fulfilled
    }

    /**
     * Tell if the condition is cancelled or not.
     * @returns {Boolean}
     */
    isCancelled() {
        return this._cancelled
    }

    /**
     * Tell if the condition is settled (fulfilled or cancelled) or not.
     * @returns {Boolean}
     */
    isSettled() {
        return this._fulfilled || this._cancelled
    }

    then(f, r) {
        return this._promise.then(f, r)
    }

    catch(r) {
        return this._promise.catch(r)
    }

}


export default ConditionVariable
