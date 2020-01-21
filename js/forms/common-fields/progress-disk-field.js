
import JQueryUIField from './jquery-ui-field.js'


/**
 * A progress disk field. The value data type is `Number`.
 * @alias qui.forms.commonfields.ProgressDiskField
 * @extends qui.forms.commonfields.JQueryUIField
 * @param {Object} params
 * * see {@link qui.forms.FormField} for form field parameters
 * @param {Number} [params.radius] the disk radius (defaults to `1em`)
 * @param {Number} [params.min] the minimum value (defaults to `0`)
 * @param {Number} [params.max] the maximum value (defaults to `100`)
 * @param {String} [params.caption] the caption template displayed on top of the disk (defaults to `%s%%`)
 */
class ProgressDiskField extends JQueryUIField {

    // TODO add setters and getters for widget properties

}

// TODO es7 class fields
ProgressDiskField.WIDGET_CLASS = 'progressdisk'
ProgressDiskField.WIDGET_ATTRS = ['radius', 'caption']


export default ProgressDiskField
