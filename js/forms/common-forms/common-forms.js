/**
 * @namespace qui.forms.commonforms
 */

import OptionsForm from './options-form.js'
import PageForm    from './page-form.js'


export {default as OptionsForm} from './options-form.js'
export {default as PageForm}    from './page-form.js'


export function init() {
    OptionsForm.init()
    PageForm.init()
}
