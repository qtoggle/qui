
import {AssertionError} from '$qui/base/errors.js'


const __FIX_JSDOC = null /* without this, JSDoc considers following symbol undocumented */


/**
 * A convenience class that makes it easy to work with timeouts.
 * @alias qui.base.Timer
 */
class Timer {

    /**
     * @constructs
     * @param {Number} [defaultTimeout] a default timeout, in milliseconds
     * @param {Function} [onTimeout] am optional timeout callback
     */
    constructor(defaultTimeout = null, onTimeout = null) {
        this._defaultTimeout = defaultTimeout
        this._onTimeout = onTimeout

        this._cancelled = false
        this._startedTime = null
        this._timeoutHandle = null
    }

    /**
     * Start the timer.
     * @param {Nunber} [timeout] a timeout, in milliseconds, that overrides the timer's `defaultTimeout`
     */
    start(timeout = null) {
        if (this._timeoutHandle) {
            throw new AssertionError('Timer already started')
        }

        if (timeout == null) {
            timeout = this._defaultTimeout
        }

        if (timeout == null) {
            throw new AssertionError('Cannot start timer without timeout')
        }

        this._cancelled = false
        this._startedTime = new Date().getTime()

        this._timeoutHandle = setTimeout(function () {
            this._timeoutHandle = null
            if (this._onTimeout) {
                this._onTimeout()
            }
        }.bind(this), timeout)
    }

    /**
     * Cancel the timer.
     */
    cancel() {
        if (!this._timeoutHandle) {
            throw new AssertionError('Timer not started')
        }
        if (this._cancelled) {
            throw new AssertionError('Timer already cancelled')
        }

        clearTimeout(this._timeoutHandle)
        this._timeoutHandle = null
        this._cancelled = true
        this._startedTime = null
    }

    /**
     * Start the timer if it's not currently running. Otherwise cancel and start it over.
     * @param {Nunber} [timeout] a timeout, in milliseconds, that overrides the timer's `defaultTimeout`
     */
    restart(timeout = null) {
        if (this.isRunning()) {
            this.cancel()
        }

        this.start(timeout)
    }

    /**
     * Tell if the timer is currently running.
     * @returns {Boolean}
     */
    isRunning() {
        return !!this._timeoutHandle
    }

    /**
     * Tell if the timer has been cancelled.
     * @returns {Boolean}
     */
    isCancelled() {
        return this._cancelled
    }

    /**
     * Tell if the timer has fired.
     * @returns {Boolean}
     */
    isFired() {
        return !this._timeoutHandle && !!this._startedTime
    }

    /**
     * Tell the remaining time, in milliseconds.
     * @returns {Number}
     */
    getRemainingTime() {
        if (this.isRunning()) {
            throw new AssertionError('Timer not started')
        }

        return new Date().getTime() - this._startedTime
    }

}


export default Timer
