
import $      from '$qui/lib/jquery.module.js'
import Logger from '$qui/lib/logger.module.js'

import {gettext}             from '$qui/base/i18n.js'
import {mix}                 from '$qui/base/mixwith.js'
import StockIcon             from '$qui/icons/stock-icon.js'
import * as Lists            from '$qui/lists/lists.js'
import * as Theme            from '$qui/theme.js'
import Debouncer             from '$qui/utils/debouncer.js'
import * as Gestures         from '$qui/utils/gestures.js'
import {asap}                from '$qui/utils/misc.js'
import * as StringUtils      from '$qui/utils/string.js'
import {ProgressViewMixin}   from '$qui/views/common-views/common-views.js'
import {StructuredViewMixin} from '$qui/views/common-views/common-views.js'
import ViewMixin             from '$qui/views/view.js'


/* Associates item elements with their items. A WeakMap is used rather than jQuery's element data, which would
 * store the item in an expando on the DOM element itself, creating an item -> element -> item reference cycle. */
const itemsByElement = new WeakMap()

/* How long to wait after the last keystroke before filtering the list, in milliseconds */
const SEARCH_FILTER_DELAY = 100

const logger = Logger.get('qui.lists.list')


/**
 * A list view.
 * @alias qui.lists.List
 * @mixes qui.views.ViewMixin
 * @mixes qui.views.commonviews.StructuredViewMixin
 * @mixes qui.views.commonviews.ProgressViewMixin
 */
class List extends mix().with(ViewMixin, StructuredViewMixin, ProgressViewMixin) {

    /**
     * @constructs
     * @param {qui.lists.ListItem[]} [initialItems] initial list items
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
        initialItems = null,
        searchEnabled = false,
        addEnabled = false,
        selectMode = Lists.LIST_SELECT_MODE_SINGLE,
        longPressMultipleSelection = false,
        ...args
    } = {}) {

        super(args)

        this._items = initialItems || []
        this._searchEnabled = searchEnabled
        this._addEnabled = addEnabled
        this._selectMode = selectMode
        this._longPressMultipleSelection = longPressMultipleSelection

        this._addElem = null
        this._searchElem = null
        this._filterInput = null

        /* Search filtering state */
        this._filteredOutItems = new Set()
        this._pendingReveal = new Set()
        this._filterCollapseTimeout = null
        this._revealFrameHandle = null
        this._applySearchFilterDebouncer = new Debouncer(() => this._applySearchFilter(), SEARCH_FILTER_DELAY)
    }

    makeHTML() {
        return $('<div></div>', {class: 'qui-list'})
    }

    initHTML(html) {
        super.initHTML(html)

        html.addClass(`select-mode-${this._selectMode}`)
    }

    init() {
        super.init()

        /* Set initial items */
        if (this._items.length) {
            this.setItems(this._items)
        }
    }

    makeBody() {
        let bodyDiv = $('<div></div>', {class: 'qui-list-body'})

        /* Item events are delegated to the list body rather than bound to each item. A list of a few hundred items
         * would otherwise install a few thousand event handlers, including a mousemove handler per item. */

        bodyDiv.on('click', 'div.qui-list-item', function (e) {
            let item = this._itemFromElement($(e.currentTarget))
            if (item) {
                this._handleItemClick(item)
            }
        }.bind(this))

        if (this._longPressMultipleSelection) {
            Gestures.enableLongPress(bodyDiv, {
                selector: 'div.qui-list-item',
                onLongPress: function (element) {
                    let item = this._itemFromElement(element)
                    if (item) {
                        this._handleLongPress(item)
                    }
                }.bind(this)
            })
        }

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
        if (this._updateItemsInPlace(items)) {
            return
        }

        this._items.forEach(function (i) {
            this._forgetItemFilter(i)
            i.getHTML().remove()
        }, this)

        items.forEach(i => this.prepareItem(i))
        this._items = items

        if (this._searchEnabled) {
            this._applySearchFilter()
        }

        this._items.forEach(function (item) {
            if (this._addElem) {
                this._addElem.before(item.getHTML())
            }
            else {
                this.getBody().append(item.getHTML())
            }
        }, this)
    }

    /* The same keys in the same order mean the same rows, so they can be patched where they are instead of every
     * element being thrown away and built again. Measured on a 200-row list: 4.2ms to rebuild, 0.36ms to patch, and
     * that is only the DOM -- it counts none of the item objects, visibility managers or icon renders a rebuild also
     * throws away. Anything else (an item added, removed, or moved) falls back to the rebuild. */
    _updateItemsInPlace(items) {
        let oldItems = this._items

        if (!oldItems.length || oldItems.length !== items.length) {
            return false
        }

        for (let i = 0; i < items.length; i++) {
            /* An item that has not been through prepareItem() is not in the list yet, whatever _items says: init()
             * hands the initial items straight back to setItems(), where they would otherwise update from themselves
             * and report success without ever being prepared or appended. */
            if (oldItems[i].getList() !== this) {
                return false
            }

            let key = items[i].getKey()
            if (key == null || key !== oldItems[i].getKey()) {
                return false
            }
        }

        /* Giving up part way through is safe: the caller then rebuilds from the new items, and these half-updated
         * ones are discarded along with their elements. */
        for (let i = 0; i < items.length; i++) {
            if (!oldItems[i].updateFrom(items[i])) {
                return false
            }
        }

        if (this._searchEnabled) {
            this._applySearchFilter()
        }

        return true
    }

    /**
     * Update one item.
     * @param {Number} index the index where to perform the update
     * @param {qui.lists.ListItem} item the item to update
     */
    setItem(index, item) {
        this.prepareItem(item)

        if (this._searchEnabled) {
            this._applySearchFilter(item)
        }

        let oldItem = this._items[index]
        this._forgetItemFilter(oldItem)

        oldItem.getHTML().replaceWith(item.getHTML())
        this._items[index] = item

    }

    /**
     * Add one item to the list.
     * @param {Number} index the index where the item should be added; `-1` will add the item at the end
     * @param {qui.lists.ListItem} item the item
     */
    addItem(index, item) {
        this.prepareItem(item)

        if (this._searchEnabled) {
            this._applySearchFilter(item)
        }

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
            this._items[index].getHTML().before(item.getHTML())
            this._items.splice(index, 0, item)
        }

    }

    /**
     * Remove the item at a given index.
     * @param {Number} index the index of the item to remove
     * @returns {?qui.lists.ListItem} the removed item
     */
    removeItemAt(index) {
        let item = this._items[index]
        if (item) {
            this._forgetItemFilter(item)
            item.getHTML().remove()
        }

        return this._items.splice(index, 1)[0] || null
    }

    /**
     * Remove a specific item.
     * @param {qui.lists.ListItem} item the item to remove
     * @returns {Boolean} `true` if item found and removed, `false` otherwise
     */
    removeItem(item) {
        return this.removeItems(i => i === item).length > 0
    }

    /**
     * Remove all items that match a condition.
     * @param {qui.lists.ListItemMatchFunc} matchFunc
     * @returns {qui.lists.ListItem[]} the removed items
     */
    removeItems(matchFunc) {
        let removedItems = []

        for (let i = 0; i < this._items.length; i++) {
            if (matchFunc(this._items[i])) {
                removedItems.push(this.removeItemAt(i--))
            }
        }

        return removedItems
    }

    /**
     * Prepare item to be part of this list.
     * @param {qui.lists.ListItem} item
     */
    prepareItem(item) {
        item.setList(this)

        /* Associate the item with its element, so that delegated event handlers can find it back */
        itemsByElement.set(item.getHTML()[0], item)

        item.setSelectMode(this._selectMode)
    }

    /**
     * Return the item that owns a given element, if it belongs to this list.
     * @param {jQuery} element
     * @returns {?qui.lists.ListItem}
     */
    _itemFromElement(element) {
        let item = itemsByElement.get(element[0])
        if (!item || item.getList() !== this) {
            return null
        }

        return item
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

        /* Items are compared by identity: deep comparison would walk each item's entire object graph, including its
         * HTML element and everything reachable from it */
        if (oldItems.length === newItems.length && oldItems.every((item, i) => item === newItems[i])) {
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

    _handleLongPress(item) {
        if (!this._longPressMultipleSelection) {
            return
        }

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
            list._applySearchFilterDebouncer.call()
        })

        searchInput.on('paste', function () {
            list._applySearchFilterDebouncer.call()
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

    /**
     * Tell if an item is currently filtered out by the search filter.
     * @param {qui.lists.ListItem} item
     * @returns {Boolean}
     */
    isItemFilteredOut(item) {
        return this._filteredOutItems.has(item)
    }

    _forgetItemFilter(item) {
        this._pendingReveal.delete(item)

        if (!this._filteredOutItems.delete(item)) {
            return /* The filter never touched this item's element */
        }

        /* Undo what the filter did, so that an item that is added to a list again does not stay invisible */
        item.getHTML().css({opacity: '', display: ''})
    }

    _makeSearchExpression() {
        if (!this._filterInput) {
            return null
        }

        let searchText = this._filterInput.val().trim()
        if (!searchText) {
            return null
        }

        /* The whole search text is compiled into a single expression, which also takes care of splitting it into
         * groups. Compiling it here means compiling it once per list rather than once per item. */
        return StringUtils.intelliSearchRegExp(searchText)
    }

    _applySearchFilter(item = null) {
        let searchExpression = this._makeSearchExpression()
        let items = item ? [item] : this._items

        /* Filtering is applied to the whole list at once: items are faded together, collapsed together by a single
         * timer, and revealed together on a single frame. Going through each item's visibility manager instead would
         * schedule two timeouts per item whose visibility changes.
         *
         * Visibility is driven by inline styles rather than by classes, so that filtering does not depend on a
         * stylesheet built from the same sources as this file. The fade comes from the opacity transition that
         * div.qui-list-child already carries. show() and hide() drive the same inline properties through the item's
         * visibility manager, so revealing an item leaves it hidden if it has also been explicitly hidden. */

        let toReveal = []
        let toCollapse = []

        items.forEach(function (item) {

            let filteredOut = searchExpression != null && !item.isMatch(searchExpression)
            if (filteredOut === this._filteredOutItems.has(item)) {
                return /* Nothing to do for this item */
            }

            let html = item.getHTML()

            if (filteredOut) {
                this._filteredOutItems.add(item)
                this._pendingReveal.delete(item)

                if (html[0].isConnected) {
                    html.css('opacity', '0') /* Starts fading out */
                    toCollapse.push(item)
                }
                else { /* Not part of the document yet, so there is nothing to transition from */
                    html.css({opacity: '0', display: 'none'})
                }
            }
            else {
                this._filteredOutItems.delete(item)

                /* Take up layout again, still transparent, and start fading in on the next frame, unless the item
                 * has been explicitly hidden, in which case its visibility manager owns the display property */
                html.css('display', item.isExplicitlyHidden() ? 'none' : '')
                this._pendingReveal.add(item)
                toReveal.push(item)
            }

        }, this)

        if (toCollapse.length) {
            this._scheduleFilterCollapse()
        }

        if (toReveal.length && this._revealFrameHandle == null) {
            this._revealFrameHandle = window.requestAnimationFrame(function () {

                this._revealFrameHandle = null
                this._pendingReveal.forEach(function (item) {
                    if (!this._filteredOutItems.has(item)) {
                        item.getHTML().css('opacity', '')
                    }
                }, this)
                this._pendingReveal.clear()

            }.bind(this))
        }
    }

    _scheduleFilterCollapse() {
        if (this._filterCollapseTimeout != null) {
            return /* Items added to the batch in the meantime are collapsed by the pending timeout */
        }

        this._filterCollapseTimeout = setTimeout(function () {

            this._filterCollapseTimeout = null
            this._filteredOutItems.forEach(i => i.getHTML().css('display', 'none'))

        }.bind(this), Theme.getTransitionDuration())
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
        this._filterInput = null
        this.getBody().removeClass('search-enabled')
        this._applySearchFilter()
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

        /* Update HTML class according to new select mode */
        let html = this.getHTML()
        html.removeClass([
            Lists.LIST_SELECT_MODE_DISABLED,
            Lists.LIST_SELECT_MODE_SINGLE,
            Lists.LIST_SELECT_MODE_MULTIPLE
        ].map(m => `select-mode-${m}`).join(' '))
        html.addClass(`select-mode-${this._selectMode}`)

        /* Update items select mode */
        this.getItems().forEach(i => i.setSelectMode(this._selectMode))
    }

    /**
     * Return the currently selected items.
     * @returns {qui.lists.ListItem[]}
     */
    getSelectedItems() {
        return this._items.filter(i => i.isSelected())
    }

    /**
     * Update current selection.
     * @param {qui.lists.ListItem[]} items the list of new items to select; empty list clears selection
     */
    setSelectedItems(items) {
        if (this._selectMode === Lists.LIST_SELECT_MODE_DISABLED) {
            return
        }

        /* Resolve by key anything that is not one of our own items. A caller that rebuilt its items and handed us the
         * fresh ones would otherwise wipe the selection, since setItems() may have kept the originals and updated
         * them in place. */
        items = items.map(function (item) {
            if (this._items.includes(item)) {
                return item
            }

            let key = item.getKey()
            return (key != null) ? this._items.find(i => i.getKey() === key) || null : null
        }, this).filter(i => i != null)

        if (this._selectMode === Lists.LIST_SELECT_MODE_SINGLE) {
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
