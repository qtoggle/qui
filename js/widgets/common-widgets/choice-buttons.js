
import $ from '$qui/lib/jquery.module.js'


$.widget('qui.choicebuttons', {

    options: {
        onClass: 'on',
        choices: [],
        readonly: false,
        disabled: false
    },

    _create: function () {
        let widget = this

        this.element.addClass('qui-choice-groups-container')

        if (this.options.readonly) {
            this.element.addClass('readonly')
        }
        if (this.options.disabled) {
            this.element.addClass('disabled')
        }
        else {
            this.element.attr('tabIndex', 0) /* Make the container focusable */
        }

        this.element.on('keydown', function (e) {
            if (widget.options.readonly) {
                return
            }

            let changed = false
            let active, group, newButton, index

            switch (e.which) {
                case 38: /* Up */
                    active = widget._getButtons().filter(`.${widget.options.onClass}`)
                    group = active.parent()
                    if (group.index() > 0) {
                        group = group.prev()
                        index = active.index()
                        newButton = group.children(`div.qui-choice-button:eq(${index})`)
                        if (newButton.length) {
                            widget._setActive(newButton)
                            widget.element.trigger('change', newButton.data('index'))
                            return false
                        }
                    }

                    break

                case 40: /* Down */
                    active = widget._getButtons().filter(`.${widget.options.onClass}`)
                    group = active.parent()
                    if (group.index() < widget.element.children().length - 1) {
                        group = group.next()
                        index = active.index()
                        newButton = group.children(`div.qui-choice-button:eq(${index})`)
                        if (newButton.length) {
                            widget._setActive(newButton)
                            widget.element.trigger('change', newButton.data('index'))
                            return false
                        }
                    }

                    break

                case 37: /* Left */
                    active = widget._getButtons().filter(`.${widget.options.onClass}`)
                    index = active.index()
                    group = active.parent()
                    if (index > 0) {
                        newButton = group.children(`div.qui-choice-button:eq(${index - 1})`)
                        widget._setActive(newButton)
                        widget.element.trigger('change', newButton.data('index'))
                        return false
                    }

                    break

                case 39: /* Right */
                    active = widget._getButtons().filter(`.${widget.options.onClass}`)
                    index = active.index()
                    group = active.parent()
                    if (index < group.children('div.qui-choice-button').length - 1) {
                        newButton = group.children(`div.qui-choice-button:eq(${index + 1})`)
                        widget._setActive(newButton)
                        widget.element.trigger('change', newButton.data('index'))
                        return false
                    }

                    break

                case 34: /* Page-down */
                    active = widget._getButtons().filter(`.${widget.options.onClass}`)
                    group = active.parent()
                    while (group.index() < widget.element.children().length - 1) {
                        group = group.next()
                        index = active.index()
                        newButton = group.children(`div.qui-choice-button:eq(${index})`)
                        if (newButton.length) {
                            widget._setActive(newButton)
                            changed = true
                        }
                    }

                    if (changed) {
                        widget.element.trigger('change', newButton.data('index'))
                        return false
                    }

                    break

                case 33: /* Page-up */
                    active = widget._getButtons().filter(`.${widget.options.onClass}`)
                    group = active.parent()
                    while (group.index() > 0) {
                        group = group.prev()
                        index = active.index()
                        newButton = group.children(`div.qui-choice-button:eq(${index})`)
                        if (newButton.length) {
                            widget._setActive(newButton)
                            changed = true
                        }
                    }

                    if (changed) {
                        widget.element.trigger('change', newButton.data('index'))
                        return false
                    }

                    break

                case 36: /* Home */
                    active = widget._getButtons().filter(`.${widget.options.onClass}`)
                    group = active.parent()
                    while ((index = active.index()) > 0) {
                        newButton = active = group.children(`div.qui-choice-button:eq(${index - 1})`)
                        widget._setActive(newButton)
                        changed = true
                    }

                    if (changed) {
                        widget.element.trigger('change', newButton.data('index'))
                        return false
                    }

                    break

                case 35: /* End */
                    active = widget._getButtons().filter(`.${widget.options.onClass}`)
                    group = active.parent()
                    while ((index = active.index()) < group.children('div.qui-choice-button').length - 1) {
                        newButton = active = group.children(`div.qui-choice-button:eq(${index + 1})`)
                        widget._setActive(newButton)
                        changed = true
                    }

                    if (changed) {
                        widget.element.trigger('change', newButton.data('index'))
                        return false
                    }

                    break
            }
        })

        this._installClickHandlers()
    },

    _getActive: function () {
        let active = this._getButtons().filter(`.${this.options.onClass}`)
        if (active.length) {
            return active
        }
        else {
            return null
        }
    },

    _setActive: function (button) {
        this._getButtons().removeClass(this.options.onClass)
        button.addClass(this.options.onClass)
    },

    _installClickHandlers: function () {
        let widget = this

        this._getButtons().each(function (i) {
            let button = $(this)

            button.on('click', (function (i) {

                return function () {
                    if (widget.options.readonly || widget.options.disabled) {
                        return
                    }

                    widget._setActive(button)
                    widget.element.trigger('change', i)
                }

            }(i)))
        })
    },

    getValue: function () {
        let activeButton = this._getActive()
        if (!activeButton) {
            return null
        }

        return activeButton.data('value')
    },

    setValue: function (value) {
        let widget = this
        this._getButtons().each(function () {
            if ($(this).data('value') === value) {
                widget._setActive($(this))
                return false
            }
        })
    },

    getSelectedIndex: function () {
        let widget = this
        let index = -1
        this._getButtons().each(function (i) {
            if ($(this).hasClass(widget.options.onClass)) {
                index = i
            }
        })

        return index
    },

    setSelectedIndex: function (index) {
        this._getButtons().removeClass(this.options.onClass)
        if (index >= 0) {
            this._getButtons().eq(index).addClass(this.options.onClass)
        }
    },

    _getButtons: function () {
        if (!this._buttons) {
            let widget = this
            let choices = this.options.choices
            if (choices.length) {
                if (!(choices[0] instanceof Array)) {
                    choices = [choices]
                }

                let index = 0
                choices.forEach(function (subChoices) {
                    let group = $('<div class="qui-choice-group-container"></div>')
                    subChoices.forEach(function (choice) {
                        let button = $('<div class="qui-base-button qui-interactive-button qui-choice-button"></div>')
                        button.html(choice.label)
                        button.data('value', choice.value)
                        button.data('index', index)
                        button.css('width', `${(100 / subChoices.length)}%`)
                        group.append(button)

                        index++
                    })

                    widget.element.append(group)
                })
            }

            this._buttons = this.element.find('div.qui-choice-button')
        }

        return this._buttons
    },

    _setOption: function (key, value) {
        this._super(key, value)

        switch (key) {
            case 'readonly':
                this.element.toggleClass('readonly', value)
                break

            case 'choices':
                this.element.html('')
                this._buttons = null
                this._installClickHandlers()
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
