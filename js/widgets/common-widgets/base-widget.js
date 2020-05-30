
import $ from '$qui/lib/jquery.module.js'


$.widget('qui.basewidget', {

    options: {
        warning: null,
        error: null
    },

    _setOption: function (key, value) {
        this._super(key, value)

        switch (key) {
            case 'warning':
            case 'error':
                this.element.toggleClass(`has-${key}`, value != null)
                break
        }
    }

})
