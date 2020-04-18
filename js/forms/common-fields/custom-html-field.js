
import $ from '$qui/lib/jquery.module.js'

import FormField from '../form-field.js'


/**
 * A form field whose widget's HTML content is supplied by user.
 * @alias qui.forms.commonfields.CustomHTMLField
 * @extends qui.forms.FormField
 */
class CustomHTMLField extends FormField {

    /**
     * @constructs
     * @param {String|jQuery} content the HTML content
     * @param {...*} args parent class parameters
     */
    constructor({content, ...args}) {
        super(args)

        if (typeof content === 'string') {
            content = $(content)
        }
        this._content = content
    }

    makeWidget() {
        return this._content
    }

    valueToWidget(value) {
    }

    widgetToValue() {
        return null
    }

    setWidgetReadonly(readonly) {
    }

    enableWidget() {
    }

    disableWidget() {
    }

}


export default CustomHTMLField
