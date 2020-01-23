
import {mix}               from '$qui/base/mixwith.js'
import {ModalProgressPage} from '$qui/pages/common-pages.js'

import StickyModalPageMixin from './sticky-modal-page.js'


/**
 * A sticky modal progress page.
 * @alias qui.messages.StickyModalProgressMessage
 * @extends qui.pages.commonpages.ModalProgressPage
 * @mixes qui.messages.StickyModalPageMixin
 */
class StickyModalProgressMessage extends mix(ModalProgressPage).with(StickyModalPageMixin) {

    /**
     * @constructs
     * @param {...*} args parent class parameters
     */
    constructor({...args} = {}) {
        super(args)
    }

}


export default StickyModalProgressMessage
