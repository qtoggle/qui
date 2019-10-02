/**
 * @namespace qui.utils.object
 */

import * as ArrayUtils from './array.js'


/**
 * Use Object's `hasOwnProperty` and never rely on whatever `hasOwnProperty` incoming objects have.
 * @private
 * @param {Object} obj
 * @param {String} prop
 * @returns {Boolean}
 */
function hasOwnProperty(obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop)
}


/**
 * Create an object from a list of entries. Each entry is an array of two elements: the key and its associated value.
 * @alias qui.utils.object.fromEntries
 * @param {Array[]} entries
 * @returns {Object}
 */
export function fromEntries(entries) {
    let obj = {}
    entries.forEach(function (entry) {
        obj[entry[0]] = entry[1]
    })

    return obj
}

/**
 * Search an object for an entry that matches a condition and return the corresponding key.
 * @alias qui.utils.object.findKey
 * @param {Object} obj
 * @param {Function} func function that implements the search condition; it is called with value and key as arguments
 * @param {*} [thisArg] optional `this` argument to be used when calling `func`
 * @returns {String} the matched key, or `undefined` if no entry matched
 */
export function findKey(obj, func, thisArg = null) {
    let entry = Object.entries(obj).find(function (entry) {
        if (func.call(thisArg, entry[1], entry[0])) {
            return true
        }
    })

    if (entry) {
        return entry[0]
    }

    return undefined
}

/**
 * Search an object for an entry that matches a condition and return the corresponding value.
 * @alias qui.utils.object.findValue
 * @param {Object} obj
 * @param {Function} func function that implements the search condition; it is called with key and value as arguments
 * @param {*} [thisArg] optional `this` argument to be used when calling `func`
 * @returns {String} the matched value, or `undefined` if no entry matched
 */
export function findValue(obj, func, thisArg = null) {
    let entry = Object.entries(obj).find(function (entry) {
        if (func.call(thisArg, entry[0], entry[1])) {
            return true
        }
    })

    if (entry) {
        return entry[1]
    }

    return undefined
}

/**
 * Parse an object, calling a function for each entry.
 * @alias qui.utils.object.forEach
 * @param {Object} obj
 * @param {Function} func function to be called for each entry; it is called with the entry (array of key and value) as
 * argument
 * @param {*} [thisArg] optional `this` argument to be used when calling `func`
 * @param {Function} [sortKeyFunc] optional function used to extract key from each entry when sorting entries; no
 * sorting is performed unless this function is supplied
 */
export function forEach(obj, func, thisArg = null, sortKeyFunc = null) {
    let entries = Object.entries(obj)
    if (sortKeyFunc) {
        ArrayUtils.sortKey(entries, sortKeyFunc)
    }
    entries.forEach(function (entry) {
        func.call(thisArg, entry[0], entry[1])
    })
}

/**
 * Filter object entries. This function is similar to Array's `filter` method, but applied on objects.
 * @alias qui.utils.object.filter
 * @param {Object} obj
 * @param {Function} func a function called with each key and value as arguments; only entries for which this function
 * returns a true value will be kept
 * @param {*} [thisArg] optional `this` argument to be used when calling `func`
 * @returns {Object} the filtered object
 */
export function filter(obj, func, thisArg = null) {
    return fromEntries(Object.entries(obj).filter(entry => func.call(thisArg, entry[0], entry[1])))
}

/**
 * Map object entries. This function is similar to Array's `map` method, but applied on objects.
 * @alias qui.utils.object.map
 * @param {Object} obj
 * @param {Function} func a function called with each key and value as arguments; it is expected to return an array with
 * two elements, the mapped key and value
 * @param {*} [thisArg] optional `this` argument to be used when calling `func`
 * @returns {Object} the mapped object
 */
export function map(obj, func, thisArg = null) {
    return fromEntries(Object.entries(obj).map(entry => func.call(thisArg, entry[0], entry[1])))
}

/**
 * Map object keys.
 * @alias qui.utils.object.mapKey
 * @param {Object} obj
 * @param {Function} func a function called with each key and value as arguments; it is expected to return the mapped
 * key
 * @param {*} [thisArg] optional `this` argument to be used when calling `func`
 * @returns {Object} the mapped object
 */
export function mapKey(obj, func, thisArg = null) {
    return fromEntries(Object.entries(obj).map(entry => [func.call(thisArg, entry[0], entry[1]), entry[1]]))
}

/**
 * Map object values.
 * @alias qui.utils.object.mapValue
 * @param {Object} obj
 * @param {Function} func a function called with each value and key as arguments; it is expected to return the mapped
 * value
 * @param {*} [thisArg] optional `this` argument to be used when calling `func`
 * @returns {Object} the mapped object
 */
export function mapValue(obj, func, thisArg = null) {
    return fromEntries(Object.entries(obj).map(entry => [entry[0], func.call(thisArg, entry[1], entry[0])]))
}

/**
 * Assign values to an object, *in place*, but only if corresponding keys are missing.
 * @alias qui.utils.object.assignDefault
 * @param {Object} dest
 * @param {Object} src
 * @returns {Object} the given `dest` object
 */
export function assignDefault(dest, src) {
    Object.keys(src).forEach(function (key) {
        if (key in dest) {
            return
        }

        dest[key] = src[key]
    })

    return dest
}

/**
 * Combine two or more objects into a single object by merging their keys and values.
 * @alias qui.utils.object.combine
 * @param {...Object} objs objects to combine
 * @returns {Object} the combined object
 */
export function combine(...objs) {
    let combined = {}
    objs.forEach(function (obj) {
        Object.keys(obj).forEach(function (key) {
            combined[key] = obj[key]
        })
    })

    return combined
}

/**
 * Clone an object by copying its entries into a new object. Optionally recurse into inner objects and arrays.
 * @alias qui.utils.object.copy
 * @param {Object} orig original object to copy
 * @param {Boolean} [deep] set to `true` to perform a *deep* copy (defaults to `false`)
 * @returns {Object}
 */
export function copy(orig, deep = false) {
    if (deep) {
        if (orig === undefined || orig === null ||
            typeof orig === 'number' || typeof orig === 'string' ||
            typeof orig === 'boolean' || typeof orig === 'function') {

            return orig
        }
        else if (orig instanceof Array) {
            return orig.map(e => copy(e, /* deep = */ true))
        }
        else if (orig instanceof Object) {
            return map(orig, (k, v) => [k, copy(v, /* deep = */ true)])
        }
        else {
            return orig
        }
    }
    else {
        return fromEntries(Object.entries(orig))
    }
}

/**
 * Remove a key from an object, returning it.
 * @alias qui.utils.object.pop
 * @param {Object} obj
 * @param {String} key
 * @param {*} [def] an optional default value to return if key is missing
 * @returns {*}
 */
export function pop(obj, key, def = null) {
    if (!(key in obj)) {
        return def
    }

    let value = obj[key]
    delete obj[key]

    return value
}

/**
 * Insert a value into an object, but only if it's not already present, and return it.
 * @alias qui.utils.object.setDefault
 * @param {Object} obj
 * @param {String} key
 * @param {*} value
 * @returns {*}
 */
export function setDefault(obj, key, value) {
    if (key in obj) {
        return obj[key]
    }

    return (obj[key] = value)
}

/**
 * A deep equals() operator that will recursively compare any non-primitive objects to validate the equality.
 * @alias qui.utils.object.deepEquals
 * @param {Object} obj1 the first object of the comparison
 * @param {Object} obj2 the second object of the comparison
 * @returns {Boolean} `true` if the two objects are deeply equal, `false`otherwise
 */
export function deepEquals(obj1, obj2) {
    if (obj1 === obj2) {
        return true
    }

    if (typeof obj1 !== typeof obj2) {
        return false
    }

    if (obj1 instanceof Array) {
        if (!(obj2 instanceof Array)) {
            return false
        }

        if (obj1.length !== obj2.length) {
            return false
        }

        for (let i = 0; i < obj1.length; i++) {
            if (!deepEquals(obj1[i], obj2[i])) {
                return false
            }
        }

        return true
    }
    else if (obj1 instanceof Object) {
        if (!(obj2 instanceof Object)) {
            return false
        }

        for (let key in obj1) {
            if (hasOwnProperty(obj1, key)) {
                if (!hasOwnProperty(obj2, key)) {
                    return false
                }

                if (!deepEquals(obj1[key], obj2[key])) {
                    return false
                }
            }
        }

        for (let key in obj2) {
            if (hasOwnProperty(obj2, key)) {
                if (!hasOwnProperty(obj1, key)) {
                    return false
                }
            }
        }

        return true
    }
    else {
        return false
    }
}
