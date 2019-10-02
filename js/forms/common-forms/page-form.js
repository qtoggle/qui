import {mix}            from '$qui/base/mixwith.js'
import StockIcon        from '$qui/icons/stock-icon.js'
import PageMixin        from '$qui/pages/page.js'
import * as ObjectUtils from '$qui/utils/object.js'
import * as Window      from '$qui/window.js'

import Form      from '../form.js'


/**
 * A form that can be used as a page.
 * @alias qui.forms.commonforms.PageForm
 * @extends qui.forms.Form
 * @mixes qui.pages.PageMixin
 * * see {@link qui.forms.Form} for form parameters
 * * see {@link qui.pages.PageMixin} for page parameters
 */
export default class PageForm extends mix(Form).with(PageMixin) {

    constructor({...params}) {
        ObjectUtils.setDefault(params, 'transparent', !Window.isSmallScreen())
        super(params)
    }

    prepareIcon(icon) {
        /* Modal page views should normally have the default foreground icon color, even on small screens */
        if (this.isModal() && (icon instanceof StockIcon)) {
            icon = icon.alterDefault({variant: 'foreground'})
        }

        return super.prepareIcon(icon)
    }

}
