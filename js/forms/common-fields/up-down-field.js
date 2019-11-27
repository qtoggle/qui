
import JQueryUIField from './jquery-ui-field.js'


/**
 * A field backed by an up-down (spinner) widget. The value data type is `Number`.
 * @alias qui.forms.commonfields.UpDownField
 * @extends qui.forms.commonfields.JQueryUIField
 * @param {Object} params
 * * see {@link qui.forms.FormField} for form field parameters
 * @param {Number} [params.min] the minimum value (defaults to `0`)
 * @param {Number} [params.max] the maximum value (defaults to `100`)
 * @param {Number} [params.step] the step value (defaults to `1`)
 * @param {Number} [params.fastFactor] determines the increment value when in fast mode (defaults to `10`)
 * @param {Number} [params.decimals] the number of decimals (defaults to `0`)
 * @param {Boolean} [params.continuousChange] set to `false` to only trigger a `change` event when losing focus
 */
export default class UpDownField extends JQueryUIField {

    // TODO add setters and getters for widget properties

    /**
     * Return the minimum value.
     * @returns {Number}
     */
    getMin() {
        return this._widgetCall('option', 'min')
    }

    /**
     * Update the minimum value.
     * @param {Number} min
     */
    setMin(min) {
        this._widgetCall('option', {min: min})
    }

    /**
     * Return the maximum value.
     * @returns {Number}
     */
    getMax() {
        return this._widgetCall('option', 'max')
    }

    /**
     * Update the maximum value.
     * @param {Number} max
     */
    setMax(max) {
        this._widgetCall('option', {max: max})
    }

}

// TODO es7 class fields
UpDownField.WIDGET_CLASS = 'updown'
UpDownField.WIDGET_ATTRS = ['min', 'max', 'step', 'fastFactor', 'decimals', 'continuousChange']
