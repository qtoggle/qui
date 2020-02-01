/**
 * @namespace qui.utils.array
 */

function makeSortFunc(extractFunc, desc, thisArg) {
    return function (e1, e2) {
        let k1 = extractFunc.call(thisArg, e1)
        let k2 = extractFunc.call(thisArg, e2)

        if ((desc && k1 > k2) || (!desc && k1 < k2)) {
            return -1
        }
        if ((desc && k1 < k2) || (!desc && k1 > k2)) {
            return 1
        }
        else {
            return 0
        }
    }
}

function merge(left, right, compareFunc) {
    let result = []

    while (left.length > 0 || right.length > 0) {
        if (left.length > 0 && right.length > 0) {
            if (compareFunc(left[0], right[0]) <= 0) {
                result.push(left[0])
                left = left.slice(1)
            }
            else {
                result.push(right[0])
                right = right.slice(1)
            }
        }
        else if (left.length > 0) {
            result.push(left[0])
            left = left.slice(1)
        }
        else if (right.length > 0) {
            result.push(right[0])
            right = right.slice(1)
        }
    }

    return result
}

function sorted(array, compareFunc) {
    let length = array.length
    let middle = Math.floor(length / 2)

    compareFunc = compareFunc || function (left, right) {
        if (left < right) {
            return -1
        }
        else if (left === right) {
            return 0
        }
        else {
            return 1
        }
    }

    if (length < 2) {
        return array
    }

    return merge(
        sorted(array.slice(0, middle), compareFunc),
        sorted(array.slice(middle, length), compareFunc),
        compareFunc
    )
}


/**
 * Perform a stable sort on an array, *in place*, using a comparison function.
 * @alias qui.utils.array.stableSort
 * @param {Array} array
 * @param {Function} compareFunc comparison function; takes two elements as parameters and returns `-1, `0` or `1`
 * @returns {Array} the array
 */
export function stableSort(array, compareFunc) {
    /* Slower, but such is life */
    let result = sorted(array, compareFunc).slice()

    /* Replace all the elements in array with the sorted ones */
    array.length = 0
    Array.prototype.splice.apply(array, [0, 0].concat(result))

    return array
}

/**
 * Perform a sort on an array, *in place*, using a key extraction function.
 * @alias qui.utils.array.sortKey
 * @param {Array} array
 * @param {Function} func key extraction function; will be called with each element as parameter and is expected to
 * return the comparison key
 * @param {Boolean} [desc] whether to do a descending sort (defaults to `false`)
 * @param {*} [thisArg] optional argument to use as `this` when calling the key extraction function.
 * @returns {Array} the array
 */
export function sortKey(array, func, desc = false, thisArg = null) {
    return array.sort(makeSortFunc(func, desc, thisArg))
}

/**
 * Perform a stable sort on an array, *in place*, using a key extraction function.
 * @alias qui.utils.array.stableSortKey
 * @param {Array} array
 * @param {Function} func key extraction function; will be called with each element as parameter and is expected to
 * return the comparison key
 * @param {Boolean} [desc] whether to do a descending sort (defaults to `false`)
 * @param {*} [thisArg] optional argument to use as `this` when calling the key extraction function.
 * @returns {Array} the array
 */
export function stableSortKey(array, func, desc = false, thisArg = null) {
    return stableSort(array, makeSortFunc(func, desc, thisArg))
}

/**
 * Generate an array based on a range of numbers.
 * @alias qui.utils.array.range
 * @param {Number} start inclusive range start
 * @param {Number} stop exclusive range stop
 * @param {Number} [step] range step (defaults to `1`)
 * @returns {Number[]}
 */
export function range(start, stop, step = 1) {
    let array = []
    for (let i = start; i < stop; i += step) {
        array.push(i)
    }

    return array
}

/**
 * Return an array of distinct elements found in an input array.
 * @alias qui.utils.array.distinct
 * @param {Array} array
 * @param {Function} [equalsFunc] a comparison function (defaults to the `===` operator)
 * @param {*} [thisArg] optional argument to be used as `this` when calling `equalsFunc`
 * @returns {Array} the distinct elements array
 */
export function distinct(array, equalsFunc = null, thisArg = null) {
    let uniqueElements = []

    if (!equalsFunc) {
        equalsFunc = (a, b) => a === b
    }

    array.forEach(function (element) {
        let found = uniqueElements.find(function (elem) {
            return equalsFunc.call(thisArg, elem, element)
        })

        if (found === undefined) {
            uniqueElements.push(element)
        }
    })

    return uniqueElements
}

/**
 * Remove all occurrences of an element from an array, in place.
 * @alias qui.utils.array.remove
 * @param {Array} array
 * @param {*} element the element to remove
 */
export function remove(array, element) {
    let index;
    while ((index = array.indexOf(element)) >= 0) {
        array.splice(index, 1)
    }
}

/**
 * Remove all occurrences of a set of elements from an array, in place.
 * @alias qui.utils.array.removeMany
 * @param {Array} array
 * @param {Array} elements the set of elements to remove
 */
export function removeMany(array, elements) {
    let index;
    elements.forEach(function (element) {
        while ((index = array.indexOf(element)) >= 0) {
            array.splice(index, 1)
        }
    })
}
