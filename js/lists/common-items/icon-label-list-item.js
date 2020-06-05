
import {mix}                from '$qui/base/mixwith.js'
import {IconLabelViewMixin} from '$qui/views/common-views/common-views.js'

import ListItem   from '../list-item.js'
import * as Lists from '../lists.js'


/**
 * A list item made of an icon and a label.
 * @alias qui.lists.commonitems.IconLabelListItem
 * @extends qui.lists.ListItem
 * @mixes qui.views.commonviews.IconLabelViewMixin
 */
class IconLabelListItem extends mix(ListItem).with(IconLabelViewMixin) {

    /**
     * @constructs
     * @param {...*} args parent class parameters
     */
    constructor({...args} = {}) {
        super(args)
    }

    makeContent() {
        return this.getIconLabelContainer()
    }

    setSelected(selected) {
        super.setSelected(selected)
        this.getIconLabelContainer().toggleClass('selected', selected)
    }

    setSelectMode(selectMode) {
        this.setClickable(selectMode !== Lists.LIST_SELECT_MODE_DISABLED)
    }

}


export default IconLabelListItem
