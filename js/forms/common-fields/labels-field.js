
import JQueryUIField from './jquery-ui-field.js'


/**
 * A field backed by colored labels. The value data type is `String[]` (a list of labels) or `Object[]` (a list of
 * objects with `text`, `color` and `background` fields).
 * @alias qui.forms.commonfields.LabelsField
 * @extends qui.forms.commonfields.JQueryUIField
 */
class LabelsField extends JQueryUIField {

    // TODO add setters and getters for widget properties

    /**
     * @constructs
     * @param {String} [color] the label text color (defaults to `@background-color`)
     * @param {String} [background] the default label background color, used unless the given labels specify
     * otherwise (defaults to `@foreground-color`)
     * @param {Boolean} [chevrons] set to `true` if you want to join labels using chevron-like arrows
     * @param {Boolean} [clickable] set to `true` if you want your labels to be clickable
     * @param {Function} [onClick] function to be executed when a label is clicked (see
     * {@link qui.forms.commonfields.LabelsField#onClick})
     * @param {...*} args parent class parameters
     */
    constructor({
        color = '@background-color',
        background = '@foreground-color',
        chevrons = false,
        clickable = false,
        onClick = null,
        ...args
    }) {
        let that

        super({
            widgetAttrs: {
                color: color,
                background: background,
                chevrons: chevrons,
                clickable: clickable,
                onClick: function (label, index) {
                    return that.onClick(label, index)
                }
            },
            ...args
        })

        if (onClick) {
            this.onClick = onClick
        }

        /* "that" needs to be assigned here because we can't refer to "this" before super() */
        that = this
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


export default LabelsField
