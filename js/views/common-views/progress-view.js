
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
         * @param {...*} args parent class parameters
         */
        constructor({...args}) {
            super(args)

            this._glassDiv = $('<div></div>', {class: 'qui-progress-view-glass'})
            this._glassVisibilityManager = new VisibilityManager({
                element: this._glassDiv
            })
            this._glassVisibilityManager.hideElement()

            this._progressWidget = $('<div></div>', {class: 'qui-progress-view-widget'}).progressdisk({radius: '2em'})
            this._glassDiv.append(this._progressWidget)
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

    }

    return ProgressViewMixin

})


export default ProgressViewMixin
