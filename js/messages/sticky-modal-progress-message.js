
import {mix}               from '$qui/base/mixwith.js'
import {ModalProgressPage} from '$qui/pages/common-pages.js'

import StickyModalPageMixin from './sticky-modal-page.js'


/**
 * A sticky modal progress page.
 * @alias qui.messages.StickyModalProgressMessage
 * @extends qui.pages.commonpages.ModalProgressPage
 * @mixes qui.messages.StickyModalPageMixin
 * @param {Object} params
 * * see {@link qui.pages.commonpages.ModalProgressPage} for modal progress page parameters
 * * see {@link qui.messages.StickyModalPageMixin} for sticky modal page parameters
 */
export default class StickyModalProgressMessage extends mix(ModalProgressPage).with(StickyModalPageMixin) {

}
