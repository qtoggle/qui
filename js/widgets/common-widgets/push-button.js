
import $ from '$qui/lib/jquery.module.js'

import * as Theme  from '$qui/theme.js'
import * as Colors from '$qui/utils/colors.js'


const STYLES = [
    'foreground',
    'interactive',
    'highlight',
    'danger',
    'colored'
]


$.widget('qui.pushbutton', {

    options: {
        style: 'interactive',
        caption: 'Button',
        backgroundColor: '@interactive-color',
        backgroundActiveColor: '@interactive-active-color',
        foregroundColor: '@foreground-interactive-color',
        icon: null,
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
        this._setIcon(this.options.icon)
        this._setCaption(this.options.caption)

        this.element.on('click', function (e) {
            if (widget.options.disabled) {
                e.stopImmediatePropagation()
            }
        })

        /* When specifying custom colors, we have to manually update background color */
        this.element.on('pressed released', () => this._updateStyle())

        this.element.on('keydown', function (e) {
            if (e.which === 32) {
                this.element.trigger('click')
            }
        }.bind(this))
    },

    _setStyle: function (style) {

        this.element.removeClass(STYLES.map(s => `qui-${s}-button`))
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

    _setIcon: function (icon) {
        this.element.toggleClass('has-icon', icon)
        this.element.children('div.qui-push-button-icon').remove()

        if (icon) {
            let iconDiv = $('<div></div>', {class: 'qui-push-button-icon'})
            let variant = 'foreground-interactive' /* Default */

            if (this.options.disabled) {
                variant = 'disabled'
            }
            else if ((this.options.style === 'colored') && this.options.foregroundColor.startsWith('@')) {
                variant = this.options.foregroundColor.slice(1, -6)
            }

            icon = icon.alterDefault({variant: variant})
            icon = icon.alter({scale: 0.75})
            icon.applyTo(iconDiv)

            this.element.prepend(iconDiv)
        }
    },

    _setCaption: function (caption) {
        this.element.children('span.qui-push-button-caption').remove()

        let captionDiv = $('<span></span>', {class: 'qui-push-button-caption'})
        captionDiv.html(caption)

        this.element.append(captionDiv)
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
                this._setCaption(value)
                break

            case 'style':
                this._setStyle(value)
                /* Icon must also be updated as the foreground color might have changed */
                this._setIcon(this.options.icon)
                break

            case 'icon':
                this._setIcon(value)
                break
        }
    }

})
