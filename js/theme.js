/**
 * @namespace qui.theme
 */

import $      from '$qui/lib/jquery.module.js'
import Logger from '$qui/lib/logger.module.js'

import {gettext}         from '$qui/base/i18n.js'
import Signal            from '$qui/base/signal.js'
import Config            from '$qui/config.js'
import * as Colors       from '$qui/utils/colors.js'
import * as CSS          from '$qui/utils/css.js'
import {asap}            from '$qui/utils/misc.js'
import * as ObjectUtils  from '$qui/utils/object.js'
import * as PromiseUtils from '$qui/utils/promise.js'
import * as StringUtils  from '$qui/utils/string.js'
import * as Window       from '$qui/window.js'


const logger = Logger.get('qui.theme')

let currentTheme = null
let themeVars = null
let transitionDuration = null


/**
 * Emitted whenever the theme is changed. Handlers are called with the following parameters:
 *  * `theme`, the new theme: `String`
 * @alias qui.theme.changeSignal
 */
export const changeSignal = new Signal()


/**
 * Tell the current theme.
 * @alias qui.theme.getCurrent
 * @returns {String}
 */
export function getCurrent() {
    return currentTheme
}

/**
 * Change the theme.
 * @alias qui.theme.setCurrent
 * @param {String} theme
 * @returns {Promise} a promise that resolves as soon as the theme has been set
 */
export function setCurrent(theme) {
    if (currentTheme === theme) {
        return Promise.resolve()
    }

    currentTheme = theme

    logger.debug(`setting theme to ${theme}`)

    /* Fade out body during 500ms */
    Window.$body.css('opacity', '')

    function isLoaded() {
        return CSS.findRules('^br.-theme-name$').some(function (rule) {
            let parts = rule.declaration.split(':', 2)
            if (parts.length < 2) {
                return
            }

            let value = parts[1].split(';')[0].trim()
            value = value.replace(/"/g, '') /* Remove quotation marks */

            return value === theme
        })
    }

    function loadedOrLater() {
        if (isLoaded()) {
            return Promise.resolve()
        }
        else {
            return PromiseUtils.later(100).then(() => loadedOrLater())
        }
    }

    /* Allow 500ms for fading-out */
    return PromiseUtils.later(500).then(function () {

        /* Update disabled attribute of CSS link elements */
        $('link[theme]').each(function () {
            let $link = $(this)
            let linkTheme = $link.attr('theme')
            if (linkTheme === theme) {
                $link.removeAttr('disabled')
            }
            else {
                $link.attr('disabled', '')
            }
        })

        return loadedOrLater().then(function () {

            logger.debug(`theme set to ${theme}`)

            /* Invalidate theme vars */
            themeVars = null

            /* Finally, emit change signal */
            changeSignal.emit(theme)

            /* Fade in body, but allow another 500ms for section soft reload */
            setTimeout(function () {
                Window.$body.css('opacity', '1')
            }, 500)

        })

    })
}

/**
 * Return the available themes.
 * @alias qui.theme.getAvailable
 * @returns {Object<String,String>} a dictionary with theme names as keys and display names as values
 */
export function getAvailable() {
    return ObjectUtils.fromEntries(Config.themes.split(',').map(function (theme) {
        return [theme, gettext(StringUtils.title(theme))]
    }))
}

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
export function afterTransition(func, element = null) {
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
 * Create a promise that resolves after a timeout equal to a transition duration,
 * @alias qui.theme.afterTransitionPromise
 * @param {?jQuery} [element] an optional HTML element whose visibility will be tested; if element is not currently
 * visible, promise is resolved asap
 * @returns {Promise}
 */
export function afterTransitionPromise(element = null) {
    return new Promise(function (resolve, reject) {

        if (element && !element.is(':visible')) {
            resolve()
        }
        else {
            afterTransition(function () {
                resolve()
            }, element)
        }
    })
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


/**
 * Initialize the theme subsystem.
 * @alias qui.theme.init
 * @returns {Promise} a promise that is resolved when theme subsystem has been initialized
 */
export function init() {
    if (Config.defaultEffectsDisabled) {
        disableEffects()
    }
    else {
        enableEffects()
    }

    return setCurrent(Config.defaultTheme).then(function () {

        /* Now that the theme is loaded, we can fade in the body */
        Window.$body.removeClass('disable-transitions')
        asap(function () {
            Window.$body.css('opacity', '1')
        })

    })
}
