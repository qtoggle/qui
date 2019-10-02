/**
 * @namespace qui.utils.cookies
 */

/**
 * Return the value of a cookie.
 * @alias qui.utils.cookies.get
 * @param {String} name cookie name
 * @returns {?String}
 */
export function get(name) {
    let cookie = document.cookie.substring(0)

    if (cookie.length <= 0) {
        return null
    }

    let start = cookie.indexOf(`${name}=`)
    if (start === -1) {
        return null
    }

    start = start + name.length + 1
    let end = cookie.indexOf(';', start)
    if (end === -1) {
        end = cookie.length
    }

    return cookie.substring(start, end)
}

/**
 * Set the value of a cookie, optionally indicating a validity period.
 * @alias qui.utils.cookies.set
 * @param {String} name cookie name
 * @param {String} value cookie value
 * @param {Number} [validDays] number of days of validity; defaults to `null`, in which case cookie never expires
 */
export function set(name, value, validDays = null) {
    let date, expires
    if (validDays) {
        date = new Date()
        date.setTime(date.getTime() + (validDays * 24 * 60 * 60 * 1000))
        expires = `expires=${date.toUTCString()}`
    }
    else {
        expires = ''
    }

    document.cookie = `${name}=${value}; ${expires}; path=/`
}

/**
 * Clear a cookie.
 * @alias qui.utils.cookies.clear
 * @param {String} name cookie name
 */
export function clear(name) {
    let date = new Date()
    date.setTime(date.getTime() + (-1 * 24 * 60 * 60 * 1000))
    let expires = `expires=${date.toUTCString()}`

    document.cookie = `${name}=; ${expires}; path=/`
}
