
import $ from '$qui/lib/jquery.module.js'

import ListItem   from '$qui/lists/list-item.js'
import * as Lists from '$qui/lists/lists.js'


/**
 * A table row.
 * @alias qui.tables.TableRow
 * @extends qui.lists.ListItem
 */
class TableRow extends ListItem {

    /**
     * @constructs
     * @param {qui.tables.TableCell[]} cells table cells
     * @param {Array} [initialValues] optional initial values
     * @param {...*} args parent class parameters
     */
    constructor({cells, initialValues = null, ...args}) {
        super(args)

        this._cells = cells
        this._initialValues = initialValues

        this._cells.forEach(c => this.prepareCell(c))
    }

    init() {

        if (this._initialValues != null) {
            this.setValues(this._initialValues)
            this._initialValues = null /* Don't waste memory */
        }
    }

    initHTML(html) {
        html.addClass('qui-table-row')
    }

    makeContent() {
        return this._cells.reduce((a, c) => a.add(c.getHTML()), $())
    }


    /* Cells */

    /**
     * Return row cells.
     * @returns {qui.tables.TableCell[]}
     */
    getCells() {
        return this._cells.slice()
    }

    /**
     * Prepare cell to be part of this row.
     * @param {qui.tables.TableCell} cell
     */
    prepareCell(cell) {
        cell.setRow(this)
    }

    /**
     * Return the index of the given cell. If the field does not belong to this row, `-1` is returned.
     * @param {qui.tables.TableCell} cell the cell
     * @returns {Number}
     */
    getCellIndex(cell) {
        return this._cells.indexOf(cell)
    }


    /* Values */

    /**
     * Return the current values of the cells.
     * @returns {Array}
     */
    getValues() {
        return this._cells.map(c => c.getValue())
    }

    /**
     * Set row values. If more values than needed are supplied, extra values are ignored. If less values are supplied,
     * extra cells are left unchanged.
     * @param {Array} values
     * @param {Number} [index] optional start index (defaults to `0`)
     */
    setValues(values, index = 0) {
        let cells = this._cells.slice(index, index + values.length)
        cells.forEach((c, i) => c.setValue(values[i]))
    }


    /* Selection */

    setSelectMode(selectMode) {
        /* Forward select mode to cells */
        this._cells.forEach(c => c.setSelectMode(selectMode))

        this.getHTML().toggleClass('qui-base-button', selectMode !== Lists.LIST_SELECT_MODE_DISABLED)
    }

    setSelected(selected) {
        super.setSelected(selected)

        this._cells.forEach(c => c.setSelected(selected))
    }


    /* Table */

    /**
     * Return the owning table.
     * @returns {qui.tables.Table}
     */
    getTable() {
        return /** @type qui.tables.Table */ this.getList()
    }

}


export default TableRow
