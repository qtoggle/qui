
import {mix}                from '$qui/base/mixwith.js'
import * as StringUtils     from '$qui/utils/string.js'
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

        this._matchPhrase = null
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

    /**
     * Return the text a search filter is matched against: the label and the sub-label joined in the order in which
     * they are displayed, so that a filter can span both.
     * @returns {String}
     */
    getMatchPhrase() {
        if (this._matchPhrase == null) {
            this._matchPhrase = [this.getLabel(), this.getSubLabel()].filter(Boolean).join(' ')
        }

        return this._matchPhrase
    }

    isMatch(filter) {
        return StringUtils.intelliSearch(this.getMatchPhrase(), filter) != null
    }


    /* Override set*Label() to invalidate cached matchPhrase */

    setLabel(label) {
        super.setLabel(label)
        this._matchPhrase = null
    }

    setSubLabel(subLabel) {
        super.setSubLabel(subLabel)
        this._matchPhrase = null
    }

}


export default IconLabelListItem
