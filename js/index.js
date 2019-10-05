/**
 * @namespace qui
 */

import * as RequireJSCompat from '$qui/base/require-js-compat.js'
import $                    from '$qui/lib/jquery.module.js'
import Logger               from '$qui/lib/logger.module.js'

import '$qui/lib/jquery-ui.js'
import '$qui/lib/jquery.mousewheel.js'
import '$qui/lib/jquery.longpress.js'
import '$qui/lib/pep.js'

import Config             from '$qui/config.js'
import * as Forms         from '$qui/forms/forms.js'
import * as GlobalGlass   from '$qui/global-glass.js'
import * as Icons         from '$qui/icons/icons.js'
import * as MainUI        from '$qui/main-ui/main-ui.js'
import * as Status        from '$qui/main-ui/status.js'
import * as Messages      from '$qui/messages/messages.js'
import * as Navigation    from '$qui/navigation.js'
import * as Pages         from '$qui/pages/pages.js'
import * as Sections      from '$qui/sections/sections.js'
import * as ArrayUtils    from '$qui/utils/array.js'
import * as DateUtils     from '$qui/utils/date.js'
import * as ObjectUtils   from '$qui/utils/object.js'
import URL                from '$qui/utils/url.js'
import * as Widgets       from '$qui/widgets/widgets.js'
import * as Window        from '$qui/window.js'

/* Import all modules, just to make sure they are included in bundle */
import '$qui/base/base.js'
import '$qui/base/condition-variable.js'
import '$qui/base/errors.js'
import '$qui/base/i18n.js'
import '$qui/base/mixwith.js'
import '$qui/base/require-js-compat.js'
import '$qui/base/signal.js'
import '$qui/base/singleton.js'

import '$qui/config.js'

import '$qui/forms/common-fields.js'
import '$qui/forms/common-forms.js'
import '$qui/forms/form.js'
import '$qui/forms/form-button.js'
import '$qui/forms/form-field.js'
import '$qui/forms/forms.js'

import '$qui/global-glass.js'

import '$qui/icons/default-stock.js'
import '$qui/icons/icon.js'
import '$qui/icons/icons.js'
import '$qui/icons/multi-state-sprites-icon.js'
import '$qui/icons/stock.js'
import '$qui/icons/stock-icon.js'
import '$qui/icons/stocks.js'

import '$qui/lists/common-items.js'
import '$qui/lists/common-lists.js'
import '$qui/lists/list.js'
import '$qui/lists/list-item.js'

import '$qui/main-ui/main-ui.js'
import '$qui/main-ui/status.js'

import '$qui/messages/common-message-forms.js'
import '$qui/messages/message-form.js'
import '$qui/messages/messages.js'
import '$qui/messages/sticky-modal-page.js'
import '$qui/messages/sticky-modal-progress-message.js'
import '$qui/messages/toast.js'

import '$qui/navigation.js'

import '$qui/pages/common-pages.js'
import '$qui/pages/page.js'
import '$qui/pages/pages.js'
import '$qui/pages/pages-context.js'

import '$qui/pwa.js'

import '$qui/sections/section.js'
import '$qui/sections/sections.js'

import '$qui/theme.js'

import '$qui/utils/ajax.js'
import '$qui/utils/array.js'
import '$qui/utils/colors.js'
import '$qui/utils/cookies.js'
import '$qui/utils/crypto.js'
import '$qui/utils/css.js'
import '$qui/utils/date.js'
import '$qui/utils/gestures.js'
import '$qui/utils/html.js'
import '$qui/utils/misc.js'
import '$qui/utils/object.js'
import '$qui/utils/promise.js'
import '$qui/utils/string.js'
import '$qui/utils/url.js'
import '$qui/utils/utils.js'

import '$qui/views/common-views.js'
import '$qui/views/view.js'
import '$qui/views/views.js'

import '$qui/widgets/common-widgets.js'
import '$qui/widgets/widgets.js'

import '$qui/window.js'


const logger = Logger.get('qui')


function initConfig() {
    /* Look for the main script name */
    let error = new Error()
    let names = error.stack.match(new RegExp('[A-Za-z0-9_-]+\\.js', 'g'))
    if (!names) {
        throw new Error('Cannot find main script: empty stack')
    }

    let scripts = document.getElementsByTagName('script')

    /* Find the referece to the main app DOM script */
    let mainAppName = names[names.length - 1]
    let mainAppScript = Array.from(scripts).find(s => s.src.endsWith(mainAppName))
    if (!mainAppScript) {
        throw new Error(`Cannot find main script: no such script ${mainAppName}`)
    }

    /* Copy all data-* attributes from script tag to Config */
    ObjectUtils.forEach(mainAppScript.dataset, (n, v) => Config.set(n, v))

    /* Find the URL to the QUI index */
    let urls = error.stack.match(/http.*?\.js/gi)
    if (!urls || !urls.length) {
        throw new Error('Cannot find QUI index script: no script URLs found in stack')
    }

    /* Detect QUI static URL */
    let quiIndexScript = urls[0]
    let m = quiIndexScript.match(new RegExp('[.a-z0-9_-]+\\.js'))
    if (!m) {
        throw new Error('Cannot find QUI index script: no JS file found in stack')
    }

    Config.quiIndexName = quiIndexScript.split('/').slice(-1)[0]
    Config.quiIndexName = Config.quiIndexName.split(':')[0] /* Remove :row:col */
    Config.quiStaticURL = quiIndexScript.slice(0, m.index - 1)
    /* In debug mode, we have an extra "/js" dir */
    if (Config.debug) {
        Config.quiStaticURL = Config.quiStaticURL.split('/').slice(0, -1).join('/')
    }

    /* Detect app static URL */
    let appIndexScript = urls.slice(-1)[0]
    m = appIndexScript.match(new RegExp('[.a-z0-9_-]+\\.js'))

    Config.appIndexName = appIndexScript.split('/').slice(-1)[0]
    Config.appIndexName = Config.appIndexName.split(':')[0] /* Remove :row:col */
    Config.appStaticURL = appIndexScript.slice(0, m.index - 1)
    /* In debug mode, we have an extra "/js" dir */
    if (Config.debug) {
        Config.appStaticURL = Config.appStaticURL.split('/').slice(0, -1).join('/')
    }

    /* Use build hash supplied by webpack at build time */
    Config.buildHash = window.__quiBuildHash || ''
}

function initJQuery() {
    function passivizeEvent(eventName) {
        $.event.special[eventName] = {
            setup: function (_, ns, handle) {
                if (ns.includes('noPreventDefault')) {
                    this.addEventListener(eventName, handle, {passive: false})
                }
                else {
                    this.addEventListener(eventName, handle, {passive: true})
                }
            }
        }
    }

    passivizeEvent('touchstart')
    passivizeEvent('touchmove')
}

function configureLogging() {
    Logger.setHandler(Logger.createDefaultHandler({
        formatter: function (messages, context) {
            messages.unshift(`[${context.name}]`)
            messages.unshift(`${context.level.name}:`)
            messages.unshift(DateUtils.formatPercent(new Date(), '%Y-%m-%d %H:%M:%S:'))
        }
    }))

    Logger.setLevel(Config.debug ? Logger.DEBUG : Logger.INFO)

    /* Inject errorStack logger method */
    Object.getPrototypeOf(logger).errorStack = function (msg, error) {
        this.error(`${msg}: ${error.toString()}`)
        if (error.stack) {
            this.error(error.stack)
        }
    }
}

function logCurrentConfig() {
    ArrayUtils.sortKey(Object.entries(Config), e => e[0]).forEach(function ([key, value]) {
        if (typeof value === 'function') {
            return
        }

        logger.debug(`using Config.${key} = ${JSON.stringify(value)}`)
    })
}


/**
 * Initialize the QUI library.
 * @alias qui.init
 */
export function init() {
    RequireJSCompat.cleanup()
    initConfig()
    initJQuery()
    configureLogging()
    logCurrentConfig()

    Window.init()
    Icons.init()
    MainUI.init()
    Status.init()
    Widgets.init()
    Messages.init()
    GlobalGlass.init()
    Sections.init()
    Pages.init()
    Navigation.init()
    Forms.init()

    logger.debug('QUI is ready')
}
