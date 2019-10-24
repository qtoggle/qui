/**
 * @namespace qui.pages
 */

import $ from '$qui/lib/jquery.module.js'

import * as GlobalGlass from '$qui/global-glass.js'
import * as OptionsBar  from '$qui/main-ui/options-bar.js'
import * as TopBar      from '$qui/main-ui/top-bar.js'
import * as Navigation  from '$qui/navigation.js'
import * as ArrayUtils  from '$qui/utils/array.js'
import * as HTML        from '$qui/utils/html.js'
import {asap}           from '$qui/utils/misc.js'
import * as Window      from '$qui/window.js'

import PagesContext from './pages-context.js'


const MAX_BREADCRUMBS = 10

let pagesContainer = null
let breadcrumbsContainer = null
let menuButton = null
let currentContext = null


/* Breadcrumbs */

function initBreadcrumbs() {
    /* Create placeholders for breadcrumbs */
    ArrayUtils.range(0, MAX_BREADCRUMBS).forEach(function (i) {
        let breadcrumb = $('<div class="qui-base-button qui-breadcrumb"></div>')
        breadcrumb.attr('data-index', i)
        breadcrumbsContainer.append(breadcrumb)

        breadcrumb.on('click', function () {

            if (currentContext.getSize() <= i + 1) {
                return /* Already there */
            }

            Navigation.addHistoryEntry()

            let page = currentContext.getPageAt(i + 1)
            if (page) {
                page.close()
            }

        })
    })
}

function updateBreadcrumbs() {
    breadcrumbsContainer.children('div.qui-breadcrumb').removeClass('used selected back last first-used')

    currentContext.getPages().forEach(function (page, i) {
        if (!page.getTitle()) {
            return
        }

        let breadcrumb = breadcrumbsContainer.children(`div.qui-breadcrumb:eq(${i})`)
        breadcrumb.addClass('used')
        breadcrumb.html(page.getTitle())
    })

    breadcrumbsContainer.children('div.qui-breadcrumb.used:first').addClass('first-used')

    let lastIndex = 0
    currentContext.getPages().forEach(function (page, i) {
        if (!page.getTitle()) {
            return
        }

        let breadcrumb = breadcrumbsContainer.children(`div.qui-breadcrumb:eq(${i})`)
        breadcrumb.toggleClass('selected', i === currentContext.getSize() - 1)
        breadcrumb.toggleClass('back', (i === currentContext.getSize() - 2) && (i >= 0))

        lastIndex = i
    })

    let breadcrumb = breadcrumbsContainer.children(`div.qui-breadcrumb:eq(${lastIndex})`)
    breadcrumb.addClass('last')

    /* Update window title */
    let windowTitle = ''
    if (currentContext.getSize()) {
        let currentPage = currentContext.getCurrentPage()
        if (currentPage.getTitle()) {
            windowTitle = currentPage.getTitle()
        }
    }

    /* Set menu button visibility */
    let menuButtonVisible = true
    if (Window.isSmallScreen() && currentContext.getSize() > 1) {
        menuButtonVisible = false
    }

    menuButton.toggleClass('hidden', !menuButtonVisible)

    /* Update top bar title */
    if (Window.isSmallScreen()) {
        TopBar.setTitle(windowTitle)
    }
    else {
        TopBar.setTitle(null)
    }

    /* Update document title */
    document.title = HTML.plainText(windowTitle)
}


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
    let columnPages = visiblePages.filter(page => page._column)

    /* The minimum accepted width is 25% (on a large screen) */
    let expandWidth = 100 - columnPages.length * 25 /* As percent */
    let left = 0
    visiblePages.reverse().forEach(function (page) {
        let html = page.getPageHTML()
        html.addClass('visible')

        let l = null
        let w = null
        /* The current modal page has special treatment and does not contribute to expanded width */
        if (page.isModal() && page === currentPage) {
            l = 0
        }
        else {
            l = left
            if (!page._column) { /* Expand */
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

function updateVariousFlags() {
    /* Scrolled content */
    let scrolled = currentContext.getPages().some(function (p) {
        if (!p.isVisible()) {
            return false
        }

        return p.getPageHTML()[0].scrollTop !== 0

    })
    Window.$body.toggleClass('content-scrolled', scrolled)
}

function triggerPageResize() {
    asap(function () {
        currentContext.getPages().forEach(function (page) {
            page.onResize()
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
    page.getPageHTML().on('scroll', updateVariousFlags)
    page.getPageHTML().on('transitionend', triggerPageResizeOnTransitionEnd)
}

function detachPageHTMLHandlers(page) {
    page.getPageHTML().off('scroll', updateVariousFlags)
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
        updateBreadcrumbs()
        updatePagesVisibility()
        updateVariousFlags()
    })
}


export function init() {
    pagesContainer = $('div.qui-pages-container')
    breadcrumbsContainer = $('div.qui-breadcrumbs-container')
    menuButton = $('div.qui-top-bar > div.qui-menu-button')

    currentContext = newContext()

    initBreadcrumbs()

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
