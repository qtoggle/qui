/**
 * @namespace qui.mainui
 */

import $ from '$qui/lib/jquery.module.js'

import URL               from '$qui/utils/url.js'
import VisibilityManager from '$qui/utils/visibility-manager.js'
import * as Window       from '$qui/window.js'

import * as MenuBar    from './menu-bar.js'
import * as OptionsBar from './options-bar.js'
import * as TopBar     from './top-bar.js'


let mainContainer = null
let mainContainerGlass = null
let mainContainerGlassVisibilityManager = null

let messageContainer = null


function initMainContainer() {
    mainContainer = $('<div></div>', {class: 'qui-main-container'})
    mainContainer.append($('<div></div>', {class: 'qui-pages-container'}))

    mainContainerGlass = $('<div></div>', {class: 'qui-main-container-glass', style: 'display: none;'})
    mainContainerGlassVisibilityManager = new VisibilityManager({element: mainContainerGlass})
    mainContainer.append(mainContainerGlass)

    messageContainer = $('div.qui-toast-message-container')

    /* Close menu and option bars when clicking on main container glass */
    mainContainer.find('div.qui-main-container-glass').on('click', function () {
        MenuBar.close()
        OptionsBar.close()
    })

    Window.$body.append(mainContainer)
}

function fixDefaultFavicon() {
    /* Set default favicon URLs to absolute paths, before the window location changes */
    $('link[rel=icon], link[rel=apple-touch-icon]').each(function () {
        this.href = URL.parse(this.href).toString()
    })
}

export function showMainContainerGlass() {
    mainContainerGlassVisibilityManager.showElement()
}

export function hideMainContainerGlass() {
    mainContainerGlassVisibilityManager.hideElement()
}

export function init() {
    initMainContainer()
    fixDefaultFavicon()

    TopBar.init()
    MenuBar.init()
    OptionsBar.init()
}
