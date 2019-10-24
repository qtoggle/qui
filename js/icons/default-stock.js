/**
 * A default icon stock.
 *
 * Defined names are:
 *  * `"plus"`
 *  * `"minus"`
 *  * `"close"`
 *  * `"fat-arrow"`
 *  * `"slim-arrow"`
 *  * `"info"`
 *  * `"qmark"`
 *  * `"exclam"`
 *  * `"check"`
 *  * `"wrench"`
 *  * `"sliders"`
 *  * `"key"`
 *  * `"user"`
 *  * `"sync"`
 *  * `"magnifier"`
 *  * `"full-screen"`
 *  * `"duplicate"`
 *  * `"envelope"`
 *  * `"gear"`
 *  * `"menu"`
 *  * `"options"`
 *
 * Defined variants are:
 *  * `"darkgray"`
 *  * `"gray"`
 *  * `"lightgray"`
 *  * `"white"`
 *  * `"blue"`
 *  * `"magenta"`
 *  * `"red"`
 *  * `"orange"`
 *  * `"yellow"`
 *  * `"green"`
 *  * `"cyan"`
 *  * `"background"`
 *  * `"foreground"`
 *  * `"disabled"`
 *  * `"interactive"`
 *  * `"highlight"`
 *  * `"danger"`
 *  * `"info"`
 *  * `"warning"`
 *  * `"error"`
 *
 * Defined variant aliases are:
 *  * `"interactive-active" = "interactive brightness(80%)"`
 *  * `"highlight-active" = "highlight brightness(80%)"`
 *  * `"danger-active" = "danger brightness(80%)"`
 *  * `"warning-active" = "warning brightness(80%)"`
 *  * `"error-active" = "error brightness(80%)"`
 *
 * @namespace qui.icons.defaultstock
 */

/* eslint-disable quote-props */

import Config     from '$qui/config.js'
import * as Theme from '$qui/theme.js'

import Stock       from './stock.js'
import * as Stocks from './stocks.js'


/**
 * Default stock name, `"qui"`.
 * @alias qui.icons.defaultstock.NAME
 */
export const NAME = 'qui'


function getQUIStockNameXOffset(name) {
    let xOffset = Theme.getVar(`${name}-icon-x-offset`)
    if (xOffset) {
        return Math.abs(parseFloat(xOffset) / 2)
    }

    return null
}

function getQUIStockVariantYOffset(variant) {
    let yOffset = Theme.getVar(`${variant}-icon-y-offset`)
    if (yOffset) {
        return Math.abs(parseFloat(yOffset) / 2)
    }

    return null
}


/**
 * Return the default icon stock.
 * @alias qui.icons.defaultstock.get
 * @returns {qui.icons.Stock}
 */
export function get() {
    return Stocks.get(NAME)
}


Stocks.register(NAME, function () {
    return new Stock({
        src: `${Config.quiStaticURL}/img/qui-icons.svg`,
        unit: 'rem',
        size: 2,
        width: 80,
        height: 32,
        names: {
            'plus': getQUIStockNameXOffset('plus'),
            'minus': getQUIStockNameXOffset('minus'),
            'close': getQUIStockNameXOffset('close'),
            'fat-arrow': getQUIStockNameXOffset('fat-arrow'),
            'slim-arrow': getQUIStockNameXOffset('slim-arrow'),
            'info': getQUIStockNameXOffset('info'),
            'qmark': getQUIStockNameXOffset('qmark'),
            'exclam': getQUIStockNameXOffset('exclam'),
            'check': getQUIStockNameXOffset('check'),
            'wrench': getQUIStockNameXOffset('wrench'),
            'sliders': getQUIStockNameXOffset('sliders'),
            'key': getQUIStockNameXOffset('key'),
            'user': getQUIStockNameXOffset('user'),
            'sync': getQUIStockNameXOffset('sync'),
            'magnifier': getQUIStockNameXOffset('magnifier'),
            'full-screen': getQUIStockNameXOffset('full-screen'),
            'duplicate': getQUIStockNameXOffset('duplicate'),
            'envelope': getQUIStockNameXOffset('envelope'),
            'gear': getQUIStockNameXOffset('gear'),
            'menu': getQUIStockNameXOffset('menu'),
            'options': getQUIStockNameXOffset('options')
        },
        variants: {
            'darkgray': getQUIStockVariantYOffset('darkgray'),
            'gray': getQUIStockVariantYOffset('gray'),
            'lightgray': getQUIStockVariantYOffset('lightgray'),
            'white': getQUIStockVariantYOffset('white'),
            'blue': getQUIStockVariantYOffset('blue'),
            'magenta': getQUIStockVariantYOffset('magenta'),
            'red': getQUIStockVariantYOffset('red'),
            'orange': getQUIStockVariantYOffset('orange'),
            'yellow': getQUIStockVariantYOffset('yellow'),
            'green': getQUIStockVariantYOffset('green'),
            'cyan': getQUIStockVariantYOffset('cyan'),

            'background': getQUIStockVariantYOffset('background'),
            'foreground': getQUIStockVariantYOffset('foreground'),
            'disabled': getQUIStockVariantYOffset('disabled'),
            'interactive': getQUIStockVariantYOffset('interactive'),
            'highlight': getQUIStockVariantYOffset('highlight'),
            'danger': getQUIStockVariantYOffset('danger'),
            'info': getQUIStockVariantYOffset('info'),
            'warning': getQUIStockVariantYOffset('warning'),
            'error': getQUIStockVariantYOffset('error')
        },
        variantAliases: {
            'interactive-active': 'interactive brightness(80%)',
            'highlight-active': 'highlight brightness(80%)',
            'danger-active': 'danger brightness(80%)',
            'warning-active': 'warning brightness(80%)',
            'error-active': 'error brightness(80%)'
        }
    })
})
