import {
  set,
  del,
  nextTick,
  mergeOptions,
  classify,
  toArray,
  commonTagRE,
  reservedTagRE,
  warn,
  isPlainObject,
  extend
} from './util/index'

import config from './config'
import directives from './directives/public/index'
import elementDirectives from './directives/element/index'
import filters from './filters/index'
import * as util from './util/index'
import * as compiler from './compiler/index'
import * as path from './parsers/path'
import * as text from './parsers/text'
import * as template from './parsers/template'
import * as directive from './parsers/directive'
import * as expression from './parsers/expression'
import * as transition from './transition/index'
import FragmentFactory from './fragment/factory'
import internalDirectives from './directives/internal/index'

export default function (Vue) {
  /**
   * Vue and every constructor that extends Vue has an
   * associated options object, which can be accessed during
   * compilation steps as `this.constructor.options`.
   *
   * These can be seen as the default options of every
   * Vue instance.
   */

  Vue.options = {
    directives,
    elementDirectives,
    filters,
    transitions: {},
    components: {},
    partials: {},
    replace: true
  }

  /**
   * Expose useful internals
   */

  Vue.util = util
  Vue.config = config
  Vue.set = set
  Vue.delete = del
  Vue.nextTick = nextTick

  /**
   * The following are exposed for advanced usage / plugins
   */

  Vue.compiler = compiler
  Vue.FragmentFactory = FragmentFactory
  Vue.internalDirectives = internalDirectives
  Vue.parsers = {
    path,
    text,
    template,
    directive,
    expression
  }

  /**
   * Each instance constructor, including Vue, has a unique
   * cid. This enables us to create wrapped "child
   * constructors" for prototypal inheritance and cache them.
   */

  Vue.cid = 0
  var cid = 1

  /**
   * Class inheritance
   *
   * @param {Object} extendOptions
   */

  Vue.extend = function (extendOptions) {
    extendOptions = extendOptions || {}
    var Super = this
    var isFirstExtend = Super.cid === 0
    if (isFirstExtend && extendOptions._Ctor) {
      return extendOptions._Ctor
    }
    var name = extendOptions.name || Super.options.name
    if (process.env.NODE_ENV !== 'production') {
      if (!/^[a-zA-Z][\w-]*$/.test(name)) {
        warn(
          'Invalid component name: "' + name + '". Component names ' +
          'can only contain alphanumeric characaters and the hyphen.'
        )
        name = null
      }
    }
    var Sub = createClass(name || 'VueComponent')
    Sub.prototype = Object.create(Super.prototype)
    Sub.prototype.constructor = Sub
    Sub.cid = cid++
    Sub.options = mergeOptions(
      Super.options,
      extendOptions
    )
    Sub['super'] = Super
    // allow further extension
    Sub.extend = Super.extend
    // create asset registers, so extended classes
    // can have their private assets too.
    config._assetTypes.forEach(function (type) {
      Sub[type] = Super[type]
    })
    // enable recursive self-lookup
    if (name) {
      Sub.options.components[name] = Sub
    }
    // cache constructor
    if (isFirstExtend) {
      extendOptions._Ctor = Sub
    }
    return Sub
  }

  /**
   * A function that returns a sub-class constructor with the
   * given name. This gives us much nicer output when
   * logging instances in the console.
   *
   * @param {String} name
   * @return {Function}
   */

  function createClass (name) {
    /* eslint-disable no-new-func */
    return new Function(
      'return function ' + classify(name) +
      ' (options) { this._init(options) }'
    )()
    /* eslint-enable no-new-func */
  }

  /**
   * Plugin system
   *
   * @param {Object} plugin
   */

  Vue.use = function (plugin) {
    /* istanbul ignore if */
    if (plugin.installed) {
      return
    }
    // additional parameters
    var args = toArray(arguments, 1)
    args.unshift(this)
    if (typeof plugin.install === 'function') {
      plugin.install.apply(plugin, args)
    } else {
      plugin.apply(null, args)
    }
    plugin.installed = true
    return this
  }

  /**
   * Apply a global mixin by merging it into the default
   * options.
   */

  Vue.mixin = function (mixin) {
    Vue.options = mergeOptions(Vue.options, mixin)
  }

  /**
   * Create asset registration methods with the following
   * signature:
   *
   * @param {String} id
   * @param {*} definition
   */

  config._assetTypes.forEach(function (type) {
    Vue[type] = function (id, definition) {
      if (!definition) {
        return this.options[type + 's'][id]
      } else {
        /* istanbul ignore if */
        if (process.env.NODE_ENV !== 'production') {
          if (
            type === 'component' &&
            (commonTagRE.test(id) || reservedTagRE.test(id))
          ) {
            warn(
              'Do not use built-in or reserved HTML elements as component ' +
              'id: ' + id
            )
          }
        }
        if (
          type === 'component' &&
          isPlainObject(definition)
        ) {
          definition.name = id
          definition = Vue.extend(definition)
        }
        this.options[type + 's'][id] = definition
        return definition
      }
    }
  })

  // expose internal transition API
  extend(Vue.transition, transition)
}
