
import $ from '$qui/lib/jquery.module.js'

import * as Gestures    from '$qui/utils/gestures.js'
import * as StringUtils from '$qui/utils/string.js'


const TEMPORARY_SHOW_VALUE_TIMEOUT = 500 /* Seconds */


$.widget('qui.slider', {

    options: {
        value: 0,
        ticks: [{label: 0, value: 0}, {label: 50, value: 50}, {label: 100, value: 100}],
        ticksStep: 1,
        continuousChange: true,
        equidistant: false,
        fastFactor: 5,
        caption: '%s',
        readonly: false,
        disabled: false
    },

    _create: function () {
        /* Create the widget elements */

        this.element.addClass('qui-slider')
        if (this.options.readonly) {
            this.element.addClass('readonly')
        }
        if (this.options.disabled) {
            this.element.addClass('disabled')
        }
        else {
            this.element.attr('tabIndex', 0) /* Make the container focusable */
        }

        this._labels = $('<div></div>', {class: 'qui-slider-labels'})
        this.element.append(this._labels)

        this._barContainer = $('<div></div>', {class: 'qui-slider-bar-container'})
        this.element.append(this._barContainer)

        this._bar = $('<div></div>', {class: 'qui-slider-bar'})
        this._barContainer.append(this._bar)

        this._cursor = $('<div></div>', {class: 'qui-slider-cursor qui-base-button'})
        this._bar.append(this._cursor)

        this._cursorLabel = $('<span></span>', {class: 'qui-slider-label qui-slider-cursor-label'})
        this._labels.append(this._cursorLabel)

        this._temporaryShowValueHandle = null
        this._isDragged = false

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
                widget.element.addClass('active')
                widget._isDragged = true
            },
            /* onEnd = */ function () {
                if (!widget.options.continuousChange && !widget.options.readonly) {
                    widget.element.trigger('change', widget._curVal)
                }
                widget.element.removeClass('active')
                widget._isDragged = false
            }
        )

        this.element.on('mousewheel', function (e, delta) {
            if (widget.options.readonly || widget.options.disabled) {
                return
            }

            /* Ignore scroll events on unfocused widget */
            if (!widget.element.is(':focus')) {
                return
            }

            let changed
            if (delta > 0) {
                changed = widget._increase()
            }
            else {
                changed = widget._decrease()
            }

            if (changed) {
                widget._temporarilyShowValue()
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
                        widget._temporarilyShowValue()
                        widget.element.trigger('change', widget._curVal)
                        return false
                    }

                    break

                case 40: /* Down */
                case 39: /* Right */
                    if (widget._increase()) {
                        widget._temporarilyShowValue()
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
                        widget._temporarilyShowValue()
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
                        widget._temporarilyShowValue()
                        widget.element.trigger('change', widget._curVal)
                        return false
                    }

                    break

                case 36: /* Home */
                    while (widget._decrease()) {
                        changed = true
                    }
                    if (changed) {
                        widget._temporarilyShowValue()
                        widget.element.trigger('change', widget._curVal)
                        return false
                    }

                    break

                case 35: /* End */
                    while (widget._increase()) {
                        changed = true
                    }
                    if (changed) {
                        widget._temporarilyShowValue()
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

        this._labels.toggleClass('all-ticks-visible', this.options.ticksStep === 1)
    },

    _getWidth: function () {
        return this._bar.width() || 100
    },

    _getPos: function () {
        return this._cursor.position().left / this._getWidth()
    },

    _setPos: function (pos) {
        pos = Math.max(0, Math.min(1, pos))
        let val = this._posToVal(pos)

        /* Find matching tick */
        let tick = this.options.ticks.find(t => t.value === val)
        if (!tick) {
            return
        }

        /* Update cursor caption */
        this._cursorLabel.html(tick.label)

        /* Update cursor position */
        this._cursor.css('left', `${(pos * 100)}%`)
        this._cursorLabel.css('left', `${(pos * 100 - 15)}%`)
        this._curVal = val


        /* Hide overlapped tick labels */
        let cursorLabelLeft = parseInt(this._cursorLabel[0].style.left) /* Percent */

        /* Cursor overlaps neighbors only if not all ticks are visible */
        let overlapWidth = this.options.ticksStep === 1 ? 0 : 15 /* Percent */

        this._labels.children('span.qui-slider-label:NOT(.qui-slider-cursor-label)').each(function () {
            let labelElement = $(this)
            let labelLeft = parseInt(this.style.left) /* Percent */

            let overlapped = (cursorLabelLeft <= labelLeft + overlapWidth) &&
                             (cursorLabelLeft + overlapWidth >= labelLeft)
            let completelyOverlapped = Math.abs(cursorLabelLeft - labelLeft) / Math.abs(cursorLabelLeft) < 0.01
            labelElement.toggleClass('overlapped', overlapped)
            labelElement.toggleClass('completely-overlapped', completelyOverlapped)
        })
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

        let minDif = Infinity
        let bp = null
        for (let i = 0; i < this.options.ticks.length; i++) {
            let tick = this.options.ticks[i]
            let p = this._valToPos(tick.value)
            let dif = Math.abs(p - pos)
            if (dif < minDif) {
                minDif = dif
                bp = p
            }
        }

        if (bp != null) {
            pos = bp
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
        else {
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
        else {
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

        return false
    },

    _makeLabels: function () {
        this._labels.children('span.qui-slider-label:NOT(.qui-slider-cursor-label)').remove()

        for (let i = 0; i < this.options.ticks.length; i += this.options.ticksStep) {
            let tick = this.options.ticks[i]
            let span = $('<span></span>', {class: 'qui-slider-label'})
            span.text(tick.label)
            this._cursorLabel.before(span)

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

    _temporarilyShowValue: function () {
        if (this._temporaryShowValueHandle != null) {
            clearTimeout(this._temporaryShowValueHandle)
        }

        this.element.addClass('active')

        this._temporaryShowValueHandle = setTimeout(function () {
            if (!this._isDragged) {
                this.element.removeClass('active')
            }
        }.bind(this), TEMPORARY_SHOW_VALUE_TIMEOUT)
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
