var _ = require('../util')

/**
 * Initialize the dependencies.
 */
exports._initContext = function () {
	if (this.$options.context) {
		var context = this.$options.context
		if (!this.$parent) {
			_.warn(
				'cannot resolve any context due to empty parent vm.'
			)
			return
		}
		var childContext = this.$parent._getChildContext()
		if (!childContext) {
			_.warn(
				'cannot resolve any context due to no "childContext" supplied by parent vm.'
			)
			return
		}
		for (var i = 0, l = context.length; i < l; ++i) {
			var ctx = context[i]
			var name = ctx.name
			if (!childContext[name]) {
				_.warn(
					'cannot find context "' + name + '" in childContext of parent vm'
				)
			} else { // We don't need to bind it, because it is bound on parent vm.
				this[name] = ctx.set.call(this, childContext[name], name)
			}
		}
	}
}

/**
 * Get the child context.
 *
 * @returns {Object}
 */
exports._getChildContext = function () {
	if (!this.$options.childContext) return null
	if (this._childContext) return this._childContext
	var childContext = this.$options.childContext
	var ret = this._childContext = {}
	for (var key in childContext) {
		var val = childContext[key]
		if (typeof val === 'function') {
			ret[key] = val.call(this, key)
		} else {
			ret[key] = this[val || key]
		}
	}
	return ret
}