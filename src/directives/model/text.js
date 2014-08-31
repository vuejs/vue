var _ = require('../../util')

module.exports = {

  bind: function () {
    var self = this
    var el = this.el
    // check params
    // - lazy: update model on "change" instead of "input"
    var lazy = el.hasAttribute('lazy')
    if (lazy) {
      el.removeAttribute('lazy')
    }
    // - number: cast value into number when updating model.
    var number =
      el.hasAttribute('number') ||
      el.type === 'number'
    if (number) {
      el.removeAttribute('number')
    }
    this.event = lazy ? 'change' : 'input'
    // handle composition events.
    // http://blog.evanyou.me/2014/01/03/composition-event/
    var cpLocked = false
    this.cpLock = function () {
      cpLocked = true
    }
    this.cpUnlock = function () {
      cpLocked = false
    }
    _.on(el,'compositionstart', this.cpLock)
    _.on(el,'compositionend', this.cpUnlock)
    // if the directive has read filters, we need to
    // record cursor position and restore it after updating
    // the input with the filtered value.
    this.listener = function textInputListener () {
      if (cpLocked) return
      var cursorPos
      try { cursorPos = el.selectionStart } catch (e) {}
      self.set(
        number
          ? _.toNumber(el.value)
          : el.value
      )
      if (cursorPos) {
        _.nextTick(function () {
          el.setSelectionRange(cursorPos, cursorPos)
        })
      }
    }
    _.on(el, this.event, this.listener)
    // IE9 doesn't fire input event on backspace/del/cut
    if (!lazy && _.isIE9) {
      this.onCut = function () {
        _.nextTick(self.listener)
      }
      this.onDel = function (e) {
        if (e.keyCode === 46 || e.keyCode === 8) {
          self.listener()
        }
      }
      _.on(el, 'cut', this.onCut)
      _.on(el, 'keyup', this.onDel)
    }
    // set initial value if present
    if (el.value) {
      // watcher is not set up yet
      this.vm.$set(this.expression, el.value)
    }
  },

  update: function (value) {
    this.el.value = value
  },

  unbind: function () {
    var el = this.el
    _.off(el, this.event, this.listener)
    _.off(el,'compositionstart', this.cpLock)
    _.off(el,'compositionend', this.cpUnlock)
    if (this.onCut) {
      _.off(el,'cut', this.onCut)
      _.off(el,'keyup', this.onDel)
    }
  }

}