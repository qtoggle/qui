import $ from '$qui/lib/jquery.module.js'

import {AssertionError} from '$qui/base/errors.js'
import {Mixin}          from '$qui/base/mixwith.js'
import * as GlobalGlass from '$qui/global-glass.js'
import * as OptionsBar  from '$qui/main-ui/options-bar.js'
import * as Navigation  from '$qui/navigation.js'
import * as Theme       from '$qui/theme.js'
import {asap}           from '$qui/utils/misc.js'
import ViewMixin        from '$qui/views/view.js'
import * as Window      from '$qui/window.js'

import {getPagesContainer, updateUI} from './pages.js'


let viewMixinPrototype = ViewMixin().prototype


export default Mixin((superclass = Object, rootclass) => {

    let rootPrototype = rootclass.prototype


    /**
     * A mixin that offers page behavior.
     * @alias qui.pages.PageMixin
     * @mixin
     * @extends qui.views.ViewMixin
     * @param {Object} params
     * * see {@link qui.views.ViewMixin} for view parameters
     * @param {?String} [params.title] page title
     * @param {String} [params.pathId] identifies the page in the URL; leave this unset if the page should not be part
     * of the URL or is the main page of a section
     * @param {Boolean} [params.column] indicates that the page layout is a column and does not expand horizontally
     * (defaults to `false`)
     * @param {Boolean} [params.keepPrevVisible] indicates that the previous page should be kept visible while this page
     * is the current one, to the extent possible (defaults to `false`)
     * @param {Boolean} [params.modal] indicates that the page should be modal, not allowing any external interaction
     * (defaults to `false`)
     * @param {Boolean} [params.transparent] indicates that the page should be transparent (defaults to `true`)
     */
    class PageMixin extends ViewMixin(superclass) {

        constructor({
            title, pathId = null, column = false, keepPrevVisible = false, modal = false, transparent = true,
            ...params
        }) {
            super(params)

            this._title = title
            this._pathId = pathId
            this._column = column
            this._keepPrevVisible = keepPrevVisible
            this._transparent = transparent
            this._modal = modal

            this._pageHTML = null
            this._closed = false
            this._attached = false
            this._context = null
            this._optionsBarContent = null
            this._optionsBarOpen = false /* Flag indicating the last known options bar status for this page */
            this._whenLoaded = null
        }

        /**
         * Called when the page is pushed to a context.
         */
        onPush() {
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
         * Called when the page becomes current.
         */
        onBecomeCurrent() {
        }

        /**
         * Called when the page is no longer current.
         */
        onLeaveCurrent() {
        }

        /**
         * Called when the page is resized.
         */
        onResize() {
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
         * By default does nothing, returning a resolved promise.
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
            let html = $('<div class="qui-page"></div>')

            if (this._column) {
                html.addClass('column')
            }

            if (this._transparent) {
                html.addClass('transparent')
            }

            if (this._modal) {
                html.addClass('modal')
            }

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
            if (this.isModal()) {
                GlobalGlass.addContent(html)
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

            Theme.afterTransition(function () {

                if (this._attached) {
                    /* Detaching cancelled by subsequent attach */
                    return
                }

                this.getPageHTML().detach()

            }.bind(this), this.getPageHTML())
        }

        _getIndex() {
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

            if (this._context.getPages().indexOf(this) < 0) {
                return false /* Not part of current context */
            }

            if (Window.isSmallScreen() && this._getIndex() < this._context.getSize() - 1) {
                return false /* On small screens, only the last page is actually visible */
            }

            return this._context.getVisiblePages().includes(this)
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

            if (needsReattach) {
                this.attach()
            }

            this.getPageHTML().toggleClass('modal', modal)

            if (this.getContext() && this.getContext().isCurrent()) {
                updateUI()
            }
        }

        /**
         * Close the page.
         */
        close() {
            if (rootPrototype.close) {
                rootPrototype.close.call(this)
            }

            if (this._closed) {
                throw new AssertionError('Attempt to close an already closed page')
            }

            /* Mark as closed */
            this._closed = true

            /* Close all following pages */
            let index = this._getIndex()
            if (index >= 0) {
                while (this.getContext().getSize() - 1 > index) {
                    this.getContext().getCurrentPage().close()
                }
            }

            /* Pop this page from context */
            let context = this._context
            if (context) {
                this.handleLeaveCurrent()
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
                    // TODO it would make more sense to prevent calling currentPage.handleBecomeCurrent()
                    //  and all other update function calls, if this page has only been closed to be replaced
                    //  immediately by another one
                    currentPage.onCloseNext(this)
                    currentPage.handleBecomeCurrent()

                    if (context.isCurrent()) {
                        Navigation.updateHistoryEntry()
                    }
                }
                else {
                    if (context.isCurrent()) {
                        OptionsBar.setContent(null)
                    }
                }
            }
        }

        /**
         * Tell if the page has been closed.
         * @returns {Boolean}
         */
        isClosed() {
            /* Prefer root isClosed unless it's the one inherited from ViewMixin */
            if (rootPrototype.isClosed && (rootPrototype.isClosed !== viewMixinPrototype.isClosed)) {
                return rootPrototype.isClosed.call(this)
            }

            return this._closed
        }

        /**
         * Handle the event of becoming the current page.
         */
        handleBecomeCurrent() {
            this.onBecomeCurrent()
            let context = this.getContext()
            if (context && context.isCurrent()) {
                OptionsBar.setContent(this._prepareOptionsBarContent())
                if (this._optionsBarOpen) {
                    OptionsBar.open()
                }
                else {
                    OptionsBar.close()
                }
            }
        }

        /**
         * Handle the event of no longer being the current page.
         */
        handleLeaveCurrent() {
            this.onLeaveCurrent()
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
         * Push a new page after this one. Any following pages will be closed.
         * @param {qui.pages.PageMixin} page the page to be pushed
         * @param {Boolean} [addHistoryEntry] whether to create a new history entry for current page before adding the
         * new page, or not (defaults to `true`)
         * @returns {qui.pages.PageMixin} the pushed page
         */
        pushPage(page, addHistoryEntry = true) {
            let index = this._getIndex()
            if (index < 0) {
                throw new AssertionError('Attempt to push from a contextless page')
            }

            if (addHistoryEntry) {
                Navigation.addHistoryEntry()
            }

            let context = this.getContext()

            /* Close any following page */
            let nextPage = context.getPageAt(index + 1)
            if (nextPage) {
                nextPage.close()
            }

            this.handleLeaveCurrent()

            page.pushSelf(context)
            page.whenLoaded() /* Start loading the page automatically when pushed */

            if (context.isCurrent()) {
                Navigation.updateHistoryEntry()
            }

            return page
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

            /* Attach the page to context */
            context.push(this)
            this._context = context

            if (context.isCurrent()) {
                this.attach()
                updateUI()
            }

            this.onPush()
            this.handleBecomeCurrent()
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
