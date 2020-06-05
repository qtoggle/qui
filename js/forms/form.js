
import $ from '$qui/lib/jquery.module.js'

import {AssertionError}      from '$qui/base/errors.js'
import {mix}                 from '$qui/base/mixwith.js'
import * as Theme            from '$qui/theme.js'
import {asap}                from '$qui/utils/misc.js'
import * as ObjectUtils      from '$qui/utils/object.js'
import {ProgressViewMixin}   from '$qui/views/common-views/common-views.js'
import {StructuredViewMixin} from '$qui/views/common-views/common-views.js'
import {STATE_NORMAL}        from '$qui/views/view.js'
import ViewMixin             from '$qui/views/view.js'
import * as Window           from '$qui/window.js'

import {ErrorMapping}    from './forms.js'
import {ValidationError} from './forms.js'
import {STATE_APPLIED}   from './forms.js'
import FormField         from './form-field.js'


const __FIX_JSDOC = null /* without this, JSDoc considers following symbol undocumented */


/**
 * A form.
 * @alias qui.forms.Form
 * @mixes qui.views.ViewMixin
 * @mixes qui.views.commonviews.StructuredViewMixin
 * @mixes qui.views.commonviews.ProgressViewMixin
 */
class Form extends mix().with(ViewMixin, StructuredViewMixin, ProgressViewMixin) {

    /**
     * @constructs
     * @param {Number|String} [width] a specific form width to be used instead of the default
     * @param {Boolean} [noBackground] indicates that the form should have transparent background (defaults to
     * `false`)
     * @param {Boolean} [compact] indicates that the form should be compact to better fit in smaller containers;
     * compact forms have field labels and values on separate lines, to reduce the overall form width (defaults to
     * `false`)
     * @param {Number} [valuesWidth] sets the width of the values column, as percent, relative to the form body; when
     * set to `0` the width of each field's value will be computed automatically; this attribute is ignored for forms
     * that have `compact` set to `true` (defaults to `60`)
     * @param {Boolean} [continuousValidation] if set to `true`, each field will be validated upon change, instead of
     * when the form data is applied (using {@link qui.forms.Form#applyData}). Defaults to `false`
     * @param {Boolean} [closeOnApply] if set to `false`, the form will not automatically close when data is applied
     * (using {@link qui.forms.Form#applyData}). Defaults to `true`
     * @param {Boolean} [autoDisableDefaultButton] controls if the default button is automatically enabled and disabled
     * based on currently changed fields, their validity and applied state. Defaults to `true`
     * @param {qui.forms.FormField[]} [fields] fields to be added to the form
     * @param {qui.forms.FormButton[]} [buttons] buttons to be added to the form
     * @param {Object} [initialData] a dictionary with initial values for the fields
     * @param {...*} args parent class parameters
     */
    constructor({
        width = null,
        noBackground = false,
        compact = false,
        valuesWidth = 60,
        continuousValidation = false,
        closeOnApply = true,
        autoDisableDefaultButton = true,
        fields = [],
        buttons = [],
        initialData = null,
        ...args
    } = {}) {
        super(args)

        this._width = width
        this._noBackground = noBackground
        this._compact = compact
        this._valuesWidth = valuesWidth
        this._continuousValidation = continuousValidation
        this._closeOnApply = closeOnApply
        this._autoDisableDefaultButton = autoDisableDefaultButton
        this._fields = fields
        this._buttons = buttons
        this._initialData = initialData

        /* Last known validity state */
        this._isValid = null
        this._validationCache = {}
        this._updateValidationStateASAPHandle = null

        /* Tells whether a field has been changed or not, since the last setData() or ever */
        this._fieldsByName = {}

        this._errorDiv = null
    }


    /* Various attributes */

    /**
     * Tell if the form uses the compact layout.
     * @returns {Boolean}
     */
    isCompact() {
        return this._compact
    }


    /* HTML */

    makeHTML() {
        return $('<form></form>', {class: 'qui-form'})
    }

    initHTML(html) {
        super.initHTML(html)

        if (this._width) {
            html.css('width', this._width)
        }

        if (this._noBackground) {
            html.addClass('no-background')
        }

        if (this._compact) {
            html.addClass('compact')
        }

        /* React on Escape and Enter keys */
        html.on('keydown', function (e) {

            if (e.which === 27) { /* Escape */
                asap(function () {
                    this.cancelAction()
                }.bind(this))

                return false
            }
            else if (e.which === 13) { /* Enter */
                asap(function () {
                    this.defaultAction()
                }.bind(this))

                return false
            }

        }.bind(this))

        /* Override default form submit */
        html.on('submit', function () {

            asap(function () {
                this.defaultAction()
            }.bind(this))

            return false

        }.bind(this))

        /* Fields */
        let fields = this._fields
        this._fields = []

        fields.forEach(f => this.addField(-1, f))

        /* Add buttons */
        let buttons = this._buttons
        this._buttons = []

        buttons.forEach(b => this.addButton(-1, b))

        /* Set initial data */
        if (this._initialData) {
            this.setData(this._initialData)
        }
        else if (this._continuousValidation) {
            this.updateValidationState()
        }

        this._updateBottom()
    }

    makeBody() {
        /* Body element */
        let bodyDiv = $('<div></div>', {class: 'qui-form-body'})

        /* Error */
        this._errorDiv = $('<div></div>', {class: 'qui-form-error'})
        let errorLabel = $('<div></div>', {class: 'qui-form-error-label'})
        let errorIcon = $('<span></span>', {class: 'qui-form-error-icon'})
        let errorText = $('<span></span>', {class: 'qui-form-error-text'})
        errorLabel.append(errorIcon).append(errorText)
        this._errorDiv.append(errorLabel)

        bodyDiv.append(this._errorDiv)

        return bodyDiv
    }

    makeBottom() {
        return $('<div></div>', {class: 'qui-form-bottom'})
    }

    _updateBottom() {
        /* Add/remove "buttonless" class */
        this.getHTML().toggleClass('buttonless', this._buttons.length === 0)

        /* Update grid template */
        if (this.isCompact() || Window.isSmallScreen()) {
            this.getBottom().css('grid-template-columns', `repeat(${this._buttons.length}, 1fr)`)
        }
    }


    /* Buttons */

    /**
     * Add a button to the form.
     * @param {Number} index the index where the button should be added; `-1` will add the button at the end
     * @param {qui.forms.FormButton} button the button
     */
    addButton(index, button) {
        button.getHTML().on('click', () => this.onButtonPress(button))
        button.setForm(this)

        if (index >= 0 && this._bottomDiv.children().length) {
            this._buttons.splice(index, 0, button)
            this._bottomDiv.children(`:eq(${index})`).before(button.getHTML())
        }
        else {
            this._buttons.push(button)
            this._bottomDiv.append(button.getHTML())
        }

        this._updateBottom()
        this.updateButtonsState()
    }

    /**
     * Remove a button from the form.
     * @param {String} id the button id
     */
    removeButton(id) {
        if (!this._bottomDiv) { /* Not created yet */
            return
        }

        let index = this._buttons.findIndex(b => b.getId() === id)
        if (index >= 0) {
            this._buttons[index].getHTML().remove()
            this._buttons.splice(index, 1)
        }

        this._updateBottom()
        this.updateButtonsState()
    }

    /**
     * Return the form button with the given id.
     * @param {String} id the button id
     * @returns {?qui.forms.FormButton}
     */
    getButton(id) {
        /* Ensure HTML is created */
        this.getHTML()

        return this._buttons.find(b => b.getId() === id) || null
    }

    /**
     * Return all form buttons.
     * @returns {qui.forms.FormButton[]}
     */
    getButtons() {
        return this._buttons.slice()
    }

    /**
     * Called when one of the form buttons is pressed.
     * @param {qui.forms.FormButton} button
     */
    onButtonPress(button) {
    }

    /**
     * Update internal form state related to buttons.
     */
    updateButtonsState() {
        if (this._autoDisableDefaultButton) {
            let defaultButton = this._buttons.find(b => b.isDefault())
            if (defaultButton) {
                let enabled
                if (this._continuousValidation) {
                    enabled = this._isValid !== false
                }
                else {
                    enabled = (this.getChangedFieldNames().length > 0) ||
                              (this._fields.length === 0)
                }

                if (enabled) {
                    defaultButton.enable()
                }
                else {
                    defaultButton.disable()
                }
            }
        }
    }


    /* Fields */

    /**
     * Add a field to the form.
     * @param {Number} index the index where the field should be added; `-1` will add the field at the end
     * @param {qui.forms.FormField} field the field
     */
    addField(index, field) {
        /* Ensure HTML is created */
        this.getHTML()

        let name = field.getName()
        if (name in this._fieldsByName) {
            throw new AssertionError(`Field with name "${name}" already present on form`)
        }

        field.setForm(this)

        if (index >= 0 && index < this._fields.length) {
            this._fields.splice(index, 0, field)
            this._bodyDiv.children(`div.qui-form-field:eq(${index})`).before(field.getHTML())
        }
        else {
            this._fields.push(field)
            this._bodyDiv.append(field.getHTML())
        }
        this._fieldsByName[name] = field

        /* The form itself may no longer be valid */
        this._clearValidationCache('')

        this.updateButtonsState()
        this.updateFieldsState()
    }

    /**
     * Remove a field from the form.
     * @param {String|qui.forms.FormField} nameOrField the name of the field or a field object
     */
    removeField(nameOrField) {
        if (!this._bodyDiv) { /* Not created yet */
            return
        }

        let name
        if (nameOrField instanceof FormField) {
            name = nameOrField.getName()
        }
        else {
            name = nameOrField
        }

        let index = this._fields.findIndex(function (field) {
            return field.getName() === name
        })

        if (index >= 0) {
            this._fields.splice(index, 1)
        }

        this._bodyDiv.children(`div.qui-form-field[data-name=${name}]`).remove()

        delete this._fieldsByName[name]

        /* Invalidate form's validation cache */
        this._clearValidationCache(name)

        this.updateButtonsState()
        this.updateFieldsState()
    }

    /**
     * Return the field with a given name. If no such field is found, `null` is returned.
     * @param {String} name the name of the field
     * @returns {?qui.forms.FormField}
     */
    getField(name) {
        return this._fieldsByName[name] || null
    }

    /**
     * Return the index of the given field. If the field does not belong to this form, `-1` is returned.
     * @param {qui.forms.FormField|String} field the field or a field name
     * @returns {Number}
     */
    getFieldIndex(field) {
        if (typeof field === 'string') {
            return this._fields.findIndex(f => f.getName() === field)
        }
        else {
            return this._fields.indexOf(field)
        }
    }

    /**
     * Return the list of all fields.
     * @returns {qui.forms.FormField[]}
     */
    getFields() {
        return this._fields.slice()
    }

    /**
     * Update internal form state related to fields.
     */
    updateFieldsState() {
        /* Update {first-last}-visible CSS classes */
        let firstVisible = false
        let lastVisibleIndex = -1
        this._fields.forEach(function (field, i) {
            let html = field.getHTML()
            html.removeClass('first-visible last-visible')

            if (!field.isHidden()) {
                if (!firstVisible) {
                    firstVisible = true
                    html.addClass('first-visible')
                }
                lastVisibleIndex = i
            }
        })

        if (lastVisibleIndex >= 0) {
            this._fields[lastVisibleIndex].getHTML().addClass('last-visible')
        }
    }


    /* Data & validation */

    _validateData(fieldName) {
        /* Ensure HTML is created */
        this.getHTML()

        let form = this

        /* Gather raw form data for validation */
        let data = ObjectUtils.mapValue(this._fieldsByName, function (field) {
            return field.getValue()
        })

        let promisesDict = {}

        /* Validate fields */
        let fields = this._fields
        if (fieldName) {
            /* A specific field was given, restrict the validation to given field */
            fields = [this._fieldsByName[fieldName]]
        }

        fields.forEach(function (field) {
            let name = field.getName()
            let value = data[name]
            let fieldPromise

            /* Use cached validation result, if available */
            let cached = form._validationCache[name]
            if (cached != null && !(cached instanceof Promise)) {
                if (cached === true) { /* Validation passed */
                    fieldPromise = Promise.resolve()
                }
                else { /* Assuming (cached instanceof qui.forms.ValidationError) */
                    fieldPromise = Promise.reject(cached)
                }
            }
            else {
                /* Field internal validation */
                fieldPromise = field._validate(value, data).then(function () {

                    /* Field validation in form context */
                    return form.validateField(name, value, data)

                })

                /* Schedule after pending validation */
                if (cached instanceof Promise) {
                    fieldPromise = cached.catch(() => {}).then(function () {
                        return this
                    }.bind(fieldPromise))
                }

                fieldPromise = fieldPromise.then(function () {

                    form._validationCache[name] = true
                    return value

                }).catch(function (error) {

                    if (field.isHidden()) {
                        /* Hidden fields are always considered valid */
                        form._validationCache[name] = true
                    }
                    else {
                        form._validationCache[name] = error
                        throw error
                    }

                })

                /* Set pending validation */
                form._validationCache[name] = fieldPromise
            }

            promisesDict[name] = fieldPromise
        })

        let errors = {}
        ObjectUtils.forEach(promisesDict, function (fieldName, promise) {
            promise.catch(function (error) {
                errors[fieldName] = error
            })
        })

        let fieldsPromise = Promise.all(Object.values(promisesDict)).then(function () {

            if (fieldName) {
                return data[fieldName]
            }
            else {
                return data
            }

        }).catch(function () {

            if (fieldName) {
                throw errors[fieldName]
            }
            else {
                throw new ErrorMapping(errors)
            }

        })

        if (!fieldName) {
            /* Validate the form itself */
            let formPromise

            /* Use cached validation result, if available */
            let cached = form._validationCache['']
            if (cached != null && !(cached instanceof Promise)) {
                if (cached === true) { /* Validation passed */
                    formPromise = Promise.resolve(data)
                }
                else { /* Assuming (cached instanceof qui.forms.ValidationError) */
                    formPromise = Promise.reject(cached)
                }
            }
            else { /* We don't have a cached result available right away */

                /* Call form validation after the fields have been validated; this ensures that validate() is always
                 * called with valid field values */

                formPromise = fieldsPromise.then(function () {

                    return form._validate(data)

                }).then(function () {

                    form._validationCache[''] = true
                    return data

                })

                /* Schedule current validation after cached (pending) validation */
                if (cached instanceof Promise) {
                    let p = formPromise
                    formPromise = cached.catch(() => {}).then(() => p)
                }

                /* Set pending validation */
                form._validationCache[''] = formPromise
            }

            return formPromise
        }
        else {
            return fieldsPromise
        }
    }

    /**
     * Invalidate the validation cache for a specific field as well as for the form itself. If no field name is given,
     * the entire validation cache is cleared.
     * @private
     * @param {String} [fieldName] the name of the field whose cache should be invalidated
     */
    _clearValidationCache(fieldName) {
        let keys

        if (fieldName != null) {
            keys = ['', fieldName]
        }
        else {
            keys = Object.keys(this._validationCache)
        }

        keys.forEach(function (key) {
            if (!(this._validationCache[key] instanceof Promise)) {
                delete this._validationCache[key]
            }
        }, this)

        this._isValid = null
    }

    /**
     * Wrap validate() into a try/catch and return a validation promise.
     * @private
     * @param {Object} data
     * @returns {Promise}
     */
    _validate(data) {
        try {
            return this.validate(data) || Promise.resolve()
        }
        catch (e) {
            if (e instanceof ValidationError) {
                return Promise.reject(e)
            }
            else {
                throw e
            }
        }
    }

    /**
     * Tell if given form data is valid as a whole or not. This method is called only with valid field data. Override
     * this method to implement custom form validation.
     * @param {Object} data the form data to validate
     * @returns {?Promise<*,qui.forms.ValidationError>} `null` or a resolved promise, if the data is valid; a promise
     * rejected with a validation error otherwise;
     * @throws qui.forms.ValidationError the validation error can also be thrown instead of being returned in a rejected
     * promise
     */
    validate(data) {
        return null
    }

    /**
     * Override this method to implement custom field validation in the context of this form.
     * @param {String} name the field name
     * @param {*} value the field value to validate
     * @param {Object} data the form unvalidated data
     * @returns {?Promise<*,qui.forms.ValidationError>} `null` or a resolved promise, if the value is valid; a promise
     * rejected with a validation error otherwise;
     * @throws qui.forms.ValidationError the validation error can also be thrown instead of being returned in a rejected
     * response
     */
    validateField(name, value, data) {
        return null
    }

    /**
     * Used for continuous validation. Runs a "background" validation to:
     *  * show possible field/form errors
     *  * update internal validity state
     *  * enable/disable default form button
     * @param {Object<String,Error>} [extraErrors] a dictionary containing any extra field errors that should be
     * considered in addition to those returned by the validation mechanism.
     * @returns {Promise<Object>} a promise that is resolved with form data, if the form is valid (the promise is never
     * rejected)
     */
    updateValidationState(extraErrors = null) {
        let hasExtraErrorsSentinel = new Error()

        return this._validateData().then(function (data) {

            this._clearErrors()

            if (this._isValid === false || this._isValid == null) { /* Form just became valid */
                this._isValid = true
                this.onValid(data)
                this.updateButtonsState()
                this.updateFieldsState()
            }

            if (extraErrors && Object.keys(extraErrors).length) {
                throw hasExtraErrorsSentinel /* extraErrors will be merged in soon, in catch() */
            }

            return data

        }.bind(this)).catch(function (e) {

            let errors
            if (e === hasExtraErrorsSentinel) {
                errors = extraErrors
            }
            else if (e instanceof ErrorMapping) {
                errors = e.errors
            }
            else { /* If an exception is thrown during validation, consider it a form error */
                errors = {'': e}
            }

            ObjectUtils.forEach(errors, function (name, error) {

                /* Do not show error messages for unchanged fields */
                if (name && !this._fieldsByName[name].isChanged()) {
                    errors[name] = ''
                }

            }, this)

            /* Do not show form error unless at least one field has been changed */
            if (this.getChangedFieldNames().length === 0) {
                delete errors['']
            }

            this._clearErrors()
            this._setErrors(errors)

            if (this._isValid === true || this._isValid == null) { /* Form just became invalid */
                this._isValid = false
                this.onInvalid()
                this.updateButtonsState()
                this.updateFieldsState()
            }

        }.bind(this))
    }

    /**
     * Calls {@link qui.forms.Form#updateValidationState} asap, preventing multiple unnecessary successive calls.
     */
    updateValidationStateASAP() {
        if (this._updateValidationStateASAPHandle) {
            clearTimeout(this._updateValidationStateASAPHandle)
        }

        this._updateValidationStateASAPHandle = asap(function () {

            this._updateValidationStateASAPHandle = null
            this.updateValidationState()

        }.bind(this))
    }

    /**
     * Return the current value of a field, in a promise, after making sure the entire form is valid.
     * @returns {Promise<*>} a promise that is resolved with the field value, if the form is valid, and is rejected, if
     * the form is invalid
     */
    getFieldValue(fieldName) {
        return this._validateData(fieldName).catch(function (error) {
            return Promise.reject(error)
        })
    }

    /**
     * Return the current value of a field without performing any validation.
     * @returns {?*} the current field value or `null` if no such field is found
     */
    getUnvalidatedFieldValue(fieldName) {
        let field = this._fieldsByName[fieldName]
        if (!field) {
            return null
        }

        return field.getValue()
    }

    /**
     * Return the current form data in a promise, after making sure it is valid.
     * @returns {Promise} a promise that is resolved with a dictionary of field values, if the form is valid, and is
     * rejected with a dictionary of errors associated to invalid fields, if the form is invalid
     */
    getData() {
        return this._validateData()
    }

    /**
     * Return the current form data without validating fields or the form.
     * @returns {Object} a dictionary with field values
     */
    getUnvalidatedData() {
        return ObjectUtils.mapValue(this._fieldsByName, function (field) {
            return field.getValue()
        })
    }

    /**
     * Update the form data.
     * @param {Object} data the new form data
     */
    setData(data) {
        /* Ensure HTML is created */
        this.getHTML()

        this._clearValidationCache()

        ObjectUtils.forEach(data, function (name, value) {

            let field = this._fieldsByName[name]
            if (!field) {
                return
            }

            field.setValue(value)

        }.bind(this))

        if (this._continuousValidation) {
            this.updateValidationState()
        }
    }

    /**
     * Return the names of the fields whose values have been changed.
     * @returns {String[]}
     */
    getChangedFieldNames() {
        return this._fields.filter(f => f.isChanged()).map(f => f.getName())
    }

    /**
     * Called whenever a field value changes.
     * @param {Object} data the *unvalidated* form data
     * @param {String} fieldName the name of the field that was changed
     */
    onChange(data, fieldName) {
    }

    /**
     * Called whenever a field value changes and the form is entirely valid. This method is only called for forms with
     * `continuousValidation` set to `true`.
     * @param {Object} data the validated form data
     * @param {String} fieldName the name of the field that was changed
     */
    onChangeValid(data, fieldName) {
    }

    /**
     * Called when the form data becomes valid.
     * @param {Object} data the form data
     */
    onValid(data) {
    }

    /**
     * Called when the form data becomes invalid.
     */
    onInvalid() {
    }


    /* Applying */

    /**
     * A function that applies the form data.
     *
     * If `null` or `undefined` is returned, the form data is considered applied right away. If a promise is returned,
     * data is considered applied when the promise is resolved and {@link qui.forms.Form#setApplied} is called to mark
     * the form as applied.
     *
     * A rejected promise will set a form error using {@link qui.views.ViewMixin#setError}. To set field errors, reject
     * the returned promise with a {@link qui.forms.ErrorMapping}. A null error will simply cancel the application,
     * without setting any error.
     *
     * Form will be put in progress using {@link qui.views.ViewMixin#setProgress} while promise is active.
     *
     * @param {Object} data form data to be applied
     * @returns {?Promise<*,Error>}
     * @throws Error errors in applying the data can also be thrown
     */
    applyData(data) {
    }

    /**
     * Called when the user closes the form without applying the data.
     */
    onCancel() {
    }

    /**
     * Implement this method to define how a field value is applied when it changes. This method can be used to
     * implement continuous form saving, eliminating the need of a general form save button.
     *
     * For continuous form saving to work, the form attribute `continuousValidation` must be set to `true`.
     *
     * If a promise is returned, value is considered applied when the promise is resolved and
     * {@link qui.forms.Form#setApplied} is called to mark the form as applied. A rejected promise will set a field
     * error using {@link qui.views.ViewMixin#setError}.
     *
     * The field will be put in progress using {@link qui.views.ViewMixin#setProgress} while promise is active.
     *
     * Returning `null` or `undefined` indicates that values cannot be applied continuously for the given field (this is
     * the default behaviour).
     *
     * @param {*} value the validated field value
     * @param {String} fieldName the name of the field that was changed
     * @returns {?Promise<*,Error>}
     * @throws Error errors in applying the value can also be thrown
     */
    applyField(value, fieldName) {
        return null
    }

    _handleFieldChange(field) {
        let name = field.getName()

        /* If continuous validation is disabled, simply call onChange with corresponding arguments and return */
        if (!this._continuousValidation) {
            /* Gather raw (unvalidated) form data */
            let data = ObjectUtils.mapValue(this._fieldsByName, function (field) {
                return field.getValue()
            })

            this.onChange(data, name)
            this.updateButtonsState()
            this.updateFieldsState()

            return
        }

        /* Invalidate validation cache for this field, as well as the form's */
        this.clearApplied()
        this._clearValidationCache(name)
        this._clearErrors(name)
        this._validateData(name).then(function (value) {

            let whenApplied = this.applyField(value, name)
            if (whenApplied) {
                field.setProgress()
                whenApplied.then(function () {
                    field.setApplied()
                })

                return whenApplied
            }

        }.bind(this)).catch(function (error) {

            field.setError(error)

            return error /* Pass error further as a simple argument */

        }).then(function (error) {

            /* Gather raw (unvalidated) form data */
            let data = ObjectUtils.mapValue(this._fieldsByName, function (field) {
                return field.getValue()
            })

            this.onChange(data, name)
            let extraErrors = error ? {[name]: error} : null

            this.updateValidationState(extraErrors).then(function (data) {

                if (this._isValid) {
                    this.onChangeValid(data, name)
                }

            }.bind(this))

        }.bind(this))
    }


    /* Error state */

    showError(message) {
        if (message) {
            this._errorDiv.find('span.qui-form-error-text').html(message)
            this.getHTML().addClass('has-error')
        }

        this._errorDiv[0].scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
        })
    }

    hideError() {
        this.getHTML().removeClass('has-error')
        Theme.afterTransition(function () {

            if (this.hasError()) {
                return /* Error has been reshown */
            }

            this._errorDiv.find('span.qui-form-error-text').html('')

        }.bind(this), this.getHTML())
    }


    /* Applied state */

    /**
     * Put the form in the applied state. The view state is set to {@link qui.forms.STATE_APPLIED}.
     */
    setApplied() {
        this.setState(STATE_APPLIED)
    }

    /**
     * Put the form in the normal state, but only if the current state is {@link qui.forms.STATE_APPLIED}.
     */
    clearApplied() {
        if (this.getState() === STATE_APPLIED) {
            this.setState(STATE_NORMAL)
        }
    }

    /**
     * Tell if the form data has been applied (and thus there are no pending changes).
     * @returns {Boolean}
     */
    isApplied() {
        /* A form is applied when either it is itself in applied state, or when all of its fields are applied
         * themselves */

        if (this.getState() === STATE_APPLIED) {
            return true
        }

        return this._fields.every(function (f) {
            return f.isApplied()
        })
    }


    /* Errors */

    _clearErrors(fieldName) {
        if (!fieldName) {
            /* General form error */
            this.clearError()

            /* Field errors */
            this.getFields().forEach(field => field.clearError())
        }
        else { /* Specific field error */
            let field = this.getField(fieldName)
            if (field) {
                field.clearError()
            }
        }
    }

    _setErrors(errors) {
        ObjectUtils.forEach(errors, function (name, msg) {
            if (name) {
                let field = this.getField(name)
                if (field) {
                    field.setError(msg)
                }
            }
            else {
                this.setError(msg)
            }
        }, this)

        /* Always unminimize form upon errors */
        if (this.isMinimizable() && this.isMinimized()) {
            this.unminimize()
        }
    }


    /* Actions */

    /**
     * Execute the default form action. By default this is {@link qui.forms.Form#proceed}.
     */
    defaultAction() {
        this.proceed()
    }

    /**
     * Execute the cancel form action. By default this is {@link qui.forms.Form#close}.
     */
    cancelAction() {
        this.close(/* force = */ true)
    }

    /**
     * Run the form by gathering, validating and applying form data.
     * @returns {Promise}
     */
    proceed() {
        this.setProgress()

        let dataValidated

        if (!this._continuousValidation) {
            /* When continuous validation is disabled, we need to manually catch errors when form data is applied, and
             * display them onto the form */

            this._clearValidationCache()
            this._clearErrors()

            dataValidated = this._validateData().catch(function (e) {

                let errorMapping = new ErrorMapping(e)
                this._clearErrors()
                this._setErrors(errorMapping.errors)

                throw errorMapping

            }.bind(this))
        }
        else {
            dataValidated = this._validateData()
        }

        return dataValidated.then(function (data) {

            let whenApplied
            try {
                whenApplied = this.applyData(data)
            }
            catch (e) {
                whenApplied = Promise.reject(e)
            }

            if (!whenApplied) {
                whenApplied = Promise.resolve()
            }

            whenApplied.then(function () {

                this.setApplied()
                this._fields.forEach(f => f.clearChanged())
                this.updateButtonsState()
                this.updateFieldsState()

                if (this._closeOnApply) {
                    if (!this.isClosed()) {
                        this.close(/* force = */ true)
                    }
                }

            }.bind(this)).catch(function (e) {

                this.clearProgress()

                /* e may be null/undefined, in which case, the form apply has simply been cancelled */
                if (e) {
                    let errorMapping = new ErrorMapping(e)
                    this._clearErrors()
                    this._setErrors(errorMapping.errors)
                }

            }.bind(this))

        }.bind(this)).catch(function () {

            this.clearProgress()

        }.bind(this))
    }

    /**
     * Close the form.
     */
    close() {
        if (!this.isApplied()) {
            this.onCancel()
        }
    }

}


export default Form
