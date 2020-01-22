
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
 */
class ConfirmMessageForm extends MessageForm {

    /**
     * @constructs qui.messages.commonmessageforms.ConfirmMessageForm
     * @param {qui.messages.MessageForm.Callback} [onYes] an optional confirmation callback
     * @param {qui.messages.MessageForm.Callback} [onNo] an optional decline callback
     * @param params
     * * see {@link qui.messages.MessageForm} for message form parameters
     */
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

}


export default ConfirmMessageForm
