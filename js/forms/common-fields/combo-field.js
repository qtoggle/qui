
import JQueryUIField from './jquery-ui-field.js'


/**
 * A combo box field. The value data type can be anything.
 * @alias qui.forms.commonfields.ComboField
 * @extends qui.forms.commonfields.JQueryUIField
 * @param {Object} params
 * * see {@link qui.forms.FormField} for form field parameters
 * @param {Object[]} params.choices choices (pairs of `label` and `value`)
 * @param {Number} [params.fastFactor] determines how fast the page-up/page-down actions work (defaults to `5`)
 */
class ComboField extends JQueryUIField {

    // TODO add setters and getters for widget properties

    /**
     * Set the list of choices.
     * @param {Object[]} choices choices (pairs of `label` and `value`)
     */
    setChoices(choices) {
        this._widgetCall({choices: choices})
    }

    /**
     * Update the list of choices, calling makeChoices.
     */
    updateChoices() {
        let value = this._widgetCall('getValue')
        this._widgetCall('updateChoices')
        if (value != null) {
            this._widgetCall('setValue', value)
        }
    }

}

// TODO es7 class fields
ComboField.WIDGET_CLASS = 'combo'
ComboField.WIDGET_ATTRS = ['makeChoices', 'choices', 'fastFactor', 'filterEnabled']


export default ComboField
