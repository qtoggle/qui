import $ from '$qui/lib/jquery.module.js'

import * as Theme from '$qui/theme.js'


$.widget('qui.pushbutton', {

    options: {
        style: 'interactive',
        caption: 'Button',
        backgroundColor: '@interactive-color',
        backgroundActiveColor: '@interactive-active-color',
        foregroundColor: '@white-color',
        disabled: false
    },

    _create: function () {
        let widget = this

        this.element.addClass('qui-base-button qui-push-button')
        if (this.options.disabled) {
            this.element.addClass('disabled')
        }
        else {
            this.element.attr('tabIndex', 0) /* Make element focusable */
        }

        this._setStyle(this.options.style)

        this.element.on('click', function (e) {
            if (widget.options.disabled) {
                e.stopImmediatePropagation()
            }
        })

        this.element.on('pressed released', function (e) {
            /* When specifying custom colors, we have to manually update background color */
            if (widget.options.style === 'colored') {
                if (widget.element.hasClass('active')) {
                    widget.element.css('background', Theme.getColor(widget.options.backgroundActiveColor))
                }
                else {
                    widget.element.css('background', Theme.getColor(widget.options.backgroundColor))
                }
            }
        })

        this.element.html(this.options.caption)
    },

    _setStyle: function (style) {
        this.element.removeClass('qui-interactive-button qui-highlight-button qui-danger-button qui-colored-button')
        this.element.addClass(`qui-${style}-button`)

        if (style === 'colored') {
            this.element.css('background', Theme.getColor(this.options.backgroundColor))
            this.element.css('color', Theme.getColor(this.options.foregroundColor))
        }
        else {
            this.element.css('background', '')
            this.element.css('color', '')
        }
    },

    _setOption: function (key, value) {
        this._super(key, value)

        switch (key) {
            case 'disabled':
                this.element.toggleClass('disabled', value)
                if (value) {
                    this.element.removeAttr('tabIndex')
                }
                else {
                    this.element.attr('tabIndex', 0)
                }
                break

            case 'caption':
                this.element.html(this.options.caption)
                break

            case 'style':
                this._setStyle(value)
                break
        }
    }

})
