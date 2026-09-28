
import $ from '$qui/lib/jquery.module.js'

import * as Theme       from '$qui/theme.js'
import * as ArrayUtils  from '$qui/utils/array.js'
import * as Colors      from '$qui/utils/colors.js'
import * as CSS         from '$qui/utils/css.js'
import {asap}           from '$qui/utils/misc.js'
import * as ObjectUtils from '$qui/utils/object.js'
import * as Window      from '$qui/window.js'

import Icon from './icon.js'


/**
 * @typedef {Object} qui.icons.MultiStateSpritesIcon.StateDetails
 * @property {Number} offsetX the X offset of the icon in the sprites image
 * @property {Number} offsetY the Y offset of the icon in the sprites image
 * @property {String} filter a CSS filter to apply to the icon
 */

/**
 * An icon with different settings for various states.
 *
 * Defined icon states are `normal`, `active`, `focused` and `selected`.
 *
 * @alias qui.icons.MultiStateSpritesIcon
 * @extends qui.icons.Icon
 */
class MultiStateSpritesIcon extends Icon {

    static KNOWN_STATES = ['normal', 'active', 'focused', 'selected']


    /**
     * @constructs
     * @param {String} url the URL of the image resource
     * @param {Number} bgWidth the total width of the image resource
     * @param {Number} bgHeight the total height of the image resource
     * @param {Number} [size] the size of the icon; defaults to `1`
     * @param {String} [unit] the CSS unit used for all dimension attributes; defaults to `"rem"`
     * @param {Object<String,qui.icons.MultiStateSpritesIcon.StateDetails>} [states] a mapping with icon states
     * @param {Number} [scale] icon scaling factor; defaults to `1`
     * @param {String} [decoration] icon decoration
     * @param {...*} args parent class parameters
     */
    constructor({
        url,
        bgWidth,
        bgHeight,
        size = 1,
        unit = 'rem',
        states = null,
        scale = 1,
        decoration = null,
        ...args
    }) {
        super({...args})

        this._url = url
        this._bgWidth = bgWidth
        this._bgHeight = bgHeight
        this._size = size
        this._unit = unit

        this._states = states
        this._scale = scale
        this._decoration = decoration
    }

    /**
     * Tell if the icon has a given state.
     * @param {String} state
     * @returns {Boolean}
     */
    hasState(state) {
        return state in this._states
    }

    toAttributes() {
        return Object.assign(super.toAttributes(), {
            url: this._url,
            bgWidth: this._bgWidth,
            bgHeight: this._bgHeight,
            size: this._size,
            unit: this._unit,
            states: this._states,
            scale: this._scale,
            decoration: this._decoration
        })
    }

    _prepareParams() {
        let m, u, v
        let size = this._size
        let bgWidth = String(this._bgWidth)
        let bgHeight = String(this._bgHeight)

        /* Perform required scaling transformations */
        if (this._scale !== 1) {
            size *= this._scale

            m = bgWidth.match(new RegExp('[^\\d]'))
            if (m) {
                u = bgWidth.substring(m.index)
                v = parseInt(bgWidth)
            }
            else {
                u = this._unit
                v = Number(bgWidth) || 0
            }
            bgWidth = v * this._scale + u

            m = bgHeight.match(new RegExp('[^\\d]'))
            if (m) {
                u = bgHeight.substring(m.index)
                v = parseInt(bgHeight)
            }
            else {
                u = this._unit
                v = Number(bgHeight) || 0
            }

            bgHeight = v * this._scale + u
        }

        return {
            size: size,
            bgWidth: bgWidth,
            bgHeight: bgHeight
        }
    }

    renderTo(element) {
        let params = this._prepareParams()

        let size = params.size
        let bgWidth = params.bgWidth
        let bgHeight = params.bgHeight

        let iconElement = element[0]

        /* Find and remove existing icon state elements */
        let existingStateElements = []
        for (let i = 0; i < iconElement.children.length; i++) {
            let child = iconElement.children[i]
            let isState = child.className.split(' ').some(function (c) {
                return c !== 'qui-icon-decoration' && c.startsWith('qui-icon-') && c.length > 'qui-icon-'.length
            })
            if (isState) {
                existingStateElements.push(child)
            }
        }

        if (iconElement.isConnected) {
            /* Only this branch fades the old elements out, and only it needs them as a jQuery object */
            let oldElements = $(existingStateElements)
            asap(function () {
                oldElements.addClass('qui-icon-hidden')
            })
            Theme.afterTransition(function () {
                oldElements.remove()
            }, oldElements)
        }
        else {
            existingStateElements.forEach(e => e.remove())
            existingStateElements = []
        }

        iconElement.classList.add('qui-icon')

        /* Add new icon state elements. Built with plain DOM calls because this runs for every icon on screen, and
         * jQuery's element, style and append helpers were about half of what renderTo cost on a 448-row list. */
        let newElements = []
        ObjectUtils.forEach(this._states, function (state, details) {

            let offsetX = details.offsetX
            let offsetY = details.offsetY

            /* Incomplete states don't get an element */
            if (offsetX == null || offsetY == null) {
                return
            }

            let stateDiv = document.createElement('div')
            stateDiv.className = `qui-icon-${state}`
            /* If no existing elements, display the new element directly, w/o any effect; otherwise start hidden and
             * do a transition to visible */
            if (existingStateElements.length) {
                stateDiv.classList.add('qui-icon-hidden')
            }

            let style = stateDiv.style
            style.backgroundImage = `url("${this._url}")`
            style.backgroundPosition = `${(-offsetX * size)}${this._unit} ${(-offsetY * size)}${this._unit}`
            if (bgWidth && bgHeight) {
                style.backgroundSize = `${bgWidth} ${bgHeight}`
            }

            if (details.filter) {
                style.filter = details.filter
            }

            iconElement.appendChild(stateDiv)
            newElements.push(stateDiv)

        }, this)

        if (existingStateElements.length) {
            asap(function () {
                newElements.forEach(e => e.classList.remove('qui-icon-hidden'))
            })
        }

        let topState = 'normal'
        this.constructor.KNOWN_STATES.forEach(function (state) {
            if (state in this._states) {
                topState = state
            }
        }, this)

        iconElement.classList.remove(...this.constructor.KNOWN_STATES.map(s => `top-${s}`))
        iconElement.classList.add(`top-${topState}`)

        /* Decoration */

        let decorationDiv = null
        for (let i = 0; i < iconElement.children.length; i++) {
            if (iconElement.children[i].classList.contains('qui-icon-decoration')) {
                decorationDiv = iconElement.children[i]
                break
            }
        }

        if (!decorationDiv && this._decoration) {
            decorationDiv = document.createElement('div')
            decorationDiv.className = 'qui-icon-decoration'
            iconElement.insertBefore(decorationDiv, iconElement.firstChild)
        }
        else if (decorationDiv && !this._decoration) {
            decorationDiv.remove()
            decorationDiv = null
        }

        if (decorationDiv) {
            decorationDiv.style.background = this._decoration

            let bgColor = this._findBgColor(element)
            let bgRGB = Colors.str2rgba(bgColor)
            let decoRGB = Colors.str2rgba(this._decoration)
            if (Colors.contrast(bgRGB, decoRGB) > 1.5) {
                decorationDiv.style.borderColor = bgColor
            }
            else {
                /* The colour this resolves to goes nowhere, which is what happened before this change too: the
                 * callback used to write into a style object that had already been applied. Fixed separately. */
                this._findIconColor(element)
            }
        }
    }

    _findBgColor(elem) {
        /* Find the background color behind the icon */

        /* Icons are usually rendered before their row is attached, and a detached element has no computed style, so
         * up such a chain css() only ever reports the inline one. Reading that directly skips a getComputedStyle call
         * per element, worth about 130 ms across a 448-row list. */
        let attached = elem.length > 0 && elem[0].isConnected

        let e = elem
        let bgColor = null
        while (e.length && e[0].tagName && (!bgColor || bgColor === 'rgba(0, 0, 0, 0)' ||
                                             bgColor === 'transparent')) {

            bgColor = attached ? e.css('background-color') : e[0].style.backgroundColor
            e = e.parent()
        }

        if (!e.length || !e[0].tagName) {
            /* Icon element not added yet to the DOM, or no element has a background color */
            bgColor = Theme.getVar('background-color')
        }

        return bgColor
    }

    _findIconColor(elem) {
        /* Find the dominant color of the icon, using a canvas element */

        return new Promise(function (resolve) {
            let params = this._prepareParams()

            let size = params.size
            let pxFactor = 1
            if (this._unit === 'em') {
                if (Window.$body.has(elem).length) {
                    pxFactor = CSS.em2px(1, elem)
                }
                else {
                    pxFactor = CSS.em2px(1)
                }
            }
            else if (this._unit === 'rem') {
                pxFactor = CSS.em2px(1)
            }

            let normalState = this._states['normal']
            let offsetX = 0
            let offsetY = 0
            if (normalState) {
                offsetX = normalState.offsetX || 0
                offsetY = normalState.offsetY || 0
            }

            offsetX *= size
            offsetY *= size

            let canvas = document.createElement('canvas')
            let context = canvas.getContext('2d')

            let width = size * pxFactor

            canvas.width = width
            canvas.height = width /* Yes, width */

            context.scale(this._scale, this._scale)
            context.translate(-offsetX * pxFactor, -offsetY * pxFactor)

            let img = new window.Image()
            img.onload = function () {

                context.drawImage(img, 0, 0)
                let snapshot = context.getImageData(0, 0, width, width)

                function getColor(x, y) {
                    let p = (y * width + x)
                    let r = snapshot.data[4 * p]
                    let g = snapshot.data[4 * p + 1]
                    let b = snapshot.data[4 * p + 2]

                    return Colors.rgba2str([r, g, b])
                }

                let bgColor = getColor(0, 0)
                let colorDict = {}

                for (let y = 0; y < width; y++) {
                    for (let x = 0; x < width; x++) {
                        let color = getColor(x, y)
                        if (color in colorDict) {
                            colorDict[color] += 1
                        }
                        else {
                            colorDict[color] = 0
                        }
                    }
                }

                let colorCounters = ArrayUtils.sortKey(Object.entries(colorDict), c => c[1], /* desc = */ true)
                while (colorCounters[0][0] === bgColor && colorCounters.length > 1) {
                    colorCounters.shift()
                }

                resolve(colorCounters[0][0])
            }

            img.src = this._url
        }.bind(this))
    }

}


export default MultiStateSpritesIcon
