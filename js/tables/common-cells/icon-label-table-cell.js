
import {mix}                from '$qui/base/mixwith.js'
import StockIcon            from '$qui/icons/stock-icon.js'
import * as Lists           from '$qui/lists/lists.js'
import {IconLabelViewMixin} from '$qui/views/common-views/common-views.js'

import TableCell from '../table-cell.js'


/**
 * A table cell made of an icon and a label.
 * @alias qui.tables.commoncells.IconLabelTableCell
 * @extends qui.tables.TableCell
 * @mixes qui.views.commonviews.IconLabelViewMixin
 */
class IconLabelTableCell extends mix(TableCell).with(IconLabelViewMixin) {

    /**
     * @constructs
     * @param {...*} args parent class parameters
     */
    constructor({...args} = {}) {
        super(args)

        this._selectMode = null
    }

    makeContent() {
        return this.getIconLabelContainer()
    }

    showValue(value) {
        this.setIcon(value.icon)
        this.setLabel(value.label)
    }

    prepareIcon(icon) {
        if (!(icon instanceof StockIcon)) {
            return icon
        }

        let clickable = (this._selectMode !== Lists.LIST_SELECT_MODE_DISABLED)
        if (clickable) {
            return icon.alterDefault({
                variant: 'interactive',
                activeVariant: 'interactive',
                selectedVariant: 'background'
            })
        }
        else {
            return super.prepareIcon(icon)
        }
    }

    setSelectMode(selectMode) {
        /* Override setSelectMode to simply know what select mode the list has and to adjust the icon accordingly */
        this._selectMode = selectMode
        this.updateIcon()
    }

    setSelected(selected) {
        this.getIconLabelContainer().toggleClass('selected', selected)
    }

}


export default IconLabelTableCell
