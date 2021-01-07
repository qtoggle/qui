/**
 * @namespace qui.utils.date
 */

/* eslint-disable no-multi-spaces */

import {gettext} from '$qui/base/i18n.js'


const MONTH_NAMES = [
    {longName: 'January',   shortName: 'Jan', longNameTrans: gettext('January'),   shortNameTrans: gettext('Jan')},
    {longName: 'February',  shortName: 'Feb', longNameTrans: gettext('February'),  shortNameTrans: gettext('Feb')},
    {longName: 'March',     shortName: 'Mar', longNameTrans: gettext('March'),     shortNameTrans: gettext('Mar')},
    {longName: 'April',     shortName: 'Apr', longNameTrans: gettext('April'),     shortNameTrans: gettext('Apr')},
    {longName: 'May',       shortName: 'May', longNameTrans: gettext('May'),       shortNameTrans: gettext('May')},
    {longName: 'June',      shortName: 'Jun', longNameTrans: gettext('June'),      shortNameTrans: gettext('Jun')},
    {longName: 'July',      shortName: 'Jul', longNameTrans: gettext('July'),      shortNameTrans: gettext('Jul')},
    {longName: 'August',    shortName: 'Aug', longNameTrans: gettext('August'),    shortNameTrans: gettext('Aug')},
    {longName: 'September', shortName: 'Sep', longNameTrans: gettext('September'), shortNameTrans: gettext('Sep')},
    {longName: 'October',   shortName: 'Oct', longNameTrans: gettext('October'),   shortNameTrans: gettext('Oct')},
    {longName: 'November',  shortName: 'Nov', longNameTrans: gettext('November'),  shortNameTrans: gettext('Nov')},
    {longName: 'December',  shortName: 'Dec', longNameTrans: gettext('December'),  shortNameTrans: gettext('Dec')}
]

const WEEK_DAY_NAMES = [
    {longName: 'Sunday',    shortName: 'Sun', longNameTrans: gettext('Sunday'),    shortNameTrans: gettext('Sun')},
    {longName: 'Monday',    shortName: 'Mon', longNameTrans: gettext('Monday'),    shortNameTrans: gettext('Mon')},
    {longName: 'Tuesday',   shortName: 'Tue', longNameTrans: gettext('Tuesday'),   shortNameTrans: gettext('Tue')},
    {longName: 'Wednesday', shortName: 'Wed', longNameTrans: gettext('Wednesday'), shortNameTrans: gettext('Wed')},
    {longName: 'Thursday',  shortName: 'Thu', longNameTrans: gettext('Thursday'),  shortNameTrans: gettext('Thu')},
    {longName: 'Friday',    shortName: 'Fri', longNameTrans: gettext('Friday'),    shortNameTrans: gettext('Fri')},
    {longName: 'Saturday',  shortName: 'Sat', longNameTrans: gettext('Saturday'),  shortNameTrans: gettext('Sat')}
]

const MILLISECONDS_IN_MINUTE = 60 * 1000
const MILLISECONDS_IN_HOUR = 60 * MILLISECONDS_IN_MINUTE
const MILLISECONDS_IN_DAY = 24 * MILLISECONDS_IN_HOUR


/**
 * Transform a date into a string, according to the given format. Recognized placeholders:
 *  * `"%a"` - short week day name (e.g. `"Mon"`)
 *  * `"%A"` - long week day name (e.g. `"Monday"`)
 *  * `"%w"` - day of week, from `"0"` (Sunday) to `"6"` (Saturday),
 *  * `"%u"` - day of week, from `"1"` (Monday) to `"7"` (Sunday),
 *  * `"%d"` - zero padded day of month, from `"00"` to `"31'`
 *  * `"%b"` - short month name (e.g. `"Apr"`)
 *  * `"%B"` - long month name (e.g. `"April"`)
 *  * `"%m"` - zero padded month number, from `"01"` to `"12"`
 *  * `"%y"` - zero padded short year (e.g. `"97"` or `"03"`)
 *  * `"%Y"` - zero padded long year (e.g. `"1997"` or `"2003"`)
 *  * `"%H"` - zero padded hour, from `"00"` to `"23"`
 *  * `"%I"` - zero padded hour, from `"00"` to `"11"`
 *  * `"%p"` - `"am"` or `"pm"`
 *  * `"%M"` - zero padded minutes, from `"00"` to `"59"`
 *  * `"%S"` - zero padded seconds, from `"00"` to `"59"`
 *  * `"%f"` - zero padded milliseconds, from `"000"` to `"999"`
 *
 * Use a `-` character in front of a format specifier to remove zero padding (e.g. "%-d"`).
 *
 * @alias qui.utils.date.formatPercent
 * @param {Date} date the date to format
 * @param {String} format the format to be used
 * @param {Boolean} [trans] whether to translate week day and month names; defaults to `true`
 * @returns {String} the formatted date
 */
export function formatPercent(date, format, trans = true) {
    if (!date || isNaN(date.getTime())) {
        return ''
    }

    let weekDay = date.getDay()
    let monthDay = date.getDate()
    let month = date.getMonth()
    let year = date.getFullYear()
    let hours = date.getHours()
    let minutes = date.getMinutes()
    let seconds = date.getSeconds()
    let milliseconds = date.getMilliseconds()

    let hours12
    if (hours === 0) {
        hours12 = 12
    }
    else if (hours < 13) {
        hours12 = hours
    }
    else { /* Hours between 13 and 23 */
        hours12 = hours % 12
    }

    let ampm = hours < 12 ? 'AM' : 'PM'
    let weekDayName = WEEK_DAY_NAMES[weekDay]
    let weekDayNameShort = trans ? weekDayName.shortNameTrans : weekDayName.shortName
    let weekDayNameLong = trans ? weekDayName.longNameTrans : weekDayName.longName
    let monthName = MONTH_NAMES[month]
    let monthNameShort = trans ? monthName.shortNameTrans : monthName.shortName
    let monthNameLong = trans ? monthName.longNameTrans : monthName.longName

    let result = ''
    let percent = false
    let noLeading = false
    for (let i = 0; i < format.length; i++) {
        let c = format.charAt(i)
        if (percent) {
            if (c === '-') {
                noLeading = true
            }
            else {
                switch (c) {
                    case 'a':
                        result += weekDayNameShort
                        break

                    case 'A':
                        result += weekDayNameLong
                        break

                    case 'w':
                        result += weekDay.toString()
                        break

                    case 'u':
                        result += (weekDay || 7).toString()
                        break

                    case 'd':
                        result += monthDay.toString().padStart(noLeading ? 0 : 2, '0')
                        break

                    case 'b':
                        result += monthNameShort
                        break

                    case 'B':
                        result += monthNameLong
                        break

                    case 'm':
                        result += (month + 1).toString().padStart(noLeading ? 0 : 2, '0')
                        break

                    case 'y':
                        result += (year % 100).toString().padStart(noLeading ? 0 : 2, '0')
                        break

                    case 'Y':
                        result += year.toString().padStart(noLeading ? 0 : 4, '0')
                        break

                    case 'H':
                        result += hours.toString().padStart(noLeading ? 0 : 2, '0')
                        break

                    case 'I':
                        result += hours12.toString().padStart(noLeading ? 0 : 2, '0')
                        break

                    case 'p':
                        result += ampm
                        break

                    case 'M':
                        result += minutes.toString().padStart(noLeading ? 0 : 2, '0')
                        break

                    case 'S':
                        result += seconds.toString().padStart(noLeading ? 0 : 2, '0')
                        break

                    case 'f':
                        result += milliseconds.toString().padStart(noLeading ? 0 : 3, '0')
                        break

                    case '%':
                        result += '%'
                        break
                }

                noLeading = false
                percent = false
            }
        }
        else if (c === '%') {
            percent = true
        }
        else {
            result += c
        }
    }

    return result
}

/**
 * Transform a time duration into a string, according to the given format. Recognized placeholders:
 *  * `"%d"` - number of days
 *  * `"%H"` - number of hours, from `"00"` to `"23"`
 *  * `"%M"` - number of minutes, from `"00"` to `"59"`
 *  * `"%S"` - number of seconds, from `"00"` to `"59"`
 *  * `"%f"` - number of milliseconds, from `"000"` to `"999"`
 *
 * Use a `-` character in front of a format specifier to remove zero padding (e.g. "%-H"`).
 *
 * @alias qui.utils.date.formatDurationPercent
 * @param {Number} duration duration, in milliseconds
 * @param {String} format the format to be used
 * @returns {String} the formatted duration
 */
export function formatDurationPercent(duration, format) {
    let negative = false
    if (duration < 0) {
        duration = -duration
        negative = true
    }

    let days = Math.floor(duration / MILLISECONDS_IN_DAY)
    duration = duration % MILLISECONDS_IN_DAY

    let hours = Math.floor(duration / MILLISECONDS_IN_HOUR)
    duration = duration % MILLISECONDS_IN_HOUR

    let minutes = Math.floor(duration / MILLISECONDS_IN_MINUTE)
    duration = duration % MILLISECONDS_IN_MINUTE

    let seconds = Math.floor(duration / 1000)
    let milliseconds = duration % 1000

    let result = ''
    let percent = false
    let noLeading = false
    for (let i = 0; i < format.length; i++) {
        let c = format.charAt(i)
        if (percent) {
            if (c === '-') {
                noLeading = true
            }
            else {
                switch (c) {
                    case 'd':
                        result += days.toString()
                        break

                    case 'H':
                        result += hours.toString().padStart(noLeading ? 0 : 2, '0')
                        break

                    case 'M':
                        result += minutes.toString().padStart(noLeading ? 0 : 2, '0')
                        break

                    case 'S':
                        result += seconds.toString().padStart(noLeading ? 0 : 2, '0')
                        break

                    case 'f':
                        result += milliseconds.toString().padStart(noLeading ? 0 : 3, '0')
                        break

                    case '%':
                        result += '%'
                        break
                }

                noLeading = false
                percent = false
            }
        }
        else if (c === '%') {
            percent = true
        }
        else {
            result += c
        }
    }

    if (negative) {
        result = `-${result}`
    }

    return result
}

/**
 * Transform a given date object into its UTC equivalent.
 * @alias qui.utils.date.toUTC
 * @param {Date} date
 * @returns {Date}
 */
export function toUTC(date) {
    return new Date(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        date.getUTCHours(),
        date.getUTCMinutes(),
        date.getUTCSeconds(),
        date.getUTCMilliseconds()
    )
}
