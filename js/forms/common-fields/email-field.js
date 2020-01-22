
import TextField from './text-field.js'


/**
 * An email text field. The value data type is `String`.
 * @alias qui.forms.commonfields.EmailField
 * @extends qui.forms.commonfields.TextField
 */
class EmailField extends TextField {

    /**
     * @constructs qui.forms.commonfields.EmailField
     * @param params
     * * see {@link qui.forms.FormField} for form field parameters
     * * see {@link qui.forms.commonfields.TextField} for text field parameters
     */
    constructor({...params}) {
        super(params)
    }

    validateWidget(value) {
        return null // TODO implement me
    }

}

// TODO es7 class fields
EmailField.WIDGET_CLASS = 'emailinput'


export default EmailField
