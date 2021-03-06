
import {Mixin}               from '$qui/base/mixwith.js'
import {mix}                 from '$qui/base/mixwith.js'
import StockIcon             from '$qui/icons/stock-icon.js'
import {StructuredViewMixin} from '$qui/views/common-views/common-views.js'

import PageMixin from '../page.js'


/** @lends qui.pages.commonpages.StructuredPageMixin */
const StructuredPageMixin = Mixin((superclass = Object) => {

    /**
     * A mixin that combines {@link qui.views.commonviews.StructuredViewMixin} and {@link qui.pages.PageMixin}.
     * @alias qui.pages.commonpages.StructuredPageMixin
     * @mixin
     * @extends qui.views.commonviews.StructuredViewMixin
     * @mixes qui.pages.PageMixin
     */
    class StructuredPageMixin extends mix(StructuredViewMixin(superclass)).with(PageMixin) {

        /**
         * @constructs
         * @param {...*} args parent class parameters
         */
        constructor({...args} = {}) {
            super(args)
        }

        prepareIcon(icon) {
            /* Popup page views should normally have the default foreground icon color, even on small screens */
            if (this.isPopup() && (icon instanceof StockIcon)) {
                icon = icon.alterDefault({variant: 'foreground'})
            }

            return super.prepareIcon(icon)
        }

    }

    return StructuredPageMixin

})


export default StructuredPageMixin
