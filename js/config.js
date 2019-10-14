/**
 * Configuration registry.
 * @namespace qui.config
 */

import * as ObjectUtils from '$qui/utils/object.js'


const _TRUE_VALUES = ['true', 'True', 'TRUE', 'on', 'On', 'ON', 'enabled', 'Enabled', 'ENABLED', 1]

const Config = {

    /**
     * Flag indicating whether app runs in debug mode or not.
     * @memberof qui.config
     * @type Boolean
     */
    debug: false,

    /**
     * Build hash used to append to static URLs to prevent caching.
     * @memberof qui.config
     * @type String
     */
    buildHash: '',

    /**
     * Flag indicating whether navigation uses URL fragment or regular path.
     * @memberof qui.config
     * @type Boolean
     */
    navigationUsesFragment: false,

    /**
     * Common prefix used for all QUI paths.
     * @memberof qui.config
     * @type String
     */
    navigationBasePrefix: '',

    /**
     * Application name.
     * @memberof qui.config
     * @type String
     */
    appName: '',

    /**
     * QUI static base URL.
     * @memberof qui.config
     * @type String
     */
    quiStaticURL: '',

    /**
     * App's static base URL; should be identical to {@link qui.config.quiStaticURL} in production mode.
     * @memberof qui.config
     * @type String
     */
    appStaticURL: '',

    /**
     * The name of the main QUI script.
     * @memberof qui.config
     * @type String
     */
    quiIndexName: '',

    /**
     * The name of the main app script.
     * @memberof qui.config
     * @type String
     */
    appIndexName: '',

    /**
     * The current (active) theme name.
     * @memberof qui.config
     * @type String
     */
    themeName: 'light',

    /**
     * Return a configuration item value.
     * @memberof qui.config
     * @param {String} name configuration item name
     * @param {*} [def = null] optional default value returned if missing
     */
    get: function (name, def = null) {
        let nameLower = name.toLowerCase()
        let value = ObjectUtils.findValue(this, k => k.toLowerCase() === nameLower)
        if (value === undefined) {
            value = def
        }

        return value
    },

    /**
     * Set a configuration item value.
     * @memberof qui.config
     * @param {String} name configuration item name
     * @param {*} value new configuration item value
     */
    set: function (name, value) {
        let nameLower = name.toLowerCase()
        let existingName = Object.keys(this).find(k => k.toLowerCase() === nameLower)

        if (existingName) {
            let existingValue = this[existingName]

            /* Try to coerce the given type to existing type */
            if (typeof existingValue !== typeof value) {
                if (typeof existingValue === 'boolean') {
                    value = _TRUE_VALUES.some(v => v === value)
                }
                else if (typeof existingValue === 'number') {
                    value = parseFloat(value)
                }
            }
        }

        this[existingName || name] = value
    },

    dump: function () {
        return ObjectUtils.filter(this, function (key, value) {
            return (typeof value !== 'function')
        })
    }

}


export default Config
