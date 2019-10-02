import {Mixin}          from '$qui/base/mixwith.js'
import SingletonMixin   from '$qui/base/singleton.js'
import * as GlobalGlass from '$qui/global-glass.js'


export default Mixin((superclass = Object) => {

    /**
     * A mixin for pages that are stuck to the global glass until explicitly removed.
     * @alias qui.messages.StickyModalPageMixin
     * @mixin
     * @mixes qui.base.SingletonMixin
     */
    class StickyModalPageMixin extends SingletonMixin(superclass) {

        constructor(...args) {
            super(...args)
        }

        initPageHTML(html) {
            super.initPageHTML(html)
            html.addClass('sticky')
        }

        close() {
            /* Call the singleton's hide instead of page's close */
            this.constructor.hide()
            this.onClose()
        }

        /**
         * Override this method to indicate how the page is reset to its initial state.
         */
        reset() {
        }

        /**
         * Show the singleton instance of this page class.
         *
         * This is a reentrant method.
         *
         * @returns {qui.messages.StickyModalPageMixin}
         */
        static show() {
            let instance = this.getInstance()
            if (this._showCount === 0) {
                instance.attach()
                instance.getPageHTML().addClass('visible')
                GlobalGlass.updateVisibility()
            }

            this._showCount++
            instance.reset()

            return instance
        }

        /**
         * Hide the previously shown instance of this page class.
         *
         * This method should be called as many times as its counterpart {@link qui.messages.StickyModalPageMixin.show}
         * method has been called, before it actually hides the page.
         */
        static hide() {
            this._showCount--

            if (this._showCount === 0) {
                let instance = this.getInstance()

                instance.detach()
                instance.getPageHTML().removeClass('visible')

                GlobalGlass.updateVisibility()
            }
        }

    }

    // TODO es7 class fields
    StickyModalPageMixin._showCount = 0

    return StickyModalPageMixin

})
