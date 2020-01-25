
import {Mixin}               from '$qui/base/mixwith.js'
import {mix}                 from '$qui/base/mixwith.js'
import StockIcon             from '$qui/icons/stock-icon.js'
import {StructuredViewMixin} from '$qui/views/common-views.js'

import PageMixin from '../page.js'


const __FIX_JSDOC = null /* without this, JSDoc considers following symbol undocumented */


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
            /* Modal page views should normally have the default foreground icon color, even on small screens */
            if (this.isModal() && (icon instanceof StockIcon)) {
                icon = icon.alterDefault({variant: 'foreground'})
            }

            return super.prepareIcon(icon)
        }

    }

    return StructuredPageMixin

})


export default StructuredPageMixin
