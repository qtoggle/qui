
import $ from '$qui/lib/jquery.module.js'

import * as Theme       from '$qui/theme.js'
import * as Colors      from '$qui/utils/colors.js'
import * as CSS         from '$qui/utils/css.js'
import * as StringUtils from '$qui/utils/string.js'


$.widget('qui.progressdisc', {

    options: {
        radius: '1em',
        caption: '%s%%',
        color: '@interactive-color',
        disabled: false
    },

    _create: function () {
        let ns = 'http://www.w3.org/2000/svg'

        /* Root svg element */
        this._svg = document.createElementNS(ns, 'svg')

        /* Ring */
        this._ring = document.createElementNS(ns, 'ellipse')
        this._ring.setAttribute('class', 'qui-progress-disc-ring')
        this._svg.appendChild(this._ring)

        /* Cursor */
        this._cursor = document.createElementNS(ns, 'path')
        this._cursor.setAttribute('class', 'qui-progress-disc-cursor')
        this._svg.appendChild(this._cursor)

        /* Label */
        this._label = $('<div class="qui-progress-disc-label"></div>')

        this._curVal = 0
        this._setValue(this._curVal)

        this.element.addClass('qui-progress-disc-container')

        if (this.options.disabled) {
            this.element.addClass('disabled')
        }

        this.element.append(this._svg)
        this.element.append(this._label)
    },

    getValue: function () {
        return this._curVal
    },

    setValue: function (value) {
        this._setValue(this._validate(value))
    },

    _setValue: function (value) {
        this._curVal = value

        if (value != null && value >= 0) {
            this._label.html(StringUtils.formatPercent(this.options.caption, value.toFixed(0)))
            this.element.removeClass('no-value')
        }
        else {
            this._curVal = -1
            this._label.html('')
            this.element.addClass('no-value')
        }

        this._updateSVG()
    },

    _validate: function (value) {
        value = parseFloat(value)
        if (isNaN(value)) {
            return -1
        }

        value = Math.max(-1, value)
        value = Math.min(100, value)

        return value
    },

    _makeArcPath: function (x, y, startAngle, endAngle, radius) {
        let aFlag = '0'
        if (endAngle - startAngle >= 180) {
            aFlag = '1'
        }
        if (endAngle >= 360) {
            endAngle = 359.9999
        }

        let x1 = x + radius * Math.cos(Math.PI * startAngle / 180)
        let y1 = y + radius * Math.sin(Math.PI * startAngle / 180)
        let x2 = x + radius * Math.cos(Math.PI * endAngle / 180)
        let y2 = y + radius * Math.sin(Math.PI * endAngle / 180)
        return (`M ${x1} ${y1} A ${radius} ${radius} 0 ${aFlag} 1 ${x2} ${y2}`)
    },

    _updateSVG: function () {
        let isSmall = parseFloat(this.options.radius) < 2
        let thickness = parseFloat(this.options.radius) / 4

        this._label.toggleClass('small', isSmall)

        let width = CSS.mulValue(this.options.radius, 2)
        let fWidth = parseFloat(width)
        let oRadius = parseFloat(this.options.radius)
        let iRadius = oRadius - thickness / 2
        let color = Theme.getColor(this.options.color)

        this.element.width(width)
        this.element.height(width)
        this.element.css('line-height', width)

        this._svg.setAttribute('width', width)
        this._svg.setAttribute('height', width)
        this._svg.setAttribute('viewBox', `0 0 ${fWidth} ${fWidth}`)

        this._ring.setAttribute('cx', oRadius.toString())
        this._ring.setAttribute('cy', oRadius.toString())
        this._ring.setAttribute('rx', iRadius.toString())
        this._ring.setAttribute('ry', iRadius.toString())
        this._ring.setAttribute('stroke-width', thickness.toString())
        this._ring.setAttribute('stroke', color)

        this._cursor.setAttribute('stroke-width', thickness.toString())
        this._cursor.setAttribute('stroke', color)

        if (this._curVal >= 0) {
            this._updateSVGPercent(iRadius, oRadius)
        }
        else {
            this._updateSVGLoader(iRadius, oRadius)
        }
    },

    _updateSVGPercent: function (iRadius, oRadius) {
        let angle = 360 * this._curVal / 100
        let path = this._makeArcPath(oRadius, oRadius, 0, angle, iRadius)

        this._cursor.setAttribute('d', path)
    },

    _updateSVGLoader: function (iRadius, oRadius) {
        let path = this._makeArcPath(oRadius, oRadius, -90, 0, iRadius)

        this._cursor.setAttribute('d', path)
    },

    _setOption: function (key, value) {
        this._super(key, value)

        switch (key) {
            case 'radius':
            case 'color':
                this._updateSVG()
                break

            case 'disabled':
                this.element.toggleClass('disabled', value)
                break

            case 'caption':
                this._setValue(this._curVal)
                break
        }
    }

})
