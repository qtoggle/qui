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
        {name: 'background',    label: gettext('Background Color')},
        {name: 'foreground',    label: gettext('Foreground Color')},
        {name: 'border',        label: gettext('Border Color')},
        {name: 'disabled',      label: gettext('Disabled Color')},
        {name: 'interactive',   label: gettext('Interactive Color')},
        {name: 'highlight',     label: gettext('Highlight Color')},
        {name: 'danger',        label: gettext('Danger Color')},
        {name: 'warning',       label: gettext('Warning Color')},
        {name: 'info',          label: gettext('Information Color')},
        {name: 'error',         label: gettext('Error Color')}
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

        let labelDiv = $('<div></div>', {class: 'qui-color-combo-entry-label'})
        let colorDiv = $('<div></div>', {class: 'qui-color-combo-entry-color', style: `background: ${color};`})
        let textSpan = $('<span></span>', {class: 'qui-color-combo-entry-text'})
        textSpan.text(text)

        labelDiv.append(colorDiv).append(textSpan)

        return {
            value: value,
            label: labelDiv
        }
    }

})
