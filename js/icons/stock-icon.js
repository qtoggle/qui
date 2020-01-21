
import * as ObjectUtils from '$qui/utils/object.js'

import * as DefaultStock     from './default-stock.js'
import Icon                  from './icon.js'
import MultiStateSpritesIcon from './multi-state-sprites-icon.js'
import * as Stocks           from './stocks.js'


/**
 * An icon defined by stock attributes.
 * @alias qui.icons.StockIcon
 * @extends qui.icons.Icon
 * @param {Object} params
 * @param {String} params.name the icon name (in normal state)
 * @param {String} [params.stockName] the name of the stock (defaults to `qui`)
 * @param {String} [params.variant] the icon variant (in normal state)
 * @param {String} [params.activeName] the icon name in active state
 * @param {String} [params.activeVariant] the icon variant in active state
 * @param {String} [params.focusedName] the icon name in focused state
 * @param {String} [params.focusedVariant] the icon variant in focused state
 * @param {String} [params.selectedName] the icon name in selected state
 * @param {String} [params.selectedVariant] the icon variant in selected state
 * @param {String} [params.scale] icon scaling factor (defaults to `1`)
 * @param {String} [params.decoration] icon decoration
 */
class StockIcon extends Icon {

    constructor({
        name, stockName = DefaultStock.NAME, variant = null, activeName = null, activeVariant = null,
        focusedName = null, focusedVariant = null, selectedName = null, selectedVariant = null,
        scale = 1, decoration = null
    }) {
        super()

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

    /**
     * Return a dictionary with attributes suitable to build a {@link qui.icons.MultiStateSpritesIcon}.
     * @returns {qui.icons.MultiStateSpritesIcon}
     */
    toMultiStateSpritesIcon() {
        let stock = Stocks.get(this._stockName)
        if (!stock) {
            return {}
        }

        let attributes = {
            url: stock.src,
            bgWidth: stock.width,
            bgHeight: stock.height,
            size: stock.size,
            unit: stock.unit
        }

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
        let existingAttributes = {
            stockName: this._stockName,
            name: this._name,
            variant: this._variant,
            activeName: this._activeName,
            activeVariant: this._activeVariant,
            focusedName: this._focusedName,
            focusedVariant: this._focusedVariant,
            selectedName: this._selectedName,
            selectedVariant: this._selectedVariant,
            scale: this._scale,
            decoration: this._decoration
        }

        return new this.constructor(ObjectUtils.combine(existingAttributes, attributes))
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

    _applyTo(element) {
        this.toMultiStateSpritesIcon().applyTo(element)
    }

}


export default StockIcon
