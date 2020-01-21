/**
 * Utilities for writing mixins. Copied and adapted from Justin Fagnani's work:
 * {@link https://github.com/justinfagnani/mixwith.js}.
 *
 * @namespace qui.base.mixwith
 */

const _appliedMixin = '__mixwith_appliedMixin'
const _wrappedMixin = '__mixwith_wrappedMixin'


/**
 * A function that, when called with (applied to) a superclass, generates a new class inherited indirectly from the
 * superclass and directly from an intermediate mixin dynamic class, offering extra functionality, specific to the
 * mixin.
 *
 * @callback qui.base.mixwith.MixinFunction
 * @param {typeof Object} superclass class to which the mixin will be applied
 * @param rootclass
 * @param mixin
 */


function apply(superclass, rootclass, mixin) {
    let application = mixin(superclass, rootclass)
    application.prototype[_appliedMixin] = unwrap(mixin)

    return application
}

function isApplicationOf(proto, mixin) {
    return Object.prototype.hasOwnProperty.call(proto, _appliedMixin) && proto[_appliedMixin] === unwrap(mixin)
}

function hasMixin(o, mixin) {
    while (o != null) {
        if (isApplicationOf(o, mixin)) {
            return true
        }

        o = Object.getPrototypeOf(o)
    }

    return false
}

function wrap(mixin, wrapper) {
    Object.setPrototypeOf(wrapper, mixin)
    if (!mixin[_wrappedMixin]) {
        mixin[_wrappedMixin] = mixin
    }

    return wrapper
}

function unwrap(wrapper) {
    return wrapper[_wrappedMixin] || wrapper
}

function HasInstance(mixin) {
    if (Symbol && Symbol.hasInstance) {
        Object.defineProperty(mixin, Symbol.hasInstance, {
            value(o) {
                return hasMixin(o, mixin)
            }
        })
    }

    return mixin
}

function BareMixin(mixin) {
    return wrap(mixin, (s, r) => apply(s, r, mixin))
}


/**
 * A helper class capable of applying one or more mixins to a superclass.
 * @alias qui.base.mixwith.MixinBuilder
 */
export class MixinBuilder {

    /**
     * @constructs qui.base.mixwith.MixinBuilder
     * @param {typeof Object} superclass
     */
    constructor(superclass) {
        this.superclass = superclass || Object
    }

    /**
     * @param {...qui.base.mixwith.MixinFunction} mixins mixins to apply to the superclass
     * @returns {*} a new class derived from the superclass, with all `mixins` applied
     */
    with(...mixins) {
        return mixins.reduce((c, m) => m(c, /* rootclass = */ this.superclass), this.superclass)
    }

}


/**
 * Prepare a mixin function.
 * @alias qui.base.mixwith.Mixin
 * @param {qui.base.mixwith.MixinFunction} mixin the mixin function
 * @returns {qui.base.mixwith.MixinFunction} the prepared mixin function
 */
export function Mixin(mixin) {
    return HasInstance(BareMixin(mixin))
}


/**
 * Apply a list of mixins to a superclass.
 *
 * ```javascript
 * class X extends mix(Object).with(A, B, C) {}
 * ```
 *
 * The mixins are applied in order to the superclass, so the prototype chain
 * will be: X->C'->B'->A'->Object.
 *
 * This is purely a convenience function. The above example is equivalent to:
 *
 * ```javascript
 * class X extends C(B(A(Object))) {}
 * ```
 * @alias qui.base.mixwith.mix
 * @param {typeof Object} [superclass=Object]
 * @returns {MixinBuilder}
 */
export function mix(superclass) {
    return new MixinBuilder(superclass)
}
