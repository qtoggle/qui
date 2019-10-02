import $ from '$qui/lib/jquery.module.js'

import StockIcon from '$qui/icons/stock-icon.js'

import * as TextInput from './text-input.js' /* Needed */


$.widget('qui.passwordinput', $.qui.textinput, {

    options: {
        clearEnabled: false
    },

    type: 'password',
    _autocomplete_on: 'current-password',
    _autocomplete_off: 'new-password',

    _create: function () {
        this._super()

        if (this.options.clearEnabled) {
            this.element.append(this._makeClearIcon())
        }
    },

    _makeClearIcon: function () {
        let clearIcon = $('<div class="qui-icon qui-base-button qui-password-input-clear-icon"></div>')
        new StockIcon({
            name: 'close', variant: 'interactive',
            activeName: 'close', activeVariant: 'interactive-active',
            focusedName: 'close', focusedVariant: 'background',
            scale: 0.5
        }).applyTo(clearIcon)

        clearIcon.on('click', function () {

            this._input.val('')
            this._input.trigger('change')

        }.bind(this))

        return clearIcon
    }

})
