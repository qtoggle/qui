import $ from '$qui/lib/jquery.module.js'

import {mix}     from '$qui/base/mixwith.js'
import ViewMixin from '$qui/views/view.js'


/**
 * A form button.
 * @alias qui.forms.FormButton
 * @mixes qui.views.ViewMixin
 * @param {Object} params
 * * see {@link qui.views.ViewMixin} for view parameters
 * @param {String} params.id button identifier
 * @param {String} params.caption button caption
 * @param {String} [params.style] button style:
 *  * `"interactive"`
 *  * `"highlight"`
 *  * `"danger"`
 *  * `"colored"`
 * @param {String} [params.backgroundColor] custom background color (ignored unless `style` is `"colored"`)
 * @param {String} [params.backgroundActiveColor] custom background active color (ignored unless `style` is
 *  `"colored"`)
 * @param {String} [params.foregroundColor] custom foreground color (ignored unless `style` is `"colored"`)
 * @param {Boolean} [params.def] indicates that the button is the default form button (defaults to `false`)
 * @param {Boolean} [params.cancel] indicates that the button is the cancel form button (defaults to `false`)
 * @param {Function} [params.callback] called when button is pressed; will be called with the form as argument
 */
export default class FormButton extends mix().with(ViewMixin) {

    constructor({
        id, caption, style,
        backgroundColor = '@interactive-color',
        backgroundActiveColor = '@interactive-active-color',
        foregroundColor = '@white-color',
        def = false, cancel = false, callback = null,
        ...params
    }) {
        super(params)

        this._id = id
        this._caption = caption
        this._style = style
        this._backgroundColor = backgroundColor
        this._backgroundActiveColor = backgroundActiveColor
        this._foregroundColor = foregroundColor
        this._def = def
        this._cancel = cancel
        this._callback = callback

        this._form = null
    }

    makeHTML() {
        if (!this._style) {
            if (this._def) {
                this._style = 'highlight'
            }
            else {
                this._style = 'interactive'
            }
        }

        let attrs = {
            caption: this._caption,
            style: this._style,
            backgroundColor: this._backgroundColor,
            backgroundActiveColor: this._backgroundActiveColor,
            foregroundColor: this._foregroundColor
        }

        let html = $('<div class="qui-form-button"></div>').pushbutton(attrs)

        html.on('click', function () {
            this.handlePressed(this._form)
        }.bind(this))

        return html
    }

    /**
     * Button press handler.
     * @param {qui.forms.Form} form
     */
    handlePressed(form) {
        if (this._callback) {
            this._callback(form)
        }
        else {
            /* Default button callback */

            if (this.isDefault()) {
                this._form.defaultAction()
            }
            else if (this.isCancel()) {
                this._form.cancelAction()
            }
        }
    }

    /**
     * Return the button identifier.
     * @returns {String}
     */
    getId() {
        return this._id
    }

    /**
     * Enable the button.
     */
    enable() {
        this.getHTML().pushbutton({disabled: false})
    }

    /**
     * Disable the button.
     */
    disable() {
        this.getHTML().pushbutton({disabled: true})
    }

    /**
     * Return the button caption.
     * @returns {String}
     */
    getCaption() {
        return this._caption
    }

    /**
     * Update the button caption.
     * @param {String} caption
     */
    setCaption(caption) {
        this._caption = caption
        this.getHTML().pushbutton({caption: caption})
    }

    /**
     * Tell if the button is the default form button.
     * @returns {Boolean}
     */
    isDefault() {
        return this._def
    }

    /**
     * Tell if the button is the form cancel button.
     * @returns {Boolean}
     */
    isCancel() {
        return this._cancel
    }

    /**
     * Return the owning form.
     * @returns {qui.forms.Form}
     */
    getForm() {
        return this._form
    }

    /**
     * Set the owning form.
     * @param {qui.forms.Form} form
     */
    setForm(form) {
        this._form = form
    }

}
