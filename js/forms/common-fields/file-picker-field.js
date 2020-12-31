
import JQueryUIField from './jquery-ui-field.js'


/**
 * A file picker field. The value data type is `File[]`.
 * @alias qui.forms.commonfields.FilePickerField
 * @extends qui.forms.commonfields.JQueryUIField
 */
class FilePickerField extends JQueryUIField {

    static WIDGET_CLASS = 'filepicker'


    /**
     * @constructs
     * @param {?String} [placeholder] an empty-selection placeholder
     * @param {?String[]} [accept] an optional list of file types to accept
     * @param {Boolean} [multiple] enable or disable multiple file selection (disabled by default)
     * @param {Object} [widgetAttrs] extra attributes to pass to underlying JQueryUI widget
     * @param {...*} args parent class parameters
     */
    constructor({
        placeholder = null,
        accept = null,
        multiple = false,
        widgetAttrs = {},
        ...args
    }) {
        Object.assign(widgetAttrs, {
            placeholder: placeholder,
            accept: accept,
            multiple: multiple
        })

        super({widgetAttrs: widgetAttrs, ...args})
    }

    getFocusableElement() {
        return this.getWidget().children('input')
    }

}


export default FilePickerField
