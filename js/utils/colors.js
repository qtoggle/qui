/**
 * Deals with color format conversions and color adjustments.
 *
 * Contains code taken from https://github.com/antimatter15/rgb-lab/
 * @namespace qui.utils.colors
 */

/* eslint-disable no-multi-spaces */


let cachedColorsRGBAByName = {}


/**
 * Convert a tuple of (*hue*, *saturation*, *value*) components into (*red*, *green*, *blue*) equivalent.
 *
 * *red*, *green* and *blue* range from `0` to `255`. *hue* ranges from `0` to `359`, while *saturation* and *value*
 * range from `0` to `1`.
 *
 * @alias qui.utils.colors.hsv2rgb
 * @param {Number[]} hsv a 3 elements array representing the *hue*, *saturation* and *value* components
 * @returns {Number[]} a 3 elements array representing the *red*, *green* and *blue* components
 */
export function hsv2rgb(hsv) {
    let h = hsv[0], s = hsv[1], v = hsv[2]
    let hi = Math.floor(h / 60.0) % 6
    let f = (h / 60.0) - Math.floor(h / 60.0)
    let p = v * (1.0 - s)
    let q = v * (1.0 - (f * s))
    let t = v * (1.0 - ((1.0 - f) * s))

    v *= 255
    t *= 255
    p *= 255
    q *= 255

    let rgb = [
        [v, t, p],
        [q, v, p],
        [p, v, t],
        [p, q, v],
        [t, p, v],
        [v, p, q]
    ][hi]

    return [Math.round(rgb[0]), Math.round(rgb[1]), Math.round(rgb[2])]
}

/**
 * Convert a tuple of (*red*, *green*, *blue*) components into (*hue*, *saturation*, *value*) equivalent.
 *
 * *red*, *green* and *blue* range from `0` to `255`. *hue* ranges from `0` to `359`, while *saturation* and *value*
 * range from `0` to `1`.
 *
 * @alias qui.utils.colors.rgb2hsv
 * @param {Number[]} rgb a 3 elements array representing the *red*, *green* and *blue* components
 * @returns {Number[]} a 3 elements array representing the *hue*, *saturation* and *value* components
 */
export function rgb2hsv(rgb) {
    let r = rgb[0] / 255
    let g = rgb[1] / 255
    let b = rgb[2] / 255

    let min = Math.min(r, g, b)
    let max = Math.max(r, g, b)
    let delta = max - min

    let h = 0
    let s = 0
    let v = max

    if (delta !== 0) {
        s = delta / max
        let dr = (((max - r) / 6) + (delta / 2)) / delta
        let dg = (((max - g) / 6) + (delta / 2)) / delta
        let db = (((max - b) / 6) + (delta / 2)) / delta

        if (r === max) {
            h = db - dg
        }
        else if (g === max) {
            h = (1 / 3) + dr - db
        }
        else if (b === max) {
            h = (2 / 3) + dg - dr
        }

        if (h < 0) {
            h += 1
        }
        if (h > 1) {
            h -= 1
        }
    }

    h = Math.round(h * 360)

    return [h, s, v]
}

/**
 * Convert a color string into (*red*, *green*, *blue*, *alpha*) equivalent.
 *
 * *red*, *green* and *blue* range from `0` to `255`, while *alpha* ranges from `0` to `1`. Accepted string color
 * formats are `rgb(r, g, b)`, `rgba(r, g, b, a)`, `#rrggbb` and an HTML color name.
 *
 * @alias qui.utils.colors.str2rgba
 * @param {String} strColor
 * @returns {Number[]} a 4 elements array representing the *red*, *green*, *blue* and *alpha* components
 */
export function str2rgba(strColor) {
    if (!strColor) {
        return [0, 0, 0, 1] /* Defaults to black */
    }

    let r = 0, g = 0, b = 0, a = 1
    let start, stop, parts

    if (strColor.startsWith('#')) {
        if (strColor.length === 4) {
            r = strColor.substr(1, 1)
            g = strColor.substr(2, 1)
            b = strColor.substr(3, 1)

            r = parseInt(r + r, 16)
            g = parseInt(g + g, 16)
            b = parseInt(b + b, 16)
        }
        else if (strColor.length === 7) {
            r = parseInt(strColor.substr(1, 2), 16)
            g = parseInt(strColor.substr(3, 2), 16)
            b = parseInt(strColor.substr(5, 2), 16)
        }
    }
    else if (strColor.startsWith('rgba')) {
        start = strColor.indexOf('(')
        stop = strColor.indexOf(')')

        if (start !== -1 && stop !== -1) {
            strColor = strColor.substring(start + 1, stop)
            parts = strColor.split(',')
            if (parts.length === 4) {
                r = parseInt(parts[0].trim())
                g = parseInt(parts[1].trim())
                b = parseInt(parts[2].trim())
                a = parseFloat(parts[3].trim())
            }
        }
    }
    else if (strColor.startsWith('rgb')) {
        start = strColor.indexOf('(')
        stop = strColor.indexOf(')')

        if (start !== -1 && stop !== -1) {
            strColor = strColor.substring(start + 1, stop)
            parts = strColor.split(',')
            if (parts.length === 3) {
                r = parseInt(parts[0].trim())
                g = parseInt(parts[1].trim())
                b = parseInt(parts[2].trim())
            }
        }
    }
    else { /* A color name */
        let colorRGBA = cachedColorsRGBAByName[strColor]
        if (colorRGBA) {
            return colorRGBA
        }

        let div = document.createElement('div')
        div.style.display = 'none'
        div.style.color = strColor
        document.body.appendChild(div)

        let style = window.getComputedStyle(div)
        let result = str2rgba(style.color)

        document.body.removeChild(div)

        cachedColorsRGBAByName[strColor] = result
        return result
    }

    return [r, g, b, a]
}

/**
 * Convert a tuple of (*red*, *green*, *blue*, *alpha*) components into color string equivalent.
 *
 * *red*, *green* and *blue* range from `0` to `255`, while *alpha* ranges from `0` to `1`. Returned string color format
 * is `rgba(r, g, b, a)` or `#rrggbb`, depending on the presence of the alpha factor.
 *
 * @alias qui.utils.colors.rgba2str
 * @param {Number[]} rgba a 4 elements array representing the *red*, *green*, *blue* and *alpha* components,
 * respectively
 * @returns {String}
 */
export function rgba2str(rgba) {
    function byte2hex(value) {
        value = parseInt(value).toString(16)
        if (value.length < 2) {
            value = `0${value}`
        }

        return value
    }

    if (rgba.length === 3 || (rgba.length === 4 && rgba[3] === 1)) {
        return `#${byte2hex(rgba[0])}${byte2hex(rgba[1])}${byte2hex(rgba[2])}`
    }
    else { /* Assuming the length is 4 */
        return `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, ${rgba[3]})`
    }
}

/**
 * Convert a tuple of (*lightness*, *a*, *b*) components into (*red*, *green*, *blue*) equivalent. The *lightness*, *a*
 * and *b* components are defined by the CIELAB color space.
 *
 * *red*, *green* and *blue* range from `0` to `255`. *lightness* ranges from `0` to `100`, while *a* and *b* range from
 * `-100` to `100`.
 *
 * @alias qui.utils.colors.lab2rgb
 * @param {Number[]} lab a 3 elements array representing the *lightness*, *a* and *b* components
 * @returns {Number[]} a 3 elements array representing the *red*, *green* and *blue* components
 */
export function lab2rgb(lab) {
    let y = (lab[0] + 16) / 116
    let x = lab[1] / 500 + y
    let z = y - lab[2] / 200
    let r, g, b

    x = 0.95047 * ((x * x * x > 0.008856) ? x * x * x : (x - 16 / 116) / 7.787)
    y = 1.00000 * ((y * y * y > 0.008856) ? y * y * y : (y - 16 / 116) / 7.787)
    z = 1.08883 * ((z * z * z > 0.008856) ? z * z * z : (z - 16 / 116) / 7.787)

    r = x *  3.2406 + y * -1.5372 + z * -0.4986
    g = x * -0.9689 + y *  1.8758 + z *  0.0415
    b = x *  0.0557 + y * -0.2040 + z *  1.0570

    r = (r > 0.0031308) ? (1.055 * Math.pow(r, 1 / 2.4) - 0.055) : 12.92 * r
    g = (g > 0.0031308) ? (1.055 * Math.pow(g, 1 / 2.4) - 0.055) : 12.92 * g
    b = (b > 0.0031308) ? (1.055 * Math.pow(b, 1 / 2.4) - 0.055) : 12.92 * b

    return [
        Math.max(0, Math.min(1, r)) * 255,
        Math.max(0, Math.min(1, g)) * 255,
        Math.max(0, Math.min(1, b)) * 255
    ]
}

/**
 * Convert a tuple of (*red*, *green*, *blue*) components into (*lightness*, *a*, *b*) equivalent. The *lightness*, *a*
 * and *b* components are defined by the CIELAB color space.
 *
 * *red*, *green* and *blue* range from `0` to `255`. *lightness* ranges from `0` to `100`, while *a* and *b* range from
 * `-100` to `100`.
 *
 * @alias qui.utils.colors.rgb2lab
 * @param {Number[]} rgb a 3 elements array representing the *red*, *green* and *blue* components
 * @returns {Number[]} lab a 3 elements array representing the *lightness*, *a* and *b* components
 */
export function rgb2lab(rgb) {
    let r = rgb[0] / 255
    let g = rgb[1] / 255
    let b = rgb[2] / 255
    let x, y, z

    r = (r > 0.04045) ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92
    g = (g > 0.04045) ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92
    b = (b > 0.04045) ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92

    x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047
    y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000
    z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883

    x = (x > 0.008856) ? Math.pow(x, 1 / 3) : (7.787 * x) + 16 / 116
    y = (y > 0.008856) ? Math.pow(y, 1 / 3) : (7.787 * y) + 16 / 116
    z = (z > 0.008856) ? Math.pow(z, 1 / 3) : (7.787 * z) + 16 / 116

    return [(116 * y) - 16, 500 * (x - y), 200 * (y - z)]
}

/**
 * Compute the luminance of a color, as defined by https://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef.
 *
 * *red*, *green* and *blue* range from `0` to `255`. *luminance* ranges from `0` to `1`.
 *
 * @alias qui.utils.colors.luminance
 * @param {Number[]} rgb a 3 elements array representing the *red*, *green* and *blue* components
 * @returns {Number}
 */
export function luminance(rgb) {
    let a = rgb.map(function (v) {
        v /= 255

        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
    })

    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722
}

/**
 * Compute the contrast ratio between two colors, as defined by
 * https://www.w3.org/TR/2008/REC-WCAG20-20081211/#contrast-ratiodef.
 *
 * *red*, *green* and *blue* range from `0` to `255`. *contrast* ranges from `1` to `21`.
 *
 * @alias qui.utils.colors.contrast
 * @param {Number[]} rgb1 a 3 elements array representing the *red*, *green* and *blue* components of the first color
 * @param {Number[]} rgb2 a 3 elements array representing the *red*, *green* and *blue* components of the second color
 * @returns {Number}
 */
export function contrast(rgb1, rgb2) {
    let c = (luminance(rgb1) + 0.05) / (luminance(rgb2) + 0.05)
    if (c < 1) {
        c = 1 / c
    }

    return c
}

/**
 * Compute the distance between two colors, as defined by the *deltaE* CIE94 specification.
 *
 * *lightness* ranges from `0` to `100`, while *a* and *b* range from `-100` to `100`. *deltaE* ranges from `0` to
 * `255`.
 *
 * @alias qui.utils.colors.deltaE
 * @param {Number[]} lab1 a 3 elements array representing the *lightness*, *a* and *b* components of the first color
 * @param {Number[]} lab2 a 3 elements array representing the *lightness*, *a* and *b* components of the second color
 * @returns {Number}
 */
export function deltaE(lab1, lab2) {
    /* CIE94 implementation */
    let deltaL = lab1[0] - lab2[0]
    let deltaA = lab1[1] - lab2[1]
    let deltaB = lab1[2] - lab2[2]
    let c1 = Math.sqrt(lab1[1] * lab1[1] + lab1[2] * lab1[2])
    let c2 = Math.sqrt(lab2[1] * lab2[1] + lab2[2] * lab2[2])
    let deltaC = c1 - c2
    let deltaH = deltaA * deltaA + deltaB * deltaB - deltaC * deltaC
    deltaH = deltaH < 0 ? 0 : Math.sqrt(deltaH)
    let sc = 1.0 + 0.045 * c1
    let sh = 1.0 + 0.015 * c1
    let deltaLklsl = deltaL / (1.0)
    let deltaCkcsc = deltaC / (sc)
    let deltaHkhsh = deltaH / (sh)
    let i = deltaLklsl * deltaLklsl + deltaCkcsc * deltaCkcsc + deltaHkhsh * deltaHkhsh

    return i < 0 ? 0 : Math.min(Math.sqrt(i), 255)
}

/**
 * Return a darker variant of a given color.
 *
 * Accepted string color formats are `rgb(r, g, b)`, `rgba(r, g, b, a)`, `#rrggbb` and an HTML color name.
 *
 * @alias qui.utils.colors.darker
 * @param {String} strColor
 * @param {Number} amount the fraction used to alter the value component (from `0` to `1`)
 * @returns {String}
 */
export function darker(strColor, amount) {
    let rgba = str2rgba(strColor)
    let alpha = rgba[3]
    let hsv = rgb2hsv(rgba.slice(0, 3))
    hsv[2] /= amount

    rgba = hsv2rgb(hsv)
    rgba.push(alpha)

    return rgba2str(rgba)
}

/**
 * Return a lighter variant of a given color.
 *
 * Accepted string color formats are `rgb(r, g, b)`, `rgba(r, g, b, a)`, `#rrggbb` and an HTML color name.
 *
 * @alias qui.utils.colors.lighter
 * @param {String} strColor
 * @param {Number} amount the fraction used to alter the value component (from `0` to `1`)
 * @returns {String}
 */
export function lighter(strColor, amount) {
    return darker(strColor, 1 / amount)
}

/**
 * Alter the alpha factor of a color.
 *
 * Accepted string color formats are `rgb(r, g, b)`, `rgba(r, g, b, a)`, `#rrggbb` and an HTML color name.
 *
 * @alias qui.utils.colors.alpha
 * @param {String} strColor
 * @param {Number} factor the alpha factor (from `0` to `1`)
 * @returns {String}
 */
export function alpha(strColor, factor) {
    let rgba = str2rgba(strColor)
    rgba[3] = factor

    return rgba2str(rgba)
}

/**
 * Mix two colors.
 *
 * Accepted string color formats are `rgb(r, g, b)`, `rgba(r, g, b, a)`, `#rrggbb` and an HTML color name.
 *
 * @alias qui.utils.colors.mix
 * @param {String} strColor1
 * @param {String} strColor2
 * @param {Number} factor the ratio by which the two input colors contribute to the output color; `0` results in 100% of
 * `strColor1` and `1` results in 100% of `strColor2`
 * @returns {String}
 */
export function mix(strColor1, strColor2, factor) {
    let rgba1 = str2rgba(strColor1)
    let rgba2 = str2rgba(strColor2)

    let r = rgba1[0] * (1 - factor) + rgba2[0] * factor
    let g = rgba1[1] * (1 - factor) + rgba2[1] * factor
    let b = rgba1[2] * (1 - factor) + rgba2[2] * factor
    let a = rgba1[3] * (1 - factor) + rgba2[3] * factor

    return rgba2str([r, g, b, a])
}

/**
 * Normalize a color by converting it to the most appropriate string format.
 *
 * Accepted string color formats are `rgb(r, g, b)`, `rgba(r, g, b, a)`, `#rrggbb` and an HTML color name.
 *
 * Colors with alpha factor are represented as `rgba(r, g, b, a)`, while those without alpha factor are represented as
 * `#rrggbb`.
 *
 * @alias qui.utils.colors.normalize
 * @param {String} strColor
 * @returns {String}
 */
export function normalize(strColor) {
    return rgba2str(str2rgba(strColor))
}
