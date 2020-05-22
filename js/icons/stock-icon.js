
import {AssertionError} from '$qui/base/errors.js'
import * as ObjectUtils from '$qui/utils/object.js'

import * as DefaultStock     from './default-stock.js'
import Icon                  from './icon.js'
import MultiStateSpritesIcon from './multi-state-sprites-icon.js'
import * as Stocks           from './stocks.js'


/**
 * An icon defined by stock attributes.
 * @alias qui.icons.StockIcon
 * @extends qui.icons.Icon
 */
class StockIcon extends Icon {

    /**
     * @constructs
     * @param {String} name the icon name (in normal state)
     * @param {String} [stockName] the name of the stock (defaults to `qui`)
     * @param {String} [variant] the icon variant (in normal state)
     * @param {String} [activeName] the icon name in active state
     * @param {String} [activeVariant] the icon variant in active state
     * @param {String} [focusedName] the icon name in focused state
     * @param {String} [focusedVariant] the icon variant in focused state
     * @param {String} [selectedName] the icon name in selected state
     * @param {String} [selectedVariant] the icon variant in selected state
     * @param {Number} [scale] icon scaling factor (defaults to `1`)
     * @param {String} [decoration] icon decoration
     * @param {...*} args parent class parameters
     */
    constructor({
        name,
        stockName = DefaultStock.NAME,
        variant = null,
        activeName = null,
        activeVariant = null,
        focusedName = null,
        focusedVariant = null,
        selectedName = null,
        selectedVariant = null,
        scale = 1,
        decoration = null,
        ...args
    }) {
        super({...args})

        this._name = name
        this._stockName = stockName
        this._variant = variant
        this._activeName = activeName
        this._activeVariant = activeVariant
        this._focusedName = focusedName
        this._focusedVariant = focusedVariant
        this._selectedName = selectedName
        this._selectedVariant = selectedVariant
        this._scale = scale
        this._decoration = decoration

        /* A variant is specified but no corresponding name */
        if (this._activeVariant && !this._activeName) {
            this._activeName = this._name
        }
        if (this._focusedVariant && !this._focusedName) {
            this._focusedName = this._name
        }
        if (this._selectedVariant && !this._selectedName) {
            this._selectedName = this._name
        }

        /* A name is specified but no corresponding variant */
        if (this._activeName && !this._activeVariant) {
            this._activeVariant = this._variant
        }
        if (this._focusedName && !this._focusedVariant) {
            this._focusedVariant = this._variant
        }
        if (this._selectedName && !this._selectedVariant) {
            this._selectedVariant = this._variant
        }
    }

    toAttributes() {
        return Object.assign(super.toAttributes(), {
            name: this._name,
            stockName: this._stockName,
            variant: this._variant,
            activeName: this._activeName,
            activeVariant: this._activeVariant,
            focusedName: this._focusedName,
            focusedVariant: this._focusedVariant,
            selectedName: this._selectedName,
            selectedVariant: this._selectedVariant,
            scale: this._scale,
            decoration: this._decoration
        })
    }

    /**
     * Return a dictionary with attributes suitable to build a {@link qui.icons.MultiStateSpritesIcon}.
     * @returns {?qui.icons.MultiStateSpritesIcon}
     */
    toMultiStateSpritesIcon() {
        let stock = Stocks.get(this._stockName)
        if (!stock) {
            return null
        }

        let attributes = Object.assign(super.toAttributes(), {
            url: stock.src,
            bgWidth: stock.width,
            bgHeight: stock.height,
            size: stock.size,
            unit: stock.unit
        })

        let states = {}
        let filterVariant

        if (this._name) {
            filterVariant = stock.parseVariant(this._variant)
            states['normal'] = {
                offsetX: stock.names[this._name],
                offsetY: stock.variants[filterVariant.variant],
                filter: filterVariant.filter
            }
        }

        if (this._activeName) {
            filterVariant = stock.parseVariant(this._activeVariant)
            states['active'] = {
                offsetX: stock.names[this._activeName],
                offsetY: stock.variants[filterVariant.variant],
                filter: filterVariant.filter
            }
        }

        if (this._focusedName) {
            filterVariant = stock.parseVariant(this._focusedVariant)
            states['focused'] = {
                offsetX: stock.names[this._focusedName],
                offsetY: stock.variants[filterVariant.variant],
                filter: filterVariant.filter
            }
        }

        if (this._selectedName) {
            filterVariant = stock.parseVariant(this._selectedVariant)
            states['selected'] = {
                offsetX: stock.names[this._selectedName],
                offsetY: stock.variants[filterVariant.variant],
                filter: filterVariant.filter
            }
        }

        attributes.states = states

        if (this._scale) {
            attributes.scale = this._scale
        }
        if (this._decoration) {
            attributes.decoration = this._decoration
        }

        return new MultiStateSpritesIcon(attributes)
    }

    /**
     * Return an updated version of the icon by altering some of the attributes.
     * @param {Object} attributes the attributes to alter
     * @returns qui.icons.StockIcon
     */
    alter(attributes) {
        return new this.constructor(Object.assign(this.toAttributes(), attributes))
    }

    /**
     * Return an updated version of the icon by altering some of the attributes only if they are unset (`null`).
     *
     * This method allows creating an icon by providing default attribute values.
     *
     * @param {Object} attributes the attributes to alter
     * @returns qui.icons.StockIcon
     */
    alterDefault(attributes) {
        /* Keep only attributes whose value is currently null */
        attributes = ObjectUtils.filter(attributes, (key) => (this[`_${key}`] == null))

        return this.alter(attributes)
    }

    /**
     * Alter a stock icon that has already been applied to an element, in place.
     * @param {jQuery} element
     * @param {Object} attributes the attributes to alter
     */
    static alterElement(element, attributes) {
        let icon = Icon.getFromElement(element)
        if (!icon) {
            throw new AssertionError('Attempt to alter element without icon')
        }

        if (!(icon instanceof StockIcon)) {
            throw new AssertionError('Attempt to alter an icon that is not StockIcon')
        }

        icon = icon.alter(attributes)
        icon.applyTo(element)
    }

    renderTo(element) {
        this.toMultiStateSpritesIcon().applyTo(element)
    }

}


export default StockIcon
