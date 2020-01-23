
import {mix} from '$qui/base/mixwith.js'

import ConfirmMessageForm   from './confirm-message-form.js'
import StickyModalPageMixin from '../sticky-modal-page.js'


/**
 * A sticky modal variant of {@link qui.messages.commonmessageforms.ConfirmMessageForm}.
 * @alias qui.messages.commonmessageforms.StickyConfirmMessageForm
 * @extends qui.messages.commonmessageforms.ConfirmMessageForm
 * @mixes qui.messages.StickyModalPageMixin
 */
class StickyConfirmMessageForm extends mix(ConfirmMessageForm).with(StickyModalPageMixin) {

    /**
     * @constructs
     * @param {...*} args parent class parameters
     */
    constructor({...args}) {
        super(args)
    }

}


export default StickyConfirmMessageForm
