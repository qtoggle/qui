/**
 * @namespace qui.forms.commonforms
 */

import OptionsForm from './common-forms/options-form.js'
import PageForm    from './common-forms/page-form.js'


export {default as OptionsForm} from './common-forms/options-form.js'
export {default as PageForm}    from './common-forms/page-form.js'


export function init() {
    OptionsForm.init()
    PageForm.init()
}
