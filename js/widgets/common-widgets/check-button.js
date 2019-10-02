import $ from '$qui/lib/jquery.module.js'


$.widget('qui.checkbutton', {

    options: {
        onClass: 'on',
        readonly: false,
        disabled: false
    },

    _create: function () {
        let widget = this

        this.element.addClass('qui-base-button qui-interactive-button qui-check-button')
        if (this.options.readonly) {
            this.element.addClass('readonly')
        }
        if (this.options.disabled) {
            this.element.addClass('disabled')
        }
        if (!this.options.disabled) {
            this.element.attr('tabIndex', 0) /* Make element focusable */
        }

        this.element.on('click', function () {
            widget._toggleChange()
        })
        this.element.on('keydown', function (e) {
            if (e.which === 32 /* Space */) {
                widget._toggleChange()
                return false
            }
        })
    },

    isOn: function () {
        return this.element.hasClass(this.options.onClass)
    },

    setOn: function () {
        this.element.addClass(this.options.onClass)
    },

    setOff: function () {
        this.element.removeClass(this.options.onClass)
    },

    toggle: function () {
        if (this.isOn()) {
            this.setOff()
        }
        else {
            this.setOn()
        }
    },

    getValue: function () {
        return this.isOn()
    },

    setValue: function (value) {
        if (value) {
            this.setOn()
        }
        else {
            this.setOff()
        }
    },

    _toggleChange: function () {
        if (this.options.readonly || this.options.disabled) {
            return
        }

        if (this.element.hasClass(this.options.onClass)) {
            this.setOff()
            this.element.trigger('change', false)
        }
        else {
            this.setOn()
            this.element.trigger('change', true)
        }
    },

    _setOption: function (key, value) {
        this._super(key, value)

        switch (key) {
            case 'readonly':
                this.element.toggleClass('readonly', value)
                break

            case 'disabled':
                this.element.toggleClass('disabled', value)
                if (value) {
                    this.element.removeAttr('tabIndex')
                }
                else {
                    this.element.attr('tabIndex', 0)
                }
                break
        }
    }

})
