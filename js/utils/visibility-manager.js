
import * as Theme from '$qui/theme.js'
import {asap}     from '$qui/utils/misc.js'


/**
 * A class that resolves the problem of waiting an async iteration before applying styles with transitions, after
 * changing the `display` style property.
 * @alias qui.utils.VisibilityManager
 */
class VisibilityManager {

    /**
     * @constructs
     * @param {jQuery} element the element to be managed
     * @param {String} [visibleDisplay] the display style property when element is visible; defaults to `""`
     * @param {String} [hiddenDisplay] the display style property when element is hidden; defaults to `"none"`
     * @param {?String} [visibleClass] the class(es) to add to element when it's visible; defaults to `"visible"`
     * @param {?String} [hiddenClass] the class(es) to add to element when it's hidden; defaults to `"hidden"`
     * @param {Boolean} [widthTransition] set to `true` if width should be transitioned while hiding/showing
     * @param {Boolean} [heightTransition] set to `true` if height should be transitioned while hiding/showing
     * @param {Number} [transitionDuration] the duration of the transition, in milliseconds; defaults to
     * {@link qui.theme.getTransitionDuration()}
     */
    constructor({
        element,
        visibleDisplay = '',
        hiddenDisplay = 'none',
        visibleClass = 'visible',
        hiddenClass = 'hidden',
        widthTransition = false,
        heightTransition = false,
        transitionDuration = Theme.getTransitionDuration()
    }) {

        let currentDisplay = element.css('display') || window.getComputedStyle(element[0]).display

        this._element = element
        this._visibleDisplay = visibleDisplay != null ? visibleDisplay : currentDisplay
        this._hiddenDisplay = hiddenDisplay
        this._visibleClass = visibleClass
        this._hiddenClass = hiddenClass
        this._widthTransition = widthTransition
        this._heightTransition = heightTransition

        this._transitionDuration = transitionDuration

        /* Autodetect initial visibility */
        this._visibleAfterTransition = !this._hiddenDisplay || (currentDisplay !== this._hiddenDisplay)

        this._transitionHandle = null
        this._asapHandle = null
    }

    /**
     * Show element.
     */
    showElement() {
        if (this._visibleAfterTransition) {
            return
        }
        this._visibleAfterTransition = true

        if (this._transitionHandle) {
            clearTimeout(this._transitionHandle)
            this._transitionHandle = null
        }
        if (this._asapHandle) {
            clearTimeout(this._asapHandle)
            this._asapHandle = null
        }

        this._element.css('display', this._visibleDisplay)

        /* If element is not yet part of DOM, don't bother with transitions */
        if (!this._isAddedToDOM()) {
            this._element.addClass(this._visibleClass || '')
            this._element.removeClass(
                `${this._hiddenClass || ''} qui-visibility-manager-hidden-width qui-visibility-manager-hidden-height`
            )
            if (this._widthTransition) {
                this._element.css('width', '')
            }
            if (this._heightTransition) {
                this._element.css('height', '')
            }

            return
        }

        /* Handle special case where element has been hidden while not part of DOM and thus has width/height 0px */
        if (this._widthTransition && this._element.css('width') === '0px') {
            this._element.css('width', '')
            this._element.removeClass('qui-visibility-manager-hidden-width')
            this._element.css('width', this._element.width())
            this._element.addClass('qui-visibility-manager-hidden-width')
        }
        if (this._heightTransition && this._element.css('height') === '0px') {
            this._element.css('height', '')
            this._element.removeClass('qui-visibility-manager-hidden-height')
            this._element.css('height', this._element.height())
            this._element.addClass('qui-visibility-manager-hidden-height')
        }

        this._asapHandle = asap(function () {

            this._asapHandle = null
            this._element.addClass(this._visibleClass || '')
            this._element.removeClass(
                `${this._hiddenClass || ''} qui-visibility-manager-hidden-width qui-visibility-manager-hidden-height`
            )

            this._transitionHandle = setTimeout(function () {

                this._transitionHandle = null
                if (this._widthTransition) {
                    this._element.css('width', '')
                }
                if (this._heightTransition) {
                    this._element.css('height', '')
                }

            }.bind(this), this._transitionDuration)

        }.bind(this))
    }

    /**
     * Hide element.
     */
    hideElement() {
        if (!this._visibleAfterTransition) {
            return
        }
        this._visibleAfterTransition = false

        if (this._transitionHandle) {
            clearTimeout(this._transitionHandle)
            this._transitionHandle = null
        }
        if (this._asapHandle) {
            clearTimeout(this._asapHandle)
            this._asapHandle = null
        }

        if (this._widthTransition) {
            this._element.css('width', this._element.width())
        }
        if (this._heightTransition) {
            this._element.css('height', this._element.height())
        }

        /* If element is not yet part of DOM, don't bother with transitions */
        if (!this._isAddedToDOM()) {
            this._element.removeClass(this._visibleClass || '')
            this._element.addClass(this._hiddenClass || '')
            if (this._widthTransition) {
                this._element.addClass('qui-visibility-manager-hidden-width')
            }
            if (this._heightTransition) {
                this._element.addClass('qui-visibility-manager-hidden-height')
            }
            this._element.css('display', this._hiddenDisplay)

            return
        }

        let hideAfterTransition = function () {

            this._asapHandle = null
            this._element.removeClass(this._visibleClass || '')
            this._element.addClass(this._hiddenClass || '')
            if (this._widthTransition) {
                this._element.addClass('qui-visibility-manager-hidden-width')
            }
            if (this._heightTransition) {
                this._element.addClass('qui-visibility-manager-hidden-height')
            }

            this._transitionHandle = setTimeout(function () {

                this._transitionHandle = null
                this._element.css('display', this._hiddenDisplay)

            }.bind(this), this._transitionDuration)

        }.bind(this)

        if (this._widthTransition || this._heightTransition) {
            this._asapHandle = asap(hideAfterTransition)
        }
        else {
            hideAfterTransition()
        }
    }

    /**
     * Tell if element is visible or not.
     * @returns {Boolean}
     */
    isElementVisible() {
        return this._visibleAfterTransition
    }

    _isAddedToDOM() {
        return this._element.parents('body').length > 0
    }

}

export default VisibilityManager
