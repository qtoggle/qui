
import * as Colors from '$qui/utils/colors.js'

import JQueryUIField from './jquery-ui-field.js'


/**
 * A color combo field based on preconfigured combo choices. The value data type is `String`.
 * @alias qui.forms.commonfields.ColorComboField
 * @extends qui.forms.commonfields.JQueryUIField
 */
class ColorComboField extends JQueryUIField {

    /**
     * @constructs
     * @param {Boolean} [filterEnabled] set to `true` to enable filter input box
     * @param {...*} args parent class parameters
     */
    constructor({filterEnabled = false, ...args}) {
        super({widgetAttrs: {filterEnabled: filterEnabled}, ...args})
    }

    valueToWidget(value) {
        if (value && typeof value === 'string' && !value.startsWith('@')) {
            value = Colors.normalize(value)
        }

        super.valueToWidget(value)
    }

}

// TODO es7 class fields
ColorComboField.WIDGET_CLASS = 'colorcombo'


export default ColorComboField
