// SVG xml namespaces
var namespaces = {
  xlink: 'http://www.w3.org/1999/xlink',
  ev: 'http://www.w3.org/2001/xml-events'
}

module.exports = {

  priority: 850,

  bind: function () {
    var name = this.arg
    var colonIndex = name.indexOf(':')
    // check namespaced attributes
    if (colonIndex > 0) {
      this.localName = name.slice(colonIndex + 1)
      this.namespace = namespaces[name.slice(0, colonIndex)]
      this.update = namespaceHandler
    } else {
      this.update = defaultHandler
    }
  }

}

function defaultHandler (value) {
  if (value != null) {
    this.el.setAttribute(this.arg, value)
  } else {
    this.el.removeAttribute(this.arg)
  }
}

function namespaceHandler (value) {
  var ns = this.namespace
  if (value != null) {
    this.el.setAttributeNS(ns, this.arg, value)
  } else {
    this.el.removeAttributeNS(ns, this.localName)
  }
}