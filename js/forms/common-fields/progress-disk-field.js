
import JQueryUIField from './jquery-ui-field.js'


/**
 * A progress disk field. The value data type is `Number`.
 * @alias qui.forms.commonfields.ProgressDiskField
 * @extends qui.forms.commonfields.JQueryUIField
 */
class ProgressDiskField extends JQueryUIField {

    /**
     * @constructs
     * @param {Number|String} [radius] the disk radius (defaults to `1em`)
     * @param {Number} [min] the minimum value (defaults to `0`)
     * @param {Number} [max] the maximum value (defaults to `100`)
     * @param {String} [caption] the caption template displayed on top of the disk (defaults to `%s%%`)
     * @param {...*} args parent class parameters
     */
    constructor({radius = '1em', min = 0, max = 100, caption = '%s%%', ...args}) {
        super({widgetAttrs: {radius: radius, min: min, max: max, caption: caption}, ...args})
    }

    // TODO add setters and getters for widget properties

}

// TODO es7 class fields
ProgressDiskField.WIDGET_CLASS = 'progressdisk'


export default ProgressDiskField
