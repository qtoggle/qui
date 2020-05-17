
import $ from '$qui/lib/jquery.module.js'

import {Mixin}   from '$qui/base/mixwith.js'
import StockIcon from '$qui/icons/stock-icon.js'


/** @lends qui.views.commonviews.IconLabelViewMixin */
const IconLabelViewMixin = Mixin((superclass = Object) => {

    /**
     * A view made of an icon with a label.
     * @alias qui.views.commonviews.IconLabelViewMixin
     */
    class IconLabelViewMixin extends superclass {

        /**
         * @constructs
         * @param {qui.icons.Icon} [icon] icon
         * @param {String} [label] label
         * @param {Boolean} [clickable] whether to make view clickable or not (defaults to `false`)
         * @param {...*} args parent class parameters
         */
        constructor({icon = null, label = '', clickable = false, ...args} = {}) {
            super(args)

            this._icon = icon
            this._label = label
            this._clickable = clickable
            this._iconElement = null
            this._labelElement = null
            this._iconLabelContainer = null
        }

        /**
         * Create the icon and label container.
         * @returns {jQuery}
         */
        makeIconLabelContainer() {
            let container = $('<div></div>', {class: 'qui-icon-label-view'})

            if (this._clickable) {
                container.addClass('qui-base-button')
            }

            this._iconElement = $('<div></div>', {class: 'qui-icon'})
            this._applyIcon(this._icon, this._iconElement)
            container.append(this._iconElement)

            this._labelElement = $('<span></span>', {class: 'label'})
            this._labelElement.html(this._label)
            container.append(this._labelElement)

            return container
        }

        /**
         * Return the icon and label container.
         * @returns {jQuery}
         */
        getIconLabelContainer() {
            if (this._iconLabelContainer == null) {
                this._iconLabelContainer = this.makeIconLabelContainer()
            }

            return this._iconLabelContainer
        }

        /**
         * Return the icon.
         * @returns {?qui.icons.Icon}
         */
        getIcon() {
            return this._icon
        }

        /**
         * Update the icon.
         * @param {?qui.icons.Icon} icon
         */
        setIcon(icon) {
            this._icon = icon
            this._applyIcon(icon, this._iconElement)
        }

        /**
         * Reapply the icon.
         */
        updateIcon() {
            this._applyIcon(this._icon, this._iconElement)
        }

        /**
         * Prepare the view icon, altering its attributes as needed, before applying it.
         * @param {qui.icons.Icon} icon
         * @returns {qui.icons.Icon}
         */
        prepareIcon(icon) {
            if (!(icon instanceof StockIcon)) {
                return icon
            }

            if (this._clickable) {
                icon = icon.alterDefault({
                    variant: 'interactive',
                    activeVariant: 'interactive',
                    selectedVariant: 'background'
                })
            }
            else {
                icon = icon.alterDefault({variant: 'foreground'})
            }

            return icon
        }

        _applyIcon(icon, element) {
            icon = this.prepareIcon(icon)

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
         * Return the label.
         * @returns {String}
         */
        getLabel() {
            return this._label
        }

        /**
         * Update the label.
         * @param {String} label
         */
        setLabel(label) {
            this._label = label
            this._labelElement.html(label)
        }

        /**
         * Tell if view is clickable.
         * @returns {Boolean}
         */
        isClickable() {
            return this._clickable
        }

        /**
         * Set or clear the clickable flag.
         * @param {Boolean} clickable
         */
        setClickable(clickable) {
            this._clickable = clickable
            this.getIconLabelContainer().toggleClass('qui-base-button', clickable)
            this._applyIcon(this._icon, this._iconElement)
        }

    }

    return IconLabelViewMixin

})


export default IconLabelViewMixin
