
import $ from '$qui/lib/jquery.module.js'

import * as TextInput from './text-input.js' /* Needed */


// TODO do not allow user input of non-numeric characters
$.widget('qui.numericinput', $.qui.textinput, {type: 'number'})
