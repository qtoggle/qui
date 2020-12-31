
import TextField from './text-field.js'


/**
 * A text area field. The value data type is `String`.
 * @alias qui.forms.commonfields.TextAreaField
 * @extends qui.forms.commonfields.TextField
 */
class TextAreaField extends TextField {

    static WIDGET_CLASS = 'textarea'


    /**
     * @constructs
     * @param {Number} [columns] number of columns
     * @param {Number} [rows] number of rows
     * @param {Boolean} [wrap] enable automatic content wrapping
     * @param {?String} [resize] resize mode (one of `null`, `"horizontal"`, `"vertical"` and `"both"`)
     * @param {...*} args parent class parameters
     */
    constructor({columns = null, rows = null, wrap = false, resize = null, ...args}) {
        super({widgetAttrs: {columns, rows, wrap, resize}, ...args})
    }

    getInputElement() {
        return this.getWidget().children('textarea')
    }

}


export default TextAreaField
