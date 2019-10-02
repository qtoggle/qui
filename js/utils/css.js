/**
 * @namespace qui.utils.css
 */

import $ from '$qui/lib/jquery.module.js'

import * as Window from '$qui/window.js'


const CSS_VALUE_RE = new RegExp('([\\d.]+)(.*)')

let customStyleElement = null


function getCustomStyleElement() {
    if (!customStyleElement) {
        customStyleElement = createStyleElement()
    }

    return customStyleElement
}


/**
 * Create an empty style element and add it to document head.
 * @alias qui.utils.css.createStyleElement
 * @returns {HTMLStyleElement}
 */
export function createStyleElement() {
    let style = document.createElement('style')
    style.type = 'text/css'
    style.appendChild(document.createTextNode('')) /* Webkit hack */

    let head = document.getElementsByTagName('head')[0]
    head.appendChild(style)

    return style
}

/**
 * Return the link element from the DOM corresponding to a given CSS file.
 * @alias qui.utils.css.getStyleLinkElement
 * @param {String} filename
 * @returns {?HTMLLinkElement}
 */
export function getStyleLinkElement(filename) {
    let links = [...document.getElementsByTagName('link')]
    return links.find(l => l.href.endsWith(filename)) || null
}

/**
 * Create and add a style rule.
 * @alias qui.utils.css.addRule
 * @param {String} selector a CSS selector (e.g. `"div.my-class > div.my-sub-class"`)
 * @param {CSSStyleDeclaration|String} style style declaration (e.g. `"{ text-align: left; padding: 5px; }"`)
 * @param {HTMLStyleElement} [styleElement] an optional style element to add the rule to; by default, rules are added to
 * a common custom style element
 */
export function addRule(selector, style, styleElement = null) {
    if (style instanceof window.CSSStyleDeclaration) {
        style = style.cssText
    }

    styleElement = styleElement || getCustomStyleElement()
    styleElement.sheet.insertRule(`${selector} { ${style} }`, styleElement.sheet.cssRules.length)
}

/**
 * Delete a style rule that matches a given selector.
 * @alias qui.utils.css.delRule
 * @param {String} selector a CSS selector (e.g. `"div.my-class > div.my-sub-class"`)
 * @param {HTMLStyleElement} [styleElement] an optional style element to restrict the search to
 */
export function delRule(selector, styleElement = null) {
    let styleElements

    if (styleElement) {
        styleElements = [styleElement]
    }
    else {
        /* Look through all existing style elements */
        styleElements = [...document.getElementsByTagName('style')]
    }

    styleElements.forEach(function (styleElement) {
        for (let i = 0; i < styleElement.sheet.cssRules.length; i++) {
            let rule = styleElement.sheet.cssRules[i]
            if (rule.selectorText === selector) {
                styleElement.sheet.deleteRule(i--)
            }
        }
    })
}

/**
 * Find all style rules that match a selector regular expression.
 * @alias qui.utils.css.findRules
 * @param {String|RegExp} selectorRe
 * @returns {Object[]} a list of objects with `selector` and `declaration`
 */
export function findRules(selectorRe) {
    if (!(selectorRe instanceof RegExp)) {
        selectorRe = new RegExp(selectorRe)
    }

    let matchedRules = []
    let styleSheets = [...document.styleSheets]
    styleSheets.forEach(function (sheet) {
        let rules = [...sheet.cssRules]
        let mRules = rules.filter(r => r.selectorText && r.selectorText.match(selectorRe)).map(function (rule) {
            return {
                selector: rule.selectorText,
                declaration: rule.cssText.substring(rule.selectorText.length).trim()
            }
        })

        matchedRules = matchedRules.concat(mRules)
    })

    return matchedRules
}

/**
 * Perform an add operation on a CSS value with unit, preserving the unit.
 * @alias qui.utils.css.addValue
 * @param {String} value the CSS value (e.g. `"15px"`)
 * @param {Number|String} operand the number to add
 * @returns {String}
 */
export function addValue(value, operand) {
    let parts = value.toString().match(CSS_VALUE_RE)
    if (!parts) {
        return value
    }

    return parseFloat(parts[1]) + parseFloat(operand) + parts[2]
}

/**
 * Perform a subtract operation on a CSS value with unit, preserving the unit.
 * @alias qui.utils.css.subValue
 * @param {String} value the CSS value (e.g. `"15px"`)
 * @param {Number|String} operand the number to subtract
 * @returns {String}
 */
export function subValue(value, operand) {
    let parts = value.toString().match(CSS_VALUE_RE)
    if (!parts) {
        return value
    }

    return parseFloat(parts[1]) - parseFloat(operand) + parts[2]
}

/**
 * Perform a multiply operation on a CSS value with unit, preserving the unit.
 * @alias qui.utils.css.mulValue
 * @param {String} value the CSS value (e.g. `"15px"`)
 * @param {Number|String} operand the number to multiply by
 * @returns {String}
 */
export function mulValue(value, operand) {
    let parts = value.toString().match(CSS_VALUE_RE)
    if (!parts) {
        return value
    }

    return parseFloat(parts[1]) * parseFloat(operand) + parts[2]
}

/**
 * Perform a divide operation on a CSS value with unit, preserving the unit.
 * @alias qui.utils.css.divValue
 * @param {String} value the CSS value (e.g. `"15px"`)
 * @param {Number|String} operand the number to divide by
 * @returns {String}
 */
export function divValue(value, operand) {
    let parts = value.toString().match(CSS_VALUE_RE)
    if (!parts) {
        return value
    }

    return parseFloat(parts[1]) / parseFloat(operand) + parts[2]
}

/**
 * Convert *em* units to pixel units.
 * @alias qui.utils.css.em2px
 * @param {Number} em
 * @param {jQuery} [elem] optional HTML element; document's body is used by default
 * @returns {Number}
 */
export function em2px(em, elem = Window.$body) {
    let dummyDiv = $('<div style="width: 1em"></div>')
    elem.append(dummyDiv)

    let width = dummyDiv.width() * em
    dummyDiv.remove()

    return width
}

/**
 * Convert pixel units to *em* units.
 * @alias qui.utils.css.px2em
 * @param {Number} px
 * @param {jQuery} [elem] optional HTML element; document's body is used by default
 * @returns {Number}
 */
export function px2em(px, elem = Window.$body) {
    let dummyDiv = $('<div style="width: 1em"></div>')
    elem.append(dummyDiv)

    let width = px / dummyDiv.width()
    dummyDiv.remove()

    return width
}
