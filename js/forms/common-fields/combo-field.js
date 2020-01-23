
import JQueryUIField from './jquery-ui-field.js'


/**
 * A combo box field. The value data type can be anything.
 * @alias qui.forms.commonfields.ComboField
 * @extends qui.forms.commonfields.JQueryUIField
 */
class ComboField extends JQueryUIField {

    // TODO add setters and getters for widget properties

    /**
     * @constructs
     * @param {Object[]} [choices] choices (pairs of `label` and `value`)
     * @param {Function} [makeChoices] a function that generates choices (see
     * {@link qui.forms.commonfields.ComboField#makeChoices}))
     * @param {Number} [fastFactor] determines how fast the page-up/page-down actions work (defaults to `5`)
     * @param {Boolean} [filterEnabled] set to `true` to enable filter input box
     * @param {...*} args parent class parameters
     */

    constructor({choices = [], makeChoices = null, fastFactor = null, filterEnabled = false, ...args}) {
        let that

        super({
            widgetAttrs: {
                choices: choices,
                fastFactor: fastFactor,
                filterEnabled: filterEnabled,
                makeChoices: function () {
                    return that.makeChoices()
                }
            },
            ...args
        })

        /* "that" needs to be assigned here because we can't refer to "this" before super() */
        that = this
    }

    /**
     * Set the list of choices.
     * @param {Object[]} choices choices (pairs of `label` and `value`)
     */
    setChoices(choices) {
        this._widgetCall({choices: choices})
    }

    makeChoices() {
        return []
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


export default ComboField
