
import $ from '$qui/lib/jquery.module.js'

import * as Theme from '$qui/theme.js'


$.widget('qui.labels', {

    options: {
        color: null,
        background: null,
        disabled: false,
        chevrons: false,
        clickable: false
    },

    _create: function () {
        if (!this.options.color) {
            this.options.color = Theme.getVar('background-color')
        }
        if (!this.options.background) {
            this.options.background = Theme.getVar('foreground-color')
        }

        this.element.addClass('qui-labels-container')
        if (this.options.disabled) {
            this.element.addClass('disabled')
        }
        if (this.options.chevrons) {
            this.element.addClass('chevrons')
        }
        if (this.options.clickable) {
            this.element.addClass('clickable')
        }

        this._labels = []
    },

    _makeLabel: function (labelInfo) {
        let text = labelInfo
        let background = null
        if (typeof text !== 'string') {
            text = labelInfo.text
            background = labelInfo.background
        }

        let labelSpan = $('<span class="qui-label"></span>')
        labelSpan.html(text)
        labelSpan.css({
            'color': this.options.color,
            'background': background || this.options.background,
            'border-color': background || this.options.background
        })

        if (background) {
            labelSpan.data('custom-background', true)
        }

        if (this.options.clickable) {
            labelSpan.addClass('qui-base-button')
        }

        return labelSpan
    },

    getValue: function () {
        return this._labels.map(l => l.html())
    },

    setValue: function (labels) {
        this.element.html('')
        this._labels = []

        labels.forEach(function (labelInfo) {
            let label = this._makeLabel(labelInfo)
            this._labels.push(label)
            this.element.append(label)
        }, this)
    },

    _setOption: function (key, value) {
        this._super(key, value)

        switch (key) {
            case 'color':
                this.element.children('span.qui-label').css('color', value)
                break

            case 'background':
                this._labels.forEach(function (label) {
                    if (!label.data('custom-background')) {
                        label.css({
                            'background': value,
                            'border-color': value
                        })
                    }
                })
                break

            case 'disabled':
                this.element.toggleClass('disabled', value)
                break

            case 'chevrons':
                this.element.toggleClass('chevrons', value)
                break

            case 'clickable':
                this.element.children('span.qui-label').toggleClass('qui-base-button', value)
                this.element.toggleClass('clickable', value)
                break
        }
    }

})
