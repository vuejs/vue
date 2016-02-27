import { compile } from '../compiler/index'
import { isTemplate, getOuterHTML } from '../util/index'
import { parseTemplate, cloneNode } from '../parsers/template'
import Fragment from './fragment'
import Cache from '../cache'

const linkerCache = new Cache(5000)

/**
 * A factory that can be used to create instances of a
 * fragment. Caches the compiled linker if possible.
 *
 * @param {Vue} vm
 * @param {Element|String} el
 */

export default function FragmentFactory (vm, el) {
  this.vm = vm
  var template
  var isString = typeof el === 'string'
  if (isString || isTemplate(el)) {
    template = parseTemplate(el, true)
  } else {
    template = document.createDocumentFragment()
    template.appendChild(el)
  }
  this.template = template
  // linker can be cached, but only for components
  var linker
  var cid = vm.constructor.cid
  if (cid > 0) {
    var cacheId = cid + (isString ? el : getOuterHTML(el))
    linker = linkerCache.get(cacheId)
    if (!linker) {
      linker = compile(template, vm.$options, true)
      linkerCache.put(cacheId, linker)
    }
  } else {
    linker = compile(template, vm.$options, true)
  }
  this.linker = linker
}

/**
 * Create a fragment instance with given host and scope.
 *
 * @param {Vue} host
 * @param {Object} scope
 * @param {Fragment} parentFrag
 */

FragmentFactory.prototype.create = function (host, scope, parentFrag) {
  var frag = cloneNode(this.template)
  return new Fragment(this.linker, this.vm, frag, host, scope, parentFrag)
}
