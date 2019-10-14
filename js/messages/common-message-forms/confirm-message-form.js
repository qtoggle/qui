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
 * @param {qui.messages.MessageForm.Callback} [params.onYes] an optional confirmation callback
 * @param {qui.messages.MessageForm.Callback} [params.onNo] an optional decline callback
 */
export default class ConfirmMessageForm extends MessageForm {

    constructor({onYes = null, onNo = null, ...params} = {}) {
        ObjectUtils.setDefault(params, 'icon', new StockIcon({name: 'qmark'}))
        ObjectUtils.setDefault(params, 'buttons', [
            new FormButton({id: 'no', caption: gettext('No'), cancel: true}),
            new FormButton({id: 'yes', caption: gettext('Yes'), def: true})
        ])

        super(params)

        this._onYes = onYes
        this._onNo = onNo

        this._resolve = null
        this._reject = null

        this._confirmed = false
    }

    applyData() {
        this._confirmed = true
    }

    onClose() {
        if (this._confirmed) {
            if (this._onYes) {
                asap(this._onYes)
            }
            if (this._resolve) {
                asap(this._resolve)
            }
        }
        else {
            if (this._onNo) {
                asap(this._onNo)
            }
            if (this._reject) {
                asap(this._reject)
            }
        }
    }

    /**
     * Return a promise resolves on positive answer and is rejected on negative answer.
     * @returns {Promise}
     */
    asPromise() {
        return new Promise(function (resolve, reject) {
            this._resolve = resolve
            this._reject = reject
        }.bind(this))
    }

    /**
     * Show a message form asking the user for confirmation.
     * @param {String} message the message to show
     * @param {qui.messages.MessageForm.Callback} [onYes] a function to be called on positive user answer
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
