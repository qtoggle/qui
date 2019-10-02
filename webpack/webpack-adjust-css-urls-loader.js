
const loaderUtils = require('loader-utils')


module.exports = function (source) {
    const options = loaderUtils.getOptions(this)
    const appLessPath = options.appLessPath
    const quiLessPath = options.quiLessPath

    let filename
    if (this._module.resource.startsWith(appLessPath)) {
        filename = this._module.resource.slice(appLessPath.length)
    }
    else if (this._module.resource.startsWith(quiLessPath)) {
        filename = this._module.resource.slice(quiLessPath.length)
    }
    else { /* Cannot identify source file root path */
        return source
    }

    let dirsInPath = (filename.match(/\//g) || []).length - 1
    if (dirsInPath < 0) {
        return source
    }

    dirsInPath += options.additionalDirs || 0

    /* Generate a sequence of "../" as long as the number of dirs in path */
    let relPath = [...Array(dirsInPath).keys()].map(() => '../').join('')
    if (!relPath) {
        return source
    }

    /* Adjust any url('...') by prefixing with the relative path, unless we deal with absolute paths */
    return source.replace(new RegExp('url\\(([\'"])?(?!http)(./)?([^/].*)', 'g'), 'url($1' + relPath + '$3')
}
