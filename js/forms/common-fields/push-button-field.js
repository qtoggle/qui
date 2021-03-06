
import JQueryUIField from './jquery-ui-field.js'


/**
 * A push button field. The value of this field will always be `null`.
 * @alias qui.forms.commonfields.PushButtonField
 * @extends qui.forms.commonfields.JQueryUIField
 */
class PushButtonField extends JQueryUIField {

    static WIDGET_CLASS = 'pushbutton'


    /**
     * @constructs
     * @param {String} caption the button caption
     * @param {Function} [onClick] function to be executed when the button is pushed (see
     * {@link qui.forms.commonfields.PushButtonField#onClick})
     * @param {String} caption button caption
     * @param {String} [style] button style:
     *  * `"foreground"`
     *  * `"interactive"` (default)
     *  * `"highlight"`
     *  * `"danger"`,
     *  * `"colored"`
     * @param {String} [backgroundColor] custom background color (ignored unless `style` is `"colored"`)
     * @param {String} [backgroundActiveColor] custom background active color (ignored unless `style` is `"colored"`)
     * @param {String} [foregroundColor] custom foreground color (ignored unless `style` is `"colored"`)
     * @param {qui.icons.Icon} [icon] an optional button icon
     * @param {...*} args parent class parameters
     */
    constructor({
        caption,
        onClick = null,
        style = 'interactive',
        backgroundColor = '@interactive-color',
        backgroundActiveColor = '@interactive-active-color',
        foregroundColor = '@foreground-interactive-color',
        icon = null,
        ...args
    }) {
        super({
            widgetAttrs: {
                caption,
                style,
                backgroundColor,
                backgroundActiveColor,
                foregroundColor,
                icon
            },
            ...args
        })

        if (onClick) {
            this.onClick = onClick
        }
    }

    makeWidget() {
        let div = super.makeWidget()

        div.addClass('qui-form-push-button')
        div.on('click', () => this.onClick(this.getForm()))

        if (this.getValueWidth() === 100) {
            div.css('display', 'block')
        }

        return div
    }

    /**
     * Called when the button is pushed.
     * @param {qui.forms.Form} form owning form
     */
    onClick(form) {
    }

    valueToWidget(value) {
    }

    widgetToValue() {
        return null
    }

    /**
     * Update button style.
     * @param {String} style
     */
    setStyle(style) {
        this._widgetCall({style: style})
    }

    /**
     * Update button caption.
     * @param {String} caption
     */
    setCaption(caption) {
        this._widgetCall({caption: caption})
    }

    /**
     * Update background color.
     * @param {String} color
     */
    setBackgroundColor(color) {
        this._widgetCall({backgroundColor: color})
    }

    /**
     * Update background active color.
     * @param {String} color
     */
    setBackgroundActiveColor(color) {
        this._widgetCall({backgroundActiveColor: color})
    }

    /**
     * Update foreground color.
     * @param {String} color
     */
    setForegroundColor(color) {
        this._widgetCall({foregroundColor: color})
    }

    /**
     * Update button icon.
     * @param {?qui.icons.Icon} icon
     */
    setIcon(icon) {
        this._widgetCall({icon: icon})
    }

}


export default PushButtonField
