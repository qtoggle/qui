
const ICON_DATA_ATTR = '_icon'


/**
 * A base class for icons.
 * @alias qui.icons.Icon
 */
class Icon {

    /**
     * @constructs
     * @param {String} [animation] optional icon CSS animation
     */
    constructor({animation = null}) {
        this._animation = animation
    }

    /**
     * Apply the icon to an HTML element.
     * @param {jQuery} element the element to which the icon will be applied
     */
    applyTo(element) {
        this.renderTo(element)
        element.data(ICON_DATA_ATTR, this)

        if (this._animation) {
            element.css('animation', this._animation)
        }
    }

    /**
     * Effectively render the icon onto the HTML element.
     * @param {jQuery} element the element onto which the icon will be rendered
     */
    renderTo(element) {
    }

    /**
     * Return a dictionary of icon attributes that can be passed to constructor.
     * @returns {Object}
     */
    toAttributes() {
        return {
            animation: this._animation
        }
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


export default Icon
