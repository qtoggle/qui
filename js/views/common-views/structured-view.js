
import $      from '$qui/lib/jquery.module.js'
import Logger from '$qui/lib/logger.module.js'

import {Mixin}     from '$qui/base/mixwith.js'
import StockIcon   from '$qui/icons/stock-icon.js'
import * as Theme  from '$qui/theme.js'
import {asap}      from '$qui/utils/misc.js'
import * as Window from '$qui/window.js'


const logger = Logger.get('qui.views.commonviews.structuredview')


/** @lends qui.views.commonviews.StructuredViewMixin */
const StructuredViewMixin = Mixin((superclass = Object) => {

    /**
     * A view with top, body and bottom elements. Designed to be mixed together with {@link qui.views.ViewMixin}.
     * @alias qui.views.commonviews.StructuredViewMixin
     * @mixin
     */
    class StructuredViewMixin extends superclass {

        /**
         * @constructs
         * @param {?String} [title] view title (set to `null` if you don't want a view top at all)
         * @param {qui.icons.Icon} [icon] view icon
         * @param {Boolean} [minimizable] indicates that the view should be minimizable by clicking on its top bar
         * (defaults to `false`)
         * @param {Boolean} [minimized] indicates that the view should be initially minimized (defaults to `false`)
         * @param {Boolean} [largeTop] indicates that the view top bar should be larger (defaults to `true`)
         * @param {Boolean} [topless] indicates that the view should not have a top bar (defaults to `false`)
         * @param {Boolean} [closable] set to `true` to display a close button on the top bar (defaults to `false`,
         * ignored when `minimizable` is `true`)
         * @param {...*} args parent class parameters
         */
        constructor({
            title = null,
            icon = null,
            minimizable = false,
            minimized = false,
            largeTop = true,
            topless = false,
            closable = false,
            ...args
        } = {}) {
            super(args)

            this._title = title
            this._icon = icon
            this._minimizable = minimizable
            this._minimized = minimized
            this._largeTop = largeTop
            this._topless = topless
            this._closable = closable

            this._topDiv = null
            this._bodyDiv = null
            this._bottomDiv = null
        }


        /* HTML */

        initHTML(html) {
            html.addClass('qui-structured-view')

            this._topDiv = this._makeTop()
            html.append(this._topDiv)

            if (!this._icon) {
                html.addClass('iconless')
            }

            if (this._largeTop) {
                html.addClass('large-top')
            }

            if (this._topless) {
                html.addClass('topless')
            }

            if (this._closable) {
                html.addClass('closable')
            }

            if (this._minimizable) {
                html.addClass('minimizable')
                this._topDiv.addClass('qui-base-button')
                this._topDiv.on('click', function () {
                    this.toggleMinimized()
                }.bind(this))
            }

            this._bodyDiv = this.makeBody()
            this._bodyDiv.addClass('qui-structured-view-body')

            html.append(this._bodyDiv)

            if (this._minimizable) {
                if (this._minimized) {
                    html.addClass('minimized')
                    this._bodyDiv.css('max-height', Window.getHeight())
                }
                else if (this._topDiv) {
                    this._topDiv.addClass('selected')
                }
            }

            this._bottomDiv = this.makeBottom()
            if (this._bottomDiv) {
                this._bottomDiv.addClass('qui-structured-view-bottom')
                html.append(this._bottomDiv)
            }
        }

        _makeTop() {
            let topDiv = $('<div></div>', {class: 'qui-structured-view-top'})
            let iconDiv = $('<div></div>', {class: 'qui-structured-view-icon'})
            topDiv.append(iconDiv)

            if (this._icon) {
                this.prepareIcon(this._icon).applyTo(iconDiv)
            }

            let titleSpan = $('<span></span>', {class: 'qui-structured-view-title'})
            titleSpan.text(this._title || '')
            topDiv.append(titleSpan)

            if (this._minimizable) {
                let minimizeIconDiv = $('<div></div>', {class: 'qui-structured-view-minimize-button'})

                new StockIcon({
                    name: 'fat-arrow', variant: 'interactive', activeVariant: 'white', selectedVariant: 'white'
                }).alter({scale: this._largeTop ? 1 : 0.75}).applyTo(minimizeIconDiv)

                topDiv.append(minimizeIconDiv)
            }

            if (this._closable && !this._minimizable) {
                let closeIconDiv = $('<div></div>', {class: 'qui-base-button qui-structured-view-close-button'})

                new StockIcon({
                    name: 'close', variant: 'interactive',
                    activeVariant: 'interactive-active', selectedVariant: 'interactive'
                }).alter({scale: this._largeTop ? 1 : 0.75}).applyTo(closeIconDiv)

                topDiv.append(closeIconDiv)

                closeIconDiv.on('click', function () {
                    this.close().catch().then(function () {
                        logger.debug('breadcrumb navigation cancelled by rejected page close')
                    })
                }.bind(this))
            }

            return topDiv
        }

        /**
         * Implement this method to create the actual body of the view.
         * @abstract
         * @returns {jQuery}
         */
        makeBody() {
        }

        /**
         * Implement this method to create the bottom part of the view.
         * @returns {jQuery}
         */
        makeBottom() {
            return null
        }

        /**
         * Return the top element.
         * @returns {jQuery}
         */
        getTop() {
            /* Make sure the HTML is created */
            this.getHTML()

            return this._topDiv
        }

        /**
         * Return the body element.
         * @returns {jQuery}
         */
        getBody() {
            /* Make sure the HTML is created */
            this.getHTML()

            return this._bodyDiv
        }

        /**
         * Return the bottom element.
         * @returns {?jQuery}
         */
        getBottom() {
            /* Make sure the HTML is created */
            this.getHTML()

            return this._bottomDiv
        }


        /* Title and icon */

        /**
         * Return the view title.
         * @returns {?String}
         */
        getTitle() {
            return this._title
        }

        /**
         * Set the view title.
         * @param {String} title the new title
         */
        setTitle(title) {
            this._title = title
            this.getTop().children('span.qui-structured-view-title').html(title || '')
        }

        /**
         * Return the view icon.
         * @returns {qui.icons.Icon}
         */
        getIcon() {
            return this._icon
        }

        /**
         * Set the view icon.
         * @param {?qui.icons.Icon} icon the new icon (`null` to disable icon)
         */
        setIcon(icon) {
            this._icon = icon
            let iconDiv = this.getTop().children('div.qui-structured-view-icon')
            if (this._icon) {
                this.getHTML().removeClass('iconless')
                this.prepareIcon(this._icon).applyTo(iconDiv)
            }
            else {
                this.getHTML().addClass('iconless')
                iconDiv.html('')
            }
        }

        /**
         * Prepare the view icon, altering its attributes as needed, before applying it.
         * @param {qui.icons.Icon} icon
         * @returns {qui.icons.Icon}
         */
        prepareIcon(icon) {
            if (!(icon instanceof StockIcon)) {
                return icon
            }

            if (this._minimizable) {
                icon = icon.alterDefault({
                    variant: 'interactive',
                    activeVariant: 'white',
                    selectedVariant: 'white'
                })
            }
            else {
                icon = icon.alterDefault({variant: Window.isSmallScreen() ? 'white' : 'foreground'})
            }

            return icon
        }


        /* Minimization */

        /**
         * Minimize the view.
         */
        minimize() {
            if (this._minimized) {
                return
            }

            this._minimized = true

            let height = this.getBody().height()
            this.getBody().css('max-height', height)

            asap(function () {
                this.getHTML().addClass('minimized')
                this.getTop().removeClass('selected')
            }.bind(this))

            this.onMinimize()
        }

        /**
         * Restore the view's minimization to normal state.
         */
        unminimize() {
            if (!this._minimized) {
                return
            }

            this._minimized = false

            this.getHTML().removeClass('minimized')
            this.getTop().addClass('selected')
            Theme.afterTransition(function () {
                this.getBody().css('max-height', '')
            }.bind(this), this.getBody())
            this.onUnminimize()
        }

        /**
         * Toggle the view's minimization state.
         */
        toggleMinimized() {
            if (this.isMinimized()) {
                this.unminimize()
            }
            else {
                this.minimize()
            }
        }

        /**
         * Tell if the view is minimized or not.
         * @returns {Boolean}
         */
        isMinimized() {
            return this._minimized
        }

        /**
         * Called when the view is minimized.
         */
        onMinimize() {
        }

        /**
         * Called when the view is unminimized.
         */
        onUnminimize() {
        }

    }

    return StructuredViewMixin

})


export default StructuredViewMixin
