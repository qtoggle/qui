import $ from '$qui/lib/jquery.module.js'

import * as Gestures from '$qui/utils/gestures.js'


$.widget('qui.slider', {

    options: {
        value: 0,
        ticks: [{label: 0, value: 0}, {label: 50, value: 50}, {label: 100, value: 100}],
        snapMode: 0,
        continuousChange: false,
        equidistant: false,
        increment: 0.02,
        fastFactor: 5,
        snapDistance: 0.02,
        readonly: false,
        disabled: false
    },

    _create: function () {
        /* Create the widget elements */

        this.element.addClass('slider')
        if (this.options.readonly) {
            this.element.addClass('readonly')
        }
        if (this.options.disabled) {
            this.element.addClass('disabled')
        }
        else {
            this.element.attr('tabIndex', 0) /* Make the container focusable */
        }

        this._labels = $('<div class="qui-slider-labels"></div>')
        this.element.append(this._labels)

        this._barContainer = $('<div class="qui-slider-bar-container"></div>')
        this.element.append(this._barContainer)

        this._bar = $('<div class="qui-slider-bar"></div>')
        this._barContainer.append(this._bar)

        this._cursor = $('<div class="qui-slider-cursor qui-base-button"></div>')
        this._bar.append(this._cursor)

        this._maxVal = this.options.value
        this._minVal = this.options.value
        this._curVal = this.options.value

        let widget = this

        Gestures.enableDragging(
            this.element,
            /* onMove = */ function (elemX, elemY, deltaX, deltaY, pageX, pageY) {
                if (widget.options.readonly) {
                    return
                }

                let offset = widget._bar.offset()
                let pos = pageX - offset.left
                pos = pos / widget._getWidth()
                pos = widget._bestPos(pos)

                widget._setPos(pos)

                if (widget.options.continuousChange) {
                    widget.element.trigger('change', widget._curVal)
                }
            },
            /* onBegin = */ function () {
                if (widget.options.readonly || widget.options.disabled) {
                    return false
                }

                widget.element.focus()
            },
            /* onEnd = */ function () {
                if (!widget.options.continuousChange && !widget.options.readonly) {
                    widget.element.trigger('change', widget._curVal)
                }
            }
        )

        this.element.on('mousewheel', function (e, delta) {
            if (widget.options.readonly || widget.options.disabled) {
                return
            }

            let changed = false
            if (delta > 0) {
                changed = widget._increase()
            }
            else {
                changed = widget._decrease()
            }

            if (changed) {
                widget.element.trigger('change', widget._curVal)
                return false
            }
        })

        this.element.on('keydown', function (e) {
            if (widget.options.readonly) {
                return
            }

            let changed = false

            switch (e.which) {
                case 38: /* Up */
                case 37: /* Left */
                    if (widget._decrease()) {
                        widget.element.trigger('change', widget._curVal)
                        return false
                    }

                    break

                case 40: /* Down */
                case 39: /* Right */
                    if (widget._increase()) {
                        widget.element.trigger('change', widget._curVal)
                        return false
                    }

                    break

                case 33: /* Page-up */
                    for (let i = 0; i < widget.options.fastFactor; i++) {
                        if (widget._decrease()) {
                            changed = true
                        }
                    }
                    if (changed) {
                        widget.element.trigger('change', widget._curVal)
                        return false
                    }

                    break

                case 34: /* Page-down */
                    for (let i = 0; i < widget.options.fastFactor; i++) {
                        if (widget._increase()) {
                            changed = true
                        }
                    }
                    if (changed) {
                        widget.element.trigger('change', widget._curVal)
                        return false
                    }

                    break

                case 36: /* Home */
                    while (widget._decrease()) {
                        changed = true
                    }
                    if (changed) {
                        widget.element.trigger('change', widget._curVal)
                        return false
                    }

                    break

                case 35: /* End */
                    while (widget._increase()) {
                        changed = true
                    }
                    if (changed) {
                        widget.element.trigger('change', widget._curVal)
                        return false
                    }

                    break
            }
        })

        this._updateTicks()
    },

    setValue: function (val) {
        val = Math.max(this._minVal, Math.min(this._maxVal, val))
        this._setPos(this._valToPos(val))
    },

    getValue: function () {
        return this._curVal
    },

    _updateTicks: function () {
        this._maxVal = Math.max.apply(Math, this.options.ticks.map(t => t.value))
        this._minVal = Math.min.apply(Math, this.options.ticks.map(t => t.value))
        this._makeLabels()

        /* Update the position and the current value */
        this._curVal = Math.min(this._maxVal, Math.max(this._minVal, this._curVal))
        this._setPos(this._valToPos(this._curVal))
    },

    _getWidth: function () {
        return this._bar.width() || 100
    },

    _getPos: function () {
        return this._cursor.position().left / this._getWidth()
    },

    _setPos: function (pos) {
        pos = Math.max(0, Math.min(1, pos))

        this._cursor.css('left', `${(pos * 100)}%`)
        this._curVal = this._posToVal(pos)
    },

    _valToPos: function (val) {
        if (this.options.equidistant) {
            let index = this.options.ticks.findIndex(function (tick) {
                return tick.value === val
            })

            if (index < 0) {
                index = 0
            }

            return index / (this.options.ticks.length - 1)
        }
        else {
            return (val - this._minVal) / (this._maxVal - this._minVal)
        }
    },

    _posToVal: function (pos) {
        if (this.options.equidistant) {
            let index = Math.round(pos * (this.options.ticks.length - 1))

            return this.options.ticks[index].value
        }
        else {
            return this._minVal + pos * (this._maxVal - this._minVal)
        }
    },

    _bestPos: function (pos) {
        pos = Math.max(0, Math.min(1, pos))

        if (this.options.snapMode > 0) {
            let minDif = Infinity
            let bp = null
            for (let i = 0; i < this.options.ticks.length; i++) {
                let tick = this.options.ticks[i]
                let p = this._valToPos(tick.value)
                let dif = Math.abs(p - pos)
                if ((dif < minDif) && (this.options.snapMode === 1 || dif < this.options.snapDistance)) {
                    minDif = dif
                    bp = p
                }
            }

            if (bp != null) {
                pos = bp
            }
        }

        return pos
    },

    _increase: function () {
        let index
        if (this.options.equidistant) {
            index = Math.round(this._getPos() * (this.options.ticks.length - 1))
            if (index < this.options.ticks.length - 1) {
                index++
                this._setPos(index / (this.options.ticks.length - 1))

                return true
            }
        }
        else if (this.options.snapMode === 1) {
            index = this.options.ticks.findIndex(function (tick) {
                return tick.value === this._curVal
            }, this)

            if (index < 0) {
                index = 0
            }

            if (index < this.options.ticks.length - 1) {
                index++
                this._setPos(this._valToPos(this.options.ticks[index].value))

                return true
            }
        }
        else {
            let oldPos = this._getPos()
            let newPos = oldPos + Math.max(this.options.increment, this.options.snapDistance + 0.01)
            newPos = this._bestPos(newPos)

            if (newPos !== oldPos) {
                this._setPos(newPos)

                return true
            }
        }

        return false
    },

    _decrease: function () {
        let index
        if (this.options.equidistant) {
            index = Math.round(this._getPos() * (this.options.ticks.length - 1))
            if (index > 0) {
                index--
                this._setPos(index / (this.options.ticks.length - 1))

                return true
            }
        }
        else if (this.options.snapMode === 1) {
            index = this.options.ticks.findIndex(function (tick) {
                return tick.value === this._curVal
            }, this)

            if (index < 0) {
                index = 0
            }

            if (index > 0) {
                index--
                this._setPos(this._valToPos(this.options.ticks[index].value))

                return true
            }
        }
        else {
            let oldPos = this._getPos()
            let newPos = oldPos - Math.max(this.options.increment, this.options.snapDistance + 0.01)
            newPos = this._bestPos(newPos)

            if (newPos !== oldPos) {
                this._setPos(newPos)

                return true
            }
        }

        return false
    },

    _makeLabels: function () {
        this._labels.empty()

        for (let i = 0; i < this.options.ticks.length; i++) {
            let tick = this.options.ticks[i]
            let span = $(`<span class="qui-slider-label">${tick.label}</span>`)
            this._labels.append(span)

            /* Determine the position */
            let pos
            if (this.options.equidistant) {
                pos = i / (this.options.ticks.length - 1)
            }
            else {
                pos = this._valToPos(tick.value)
            }

            span.css('left', `${(pos * 100 - 15)}%`)
        }
    },

    _setOption: function (key, value) {
        this._super(key, value)

        switch (key) {
            case 'ticks':
            case 'equidistant':
                this._updateTicks()
                break

            case 'readonly':
                this.element.toggleClass('readonly', value)
                break

            case 'disabled':
                this.element.toggleClass('disabled', value)
                if (value) {
                    this.element.removeAttr('tabIndex')
                }
                else {
                    this.element.attr('tabIndex', 0)
                }
                break
        }
    }

})
