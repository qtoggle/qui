
import {mix} from '$qui/base/mixwith.js'

import SimpleMessageForm    from './simple-message-form.js'
import StickyModalPageMixin from '../sticky-modal-page.js'


/**
 * A sticky modal variant of {@link qui.messages.commonmessageforms.SimpleMessageForm}.
 * @alias qui.messages.commonmessageforms.StickySimpleMessageForm
 * @extends qui.messages.commonmessageforms.SimpleMessageForm
 * @mixes qui.messages.StickyModalPageMixin
 */
class StickyConfirmMessageForm extends mix(SimpleMessageForm).with(StickyModalPageMixin) {

    /**
     * @constructs qui.messages.commonmessageforms.StickySimpleMessageForm
     * @param params
     * * see {@link qui.messages.commonmessageforms.SimpleMessageForm} for simple message form parameters
     * * see {@link qui.messages.StickyModalPageMixin} for sticky modal page parameters
     */
    constructor({...params}) {
        super(params)
    }

}


export default StickyConfirmMessageForm
