/* eslint-disable no-multi-spaces */

import $ from '$qui/lib/jquery.module.js'

import {gettext}   from '$qui/base/i18n.js'
import * as Theme  from '$qui/theme.js'
import * as Colors from '$qui/utils/colors.js'

import * as Combo from './combo.js' /* Needed */


$.widget('qui.colorcombo', $.qui.combo, {

    STANDARD_COLORS: [
        {name: 'darkgray',      label: gettext('Dark Gray')},
        {name: 'gray',          label: gettext('Gray')},
        {name: 'lightgray',     label: gettext('Light Gray')},
        {name: 'white',         label: gettext('White')},
        {name: 'blue',          label: gettext('Blue')},
        {name: 'magenta',       label: gettext('Magenta')},
        {name: 'red',           label: gettext('Red')},
        {name: 'orange',        label: gettext('Orange')},
        {name: 'yellow',        label: gettext('Yellow')},
        {name: 'green',         label: gettext('Green')},
        {name: 'cyan',          label: gettext('Cyan')}
    ],
    THEME_COLORS: [
        {name: 'background',    label: gettext('Background')},
        {name: 'foreground',    label: gettext('Foreground')},
        {name: 'border',        label: gettext('Border')},
        {name: 'disabled',      label: gettext('Disabled')},
        {name: 'interactive',   label: gettext('Interactive')},
        {name: 'highlight',     label: gettext('Highlight')},
        {name: 'danger',        label: gettext('Danger')},
        {name: 'warning',       label: gettext('Warning')},
        {name: 'info',          label: gettext('Information')},
        {name: 'error',         label: gettext('Error')}
    ],

    options: {
        includeStandard: true,
        includeTheme: true,
        customColors: []
    },

    makeChoices: function () {
        let choices = []

        if (this.options.includeStandard) {
            choices = choices.concat(this.STANDARD_COLORS.map(function (colorInfo, i) {

                let choice = this._choiceFromColor(`@${colorInfo.name}-color`, colorInfo.label)
                if (i === 0) {
                    choice.separator = true
                }

                return choice

            }, this))
        }

        if (this.options.includeTheme) {
            choices = choices.concat(this.THEME_COLORS.map(function (colorInfo, i) {

                let choice = this._choiceFromColor(`@${colorInfo.name}-color`, colorInfo.label)
                if (i === 0) {
                    choice.separator = true
                }

                return choice

            }, this))
        }

        return choices
    },

    _choiceFromThemeVar: function (name, text) {
        return this._choiceFromColor(Theme.getVar(name), text)
    },

    _choiceFromColor: function (color, text) {
        let value = color
        if (!value.startsWith('@')) {
            value = Colors.normalize(value)
        }
        else {
            color = Theme.getVar(color.substring(1))
        }

        let labelDiv = $('<div class="qui-color-combo-entry-label"></div>')
        let colorDiv = $(`<div class="qui-color-combo-entry-color" style="background: ${color};"></div>`)
        let textSpan = $(`<span class="qui-color-combo-entry-text">${text}</span>`)

        labelDiv.append(colorDiv).append(textSpan)

        return {
            value: value,
            label: labelDiv
        }
    }

})
