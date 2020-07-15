
import $ from '$qui/lib/jquery.module.js'

import FormField from '../form-field.js'


/**
 * A form field composed by multiple subfields.
 * @alias qui.forms.commonfields.CompositeField
 * @extends qui.forms.FormField
 */
class CompositeField extends FormField {

    /**
     * @constructs
     * @param {qui.forms.FormField[]} fields the list of subfields
     * @param {String} [flow] arrange subfield widgets vertically (`"vertical"`) or horizontally (`"horizontal"`,
     * default)
     * @param {Number} [columns] number of columns (unlimited by default, when `flow` is `"horizontal"`, otherwise
     * defaults to `1`)
     * @param {Number} [rows] number of rows (unlimited by default, when `flow` is `"vertical"`, otherwise
     * defaults to `1`)
     * @param {...*} args parent class parameters
     */
    constructor({fields, flow = 'horizontal', columns = null, rows = null, ...args}) {
        super(args)

        this._fields = fields.map(this._preprocessField)
        this._flow = flow
        this._columns = columns
        this._rows = rows
    }

    focus() {
        /* Focus the first field */
        this._fields.some(f => f.focus(), true)
    }

    makeWidget() {
        let div = $('<div></div>', {class: 'qui-composite-field-container'})
        if (this._flow === 'horizontal') {
            if (this._columns) {
                div.css('grid-template-columns', `repeat(${this._columns}, auto)`)
                div.css('grid-auto-flow', 'row')
            }
            else {
                div.css('grid-auto-flow', 'column')
            }
        }
        else {
            if (this._rows) {
                div.css('grid-template-rows', `repeat(${this._rows}, auto)`)
                div.css('grid-auto-flow', 'column')
            }
            else {
                div.css('grid-auto-flow', 'row')
            }
        }

        this._fields.forEach(function (field) {
            div.append(field.getHTML())

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

    _preprocessField(field) {
        field.setLabel('') /* Subfields of composite field can't have label */
        field.setValueWidth(100) /* The value always occupies the entire space */
        field._forceOneLine = true // TODO: this should be a field setter

        return field
    }

}


export default CompositeField
