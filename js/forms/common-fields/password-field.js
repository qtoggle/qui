import TextField from './text-field.js'


/**
 * A password text field. The value data type is `String`.
 * @alias qui.forms.commonfields.PasswordField
 * @extends qui.forms.commonfields.TextField
 * @param {Object} params
 * * see {@link qui.forms.FormField} for form field parameters
 * * see {@link qui.forms.commonfields.TextField} for text field parameters
 */
export default class PasswordField extends TextField {}

// TODO es7 class fields
PasswordField.WIDGET_CLASS = 'passwordinput'
PasswordField.WIDGET_ATTRS = [
    'placeholder', 'clearPlaceholder', 'autocomplete',
    'minLength', 'maxLength', 'continuousChange', 'clearEnabled'
]
