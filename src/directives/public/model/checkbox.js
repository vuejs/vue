import {
  toNumber,
  isArray,
  indexOf,
  looseEqual
} from '../../../util/index'

export default {

  bind () {
    var self = this
    var el = this.el

    this.getValue = function () {
      return el.hasOwnProperty('_value')
        ? el._value
        : self.params.number
          ? toNumber(el.value)
          : el.value
    }

    function getBooleanValue () {
      var val = el.checked
      if (val && el.hasOwnProperty('_trueValue')) {
        return el._trueValue
      }
      if (!val && el.hasOwnProperty('_falseValue')) {
        return el._falseValue
      }
      return val
    }

    this.listener = function () {
      var model = self._watcher.value
      if (isArray(model)) {
        var val = self.getValue()
        if (el.checked) {
          if (indexOf(model, val) < 0) {
            model.push(val)
          }
        } else {
          model.$remove(val)
        }
      } else {
        self.set(getBooleanValue())
      }
    }

    this.on('change', this.listener)
    if (el.checked) {
      this.afterBind = this.listener
    }
  },

  update (value) {
    var el = this.el
    if (isArray(value)) {
      el.checked = indexOf(value, this.getValue()) > -1
    } else {
      if (el.hasOwnProperty('_trueValue')) {
        el.checked = looseEqual(value, el._trueValue)
      } else {
        el.checked = !!value
      }
    }
  }
}
