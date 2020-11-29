
import $ from '$qui/lib/jquery.module.js'

import {gettext} from '$qui/base/i18n.js'

import * as BaseWidget from '../base-widget.js' /* Needed */


$.widget('qui.updown', $.qui.basewidget, {

    options: {
        name: '',
        min: 0,
        max: 100,
        step: 1,
        fastFactor: 10,
        decimals: 0,
        continuousChange: true,
        readonly: false,
        disabled: false
    },

    _create: function () {
        this._input = $('<input>', {type: 'text', class: 'qui-updown-input'})
        this._downButton = $(
            '<div></div>',
            {class: 'qui-base-button qui-interactive-button qui-updown-button down', title: gettext('decrease')}
        )
        this._upButton = $(
            '<div></div>',
            {class: 'qui-base-button qui-interactive-button qui-updown-button up', title: gettext('increase')}
        )

        this._curVal = this.options.min
        this._input.val(this.options.min.toFixed(this.options.decimals))

        if (this.options.name) {
            this._input.attr('name', this.options.name)
        }
        if (this.options.readonly) {
            this.element.addClass('readonly')
        }
        if (this.options.disabled) {
            this.element.addClass('disabled')
            this._input.attr('disabled', 'disabled')
        }

        this.element.addClass('qui-updown-container')
        this._input.attr('readonly', 'readonly')

        this.element.append(this._input)

        if (!this.options.disabled) {
            this.element.attr('tabIndex', 0) /* Make the container focusable */
        }

        this.element.append(this._downButton)
        this.element.append(this._upButton)

        this._changed = false

        let widget = this

        /* Install the wheel handler */
        this.element.on('mousewheel', function (e, delta) {
            if (widget.options.readonly || widget.options.disabled) {
                return
            }

            /* Ignore scroll events on unfocused widget */
            if (!widget.element.is(':focus')) {
                return
            }

            if (!widget.options.continuousChange) {
                widget.element.focus() /* Needed for triggering the change event on blur */
            }

            let changed
            let step = widget.options.step
            if (e.shiftKey) {
                step *= widget.options.fastFactor
            }
            if (delta > 0) {
                changed = widget._increase(step)
            }
            else {
                changed = widget._decrease(step)
            }

            if (changed) {
                widget._markChange()
                return false
            }
        })

        /* Trigger change on input change */
        this._input.on('change', function () {
            let val = $(this).val()
            val = widget._validate(val)
            if (val == null) {
                $(this).val(widget._curVal.toFixed(widget.options.decimals))
            }
            else {
                $(this).val(val.toFixed(widget.options.decimals))
                widget._curVal = val
                widget._markChange()
            }
        })

        /* Install the up/down buttons click handlers */
        this._downButton.on('click', function () {
            if (widget.options.readonly || widget.options.disabled) {
                return
            }

            if (widget._decrease()) {
                widget._markChange()
            }
        })
        this._upButton.on('click', function () {
            if (widget.options.readonly || widget.options.disabled) {
                return
            }

            if (widget._increase()) {
                widget._markChange()
            }
        })

        let incDecLoopActive = false

        function incLoop() {
            widget._upButton.trigger('click')
            if (incDecLoopActive) {
                setTimeout(incLoop, 50)
            }
        }

        function decLoop() {
            widget._downButton.trigger('click')
            if (incDecLoopActive) {
                setTimeout(decLoop, 50)
            }
        }

        /* Install up/down buttons long press handlers */

        this._downButton.longpress(function () {
            if (widget.options.readonly || widget.options.disabled) {
                return
            }

            incDecLoopActive = true
            decLoop()
        })
        this._downButton.on('pointerup pointerleave pointerout pointercancel', function () {
            incDecLoopActive = false
        })

        this._upButton.longpress(function () {
            if (widget.options.readonly || widget.options.disabled) {
                return
            }

            incDecLoopActive = true
            incLoop()
        })
        this._upButton.on('pointerup pointerleave pointerout pointercancel', function () {
            incDecLoopActive = false
        })

        /* Install keys handler */
        this.element.on('keydown', function (e) {
            if (widget.options.readonly || widget.options.disabled) {
                return
            }

            switch (e.which) {
                case 40: /* Down */
                    if (widget._decrease()) {
                        widget._markChange()
                        return false
                    }

                    break

                case 38: /* Up */
                    if (widget._increase()) {
                        widget._markChange()
                        return false
                    }

                    break

                case 34: /* Page-down */
                    if (widget._decrease(widget.options.step * widget.options.fastFactor)) {
                        widget._markChange()
                        return false
                    }

                    break

                case 33: /* Page-up */
                    if (widget._increase(widget.options.step * widget.options.fastFactor)) {
                        widget._markChange()
                        return false
                    }

                    break

                case 35: /* End */
                    if (widget._curVal !== widget.options.min) {
                        widget._setValue(widget.options.min)
                        widget._markChange()
                        return false
                    }

                    break

                case 36: /* Home */
                    if (widget._curVal !== widget.options.max) {
                        widget._setValue(widget.options.max)
                        widget._markChange()
                        return false
                    }

                    break

            }
        })

        /* Transfer focus from input to container */
        this._input.on('focus', function () {
            widget.element.focus()
        })

        this.element.on('blur', function () {
            if (widget._changed) {
                widget._changed = false
                widget.element.trigger('change', widget._curVal)
            }
        })
    },

    getValue: function () {
        return this._curVal
    },

    setValue: function (value) {
        value = this._validate(value)
        if (value == null) {
            return
        }

        this._setValue(value)
    },

    _setValue: function (value) {
        this._curVal = value
        this._input.val(value.toFixed(this.options.decimals))
    },

    _increase: function (step = this.options.step) {
        let oldVal = this._curVal
        let val = this._validate(oldVal + step)

        if (oldVal !== val) {
            this._setValue(val)
            return true
        }
        else {
            return false
        }
    },

    _decrease: function (step = this.options.step) {
        let oldVal = this._curVal
        let val = this._validate(oldVal - step)

        if (oldVal !== val) {
            this._setValue(val)
            return true
        }
        else {
            return false
        }
    },

    _markChange: function () {
        if (this.options.continuousChange) {
            this.element.trigger('change', this._curVal)
        }
        else {
            this._changed = true
        }
    },

    _validate: function (value) {
        value = parseFloat(value)
        if (isNaN(value)) {
            return null
        }

        value = Math.max(this.options.min, value)
        value = Math.min(this.options.max, value)

        return value
    },

    _setOption: function (key, value) {
        this._super(key, value)

        switch (key) {
            case 'readonly':
                this.element.toggleClass('readonly', value)

                break

            case 'disabled':
                this.element.toggleClass('disabled', value)
                if (value) {
                    this.element.removeAttr('tabIndex')
                    this._input.attr('disabled', 'disabled')
                }
                else {
                    this.element.attr('tabIndex', 0)
                    this._input.removeAttr('disabled')
                }
                break

            case 'decimals':
                this._input.val(this._curVal.toFixed(this.options.decimals))
                break

            case 'min':
                if (this._curVal < this.options.min) {
                    this._setValue(this.options.min)
                }
                break

            case 'max':
                if (this._curVal > this.options.max) {
                    this._setValue(this.options.max)
                }
                break

        }
    }

})
