/**
 * A class holding the details of a URL.
 * @alias qui.utils.URL
 */
class URL {

    /**
     * @constructs qui.utils.URL
     * @param {String} scheme
     * @param {String} [username]
     * @param {String} [password]
     * @param {String} host
     * @param {Number} [port]
     * @param {String} [path]
     * @param {Object} [query]
     * @param {String} [fragment]
     */
    constructor({
        scheme,
        username = '',
        password = '',
        host,
        port = null,
        path = '',
        query = {},
        fragment = ''
    }) {
        this.scheme = scheme
        this.username = username
        this.password = password
        this.host = host
        this.port = port
        this.path = path
        this.query = query
        this.fragment = fragment
    }

    /**
     * Serialize the query and returns it as a string.
     * @returns {String}
     */
    get queryStr() {
        return Object.entries(this.query)
                     .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
                     .join('&')
    }

    /**
     * Compose the string representation of this URL.
     * @returns {String}
     */
    toString() {
        /* Scheme */
        let url = `${this.scheme}://`

        /* Credentials */
        if (this.username) {
            url += this.username
            if (this.password) {
                url += `:${this.password}`
            }

            url += '@'
        }

        /* Host */
        url += this.host

        /* Port */
        let port = this.port
        if ((this.scheme === 'http' && this.port === 80) || (this.scheme === 'https' && this.port === 443)) {
            port = null
        }
        if (port != null) {
            url += `:${port}`
        }

        /* Path */
        let path = this.path
        if (path && !path.startsWith('/')) {
            path = `/${path}`
        }
        url += path

        /* Query */
        if (Object.keys(this.query).length > 0) {
            url += `?${this.queryStr}`
        }

        /* Fragment */
        if (this.fragment) {
            url += `#${this.fragment}`
        }

        return url
    }

    /**
     * Return all the attributes of this URL as a dictionary.
     * @returns {Object}
     */
    toAttributes() {
        return {
            scheme: this.scheme,
            username: this.username,
            password: this.password,
            host: this.host,
            port: this.port,
            path: this.path,
            query: this.query,
            fragment: this.fragment
        }
    }

    /**
     * Alter one or more attributes of this URL, returning the new URL.
     * @param {Object} attributes
     * @returns {qui.utils.URL}
     */
    alter(attributes) {
        let oldAttributes = this.toAttributes()
        Object.assign(oldAttributes, attributes)

        return new this.constructor(oldAttributes)
    }

    /**
     * Parse a string representation of a URL and returns a URL object.
     * @param {String} urlStr
     * @returns {qui.utils.URL}
     */
    static parse(urlStr = '') {
        let a = document.createElement('a')
        a.href = urlStr

        let params = {
            scheme: a.protocol.replace(':', ''),
            host: a.hostname,
            path: a.pathname,
            port: a.port ? parseInt(a.port) : null,
            username: a.username,
            password: a.password,
            query: {}
        }

        if (a.search) {
            a.search.substring(1).split('&').forEach(function (s) {
                let parts = s.split('=')
                let name = parts[0]
                let value = parts.slice(1).join('=')

                params.query[decodeURIComponent(name)] = decodeURIComponent(value)
            })
        }

        if (a.hash) {
            params.fragment = a.hash.substring(1)
        }

        return new this(params)
    }

    /**
     * Transform the string representation of a partial URL into a full URL.
     * @param {String} urlStr
     * @returns {String}
     */
    static qualify(urlStr) {
        let a = document.createElement('a')
        a.href = urlStr
        return a.href
    }

}

// TODO es7 class fields
URL.VALID_REGEX = new RegExp(
    '^(?:(?:http|https)://)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d' +
    '|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d' +
    '|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)' +
    '(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.?' +
    '(?:[a-z\\u00a1-\\uffff]*)))|localhost)(?::\\d{1,5})?(?:(/|\\?|#)[^\\s]*)?$',
    'i'
)


export default URL
