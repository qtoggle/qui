
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
     * @constructs qui.messages.commonmessageforms.StickyConfirmMessageForm
     * @param [params]
     * * see {@link qui.messages.commonmessageforms.ConfirmMessageForm} for confirm message form parameters
     * * see {@link qui.messages.StickyModalPageMixin} for sticky modal page parameters
     */
    constructor({...params} = {}) {
        super(params)
    }

}


export default StickyConfirmMessageForm
