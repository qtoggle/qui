
import $ from '$qui/lib/jquery.module.js'

import {AssertionError} from '$qui/base/errors.js'
import {Mixin}          from '$qui/base/mixwith.js'
import * as GlobalGlass from '$qui/global-glass.js'
import * as OptionsBar  from '$qui/main-ui/options-bar.js'
import * as Navigation  from '$qui/navigation.js'
import * as Theme       from '$qui/theme.js'
import {asap}           from '$qui/utils/misc.js'
import ViewMixin        from '$qui/views/view.js'
import * as Sections    from '$qui/sections/sections.js'
import * as Window      from '$qui/window.js'

import {getPagesContainer} from './pages.js'
import {updateUI}          from './pages.js'


const viewMixinPrototype = ViewMixin().prototype


/** @lends qui.pages.PageMixin */
const PageMixin = Mixin((superclass = Object, rootclass) => {

    let rootPrototype = rootclass.prototype


    /**
     * A mixin that offers page behavior.
     * @alias qui.pages.PageMixin
     * @mixin
     * @extends qui.views.ViewMixin
     */
    class PageMixin extends ViewMixin(superclass) {

        /**
         * @constructs
         * @param {?String} [title] page title
         * @param {String} [pathId] identifies the page in the URL; leave this unset if the page should not be part
         * of the URL or is the main page of a section
         * @param {Boolean} [columnLayout] indicates that the page layout is a column and does not expand horizontally
         * (defaults to `false`)
         * @param {Boolean} [keepPrevVisible] indicates that the previous page should be kept visible while this page
         * is the current one, to the extent possible (defaults to `false`)
         * @param {Boolean} [popup] indicates that the page should be shown as a popup container, on top of the existing
         * content (defaults to `false`)
         * @param {Boolean} [modal] indicates that the page should be modal, not allowing any external interaction
         * (defaults to `false`, implies `popup` as `true`)
         * @param {Boolean} [transparent] indicates that the page should be transparent (defaults to `true`)
         * @param {...*} args parent class parameters
         */
        constructor({
            title = null,
            pathId = null,
            columnLayout = false,
            keepPrevVisible = false,
            popup = false,
            modal = false,
            transparent = true,
            ...args
        } = {}) {
            super(args)

            this._title = title
            this._pathId = pathId
            this._columnLayout = columnLayout
            this._keepPrevVisible = keepPrevVisible
            this._transparent = transparent
            this._popup = popup || modal
            this._modal = modal

            this._pageHTML = null
            this._closingPromise = null
            this._closed = false
            this._attached = false
            this._context = null
            this._optionsBarContent = null
            this._optionsBarOpen = false /* Flag indicating the last known options bar status for this page */
            this._whenLoaded = null
        }

        /**
         * Override this method to customize navigation beyond this page. By default, it returns `null`, preventing
         * further navigation.
         *
         * It is safe to assume that this page is visible and loaded when this method is called.
         *
         * @param {String} pathId the next path id
         * @returns {?qui.pages.PageMixin|Promise<qui.pages.PageMixin>} the next page or `null` if navigation to given
         * path id is not possible; a promise that resolves to a page can also be returned
         */
        navigate(pathId) {
            return null
        }

        /**
         * Return the page title.
         * @returns {?String}
         */
        getTitle() {
            if (rootPrototype.getTitle) {
                return rootPrototype.getTitle.call(this)
            }

            return this._title
        }

        /**
         * Set the page title.
         * @param {?String} title the new title
         */
        setTitle(title) {
            if (rootPrototype.getTitle) {
                rootPrototype.setTitle.call(this, title)
            }

            this._title = title
            if (this.getContext() && this.getContext().isCurrent()) {
                updateUI()
            }
        }

        /**
         * Return the path id of the page.
         * @returns {?String}
         */
        getPathId() {
            return this._pathId
        }

        /**
         * Update the path id of the page.
         * @param {?String} pathId
         */
        setPathId(pathId) {
            this._pathId = pathId
            if (this.getContext() && this.getContext().isCurrent()) {
                Navigation.updateHistoryEntry()
            }
        }

        /**
         * Override this method to specify page state to be saved when page is saved into browser history.
         *
         * This state will later be restored by calling {@link qui.pages.PageMixin#restoreHistoryState}.
         *
         * @returns {*} the state
         */
        getHistoryState() {
            return {}
        }

        /**
         * Override this method to implement restoring page state from history.
         *
         * This method will be given as argument the state that has been previously created by
         * {@link qui.pages.PageMixin#getHistoryState}.
         *
         * This method must be prepared to receive a `null` history state.
         *
         * @param {*} state
         */
        restoreHistoryState(state) {
        }

        /**
         * Call this whenever the content of the history state changes.
         */
        updateHistoryState() {
            if (this.getContext() && this.getContext().isCurrent()) {
                Navigation.updateHistoryEntry()
            }
        }

        /**
         * Ad a new entry to the browser history. This is just a convenience wrapper around
         * {@link qui.navigation.addHistoryEntry}.
         */
        addHistoryEntry() {
            Navigation.addHistoryEntry()
        }

        /**
         * Override this to implement how the page is loaded.
         *
         * Does nothing by default, returning a resolved promise.
         *
         * @returns {Promise}
         */
        load() {
            return Promise.resolve()
        }

        /**
         * Return a promise that settles as soon as the page is loaded.
         *
         * This method calls {@link qui.pages.PageMixin#load} once per page instance.
         *
         * @returns {Promise}
         */
        whenLoaded() {
            if (!this._whenLoaded) {
                this.setProgress()
                this._whenLoaded = this.load()
                this._whenLoaded.then(function () {
                    this.clearProgress()
                }.bind(this)).catch(function (error) {
                    this.setError(error)
                }.bind(this))
            }

            return this._whenLoaded
        }

        /**
         * Create the page HTML wrapper. This method is called only once per page instance.
         * @returns {jQuery}
         */
        makePageHTML() {
            let html = $('<div></div>', {class: 'qui-page'})

            if (this._columnLayout) {
                html.addClass('column-layout')
            }

            if (this._transparent) {
                html.addClass('transparent')
            }

            if (this._popup) {
                html.addClass('popup')
            }

            if (this._modal) {
                html.addClass('modal')
            }

            /* Add a reference from HTML element to the page object */
            html.data('page', this)

            html.append(this.getHTML())

            return html
        }

        /**
         * Override this to further initialize the Page HTML wrapper.
         * @param {jQuery} html the HTML wrapper to be initialized
         */
        initPageHTML(html) {
        }

        /**
         * Return the page HTML wrapper. Calls {@link qui.pages.PageMixin#makePageHTML} at first invocation.
         * @returns {jQuery}
         */
        getPageHTML() {
            if (this._pageHTML == null) {
                this._pageHTML = this.makePageHTML()
                this.initPageHTML(this._pageHTML)
            }

            return this._pageHTML
        }

        /**
         * Attach the page to the page container.
         */
        attach() {
            if (this._attached) {
                throw new AssertionError('Attempt to attach an already attached page')
            }
            // TODO following condition breaks sticky modal pages
            // if (!this._context || !this._context.isCurrent()) {
            //     throw new AssertionError('Attempt to attach a page belonging to a non-current context')
            // }

            let html = this.getPageHTML()
            if (this.isPopup()) {
                GlobalGlass.addContent(html)
                GlobalGlass.setModal(this.isModal())
            }
            else {
                getPagesContainer().append(html)
            }

            asap(function () {
                this.getPageHTML().addClass('attached')
            }.bind(this))

            this._attached = true
        }

        /**
         * Detach the page from the page container.
         */
        detach() {
            if (!this._attached) {
                throw new AssertionError('Attempt to detach an already detached page')
            }

            this._attached = false

            this.getPageHTML().removeClass('attached')
            if (this.isPopup()) {
                GlobalGlass.setModal(true) /* default */
            }

            Theme.afterTransition(function () {

                if (this._attached) {
                    /* Detaching cancelled by subsequent attach */
                    return
                }

                this.getPageHTML().detach()

            }.bind(this), this.getPageHTML())
        }

        /**
         * Tell if the page layout is a column and does not expand horizontally.
         * @returns {Boolean}
         */
        isColumnLayout() {
            return this._columnLayout
        }

        /**
         * Set the page column layout.
         * @param {Boolean} columnLayout
         */
        setColumnLayout(columnLayout) {
            if (columnLayout !== this._columnLayout) {
                this._columnLayout = columnLayout
                this.getPageHTML().toggleClass('column-layout', columnLayout)

                updateUI()
            }
        }

        /**
         * Return the current vertical scroll parameters.
         * @returns {{offset: Number, maxOffset: Number}} `offset` represents the current scroll offset and `maxOffset`
         * is the maximum scroll offset (`0` if no scrolling is possible)
         */
        getVertScrollParams() {
            let pageHTML = this.getPageHTML()

            return {
                offset: pageHTML[0].scrollTop,
                maxOffset: pageHTML[0].scrollHeight - pageHTML[0].clientHeight
            }
        }

        /**
         * Called when the page is scrolled vertically.
         * @param {Number} offset the vertical scroll offset
         * @param {Number} maxOffset the maximum vertical scroll offset
         */
        onVertScroll(offset, maxOffset) {
        }

        /**
         * Handle vertical scroll events. Internally calls {@link qui.pages.PageMixin#onVertScroll}.
         */
        handleVertScroll() {
            let params = this.getVertScrollParams()

            this.onVertScroll(params.offset, params.maxOffset)
        }

        /**
         * Called when the page is resized.
         */
        onResize() {
        }

        /**
         * Handle the resize events. Internally calls {@link qui.pages.PageMixin#onResize}.
         */
        handleResize() {
            this.onResize()
        }

        /**
         * Return the index of this page in its context. If page has no context, `-1` is returned.
         * @returns {Number}
         */
        getContextIndex() {
            if (!this._context) {
                return -1
            }

            return this._context.getPages().indexOf(this)
        }

        /**
         * Return the associated pages context.
         * @returns {?qui.pages.PagesContext}
         */
        getContext() {
            return this._context
        }

        /**
         * Tell if this page is the current page within its context.
         * @returns {Boolean}
         */
        isCurrent() {
            if (!this._context) {
                return false
            }

            return this._context.getCurrentPage() === this
        }

        /**
         * Tell if the page is visible.
         * @returns {Boolean}
         */
        isVisible() {
            if (!this._context) {
                return false
            }

            if (!this._context.isCurrent()) {
                return false
            }

            if (!this._context.getPages().includes(this)) {
                return false /* Not part of current context */
            }

            if (Window.isSmallScreen() && this.getContextIndex() < this._context.getSize() - 1) {
                return false /* On small screens, only the last page is actually visible */
            }

            return this._context.getVisiblePages().includes(this)
        }

        /**
         * Tells if the page has a context, effectively indicating whether the page is currently added to a context, or
         * not.
         * @returns {Boolean}
         */
        hasContext() {
            return !!this._context
        }

        /**
         * Tell if the page is kept visible while the next page is current.
         * @returns {Boolean}
         */
        isPrevKeptVisible() {
            return this._keepPrevVisible
        }

        /**
         * Set the *keep-prev-visible* flag, controlling if the page is kept visible while the next page is current.
         * @param {Boolean} keepPrevVisible
         */
        setKeepPrevVisible(keepPrevVisible) {
            this._keepPrevVisible = keepPrevVisible

            if (this._context && this._context.isCurrent()) {
                updateUI()
            }
        }

        /**
         * Tell if the page is popup.
         * @returns {Boolean}
         */
        isPopup() {
            return this._popup
        }

        /**
         * Set the popup flag.
         * @param {Boolean} popup
         */
        setPopup(popup) {
            if (this._modal) {
                popup = true /* Modals are always popups */
            }

            let needsReattach = false
            if (this._popup !== popup && this._attached) {
                needsReattach = true
                this.detach()
            }

            this._popup = popup

            if (needsReattach) {
                this.attach()
            }

            this.getPageHTML().toggleClass('popup', popup)

            if (this.getContext() && this.getContext().isCurrent()) {
                updateUI()
            }
        }

        /**
         * Tell if the page is modal.
         * @returns {Boolean}
         */
        isModal() {
            return this._modal
        }

        /**
         * Set the modal flag.
         * @param {Boolean} modal
         */
        setModal(modal) {
            let needsReattach = false
            if (this._modal !== modal && this._attached) {
                needsReattach = true
                this.detach()
            }

            this._modal = modal
            if (modal) {
                this._popup = true /* Modals are always popups */
            }

            if (needsReattach) {
                this.attach()
            }

            this.getPageHTML().toggleClass('modal', this._modal)
            this.getPageHTML().toggleClass('popup', this._popup) /* Popup might have also changed */

            if (this.getContext() && this.getContext().isCurrent()) {
                updateUI()
            }
        }

        /**
         * Called when the page is closed.
         */
        onClose() {
        }

        /**
         * Called when the next page is closed.
         * @param {qui.pages.PageMixin} next the next page that has just been closed
         */
        onCloseNext(next) {
        }

        /**
         * Close the page. Calls {@link qui.pages.PageMixin#canClose} to determine if the page can be closed.
         * @param {Boolean} [force] set to `true` to force page close without calling
         * {@link qui.pages.PageMixin#canClose}
         * @returns {Promise} a promise that is resolved as soon as the page is closed and is rejected if the page close
         * was rejected.
         */
        close(force = false) {
            if (this._closed) {
                throw new AssertionError('Attempt to close an already closed page')
            }

            /* If page is already in the process of being closed, return the closing promise */
            if (this._closingPromise) {
                return this._closingPromise
            }

            /* Close all following pages */
            let promise = Promise.resolve()
            let index = this.getContextIndex()
            let context = this.getContext()
            if (index >= 0 && context && context.getSize() > index + 1) {
                promise = context.getPageAt(index + 1).close(force)
            }

            this._closingPromise = promise.then(() => force || this.canClose()).then(function () {
                if (rootPrototype.close) {
                    rootPrototype.close.call(this)
                }

                /* Mark as closed */
                this._closed = true
                this._closingPromise = null

                /* Pop this page from context */
                if (context) {
                    let currentPage = context.getCurrentPage()
                    if (currentPage !== this) {
                        throw new AssertionError('New page added to context while current page closing')
                    }

                    if (context.isCurrent()) {
                        this.handleLeaveCurrent()
                    }

                    context.pop()
                }

                this.onClose()
                this._context = null

                /* Detach from DOM */
                if (this._attached) {
                    this.detach()
                }

                updateUI()

                if (context) {
                    let currentPage = context.getCurrentPage()
                    if (currentPage) {
                        currentPage.onCloseNext(this)

                        if (context.isCurrent()) {
                            currentPage.handleBecomeCurrent()
                            Navigation.updateHistoryEntry()
                        }
                    }
                    else {
                        if (context.isCurrent()) {
                            OptionsBar.setContent(null)
                        }
                    }
                }
            }.bind(this)).catch(function (e) {

                /* Clear closing promise if close cancelled */
                this._closingPromise = null
                throw e

            }.bind(this))

            return this._closingPromise

        }

        /**
         * Tell if the page has been closed.
         * @returns {Boolean}
         */
        isClosed() {
            /* Prefer root isClosed unless it's the one inherited from ViewMixin */
            if (rootPrototype.isClosed &&
                (rootPrototype.isClosed !== viewMixinPrototype.isClosed) &&
                (rootPrototype.isClosed.toString() !== viewMixinPrototype.isClosed.toString())) {

                return rootPrototype.isClosed.call(this)
            }

            return this._closed
        }

        /**
         * Override this method to prevent accidental closing of the page, to the possible extent. Pages can be closed
         * by default.
         * @returns {Promise} a promise that, if rejected, will prevent the page close
         */
        canClose() {
            return Promise.resolve()
        }

        /**
         * Called when the page becomes the current page on the current context.
         */
        onBecomeCurrent() {
        }

        /**
         * Handle the event of becoming the current page of the current context.
         */
        handleBecomeCurrent() {
            this.onBecomeCurrent()
            let context = this.getContext()
            if (!context || !context.isCurrent()) {
                throw new AssertionError('Attempt to call handleBecomeCurrent() on non-current context')
            }

            OptionsBar.setContent(this._prepareOptionsBarContent())
            if (this._optionsBarOpen) {
                OptionsBar.open()
            }
            else {
                OptionsBar.close()
            }
        }

        /**
         * Called when the page is no longer the current page on the current context.
         */
        onLeaveCurrent() {
        }

        /**
         * Handle the event of no longer being the current page of the current context.
         */
        handleLeaveCurrent() {
            this.onLeaveCurrent()
        }

        /**
         * Called when the section to which page belongs is shown.
         */
        onSectionShow() {
        }

        /**
         * Handle the event of owning section becoming visible.
         */
        handleSectionShow() {
            this.onSectionShow()
        }

        /**
         * Called when the section to which page belongs is hidden.
         */
        onSectionHide() {
        }

        /**
         * Handle the event of owning section becoming hidden.
         */
        handleSectionHide() {
            this.onSectionHide()
        }

        /**
         * Returns the section to which the page currently belongs (may be `null`).
         * @returns {?qui.sections.Section}
         */
        getSection() {
            return Sections.all().find(s => s.getPagesContext() === this.getContext()) || null
        }

        /**
         * Override this method to enable the options bar for this page.
         * @returns {?jQuery|qui.views.ViewMixin}
         */
        makeOptionsBarContent() {
            return null
        }

        /**
         * Return the options bar content of this page.
         * @returns {?jQuery|qui.views.ViewMixin}
         */
        getOptionsBarContent() {
            if (!this._optionsBarContent) {
                this._optionsBarContent = this.makeOptionsBarContent()
            }

            return this._optionsBarContent
        }

        /**
         * Called when the page options change; the page options are defined by the options bar content.
         *
         * This currently works only when using an {@link qui.forms.OptionsForm} for the options bar content.
         *
         * @param {Object} options
         */
        onOptionsChange(options) {
        }

        _prepareOptionsBarContent() {
            let content = this.getOptionsBarContent()
            if (content) {
                if (content instanceof ViewMixin) {
                    content = content.getHTML()
                }
            }

            return content
        }

        /**
         * If this is the current page, open the options bar right away. Otherwise, the options bar will be
         * automatically opened as soon as this page becomes current.
         */
        openOptionsBar() {
            if (this.isCurrent()) {
                OptionsBar.open()
            }
            else {
                this._optionsBarOpen = true
            }
        }

        /**
         * If this is the current page, close the options bar right away. Otherwise, the options bar will remain closed
         * as soon as this page becomes current.
         */
        closeOptionsBar() {
            if (this.isCurrent()) {
                OptionsBar.close()
            }
            else {
                this._optionsBarOpen = false
            }
        }

        /**
         * Called when the page is pushed to a context.
         */
        onPush() {
        }

        /**
         * Push a new page after this one. Any following pages will be closed. The new page is not guaranteed to be
         * pushed by the time the function exists.
         * @param {qui.pages.PageMixin} page the page to be pushed
         * @param {Boolean} [historyEntry] whether to create a new history entry for current page before adding the new
         * page, or not (determined automatically by default, using new page's `pathId`)
         * @returns {Promise} a promise that resolves as soon as the page is pushed, or rejected if the page cannot be
         * pushed
         */
        pushPage(page, historyEntry = null) {
            let index = this.getContextIndex()
            if (index < 0) {
                throw new AssertionError('Attempt to push from a contextless page')
            }

            /* By default, pages with pathId will add a new history entry */
            if (historyEntry == null) {
                historyEntry = !!page.getPathId()
            }

            let context = this.getContext()
            if (!context.isCurrent()) {
                historyEntry = false
            }

            /* Preserve current state for after potential next page close */
            let state = null
            if (historyEntry) {
                state = Navigation.getCurrentHistoryEntryState()
            }

            /* Close any following page */
            let promise
            let nextPage = context.getPageAt(index + 1)
            if (nextPage) {
                promise = nextPage.close()
            }
            else {
                promise = Promise.resolve()
            }

            return promise.then(function () {
                if (historyEntry) {
                    Navigation.updateHistoryEntry(state)
                }

                if (context.isCurrent()) {
                    this.handleLeaveCurrent()
                }

                page.pushSelf(context)
                page.whenLoaded() /* Start loading the page automatically when pushed */

                if (historyEntry) {
                    Navigation.addHistoryEntry()
                }
                else if (context.isCurrent()) {
                    Navigation.updateHistoryEntry()
                }
            }.bind(this))
        }

        /**
         * Push this page to a context.
         * @param {qui.pages.PagesContext} context
         */
        pushSelf(context) {
            if (this._context) {
                throw new AssertionError('Attempt to push page with context')
            }

            this._closed = false
            this._closingPromise = null

            /* Attach the page to context */
            context.push(this)
            this._context = context

            if (context.isCurrent()) {
                this.attach()
                updateUI()
            }

            this.onPush()

            if (context.isCurrent()) {
                this.handleBecomeCurrent()
            }
        }

        /**
         * Return the previous page in context.
         * @returns {?qui.pages.PageMixin}
         */
        getPrev() {
            let index = this.getContextIndex()
            if (index < 0) {
                return null
            }

            return this._context.getPageAt(index - 1)
        }

        /**
         * Return the next page in context.
         * @returns {?qui.pages.PageMixin}
         */
        getNext() {
            let index = this.getContextIndex()
            if (index < 0) {
                return null
            }

            return this._context.getPageAt(index + 1)
        }


        /* Following methods are overridden so that versions from the rootclass are also taken into consideration */

        makeHTML() {
            if (rootPrototype.makeHTML) {
                return rootPrototype.makeHTML.call(this)
            }

            return super.makeHTML()
        }

        initHTML(html) {
            if (rootPrototype.initHTML) {
                rootPrototype.initHTML.call(this, html)
            }
            else {
                super.initHTML(html)
            }
        }

        init() {
            if (rootPrototype.init) {
                rootPrototype.init.call(this)
            }
            else {
                super.init()
            }
        }

        showProgress(percent) {
            if (rootPrototype.showProgress) {
                rootPrototype.showProgress.call(this, percent)
            }
            else {
                super.showProgress(percent)
            }
        }

        hideProgress() {
            if (rootPrototype.hideProgress) {
                rootPrototype.hideProgress.call(this)
            }
            else {
                super.hideProgress()
            }
        }

        showWarning(message) {
            if (rootPrototype.showWarning) {
                rootPrototype.showWarning.call(this, message)
            }
            else {
                super.showWarning(message)
            }
        }

        hideWarning() {
            if (rootPrototype.hideWarning) {
                rootPrototype.hideWarning.call(this)
            }
            else {
                super.hideWarning()
            }
        }

        showError(message) {
            if (rootPrototype.showError) {
                rootPrototype.showError.call(this, message)
            }
            else {
                super.showError(message)
            }
        }

        hideError() {
            if (rootPrototype.hideError) {
                rootPrototype.hideError.call(this)
            }
            else {
                super.hideError()
            }
        }

    }

    return PageMixin

})


export default PageMixin
