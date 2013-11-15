var endEvent = sniffTransitionEndEvent(),
    codes    = {
        CSS_E     : 1,
        CSS_L     : 2,
        JS_E      : 3,
        JS_L      : 4,
        CSS_SKIP  : -1,
        JS_SKIP   : -2,
        JS_SKIP_E : -3,
        JS_SKIP_L : -4,
        INIT      : -5,
        SKIP      : -6
    }

/**
 *  stage:
 *    1 = enter
 *    2 = leave
 */
var transition = module.exports = function (el, stage, changeState, compiler) {

    if (compiler.init) {
        changeState()
        return codes.INIT
    }

    var transitionFunctionId = el.sd_trans,
        transitionClass = el.sd_trans_class

    if (transitionFunctionId) {
        return applyTransitionFunctions(
            el,
            stage,
            changeState,
            transitionFunctionId,
            compiler
        )
    } else if (transitionClass) {
        return applyTransitionClass(
            el,
            stage,
            changeState,
            transitionClass
        )
    } else {
        changeState()
        return codes.SKIP
    }

}

transition.codes = codes

/**
 *  Togggle a CSS class to trigger transition
 */
function applyTransitionClass (el, stage, changeState, classes) {

    if (!endEvent) {
        changeState()
        return codes.CSS_SKIP
    }

    var classList         = el.classList,
        lastLeaveCallback = el.sd_trans_cb,
        className

    if (stage > 0) { // enter

        className = classes[0]

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
        return codes.CSS_E

    } else { // leave

        className = classes[classes.length > 1 ? 1 : 0]

        // trigger hide transition
        classList.add(className)
        var onEnd = function (e) {
            if (e.target === el) {
                el.removeEventListener(endEvent, onEnd)
                el.sd_trans_cb = null
                // actually remove node here
                changeState()
                classList.remove(className)
            }
        }
        // attach transition end listener
        el.addEventListener(endEvent, onEnd)
        el.sd_trans_cb = onEnd
        return codes.CSS_L
        
    }

}

function applyTransitionFunctions (el, stage, changeState, functionId, compiler) {

    var funcs = compiler.getOption('transitions', functionId)
    if (!funcs) {
        changeState()
        return codes.JS_SKIP
    }

    var enter = funcs.enter,
        leave = funcs.leave

    if (stage > 0) { // enter
        if (typeof enter !== 'function') {
            changeState()
            return codes.JS_SKIP_E
        }
        enter(el, changeState)
        return codes.JS_E
    } else { // leave
        if (typeof leave !== 'function') {
            changeState()
            return codes.JS_SKIP_L
        }
        leave(el, changeState)
        return codes.JS_L
    }

}

/**
 *  Sniff proper transition end event name
 */
function sniffTransitionEndEvent () {
    var el = document.createElement('seed'),
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