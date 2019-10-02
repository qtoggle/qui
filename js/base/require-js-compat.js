/*
 * A layer of compatibility between modules based on `define()`/`require()` and ES6 modules.
 */

let definedModules = {}

const ALIASES = {
    jquery: ['jQuery']
}


function findCallerModuleName() {
    /* Use stack trace to find the name of the first JS file, which is expected to be the module */
    let error = new Error()
    let names = error.stack.match(new RegExp('[A-Za-z0-9_-]+\\.js', 'g'))
    if (!names) {
        return
    }

    /* The name of the module is the name of the script file without the extension */
    let name = names[names.length - 1]
    name = name.split('.').slice(0, -1).join('.')

    return name
}

window.define = function (...args) {
    let name = null
    let depNames = []
    let factory

    if (args.length < 1) {
        return
    }
    else if (args.length < 2) {
        [factory] = args
    }
    else if (args.length < 3) {
        [depNames, factory] = args
    }
    else {
        [name, depNames, factory] = args
    }

    /* For anonymous modules, we need to look for the name of the module script */
    if (!name) {
        name = findCallerModuleName()
    }

    let deps = depNames.map(depName => window[depName])
    let module
    if (typeof factory === 'function') {
        module = factory.apply(null, deps)
    }
    else {
        module = factory
    }

    if (name) {
        window[name] = definedModules[name] = module
    }

    /* Also register module under its aliases */
    (ALIASES[name] || []).forEach(function (alias) {
        window[alias] = module
    })
}

window.define.amd = true


/**
 * Cleanup workarounds set up for providing `define()`/`require()` compatibility.
 */
export function cleanup() {
    Object.keys(definedModules).forEach(name => delete window[name])
    delete window['define']
}
