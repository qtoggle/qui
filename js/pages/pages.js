/**
 * @namespace qui.pages
 */

import $ from '$qui/lib/jquery.module.js'

import {AssertionError} from '$qui/base/errors.js'
import * as GlobalGlass from '$qui/global-glass.js'
import * as OptionsBar  from '$qui/main-ui/options-bar.js'
import {asap}           from '$qui/utils/misc.js'
import * as Window      from '$qui/window.js'

import PagesContext     from './pages-context.js'
import * as Breadcrumbs from './breadcrumbs.js'


let pagesContainer = null
let currentContext = null


/* Page context */

function newContext() {
    let context = new PagesContext()

    context.pushSignal.connect(function (page) {
        /* Whenever a page is added to a context, attach our UI handlers to it */
        attachPageHTMLHandlers(page)
    })

    context.popSignal.connect(function (page) {
        /* Whenever a page is removed from a context, detach our UI handlers from it */
        detachPageHTMLHandlers(page)
    })

    return context
}

/**
 * Return the current pages context.
 * @alias qui.pages.getCurrentContext
 * @returns {qui.pages.PagesContext}
 */
export function getCurrentContext() {
    return currentContext
}

/**
 * Replace the current pages context.
 * @alias qui.pages.setCurrentContext
 * @param {?qui.pages.PagesContext} context new context, or `null` to replace with a brand new context
 */
export function setCurrentContext(context) {
    let pagesToDetach = currentContext.getPages()
    let currentPage = currentContext.getCurrentPage()
    if (currentPage) {
        currentPage.handleLeaveCurrent()
    }

    /* Hide & detach pages */
    pagesToDetach.forEach(function (page) {
        page.detach()
    })

    if (!context) {
        context = newContext()
    }

    /* Restore the context */
    currentContext = context

    /* Attach new pages */
    currentContext.getPages().forEach(function (page) {
        page.attach()
    })

    currentPage = currentContext.getCurrentPage()
    if (currentPage) {
        currentPage.handleBecomeCurrent()
    }

    updateUI()
}

/**
 * Return the current page.
 * @alias qui.pages.getCurrentPage
 * @returns {?qui.pages.PageMixin}
 */
export function getCurrentPage() {
    return currentContext.getCurrentPage()
}


/* Pages UI */

function updatePagesVisibility() {
    /* Reset page classes/styles */
    currentContext.getPages().forEach(function (page) {
        page.getPageHTML().removeClass('visible current').css({width: '', left: ''})
    })

    /* Hide pages that are still part of the DOM but no longer part of current context */
    $('div.qui-page').not('.sticky').removeClass('visible current').css({width: '', left: ''})

    if (!currentContext.getSize()) {
        GlobalGlass.updateVisibility()
        return
    }

    let currentPage = currentContext.getCurrentPage()
    currentPage.getPageHTML().addClass('current')

    let visiblePages = currentContext.getVisiblePages()
    let columnPages = visiblePages.filter(page => page.isColumnLayout())

    /* The minimum accepted width is 25% (on a large screen) */
    let expandWidth = 100 - columnPages.length * 25 /* As percent */
    let left = 0
    visiblePages.reverse().forEach(function (page) {
        let html = page.getPageHTML()
        html.addClass('visible')

        let l
        let w = null
        /* The current popup page has special treatment and does not contribute to expanded width */
        if (page.isPopup() && page === currentPage) {
            l = 0
        }
        else {
            l = left
            if (!page.isColumnLayout()) { /* Expand */
                w = expandWidth
                left += expandWidth
            }
            else {
                left += 25
            }
        }

        if (l != null) {
            html.css('left', `${l}%`)
        }
        if (w != null) {
            html.css('width', `${w}%`)
        }
    })

    pagesContainer.toggleClass('full', (left >= 100) || Window.isSmallScreen())

    GlobalGlass.updateVisibility()
}

function updateContentScroll() {
    /* Scrolled content */
    let scrolled = currentContext.getPages().some(function (p) {
        if (!p.isVisible()) {
            return false
        }

        return p.getPageHTML()[0].scrollTop !== 0

    })
    Window.$body.toggleClass('content-scrolled', scrolled)
}

function handlePageScroll() {
    updateContentScroll()

    let $this = $(this)
    let page = $this.data('page')
    if (!page) {
        throw AssertionError('page scroll event from a non-page HTML element')
    }

    page.handleVertScroll()
}

function triggerPageResize() {
    asap(function () {
        currentContext.getPages().forEach(function (page) {
            page.handleResize()
        })
    })
}

function triggerPageResizeOnTransitionEnd(e) {
    if (e.target !== this) {
        return
    }

    if (e.originalEvent.propertyName !== 'width') {
        return
    }

    triggerPageResize()
}

function attachPageHTMLHandlers(page) {
    page.getPageHTML().on('scroll', handlePageScroll)
    page.getPageHTML().on('transitionend', triggerPageResizeOnTransitionEnd)
}

function detachPageHTMLHandlers(page) {
    page.getPageHTML().off('scroll', handlePageScroll)
    page.getPageHTML().off('transitionend', triggerPageResizeOnTransitionEnd)
}

/**
 * Return the page container HTML element.
 * @alias qui.pages.getPagesContainer
 * @returns {jQuery}
 */
export function getPagesContainer() {
    return pagesContainer
}

/**
 * Update all UI elements depending on current page stack.
 * @alias qui.pages.updateUI
 */
export function updateUI() {
    /* Use asap() because some pages might have just been attached to DOM and animations won't probably work */
    asap(function () {
        Breadcrumbs.update()
        updatePagesVisibility()
        updateContentScroll()
    })
}


export function init() {
    pagesContainer = $('div.qui-pages-container')
    currentContext = newContext()

    Breadcrumbs.init()

    Window.resizeSignal.connect(function (width, height) {
        triggerPageResize()
    })

    OptionsBar.openCloseSignal.connect(function (opened) {
        /* Update _optionsBarOpen flag of current page */

        let currentPage = currentContext.getCurrentPage()
        if (!currentPage) {
            return
        }

        currentPage._optionsBarOpen = opened
    })
}
