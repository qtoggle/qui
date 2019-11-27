
const ICON_DATA_ATTR = '_icon'


/**
 * A base class for icons.
 * @alias qui.icons.Icon
 * @param {Object} params icon attributes
 */
export default class Icon {

    constructor(params) {
    }

    /**
     * Apply the icon to an HTML element.
     * @param {jQuery} element the element to which the icon will be applied
     */
    applyTo(element) {
        this._applyTo(element)
        element.data(ICON_DATA_ATTR, this)
    }

    _applyTo(element) {
    }

    /**
     * Return the icon that has been previously applied to an element.
     * @param {jQuery} element
     * @returns {?qui.icons.Icon} the icon or `null` if no icon has been applied to element
     */
    static getFromElement(element) {
        return element.data(ICON_DATA_ATTR) || null
    }

}
