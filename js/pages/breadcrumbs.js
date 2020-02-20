
import $      from '$qui/lib/jquery.module.js'
import Logger from '$qui/lib/logger.module.js'

import Config          from '$qui/config.js'
import * as MenuBar    from '$qui/main-ui/menu-bar.js'
import * as OptionsBar from '$qui/main-ui/options-bar.js'
import * as TopBar     from '$qui/main-ui/top-bar.js'
import * as Navigation from '$qui/navigation.js'
import * as ArrayUtils from '$qui/utils/array.js'
import * as HTML       from '$qui/utils/html.js'
import * as Window     from '$qui/window.js'

import * as Pages from './pages.js'


const MAX_BREADCRUMBS = 10
const logger = Logger.get('qui.pages')

let breadcrumbsContainer = null
let menuButton = null


export function update() {
    let currentContext = Pages.getCurrentContext()

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
    let windowTitle = Config.appDisplayName
    if (currentContext.getSize()) {
        let currentPage = currentContext.getCurrentPage()
        if (currentPage.getTitle()) {
            windowTitle += ` - ${currentPage.getTitle()}`
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

export function init() {
    breadcrumbsContainer = $('div.qui-breadcrumbs-container')
    menuButton = $('div.qui-top-bar > div.qui-menu-button')

    /* Create placeholders for breadcrumbs */
    ArrayUtils.range(0, MAX_BREADCRUMBS).forEach(function (i) {
        let breadcrumb = $('<div class="qui-base-button qui-breadcrumb"></div>')
        breadcrumb.attr('data-index', i)
        breadcrumbsContainer.append(breadcrumb)

        breadcrumb.on('click', function () {
            let currentContext = Pages.getCurrentContext()

            /* Close menu and option bars when clicking on a breadcrumb */
            MenuBar.close()
            OptionsBar.close()

            if (currentContext.getSize() <= i + 1) {
                return /* Already there */
            }

            let state = Navigation.getCurrentHistoryEntryState()

            /* Close all pages following the page associated to clicked breadcrumb */
            let page = currentContext.getPageAt(i + 1)
            if (page) {
                page.close().then(function () {
                    Navigation.addHistoryEntry(state)
                    Navigation.updateHistoryEntry()
                }).catch(function () {
                    logger.debug('breadcrumb navigation cancelled by rejected page close')
                })
            }

        })
    })
}
