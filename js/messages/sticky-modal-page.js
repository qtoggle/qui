import {Mixin}          from '$qui/base/mixwith.js'
import SingletonMixin   from '$qui/base/singleton.js'
import * as GlobalGlass from '$qui/global-glass.js'


export default Mixin((superclass = Object) => {

    /**
     * A mixin for pages that are stuck to the global glass until explicitly removed.
     * @alias qui.messages.StickyModalPageMixin
     * @mixin
     */
    class StickyModalPageMixin extends superclass {

        constructor(...args) {
            super(...args)

            this._showCount = 0
        }

        initPageHTML(html) {
            super.initPageHTML(html)
            html.addClass('sticky')
        }

        close() {
            /* Call the hide method instead of page's close */
            this.hide()
            this.onClose()
        }

        /**
         * Override this method to indicate how the page is reset to its initial state, as soon as it is shown.
         */
        reset() {
        }

        /**
         * Show this page.
         *
         * This is a reentrant method.
         *
         * @returns {qui.messages.StickyModalPageMixin} this page
         */
        show() {
            if (this._showCount === 0) {
                this.attach()
                this.getPageHTML().addClass('visible')
                GlobalGlass.updateVisibility()
            }

            this._showCount++
            this.reset()

            return this
        }

        /**
         * Hide a previously shown page.
         *
         * This method should be called as many times as its counterpart {@link qui.messages.StickyModalPageMixin#show}
         * method has been called, before it actually hides the page.
         */
        hide() {
            this._showCount--

            if (this._showCount === 0) {
                this.detach()
                this.getPageHTML().removeClass('visible')

                GlobalGlass.updateVisibility()
            }
        }

    }

    return StickyModalPageMixin

})
