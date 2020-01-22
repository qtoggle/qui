
import $ from '$qui/lib/jquery.module.js'

import {mix}            from '$qui/base/mixwith.js'
import * as ObjectUtils from '$qui/utils/object.js'

import PageMixin from '../page.js'


/**
 * A modal page with a progress widget and an optional message.
 * @alias qui.pages.commonpages.ModalProgressPage
 * @mixes qui.pages.PageMixin
 */
class ModalProgressPage extends mix().with(PageMixin) {

    /**
     * @constructs qui.pages.commonpages.ModalProgressPage
     * @param {String} [message] an optional progress message
     * @param {Number} [progressPercent] initial progress percent (defaults to `-1`)
     * @param {Object} [progressOptions] extra options for the progress widget
     * @param [params]
     * * see {@link qui.pages.PageMixin} for page parameters
     */
    constructor({message = null, progressPercent = -1, progressOptions = {}, ...params} = {}) {
        params.modal = true

        super(params)

        this._progressPercent = progressPercent
        this._progressOptions = progressOptions
        this._message = message

        this._progressWidget = null
        this._messageContainer = null
    }

    makeHTML() {
        let panelDiv = $('<div class="qui-modal-progress-page-panel"></div>')
        let containerDiv = $('<div class="qui-modal-progress-page-container"></div>')
        containerDiv.append(panelDiv)

        let progressOptions = ObjectUtils.copy(this._progressOptions)
        ObjectUtils.setDefault(progressOptions, 'radius', '2em')
        this._progressWidget = $('<div class="qui-modal-progress-page-progress-widget"></div>')
        this._progressWidget.progressdisk(progressOptions)
        this._progressWidget.progressdisk('setValue', this._progressPercent)

        this._messageContainer = $('<div class="qui-modal-progress-page-message"></div>')
        this._messageContainer.html(this._message)
        this._messageContainer.toggleClass('empty', !this._message)

        panelDiv.append(this._progressWidget).append(this._messageContainer)

        return containerDiv
    }

    /**
     * Update the percent value of the progress widget.
     * @param {Number} percent
     */
    setProgressPercent(percent) {
        this.getPageHTML() /* Ensure all HTML elements are created */

        this._progressPercent = percent
        this._progressWidget.progressdisk('setValue', percent)
    }

    /**
     * Set or clear the progress message.
     * @param {?String} message the message to set, or `null` to clear the existing message
     */
    setMessage(message) {
        this.getPageHTML() /* Ensure all HTML elements are created */

        this._message = message
        this._messageContainer.html(message || '')
        this._messageContainer.toggleClass('empty', !this._message)
    }

}


export default ModalProgressPage
