import FragmentFactory from '../../fragment/factory'
import { FOR } from '../priorities'
import { withoutConversion } from '../../observer/index'
import { getPath } from '../../parsers/path'
import {
  isObject,
  warn,
  createAnchor,
  replace,
  before,
  after,
  remove,
  hasOwn,
  inDoc,
  defineReactive,
  def,
  cancellable,
  isArray,
  isPlainObject
} from '../../util/index'

let uid = 0

const vFor = {

  priority: FOR,
  terminal: true,

  params: [
    'track-by',
    'stagger',
    'enter-stagger',
    'leave-stagger'
  ],

  bind () {
    // support "item in/of items" syntax
    var inMatch = this.expression.match(/(.*) (?:in|of) (.*)/)
    if (inMatch) {
      var itMatch = inMatch[1].match(/\((.*),(.*)\)/)
      if (itMatch) {
        this.iterator = itMatch[1].trim()
        this.alias = itMatch[2].trim()
      } else {
        this.alias = inMatch[1].trim()
      }
      this.expression = inMatch[2]
    }

    if (!this.alias) {
      process.env.NODE_ENV !== 'production' && warn(
        'Invalid v-for expression "' + this.descriptor.raw + '": ' +
        'alias is required.',
        this.vm
      )
      return
    }

    // uid as a cache identifier
    this.id = '__v-for__' + (++uid)

    // check if this is an option list,
    // so that we know if we need to update the <select>'s
    // v-model when the option list has changed.
    // because v-model has a lower priority than v-for,
    // the v-model is not bound here yet, so we have to
    // retrive it in the actual updateModel() function.
    var tag = this.el.tagName
    this.isOption =
      (tag === 'OPTION' || tag === 'OPTGROUP') &&
      this.el.parentNode.tagName === 'SELECT'

    // setup anchor nodes
    this.start = createAnchor('v-for-start')
    this.end = createAnchor('v-for-end')
    replace(this.el, this.end)
    before(this.start, this.end)

    // cache
    this.cache = Object.create(null)

    // fragment factory
    this.factory = new FragmentFactory(this.vm, this.el)
  },

  update (data) {
    this.diff(data)
    this.updateRef()
    this.updateModel()
  },

  /**
   * Diff, based on new data and old data, determine the
   * minimum amount of DOM manipulations needed to make the
   * DOM reflect the new data Array.
   *
   * The algorithm diffs the new data Array by storing a
   * hidden reference to an owner vm instance on previously
   * seen data. This allows us to achieve O(n) which is
   * better than a levenshtein distance based algorithm,
   * which is O(m * n).
   *
   * @param {Array} data
   */

  diff (data) {
    // check if the Array was converted from an Object
    var item = data[0]
    var convertedFromObject = this.fromObject =
      isObject(item) &&
      hasOwn(item, '$key') &&
      hasOwn(item, '$value')

    var trackByKey = this.params.trackBy
    var oldFrags = this.frags
    var frags = this.frags = new Array(data.length)
    var alias = this.alias
    var iterator = this.iterator
    var start = this.start
    var end = this.end
    var inDocument = inDoc(start)
    var init = !oldFrags
    var i, l, frag, key, value, primitive

    // First pass, go through the new Array and fill up
    // the new frags array. If a piece of data has a cached
    // instance for it, we reuse it. Otherwise build a new
    // instance.
    for (i = 0, l = data.length; i < l; i++) {
      item = data[i]
      key = convertedFromObject ? item.$key : null
      value = convertedFromObject ? item.$value : item
      primitive = !isObject(value)
      frag = !init && this.getCachedFrag(value, i, key)
      if (frag) { // reusable fragment
        frag.reused = true
        // update $index
        frag.scope.$index = i
        // update $key
        if (key) {
          frag.scope.$key = key
        }
        // update iterator
        if (iterator) {
          frag.scope[iterator] = key !== null ? key : i
        }
        // update data for track-by, object repeat &
        // primitive values.
        if (trackByKey || convertedFromObject || primitive) {
          withoutConversion(() => {
            frag.scope[alias] = value
          })
        }
      } else { // new isntance
        frag = this.create(value, alias, i, key)
        frag.fresh = !init
      }
      frags[i] = frag
      if (init) {
        frag.before(end)
      }
    }

    // we're done for the initial render.
    if (init) {
      return
    }

    // Second pass, go through the old fragments and
    // destroy those who are not reused (and remove them
    // from cache)
    var removalIndex = 0
    var totalRemoved = oldFrags.length - frags.length
    // when removing a large number of fragments, watcher removal
    // turns out to be a perf bottleneck, so we batch the watcher
    // removals into a single filter call!
    this.vm._vForRemoving = true
    for (i = 0, l = oldFrags.length; i < l; i++) {
      frag = oldFrags[i]
      if (!frag.reused) {
        this.deleteCachedFrag(frag)
        this.remove(frag, removalIndex++, totalRemoved, inDocument)
      }
    }
    this.vm._vForRemoving = false
    if (removalIndex) {
      this.vm._watchers = this.vm._watchers.filter(w => w.active)
    }

    // Final pass, move/insert new fragments into the
    // right place.
    var targetPrev, prevEl, currentPrev
    var insertionIndex = 0
    for (i = 0, l = frags.length; i < l; i++) {
      frag = frags[i]
      // this is the frag that we should be after
      targetPrev = frags[i - 1]
      prevEl = targetPrev
        ? targetPrev.staggerCb
          ? targetPrev.staggerAnchor
          : targetPrev.end || targetPrev.node
        : start
      if (frag.reused && !frag.staggerCb) {
        currentPrev = findPrevFrag(frag, start, this.id)
        if (
          currentPrev !== targetPrev && (
            !currentPrev ||
            // optimization for moving a single item.
            // thanks to suggestions by @livoras in #1807
            findPrevFrag(currentPrev, start, this.id) !== targetPrev
          )
        ) {
          this.move(frag, prevEl)
        }
      } else {
        // new instance, or still in stagger.
        // insert with updated stagger index.
        this.insert(frag, insertionIndex++, prevEl, inDocument)
      }
      frag.reused = frag.fresh = false
    }
  },

  /**
   * Create a new fragment instance.
   *
   * @param {*} value
   * @param {String} alias
   * @param {Number} index
   * @param {String} [key]
   * @return {Fragment}
   */

  create (value, alias, index, key) {
    var host = this._host
    // create iteration scope
    var parentScope = this._scope || this.vm
    var scope = Object.create(parentScope)
    // ref holder for the scope
    scope.$refs = Object.create(parentScope.$refs)
    scope.$els = Object.create(parentScope.$els)
    // make sure point $parent to parent scope
    scope.$parent = parentScope
    // for two-way binding on alias
    scope.$forContext = this
    // define scope properties
    // important: define the scope alias without forced conversion
    // so that frozen data structures remain non-reactive.
    withoutConversion(() => {
      defineReactive(scope, alias, value)
    })
    defineReactive(scope, '$index', index)
    if (key) {
      defineReactive(scope, '$key', key)
    } else if (scope.$key) {
      // avoid accidental fallback
      def(scope, '$key', null)
    }
    if (this.iterator) {
      defineReactive(scope, this.iterator, key !== null ? key : index)
    }
    var frag = this.factory.create(host, scope, this._frag)
    frag.forId = this.id
    this.cacheFrag(value, frag, index, key)
    return frag
  },

  /**
   * Update the v-ref on owner vm.
   */

  updateRef () {
    var ref = this.descriptor.ref
    if (!ref) return
    var hash = (this._scope || this.vm).$refs
    var refs
    if (!this.fromObject) {
      refs = this.frags.map(findVmFromFrag)
    } else {
      refs = {}
      this.frags.forEach(function (frag) {
        refs[frag.scope.$key] = findVmFromFrag(frag)
      })
    }
    hash[ref] = refs
  },

  /**
   * For option lists, update the containing v-model on
   * parent <select>.
   */

  updateModel () {
    if (this.isOption) {
      var parent = this.start.parentNode
      var model = parent && parent.__v_model
      if (model) {
        model.forceUpdate()
      }
    }
  },

  /**
   * Insert a fragment. Handles staggering.
   *
   * @param {Fragment} frag
   * @param {Number} index
   * @param {Node} prevEl
   * @param {Boolean} inDocument
   */

  insert (frag, index, prevEl, inDocument) {
    if (frag.staggerCb) {
      frag.staggerCb.cancel()
      frag.staggerCb = null
    }
    var staggerAmount = this.getStagger(frag, index, null, 'enter')
    if (inDocument && staggerAmount) {
      // create an anchor and insert it synchronously,
      // so that we can resolve the correct order without
      // worrying about some elements not inserted yet
      var anchor = frag.staggerAnchor
      if (!anchor) {
        anchor = frag.staggerAnchor = createAnchor('stagger-anchor')
        anchor.__v_frag = frag
      }
      after(anchor, prevEl)
      var op = frag.staggerCb = cancellable(function () {
        frag.staggerCb = null
        frag.before(anchor)
        remove(anchor)
      })
      setTimeout(op, staggerAmount)
    } else {
      frag.before(prevEl.nextSibling)
    }
  },

  /**
   * Remove a fragment. Handles staggering.
   *
   * @param {Fragment} frag
   * @param {Number} index
   * @param {Number} total
   * @param {Boolean} inDocument
   */

  remove (frag, index, total, inDocument) {
    if (frag.staggerCb) {
      frag.staggerCb.cancel()
      frag.staggerCb = null
      // it's not possible for the same frag to be removed
      // twice, so if we have a pending stagger callback,
      // it means this frag is queued for enter but removed
      // before its transition started. Since it is already
      // destroyed, we can just leave it in detached state.
      return
    }
    var staggerAmount = this.getStagger(frag, index, total, 'leave')
    if (inDocument && staggerAmount) {
      var op = frag.staggerCb = cancellable(function () {
        frag.staggerCb = null
        frag.remove()
      })
      setTimeout(op, staggerAmount)
    } else {
      frag.remove()
    }
  },

  /**
   * Move a fragment to a new position.
   * Force no transition.
   *
   * @param {Fragment} frag
   * @param {Node} prevEl
   */

  move (frag, prevEl) {
    // fix a common issue with Sortable:
    // if prevEl doesn't have nextSibling, this means it's
    // been dragged after the end anchor. Just re-position
    // the end anchor to the end of the container.
    /* istanbul ignore if */
    if (!prevEl.nextSibling) {
      this.end.parentNode.appendChild(this.end)
    }
    frag.before(prevEl.nextSibling, false)
  },

  /**
   * Cache a fragment using track-by or the object key.
   *
   * @param {*} value
   * @param {Fragment} frag
   * @param {Number} index
   * @param {String} [key]
   */

  cacheFrag (value, frag, index, key) {
    var trackByKey = this.params.trackBy
    var cache = this.cache
    var primitive = !isObject(value)
    var id
    if (key || trackByKey || primitive) {
      id = trackByKey
        ? trackByKey === '$index'
          ? index
          : getPath(value, trackByKey)
        : (key || value)
      if (!cache[id]) {
        cache[id] = frag
      } else if (trackByKey !== '$index') {
        process.env.NODE_ENV !== 'production' &&
        this.warnDuplicate(value)
      }
    } else {
      id = this.id
      if (hasOwn(value, id)) {
        if (value[id] === null) {
          value[id] = frag
        } else {
          process.env.NODE_ENV !== 'production' &&
          this.warnDuplicate(value)
        }
      } else {
        def(value, id, frag)
      }
    }
    frag.raw = value
  },

  /**
   * Get a cached fragment from the value/index/key
   *
   * @param {*} value
   * @param {Number} index
   * @param {String} key
   * @return {Fragment}
   */

  getCachedFrag (value, index, key) {
    var trackByKey = this.params.trackBy
    var primitive = !isObject(value)
    var frag
    if (key || trackByKey || primitive) {
      var id = trackByKey
        ? trackByKey === '$index'
          ? index
          : getPath(value, trackByKey)
        : (key || value)
      frag = this.cache[id]
    } else {
      frag = value[this.id]
    }
    if (frag && (frag.reused || frag.fresh)) {
      process.env.NODE_ENV !== 'production' &&
      this.warnDuplicate(value)
    }
    return frag
  },

  /**
   * Delete a fragment from cache.
   *
   * @param {Fragment} frag
   */

  deleteCachedFrag (frag) {
    var value = frag.raw
    var trackByKey = this.params.trackBy
    var scope = frag.scope
    var index = scope.$index
    // fix #948: avoid accidentally fall through to
    // a parent repeater which happens to have $key.
    var key = hasOwn(scope, '$key') && scope.$key
    var primitive = !isObject(value)
    if (trackByKey || key || primitive) {
      var id = trackByKey
        ? trackByKey === '$index'
          ? index
          : getPath(value, trackByKey)
        : (key || value)
      this.cache[id] = null
    } else {
      value[this.id] = null
      frag.raw = null
    }
  },

  /**
   * Get the stagger amount for an insertion/removal.
   *
   * @param {Fragment} frag
   * @param {Number} index
   * @param {Number} total
   * @param {String} type
   */

  getStagger (frag, index, total, type) {
    type = type + 'Stagger'
    var trans = frag.node.__v_trans
    var hooks = trans && trans.hooks
    var hook = hooks && (hooks[type] || hooks.stagger)
    return hook
      ? hook.call(frag, index, total)
      : index * parseInt(this.params[type] || this.params.stagger, 10)
  },

  /**
   * Pre-process the value before piping it through the
   * filters. This is passed to and called by the watcher.
   */

  _preProcess (value) {
    // regardless of type, store the un-filtered raw value.
    this.rawValue = value
    return value
  },

  /**
   * Post-process the value after it has been piped through
   * the filters. This is passed to and called by the watcher.
   *
   * It is necessary for this to be called during the
   * wathcer's dependency collection phase because we want
   * the v-for to update when the source Object is mutated.
   */

  _postProcess (value) {
    if (isArray(value)) {
      return value
    } else if (isPlainObject(value)) {
      // convert plain object to array.
      var keys = Object.keys(value)
      var i = keys.length
      var res = new Array(i)
      var key
      while (i--) {
        key = keys[i]
        res[i] = {
          $key: key,
          $value: value[key]
        }
      }
      return res
    } else {
      if (typeof value === 'number' && !isNaN(value)) {
        value = range(value)
      }
      return value || []
    }
  },

  unbind () {
    if (this.descriptor.ref) {
      (this._scope || this.vm).$refs[this.descriptor.ref] = null
    }
    if (this.frags) {
      var i = this.frags.length
      var frag
      while (i--) {
        frag = this.frags[i]
        this.deleteCachedFrag(frag)
        frag.destroy()
      }
    }
  }
}

/**
 * Helper to find the previous element that is a fragment
 * anchor. This is necessary because a destroyed frag's
 * element could still be lingering in the DOM before its
 * leaving transition finishes, but its inserted flag
 * should have been set to false so we can skip them.
 *
 * If this is a block repeat, we want to make sure we only
 * return frag that is bound to this v-for. (see #929)
 *
 * @param {Fragment} frag
 * @param {Comment|Text} anchor
 * @param {String} id
 * @return {Fragment}
 */

function findPrevFrag (frag, anchor, id) {
  var el = frag.node.previousSibling
  /* istanbul ignore if */
  if (!el) return
  frag = el.__v_frag
  while (
    (!frag || frag.forId !== id || !frag.inserted) &&
    el !== anchor
  ) {
    el = el.previousSibling
    /* istanbul ignore if */
    if (!el) return
    frag = el.__v_frag
  }
  return frag
}

/**
 * Find a vm from a fragment.
 *
 * @param {Fragment} frag
 * @return {Vue|undefined}
 */

function findVmFromFrag (frag) {
  let node = frag.node
  // handle multi-node frag
  if (frag.end) {
    while (!node.__vue__ && node !== frag.end && node.nextSibling) {
      node = node.nextSibling
    }
  }
  return node.__vue__
}

/**
 * Create a range array from given number.
 *
 * @param {Number} n
 * @return {Array}
 */

function range (n) {
  var i = -1
  var ret = new Array(Math.floor(n))
  while (++i < n) {
    ret[i] = i
  }
  return ret
}

if (process.env.NODE_ENV !== 'production') {
  vFor.warnDuplicate = function (value) {
    warn(
      'Duplicate value found in v-for="' + this.descriptor.raw + '": ' +
      JSON.stringify(value) + '. Use track-by="$index" if ' +
      'you are expecting duplicate values.',
      this.vm
    )
  }
}

export default vFor
