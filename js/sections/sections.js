/**
 * @namespace qui.sections
 */

import $      from '$qui/lib/jquery.module.js'
import Logger from '$qui/lib/logger.module.js'

import {AssertionError} from '$qui/base/errors.js'
import StockIcon        from '$qui/icons/stock-icon.js'
import * as OptionsBar  from '$qui/main-ui/options-bar.js'
import * as Navigation  from '$qui/navigation.js'
import * as Theme       from '$qui/theme.js'
import * as Window      from '$qui/window.js'


/**
 * @alias qui.sections.BUTTON_TYPE_MENU_BAR
 */
export const BUTTON_TYPE_MENU_BAR = 'menu_bar'

/**
 * @alias qui.sections.BUTTON_TYPE_TOP_BAR
 */
export const BUTTON_TYPE_TOP_BAR = 'top_bar'

/**
 * @alias qui.sections.BUTTON_TYPE_NONE
 */
export const BUTTON_TYPE_NONE = 'none'


const logger = Logger.get('qui.sections')

let sectionClasses = []
let sectionsList = []
let currentSection = null
let homeSection = null


function attachSectionEventRelays() {
    Window.screenLayoutChangeSignal.connect(function (smallScreen, landscape) {
        sectionsList.forEach(function (s) {
            s.onScreenLayoutChange(smallScreen, landscape)
        })
    })

    Window.resizeSignal.connect(function (width, height) {
        sectionsList.forEach(function (s) {
            s.onWindowResize(width, height)
        })
    })

    OptionsBar.openCloseSignal.connect(function (opened) {
        if (!currentSection) {
            return
        }

        currentSection.onOptionsBarOpenClose(opened)
    })
}

/**
 * @private
 * @returns {Promise}
 */
function softReload() {
    logger.debug('soft reloading')

    /* Reset sections */
    if (currentSection) {
        let currentPath = Navigation.getCurrentPath()

        return reset().then(function () {
            return Navigation.navigate(currentPath)
        })
    }

    return Promise.resolve()
}


/**
 * Register a section class.
 * @alias qui.sections.register
 * @param {typeof qui.sections.Section} sectionClass the section class (see {@link qui.sections.Section})
 */
export function register(sectionClass) {
    let index = sectionClasses.indexOf(sectionClass)
    if (index >= 0) {
        throw new AssertionError('Attempt to register a section class that has already been registered')
    }

    sectionClasses.push(sectionClass)

    let section = sectionClass.getInstance()
    section.handleRegister()
    sectionsList.push(section)

    logger.debug(`registered section "${section.getId()}"`)

    if (!homeSection) {
        /* Home section is, by default, the first section */
        logger.debug(`home section set to "${section.getId()}"`)
        homeSection = section
    }
}

/**
 * Unregister a section class.
 * @alias qui.sections.unregister
 * @param {typeof qui.sections.Section} sectionClass the section class (see {@link qui.sections.Section})
 */
export function unregister(sectionClass) {
    let index = sectionClasses.indexOf(sectionClass)
    if (index < 0) {
        throw new AssertionError('Attempt to unregister a section class that has not been registered')
    }

    sectionClasses.splice(index, 1)

    let section = sectionsList[index]
    section.handleUnregister()

    sectionsList.splice(index, 1)
    logger.debug(`unregistered section "${section.getId()}"`)
}

/**
 * Lookup a section by its identifier.
 * @alias qui.sections.get
 * @param {String} id the section identifier
 * @returns {?qui.sections.Section} the section if found, otherwise `null`
 */
export function get(id) {
    return sectionsList.find(section => section.getId() === id) || null
}

/**
 * Return the current section.
 * @alias qui.sections.getCurrent
 * @returns {?qui.sections.Section}
 */
export function getCurrent() {
    return currentSection
}

/**
 * Return all registered sections, in order.
 * @alias qui.sections.all
 * @returns {qui.sections.Section[]}
 */
export function all() {
    return sectionsList.slice()
}

/**
 * Switch to the given section, making it current.
 * @alias qui.sections.switchTo
 * @param {qui.sections.Section} section the section
 * @param {String} [source] optional source to pass to {@link qui.sections.Section#onShow} (defaults to `program`)
 * @returns {Promise} a promise that resolves as soon as the section is loaded.
 */
export function switchTo(section, source) {
    /* If requested section is already the current section, do nothing more */
    if ((currentSection === section)) {
        Navigation.updateHistoryEntry()
        return currentSection.whenLoaded()
    }

    return section.whenPreloaded().then(function () {
        let oldSection = currentSection
        let s = section.navigate([])
        if (s !== section) {
            logger.debug(`section "${section.getId()}" redirected to section "${s.getId()}"`)
            return switchTo(s, source)
        }

        currentSection = section

        if (source === undefined) {
            source = 'program'
        }

        logger.debug(`switching to section "${section.getId()}" (source: ${source})`)

        if (oldSection) {
            oldSection._hide()
        }

        return section._show(source, oldSection).then(function () {
            Navigation.updateHistoryEntry()
        })
    })
}

/**
 * Switch to the home section.
 * @alias qui.sections.showHome
 * @param {?Boolean} [reset] if `true` will reset the home section to its initial state, recreating its main page
 * @returns {Promise} a promise that resolves as soon as the home section is loaded.
 */
export function showHome(reset) {
    if (!homeSection) {
        throw new AssertionError('No home section')
    }

    let promise = Promise.resolve()
    if (reset) {
        promise = homeSection.reset()
    }

    return promise.then(function () {
        return switchTo(homeSection, /* source = */ 'home')
    })
}

/**
 * Set the home section.
 * @alias qui.sections.setHome
 * @param {qui.sections.Section} section the new home section
 */
export function setHome(section) {
    homeSection = section
}

/**
 * Return the home section.
 * @alias qui.sections.getHome
 * @returns {?qui.sections.Section}
 */
export function getHome() {
    return homeSection
}

/**
 * Reset all sections.
 * @returns {Promise} a promise that is settled as soon as all sections have been reset
 */
export function reset() {
    return Promise.all(sectionsList.map(s => s.reset()))
}


export function init() {
    attachSectionEventRelays()

    /* Prevent unwanted section closing when window is closed */
    Window.closeSignal.connect(function () {
        return !sectionsList.some(s => !s.canClose())
    })

    Window.screenLayoutChangeSignal.connect(function (smallScreen, landscape) {
        /* Automatically update top icon buttons according to small screen state */
        $('div.qui-top-bar > div.qui-top-button.qui-section-button > div.qui-icon').each(function () {
            StockIcon.alterElement($(this), {variant: smallScreen ? 'white' : 'interactive'})
        })

        logger.debug('soft reloading due to screen layout change')
        softReload()
    })

    Theme.changeSignal.connect(function (theme) {
        logger.debug('soft reloading due to theme change')
        softReload()
    })

    /* Export some stuff to global scope */
    let qui = (window.qui = window.qui || {})
    qui.getCurrentSection = getCurrent
}
