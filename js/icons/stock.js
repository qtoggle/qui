
import * as DefaultStock from './default-stock.js'


/**
 * An icon stock.
 * @alias qui.icons.Stock
 */
class Stock {

    /**
     * @constructs qui.icons.Stock
     * @param {String} src image source (normally a URL)
     * @param {String} unit unit of measurement for icon size (e.g. `"em"`, `"rem"`, `"px"`)
     * @param {Number} size icon size with respect to the `unit` (the icon is assumed to be a square)
     * @param {Number} width the number of icons in a row present in the source
     * @param {Number} height the number of icon rows present in the source
     * @param {Object<String,Number>} names a mapping associating each icon name to its horizontal offset
     * @param {?Object<String,Number>} [variants] a mapping associating each icon variant to its vertical offset; the
     * variants of the default stock ({@link qui.icons.defaultstock} are used if not supplied
     * @param {Object<String,String>} [variantAliases] an optional mapping of aliases to icon variants; the variant
     * aliases of the default stock ({@link qui.icons.defaultstock} are used if not supplied
     *
     */
    constructor({src, unit, size, width, height, names, variants = null, variantAliases = {}}) {
        this.src = src
        this.unit = unit
        this.size = size
        this.width = width
        this.height = height
        this.names = names
        this.variants = variants
        this.variantAliases = variantAliases
    }

    /**
     * Make the stock ready to be used by ensuring all its properties are prepared.
     */
    prepare() {
        /* Copy variants from default stock */
        let defaultStock = DefaultStock.get()

        if (!this.variants) {
            this.variants = defaultStock.variants
        }
        if (!this.variantAliases) {
            this.variantAliases = defaultStock.variantAliases
        }
    }

    /**
     * Transform a variant into its corresponding filter and final variant.
     * @param {String} variant
     * @returns {{filter: String, variant: String}}
     */
    parseVariant(variant) {
        /* First resolve any alias */
        let c = 0
        while (variant in this.variantAliases) {
            variant = this.variantAliases[variant]

            /* Prevent loops; allow at most 10 levels of aliasing */
            c++
            if (c > 10) {
                break
            }
        }

        if (!variant) {
            return {
                variant: null,
                filter: null
            }
        }

        let parts = variant.split(' ')
        if (parts.length > 1) {
            return {
                variant: parts[0],
                filter: parts.slice(1).join(' ')
            }
        }
        else {
            return {
                variant: variant,
                filter: null
            }
        }
    }

}


export default Stock
