import $ from '$qui/lib/jquery.module.js'

import * as ObjectUtils from '$qui/utils/object.js'

import FormField from '../form-field.js'


/**
 * A form field backed by a jQuery UI widget.
 * @alias qui.forms.common-fields.JQueryUIField
 * @extends qui.forms.FormField
 * @param {Object} params
 * * see {@link qui.forms.FormField} for form field parameters
 */
export default class JQueryUIField extends FormField {

    constructor({...params}) {
        super(params)

        this._widgetAttrs = ObjectUtils.filter(params, (k, v) => this.constructor.WIDGET_ATTRS.indexOf(k) >= 0)
    }

    makeHTML() {
        let html = super.makeHTML()

        html.addClass(`jquery-ui-${this.constructor.WIDGET_CLASS}`)

        return html
    }

    focus() {
        this._getFocusableElement().focus()
    }

    _getFocusableElement() {
        return this.getWidget()
    }

    makeWidget() {
        let attrs = ObjectUtils.copy(this.constructor.WIDGET_DEF_ATTRS)
        Object.assign(attrs, this._widgetAttrs)

        /* Always supply field name to widget */
        attrs['name'] = this.getName()

        let div = $('<div></div>')
        div[this.constructor.WIDGET_CLASS](attrs)

        return div
    }

    _widgetCall(...args) {
        return this._widget[this.constructor.WIDGET_CLASS].apply(this._widget, args)
    }

    validateWidget(value) {
        return null
    }

    valueToWidget(value) {
        this._widgetCall('setValue', value)
    }

    widgetToValue() {
        return this._widgetCall('getValue')
    }

    setWidgetReadonly(readonly) {
        this._widgetCall({readonly: readonly})
    }

    enableWidget() {
        this._widgetCall({disabled: false})
    }

    disableWidget() {
        this._widgetCall({disabled: true})
    }

}

// TODO es7 class fields

/* jQuery UI widget class */
JQueryUIField.WIDGET_CLASS = ''

/* Default widget attributes */
JQueryUIField.WIDGET_DEF_ATTRS = {}

/* Attribute names to be copied from field to widget */
JQueryUIField.WIDGET_ATTRS = []
