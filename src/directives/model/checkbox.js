var _ = require('../../util')

module.exports = {

  bind: function () {
    var self = this
    var el = this.el
    var trueExp = this._checkParam('true-value')
    var falseExp = this._checkParam('false-value')
    
    function getValue () {
      var val = el.checked
      if(val && trueExp !== null) {
        val = self.vm.$eval(trueExp);
      }
      if(!val && falseExp !== null) {
        val = self.vm.$eval(falseExp);
      }
      return val
    }
    this._getValue = getValue
    
    function matchValue (value) {
      var trueValue = true
      var falseValue = false
            
      if(trueExp !== null) {
          trueValue = self.vm.$eval(trueExp);
      } 
      if(falseExp !== null) {
          falseValue = self.vm.$eval(falseExp);
      }
      if(trueValue == value) {
        return true
      } else {
        return false
      }
    }
    this._matchValue = matchValue
    
    this.listener = function () {
      self.set(getValue())
    }
    _.on(el, 'change', this.listener)
    if (el.checked) {
      this._initValue = getValue()
    }
  },

  update: function (value) {
    this.el.checked = this._matchValue(value)
  },

  unbind: function () {
    _.off(this.el, 'change', this.listener)
  }
}
