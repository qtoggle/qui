
import TextField from './text-field.js'


/**
 * A password text field. The value data type is `String`.
 * @alias qui.forms.commonfields.PasswordField
 * @extends qui.forms.commonfields.TextField
 */
class PasswordField extends TextField {

    /**
     * @constructs qui.forms.commonfields.PasswordField
     * @param {Boolean} [clearEnabled] set to `true` to enable clear button
     * @param {Boolean} [revealOnFocus] set to `true` to enable password revealing when widget is focused
     * @param params
     * * see {@link qui.forms.FormField} for form field parameters
     * * see {@link qui.forms.commonfields.TextField} for text field parameters
     */
    constructor({clearEnabled = false, revealOnFocus = false, ...params}) {
        super({widgetAttrs: {clearEnabled: clearEnabled, revealOnFocus: revealOnFocus}, ...params})
    }

}

// TODO es7 class fields
PasswordField.WIDGET_CLASS = 'passwordinput'


export default PasswordField
