/**
 * @namespace qui.mainui
 */

import $      from '$qui/lib/jquery.module.js'

import * as Window from '$qui/window.js'

import * as MenuBar    from './menu-bar.js'
import * as OptionsBar from './options-bar.js'
import * as TopBar     from './top-bar.js'


let mainContainer = null
let messageContainer = null


function initMainContainer() {
    mainContainer = $('<div class="qui-main-container">' +
                          '<div class="qui-pages-container"></div>' +
                          '<div class="qui-main-container-glass"></div>' +
                      '</div>')

    messageContainer = $('div.qui-toast-message-container')

    mainContainer.find('div.qui-main-container-glass').on('click', function () {
        MenuBar.close()
        OptionsBar.close()
    })

    Window.$body.append(mainContainer)
}


export function init() {
    initMainContainer()

    TopBar.init()
    MenuBar.init()
    OptionsBar.init()
}
