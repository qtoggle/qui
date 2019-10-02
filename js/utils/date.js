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

/**
 * Transform the date into a string, according to the given format. Recognized placeholders:
 *  * `"%a"` - short week day name (e.g. `"Mon"`)
 *  * `"%A"` - long week day name (e.g. `"Monday"`)
 *  * `"%w"` - day of week, from `"0"` (Sunday) to `"6"` (Saturday),
 *  * `"%d"` - zero padded day of month, from `"00"` to `"31'`
 *  * `"%b"` - short month name (e.g. `"Apr"`)
 *  * `"%B"` - long month name (e.g. `"April"`)
 *  * `"%m"` - zero padded month number, from `"01"` to `"12"`
 *  * `"%y"` - short year (e.g. `"97"` or `"03"`)
 *  * `"%Y"` - long year (e.g. `"1997"` or `"2003"`)
 *  * `"%H"` - zero padded hour, from `"00"` to `"23"`
 *  * `"%I"` - zero padded hour, from `"00"` to `"11"`
 *  * `"%p"` - `"am"` or `"pm"`
 *  * `"%M"` - zero padded minutes, from `"00"` to `"59"`
 *  * `"%S"` - zero padded seconds, from `"00"` to `"59"`
 *
 * @alias qui.utils.date.formatPercent
 * @param {Date} date the date to format
 * @param {String} format the format to be used
 * @param {Boolean} [trans] whether to translate week day and month names; defaults to `true`
 * @returns {String} the formatted date
 */
export function formatPercent(date, format, trans = true) {
    let weekDay = date.getDay()
    let monthDay = date.getDate()
    let month = date.getMonth()
    let year = date.getFullYear()
    let hours = date.getHours()
    let minutes = date.getMinutes()
    let seconds = date.getSeconds()

    let hours12 = hours
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

    return (format.replace('%a', weekDayNameShort)
                  .replace('%A', weekDayNameLong)
                  .replace('%w', weekDay.toString())
                  .replace('%d', (monthDay > 9 ? '' : '0') + monthDay)
                  .replace('%b', monthNameShort)
                  .replace('%B', monthNameLong)
                  .replace('%m', (month > 8 ? '' : '0') + (month + 1))
                  .replace('%y', (year % 100).toString())
                  .replace('%Y', year.toString())
                  .replace('%H', (hours > 9 ? '' : '0') + hours)
                  .replace('%I', (hours12 > 9 ? '' : '0') + hours12)
                  .replace('%p', ampm)
                  .replace('%M', (minutes > 9 ? '' : '0') + minutes)
                  .replace('%S', (seconds > 9 ? '' : '0') + seconds))
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
