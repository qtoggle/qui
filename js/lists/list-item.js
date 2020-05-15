
import $ from '$qui/lib/jquery.module.js'

import {mix}             from '$qui/base/mixwith.js'
import * as StringUtils  from '$qui/utils/string.js'
import VisibilityManager from '$qui/utils/visibility-manager.js'
import ViewMixin         from '$qui/views/view.js'

/**
 * A list item.
 * @alias qui.lists.ListItem
 * @mixes qui.views.ViewMixin
 */
class ListItem extends mix().with(ViewMixin) {

    /**
     * @constructs
     * @param {*} [data] user data associated with the item
     * @param {...*} args parent class parameters
     */
    constructor({data = null, ...args} = {}) {
        super(args)

        this._data = data
        this._list = null
        this._visibilityManager = null
    }

    makeHTML() {
        let html = $('<div></div>', {class: 'qui-list-child qui-list-item'})
        html.html(this.makeContent())

        this._visibilityManager = new VisibilityManager({element: html})

        return html
    }

    /**
     * Implement this method to create the actual list item content.
     * @abstract
     * @returns {jQuery}
     */
    makeContent() {
    }


    /* User data */

    /**
     * Return the item user data.
     * @returns {*}
     */
    getData() {
        return this._data
    }

    /**
     * Set the item user data.
     * @param {*} data
     */
    setData(data) {
        this._data = data
    }

    /* Selection */

    /**
     * Tell if item is selected or not.
     */
    isSelected() {
        return this.getHTML().hasClass('selected')
    }

    /**
     * Select or deselect item.
     * @param {Boolean} selected
     */
    setSelected(selected) {
        this.getHTML().toggleClass('selected', selected)
    }

    /**
     * Set select mode. This is internally called by owning {@link qui.lists.List}.
     * @param {String} selectMode one of:
     *  * {@link qui.lists.LIST_SELECT_MODE_DISABLED}
     *  * {@link qui.lists.LIST_SELECT_MODE_SINGLE} (default)
     *  * {@link qui.lists.LIST_SELECT_MODE_MULTIPLE}
     */
    setSelectMode(selectMode) {
    }


    /* Visibility */

    /**
     * Tell if the item is hidden.
     * @returns {Boolean}
     */
    isHidden() {
        return !this._visibilityManager.isElementVisible()
    }

    /**
     * Show the item.
     */
    show() {
        this._visibilityManager.showElement()
    }

    /**
     * Hide the field.
     */
    hide() {
        this._visibilityManager.hideElement()
    }

    /**
     * Tell if item matches a search filter. By default, uses {@link qui.utils.string.intelliSearch} on textual content
     * of the HTML element.
     * @param {String} filter search filter
     * @returns {Boolean}
     */
    isMatch(filter) {
        let text = this.getHTML().text().trim().toLowerCase()
        return StringUtils.intelliSearch(text, filter) != null
    }

    /**
     * Return the owning list.
     * @returns {qui.lists.List}
     */
    getList() {
        return this._list
    }

    /**
     * Set the owning list.
     * @param {qui.lists.List} list
     */
    setList(list) {
        this._list = list
    }

}


export default ListItem
