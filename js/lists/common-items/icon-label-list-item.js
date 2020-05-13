
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
     * @constructs
     * @param {String} label item label
     * @param {qui.icons.Icon} [icon] item icon
     * @param {...*} args parent class parameters
     */
    constructor({label, icon = null, ...args}) {
        super(args)

        this._icon = icon
        this._label = label
        this._iconElement = null
        this._labelElement = null
        this._containerElement = null
    }

    makeContent() {
        this._containerElement = $('<div></div>', {class: 'qui-icon-label-list-item'})

        this._iconElement = $('<div></div>', {class: 'qui-icon'})
        this._icon = this._applyIcon(this._icon, this._iconElement)
        this._containerElement.append(this._iconElement)

        this._labelElement = $('<span></span>', {class: 'qui-list-item-label'})
        this._labelElement.html(this._label)
        this._containerElement.append(this._labelElement)

        return this._containerElement
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
        this._icon = this._applyIcon(icon, this._iconElement)
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
        this._label = label
        this._labelElement.html(label)
    }

    setSelected(selected) {
        super.setSelected(selected)
        this._containerElement.toggleClass('selected', selected)
    }

}


export default IconLabelListItem
