
import $ from '$qui/lib/jquery.module.js'

import * as TextInput from './text-input.js' /* Needed */


$.widget('qui.emailinput', $.qui.textinput, {type: 'email'})
