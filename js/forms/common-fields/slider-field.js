
import JQueryUIField from './jquery-ui-field.js'


/**
 * A slider field. The value data type is `Number`.
 * @alias qui.forms.commonfields.SliderField
 * @extends qui.forms.commonfields.JQueryUIField
 */
class SliderField extends JQueryUIField {

    static WIDGET_CLASS = 'slider'


    // TODO add setters and getters for widget properties

    /**
     * @constructs
     * @param {Object[]} [ticks] tick marks (pairs of `label` and `value`)
     * @param {Number} [ticksStep] display every `ticksStep` tick (defaults to `1`)
     * @param {Boolean} [equidistant] set to `true` to draw the tick marks equidistantly, even if their corresponding
     * values are not equally distanced
     * @param {Number} [fastFactor] determines how fast the increase or decrease functions will work when using
     * page-up/page-down (defaults to `5`, which is 5 times faster)
     * @param {Boolean} [continuousChange] set to `false` to only trigger a `change` event at the end of the slider move
     * @param {...*} args parent class parameters
     */
    constructor({
        ticks = [],
        ticksStep = 1,
        equidistant = false,
        fastFactor = 5,
        continuousChange = true,
        ...args
    }) {
        super({
            widgetAttrs: {
                ticks: ticks,
                ticksStep: ticksStep,
                equidistant: equidistant,
                fastFactor: fastFactor,
                continuousChange: continuousChange
            },
            ...args
        })
    }

}


export default SliderField
