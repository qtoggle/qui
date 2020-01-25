
import $ from '$qui/lib/jquery.module.js'

import {AssertionError} from '$qui/base/errors.js'
import {Mixin}          from '$qui/base/mixwith.js'
import * as Toast       from '$qui/messages/toast.js'


/**
 * @alias qui.views.STATE_NORMAL
 */
export const STATE_NORMAL = 'normal'

/**
 * @alias qui.views.STATE_WARNING
 */
export const STATE_WARNING = 'warning'

/**
 * @alias qui.views.STATE_ERROR
 */
export const STATE_ERROR = 'error'

/**
 * @alias qui.views.STATE_PROGRESS
 */
export const STATE_PROGRESS = 'progress'


/** @lends qui.views.ViewMixin */
const ViewMixin = Mixin((superclass = Object) => {

    /**
     * A mixin to be used with classes that behave as views (have a visual HTML representation).
     * @alias qui.views.ViewMixin
     * @mixin
     */
    class ViewMixin extends superclass {

        /**
         * @constructs
         * @param {String} [cssClass] additional CSS classes to set to the view element
         * @param {...*} args parent class parameters
         */
        constructor({cssClass = null, ...args} = {}) {
            super(args)

            /* ViewMixin is prepared to be initialized multiple times along the inheritance path;
             * this may happen when inheriting ViewMixin more than once through mixins */

            if (this._html === undefined) {
                this._html = null
            }

            if (this._state === undefined) {
                this._state = STATE_NORMAL
                this._warningMessage = null
                this._errorMessage = null
                this._progressPercent = null
            }

            if (!this._cssClass) {
                this._cssClass = cssClass
            }
            else {
                this._cssClass += ` ${cssClass}`
            }
        }


        /* HTML */

        /**
         * Create the HTML element of this view.
         * @abstract
         * @returns {jQuery}
         */
        makeHTML() {
            return $('<div></div>')
        }

        /**
         * Override this to further initialize the HTML element of this view.
         * @param {jQuery} html the HTML element to be initialized
         */
        initHTML(html) {
        }

        /**
         * Return the HTML element of this view.
         * @returns {jQuery}
         */
        getHTML() {
            if (this._html == null) {
                this._html = this.makeHTML()
                this.initHTML(this._html)

                if (this._cssClass) {
                    this._html.addClass(this._cssClass)
                }

                this.init()
            }

            return this._html
        }

        /**
         * Initialize the view. Called after the HTML has been created and initialized.
         */
        init() {
        }


        /* State */

        /**
         * Update the current state.
         * @param {String} state the desired state
         */
        setState(state) {
            /* Make sure we have the HTML created before switching states */
            this.getHTML()

            if (this._state !== state) {
                this.leaveState(this._state, state)
            }

            let oldState = this._state
            this._state = state

            this.enterState(oldState, state)
        }

        /**
         * Return the current view state.
         * @returns {String}
         */
        getState() {
            return this._state
        }

        /**
         * Define the behavior of the view when entering states. Entering a state usually means showing a visual element
         * corresponding to that state.
         * @param {String} oldState
         * @param {String} newState
         */
        enterState(oldState, newState) {
            switch (newState) {
                case STATE_NORMAL:
                    break

                case STATE_WARNING:
                    this.showWarning(this._warningMessage)
                    break

                case STATE_ERROR:
                    this.showError(this._errorMessage)
                    break

                case STATE_PROGRESS:
                    this.showProgress(this._progressPercent)
                    break
            }
        }

        /**
         * Define the behavior of the view when leaving states. Leaving a state usually means hiding a visual element
         * corresponding to that state.
         * @param {String} oldState
         * @param {String} newState
         */
        leaveState(oldState, newState) {
            switch (oldState) {
                case STATE_NORMAL:
                    break

                case STATE_WARNING:
                    this._warningMessage = null
                    this.hideWarning()
                    break

                case STATE_ERROR:
                    this._errorMessage = null
                    this.hideError()
                    break

                case STATE_PROGRESS:
                    this._progressPercent = null
                    this.hideProgress()
                    break
            }
        }


        /* Progress */

        /**
         * Put the view in the progress state or updates the progress. The view state is set to
         * {@link qui.views.STATE_PROGRESS}.
         *
         * It is safe to call this method multiple times, updating the progress percent.
         *
         * @param {?Number} [percent] optional progress percent (from `0` to `100`); `null` indicates indefinite
         * progress
         */
        setProgress(percent = null) {
            /* No duplicate setProgress() protection, since we want to be able to update the progress */

            this._progressPercent = percent
            this.setState(STATE_PROGRESS)
        }

        /**
         * Put the view in the normal state, but only if the current state is {@link qui.views.STATE_PROGRESS}.
         */
        clearProgress() {
            if (this._state === STATE_PROGRESS) {
                this.setState(STATE_NORMAL)
            }
        }

        /**
         * Return the current progress percent.
         *
         * An exception will be thrown if the current view state is not {@link qui.views.STATE_PROGRESS}.
         *
         * @returns {?Number}
         */
        getProgressPercent() {
            if (this._state !== STATE_PROGRESS) {
                throw new AssertionError(`getProgressPercent() called in ${this._state} state`)
            }

            return this._progressPercent
        }

        /**
         * Define how the view is displayed in progress state, disallowing any user interaction.
         *
         * {@link qui.views.ViewMixin#inProgress} returns `true` when called from this method.
         *
         * Does nothing by default. Override this method to implement your own progress display.
         *
         * @param {?Number} [percent] optional progress percent (from `0` to `100`); `null` indicates indefinite
         * progress
         */
        showProgress(percent) {
        }

        /**
         * Hide a previously displayed progress, re-enabling user interaction.
         *
         * {@link qui.views.ViewMixin#inProgress} returns `false` when called from this method.
         *
         * Does nothing by default. Override this method to implement your own progress hiding.
         */
        hideProgress() {
        }

        /**
         * Tell if the view is currently in progress (its state is {@link qui.views.STATE_PROGRESS}).
         * @returns {Boolean}
         */
        inProgress() {
            return this._state === STATE_PROGRESS
        }


        /* Warning */

        /**
         * Put the view in the warning state or updates the warning message. The view state is set to
         * {@link qui.views.STATE_WARNING}.
         *
         * It is safe to call this method multiple times, updating the warning message.
         *
         * @param {?String} [message] an optional warning message
         */
        setWarning(message = null) {
            /* No duplicate setWarning() protection, since we want to be able to update the error */

            this._warningMessage = message
            this.setState(STATE_WARNING)
        }

        /**
         * Put the view in the normal state, but only if the current state is {@link qui.views.STATE_WARNING}.
         */
        clearWarning() {
            if (this._state === STATE_WARNING) {
                this.setState(STATE_NORMAL)
            }
        }

        /**
         * Return the warning message set with {@link qui.views.ViewMixin#setWarning} or `null` if no warning message
         * was set.
         *
         * An exception will be thrown if the current view state is not {@link qui.views.STATE_WARNING}.
         *
         * @returns {?String}
         */
        getWarningMessage() {
            if (this._state !== STATE_WARNING) {
                throw new AssertionError(`getWarningMessage() called in ${this._state} state`)
            }

            return this._warningMessage
        }

        /**
         * Define how the view is displayed in warning state, showing the warning message.
         *
         * {@link qui.views.ViewMixin#hasWarning} returns `true` when called from this method.
         *
         * By default displays a warning toast message. Override this method to implement your own warning display.
         *
         * @param {?String} message the warning message, or `null` if no warning message available
         */
        showWarning(message) {
            Toast.show({message: message, type: 'error', timeout: 0})
        }

        /**
         * Hide a previously displayed warning.
         *
         * {@link qui.views.ViewMixin#hasWarning} returns `false` when called from this method.
         *
         * By default calls {@link qui.messages.toast.hide}. Override this method to implement your own warning
         * hiding.
         */
        hideWarning() {
            Toast.hide()
        }

        /**
         * Tell if the view is currently in the warning state (its state is {@link qui.views.STATE_WARNING}).
         * @returns {Boolean}
         */
        hasWarning() {
            return this._state === STATE_WARNING
        }


        /* Error */

        /**
         * Put the view in the error state or updates the error message.
         *
         * The view state is set to {@link qui.views.STATE_ERROR}.
         *
         * It is safe to call this method multiple times, updating the error message.
         *
         * @param {?String|Error} [message] an error message
         */
        setError(message = null) {
            /* No duplicate setError() protection, since we want to be able to update the error */

            if (message instanceof Error) {
                message = message.message
            }

            this._errorMessage = message
            this.setState(STATE_ERROR)
        }

        /**
         * Put the view in the normal state, but only if the current state is {@link qui.views.STATE_ERROR}.
         */
        clearError() {
            if (this._state === STATE_ERROR) {
                this.setState(STATE_NORMAL)
            }
        }

        /**
         * Return the error message set with {@link qui.views.ViewMixin#setError} or `null` if no error message was set.
         *
         * An exception will be thrown if the current view state is not {@link qui.views.STATE_ERROR}.
         *
         * @returns {?String}
         */
        getErrorMessage() {
            if (this._state !== STATE_ERROR) {
                throw new AssertionError(`getErrorMessage() called in ${this._state} state`)
            }

            return this._errorMessage
        }

        /**
         * Define how the view is displayed in error state, showing the error message.
         *
         * {@link qui.views.ViewMixin#hasError} returns `true` when called from this method.
         *
         * By default displays a error toast message. Override this method to implement your own error display.
         *
         * @param {?String} message the error message, or `null` if no error message available
         */
        showError(message) {
            Toast.show({message: message, type: 'error', timeout: 0})
        }

        /**
         * Hide a previously displayed error.
         *
         * {@link qui.views.ViewMixin#hasError} returns `false` when called from this method.
         *
         * By default calls {@link qui.messages.toast.hide}. Override this method to implement your own error
         * hiding.
         */
        hideError() {
            Toast.hide()
        }

        /**
         * Tell if the view is currently in the error state (its state is {@link qui.views.STATE_ERROR}).
         * @returns {Boolean}
         */
        hasError() {
            return this._state === STATE_ERROR
        }


        /* Closing */

        /**
         * Tell if the view has been closed.
         *
         * By default returns `false`.
         *
         * Override this method to implement your own closed status.
         *
         * @returns {Boolean}
         */
        isClosed() {
            return false
        }

        /**
         * Close the view.
         *
         * By default does nothing.
         *
         * Override this method to implement your own close behavior.
         */
        close() {
        }

    }

    return ViewMixin

})


export default ViewMixin
