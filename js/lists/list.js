
import $      from '$qui/lib/jquery.module.js'
import Logger from '$qui/lib/logger.module.js'

import {gettext}             from '$qui/base/i18n.js'
import {mix}                 from '$qui/base/mixwith.js'
import StockIcon             from '$qui/icons/stock-icon.js'
import * as Lists            from '$qui/lists/lists.js'
import {asap}                from '$qui/utils/misc.js'
import * as ObjectUtils      from '$qui/utils/object.js'
import {ProgressViewMixin}   from '$qui/views/common-views.js'
import {StructuredViewMixin} from '$qui/views/common-views.js'
import ViewMixin             from '$qui/views/view.js'


const logger = Logger.get('qui.lists.list')

/**
 * List item match function.
 * @callback qui.lists.ListItemMatchFunc
 * @param {qui.lists.ListItem} item the item to be tested
 * @returns {Boolean} `true` if the item matches the condition, `false` otherwise
 */


/**
 * A list view.
 * @alias qui.lists.List
 * @mixes qui.views.commonviews.StructuredViewMixin
 * @mixes qui.views.commonviews.ProgressViewMixin
 */
class List extends mix().with(ViewMixin, StructuredViewMixin, ProgressViewMixin) {

    /**
     * @constructs
     * @param {qui.lists.ListItem[]} [items] initial list items
     * @param {Boolean} [searchEnabled] set to `true` to enable the search feature (defaults to `false`)
     * @param {Boolean} [addEnabled] set to `true` to enable the add item feature (defaults to `false`)
     * @param {String} [selectMode] one of:
     *  * {@link qui.lists.LIST_SELECT_MODE_DISABLED}
     *  * {@link qui.lists.LIST_SELECT_MODE_SINGLE} (default)
     *  * {@link qui.lists.LIST_SELECT_MODE_MULTIPLE}
     * @param {Boolean} longPressMultipleSelection set to `true` to enable toggling between single and multiple select
     * modes by long pressing items
     * @param {...*} args parent class parameters
     */
    constructor({
        items = [],
        searchEnabled = false,
        addEnabled = false,
        selectMode = Lists.LIST_SELECT_MODE_SINGLE,
        longPressMultipleSelection = false,
        ...args
    } = {}) {

        super(args)

        this._items = items
        this._searchEnabled = searchEnabled
        this._addEnabled = addEnabled
        this._selectMode = selectMode
        this._longPressMultipleSelection = longPressMultipleSelection

        this._addElem = null
        this._searchElem = null
        this._filterInput = null
    }

    makeHTML() {
        return $('<div></div>', {class: 'qui-list'})
    }

    initHTML(html) {
        super.initHTML(html)

        /* Set initial items */
        if (this._items.length) {
            this.setItems(this._items)
        }
    }

    makeBody() {
        let bodyDiv = $('<div></div>', {class: 'list-body'})

        if (this._searchEnabled) {
            this._enableSearch(bodyDiv)
        }

        if (this._addEnabled) {
            this._enableAdd(bodyDiv)
        }

        return bodyDiv
    }


    /* Items */

    /**
     * Return all items.
     * @returns {qui.lists.ListItem[]}
     */
    getItems() {
        return this._items.slice()
    }

    /**
     * Set the items of the list.
     * @param {qui.lists.ListItem[]} items list items
     */
    setItems(items) {
        this.getBody().children('div.qui-list-item').remove()

        items.forEach(i => this._prepareItem(i))
        this._items = items

        this._items.forEach(function (item) {
            item.setList(this)

            if (this._addElem) {
                this._addElem.before(item.getHTML())
            }
            else {
                this.getBody().append(item.getHTML())
            }
        }, this)

        if (this._searchEnabled) {
            this._applySearchFilter()
        }
    }

    /**
     * Update one item.
     * @param {Number} index the index where to perform the update
     * @param {qui.lists.ListItem} item the item to update
     */
    setItem(index, item) {
        this._prepareItem(item)

        this.getBody().children(`div.qui-list-item:eq(${index})`).replaceWith(item.getHTML())
        this._items[index] = item

        if (this._searchEnabled) {
            this._applySearchFilter()
        }

        item.setList(this)
    }

    /**
     * Add one item to the list.
     * @param {Number} index the index where the item should be added; `-1` will add the item at the end
     * @param {qui.lists.ListItem} item the item
     */
    addItem(index, item) {
        this._prepareItem(item)

        item.setList(this)

        if (index < 0 || !this._items.length) {
            if (this._addElem) {
                this._addElem.before(item.getHTML())
            }
            else {
                this.getBody().append(item.getHTML())
            }

            this._items.push(item)
        }
        else {
            this.getBody().children(`div.qui-list-item:eq(${index})`).before(item.getHTML())
            this._items.splice(index, 0, item)
        }

        if (this._searchEnabled) {
            this._applySearchFilter()
        }
    }

    /**
     * Remove the item at a given index.
     * @param {Number} index the index of the item to remove
     * @returns {?qui.lists.ListItem} the removed item
     */
    removeItemAt(index) {
        this.getBody().children(`div.qui-list-item:eq(${index})`).remove()

        return this._items.splice(index, 1)[0] || null
    }

    /**
     * Remove all items that match a condition.
     * @param {qui.lists.ListItemMatchFunc} matchFunc
     * @returns {qui.lists.ListItem[]} the removed items
     */
    removeItems(matchFunc) {
        return this._items.slice().filter(function (item, i) {
            if (!matchFunc(item)) {
                return false
            }

            this.getBody().children(`div.qui-list-item:eq(${i})`).remove()
            this._items.splice(i, 1)
        }, this)
    }

    _prepareItem(item) {
        let html = item.getHTML()

        html.on('click', this._handleItemClick.bind(this, item))
        html.longpress(function () {

            if (!this._longPressMultipleSelection) {
                return
            }

            // TODO: replace jQuery longpress plugin with a simple, more integrated long press event manager
            if (this._selectMode === Lists.LIST_SELECT_MODE_SINGLE) {
                this.setSelectMode(Lists.LIST_SELECT_MODE_MULTIPLE)
                let selectedItems = this.getSelectedItems()
                if (!selectedItems.includes(item)) {
                    selectedItems.push(item)
                    this.setSelectedItems(selectedItems)
                }
            }
            else if (this._selectMode === Lists.LIST_SELECT_MODE_MULTIPLE) {
                this.setSelectMode(Lists.LIST_SELECT_MODE_SINGLE)
                this.setSelectedItems([item])
            }

            item._wasLongPressed = true

        }.bind(this))
    }

    _handleItemClick(item) {
        /* Flag to prevent handling clicks on long press */
        if (item._wasLongPressed) {
            item._wasLongPressed = false
            return
        }

        if (this._selectMode === Lists.LIST_SELECT_MODE_DISABLED) {
            return
        }

        let oldItems = this._items.filter(i => i.isSelected())
        let newItems = []
        let addedItems = []
        let removedItems = []

        if (this._selectMode === Lists.LIST_SELECT_MODE_MULTIPLE) {
            /* In multi-selection mode, simply add/remove new item to/from selection */
            if (oldItems.includes(item)) {
                newItems = oldItems.filter(i => i !== item)
                removedItems.push(item)
            }
            else {
                newItems = oldItems.concat([item])
                addedItems.push(item)
            }
        }
        else { /* Assuming Lists.LIST_SELECT_MODE_SINGLE */
            newItems.push(item)
            removedItems = oldItems
            addedItems.push(item)
        }

        if (ObjectUtils.deepEquals(oldItems, newItems)) {
            return /* Selection unchanged */
        }

        let promise = this.onSelectionChange(oldItems, newItems) || Promise.resolve()

        promise.then(function () {
            try {
                removedItems.forEach(i => i.setSelected(false))
                addedItems.forEach(i => i.setSelected(true))
            }
            catch (e) {
                logger.errorStack('setSelected failed', e)
            }
        }).catch(function (e) {
            if (e == null) {
                logger.debug('selection change rejected')
            }
            else {
                throw e
            }
        })
    }


    /* Add feature */

    /**
     * Tell if the add feature is enabled
     * @returns {Boolean}
     */
    isAddEnabled() {
        return this._addEnabled
    }

    /**
     * Enable the search feature.
     */
    enableAdd() {
        if (this._addEnabled) {
            return
        }

        this._addEnabled = true
        this._enableAdd(this.getBody())
    }

    _enableAdd(element) {
        this._addElem = this._makeAddElem()
        element.append(this._addElem)
        element.addClass('add-enabled')
    }

    /**
     * Disable the add feature.
     */
    disableAdd() {
        if (!this._addEnabled) {
            return
        }

        this._addEnabled = false
        this._disableAdd()
    }

    _disableAdd() {
        this._addElem.remove()
        this._addElem = null
        this.getBody().removeClass('add-enabled')
    }

    _makeAddElem() {
        let addElem = $('<div></div>', {class: 'qui-base-button qui-list-child qui-list-add'})
        let addIcon = $('<div></div>', {class: 'qui-icon'})
        addElem.append(addIcon)
        new StockIcon({name: 'plus', variant: 'interactive'}).applyTo(addIcon)

        addElem.on('click', function () {

            let promise = this.onAdd()
            promise = promise || Promise.resolve()
            promise.then(function () {
                try {
                    this._items.forEach(i => i.setSelected(false))
                }
                catch (e) {
                    logger.errorStack('setSelected failed', e)
                }
            }.bind(this)).catch(function (e) {
                if (e == null) {
                    logger.debug('add rejected')
                }
                else {
                    throw e
                }
            })

        }.bind(this))

        return addElem
    }

    /**
     * Override this to define the behavior of the list when the add button is pressed.
     * @returns {?Promise} an optional promise which, if rejected with no argument, will cancel adding
     */
    onAdd() {
    }


    /* Search feature */

    _makeSearchElem() {
        let list = this

        let searchElem = $('<div></div>', {class: 'qui-list-child qui-list-search'})

        let searchInput = $('<input>', {type: 'text'})
        searchInput.attr('placeholder', gettext('search...'))

        let searchWrapper = $('<div></div>', {class: 'qui-list-search-wrapper'})
        searchWrapper.append(searchInput)
        searchElem.append(searchWrapper)

        let searchIcon = $('<div></div>', {class: 'qui-icon'})
        new StockIcon({
            name: 'magnifier', variant: 'interactive',
            activeName: 'magnifier', activeVariant: 'interactive',
            focusedName: 'close', focusedVariant: 'background'
        }).applyTo(searchIcon)

        searchWrapper.append(searchIcon)

        searchInput.on('keydown', function (e) {
            if (e.which === 27) {
                if (list._filterInput.val().length) {
                    list._clearSearch()
                }
                else {
                    list._filterInput.blur()
                }
            }
        })

        searchInput.on('keyup', function () {
            list._applySearchFilter()
        })

        searchInput.on('paste', function () {
            list._applySearchFilter()
        })

        searchIcon.on('pointerdown', function () {
            if (searchInput.is(':focus')) {
                searchInput.blur()
                list._clearSearch()
                return false
            }
            else {
                asap(function () {
                    searchInput.focus()
                })
            }
        })

        return searchElem
    }

    _applySearchFilter() {
        if (!this._filterInput) {
            this._items.filter(i => i.isHidden()).forEach(i => i.show())
            return
        }

        let searchText = this._filterInput.val().trim().toLowerCase()
        this._items.forEach(function (item) {
            if (item.isMatch(searchText)) {
                if (item.isHidden()) {
                    item.show()
                }
            }
            else {
                if (!item.isHidden()) {
                    item.hide()
                }
            }
        })
    }

    _clearSearch() {
        this._filterInput.val('')
        this._applySearchFilter()
    }

    /**
     * Tell if the search feature is enabled
     * @returns {Boolean}
     */
    isSearchEnabled() {
        return this._searchEnabled
    }

    /**
     * Enable the search feature.
     */
    enableSearch() {
        if (this._searchEnabled) {
            return
        }

        this._searchEnabled = true
        this._enableSearch(this.getBody())
    }

    _enableSearch(element) {
        this._searchElem = this._makeSearchElem()
        this._filterInput = this._searchElem.find('input[type=text]')
        element.prepend(this._searchElem)
        element.addClass('search-enabled')
    }

    /**
     * Disable the search feature.
     */
    disableSearch() {
        if (!this._searchEnabled) {
            return
        }

        this._searchEnabled = false
        this._disableSearch()
    }

    _disableSearch() {
        this._searchElem.remove()
        this._searchElem = null
        this.getBody().removeClass('search-enabled')
        this.getBody().children('div.qui-list-item').removeClass('hidden')
    }


    /* Selection */

    /**
     * Set selection mode.
     * @param {String} selectMode one of:
     *  * {@link qui.lists.LIST_SELECT_MODE_DISABLED}
     *  * {@link qui.lists.LIST_SELECT_MODE_SINGLE} (default)
     *  * {@link qui.lists.LIST_SELECT_MODE_MULTIPLE}
     */
    setSelectMode(selectMode) {
        this._selectMode = selectMode

        let selectedItems = this._items.filter(i => i.isSelected())

        if (this._selectMode === Lists.LIST_SELECT_MODE_DISABLED) {
            selectedItems.forEach(i => i.setSelected(false))
        }
        else if (this._selectMode === Lists.LIST_SELECT_MODE_SINGLE) {
            if (selectedItems.length > 1) {
                selectedItems.slice(1).forEach(i => i.setSelected(false))
            }
        }
    }

    /**
     * Return the currently selected items.
     * @returns {qui.lists.ListItem[]}
     */
    getSelectedItems() {
        return this._items.filter(i => i.isSelected())
    }

    /**
     * Updates current selection.
     * @param {qui.lists.ListItem[]} items the list of new items to select; empty list clears selection
     */
    setSelectedItems(items) {
        if (this._selectMode === Lists.LIST_SELECT_MODE_DISABLED) {
            return
        }
        else if (this._selectMode === Lists.LIST_SELECT_MODE_SINGLE) {
            if (items.length > 1) {
                items = items.slice(0, 1) /* Keep only first element in single selection mode */
            }
        }

        let selectedItems = this._items.filter(i => i.isSelected())

        /* Remove selection from items no longer selected */
        selectedItems.filter(i => !items.includes(i)).forEach(i => i.setSelected(false))

        /* Add selection to newly selected items */
        items.filter(i => !selectedItems.includes(i)).forEach(i => i.setSelected(true))
    }

    /**
     * Called when the current selection is changed by user.
     * @param {qui.lists.ListItem[]} oldItems the previously selected items (can be empty)
     * @param {qui.lists.ListItem[]} newItems the new selected items (can be empty)
     * @returns {?Promise} an optional promise which, if rejected with no argument, will cancel the selection change
     */
    onSelectionChange(oldItems, newItems) {
    }

}


export default List
