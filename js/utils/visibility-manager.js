
import * as Theme from '$qui/theme.js'
import {asap}     from '$qui/utils/misc.js'


const __FIX_JSDOC = null /* without this, JSDoc considers following symbol undocumented */


/**
 * A class that resolves the problem of waiting an async iteration before applying styles with transitions, after
 * changing the `display` style property.
 * @alias qui.utils.VisibilityManager
 */
class VisibilityManager {

    /**
     * @constructs
     * @param {jQuery} element the element to be managed
     * @param {String} [visibleDisplay] the display style property when element is visible; by default will be taken
     * from current element's display
     * @param {String} [hiddenDisplay] the display style property when element is hidden; defaults to `"none"`
     * @param {?String} [visibleClass] the class(es) to add to element when it's visible; defaults to `"visible"`
     * @param {?String} [hiddenClass] the class(es) to add to element when it's hidden; defaults to `null`
     * @param {Number} [transitionDuration] the duration of the transition, in milliseconds; defaults to
     * {@link qui.theme.getTransitionDuration}
     */
    constructor({
        element,
        visibleDisplay = null,
        hiddenDisplay = 'none',
        visibleClass = 'visible',
        hiddenClass = null,
        transitionDuration = Theme.getTransitionDuration()
    }) {

        this._element = element
        this._visibleDisplay = visibleDisplay != null ? visibleDisplay : window.getComputedStyle(element[0]).display
        this._hiddenDisplay = hiddenDisplay
        this._visibleClass = visibleClass
        this._hiddenClass = hiddenClass
        this._transitionDuration = transitionDuration

        this._visibleAfterTransition = element.hasClass(visibleClass)
        this._timeoutHandle = null
    }

    showElement() {
        if (this._visibleAfterTransition) {
            return
        }
        this._visibleAfterTransition = true

        if (this._timeoutHandle) {
            clearTimeout(this._timeoutHandle)
        }

        this._element.css('display', this._visibleDisplay)
        this._timeoutHandle = asap(function () {
            this._timeoutHandle = null
            this._element.addClass(this._visibleClass || '')
            this._element.removeClass(this._hiddenClass || '')
        }.bind(this))
    }

    hideElement() {
        if (!this._visibleAfterTransition) {
            return
        }
        this._visibleAfterTransition = false

        if (this._timeoutHandle) {
            clearTimeout(this._timeoutHandle)
        }

        this._element.removeClass(this._visibleClass || '')
        this._element.addClass(this._hiddenClass || '')
        this._timeoutHandle = setTimeout(function () {
            this._timeoutHandle = null
            this._element.css('display', this._hiddenDisplay)
        }.bind(this), this._transitionDuration)
    }

}

export default VisibilityManager
