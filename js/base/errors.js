/**
 * @namespace qui.base.errors
 */

/**
 * An error class used when assertions fail.
 * @alias qui.base.errors.AssertionError
 * @extends Error
 */
export class AssertionError extends Error {
}

/**
 * An error class used when an operation times out.
 * @alias qui.base.errors.TimeoutError
 * @extends Error
 */
export class TimeoutError extends Error {
}

/**
 * An error class thrown from methods or functions that are not implemented.
 * @alias qui.base.errors.NotImplementedError
 * @extends Error
 */
export class NotImplementedError extends Error {
}
