import {Mixin} from '$qui/base/mixwith.js'


export default Mixin((superclass = Object) => {

    /**
     * A mixin that helps implementing the singleton pattern.
     * @alias qui.base.SingletonMixin
     * @mixin
     */
    class SingletonMixin extends superclass {

        // TODO enable these in es7
        // static _instance = null
        // static _args = null

        constructor(...args) {
            super(...args)
        }

        /**
         * Prepare the class for instantiation, establishing the constructor arguments.
         *
         * Any arguments passed to this method will be passed to the constructor, when creating the singleton.
         *
         * @param {...*} args arguments to be passed to the constructor
         */
        static setup(...args) {
            this._args = args
            this._instance = null
        }

        /**
         * Return the singleton instance. Instantiates the class on first call.
         * @returns {Object} the instance
         */
        static getInstance() {
            if (this._instance) {
                return this._instance
            }

            /* Make sure setup() has been called */
            if (this._args == null) {
                this.setup()
            }

            // eslint-disable-next-line new-parens
            this._instance = new (this.bind.apply(this, this._args))

            return this._instance
        }

    }

    return SingletonMixin

})
