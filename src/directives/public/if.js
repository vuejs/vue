import FragmentFactory from '../../fragment/factory'
import { IF } from '../priorities'
import {
  getAttr,
  remove,
  replace,
  createAnchor,
  warn
} from '../../util/index'

export default {

  priority: IF,

  bind () {
    var el = this.el
    if (!el.__vue__) {
      // check else block
      var next = el.nextElementSibling
      if (next && getAttr(next, 'v-else') !== null) {
        remove(next)
        this.elseFactory = new FragmentFactory(this.vm, next)
      }
      // check main block
      this.anchor = createAnchor('v-if')
      replace(el, this.anchor)
      this.factory = new FragmentFactory(this.vm, el)
    } else {
      process.env.NODE_ENV !== 'production' && warn(
        'v-if="' + this.expression + '" cannot be ' +
        'used on an instance root element.'
      )
      this.invalid = true
    }
  },

  update (value) {
    if (this.invalid) return
    if (value) {
      if (!this.frag) {
        this.insert()
      }
    } else {
      this.remove()
    }
  },

  insert () {
    if (this.elseFrag) {
      this.elseFrag.remove()
      this.elseFrag = null
    }
    this.frag = this.factory.create(this._host, this._scope, this._frag)
    this.frag.before(this.anchor)
  },

  remove: function () {
    if (this.frag) {
      this.frag.remove()
      this.frag = null
    }
    if (this.elseFactory && !this.elseFrag) {
      this.elseFrag = this.elseFactory.create(this._host, this._scope, this._frag)
      this.elseFrag.before(this.anchor)
    }
  },

  unbind: function () {
    if (this.frag) {
      this.frag.destroy()
    }
  }
}
