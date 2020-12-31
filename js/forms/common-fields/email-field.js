
import TextField from './text-field.js'


/**
 * An email text field. The value data type is `String`.
 * @alias qui.forms.commonfields.EmailField
 * @extends qui.forms.commonfields.TextField
 */
class EmailField extends TextField {

    static WIDGET_CLASS = 'emailinput'


    /**
     * @constructs
     * @param {...*} args parent class parameters
     */
    constructor({...args}) {
        super(args)
    }

    validateWidget(value) {
        return null // TODO implement me
    }

}


export default EmailField
