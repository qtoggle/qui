
import {mix}            from '$qui/base/mixwith.js'
import StockIcon        from '$qui/icons/stock-icon.js'
import PageMixin        from '$qui/pages/page.js'
import * as ObjectUtils from '$qui/utils/object.js'

import Table from '../table.js'

// TODO: PageTable shares a lot of code with PageList; common code could be generalized into a mixin;
//       Maybe it could also be applied to PageForm.

/**
 * A table that can be used as a page.
 * @alias qui.tables.commontables.PageTable
 * @extends qui.tables.Table
 * @mixes qui.pages.PageMixin
 */
class PageTable extends mix(Table).with(PageMixin) {

    /**
     * @constructs
     * @param {...*} args parent class parameters
     */
    constructor({...args} = {}) {
        ObjectUtils.setDefault(args, 'transparent', false)
        ObjectUtils.setDefault(args, 'topless', true)

        super(args)
    }

    prepareIcon(icon) {
        /* Popup page views should normally have the default foreground icon color, even on small screens */
        if (this.isPopup() && (icon instanceof StockIcon)) {
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


export default PageTable
