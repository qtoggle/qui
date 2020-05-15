
import $ from '$qui/lib/jquery.module.js'

import TableCell from '../table-cell.js'


/**
 * A simple, textual table cell.
 * @alias qui.tables.commoncells.SimpleTableCell
 * @extends qui.tables.TableCell
 */
class SimpleTableCell extends TableCell {

    /**
     * @constructs
     * @param {...*} args parent class parameters
     */
    constructor({...args} = {}) {
        super(args)

        this._element = null
    }

    makeContent() {
        this._element = $('<span></span>', {class: 'qui-simple-table-cell-element'})

        return this._element
    }

    showValue(value) {
        this._element.html(value)
    }

}


export default SimpleTableCell
