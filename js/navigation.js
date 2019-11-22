/**
 * @namespace qui.navigation
 */

import Logger from '$qui/lib/logger.module.js'

import {gettext}           from '$qui/base/i18n.js'
import Config              from '$qui/config.js'
import * as Toast          from '$qui/messages/toast.js'
import PageMixin           from '$qui/pages/page.js'
import {getCurrentContext} from '$qui/pages/pages.js'
import * as PWA            from '$qui/pwa.js'
import * as Sections       from '$qui/sections/sections.js'
import {asap}              from '$qui/utils/misc.js'
import * as ObjectUtils    from '$qui/utils/object.js'
import URL                 from '$qui/utils/url.js'
import * as Window         from '$qui/window.js'


const logger = Logger.get('qui.navigation')

let basePath = ''
let initialURLPath = null
let initialURLQuery = null
let currentURLPath = null
let currentURLQuery = null


/**
 * An error indicating that navigation could not be done beyond a certain path.
 * @alias qui.navigation.PageNotFoundError
 * @extends Error
 * @param {String[]} path the full path that could not be navigated
 * @param {String} pathId the path id to which the navigation could not be done
 * @param {qui.sections.Section} section the section in which the navigation error occurred
 * @param {qui.navigation.PageMixin} page the page where the navigation stopped
 */
export class PageNotFoundError extends Error {

    constructor(path, pathId, section, page) {
        super(gettext(`Page not found: /${path.join('/')}`))

        this.path = path
        this.pathId = pathId
        this.section = section
        this.page = page
    }

}

/**
 * An error indicating that navigation could not be done due to a page load error.
 * @alias qui.navigation.PageLoadError
 * @extends Error
 * @param {String[]} path the full path that could not be navigated
 * @param {String} pathId the path id to which the navigation could not be done
 * @param {qui.sections.Section} section the section in which the navigation error occurred
 * @param {qui.navigation.PageMixin} page the page where the navigation stopped
 * @param {Error} error the error that occurred
 */
export class PageLoadError extends Error {

    constructor(path, pathId, section, page, error) {
        super(gettext(`Page could not be loaded: ${error.message}`))

        this.path = path
        this.pathId = pathId
        this.section = section
        this.page = page
        this.error = error
    }

}


function updateCurrentURL() {
    let details
    if (Config.navigationUsesFragment) {
        details = URL.parse(window.location.hash.substring(1))
    }
    else {
        details = URL.parse(window.location.href)
    }

    currentURLPath = details.path.substring(basePath.length)
    currentURLQuery = details.queryStr
}

function navigateInitial() {
    if (initialURLPath) {
        logger.debug(`initial navigation to ${initialURLPath}`)
        navigate(initialURLPath)
    }
    else {
        logger.debug('initial navigation to home')
        Sections.showHome()
    }
}


/**
 * Return the current path as an array of path ids.
 * @alias qui.navigation.getCurrentPath
 * @returns {String[]}
 */
export function getCurrentPath() {
    let path = []
    let context = getCurrentContext()

    if (!context) {
        return []
    }

    context.getPages().forEach(function (page) {
        if (!page.getPathId()) {
            return
        }


        path = path.concat(page.getPathId().split('/').filter(p => Boolean(p)))
    })

    return path
}

/**
 * Return the current URL query as a dictionary.
 * @alias qui.navigation.getCurrentQuery
 * @returns {Object<String,String>}
 */
export function getCurrentQuery() {
    if (!currentURLQuery) {
        return {}
    }

    /* Transform query string into key-value pairs */
    return URL.parse(`?${currentURLQuery}`).query
}

/**
 * Transform a QUI path into a fully qualified URL.
 * @alias qui.navigation.pathToURL
 * @param {String|String[]} path
 * @returns {String}
 */
export function pathToURL(path) {
    if (path instanceof Array) {
        path = `/${path.join('/')}`
    }

    return Config.navigationBasePrefix + path
}

/**
 * Navigate the given path.
 * @alias qui.navigation.navigate
 * @param {String|String[]} path the path to navigate
 * @param {Boolean} [handleErrors] set to `false` to pass errors to the caller instead of handling them internally
 * (defaults to `true`)
 * @param {*} [pageState] optional history state to pass to {@link qui.navigation.PageMixin#restoreHistoryState}
 * @returns {Promise} a promise that settles as soon as the navigation ends, being rejected in case of any error
 */
export function navigate(path, handleErrors, pageState) {
    if (handleErrors === undefined) {
        handleErrors = true
    }

    /* Normalize path */
    if (typeof path === 'string') {
        path = path.split('/')
    }

    path = path.filter(id => Boolean(id))

    let origPath = path.slice()
    let pathStr = `/${path.join('/')}`
    let oldPath = getCurrentPath()
    let currIndex = 1 /* Starts from 1, skipping the section id */
    let section
    let sectionRedirected = false

    function handleError(error) {
        if (handleErrors) {
            Toast.error(error.message)
            logger.errorStack('navigation error', error)

            // TODO this is a good place to add custom navigation error handling function
            Sections.showHome(/* reset = */ true)

            return Promise.resolve()
        }
        else {
            throw error
        }
    }

    logger.debug(`navigating to "${pathStr}", pageState = "${JSON.stringify(pageState || null)}"`)

    if (!path.length) { /* Empty path means home */
        section = Sections.getHome()
        if (!section) {
            logger.warn('no home section')
            return Promise.reject(new Error('No home section'))
        }
    }
    else {
        let sectionId = path.shift() /* path[0] is always the section id */
        section = Sections.get(sectionId)
        if (!section) {
            logger.error(`cannot find section with id "${sectionId}"`)
            return handleError(new PageNotFoundError(origPath, sectionId, /* section = */ null, /* page = */ null))
        }
    }

    /* One step navigation function */
    function navigateNext(currentPage) {
        if (!path.length) { /* Navigation done */
            /* Pop everything beyond given path */
            let promise
            let page = getCurrentContext().getPageAt(currIndex)
            if (page) {
                promise = page.close()
            }
            else {
                promise = Promise.resolve()
            }

            return promise.then(function () {
                updateHistoryEntry()
            }).catch(function () {
                logger.debug('page close rejected')
            })
        }

        let pathId = path.shift()

        logger.debug(`navigating from "${currentPage.getPathId()}" to "${pathId}"`)

        let promise = currentPage.navigate(pathId)
        if (promise == null || (promise instanceof PageMixin)) { /* Page passed directly */
            promise = Promise.resolve(promise)
        }

        return promise.then(function (nextPage) {

            if (nextPage == null) {
                logger.error(`could not navigate from "${currentPage.getPathId()}" to "${pathId}"`)
                throw new PageNotFoundError(origPath, pathId, section, currentPage)
            }

            let index = nextPage._getIndex()
            if (index >= 0) {
                logger.debug('page with context, detected navigation flow stop')
                return nextPage.whenLoaded().then(function () {
                    return nextPage
                })
            }

            return currentPage.pushPage(nextPage, /* addHistoryEntry = */ false).then(function () {
                currIndex++

                return nextPage.whenLoaded().then(function () {
                    return navigateNext(nextPage)
                })
            })
        })
    }

    let s = section.navigate(origPath)
    if (s !== section) {
        logger.debug(`section "${section.getId()}" redirected to section "${s.getId()}"`)
        sectionRedirected = true
        section = s
    }

    return section.whenPreloaded().then(function () {

        return Sections.switchTo(section, /* source = */ 'navigate')

    }).catch(function (error) {

        logger.errorStack(`could not navigate to section "${section.getId()}"`, error)

        throw new PageLoadError(origPath, section.getId(), section, error)

    }).then(function () {

        /* Section redirection can also occur during Sections.switchTo() */
        if (Sections.getCurrent() !== section) {
            sectionRedirected = true
        }

        /* If we've been redirected by Section.navigate() to another section, discard the rest of the path,
         * since it doesn't make sense anymore. */
        if (sectionRedirected) {
            return
        }

        /* Count the number of path elements that are common between old and new paths */
        let commonPathLen = 0
        while ((oldPath.length > commonPathLen + 1) &&
               (path.length > commonPathLen) &&
               (oldPath[commonPathLen + 1] === path[commonPathLen])) {

            commonPathLen++
        }

        let currentContext = getCurrentContext()
        let promise = Promise.resolve(section.getMainPage())
        if (commonPathLen) { /* We have a common path part */
            path = path.slice(commonPathLen)
            currIndex += commonPathLen

            let page = currentContext.getPageAt(commonPathLen)
            if (page) {
                promise = page.close().then(() => currentContext.getCurrentPage())
                promise.catch(function () {
                    logger.debug('page close rejected')
                })
            }
        }

        return promise.then(function (currentPage) {
            return currentPage.whenLoaded().then(function () {
                return currentPage
            })
        })

    }).then(function (currentPage) {

        if (sectionRedirected) {
            return
        }
        return navigateNext(currentPage)

    }).then(function () {

        if (sectionRedirected) {
            return
        }

        if (pageState) {
            getCurrentContext().getPages().forEach(function (page, i) {
                page.restoreHistoryState(pageState[i])
            })
        }

    }).catch(handleError)
}


function setHistoryEntry(addUpdate, state) {
    let pathStr = ObjectUtils.pop(state, 'pathStr')

    let msg = `${addUpdate === 'add' ? 'adding' : 'updating'} history entry`
    msg = `${msg}: path = "${pathStr}", pageState = "${JSON.stringify(state.pageState)}"`

    logger.debug(msg)

    if (addUpdate === 'add') {
        currentURLQuery = null
        window.history.pushState(state, '', pathStr)
    }
    else {
        currentURLPath = pathStr
        window.history.replaceState(state, '', pathStr)
    }
}

/**
 * Capture a snapshot of the state of the current history entry.
 * @alias qui.navigation.getCurrentHistoryEntryState
 * @returns {Object}
 */
export function getCurrentHistoryEntryState() {
    let path = getCurrentPath()
    let pathStr = `/${path.join('/')}`
    let pageState = getCurrentContext().getPages().map(page => page.getHistoryState())

    /* Preserve query, if present */
    if (currentURLQuery) {
        pathStr += `?${currentURLQuery}`
    }

    if (Config.navigationUsesFragment) {
        pathStr = `#${pathStr}`
    }

    pathStr = basePath + pathStr

    return {
        pageState: pageState,
        pathStr: pathStr
    }
}

/**
 * Add a history entry corresponding to the current path.
 * @alias qui.navigation.addHistoryEntry
 * @see qui.navigation.getCurrentPath
 * @param {Object} [state] the history entry state to add (will use {@link qui.navigation.getCurrentHistoryEntryState}
 * by default)
 */
export function addHistoryEntry(state = null) {
    state = state || getCurrentHistoryEntryState()
    setHistoryEntry(/* addUpdate = */ 'add', state)
}

/**
 * Update the current history entry from the current path.
 * @alias qui.navigation.updateHistoryEntry
 * @see qui.navigation.getCurrentPath
 * @param {Object} [state] the history entry state to add (will use {@link qui.navigation.getCurrentHistoryEntryState}
 * by default)
 */
export function updateHistoryEntry(state = null) {
    state = state || getCurrentHistoryEntryState()
    setHistoryEntry(/* addUpdate = */ 'update', state)
    PWA.updateManifest()
}

function initHistory() {
    Window.$window.on('hashchange', function () {
        if (!Config.navigationUsesFragment) {
            return
        }

        updateCurrentURL()
        logger.debug(`hash-change: navigating to "${currentURLPath}"`)
        navigate(currentURLPath)
    })

    Window.$window.on('popstate', function (e) {
        let oe = e.originalEvent
        if (oe.state == null) { /* Not ours */
            return
        }

        updateCurrentURL()
        logger.debug(`pop-state: going through history to "${currentURLPath}"`)
        navigate(currentURLPath, /* handleErrors = */ true, /* pageState = */ oe.state.pageState)
    })
}


export function init() {
    /* Deduce base path from base URL */
    if (Config.navigationBasePrefix) {
        basePath = URL.parse(Config.navigationBasePrefix).path
    }

    updateCurrentURL()
    initialURLPath = currentURLPath
    initialURLQuery = currentURLQuery

    initHistory()

    /* Using asap() here allows registering sections right after init() and using them for initial navigation */
    asap(navigateInitial)
}
