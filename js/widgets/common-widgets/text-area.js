
import $ from '$qui/lib/jquery.module.js'

import * as TextInput from './text-input.js' /* Needed */


$.widget('qui.textarea', $.qui.textinput, {

    options: {
        columns: null,
        rows: null,
        wrap: false,
        resize: null
    },

    type: 'textarea',

    _create: function () {
        this._super()

        this._setOption('columns', this.options.columns)
        this._setOption('rows', this.options.rows)
        this._setOption('wrap', this.options.wrap)
        this._setOption('resize', this.options.resize)

        this._input.on('keydown', function (e) {
            if (e.which === 13) { /* Enter */
                e.stopPropagation()
            }
        })
    },

    _setOption: function (key, value) {
        this._super(key, value)

        switch (key) {
            case 'columns':
            case 'rows':
                this._input.attr(key, value || '')
                break

            case 'wrap':
                this._input.attr('wrap', value ? 'hard' : 'off')
                break

            case 'resize':
                this._input.css('resize', value)
                break
        }
    }

})
