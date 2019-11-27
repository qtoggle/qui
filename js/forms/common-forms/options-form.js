
import * as OptionsBar  from '$qui/main-ui/options-bar.js'
import {getCurrentPage} from '$qui/pages/pages.js'
import * as ObjectUtils from '$qui/utils/object.js'

import Form from '../form.js'


/**
 * A form ready to be used with {@link qui.pages.PageMixin#makeOptionsBarContent}.
 * @alias qui.forms.commonforms.OptionsForm
 * @extends qui.forms.Form
 * @param {Object} params
 * @param {qui.pages.PageMixin} params.page the page associated to this options form
 * * see {@link qui.forms.Form} for form parameters
 */
export default class OptionsForm extends Form {

    constructor({page, ...params}) {
        ObjectUtils.assignDefault(params, {
            compact: true,
            width: 'auto',
            largeTop: false,
            noBackground: true,
            fieldsAlignment: 'sides',
            topless: true,
            continuousValidation: true
        })

        super(params)

        this._page = page
    }

    onChangeValid(data, fieldName) {
        this._page.onOptionsChange(data)
    }

    /**
     * Called when the options bar is opened or closed with this form.
     * @param {Boolean} opened `true` if opened, `false` otherwise
     */
    onOptionsBarOpenClose(opened) {
    }

    proceed() {
        /* Options form has no proceed implementation by default. It makes use of the continuous validation */
    }

    static init() {
        OptionsBar.openCloseSignal.connect(function (opened) {
            let currentPage = getCurrentPage()
            if (!currentPage) {
                return
            }

            /* If OptionsForm class has been used for current options bar content, call a handler */
            let optionsBarContent = currentPage.getOptionsBarContent()
            if (optionsBarContent instanceof OptionsForm) {
                optionsBarContent.onOptionsBarOpenClose(opened)
            }
        })
    }

}
