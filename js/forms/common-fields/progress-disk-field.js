
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
     * @param {String} [caption] the caption template displayed on top of the disk (defaults to `%s%%`)
     * @param {String} [color] the color (defaults to `@interactive-color`)
     * @param {...*} args parent class parameters
     */
    constructor({radius = '1em', caption = '%s%%', color = '@interactive-color', ...args}) {
        super({widgetAttrs: {radius, caption, color}, ...args})
    }

    /**
     * Set radius.
     * @param {String} radius
     */
    setRadius(radius) {
        this._widgetCall({radius})
    }

    /**
     * Set caption.
     * @param {String} caption
     */
    setCaption(caption) {
        this._widgetCall({caption})
    }

    /**
     * Set color.
     * @param {String} color
     */
    setColor(color) {
        this._widgetCall({color})
    }

}

// TODO es7 class fields
ProgressDiskField.WIDGET_CLASS = 'progressdisk'


export default ProgressDiskField
