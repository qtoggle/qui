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

import ConditionVariable         from '$qui/base/condition-variable.js'
import {CancelledError}          from '$qui/base/errors.js'
import {gettext}                 from '$qui/base/i18n.js'
import Config                    from '$qui/config.js'
import * as Forms                from '$qui/forms/forms.js'
import * as GlobalGlass          from '$qui/global-glass.js'
import * as Icons                from '$qui/icons/icons.js'
import * as MainUI               from '$qui/main-ui/main-ui.js'
import * as Status               from '$qui/main-ui/status.js'
import {StickySimpleMessageForm} from '$qui/messages/common-message-forms.js'
import * as Messages             from '$qui/messages/messages.js'
import * as Navigation           from '$qui/navigation.js'
import * as Pages                from '$qui/pages/pages.js'
import * as PWA                  from '$qui/pwa.js'
import * as Sections             from '$qui/sections/sections.js'
import * as Theme                from '$qui/theme.js'
import * as ArrayUtils           from '$qui/utils/array.js'
import * as DateUtils            from '$qui/utils/date.js'
import * as ObjectUtils          from '$qui/utils/object.js'
import * as Widgets              from '$qui/widgets/widgets.js'
import * as Window               from '$qui/window.js'


const logger = Logger.get('qui')

/**
 * A condition that is fulfilled as soon as the app is fully initialized and ready to be used.
 * @alias qui.whenReady
 * @type {qui.base.ConditionVariable}
 */
export let whenReady = new ConditionVariable()


function initConfig() {
    /* Look for the main script name */
    let error = new Error()
    let names = error.stack.match(new RegExp('[A-Za-z0-9_-]+\\.js', 'g'))
    if (!names) {
        throw new Error('Cannot find main script: empty stack')
    }

    let scripts = document.getElementsByTagName('script')

    /* Find the reference to the main app DOM script */
    let mainAppScriptName = names[names.length - 1]
    let mainAppScript = Array.from(scripts).find(s => s.src.split('?')[0].endsWith(mainAppScriptName))
    if (!mainAppScript) {
        throw new Error(`Cannot find main script: no such script ${mainAppScriptName}`)
    }

    /* Deduce app name from main app script name */
    let appName = mainAppScriptName.slice(0, -3) /* remove .js */
    if (appName.endsWith('-bundle')) {
        appName = appName.slice(0, -7)
    }
    if (appName === 'index') { /* development mode */
        appName = 'qui-app'
    }
    Config.appName = appName

    /* Copy all data-* attributes from script tag to Config */
    ObjectUtils.forEach(mainAppScript.dataset, (n, v) => Config.set(n, v))

    /* Find the URL to the QUI index */
    let urls = error.stack.match(/http.*?\.js/gi)
    if (!urls || !urls.length) {
        throw new Error('Cannot find QUI index script: no script URLs found in stack')
    }

    /* Detect QUI static URL - we know it's the first script in stack */
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

    /* Detect app static URL - we know it's the last script in stack */
    let appIndexScript = urls.slice(-1)[0]
    m = appIndexScript.match(new RegExp('[.a-z0-9_-]+\\.js'))

    Config.appIndexName = appIndexScript.split('/').slice(-1)[0]
    Config.appIndexName = Config.appIndexName.split(':')[0] /* Remove :row:col */
    Config.appStaticURL = appIndexScript.slice(0, m.index - 1)
    /* In debug mode, we have an extra "/js" dir */
    if (Config.debug) {
        Config.appStaticURL = Config.appStaticURL.split('/').slice(0, -1).join('/')
    }

    /* Use details supplied by webpack at build time */
    if (window.__quiAppVersion) {
        Config.appCurrentVersion = window.__quiAppVersion
    }

    /* Export Config to global scope  */
    let qui = (window.qui = window.qui || {})
    qui.Config = Config
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
        this.error(`${msg}: ${error ? error.toString() : '(no error supplied)'}`)
        if (error && error.stack) {
            this.error(error.stack)
        }
    }

    /* Unlimited stack trace */
    Error.stackTraceLimit = Infinity

    /* Export Logger to global scope  */
    let qui = (window.qui = window.qui || {})
    qui.Logger = Logger
}

function logCurrentConfig() {
    ArrayUtils.sortKey(Object.entries(Config), e => e[0]).forEach(function ([key, value]) {
        if (typeof value === 'function') {
            return
        }

        logger.debug(`using Config.${key} = ${JSON.stringify(value)}`)
    })
}

function configureGlobalErrorHandling() {
    window.addEventListener('unhandledrejection', function (e) {
        /* Uncaught/unhandled cancelled errors are silently ignored */
        if (e.reason instanceof CancelledError) {
            e.preventDefault()
            return
        }

        logger.error(`unhandled promise rejection: ${e.reason || '<unspecified reason>'}`)
        if (e.reason != null) {
            logger.error(e.reason)
        }
        logger.error(e.promise)

        let msg = gettext('An unexpected error occurred.')
        msg += '<br>'
        msg += gettext('Application reloading is recommended.')
        new StickySimpleMessageForm({type: 'error', message: msg}).show()
        e.preventDefault()
    })
}


/**
 * Initialize the QUI library.
 * @alias qui.init
 * @returns {Promise} a promise that resolves when QUI is initialized and ready
 */
export function init() {
    RequireJSCompat.cleanup()
    initConfig()
    initJQuery()
    configureLogging()
    logCurrentConfig()

    return Promise.resolve()
    .then(() => Window.init())
    .then(() => PWA.init())
    .then(() => Theme.init())
    .then(() => Icons.init())
    .then(() => MainUI.init())
    .then(() => Status.init())
    .then(() => Widgets.init())
    .then(() => Messages.init())
    .then(() => GlobalGlass.init())
    .then(() => Sections.init())
    .then(() => Pages.init())
    .then(() => Navigation.init())
    .then(() => Forms.init())
    .then(() => configureGlobalErrorHandling())
    .then(function () {
        whenReady.fulfill()
        logger.debug('QUI is ready')
    })
}
