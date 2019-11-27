
import $ from '$qui/lib/jquery.module.js'

import * as TextInput from './text-input.js' /* Needed */


$.widget('qui.phoneinput', $.qui.textinput, {type: 'tel'}) // TODO do not allow user input of non-phone characters
