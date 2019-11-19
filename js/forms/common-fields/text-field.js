import JQueryUIField from './jquery-ui-field.js'


/**
 * A simple text field. The value data type is `String`.
 * @alias qui.forms.commonfields.TextField
 * @extends qui.forms.commonfields.JQueryUIField
 * @param {Object} params
 * * see {@link qui.forms.FormField} for form field parameters
 * @param {?String} [params.placeholder] an empty-text placeholder
 * @param {Boolean} [params.clearPlaceholder] set to `true` to clear the placeholder on first change
 * (defaults to `false`)
 * @param {Boolean} [params.autocomplete] enables or disables field autocomplete (enabled by default)
 * @param {?Number} [params.minLength] a minimum required text length
 * @param {?Number} [params.maxLength] the maximum allowed text length
 */
export default class TextField extends JQueryUIField {

    _getFocusableElement() {
        return this.getWidget().children('input')
    }

}

// TODO es7 class fields
TextField.WIDGET_CLASS = 'textinput'
TextField.WIDGET_ATTRS = [
    'placeholder', 'clearPlaceholder', 'autocomplete',
    'minLength', 'maxLength', 'continuousChange'
]
