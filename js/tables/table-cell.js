
import $ from '$qui/lib/jquery.module.js'

import {mix}             from '$qui/base/mixwith.js'
import * as Tables       from '$qui/tables/tables.js'
import VisibilityManager from '$qui/utils/visibility-manager.js'
import ViewMixin         from '$qui/views/view.js'


/**
 * A table cell.
 * @alias qui.tables.TableCell
 * @mixes qui.views.ViewMixin
 */
class TableCell extends mix().with(ViewMixin) {

    /**
     * @constructs
     * @param {*} [initialValue] an optional initial value for the cell
     * @param {?String} [horizontalAlign] horizontal alignment; uses table settings by default; one of:
     *  * {@link qui.tables.TABLE_CELL_ALIGN_LEFT}
     *  * {@link qui.tables.TABLE_CELL_ALIGN_CENTER}
     *  * {@link qui.tables.TABLE_CELL_ALIGN_RIGHT}
     * @param {?String} [verticalAlign] vertical alignment; uses table settings by default; one of:
     *  * {@link qui.tables.TABLE_CELL_ALIGN_TOP}
     *  * {@link qui.tables.TABLE_CELL_ALIGN_CENTER}
     *  * {@link qui.tables.TABLE_CELL_ALIGN_BOTTOM}
     * @param {...*} args parent class parameters
     */
    constructor({
        initialValue = null,
        horizontalAlign = null,
        verticalAlign = null,
        ...args
    } = {}) {

        super(args)

        this._value = initialValue
        this._horizontalAlign = horizontalAlign
        this._verticalAlign = verticalAlign

        this._visibilityManager = null
        this._row = null
    }

    makeHTML() {
        let html = $('<div></div>', {class: 'qui-table-cell'})

        /* Decide on horizontal alignment */
        let horizontalAlign = this._horizontalAlign
        if (!horizontalAlign) {
            let index = this._row.getCellIndex(this)
            if (index >= 0) {
                let defaultHorizontalAlign = this._row.getTable().getHorizontalAlign()
                if (defaultHorizontalAlign) {
                    horizontalAlign = defaultHorizontalAlign[index]
                }
            }
        }
        if (!horizontalAlign) {
            horizontalAlign = Tables.TABLE_CELL_ALIGN_CENTER /* The very default */
        }

        /* Decide on vertical alignment */
        let verticalAlign = this._verticalAlign
        if (!verticalAlign) {
            let index = this._row.getCellIndex(this)
            if (index >= 0) {
                let defaultVerticalAlign = this._row.getTable().getVerticalAlign()
                if (defaultVerticalAlign) {
                    verticalAlign = defaultVerticalAlign[index]
                }
            }
        }
        if (!verticalAlign) {
            verticalAlign = Tables.TABLE_CELL_ALIGN_CENTER /* The very default */
        }

        html.addClass(`horizontal-align-${horizontalAlign}`)
        html.addClass(`vertical-align-${verticalAlign}`)
        html.html(this.makeContent())

        this._visibilityManager = new VisibilityManager({element: html})

        return html
    }

    init() {
        if (this._value != null) {
            this.showValue(this._value)
        }
    }

    /**
     * Implement this method to create the actual table cell content.
     * @abstract
     * @returns {jQuery}
     */
    makeContent() {
    }


    /* Visibility */

    /**
     * Show the cell.
     */
    show() {
        this._visibilityManager.showElement()
    }

    /**
     * Hide the cell.
     */
    hide() {
        this._visibilityManager.hideElement()
    }


    /* Value */

    /**
     * Return the current value.
     * @returns {*}
     */
    getValue() {
        return this._value
    }

    /**
     * Set the current value.
     * @param {*} value
     */
    setValue(value) {
        this._value = value
        this.showValue(value)
    }

    /**
     * Implement this method to display the value in the cell content.
     * @abstract
     * @param {*} value
     */
    showValue(value) {
    }


    /* Selection */

    /**
     * Tell if cell is selected or not.
     */
    isSelected() {
        return this.getHTML().hasClass('selected')
    }

    /**
     * Select or deselect cell.
     * @param {Boolean} selected
     */
    setSelected(selected) {
        this.getHTML().toggleClass('selected', selected)
    }

    /**
     * Set select mode. This is internally called by owning {@link qui.tables.TableRow}.
     * @param {String} selectMode one of:
     *  * {@link qui.lists.LIST_SELECT_MODE_DISABLED}
     *  * {@link qui.lists.LIST_SELECT_MODE_SINGLE} (default)
     *  * {@link qui.lists.LIST_SELECT_MODE_MULTIPLE}
     */
    setSelectMode(selectMode) {
    }


    /* Table row */

    /**
     * Return the owning row.
     * @returns {qui.tables.TableRow}
     */
    getRow() {
        return this._row
    }

    /**
     * Set the owning row.
     * @param {qui.tables.TableRow} row
     */
    setRow(row) {
        this._row = row
    }

}


export default TableCell
