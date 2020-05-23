/**
 * @namespace qui.mainui.status
 */

import $ from '$qui/lib/jquery.module.js'

import StockIcon         from '$qui/icons/stock-icon.js'
import * as Icons        from '$qui/icons/icons.js'
import * as Toast        from '$qui/messages/toast.js'
import * as Theme        from '$qui/theme.js'
import VisibilityManager from '$qui/utils/visibility-manager.js'
import * as Window       from '$qui/window.js'


const STATUS_LOCK_TIMEOUT = 500

/**
 * @alias qui.mainui.status.STATUS_OK
 */
export const STATUS_OK = 'ok'

/**
 * @alias qui.mainui.status.STATUS_INFO
 */
export const STATUS_INFO = 'info'

/**
 * @alias qui.mainui.status.STATUS_WARNING
 */
export const STATUS_WARNING = 'warning'

/**
 * @alias qui.mainui.status.STATUS_ERROR
 */
export const STATUS_ERROR = 'error'

/**
 * @alias qui.mainui.status.STATUS_SYNC
 */
export const STATUS_SYNC = 'sync'


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
 *  * {@link qui.mainui.status.STATUS_INFO}
 *  * {@link qui.mainui.status.STATUS_WARNING}
 *  * {@link qui.mainui.status.STATUS_ERROR}
 *  * {@link qui.mainui.status.STATUS_SYNC}
 *  * {@link qui.mainui.status.STATUS_OK}
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

    let type = status
    let iconName = null
    let decoration = status
    let animation = null

    switch (status) {
        case STATUS_INFO: {
            iconName = 'info'
            break
        }

        case STATUS_WARNING: {
            iconName = 'exclam'
            break
        }

        case STATUS_ERROR: {
            iconName = 'exclam'
            break
        }

        case STATUS_SYNC: {
            type = 'info'
            decoration = null
            iconName = 'sync'
            animation = Icons.ANIMATION_SPIN
            break
        }

        case STATUS_OK: {
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
            variant: variant,
            animation: animation
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

    set(STATUS_OK)
}
