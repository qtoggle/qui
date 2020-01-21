
import $ from '$qui/lib/jquery.module.js'

import {PageForm}       from '$qui/forms/common-forms.js'
import StockIcon        from '$qui/icons/stock-icon.js'
import * as ObjectUtils from '$qui/utils/object.js'


/**
 * Message form callback.
 * @callback qui.messages.MessageForm.Callback
 * @param {*} result
 */

/**
 * A base class for message forms.
 * @alias qui.messages.MessageForm
 * @extends qui.forms.PageForm
 */
class MessageForm extends PageForm {

    /**
     * @constructs qui.messages.MessageForm
     * @param {Object} params
     * * see {@link qui.forms.PageForm} for page form parameters
     * @param {String} params.message the message
     * @param {qui.icons.Icon} [params.icon] an optional icon
     */
    constructor({message, icon = null, ...params}) {
        ObjectUtils.setDefault(params, 'modal', true)
        ObjectUtils.setDefault(params, 'transparent', true)
        ObjectUtils.setDefault(params, 'topless', true)
        ObjectUtils.setDefault(params, 'width', '20em')
        ObjectUtils.setDefault(params, 'valuesWidth', 100)
        ObjectUtils.setDefault(params, 'title', params.message)

        super(params)

        this._message = message
        this._icon = icon
    }

    makeBody() {
        return super.makeBody().append(this.makeMessageBody())
    }

    /**
     * Override this to indicate how the message body is built.
     * @returns {jQuery}
     */
    makeMessageBody() {
        let bodyDiv = $('<div class="qui-message-form-body"></div>')
        let labelSpan = $('<div class="qui-message-form-label"></div>')

        labelSpan.html(this._message)

        if (this._icon) {
            let iconDiv = $('<div class="qui-icon qui-message-form-icon"></div>')
            let icon = this._icon
            if (icon instanceof StockIcon) {
                icon = icon.alterDefault({variant: 'foreground'})
            }
            icon.applyTo(iconDiv)
            bodyDiv.append(iconDiv)
        }

        bodyDiv.append(labelSpan)

        return bodyDiv
    }

}


export default MessageForm
