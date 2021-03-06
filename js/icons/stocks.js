/**
 * @namespace qui.icons.stocks
 */

import Logger from '$qui/lib/logger.module.js'

import * as Theme from '$qui/theme.js'


const logger = Logger.get('qui.icons')

let stocks = {}
let stockMakers = []


function makeStocks() {
    Object.values(stockMakers).forEach(function ({name, stockMaker}) {
        logger.debug(`making stock "${name}"`)
        let stock = stocks[name] = stockMaker()
        stock.prepare()
    })
}


/**
 * Lookup and return an icon stock by its name.
 * @alias qui.icons.stocks.get
 * @param {String} name
 * @returns {qui.icons.Stock}
 */
export function get(name) {
    return stocks[name]
}

/**
 * Register an icon stock.
 * @alias qui.icons.stocks.register
 * @param {String} name stock name
 * @param {Function} stockMaker a function that creates the stock
 */
export function register(name, stockMaker) {
    stockMakers.push({name: name, stockMaker: stockMaker})
    logger.debug(`registering stock "${name}"`)
}

/**
 * Initialize icon stocks.
 * @alias qui.icons.stocks.init
 */
export function init() {
    makeStocks()

    Theme.changeSignal.connect(function () {
        stocks = {}
        makeStocks()
    })
}
