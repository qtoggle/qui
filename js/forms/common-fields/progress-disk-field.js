
import * as ObjectUtils from '$qui/utils/object.js'

import JQueryUIField from './jquery-ui-field.js'


/**
 * A progress disk field. The value data type is `Number`.
 * @alias qui.forms.commonfields.ProgressDiskField
 * @extends qui.forms.commonfields.JQueryUIField
 */
class ProgressDiskField extends JQueryUIField {

    static WIDGET_CLASS = 'progressdisk'


    /**
     * @constructs
     * @param {Number|String} [radius] the disk radius (defaults to `1em`)
     * @param {String} [caption] the caption template displayed on top of the disk (defaults to `%s%%`)
     * @param {String} [color] the color (defaults to `@interactive-color`)
     * @param {...*} args parent class parameters
     */
    constructor({radius = '1em', caption = '%s%%', color = '@interactive-color', ...args}) {
        /* We always prefer having the widget on the same line with its label */
        ObjectUtils.setDefault(args, 'forceOneLine', true)

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

    setForm(form) {
        // TODO: generalize this code
        super.setForm(form)

        /* On compact forms, reduce the value width when showing on the same line with label, so that label can take as
         * much space as needed */
        if (form.isCompact() && this.isForceOneLine() && this.getValueWidth() == null) {
            this.setValueWidth(0)
        }
    }

}


export default ProgressDiskField
