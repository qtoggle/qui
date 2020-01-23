
import JQueryUIField from './jquery-ui-field.js'


/**
 * A simple text field. The value data type is `String`.
 * @alias qui.forms.commonfields.TextField
 * @extends qui.forms.commonfields.JQueryUIField
 */
class TextField extends JQueryUIField {

    /**
     * @constructs qui.forms.commonfields.TextField
     * @param {?String} [placeholder] an empty-text placeholder
     * @param {Boolean} [clearPlaceholder] set to `true` to clear the placeholder on first change (defaults to `false`)
     * @param {Boolean} [autocomplete] enables or disables field autocomplete (enabled by default)
     * @param {?Number} [minLength] minimum required text length
     * @param {?Number} [maxLength] maximum allowed text length
     * @param {Boolean} [continuousChange] set to `false` to prevent triggering change events at each key stroke
     * @param {Object} [widgetAttrs] extra attributes to pass to underlying JQueryUI widget
     * @param {...*} args parent class parameters
     */
    constructor({
        placeholder = null,
        clearPlaceholder = false,
        autocomplete = true,
        minLength = null,
        maxLength = null,
        continuousChange = true,
        widgetAttrs = {},
        ...args
    }) {
        Object.assign(widgetAttrs, {
            placeholder: placeholder,
            clearPlaceholder: clearPlaceholder,
            autocomplete: autocomplete,
            minLength: minLength,
            maxLength: maxLength,
            continuousChange: continuousChange
        })

        super({widgetAttrs: widgetAttrs, ...args})
    }

    getInputElement() {
        return this.getWidget().children('input')
    }

    getFocusableElement() {
        return this.getInputElement()
    }

}

// TODO es7 class fields
TextField.WIDGET_CLASS = 'textinput'


export default TextField
