import {gettext}        from '$qui/base/i18n.js'
import FormButton       from '$qui/forms/form-button.js'
import StockIcon        from '$qui/icons/stock-icon.js'
import {asap}           from '$qui/utils/misc.js'
import * as ObjectUtils from '$qui/utils/object.js'

import MessageForm from '../message-form.js'


/**
 * A message form asking the user for confirmation.
 * @alias qui.messages.commonmessageforms.ConfirmMessageForm
 * @extends qui.messages.MessageForm
 * @param {Object} params
 * * see {@link qui.messages.MessageForm} for message form parameters
 * @param {qui.messages.MessageForm.Callback} params.onYes a confirmation callback (will receive `true` as result
 * argument)
 * @param {qui.messages.MessageForm.Callback} [params.onNo] an optional decline callback (will receive `false` as result
 * argument)
 */
export default class ConfirmMessageForm extends MessageForm {

    constructor({onYes, onNo = null, ...params}) {
        ObjectUtils.setDefault(params, 'icon', new StockIcon({name: 'qmark'}))
        ObjectUtils.setDefault(params, 'buttons', [
            new FormButton({id: 'no', caption: gettext('No'), cancel: true}),
            new FormButton({id: 'yes', caption: gettext('Yes'), def: true})
        ])

        super(params)

        this._onYes = onYes
        this._onNo = onNo

        this._confirmed = false
    }

    applyData() {
        this._confirmed = true
    }

    onClose() {
        if (this._confirmed) {
            asap(this._onYes)
        }
        else {
            if (this._onNo) {
                asap(this._onNo)
            }
        }
    }

    /**
     * Show a message form asking the user for confirmation.
     * @param {String} message the message to show
     * @param {qui.messages.MessageForm.Callback} onYes a function to be called on positive user answer
     * @param {?qui.messages.MessageForm.Callback} [onNo] a function to be called on negative user answer
     * @param {String} [pathId] a path identifier
     * @returns {qui.messages.commonmessageforms.ConfirmMessageForm} the message form
     */
    static show(message, onYes, onNo, pathId) {
        return new this({
            message: message,
            onYes: onYes,
            onNo: onNo,
            pathId: pathId
        })
    }

}
