
import JQueryUIField from './jquery-ui-field.js'


/**
 * A slider field. The value data type is `Number`.
 * @alias qui.forms.commonfields.SliderField
 * @extends qui.forms.commonfields.JQueryUIField
 */
class SliderField extends JQueryUIField {

    // TODO add setters and getters for widget properties

    /**
     * @constructs qui.forms.commonfields.SliderField
     * @param {Object[]} [ticks] tick marks (pairs of `label` and `value`)
     * @param {Number} [ticksStep] display every `ticksStep` tick (defaults to `1`)
     * @param {Boolean} [equidistant] set to `true` to draw the tick marks equidistantly, even if their corresponding
     * values are not equally distanced
     * @param {Number} [snapMode] `0` - no snapping (default), `1` - strict snapping and `2` - loose snapping
     * @param {Number} [snapDistance] the snapping distance, in percents, when `snapMode` is `2` (defaults to `0.02`)
     * @param {Number} [increment] the percent used to increase or decrease the value when using the keyboard or the
     * mouse wheel (defaults to `0.02`)
     * @param {Number} [fastFactor] determines how fast the increase or decrease functions will work when using
     * page-up/page-down (defaults to `5`, which is 5 times faster)
     * @param {Number} [decimals] the number of decimals to display (defaults to `0`)
     * @param {Boolean} [continuousChange] set to `true` to trigger a `change` event with every little slider move when
     * this is `false` (the default), the `change` event will be triggered at the end of the move
     * @param params
     * * see {@link qui.forms.FormField} for form field parameters
     */
    constructor({
        ticks = [],
        ticksStep = 1,
        equidistant = false,
        snapMode = 0,
        snapDistance = 0.02,
        increment = 0.02,
        fastFactor = 5,
        decimals = 0,
        continuousChange = false,
        ...params
    }) {
        super({
            widgetAttrs: {
                ticks: ticks,
                ticksStep: ticksStep,
                equidistant: equidistant,
                snapMode: snapMode,
                snapDistance: snapDistance,
                increment: increment,
                fastFactor: fastFactor,
                decimals: decimals,
                continuousChange: continuousChange
            },
            ...params
        })
    }

}

// TODO es7 class fields
SliderField.WIDGET_CLASS = 'slider'


export default SliderField
