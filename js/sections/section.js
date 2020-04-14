
import $      from '$qui/lib/jquery.module.js'
import Logger from '$qui/lib/logger.module.js'

import {NotImplementedError} from '$qui/base/errors.js'
import {mix}                 from '$qui/base/mixwith.js'
import SingletonMixin        from '$qui/base/singleton.js'
import StockIcon             from '$qui/icons/stock-icon.js'
import * as MenuBar          from '$qui/main-ui/menu-bar.js'
import * as TopBar           from '$qui/main-ui/top-bar.js'
import * as Navigation       from '$qui/navigation.js'
import {getCurrentContext}   from '$qui/pages/pages.js'
import {setCurrentContext}   from '$qui/pages/pages.js'
import * as Window           from '$qui/window.js'

import * as Sections from './sections.js'


/**
 * The base class for sections.
 * @alias qui.sections.Section
 * @mixes qui.base.SingletonMixin
 */
class Section extends mix().with(SingletonMixin) {

    /**
     * @constructs
     * @param {String} id section identifier
     * @param {String} title section title
     * @param {qui.icons.Icon} icon section icon
     * @param {String} [buttonType] one of {@link qui.sections.BUTTON_TYPE_MENU_BAR} (default),
     * {@link qui.sections.BUTTON_TYPE_TOP_BAR} and {@link qui.sections.BUTTON_TYPE_NONE}
     * @param {Number} [index] sets the section position (ordering) in relation with other sections; by default,
     * sections are positioned based on their registration order
     */
    constructor({id, title, icon, buttonType = Sections.BUTTON_TYPE_MENU_BAR, index = 0}) {
        super()

        this._id = id
        this._title = title
        this._icon = icon
        this._buttonType = buttonType
        this._index = index

        this._mainPage = null
        this._savedPagesContext = null
        this._whenPreloaded = null
        this._whenLoaded = null

        this.logger = Logger.get(`qui.sections.${this._id}`)

        this._button = this._makeSectionButton()
        this._button.on('click', function () {

            if (this.isCurrent()) {
                return
            }

            Navigation.addHistoryEntry()
            Sections.switchTo(this, /* source = */ 'button')

        }.bind(this))

        /* Hide menu bar after selecting a menu entry */
        this._button.on('pointerup', function () {
            if (MenuBar.isOpened()) {
                MenuBar.close()
            }
        })

        this._applyIcon()
    }

    /**
     * Return the id of this section.
     * @returns {String}
     */
    getId() {
        return this._id
    }

    /**
     * Override this to implement how the section is preloaded (i.e. before pushing the main page).
     *
     * During the preload execution, this section should not be assumed to be the current section. Preloading blocks
     * navigation by blocking switching to this section.
     *
     * By default, returns a resolved promise.
     *
     * @returns {Promise}
     */
    preload() {
        return Promise.resolve()
    }

    /**
     * Override this to implement how the section is loaded, after pushing the main page.
     *
     * Loading the main page and loading the section may happen concurrently.
     *
     * By default, returns a resolved promise.
     *
     * @returns {Promise}
     */
    load() {
        return Promise.resolve()
    }

    /**
     * Return a promise that settles as soon as the section is preloaded.
     *
     * This method calls {@link qui.sections.Section#preload} once per section instance.
     *
     * @returns {Promise}
     */
    whenPreloaded() {
        if (!this._whenPreloaded) {
            this._whenPreloaded = this.preload()
        }

        return this._whenPreloaded
    }

    /**
     * Return a promise that settles as soon as the section is loaded.
     *
     * This method calls {@link qui.sections.Section#load} once per section instance.
     *
     * A loaded section can also be assumed to be preloaded.
     *
     * @returns {Promise}
     */
    whenLoaded() {
        return this.whenPreloaded().then(function () {

            if (!this._whenLoaded) {
                this._whenLoaded = this.load()
            }

            return this._whenLoaded

        }.bind(this))
    }

    /**
     * Override this method to prevent accidental closing of the section, to the possible extent. Sections can be closed
     * by default.
     *
     * A section is closed only when application window is closed or reloaded.
     *
     * @returns {Boolean}
     */
    canClose() {
        return true
    }

    /**
     * This method is called when {@link qui.sections.register} is called on this section and is responsible of section
     * setting up after registration.
     */
    handleRegister() {
        this._addSectionButton()
    }

    /**
     * This method is called when {@link qui.sections.unregister} is called on this section and is responsible of
     * cleaning up after section removal.
     */
    handleUnregister() {
        this._button.detach()
    }


    /* Visibility & layout */

    /**
     * Called whenever the section becomes visible.
     * @param {String} source the source why the section has been shown; known sources are:
     *  * `"button"` - the section button has been pressed
     *  * `"navigation"` - {@link qui.navigation.navigate} was used to switch to this section
     *  * `"home"` - {@link qui.sections.showHome} was called
     *  * `"program"` - {@link qui.sections.switchTo} called from program
     * @param {?qui.sections.Section} prevSection the previous section
     */
    onShow(source, prevSection) {
    }

    /**
     * Handle the event of section becoming visible.
     * @param {String} source (see {@link qui.sections.Section#onShow})
     * @param {?qui.sections.Section} prevSection the previous section
     */
    handleShow(source, prevSection) {
        /* Inform all pages of event */
        let context = this.getPagesContext()
        context.getPages().forEach(page => page.handleSectionShow())

        this.onShow(source, prevSection)
    }

    /**
     * Called whenever the section is hidden.
     */
    onHide() {
    }

    /**
     * Handle the event of section becoming hidden.
     */
    handleHide() {
        /* Inform all pages of event */
        let context = this.getPagesContext()
        context.getPages().forEach(page => page.handleSectionHide())

        this.onHide()
    }

    /**
     * Called when the screen layout changes.
     * @param {Boolean} smallScreen whether the screen is now a small screen or not
     * @param {Boolean} landscape whether the screen layout is now landscape or portrait
     */
    onScreenLayoutChange(smallScreen, landscape) {
    }

    /**
     * Called whenever the screen size changes.
     * @param {Number} width the new width of the screen
     * @param {Number} height the new height of the screen
     */
    onWindowResize(width, height) {
    }

    /**
     * Called when the options bar is opened or closed, while this section is the current section.
     * @param {Boolean} opened `true` if the bar is opened, `false` otherwise
     */
    onOptionsBarOpenClose(opened) {
    }

    _makeAndPushMainPage() {
        this.logger.debug('creating main page')
        this._mainPage = this.makeMainPage()

        let pagesContext = this.getPagesContext()

        /* Overwrite path id with the section id */
        this._mainPage._pathId = this._id

        /* Unset mainPage on close */
        pagesContext.popSignal.connect(function (page, index) {
            if (index === 0) { /* Main page removed */
                this._mainPage = null
            }
        }.bind(this), /* once = */ true)

        this._mainPage.pushSelf(pagesContext)
    }

    _show(source, prevSection) {
        this.logger.debug('showing section')

        /* Restore the pages context, if present */
        if (this._savedPagesContext) {
            this.logger.debug('restoring pages context')
            setCurrentContext(this._savedPagesContext)
            this._savedPagesContext = null
        }

        /* Create and push the main page if not already created */
        if (!this._mainPage) {
            this._makeAndPushMainPage()
        }

        this._button.addClass('selected')
        this.handleShow(source, prevSection)

        return this.whenLoaded().then(function () {

            /* Start loading the main page when pushed, but don't wait for result */
            this._mainPage.whenLoaded()

        }.bind(this))
    }

    _hide() {
        this.logger.debug('hiding section')
        this.handleHide()

        this._savedPagesContext = getCurrentContext()
        this._button.removeClass('selected')

        setCurrentContext(null)
    }

    /**
     * Tell if this section is the current section or not.
     * @returns {Boolean}
     */
    isCurrent() {
        return Sections.getCurrent() === this
    }

    /**
     * Return the current page of this section.
     * @returns {?qui.pages.PageMixin}
     */
    getCurrentPage() {
        return this.getPagesContext().getCurrentPage()
    }

    /**
     * Return the pages context of this section.
     * @returns {qui.pages.PagesContext}
     */
    getPagesContext() {
        /* A hidden section has its pages context stored in _savedPagesContext. A visible (current) section owns the
         * current pages context. */

        return this._savedPagesContext || getCurrentContext()
    }


    /* Title, icon & button */

    _makeSectionButton() {
        let button = $('<div></div>', {class: 'qui-base-button qui-section-button'})
        button.append($('<div></div>', {class: 'qui-icon'}))
        button.append($('<span></span>', {class: 'label'}))

        button.addClass(this._id)
        button.css('order', this._index * 10)

        switch (this._buttonType) {
            case Sections.BUTTON_TYPE_MENU_BAR:
                button.find('.label').html(this._title)
                break

            case Sections.BUTTON_TYPE_TOP_BAR:
                button.find('.label').remove()
                button.attr('title', this._title)
                break
        }

        return button
    }

    _addSectionButton() {
        switch (this._buttonType) {
            case Sections.BUTTON_TYPE_MENU_BAR:
                MenuBar.addButton(this._button)
                break

            case Sections.BUTTON_TYPE_TOP_BAR:
                TopBar.addButton(this._button)
                break
        }
    }

    /**
     * Show or hide the section button.
     * @param {Boolean} visible
     */
    setButtonVisibility(visible) {
        this._button.toggle(visible)
    }

    /**
     * Return the section icon.
     * @returns {qui.icons.Icon}
     */
    getIcon() {
        return this._icon
    }

    /**
     * Set the section icon.
     * @param {qui.icons.Icon} icon the new icon
     */
    setIcon(icon) {
        this._icon = icon
        this._applyIcon()
    }

    _applyIcon() {
        let icon = this._icon

        if (icon instanceof StockIcon) {
            switch (this._buttonType) {
                case Sections.BUTTON_TYPE_MENU_BAR:
                    icon = icon.alterDefault({
                        variant: 'interactive',
                        activeVariant: 'interactive',
                        selectedVariant: 'background'
                    })
                    break

                case Sections.BUTTON_TYPE_TOP_BAR:
                    icon = icon.alterDefault({variant: Window.isSmallScreen() ? 'white' : 'interactive'})
                    break
            }
        }

        /* Following css manipulations are a workaround for properly detecting decoration background */
        let origSelected = this._button.hasClass('selected')

        this._button.css('transition', 'none')
        this._button.removeClass('selected')

        this._button.find('.qui-icon').empty()
        icon.applyTo(this._button.find('.qui-icon'))

        this._button.css('transition', '')
        if (origSelected) {
            this._button.addClass('selected')
        }

        this._icon = icon
    }

    /**
     * Return the title of this section.
     * @returns {String}
     */
    getTitle() {
        return this._title
    }

    /**
     * Set the title of this section.
     * @param {String} title
     */
    setTitle(title) {
        this._title = title
        if (this._button) {
            this._button.find('.label').html(this._title)
            this._button.attr('title', this._title)
        }
    }


    /* Pages & navigation */

    /**
     * Override this method to create the main section page.
     * @returns {qui.pages.PageMixin} the section's main page
     */
    makeMainPage() {
        throw new NotImplementedError()
    }

    /**
     * Return the main page of this section.
     * @returns {?qui.pages.PageMixin}
     */
    getMainPage() {
        return this._mainPage
    }

    /**
     * Push a new page onto the section's context. The page is not guaranteed to be pushed by the time the function
     * exists.
     * @param {qui.pages.PageMixin} page the page to be pushed
     * @param {Boolean} [addHistoryEntry] whether to create a new history entry for current page before adding the new
     * page, or not (defaults to `true`)
     * @returns {Promise} a promise that resolves as soon as the page is pushed, or rejected if the page cannot be
     * pushed
     */
    pushPage(page, addHistoryEntry = true) {
        let context = this.getPagesContext()
        let currentPage = context.getCurrentPage()
        if (currentPage) {
            return currentPage.pushPage(page, addHistoryEntry)
        }
        else {
            if (addHistoryEntry) {
                Navigation.addHistoryEntry()
            }

            page.pushSelf(context)
            page.whenLoaded() /* Start loading the page automatically when pushed */

            if (context.isCurrent()) {
                Navigation.updateHistoryEntry()
            }

            return Promise.resolve()
        }
    }

    /**
     * Reset the section to its initial state, closing all pages, including the main page.
     * @returns {Promise} a promise that is resolved as soon as the section is reset and the main page is loaded
     */
    reset() {
        this.logger.debug('resetting section')

        let promise = Promise.resolve()
        if (this._mainPage) {
            /* Close main page and all following pages */
            promise = this._mainPage.close(/* force = */ true)
        }

        this.onReset()

        /* Also re-apply button icon, as theme might have been changed */
        this._applyIcon()

        return promise.then(function () {
            this._mainPage = null
            if (this.isCurrent()) {
                this._makeAndPushMainPage()
                return this.whenLoaded().then(function () {
                    /* Start loading the main page when pushed, but don't wait for result */
                    return this._mainPage.whenLoaded()
                }.bind(this))
            }
        }.bind(this))
    }

    /**
     * Called whenever the section is reset.
     */
    onReset() {
    }

    /**
     * Override this to implement redirects from this section when switching to it using
     * {@link qui.navigation.navigate}. By default it returns this section.
     *
     * @param {String[]} path the requested navigation path
     * @returns {qui.sections.Section|Promise<qui.sections.Section>} the new section
     */
    navigate(path) {
        return this
    }

}


export default Section
