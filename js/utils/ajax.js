/**
 * @namespace qui.utils.ajax
 */

import $ from '$qui/lib/jquery.module.js'

import * as ObjectUtils from '$qui/utils/object.js'
import * as Window      from '$qui/window.js'

import {asap} from './misc.js'
import URL    from './url.js'


const DEFAULT_REQUEST_TIMEOUT = 60 /* Seconds */

let pendingRequests = []


function prepareResponseHeaders(response) {
    let headersStr = response.getAllResponseHeaders()
    let headers = headersStr.split('\r\n').filter(h => h.length > 0)

    return ObjectUtils.fromEntries(headers.map(function (h) {
        let parts = h.split(':')
        let name = parts[0].trim()
        let value = parts.slice(1).join(':').trim()

        return [name, value]
    }))
}


/**
 * Return a list of currently pending requests
 * @alias qui.utils.ajax.getPendingRequests
 * @returns {jqXHR[]}
 */
export function getPendingRequests() {
    return pendingRequests.slice()
}

/**
 * Perform an AJAX JSON HTTP request and decode response as JSON.
 * @alias qui.utils.ajax.requestJSON
 * @param {String} method the HTTP method
 * @param {String} path the path to request
 * @param {Object} query
 * @param {*} data data to transmit in request body
 * @param {Function} [success] successful callback; will be called with decoded response and headers as parameters
 * @param {Function} [failure] failure callback; will be called with decoded response, status code, a result message and
 * headers as parameters
 * @param {Object} [headers] optional request headers
 * @param {Number} [timeout] optional request timeout, in seconds
 * @returns {jqXHR}
 */
export function requestJSON(
    method, path, query, data = null, success = null, failure = null, headers = null,
    timeout = DEFAULT_REQUEST_TIMEOUT
) {
    let contentType = null

    if (data != null) {
        data = JSON.stringify(data)
        contentType = 'application/json'
    }

    let url = URL.parse(window.location.href).alter({path: path, query: query}).toString()

    let request = $.ajax({
        url: url,
        type: method,
        data: data,
        processData: false,
        cache: false,
        contentType: contentType,
        timeout: timeout * 1000,
        beforeSend: function (xhr) {
            if (headers) {
                ObjectUtils.forEach(headers, function (k, v) {
                    xhr.setRequestHeader(k, v)
                })
            }
        },
        success: function (data, status, response) {
            let headers = prepareResponseHeaders(response)

            /* Delay calling the success handler a bit so that complete handler below gets called */
            asap(function () {
                if (success) {
                    success(data, headers)
                }
            })
        },
        error: function (request, msg) {
            let headers = prepareResponseHeaders(request)

            /* Defer error handling a bit, it seems to fix call order when window closes */
            asap(function () {
                if (failure) {
                    failure(request.responseJSON || {}, request.status, msg, headers)
                }
            })
        },
        complete: function (req, status) {
            /* Remove the request from pending list */
            let index = pendingRequests.indexOf(request)
            if (index >= 0) {
                pendingRequests.splice(index, 1)
            }
        }
    })

    request.details = {
        method: method,
        path: path,
        query: query,
        data: data,
        sent: new Date()
    }

    if (!Window.isClosing()) {
        pendingRequests.push(request)
    }

    return request
}
