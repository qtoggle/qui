/**
 * @namespace qui.forms
 */

import * as CommonForms from './common-forms/common-forms.js'


/**
 * Form *applied* state.
 * @alias qui.forms.STATE_APPLIED
 */
export const STATE_APPLIED = 'applied'


/**
 * A form (or form field) validation error.
 * @alias qui.forms.ValidationError
 * @extends Error
 */
export class ValidationError extends Error {

    /**
     * @constructs
     * @param {String} [message] the error message to be displayed to the user
     */
    constructor(message = null) {
        super(message || '')
    }

    toString() {
        return this.message
    }

}

/**
 * A mapping of form errors associated to their corresponding field names.
 * @alias qui.forms.ErrorMapping
 * @extends Error
 */
export class ErrorMapping extends Error {

    /**
     * @constructs
     * @param {Error|Object<String,Error>|qui.forms.ErrorMapping} errors one of:
     *  * a single error that will be associated to the form itself
     *  * a dictionary with errors mapped to field names which will be used as is
     *  * another error mapping object from which errors will be copied
     */
    constructor(errors) {
        super('Form errors')

        if (errors instanceof ErrorMapping) {
            this.errors = errors.errors
        }
        else if (errors instanceof Error) {
            this.errors = {'': errors}
        }
        else {
            this.errors = errors
        }
    }

}

export function init() {
    CommonForms.init()
}
