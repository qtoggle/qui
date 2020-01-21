
import JQueryUIField from './jquery-ui-field.js'


/**
 * A field backed by colored labels. The value data type is `String[]` (a list of labels) or `Object` (a dictionary with
 * labels as keys and background colors as values).
 * @alias qui.forms.commonfields.LabelsField
 * @extends qui.forms.commonfields.JQueryUIField
 */
class LabelsField extends JQueryUIField {

    // TODO add setters and getters for widget properties

    /**
     * @constructs qui.forms.commonfields.LabelsField
     * @param {Object} params
     * * see {@link qui.forms.FormField} for form field parameters
     * @param {String} [params.color] the label text color (defaults to `@background-color`)
     * @param {String} [params.background] the default label background color, used unless the given labels specify
     * otherwise (defaults to `@foreground-color`)
     * @param {Boolean} [params.chevrons] `true` if you want to join labels using chevron-like arrows
     * @param {Function} [params.onClick] function to be executed when a label is clicked
     */
    constructor({onClick = null, ...params}) {
        super(params)

        this.onClick = onClick
    }

    initWidget(widget) {
        this._widgetCall('option', 'onClick', (label, index) => this.onClick(label, index))
    }

    /**
     * Called when a label is clicked.
     * @param {String} label the text of the clicked label
     * @param {Number} index the index of the clicked label (starting at `0`)
     */
    onClick(label, index) {
    }

}

// TODO es7 class fields
LabelsField.WIDGET_CLASS = 'labels'
LabelsField.WIDGET_ATTRS = ['color', 'background', 'chevrons', 'clickable']


export default LabelsField
