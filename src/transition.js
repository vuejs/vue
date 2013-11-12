var config   = require('./config'),
    endEvent = sniffTransitionEndEvent()

/**
 *  stage:
 *  1 = enter
 *  2 = leave
 */
module.exports = function (el, stage, changeState, compiler) {

    if (compiler.init) return changeState()

    // in sd-repeat, the transition directives
    // might not have been processed yet
    var transitionFunctionId =
            el.sd_trans ||
            el.getAttribute(config.transAttr),
        transitionClass =
            el.sd_trans_class ||
            el.getAttribute(config.transClassAttr)

    if (transitionFunctionId) {
        applyTransitionFunctions(
            el,
            stage,
            changeState,
            transitionFunctionId,
            compiler
        )
    } else if (transitionClass) {
        applyTransitionClass(
            el,
            stage,
            changeState,
            transitionClass
        )
    } else {
        return changeState()
    }

}

/**
 *  Togggle a CSS class to trigger transition
 */
function applyTransitionClass (el, stage, changeState, className) {

    if (!endEvent || !className) {
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

function applyTransitionFunctions (el, stage, changeState, functionId, compiler) {

    var funcs = compiler.getOption('transitions', functionId)
    if (!funcs) {
        return changeState()
    }

    var enter = funcs.enter,
        leave = funcs.leave
        
    if (stage > 0) { // enter
        if (typeof enter !== 'function') return changeState()
        enter(el, changeState)
    } else { // leave
        if (typeof leave !== 'function') return changeState()
        leave(el, changeState)
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