
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
     * @param {Function} [filterFunc] custom filtering function (see
     * {@link qui.forms.commonfields.ComboField#makeChoices})
     * @param {...*} args parent class parameters
     */

    constructor({
        choices = [],
        makeChoices = null,
        fastFactor = null,
        filterEnabled = false,
        filterFunc = null,
        ...args
    }) {
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
        let that = this

        this._filterFunc = filterFunc
        this._makeChoices = makeChoices

        if (filterFunc || (this.filterFunc !== ComboField.prototype.filterFunc)) {
            this._widgetCall('option', {filterFunc: this.filterFunc.bind(this)})
        }
    }

    /**
     * Set the list of choices.
     * @param {Object[]} choices choices (pairs of `label` and `value`)
     */
    setChoices(choices) {
        this._widgetCall({choices: choices})
    }

    /**
     * Create choices.
     * @returns {Object[]} choices (pairs of `label` and `value`)
     */
    makeChoices() {
        if (this._makeChoices) {
            return this._makeChoices()
        }

        return []
    }

    /**
     * Tell if a choice matches a search text or not.
     * @param {Object} choice
     * @param {String} searchText
     * @returns {Boolean}
     */
    filterFunc(choice, searchText) {
        if (this._filterFunc) {
            return this._filterFunc(choice, searchText)
        }

        return true
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
