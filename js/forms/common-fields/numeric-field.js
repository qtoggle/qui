
import TextField from './text-field.js'


/**
 * A numeric text field. The value data type is `String`.
 * @alias qui.forms.commonfields.NumericField
 * @extends qui.forms.commonfields.TextField
 */
class NumericField extends TextField {

    /**
     * @constructs
     * @param {Number} [min] minimum value
     * @param {Number} [max] maximum value
     * @param {...*} args parent class parameters
     */
    constructor({min = null, max = null, ...args}) {
        super({widgetAttrs: {min, max}, ...args})
    }

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
