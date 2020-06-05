
import $ from '$qui/lib/jquery.module.js'

import {AssertionError} from '$qui/base/errors.js'
import {PageForm}       from '$qui/forms/common-forms/common-forms.js'
import StockIcon        from '$qui/icons/stock-icon.js'
import * as Sections    from '$qui/sections/sections.js'
import {asap}           from '$qui/utils/misc.js'
import * as ObjectUtils from '$qui/utils/object.js'


/**
 * Message form callback.
 * @callback qui.messages.MessageForm.Callback
 * @param {*} result
 */

/**
 * A base class for message forms.
 * @alias qui.messages.MessageForm
 * @extends qui.forms.commonforms.PageForm
 */
class MessageForm extends PageForm {

    /**
     * @constructs
     * @param {String} message the message
     * @param {qui.icons.Icon} [icon] an optional icon
     * @param {...*} args parent class parameters
     */
    constructor({message, icon = null, ...args}) {
        ObjectUtils.assignDefault(args, {
            modal: true,
            transparent: true,
            topless: true,
            width: '30em',
            valuesWidth: 100,
            title: args.message
        })

        super(args)

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
        let bodyDiv = $('<div></div>', {class: 'qui-message-form-body'})
        let labelSpan = $('<div></div>', {class: 'qui-message-form-label'})

        labelSpan.html(this._message)

        if (this._icon) {
            let iconDiv = $('<div></div>', {class: 'qui-icon qui-message-form-icon'})
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

    handleBecomeCurrent() {
        super.handleBecomeCurrent()

        /* Focus the default button */
        asap(function () {
            let button = this.getButtons().find(b => b.isDefault())
            if (button) {
                button.focus()
            }
        }.bind(this))
    }

    /**
     * Show the message form by pushing it onto the current section context.
     * @returns {qui.messages.MessageForm} this form
     */

    show() {
        let currentSection = Sections.getCurrent()
        if (!currentSection) {
            throw new AssertionError('Attempt to show message form while no current section')
        }

        currentSection.pushPage(this)

        return this
    }

}


export default MessageForm
