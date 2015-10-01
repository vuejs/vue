var _ = require('../../util')

module.exports = {

  bind: function () {
    var self = this
    var el = this.el
    var trueExp = this.param('true-exp')
    var falseExp = this.param('false-exp')
    var scope = this._scope || this.vm

    if (process.env.NODE_ENV !== 'production' && (trueExp || falseExp)) {
      _.deprecation.MODEL_EXP(this.expression)
    }

    this._matchValue = function (value) {
      if (el.hasOwnProperty('_trueValue')) {
        return _.looseEqual(value, el._trueValue)
      } else if (trueExp !== null) {
        return _.looseEqual(value, scope.$eval(trueExp))
      } else {
        return !!value
      }
    }

    function getBooleanValue () {
      var val = el.checked
      if (val && el.hasOwnProperty('_trueValue')) {
        return el._trueValue
      }
      if (!val && el.hasOwnProperty('_falseValue')) {
        return el._falseValue
      }
      if (val && trueExp !== null) {
        val = scope.$eval(trueExp)
      }
      if (!val && falseExp !== null) {
        val = scope.$eval(falseExp)
      }
      return val
    }

    this.listener = function () {
      var model = self._watcher.value
      if (_.isArray(model)) {
        var val = getValue(el)
        if (el.checked) {
          if (_.indexOf(model, val) < 0) {
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

  update: function (value) {
    var el = this.el
    if (_.isArray(value)) {
      el.checked = _.indexOf(value, getValue(el)) > -1
    } else {
      el.checked = this._matchValue(value)
    }
  }
}

function getValue (el) {
  return el.hasOwnProperty('_value')
    ? el._value
    : el.value
}
