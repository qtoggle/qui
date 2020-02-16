/**
 * @namespace qui.utils.gestures
 */

import * as Window from '$qui/window.js'


/**
 * Drag Move Callback Function.
 * @callback qui.utils.gestures.DragMoveCallback
 * @param {Number} elemX the new element x coordinate, relative to page
 * @param {Number} elemY the new element y coordinate, relative to page
 * @param {Number} deltaX the x coordinate variation, relative to initial drag point
 * @param {Number} deltaY the y coordinate variation, relative to initial drag point
 * @param {Number} pageX the x coordinate, relative to page
 * @param {Number} pageY the y coordinate, relative to page
 */

/**
 * Drag Begin Callback Function.
 * @callback qui.utils.gestures.DragBeginCallback
 * @param {Number} elemX the initial element x coordinate, relative to page
 * @param {Number} elemY the initial element y coordinate, relative to page
 * @param {Number} pageX the x coordinate, relative to page
 * @param {Number} pageY the y coordinate, relative to page
 * @returns {Boolean} `false` to prevent dragging
 */

/**
 * Drag End Callback Function.
 * @callback qui.utils.gestures.DragEndCallback
 * @param {Number} elemX the final element x coordinate, relative to page
 * @param {Number} elemY the final element y coordinate, relative to page
 * @param {Number} deltaX the final x coordinate variation, relative to initial drag point
 * @param {Number} deltaY the final y coordinate variation, relative to initial drag point
 * @param {Number} pageX the x coordinate inside, relative to page
 * @param {Number} pageY the y coordinate inside, relative to page
 */

/**
 * Setup an HTML element for dragging.
 * @alias qui.utils.gestures.enableDragging
 * @param {jQuery} element the dragged element
 * @param {qui.utils.gestures.DragMoveCallback} onMove
 * @param {qui.utils.gestures.DragBeginCallback} onBegin
 * @param {qui.utils.gestures.DragEndCallback} onEnd
 * @param {?String} [direction] indicates dragging direction: `"x"`, `"y"` or `null` for both; defaults to `null`
 */
export function enableDragging(element, onMove, onBegin, onEnd, direction) {
    let beginPageX = 0, beginPageY = 0
    let beginElemX = 0, beginElemY = 0

    function pointerDown(e) {
        let elemOffset = element.offset()
        beginElemX = elemOffset.left
        beginElemY = elemOffset.top

        let scalingFactor = Window.getScalingFactor()
        e.pageX /= scalingFactor
        e.pageY /= scalingFactor

        beginPageX = e.pageX
        beginPageY = e.pageY

        if (onBegin) {
            if (onBegin(beginElemX, beginElemY, e.pageX, e.pageY) === false) {
                return
            }
        }

        Window.$body.on('pointermove', pointerMove)
                    .on('pointerup pointercancel pointerleave', pointerUp)
    }

    function pointerUp(e) {
        Window.$body.off('pointermove', pointerMove)
                    .off('pointerup pointercancel pointerleave', pointerUp)

        let scalingFactor = Window.getScalingFactor()
        e.pageX /= scalingFactor
        e.pageY /= scalingFactor

        if (direction === 'x') { /* Constrain moving to horizontal axis */
            e.pageY = beginPageY
        }
        if (direction === 'y') { /* Constrain moving to vertical axis */
            e.pageX = beginPageX
        }

        let deltaX = e.pageX - beginPageX
        let deltaY = e.pageY - beginPageY

        let elemX = beginElemX + deltaX
        let elemY = beginElemY + deltaY

        beginPageX = beginPageY = 0
        beginElemX = beginElemY = 0

        if (onEnd) {
            onEnd(elemX, elemY, deltaX, deltaY, e.pageX, e.pageY)
        }
    }

    function pointerMove(e) {
        let scalingFactor = Window.getScalingFactor()
        e.pageX /= scalingFactor
        e.pageY /= scalingFactor

        if (direction === 'x') { /* Constrain moving to horizontal axis */
            e.pageY = beginPageY
        }
        if (direction === 'y') { /* Constrain moving to vertical axis */
            e.pageX = beginPageX
        }

        let deltaX = e.pageX - beginPageX
        let deltaY = e.pageY - beginPageY

        let elemX = beginElemX + deltaX
        let elemY = beginElemY + deltaY

        if (onMove) {
            onMove(elemX, elemY, deltaX, deltaY, e.pageX, e.pageY)
        }

        e.preventDefault()
    }

    element.data('qui.utils.gestures.dragging', {
        pointerDown: pointerDown,
        pointerUp: pointerUp,
        pointerMove: pointerMove
    })

    let touchAction = 'none'
    if (direction === 'x') {
        touchAction = 'pan-y'
    }
    else if (direction === 'y') {
        touchAction = 'pan-x'
    }

    element.css('touch-action', touchAction)
    element.attr('touch-action', touchAction) /* Required for pep.js (on iOS) */
    element.on('pointerdown', pointerDown)
}

/**
 * Disable previously configured dragging support on an HTML element.
 * @alias qui.utils.gestures.disableDragging
 * @param {jQuery} element the dragged element
 */
export function disableDragging(element) {
    let draggingData = element.data('qui.utils.gestures.dragging')
    if (!draggingData) {
        return
    }

    Window.$body.off('pointermove', draggingData.pointerMove)
                .off('pointerup pointercancel pointerleave', draggingData.pointerUp)

    element.css('touch-action', '')
    element.attr('touch-action', '') /* Required for pep.js (on iOS) */
    element.off('pointerdown', draggingData.pointerDown)
}
