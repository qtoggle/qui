
import $ from '$qui/lib/jquery.module.js'

import * as ObjectUtils from '$qui/utils/object.js'

import FormField from '../form-field.js'


/**
 * A form field backed by a jQuery UI widget.
 * @alias qui.forms.commonfields.JQueryUIField
 * @extends qui.forms.FormField
 */
class JQueryUIField extends FormField {

    /* jQuery UI widget class */
    static WIDGET_CLASS = ''


    /**
     * @constructs
     * @param {Object} widgetAttrs attributes to pass to underlying JQueryUI widget
     * @param {...*} args parent class parameters
     */
    constructor({widgetAttrs, ...args}) {
        super(args)

        this._widgetAttrs = widgetAttrs
    }

    makeHTML() {
        let html = super.makeHTML()

        html.addClass(`jquery-ui-${this.constructor.WIDGET_CLASS}`)

        return html
    }

    focus() {
        this.getFocusableElement().focus()
    }

    getFocusableElement() {
        return this.getWidget()
    }

    makeWidget() {
        let attrs = ObjectUtils.copy(this._widgetAttrs)

        /* Always supply field name to widget */
        attrs['name'] = this.getName()

        let div = $('<div></div>')
        div[this.constructor.WIDGET_CLASS](attrs)

        return div
    }

    _widgetCall(...args) {
        let widget = this.getWidget()
        return widget[this.constructor.WIDGET_CLASS].apply(widget, args)
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

    showWarning(message) {
        super.showWarning(message)
        this._widgetCall({warning: message})
    }

    hideWarning() {
        super.hideWarning()
        this._widgetCall({warning: null})
    }

    showError(message) {
        super.showError(message)
        this._widgetCall({error: message})
    }

    hideError() {
        super.hideError()
        this._widgetCall({error: null})
    }

}


export default JQueryUIField
