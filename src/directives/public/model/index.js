import { warn, resolveAsset } from '../../../util/index'
import { MODEL } from '../../priorities'
import text from './text'
import radio from './radio'
import select from './select'
import checkbox from './checkbox'

const handlers = {
  text,
  radio,
  select,
  checkbox
}

export default {

  priority: MODEL,
  twoWay: true,
  handlers: handlers,
  params: ['lazy', 'number', 'debounce'],

  /**
   * Possible elements:
   *   <select>
   *   <textarea>
   *   <input type="*">
   *     - text
   *     - checkbox
   *     - radio
   *     - number
   */

  bind () {
    // friendly warning...
    this.checkFilters()
    if (this.hasRead && !this.hasWrite) {
      process.env.NODE_ENV !== 'production' && warn(
        'It seems you are using a read-only filter with ' +
        'v-model. You might want to use a two-way filter ' +
        'to ensure correct behavior.'
      )
    }
    var el = this.el
    var tag = el.tagName
    var handler
    if (tag === 'INPUT') {
      handler = handlers[el.type] || handlers.text
    } else if (tag === 'SELECT') {
      handler = handlers.select
    } else if (tag === 'TEXTAREA') {
      handler = handlers.text
    } else {
      process.env.NODE_ENV !== 'production' && warn(
        'v-model does not support element type: ' + tag
      )
      return
    }
    el.__v_model = this
    handler.bind.call(this)
    this.update = handler.update
    this._unbind = handler.unbind
  },

  /**
   * Check read/write filter stats.
   */

  checkFilters () {
    var filters = this.filters
    if (!filters) return
    var i = filters.length
    while (i--) {
      var filter = resolveAsset(this.vm.$options, 'filters', filters[i].name)
      if (typeof filter === 'function' || filter.read) {
        this.hasRead = true
      }
      if (filter.write) {
        this.hasWrite = true
      }
    }
  },

  unbind () {
    this.el.__v_model = null
    this._unbind && this._unbind()
  }
}
