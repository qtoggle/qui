/**
 * @namespace qui.base
 */


/**
 * Make an imported module globally accessible via `window`.
 *
 * This function is intended to be used with dynamic imports, such as:
 *
 *     import('$qui/path/to/module.js').then(globalize('qui.path.to.module'))
 *
 * When imported module has default export, the last element in `path` is used to represent it:
 *
 *     import('$qui/path/to/class.js').then(globalize('qui.path.to.Class'))
 *
 * @alias qui.base.globalize
 * @param {String} path dotted path
 * @returns {Function} a function that handles dynamic import call promise result
 */
export function globalize(path) {
    return function (module) {
        let parts = path.split('.')
        let obj = window
        let defName = null

        /* When module has default export, last element of path is used as default name */
        if ('default' in module) {
            defName = parts[parts.length - 1]
            parts = parts.slice(0, -1)
        }

        parts.forEach(function (part) {
            if (!(part in obj)) {
                obj[part] = {}
            }

            obj = obj[part]
        })

        Object.entries(module).forEach(([key, value]) => (obj[key] = value))
        if (defName) {
            obj[defName] = obj['default']
            delete obj['default']
        }
    }
}
