
import $ from '$qui/lib/jquery.module.js'

import TableCell from '../table-cell.js'


/**
 * A table cell with a push button.
 * @alias qui.tables.commoncells.PushButtonTableCell
 * @extends qui.tables.TableCell
 */
class PushButtonTableCell extends TableCell {

    /**
     * @constructs
     * @param {String} caption the button caption
     * @param {Function} [onClick] function to be executed when the button is pushed (see
     * {@link qui.tables.commoncells.PushButtonTableCell#onClick})
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
        super({...args})

        this._pushButtonParams = {
            caption,
            style,
            backgroundColor,
            backgroundActiveColor,
            foregroundColor,
            icon
        }

        if (onClick) {
            this.onClick = onClick
        }

        this._buttonDiv = null
    }

    makeContent() {
        this._buttonDiv = $('<div></div>', {class: 'qui-push-button-table-cell'}).pushbutton(this._pushButtonParams)
        this._buttonDiv.on('click', () => this.onClick())

        return this._buttonDiv
    }

    showValue(value) {
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

    /**
     * Set button enabled state.
     * @param {Boolean} enabled
     */
    setEnabled(enabled) {
        this._widgetCall({disabled: !enabled})
    }

    _widgetCall(params) {
        return this._buttonDiv.pushbutton(params)
    }

}


export default PushButtonTableCell
