
import JQueryUIField from './jquery-ui-field.js'


/**
 * A field backed by choice buttons. The value data type can be anything.
 * @alias qui.forms.commonfields.ChoiceButtonsField
 * @extends qui.forms.commonfields.JQueryUIField
 */
class ChoiceButtonsField extends JQueryUIField {

    /**
     * @constructs
     * @param {Object[]|Object[][]} choices choices or groups of choices (pairs/arrays of pairs of `label` and `value`)
     * @param {String} [onClass] the CSS class to add to buttons in *on* state (defaults to `on`)
     * @param {...*} args parent class parameters
     */
    constructor({choices, onClass = 'on', ...args}) {
        super({widgetAttrs: {choices: choices, onClass: onClass}, ...args})
    }

    // TODO add setters and getters for choices

}

// TODO es7 class fields
ChoiceButtonsField.WIDGET_CLASS = 'choicebuttons'


export default ChoiceButtonsField
