
/**
 * A class that debounces function calls, ensuring that a function is not called more often than a specified delay.
 * @alias qui.utils.Debouncer
 */
class Debouncer {

    /**
     * @constructs
     * @param {Function} func the function to debounce
     * @param {Number} [delay] the debouncing delay, in milliseconds (defaults to `0`)
     * @param {?Number} [maxWait] the longest the call may be postponed, in milliseconds, however many times it is
     * made; `null` (the default) postpones it indefinitely
     */
    constructor(func, delay = 0, maxWait = null) {
        this._func = func
        this._delay = delay
        this._maxWait = maxWait
        this._timeoutHandle = null
        this._firstCallTime = null
    }

    /**
     * Call function ensuring debouncing condition. Any previous pending call is cancelled.
     * Arguments are passed to the function when called.
     */
    call(...args) {
        if (this._timeoutHandle !== null) {
            clearTimeout(this._timeoutHandle)
        }

        let delay = this._delay

        if (this._maxWait != null) {
            if (this._firstCallTime == null) {
                this._firstCallTime = Date.now()
            }

            /* Each call pushes the deadline back by the full delay, so a stream of calls arriving faster than the
             * delay postpones the function for as long as it lasts -- which reads as a frozen UI rather than a slow
             * one. Never postpone it past maxWait from the first call of the run. */
            delay = Math.min(delay, Math.max(0, this._maxWait - (Date.now() - this._firstCallTime)))
        }

        this._timeoutHandle = setTimeout(function () {
            this._timeoutHandle = null
            this._firstCallTime = null
            this._func(...args)
        }.bind(this), delay)
    }

    /**
     * Tell if there is a pending call.
     * @return {Boolean}
     */
    isPending() {
        return this._timeoutHandle != null
    }

}

export default Debouncer
