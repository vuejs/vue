// PhantomJS always return false when using Element.contains
// on a comment node - so we have to patch the inDoc util
// function when running in PhantomJS.

var _ = require('../../../src/util')
var inDoc = _.inDoc

_.inDoc = function (el) {
  if (el && el.nodeType === 8) {
    return manualInDoc(el)
  }
  return inDoc(el)  
}

function manualInDoc (el) {
  while (el) {
    if (el === document.documentElement) {
      return true
    }
    el = el.parentNode
  }
  return false
}