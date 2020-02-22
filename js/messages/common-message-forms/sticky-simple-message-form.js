
import {mix} from '$qui/base/mixwith.js'

import SimpleMessageForm    from './simple-message-form.js'
import StickyModalPageMixin from '../sticky-modal-page.js'


/**
 * A sticky modal variant of {@link qui.messages.commonmessageforms.SimpleMessageForm}.
 * @alias qui.messages.commonmessageforms.StickySimpleMessageForm
 * @extends qui.messages.commonmessageforms.SimpleMessageForm
 * @mixes qui.messages.StickyModalPageMixin
 */
class StickySimpleMessageForm extends mix(SimpleMessageForm).with(StickyModalPageMixin) {

    /**
     * @constructs
     * @param {...*} args parent class parameters
     */
    constructor({...args}) {
        super(args)
    }

}


export default StickySimpleMessageForm
