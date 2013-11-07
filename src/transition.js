var config   = require('./config'),
    // TODO: sniff proper transitonend event name
    endEvent = 'transitionend'

/**
 *  stage:
 *  1 = enter
 *  2 = leave
 */
module.exports = function (el, stage, changeState, init) {

    // TODO: directly return if IE9

    var className         = el.sd_trans_class,
        classList         = el.classList,
        lastLeaveCallback = el.sd_trans_cb,
        lastEnterTimeout  = el.sd_trans_to

    // in sd-repeat, the sd-transition directive
    // might not have been processed yet
    if (!className) {
        className = el.getAttribute(config.prefix + '-transition-class')
    }

    // TODO: optional duration which
    //       can override the default transitionend event

    // if no transition, just call changeState sync.
    // this is internal API and the changeState callback
    // will always contain only dom manipulations that
    // doesn't care about the sync/async-ness of this method.
    if (init || !className) {
        return changeState()
    }

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
        // trigger show transition next tick
        el.sd_trans_to = setTimeout(function () {
            classList.remove(className)
            el.sd_trans_to = null
        }, 0)

    } else { // leave

        // cancel unfinished enter transition
        if (lastEnterTimeout) {
            clearTimeout(lastEnterTimeout)
            el.sd_trans_to = null
        }

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