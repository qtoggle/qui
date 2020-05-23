/**
 * @namespace qui.mainui.status
 */

import $ from '$qui/lib/jquery.module.js'

import StockIcon         from '$qui/icons/stock-icon.js'
import * as Toast        from '$qui/messages/toast.js'
import * as Theme        from '$qui/theme.js'
import VisibilityManager from '$qui/utils/visibility-manager.js'
import * as Window       from '$qui/window.js'


const STATUS_LOCK_TIMEOUT = 500


let statusIndicator = null
let pendingStatusParams = null
let statusLockTimeoutHandle = null
let statusIndicatorVisibilityManager = null
let lastStatus = null
let lastMessage = null


/**
 * Update the status indicator.
 * @alias qui.mainui.status.set
 * @param {String} status one of the following statuses:
 *  * `"info"`
 *  * `"warning"`
 *  * `"error"`
 *  * `"sync"`
 *  * `"reconnect"`
 *  * `"ok"`
 * @param {String} [message] an optional status message
 */
export function set(status, message = null) {
    if (statusLockTimeoutHandle) {
        pendingStatusParams = {status, message}
        return
    }

    lastStatus = status
    lastMessage = message

    if (status === 'ok') {
        statusIndicatorVisibilityManager.hideElement()
    }
    else {
        statusIndicatorVisibilityManager.showElement()
        /* Keep status locked for STATUS_LOCK_TIMEOUT milliseconds, unless "ok" */
        statusLockTimeoutHandle = setTimeout(function () {

            statusLockTimeoutHandle = null
            if (pendingStatusParams) {
                set(pendingStatusParams.status, pendingStatusParams.message)
                pendingStatusParams = null
            }

        }, STATUS_LOCK_TIMEOUT)
    }

    statusIndicator.removeClass('progress')

    let type = status
    let iconName = null
    let decoration = status

    switch (status) {
        case 'info': {
            iconName = 'info'
            break
        }

        case 'warning': {
            iconName = 'exclam'
            break
        }

        case 'error': {
            iconName = 'exclam'
            break
        }

        case 'sync': {
            type = 'info'
            decoration = null
            iconName = 'sync'
            statusIndicator.addClass('progress')
            break
        }

        case 'reconnect': {
            type = 'error'
            decoration = 'error'
            iconName = 'sync'
            statusIndicator.addClass('progress')
            break
        }

        case 'ok': {
            type = 'info'
            decoration = 'info'
            iconName = 'check'
            break
        }
    }

    if (iconName) {
        if (decoration === 'info') {
            decoration = null
        }
        else {
            decoration = Theme.getVar(`${decoration}-color`)
        }

        let variant = 'foreground'
        if (Window.isSmallScreen()) {
            /* On small screens, we always want white icons on top bar */
            variant = 'white'
        }
        else if (message) {
            variant = 'interactive'
        }

        new StockIcon({
            name: iconName,
            decoration: decoration,
            variant: variant
        }).applyTo(statusIndicator.find('.qui-icon'))
    }

    if (message) {
        statusIndicator.attr('data-message', message)
        statusIndicator.attr('data-type', type)
    }
    else {
        statusIndicator.attr('data-message', '')
        statusIndicator.attr('data-type', type)
    }
}


export function init() {
    statusIndicator = $('div.qui-top-bar div.qui-status-indicator')
    statusIndicator.on('click', function () {
        let message = statusIndicator.attr('data-message')
        if (!message) {
            return
        }

        let type = statusIndicator.attr('data-type')

        Toast.show({message, type})
    })

    statusIndicatorVisibilityManager = new VisibilityManager({element: statusIndicator})

    Window.screenLayoutChangeSignal.connect(function () {
        set(lastStatus, lastMessage)
    })

    Theme.changeSignal.connect(function () {
        set(lastStatus, lastMessage)
    })

    set('ok')
}
