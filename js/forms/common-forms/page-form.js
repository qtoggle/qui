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
 * @param {Object} params
 * * see {@link qui.forms.Form} for form parameters
 * * see {@link qui.pages.PageMixin} for page parameters
 * @param {Object} [params.preventUnappliedClose] if set to `true`, the form will try to prevent losing unapplied data
 * when closed, by asking the user for confirmation
 */
export default class PageForm extends mix(Form).with(PageMixin) {

    constructor({preventUnappliedClose = false, ...params}) {
        ObjectUtils.setDefault(params, 'transparent', !Window.isSmallScreen())
        super(params)

        this._preventUnappliedClose = preventUnappliedClose
    }

    prepareIcon(icon) {
        /* Modal page views should normally have the default foreground icon color, even on small screens */
        if (this.isModal() && (icon instanceof StockIcon)) {
            icon = icon.alterDefault({variant: 'foreground'})
        }

        return super.prepareIcon(icon)
    }

    canClose() {
        if (!this._preventUnappliedClose) {
            return super.canClose()
        }

        let changedFields = this.getChangedFields()
        if (!changedFields.length) {
            return super.canClose()
        }

        /* Dynamically import common-message-forms.js here, because it depends itself on PageForm */
        return import('$qui/messages/common-message-forms.js').then(function (CommonMessageForms) {
            let message = gettext('Discard changes?')
            let confirmForm = new CommonMessageForms.StickyConfirmMessageForm({message: message})

            return confirmForm.show().asPromise()
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
        Window.addCloseListener(function () {
            /* Go through all current pages and collect page forms. Then see if they have changed fields and, if any of
             * them does and has preventUnappliedClose flag set, try to prevent navigating away from the page */

            let currentSection = Sections.getCurrent()
            if (!currentSection) {
                return
            }

            let context = currentSection.getPagesContext()
            let pages = context.getPages()
            let pageForms = pages.filter(p => p instanceof PageForm)

            if (pageForms.some(f => f.getChangedFields().length > 0 && f._preventUnappliedClose)) {
                return false
            }
        })
    }

}
