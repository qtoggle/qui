
import $ from '$qui/lib/jquery.module.js'

import {Mixin}           from '$qui/base/mixwith.js'
import VisibilityManager from '$qui/utils/visibility-manager.js'


/** @lends qui.views.commonviews.ProgressViewMixin */
const ProgressViewMixin = Mixin((superclass = Object) => {

    /**
     * A view with progress indicator. Designed to be mixed together with {@link qui.views.ViewMixin}.
     * @alias qui.views.commonviews.ProgressViewMixin
     * @mixin
     */
    class ProgressViewMixin extends superclass {

        /**
         * @constructs
         * @param {Boolean} [verticallyCentered] set to `true` to vertically center the progress widget
         * @param {...*} args parent class parameters
         */
        constructor({verticallyCentered = false, ...args}) {
            super(args)

            this._glassDiv = $('<div></div>', {class: 'qui-progress-view-glass'})
            this._glassVisibilityManager = new VisibilityManager({
                element: this._glassDiv
            })
            this._glassVisibilityManager.hideElement()

            this._progressWidget = $('<div></div>', {class: 'qui-progress-view-widget'}).progressdisk({radius: '2em'})
            if (verticallyCentered) {
                this._progressWidget.addClass('vertically-centered')
            }
            this._progressMessage = $('<span></span>', {class: 'qui-progress-view-message'})

            this._glassDiv.append(this._progressWidget)
            this._glassDiv.append(this._progressMessage)
        }

        initHTML(html) {
            super.initHTML(html)

            html.addClass('qui-progress-view')
            html.append(this._glassDiv)
        }

        showProgress(percent) {
            if (percent == null) {
                percent = -1
            }

            this._glassVisibilityManager.showElement()
            this._progressWidget.progressdisk('setValue', percent)

            this.getHTML().addClass('has-progress')
        }

        hideProgress() {
            this._glassVisibilityManager.hideElement()

            this.getHTML().removeClass('has-progress')
        }

        /**
         * Return the progress disk widget.
         * @returns {jQuery}
         */
        getProgressWidget() {
            return this._progressWidget
        }

        /**
         * Set or clear view's progress message.
         * @param {?String|jQuery} message
         */
        setProgressMessage(message) {
            this._progressMessage.html(message)
        }

    }

    return ProgressViewMixin

})


export default ProgressViewMixin
