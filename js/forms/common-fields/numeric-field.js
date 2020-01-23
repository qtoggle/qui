
import TextField from './text-field.js'


/**
 * A numeric text field. The value data type is `String`.
 * @alias qui.forms.commonfields.NumericField
 * @extends qui.forms.commonfields.TextField
 */
class NumericField extends TextField {

    /**
     * @constructs qui.forms.commonfields.NumericField
     * @param {...*} args parent class parameters
     */
    constructor({...args}) {
        super(args)
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
