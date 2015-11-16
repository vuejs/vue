var _ = require('../../util')
import config from '../../config'

export default function (Vue) {

  /**
   * Expose useful internals
   */

  Vue.util = _
  Vue.config = config
  Vue.set = _.set
  Vue.delete = _.del
  Vue.nextTick = _.nextTick

  /**
   * The following are exposed for advanced usage / plugins
   */

  Vue.compiler = require('../../compiler')
  Vue.FragmentFactory = require('../../fragment/factory')
  Vue.internalDirectives = require('../../directives/internal')
  Vue.parsers = {
    path: require('../../parsers/path'),
    text: require('../../parsers/text'),
    template: require('../../parsers/template'),
    directive: require('../../parsers/directive'),
    expression: require('../../parsers/expression')
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
    var Sub = createClass(name || 'VueComponent')
    Sub.prototype = Object.create(Super.prototype)
    Sub.prototype.constructor = Sub
    Sub.cid = cid++
    Sub.options = _.mergeOptions(
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
    return new Function(
      'return function ' + _.classify(name) +
      ' (options) { this._init(options) }'
    )()
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
    var args = _.toArray(arguments, 1)
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
    Vue.options = _.mergeOptions(Vue.options, mixin)
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
          if (type === 'component' && _.commonTagRE.test(id)) {
            _.warn(
              'Do not use built-in HTML elements as component ' +
              'id: ' + id
            )
          }
        }
        if (
          type === 'component' &&
          _.isPlainObject(definition)
        ) {
          definition.name = id
          definition = Vue.extend(definition)
        }
        this.options[type + 's'][id] = definition
        return definition
      }
    }
  })
}
