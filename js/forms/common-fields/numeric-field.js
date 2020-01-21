
import TextField from './text-field.js'


/**
 * A numeric text field. The value data type is `String`.
 * @alias qui.forms.commonfields.NumericField
 * @extends qui.forms.commonfields.TextField
 * @param {Object} params
 * * see {@link qui.forms.FormField} for form field parameters
 * * see {@link qui.forms.commonfields.TextField} for text field parameters
 */
class NumericField extends TextField {

    widgetToValue() {
        let value = super.widgetToValue()

        if (value) {
            return parseFloat(value)
        }
        else {
            return null
        }
    }

}

// TODO es7 class fields
NumericField.WIDGET_CLASS = 'numericinput'


export default NumericField
