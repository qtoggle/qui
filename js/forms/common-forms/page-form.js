
import {gettext}        from '$qui/base/i18n.js'
import {mix}            from '$qui/base/mixwith.js'
import StockIcon        from '$qui/icons/stock-icon.js'
import PageMixin        from '$qui/pages/page.js'
import * as Sections    from '$qui/sections/sections.js'
import * as ObjectUtils from '$qui/utils/object.js'
import * as Window      from '$qui/window.js'

import Form from '../form.js'


/**
 * A form that can be used as a page.
 * @alias qui.forms.commonforms.PageForm
 * @extends qui.forms.Form
 * @mixes qui.pages.PageMixin
 */
class PageForm extends mix(Form).with(PageMixin) {

    /**
     * @constructs
     * @param {Boolean} [preventUnappliedClose] if set to `true`, the form will try to prevent losing unapplied data
     * when closed, by asking the user for confirmation
     * @param {...*} args parent class parameters
     */
    constructor({preventUnappliedClose = false, ...args} = {}) {
        ObjectUtils.setDefault(args, 'transparent', !Window.isSmallScreen())
        super(args)

        this._preventUnappliedClose = preventUnappliedClose
    }

    prepareIcon(icon) {
        /* Popup page views should normally have the default foreground icon color, even on small screens */
        if (this.isPopup() && (icon instanceof StockIcon)) {
            icon = icon.alterDefault({variant: 'foreground'})
        }

        return super.prepareIcon(icon)
    }

    canClose() {
        if (!this._preventUnappliedClose) {
            return super.canClose()
        }

        let changedFields = this.getChangedFieldNames()
        if (!changedFields.length) {
            return super.canClose()
        }

        /* Dynamically import common-message-forms.js here, because it depends itself on PageForm */
        return import('$qui/messages/common-message-forms/common-message-forms.js').then(function (CommonMessageForms) {
            let message = gettext('Discard changes?')
            return new CommonMessageForms.ConfirmMessageForm({message: message}).show().asPromise()
        })
    }

    handleBecomeCurrent() {
        super.handleBecomeCurrent()
        this._updateVertScroll()
    }

    handleVertScroll() {
        super.handleVertScroll()
        this._updateVertScroll()
    }

    handleResize() {
        super.handleResize()
        this._updateVertScroll()
    }

    _updateVertScroll() {
        let params = this.getVertScrollParams()
        let fixedBottom = (params.maxOffset > 0) && Window.isSmallScreen()
        let fullyScrolled = (params.maxOffset - params.offset <= 1) && Window.isSmallScreen()

        /* Place progress widget in the viewport by pushing it down a bit */
        this.getProgressWidget().css('margin-top', `${params.offset}px`)

        /* Make form buttons always visible */
        this.getHTML().toggleClass('fixed-bottom', fixedBottom)
        this.getHTML().toggleClass('fully-scrolled', fullyScrolled)
    }

    static init() {
        Window.closeSignal.connect(function () {
            /* Go through all current pages and collect page forms. Then see if they have changed fields and, if any of
             * them does and has preventUnappliedClose flag set, try to prevent navigating away from the page */

            let currentSection = Sections.getCurrent()
            if (!currentSection) {
                return
            }

            let context = currentSection.getPagesContext()
            let pages = context.getPages()
            let pageForms = pages.filter(p => p instanceof PageForm)

            if (pageForms.some(f => f.getChangedFieldNames().length > 0 && f._preventUnappliedClose)) {
                return false
            }
        })
    }

}


export default PageForm
