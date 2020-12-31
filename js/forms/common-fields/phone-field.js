
import TextField from './text-field.js'


/**
 * A phone number text field. The value data type is `String`.
 * @alias qui.forms.commonfields.PhoneField
 * @extends qui.forms.commonfields.TextField
 */
class PhoneField extends TextField {

    static WIDGET_CLASS = 'phoneinput'


    /**
     * @constructs
     * @param {...*} args parent class parameters
     */
    constructor({...args}) {
        super(args)
    }

}


export default PhoneField
