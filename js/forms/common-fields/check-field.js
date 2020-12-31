
import * as ObjectUtils from '$qui/utils/object.js'

import JQueryUIField from './jquery-ui-field.js'


/**
 * A check box field. The value data type is `Boolean`.
 * @alias qui.forms.commonfields.CheckField
 * @extends qui.forms.commonfields.JQueryUIField
 */
class CheckField extends JQueryUIField {

    static WIDGET_CLASS = 'checkbutton'


    /**
     * @constructs
     * @param {String} [onClass] the CSS class to add to the check button in *on* state (defaults to `on`)
     * @param {...*} args parent class parameters
     */
    constructor({onClass = 'on', ...args}) {
        /* We always prefer having the check box on the same line with its label */
        ObjectUtils.setDefault(args, 'forceOneLine', true)

        super({widgetAttrs: {onClass: onClass}, ...args})
    }

    setForm(form) {
        super.setForm(form)

        /* On compact forms, reduce the value width when showing on the same line with label, so that label can take as
         * much space as needed */
        if (form.isCompact() && this.isForceOneLine() && this.getValueWidth() == null) {
            this.setValueWidth(0)
        }
    }

}


export default CheckField
