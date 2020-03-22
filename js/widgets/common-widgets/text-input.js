
import $ from '$qui/lib/jquery.module.js'

import {asap} from '$qui/utils/misc.js'


$.widget('qui.textinput', {

    options: {
        name: '',
        placeholder: '',
        clearPlaceholder: false,
        autocomplete: false,
        continuousChange: true,
        minLength: null,
        maxLength: null,
        readonly: false,
        disabled: false
    },

    type: 'text',
    _autocomplete_on: null,
    _autocomplete_off: 'off',

    _create: function () {
        this.element.addClass('text-input')

        this._input = $('<input>', {type: this.type})
        this.element.append(this._input)

        if (this.options.name) {
            this._input.attr('name', this.options.name)
        }
        if (this.options.placeholder) {
            this._input.attr('placeholder', this.options.placeholder)
        }

        if (this.options.autocomplete === false && this._autocomplete_off != null) {
            this._input.attr('autocomplete', this._autocomplete_off)
        }
        else if (this.options.autocomplete === true && this._autocomplete_on != null) {
            this._input.attr('autocomplete', this._autocomplete_on)
        }
        else if (this.options.autocomplete != null) { /* Assuming a string */
            this._input.attr('autocomplete', this.options.autocomplete)
        }

        if (this.options.minLength != null) {
            this._input.attr('minlength', this.options.minLength)
        }
        if (this.options.maxLength != null) {
            this._input.attr('maxlength', this.options.maxLength)
        }
        if (this.options.readonly) {
            this._input.attr('readonly', 'readonly')
        }
        if (this.options.disabled) {
            this._input.attr('disabled', 'disabled')
        }

        let widget = this

        /* Manually propagate some events to parent */
        this._input.on('focus blur', function (e) {
            this.element.triggerHandler(e.type)
        }.bind(this))

        this._lastValue = ''
        this._input.on('keydown paste cut', function () {
            if (widget.options.continuousChange) {
                asap(function () {
                    if (this.value !== widget._lastValue) {
                        widget.element.trigger('change')
                        widget._lastValue = this.value
                    }
                }.bind(this))
            }
        })

        this._input.on('change', function (e) {
            if (widget.options.continuousChange) {
                /* Change events are triggered by keydown & alike */
                e.stopPropagation()
                return
            }

            widget._lastValue = this.value
            if (widget.options.clearPlaceholder) {
                widget._input.attr('placeholder', '')
            }
        })
    },

    _setOption: function (key, value) {
        this._super(key, value)

        switch (key) {
            case 'disabled':
                if (value) {
                    this._input.attr('disabled', 'disabled')
                }
                else {
                    this._input.removeAttr('disabled')
                }
                break

            case 'readonly':
                if (value) {
                    this._input.attr('readonly', 'readonly')
                }
                else {
                    this._input.removeAttr('readonly')
                }
                break

            case 'autocomplete':
                if (value) {
                    this._input.removeAttr('autocomplete')
                }
                else {
                    this._input.attr('autocomplete', this._autocomplete_off)
                }
                break

            case 'placeholder':
                this._input.attr('placeholder', value || '')
                break

            case 'minLength':
                if (value != null) {
                    this._input.attr('minlength', value)
                }
                else {
                    this._input.removeAttr('minlength')
                }
                break

            case 'maxLength':
                if (value != null) {
                    this._input.attr('maxlength', value)
                }
                else {
                    this._input.removeAttr('maxlength')
                }
                break
        }
    },

    getValue: function () {
        return this._input.val()
    },

    setValue: function (value) {
        this._input.val(value)
        this._lastValue = value
    }

})
