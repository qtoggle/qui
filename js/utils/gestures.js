/**
 * @namespace qui.utils.gestures
 */

import $ from '$qui/lib/jquery.module.js'

import * as Window from '$qui/window.js'


const LONG_PRESS_DATA_KEY = 'qui.utils.gestures.longPress'


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

/**
 * Long Press Callback Function.
 * @callback qui.utils.gestures.LongPressCallback
 * @param {jQuery} element the pressed element
 * @param {jQuery.Event} event the pointer event that started the press
 */

/**
 * Setup long press detection on an HTML element.
 *
 * Detection is based on pointer events, which never block scrolling; a press is automatically abandoned as soon as
 * the browser starts scrolling with the same pointer, or as soon as the pointer moves further than `moveThreshold`.
 *
 * When a `selector` is given, presses are detected for matching descendants of `element` rather than for `element`
 * itself. This allows handling long presses on a large number of children with a single set of event handlers.
 *
 * @alias qui.utils.gestures.enableLongPress
 * @param {jQuery} element the element on which presses are detected
 * @param {qui.utils.gestures.LongPressCallback} onLongPress called when the element has been pressed for at least
 * `duration` milliseconds
 * @param {?qui.utils.gestures.LongPressCallback} [onShortPress] called when the element has been released before
 * `duration` milliseconds have elapsed
 * @param {?String} [selector] an optional selector restricting detection to matching descendants of `element`
 * @param {Number} [duration] how long the element must be pressed for a long press, in milliseconds (defaults to
 * `500`)
 * @param {Number} [moveThreshold] how far the pointer may move before the press is abandoned, in pixels (defaults to
 * `10`)
 */
export function enableLongPress(
    element,
    {onLongPress, onShortPress = null, selector = null, duration = 500, moveThreshold = 10}
) {
    let timeoutHandle = null
    let pressedElement = null
    let pressedPointerId = null
    let startPageX = 0
    let startPageY = 0

    function abandon() {
        if (timeoutHandle != null) {
            clearTimeout(timeoutHandle)
            timeoutHandle = null
        }

        pressedElement = null
        pressedPointerId = null

        Window.$body.off('pointermove', pointerMove)
                    .off('pointerup pointercancel', pointerUp)
    }

    function isPrimaryPointer(e) {
        /* jQuery normalizes pointerId and pointerType, but not isPrimary, which must be read from the original
         * event; events triggered programmatically have no original event and are considered primary */
        return !e.originalEvent || e.originalEvent.isPrimary !== false
    }

    function pointerDown(e) {
        /* Only the primary pointer (first finger, left mouse button) can start a press */
        if (!isPrimaryPointer(e) || (e.pointerType === 'mouse' && e.button !== 0)) {
            return
        }

        abandon() /* Any previous press is implicitly abandoned */

        pressedElement = $(this)
        pressedPointerId = e.pointerId
        startPageX = e.pageX
        startPageY = e.pageY

        timeoutHandle = setTimeout(function () {

            timeoutHandle = null

            let element = pressedElement
            abandon()
            onLongPress(element, e)

        }, duration)

        Window.$body.on('pointermove', pointerMove)
                    .on('pointerup pointercancel', pointerUp)
    }

    function pointerMove(e) {
        /* Ignore any pointer other than the one that started the press */
        if (!pressedElement || e.pointerId !== pressedPointerId) {
            return
        }

        if (Math.abs(e.pageX - startPageX) > moveThreshold || Math.abs(e.pageY - startPageY) > moveThreshold) {
            abandon()
        }
    }

    function pointerUp(e) {
        /* Ignore any pointer other than the one that started the press */
        if (!pressedElement || e.pointerId !== pressedPointerId) {
            return
        }

        /* A pending timeout means the press has been released before becoming a long press */
        let shortPress = timeoutHandle != null

        let element = pressedElement
        abandon()

        if (shortPress && onShortPress) {
            onShortPress(element, e)
        }
    }

    element.data(LONG_PRESS_DATA_KEY, {pointerDown: pointerDown, abandon: abandon, selector: selector})
    element.on('pointerdown', selector, pointerDown)
}

/**
 * Disable previously configured long press support on an HTML element.
 * @alias qui.utils.gestures.disableLongPress
 * @param {jQuery} element the element on which presses are detected
 */
export function disableLongPress(element) {
    let longPressData = element.data(LONG_PRESS_DATA_KEY)
    if (!longPressData) {
        return
    }

    longPressData.abandon()
    element.off('pointerdown', longPressData.selector, longPressData.pointerDown)
    element.removeData(LONG_PRESS_DATA_KEY)
}
