
import Signal from '$qui/base/signal.js'

import {getCurrentContext} from './pages.js'
import * as Window         from '$qui/window.js'


/**
 * A page stack context.
 * @alias qui.pages.PagesContext
 */
export default class PagesContext {

    constructor() {

        /**
         * Emitted whenever a page is pushed to the context. Handlers are called with the following parameters:
         *  * `page`, the pushed page: {@link qui.pages.PageMixin}
         *  * `index`, page index in page stack: `Number`
         * @type {qui.base.Signal}
         */
        this.pushSignal = new Signal(this)

        /**
         * Emitted whenever a page is popped from the context. Handlers are called with the following parameters:
         *  * `page`, the popped page: {@link qui.pages.PageMixin}
         *  * `index`, page index in page stack: `Number`
         * @type {qui.base.Signal}
         */
        this.popSignal = new Signal(this)

        this._stack = []
    }

    /**
     * Return the number of pages.
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
        let visiblePagesNonModalMaxCount = Window.isSmallScreen() ? 1 : 4
        let visiblePagesModalCount = currentPage.isModal() ? 1 : 0
        let visiblePagesNonModalCount = currentPage.isModal() ? 0 : 1

        /* Allow at most 4 visible non-modal pages at most 1 visible modal page, starting from current page and going
         * backwards */
        for (let i = this._stack.length - 2; i >= 0; i--) {
            let nextPage = this._stack[i + 1]
            let thisPage = this._stack[i]

            /* Stop at first page that wants to be alone on the visible container; modal pages have an implicit behavior
             * of keep-previous-visible */
            if (!nextPage.isPrevKeptVisible() && !nextPage.isModal()) {
                break
            }

            if (thisPage.isModal()) {
                /* Only one modal page can be visible */
                if (visiblePagesModalCount < 1) {
                    visiblePagesModalCount++
                    visiblePages.push(thisPage)
                }
            }
            else {
                /* Limit non-modal visible pages */
                if (visiblePagesNonModalCount < visiblePagesNonModalMaxCount) {
                    visiblePagesNonModalCount++
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
