
import $ from '$qui/lib/jquery.module.js'

import {asap} from '$qui/utils/misc.js'

import * as TextInput from './text-input.js' /* Needed */


// TODO do not allow user input of non-numeric characters
$.widget('qui.numericinput', $.qui.textinput, {

    options: {
        min: null,
        max: null
    },

    type: 'number',

    _create: function () {
        this._super('_create')

        this._setOption('min', this.options.min)
        this._setOption('max', this.options.max)

        /* Trigger change event on widget element when scrolling, but only if focused */
        this._input.on('mousewheel', function (e) {
            if (!this._input.is(':focus')) {
                e.preventDefault()
                return
            }

            asap(function () {
                this.element.trigger('change')
            }.bind(this))
        }.bind(this))
    },

    _setOption: function (key, value) {
        this._super(key, value)

        switch (key) {
            case 'min':
            case 'max':
                this._input.attr(key, value != null ? value : '')
                break
        }
    }

})
