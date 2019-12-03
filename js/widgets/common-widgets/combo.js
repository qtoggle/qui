
import $ from '$qui/lib/jquery.module.js'

import {gettext}        from '$qui/base/i18n.js'
import {asap}           from '$qui/utils/misc.js'
import * as StringUtils from '$qui/utils/string.js'
import * as Window      from '$qui/window.js'


$.widget('qui.combo', {

    options: {
        makeChoices: null,
        choices: [],
        fastFactor: 5,
        filterEnabled: false,
        readonly: false,
        disabled: false
    },

    _create: function () {
        this._buttonDiv = $('<div class="qui-base-button qui-combo-button"></div>')
        this._opened = false
        this._searchStr = ''
        this._prevItemDiv = null
        this._maxHeightSet = false

        this.element.addClass('qui-combo-container')
        if (this.options.readonly) {
            this.element.addClass('readonly')
        }
        if (this.options.disabled) {
            this.element.addClass('disabled')
        }
        if (this.options.filterEnabled) {
            this.element.addClass('filter-enabled')
        }

        this.element.append(this._buttonDiv)

        this._currentEntryDiv = $('<div class="qui-combo-current-label">&nbsp;</div>')
        this._buttonDiv.append(this._currentEntryDiv)
        this._buttonDiv.css('text-align', 'left')

        this._buttonDiv.append($('<span class="qui-combo-arrow-separator"></span>'))
        this._buttonDiv.append($('<span class="qui-combo-arrow"></span>'))

        let searchMsg = gettext('search...')
        this._filterInput = $(`<input type="text" class="qui-combo-filter" placeholder="${searchMsg}">`)
        this._buttonDiv.after(this._filterInput)

        this._itemContainer = $('<div class="qui-combo-item-container"></div>')
        this._itemContainer.on('mousedown', function () {
            return false
        })

        this.element.append(this._itemContainer)

        if (!this.options.disabled) {
            this.element.attr('tabIndex', 0) /* Make the container focusable */
        }

        let widget = this

        this._makeItems()
        this._updateFiltered()

        this._handleKeyDown = function (e) {
            if (widget.options.readonly) {
                return
            }

            let changed = false
            let selectedItem

            switch (e.which) {
                case 13: /* Enter */
                    if (widget._opened) {
                        widget.close()
                        return false
                    }

                    break

                case 8: /* Backspace */
                    if (widget._opened && !widget._filterInput.is(':focus')) {
                        if (widget._searchStr.length) {
                            widget._searchStr = widget._searchStr.substring(0, widget._searchStr.length - 1)
                            return false
                        }
                    }

                    break

                case 27: /* Escape */
                    if (widget._opened) {
                        widget._selectItemDiv(widget._prevItemDiv)
                        widget.close()
                        return false
                    }

                    break

                case 38: /* Up */
                    changed = widget._selectPrev()

                    if (changed) {
                        if (!widget._opened) {
                            widget._updateCurrentEntry()
                            selectedItem = widget._itemContainer.children('div.qui-combo-item.selected')
                            widget.element.trigger('change', selectedItem.index())
                        }

                        return false
                    }

                    break

                case 40: /* Down */
                    changed = widget._selectNext()

                    if (changed) {
                        if (!widget._opened) {
                            widget._updateCurrentEntry()
                            selectedItem = widget._itemContainer.children('div.qui-combo-item.selected')
                            widget.element.trigger('change', selectedItem.index())
                        }

                        return false
                    }

                    break

                case 32: /* Space */
                    if (!widget._opened && !widget._filterInput.is(':focus')) {
                        widget.open()
                        return false
                    }

                    break

                case 34: /* Page-down */
                    for (let i = 0; i < widget.options.fastFactor; i++) {
                        if (widget._selectNext()) {
                            changed = true
                        }
                    }

                    if (changed) {
                        if (!widget._opened) {
                            widget._updateCurrentEntry()
                            selectedItem = widget._itemContainer.children('div.qui-combo-item.selected')
                            widget.element.trigger('change', selectedItem.index())
                        }

                        return false
                    }

                    break

                case 33: /* Page-up */
                    for (let i = 0; i < widget.options.fastFactor; i++) {
                        if (widget._selectPrev()) {
                            changed = true
                        }
                    }

                    if (changed) {
                        if (!widget._opened) {
                            widget._updateCurrentEntry()
                            selectedItem = widget._itemContainer.children('div.qui-combo-item.selected')
                            widget.element.trigger('change', selectedItem.index())
                        }

                        return false
                    }

                    break

                case 36: /* Home */
                    while (widget._selectPrev()) {
                        changed = true
                    }

                    if (changed) {
                        if (!widget._opened) {
                            widget._updateCurrentEntry()
                            selectedItem = widget._itemContainer.children('div.qui-combo-item.selected')
                            widget.element.trigger('change', selectedItem.index())
                        }

                        return false
                    }

                    break

                case 35: /* End */
                    while (widget._selectNext()) {
                        changed = true
                    }

                    if (changed) {
                        if (!widget._opened) {
                            widget._updateCurrentEntry()
                            selectedItem = widget._itemContainer.children('div.qui-combo-item.selected')
                            widget.element.trigger('change', selectedItem.index())
                        }

                        return false
                    }
            }
        }

        this._handleKeyPress = function (e) {
            if (widget.options.readonly) {
                return
            }

            if (widget._filterInput.is(':focus')) {
                return
            }

            widget._searchStr += String.fromCharCode(e.which).toLowerCase()

            widget._itemContainer.children('div.qui-combo-item').each(function () {
                let itemDiv = $(this)
                if (itemDiv.text().toLowerCase().startsWith(widget._searchStr)) {
                    if (widget._opened) {
                        widget._selectItemDiv(itemDiv, true)
                    }
                    else {
                        let selectedItem = widget._itemContainer.children('div.qui-combo-item.selected')
                        if (!selectedItem.is(itemDiv)) {
                            itemDiv.addClass('selected')
                            selectedItem.removeClass('selected')
                            widget._updateCurrentEntry()
                            widget.element.trigger('change', itemDiv.index())
                        }
                    }

                    return false
                }
            })
        }

        this._pointerDown = function (e) {
            if (widget.element.parent().has(e.target).length) {
                return
            }

            if (!widget._prevItemDiv) {
                return
            }

            widget._selectItemDiv(widget._prevItemDiv)
            widget.close()
        }

        this._buttonDiv.on('click', function () {
            if (widget.options.readonly || widget.options.disabled) {
                return
            }

            if (widget._opened) {
                widget.close()
            }
            else {
                widget.open()
            }

            return false
        })

        this.element.on('keydown', this._handleKeyDown)
        this.element.on('keypress', this._handleKeyPress)
        this.element.on('blur', function () {

            asap(function () {
                if (widget._filterInput.is(':focus')) {
                    return
                }

                /* Close the combo when losing focus */
                if (widget._opened) {
                    widget._selectItemDiv(widget._prevItemDiv)
                    widget.close()
                }
            })

        })

        this._filterInput.on('blur', function () {

            /* Close the combo when losing focus */
            if (widget._opened) {
                widget._selectItemDiv(widget._prevItemDiv)
                widget.close()
            }

        })

        this._filterInput.on('keydown', function () {
            asap(function () {
                widget._updateFiltered()
            })
        })
    },

    getValue: function () {
        let value = this._itemContainer.children('div.qui-combo-item.selected').data('value')
        if (value === undefined) {
            value = null
        }

        return value
    },

    setValue: function (value) {
        let itemDiv = this._getItemDivByValue(value)
        this._selectItemDiv(itemDiv)
        this._updateCurrentEntry()
    },

    getSelectedIndex: function () {
        return this._itemContainer.children('div.qui-combo-item.selected').index()
    },

    setSelectedIndex: function (index) {
        this._itemContainer.children('div.qui-combo-item.selected').removeClass('selected')
        if (index >= 0) {
            this._itemContainer.children(`div.qui-combo-item:eq(${index})`).addClass('selected')
        }
        this._updateCurrentEntry()
    },

    open: function () {
        if (this._opened) {
            return
        }

        this._opened = true
        this.element.addClass('open')

        Window.$body.on('pointerdown', this._pointerDown)

        this._searchStr = ''
        this._prevItemDiv = this._itemContainer.children('div.qui-combo-item.selected')

        if (this._prevItemDiv.length) {
            let scrollTop = this._prevItemDiv.offset().top - this._itemContainer.offset().top +
                            this._itemContainer.scrollTop()
            this._itemContainer.scrollTop(scrollTop)
        }

        if (this.options.filterEnabled) {
            this._filterInput.val('')
            this._filterInput.focus()
            this._updateFiltered()
        }
    },

    close: function () {
        if (!this._opened) {
            return
        }

        this._opened = false
        this.element.removeClass('open')

        Window.$body.off('pointerdown', this._pointerDown)

        this._searchStr = ''
        this._updateCurrentEntry()

        let selectedItem = this._itemContainer.children('div.qui-combo-item.selected')
        if (!selectedItem.is(this._prevItemDiv)) {
            this.element.trigger('change', selectedItem.index())
        }

        this._prevItemDiv = null
    },

    makeChoices: function () {
        if (this.options.makeChoices) {
            return this.options.makeChoices()
        }
        else {
            return []
        }
    },

    updateChoices: function () {
        /* Will call makeChoices */
        this._setOption('choices', [])
    },

    _makeItems: function () {
        let widget = this

        this._getChoices().forEach(function (choice, i) {
            let itemDiv = $('<div class="qui-combo-item"><div>')

            if (choice.label instanceof $) {
                itemDiv.html(choice.label)
            }
            else {
                itemDiv.html(`<div class="qui-combo-item-simple-label">${choice.label}</div>`)
            }

            if (choice.separator && i > 0) {
                itemDiv.addClass('separator')
            }

            widget._itemContainer.append(itemDiv)

            itemDiv.on('click', function () {
                widget._selectItemDiv(itemDiv)
                widget.close()
            })
            itemDiv.on('pointerover', function () {
                if (!widget._opened) {
                    return
                }

                widget._selectItemDiv(itemDiv)
            })

            itemDiv.data('value', choice.value)
        })

        this._maxHeightSet = false
    },

    _getChoices: function () {
        let choices = this.makeChoices()

        return choices.concat(this.options.choices)
    },

    _getItemDivByValue: function (value) {
        let itemDiv = null
        this._itemContainer.children('div.qui-combo-item').each(function () {
            let $this = $(this)
            if ($this.data('value') === value) {
                itemDiv = $this
                return false
            }
        })

        return itemDiv
    },

    _selectPrev: function () {
        let visibleIndexes = this._itemContainer.children('div.qui-combo-item:NOT(.hidden)').map(function () {
            return $(this).index()
        }).toArray()

        if (visibleIndexes.length === 0) {
            return false
        }

        let selectedIndex = this._itemContainer.children('div.qui-combo-item.selected:NOT(.hidden)').index()
        let newIndex = visibleIndexes.reverse().find(i => i < selectedIndex)

        if (newIndex != null) {
            this._selectItemDiv(this._itemContainer.children(`div.qui-combo-item:eq(${newIndex})`), true)
            this._searchStr = ''

            return true
        }

        return false
    },

    _selectNext: function () {
        let visibleIndexes = this._itemContainer.children('div.qui-combo-item:NOT(.hidden)').map(function () {
            return $(this).index()
        }).toArray()

        if (visibleIndexes.length === 0) {
            return false
        }

        let selectedIndex = this._itemContainer.children('div.qui-combo-item.selected:NOT(.hidden)').index()
        let newIndex = visibleIndexes.find(i => i > selectedIndex)

        if (newIndex != null) {
            this._selectItemDiv(this._itemContainer.children(`div.qui-combo-item:eq(${newIndex})`), true)
            this._searchStr = ''

            return true
        }

        return false
    },

    _selectItemDiv: function (itemDiv, scroll) {
        this._itemContainer.children('div.qui-combo-item.selected').removeClass('selected')

        if (itemDiv) {
            itemDiv.addClass('selected')
            if (scroll) {
                let scrollTop = itemDiv.offset().top - this._itemContainer.offset().top +
                                this._itemContainer.scrollTop()
                this._itemContainer.scrollTop(scrollTop)
            }
        }
    },

    _updateCurrentEntry: function () {
        this._currentEntryDiv.html(this._itemContainer.children('div.qui-combo-item.selected').html() || '&nbsp;')
    },

    _updateFiltered: function () {
        /* Assign a fixed max-height to each combo item - enables height animation when hiding filtered items */
        if (this.element.is(':visible') && !this._maxHeightSet) {
            this._maxHeightSet = true
            this._itemContainer.children('div.qui-combo-item').each(function () {
                let $this = $(this)
                $this.css('max-height', $this.height())
            })
        }

        this._itemContainer.children('div.qui-combo-item').removeClass('hidden odd even')

        let filter = this._filterInput.val().trim().toLowerCase()

        this._getChoices().forEach(function (choice, i) {

            let labelText = choice.label
            if (labelText instanceof $) {
                labelText = labelText.text()
            }
            else {
                labelText = String(labelText)
            }

            if (this._textMatchesFilter(labelText, filter)) {
                return
            }

            if (typeof this.options.filterEnabled === 'function') {
                let valueText = this.options.filterEnabled(choice.value)
                if (this._textMatchesFilter(valueText, filter)) {
                    return
                }
            }

            this._itemContainer.children(`div.qui-combo-item:eq(${i})`).addClass('hidden')

        }, this)

        let even = true
        this._itemContainer.children('div.qui-combo-item:NOT(.hidden)').each(function () {
            if (even) {
                $(this).addClass('even')
            }
            else {
                $(this).addClass('odd')
            }

            even = !even
        })
    },

    _textMatchesFilter: function (text, filter) {
        if (!filter) {
            return true
        }

        return StringUtils.intelliSearch(text, filter) != null
    },

    _setOption: function (key, value) {
        this._super(key, value)

        switch (key) {
            case 'readonly':
                this.element.toggleClass('readonly', value)
                break

            case 'choices':
                this._itemContainer.children().detach()
                this._makeItems()
                this.setSelectedIndex(-1)
                this._updateFiltered()
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

            case 'filterEnabled':
                this.element.toggleClass('filter-enabled', !!value)
                this._updateFiltered()
                break

        }
    }

})
