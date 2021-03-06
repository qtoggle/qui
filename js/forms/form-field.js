
import $ from '$qui/lib/jquery.module.js'

import {AssertionError}  from '$qui/base/errors.js'
import {gettext}         from '$qui/base/i18n.js'
import {mix}             from '$qui/base/mixwith.js'
import Icon              from '$qui/icons/icon.js'
import StockIcon         from '$qui/icons/stock-icon.js'
import * as Theme        from '$qui/theme.js'
import {asap}            from '$qui/utils/misc.js'
import VisibilityManager from '$qui/utils/visibility-manager.js'
import ViewMixin         from '$qui/views/view.js'
import {STATE_NORMAL}    from '$qui/views/view.js'
import * as Window       from '$qui/window.js'

import {STATE_APPLIED}   from './forms.js'
import {ValidationError} from './forms.js'


/**
 * A form field.
 * @alias qui.forms.FormField
 * @mixes qui.views.ViewMixin
 */
class FormField extends mix().with(ViewMixin) {

    /**
     * @constructs
     * @param {String} name field name
     * @param {String} [initialValue] an optional initial value for the field
     * @param {String} [label] field label
     * @param {String} [description] an optional field description
     * @param {String} [unit] an optional unit of measurement
     * @param {Boolean} [separator] if set to `true`, a separator will be drawn above the field (defaults to `false`)
     * @param {Boolean} [required] if set to `true`, the field value must be present for a successful validation
     * (defaults to `false`)
     * @param {Boolean} [readonly] if set to `true`, the field widget will not allow user input
     * @param {Boolean} [disabled] if set to `true`, the field widget will be completely disabled (defaults to `false`)
     * @param {Boolean} [hidden] if set to `true`, the field will be initially hidden (defaults to `false`)
     * @param {Boolean} [forceOneLine] if set to `true`, label and value will be shown on one single line, ignoring
     * form's `compact` attribute
     * @param {?Number} [valueWidth] sets the width of the value column, in percents, relative to the form body; if
     * set to `null` (the default), the form's `valuesWidth` setting will be used; if set to `0`, no width constraints
     * will be imposed on value or label; this attribute only works for fields displayed on a single line
     * @param {Function} [onChange] called whenever the field value changes (see {@link qui.forms.FormField#onChange})
     * @param {Function} [validate] a validator function (see {@link qui.forms.FormField#validate})
     * @param {...*} args parent class parameters
     */
    constructor({
        name,
        initialValue = null,
        label = '',
        description = '',
        unit = '',
        separator = false,
        required = false,
        readonly = false,
        disabled = false,
        hidden = false,
        forceOneLine = false,
        valueWidth = null,
        onChange = null,
        validate = null,
        ...args
    }) {
        super(args)

        this._name = name
        this._initialValue = initialValue
        this._label = label
        this._description = description
        this._unit = unit
        this._separator = separator
        this._required = required
        this._readonly = readonly
        this._disabled = disabled
        this._initiallyHidden = hidden
        this._visibilityManager = null
        this._forceOneLine = forceOneLine
        this._valueWidth = valueWidth

        if (onChange) {
            this.onChange = onChange
        }
        if (validate) {
            this.validate = validate
        }

        this._form = null
        this._widget = null
        this._descriptionDiv = null
        this._warningDiv = null
        this._errorDiv = null
        this._labelDiv = null
        this._valueDiv = null
        this._sideIcon = null
        this._sideIconDiv = null
        this._focused = false
        this._origValue = null
        this._changed = false
    }

    makeHTML() {
        if (!this._form) {
            throw new AssertionError('makeHTML() called before assigning to a form')
        }

        let html = $('<div></div>', {'class': 'qui-form-field', 'data-name': this._name})

        if (this._forceOneLine) {
            html.addClass('force-one-line')
        }

        let valueWidth = this._valueWidth
        if (valueWidth == null) {
            if (this._label) {
                valueWidth = this._form._valuesWidth
            }
            else {
                valueWidth = 0
            }
        }

        let useOneLine = !this._form.isCompact() || this._forceOneLine

        /* Description */
        this._descriptionDiv = this.makeDescriptionHTML()
        html.append(this._descriptionDiv)
        if (this._description) {
            html.addClass('has-description')
        }

        /* Warning */
        this._warningDiv = this.makeWarningHTML()
        html.append(this._warningDiv)

        /* Error */
        this._errorDiv = this.makeErrorHTML()
        html.append(this._errorDiv)

        /* Label */
        this._labelDiv = this.makeLabelHTML()
        html.append(this._labelDiv)
        if (useOneLine) {
            if (valueWidth) {
                this._labelDiv.css('width', `${(100 - valueWidth)}%`)
            }
            else {
                html.addClass('auto-width')
            }
        }

        if (this._label) {
            this._labelDiv.children('span.qui-form-field-label-caption').html(this._label)
            html.addClass('has-label')
        }

        /* Unit */
        if (this._unit) {
            this._labelDiv.find('span.qui-form-field-unit').text(`(${this._unit})`)
            html.addClass('has-unit')
        }

        /* Value */
        this._valueDiv = this.makeValueHTML()
        html.append(this._valueDiv)
        if (valueWidth && useOneLine) {
            this._valueDiv.css('width', `${valueWidth}%`)
        }

        /* Side icon */
        this._sideIconDiv = this.makeSideIconHTML()
        html.append(this._sideIconDiv)

        /* Other attributes */
        if (this._required) {
            html.addClass('required')
        }

        if (this._readonly) {
            html.addClass('readonly')
            this.setWidgetReadonly(true)
        }

        if (this._disabled) {
            this.disableWidget()
        }

        if (this._separator) {
            html.addClass('separator')
        }

        /* Initial value */
        if (this._initialValue != null) {
            this.setValue(this._initialValue)
        }

        this._visibilityManager = new VisibilityManager({element: html})

        if (this._initiallyHidden) {
            this._visibilityManager.hideElement()
        }

        return html
    }

    /**
     * Create the description HTML element.
     * @returns {jQuery}
     */
    makeDescriptionHTML() {
        let descDiv = $('<div></div>', {class: 'qui-form-field-description'})
        let descLabel = $('<div></div>', {class: 'qui-form-field-description-label'})
        let descIcon = $('<span></span>', {class: 'qui-form-field-description-icon'})
        let descText = $('<span></span>', {class: 'qui-form-field-description-text'})

        descLabel.append(descIcon).append(descText)
        descDiv.append(descLabel)

        if (this._description) {
            descText.html(this._description)
        }

        return descDiv
    }

    /**
     * Create the warning HTML element.
     * @returns {jQuery}
     */
    makeWarningHTML() {
        let warningDiv = $('<div></div>', {class: 'qui-form-field-warning'})
        let warningLabel = $('<div></div>', {class: 'qui-form-field-warning-label'})
        let warningText = $('<span></span>', {class: 'qui-form-field-warning-text'})

        warningLabel.append(warningText)
        warningDiv.append(warningLabel)

        return warningDiv
    }

    /**
     * Create the error HTML element.
     * @returns {jQuery}
     */
    makeErrorHTML() {
        let errorDiv = $('<div></div>', {class: 'qui-form-field-error'})
        let errorLabel = $('<div></div>', {class: 'qui-form-field-error-label'})
        let errorText = $('<span></span>', {class: 'qui-form-field-error-text'})

        errorLabel.append(errorText)
        errorDiv.append(errorLabel)

        return errorDiv
    }

    /**
     * Create the label HTML element.
     * @returns {jQuery}
     */
    makeLabelHTML() {
        let labelDiv = $('<div></div>', {class: 'qui-form-field-label'})

        let captionSpan = $('<span></span>', {class: 'qui-form-field-label-caption'})

        let descriptionIcon = new StockIcon({
            name: 'qmark',
            variant: 'disabled',
            scale: 0.5
        })

        let unitSpan = $('<span></span>', {class: 'qui-form-field-unit'})

        let descriptionIconDiv = $('<div></div>', {class: 'qui-base-button qui-form-field-description-icon'})
        descriptionIcon.applyTo(descriptionIconDiv)

        descriptionIconDiv.on('click', function () {
            if (this._description) {
                this.setDescriptionVisible(!this.isDescriptionVisible())
            }
        }.bind(this))

        labelDiv.append(captionSpan)
        labelDiv.append(unitSpan)
        labelDiv.append(descriptionIconDiv)

        return labelDiv
    }

    /**
     * Create the value HTML element.
     * @returns {jQuery}
     */
    makeValueHTML() {
        let valueDiv = $('<div></div>', {class: 'qui-form-field-value'})

        /* Value widget */
        let widget = this.getWidget()

        widget.on('change', () => this.handleChange(this.getValue()))
        widget.on('focus', () => this.handleFocus())
        widget.on('blur', () => this.handleBlur())

        /* Add widget to value div, but only if it hasn't already been added to another container; this allows fields
         * like CompositeField to use the widget directly inside their container. */
        if (!widget.parent().length) {
            valueDiv.append(widget)
        }

        return valueDiv
    }

    /**
     * Create the side icon HTML element.
     * @returns {jQuery}
     */
    makeSideIconHTML() {
        let sideIconDiv = $('<div></div>', {class: 'qui-base-button qui-form-field-side-icon'})

        this._sideIcon = new StockIcon({name: 'success', scale: 0.75})
        this._sideIcon.applyTo(sideIconDiv)

        return sideIconDiv
    }


    /* Value */

    /**
     * Return the current field value.
     * @returns {*}
     */
    getValue() {
        return this.widgetToValue()
    }

    /**
     * Update the current field value.
     * @param {*} value
     */
    setValue(value) {
        this._origValue = value
        this._changed = false

        this.valueToWidget(value)
    }

    /**
     * Handle change events.
     * @param {*} value new value
     */
    handleChange(value) {
        let form = this.getForm()

        this.clearApplied()
        this._changed = true
        this.onChange(value, form)
        form._handleFieldChange(this)
    }

    /**
     * Tell if field has been changed since the last time it was applied.
     * @returns {boolean}
     */
    isChanged() {
        return this._changed
    }

    /**
     * Clear the changed flag.
     */
    clearChanged() {
        this._origValue = this.getValue()
        this._changed = false
    }

    /**
     * Return the original field value (before user changes). The original value is always the last value that has been
     * applied.
     * @returns {*}
     */
    getOrigValue() {
        return this._origValue
    }


    /* Name */

    /**
     * Return the field name.
     * @returns {String}
     */
    getName() {
        return this._name
    }


    /* Label */

    /**
     * Return the field label.
     * @returns {String}
     */
    getLabel() {
        return this._label
    }

    /**
     * Update the field label.
     * @param {String} label
     */
    setLabel(label) {
        this._label = label

        if (!this.hasHTML()) {
            return
        }

        this._labelDiv.children('div.qui-form-field-label-caption').html(label || '')
        this.getHTML().toggleClass('has-label', Boolean(label))
    }


    /* Description */

    /**
     * Return the field description.
     * @returns {String}
     */
    getDescription() {
        return this._description
    }

    /**
     * Update the field description.
     * @param {String} description
     */
    setDescription(description) {
        this._description = description

        if (!this.hasHTML()) {
            return
        }

        let descText = this.getHTML().find('div.qui-form-field-description div.qui-form-field-description-text')

        if (description) {
            descText.html(description)
            this.getHTML().addClass('has-description')
        }
        else {
            descText.html('')
            this.getHTML().removeClass('has-description description-visible')
        }
    }

    /**
     * Tell if the field description is visible or not.
     * @returns {Boolean}
     */
    isDescriptionVisible() {
        return this.getHTML().hasClass('description-visible')
    }

    setDescriptionVisible(visible) {
        if (visible) {
            this.getHTML().addClass('description-visible')

            let field = this
            let descDiv = this.getHTML().children('div.qui-form-field-description')

            /* Close description when clicking anywhere */
            Window.$body.on('click', function f(e) {
                if (field.getHTML() === e.target ||
                    field.getHTML().has(e.target).length ||
                    descDiv.has(e.target).length) {

                    /* Clicked on the description itself */
                    return
                }

                Window.$body.off('click', f)
                field.setDescriptionVisible(false)
            })
        }
        else {
            this.getHTML().removeClass('description-visible')
        }
    }


    /* Unit */

    /**
     * Return the field unit.
     * @returns {String}
     */
    getUnit() {
        return this._unit
    }

    /**
     * Update the field unit.
     * @param {String} unit
     */
    setUnit(unit) {
        this._unit = unit

        if (!this.hasHTML()) {
            return
        }

        this._labelDiv.find('span.qui-form-field-unit').text(`(${this._unit || ''})`)
        this.getHTML().toggleClass('has-unit', Boolean(unit))
    }


    /* Separator */

    /**
     * Tell if the field has separator above.
     * @returns {Boolean}
     */
    hasSeparator() {
        return this._separator
    }

    /**
     * Set the field separator.
     * @param {Boolean} separator
     */
    setSeparator(separator) {
        this._separator = separator

        if (!this.hasHTML()) {
            return
        }

        this.getHTML().toggleClass('separator', separator)
    }


    /* Required */

    /**
     * Tell if the field is required.
     * @returns {Boolean}
     */
    isRequired() {
        return this._required
    }

    /**
     * Update the required state.
     * @param {Boolean} required
     */
    setRequired(required) {
        this._required = required

        if (!this.hasHTML()) {
            return
        }

        this.getHTML().toggleClass('required', required)
    }


    /* Read-only state */

    /**
     * Tell if the field is read-only.
     * @returns {Boolean}
     */
    isReadonly() {
        return this._readonly
    }

    /**
     * Update the read-only state.
     * @param {Boolean} readonly
     */
    setReadonly(readonly) {
        this._readonly = readonly
        this.setWidgetReadonly(readonly)

        if (!this.hasHTML()) {
            return
        }

        this.getHTML().toggleClass('readonly', readonly)
    }


    /* Disabled state */

    /**
     * Tell if the field is disabled.
     * @returns {Boolean}
     */
    isDisabled() {
        return this._disabled
    }

    /**
     * Enable the field.
     */
    enable() {
        if (!this._disabled) {
            return
        }

        this._disabled = false

        this.enableWidget()
    }

    /**
     * Disable the field.
     */
    disable() {
        if (this._disabled) {
            return
        }

        this._disabled = true

        this.disableWidget()
    }


    /* Visibility */

    /**
     * Tell if the field is hidden.
     * @returns {Boolean}
     */
    isHidden() {
        return !this._visibilityManager.isElementVisible()
    }

    /**
     * Show the field.
     */
    show() {
        if (this._visibilityManager.isElementVisible()) {
            return
        }

        this._visibilityManager.showElement()

        if (this._form._continuousValidation) {
            /* We need to revalidate the form upon field show, since hidden fields are considered always valid */
            this._form._clearValidationCache(this._name)
            this._form.updateValidationStateASAP()
        }

        this._form.updateFieldsState()
    }

    /**
     * Hide the field.
     */
    hide() {
        if (!this._visibilityManager.isElementVisible()) {
            return
        }

        this._visibilityManager.hideElement()

        if (this._form._continuousValidation) {
            /* We need to revalidate the form upon field hide, since hidden fields are considered always valid */
            this._form._clearValidationCache(this._name)
            this._form.updateValidationStateASAP()
        }

        this._form.updateFieldsState()
    }


    /* Focus */

    /**
     * Called whenever the field is focused.
     */
    onFocus() {
    }

    /**
     * Called whenever the field loses focus.
     */
    onBlur(value) {
    }

    /**
     * Tell if the field is focused or not.
     * @returns {Boolean}
     */
    isFocused() {
        return this._focused
    }

    /**
     * Focus the field.
     */
    focus() {
        this.getWidget().focus()
    }

    /**
     * Handle focus events.
     */
    handleFocus() {
        this._focused = true
        this.onFocus()
    }

    /**
     * Handle blur events.
     */
    handleBlur() {
        this._focused = false
        this.onBlur()
    }


    /* Progress state */

    showProgress(percent) {
        this.setSideIcon('progress')
    }

    hideProgress() {
        this._updateSideIcon()
    }


    /* Warning state */

    showWarning(message) {
        this.getHTML().find('span.qui-form-field-warning-text').html(message)
        this.getHTML().addClass('has-warning')
        if (message) {
            this.getHTML().addClass('has-warning-message')
        }

        this._updateSideIcon()
    }

    hideWarning() {
        this.getHTML().removeClass('has-warning has-warning-message')
        Theme.afterTransition(function () {
            if (this.hasWarning()) {
                return /* Warning has been reshown */
            }

            this.getHTML().find('span.qui-form-field-warning-text').html('')
        }.bind(this), this.getHTML())

        this._updateSideIcon()
    }


    /* Error state */

    showError(message) {
        this.getHTML().find('span.qui-form-field-error-text').html(message)
        this.getHTML().addClass('has-error')
        if (message) {
            this.getHTML().addClass('has-error-message')
        }

        this._updateSideIcon()
    }

    hideError() {
        this.getHTML().removeClass('has-error has-error-message')
        Theme.afterTransition(function () {
            if (this.hasError()) {
                return /* Error has been reshown */
            }

            this.getHTML().find('span.qui-form-field-error-text').html('')
        }.bind(this), this.getHTML())

        this._updateSideIcon()
    }


    /* Applied state */

    /**
     * Optionally put the field in the applied state {@link qui.forms.STATE_APPLIED}.
     */
    setApplied() {
        this._origValue = this.getValue()
        this._changed = false
        this.setState(STATE_APPLIED)
    }

    /**
     * Put the field in the normal state, but only if the current state is {@link qui.forms.STATE_APPLIED}.
     */
    clearApplied() {
        if (this.getState() === STATE_APPLIED) {
            this.setState(STATE_NORMAL)
        }
    }

    enterState(oldState, newState) {
        switch (newState) {
            case STATE_APPLIED:
                this._updateSideIcon()
                break

            default:
                super.enterState(oldState, newState)
        }
    }

    /**
     * Tell if the field data has been applied (and thus there are no pending changes).
     * @returns {Boolean}
     */
    isApplied() {
        return this.getState() === STATE_APPLIED
    }


    /* Value */

    /**
     * Called whenever the field value is changed by the user.
     * @param {*} value the new (unvalidated) field value
     * @param {qui.forms.Form} form the owning form
     */
    onChange(value, form) {
    }

    /**
     * Tell if a given value is valid or not.
     *
     * Override this method to implement custom validation for this field.
     *
     * @param {*} value the value to validate
     * @param {Object} data the form data
     * @returns {?Promise<*,qui.forms.ValidationError>} `null` or a promise that resolves, if the value is valid; a
     * promise that rejects with a validation error otherwise
     * @throws qui.forms.ValidationError the validation error can also be thrown instead of being returned in a rejected
     * response
     */
    validate(value, data) {
        return null
    }

    /**
     * Wrap validate() into a try/catch and return a validation promise. Also apply required and widget validation.
     * @private
     * @param {*} value the value to validate
     * @param {Object} data
     * @returns {Promise}
     */
    _validate(value, data) {
        /* Required validation */
        if (this._required && !this.isHidden()) {
            if (value == null || value === false || value === '') {
                return Promise.reject(new ValidationError(gettext('This field is required.')))
            }
        }

        /* Widget validation */
        let error = this.validateWidget(value)
        if (error) {
            return Promise.reject(new ValidationError(error))
        }

        /* Custom validation */
        try {
            return this.validate(value, data) || Promise.resolve()
        }
        catch (e) {
            return Promise.reject(e)
        }
    }


    /* Side icon */

    /**
     * Show or hide the side icon, updating it according to the supplied icon.
     * @param {?String|qui.icons.Icon} icon an icon or an icon type; passing `null` hides the side icon; known icon
     * types are:
     *  * `"success"`
     *  * `"warning"`
     *  * `"error"`
     *  * `"progress"`
     * @param {Function} [clickCallback] an optional function to be called when the icon is clicked; the function will
     * be called with the field as `this` argument
     */
    setSideIcon(icon, clickCallback) {
        /* Make sure the HTML is created */
        this.getHTML()

        if (icon && (typeof icon === 'string') && this._sideIconDiv.hasClass(icon)) {
            return /* Side icon already set with given icon type */
        }

        if (!this.hasHTML()) {
            return
        }

        this.getHTML().addClass('side-icon-visible')
        this._sideIconDiv.removeClass('success warning error progress custom')

        if (typeof icon === 'string') {
            this._sideIconDiv.addClass(icon)

            if (!(this._sideIcon instanceof StockIcon)) {
                this._sideIcon = new StockIcon({name: 'success', scale: 0.75})
            }

            switch (icon) {
                case 'success':
                    this._sideIcon = this._sideIcon.alter({
                        name: 'check', variant: 'green',
                        activeName: 'check', activeVariant: 'green'
                    })

                    break

                case 'warning':
                    this._sideIcon = this._sideIcon.alter({
                        name: 'exclam', variant: 'warning',
                        activeName: 'exclam', activeVariant: 'warning-active'
                    })

                    /* Toggle warning visibility */
                    clickCallback = clickCallback || function () {
                        this.getHTML().toggleClass('warning-visible')
                    }.bind(this)

                    break

                case 'error':
                    this._sideIcon = this._sideIcon.alter({
                        name: 'exclam', variant: 'error',
                        activeName: 'exclam', activeVariant: 'error-active'
                    })

                    /* Toggle error visibility */
                    clickCallback = clickCallback || function () {
                        this.getHTML().toggleClass('error-visible')
                    }.bind(this)

                    break

                case 'progress':
                    this._sideIcon = this._sideIcon.alter({
                        name: 'sync', variant: 'green',
                        activeName: 'sync', activeVariant: 'green'
                    })

                    break

                default:
                    throw new AssertionError(`Unknown icon type ${icon}`)
            }

            this._sideIcon.applyTo(this._sideIconDiv)
        }
        else if (icon instanceof Icon) {
            this._sideIconDiv.addClass('custom')
            if (icon instanceof StockIcon) {
                icon = icon.alterDefault({scale: 0.75})
            }
            icon.applyTo(this._sideIconDiv)

            this._sideIcon = icon
        }
        else { /* Assuming null */
            this.getHTML().removeClass('side-icon-visible')
            this._sideIcon = null
        }

        this._sideIconDiv.off('click')
        if (clickCallback) {
            this._sideIconDiv.on('click', clickCallback.bind(this))
            this._sideIconDiv.css('cursor', 'pointer')
        }
        else {
            this._sideIconDiv.css('cursor', 'default')
        }
    }

    _updateSideIcon() {
        /* Use asap() here so that we can rely on the the final state when deciding what side icon to display */
        asap(function () {
            if (this.getHTML().hasClass('has-error-message')) {
                this.setSideIcon('error')
            }
            else if (this.getHTML().hasClass('has-warning-message')) {
                this.setSideIcon('warning')
            }
            else if (this.isApplied()) {
                this.setSideIcon('success')
            }
            else {
                this.setSideIcon(null)
            }
        }.bind(this))
    }


    /* Widget */

    /**
     * Return the fields's widget.
     * @returns {jQuery}
     */
    getWidget() {
        if (!this._widget) {
            this._widget = this.makeWidget()
            this.initWidget(this._widget)
        }

        return this._widget
    }

    /**
     * Create the widget's HTML element.
     *
     * Override this to implement how the widget element is created.
     *
     * @abstract
     * @returns {jQuery}
     */
    makeWidget() {
    }

    /**
     * Initialize the widget's HTML element.
     *
     * Override this to implement how the widget element is set up, after it has been created.
     *
     * @param {jQuery} widget the widget's HTML element
     */
    initWidget(widget) {
    }

    /**
     * Implement widget value validation.
     *
     * Override this to implement validation for your widget.
     *
     * @param {*} value the value to validate
     * @returns {?String} `null` if the value is valid, or an error message otherwise; if an empty string is returned,
     * the value is considered *invalid* but no error message will be shown
     */
    validateWidget(value) {
        return null
    }

    /**
     * Read value from the widget and adapt it to the field.
     *
     * Override this to implement how a value is read from the widget.
     *
     * @abstract
     * @returns {*} the field value
     */
    widgetToValue() {
    }

    /**
     * Adapt and write a value to the widget.
     *
     * Override this to implement how a value is set to the widget.
     *
     * @abstract
     * @param {*} value the field value
     */
    valueToWidget(value) {
    }

    /**
     * Update the read-only state of the widget.
     *
     * Override this to implement how the widget's readonly state is modified.
     *
     * @abstract
     * @param {Boolean} readonly
     */
    setWidgetReadonly(readonly) {
    }

    /**
     * Enable the widget.
     *
     * Override this to implement how the widget is enabled.
     *
     * @abstract
     */
    enableWidget() {
    }

    /**
     * Disable the widget.
     *
     * Override this to implement how the widget is disabled.
     *
     * @abstract
     */
    disableWidget() {
    }

    /**
     * Return the value of the forceOneLine flag.
     * @returns {Boolean}
     */
    isForceOneLine() {
        return this._forceOneLine
    }

    /**
     * Return the width percent of the value element.
     * @returns {?Number}
     */
    getValueWidth() {
        return this._valueWidth
    }

    /**
     * Set the width percent of the value element.
     * @param {?Number} width
     */
    setValueWidth(width) {
        this._valueWidth = width
        if (!this.hasHTML()) {
            return
        }

        this.getHTML().removeClass('auto-width')
        this._labelDiv.css('width', '')
        this._valueDiv.css('width', '')

        let valueWidth = this._valueWidth
        if (valueWidth == null) {
            valueWidth = this._form._valuesWidth
        }

        let useOneLine = !this._form.isCompact() || this._forceOneLine
        if (useOneLine) {
            if (valueWidth) {
                this._labelDiv.css('width', `${(100 - valueWidth)}%`)
            }
            else {
                this.getHTML().addClass('auto-width')
            }
        }
        if (valueWidth && useOneLine) {
            this._valueDiv.css('width', `${valueWidth}%`)
        }
    }

    /**
     * Return the owning form.
     * @returns {qui.forms.Form}
     */
    getForm() {
        return this._form
    }

    /**
     * Set the owning form.
     * @param {qui.forms.Form} form
     */
    setForm(form) {
        this._form = form
    }

}


export default FormField
