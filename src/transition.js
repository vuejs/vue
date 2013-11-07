var endEvent = 'transitionend'

/**
 *  stage:
 *  1 = enter
 *  2 = leave
 */
module.exports = function (el, stage, changeState, init) {

    var className = el.sd_transition
    if (init || !className) {
        return changeState()
    }

    var cl = el.classList

    if (stage > 0) { // enter
        cl.add(className)
        changeState()
        setTimeout(function () {
            cl.remove(className)
        }, 0)
    } else { // leave
        cl.add(className)
        el.addEventListener(endEvent, onEnd)
    }

    function onEnd () {
        el.removeEventListener(endEvent, onEnd)
        changeState()
    }
}