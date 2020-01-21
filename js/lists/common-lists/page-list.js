
import {mix}            from '$qui/base/mixwith.js'
import StockIcon        from '$qui/icons/stock-icon.js'
import PageMixin        from '$qui/pages/page.js'
import * as ObjectUtils from '$qui/utils/object.js'

import List from '../list.js'


/**
 * A list that can be used as a page.
 * @alias qui.lists.PageList
 * @extends qui.lists.List
 * @mixes qui.pages.PageMixin
 * @param {Object} [params]
 * * see {@link qui.lists.List} for list parameters
 * * see {@link qui.pages.PageMixin} for page parameters
 */
class PageList extends mix(List).with(PageMixin) {

    constructor({...params} = {}) {
        ObjectUtils.setDefault(params, 'transparent', false)
        ObjectUtils.setDefault(params, 'topless', true)

        super(params)
    }

    prepareIcon(icon) {
        /* Modal page views should normally have the default foreground icon color, even on small screens */
        if (this.isModal() && (icon instanceof StockIcon)) {
            icon = icon.alterDefault({variant: 'foreground'})
        }

        return super.prepareIcon(icon)
    }

    handleVertScroll() {
        super.handleVertScroll()
        this._updateVertScroll()
    }

    _updateVertScroll() {
        let params = this.getVertScrollParams()

        /* Place progress widget in the viewport by pushing it down a bit */
        this.getProgressWidget().css('margin-top', `${params.offset}px`)
    }

}


export default PageList
