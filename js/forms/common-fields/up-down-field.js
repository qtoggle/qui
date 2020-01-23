
import JQueryUIField from './jquery-ui-field.js'


/**
 * A field backed by an up-down (spinner) widget. The value data type is `Number`.
 * @alias qui.forms.commonfields.UpDownField
 * @extends qui.forms.commonfields.JQueryUIField
 */
class UpDownField extends JQueryUIField {

    // TODO add setters and getters for widget properties

    /**
     * @constructs
     * @param {Number} [min] the minimum value (defaults to `0`)
     * @param {Number} [max] the maximum value (defaults to `100`)
     * @param {Number} [step] the step value (defaults to `1`)
     * @param {Number} [fastFactor] determines the increment value when in fast mode (defaults to `10`)
     * @param {Number} [decimals] the number of decimals to display (defaults to `0`)
     * @param {Boolean} [continuousChange] set to `false` to prevent triggering `change` events with each value
     * modificationwhen losing focus
     * @param {...*} args parent class parameters
     */
    constructor({
        min = 0,
        max = 100,
        step = 1,
        fastFactor = 10,
        decimals = 0,
        continuousChange = true,
        ...args
    }) {
        super({
            widgetAttrs: {
                min: min,
                max: max,
                step: step,
                fastFactor: fastFactor,
                decimals: decimals,
                continuousChange: continuousChange
            },
            ...args
        })
    }

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


export default UpDownField
