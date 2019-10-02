import * as Colors from '$qui/utils/colors.js'

import JQueryUIField from './jquery-ui-field.js'


/**
 * A color combo field based on preconfigured combo choices. The value data type is `String`.
 * @alias qui.forms.commonfields.ColorComboField
 * @extends qui.forms.JQueryUIField
 * @param {Object} params
 * * see {@link qui.forms.FormField} for form field parameters
 */
export default class ColorComboField extends JQueryUIField {

    valueToWidget(value) {
        if (value && typeof value === 'string' && !value.startsWith('@')) {
            value = Colors.normalize(value)
        }

        super.valueToWidget(value)
    }

}

// TODO es7 class fields
ColorComboField.WIDGET_CLASS = 'colorcombo'
