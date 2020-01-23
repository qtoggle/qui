
import TextField from './text-field.js'


/**
 * A phone number text field. The value data type is `String`.
 * @alias qui.forms.commonfields.PhoneField
 * @extends qui.forms.commonfields.TextField
 */
class PhoneField extends TextField {

    /**
     * @constructs qui.forms.commonfields.PhoneField
     * @param {...*} args parent class parameters
     */
    constructor({...args}) {
        super(args)
    }

}

// TODO es7 class fields
PhoneField.WIDGET_CLASS = 'phoneinput'


export default PhoneField
