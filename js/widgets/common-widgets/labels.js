
import $ from '$qui/lib/jquery.module.js'

import * as Theme from '$qui/theme.js'


$.widget('qui.labels', {

    options: {
        color: '@foreground-color',
        background: '@background-color',
        disabled: false,
        chevrons: false,
        clickable: false,
        onClick(label, index) {}
    },

    _create: function () {
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
        let color = Theme.getColor(this.options.color)
        let backgroundColor = Theme.getColor(this.options.background)

        let text = labelInfo
        let background = null
        if (typeof text !== 'string') {
            text = labelInfo.text
            background = labelInfo.background
        }

        let labelSpan = $('<span></span>', {class: 'qui-label'})
        labelSpan.html(text)
        labelSpan.css({
            'color': color,
            'background': background || backgroundColor,
            'border-color': background || backgroundColor
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

        labels.forEach(function (labelInfo, index) {

            let label = this._makeLabel(labelInfo)
            this._labels.push(label)
            this.element.append(label)

            if (this.options.clickable) {
                label.on('click', function () {
                    this.options.onClick(label.text(), index)
                }.bind(this))
            }

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
