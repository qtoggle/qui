import JQueryUIField from './jquery-ui-field.js'


/**
 * A field backed by choice buttons. The value data type can be anything.
 * @alias qui.forms.commonfields.ChoiceButtonsField
 * @extends qui.forms.JQueryUIField
 * @param {Object} params
 * * see {@link qui.forms.FormField} for form field parameters
 * @param {Object[]|Object[][]} params.choices choices or groups of choices (pairs or arrays of pairs of `label` and
 * `value`)
 * @param {String} [params.onClass] the CSS class to add to buttons in *on* state (defaults to `on`)
 */
export default class ChoiceButtonsField extends JQueryUIField {

    // TODO add setters and getters for choices

}

// TODO es7 class fields
ChoiceButtonsField.WIDGET_CLASS = 'choicebuttons'
ChoiceButtonsField.WIDGET_ATTRS = ['choices', 'onClass']
