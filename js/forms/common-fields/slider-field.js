import JQueryUIField from './jquery-ui-field.js'


/**
 * A slider field. The value data type is `Number`.
 * @alias qui.forms.commonfields.SliderField
 * @extends qui.forms.JQueryUIField
 * @param {Object} params
 * * see {@link qui.forms.FormField} for form field parameters
 * @param {Object[]} params.ticks tick marks (pairs of `label` and `value`)
 * @param {Boolean} [params.equidistant] set to `true` to draw the tick marks equidistantly, even if their corresponding
 * values are not equally distanced
 * @param {Number} [params.snapMode] `0` - no snapping (default), `1` - strict snapping and `2` - loose snapping
 * @param {Number} [params.snapDistance] the snapping distance, in percents, when `snapMode` is `2` (defaults to `0.02`)
 * @param {Number} [params.increment] the percent used to increase or decrease the value when using the keyboard or the
 * mouse wheel (defaults to `0.02`)
 * @param {Number} [params.fastFactor] determines how fast the increase or decrease functions will work when using
 * page-up/page-down (defaults to `5`, which is 5 times faster)
 * @param {Boolean} [params.continuousChange] set to `true` to trigger a `change` event with every little slider move
 * when this is `false` (the default), the `change` event will be triggered at the end of the move
 */
export default class SliderField extends JQueryUIField {

    // TODO add setters and getters for widget properties

}

// TODO es7 class fields
SliderField.WIDGET_CLASS = 'slider'
SliderField.WIDGET_ATTRS = [
    'ticks', 'equidistant', 'snapMode', 'snapDistance',
    'increment', 'fastFactor', 'continuousChange'
]
