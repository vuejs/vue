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
    oldId = oldId || 'v'
    el.__v_trans = new Transition(el, id, hooks, this.vm)
    removeClass(el, oldId + '-transition')
    addClass(el, id + '-transition')
  }
}
