import JQueryUIField from './jquery-ui-field.js'


/**
 * A combo box field. The value data type can be anything.
 * @alias qui.forms.commonfields.ComboField
 * @extends qui.forms.JQueryUIField
 * @param {Object} params
 * * see {@link qui.forms.FormField} for form field parameters
 * @param {Object[]} params.choices choices (pairs of `label` and `value`)
 * @param {Number} [params.fastFactor] determines how fast the page-up/page-down actions work (defaults to `5`)
 */
export default class ComboField extends JQueryUIField {

    // TODO add setters and getters for widget properties

}

// TODO es7 class fields
ComboField.WIDGET_CLASS = 'combo'
ComboField.WIDGET_ATTRS = ['makeChoices', 'choices', 'fastFactor', 'filterEnabled']
