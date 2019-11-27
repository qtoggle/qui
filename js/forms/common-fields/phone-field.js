
import TextField from './text-field.js'


/**
 * A phone number text field. The value data type is `String`.
 * @alias qui.forms.commonfields.PhoneField
 * @extends qui.forms.commonfields.TextField
 * @param {Object} params
 * * see {@link qui.forms.FormField} for form field parameters
 * * see {@link qui.forms.commonfields.TextField} for text field parameters
 */
export default class PhoneField extends TextField {}

// TODO es7 class fields
PhoneField.WIDGET_CLASS = 'phoneinput'
