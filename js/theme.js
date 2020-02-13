/**
 * @namespace qui.theme
 */

import * as Colors from '$qui/utils/colors.js'
import * as CSS    from '$qui/utils/css.js'
import {asap}      from '$qui/utils/misc.js'
import * as Window from '$qui/window.js'


let themeVars = null
let transitionDuration = null


/**
 * Return the value of a theme variable.
 * @alias qui.theme.getVar
 * @param {String} name the variable name
 * @param {String} [def] a default value if the variable is not found or not set
 * @returns {String}
 */
export function getVar(name, def) {
    if (!themeVars) {
        themeVars = {}
        CSS.findRules('^br.-theme-').forEach(function (rule) {
            let name = rule.selector.substring(10)
            let parts = rule.declaration.split(':', 2)
            if (parts.length < 2) {
                return
            }

            themeVars[name] = parts[1].split(';')[0].trim()
        })
    }

    return themeVars[name] || def
}

/**
 * Resolve a color name and normalize it using {@link qui.utils.colors.normalize}.
 *
 * A color name can be an HTML color (e.g. `teal`) or a color theme variable name starting with an `@` (e.g.
 * `@background-color`).
 *
 * If a color is given, it will be normalized and returned right away. If the given color name cannot be resolved, the
 * `@foreground-color` is returned.
 *
 * @alias qui.theme.getColor
 * @param {String} color a color or a color name
 * @returns {String}
 */
export function getColor(color) {
    if (color.startsWith('@')) {
        color = getVar(color.substring(1))
    }

    if (!color) {
        color = getVar('foreground-color')
    }

    return Colors.normalize(color)
}

/**
 * Return the default transition duration, in milliseconds.
 * @alias qui.theme.getTransitionDuration
 * @returns {Number}
 */
export function getTransitionDuration() {
    if (transitionDuration == null) {
        transitionDuration = parseFloat(getVar('transition-duration')) * 1000
    }

    return transitionDuration
}

/**
 * Call a function after a timeout equal to a transition duration,
 * @alias qui.theme.afterTransition
 * @param {Function} func function to run
 * @param {?jQuery} [element] an optional HTML element whose visibility will be tested; if element is not currently
 * visible, `func` will be called asap; if supplied, will be used as `this` argument for `func`
 * @returns {Number} a timeout handle
 */
export function afterTransition(func, element) {
    let thisArg = element || window

    if (element && !element.is(':visible')) {
        return asap(function () {
            func.call(thisArg)
        })
    }

    return setTimeout(function () {
        func.call(thisArg)
    }, getTransitionDuration())
}

/**
 * Enable transitions, animations, blur filters and other effects. Use this function to re-enable effects disabled by
 * {@link qui.theme.disableEffects}.
 * @alias qui.theme.enableEffects
 */
export function enableEffects() {
    Window.$body.removeClass('effects-disabled')
}

/**
 * Disable transitions, animations, blur filters and other effects. Use {@link qui.theme.enableEffects} to re-enable
 * effects.
 * @alias qui.theme.disableEffects
 */
export function disableEffects() {
    Window.$body.addClass('effects-disabled')
}
