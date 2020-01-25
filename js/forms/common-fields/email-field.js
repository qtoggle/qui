
import TextField from './text-field.js'


/**
 * An email text field. The value data type is `String`.
 * @alias qui.forms.commonfields.EmailField
 * @extends qui.forms.commonfields.TextField
 */
class EmailField extends TextField {

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

// TODO es7 class fields
EmailField.WIDGET_CLASS = 'emailinput'


export default EmailField
