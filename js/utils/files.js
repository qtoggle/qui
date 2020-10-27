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

    let blob = new window.Blob([content], {type: contentType})
    let dataURL = URL.createObjectURL(blob)
    let a = document.createElement('a')
    a.href = dataURL
    a.setAttribute('download', filename)
    a.click()
}
