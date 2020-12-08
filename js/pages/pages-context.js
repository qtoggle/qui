
import Signal from '$qui/base/signal.js'

import {getCurrentContext} from './pages.js'
import * as Window         from '$qui/window.js'


/**
 * A page stack context.
 * @alias qui.pages.PagesContext
 */
class PagesContext {

    /**
     * @constructs
     */
    constructor() {

        /**
         * Emitted whenever a page is pushed to the context. Handlers are called with the following parameters:
         *  * `page: {@link qui.pages.PageMixin}`, the pushed page
         *  * `index: Number`, page index in page stack
         * @type {qui.base.Signal}
         */
        this.pushSignal = new Signal(this)

        /**
         * Emitted whenever a page is popped from the context. Handlers are called with the following parameters:
         *  * `page: {@link qui.pages.PageMixin}`, the popped page
         *  * `index: Number`, page index in page stack
         * @type {qui.base.Signal}
         */
        this.popSignal = new Signal(this)

        /**
         * @type {qui.pages.PageMixin[]}
         * @private
         */
        this._stack = []
    }

    /**
     * Return the number of pages.
     * @returns {Number}
     */
    getSize() {
        return this._stack.length
    }

    /**
     * Return the page at a given index.
     * @param {Number} index
     * @returns {?qui.pages.PageMixin}
     */
    getPageAt(index) {
        return this._stack[index] || null
    }

    /**
     * Return the stack of pages.
     * @returns {qui.pages.PageMixin[]}
     */
    getPages() {
        return this._stack.slice()
    }

    /**
     * Return the current page (the tip of the stack).
     * @returns {?qui.pages.PageMixin}
     */
    getCurrentPage() {
        return this._stack[this._stack.length - 1] || null
    }

    /**
     * Return the pages that are currently visible in this context.
     * @returns {qui.pages.PageMixin[]}
     */
    getVisiblePages() {
        if (!this._stack.length) {
            return []
        }

        let currentPage = this._stack[this._stack.length - 1]
        let visiblePages = [currentPage]
        let visiblePagesNonPopupMaxCount = Window.isSmallScreen() ? 1 : 4
        let visiblePagesPopupCount = currentPage.isPopup() ? 1 : 0
        let visiblePagesNonPopupCount = currentPage.isPopup() ? 0 : 1

        /* Allow at most 4 visible non-popup pages at most 1 visible popup page, starting from current page and going
         * backwards */
        for (let i = this._stack.length - 2; i >= 0; i--) {
            let nextPage = this._stack[i + 1]
            let thisPage = this._stack[i]

            /* Stop at first page that wants to be alone on the visible container; popup pages have an implicit behavior
             * of keep-previous-visible */
            if (!nextPage.isPrevKeptVisible() && !nextPage.isPopup()) {
                break
            }

            if (thisPage.isPopup()) {
                /* Only one popup page can be visible */
                if (visiblePagesPopupCount < 1) {
                    visiblePagesPopupCount++
                    visiblePages.push(thisPage)
                }
            }
            else {
                /* Limit non-popup visible pages */
                if (visiblePagesNonPopupCount < visiblePagesNonPopupMaxCount) {
                    visiblePagesNonPopupCount++
                    visiblePages.push(thisPage)
                }
            }
        }

        return visiblePages
    }

    /**
     * Push a page to the context.
     * @param {qui.pages.PageMixin} page
     */
    push(page) {
        this._stack.push(page)
        this.pushSignal.emit(page, this._stack.length - 1)
    }

    /**
     * Pop the current page from the stack, returning it.
     * @returns {?qui.pages.PageMixin}
     */
    pop() {
        let page = this._stack.pop() || null
        if (page) {
            this.popSignal.emit(page, this._stack.length)
        }

        return page
    }

    /**
     * Tell if this context is the current pages context.
     * @returns {Boolean}
     */
    isCurrent() {
        return this === getCurrentContext()
    }

}


export default PagesContext
