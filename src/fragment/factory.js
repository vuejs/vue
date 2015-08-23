var _ = require('../util')
var compiler = require('../compiler')
var templateParser = require('../parsers/template')
var SingleFragment = require('./single')
var MultiFragment = require('./multi')
var Cache = require('../cache')
var linkerCache = new Cache(5000)

/**
 * A factory that can be used to create instances of a
 * fragment. Caches the compiled linker if possible.
 *
 * @param {Vue} vm
 * @param {Element} el
 */

function FragmentFactory (vm, el) {
  this.vm = vm
  var template
  if (!_.isTemplate(el)) {
    template = document.createDocumentFragment()
    template.appendChild(el)
  } else {
    template = templateParser.parse(el, true)
  }
  this.template = template
  // linker can be cached, but only for components
  var linker
  var cid = vm.constructor.cid
  if (cid > 0) {
    var cacheId = cid + el.outerHTML
    linker = linkerCache.get(cacheId)
    if (!linker) {
      linker = compiler.compile(template, vm.$options, true)
      linkerCache.put(cacheId, linker)
    }
  } else {
    linker = compiler.compile(template, vm.$options, true)
  }
  this.linker = linker
}

/**
 * Create a fragment instance with given host and scope.
 */

FragmentFactory.prototype.create = function (host, scope) {
  var frag = templateParser.clone(this.template)
  var unlink = this.linker(this.vm, frag, host, scope)
  return frag.childNodes.length > 1
    ? new MultiFragment(frag, unlink)
    : new SingleFragment(frag.childNodes[0], unlink)
}

module.exports = FragmentFactory
