import vIf from '../public/if'
import FragmentFactory from '../../fragment/factory'
import { PARTIAL } from '../priorities'
import {
  createAnchor,
  replace,
  resolveAsset
} from '../../util/index'

export default {

  priority: PARTIAL,

  params: ['name'],

  // watch changes to name for dynamic partials
  paramWatchers: {
    name (value) {
      vIf.remove.call(this)
      if (value) {
        this.insert(value)
      }
    }
  },

  bind () {
    this.anchor = createAnchor('v-partial')
    replace(this.el, this.anchor)
    this.insert(this.params.name)
  },

  insert (id) {
    var partial = resolveAsset(this.vm.$options, 'partials', id, true)
    if (partial) {
      this.factory = new FragmentFactory(this.vm, partial)
      vIf.insert.call(this)
    }
  },

  unbind () {
    if (this.frag) {
      this.frag.destroy()
    }
  }
}
