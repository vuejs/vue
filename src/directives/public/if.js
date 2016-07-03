import FragmentFactory from '../../fragment/factory'
import { IF } from '../priorities'
import {
  getAttr,
  remove,
  replace,
  createAnchor,
  warn,
  findVmFromFrag
} from '../../util/index'

export default {

  priority: IF,
  terminal: true,

  bind () {
    var el = this.el
    if (!el.__vue__) {
      // check else block
      var next = el.nextElementSibling
      if (next && getAttr(next, 'v-else') !== null) {
        remove(next)
        this.elseEl = next
      }
      // check main block
      this.anchor = createAnchor('v-if')
      replace(el, this.anchor)
    } else {
      process.env.NODE_ENV !== 'production' && warn(
        'v-if="' + this.expression + '" cannot be ' +
        'used on an instance root element.',
        this.vm
      )
      this.invalid = true
    }
  },

  update (value) {
    if (this.invalid) return
    if (value) {
      if (!this.frag) {
        this.insert()
        this.updateRef(value)
      }
    } else {
      this.updateRef(value)
      this.remove()
    }
  },

  insert () {
    if (this.elseFrag) {
      this.elseFrag.remove()
      this.elseFrag = null
    }
    // lazy init factory
    if (!this.factory) {
      this.factory = new FragmentFactory(this.vm, this.el)
    }
    this.frag = this.factory.create(this._host, this._scope, this._frag)
    this.frag.before(this.anchor)
  },

  remove () {
    if (this.frag) {
      this.frag.remove()
      this.frag = null
    }
    if (this.elseEl && !this.elseFrag) {
      if (!this.elseFactory) {
        this.elseFactory = new FragmentFactory(
          this.elseEl._context || this.vm,
          this.elseEl
        )
      }
      this.elseFrag = this.elseFactory.create(this._host, this._scope, this._frag)
      this.elseFrag.before(this.anchor)
    }
  },

  updateRef (value) {
    var ref = this.descriptor.ref
    if (!ref) return
    var hash = (this.vm || this._scope).$refs
    var refs = hash[ref]
    var key = this._frag.scope.$key
    if (!refs) return
    if (value) {
      if (Array.isArray(refs)) {
        refs.push(findVmFromFrag(this._frag))
      } else {
        refs[key] = findVmFromFrag(this._frag)
      }
    } else {
      if (Array.isArray(refs)) {
        refs.$remove(findVmFromFrag(this._frag))
      } else {
        refs[key] = null
        delete refs[key]
      }
    }
  },

  unbind () {
    if (this.frag) {
      this.frag.destroy()
    }
    if (this.elseFrag) {
      this.elseFrag.destroy()
    }
  }
}
