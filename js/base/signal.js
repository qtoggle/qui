/**
 * A signal handler.
 * @callback qui.base.Signal.SignalHandler
 */

/**
 * A signal.
 * @alias qui.base.Signal
 * @param {Object} [object] an optional object that owns and emits the signal
 */
class Signal {

    constructor(object = null) {
        this._object = object
        this._handlers = []
    }

    /**
     * Add a handler to the signal. This function doesn't check for duplicates, so if a handler is bound more than once
     * to the same signal, it will be called multiple times when the signal is emitted.
     * @param {qui.base.Signal.SignalHandler} handler the handler function to add
     * @param {Boolean} [once] optionally set this to `true` to call the handler only once, the first time the signal is
     * emitted, and then disconnect the handler from the signal
     * @returns {qui.base.Signal} this signal
     */
    connect(handler, once = false) {
        this._handlers.push({handler: handler, once: once})

        return this
    }

    /**
     * Remove a handler from the signal.
     * @param {qui.base.Signal.SignalHandler} [handler] the handler function to disconnect
     * @returns {qui.base.Signal} this signal
     */
    disconnect(handler) {
        this._handlers = this._handlers.filter(e => e.handler !== handler)

        return this
    }

    /**
     * Remove all handlers from the signal.
     * @returns {qui.base.Signal} this signal
     */
    disconnectAll() {
        this._handlers = []

        return this
    }

    /**
     * Emit the signal. All the handler functions will be called in the order of binding,
     * until one of them returns `false`.
     *
     * Any additional arguments to this function will be passed to the handlers.
     *
     * The handler functions are called with `this` set to the owner object of the signal.
     *
     * @params {...*} args arguments to be passed to the handlers
     * @returns {*} the last non-`false` value returned by the handlers
     */
    emit(...args) {
        // eslint-disable-next-line no-undef-init
        let globalResult = undefined

        this._handlers.some(function ({handler, once}) {

            if (once) {
                this.disconnect(handler)
            }

            let result = handler.apply(this._object, args)
            if (result !== false) {
                globalResult = result
            }

            if (result === false) {
                /* Returning false from a handler will stop
                 * the signal from being handled any further */
                return true
            }

        }, this)

        return globalResult
    }

}


export default Signal
