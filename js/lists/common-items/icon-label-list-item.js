
import $ from '$qui/lib/jquery.module.js'

import StockIcon from '$qui/icons/stock-icon.js'

import ListItem from '../list-item.js'


/**
 * A list item made of an icon and a label.
 * @alias qui.lists.commonitems.IconLabelListItem
 * @extends qui.lists.ListItem
 */
class IconLabelListItem extends ListItem {

    /**
     * @constructs qui.lists.ListItem
     * @param {String} label item label
     * @param {qui.icons.Icon} [icon] item icon
     * @param params
     * * see {@link qui.lists.ListItem} for common list item parameters
     */
    constructor({label, icon = null, ...params}) {
        super(params)

        this._icon = icon
        this._label = label

        this.setContent(this._makeContent(this._icon, this._label))
    }

    _makeContent(icon, label) {
        let iconElement = $('<div class="qui-icon"></div>')
        let labelElement = $('<span class="label"></span>')

        this._applyIcon(icon, iconElement)
        this._setLabel(label, labelElement)

        return iconElement.add(labelElement)
    }

    /**
     * Return the item icon.
     * @returns {?qui.icons.Icon}
     */
    getIcon() {
        return this._icon
    }

    /**
     * Update the item icon.
     * @param {?qui.icons.Icon} icon
     */
    setIcon(icon) {
        let element = this.getHTML().children('div.qui-icon')

        this._icon = this._applyIcon(icon, element)
    }

    _applyIcon(icon, element) {
        if (icon instanceof StockIcon) {
            icon = icon.alterDefault({
                variant: 'interactive',
                activeVariant: 'interactive',
                selectedVariant: 'background'
            })
        }

        if (icon) {
            element.css('display', '')
            icon.applyTo(element)
        }
        else {
            element.css('display', 'none')
        }

        return icon
    }

    /**
     * Return the item label.
     * @returns {String}
     */
    getLabel() {
        return this._label
    }

    /**
     * Update the item label.
     * @param {String} label
     */
    setLabel(label) {
        let element = this.getHTML().children('span.label')

        this._label = this._setLabel(label, element)
    }

    _setLabel(label, element) {
        element.html(label)

        return label
    }

}


export default IconLabelListItem
