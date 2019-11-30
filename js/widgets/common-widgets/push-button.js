
import $ from '$qui/lib/jquery.module.js'

import * as Theme from '$qui/theme.js'
import * as Colors from '$qui/utils/colors.js'


$.widget('qui.pushbutton', {

    options: {
        style: 'interactive',
        caption: 'Button',
        backgroundColor: '@interactive-color',
        backgroundActiveColor: '@interactive-active-color',
        foregroundColor: '@foreground-active-color',
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

        /* When specifying custom colors, we have to manually update background color */
        this.element.on('pressed released', () => this._updateStyle())

        this.element.html(this.options.caption)
    },

    _setStyle: function (style) {
        this.element.removeClass('qui-interactive-button qui-highlight-button qui-danger-button qui-colored-button')
        this.element.addClass(`qui-${style}-button`)

        this._updateStyle()
    },

    _updateStyle: function () {
        if (this.options.style === 'colored' && !this.options.disabled) {
            if (this.element.hasClass('active')) {
                this.element.css('background', Theme.getColor(this.options.backgroundActiveColor))
            }
            else {
                this.element.css('background', Theme.getColor(this.options.backgroundColor))
            }

            this.element.css('color', Theme.getColor(this.options.foregroundColor))

            /* Manually compute and supply box-shadow focus color */
            let shadowColor = Colors.alpha(Theme.getColor(this.options.backgroundColor), 0.3)
            this.element[0].style.setProperty('--focus-shadow-color', shadowColor)
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

                this._updateStyle()
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
