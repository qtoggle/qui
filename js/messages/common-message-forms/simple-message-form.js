
import {gettext}        from '$qui/base/i18n.js'
import FormButton       from '$qui/forms/form-button.js'
import StockIcon        from '$qui/icons/stock-icon.js'
import {asap}           from '$qui/utils/misc.js'
import * as ObjectUtils from '$qui/utils/object.js'

import MessageForm from '../message-form.js'


/**
 * A simple message form.
 * @alias qui.messages.commonmessageforms.SimpleMessageForm
 * @extends qui.messages.MessageForm
 */
class SimpleMessageForm extends MessageForm {

    /**
     * @constructs
     * @param {String} type message type (`"info"`, `"warning"` or `"error"`)
     * @param {String} [buttonCaption] optional button caption (defaults to `"OK"`)
     * @param {qui.messages.MessageForm.Callback} [onClose] a dismiss callback
     * @param {...*} args parent class parameters
     */
    constructor({type, buttonCaption = gettext('OK'), onClose = null, ...args}) {
        let variant = null
        let iconName = null
        switch (type) {
            case 'info':
                variant = 'foreground'
                iconName = 'info'
                break

            case 'warning':
                variant = 'warning'
                iconName = 'exclam'
                break

            case 'error':
                variant = 'error'
                iconName = 'exclam'
                break
        }

        if (iconName && variant && args.icon == null) {
            args.icon = new StockIcon({name: iconName, variant: variant})
        }

        ObjectUtils.setDefault(args, 'buttons', [
            new FormButton({id: 'ok', caption: buttonCaption, def: true, style: 'interactive'})
        ])

        super(args)

        this._onClose = onClose
    }

    onClose() {
        if (this._onClose) {
            asap(this._onClose)
        }
    }

}


export default SimpleMessageForm
