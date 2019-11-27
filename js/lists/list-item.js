
import $      from '$qui/lib/jquery.module.js'
import Logger from '$qui/lib/logger.module.js'

import {mix}     from '$qui/base/mixwith.js'
import ViewMixin from '$qui/views/view.js'


const logger = Logger.get('qui.lists.listitem')


/**
 * A list item.
 * @alias qui.lists.ListItem
 * @mixes qui.views.ViewMixin
 * @param {Object} params
 * * see {@link qui.views.ViewMixin} for view parameters
 * @param {jQuery} params.content item content
 * @param {*} [params.data] user data associated with the item
 */
export default class ListItem extends mix().with(ViewMixin) {

    constructor({content = null, data = null, ...params}) {
        super(params)

        this._content = content
        this._data = data

        this._list = null
    }

    makeHTML() {
        let html = $('<div class="qui-base-button qui-list-child item"></div>')

        html.on('click', function () {

            let items = this._list.getItems()
            let oldItemElem = this._list.getBody().children('.qui-list-child.item.selected')
            let oldIndex = oldItemElem.index()
            let oldItem = items[oldIndex] || null
            let index = html.index()

            if (index === oldIndex) {
                return
            }

            let promise = this._list.onSelectionChange(this, index, oldItem, oldIndex)
            promise = promise || Promise.resolve()
            promise.then(function () {
                this._list.getBody().children('.qui-list-child.item').removeClass('selected')
                html.addClass('selected')
            }.bind(this)).catch(function () {
                logger.debug('selection change rejected')
            })

        }.bind(this))

        if (this._content) {
            html.html(this._content)
        }

        return html
    }

    /**
     * Return the content.
     * @returns {?jQuery}
     */
    getContent() {
        return this._content
    }

    /**
     * Set the item content.
     * @param {jQuery} content
     */
    setContent(content) {
        this._content = content
        this.getHTML().html(content)
    }

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
