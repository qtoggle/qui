
/**
 * A class that debounces function calls, ensuring that a function is not called more often than a specified delay.
 * @alias qui.utils.Debouncer
 */
class Debouncer {

    /**
     * @constructs
     * @param {Function} func the function to debounce
     * @param {Number} delay the debouncing delay, in milliseconds
     */
    constructor(func, delay) {
        this._func = func
        this._delay = delay
        this._timeoutHandle = null
    }

    /**
     * Call function ensuring debouncing condition. Any previous pending call is cancelled.
     * Arguments are passed to the function when called.
     */
    call(...args) {
        if (this._timeoutHandle !== null) {
            clearTimeout(this._timeoutHandle)
        }

        this._timeoutHandle = setTimeout(function () {
            this._timeoutHandle = null
            this._func(...args)
        }.bind(this), this._delay)
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
