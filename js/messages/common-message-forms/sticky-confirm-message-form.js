import {mix} from '$qui/base/mixwith.js'

import ConfirmMessageForm   from './confirm-message-form.js'
import StickyModalPageMixin from '../sticky-modal-page.js'


/**
 * A sticky modal variant of {@link qui.messages.commonmessageforms.ConfirmMessageForm}.
 * @alias qui.messages.commonmessageforms.StickyConfirmMessageForm
 * @extends qui.messages.commonmessageforms.ConfirmMessageForm
 * @mixes qui.messages.StickyModalPageMixin
 * @param {Object} params
 * * see {@link qui.messages.commonmessageforms.ConfirmMessageForm} for confirm message form parameters
 * * see {@link qui.messages.StickyModalPageMixin} for sticky modal page parameters
 */
export default class StickyConfirmMessageForm extends mix(ConfirmMessageForm).with(StickyModalPageMixin) {
}
