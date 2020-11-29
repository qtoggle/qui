
import $ from '$qui/lib/jquery.module.js'

import {gettext}         from '$qui/base/i18n.js'
import StockIcon         from '$qui/icons/stock-icon.js'
import * as StringUtils  from '$qui/utils/string.js'

import * as BaseWidget from '../base-widget.js' /* Needed */


$.widget('qui.filepicker', $.qui.basewidget, {

    options: {
        name: '',
        placeholder: null,
        accept: null,
        multiple: false,
        readonly: false,
        disabled: false
    },

    _create: function () {
        this.element.addClass('qui-file-picker')

        /* Actual file input element */
        this._input = $('<input>', {type: 'file'})
        this.element.append(this._input)
        this._input.on('change', function () {
            this._button.pushbutton({caption: this.prepareCaption()})
        }.bind(this))

        /* Button */
        this._button = $('<div>', {class: 'qui-file-picker-button qui-push-button'}).pushbutton({
            caption: this.prepareCaption(),
            icon: new StockIcon({name: 'file'})
        })
        this.element.append(this._button)
        this._button.on('click', function () {
            if (!this.options.readonly) {
                this._input.trigger('click')
            }
        }.bind(this))

        if (this.options.name) {
            this._input.attr('name', this.options.name)
        }

        if (this.options.accept) {
            this._input.attr('accept', this.options.accept.join(','))
        }
        if (this.options.multiple) {
            this._input.attr('multiple', 'multiple')
        }
        if (this.options.readonly) {
            this._input.attr('readonly', 'readonly')
        }
        if (this.options.disabled) {
            this._input.attr('disabled', 'disabled')
        }

        /* Manually propagate some events to parent */
        this._input.on('focus blur', function (e) {
            this.element.triggerHandler(e.type)
        }.bind(this))
    },

    _setOption: function (key, value) {
        this._super(key, value)

        switch (key) {
            case 'accept':
                if (value) {
                    this._input.attr('accept', value.join(','))
                }
                else {
                    this._input.removeAttr('accept')
                }
                break

            case 'multiple':
                if (value) {
                    this._input.attr('multiple', 'multiple')
                }
                else {
                    this._input.removeAttr('multiple')
                }
                break

            case 'disabled':
                this._button.pushbutton({disabled: value})
                break

            case 'readonly':
                this._button.pushbutton({readonly: value})
                break

            case 'placeholder':
                this._button.pushbutton({caption: this.prepareCaption()})
                break

            case 'warning':
                this._button.pushbutton({style: value != null ? 'highlight' : 'interactive'})
                break

            case 'error':
                this._button.pushbutton({style: value != null ? 'danger' : 'interactive'})
                break
        }
    },

    getValue: function () {
        let files = this._input[0].files
        return Array.prototype.slice.call(files)
    },

    setValue: function (value) {
        /* Does nothing */
    },

    prepareCaption: function () {
        let files = this._input[0].files
        if (files.length > 1) {
            return StringUtils.formatPercent('%(count)d files selected', {count: files.length})
        }
        else if (files.length > 0) {
            return files[0].name
        }
        else {
            return this.options.placeholder || gettext('Choose...')
        }
    }

})
