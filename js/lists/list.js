
import $      from '$qui/lib/jquery.module.js'
import Logger from '$qui/lib/logger.module.js'

import {gettext}             from '$qui/base/i18n.js'
import {mix}                 from '$qui/base/mixwith.js'
import StockIcon             from '$qui/icons/stock-icon.js'
import * as Theme            from '$qui/theme.js'
import {asap}                from '$qui/utils/misc.js'
import * as StringUtils      from '$qui/utils/string.js'
import {StructuredViewMixin} from '$qui/views/common-views.js'


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
 */
class List extends mix().with(StructuredViewMixin) {

    /**
     * @constructs qui.lists.List
     * @param {qui.lists.ListItem[]} [items] initial list items
     * @param {Boolean} [searchEnabled] set to `true` to enable the search feature (defaults to `false`)
     * @param {Boolean} [addEnabled] set to `true` to enable the add item feature (defaults to `false`)
     * @param {...*} args parent class parameters
     */
    constructor({items = [], searchEnabled = false, addEnabled = false, ...args} = {}) {
        super(args)

        this._items = items
        this._searchEnabled = searchEnabled
        this._addEnabled = addEnabled

        this._addElem = null
        this._searchElem = null
        this._filterInput = null
        this._glassDiv = null
        this._progressWidget = null
        this._progressVisible = null
    }

    makeHTML() {
        return $('<div class="qui-list"></div>')
    }

    initHTML(html) {
        super.initHTML(html)

        /* Progress */
        this._progressWidget = $('<div class="qui-list-progress-widget"></div>').progressdisk({radius: '2em'})
        this._progressWidget.css('display', 'none')
        this._glassDiv = $('<div class="qui-list-glass"></div>')

        html.append(this._glassDiv)
        html.append(this._progressWidget)

        /* Set initial items */
        if (this._items.length) {
            this.setItems(this._items)
        }
    }

    makeBody() {
        let bodyDiv = $('<div class="list-body"></div>')

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
        this.getBody().children('.qui-list-child.item').remove()

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
        this.getBody().children(`.qui-list-child.item:eq(${index})`).replaceWith(item.getHTML())
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
            this.getBody().children(`.qui-list-child.item:eq(${index})`).before(item.getHTML())
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
        this.getBody().children(`.qui-list-child.item:eq(${index})`).remove()

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

            this.getBody().children(`.qui-list-child.item:eq(${i})`).remove()
            this._items.splice(i, 1)
        }, this)
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
        let addElem = $('<div class="qui-base-button qui-list-child add"></div>')

        let addIcon = $('<div class="qui-icon"></div>')
        addElem.append(addIcon)
        new StockIcon({name: 'plus', variant: 'interactive'}).applyTo(addIcon)

        addElem.on('click', function () {

            let promise = this.onAdd()
            promise = promise || Promise.resolve()
            promise.then(function () {
                this.getBody().children('.qui-list-child.item').removeClass('selected')
            }.bind(this)).catch(function () {
                logger.debug('add rejected')
            })

        }.bind(this))

        return addElem
    }

    /**
     * Override this to define the behavior of the list when the add button is pressed.
     * @returns {?Promise} an optional promise which, if rejected, will cancel adding
     */
    onAdd() {
    }


    /* Search feature */

    _makeSearchElem() {
        let list = this

        let searchElem = $('<div class="qui-list-child search"></div>')

        let searchInput = $('<input type="text">')
        searchInput.attr('placeholder', gettext('search...'))

        let searchWrapper = $('<div class="qui-list-search-wrapper"></div>')
        searchWrapper.append(searchInput)
        searchElem.append(searchWrapper)

        let searchIcon = $('<div class="qui-icon"></div>')
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
            this.getBody().children('.qui-list-child.item').removeClass('hidden')
            return
        }

        let searchText = this._filterInput.val().trim().toLowerCase()
        this.getBody().children('.qui-list-child.item').removeClass('hidden').each(function () {
            let itemElem = $(this)
            let text = itemElem.text().trim().toLowerCase()
            if (StringUtils.intelliSearch(text, searchText) == null) {
                itemElem.addClass('hidden')
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
        this.getBody().children('.qui-list-child.item').removeClass('hidden')
    }


    /* Selection */

    /**
     * Return the index of the currently selected item, or `-1` if no item is selected.
     * @returns {Number}
     */
    getSelectedIndex() {
        let index = -1
        this.getBody().children('.qui-list-child.item').each(function (i) {
            if ($(this).hasClass('selected')) {
                index = i
                return false
            }
        })

        return index
    }

    /**
     * Select the item with a given index.
     * @param {Number} index the index of the item to select; `-1` deselects all items
     */
    setSelectedIndex(index) {
        this.getBody().children('.qui-list-child.item').removeClass('selected')
        if (index >= 0) {
            this.getBody().children(`.qui-list-child.item:eq(${index})`).addClass('selected')
        }
    }

    /**
     * Return the currently selected item, or `null` if no item is selected.
     * @returns {?qui.lists.ListItem}
     */
    getSelectedItem() {
        let index = this.getSelectedIndex()
        if (index < 0) {
            return null
        }

        return this._items[index]
    }

    /**
     * Called when the selected item changes.
     * @param {qui.lists.ListItem} newItem the new selected item (can be `null`)
     * @param {Number} newIndex the new selected index (can be `-1`)
     * @param {qui.lists.ListItem} oldItem the previously selected item (can be `null`)
     * @param {Number} oldIndex the previously selected index (can be `-1`)
     * @returns {?Promise} an optional promise which, if rejected, will cancel the selection change
     */
    onSelectionChange(newItem, newIndex, oldItem, oldIndex) {
    }


    /* Progress */

    showProgress(percent) {
        if (percent == null) {
            percent = -1
        }

        if (this._progressVisible) {
            this._progressWidget.progressdisk('setValue', percent)
            return
        }

        this._progressVisible = true

        this._glassDiv.css('display', 'block')
        this.getHTML().addClass('progress')
        this._progressWidget.css('display', '')
        this._progressWidget.progressdisk('setValue', percent)

        asap(function () {

            if (!this._progressVisible) {
                return /* Progress already hidden */
            }

            this._glassDiv.addClass('visible')
            this._progressWidget.addClass('visible')

        }.bind(this))
    }

    hideProgress() {
        this._glassDiv.removeClass('visible')
        this.getHTML().removeClass('progress')
        this._progressWidget.removeClass('visible')

        this._progressVisible = false

        Theme.afterTransition(function () {

            if (this._progressVisible) {
                return /* Progress re-shown in the meantime */
            }

            this._glassDiv.css('display', '')
            this._progressWidget.css('display', 'none')

        }.bind(this), this._glassDiv)
    }

    getProgressWidget() {
        return this._progressWidget
    }

}


export default List
