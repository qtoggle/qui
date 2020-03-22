
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

        if (this.options.clearEnabled) {
            this.element.addClass('clear-enabled')
            this.element.append(this._makeClearButton())
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
        new StockIcon({
            name: 'close', variant: 'interactive',
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
    }

})
