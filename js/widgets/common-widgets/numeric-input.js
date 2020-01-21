
import $ from '$qui/lib/jquery.module.js'

import {asap} from '$qui/utils/misc.js'

import * as TextInput from './text-input.js' /* Needed */


// TODO do not allow user input of non-numeric characters
$.widget('qui.numericinput', $.qui.textinput, {

    type: 'number',

    _create: function () {
        this._super('_create')

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
    }

})
