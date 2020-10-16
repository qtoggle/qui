/**
 * @namespace qui.utils.files
 */


/**
 * Trigger a browser download of a client-side generated file.
 * @alias qui.utils.files.clientSideDownload
 * @param {String} filename
 * @param {String} contentType
 * @param {String|Uint8Array|ArrayBuffer} content
 */
export function clientSideDownload(filename, contentType, content) {
    if (content instanceof ArrayBuffer) {
        content = new Uint8Array(content)
    }
    if (content instanceof Uint8Array) {
        content = new TextDecoder('utf-8').decode(content)
    }

    let contentBase64 = window.btoa(content)
    let a = document.createElement('a')
    let dataURL = `data:${contentType};base64,${contentBase64}`
    a.href = dataURL
    a.setAttribute('download', filename)
    a.click()
}
