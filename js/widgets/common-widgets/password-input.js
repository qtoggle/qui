
import $ from '$qui/lib/jquery.module.js'

import StockIcon from '$qui/icons/stock-icon.js'

import * as TextInput from './text-input.js' /* Needed */


$.widget('qui.passwordinput', $.qui.textinput, {

    options: {
        clearEnabled: false,
        revealOnFocus: false
    },

    type: 'password',
    _autocomplete_on: 'current-password',
    _autocomplete_off: 'new-password',

    _create: function () {
        this._super()

        this._clearButton = null
        if (this.options.clearEnabled) {
            this._clearButton = this._makeClearButton()
            this.element.addClass('clear-enabled')
            this.element.append(this._clearButton)
        }

        this.element.on('focus', function () {

            if (this.options.revealOnFocus) {
                this._input.attr('type', 'text')
            }

        }.bind(this))

        this.element.on('blur', function () {

            if (this.options.revealOnFocus) {
                this._input.attr('type', this.type)
            }

        }.bind(this))
    },

    _makeClearButton: function () {
        let clearIcon = $('<div></div>', {class: 'qui-icon qui-password-input-clear-icon'})
        let variant = 'interactive'
        if (this.options.error != null) {
            variant = 'error'
        }
        else if (this.options.warning != null) {
            variant = 'warning'
        }
        new StockIcon({
            name: 'close', variant: variant,
            activeName: 'close', activeVariant: 'background',
            scale: 0.5
        }).applyTo(clearIcon)

        let clearButton = $('<div></div>', {class: 'qui-base-button qui-password-input-clear-button'})
        clearButton.append(clearIcon)

        clearButton.on('click', function () {

            this._input.val('')
            this.element.trigger('change')

        }.bind(this))

        return clearButton
    },

    _setOption: function (key, value) {
        this._super(key, value)

        switch (key) {
            case 'warning':
            case 'error':
                /* When warning or error change, we need to rebuild the clear button icon */
                if (this._clearButton) {
                    let newClearButton = this._makeClearButton()
                    this._clearButton.replaceWith(newClearButton)
                    this._clearButton = newClearButton
                }
                break
        }
    }

})
