
import * as ObjectUtils from '$qui/utils/object.js'

import JQueryUIField from './jquery-ui-field.js'


/**
 * A push button field. The value of this field will always be `null`.
 * @alias qui.forms.commonfields.PushButtonField
 * @extends qui.forms.commonfields.JQueryUIField
 * @param {Object} params
 * * see {@link qui.forms.FormField} for form field parameters
 * @param {String} params.caption the button caption
 * @param {Function} params.callback callback to be executed when the button is pushed (see
 * {@link qui.forms.commonfields.PushButtonField#callback})
 * @param {String} [params.style] button style:
 *  * `"interactive"` (default)
 *  * `"highlight"`
 *  * `"danger"`,
 *  * `"colored"`
 * @param {String} [params.backgroundColor] custom background color (ignored unless `style` is `"colored"`)
 * @param {String} [params.backgroundActiveColor] custom background active color (ignored unless `style` is `"colored"`)
 * @param {String} [params.foregroundColor] custom foreground color (ignored unless `style` is `"colored"`)
 */
export default class PushButtonField extends JQueryUIField {

    constructor({callback, ...params}) {
        ObjectUtils.setDefault(params, 'style', 'interactive')

        super(params)

        this.callback = callback
    }

    makeWidget() {
        let div = super.makeWidget()

        div.addClass('qui-form-push-button')
        div.on('click', () => this.callback(this.getForm()))

        if (this._valueWidth === 100) {
            div.css('display', 'block')
        }

        return div
    }

    /**
     * Called when the button is pushed.
     * @param {qui.forms.Form} form owning form
     */
    callback(form) {
    }

    valueToWidget(value) {
    }

    widgetToValue() {
        return null
    }

}

// TODO es7 class fields
PushButtonField.WIDGET_CLASS = 'pushbutton'
PushButtonField.WIDGET_ATTRS = ['caption', 'style', 'backgroundColor', 'backgroundActiveColor', 'foregroundColor']
