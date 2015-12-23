import { resolveAsset, addClass, removeClass } from '../../util/index'
import { TRANSITION } from '../priorities'
import Transition from '../../transition/transition'

export default {

  priority: TRANSITION,

  update (id, oldId) {
    var el = this.el
    // resolve on owner vm
    var hooks = resolveAsset(this.vm.$options, 'transitions', id)
    id = id || 'v'
    // apply on closest vm
    el.__v_trans = new Transition(el, id, hooks, this.el.__vue__ || this.vm)
    if (oldId) {
      removeClass(el, oldId + '-transition')
    }
    addClass(el, id + '-transition')
  }
}
