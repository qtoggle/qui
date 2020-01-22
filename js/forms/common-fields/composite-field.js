
import $ from '$qui/lib/jquery.module.js'

import FormField from '../form-field.js'


/**
 * A form field composed by multiple subfields.
 * @alias qui.forms.commonfields.CompositeField
 * @extends qui.forms.FormField
 */
class CompositeField extends FormField {

    /**
     * @constructs qui.forms.commonfields.CompositeField
     * @param {qui.forms.FormField[]} fields the list of subfields
     * @param {String} [layout] align subfield widgets vertically (`"vertical"`) or horizontally (`"horizontal"`,
     * default)
     * @param params
     * * see {@link qui.forms.FormField} for form field parameters
     */
    constructor({fields, layout = 'horizontal', ...params}) {
        super(params)

        this._fields = fields
        this._layout = layout
    }

    focus() {
        /* Focus the first field */
        this._fields.some(f => f.focus(), true)
    }

    makeWidget() {
        let div = $('<div class="qui-composite-field-container"></div>')
        div.addClass(`layout-${this._layout}`)

        this._fields.forEach(function (field) {
            div.append(field.getWidget())
        })

        return div
    }

    validateWidget(value) {
        /* Return the first validation error among fields */

        let error = null
        this._fields.some(function (field) {
            let e = field.validateWidget(value[field.getName()])
            if (e != null) {
                error = e
                return true
            }
        })

        return error
    }

    valueToWidget(value) {
        this._fields.forEach(f => f.valueToWidget(value[f.getName()]))
    }

    widgetToValue() {
        return Object.fromEntries(this._fields.map(f => [f.getName(), f.widgetToValue()]))
    }

    setWidgetReadonly(readonly) {
        this._fields.forEach(f => f.setWidgetReadonly(readonly))
    }

    enableWidget() {
        this._fields.forEach(f => f.enableWidget())
    }

    disableWidget() {
        this._fields.forEach(f => f.disableWidget())
    }

    setForm(form) {
        super.setForm(form)

        this._fields.forEach(f => f.setForm(form))
    }

    /**
     * Return the subfield with a given name. If no such field is found, `null` is returned.
     * @param {String} name the name of the subfield
     * @returns {?qui.forms.FormField}
     */
    getField(name) {
        return this._fields.find(f => f.getName() === name) || null
    }

}


export default CompositeField
