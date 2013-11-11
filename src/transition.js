var config   = require('./config'),
    endEvent = sniffTransitionEndEvent()

/**
 *  stage:
 *  1 = enter
 *  2 = leave
 */
module.exports = function (el, stage, changeState, init) {

    if (!endEvent || init) {
        return changeState()
    }

    var className =
        el.sd_trans_class ||
        // in sd-repeat, the sd-transition directive
        // might not have been processed yet
        el.getAttribute(config.transClassAttr)

    if (!className) {
        return changeState()
    }

    var classList         = el.classList,
        lastLeaveCallback = el.sd_trans_cb

    if (stage > 0) { // enter

        // cancel unfinished leave transition
        if (lastLeaveCallback) {
            el.removeEventListener(endEvent, lastLeaveCallback)
            el.sd_trans_cb = null
        }

        // set to hidden state before appending
        classList.add(className)
        // append
        changeState()
        // force a layout so transition can be triggered
        /* jshint unused: false */
        var forceLayout = el.clientHeight
        // trigger transition
        classList.remove(className)

    } else { // leave

        // trigger hide transition
        classList.add(className)
        var onEnd = function () {
            el.removeEventListener(endEvent, onEnd)
            el.sd_trans_cb = null
            // actually remove node here
            changeState()
            classList.remove(className)
        }
        // attach transition end listener
        el.addEventListener(endEvent, onEnd)
        el.sd_trans_cb = onEnd
        
    }
}

/**
 *  Sniff proper transition end event name
 */
function sniffTransitionEndEvent () {
    var el = document.createElement('div'),
        defaultEvent = 'transitionend',
        events = {
            'transition'       : defaultEvent,
            'MozTransition'    : defaultEvent,
            'WebkitTransition' : 'webkitTransitionEnd'
        }
    for (var name in events) {
        if (el.style[name] !== undefined) {
            return events[name]
        }
    }
}