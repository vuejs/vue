var _ = require('../util')
var FragmentFactory = require('../fragment/factory')
var uid = 0

// TODO: ref, el

module.exports = {

  bind: function () {
    // support "item in items" syntax
    var inMatch = this.expression.match(/(.*) in (.*)/)
    if (inMatch) {
      this.alias = inMatch[1]
      this._watcherExp = inMatch[2]
    } else {
      process.env.NODE_ENV !== 'production' && _.warn(
        'Alias is required in v-for.'
      )
      return
    }

    // uid as a cache identifier
    this.id = ++uid

    // setup anchor nodes
    this.start = _.createAnchor('v-repeat-start')
    this.end = _.createAnchor('v-repeat-end')
    _.replace(this.el, this.end)
    _.before(this.start, this.end)

    // check for trackby param
    this.idKey = this._checkParam('track-by')

    // check for transition stagger
    var stagger = +this._checkParam('stagger')
    this.enterStagger = +this._checkParam('enter-stagger') || stagger
    this.leaveStagger = +this._checkParam('leave-stagger') || stagger

    // cache
    this.cache = new FragmentCache()

    // fragment factory
    this.factory = new FragmentFactory(this.vm, this.el)
  },

  create: function (data, alias, index, key) {
    var host = this._host
    // create iteration scope
    var parentScope = this._scope || this.vm
    var scope = Object.create(parentScope)
    // define scope properties
    _.defineReactive(scope, alias, data)
    _.defineReactive(scope, '$index', index)
    if (key) {
      _.defineReactive(scope, '$key', key)
    }
    return this.factory.create(host, scope, this.id)
  },

  update: function (data) {
    var self = this
    var idKey = this.idKey
    var converted = this.converted
    var oldFrags = this.frags
    var frags = this.frags = new Array(data.length)
    var alias = this.alias
    var start = this.start
    var end = this.end
    var inDoc = _.inDoc(start)
    var init = !oldFrags
    var i, l, frag, item, key, value, primitive

    // First pass, go through the new Array and fill up
    // the new frags array. If a piece of data has a cached
    // instance for it, we reuse it. Otherwise build a new
    // instance.
    for (i = 0, l = data.length; i < l; i++) {
      item = data[i]
      key = converted ? itme.$key : null
      value = converted ? item.$value : item
      frag = !init && this.cache.get(value, i, key)
      if (frag) { // reusable fragment
        frag.reused = true
        frag.scope.$index = i // update $index
        // update data for track-by, object repeat &
        // primitive values.
        if (idKey || converted || primitive) {
          frag.scope[alias] = value
        }
      } else { // new isntance
        frag = this.create(value, alias, i, key)
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
    for (i = 0, l = oldFrags.length; i < l; i++) {
      frag = oldFrags[i]
      if (!frag.reused) {
        this.cache.delete(frag)
        frag.unlink()
        this.remove(frag, removalIndex++, totalRemoved, inDoc)
      }
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
        if (currentPrev !== targetPrev) {
          this.move(frag, prevEl)
        }
      } else {
        // new instance, or still in stagger.
        // insert with updated stagger index.
        this.insert(frag, insertionIndex++, prevEl, inDoc)
      }
      frag.reused = false
    }
  },

  insert: function (frag, index, prevEl, inDoc) {
    if (frag.staggerCb) {
      frag.staggerCb.cancel()
      frag.staggerCb = null
    }
    var staggerAmount = this.getStagger(frag, index, null, 'enter')
    if (inDoc && staggerAmount) {
      // create an anchor and insert it synchronously,
      // so that we can resolve the correct order without
      // worrying about some elements not inserted yet
      var anchor = frag.staggerAnchor
      if (!anchor) {
        anchor = frag.staggerAnchor = _.createAnchor('stagger-anchor')
        anchor.__vfrag__ = frag
      }
      _.after(anchor, prevEl)
      var op = frag.staggerCb = _.cancellable(function () {
        frag.staggerCb = null
        frag.before(anchor)
        _.remove(anchor)
      })
      setTimeout(op, staggerAmount)
    } else {
      frag.before(prevEl.nextSibling)
    }
  },

  remove: function (frag, index, total, inDoc) {
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
    if (inDoc && staggerAmount) {
      var op = frag.staggerCb = _.cancellable(function () {
        frag.staggerCb = null
        frag.remove()
      })
      setTimeout(op, staggerAmount)
    } else {
      frag.remove()
    }
  },

  move: function (frag, prevEl) {
    frag.before(prevEl.nextSibling)
  },

  /**
   * Get the stagger amount for an insertion/removal.
   *
   * @param {Fragment} frag
   * @param {Number} index
   * @param {Number} total
   * @param {String} type
   */

  getStagger: function (frag, index, total, type) {
    type = type + 'Stagger'
    var transition = frag.node.__v_trans
    var hooks = transition && transition.hooks
    var hook = hooks && (hooks[type] || hooks.stagger)
    return hook
      ? hook.call(frag, index, total)
      : index * this[type]
  },

  /**
   * Pre-process the value before piping it through the
   * filters, and convert non-Array objects to arrays.
   *
   * This function will be bound to this directive instance
   * and passed into the watcher.
   *
   * @param {*} value
   * @return {Array}
   * @private
   */

  _preProcess: function (value) {
    // regardless of type, store the un-filtered raw value.
    this.rawValue = value
    var type = this.rawType = typeof value
    if (!_.isPlainObject(value)) {
      this.converted = false
      if (type === 'number') {
        value = range(value)
      } else if (type === 'string') {
        value = _.toArray(value)
      }
      return value || []
    } else {
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
      this.converted = true
      return res
    }
  }
}

/**
 * Helper to find the previous element that is a fragment
 * anchor. This is necessary because a destroyed frag's
 * element could still be lingering in the DOM before its
 * leaving transition finishes, but its __vue__ reference
 * should have been removed so we can skip them.
 *
 * If this is a block repeat, we want to make sure we only
 * return vm that is bound to this v-repeat. (see #929)
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
  while (
    (!el.__vfrag__ || el.__vfrag__.id !== id) &&
    el !== anchor
  ) {
    el = el.previousSibling
  }
  return el.__vfrag__
}

function FragmentCache () {
  this.cache = Object.create(null)
}

FragmentCache.prototype.get = function () {
  
}

FragmentCache.prototype.set = function () {
  
}

FragmentCache.prototype.delete = function () {
  
}
