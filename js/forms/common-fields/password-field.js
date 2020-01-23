
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
     * @param {...*} args parent class parameters
     */
    constructor({clearEnabled = false, revealOnFocus = false, ...args}) {
        super({widgetAttrs: {clearEnabled: clearEnabled, revealOnFocus: revealOnFocus}, ...args})
    }

}

// TODO es7 class fields
PasswordField.WIDGET_CLASS = 'passwordinput'


export default PasswordField
