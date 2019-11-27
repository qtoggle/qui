
import * as ObjectUtils from '$qui/utils/object.js'

import JQueryUIField from './jquery-ui-field.js'


/**
 * A check box field. The value data type is `Boolean`.
 * @alias qui.forms.commonfields.CheckField
 * @extends qui.forms.commonfields.JQueryUIField
 * @param {Object} params
 * * see {@link qui.forms.FormField} for form field parameters
 * @param {String} [params.onClass] the CSS class to add to the check button in *on* state (defaults to `on`)
 */
export default class CheckField extends JQueryUIField {

    constructor({...params}) {
        /* We always prefer having the check box on the same line with its label */
        ObjectUtils.setDefault(params, 'forceOneLine', true)

        super(params)
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

// TODO es7 class fields
CheckField.WIDGET_CLASS = 'checkbutton'
CheckField.WIDGET_ATTRS = ['onClass']
