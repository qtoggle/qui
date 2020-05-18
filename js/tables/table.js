
import {AssertionError} from '$qui/base/errors.js'
import List             from '$qui/lists/list.js'
import * as ObjectUtils from '$qui/utils/object.js'

import SimpleTableCell from './common-cells/simple-table-cell.js'
import TableRow        from './table-row.js'


/**
 * A table view.
 * @alias qui.tables.Table
 * @extends qui.lists.List
 */
class Table extends List {

    /**
     * @constructs
     * @param {Array} [header] optional table header
     * @param {qui.tables.TableRow} [headerRow] optional table header row
     * ({@link qui.tables.commoncells.SimpleTableCell} cells will be used by default)
     * @param {String[]} [widths] table column widths, in percents or absolute values with units
     * @param {String[]} [horizontalAlign] default horizontal cell alignment for each column; a list containing one of:
     *  * {@link qui.tables.TABLE_CELL_ALIGN_LEFT}
     *  * {@link qui.tables.TABLE_CELL_ALIGN_CENTER} (default)
     *  * {@link qui.tables.TABLE_CELL_ALIGN_RIGHT}
     * @param {String[]} [verticalAlign] default vertical cell alignment for each column; a list containing one of:
     *  * {@link qui.tables.TABLE_CELL_ALIGN_TOP}
     *  * {@link qui.tables.TABLE_CELL_ALIGN_CENTER} (default)
     *  * {@link qui.tables.TABLE_CELL_ALIGN_BOTTOM}
     * @param {qui.tables.TableCell[]|Object[]} [rowTemplate] an optional row template to use when adding new rows with
     * {@link qui.tables.Table#addRowValues}; if a list of objects is supplied, each object must contain a `class`
     * property indicating the table cell class, while the rest of properties are used as constructor parameters
     * @param {qui.tables.TableRow[]} [initialRows] initial table rows
     * @param {Array[]} [initialValues] initial table values
     * @param {Boolean} [cardLayout] set to `true` to use card layout (defaults to `false`)
     * @param {...*} args parent class parameters
     */
    constructor({
        header = null,
        headerRow = null,
        widths = null,
        horizontalAlign = null,
        verticalAlign = null,
        rowTemplate = null,
        initialRows = null,
        initialValues = null,
        cardLayout = false,
        ...args
    } = {}) {

        /* Ensure no items are passed via constructor; we have initialRows for that */
        delete args.items

        super(args)

        this._header = header
        this._headerRow = headerRow
        this._widths = widths
        this._horizontalAlign = horizontalAlign
        this._verticalAlign = verticalAlign
        this._rowTemplate = rowTemplate
        this._initialRows = initialRows
        this._initialValues = initialValues
        this._cardLayout = cardLayout

        this._numColumns = null
        this._computedWidths = null
    }

    initHTML(html) {
        super.initHTML(html)

        html.addClass('qui-table')

        if (this._cardLayout) {
            html.addClass('card-layout')
        }
    }

    init() {
        super.init()

        if (this._header) {
            this.prepareHeader()
            this._initialRows = [this._headerRow, ...(this._initialRows || [])]
        }

        if (this._initialRows) {
            this.setItems(this._initialRows)
            delete this._initialRows /* Don't waste memory */
        }

        if (this._initialValues) {
            this.setValues(this._initialValues)
            delete this._initialValues /* Don't waste memory */
        }
    }


    /* Alignment */

    /**
     * Return the default horizontal alignment for each column.
     * @returns {String[]} a list containing one of:
     *  * {@link qui.tables.TABLE_CELL_ALIGN_LEFT}
     *  * {@link qui.tables.TABLE_CELL_ALIGN_CENTER}
     *  * {@link qui.tables.TABLE_CELL_ALIGN_RIGHT}
     */
    getHorizontalAlign() {
        return this._horizontalAlign
    }

    /**
     * Return the default vertical alignment for each column.
     * @returns {String[]} a list containing one of:
     *  * {@link qui.tables.TABLE_CELL_ALIGN_TOP}
     *  * {@link qui.tables.TABLE_CELL_ALIGN_CENTER}
     *  * {@link qui.tables.TABLE_CELL_ALIGN_BOTTOM}
     */
    getVerticalAlign() {
        return this._verticalAlign
    }


    /* Header */

    /**
     * Return the table header row.
     * @returns {?qui.tables.TableRow}
     */
    getHeaderRow() {
        return this._headerRow
    }

    /**
     * Set table header row. If `null` is passed, {@link qui.tables.commoncells.SimpleTableCell} are used to build a
     * table row.
     * @param {?qui.tables.TableRow} headerRow table header row
     */
    setHeaderRow(headerRow) {
        // FIXME: setting header won't work on card layout as a call to prepareItem() for each row would be required

        if (this._headerRow) {
            this.removeItemAt(0)
        }

        this._headerRow = headerRow
        if (this._header) {
            this.prepareHeader()
            this.addRow(0, this._headerRow)
        }
    }

    /**
     * Return the table header.
     * @returns {?Array}
     */
    getHeader() {
        return this._header
    }

    /**
     * Set or clear the table header.
     * @param {?Array} header
     */
    setHeader(header) {
        // FIXME: setting header won't work on card layout as a call to prepareItem() for each row would be required

        if (this._headerRow) {
            this.removeItemAt(0)
        }

        this._header = header
        if (this._header) {
            this.prepareHeader()
            this.addRow(0, this._headerRow)
        }
    }


    /* Rows */

    /**
     * Return all rows.
     * @returns {qui.tables.TableRow[]}
     */
    getRows() {
        let index = this._header != null ? 1 : 0

        return /** @type {qui.tables.TableRow[]} */ this.getItems().slice(index).filter(i => i instanceof TableRow)
    }

    /**
     * Set the rows of the list.
     * @param {qui.tables.TableRow[]} rows table rows
     */
    setRows(rows) {
        if (this._headerRow) {
            rows = [this._headerRow, ...rows]
        }

        this.invalidateColumns()
        this.setItems(rows)
    }

    /**
     * Update one row.
     * @param {Number} index the index where to perform the update
     * @param {qui.tables.TableRow} row the row to update
     */
    setRow(index, row) {
        if (this._header) {
            index++
        }

        this.invalidateColumns()
        this.setItem(index, row)
    }

    /**
     * Add one row to the list.
     * @param {Number} index the index where the row should be added; `-1` will add the row at the end
     * @param {qui.tables.TableRow} row the row
     */
    addRow(index, row) {
        if (this._header && index >= 0) {
            index++
        }

        this.invalidateColumns()
        this.addItem(index, row)
    }

    /**
     * Add one row to the list using row template. Table must have a row template.
     * @param {Number} index the index where the row should be added; `-1` will add the row at the end
     * @param {Array} values values to set to new row
     * @param {*} [data] optional data to pass to row
     * @returns {qui.tables.TableRow} the added row
     */
    addRowValues(index, values, data = null) {
        if (!this._rowTemplate) {
            throw new AssertionError('addRowValues() called on table without row template')
        }

        let cells = this._rowTemplate.map(function (c) {
            let CellClass
            let params = {}
            if (c.class) {
                CellClass = ObjectUtils.pop(c, 'class')
                Object.assign(params, c)
            }
            else {
                CellClass = c
            }

            return new CellClass(params)
        })

        let row = new TableRow({cells, initialValues: values, data})

        this.addRow(index, row)

        return row
    }

    /**
     * Remove the row at a given index.
     * @param {Number} index the index of the row to remove
     * @returns {?qui.tables.TableRow} the removed row
     */
    removeRowAt(index) {
        if (this._header) {
            index++
        }

        this.invalidateColumns()
        return /** @type ?qui.tables.TableRow */ this.removeItemAt(index)
    }

    /**
     * Remove all rows that match a condition.
     * @param {qui.tables.TableRowMatchFunc} matchFunc
     * @returns {qui.tables.TableRow[]} the removed rows
     */
    removeRows(matchFunc) {
        /* Wrap match func to ensure header is never removed */
        let mf = r => matchFunc(r) && (r !== this._headerRow)

        this.invalidateColumns()
        return /** @type qui.tables.TableRow[] */ this.removeItems(/** @type qui.lists.ListItemMatchFunc */ mf)
    }

    prepareItem(item) {
        super.prepareItem(item)

        if (this._cardLayout) {
            /* In card layout, add copies of header cells to each row */
            if (item !== this._headerRow) {
                if (this._headerRow) {
                    let html = item.getHTML()
                    let cellsReversed = this._headerRow.getCells().reverse()
                    cellsReversed.forEach(function (cell) {
                        let cellHTML = cell.getHTML().clone(true)
                        cellHTML.addClass('qui-table-card-layout-header-cell')
                        html.prepend(cellHTML)
                    })
                }
            }
            item.getHTML().css('grid-template-rows', this.getComputedWidths(item).map(_ => '1fr').join(' '))
            item.getHTML().css('grid-template-columns', '1fr 1fr')
        }
        else {
            /* Set column widths */
            item.getHTML().css('grid-template-columns', this.getComputedWidths(item).join(' '))
        }
    }

    prepareHeader() {
        if (!this._headerRow) {
            this._headerRow = new TableRow({cells: this._header.map(_ => new SimpleTableCell())})
        }

        this._headerRow.setList(this)

        /* Override isMatch to ensure header is never filtered out */
        this._headerRow.isMatch = f => !this._cardLayout

        /* Don't allow selecting header */
        this._headerRow.setSelected = s => {}
        this._headerRow.setSelectMode = m => {}

        this._headerRow.getHTML().addClass('qui-table-header')
        this._headerRow.setValues(this._header)

        /* Hide header row on card layout, since header cells will be displayed on every card */
        if (this._cardLayout) {
            this._headerRow.hide()
        }
    }


    /* Selection */

    /**
     * Return the currently selected rows.
     * @returns {qui.tables.TableRow[]}
     */
    getSelectedRows() {
        return this.getRows().filter(r => r.isSelected())
    }

    /**
     * Update current selection.
     * @param {qui.tables.TableRow[]} rows the list of new rows to select; empty list clears selection
     */
    setSelectedRows(rows) {
        this.setSelectedItems(rows)
    }


    /* Columns */

    invalidateColumns() {
        this._numColumns = null
        this._computedWidths = null
    }

    /**
     * Return the number of table columns.
     * @param {qui.tables.TableRow} [row] an optional row about to be added
     * @returns {Number}
     */
    getNumColumns(row = null) {
        if (this._numColumns == null) {
            let rows = this.getRows()
            if (row) {
                rows.push(row)
            }

            this._numColumns = Math.max(...rows.map(r => r.getCells().length))
        }

        return this._numColumns
    }

    /**
     * Set column widths.
     * @param {String[]} widths table column widths, in percents or absolute values with units
     */
    setWidths(widths) {
        this._widths = widths
        this._computedWidths = null

        this.getRows().forEach(r => r.getHTML().css('grid-template-columns', this.getComputedWidths().join(' ')))
    }

    /**
     * Return column widths.
     * @returns {String[]}
     */
    getWidths() {
        return this._widths
    }

    /**
     * Return computed column widths.
     * @param {qui.tables.TableRow} [row] an optional row about to be added
     * @returns {String[]}
     */
    getComputedWidths(row = null) {
        if (this._computedWidths == null) {
            this._computedWidths = this._widths
            let numColumns = this.getNumColumns(row)

            if (this._computedWidths == null) {
                this._computedWidths = []
            }

            while (this._computedWidths.length < numColumns) {
                this._computedWidths.push('1fr')
            }
        }

        return this._computedWidths
    }


    /* Values */

    /**
     * Return the current values of the table.
     * @returns {Array[]}
     */
    getValues() {
        return this.getRows().map(r => r.getValues())
    }

    /**
     * Set table values. If more values than needed are supplied, extra values are ignored. If less values are supplied,
     * extra rows are left unchanged.
     * @param {Array[]} values
     * @param {Number} [index] optional start index (defaults to `0`)
     */
    setValues(values, index = 0) {
        let rows = this.getRows().slice(index, index + values.length)
        rows.forEach((r, i) => r.setValues(values[i]))
    }

}


export default Table
